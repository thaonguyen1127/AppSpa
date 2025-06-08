import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
    ActivityIndicator,
    Modal,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { db, auth } from '../../src/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const HEADER_HEIGHT = 50;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SpaDetailScreen() {
    const router = useRouter();
    const { spaId, spaData: spaDataParam } = useLocalSearchParams();
    const [spaData, setSpaData] = useState(spaDataParam ? JSON.parse(spaDataParam) : null);
    const [loadingState, setLoadingState] = useState(spaDataParam ? 'none' : 'initial');
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchSpaData = async () => {
            if (!spaId || spaData) {
                setLoadingState('none');
                return;
            }

            try {
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem thông tin spa.');
                    setLoadingState('none');
                    return;
                }

                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                    Alert.alert('Lỗi', 'Bạn không có quyền xem thông tin spa.');
                    setLoadingState('none');
                    return;
                }

                const docRef = doc(db, 'spas', spaId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
                    setSpaData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    Alert.alert('Lỗi', 'Không tìm thấy thông tin spa.');
                    setSpaData(null);
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải thông tin spa: ' + error.message);
            } finally {
                setLoadingState('none');
            }
        };

        if (!spaData) {
            setLoadingState('initial');
            fetchSpaData();
        } else {
            setLoadingState('none');
        }
    }, [spaId, spaData]);

    const handleEdit = () => {
        if (spaData) {
            setLoadingState('navigating');
            try {
                router.push({
                    pathname: '/owner/spaInput',
                    params: {
                        spaId: spaData.id,
                        spaData: JSON.stringify({
                            ...spaData,
                            images: spaData.images || [],
                            createdAt: spaData.createdAt?.toMillis
                                ? new Date(spaData.createdAt.toMillis()).toISOString()
                                : spaData.createdAt
                                ? new Date(spaData.createdAt).toISOString()
                                : null,
                            openTime: spaData.openTime
                                ? new Date(spaData.openTime).toISOString()
                                : null,
                            closeTime: spaData.closeTime
                                ? new Date(spaData.closeTime).toISOString()
                                : null,
                        }),
                    },
                });
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể điều hướng: ' + error.message);
            }
            setTimeout(() => setLoadingState('none'), 1000);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa spa này? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'spas', spaData.id));
                            Alert.alert('Thành công', 'Spa đã được xóa.');
                            router.replace('/owner/spaList');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa spa: ' + error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        router.navigate({
            pathname: '/owner/spaList',
            params: { resetNavigating: 'true' },
        });
    };

    const openImageModal = (uri) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    const closeImageModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    if (loadingState === 'initial') {
        return (
            <SafeAreaView style={styles.container}>
                {Platform.OS !== 'web' && (
                    <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
                )}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông tin Spa</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                    <Text style={styles.loadingText}>Đang tải thông tin spa...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loadingState === 'navigating') {
        return (
            <SafeAreaView style={styles.container}>
                {Platform.OS !== 'web' && (
                    <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
                )}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông tin Spa</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                    <Text style={styles.loadingText}>Đang tải form chỉnh sửa...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!spaData) {
        return (
            <SafeAreaView style={styles.container}>
                {Platform.OS !== 'web' && (
                    <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
                )}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông tin Spa</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có thông tin spa. Vui lòng thêm spa để xem chi tiết.</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push('/owner/spaInput')}
                    >
                        <Text style={styles.createButtonText}>Thêm Spa</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {Platform.OS !== 'web' && (
                <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
            )}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin Spa</Text>
            </View>

            <View style={styles.contentContainer}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.spaTitle}>{spaData.name}</Text>

                    {spaData.images && spaData.images.length > 0 && (
                        <View style={styles.imageContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {spaData.images.map((uri, index) => (
                                    <TouchableOpacity
                                        key={`${uri}-${index}`}
                                        onPress={() => openImageModal(uri)}
                                    >
                                        <Image
                                            source={{ uri }}
                                            style={styles.spaImage}
                                            onError={() => console.log(`Failed to load spa image: ${uri}`)}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={Colors.pink} />
                            <Text style={styles.infoText}>{spaData.address}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={20} color={Colors.pink} />
                            <Text style={styles.infoText}>{spaData.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color={Colors.pink} />
                            <Text style={styles.infoText}>
                                {spaData.openTime && spaData.closeTime
                                    ? `${new Date(spaData.openTime).toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })} - ${new Date(spaData.closeTime).toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })}`
                                    : 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Dịch vụ</Text>
                    <View style={styles.servicesContainer}>
                        {Object.entries(spaData.services || {})
                            .filter(([_, value]) => value)
                            .map(([key]) => (
                                <View key={key} style={styles.serviceItem}>
                                    <Text style={styles.serviceText}>{key}</Text>
                                </View>
                            ))}
                    </View>

                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.descriptionText}>{spaData.description}</Text>
                </ScrollView>

                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.buttonText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeImageModal}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.fullImage}
                            resizeMode="contain"
                            onError={() => console.log(`Failed to load full image: ${selectedImage}`)}
                        />
                    )}
                </View>
            </Modal>
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
        backgroundColor: Colors.pink,
        height: HEADER_HEIGHT,
        paddingHorizontal: 15,
        // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        zIndex: 10,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 100, // Space for fixed buttons
    },
    spaTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.pink,
        marginBottom: 10,
    },
    imageContainer: {
        marginVertical: 10,
    },
    spaImage: {
        width: 120,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
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
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    serviceItem: {
        backgroundColor: '#FFE4E1',
        borderRadius: 8,
        padding: 10,
        width: '48%',
        marginRight: '2%',
        marginBottom: 10,
    },
    serviceText: {
        fontSize: 16,
        color: Colors.pink,
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        zIndex: 5,
    },
    editButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: HEADER_HEIGHT + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    },
    loadingText: {
        fontSize: 18,
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.7,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
});