import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Sidebar from './slidebar';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 50;

const featuredServices = [
  { id: '1', name: 'Massage Thư Giãn', description: 'Giảm căng thẳng, thư giãn cơ thể', color: '#FFE4E1' },
  { id: '2', name: 'Chăm Sóc Da Mặt', description: 'Làm sạch và dưỡng da', color: '#FFD1DC' },
  { id: '3', name: 'Gội Đầu Dưỡng Sinh', description: 'Thư giãn và kích thích tuần hoàn', color: '#FFC1CC' },
];

const upcomingAppointments = [
  { id: '1', date: '20/04/2025', time: '10:00 AM', service: 'Massage Thư Giãn' },
  { id: '2', date: '21/04/2025', time: '2:00 PM', service: 'Chăm Sóc Da Mặt' },
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const renderServiceItem = ({ item }) => (
    <View style={[styles.serviceCard, { backgroundColor: item.color }]}>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
    </View>
  );

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentDetails}>
        <Text style={styles.appointmentDate}>{item.date}</Text>
        <Text style={styles.appointmentTime}>{item.time}</Text>
        <Text style={styles.appointmentService}>{item.service}</Text>
      </View>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => alert(`Chi tiết lịch hẹn: ${item.service} vào ${item.time}, ${item.date}`)}
      >
        <Text style={styles.detailButtonText}>Chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.pink}
        barStyle="light-content"
        translucent={false}
      />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        router={router}
      />
      {isSidebarOpen && (
        <TouchableOpacity style={styles.overlay} onPress={closeSidebar} />
      )}
      <View style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <View style={[styles.header, { height: HEADER_HEIGHT }]}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard Spa</Text>
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { paddingTop: HEADER_HEIGHT }]}
        >
          <View style={styles.greetingContainer}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingText}>Xin chào, Khách Hàng!</Text>
              <Text style={styles.subGreetingText}>Chào mừng bạn đến với Spa của sự thư giãn</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="heart-outline" size={30} color={Colors.pink} />
              <Text style={styles.statNumber}>256</Text>
              <Text style={styles.statLabel}>Lượt Yêu Thích</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="calendar-outline" size={30} color={Colors.pink} />
              <Text style={styles.statNumber}>128</Text>
              <Text style={styles.statLabel}>Lịch Hẹn</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch Vụ Nổi Bật</Text>
            <FlatList
              data={featuredServices}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.serviceList}
              key="horizontalServiceList"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch Hẹn Sắp Tới</Text>
            <FlatList
              data={upcomingAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.appointmentList}
              key="appointmentList"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.pink,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  menuButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  greetingContainer: {
    width: '100%',
    backgroundColor: '#FFF5F5',
    paddingVertical: 20,
  },
  greetingContent: {
    paddingHorizontal: 15,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.pink,
  },
  subGreetingText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.pink,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  serviceList: {
    paddingVertical: 10,
  },
  serviceCard: {
    width: width * 0.6,
    backgroundColor: '#FFE4E1',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    minHeight: 120,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#374151',
    marginTop: 5,
  },
  appointmentList: {
    paddingVertical: 10,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.pink,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 5,
  },
  appointmentService: {
    fontSize: 14,
    color: '#374151',
  },
  detailButton: {
    backgroundColor: Colors.pink,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});