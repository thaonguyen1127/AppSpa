import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const notifications = [
  {
    id: '1',
    title: 'Đặt lịch thành công',
    message: 'Bạn đã đặt lịch spa tại Sakura Beauty vào 10:00 ngày 15/04.',
    time: '2 giờ trước',
  },
  {
    id: '2',
    title: 'Khuyến mãi hot!',
    message: 'Giảm giá 30% cho tất cả dịch vụ trong tuần này.',
    time: 'Hôm qua',
  },
  {
    id: '3',
    title: 'Thông báo hệ thống',
    message: 'Ứng dụng sẽ bảo trì từ 00:00 đến 02:00 ngày 17/04.',
    time: '2 ngày trước',
  },
];

const NotificationScreen = () => {
  const router = useRouter();
  const HEADER_HEIGHT = 60; // Đồng bộ với Favorite, Home, Search

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Ionicons
        name="notifications-outline"
        size={24}
        color={Colors.pink}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.pink}
        barStyle="light-content"
        translucent={false}
      />
      <LinearGradient
        colors={[Colors.pink, `${Colors.pink}80`, '#fff']}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <View
            style={[styles.header, { height: HEADER_HEIGHT}]}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thông báo</Text>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingTop: HEADER_HEIGHT }]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.pink,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#333',
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationScreen;