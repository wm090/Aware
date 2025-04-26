import { Redirect } from "expo-router";

export default function Page() {
  // Redirect to the game screen
  return <Redirect href="/game" />;
}
