import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
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
  {
    id: '4',
    title: 'Thông báo hệ thống',
    message: 'Ứng dụng sẽ bảo trì từ 00:00 đến 02:00 ngày 17/04.',
    time: '2 ngày trước',
  },
  {
    id: '5',
    title: 'Thông báo hệ thống',
    message: 'Ứng dụng sẽ bảo trì từ 00:00 đến 02:00 ngày 17/04.',
    time: '2 ngày trước',
  },
  {
    id: '6',
    title: 'Thông báo hệ thống',
    message: 'Ứng dụng sẽ bảo trì từ 00:00 đến 02:00 ngày 17/04.',
    time: '2 ngày trước',
  },
];

const NotificationScreen = () => {
  const router = useRouter();
  const HEADER_HEIGHT = 50;

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Ionicons
        name="notifications-outline"
        size={24}
        color={Colors.pink}
        style={styles.notificationIcon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2} ellipsizeMode="tail">
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <LinearGradient
        colors={[Colors.pink, Colors.pink, '#fff']}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <View style={[styles.header, { height: HEADER_HEIGHT }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Quay lại"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thông báo</Text>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
    backgroundColor: '#fff',
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    backgroundColor: Colors.pink,
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
    paddingTop: 80, // Đủ để nội dung không bị header che
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
  notificationIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.pink,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
  },
  notificationTime: {
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