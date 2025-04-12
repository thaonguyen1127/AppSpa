import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
          // Clear token hoặc AsyncStorage nếu có
          router.replace('/login'); // Điều hướng về màn login
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#e91e63" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

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
          <Text style={styles.editButtonText}>
            {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e91e63',
    marginRight: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  form: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e91e63',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#777',
  },
  editButton: {
    backgroundColor: '#e91e63',
    padding: 12,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#fff0f4',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  logoutText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
