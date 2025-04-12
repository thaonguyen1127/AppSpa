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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BookingHistoryScreen from './booked';
import FavoriteScreen from './favorite';
import ProfileScreen from './profile';
import NotificationScreen from './notification';
import { Colors } from '@/constants/Colors';


// Component HomeScreen
const HomeScreen = () => {
  // Dữ liệu slider với ảnh mẫu
  const sliders = [
    { id: '1', image: require('../../assets/images/spa3.jpg'), title: 'Spa thư giãn' },
    { id: '2', image: require('../../assets/images/slider1.jpg'), title: 'Nail nghệ thuật' },
    { id: '3', image: require('../../assets/images/slider2.jpg'), title: 'Tóc thời thượng' },
  ];

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

  const HEADER_HEIGHT = Platform.OS === 'android' ? 60 + (StatusBar.currentHeight || 0) : 70;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <View style={styles.container}>
        {/* Header cố định */}
        <View
          style={[
            styles.fixedHeader,
            { height: HEADER_HEIGHT, backgroundColor: Colors.pink },
          ]}
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
          </View>
        </View>

        {/* ScrollView chứa slider và nội dung */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollViewContent, { paddingTop: HEADER_HEIGHT }]}
          contentInsetAdjustmentBehavior="never"
        >
          {/* Slider với nền hồng */}
          <View style={[styles.sliderWrapper, { backgroundColor: Colors.pink }]}>
            <View style={styles.sliderContainer}>
              <Swiper
                style={styles.wrapper}
                showsButtons={false}
                autoplay
                loop
                autoplayTimeout={4}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.pagination}
                removeClippedSubviews={true}
              >
                {sliders.map((slide) => (
                  <View key={slide.id} style={styles.slide}>
                    <Image
                      source={slide.image}
                      style={styles.slideImage}
                      resizeMode="cover"
                    />
                    <View style={styles.slideOverlay}>
                      <Text style={styles.slideText}>{slide.title}</Text>
                    </View>
                  </View>
                ))}
              </Swiper>
            </View>
          </View>

          {/* Nội dung trắng */}
          <View style={styles.whiteContent}>
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
                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSubText}>⭐ {item.rating}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            </View>

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
                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSubText}>📍 {item.distance}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            </View>

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
                    <Text style={styles.itemText} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.discountText}>Giảm {item.discount}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            </View>
            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Tab Navigator
const Tab = createBottomTabNavigator();

const UserScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home')
            iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Booked')
            iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Yêu thích')
            iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Thông báo')
            iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Tôi')
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Booked"
        component={BookingHistoryScreen}
        options={{ title: 'Lịch hẹn' }}
      />
      <Tab.Screen name="Yêu thích" component={FavoriteScreen} />
      <Tab.Screen name="Thông báo" component={NotificationScreen} />
      <Tab.Screen name="Tôi" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.pink, // Đồng bộ với header và slider
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 10,
    paddingBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sliderWrapper: {
    backgroundColor: Colors.pink,
  },
  sliderContainer: {
    height: 190,
    marginTop: 0,
    // marginBottom: 10,
    // paddingHorizontal: 15,
    width: '100%',
    
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ cho chữ
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  slideText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pagination: {
    bottom: 10,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    marginRight: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 4,
    marginRight: 4,
  },
  whiteContent: {
    backgroundColor: '#fff',
  },
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
  },
  itemCardPromotion: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    width: 250,
    overflow: 'hidden',
    paddingBottom: 10,
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