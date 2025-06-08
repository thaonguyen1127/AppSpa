import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../src/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';

const SpaBooking = () => {
  const router = useRouter();
  const { id, date, time } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    notes: '',
    selectedDate: '',
    selectedTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const HEADER_HEIGHT = 50;

  // Kiểm tra id khi khởi tạo
  useEffect(() => {
    if (!id) {
      Alert.alert('Lỗi', 'ID spa không hợp lệ', [
        { text: 'Quay lại', onPress: () => router.back() },
      ]);
    }
  }, [id, router]);

  // Lắng nghe kết quả từ CalendarScreen
  useFocusEffect(
    useCallback(() => {
      if (date && time) {
        setFormData((prev) => ({
          ...prev,
          selectedDate: date,
          selectedTime: time,
        }));
      }
    }, [date, time])
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!id) {
      Alert.alert('Lỗi', 'ID spa không hợp lệ');
      return;
    }
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.selectedDate ||
      !formData.selectedTime
    ) {
      setModalVisible(true);
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại phải gồm 10 chữ số');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        spaId: id,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes || '',
        date: formData.selectedDate,
        time: formData.selectedTime,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, `spas/${id}/bookings`), bookingData);
      Alert.alert('Thành công', 'Đặt lịch thành công!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Lỗi khi đặt lịch:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectTime = () => {
    if (!id) {
      Alert.alert('Lỗi', 'ID spa không hợp lệ');
      return;
    }
    try {
      router.push(`/user/calendar?id=${id}`);
    } catch (err) {
      console.error('Lỗi điều hướng:', err);
      Alert.alert('Lỗi', 'Không thể mở lịch: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <View style={styles.headerContainer}>
        <View style={[styles.header, { height: HEADER_HEIGHT }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt lịch tư vấn</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.content}>
          {/* Thông tin cá nhân */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                placeholderTextColor="#999"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#999"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Chọn thời gian */}
          <View style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="time-outline" size={20} color="#FF69B4" />
              <Text style={styles.sectionTitle}>Chọn thời gian</Text>
            </View>
            <TouchableOpacity style={styles.timeButton} onPress={handleSelectTime}>
              <Text style={styles.timeButtonText}>
                {formData.selectedDate && formData.selectedTime
                  ? `${formData.selectedTime} - ${formatDate(formData.selectedDate)}`
                  : 'Chọn thời gian'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Ghi chú */}
          <View style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="chatbubble-outline" size={20} color="#FF69B4" />
              <Text style={styles.sectionTitle}>Ghi chú</Text>
            </View>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Ghi chú thêm về dịch vụ bạn muốn sử dụng..."
              placeholderTextColor="#999"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Tóm tắt đặt lịch */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Thông tin đặt lịch</Text>
            <View style={styles.summaryContent}>
              {formData.fullName ? (
                <Text style={styles.summaryText}>Tên: {formData.fullName}</Text>
              ) : null}
              {formData.phoneNumber ? (
                <Text style={styles.summaryText}>SĐT: {formData.phoneNumber}</Text>
              ) : null}
              {formData.selectedDate && formData.selectedTime ? (
                <Text style={styles.summaryText}>
                  Thời gian: {formData.selectedTime} - {formatDate(formData.selectedDate)}
                </Text>
              ) : null}
              {id ? (
                <Text style={styles.summaryText}>Name Spa: {id}</Text>
              ) : null}
            </View>
          </View>

          {/* Nút gửi */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              {
                backgroundColor: Colors.pink,
              },
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch tư vấn'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal thông báo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Vui lòng điền đầy đủ thông tin bắt buộc</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    backgroundColor: Colors.pink || '#FF69B4',
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
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingTop: 80,
    paddingBottom: 20,
  },
  content: {
    paddingTop: 16,
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF69B4',
  },
  inputContainer: {
    marginTop: 8,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#FFF5F7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#BE185D',
    marginBottom: 8,
  },
  summaryContent: {
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#DB2777',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  // submitButtonDisabled: {
  //   opacity: 0.5,
  // },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: Colors.pink || '#FF69B4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default SpaBooking;