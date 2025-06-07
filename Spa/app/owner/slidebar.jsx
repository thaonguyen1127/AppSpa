import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.75;
const HEADER_HEIGHT = 50; // Đồng bộ với Dashboard.js

const Sidebar = ({ isSidebarOpen, toggleSidebar, closeSidebar, router }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const sidebarAnimation = React.useRef(new Animated.Value(isSidebarOpen ? 0 : -SIDEBAR_WIDTH)).current;

  // Đồng bộ activeTab với trang hiện tại khi sidebar mở
  useEffect(() => {
    if (isSidebarOpen) {
      const currentPath = router.pathname || router.asPath || '/';
      if (currentPath.includes('/owner/profile')) {
        setActiveTab('profile');
      } else if (currentPath.includes('/owner/spaInput')) {
        setActiveTab('spaInput');
      } else if (currentPath.includes('/owner/spaDetail')) {
        setActiveTab('spaDetail');
      } else if (currentPath.includes('auth/login')) {
        setActiveTab('logout');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isSidebarOpen, router.pathname]);

  // Cập nhật animation khi isSidebarOpen thay đổi
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: isSidebarOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const handleMenuPress = (tabId, callback) => {
    setActiveTab(tabId);
    callback();
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        { transform: [{ translateX: sidebarAnimation }] },
      ]}
    >
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Menu Spa</Text>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.sidebarContent}>
        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'dashboard' && styles.activeMenuItem]}
          onPress={() => handleMenuPress('dashboard', () => {
            router.push('/');
          })}
        >
          <Ionicons name="home-outline" size={24} color={activeTab === 'dashboard' ? Colors.pink : '#374151'} />
          <Text style={[styles.menuText, activeTab === 'dashboard' && styles.activeMenuText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'profile' && styles.activeMenuItem]}
          onPress={() => handleMenuPress('profile', () => {
            router.push('/owner/profile');
          })}
        >
          <Ionicons name="person-outline" size={24} color={activeTab === 'profile' ? Colors.pink : '#374151'} />
          <Text style={[styles.menuText, activeTab === 'profile' && styles.activeMenuText]}>Hồ sơ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'spaInput' && styles.activeMenuItem]}
          onPress={() => handleMenuPress('spaInput', () => {
            router.push('/owner/spaInput');
          })}
        >
          <Ionicons name="storefront-outline" size={24} color={activeTab === 'spaInput' ? Colors.pink : '#374151'} />
          <Text style={[styles.menuText, activeTab === 'spaInput' && styles.activeMenuText]}>Thêm thông tin Spa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'spaDetail' && styles.activeMenuItem]}
          onPress={() => handleMenuPress('spaDetail', () => {
            router.push('/owner/spaList');
          })}
        >
          <Ionicons name="storefront-outline" size={24} color={activeTab === 'spaDetail' ? Colors.pink : '#374151'} />
          <Text style={[styles.menuText, activeTab === 'spaDetail' && styles.activeMenuText]}>Chi tiết Spa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'logout' && styles.activeMenuItem]}
          onPress={() => handleMenuPress('logout', () => {
            closeSidebar();
            router.replace('auth/login');
          })}
        >
          <Ionicons name="log-out-outline" size={24} color={activeTab === 'logout' ? Colors.pink : '#374151'} />
          <Text style={[styles.menuText, activeTab === 'logout' && styles.activeMenuText]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.pink,
    height: HEADER_HEIGHT, // Đồng bộ với HEADER_HEIGHT = 50
    paddingHorizontal: 15,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarContent: {
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
  },
  activeMenuItem: {
    backgroundColor: '#FFD1DC',
    borderLeftWidth: 5,
    borderLeftColor: Colors.pink,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#374151',
  },
  activeMenuText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: Colors.pink,
  },
});

export default Sidebar;