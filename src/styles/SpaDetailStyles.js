import { StyleSheet, Dimensions } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const Colors = {
  pink: "#FF1493",
  lightPink: "#FFE4E1",
  backgroundPink: "#FFF0F5",
  gray: "#999",
  lightGray: "#f8f9fa",
  white: "#ffffff",
  black: "#333",
  green: "#4CAF50",
  orange: "#FF9800",
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonError: {
    backgroundColor: Colors.pink,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageSliderContainer: {
    height: 250,
    position: "relative",
  },
  sliderImage: {
    width: screenWidth,
    height: 250,
    resizeMode: "cover",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: Colors.white,
  },
  spaInfo: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  spaName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginRight: 5,
  },
  reviewCountText: {
    fontSize: 14,
    color: Colors.gray,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.pink,
  },
  tabText: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 5,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.pink,
    fontWeight: "600",
  },
  tabContent: {
    backgroundColor: Colors.white,
    paddingBottom: 100,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 10,
    flex: 1,
  },
  phoneText: {
    color: Colors.pink,
    textDecorationLine: "underline",
  },
  statusBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: "",
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceTag: {
    backgroundColor: Colors.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  serviceText: {
    color: Colors.pink,
    fontSize: 14,
    fontWeight: "500",
  },
  reviewSummary: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.pink,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 5,
  },
  noReviewsText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    padding: 20,
  },
  reviewItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 10,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
  },
  locationSection: {
    padding: 20,
  },
  addressText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 15,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  mapActions: {
    flexDirection: "row",
    gap: 10,
  },
  directionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.pink,
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.green,
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: screenWidth,
    height: screenWidth * (3 / 4),
    resizeMode: "contain",
  },
  closeImageButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  mapButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mapButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomAction: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColorBottomColor: "#f0f0f0",
  },
  bookButtonContainer: {
    backgroundColor: Colors.pink,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  bookContainerText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  skeletonImage: {
    width: screenWidth,
    height: 250,
    borderRadius: 0,
  },
  skeletonTitle: {
    width: "80%",
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonRating: {
    width: "60%",
    height: 16,
    borderRadius: 4,
  },
  skeletonTab: {
    flex: 1,
    height: 50,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  skeletonSection: {
    width: "90%",
    height: 100,
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  skeletonMap: {
    width: "90%",
    height: 200,
    marginHorizontal: 20,
    borderRadius: 10,
  }
})

export default styles