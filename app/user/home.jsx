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
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const HomeScreen = () => {
  const router = useRouter();

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

  const handleSearchPress = () => {
    router.push('/user/searchScreen');
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
        <View
          style={[styles.header, { height: HEADER_HEIGHT, backgroundColor: Colors.pink }]}
        >
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm spa, nail..."
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
        <View style={[styles.sliderWrapper, { backgroundColor: Colors.pink }]}>
          <View style={styles.sliderContainer}>
            <Swiper
              style={styles.wrapper}
              showsButtons={false}
              autoplay
              loop
              autoplayTimeout={4} // Sửa lỗi: đổi từ =4 thành ={4}
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
                  </View>
                </View>
              ))}
            </Swiper>
          </View>
        </View>

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
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink, // Đồng bộ với StatusBar và header
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
    height: 40, // Chiều cao cố định
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
    backgroundColor: '#fff', // Nội dung chính màu trắng
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sliderWrapper: {
    backgroundColor: Colors.pink,
  },
  sliderContainer: {
    height: 200,
    marginTop: 0,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    flexGrow: 1,
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
});

export default HomeScreen;