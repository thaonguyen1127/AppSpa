// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // import { useFonts } from 'expo-font';
// // import { Stack } from 'expo-router';
// // import * as SplashScreen from 'expo-splash-screen';
// // import { StatusBar } from 'expo-status-bar';
// // import { useEffect } from 'react';
// // import 'react-native-reanimated';

// // import { useColorScheme } from '@/hooks/useColorScheme';

// // // Prevent the splash screen from auto-hiding before asset loading is complete.
// // SplashScreen.preventAutoHideAsync();

// // export default function RootLayout() {
// //   const colorScheme = useColorScheme();
// //   const [loaded] = useFonts({
// //     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
// //   });

// //   useEffect(() => {
// //     if (loaded) {
// //       SplashScreen.hideAsync();
// //     }
// //   }, [loaded]);

// //   if (!loaded) {
// //     return null;
// //   }

// //   return (
// //     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
// //       <Stack>
// //         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
// //         <Stack.Screen name="+not-found" />
// //       </Stack>
// //       <StatusBar style="auto" />
// //     </ThemeProvider>
// //   );
// // }


// app/_layout.js
// import { Stack } from 'expo-router';
// import { NavigationContainer } from '@react-navigation/native';

// export default function RootLayout() {
//   return (
//     <NavigationContainer>
//       <Stack>
//         <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Login */}
//         <Stack.Screen name="user" options={{ headerShown: false }} /> {/* User */}
//         <Stack.Screen name="admin/dashboard" options={{ title: 'Admin Dashboard' }} />
//         <Stack.Screen name="owner" options={{ title: 'Owner Dashboard' }} />
//       </Stack>
//     </NavigationContainer>
//   );
// }

// app/_layout.js
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
        name="owner/booking"
        options={{ headerShown: true, title: 'Owner Dashboard' }}
      />
      <Stack.Screen name="user" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}