import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Colors } from '@/constants/Colors';
import { auth, db } from '../../src/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

// Cấu hình Google Sign-In
// GoogleSignin.configure({
//   webClientId: '972461785953-alpsf6rq1q50p64qj0lfssl0f4tkphsv.apps.googleusercontent.com', // Thay bằng webClientId từ Google Cloud Console
//   offlineAccess: true,
// });

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Tải thông tin đăng nhập đã lưu khi khởi động
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        if (savedEmail && savedPassword && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin đăng nhập:', error);
      }
    };
    loadSavedCredentials();
  }, []);

  // Lưu thông tin đăng nhập
  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
        await AsyncStorage.setItem('rememberMe', 'false');
      }
    } catch (error) {
      console.error('Lỗi khi lưu thông tin đăng nhập:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu thông tin nếu chọn "Lưu mật khẩu"
      await saveCredentials();

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.data();
      const role = userData.role;

      switch (role) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'owner':
          router.replace('/owner/dashboard');
          break;
        case 'user':
          router.replace('/user/home');
          break;
        default:
          router.replace('/user/home');
          break;
      }

      Alert.alert('Thành công', `Đăng nhập thành công với vai trò: ${role}`);
    } catch (error) {
      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Tài khoản không tồn tại';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử, vui lòng thử lại sau';
          break;
        default:
          errorMessage = error.message || errorMessage;
          break;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Đăng xuất Google trước để tránh lỗi token cũ
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;

      // Xác thực với Firebase
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      // Kiểm tra thông tin người dùng trong Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let role = 'user'; // Mặc định là user
      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role || 'user';
      } else {
        // Nếu người dùng chưa có trong Firestore, tạo mới
        await setDoc(userDocRef, {
          uid: user.uid,
          fullName: user.displayName || '',
          email: user.email,
          role: 'user',
          createdAt: new Date(),
        });
      }

      // Chuyển hướng theo vai trò
      switch (role) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'owner':
          router.replace('/owner/dashboard');
          break;
        case 'user':
          router.replace('/user/home');
          break;
        default:
          router.replace('/user/home');
          break;
      }

      Alert.alert('Thành công', `Đăng nhập Google thành công với vai trò: ${role}`);
    } catch (error) {
      let errorMessage = 'Đăng nhập Google thất bại';
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Đăng nhập bị hủy';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Đăng nhập đang được xử lý';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Dịch vụ Google Play không khả dụng';
      } else {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email để đặt lại mật khẩu');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Thành công', 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      let errorMessage = 'Gửi email đặt lại mật khẩu thất bại';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email này';
          break;
        default:
          errorMessage = error.message || errorMessage;
          break;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.lightPink}
        barStyle="dark-content"
        translucent={true}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Đăng Nhập</Text>

            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color={Colors.gray} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color={Colors.gray} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={Colors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Icon
                  name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={Colors.pink}
                />
                <Text style={styles.checkboxText}>Lưu mật khẩu</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordLink}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Đăng Nhập</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Hoặc</Text>

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
            >
              <FontAwesome name="google" size={20} color={Colors.white} />
              <Text style={styles.socialButtonText}>Đăng nhập bằng Google</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightPink,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.black,
  },
  eyeIcon: {
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 5,
    fontSize: 14,
    color: Colors.black,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.darkPink,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 15,
  },
  socialButton: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: '#3b5998',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: '#db4437',
  },
  socialButtonText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: Colors.black,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.darkPink,
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    fontSize: 14,
    color: Colors.darkPink,
    fontWeight: 'bold',
  },
});

LoginScreen.options = {
  headerShown: false,
};

export default LoginScreen;