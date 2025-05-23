/* eslint-disable */
/// <reference path="./.sst/platform/config.d.ts" />
import { execSync } from "child_process";

export default $config({
  app(input) {
    return {
      name: "hello-zero-solid",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      region: process.env.AWS_REGION || "us-east-1",
    };
  },
  async run() {
    const zeroVersion = execSync(
      "npm list @rocicorp/zero | grep @rocicorp/zero | cut -f 3 -d @"
    )
      .toString()
      .trim();

    // S3 Bucket
    const replicationBucket = new sst.aws.Bucket(`replication-bucket`);

    // VPC Configuration
    const vpc = new sst.aws.Vpc(`vpc`, {
      az: 2,
      nat: "ec2",
    });

    // ECS Cluster
    const cluster = new sst.aws.Cluster(`cluster`, {
      vpc,
    });

    const conn = new sst.Secret("PostgresConnectionString");
    const zeroAuthSecret = new sst.Secret("ZeroAuthSecret");

    // Common environment variables
    const commonEnv = {
      ZERO_UPSTREAM_DB: conn.value,
      ZERO_AUTH_SECRET: zeroAuthSecret.value,
      ZERO_REPLICA_FILE: "sync-replica.db",
      ZERO_LITESTREAM_BACKUP_URL: $interpolate`s3://${replicationBucket.name}/backup`,
      ZERO_IMAGE_URL: `rocicorp/zero:${zeroVersion}`,
      ZERO_CVR_MAX_CONNS: "10",
      ZERO_UPSTREAM_MAX_CONNS: "10",
    };

    // Replication Manager Service
    const replicationManager = new sst.aws.Service(`replication-manager`, {
      cluster,
      cpu: "0.5 vCPU",
      memory: "1 GB",
      architecture: "arm64",
      image: commonEnv.ZERO_IMAGE_URL,
      link: [replicationBucket],
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:4849/ || exit 1"],
        interval: "5 seconds",
        retries: 3,
        startPeriod: "300 seconds",
      },
      environment: {
        ...commonEnv,
        ZERO_CHANGE_MAX_CONNS: "3",
        ZERO_NUM_SYNC_WORKERS: "0",
      },
      loadBalancer: {
        public: false,
        ports: [
          {
            listen: "80/http",
            forward: "4849/http",
          },
        ],
      },
      transform: {
        loadBalancer: {
          idleTimeout: 3600,
        },
        target: {
          healthCheck: {
            enabled: true,
            path: "/keepalive",
            protocol: "HTTP",
            interval: 5,
            healthyThreshold: 2,
            timeout: 3,
          },
        },
      },
    });

    // View Syncer Service
    const viewSyncer = new sst.aws.Service(`view-syncer`, {
      cluster,
      cpu: "1 vCPU",
      memory: "2 GB",
      architecture: "arm64",
      image: commonEnv.ZERO_IMAGE_URL,
      link: [replicationBucket],
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:4848/ || exit 1"],
        interval: "5 seconds",
        retries: 3,
        startPeriod: "300 seconds",
      },
      environment: {
        ...commonEnv,
        ZERO_CHANGE_STREAMER_URI: replicationManager.url,
      },
      logging: {
        retention: "1 month",
      },
      loadBalancer: {
        public: true,
        rules: [{ listen: "80/http", forward: "4848/http" }],
      },
      transform: {
        target: {
          healthCheck: {
            enabled: true,
            path: "/keepalive",
            protocol: "HTTP",
            interval: 5,
            healthyThreshold: 2,
            timeout: 3,
          },
          stickiness: {
            enabled: true,
            type: "lb_cookie",
            cookieDuration: 120,
          },
          loadBalancingAlgorithmType: "least_outstanding_requests",
        },
      },
    });

    // Permissions deployment
    // We build the permission update as part of the build command in
    // package.json and deploy it with this lambda. This prevents the
    // CI/CD env from needing access to database.
    // If you are willing to expose your database to CI, then a simpler
    // option is possible. See:
    // https://github.com/rocicorp/hello-zero/blob/main/sst.config.ts#L142
    const permissionsDeployer = new sst.aws.Function(
      "zero-permissions-deployer",
      {
        handler: "./functions/permissions.deploy",
        vpc,
        environment: { ["ZERO_UPSTREAM_DB"]: conn.value },
        copyFiles: [{ from: ".permissions.sql", to: ".permissions.sql" }],
      }
    );

    new aws.lambda.Invocation(
      "invoke-zero-permissions-deployer",
      {
        // Invoke the Lambda on every deploy.
        input: Date.now().toString(),
        functionName: permissionsDeployer.name,
      },
      { dependsOn: viewSyncer }
    );
  },
});
