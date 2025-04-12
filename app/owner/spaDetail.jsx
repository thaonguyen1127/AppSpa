
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SpaDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { spa } = route.params;
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef(null);

  const spaData = {
    ...spa,
    images: [
      'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    phone: '0123 456 789',
    openingHours: '9:00 - 21:00',
    description:
      'Chào mừng bạn đến với spa của sự thư giãn! Chúng tôi cung cấp các dịch vụ massage, chăm sóc da mặt và gội đầu dưỡng sinh với đội ngũ chuyên nghiệp, không gian ấm cúng.',
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const nextSlide = (prev + 1) % spaData.images.length;
        flatListRef.current?.scrollToIndex({
          index: nextSlide,
          animated: true,
        });
        return nextSlide;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [spaData.images.length]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log(`Spa ${spa.name} ${isFavorite ? 'bỏ yêu thích' : 'thêm yêu thích'}`);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      console.log('Bình luận:', comment);
      setComment('');
    }
  };

  const renderCarouselItem = ({ item, index }) => (
    <View style={styles.carouselItem}>
      {isLoading && (
        <ActivityIndicator size="large" color={Colors.pink} style={styles.loader} />
      )}
      <Image
        key={`carousel-image-${index}`}
        source={{ uri: item }}
        style={styles.spaImage}
        resizeMode="cover"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.log(`Failed to load image ${item}:`, e.nativeEvent.error);
          setIsLoading(false);
        }}
        defaultSource={{ uri: 'https://via.placeholder.com/800x400/CCCCCC/FFFFFF?text=Spa' }}
      />
    </View>
  );

  const handleScroll = (event) => {
    const slideWidth = width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveSlide(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            data={spaData.images}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `carousel-${index}`}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            style={styles.carousel}
          />
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.spaHeader}>
          <Image
            source={{ uri: spa.avatar }}
            style={styles.spaAvatar}
            defaultSource={{ uri: 'https://via.placeholder.com/50/CCCCCC/FFFFFF?text=Spa' }}
            onError={() => console.log(`Failed to load avatar for ${spa.name}`)}
          />
          <View style={styles.spaNameContainer}>
            <Text style={styles.spaName}>{spa.name}</Text>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? Colors.pink : '#666'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="location" size={20} color={Colors.pink} />
            <Text style={styles.infoText}>Địa chỉ: {spaData.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="call" size={20} color={Colors.pink} />
            <Text style={styles.infoText}>Số điện thoại: {spaData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.infoText}>Đánh giá: {spa.rating}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="time" size={20} color={Colors.pink} />
            <Text style={styles.infoText}>Giờ mở cửa: {spaData.openingHours}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.descriptionText}>{spaData.description}</Text>
        </View>

        <View style={styles.commentContainer}>
          <Text style={styles.sectionTitle}>Bình luận</Text>
          <View style={styles.commentInputContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40/CCCCCC/FFFFFF?text=User' }}
              style={styles.userAvatar}
            />
            <TextInput
              style={styles.commentInput}
              placeholder="Viết bình luận của bạn..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity onPress={handleSendComment} style={styles.favoriteButton}>
              <Icon name="send" size={24} color={Colors.pink} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sliderContainer: {
    height: width * 0.6,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    elevation: 5,
    backgroundColor: '#fff',
    overflow: 'visible', 
    borderRadius: 0, 
  },
  
  carouselItem: {
    width: width,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    borderRadius: 0, 
  },
  
  spaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 0, 
  },
  
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
  },
  spaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  spaAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  spaNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spaName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  favoriteButton: {
    padding: 5,
  },
  infoContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
  },
});

export default SpaDetailScreen;