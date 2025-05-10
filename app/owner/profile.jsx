import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    Alert,
    StatusBar,
    BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const HEADER_HEIGHT = 50;

export default function ProfileScreen() {
    const router = useRouter();
    const auth = getAuth();
    const user = auth.currentUser;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [initialState, setInitialState] = useState({ fullName: '', phone: '', avatar: null });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem hồ sơ.');
                router.replace('/login');
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'user', user.uid));
                if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                    Alert.alert('Lỗi', 'Bạn không có quyền truy cập hồ sơ chủ spa.');
                    router.replace('/login');
                    return;
                }

                const data = userDoc.data();
                setFullName(data.fullName || '');
                setEmail(user.email || '');
                setPhone(data.phone || '');
                setAvatar(data.avatar || null);
                setInitialState({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    avatar: data.avatar || null,
                });
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    useEffect(() => {
        const checkFormDirty = () => {
            if (!isEditing) {
                setIsFormDirty(false);
                return;
            }
            const isDirty =
                fullName !== initialState.fullName ||
                phone !== initialState.phone ||
                avatar !== initialState.avatar;
            setIsFormDirty(isDirty);
        };

        checkFormDirty();
    }, [fullName, phone, avatar, isEditing, initialState]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isFormDirty) {
                showBackConfirm();
                return true; // Ngăn hành động back mặc định
            }
            return false; // Cho phép back bình thường
        });

        return () => backHandler.remove();
    }, [isFormDirty]);

    const showBackConfirm = () => {
        Alert.alert(
            'Xác nhận thoát',
            'Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất.',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Có',
                    onPress: () => {
                        resetForm();
                        router.back();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleBackPress = () => {
        if (isFormDirty) {
            showBackConfirm();
        } else {
            router.back();
        }
    };

    const resetForm = () => {
        setFullName(initialState.fullName);
        setPhone(initialState.phone);
        setAvatar(initialState.avatar);
        setIsEditing(false);
        setIsFormDirty(false);
    };

    const pickAvatar = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 200 } }],
                    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
                );
                const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const avatarUri = `data:image/jpeg;base64,${base64}`;
                setAvatar(avatarUri);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + error.message);
        }
    };

    const saveProfile = async () => {
        if (!fullName.trim() || !phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên và số điện thoại.');
            return;
        }

        setLoading(true);
        try {
            await setDoc(
                doc(db, 'user', user.uid),
                {
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    avatar: avatar || null,
                    updatedAt: new Date(),
                },
                { merge: true }
            );
            setInitialState({ fullName: fullName.trim(), phone: phone.trim(), avatar });
            setIsEditing(false);
            setIsFormDirty(false);
            Alert.alert('Thành công', 'Cập nhật hồ sơ thành công.');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            router.replace('/login');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể đăng xuất: ' + error.message);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor={Colors.pink}
                barStyle="light-content"
                translucent={false}
            />
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image
                            source={{ uri: avatar }}
                            style={styles.avatar}
                            onError={() => setAvatar(null)}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={60} color="#ccc" />
                        </View>
                    )}
                    {isEditing && (
                        <TouchableOpacity style={styles.changeAvatarButton} onPress={pickAvatar}>
                            <Text style={styles.changeAvatarText}>Thay ảnh</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color={Colors.pink} />
                        <TextInput
                            style={styles.infoInput}
                            value={fullName}
                            onChangeText={setFullName}
                            editable={isEditing}
                            placeholder="Họ tên"
                        />
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color={Colors.pink} />
                        <TextInput
                            style={[styles.infoInput, isEditing && styles.disabledInput]}
                            value={email}
                            editable={false}
                            placeholder="Email"
                        />
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={Colors.pink} />
                        <TextInput
                            style={styles.infoInput}
                            value={phone}
                            onChangeText={setPhone}
                            editable={isEditing}
                            placeholder="Số điện thoại"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.actionButton, isEditing && styles.actionButtonDisabled]}
                    onPress={() => {
                        if (isEditing && isFormDirty) {
                            showBackConfirm();
                        } else {
                            setIsEditing(!isEditing);
                        }
                    }}
                    disabled={loading}
                >
                    <Text style={styles.actionButtonText}>
                        {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                    </Text>
                </TouchableOpacity>

                {isEditing && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={saveProfile}
                        disabled={loading}
                    >
                        <Text style={styles.actionButtonText}>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.actionButton, styles.logoutButton]}
                    onPress={handleSignOut}
                    disabled={loading}
                >
                    <Text style={styles.actionButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: HEADER_HEIGHT,
        backgroundColor: Colors.pink,
        paddingHorizontal: 15,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingHorizontal: 15,
        paddingTop: HEADER_HEIGHT,
        paddingBottom: 30,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeAvatarButton: {
        marginTop: 10,
        backgroundColor: Colors.pink,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    changeAvatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: Colors.pink,
    },
    infoContainer: {
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
        paddingVertical: 5,
    },
    disabledInput: {
        color: '#808080', //Màu disabled
    },
    actionButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    actionButtonDisabled: {
        backgroundColor: '#FCA5A5',
    },
    saveButton: {
        backgroundColor: '#FF85C0',
    },
    logoutButton: {
        backgroundColor: '#FFE4E1',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});