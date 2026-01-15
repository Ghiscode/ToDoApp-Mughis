import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/authContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Auth-screen/Login" />
        <Stack.Screen name="Auth-screen/Register" />
      </Stack>
    </AuthProvider>
  );
}
