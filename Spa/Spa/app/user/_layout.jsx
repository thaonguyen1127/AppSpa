import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="searchScreen" />
      <Stack.Screen name="spaDetail" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="calendar" />
      {/* Thêm các màn phụ khác nếu có */}
    </Stack>
  );
}