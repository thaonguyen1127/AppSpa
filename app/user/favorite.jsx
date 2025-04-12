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
];

const FavoriteScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSpaPress = (spa) => {
    navigation.navigate('screen/spaDetail', { spa });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      <LinearGradient
        colors={[Colors.pink, `${Colors.pink}80`, '#fff']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spa yêu thích</Text>
        </View>

        <ScrollView style={styles.scrollView}>
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
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 2,
    height: 50,
    marginTop: StatusBar.currentHeight || 0,
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
    paddingHorizontal: 10,
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