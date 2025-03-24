import { useContext } from 'react'
import { Slot } from "expo-router";
import { SessionProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  )
}
