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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, enableNetwork, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const HEADER_HEIGHT = 50;
export default function SpaDetailScreen() {
    const router = useRouter();
    const { spaId, spaData: spaDataParam } = useLocalSearchParams();
    const [spaData, setSpaData] = useState(spaDataParam ? JSON.parse(spaDataParam) : null);
    const [loadingState, setLoadingState] = useState(spaDataParam ? 'none' : 'initial'); // 'initial', 'navigating', 'none'

    useEffect(() => {
        const fetchSpaData = async () => {
            // console.log('Fetching spa data for spaId:', spaId);
            if (!spaId) {
                Alert.alert('Lỗi', 'Không tìm thấy ID spa.');
                setLoadingState('none');
                return;
            }

            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem thông tin spa.');
                    setLoadingState('none');
                    return;
                }

                const userDoc = await getDoc(doc(db, 'user', user.uid));
                if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                    Alert.alert('Lỗi', 'Bạn không có quyền xem thông tin spa.');
                    setLoadingState('none');
                    return;
                }

                // Chỉ gọi Firestore nếu không có spaData từ params
                if (!spaData) {
                    const docRef = doc(db, 'spas', spaId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
                        setSpaData({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        const q = query(
                            collection(db, 'spas'),
                            where('ownerId', '==', user.uid)
                        );
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            setSpaData({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                        } else {
                            setSpaData(null);
                        }
                    }
                }
            } catch (error) {
                // console.log('Error fetching spa data:', error);
                Alert.alert('Lỗi', 'Không thể tải thông tin spa: ' + error.message);
            } finally {
                // console.log('Finished fetching spa data');
                setLoadingState('none');
            }
        };

        if (!spaData) {
            fetchSpaData();
        }
    }, [spaId, spaData]);

    const handleEdit = () => {
        if (spaData) {
            // console.log('Navigating to spaInput for spaId:', spaData.id);
            setLoadingState('navigating');
            router.push({
                pathname: '/owner/spaInput',
                params: { 
                    spaId: spaData.id, 
                    spaData: JSON.stringify({
                        ...spaData,
                        images: spaData.images || [],
                    }),
                },
            });
            setTimeout(() => {
                // console.log('Reset loading state');
                setLoadingState('none');
            }, 1000);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa spa này? Hành động này không thể hoàn tác.',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
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

    if (loadingState === 'navigating') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                    <Text style={styles.loadingText}>Đang tải form chỉnh sửa...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loadingState === 'initial') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                    <Text style={styles.loadingText}>Đang tải thông tin spa...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!spaData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin Spa</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.spaTitle}>{spaData.name}</Text>

                {spaData.images && spaData.images.length > 0 && (
                    <View style={styles.imageContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {spaData.images.map((uri, index) => (
                                <Image
                                    key={`${uri}-${index}`}
                                    source={{ uri }}
                                    style={styles.spaImage}
                                    onError={() => console.log(`Failed to load spa image: ${uri}`)}
                                />
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
                        <Text style={styles.infoText}>{spaData.hours}</Text>
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

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.buttonText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: Colors.pink,
        height: HEADER_HEIGHT,
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
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingHorizontal: 15,
        paddingTop: HEADER_HEIGHT + 10,
        paddingBottom: 30,
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
        gap: 10,
    },
    serviceItem: {
        backgroundColor: '#FFE4E1',
        borderRadius: 8,
        padding: 10,
        width: '48%',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
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
    },
    loadingText: {
        fontSize: 18,
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
});