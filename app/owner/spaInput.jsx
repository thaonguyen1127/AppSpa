import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '@/constants/Colors';
import { db } from '../../src/firebaseConfig';
import { collection, addDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSpaContext } from '../../src/context/SpaContext';

const HEADER_HEIGHT = 50;
const DEFAULT_REGION = {
    latitude: 21.0285,
    longitude: 105.8048,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};
const apiKey = '9ba4d4adc5844db3a03ab63ae7caa999';

export default function SpaInputScreen() {
    const router = useRouter();
    const { spaId, spaData } = useLocalSearchParams();
    const { availableServices, updateAvailableServices } = useSpaContext();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [openTime, setOpenTime] = useState(new Date());
    const [closeTime, setCloseTime] = useState(new Date());
    const [showOpenPicker, setShowOpenPicker] = useState(false);
    const [showClosePicker, setShowClosePicker] = useState(false);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [services, setServices] = useState({});
    const [slotPerHour, setSlotPerHour] = useState('1');
    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [savedSpaId, setSavedSpaId] = useState(null);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    // New service states
    const [customServices, setCustomServices] = useState([]);
    const [showAddService, setShowAddService] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');

    useEffect(() => {
        const initializeForm = async () => {
            setLoading(true);
            try {
                let initialServices = {};
                if (availableServices.length > 0) {
                    initialServices = availableServices.reduce((acc, service) => ({
                        ...acc,
                        [service.name]: false,
                    }), {});
                } else {
                    const servicesSnapshot = await getDocs(collection(db, 'services'));
                    const servicesList = servicesSnapshot.docs.map(doc => ({
                        name: doc.data().name,
                        description: doc.data().description,
                    })) || [{ name: 'Dịch vụ mặc định', description: 'Dịch vụ tạm thời' }];
                    initialServices = servicesList.reduce((acc, service) => ({
                        ...acc,
                        [service.name]: false,
                    }), {});
                    updateAvailableServices(servicesList);
                }
                setServices(initialServices);
                if (spaData) {
                    const parsedData = JSON.parse(spaData);
                    setName(parsedData.name || '');
                    setAddress(parsedData.address || '');
                    setPhone(parsedData.phone || '');
                    setOpenTime(parsedData.openTime ? new Date(parsedData.openTime) : new Date());
                    setCloseTime(parsedData.closeTime ? new Date(parsedData.closeTime) : new Date());
                    setDescription(parsedData.description || '');
                    setImages(Array.isArray(parsedData.images) ? parsedData.images.filter(uri => typeof uri === 'string' && uri) : []);
                    setSlotPerHour(parsedData.slotPerHour?.toString() || '1');
                    setServices(parsedData.services || initialServices);
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
                } else if (spaId) {
                    const spaDoc = await getDoc(doc(db, 'spas', spaId));
                    if (spaDoc.exists()) {
                        const data = spaDoc.data();
                        setName(data.name || '');
                        setAddress(data.address || '');
                        setPhone(data.phone || '');
                        setOpenTime(data.openTime ? new Date(data.openTime) : new Date());
                        setCloseTime(data.closeTime ? new Date(data.closeTime) : new Date());
                        setDescription(data.description || '');
                        setImages(Array.isArray(data.images) ? data.images.filter(uri => typeof uri === 'string' && uri) : []);
                        setSlotPerHour(data.slotPerHour?.toString() || '1');
                        setServices(data.services || initialServices);
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
                    } else {
                        Alert.alert('Lỗi', 'Không tìm thấy spa.');
                    }
                } else {
                    resetForm(initialServices);
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải dữ liệu: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        initializeForm();
    }, [spaId, spaData, availableServices, updateAvailableServices]);

    const resetForm = (initialServices = {}) => {
        setName('');
        setAddress('');
        setPhone('');
        setOpenTime(new Date());
        setCloseTime(new Date());
        setDescription('');
        setImages([]);
        setServices(initialServices);
        setSlotPerHour('1');
        setCoordinates(null);
        setMapRegion(DEFAULT_REGION);
        setSelectedLocation(null);
        setCustomServices([]);
        setShowAddService(false);
        setNewServiceName('');
        setIsFormDirty(false);
    };

    const handleInputChange = setter => value => {
        setter(value);
        setIsFormDirty(true);
    };

    const handleSlotChange = (value) => {
        // Only allow positive integers
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '' || parseInt(numericValue) < 1) {
            setSlotPerHour('1');
        } else {
            setSlotPerHour(numericValue);
        }
        setIsFormDirty(true);
    };

    const handleTimeChange = (setter, showSetter) => (event, selectedTime) => {
        showSetter(false);
        if (selectedTime) {
            setter(selectedTime);
            setIsFormDirty(true);
        }
    };

    const handleBackPress = () => {
        if (successModalVisible) {
            resetForm(availableServices.reduce((acc, service) => ({ ...acc, [service.name]: false }), {}));
            setSuccessModalVisible(false);
            router.back();
            return;
        }
        if (isFormDirty) {
            Alert.alert(
                'Xác nhận thoát',
                'Dữ liệu chưa lưu sẽ bị mất. Thoát?',
                [
                    { text: 'Không', style: 'cancel' },
                    {
                        text: 'Có',
                        onPress: () => {
                            resetForm(availableServices.reduce((acc, service) => ({ ...acc, [service.name]: false }), {}));
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
            Alert.alert('Thông báo', 'Tối đa 3 ảnh.');
            return;
        }
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                quality: 1,
                allowsMultipleSelection: true,
                selectionLimit: 3 - images.length,
            });
            if (!result.canceled && result.assets) {
                const newImages = await Promise.all(
                    result.assets.map(async asset => {
                        const manipulatedImage = await ImageManipulator.manipulateAsync(
                            asset.uri,
                            [{ resize: { width: 200 } }],
                            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
                        );
                        const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        return `data:image/jpeg;base64,${base64}`;
                    })
                );
                setImages(prev => [...prev, ...newImages]);
                setIsFormDirty(true);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + error.message);
        }
    };

    const removeImage = uri => {
        setImages(current => current.filter(imageUri => imageUri !== uri));
        setIsFormDirty(true);
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Cần cấp quyền vị trí.');
                return;
            }
            setLoading(true);
            let location = await Location.getLastKnownPositionAsync({});
            if (!location) {
                location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            }
            const { latitude, longitude } = location.coords;
            const cachedAddress = await getCachedAddress(latitude, longitude);
            if (cachedAddress) {
                setAddress(cachedAddress);
                setCoordinates({ lat: latitude, lon: longitude });
                setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                setSelectedLocation({ latitude, longitude });
                setIsFormDirty(true);
                Alert.alert('Thành công', 'Lấy vị trí thành công.');
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            try {
                const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=vi&countrycode=vn`,
                    { headers: { 'User-Agent': 'ProjectSpa' }, signal: controller.signal }
                );
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const formattedAddress = data.results[0].formatted;
                    setAddress(formattedAddress);
                    setCoordinates({ lat: latitude, lon: longitude });
                    setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                    setSelectedLocation({ latitude, longitude });
                    await cacheAddress(latitude, longitude, formattedAddress);
                    setIsFormDirty(true);
                    Alert.alert('Thành công', 'Lấy vị trí thành công.');
                } else {
                    Alert.alert('Lỗi', 'Không thể lấy địa chỉ.');
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                Alert.alert('Lỗi', fetchError.name === 'AbortError' ? 'Yêu cầu quá thời gian.' : 'Không thể lấy địa chỉ: ' + fetchError.message);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lấy vị trí: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const openMapModal = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Cần cấp quyền vị trí.');
                setMapRegion(DEFAULT_REGION);
                setSelectedLocation(null);
                setMapModalVisible(true);
                return;
            }
            setLoading(true);
            let location = await Location.getLastKnownPositionAsync({});
            if (!location) {
                location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            }
            const { latitude, longitude } = location.coords;
            setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
            setSelectedLocation({ latitude, longitude });
            setMapModalVisible(true);
        } catch (error) {
            Alert.alert('Thông báo', 'Không thể lấy vị trí, dùng vị trí mặc định.');
            setMapRegion(DEFAULT_REGION);
            setSelectedLocation(null);
            setMapModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleMapPress = event => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };

    const confirmMapSelection = async () => {
        if (!selectedLocation) {
            Alert.alert('Lỗi', 'Chọn một vị trí trên bản đồ.');
            return;
        }
        setLoading(true);
        try {
            const { latitude, longitude } = selectedLocation;
            const cachedAddress = await getCachedAddress(latitude, longitude);
            if (cachedAddress) {
                setAddress(cachedAddress);
                setCoordinates({ lat: latitude, lon: longitude });
                setMapModalVisible(false);
                setIsFormDirty(true);
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            try {
                const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=vi&countrycode=vn`,
                    { headers: { 'User-Agent': 'ProjectSpa' }, signal: controller.signal }
                );
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const formattedAddress = data.results[0].formatted;
                    setAddress(formattedAddress);
                    setCoordinates({ lat: latitude, lon: longitude });
                    await cacheAddress(latitude, longitude, formattedAddress);
                    setMapModalVisible(false);
                    setIsFormDirty(true);
                } else {
                    Alert.alert('Lỗi', 'Không thể lấy địa chỉ.');
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                Alert.alert('Lỗi', fetchError.name === 'AbortError' ? 'Yêu cầu quá thời gian.' : 'Không thể lấy địa chỉ: ' + fetchError.message);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xử lý vị trí: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const cacheAddress = async (latitude, longitude, address) => {
        try {
            const key = `address_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
            await AsyncStorage.setItem(key, JSON.stringify({ address, timestamp: Date.now() }));
        } catch (error) {
            console.warn('Lỗi lưu cache địa chỉ:', error);
        }
    };

    const getCachedAddress = async (latitude, longitude) => {
        try {
            const key = `address_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
            const cached = await AsyncStorage.getItem(key);
            if (cached) {
                const { address, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    return address;
                }
                await AsyncStorage.removeItem(key);
            }
        } catch (error) {
            console.warn('Lỗi đọc cache địa chỉ:', error);
        }
        return null;
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

    // New service functions
    const addCustomService = () => {
        if (newServiceName.trim()) {
            const newService = {
                id: Date.now().toString(),
                name: newServiceName.trim(),
                isCustom: true
            };
            setCustomServices(prev => [...prev, newService]);
            setServices(prev => ({ ...prev, [newService.name]: true }));
            setNewServiceName('');
            setShowAddService(false);
            setIsFormDirty(true);
        }
    };

    const removeCustomService = (serviceId) => {
        const serviceToRemove = customServices.find(s => s.id === serviceId);
        if (serviceToRemove) {
            setCustomServices(prev => prev.filter(s => s.id !== serviceId));
            setServices(prev => {
                const newServices = { ...prev };
                delete newServices[serviceToRemove.name];
                return newServices;
            });
            setIsFormDirty(true);
        }
    };

    const cancelAddService = () => {
        setNewServiceName('');
        setShowAddService(false);
    };

    const saveSpa = async () => {
        const errors = [];
        if (!name.trim()) errors.push('Tên Spa');
        if (!address.trim()) errors.push('Địa chỉ');
        if (!phone.trim()) errors.push('Số điện thoại');
        if (!slotPerHour || isNaN(slotPerHour) || Number(slotPerHour) <= 0) errors.push('Số khách/giờ');
        if (!description.trim()) errors.push('Mô tả');
        if (images.length !== 3) errors.push('Ảnh Spa');
        if (!coordinates) errors.push('Vị trí');

        if (errors.length > 0) {
            Alert.alert('Lỗi', `Vui lòng nhập đầy đủ: ${errors.join(', ')}`);
            return;
        }
        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error('Vui lòng đăng nhập.');
            const userDoc = await getDoc(doc(db, 'user', user.uid));
            if (!userDoc.exists() || userDoc.data().role !== 'owner') throw new Error('Bạn không có quyền.');

            const spaDataToSave = {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                openTime: openTime.toISOString(),
                closeTime: closeTime.toISOString(),
                description: description.trim(),
                images,
                services,
                slotPerHour: Number(slotPerHour),
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
            resetForm(availableServices.reduce((acc, service) => ({ ...acc, [service.name]: false }), {}));
            router.push({ pathname: '/owner/spaDetail', params: { spaId: savedSpaId } });
        } else {
            Alert.alert('Lỗi', 'ID spa không hợp lệ.');
        }
    };

    const toggleService = key => {
        setServices(prev => ({ ...prev, [key]: !prev[key] }));
        setIsFormDirty(true);
    };

    const renderService = service => (
        <TouchableOpacity
            key={service.name}
            style={[styles.serviceItem, services[service.name] && styles.serviceItemSelected]}
            onPress={() => toggleService(service.name)}
        >
            <Checkbox
                value={services[service.name]}
                onValueChange={() => toggleService(service.name)}
                color={services[service.name] ? Colors.pink : undefined}
                style={styles.checkbox}
            />
            <Text style={[styles.serviceText, services[service.name] && styles.serviceTextSelected]} numberOfLines={1}>
                {service.name}
            </Text>
        </TouchableOpacity>
    );

    const renderCustomService = service => (
        <TouchableOpacity
            key={service.id}
            style={[styles.serviceItem, styles.serviceItemSelected]}
        >
            <Checkbox
                value={true}
                color={Colors.pink}
                style={styles.checkbox}
                disabled
            />
            <Text style={[styles.serviceText, styles.serviceTextSelected]} numberOfLines={1}>
                {service.name}
            </Text>
            <TouchableOpacity 
                style={styles.deleteServiceButton} 
                onPress={() => removeCustomService(service.id)}
            >
                <Ionicons name="close-circle" size={20} color={Colors.pink} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderImage = (uri, index) => (
        <View key={`${uri}-${index}`} style={styles.imagePreviewContainer}>
            <Image source={{ uri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => removeImage(uri)} style={styles.removeImageButton}>
                <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.pink} barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
                keyboardVerticalOffset={80}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{spaId ? 'Chỉnh sửa Spa' : 'Thêm Spa'}</Text>
                </View>

                {loading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color={Colors.pink} />
                        <Text style={styles.text}>Đang tải...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scroll}>
                        <Text style={styles.label}>
                            Tên Spa <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={handleInputChange(setName)}
                            placeholder="Nhập tên spa"
                        />

                        <Text style={styles.label}>
                            Ảnh Spa <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <TouchableOpacity style={styles.compactButton} onPress={pickImage}>
                            <Ionicons name="image-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>
                                {images.length > 0 ? `Chọn (${images.length}/3)` : 'Chọn 3 ảnh'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.imageContainer}>
                            {images.map(renderImage)}
                        </View>

                        <Text style={styles.label}>
                            Địa chỉ <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <View style={styles.addressInputContainer}>
                            <TextInput
                                style={[
                                    styles.input, 
                                    styles.addressInput,
                                    coordinates && styles.inputSelected
                                ]}
                                value={address}
                                onChangeText={handleInputChange(setAddress)}
                                multiline
                                placeholder="Nhập địa chỉ"
                            />
                            <View style={styles.addressIconsContainer}>
                                {address.length > 0 && (
                                    <TouchableOpacity
                                        style={[styles.addressIcon, { right: coordinates ? 40 : 10 }]}
                                        onPress={clearAddress}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#666" />
                                    </TouchableOpacity>
                                )}
                                {coordinates && (
                                    <TouchableOpacity
                                        style={[styles.addressIcon, { right: 10 }]}
                                    >
                                        <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.halfButton]} onPress={getCurrentLocation}>
                                <Ionicons name="location-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Lấy vị trí</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.halfButton]} onPress={openMapModal}>
                                <Ionicons name="map-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Chọn trên bản đồ</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>
                            Số điện thoại <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={handleInputChange(setPhone)}
                            placeholder="Nhập số điện thoại"
                        />

                        <Text style={styles.label}>
                            Giờ mở cửa <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <TouchableOpacity style={styles.input} onPress={() => setShowOpenPicker(true)}>
                            <Text style={styles.text}>
                                {openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                        {showOpenPicker && (
                            <DateTimePicker
                                value={openTime}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange(setOpenTime, setShowOpenPicker)}
                            />
                        )}

                        <Text style={styles.label}>
                            Giờ đóng cửa <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <TouchableOpacity style={styles.input} onPress={() => setShowClosePicker(true)}>
                            <Text style={styles.text}>
                                {closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                        {showClosePicker && (
                            <DateTimePicker
                                value={closeTime}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange(setCloseTime, setShowClosePicker)}
                            />
                        )}

                        <Text style={styles.label}>
                            Dịch vụ <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <View style={styles.services}>
                            {availableServices.map(renderService)}
                            {customServices.map(renderCustomService)}
                        </View>
                        
                        {!showAddService ? (
                            <TouchableOpacity style={styles.addServiceButton} onPress={() => setShowAddService(true)}>
                                <Ionicons name="add" size={20} color={Colors.pink} />
                                <Text style={styles.addServiceButtonText}>Dịch vụ mới</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.addServiceContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={newServiceName}
                                    onChangeText={setNewServiceName}
                                    placeholder="Nhập tên dịch vụ mới"
                                />
                                <View style={styles.addServiceButtons}>
                                    <TouchableOpacity style={styles.compactActionButton} onPress={addCustomService}>
                                        <Text style={styles.compactButtonText}>Thêm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.compactActionButton, styles.cancelActionButton]} onPress={cancelAddService}>
                                        <Text style={styles.compactButtonText}>Hủy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <Text style={styles.label}>
                            Số khách/giờ <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <View style={styles.numberInputContainer}>
                            <TextInput
                                style={[styles.input, styles.numberInput]}
                                keyboardType="number-pad"
                                value={slotPerHour}
                                onChangeText={handleSlotChange}
                                placeholder="1"
                                textAlign="center"
                            />
                            <View style={styles.numberButtonsColumn}>
                                <TouchableOpacity 
                                    style={styles.numberButton}
                                    onPress={() => {
                                        const currentValue = parseInt(slotPerHour) || 1;
                                        if (currentValue < 99) {
                                            setSlotPerHour((currentValue + 1).toString());
                                            setIsFormDirty(true);
                                        }
                                    }}
                                >
                                    <Ionicons name="chevron-up" size={18} color={Colors.pink} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.numberButton}
                                    onPress={() => {
                                        const currentValue = parseInt(slotPerHour) || 1;
                                        if (currentValue > 1) {
                                            setSlotPerHour((currentValue - 1).toString());
                                            setIsFormDirty(true);
                                        }
                                    }}
                                >
                                    <Ionicons name="chevron-down" size={18} color={Colors.pink} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.label}>
                            Mô tả <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <View style={styles.descriptionContainer}>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                value={description}
                                onChangeText={handleInputChange(setDescription)}
                                multiline
                                placeholder="Nhập mô tả spa"
                            />
                            {description.length > 0 && (
                                <TouchableOpacity style={styles.descriptionClearButton} onPress={clearDescription}>
                                    <Ionicons name="close-circle" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
                            onPress={saveSpa}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Đang lưu...' : spaId ? 'Cập nhật Spa' : 'Lưu Spa'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}

                <Modal animationType="fade" transparent visible={successModalVisible} onRequestClose={handleModalClose}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <Ionicons name="checkmark-circle" size={60} color={Colors.pink} style={styles.modalIcon} />
                            <Text style={styles.modalTitle}>Thành công!</Text>
                            <Text style={styles.text}>Thông tin spa đã được lưu và đang chờ duyệt.</Text>
                            <TouchableOpacity style={styles.button} onPress={handleModalClose}>
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal animationType="slide" transparent={false} visible={mapModalVisible} onRequestClose={() => setMapModalVisible(false)}>
                    <View style={styles.flex}>
                        <MapView
                            style={styles.flex}
                            region={mapRegion}
                            onRegionChangeComplete={setMapRegion}
                            onPress={handleMapPress}
                        >
                            {selectedLocation && (
                                <Marker coordinate={selectedLocation} draggable onDragEnd={e => handleMapPress(e)} />
                            )}
                        </MapView>
                        <View style={styles.mapButtonContainer}>
                            <TouchableOpacity style={styles.mapButton} onPress={() => setMapModalVisible(false)}>
                                <Text style={styles.mapButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mapButton} onPress={confirmMapSelection}>
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
    flex: { 
        flex: 1 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: HEADER_HEIGHT,
        backgroundColor: Colors.pink,
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    scroll: {
        padding: 15,
        paddingTop: 10,
        paddingBottom: 30,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginVertical: 8,
    },
    requiredAsterisk: {
        color: Colors.pink,
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF5F5',
    },
    inputSelected: {
        borderColor: Colors.green,
        borderWidth: 2,
    },
    // Address input specific styles
    addressInputContainer: {
        position: 'relative',
    },
    addressInput: {
        paddingRight: 70,
        minHeight: 50,
    },
    addressIconsContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressIcon: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    // Description input styles
    descriptionContainer: {
        position: 'relative',
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingRight: 40,
    },
    descriptionClearButton: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 15,
        justifyContent: 'center',
    },
    // Compact button for image picker
    compactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 12,
        justifyContent: 'center',
        alignSelf: 'flex-start',
        minWidth: 120,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    halfButton: {
        flex: 0.48,
        padding: 12,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    imagePreviewContainer: {
        position: 'relative',
        marginRight: 10,
        marginBottom: 10,
    },
    imagePreview: {
        width: 80,
        height: 60,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
    },
    services: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
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
        marginLeft: 8,
    },
    serviceTextSelected: {
        color: Colors.pink,
        fontWeight: '600',
    },
    checkbox: {
        width: 18,
        height: 18,
    },
    deleteServiceButton: {
        marginLeft: 5,
    },
    // Add service styles
    addServiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.pink,
        borderStyle: 'dashed',
        marginBottom: 15,
    },
    addServiceButtonText: {
        color: Colors.pink,
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600',
    },
    addServiceContainer: {
        marginBottom: 15,
    },
    addServiceButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        gap: 10,
    },
    // Compact action buttons for add/cancel service
    compactActionButton: {
        backgroundColor: Colors.pink,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelActionButton: {
        backgroundColor: '#666',
    },
    compactButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        marginTop: 20,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#FCA5A5',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
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
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    // Map modal button styles
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Number input styles
   numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    width: 140, 
},
numberInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    padding: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
},
numberButtonsColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
},
numberButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
},
});