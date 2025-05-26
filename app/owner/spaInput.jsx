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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, addDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
// import NumericInput from 'react-native-numeric-input';

const HEADER_HEIGHT = 50;
const DEFAULT_REGION = {
    latitude: 21.0285, // Trung tâm Hà Nội
    longitude: 105.8048,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};
const apiKey = '9ba4d4adc5844db3a03ab63ae7caa999';

export default function SpaInputScreen() {
    const router = useRouter();
    const { spaId, spaData } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [openingTime, setOpeningTime] = useState(new Date().setHours(9, 0, 0, 0));
    const [closingTime, setClosingTime] = useState(new Date().setHours(21, 0, 0, 0));
    const [showOpeningPicker, setShowOpeningPicker] = useState(false);
    const [showClosingPicker, setShowClosingPicker] = useState(false);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [services, setServices] = useState({});
    const [slotPerHour, setSlotPerHour] = useState(1);
    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [savedSpaId, setSavedSpaId] = useState(null);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        const initializeForm = async () => {
            setLoading(true);
            try {
                // Fetch services from Firestore
                const servicesSnapshot = await getDocs(collection(db, 'services'));
                const servicesData = {};
                servicesSnapshot.forEach((doc) => {
                    servicesData[doc.data().name] = false;
                });
                setServices(servicesData);

                // Ưu tiên sử dụng spaData từ params nếu có
                if (spaData) {
                    try {
                        const parsedData = JSON.parse(spaData);
                        setName(parsedData.name || '');
                        setAddress(parsedData.address || '');
                        setPhone(parsedData.phone || '');
                        setOpeningTime(
                            parsedData.openingTime
                                ? new Date(parsedData.openingTime)
                                : new Date().setHours(9, 0, 0, 0)
                        );
                        setClosingTime(
                            parsedData.closingTime
                                ? new Date(parsedData.closingTime)
                                : new Date().setHours(21, 0, 0, 0)
                        );
                        setDescription(parsedData.description || '');
                        setSlotPerHour(parsedData.slotPerHour || 1);
                        setImages(
                            Array.isArray(parsedData.images)
                                ? parsedData.images.filter((uri) => typeof uri === 'string' && uri)
                                : []
                        );
                        setServices((prev) => ({
                            ...prev,
                            ...parsedData.services,
                        }));
                        setCoordinates(parsedData.coordinates || null);
                        if (parsedData.coordinates) {
                            setMapRegion({
                                latitude: parsedData.coordinates.lat,
                                longitude: parsedData.coordinates.lon,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            });
                            setSelectedLocation({
                                latitude: parsedData.coordinates.lat,
                                longitude: parsedData.coordinates.lon,
                            });
                        }
                        setIsFormDirty(true);
                    } catch (error) {
                        console.error('Lỗi parse spaData:', error);
                        Alert.alert('Lỗi', 'Dữ liệu spa không hợp lệ.');
                    }
                }

                // Nếu có spaId, kiểm tra Firestore để đảm bảo dữ liệu mới nhất
                if (spaId && (!spaData || !JSON.parse(spaData))) {
                    const spaDoc = await getDoc(doc(db, 'spas', spaId));
                    if (spaDoc.exists()) {
                        const data = spaDoc.data();
                        setName(data.name || '');
                        setAddress(data.address || '');
                        setPhone(data.phone || '');
                        setOpeningTime(
                            data.openingTime
                                ? new Date(data.openingTime)
                                : new Date().setHours(9, 0, 0, 0)
                        );
                        setClosingTime(
                            data.closingTime
                                ? new Date(data.closingTime)
                                : new Date().setHours(21, 0, 0, 0)
                        );
                        setDescription(data.description || '');
                        setSlotPerHour(data.slotPerHour || 1);
                        setImages(
                            Array.isArray(data.images)
                                ? data.images.filter((uri) => typeof uri === 'string' && uri)
                                : []
                        );
                        setServices((prev) => ({
                            ...prev,
                            ...data.services,
                        }));
                        setCoordinates(data.coordinates || null);
                        if (data.coordinates) {
                            setMapRegion({
                                latitude: data.coordinates.lat,
                                longitude: data.coordinates.lon,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            });
                            setSelectedLocation({
                                latitude: data.coordinates.lat,
                                longitude: data.coordinates.lon,
                            });
                        }
                        setIsFormDirty(true);
                    }
                } else if (!spaId && !spaData) {
                    resetForm(servicesData);
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải dữ liệu spa: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        initializeForm();
    }, [spaId, spaData]);

    const resetForm = (servicesData = services) => {
        setName('');
        setAddress('');
        setPhone('');
        setOpeningTime(new Date().setHours(9, 0, 0, 0));
        setClosingTime(new Date().setHours(21, 0, 0, 0));
        setDescription('');
        setImages([]);
        setServices(
            Object.keys(servicesData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
        );
        setSlotPerHour(1);
        setCoordinates(null);
        setMapRegion(DEFAULT_REGION);
        setSelectedLocation(null);
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
                        const manipulatedImage = await ImageManipulator.manipulateAsync(
                            asset.uri,
                            [{ resize: { width: 200 } }],
                            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
                        );
                        const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        const base64String = `data:image/jpeg;base64,${base64}`;
                        if (!base64String.match(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)) {
                            throw new Error('Dữ liệu ảnh không hợp lệ.');
                        }
                        return base64String;
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
            console.log('Quyền vị trí:', status);
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Vui lòng cấp quyền vị trí trong cài đặt thiết bị.');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            console.log('Vị trí:', { latitude, longitude });
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=vi&countrycode=vn`,
                    { headers: { 'User-Agent': 'ProjectSpa' }, signal: controller.signal }
                );
                clearTimeout(timeoutId);
                const data = await response.json();
                console.log('Kết quả OpenCage:', data);
                if (data.results && data.results.length > 0) {
                    setAddress(data.results[0].formatted);
                    setCoordinates({ lat: latitude, lon: longitude });
                    setMapRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                    setSelectedLocation({ latitude, longitude });
                    setIsFormDirty(true);
                    Alert.alert('Thành công', 'Lấy vị trí hiện tại thành công.');
                } else {
                    Alert.alert('Lỗi', 'Không thể lấy địa chỉ từ vị trí. Vui lòng thử lại.');
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                throw fetchError;
            }
        } catch (error) {
            console.error('Lỗi lấy vị trí:', error);
            if (error.name === 'AbortError') {
                Alert.alert('Lỗi', 'Yêu cầu lấy địa chỉ quá thời gian, vui lòng kiểm tra mạng.');
            } else if (error.message.includes('401')) {
                Alert.alert('Lỗi', 'API key OpenCage không hợp lệ. Vui lòng kiểm tra key.');
            } else {
                Alert.alert('Lỗi', `Không thể lấy vị trí: ${error.message}`);
            }
        }
    };

    const openMapModal = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            console.log('Quyền vị trí (bản đồ):', status);
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Vui lòng cấp quyền vị trí để sử dụng bản đồ.');
                setMapRegion(DEFAULT_REGION);
                setSelectedLocation(null);
                setMapModalVisible(true);
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            console.log('Vị trí bản đồ:', { latitude, longitude });
            setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            setSelectedLocation({ latitude, longitude });
            setMapModalVisible(true);
        } catch (error) {
            console.error('Lỗi lấy vị trí hiện tại:', error);
            Alert.alert('Thông báo', 'Không thể lấy vị trí hiện tại, sử dụng vị trí mặc định.');
            setMapRegion(DEFAULT_REGION);
            setSelectedLocation(null);
            setMapModalVisible(true);
        }
    };

    const handleMapPress = async (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=vi&countrycode=vn`,
                    { headers: { 'User-Agent': 'ProjectSpa' }, signal: controller.signal }
                );
                clearTimeout(timeoutId);
                const data = await response.json();
                console.log('Kết quả OpenCage (bản đồ):', data);
                if (data.results && data.results.length > 0) {
                    setAddress(data.results[0].formatted);
                } else {
                    Alert.alert('Lỗi', 'Không thể lấy địa chỉ từ vị trí này.');
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                throw fetchError;
            }
        } catch (error) {
            console.error('Lỗi reverse geocoding:', error);
            if (error.name === 'AbortError') {
                Alert.alert('Lỗi', 'Yêu cầu lấy địa chỉ quá thời gian, vui lòng kiểm tra mạng.');
            } else if (error.message.includes('401')) {
                Alert.alert('Lỗi', 'API key OpenCage không hợp lệ. Vui lòng kiểm tra key.');
            } else {
                Alert.alert('Lỗi', 'Không thể lấy địa chỉ từ vị trí này.');
            }
        }
    };

    const confirmMapSelection = () => {
        if (selectedLocation) {
            setCoordinates({
                lat: selectedLocation.latitude,
                lon: selectedLocation.longitude,
            });
            setMapModalVisible(false);
            setIsFormDirty(true);
        } else {
            Alert.alert('Lỗi', 'Vui lòng chọn một vị trí trên bản đồ.');
        }
    };

    const clearAddress = () => {
        setAddress('');
        setCoordinates(null);
        setSelectedLocation(null);
        setMapRegion(DEFAULT_REGION);
        setIsFormDirty(true);
    };

    const clearDescription = () => {
        setDescription('');
        setIsFormDirty(true);
    };

    const saveSpa = async () => {
        const errors = [];
        if (!name.trim()) errors.push('Tên Spa');
        if (!address.trim()) errors.push('Địa chỉ');
        if (!phone.trim()) errors.push('Số điện thoại');
        if (!openingTime) errors.push('Giờ mở cửa');
        if (!closingTime) errors.push('Giờ đóng cửa');
        if (!description.trim()) errors.push('Mô tả');
        if (images.length !== 3) errors.push('Ảnh Spa');
        if (!coordinates) errors.push('Vị trí (chọn từ bản đồ hoặc vị trí hiện tại)');
        if (slotPerHour < 1) errors.push('Số khách tối đa mỗi giờ');

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

            const userDocRef = doc(db, 'user', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                throw new Error('Bạn không có quyền tạo hoặc chỉnh sửa spa.');
            }

            const spaDataToSave = {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                openingTime: new Date(openingTime).toISOString(),
                closingTime: new Date(closingTime).toISOString(),
                description: description.trim(),
                images,
                services,
                slotPerHour,
                createdAt: new Date(),
                ownerId: user.uid,
                coordinates,
                status: 'pending',
            };

            let docRef;
            if (spaId) {
                docRef = doc(db, 'spas', spaId);
                await setDoc(docRef, spaDataToSave);
            } else {
                docRef = await addDoc(collection(db, 'spas'), spaDataToSave);
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

    const formatTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
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

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.pink} />
                        <Text style={styles.loadingText}>Đang tải dữ liệu spa...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Text style={styles.label}>Tên Spa</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={handleInputChange(setName)}
                            placeholder="Nhập tên spa"
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
                                style={[
                                    styles.input,
                                    styles.addressInput,
                                    coordinates && styles.inputSelected,
                                ]}
                                value={address}
                                onChangeText={handleInputChange(setAddress)}
                                multiline
                                placeholder="Nhập địa chỉ (VD: Ngõ 104, Triều Khúc, Thanh Xuân, Hà Nội)"
                            />
                            {address.length > 0 && (
                                <TouchableOpacity style={styles.clearButton} onPress={clearAddress}>
                                    <Ionicons name="close-circle" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                            {coordinates && (
                                <View style={styles.checkmarkContainer}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                                </View>
                            )}
                        </View>
                        <View style={styles.locationButtonsContainer}>
                            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                                <Ionicons name="location-outline" size={20} color="#fff" />
                                <Text style={styles.locationButtonText}>Lấy vị trí hiện tại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.locationButton} onPress={openMapModal}>
                                <Ionicons name="map-outline" size={20} color="#fff" />
                                <Text style={styles.locationButtonText}>Chọn trên bản đồ</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={handleInputChange(setPhone)}
                            placeholder="Nhập số điện thoại"
                        />
{/* 
                        <Text style={styles.label}>Giờ mở cửa</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowOpeningPicker(true)}
                        >
                            <Text style={styles.timeText}>{formatTime(openingTime)}</Text>
                        </TouchableOpacity>
                        {showOpeningPicker && (
                            <DateTimePicker
                                value={new Date(openingTime)}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowOpeningPicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setOpeningTime(selectedDate.getTime());
                                        setIsFormDirty(true);
                                    }
                                }}
                            />
                        )} */}

                        {/* <Text style={styles.label}>Giờ đóng cửa</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowClosingPicker(true)}
                        >
                            <Text style={styles.timeText}>{formatTime(closingTime)}</Text>
                        </TouchableOpacity>
                        {showClosingPicker && (
                            <DateTimePicker
                                value={new Date(closingTime)}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowClosingPicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setClosingTime(selectedDate.getTime());
                                        setIsFormDirty(true);
                                    }
                                }}
                            />
                        )} */}

                        <Text style={styles.label}>Dịch vụ</Text>
                        <View style={styles.servicesContainer}>
                            {Object.entries(services).map(([key, value]) => renderService(key, value))}
                        </View>

                        <Text style={styles.label}>Số khách tối đa mỗi giờ</Text>
                        <NumericInput
                            value={slotPerHour}
                            onChange={(value) => {
                                setSlotPerHour(value);
                                setIsFormDirty(true);
                            }}
                            minValue={1}
                            maxValue={50}
                            step={1}
                            inputStyle={styles.numericInput}
                            containerStyle={styles.numericContainer}
                        />

                        <Text style={styles.label}>Mô tả</Text>
                        <View style={styles.descriptionContainer}>
                            <TextInput
                                style={[styles.input, styles.descriptionInput]}
                                value={description}
                                onChangeText={handleInputChange(setDescription)}
                                multiline
                                numberOfLines={4}
                                placeholder="Nhập mô tả spa"
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
                )}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={successModalVisible}
                    onRequestClose={handleModalClose}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Ionicons name="checkmark-circle" size={60} color={Colors.pink} style={styles.modalIcon} />
                            <Text style={styles.modalTitle}>Đã gửi!</Text>
                            <Text style={styles.modalMessage}>Thông tin spa đã được lưu và đang chờ duyệt.</Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleModalClose}
                            >
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={mapModalVisible}
                    onRequestClose={() => setMapModalVisible(false)}
                >
                    <View style={styles.mapModalContainer}>
                        <MapView
                            style={styles.map}
                            region={mapRegion}
                            onRegionChangeComplete={setMapRegion}
                            onPress={handleMapPress}
                        >
                            {selectedLocation && (
                                <Marker
                                    coordinate={selectedLocation}
                                    draggable
                                    onDragEnd={(e) => handleMapPress(e)}
                                />
                            )}
                        </MapView>
                        <View style={styles.mapButtonContainer}>
                            <TouchableOpacity
                                style={styles.mapButton}
                                onPress={() => setMapModalVisible(false)}
                            >
                                <Text style={styles.mapButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.mapButton}
                                onPress={confirmMapSelection}
                            >
                                <Text style={styles.mapButtonText}>Xác nhận</Text>
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
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingHorizontal: 15,
        paddingTop: HEADER_HEIGHT,
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
    inputSelected: {
        borderColor: Colors.green,
        borderWidth: 2,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative',
    },
    addressInput: {
        flex: 1,
        paddingRight: 60,
        minHeight: 50,
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
        right: 35,
        top: 12,
    },
    checkmarkContainer: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    locationButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    locationButtonText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
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
    mapModalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    mapButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
    },
    mapButton: {
        backgroundColor: Colors.pink,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    timeText: {
        fontSize: 16,
        color: '#333',
    },
    numericContainer: {
        marginTop: 6,
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    numericInput: {
        fontSize: 16,
        color: '#333',
    },
});