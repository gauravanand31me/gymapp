import React, { useState, useEffect, useCallback } from 'react';

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
  StatusBar,
  Share,
  Platform 
} from 'react-native';
import * as Sharing from "expo-sharing";
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from "expo-file-system";
import { fetchIndividualGymData, userDetails } from '../api/apiService';
import SlotSelectionScreen from './SlotSelectionScreen';
import AmenitiesListPopup from '../components/AmenitiesListPopup';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import GymLoader from '../components/GymLoader';

const screenWidth = Dimensions.get('window').width;

export default function GymDetailScreen({ navigation, route }) {
  const [gymData, setGymData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAmenitiesPopup, setShowAmenitiesPopup] = useState(false);
  const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { gym_id } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    fetchGymData();
    checkLogin();
  }, []);


  const checkLogin = async () => {
    const data = await userDetails();
    if (!data) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
      await storePushToken();
    }
  }


  useFocusEffect(
    useCallback(() => {
      fetchGymData();
    }, [gym_id])
  );

  const fetchGymData = async () => {
    try {
      const data = await fetchIndividualGymData(gym_id);
      setGymData(data);
    } catch (error) {
      console.error('Error fetching gym details:', error);
    } finally {
      setLoading(false);
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


  const shareGym = async (gymId, gymName, gymLocation, gymImages) => {
    try {
      const appDeepLink = `yupluck://GymDetails/${gymId}`;
      const webFallbackLink = `https://yupluck.com/appgym?id=${gymId}`; // Replace with actual link
  
      const message = `🔥 *Discover ${gymName}!* 🔥\n\n🏋️ *A Perfect Gym for Your Fitness!*  
  📍 *Location:* ${gymLocation}  
  📱 *Open in App:* ${appDeepLink}  
  🌐 *Book Online:* ${webFallbackLink}\n\n  
  🖼️ *Check Out These Images:*\n${gymImages.join("\n")}`;
  
      // Download images locally
      let downloadedImages = [];
      for (let imageUrl of gymImages) {
        const fileUri = `${FileSystem.cacheDirectory}${imageUrl.split("/").pop()}`;
        const downloadResumable = FileSystem.createDownloadResumable(imageUrl, fileUri);
        const { uri } = await downloadResumable.downloadAsync();
        downloadedImages.push(uri);
      }
  
      // Share multiple images (Only works on Telegram, Instagram, iMessage, AirDrop)
      if (Platform.OS === "ios") {
        await Share.share({ message, urls: downloadedImages }); // iOS supports multiple images in Share API
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedImages[0], {
          mimeType: "image/jpeg",
          dialogTitle: `Share ${gymName}`,
          UTI: "image/jpeg",
        });
  
        // Share text separately for platforms that don't support multiple images
        await Share.share({ message });
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const openSlotSelection = () => {
    navigation.navigate("SlotSelection", { gym: gymData });
  };

  const toggleAmenitiesPopup = () => {
    setShowAmenitiesPopup(!showAmenitiesPopup);
  };

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.error('Error opening Google Maps:', err));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <GymLoader />
      </View>
    );
  }

  const truncatedDescription = gymData?.description?.split(' ').slice(0, 50).join(' ');

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar Configuration */}
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text><Icon name="chevron-left" size={24} color="#4CAF50" /></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gymData.name}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                {imageLoading}
                <Image
                  source={{ uri: image }}
                  style={[styles.image, imageLoading ? styles.hidden : null]}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
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
          

          {/* <TouchableOpacity onPress={() => shareGym(gym_id, gymData.name, gymData.city, gymData.images)} style={styles.shareButton}>
            <Icon name="share-alt" size={20} color="#000" />
          </TouchableOpacity> */}

          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{gymData.rating} ({gymData.reviews} reviews)</Text>
          </View>
          <Text style={styles.gymDescription}>
            {isDescriptionExpanded ? gymData.description : `${truncatedDescription}...`}
          </Text>
          <TouchableOpacity onPress={() => setDescriptionExpanded(!isDescriptionExpanded)}>
            <Text style={styles.showMoreText}>{isDescriptionExpanded ? 'Show Less' : 'Show More'}</Text>
          </TouchableOpacity>

          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={24} color="#4CAF50" />
            <Text style={styles.locationText}>{gymData.addressLine1}, {gymData.city}</Text>
            <TouchableOpacity style={styles.mapButton} onPress={() => openGoogleMaps(gymData.latitude, gymData.longitude)}>
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

      {isLoggedIn && <TouchableOpacity style={styles.bookButton} onPress={openSlotSelection}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>}

      {!isLoggedIn && <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.bookButtonText}>Login</Text>
      </TouchableOpacity>}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
        </View>
      </Modal>

      {showAmenitiesPopup && <AmenitiesListPopup gymId={gym_id} onClose={toggleAmenitiesPopup} />}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light background for a clean look
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    elevation: 2, // Soft shadow for depth
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222222',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
    borderRadius: 12, // Rounded edges for a modern look
  },
  dotContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#43A047',
    opacity: 1,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // Lifted for a better transition
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#777777',
  },
  gymDescription: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 12,
  },
  showMoreText: {
    color: '#43A047',
    fontWeight: 'bold',
    marginBottom: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: '#555555',
    marginLeft: 8,
  },
  mapButton: {
    backgroundColor: '#43A047',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
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
    marginLeft: 10,
    fontSize: 15,
    color: '#555555',
  },
  showAllButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  showAllText: {
    color: '#43A047',
    fontWeight: 'bold',
  },
  
  bookButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1B5E20', // Fallback color
    paddingVertical: 18,
    borderRadius: 50, // Rounded for a premium feel
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden', // Needed for the gradient
  },
  
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  shareButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
  },
});

