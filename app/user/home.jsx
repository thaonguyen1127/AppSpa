import React, { useState, useEffect, useCallback } from 'react';
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
  Image,
  Platform,
  ImageBackground,
  RefreshControl,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

// Dữ liệu slider
const sliders = [
  {
    id: '1',
    image: require('../../assets/images/spa3.jpg'),
    title: 'Spa Thư Giãn Sang Trọng',
    subtitle: 'Trải nghiệm dịch vụ massage cao cấp',
  },
  {
    id: '2',
    image: require('../../assets/images/slider1.jpg'),
    title: 'Nail Nghệ Thuật Độc Đáo',
    subtitle: 'Thiết kế móng tay theo phong cách riêng',
  },
  {
    id: '3',
    image: require('../../assets/images/slider2.jpg'),
    title: 'Tóc Thời Thượng',
    subtitle: 'Cắt và tạo kiểu tóc hiện đại',
  },
];

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [topRatedSpas, setTopRatedSpas] = useState([]);
  const [nearbySpas, setNearbySpas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTopRatedLoading, setIsTopRatedLoading] = useState(true);
  const [isNearbyLoading, setIsNearbyLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);

  // Hàm tính khoảng cách giữa hai điểm (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2 || lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
      return { value: Infinity, unit: 'km', display: 'N/A', meters: Infinity };
    }
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Bán kính trái đất (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c; // Khoảng cách tính bằng km
    const distanceMeters = distanceKm * 1000; // Quy đổi về mét
    if (distanceKm < 1) {
      const distanceM = Math.round(distanceMeters);
      return { value: distanceM, unit: 'm', display: `${distanceM} m`, meters: distanceM };
    }
    const distanceKmRounded = parseFloat(distanceKm.toFixed(1));
    return { value: distanceKmRounded, unit: 'km', display: `${distanceKmRounded} km`, meters: distanceMeters };
  };

  // Hàm lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Highest,
        maximumAge: 10000,
        timeout: 15000,
      });
      setLocation(locationData.coords);
    } catch (error) {
      setLocation(null);
    }
  };

  // Kiểm tra quyền truy cập vị trí
  const checkLocationPermission = useCallback(async () => {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);
      if (status === 'granted') {
        await getCurrentLocation();
      } else if (status === 'denied' && canAskAgain) {
        Alert.alert(
          'Cần quyền truy cập vị trí',
          'Bạn cần cấp quyền để xem các spa gần nhất.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thử lại', onPress: checkLocationPermission },
          ]
        );
      } else {
        Alert.alert(
          'Quyền truy cập vị trí bị từ chối',
          'Hãy vào Cài đặt để cấp quyền vị trí.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      setLocationPermissionStatus('denied');
    }
  }, []);

  // Hàm lấy dữ liệu từ Firestore
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      if (!forceRefresh) {
        setIsTopRatedLoading(true);
        setIsNearbyLoading(true);
      }

      // Lấy danh mục
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        icon: getIconForService(doc.data().name),
      }));
      setCategories(servicesList);

      // Lấy tất cả spa
      const spasSnapshot = await getDocs(collection(db, 'spas'));
      const spaList = [];

      // Lấy đánh giá
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const spaRatings = {};

      if (!reviewsSnapshot.empty) {
        reviewsSnapshot.forEach(doc => {
          const review = doc.data();
          let spaId = review.spaId;

          if (typeof spaId === 'string' && spaId.includes('/')) {
            spaId = spaId.split('/').pop();
          } else if (spaId?.id) {
            spaId = spaId.id;
          }

          const rating = parseFloat(review.rating);

          if (!spaId || typeof spaId !== 'string' || isNaN(rating)) {
            return;
          }

          if (!spaRatings[spaId]) {
            spaRatings[spaId] = {
              totalRating: 0,
              count: 0,
            };
          }

          spaRatings[spaId].totalRating += rating;
          spaRatings[spaId].count += 1;
        });
      }

      // Xử lý spa
      spasSnapshot.forEach(doc => {
        const spaData = doc.data();
        const imageUrl =
          Array.isArray(spaData.images) && spaData.images.length > 0
            ? spaData.images[0]
            : 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);

        const spaId = doc.id;
        const averageRating = spaRatings[spaId]
          ? spaRatings[spaId].totalRating / spaRatings[spaId].count
          : 0;

        const lat = spaData.coordinates?.lat;
        const lon = spaData.coordinates?.lon;

        // Chỉ thêm spa có tọa độ hợp lệ
        if (lat && lon && lat !== 0 && lon !== 0) {
          spaList.push({
            id: spaId,
            name: spaData.name || 'Spa Không Tên',
            rating: averageRating,
            image: imageUrl,
            coordinates: { lat, lon },
          });
        }
      });

      // Sắp xếp top-rated spas
      spaList.sort((a, b) => b.rating - a.rating);
      setTopRatedSpas(spaList.slice(0, 5));

      // Lấy spa gần nhất
      if (location && locationPermissionStatus === 'granted') {
        const nearbySpaList = spaList
          .map(spa => {
            const distanceObj = calculateDistance(
              location.latitude,
              location.longitude,
              spa.coordinates.lat,
              spa.coordinates.lon
            );
            return {
              ...spa,
              distance: distanceObj.value,
              distanceUnit: distanceObj.unit,
              displayDistance: distanceObj.display,
              meters: distanceObj.meters,
            };
          })
          .filter(spa => spa.meters !== Infinity);

        // Sắp xếp theo khoảng cách (mét)
        nearbySpaList.sort((a, b) => a.meters - b.meters);
        setNearbySpas(nearbySpaList);
      } else {
        setNearbySpas([]);
      }
    } catch (error) {
      setCategories([]);
      setTopRatedSpas([]);
      setNearbySpas([]);
    } finally {
      setRefreshing(false);
      setIsTopRatedLoading(false);
      setIsNearbyLoading(false);
    }
  }, [location, locationPermissionStatus]);

  // Tải dữ liệu và kiểm tra quyền
  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);

  useEffect(() => {
    if (locationPermissionStatus) {
      fetchData();
    }
  }, [location, locationPermissionStatus, fetchData]);

  // Xử lý pull-to-refresh
  const onRefresh = useCallback(() => {
    checkLocationPermission();
    fetchData(true);
  }, [checkLocationPermission, fetchData]);

  // Ánh xạ icon cho dịch vụ
  const getIconForService = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('spa') || name.includes('massage')) return 'heart';
    if (name.includes('nail')) return 'brush';
    if (name.includes('tóc') || name.includes('hair')) return 'cut';
    if (name.includes('thẩm mỹ') || name.includes('beauty')) return 'sparkles';
    if (name.includes('phòng khám') || name.includes('clinic')) return 'medical';
    return 'star';
  };

  // Skeleton Card
  const SkeletonCard = () => (
    <View style={styles.itemCard}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: '100%', height: 100, borderRadius: 10 }}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: '80%', height: 16, margin: 8, borderRadius: 4 }}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: '60%', height: 12, marginHorizontal: 8, borderRadius: 4 }}
      />
    </View>
  );

  const handleViewAllTopRated = () => {
    router.push('/user/topRatedSpas');
  };

  const handleViewAllNearby = () => {
    router.push('/user/nearbySpas');
  };

  const handleSearchPress = () => {
    router.push('/user/searchScreen');
  };

  const handleNotification = () => {
    router.push('/user/notification');
  };

  const handleCategoryPress = (category) => {
    router.push(`/user/category/${category.id}`);
  };

  const handleSpaPress = (spaId) => {
    router.push(`/screen/spaDetail?id=${spaId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <View style={styles.sliderSection}>
        <SwiperFlatList
          autoplay
          autoplayDelay={4}
          autoplayLoop
          data={sliders}
          renderItem={({ item }) => (
            <ImageBackground
              source={item.image}
              style={[styles.slide, { width }]}
              resizeMode="cover"
            >
              <View style={styles.overlaidSearchContainer}>
                <View style={styles.searchContainer}>
                  <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm spa, nail, tóc..."
                    placeholderTextColor="#999"
                    onFocus={handleSearchPress}
                  />
                </View>
                <TouchableOpacity onPress={handleNotification} style={styles.notificationButton}>
                  <Icon name="notifications-outline" size={24} color="#fff" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          )}
          keyExtractor={(item) => item.id}
          showPagination
          paginationStyle={styles.pagination}
          paginationStyleItem={styles.dot}
          paginationStyleItemActive={styles.activeDot}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.pink]}
            tintColor={Colors.pink}
            progressViewOffset={250}
          />
        }
      >
        <View style={styles.whiteContent}>
          {/* Danh mục */}
          <View style={styles.categoryContainer}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryButton}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Icon name={category.icon} size={20} color={Colors.pink} />
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Spa được đánh giá cao */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spa được đánh giá cao</Text>
              <TouchableOpacity onPress={handleViewAllTopRated}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {isTopRatedLoading ? (
              <FlatList
                data={[1, 2, 3, 4]}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={() => <SkeletonCard />}
                keyExtractor={(item) => `skeleton-${item}`}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            ) : topRatedSpas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có spa được đánh giá</Text>
              </View>
            ) : (
              <FlatList
                data={topRatedSpas}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.itemCard}
                    onPress={() => handleSpaPress(item.id)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSubText}>⭐ {item.rating.toFixed(1)}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            )}
          </View>

          {/* Spa gần bạn */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {locationPermissionStatus === 'granted' ? `Spa gần bạn (${nearbySpas.length})` : 'Spa gần bạn'}
              </Text>
              <TouchableOpacity onPress={handleViewAllNearby}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {isNearbyLoading ? (
              <FlatList
                data={[1, 2, 3, 4]}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={() => <SkeletonCard />}
                keyExtractor={(item) => `skeleton-${item}`}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            ) : nearbySpas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có spa gần bạn</Text>
              </View>
            ) : (
              <FlatList
                data={nearbySpas}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.itemCard}
                    onPress={() => handleSpaPress(item.id)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSubText}>📍 {item.displayDistance}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 15 }}
              />
            )}
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const LinearGradientStyle = (props) => (
  <LinearGradient
    colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sliderSection: {
    height: 250,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  overlaidSearchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 42,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notificationButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 10,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingTop: 250,
    paddingBottom: 20,
  },
  whiteContent: {
    backgroundColor: '#fff',
    flexGrow: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  categoryContainer: {
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginLeft: 8,
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
    height: 180,
    overflow: 'hidden',
    paddingBottom: 10,
    elevation: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.025,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 4,
  },
  itemSubText: {
    fontSize: 12,
    color: '#777',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});

export default HomeScreen;