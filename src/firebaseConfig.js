import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_KOWVS1Kyt-dawJ_q8CsUN4r4qHGLslg",
  authDomain: "projectspa-785c5.firebaseapp.com",
  projectId: "projectspa-785c5",
  storageBucket: "projectspa-785c5.firebasestorage.app",
  messagingSenderId: "484292752450",
  appId: "1:484292752450:web:4e9e7f31e01f2d515429db",
};

// Khởi tạo Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Firebase Auth với AsyncStorage để lưu trữ trạng thái xác thực
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Khởi tạo Firestore
const db = getFirestore(app);
export { auth, db };
export const storage = getStorage(app);