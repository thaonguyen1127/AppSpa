import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    username: 'nguyenvana',
    email: 'vana@example.com',
    address: '123 Đường Hoa Hồng, Quận 1, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=3',
  });
  const HEADER_HEIGHT = 50;

  const handleEdit = () => setIsEditing(!isEditing);
  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleLogout = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: () => {
          router.replace('auth/login');
        },
      },
    ]);
  };

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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.userInfo}>
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              defaultSource={{ uri: 'https://via.placeholder.com/80/CCCCCC/FFFFFF?text=User' }}
              onError={() => console.log('Failed to load avatar')}
            />
            <Text style={styles.name}>{profile.fullName}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              editable={isEditing}
              keyboardType="email-address"
              value={profile.email}
              onChangeText={(text) => handleChange('email', text)}
            />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              editable={isEditing}
              keyboardType="phone-pad"
              value={profile.phone}
              onChangeText={(text) => handleChange('phone', text)}
            />

            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              editable={isEditing}
              value={profile.username}
              onChangeText={(text) => handleChange('username', text)}
            />

            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              editable={isEditing}
              value={profile.address}
              onChangeText={(text) => handleChange('address', text)}
            />

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.buttonText}>
                {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: StatusBar.currentHeight || 0,
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
    paddingHorizontal: 15,
    paddingTop: 80, // Đủ để nội dung không bị header che
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  form: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.pink,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  disabledInput: {
    backgroundColor: 'rgba(249, 249, 249, 0.9)',
    color: '#666',
  },
  editButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.pink,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButtonText: {
    color: Colors.pink,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;