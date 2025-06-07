import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../src/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.trim() && !isValidEmail(text.trim())) {
      setErrorEmail('Email không hợp lệ');
    } else {
      setErrorEmail('');
    }
  };

  const handlePasswordChange = (text) => {
    if (/\s/.test(text)) return;
    setPassword(text);
    if (text && text.length < 6) {
      setErrorPassword('Mật khẩu phải có ít nhất 6 ký tự');
    } else {
      setErrorPassword('');
    }
    if (confirmPassword && text !== confirmPassword) {
      setErrorConfirmPassword('Mật khẩu xác nhận không khớp');
    } else if (confirmPassword) {
      setErrorConfirmPassword('');
    }
  };

  const handleConfirmPasswordChange = (text) => {
    if (/\s/.test(text)) return;
    setConfirmPassword(text);
    if (text && text !== password) {
      setErrorConfirmPassword('Mật khẩu xác nhận không khớp');
    } else {
      setErrorConfirmPassword('');
    }
  };

  const handleSignUp = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedFullName) {
      alert('Vui lòng nhập họ tên');
      return;
    }
    if (!trimmedEmail) {
      alert('Vui lòng nhập email');
      return;
    }
    if (!trimmedPassword) {
      alert('Vui lòng nhập mật khẩu');
      return;
    }
    if (!trimmedConfirmPassword) {
      alert('Vui lòng nhập xác nhận mật khẩu');
      return;
    }

    if (errorEmail || errorPassword || errorConfirmPassword) {
      alert('Vui lòng sửa các lỗi trước khi đăng ký');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      const role = isOwner ? 'owner' : 'user';

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: trimmedFullName,
        email: trimmedEmail,
        role,
        createdAt: new Date(),
      });

      alert('Đăng ký thành công!');
      navigation.navigate('auth/login');
    } catch (error) {
      // console.log('Lỗi đăng ký:', error.message);
      alert('Đăng ký thất bại: ' + error.message);
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate('auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
      <LinearGradient colors={[Colors.pink, `${Colors.pink}80`, '#fff']} style={styles.gradientBackground}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Chỉ dùng padding trên iOS
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Loại bỏ offset trên Android
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Text style={styles.title}>Đăng Ký</Text>

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

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errorEmail ? <Text style={styles.errorText}>{errorEmail}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errorPassword ? <Text style={styles.errorText}>{errorPassword}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errorConfirmPassword ? <Text style={styles.errorText}>{errorConfirmPassword}</Text> : null}
              </View>

              <TouchableOpacity
                style={styles.checkboxFullRow}
                onPress={() => setIsOwner(!isOwner)}
                activeOpacity={0.8}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, isOwner && styles.checkedBox]}>
                    {isOwner && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Đăng ký với vai trò chủ spa</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                  <Text style={styles.signUpButtonText}>Đăng Ký</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLoginRedirect}>
                  <Text style={styles.loginText}>
                    Bạn đã có tài khoản chưa? <Text style={styles.loginLink}>Đăng nhập</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    flex: 1, // Lấp đầy không gian, không cần absolute
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
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
  inputWrapper: {
    position: 'relative',
    width: '100%',
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
  inputWithIcon: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButton: {
    backgroundColor: Colors.darkPink,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
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
  checkboxFullRow: {
    width: '100%',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.darkPink,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default SignUpScreen;