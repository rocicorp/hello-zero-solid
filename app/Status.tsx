import { useConnectionState } from "@rocicorp/zero/solid";

export function Status() {
  const state = useConnectionState();

  return (
    <>
      {(() => {
        const s = state();
        switch (s.name) {
          case "connecting":
            return <div title={s.reason}>🔄 Connecting...</div>;
          case "connected":
            return <div>✅ Connected</div>;
          case "disconnected":
            return <div title={s.reason}>🔴 Offline</div>;
          case "error":
            return <div title={s.reason}>❌ Error</div>;
          case "needs-auth":
            return <div>🔐 Session expired</div>;
          default:
            throw new Error(`Unexpected connection state: ${s.name}`);
        }
      })()}
    </>
  );
}
