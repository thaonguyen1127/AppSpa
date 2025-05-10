import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const HEADER_HEIGHT = 50;

export default function SpaListScreen() {
    const router = useRouter();
    const auth = getAuth();
    const user = auth.currentUser;
    const [spas, setSpas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpas = async () => {
            if (!user) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem danh sách spa.');
                router.replace('/login');
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'user', user.uid));
                if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                    Alert.alert('Lỗi', 'Bạn không có quyền xem danh sách spa.');
                    router.replace('/login');
                    setLoading(false);
                    return;
                }

                const q = query(
                    collection(db, 'spas'),
                    where('ownerId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const spaList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setSpas(spaList);
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải danh sách spa: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpas();
    }, [user]);

    const handleViewDetails = (spaId) => {
        router.push({
            pathname: '/owner/spaDetail',
            params: { spaId },
        });
    };

    const renderSpaItem = ({ item }) => (
        <View style={styles.spaItem}>
            <Text style={styles.spaTitle}>{item.name}</Text>
            <Text style={styles.spaAddress} numberOfLines={2}>
                {item.address}
            </Text>
            <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(item.id)}
            >
                <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách Spa</Text>
            </View>

            {spas.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Chưa có spa nào. Vui lòng thêm spa để xem danh sách.
                    </Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push('/owner/spaInput')}
                    >
                        <Text style={styles.createButtonText}>Thêm Spa</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={spas}
                    renderItem={renderSpaItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
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
    listContainer: {
        paddingHorizontal: 15,
        paddingTop: HEADER_HEIGHT + 10,
        paddingBottom: 30,
    },
    spaItem: {
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    spaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.pink,
        marginBottom: 5,
    },
    spaAddress: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    viewDetailsButton: {
        backgroundColor: Colors.pink,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    viewDetailsText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: HEADER_HEIGHT,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: Colors.pink,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    createButtonText: {
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