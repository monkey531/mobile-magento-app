import { Text } from 'react-native'
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{title: "Login"}} />
      <Stack.Screen name="register" options={{title: "Sign Up"}} />
      <Stack.Screen name="reset" options={{title: "Reset"}} />
    </Stack>
  )
}
