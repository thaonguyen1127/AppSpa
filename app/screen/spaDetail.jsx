"use client"

import React, { useState, useEffect, useRef, useContext } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Alert,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"
import { useRouter, useLocalSearchParams } from "expo-router"
import ShimmerPlaceholder from "react-native-shimmer-placeholder"
import { LinearGradient } from "expo-linear-gradient"
import { SpaContext } from "../../src/context/SpaContext"
import styles from "../../src/styles/SpaDetailStyles"

// Singleton to store cached map region
let cachedRegion = null

const tabs = [
  { id: "overview", title: "Tổng quan", icon: "information-circle-outline" },
  { id: "reviews", title: "Đánh giá", icon: "star-outline" },
  { id: "location", title: "Vị trí", icon: "location-outline" },
]

export default function SpaDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { spaCache, reviewsCache, fetchSpaData } = useContext(SpaContext)
  const [spa, setSpa] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [mapModalVisible, setMapModalVisible] = useState(false)
  const [fullImageVisible, setFullImageVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const scrollViewRef = useRef(null)

  // Auto-scroll slider
  useEffect(() => {
    if (!spa || !spa.images || spa.images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % spa.images.length
        scrollViewRef.current?.scrollTo({
          x: nextIndex * styles.sliderImage.width,
          animated: true,
        })
        return nextIndex
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [spa])

  // Fetch spa data from context
  useEffect(() => {
    const loadSpaData = async () => {
      setIsLoading(true)
      if (spaCache[id] && reviewsCache[id]) {
        setSpa(spaCache[id])
        setReviews(reviewsCache[id])
        // Set cached region if not already set
        if (!cachedRegion && spaCache[id].coordinates) {
          cachedRegion = {
            latitude: Number(spaCache[id].coordinates.latitude),
            longitude: Number(spaCache[id].coordinates.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
      } else {
        const { spa, reviews } = await fetchSpaData(id)
        setSpa(spa)
        setReviews(reviews)
        // Set cached region for new data
        if (spa && spa.coordinates && !cachedRegion) {
          cachedRegion = {
            latitude: Number(spa.coordinates.latitude),
            longitude: Number(spa.coordinates.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
      }
      setIsLoading(false)
    }

    if (id) {
      loadSpaData()
    }
  }, [id, spaCache, reviewsCache, fetchSpaData])

  const handleImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize)
    setCurrentImageIndex(index)
  }

  const openGoogleMaps = () => {
    if (!spa) return
    const { latitude, longitude } = spa.coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    Linking.openURL(url).catch(() => {
      Alert.alert("Lỗi", "Không thể mở Google Maps")
    })
  }

  const callPhone = () => {
    if (!spa || !spa.phone || spa.phone === "N/A") return
    Linking.openURL(`tel:${spa.phone}`)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(<Ionicons key={i} name={i <= rating ? "star" : "star-outline"} size={16} color={styles.ratingNumber.color} />)
    }
    return stars
  }

  const handleImagePress = (image) => {
    setSelectedImage(image)
    setFullImageVisible(true)
  }

  // Skeleton Loader
  const SkeletonLoader = () => (
    <View style={styles.container}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.skeletonImage}
        shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
      />
      <View style={styles.spaInfo}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.skeletonTitle}
          shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.skeletonRating}
          shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        />
      </View>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <ShimmerPlaceholder
            key={tab.id}
            LinearGradient={LinearGradient}
            style={styles.skeletonTab}
            shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          />
        ))}
      </View>
      <View style={styles.tabContent}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.skeletonSection}
          shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        />
        {activeTab === "location" && (
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.skeletonMap}
            shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          />
        )}
      </View>
    </View>
  )

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={styles.directionButton.backgroundColor} />
          <Text style={styles.infoText}>{spa.address}</Text>
        </View>
        <TouchableOpacity style={styles.infoRow} onPress={callPhone}>
          <Ionicons name="call" size={20} color={styles.directionButton.backgroundColor} />
          <Text style={[styles.infoText, styles.phoneText]}>{spa.phone}</Text>
        </TouchableOpacity>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={20} color={styles.directionButton.backgroundColor} />
          <Text style={styles.infoText}>
            {spa.openTime} - {spa.closeTime}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Đang mở</Text>
          </View>
        </View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <Text style={styles.descriptionText}>{spa.description}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Dịch vụ</Text>
        <View style={styles.servicesContainer}>
          {spa.services.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.reviewSummary}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingNumber}>{spa.rating ? spa.rating.toFixed(1) : "Chưa có"}</Text>
          <View style={styles.starsContainer}>{renderStars(Math.floor(spa.rating || 0))}</View>
          <Text style={styles.reviewCount}>({spa.reviewCount || 0} đánh giá)</Text>
        </View>
      </View>
      {reviews.length === 0 ? (
        <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.avatar }} style={styles.avatar} />
              <View style={styles.reviewInfo}>
                <Text style={styles.userName}>{review.userName}</Text>
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))
      )}
    </View>
  )

  const renderLocationTab = () => {
    if (!spa || !spa.coordinates || !spa.coordinates.latitude || !spa.coordinates.longitude) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.errorText}>Không có thông tin vị trí.</Text>
        </View>
      )
    }

    const region = cachedRegion || {
      latitude: Number(spa.coordinates.latitude),
      longitude: Number(spa.coordinates.longitude),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Vị trí trên bản đồ</Text>
          <Text style={styles.addressText}>{spa.address}</Text>
          <TouchableOpacity style={styles.mapContainer} onPress={() => setMapModalVisible(true)}>
            <MapView
              style={styles.map}
              initialRegion={region}
              region={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              loadingEnabled={true}
              loadingIndicatorColor={styles.directionButton.backgroundColor}
              loadingBackgroundColor={styles.container.backgroundColor}
            >
              <Marker
                coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                title={spa.name}
                description={spa.address}
              />
            </MapView>
          </TouchableOpacity>
          <View style={styles.mapActions}>
            <TouchableOpacity style={styles.directionButton} onPress={openGoogleMaps}>
              <Ionicons name="navigate" size={20} color={styles.directionText.color} />
              <Text style={styles.directionText}>Chỉ đường</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton} onPress={callPhone}>
              <Ionicons name="call" size={20} color={styles.callButtonText.color} />
              <Text style={styles.callButtonText}>Gọi điện</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  if (isLoading) {
    return <SkeletonLoader />
  }

  if (!spa) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin spa!</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={styles.backButtonText.color} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => setIsFavorite(!isFavorite)}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? styles.directionButton.backgroundColor : styles.backButtonText.color}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Image Slider */}
        <View style={styles.imageSliderContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {spa.images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => handleImagePress(image)}>
                <Image source={{ uri: image }} style={styles.sliderImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.imageIndicators}>
            {spa.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.indicator, currentImageIndex === index && styles.activeIndicator]}
                onPress={() => {
                  scrollViewRef.current?.scrollTo({
                    x: index * styles.sliderImage.width,
                    animated: true,
                  })
                  setCurrentImageIndex(index)
                }}
              />
            ))}
          </View>
        </View>

        {/* Spa Info */}
        <View style={styles.spaInfo}>
          <Text style={styles.spaName}>{spa.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>{renderStars(Math.floor(spa.rating || 0))}</View>
            <Text style={styles.ratingText}>{spa.rating ? spa.rating.toFixed(1) : "Chưa có"}</Text>
            <Text style={styles.reviewCountText}>({spa.reviewCount || 0} đánh giá)</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={20} color={activeTab === tab.id ? styles.directionButton.backgroundColor : styles.reviewCountText.color} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "reviews" && renderReviewsTab()}
        {activeTab === "location" && renderLocationTab()}
      </ScrollView>

      {/* Full Image Modal */}
      <Modal visible={fullImageVisible} transparent={true} onRequestClose={() => setFullImageVisible(false)}>
        <View style={styles.fullImageModal}>
          <TouchableOpacity style={styles.closeImageButton} onPress={() => setFullImageVisible(false)}>
            <Ionicons name="close" size={30} color={styles.backButtonText.color} />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} />}
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={styles.flex}>
          {spa.coordinates && spa.coordinates.latitude && spa.coordinates.longitude ? (
            <MapView
              style={styles.flex}
              initialRegion={cachedRegion || {
                latitude: Number(spa.coordinates.latitude),
                longitude: Number(spa.coordinates.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              region={cachedRegion || {
                latitude: Number(spa.coordinates.latitude),
                longitude: Number(spa.coordinates.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              loadingEnabled={true}
              loadingIndicatorColor={styles.directionButton.backgroundColor}
              loadingBackgroundColor={styles.container.backgroundColor}
            >
              <Marker
                coordinate={{
                  latitude: Number(spa.coordinates.latitude),
                  longitude: Number(spa.coordinates.longitude),
                }}
                title={spa.name}
                description={spa.address}
              />
            </MapView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không có thông tin vị trí.</Text>
            </View>
          )}
          <View style={styles.mapButtonContainer}>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.mapButtonText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton} onPress={openGoogleMaps}>
              <Text style={styles.mapButtonText}>Chỉ đường</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bottom Action Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.bookButton} onPress={() => router.push(`/user/booking/${spa.id}`)}>
          <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}