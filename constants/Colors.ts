/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  lightPink: '#FFE6F0', // Nền hồng nhạt
  pink: '#FF99B9',      // Link "Quên mật khẩu" và checkbox
  darkPink: '#FF6699',  // Nút "Đăng Nhập"
  white: '#FFFFFF',     // Ô nhập liệu
  black: '#333333',     // Chữ tiêu đề và checkbox
  gray: '#8E8E93',     
  successGreen: '#4CAF50', // Màu xanh đặc trưng cho thành công
  errorRed: '#F44336',
  green: '#34D399',
};
