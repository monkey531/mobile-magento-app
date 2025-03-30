import { Stack } from 'expo-router';
import AuthProvider from './context/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './context/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to dashboard if authenticated and trying to access auth screens
      router.replace('/dashboard');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(app)/dashboard" />
      <Stack.Screen name="(app)/orders/index" />
      <Stack.Screen name="(app)/orders/[id]" />
      <Stack.Screen name="(app)/products/index" />
      <Stack.Screen name="(app)/products/[id]" />
      <Stack.Screen name="(app)/customers/index" />
      <Stack.Screen name="(app)/customers/[id]" />
      <Stack.Screen name="(app)/categories/index" />
      <Stack.Screen name="(app)/categories/[id]" />
      <Stack.Screen name="(app)/reports/index" />
      <Stack.Screen name="(app)/settings/index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
