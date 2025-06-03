import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

// Color configuration
const Colors = {
  pink: '#FF1493',
  lightPink: '#FFE4E1',
  backgroundPink: '#FFF0F5',
  gray: '#999',
  lightGray: '#f8f9fa',
  white: '#ffffff',
  black: '#333',
};

// Static list of Hanoi districts
const hanoiDistricts = [
  { id: '1', name: 'Ba Đình', district: 'Hà Nội' },
  { id: '2', name: 'Hoàn Kiếm', district: 'Hà Nội' },
  { id: '3', name: 'Hai Bà Trưng', district: 'Hà Nội' },
  { id: '4', name: 'Đống Đa', district: 'Hà Nội' },
  { id: '5', name: 'Cầu Giấy', district: 'Hà Nội' },
  { id: '6', name: 'Tây Hồ', district: 'Hà Nội' },
  { id: '7', name: 'Thanh Xuân', district: 'Hà Nội' },
  { id: '8', name: 'Hoàng Mai', district: 'Hà Nội' },
  { id: '9', name: 'Long Biên', district: 'Hà Nội' },
  { id: '10', name: 'Bắc Từ Liêm', district: 'Hà Nội' },
  { id: '11', name: 'Nam Từ Liêm', district: 'Hà Nội' },
  { id: '12', name: 'Hà Đông', district: 'Hà Nội' },
];

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2 || lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
    return { value: Infinity, unit: 'km', display: 'N/A', meters: Infinity };
  }
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMeters = distanceKm * 1000;
  if (distanceKm < 1) {
    const distanceM = Math.round(distanceMeters);
    return { value: distanceM, unit: 'm', display: `${distanceM} m`, meters: distanceM };
  }
  const distanceKmRounded = parseFloat(distanceKm.toFixed(1));
  return { value: distanceKmRounded, unit: 'km', display: `${distanceKmRounded} km`, meters: distanceMeters };
};

// Get current location
const getCurrentLocation = async () => {
  try {
    const locationData = await Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.Highest,
      maximumAge: 10000,
      timeout: 15000,
    });
    return locationData.coords;
  } catch (error) {
    return null;
  }
};

// Check location permission
const checkLocationPermission = async (setLocationPermissionStatus, setUserLocation) => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    setLocationPermissionStatus(status);
    if (status === 'granted') {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
      } else {
        setUserLocation(null);
        Alert.alert('Lỗi', 'Không thể lấy vị trí. Vui lòng thử lại.');
      }
    } else if (status === 'denied' && canAskAgain) {
      Alert.alert(
        'Cần quyền truy cập vị trí',
        'Bạn cần cấp quyền để xem các spa gần nhất.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thử lại', onPress: () => checkLocationPermission(setLocationPermissionStatus, setUserLocation) },
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
    setUserLocation(null);
    Alert.alert('Lỗi', 'Không thể kiểm tra quyền vị trí. Vui lòng thử lại.');
  }
};

// Search service
const searchService = async (query, districtQuery, filter, userLocation, spas, reviews) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = spas.filter((spa) => {
        const queryLower = query.toLowerCase();
        const matchesName = spa.name && spa.name.toLowerCase().includes(queryLower);
        const matchesService = spa.services && typeof spa.services === 'object'
          ? Object.keys(spa.services).some(
              (service) => service.toLowerCase().includes(queryLower) && spa.services[service] === true
            )
          : false;
        const matchesDistrict = districtQuery
          ? spa.district && spa.district.toLowerCase().includes(districtQuery.toLowerCase())
          : true;
        return (matchesName || matchesService) && matchesDistrict;
      });

      // Calculate avgRating for each spa
      results = results.map((spa) => {
        const spaReviews = reviews.filter((r) => r.spaId === spa.id);
        const avgRating = spaReviews.length > 0
          ? spaReviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) / spaReviews.length
          : 0;
        return { ...spa, avgRating };
      });

      if (filter === 'rated') {
        results = results.sort((a, b) => {
          const ratingDiff = b.avgRating - a.avgRating;
          if (ratingDiff !== 0) return ratingDiff;
          return a.name.localeCompare(b.name);
        });
      } else if (filter === 'nearest' && userLocation) {
        results = results.sort((a, b) => {
          const aDistance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.coordinates?.lat,
            a.coordinates?.lon
          );
          const bDistance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.coordinates?.lat,
            b.coordinates?.lon
          );
          return aDistance.meters - bDistance.meters;
        });
      }

      const formattedResults = results.slice(0, 10).map((spa) => {
        const distance = userLocation && spa.coordinates && spa.coordinates.lat && spa.coordinates.lon
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              spa.coordinates.lat,
              spa.coordinates.lon
            )
          : { value: Infinity, unit: 'km', display: 'N/A', meters: Infinity };
        const servicesList = spa.services && typeof spa.services === 'object'
          ? Object.keys(spa.services).filter((key) => spa.services[key] === true)
          : [];
        return {
          id: spa.id,
          name: spa.name || 'Spa Không Tên',
          address: spa.address || spa.district || 'Không có địa chỉ',
          distance: distance.display,
          meters: distance.meters,
          avgRating: spa.avgRating.toFixed(1),
          services: servicesList,
          image: Array.isArray(spa.images) && spa.images.length > 0
            ? spa.images[0]
            : 'https://picsum.photos/300/200?random=' + spa.id,
        };
      });
      resolve(formattedResults.length > 0 ? formattedResults : ['Không tìm thấy kết quả']);
    }, 600);
  });
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default function SearchHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('nearest');
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('undetermined');
  const [userLocation, setUserLocation] = useState(null);
  const [spas, setSpas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const searchInputRef = useRef(null);
  const districtInputRef = useRef(null);

  // Reset state when screen is focused
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
      setDistrictQuery('');
      setSearchResults([]);
      setShowLocationDropdown(false);
    }, [])
  );

  // Fetch data and check location permission on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        // Check location permission
        await checkLocationPermission(setLocationPermissionStatus, setUserLocation);

        // Fetch spas from Firebase
        const spasSnapshot = await getDocs(collection(db, 'spas'));
        if (spasSnapshot.empty) {
          setSpas([]);
        } else {
          const spasData = spasSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Spa Không Tên',
              district: data.district || 'Hà Nội',
              address: data.address,
              coordinates: {
                lat: typeof data.coordinates?.lat === 'number' ? data.coordinates.lat : null,
                lon: typeof data.coordinates?.lon === 'number' ? data.coordinates.lon : null,
              },
              services: data.services || {},
              images: data.images || [],
            };
          });
          setSpas(spasData);
        }

        // Fetch reviews from Firebase
        const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
        if (reviewsSnapshot.empty) {
          setReviews([]);
        } else {
          const reviewsData = reviewsSnapshot.docs.map((doc) => {
            const data = doc.data();
            let spaId = data.spaId;
            if (typeof spaId === 'string' && spaId.includes('/')) {
              spaId = spaId.split('/').pop();
            } else if (spaId?.id) {
              spaId = spaId.id;
            }
            return {
              id: doc.id,
              spaId: spaId ? spaId.trim() : null,
              rating: data.rating,
            };
          });
          setReviews(reviewsData);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu. Vui lòng kiểm tra kết nối và thử lại.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Handle search
  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchResults(['Vui lòng nhập tên spa hoặc dịch vụ để tìm kiếm']);
      return;
    }
    if (activeFilter === 'nearest' && locationPermissionStatus !== 'granted') {
      Alert.alert(
        'Quyền truy cập vị trí',
        'Cần quyền truy cập vị trí để tìm spa gần nhất. Vui lòng cấp quyền trong cài đặt.'
      );
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchService(
        trimmedQuery,
        districtQuery,
        activeFilter,
        userLocation,
        spas,
        reviews
      );
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      setSearchResults(['Đã có lỗi xảy ra khi tìm kiếm']);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, districtQuery, activeFilter, locationPermissionStatus, userLocation, spas, reviews]);

  // Debounced search
  const debouncedSearch = useCallback(debounce(handleSearch, 500), [handleSearch]);

  // Auto-trigger search when activeFilter changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch();
    }
  }, [activeFilter, debouncedSearch, searchQuery]);

  // Handle location selection from dropdown
  const handleLocationSelect = useCallback((location) => {
    Keyboard.dismiss();
    if (districtInputRef.current) {
      districtInputRef.current.blur();
    }
    setDistrictQuery(location.name);
    setShowLocationDropdown(false);
    if (searchQuery.trim()) {
      debouncedSearch();
    }
  }, [debouncedSearch, searchQuery]);

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setShowLocationDropdown((prev) => !prev);
  }, []);

  // Render dropdown item
  const renderLocationItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.locationDropdownItem}
        onPress={() => handleLocationSelect(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={16} color={Colors.pink} />
        <Text style={styles.locationDropdownText}>{item.name}</Text>
        <Text style={styles.locationDropdownDistrict}>{item.district}</Text>
      </TouchableOpacity>
    ),
    [handleLocationSelect]
  );

  const filteredDistricts = hanoiDistricts.filter((item) =>
    item.name.toLowerCase().includes(districtQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.searchSectionBackground}>
        <View style={styles.searchSection}>
          {/* Search input row */}
          <View style={styles.inputRow}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="search" size={20} color={Colors.pink} />
                </View>
              </View>
              <View style={styles.dottedLineContainer}>
                <View style={styles.dottedLine}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Nhập tên Spa, dịch vụ... (*)"
                  placeholderTextColor={Colors.gray}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    debouncedSearch();
                  }}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                {searchQuery ? (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {/* Location input and dropdown row */}
          <View style={styles.locationRow}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={20} color={Colors.pink} />
                </View>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.locationAndButtonRow}>
                <TouchableOpacity
                  style={styles.locationInputContainer}
                  onPress={toggleDropdown}
                  activeOpacity={1}
                >
                  <TextInput
                    ref={districtInputRef}
                    style={styles.locationText}
                    placeholder="Chọn khu vực"
                    placeholderTextColor={Colors.gray}
                    value={districtQuery}
                    onChangeText={(text) => {
                      setDistrictQuery(text);
                      debouncedSearch();
                    }}
                    editable={true}
                    onPressIn={toggleDropdown}
                  />
                  <TouchableOpacity
                    onPress={toggleDropdown}
                    style={styles.dropdownIconContainer}
                  >
                    <Ionicons
                      name={showLocationDropdown ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={Colors.gray}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                  <Ionicons name="search" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
              {showLocationDropdown && (
                <View style={styles.dropdownContainer}>
                  <FlatList
                    data={filteredDistricts}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.dropdownList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabsContainer}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'nearest' && styles.filterTabActive]}
            onPress={() => setActiveFilter('nearest')}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color={activeFilter === 'nearest' ? Colors.pink : Colors.gray}
              style={styles.filterIcon}
            />
            <Text
              style={[styles.filterText, activeFilter === 'nearest' && styles.filterTextActive]}
            >
              Gần nhất
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'rated' && styles.filterTabActive]}
            onPress={() => setActiveFilter('rated')}
          >
            <Ionicons
              name="star-outline"
              size={18}
              color={activeFilter === 'rated' ? Colors.pink : Colors.gray}
              style={styles.filterIcon}
            />
            <Text
              style={[styles.filterText, activeFilter === 'rated' && styles.filterTextActive]}
            >
              Đánh giá cao
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading indicator or results */}
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.pink} style={styles.loading} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              {typeof item === 'string' ? (
                <Text style={[styles.resultText, { color: Colors.gray, fontStyle: 'italic' }]}>
                  {item}
                </Text>
              ) : (
                <View style={styles.resultContent}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.avatar}
                  />
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultAddress}>{item.address}</Text>
                    <View style={styles.resultInfoContainer}>
                      {/* <Ionicons name="location-outline" size={16} color={Colors.black} style={styles.resultInfoIcon} /> */}
                      <Text style={styles.resultInfo}>📍 {item.distance}</Text>
                    </View>
                    <View style={styles.resultInfoContainer}>
                      {/* <Ionicons name="star" size={16} color={Colors.pink} style={styles.resultInfoIcon} /> */}
                      <Text style={styles.resultInfo}>⭐ {item.avgRating}/5</Text>
                    </View>
                    <Text style={styles.resultServices}>
                      Dịch vụ: {item.services.length > 0 ? item.services.join(', ') : 'Không có'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
          keyExtractor={(item, index) => (typeof item === 'string' ? index.toString() : item.id)}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  searchSectionBackground: {
    backgroundColor: Colors.backgroundPink,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchSection: {
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    height: 50,
  },
  iconWrapper: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedLineContainer: {
    position: 'absolute',
    top: 45,
    height: 20,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedLine: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 15,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.gray,
    marginVertical: 1,
  },
  inputContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.black,
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationAndButtonRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  locationText: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  dropdownIconContainer: {
    padding: 5,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10000,
    paddingHorizontal: 10,
    width: '100%',
  },
  dropdownList: {
    width: '100%',
  },
  locationDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  locationDropdownText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 10,
    flex: 1,
  },
  locationDropdownDistrict: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 10,
  },
  filterTabsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  filterTabActive: {
    backgroundColor: Colors.lightPink,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.pink,
    fontWeight: '600',
  },
  loading: {
    marginTop: 20,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    backgroundColor: Colors.white,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 5,
  },
  resultAddress: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 5,
  },
  resultInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultInfoIcon: {
    marginRight: 8,
  },
  resultInfo: {
    fontSize: 14,
    color: Colors.black,
  },
  resultServices: {
    fontSize: 14,
    color: Colors.pink,
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 16,
  },
});