import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { debounce } from 'lodash';
import Checkbox from 'expo-checkbox';

const HEADER_HEIGHT = 50;

export default function SpaInputScreen() {
    const router = useRouter();
    const { spaId } = useLocalSearchParams(); // Chỉ lấy spaId

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [services, setServices] = useState({
        'Chăm sóc da': false,
        'Massage': false,
        'Triệt lông': false,
        'Phun xăm': false,
        'Làm nail': false,
        'Dịch vụ khác': false,
    });
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [coordinates, setCoordinates] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [savedSpaId, setSavedSpaId] = useState(null);
    const [isFormDirty, setIsFormDirty] = useState(false);

    // Lấy dữ liệu spa nếu chỉnh sửa
    useEffect(() => {
        const fetchSpaData = async () => {
            if (spaId) {
                setLoading(true);
                try {
                    const spaDoc = await getDoc(doc(db, 'spas', spaId));
                    if (spaDoc.exists()) {
                        const data = spaDoc.data();
                        setName(data.name || '');
                        setAddress(data.address || '');
                        setPhone(data.phone || '');
                        setHours(data.hours || '');
                        setDescription(data.description || '');
                        setImages(
                            Array.isArray(data.images)
                                ? data.images.filter((uri) => typeof uri === 'string' && uri)
                                : []
                        );
                        setServices(data.services || services);
                        setCoordinates(data.coordinates || null);
                        setIsFormDirty(true);
                    }
                } catch (error) {
                    Alert.alert('Lỗi', 'Không thể tải dữ liệu spa: ' + error.message);
                } finally {
                    setLoading(false);
                }
            } else {
                resetForm();
            }
        };
        fetchSpaData();
    }, [spaId]);

    const resetForm = () => {
        setName('');
        setAddress('');
        setPhone('');
        setHours('');
        setDescription('');
        setImages([]);
        setServices({
            'Chăm sóc da': false,
            'Massage': false,
            'Triệt lông': false,
            'Phun xăm': false,
            'Làm nail': false,
            'Dịch vụ khác': false,
        });
        setCoordinates(null);
        setIsFormDirty(false);
    };

    const handleInputChange = (setter) => (value) => {
        setter(value);
        setIsFormDirty(true);
    };

    const handleBackPress = () => {
        if (isFormDirty) {
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
        } else {
            router.back();
        }
    };

    const pickImage = async () => {
        if (images.length >= 3) {
            Alert.alert('Thông báo', 'Bạn chỉ có thể chọn tối đa 3 ảnh.');
            return;
        }

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Lỗi quyền truy cập',
                    'Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt thiết bị.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: false,
                quality: 1,
                allowsMultipleSelection: true,
                selectionLimit: 3 - images.length,
            });

            if (!result.canceled && result.assets) {
                const newImages = await Promise.all(
                    result.assets.map(async (asset) => {
                        // Nén mạnh hơn
                        const manipulatedImage = await ImageManipulator.manipulateAsync(
                            asset.uri,
                            [{ resize: { width: 200 } }],
                            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
                        );
                        // Chuyển thành Base64
                        const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        return `data:image/jpeg;base64,${base64}`;
                    })
                );
                setImages((prevImages) => [...prevImages, ...newImages]);
                setIsFormDirty(true);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + error.message);
        }
    };

    const removeImage = (uri) => {
        setImages((currentImages) => currentImages.filter((imageUri) => imageUri !== uri));
        setIsFormDirty(true);
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Vui lòng cấp quyền vị trí.');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { 'User-Agent': 'ProjectSpa' } }
            );
            const data = await response.json();
            if (data?.display_name) {
                setAddress(data.display_name);
                setCoordinates({ lat: latitude, lon: longitude });
                setSuggestions([]);
                setIsFormDirty(true);
                Alert.alert('Thành công', 'Lấy vị trí hiện tại thành công.');
            } else {
                Alert.alert('Lỗi', 'Không thể lấy địa chỉ.');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lấy vị trí: ' + error.message);
        }
    };

    const searchAddressSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        try {
            const query = encodeURIComponent(`${input}, Việt Nam`);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`,
                { headers: { 'User-Agent': 'ProjectSpa' } }
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Lỗi tìm địa chỉ:', error);
        }
    };

    const debouncedSearch = useCallback(debounce(searchAddressSuggestions, 300), []);

    const selectSuggestion = (item) => {
        setAddress(item.display_name);
        setCoordinates({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
        setSuggestions([]);
        setIsFormDirty(true);
    };

    const clearAddress = () => {
        setAddress('');
        setSuggestions([]);
        setCoordinates(null);
        setIsFormDirty(true);
    };

    const clearDescription = () => {
        setDescription('');
        setIsFormDirty(true);
    };

    const geocodeAddress = async (address) => {
        try {
            const query = encodeURIComponent(`${address}, Việt Nam`);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
                { headers: { 'User-Agent': 'ProjectSpa' } }
            );
            const data = await response.json();
            if (data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            throw new Error('Không tìm thấy tọa độ.');
        } catch (error) {
            throw new Error('Lỗi geocode: ' + error.message);
        }
    };

    const saveSpa = async () => {
        const errors = [];
        if (!name.trim()) errors.push('Tên Spa');
        if (!address.trim()) errors.push('Địa chỉ');
        if (!phone.trim()) errors.push('Số điện thoại');
        if (!hours.trim()) errors.push('Giờ hoạt động');
        if (!description.trim()) errors.push('Mô tả');
        if (images.length !== 3) errors.push('Ảnh Spa');

        if (errors.length > 0) {
            Alert.alert('Lỗi', `Vui lòng nhập đầy đủ: ${errors.join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Vui lòng đăng nhập để lưu thông tin spa.');
            }

            // Cache userDoc
            const userDocRef = doc(db, 'user', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                throw new Error('Bạn không có quyền tạo hoặc chỉnh sửa spa.');
            }

            let finalCoordinates = coordinates;
            if (!finalCoordinates) {
                finalCoordinates = await geocodeAddress(address);
            }

            const spaData = {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                hours: hours.trim(),
                description: description.trim(),
                images,
                services,
                createdAt: new Date(),
                ownerId: user.uid,
                ...(finalCoordinates && { coordinates: finalCoordinates }),
            };

            let docRef;
            if (spaId) {
                docRef = doc(db, 'spas', spaId);
                await setDoc(docRef, spaData);
            } else {
                docRef = await addDoc(collection(db, 'spas'), spaData);
            }

            if (!docRef.id) {
                throw new Error('Không thể tạo spa: ID không hợp lệ.');
            }

            setSavedSpaId(docRef.id);
            setSuccessModalVisible(true);
            setIsFormDirty(false);
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể lưu spa.');
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setSuccessModalVisible(false);
        if (savedSpaId) {
            resetForm();
            router.push({
                pathname: '/owner/spaDetail',
                params: { spaId: savedSpaId },
            });
        } else {
            Alert.alert('Lỗi', 'Không thể điều hướng: ID spa không hợp lệ.');
        }
    };

    const renderSuggestion = (item) => (
        <TouchableOpacity
            key={item.place_id.toString()}
            style={styles.suggestionItem}
            onPress={() => selectSuggestion(item)}
        >
            <Text style={styles.suggestionText}>{item.display_name}</Text>
        </TouchableOpacity>
    );

    const toggleService = (key) => {
        setServices((prev) => ({ ...prev, [key]: !prev[key] }));
        setIsFormDirty(true);
    };

    const renderService = (key, value) => (
        <TouchableOpacity
            key={key}
            style={[styles.serviceItem, value && styles.serviceItemSelected]}
            onPress={() => toggleService(key)}
            activeOpacity={0.8}
        >
            <Text style={[styles.serviceText, value && styles.serviceTextSelected]} numberOfLines={1}>
                {key}
            </Text>
            <Checkbox
                value={value}
                onValueChange={() => toggleService(key)}
                color={value ? Colors.pink : undefined}
                style={styles.serviceCheckbox}
            />
        </TouchableOpacity>
    );

    const renderImage = (uri, index) => {
        if (!uri || typeof uri !== 'string') {
            return (
                <View key={`${index}-error`} style={styles.singleImagePreview}>
                    <Text style={styles.imageErrorText}>Ảnh không tải được</Text>
                </View>
            );
        }
        return (
            <View key={`${uri}-${index}`} style={styles.singleImagePreview}>
                <Image
                    source={{ uri }}
                    style={styles.imagePreview}
                    placeholder={{ uri: 'https://via.placeholder.com/80x60.png?text=Loading' }}
                />
                <TouchableOpacity onPress={() => removeImage(uri)} style={styles.removeImageButton}>
                    <Ionicons name="close-circle" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor={Colors.pink}
                barStyle="light-content"
                translucent={false}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={80}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{spaId ? 'Chỉnh sửa Spa' : 'Thêm Spa'}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.label}>Tên Spa</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={handleInputChange(setName)}
                    />

                    <Text style={styles.label}>Ảnh Spa</Text>
                    <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                        <Ionicons name="image-outline" size={20} color="#fff" />
                        <Text style={styles.imageButtonText}>
                            {images.length > 0 ? `Chọn thêm (${images.length}/3)` : 'Chọn 3 ảnh'}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.imagePreviewContainer}>
                        {images.length > 0 && images.map(renderImage)}
                    </View>

                    <Text style={styles.label}>Địa chỉ</Text>
                    <View style={styles.addressContainer}>
                        <TextInput
                            style={[styles.input, styles.addressInput]}
                            value={address}
                            onChangeText={(text) => {
                                handleInputChange(setAddress)(text);
                                debouncedSearch(text);
                            }}
                            multiline
                        />
                        {address.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={clearAddress}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                        <Ionicons name="location-outline" size={20} color="#fff" />
                        <Text style={styles.locationButtonText}>Lấy vị trí hiện tại</Text>
                    </TouchableOpacity>

                    {suggestions.length > 0 && (
                        <ScrollView style={styles.suggestionList} nestedScrollEnabled={true}>
                            {suggestions.map(renderSuggestion)}
                        </ScrollView>
                    )}

                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={handleInputChange(setPhone)}
                    />

                    <Text style={styles.label}>Giờ hoạt động</Text>
                    <TextInput
                        style={styles.input}
                        value={hours}
                        onChangeText={handleInputChange(setHours)}
                        placeholder="VD: 9:00 - 21:00"
                    />

                    <Text style={styles.label}>Dịch vụ</Text>
                    <View style={styles.servicesContainer}>
                        {Object.entries(services).map(([key, value]) => renderService(key, value))}
                    </View>

                    <Text style={styles.label}>Mô tả</Text>
                    <View style={styles.descriptionContainer}>
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            value={description}
                            onChangeText={handleInputChange(setDescription)}
                            multiline
                            numberOfLines={4}
                        />
                        {description.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={clearDescription}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={saveSpa}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Đang lưu...' : spaId ? 'Cập nhật Spa' : 'Lưu Spa'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={successModalVisible}
                    onRequestClose={handleModalClose}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Ionicons name="checkmark-circle" size={60} color={Colors.pink} style={styles.modalIcon} />
                            <Text style={styles.modalTitle}>Thành công!</Text>
                            <Text style={styles.modalMessage}>Thông tin spa đã được lưu.</Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleModalClose}
                            >
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
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
        height: HEADER_HEIGHT, // 50px
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
        fontSize: 20, 
        color: '#fff', 
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingHorizontal: 15,
        paddingTop: HEADER_HEIGHT, // Đẩy nội dung xuống dưới header
        paddingBottom: 30,
    },
    label: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        marginBottom: 6, 
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF5F5',
        width: '100%',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative',
    },
    addressInput: {
        flex: 1,
        paddingRight: 40,
    },
    descriptionContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative',
    },
    descriptionInput: {
        textAlignVertical: 'top',
        paddingRight: 40,
        minHeight: 100,
        width: '100%',
    },
    clearButton: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    locationButtonText: {
        color: '#fff',
        marginLeft: 6,
    },
    suggestionList: {
        marginTop: 10,
        maxHeight: 180,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    suggestionItem: {
        padding: 10,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    suggestionText: {
        fontSize: 14,
        color: '#333',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 10,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    imageButtonText: {
        color: '#fff',
        marginLeft: 6,
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        marginTop: 10,
        flexWrap: 'wrap',
    },
    singleImagePreview: {
        position: 'relative',
        marginRight: 10,
        marginBottom: 10,
    },
    imagePreview: {
        width: 80,
        height: 60,
        borderRadius: 8,
    },
    imageErrorText: {
        width: 80,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#666',
        fontSize: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    serviceItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    serviceItemSelected: {
        backgroundColor: '#FFE4E1',
        borderColor: Colors.pink,
    },
    serviceText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    serviceTextSelected: {
        color: Colors.pink,
        fontWeight: '600',
    },
    serviceCheckbox: {
        width: 18,
        height: 18,
    },
    saveButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#FCA5A5',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    modalIcon: {
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.pink,
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: Colors.pink,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});