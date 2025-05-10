import { Stack } from 'expo-router';

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ẩn header mặc định, vì chúng ta sẽ tự xử lý trong dashboard
      }}
    >
      <Stack.Screen name="dashboard" />
      {/* Thêm các màn hình khác nếu cần */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="spaInput" />
      <Stack.Screen name="spaDetail" options={{ headerShown: false }} />
    </Stack>
  );
}