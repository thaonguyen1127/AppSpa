// src/screens/owner/SpaListScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { db, auth } from '../../src/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useSpaContext } from '../../src/context/SpaContext';

const HEADER_HEIGHT = 50;

const serializeSpaData = (spa) => {
    return {
        ...spa,
        createdAt: spa.createdAt?.toMillis
            ? new Date(spa.createdAt.toMillis()).toISOString()
            : spa.createdAt
            ? new Date(spa.createdAt).toISOString()
            : null,
        openTime: spa.openTime
            ? new Date(spa.openTime).toISOString()
            : null,
        closeTime: spa.closeTime
            ? new Date(spa.closeTime).toISOString()
            : null,
    };
};

export default function SpaListScreen() {
    const router = useRouter();
    const { resetNavigating } = useLocalSearchParams();
    const user = auth.currentUser;
    const { spas, updateSpas } = useSpaContext();
    const [loading, setLoading] = useState(spas.length === 0);
    const [refreshing, setRefreshing] = useState(false);
    const [navigating, setNavigating] = useState(false);

    const fetchSpas = useCallback(async (forceRefresh = false) => {
        if (!user) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem danh sách spa.');
            router.replace('/');
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                Alert.alert('Lỗi', 'Bạn không có quyền xem danh sách spa.');
                router.replace('/');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            if (!forceRefresh && spas.length > 0) {
                setLoading(false);
                setRefreshing(false);
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

            spaList.sort((a, b) => {
                const dateA = a.createdAt && typeof a.createdAt.toMillis === 'function'
                    ? a.createdAt.toMillis()
                    : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const dateB = b.createdAt && typeof b.createdAt.toMillis === 'function'
                    ? b.createdAt.toMillis()
                    : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return dateB - dateA;
            });

            updateSpas(spaList);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách spa: ' + error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, spas, updateSpas]);

    useEffect(() => {
        if (spas.length === 0) {
            setLoading(true);
            fetchSpas();
        } else {
            setLoading(false);
        }
    }, [fetchSpas, spas.length]);

    useEffect(() => {
        if (resetNavigating === 'true') {
            setNavigating(false);
        }
    }, [resetNavigating]);

    useFocusEffect(
        useCallback(() => {
            setTimeout(() => setNavigating(false), 100);
            return () => {
                console.log('SpaListScreen unfocused');
            };
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSpas(true);
    }, [fetchSpas]);

    const handleViewDetails = (spa) => {
        if (navigating) return;
        setNavigating(true);
        try {
            const serializedSpa = serializeSpaData(spa);
            router.push({
                pathname: '/owner/spaDetail',
                params: { spaId: spa.id, spaData: JSON.stringify(serializedSpa) },
            });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể điều hướng: ' + error.message);
            setNavigating(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const renderSpaItem = ({ item }) => (
        <View style={styles.spaItem}>
            <View style={styles.spaHeader}>
                <Text style={styles.spaTitle}>{item.name}</Text>
                <View style={[
                    styles.statusBadge,
                    item.status === 'pending' ? styles.statusPending :
                    item.status === 'approved' ? styles.statusApproved :
                    item.status === 'rejected' ? styles.statusRejected : styles.statusPending
                ]}>
                    <Text style={styles.statusText}>
                        {item.status === 'pending' ? 'Chờ duyệt' :
                         item.status === 'approved' ? 'Đã duyệt' :
                         item.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                    </Text>
                </View>
            </View>
            <Text style={styles.spaAddress} numberOfLines={2}>
                {item.address}
            </Text>
            <Text style={styles.spaDate}>
                {item.createdAt && typeof item.createdAt.toMillis === 'function'
                    ? new Date(item.createdAt.toMillis()).toLocaleDateString('vi-VN')
                    : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A')}
            </Text>
            <TouchableOpacity
                style={[styles.viewDetailsButton, navigating && styles.disabledButton]}
                onPress={() => handleViewDetails(item)}
                disabled={navigating}
            >
                <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {Platform.OS !== 'web' && (
                <StatusBar
                    backgroundColor={Colors.pink}
                    barStyle="light-content"
                    translucent={false}
                />
            )}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách Spa</Text>
            </View>
            {navigating && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                    <Text style={styles.loadingText}>Đang tải chi tiết spa...</Text>
                </View>
            )}
            {loading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            ) : spas.length === 0 ? (
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.pink]}
                            tintColor={Colors.pink}
                            progressViewOffset={HEADER_HEIGHT + 10}
                        />
                    }
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
        // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
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
        paddingTop: 10,
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
    spaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    spaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.darkPink,
        flex: 1,
    },
    spaAddress: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    spaDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    viewDetailsButton: {
        backgroundColor: Colors.darkPink,
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
    disabledButton: {
        opacity: 0.5,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusPending: {
        backgroundColor: '#FFD700',
    },
    statusApproved: {
        backgroundColor: '#28A745',
    },
    statusRejected: {
        backgroundColor: '#DC3545',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        fontSize: 18,
        color: '#fff',
        marginTop: 10,
    },
});