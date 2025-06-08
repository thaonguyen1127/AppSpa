import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
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
import { db, firebaseAuth as auth } from '../../src/firebaseConfig'; // Đảm bảo import đúng
import { collection, addDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSpaContext } from '../../src/context/SpaContext';
import styles from '../../src/styles/SpaInputStyles';

const HEADER_HEIGHT = 50;
const DEFAULT_REGION = {
    latitude: 21.0285,
    longitude: 105.8048,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};
const API_KEY = '9ba4d4adc5844db3a03ab63ae7caa999'; // API key OpenCage

const CustomModal = ({ visible, title, message, isConfirm, onClose, onConfirm }) => (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modal}>
                <Ionicons
                    name={isConfirm ? 'help-circle-outline' : 'warning-outline'}
                    size={40}
                    color={Colors.pink}
                    style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalText}>{message}</Text>
                <View style={styles.modalButtons}>
                    {isConfirm ? (
                        <>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                                <Text style={styles.modalButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    onConfirm?.();
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalButtonText}>Thoát</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onClose}>
                            <Text style={styles.modalButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    </Modal>
);

export default function SpaInputScreen() {
    const router = useRouter();
    const { spaId, spaData } = useLocalSearchParams();
    const { spas, updateSpas, availableServices, updateAvailableServices } = useSpaContext();

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
    const [slotsPerHour, setSlotsPerHour] = useState('1');
    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [savedSpaId, setSavedSpaId] = useState(null);
    const [isFormDirty, setIsFormDirty] = useState(true);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [customServices, setCustomServices] = useState([]);
    const [showAddService, setShowAddService] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');
    const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        isConfirm: false,
        onConfirm: null,
    });

    useEffect(() => {
        const initializeForm = async () => {
            setLoading(true);
            try {
                let initialServices = {};
                if (availableServices?.length > 0) {
                    initialServices = availableServices.reduce(
                        (acc, service) => ({
                            ...acc,
                            [service.name]: false,
                        }),
                        {},
                    );
                } else {
                    const servicesSnapshot = await getDocs(collection(db, 'services'));
                    const servicesList =
                        servicesSnapshot?.docs?.map((doc) => ({
                            name: doc.data().name || '',
                            description: doc.data().description || '',
                        })) || [{ name: 'Dịch vụ mặc định', description: 'Dịch vụ tạm thời' }];
                    initialServices = servicesList.reduce(
                        (acc, service) => ({
                            ...acc,
                            [service.name]: false,
                    }),
                        {},
                    );
                    updateAvailableServices(servicesList);
                }
                setServices(initialServices);

                if (spaData) {
                    try {
                        const parsedData = JSON.parse(spaData);
                        setName(parsedData.name || '');
                        setAddress(parsedData.address || '');
                        setPhone(parsedData.phone || '');
                        setOpenTime(parsedData.openTime ? new Date(parsedData.openTime) : new Date());
                        setCloseTime(parsedData.closeTime ? new Date(parsedData.closeTime) : new Date());
                        setDescription(parsedData.description || '');
                        setImages(
                            Array.isArray(parsedData.images)
                                ? parsedData.images.filter((uri) => typeof uri === 'string' && uri)
                                : [],
                        );
                        setSlotsPerHour(parsedData.slotPerHour?.toString() || '1');
                        setServices(parsedData.services || initialServices);
                        setCoordinates(parsedData.coordinates || null);
                        if (parsedData.coordinates) {
                            setMapRegion({
                                latitude: parsedData.coordinates.lat,
                                longitude: parsedData.coordinates.lon,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02,
                            });
                            setSelectedLocation({
                                latitude: parsedData.coordinates.lat,
                                longitude: parsedData.coordinates.lon,
                            });
                        }
                        setIsFormDirty(true);
                    } catch (parseError) {
                        Alert.alert('Lỗi', 'Dữ liệu spa không hợp lệ.');
                    }
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
                        setImages(
                            Array.isArray(data.images)
                                ? data.images.filter((uri) => typeof uri === 'string' && uri)
                                : [],
                        );
                        setSlotsPerHour(data.slotPerHour?.toString() || '1');
                        setServices(data.services || initialServices);
                        setCoordinates(data.coordinates || null);
                        if (data.coordinates) {
                            setMapRegion({
                                latitude: data.coordinates.lat,
                                longitude: data.coordinates.lon,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02,
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
                console.error('Initialize form error:', error);
                Alert.alert('Lỗi', `Không thể tải dữ liệu: ${error.message}`);
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
        setSlotsPerHour('1');
        setCoordinates(null);
        setMapRegion(DEFAULT_REGION);
        setSelectedLocation(null);
        setCustomServices([]);
        setShowAddService(false);
        setNewServiceName('');
        setIsFormDirty(false);
        setModal({ visible: false, title: '', message: '', isConfirm: false, onConfirm: null });
    };

    const handleInputChange = (setter) => (value) => {
        setter(value);
        setIsFormDirty(true);
    };

    const handleSlotChange = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setSlotsPerHour(numericValue === '' || parseInt(numericValue) < 1 ? '1' : numericValue);
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
            resetForm(
                availableServices.reduce((acc, service) => ({ ...acc, [service.name]: false }), {}),
            );
            setSuccessModalVisible(false);
            router.back();
            return;
        }
        if (isFormDirty) {
            setModal({
                visible: true,
                title: 'Xác nhận thoát',
                message: 'Dữ liệu chưa lưu sẽ bị mất. Bạn có muốn thoát không?',
                isConfirm: true,
                onConfirm: () => {
                    resetForm(
                        availableServices.reduce((acc, service) => ({ ...acc, [service.name]: false }), {}),
                    );
                    router.back();
                },
            });
        } else {
            router.back();
        }
    };

    const pickImage = async () => {
        if (images.length >= 3) {
            setModal({
                visible: true,
                title: 'Thông báo',
                message: 'Bạn chỉ có thể chọn tối đa 3 ảnh cho spa.',
                isConfirm: false,
            });
            return;
        }
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setModal({
                    visible: true,
                    title: 'Lưu ý',
                    message: 'Vui lòng cấp quyền truy cập thư viện ảnh để chọn hình.',
                    isConfirm: false,
                });
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
                            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
                        );
                        const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        return `data:image/jpeg;base64,${base64}`;
                    }),
                );
                setImages((prev) => [...prev, ...newImages]);
                setIsFormDirty(true);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: `Không thể chọn ảnh: ${error.message}`,
                isConfirm: false,
            });
        }
    };

    const removeImage = (uri) => {
        setImages((current) => current.filter((imageUri) => imageUri !== uri));
        setIsFormDirty(true);
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setModal({
                    visible: true,
                    title: 'Lưu ý',
                    message: 'Vui lòng cấp quyền truy cập vị trí để lấy địa chỉ.',
                    isConfirm: false,
                });
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
                setMapRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
                setSelectedLocation({ latitude, longitude });
                setIsFormDirty(true);
                setModal({
                    visible: true,
                    title: 'Thành công',
                    message: 'Đã lấy vị trí hiện tại thành công.',
                    isConfirm: false,
                });
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Tăng timeout lên 5s
            try {
                const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}&language=vi&countrycode=vn`,
                    { headers: { 'User-Agent': 'ProjectSpa' }, signal: controller.signal },
                );
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.results?.length > 0) {
                    const formattedAddress = data.results[0].formatted;
                    setAddress(formattedAddress);
                    setCoordinates({ lat: latitude, lon: longitude });
                    setMapRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
                    setSelectedLocation({ latitude, longitude });
                    await cacheAddress(latitude, longitude, formattedAddress);
                    setIsFormDirty(true);
                    setModal({
                        visible: true,
                        title: 'Thành công',
                        message: 'Đã lấy vị trí hiện tại thành công.',
                        isConfirm: false,
                    });
                } else {
                    setModal({
                        visible: true,
                        title: 'Lưu ý',
                        message: 'Không thể lấy địa chỉ từ vị trí này. Vui lòng thử lại.',
                        isConfirm: false,
                    });
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                setModal({
                    visible: true,
                    title: 'Lưu ý',
                    message:
                        fetchError.name === 'AbortError'
                            ? 'Yêu cầu lấy địa chỉ đã quá thời gian. Vui lòng thử lại.'
                            : `Không thể lấy địa chỉ: ${fetchError.message}`,
                    isConfirm: false,
                });
            }
        } catch (error) {
            console.error('Get location error:', error);
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: `Không thể lấy vị trí: ${error.message}`,
                isConfirm: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const openMapModal = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setModal({
                    visible: true,
                    title: 'Lưu ý',
                    message: 'Vui lòng cấp quyền truy cập vị trí để chọn trên bản đồ.',
                    isConfirm: false,
                });
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
            setMapRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
            setSelectedLocation({ latitude, longitude });
            setMapModalVisible(true);
        } catch (error) {
            console.error('Open map error:', error);
            setModal({
                visible: true,
                title: 'Thông báo',
                message: 'Không thể lấy vị trí hiện tại. Sử dụng vị trí mặc định.',
                isConfirm: false,
            });
            setMapRegion(DEFAULT_REGION);
            setSelectedLocation(null);
            setMapModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };

    const confirmMapSelection = async () => {
        if (!selectedLocation) {
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: 'Vui lòng chọn một vị trí trên bản đồ.',
                isConfirm: false,
            });
            return;
        }
        setLoading(true);
        try {
            const { latitude, longitude } = selectedLocation;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const response = await fetch(
                    `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}&language=vi&countrycode=vn`,
                    { headers: { 'User-Agent': 'ProjectSpa' }, signal: controller.signal },
                );
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.results?.length > 0) {
                    const formattedAddress = data.results[0].formatted;
                    setAddress(formattedAddress);
                    await cacheAddress(latitude, longitude, formattedAddress);
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                console.warn('Geocode error:', fetchError);
            }
            setCoordinates({ lat: latitude, lon: longitude });
            setMapModalVisible(false);
            setIsFormDirty(true);
        } catch (error) {
            console.error('Confirm map error:', error);
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: `Không thể xử lý vị trí: ${error.message}`,
                isConfirm: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const cacheAddress = async (latitude, longitude, address) => {
        try {
            const key = `address_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
            await AsyncStorage.setItem(key, JSON.stringify({ address, timestamp: Date.now() }));
        } catch (error) {
            console.warn('Cache address error:', error);
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
            console.warn('Get cached address error:', error);
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

    const addCustomService = () => {
        if (!newServiceName.trim()) {
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: 'Vui lòng nhập tên dịch vụ.',
                isConfirm: false,
            });
            return;
        }
        const newService = {
            id: Date.now().toString(),
            name: newServiceName.trim(),
            isCustom: true,
        };
        setCustomServices((prev) => [...prev, newService]);
        setServices((prev) => ({ ...prev, [newService.name]: true }));
        // Tùy chọn: Lưu dịch vụ tùy chỉnh vào availableServices
        // updateAvailableServices([...availableServices, { name: newService.name, description: '' }]);
        setNewServiceName('');
        setShowAddService(false);
        setIsFormDirty(true);
    };

    const removeCustomService = (serviceId) => {
        const serviceToRemove = customServices.find((s) => s.id === serviceId);
        if (serviceToRemove) {
            setCustomServices((prev) => prev.filter((s) => s.id !== serviceId));
            setServices((prev) => {
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
        if (!slotsPerHour || isNaN(slotsPerHour) || Number(slotsPerHour) <= 0) errors.push('Số khách/giờ');
        if (!description.trim()) errors.push('Mô tả');
        if (images.length !== 3) errors.push('Ảnh Spa (cần đúng 3 ảnh)');
        if (!coordinates) errors.push('Vị trí');
        if (!Object.values(services).some((selected) => selected)) errors.push('Dịch vụ (chọn ít nhất 1)');

        if (closeTime <= openTime) {
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: 'Giờ đóng cửa phải muộn hơn giờ mở cửa.',
                isConfirm: false,
            });
            return;
        }
        if (errors.length > 0) {
            setModal({
                visible: true,
                title: 'Thông báo',
                message: `Vui lòng điền đầy đủ các thông tin: ${errors.join(', ')}`,
                isConfirm: false,
            });
            return;
        }
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Vui lòng đăng nhập.');
            const userDoc = await getDoc(doc(db, 'users', user.uid)); // Sửa 'user' thành 'users'
            if (!userDoc.exists() || userDoc.data().role !== 'owner') {
                throw new Error('Bạn không có quyền chỉnh sửa spa.');
            }

            const spaDataToSave = {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                openTime: openTime.toISOString(),
                closeTime: closeTime.toISOString(),
                description: description.trim(),
                images,
                services,
                slotPerHour: Number(slotsPerHour),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(), // Thêm updatedAt
                ownerId: user.uid,
                coordinates,
                status: 'pending',
            };
            let docRef;
            if (spaId) {
                docRef = doc(db, 'spas', spaId);
                await setDoc(docRef, spaDataToSave, { merge: true }); // Sử dụng merge để an toàn
                const updatedSpas = spas.map((spa) =>
                    spa.id === spaId ? { id: spaId, ...spaDataToSave } : spa,
                );
                updateSpas(updatedSpas);
            } else {
                docRef = await addDoc(collection(db, 'spas'), spaDataToSave);
                updateSpas([...spas, { id: docRef.id, ...spaDataToSave }]);
            }
            setSavedSpaId(docRef.id);
            setSuccessModalVisible(true);
            setIsFormDirty(false);
        } catch (error) {
            console.error('Save spa error:', error);
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: error.message || 'Không thể lưu thông tin spa. Vui lòng thử lại.',
                isConfirm: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setSuccessModalVisible(false);
        if (savedSpaId) {
            resetForm(
                availableServices.reduce((acc, service) => ({ ...acc, [service.name]: false }), {}),
            );
            setTimeout(() => {
                router.push({ pathname: '/owner/spaDetail', params: { spaId: savedSpaId } });
            }, 100); // Thêm độ trễ nhỏ để đảm bảo điều hướng mượt
        } else {
            setModal({
                visible: true,
                title: 'Lưu ý',
                message: 'ID spa không hợp lệ.',
                isConfirm: false,
            });
        }
    };

    const toggleService = (key) => {
        setServices((prev) => ({ ...prev, [key]: !prev[key] }));
        setIsFormDirty(true);
    };

    const renderService = (service) => (
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
            <Text
                style={[styles.serviceText, services[service.name] && styles.serviceTextSelected]}
                numberOfLines={1}
            >
                {service.name}
            </Text>
        </TouchableOpacity>
    );

    const renderCustomService = (service) => (
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
                        <View style={styles.imageContainer}>{images.map(renderImage)}</View>

                        <Text style={styles.label}>
                            Địa chỉ <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <View style={styles.addressInputContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.addressInput,
                                    coordinates && styles.inputSelected,
                                ]}
                                value={address}
                                onChangeText={handleInputChange(setAddress)}
                                multiline
                                placeholder="Nhập địa chỉ"
                            />
                            <View style={styles.addressIconsContainer}>
                                {address.length > 0 && (
                                    <TouchableOpacity style={styles.addressIcon} onPress={clearAddress}>
                                        <Ionicons name="close-circle" size={20} color="#666" />
                                    </TouchableOpacity>
                                )}
                                {coordinates && (
                                    <TouchableOpacity style={styles.addressIcon}>
                                        <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.halfButton]}
                                onPress={getCurrentLocation}
                            >
                                <Ionicons name="location-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Lấy vị trí</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.halfButton]}
                                onPress={openMapModal}
                            >
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
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowOpenPicker(true)}
                        >
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
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowClosePicker(true)}
                        >
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
                            <TouchableOpacity
                                style={styles.addServiceButton}
                                onPress={() => setShowAddService(true)}
                            >
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
                                    <TouchableOpacity
                                        style={styles.compactActionButton}
                                        onPress={addCustomService}
                                    >
                                        <Text style={styles.compactButtonText}>Thêm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.compactActionButton, styles.cancelActionButton]}
                                        onPress={cancelAddService}
                                    >
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
                                value={slotsPerHour}
                                onChangeText={handleSlotChange}
                                placeholder="1"
                                textAlign="center"
                            />
                            <View style={styles.numberButtonsColumn}>
                                <TouchableOpacity
                                    style={styles.numberButton}
                                    onPress={() => {
                                        const currentValue = parseInt(slotsPerHour) || 1;
                                        if (currentValue < 99) {
                                            setSlotsPerHour((currentValue + 1).toString());
                                            setIsFormDirty(true);
                                        }
                                    }}
                                >
                                    <Ionicons name="chevron-up" size={18} color={Colors.pink} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.numberButton}
                                    onPress={() => {
                                        const currentValue = parseInt(slotsPerHour) || 1;
                                        if (currentValue > 1) {
                                            setSlotsPerHour((currentValue - 1).toString());
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
                                <TouchableOpacity
                                    style={styles.descriptionClearButton}
                                    onPress={clearDescription}
                                >
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

                <Modal
                    animationType="fade"
                    transparent
                    visible={successModalVisible}
                    onRequestClose={handleModalClose}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <Ionicons
                                name="checkmark-circle"
                                size={60}
                                color={Colors.pink}
                                style={styles.modalIcon}
                            />
                            <Text style={styles.modalTitle}>Thành công!</Text>
                            <Text style={[styles.text, { textAlign: 'center' }]}>
                                Thông tin spa đã được lưu và đang chờ duyệt.
                            </Text>
                            <TouchableOpacity style={styles.button} onPress={handleModalClose}>
                                <Text style={styles.buttonText}>OK</Text>
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
                    <View style={styles.flex}>
                        <MapView
                            style={styles.flex}
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
                            <TouchableOpacity style={styles.mapButton} onPress={confirmMapSelection}>
                                <Text style={styles.mapButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <CustomModal
                    visible={modal.visible}
                    title={modal.title}
                    message={modal.message}
                    isConfirm={modal.isConfirm}
                    onClose={() =>
                        setModal({ visible: false, title: '', message: '', isConfirm: false, onConfirm: null })
                    }
                    onConfirm={modal.onConfirm || (() => {})}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}