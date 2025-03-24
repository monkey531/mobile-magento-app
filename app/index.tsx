import { Redirect } from 'expo-router';

export default function AppLayout() {
  // On web, static rendering will stop here as the user is not authenticated
  // in the headless Node process that the pages are rendered in.
  return <Redirect href="/(auth)/login" />;
}