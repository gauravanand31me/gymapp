import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { fetchIndividualGymData } from '../api/apiService'
import SlotSelectionScreen from './SlotSelectionScreen'
import AmenitiesListPopup from '../components/AmenitiesListPopup'
import Icon from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const screenWidth = Dimensions.get('window').width

export default function GymDetailScreen({ navigation, route }) {
  const [gymData, setGymData] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showAmenitiesPopup, setShowAmenitiesPopup] = useState(false)
  const [isDescriptionExpanded, setDescriptionExpanded] = useState(false)

  const { gym_id } = route.params

  useEffect(() => {
    fetchGymData()
  }, [])

  const fetchGymData = async () => {
    try {
      const data = await fetchIndividualGymData(gym_id)
      setGymData(data)
    } catch (error) {
      console.error('Error fetching gyms:', error)
    }
  }

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.floor(contentOffsetX / screenWidth)
    setCurrentIndex(index)
  }

  const openModal = (image) => {
    setSelectedImage(image)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedImage(null)
  }

  const openSlotSelection = () => {
    navigation.navigate("SlotSelection", { gym: gymData })
  }

  const toggleAmenitiesPopup = () => {
    setShowAmenitiesPopup(!showAmenitiesPopup)
  }

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`
    Linking.openURL(url).catch((err) => console.error('Error opening Google Maps:', err))
  }

  if (!gymData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  const truncatedDescription = gymData.description.split(' ').slice(0, 50).join(' ')

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gym Details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.imageScroll}
            snapToInterval={screenWidth}
          >
            {(gymData.images || []).map((image, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(image)}>
                <Image source={{ uri: image }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dotContainer}>
            {(gymData.images || []).map((_, index) => (
              <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.gymName}>{gymData.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{gymData.rating} ({gymData.reviews} reviews)</Text>
          </View>
          <Text style={styles.gymDescription}>
            {isDescriptionExpanded ? gymData.description : `${truncatedDescription}...`}
          </Text>
          <TouchableOpacity onPress={() => setDescriptionExpanded(!isDescriptionExpanded)}>
            <Text style={styles.showMoreText}>
              {isDescriptionExpanded ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>

          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={24} color="#4CAF50" />
            <Text style={styles.locationText}>{gymData.addressLine1}, {gymData.city}</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => openGoogleMaps(gymData.latitude, gymData.longitude)}
            >
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amenitiesContainer}>
            <Text style={styles.sectionTitle}>What this gym offers:</Text>
            <View style={styles.amenitiesList}>
              {(gymData.equipment_list || []).slice(0, 4).map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.amenityText}>{amenity.equipment_name || 'Unnamed Equipment'}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={toggleAmenitiesPopup} style={styles.showAllButton}>
              <Text style={styles.showAllText}>Show All Amenities</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.bookButton} onPress={openSlotSelection}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
        </View>
      </Modal>

      {showAmenitiesPopup && (
        <AmenitiesListPopup gymId={gym_id} onClose={toggleAmenitiesPopup} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  imageContainer: {
    position: 'relative',
  },
  imageScroll: {
    height: screenWidth * 0.75,
  },
  image: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  infoContainer: {
    padding: 16,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  gymDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 12,
  },
  showMoreText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  mapButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  amenitiesContainer: {
    marginTop: 16,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  showAllButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  showAllText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  bookButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
})