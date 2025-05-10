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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function SpaDetailScreen() {
    const router = useRouter();
    const { spaId } = useLocalSearchParams();
    const [spaData, setSpaData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpaData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem thông tin spa.');
                    setLoading(false);
                    return;
                }

                const userDoc = await getDoc(doc(db, 'user', user.uid));
                if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                    Alert.alert('Lỗi', 'Bạn không có quyền xem thông tin spa.');
                    setLoading(false);
                    return;
                }

                let spaDoc = null;
                if (spaId) {
                    const docRef = doc(db, 'spas', spaId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
                        spaDoc = { id: docSnap.id, ...docSnap.data() };
                    }
                }

                if (!spaDoc) {
                    const q = query(
                        collection(db, 'spas'),
                        where('ownerId', '==', user.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        spaDoc = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                    }
                }

                setSpaData(spaDoc);
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải thông tin spa: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpaData();
    }, [spaId]);

    const handleEdit = () => {
        if (spaData) {
            console.log('Sending spaData.images:', spaData.images);
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
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Đang tải...</Text>
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
                <Text style={styles.headerTitle}>{spaData.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.imageContainer}>
                    {spaData.images.map((uri, index) => (
                        <Image
                            key={`${uri}-${index}`}
                            source={{ uri }}
                            style={styles.spaImage}
                            onError={() => console.log(`Failed to load spa image: ${uri}`)}
                        />
                    ))}
                </View>

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
                    {Object.entries(spaData.services)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                            <View key={key} style={styles.serviceItem}>
                                <Text style={styles.serviceText}>{key}</Text>
                            </View>
                        ))}
                </View>

                <Text style={styles.sectionTitle}>Mô tả</Text>
                <Text style={styles.descriptionText}>{spaData.description}</Text>

                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Text style={styles.editButtonText}>Chỉnh sửa</Text>
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
        backgroundColor: Colors.pink,
        padding: 15,
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
        paddingBottom: 30,
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
    imageContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    spaImage: {
        width: 100,
        height: 80,
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
    editButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    editButtonText: {
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