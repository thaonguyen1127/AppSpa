import { Stack } from 'expo-router';
import { ClientSpaProvider } from '../src/context/ClientSpaContext';

export default function RootLayout() {
  return (
    <ClientSpaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen
          name="admin/dashboard"
          options={{ headerShown: true, title: 'Admin Dashboard' }}
        />
        <Stack.Screen
          name="owner"
          // options={{ headerShown: true, title: 'Owner Dashboard' }}
        />
        <Stack.Screen name="user" />
        <Stack.Screen name="(tabs)" />
        {/* Thêm các màn hình khác nếu cần */}
      </Stack>
    </ClientSpaProvider>
  );
}