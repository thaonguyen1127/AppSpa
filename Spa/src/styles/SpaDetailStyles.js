import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    height: 250,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.white,
    width: 12,
  },
  spaInfo: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  spaName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.pink,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.pink,
    marginTop: 8,
  },
  ratingSummary: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.pink,
  },
  tabText: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.pink,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: Colors.white,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: Colors.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 14,
    color: Colors.pink,
    fontWeight: '500',
  },
  noServicesText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 12,
  },
  addressText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  mapActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pink,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: width * 0.75,
    resizeMode: 'contain',
  },
  closeImageButton: {
    position: 'absolute',
    top: 40,
    right: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  fullMap: {
    flex: 1,
  },
  mapButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
  },
  bookButtonContainer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  bookButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  skeletonImage: {
    width: width,
    height: 250,
  },
  skeletonTitle: {
    width: '80%',
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonRating: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
  skeletonTab: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});