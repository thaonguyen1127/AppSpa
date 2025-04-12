import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';

// Component SignUpScreen
const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleSignUp = () => {
    // Xử lý logic đăng ký (gọi API, validate, v.v.)
    console.log('Đăng ký:', { fullName, email, password, confirmPassword });
    if (password === confirmPassword) {
      // Ví dụ: Sau khi đăng ký thành công, chuyển về Login
      navigation.navigate('Login');
    } else {
      console.log('Mật khẩu không khớp');
    }
  };

  const handleLoginRedirect = () => {
    // Điều hướng về màn Login
    navigation.navigate('auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
      <LinearGradient
        colors={[Colors.pink, `${Colors.pink}80`, '#fff']} // Gradient từ hồng đậm đến trắng
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >

          {/* Tiêu đề */}
          <Text style={styles.title}>Đăng Ký</Text>

          {/* Input Họ tên */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Họ tên"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Input Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Input Mật khẩu */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Input Xác nhận mật khẩu */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Nút Đăng ký */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Đăng Ký</Text>
          </TouchableOpacity>

          {/* Liên kết Đăng nhập */}
          <TouchableOpacity onPress={handleLoginRedirect}>
            <Text style={styles.loginText}>
              Bạn đã có tài khoản chưa? <Text style={styles.loginLink}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
    paddingTop: StatusBar.currentHeight || 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  signUpButton: {
    backgroundColor: Colors.darkPink,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    color: Colors.darkPink,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;