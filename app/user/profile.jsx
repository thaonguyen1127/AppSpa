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
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <LinearGradient
        colors={[Colors.pink, `${Colors.pink}80`, '#fff']}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Nội dung */}
        <ScrollView style={styles.scrollView}>
          <View style={styles.profileCard}>
            {/* Avatar + Tên */}
            <View style={styles.userInfo}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              <Text style={styles.name}>{profile.fullName}</Text>
            </View>

            {/* Form */}
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
                <Text style={styles.buttonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e91e63',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 14,
    color: '#000',
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
  editButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});