import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Dimensions, Linking } from 'react-native';
import { fetchIndividualGymData } from '../api/apiService';
import SlotSelectionScreen from './SlotSelectionScreen';
import AmenitiesListPopup from '../components/AmenitiesListPopup';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../components/Footer';

// Get screen width
const screenWidth = Dimensions.get('window').width;

const GymDetailScreen = ({ navigation, route }) => {
  const [gymData, setGymData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSlotSelectionVisible, setSlotSelectionVisible] = useState(false);
  const [showAmenitiesPopup, setShowAmenitiesPopup] = useState(false);
  const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);

  const { gym_id } = route.params;

  useEffect(() => {
    fetchGymData();
  }, []);

  const fetchGymData = async () => {
    try {
      const data = await fetchIndividualGymData(gym_id);
      setGymData(data);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / screenWidth);
    setCurrentIndex(index);
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const openSlotSelection = () => {
    setSlotSelectionVisible(true);
  };

  const closeSlotSelection = () => {
    setSlotSelectionVisible(false);
  };

  const toggleAmenitiesPopup = () => {
    setShowAmenitiesPopup(!showAmenitiesPopup);
  };

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.error('Error opening Google Maps:', err));
  };

  if (!gymData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const truncatedDescription = gymData.description.split(' ').slice(0, 50).join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color="#808080" />
          </TouchableOpacity>
          <Text style={styles.bookingPrompt}>Want to book your gym sessions with just a tap?</Text>
        </View>
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
          >
            {(gymData.images || []).map((image, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(image)}>
                <Image source={{ uri: image }} style={styles.image} />
              </TouchableOpacity>
            )) || (
              <Image
                source={{
                  uri: 'https://example.com/default_image.png',
                }}
                style={styles.image}
              />
            )}
          </ScrollView>

          {/* Dot Indicators */}
          <View style={styles.dotContainer}>
            {(gymData.images || []).map((_, index) => (
              <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
            ))}
          </View>
        </View>

        <Text style={styles.gymName}>{gymData.name}</Text>
        <Text style={styles.gymDescription}>
          {isDescriptionExpanded ? gymData.description : `${truncatedDescription}...`}
        </Text>
        <TouchableOpacity onPress={() => setDescriptionExpanded(!isDescriptionExpanded)}>
          <Text style={styles.showMoreText}>
            {isDescriptionExpanded ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.priceAvailabilityContainer}>
            <View style={styles.cityContainer}>
              <Text style={styles.city}>{gymData.addressLine1}: {gymData.city}</Text>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => openGoogleMaps(gymData.latitude, gymData.longitude)}
              >
                <Icon name="map-marker" size={30} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Amenities Display */}
        <View style={styles.amenitiesContainer}>
          <Text style={styles.amenitiesTitle}>What this gym offers:</Text>
          <View style={styles.amenitiesList}>
            {(gymData.equipment_list || []).slice(0, 4).map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.amenityText}>{amenity.equipment_name || 'Unnamed Equipment'}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={toggleAmenitiesPopup}>
            <Text style={styles.showAllText}>Show All Amenities</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={openSlotSelection}>
        <Text style={styles.buttonText}>Select Slot </Text>
      </TouchableOpacity>

      {/* Image Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>✖️</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* Amenities List Popup */}
      {showAmenitiesPopup && (
        <AmenitiesListPopup gymId={gym_id} onClose={toggleAmenitiesPopup} />
      )}

      {/* Slot Selection Modal */}
      <Modal visible={isSlotSelectionVisible} transparent={true} animationType="slide">
        <View style={styles.slotSelectionModal}>
          <TouchableOpacity style={styles.closeButton} onPress={closeSlotSelection}>
            <Text style={styles.closeButtonText}>✖️</Text>
          </TouchableOpacity>
          {gymData.slots ? (
            <SlotSelectionScreen navigation={navigation} gym={gymData} />
          ) : (
            <View style={styles.noSlotsContainer}>
              <Text style={styles.noSlotsText}>No slots available for this gym.</Text>
            </View>
          )}
        </View>
      </Modal>
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: '#fff',
  marginTop: 0,
  paddingTop: 20, // Add padding to the top
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  headerContainer: {
    marginBottom: 15,
    marginTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center', // Center vertically
  },
  backButton: {
    marginRight: 20,
    paddingLeft: 20,
    color: '#808080'  
  },
  imageContainer: {
    position: 'relative',
  },
  imageScroll: {
    marginTop: 10,
  },
  image: {
    width: screenWidth, // Adjusted to fit the screen width
    height: 200,
    borderRadius: 10,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 10, // Positioning the dots within the image area
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#bbb',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  
  
  },
  bookingPrompt: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  card: {
    padding: 20,
    marginBottom: 15,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    fontFamily: 'Roboto',
    marginTop: 10, // Space between image and gym name
  },
  mapButton: {
    marginLeft: 10
  },
  gymDescription: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto',
    marginBottom: 5,
  },
  priceAvailabilityContainer: {
    marginVertical: 5,
  },
  cityContainer: {
    flexDirection: 'row',  // Ensures icon and text are in the same row
    alignItems: 'center',  // Vertically centers the content
  },
  city: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto',
  },
  amenitiesContainer: {
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  amenitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4CAF50',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '45%',
  },
  amenityText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  showAllText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  bottomSpacing: {
    height: 50,
  },
  button: {
    position: 'absolute',
    bottom: 80, // Fixed position of the button at the bottom
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20, // Reduced size from 30 to 24
    color: '#4CAF50', // Changed color to green
  },
  slotSelectionModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  showMoreText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },

});

export default GymDetailScreen;
