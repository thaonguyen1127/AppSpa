import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
export default function TabsLayout() {
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
          name="home"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => <Icon name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="booked"
          options={{
            title: 'Lịch hẹn',
            tabBarIcon: ({ color }) => <Icon name="calendar" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorite"
          options={{
            title: 'Yêu thích',
            tabBarIcon: ({ color }) => <Icon name="heart" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: 'Thông báo',
            tabBarIcon: ({ color }) => <Icon name="notifications" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Hồ sơ',
            tabBarIcon: ({ color }) => <Icon name="notifications" size={28} color={color} />
            // href: null,
            // tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
  );
}