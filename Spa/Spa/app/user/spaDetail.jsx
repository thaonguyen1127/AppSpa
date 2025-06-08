import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { styles } from '../../src/styles/SpaDetailStyles';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'overview', title: 'Tổng quan', icon: 'information-circle' },
  { id: 'reviews', title: 'Đánh giá', icon: 'star' },
  { id: 'location', title: 'Vị trí', icon: 'location' },
];

const regionCache = new Map();

export default function SpaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [spa, setSpa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef(null);

  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const formatTime = (isoTime) => {
    if (!isoTime || isoTime === 'N/A') return 'N/A';
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (err) {
      console.warn('Lỗi định dạng thời gian:', err);
      return 'N/A';
    }
  };

  const loadSpaData = useCallback(async () => {
    if (!id) {
      setError('ID spa không hợp lệ');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Bắt đầu lấy dữ liệu spa với ID:', id);
      const spaDocRef = doc(db, 'spas', id);
      const spaDoc = await getDoc(spaDocRef);
      if (!spaDoc.exists()) {
        console.warn('Không tìm thấy spa với ID:', id);
        setError('Không tìm thấy spa!');
        return;
      }

      const spaData = { id: spaDoc.id, ...spaDoc.data() };
      // console.log('Dữ liệu spa:', spaData);

      spaData.images = Array.isArray(spaData.images) && spaData.images.length > 0
        ? spaData.images
        : ['https://via.placeholder.com/300'];
      spaData.coordinates = spaData.coordinates || { lat: 0, lon: 0 };
      spaData.address = spaData.address || 'Không có thông tin địa chỉ';
      spaData.phone = spaData.phone || 'N/A';
      spaData.openTime = formatTime(spaData.openTime);
      spaData.closeTime = formatTime(spaData.closeTime);
      spaData.description = spaData.description || 'Không có mô tả';
      spaData.services = spaData.services || {};
      spaData.rating = parseFloat(spaData.rating) || 0;
      spaData.reviewCount = parseInt(spaData.reviewCount) || 0;

      setSpa(spaData);

      if (userId) {
        const favoriteQuery = query(
          collection(db, 'favorites'),
          where('spaId', '==', id),
          where('userId', '==', userId)
        );
        const favoriteSnapshot = await getDocs(favoriteQuery);
        setIsFavorite(!favoriteSnapshot.empty);
        console.log('Trạng thái yêu thích:', !favoriteSnapshot.empty);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu spa:', err);
      setError('Lỗi khi tải dữ liệu spa: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, db, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để thêm spa vào danh sách yêu thích.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/login') },
      ]);
      return;
    }

    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${id}`);
      if (isFavorite) {
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        console.log('Đã xóa spa khỏi danh sách yêu thích');
      } else {
        await setDoc(favoriteRef, {
          userId,
          spaId: id,
          createdAt: new Date().toISOString(),
        });
        setIsFavorite(true);
        console.log('Đã thêm spa vào danh sách yêu thích');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái yêu thích:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích.');
    }
  };

  const initializeMapRegion = useCallback(() => {
    if (!spa || !spa.coordinates || !spa.coordinates.lat || !spa.coordinates.lon) {
      console.warn('Tọa độ spa không hợp lệ:', spa?.coordinates);
      return;
    }

    const lat = Number(spa.coordinates.lat);
    const lon = Number(spa.coordinates.lon);

    if (isNaN(lat) || isNaN(lon)) {
      console.warn('Tọa độ không hợp lệ:', spa.coordinates);
      return;
    }

    if (!regionCache.has(id)) {
      regionCache.set(id, {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      console.log('Đã khởi tạo vùng bản đồ:', regionCache.get(id));
    }
  }, [spa, id]);

  useEffect(() => {
    loadSpaData();
  }, [loadSpaData]);

  useEffect(() => {
    if (spa) {
      initializeMapRegion();
    }
  }, [spa, initializeMapRegion]);

  useEffect(() => {
    if (!spa || !spa.images || spa.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % spa.images.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [spa]);

  const handleImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const openGoogleMaps = () => {
    if (!spa?.coordinates || !spa.coordinates.lat || !spa.coordinates.lon) {
      Alert.alert('Lỗi', 'Không có thông tin vị trí để mở Google Maps.');
      return;
    }
    const { lat, lon } = spa.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở Google Maps'));
  };

  const callPhone = () => {
    if (!spa?.phone || spa.phone === 'N/A') {
      Alert.alert('Lỗi', 'Không có số điện thoại để liên hệ.');
      return;
    }
    Linking.openURL(`tel:${spa.phone}`).catch(() => Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi'));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color={Colors.yellow}
      />
    ));
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setFullImageVisible(true);
  };

  const SkeletonLoader = () => (
    <SafeAreaView style={styles.container}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.skeletonImage}
        shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
      />
      <View style={styles.spaInfo}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.skeletonTitle}
          shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.skeletonRating}
          shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
        />
      </View>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <ShimmerPlaceholder
            key={tab.id}
            LinearGradient={LinearGradient}
            style={styles.skeletonTab}
            shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
          />
        ))}
      </View>
    </SafeAreaView>
  );

  const renderOverviewTab = () => {
    const activeServices = Object.entries(spa.services)
      .filter(([_, isActive]) => isActive)
      .map(([service]) => service);

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={20} color={Colors.pink} /> Thông tin
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={Colors.pink} />
              <Text style={styles.infoText}>{spa.address}</Text>
            </View>
            <TouchableOpacity style={styles.infoRow} onPress={callPhone}>
              <Ionicons name="call" size={20} color={Colors.pink} />
              <Text style={styles.infoText}>{spa.phone}</Text>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={Colors.pink} />
              <Text style={styles.infoText}>{`${spa.openTime} - ${spa.closeTime}`}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Đang mở</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text" size={20} color={Colors.lightBlue} /> Giới thiệu
          </Text>
          <Text style={styles.description}>{spa.description}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="sparkles" size={20} color={Colors.pink} /> Dịch vụ
          </Text>
          <View style={styles.servicesContainer}>
            {activeServices.length > 0 ? (
              activeServices.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noServicesText}>Không có dịch vụ nào</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.ratingSummary}>
          <View style={styles.starsContainer}>{renderStars(spa.rating)}</View>
          <Text style={styles.ratingNumber}>{spa.rating ? `${spa.rating.toFixed(1)}/5` : 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  const renderLocationTab = () => {
    if (!spa?.coordinates?.lat || !spa?.coordinates?.lon) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.errorText}>Không có thông tin vị trí</Text>
        </View>
      );
    }

    const region = regionCache.get(id) || {
      latitude: Number(spa.coordinates.lat),
      longitude: Number(spa.coordinates.lon),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location" size={20} color={Colors.pink} /> Vị trí
          </Text>
          <Text style={styles.addressText}>{spa.address}</Text>
          <TouchableOpacity style={styles.mapContainer} onPress={() => setMapModalVisible(true)}>
            <MapView
              style={styles.map}
              initialRegion={region}
              region={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                title={spa.name}
                description={spa.address}
              />
            </MapView>
          </TouchableOpacity>
          <View style={styles.mapActions}>
            <TouchableOpacity style={styles.actionButton} onPress={openGoogleMaps}>
              <Ionicons name="navigate" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Chỉ đường</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={callPhone}>
              <Ionicons name="call" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Gọi điện</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) return <SkeletonLoader />;

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/login')}>
            <Text style={styles.actionButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!spa) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy spa!</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? Colors.red : Colors.white}
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {spa.images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => handleImagePress(image)}>
                <Image source={{ uri: image }} style={styles.carouselImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.carouselIndicators}>
            {spa.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index ? styles.activeIndicator : null,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.spaInfo}>
          <Text style={styles.spaName}>{spa.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>{renderStars(Math.floor(spa.rating || 0))}</View>
            <Text style={styles.ratingText}>{spa.rating ? `${spa.rating.toFixed(1)}/5` : 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id ? styles.activeTab : null]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? Colors.pink : Colors.gray}
              />
              <Text style={[styles.tabText, activeTab === tab.id ? styles.activeTabText : null]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'location' && renderLocationTab()}
      </ScrollView>

      <Modal
        visible={fullImageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullImageVisible(false)}
      >
        <View style={styles.fullImageModal}>
          <TouchableOpacity
            style={styles.closeImageButton}
            onPress={() => setFullImageVisible(false)}
          >
            <Ionicons name="close" size={30} color={Colors.white} />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} />}
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {spa.coordinates?.lat && spa.coordinates?.lon ? (
            <MapView
              style={styles.fullMap}
              initialRegion={regionCache.get(id) || {
                latitude: Number(spa.coordinates.lat),
                longitude: Number(spa.coordinates.lon),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: Number(spa.coordinates.lat),
                  longitude: Number(spa.coordinates.lon),
                }}
                title={spa.name}
                description={spa.address}
              />
            </MapView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không có thông tin vị trí</Text>
            </View>
          )}
          <View style={styles.mapButtonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.actionButtonText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={openGoogleMaps}>
              <Text style={styles.actionButtonText}>Chỉ đường</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            console.log('spa.id:', spa.id);
            if (!spa?.id) {
              alert('Lỗi: ID spa không hợp lệ');
              return;
            }
            router.push({
              pathname: '/user/booking',
              params: { id: spa.id }
            });
          }}
        >
          <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}