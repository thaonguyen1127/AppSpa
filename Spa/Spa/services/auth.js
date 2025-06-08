// services/auth.js
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../src/firebaseConfig";

// export const login = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     return { success: true, user: userCredential.user };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Đăng nhập với Firebase và trả về vai trò người dùng.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, role: string}>}
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Nếu chưa có document trong Firestore, tạo mới với vai trò mặc định là "user"
    await setDoc(userRef, {
      email: user.email,
      name: '',
      role: 'user',
      createdAt: new Date().toISOString(),
    });
    return { user, role: 'user' };
  }

  const userData = userSnap.data();
  return { user, role: userData.role || 'user' };
};
