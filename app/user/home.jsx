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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Dữ liệu cứng với ảnh slider gốc và URL placeholder cho các mục khác
const sliders = [
  {
    id: '1',
    image: require('../../assets/images/spa3.jpg'), // Đường dẫn gốc
    title: 'Spa Thư Giãn Sang Trọng',
    subtitle: 'Trải nghiệm dịch vụ massage cao cấp',
  },
  {
    id: '2',
    image: require('../../assets/images/slider1.jpg'), // Đường dẫn gốc
    title: 'Nail Nghệ Thuật Độc Đáo',
    subtitle: 'Thiết kế móng tay theo phong cách riêng',
  },
  {
    id: '3',
    image: require('../../assets/images/slider2.jpg'), // Đường dẫn gốc
    title: 'Tóc Thời Thượng',
    subtitle: 'Cắt và tạo kiểu tóc hiện đại',
  },
];

const categories = [
  { id: '1', name: 'Spa', icon: 'heart' },
  { id: '2', name: 'Nail', icon: 'brush' },
  { id: '3', name: 'Thẩm mỹ', icon: 'sparkles' },
  { id: '4', name: 'Tóc', icon: 'cut' },
];

const topRatedSpas = [
  {
    id: '1',
    name: 'Lavender Spa',
    rating: 4.9,
    image: 'https://picsum.photos/300/200?random=1', // Ảnh placeholder
  },
  {
    id: '2',
    name: 'Golden Nail Salon',
    rating: 4.7,
    image: 'https://picsum.photos/300/200?random=3',
  },
  {
    id: '3',
    name: 'Elite Beauty',
    rating: 4.8,
    image: 'https://picsum.photos/300/200?random=3',
  },
];

const nearbySpas = [
  {
    id: '1',
    name: 'Serenity Spa',
    distance: '1.2km',
    image: 'https://picsum.photos/300/200?random=4',
  },
  {
    id: '2',
    name: 'Bliss Nail',
    distance: '2.5km',
    image: 'https://picsum.photos/300/200?random=5',
  },
  {
    id: '3',
    name: 'Harmony Hair',
    distance: '3.0km',
    image: 'https://picsum.photos/300/200?random=6',
  },
];

const promotions = [
  {
    id: '1',
    title: 'Massage Toàn Thân Giảm 20%',
    discount: '20%',
    image: 'https://picsum.photos/300/200?random=7',
  },
  {
    id: '2',
    title: 'Combo Spa & Nail 50% Off',
    discount: '50%',
    image: 'https://picsum.photos/300/200?random=8',
  },
  {
    id: '3',
    title: 'Tóc Cắt + Nhuộm 30% Off',
    discount: '30%',
    image: 'https://picsum.photos/300/200?random=9',
  },
];

const HomeScreen = () => {
  const router = useRouter();

  const handleViewAllTopRated = () => {
    router.push('/user/topRatedSpas');
  };

  const handleViewAllNearby = () => {
    router.push('/user/nearbySpas');
  };

  const handleViewAllPromotions = () => {
    router.push('/user/promotions');
  };

  const handleSearchPress = () => {
    router.push('/user/searchScreen');
  };

  const handleCategoryPress = (category) => {
    router.push(`/user/category/${category.id}`);
  };

  const handleItemPress = (item, type) => {
    router.push(`/user/${type}/${item.id}`);
  };

  const HEADER_HEIGHT = 50;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.pink}
        barStyle="light-content"
        translucent={false}
      />
      <View style={styles.headerContainer}>
        <View style={[styles.header, { height: HEADER_HEIGHT, backgroundColor: Colors.pink }]}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm spa, nail, tóc..."
              placeholderTextColor="#999"
              onFocus={handleSearchPress}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingTop: HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
      >
        {/* Phần Slider */}
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
                  <Image source={slide.image} style={styles.slideImage} resizeMode="cover" />
                  <View style={styles.slideOverlay}>
                    <Text style={styles.slideText}>{slide.title}</Text>
                    <Text style={styles.slideSubText}>{slide.subtitle}</Text>
                  </View>
                </View>
              ))}
            </Swiper>
          </View>
        </View>

        <View style={styles.whiteContent}>
          {/* Phần Danh mục */}
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

          {/* Phần Spa được đánh giá cao */}
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
                <TouchableOpacity
                  style={styles.itemCard}
                  onPress={() => handleItemPress(item, 'topRated')}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                    onError={() => console.log(`Failed to load image: ${item.image}`)}
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
          </View>

          {/* Phần Spa gần bạn */}
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
                <TouchableOpacity
                  style={styles.itemCard}
                  onPress={() => handleItemPress(item, 'nearby')}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                    onError={() => console.log(`Failed to load image: ${item.image}`)}
                  />
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

          {/* Phần Ưu đãi */}
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
                <TouchableOpacity
                  style={styles.itemCardPromotion}
                  onPress={() => handleItemPress(item, 'promotion')}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.promotionImage}
                    resizeMode="cover"
                    onError={() => console.log(`Failed to load image: ${item.image}`)}
                  />
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
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    height: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sliderWrapper: {
    backgroundColor: Colors.pink,
  },
  sliderContainer: {
    height: 220,
    marginTop: 0,
    width: '100%',
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  slideText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  slideSubText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
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
    flexGrow: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
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
    overflow: 'hidden',
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  promotionImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
});

export default HomeScreen;