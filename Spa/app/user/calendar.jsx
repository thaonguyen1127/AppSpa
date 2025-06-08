import React, { useState, useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../src/firebaseConfig";
import { Colors } from "@/constants/Colors";
import moment from "moment-timezone";
import "moment/locale/vi";

moment.locale("vi");

// Cấu hình locale tiếng Việt
LocaleConfig.locales["vi"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ],
  dayNames: ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
};
LocaleConfig.defaultLocale = "vi";

const CalendarScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedBookingDate, setSelectedBookingDate] = useState(
    moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD")
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [currentTime, setCurrentTime] = useState(
    moment().tz("Asia/Ho_Chi_Minh").toDate()
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [userBookedTimeSlots, setUserBookedTimeSlots] = useState([]);

  // Lấy openTime, closeTime, slot đã đặt và lịch của người dùng
  useEffect(() => {
    const fetchSpaDataAndAppointments = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Vui lòng đăng nhập để chọn lịch.");
        }

        // Lấy openTime và closeTime của spa
        const spaDoc = await getDoc(doc(db, "spas", id));
        if (!spaDoc.exists()) {
          throw new Error("Không tìm thấy thông tin spa.");
        }

        const { openTime, closeTime } = spaDoc.data();
        if (!openTime || !closeTime) {
          throw new Error("Thông tin giờ hoạt động của spa không hợp lệ.");
        }

        // Phân tích thời gian theo múi giờ UTC+7
        const open = moment.tz(openTime, "Asia/Ho_Chi_Minh");
        const close = moment.tz(closeTime, "Asia/Ho_Chi_Minh");

        // Tính closeTime - 1 tiếng
        const adjustedClose = close.clone().subtract(1, "hour");

        // Tạo danh sách khung giờ cách nhau 30 phút
        const slots = [];
        let current = open.clone();
        while (current.isSameOrBefore(adjustedClose)) {
          slots.push(current.format("HH:mm"));
          current.add(30, "minutes");
        }
        setTimeSlots(slots);

        // Lấy danh sách lịch đã đặt từ appointments (tất cả người dùng cho spa này)
        const appointmentsSnapshot = await getDocs(
          query(
            collection(db, "appointments"),
            where("spaId", "==", id),
            where("status", "in", ["pending", "confirmed"])
          )
        );
        const slotsBooked = appointmentsSnapshot.docs
          .filter((doc) => {
            const data = doc.data();
            let bookingDate;
            try {
              bookingDate = moment(data.bookingDate)
                .tz("Asia/Ho_Chi_Minh")
                .format("YYYY-MM-DD");
            } catch (error) {
              return false;
            }
            return bookingDate === selectedBookingDate;
          })
          .map((doc) => ({
            bookingDate: moment(doc.data().bookingDate)
              .tz("Asia/Ho_Chi_Minh")
              .format("YYYY-MM-DD"),
            timeSlot: doc.data().timeSlot,
          }));
        setBookedSlots(slotsBooked);

        // Lấy danh sách khung giờ người dùng hiện tại đã đặt
        const userAppointmentsSnapshot = await getDocs(
          query(
            collection(db, "appointments"),
            where("userId", "==", user.uid),
            where("spaId", "==", id),
            where("status", "in", ["pending", "confirmed"])
          )
        );

        const userBookedTimes = userAppointmentsSnapshot.docs
          .filter((doc) => {
            const data = doc.data();
            let bookingDate;
            try {
              bookingDate = moment(data.bookingDate)
                .tz("Asia/Ho_Chi_Minh")
                .format("YYYY-MM-DD");
            } catch (error) {
              return false;
            }
            return bookingDate === selectedBookingDate;
          })
          .map((doc) => doc.data().timeSlot);
        setUserBookedTimeSlots(userBookedTimes);
      } catch (error) {
        setModalMessage(error.message || "Không thể tải thông tin spa.");
        setIsSuccess(false);
        setModalVisible(true);
        setTimeSlots(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
        setBookedSlots([
          { bookingDate: "2025-06-07", timeSlot: "09:00" },
          { bookingDate: "2025-06-07", timeSlot: "10:00" },
        ]);
      }
    };
    if (id) {
      fetchSpaDataAndAppointments();
    } else {
      setModalMessage("ID spa không hợp lệ.");
      setIsSuccess(false);
      setModalVisible(true);
      setTimeSlots(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
    }
  }, [id, selectedBookingDate]);

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().tz("Asia/Ho_Chi_Minh").toDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");

  // Xử lý chọn ngày
  const handleDayPress = (day) => {
    setSelectedBookingDate(day.dateString);
    setSelectedTimeSlot("");
  };

  // Xử lý chọn khung giờ
  const handleTimePress = (time) => {
    setSelectedTimeSlot(time);
  };

  // Định dạng ngày (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Xác nhận chọn ngày và giờ
  const handleBookingConfirm = () => {
    if (selectedBookingDate && selectedTimeSlot) {
      setModalMessage("Đã chọn ngày và giờ!");
      setIsSuccess(true);
      setModalVisible(true);

      // Điều hướng lại SpaBooking với params
      setTimeout(() => {
        router.replace(
          `/user/booking?id=${id}&bookingDate=${selectedBookingDate}&timeSlot=${selectedTimeSlot}`
        );
        setModalVisible(false);
      }, 1000);
    } else {
      setModalMessage("Vui lòng chọn ngày và giờ");
      setIsSuccess(false);
      setModalVisible(true);
    }
  };

  // Kiểm tra khung giờ có bị vô hiệu hóa không
  const isTimeDisabled = (time) => {
    const selectedDateMoment = moment.tz(
      selectedBookingDate,
      "Asia/Ho_Chi_Minh"
    );
    const todayMoment = moment.tz(today, "Asia/Ho_Chi_Minh");
    const nowPlusTwoHours = moment
      .tz(currentTime, "Asia/Ho_Chi_Minh")
      .add(2, "hours");

    // Vô hiệu hóa nếu ngày đã qua
    if (selectedDateMoment.isBefore(todayMoment, "day")) return true;

    // Vô hiệu hóa nếu khung giờ trước thời điểm hiện tại + 2 tiếng
    const slotTime = moment.tz(
      `${selectedBookingDate} ${time}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Ho_Chi_Minh"
    );
    if (slotTime.isBefore(nowPlusTwoHours)) return true;

    // Vô hiệu hóa nếu khung giờ đã được đặt (chỉ tính pending và confirmed)
    return bookedSlots.some(
      (slot) => slot.bookingDate === selectedBookingDate && slot.timeSlot === time
    );
  };

  // Kiểm tra khung giờ có được người dùng đặt không
  const isUserBookedTime = (time) => {
    return userBookedTimeSlots.includes(time);
  };

  // Đóng modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Chỉ đánh dấu ngày được chọn
  const markedDates = {
    [selectedBookingDate]: {
      selected: true,
      selectedColor: "#FF69B4",
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />
      <LinearGradient
        colors={[Colors.pink, Colors.pink, "#fff"]}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
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
              minDate={today}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              firstDay={0}
              locale="vi"
              theme={{
                calendarBackground: "#fff",
                selectedDayBackgroundColor: "#FF69B4",
                selectedDayTextColor: "#fff",
                todayTextColor: "#FF69B4",
                dayTextColor: "#333",
                textDisabledColor: "#D1D5DB",
                monthTextColor: "#333",
                textMonthFontWeight: "500",
              }}
            />
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => {
                const disabled = isTimeDisabled(time);
                const userBooked = isUserBookedTime(time);
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === time &&
                        !disabled &&
                        styles.selectedTimeSlot,
                      disabled && styles.disabledTimeSlot,
                    ]}
                    onPress={() => !disabled && handleTimePress(time)}
                    disabled={disabled}
                  >
                    <View style={styles.timeSlotContent}>
                      <Text
                        style={[
                          styles.timeText,
                          selectedTimeSlot === time && !disabled
                            ? styles.selectedTimeText
                            : null,
                          disabled ? styles.disabledTimeText : null,
                        ]}
                      >
                        {time}
                      </Text>
                      {userBooked && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#22C55E"
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedTimeSlot || isTimeDisabled(selectedTimeSlot)) &&
                styles.disabledButton,
            ]}
            onPress={handleBookingConfirm}
            disabled={!selectedTimeSlot || isTimeDisabled(selectedTimeSlot)}
          >
            <LinearGradient
              colors={["#FF69B4", "#FF1493"]}
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
                name={isSuccess ? "checkmark-circle" : "warning"}
                size={40}
                color={isSuccess ? "#22C55E" : "#EF4444"}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>
                {isSuccess ? "Thông báo" : "Lỗi"}
              </Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: isSuccess ? "#FF69B4" : "#999" },
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 40,
  },
  calendarBlock: {
    backgroundColor: "#fff",
    marginVertical: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeBlock: {
    backgroundColor: "#fff",
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "30%",
    alignItems: "center",
  },
  timeSlotContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#FF69B4",
  },
  disabledTimeSlot: {
    backgroundColor: "#E5E7EB",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  selectedTimeText: {
    color: "#fff",
    fontWeight: "500",
  },
  disabledTimeText: {
    color: "#999",
  },
  checkIcon: {
    marginLeft: 5,
  },
  confirmButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
  },
  confirmButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CalendarScreen;