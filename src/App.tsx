import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { Schema } from "./schema";

function App({ z }: { z: Zero<Schema> }) {
  const message = useQuery(() => z.query.message.one());

  // createEffect(() => {
  //   console.log(message());
  // });

  return (
    <>
      <h1>Solid</h1>
      <p>message: {message()?.body} </p>
    </>
  );
}

export default App;
