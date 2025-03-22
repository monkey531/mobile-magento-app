import { useContext } from 'react';
import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { AuthContext } from '@/providers/AuthProvider';

export default function AppLayout() {
  const { auth, isLoading } = useContext(AuthContext).session;

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!auth) {
    console.log("index-19:   ", auth);
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/(auth)/login" />;
  } else {
    return <Redirect href="/(auth)/register" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack />;
}