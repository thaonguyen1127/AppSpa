import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';

// Dữ liệu mẫu cho spa yêu thích
const favoriteSpas = [
  {
    id: '1',
    name: 'Lavender Spa',
    service: 'Massage thư giãn',
    rating: 4.8,
    avatar: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '2',
    name: 'Rose Spa',
    service: 'Chăm sóc da mặt',
    rating: 4.5,
    avatar: 'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '3',
    name: 'Jasmine Spa',
    service: 'Gội đầu dưỡng sinh',
    rating: 4.7,
    avatar: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '4',
    name: 'Jasmine Spa',
    service: 'Gội đầu dưỡng sinh',
    rating: 4.7,
    avatar: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '5',
    name: 'Jasmine Spa',
    service: 'Gội đầu dưỡng sinh',
    rating: 4.7,
    avatar: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
  {
    id: '6',
    name: 'Jasmine Spa',
    service: 'Gội đầu dưỡng sinh',
    rating: 4.7,
    avatar: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=50&h=50',
  },
];

const FavoriteScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSpaPress = (spa) => {
    navigation.navigate('screen/spaDetail', { spa });
  };

  const HEADER_HEIGHT = 50;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <LinearGradient
        colors={[Colors.pink, Colors.pink, '#fff']}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <View style={[styles.header, { height: HEADER_HEIGHT }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Spa yêu thích</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {favoriteSpas.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có spa yêu thích nào</Text>
          ) : (
            favoriteSpas.map((spa) => (
              <TouchableOpacity
                key={spa.id}
                style={styles.spaCard}
                onPress={() => handleSpaPress(spa)}
              >
                <Image
                  source={{ uri: spa.avatar }}
                  style={styles.spaAvatar}
                  defaultSource={{ uri: 'https://via.placeholder.com/50/CCCCCC/FFFFFF?text=Spa' }}
                  onError={() => console.log(`Failed to load image for ${spa.name}`)}
                />
                <View style={styles.spaInfo}>
                  <Text style={styles.spaName}>{spa.name}</Text>
                  <Text style={styles.serviceText}>{spa.service}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{spa.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleSpaPress(spa)}
                >
                  <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    flex: 1,
  },
 headerContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: Colors.pink,
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
  spaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spaAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  spaInfo: {
    flex: 1,
  },
  spaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FavoriteScreen;