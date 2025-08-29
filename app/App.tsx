import { useQuery, useZero } from "@rocicorp/zero/solid";
import Cookies from "js-cookie";
import { createEffect, createSignal, For, Show } from "solid-js";
import { Mutators } from "../shared/mutators";
import { Schema } from "../shared/schema";
import { formatDate } from "./date";
import { randInt } from "./rand";
import { randomMessage } from "./test-data";
import { queries } from "../shared/queries";

function App() {
  const z = useZero<Schema, Mutators>()();

  const [users] = useQuery(queries.users);
  const [mediums] = useQuery(queries.mediums);

  const [filterUser, setFilterUser] = createSignal<string>("");
  const [filterMedium, setFilterMedium] = createSignal<string>("");
  const [filterText, setFilterText] = createSignal<string>("");
  const [filterDate, setFilterDate] = createSignal<string>("");

  const [allMessages] = useQuery(queries.messages);

  const [filteredMessages] = useQuery(() =>
    queries.filteredMessages({
      senderID: filterUser(),
      mediumID: filterMedium(),
      body: filterText(),
      timestamp: filterDate(),
    })
  );

  const hasFilters = () =>
    filterUser() || filterMedium() || filterText() || filterDate();
  const [action, setAction] = createSignal<"add" | "remove" | undefined>(
    undefined
  );

  createEffect(() => {
    if (action() !== undefined) {
      const interval = setInterval(() => {
        if (!handleAction()) {
          clearInterval(interval);
          setAction(undefined);
        }
      }, 1000 / 60);
    }
  });

  const handleAction = () => {
    if (action() === undefined) {
      return false;
    }
    if (action() === "add") {
      z.mutate.message.create(randomMessage(users(), mediums()));
      return true;
    } else {
      const messages = allMessages();
      if (messages.length === 0) {
        return false;
      }
      const index = randInt(messages.length);
      z.mutate.message.delete(messages[index].id);
      return true;
    }
  };

  const addMessages = () => setAction("add");

  const removeMessages = (e: MouseEvent) => {
    if (z.userID === "anon" && !e.shiftKey) {
      alert(
        "You must be logged in to delete. Hold the shift key to try anyway."
      );
      return;
    }
    setAction("remove");
  };

  const stopAction = () => setAction(undefined);

  const editMessage = (
    e: MouseEvent,
    id: string,
    senderID: string,
    prev: string
  ) => {
    if (senderID !== z.userID && !e.shiftKey) {
      alert(
        "You aren't logged in as the sender of this message. Editing won't be permitted. Hold the shift key to try anyway."
      );
      return;
    }
    const body = prompt("Edit message", prev);
    z.mutate.message.update({
      id,
      body: body ?? prev,
    });
  };

  const toggleLogin = async () => {
    if (z.userID === "anon") {
      await fetch("/api/login");
    } else {
      Cookies.remove("jwt");
    }
    location.reload();
  };

  // If initial sync hasn't completed, these can be empty.
  const initialSyncComplete = () => users().length && mediums().length;

  const user = () =>
    users().find((user) => user.id === z.userID)?.name ?? "anon";

  return (
    <Show when={initialSyncComplete()}>
      <div class="controls">
        <div>
          <button onMouseDown={addMessages} onMouseUp={stopAction}>
            Add Messages
          </button>
          <button onMouseDown={removeMessages} onMouseUp={stopAction}>
            Remove Messages
          </button>
          <em>(hold buttons to repeat)</em>
        </div>
        <div
          style={{
            "justify-content": "end",
          }}
        >
          {user() === "anon" ? "" : `Logged in as ${user()}`}
          <button onMouseDown={() => toggleLogin()}>
            {user() === "anon" ? "Login" : "Logout"}
          </button>
        </div>
      </div>
      <div class="controls">
        <div>
          From:
          <select
            onChange={(e) => setFilterUser(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Sender</option>
            <For each={users()}>
              {(user) => <option value={user.id}>{user.name}</option>}
            </For>
          </select>
        </div>
        <div>
          By:
          <select
            onChange={(e) => setFilterMedium(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Medium</option>

            <For each={mediums()}>
              {(medium) => <option value={medium.id}>{medium.name}</option>}
            </For>
          </select>
        </div>
        <div>
          Contains:
          <input
            type="text"
            placeholder="message"
            onInput={(e) => setFilterText(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div>
          After:
          <input
            type="date"
            onInput={(e) => setFilterDate(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>
      <div class="controls">
        <em>
          {!hasFilters() ? (
            <>Showing all {filteredMessages().length} messages</>
          ) : (
            <>
              Showing {filteredMessages().length} of {allMessages().length}{" "}
              messages. Try opening{" "}
              <a href="/" target="_blank">
                another tab
              </a>{" "}
              to see them all!
            </>
          )}
        </em>
      </div>
      {filteredMessages().length === 0 ? (
        <h3>
          <em>No posts found 😢</em>
        </h3>
      ) : (
        <table class="messages">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Medium</th>
              <th>Message</th>
              <th>Sent</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            <For each={filteredMessages()}>
              {(message) => (
                <tr>
                  <td>{message.sender?.name}</td>
                  <td>{message.medium?.name}</td>
                  <td>{message.body}</td>
                  <td>{formatDate(message.timestamp)}</td>
                  <td
                    onMouseDown={(e) =>
                      editMessage(e, message.id, message.senderID, message.body)
                    }
                  >
                    ✏️
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      )}
    </Show>
  );
}

export default App;
