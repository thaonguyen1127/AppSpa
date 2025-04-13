// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.pink,
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#eee',
          height: 65,
          paddingTop: 5,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Icon name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color }) => <Icon name="search" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}