import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';

const BookingScreen = () => {
  const [bookedSlots, setBookedSlots] = useState([
    { date: '2025-04-11', time: '09:00' },
    { date: '2025-04-11', time: '10:30' },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const navigation = useNavigation();

  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    if (hour === 8) {
      timeSlots.push('08:30');
    } else {
      timeSlots.push(`${hour < 10 ? '0' + hour : hour}:00`);
      if (hour < 20) timeSlots.push(`${hour < 10 ? '0' + hour : hour}:30`);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = currentTime.toISOString().split('T')[0];

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setSelectedTime('');
  };

  const handleTimePress = (time) => {
    setSelectedTime(time);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleBookingConfirm = () => {
    if (selectedDate && selectedTime) {
      setModalMessage(`Đặt lịch lúc ${selectedTime} ngày ${formatDate(selectedDate)}`);
      setIsSuccess(true);
      setModalVisible(true);
      setBookedSlots([...bookedSlots, { date: selectedDate, time: selectedTime }]);
      setSelectedTime('');
    } else {
      setModalMessage('Vui lòng chọn ngày và giờ');
      setIsSuccess(false);
      setModalVisible(true);
    }
  };

  const isTimeDisabled = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const selectedDateObj = new Date(selectedDate);
    const todayDate = new Date(today);
    const nowPlusOneHour = new Date(currentTime.getTime() + 60 * 60 * 1000);

    if (selectedDateObj < todayDate.setHours(0, 0, 0, 0)) return true;

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

    return bookedSlots.some(
      (slot) => slot.date === selectedDate && slot.time === time
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
      <LinearGradient
        colors={[Colors.pink, `${Colors.pink}`, '#fff']}
        style={styles.gradientBackground}
      >
       <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt lịch t</Text>
        </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.calendarBlock}>
            <Calendar
              current={today}
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: Colors.pink },
                [today]: {
                  marked: true,
                  dotColor: Colors.pink,
                  selected: selectedDate === today,
                  selectedColor: Colors.pink,
                },
              }}
              theme={{
                calendarBackground: '#fff',
                selectedDayBackgroundColor: Colors.pink,
                selectedDayTextColor: '#fff',
                todayTextColor: Colors.pink,
                dayTextColor: '#000',
                textDisabledColor: '#d9e1e8',
                monthTextColor: '#000',
                textMonthFontWeight: 'bold',
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
            <Text style={styles.confirmButtonText}>Xác nhận đặt lịch</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal thông báo */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Icon
                name={isSuccess ? 'checkmark-circle' : 'warning'}
                size={40}
                color={isSuccess ? Colors.successGreen : Colors.errorRed}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>
                {isSuccess ? 'Thành công' : 'Lỗi'}
              </Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: isSuccess ? Colors.pink : Colors.gray },
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  calendarBlock: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  timeBlock: {
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: Colors.pink,
  },
  disabledTimeSlot: {
    backgroundColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledTimeText: {
    color: '#999',
  },
  confirmButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // Modal styles
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
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    flexWrap: 'nowrap',
    width: '100%',
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
    fontWeight: 'bold',
  },
});

export default BookingScreen;