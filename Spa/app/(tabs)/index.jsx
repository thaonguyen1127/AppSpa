// // import React, { useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Image,
// // } from 'react-native';
// // import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon cho email, lock, eye
// // import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Icon cho FB, Google
// // import { Colors } from '@/constants/Colors';

// // const LoginScreen = () => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [rememberMe, setRememberMe] = useState(false);
// //   const [savePassword, setSavePassword] = useState(false);

// //   return (
// //     <View style={styles.container}>
// //       <Image
// //         source={require('../../assets/images/logo.png')} // Đường dẫn logo
// //         style={styles.logo}
// //       />
// //       <Text style={styles.title}>Đăng Nhập</Text>

// //       <View style={styles.inputContainer}>
// //         <Icon name="email" size={20} color={Colors.gray} style={styles.icon} />
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Email"
// //           placeholderTextColor={Colors.gray}
// //           value={email}
// //           onChangeText={setEmail}
// //           keyboardType="email-address"
// //           autoCapitalize="none"
// //         />
// //       </View>

// //       <View style={styles.inputContainer}>
// //         <Icon name="lock" size={20} color={Colors.gray} style={styles.icon} />
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Mật khẩu"
// //           placeholderTextColor={Colors.gray}
// //           value={password}
// //           onChangeText={setPassword}
// //           secureTextEntry={!showPassword}
// //         />
// //         <TouchableOpacity
// //           onPress={() => setShowPassword(!showPassword)}
// //           style={styles.eyeIcon}
// //         >
// //           <Icon
// //             name={showPassword ? 'visibility' : 'visibility-off'}
// //             size={20}
// //             color={Colors.gray}
// //           />
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.checkboxContainer}>
// //         <TouchableOpacity
// //           style={styles.checkbox}
// //           onPress={() => setRememberMe(!rememberMe)}
// //         >
// //           <Icon
// //             name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
// //             size={20}
// //             color={Colors.pink}
// //           />
// //           <Text style={styles.checkboxText}>Lưu trạng thái đăng nhập</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity>
// //           <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <TouchableOpacity style={styles.button}>
// //         <Text style={styles.buttonText}>Đăng Nhập</Text>
// //       </TouchableOpacity>

// //       <Text style={styles.orText}>Hoặc</Text>

// //       <TouchableOpacity style={styles.socialButton}>
// //         <FontAwesome name="facebook" size={20} color={Colors.white} />
// //         <Text style={styles.socialButtonText}>Đăng nhập bằng Facebook</Text>
// //       </TouchableOpacity>

// //       <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
// //         <FontAwesome name="google" size={20} color={Colors.white} />
// //         <Text style={styles.socialButtonText}>Đăng nhập bằng Google</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: Colors.lightPink,
// //     padding: 20,
// //   },
// //   logo: {
// //     width: 100,
// //     height: 100,
// //     marginBottom: 20,
// //   },
// //   title: {
// //     fontSize: 32,
// //     fontWeight: 'bold',
// //     color: Colors.black,
// //     marginBottom: 30,
// //   },
// //   inputContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     width: '100%',
// //     height: 50,
// //     backgroundColor: Colors.white,
// //     borderRadius: 10,
// //     marginBottom: 20,
// //     borderWidth: 1,
// //     borderColor: Colors.gray,
// //   },
// //   icon: {
// //     marginLeft: 10,
// //   },
// //   input: {
// //     flex: 1,
// //     height: '100%',
// //     paddingHorizontal: 10,
// //     fontSize: 16,
// //     color: Colors.black,
// //   },
// //   eyeIcon: {
// //     padding: 10,
// //   },
// //   checkboxContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '100%',
// //     marginBottom: 20,
// //   },
// //   checkbox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   checkboxText: {
// //     marginLeft: 5,
// //     fontSize: 14,
// //     color: Colors.black,
// //   },
// //   button: {
// //     width: '100%',
// //     height: 50,
// //     backgroundColor: Colors.darkPink,
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   buttonText: {
// //     color: Colors.white,
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   orText: {
// //     fontSize: 16,
// //     color: Colors.gray,
// //     marginBottom: 15,
// //   },
// //   socialButton: {
// //     flexDirection: 'row',
// //     width: '100%',
// //     height: 50,
// //     backgroundColor: '#3b5998', // Màu Facebook
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 15,
// //   },
// //   googleButton: {
// //     backgroundColor: '#db4437', // Màu Google
// //   },
// //   socialButtonText: {
// //     color: Colors.white,
// //     fontSize: 16,
// //     marginLeft: 10,
// //   },
// //   forgotPassword: {
// //     color: Colors.darkPink,
// //     fontSize: 14,
// //   },
// // });

// // export default LoginScreen;

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import { Colors } from '@/constants/Colors';
// import { auth, db } from '../../src/firebaseConfigConfig.js';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore';

// const LoginScreen = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [savePassword, setSavePassword] = useState(false);

//   const handleLogin = async () => {
//     if (!email.trim() || !password.trim()) {
//       Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu');
//       return;
//     }

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       const userDocRef = doc(db, 'users', user.uid);
//       const userDoc = await getDoc(userDocRef);
//       if (!userDoc.exists()) {
//         await setDoc(userDocRef, {
//           email: user.email,
//           name: '',
//           role: 'user',
//           createdAt: new Date().toISOString(),
//         });
//       }

//       Alert.alert('Thành công', 'Đăng nhập thành công!');
//       // Điều hướng: Cần cài react-navigation nếu muốn dùng navigation.navigate('Home');
//     } catch (error) {
//       let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';
//       switch (error.code) {
//         case 'auth/invalid-email':
//           errorMessage = 'Email không hợp lệ';
//           break;
//         case 'auth/user-not-found':
//           errorMessage = 'Tài khoản không tồn tại';
//           break;
//         case 'auth/wrong-password':
//           errorMessage = 'Mật khẩu không đúng';
//           break;
//         case 'auth/too-many-requests':
//           errorMessage = 'Quá nhiều lần thử, vui lòng thử lại sau';
//           break;
//         default:
//           errorMessage = error.message || errorMessage;
//           break;
//       }
//       Alert.alert('Lỗi', errorMessage);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../../assets/images/logo.png')}
//         style={styles.logo}
//       />
//       <Text style={styles.title}>Đăng Nhập</Text>

//       <View style={styles.inputContainer}>
//         <Icon name="email" size={20} color={Colors.gray} style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           placeholderTextColor={Colors.gray}
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <Icon name="lock" size={20} color={Colors.gray} style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Mật khẩu"
//           placeholderTextColor={Colors.gray}
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry={!showPassword}
//         />
//         <TouchableOpacity
//           onPress={() => setShowPassword(!showPassword)}
//           style={styles.eyeIcon}
//         >
//           <Icon
//             name={showPassword ? 'visibility' : 'visibility-off'}
//             size={20}
//             color={Colors.gray}
//           />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.checkboxContainer}>
//         <TouchableOpacity
//           style={styles.checkbox}
//           onPress={() => setRememberMe(!rememberMe)}
//         >
//           <Icon
//             name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
//             size={20}
//             color={Colors.pink}
//           />
//           <Text style={styles.checkboxText}>Giữ đăng nhập</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.checkbox}
//           onPress={() => setSavePassword(!savePassword)}
//         >
//           <Icon
//             name={savePassword ? 'check-box' : 'check-box-outline-blank'}
//             size={20}
//             color={Colors.pink}
//           />
//           <Text style={styles.checkboxText}>Lưu mật khẩu</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Đăng Nhập</Text>
//       </TouchableOpacity>

//       <Text style={styles.orText}>Hoặc</Text>

//       <TouchableOpacity style={styles.socialButton}>
//         <FontAwesome name="facebook" size={20} color={Colors.white} />
//         <Text style={styles.socialButtonText}>Đăng nhập bằng Facebook</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
//         <FontAwesome name="google" size={20} color={Colors.white} />
//         <Text style={styles.socialButtonText}>Đăng nhập bằng Google</Text>
//       </TouchableOpacity>

//       <TouchableOpacity>
//         <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.lightPink,
//     padding: 20,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: Colors.black,
//     marginBottom: 30,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     height: 50,
//     backgroundColor: Colors.white,
//     borderRadius: 10,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: Colors.gray,
//   },
//   icon: {
//     marginLeft: 10,
//   },
//   input: {
//     flex: 1,
//     height: '100%',
//     paddingHorizontal: 10,
//     fontSize: 16,
//     color: Colors.black,
//   },
//   eyeIcon: {
//     padding: 10,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 20,
//   },
//   checkbox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   checkboxText: {
//     marginLeft: 5,
//     fontSize: 14,
//     color: Colors.black,
//   },
//   button: {
//     width: '100%',
//     height: 50,
//     backgroundColor: Colors.darkPink,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   buttonText: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   orText: {
//     fontSize: 16,
//     color: Colors.gray,
//     marginBottom: 15,
//   },
//   socialButton: {
//     flexDirection: 'row',
//     width: '100%',
//     height: 50,
//     backgroundColor: '#3b5998',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   googleButton: {
//     backgroundColor: '#db4437',
//   },
//   socialButtonText: {
//     color: Colors.white,
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   forgotPassword: {
//     color: Colors.pink,
//     fontSize: 14,
//   },
// });

// export default LoginScreen;

import { Redirect } from "expo-router";

export default function Index() {
  // return <Redirect href="/auth/register" />;
  return <Redirect href="/auth/login" />;
}
