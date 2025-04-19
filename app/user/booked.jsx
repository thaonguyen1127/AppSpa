import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';

// Dữ liệu mẫu
const bookedSpas = [
  {
    id: '1',
    spaName: 'Lavender Spa',
    date: '2025-04-11',
    time: '09:30',
    service: 'Massage thư giãn',
    avatar: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '2',
    spaName: 'Rose Spa',
    date: '2025-04-10',
    time: '14:00',
    service: 'Chăm sóc da mặt',
    avatar: 'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '3',
    spaName: 'Jasmine Spa',
    date: '2025-03-25',
    time: '10:30',
    service: 'Gội đầu dưỡng sinh',
    avatar: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '4',
    spaName: 'Orchid Spa',
    date: '2025-03-15',
    time: '16:00',
    service: 'Massage toàn thân',
    avatar: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '5',
    spaName: 'Lotus Spa',
    date: '2025-02-28',
    time: '11:00',
    service: 'Chăm sóc móng',
    avatar: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
];

const BookingHistoryScreen = () => {
  const navigation = useNavigation();
  const HEADER_HEIGHT = 50; 

  const groupByMonth = (bookings) => {
    const grouped = bookings.reduce((acc, booking) => {
      const date = new Date(booking.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`,
          bookings: [],
        };
      }
      acc[monthYear].bookings.push(booking);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.bookings[0].date);
      const dateB = new Date(b.bookings[0].date);
      return dateB - dateA;
    });
  };

  const groupedBookings = groupByMonth(bookedSpas);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const goToSpaDetail = (spa) => {
    navigation.navigate('screen/spaDetail', { spa });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.pink}
        barStyle="light-content"
        translucent={false}
      />
      <LinearGradient
        colors={[Colors.pink, `${Colors.pink}`, '#fff']}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <View
            style={[styles.header, { height: HEADER_HEIGHT }]}
          >
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lịch sử đặt lịch</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { paddingTop: HEADER_HEIGHT }]}
        >
          {groupedBookings.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có lịch đặt nào</Text>
          ) : (
            groupedBookings.map((group, index) => (
              <View key={index} style={styles.monthBlock}>
                <Text style={styles.monthTitle}>{group.month}</Text>
                {group.bookings.map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={styles.bookingCard}
                    onPress={() => goToSpaDetail(booking)}
                  >
                    <Image
                      source={{ uri: booking.avatar }}
                      style={styles.spaAvatar}
                      defaultSource={{ uri: 'https://via.placeholder.com/50/CCCCCC/FFFFFF?text=Spa' }}
                      onError={() => console.log(`Failed to load image for ${booking.spaName}`)}
                    />
                    <View style={styles.bookingInfo}>
                      <Text style={styles.spaName}>{booking.spaName}</Text>
                      <Text style={styles.serviceText}>{booking.service}</Text>
                      <Text style={styles.dateTimeText}>
                        {formatDate(booking.date)} lúc {booking.time}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => goToSpaDetail(booking)}
                    >
                      <Text style={styles.viewButtonText}>Chi tiết</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>
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
    // lineHeight: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  monthBlock: {
    marginVertical: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spaAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  bookingInfo: {
    flex: 1,
  },
  spaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BookingHistoryScreen;