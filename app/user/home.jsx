import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BookingHistoryScreen from './booked'; 
import FavoriteScreen from './favorite'; 
import ProfileScreen from './profile'; 
import { Colors } from '@/constants/Colors'; 

// Placeholder cho các màn hình
const NotificationScreen = () => (
  <View style={styles.center}>
    <Text>Thông báo Screen</Text>
  </View>
);

// const FavoriteScreen = () => (
//   <View style={styles.center}>
//     <Text>Yêu thích Screen</Text>
//   </View>
// );

// Component HomeScreen đã được sửa đổi
const HomeScreen = () => {
  const sliders = ['Slide 1', 'Slide 2', 'Slide 3'];
  const categories = ['Spa', 'Nail', 'Thẩm mỹ', 'Tóc'];
  const topRatedSpas = [
    { id: '1', name: 'Spa A', rating: 4.9 },
    { id: '2', name: 'Spa B', rating: 4.7 },
  ];
  const nearbySpas = [
    { id: '1', name: 'Spa X', distance: '1.2km' },
    { id: '2', name: 'Spa Y', distance: '2.5km' },
  ];
  const promotions = [
    { id: '1', title: 'Giảm 20% Massage', discount: '20%' },
    { id: '2', title: 'Combo Spa 50%', discount: '50%' },
  ];

  const handleViewAllTopRated = () => {
    console.log('Xem tất cả spa được đánh giá cao');
  };

  const handleViewAllNearby = () => {
    console.log('Xem tất cả spa gần bạn');
  };

  const handleViewAllPromotions = () => {
    console.log('Xem tất cả ưu đãi');
  };

  return (
    // Sử dụng SafeAreaView để đảm bảo header cố định không bị che
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />

      {/* ---- HEADER CỐ ĐỊNH ---- */}
      <LinearGradient
        // Gradient chỉ áp dụng cho header
        colors={[Colors.pink, `${Colors.pink}B3`]} // Gradient nông hơn
        style={styles.fixedHeaderGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm spa, nail..."
              placeholderTextColor="#999"
            />
          </View>
          {/* Có thể thêm icon khác ở đây nếu muốn */}
        </View>
      </LinearGradient>
      {/* ---- KẾT THÚC HEADER CỐ ĐỊNH ---- */}

      {/* ---- NỘI DUNG CUỘN (BAO GỒM SLIDER) ---- */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Khu vực Slide (Nằm trong ScrollView) */}
        <View style={styles.sliderContainer}>
          <Swiper
            style={styles.wrapper}
            showsButtons={false}
            autoplay
            loop // Cho phép lặp vô hạn
            autoplayTimeout={4} // Thời gian chuyển slide (giây)
            dotStyle={styles.dot} // Style cho dấu chấm không active
            activeDotStyle={styles.activeDot} // Style cho dấu chấm active
            paginationStyle={styles.pagination} // Style cho container của dấu chấm
          >
            {sliders.map((slide, index) => (
              <View key={index} style={styles.slide}>
                 {/* Thay Text bằng Image hoặc nội dung thực tế */}
                 <Text style={styles.slideText}>{slide}</Text>
              </View>
            ))}
          </Swiper>
        </View>

        {/* Danh mục */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryButton}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Spa được đánh giá cao nhất */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spa được đánh giá cao</Text>
            <TouchableOpacity onPress={handleViewAllTopRated}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topRatedSpas}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCard}>
                <View style={styles.itemImagePlaceholder} />
                <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSubText}>⭐ {item.rating}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: 15 }}
          />
        </View>

        {/* Spa gần nhất */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spa gần bạn</Text>
            <TouchableOpacity onPress={handleViewAllNearby}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={nearbySpas}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCard}>
                <View style={styles.itemImagePlaceholder} />
                <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSubText}>📍 {item.distance}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: 15 }}
          />
        </View>

        {/* Ưu đãi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ưu đãi</Text>
            <TouchableOpacity onPress={handleViewAllPromotions}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={promotions}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCardPromotion}>
                <View style={styles.promotionImagePlaceholder} />
                <Text style={styles.itemText} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.discountText}>Giảm {item.discount}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: 15 }}
          />
        </View>
        {/* Khoảng trống dưới cùng */}
         <View style={{ height: 20 }} />
      </ScrollView>
      {/* ---- KẾT THÚC NỘI DUNG CUỘN ---- */}
    </SafeAreaView>
  );
};

// ----- Các component khác và Tab Navigator giữ nguyên như trước -----
const Tab = createBottomTabNavigator();

const UserScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Booked') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Yêu thích') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Thông báo') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Tôi') iconName = focused ? 'person' : 'person-outline';
          else iconName = 'ellipse-outline';

          return <Icon name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: Colors.pink,
        tabBarInactiveTintColor: '#888',
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
          paddingBottom: Platform.OS === 'ios' ? 15 : 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Booked" component={BookingHistoryScreen} options={{ title: 'Lịch hẹn' }}/>
      <Tab.Screen name="Yêu thích" component={FavoriteScreen} />
      <Tab.Screen name="Thông báo" component={NotificationScreen} />
      <Tab.Screen name="Tôi" component={ProfileScreen} />
    </Tab.Navigator>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pink, // Màu nền cho khu vực SafeArea (phía trên header)
  },
  // ---- Styles cho Header Cố Định ----
  fixedHeaderGradient: {
    paddingBottom: 10, // Padding dưới cùng của gradient header
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    // Style cho nội dung bên trong gradient header
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 5 : 10, 
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0', // Màu viền nhạt hơn
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    color: '#333',
  },

  // ---- Styles cho Nội dung Cuộn ----
  scrollView: {
    flex: 1, // Quan trọng: Để ScrollView chiếm hết không gian còn lại
    backgroundColor: '#f8f9fa', // Màu nền cho phần nội dung cuộn
  },
  scrollViewContent: {
    paddingBottom: 20, // Padding dưới cùng cho nội dung cuộn
  },

  // ---- Styles cho Slider (nằm trong ScrollView) ----
  sliderContainer: {
    height: 190, // Chiều cao của khu vực slider
    marginTop: 15, // Khoảng cách từ header xuống slider
    marginBottom: 10, // Khoảng cách từ slider xuống danh mục
    paddingHorizontal: 15, // Padding ngang để slide không sát viền
  },
  wrapper: {}, // Style cho Swiper container
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Màu nền slide
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Thêm viền nếu muốn
    // borderWidth: 1,
    // borderColor: '#eee',
  },
  slideText: {
    color: Colors.pink,
    fontSize: 20,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 10, // Vị trí của các chấm pagination
  },
  dot: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Màu chấm không active (tối hơn)
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4, // Tăng khoảng cách giữa các chấm
    marginRight: 4,
  },
  activeDot: {
    backgroundColor: Colors.pink, // Màu chấm active (màu hồng)
    width: 10, // Chấm active to hơn
    height: 10,
    borderRadius: 5,
    marginLeft: 4,
    marginRight: 4,
  },

  // ---- Styles cho các Section còn lại (Categories, Spas, Promotions) ----
  categoryContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
    paddingLeft: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 15,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.pink,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    width: 160,
    overflow: 'hidden',
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
   itemCardPromotion: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    width: 250,
    overflow: 'hidden',
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  itemImagePlaceholder: {
      width: '100%',
      height: 100,
      backgroundColor: '#eee',
      marginBottom: 8,
  },
   promotionImagePlaceholder: {
      width: '100%',
      height: 120,
      backgroundColor: '#e0e0e0',
      marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  itemSubText: {
    fontSize: 12,
    color: '#777',
    paddingHorizontal: 10,
  },
   discountText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.pink,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default UserScreen;