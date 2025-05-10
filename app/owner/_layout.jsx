import { Stack } from 'expo-router';

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ẩn header mặc định, vì chúng ta sẽ tự xử lý trong dashboard
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="spaInput" />
      <Stack.Screen name="spaDetail" options={{ headerShown: false }} />
      <Stack.Screen name="spaList" options={{ headerShown: false }} />
    </Stack>
  );
}