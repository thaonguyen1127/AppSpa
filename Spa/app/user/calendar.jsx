import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebaseConfig'; 

const CalendarScreen = () => {
  const router = useRouter();
  const { idSpa } = useLocalSearchParams(); // Lấy idSpa từ tham số điều hướng
  const [bookedSlots, setBookedSlots] = useState([
    // Dữ liệu giả lập (dùng nếu chưa có Firebase)
    { date: '2025-06-07', time: '09:00' },
    { date: '2025-06-07', time: '10:00' },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // Danh sách khung giờ (chỉ giờ chẵn từ 08:00 đến 22:00)
  const timeSlots = [];
  for (let hour = 8; hour <= 22; hour++) {
    timeSlots.push(`${hour < 10 ? '0' + hour : hour}:00`);
  }

  // Lấy danh sách lịch đã đặt từ Firebase
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const bookingsSnapshot = await getDocs(collection(db, `spas/${idSpa}/bookings`));
        const slots = bookingsSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          time: doc.data().time,
        }));
        setBookedSlots(slots);
      } catch (error) {
        console.error('Lỗi lấy lịch đặt:', error);
        // Giữ dữ liệu giả lập nếu Firebase lỗi
        setBookedSlots([
          { date: '2025-06-07', time: '09:00' },
          { date: '2025-06-07', time: '10:00' },
        ]);
      }
    };
    if (idSpa) {
      fetchBookedSlots();
    }
  }, [idSpa]);

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = currentTime.toISOString().split('T')[0];

  // Xử lý chọn ngày
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setSelectedTime('');
  };

  // Xử lý chọn khung giờ
  const handleTimePress = (time) => {
    setSelectedTime(time);
  };

  // Định dạng ngày (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Xác nhận chọn lịch
  const handleBookingConfirm = () => {
    if (selectedDate && selectedTime) {
      router.back({
        params: {
          date: selectedDate,
          time: selectedTime,
        },
      });
    } else {
      setModalMessage('Vui lòng chọn ngày và giờ');
      setIsSuccess(false);
      setModalVisible(true);
    }
  };

  // Kiểm tra khung giờ có bị vô hiệu hóa không
  const isTimeDisabled = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const selectedDateObj = new Date(selectedDate);
    const todayDate = new Date(today);
    const nowPlusOneHour = new Date(currentTime.getTime() + 60 * 60 * 1000);

    // Vô hiệu hóa nếu ngày đã qua
    if (selectedDateObj < todayDate.setHours(0, 0, 0, 0)) return true;

    // Vô hiệu hóa nếu khung giờ trong quá khứ (ngày hiện tại)
    if (selectedDate === today) {
      const currentHourPlusOne = nowPlusOneHour.getHours();
      const currentMinutePlusOne = nowPlusOneHour.getMinutes();
      if (
        hour < currentHourPlusOne ||
        (hour === currentHourPlusOne && minute <= currentMinutePlusOne)
      ) {
        return true;
      }
    }

    // Vô hiệu hóa nếu khung giờ đã được đặt
    return bookedSlots.some(
      (slot) => slot.date === selectedDate && slot.time === time
    );
  };

  // Đóng modal
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <LinearGradient
        colors={['#FF69B4', '#FF1493']}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn thời gian</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.calendarBlock}>
            <Calendar
              current={today}
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#FF69B4' },
                [today]: {
                  marked: true,
                  dotColor: '#FF69B4',
                  selected: selectedDate === today,
                  selectedColor: '#FF69B4',
                },
              }}
              theme={{
                calendarBackground: '#fff',
                selectedDayBackgroundColor: '#FF69B4',
                selectedDayTextColor: '#fff',
                todayTextColor: '#FF69B4',
                dayTextColor: '#333',
                textDisabledColor: '#D1D5DB',
                monthTextColor: '#333',
                textMonthFontWeight: '500',
              }}
            />
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => {
                const disabled = isTimeDisabled(time);
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && !disabled && styles.selectedTimeSlot,
                      disabled && styles.disabledTimeSlot,
                    ]}
                    onPress={() => !disabled && handleTimePress(time)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selectedTime === time && !disabled ? styles.selectedTimeText : null,
                        disabled ? styles.disabledTimeText : null,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedTime || isTimeDisabled(selectedTime)) && styles.disabledButton,
            ]}
            onPress={handleBookingConfirm}
            disabled={!selectedTime || isTimeDisabled(selectedTime)}
          >
            <LinearGradient
              colors={['#FF69B4', '#FF1493']}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Ionicons
                name={isSuccess ? 'checkmark-circle' : 'warning'}
                size={40}
                color={isSuccess ? '#22C55E' : '#EF4444'}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>
                {isSuccess ? 'Thành công' : 'Lỗi'}
              </Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: isSuccess ? '#FF69B4' : '#999' },
                ]}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 60, // Tăng paddingTop để tránh che khuất tiêu đề
  },
  calendarBlock: {
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeBlock: {
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#FF69B4',
  },
  disabledTimeSlot: {
    backgroundColor: '#E5E7EB',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '500',
  },
  disabledTimeText: {
    color: '#999',
  },
  confirmButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  confirmButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CalendarScreen;