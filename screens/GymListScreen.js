import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';
import axios from 'axios';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { fetchAllGyms, storePushToken } from '../api/apiService';
import Footer from '../components/Footer';
import * as Linking from 'expo-linking';
import SearchHeader from '../components/SearchComponent';
import GymLoader from '../components/GymLoader';
import LocationPermissionModal from "../components/LocationPermissionModal"; // Import modal



const { width } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyAAMaXbIBC1IgC_B1kyALkcH87grvcSBhY';

export default function GymListScreen({ navigation }) {
  const [gyms, setGyms] = useState([]);
  const currentRouteName = useNavigationState(state => state.routes[state.index].name);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreGyms, setHasMoreGyms] = useState(true);
  const limit = 3;
  const [unfocused, setUnfocused] = useState(false);
  const [imageload, setImageLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true); // Show modal initially
  
  useEffect(() => {
    console.log("Initial useEffect running")
    getLocation()
  }, [])

  useEffect(() => {
    console.log("Initial useEffect running");
    checkLocationPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused")
      if (lat && long && gyms.length === 0) {
        console.log("Fetching gyms on focus")
        fetchGyms(lat, long)
      }
    }, [lat, long, gyms.length]),
  )
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);


  const checkLocationPermission = async () => {
    setLoading(true) // Show GymLoader while checking permission
    setShowLocationModal(false) // Initially hide the modal

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      setShowLocationModal(false);
      getLocation();
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setShowLocationModal(true); // Keep modal open if denied
        return;
      }
      setShowLocationModal(false);
      const location = await Location.getCurrentPositionAsync({})
      console.log("Location obtained:", location.coords)
      setLat(location.coords.latitude)
      setLong(location.coords.longitude)
      fetchAddress(location.coords.latitude, location.coords.longitude)
    } catch (error) {
      console.error("Error getting location:", error)
      Alert.alert("Error", "Could not retrieve location. Please try again later.")
    }
  }

  const fetchGyms = async (latitude, longitude) => {
    console.log("Fetching gyms", { latitude, longitude, page })
    if (page === 1) {
      setLoading(true)
      await storePushToken()
    } else {
      setLoadingMore(true)
    }
    try {
      const response = await fetchAllGyms(latitude, longitude, "", limit, page)
      console.log("Gyms fetched:", response?.length)
      if (response?.length > 0) {
        setHasMoreGyms(true)
        setGyms((prevGyms) => (page === 1 ? response : [...prevGyms, ...response]))
      } else {
        setHasMoreGyms(false)
      }
    } catch (error) {
      console.error("Error fetching gyms:", error)
      Alert.alert("Error", "Failed to load gyms. Please try again later.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      )
      if (response.data) {
        setAddress(response.data.city || "Unknown location")
      }
    } catch (error) {
      console.error("Error fetching address:", error)
      setAddress("Location not available")
    }
  }

  const fetchGymsByPincode = async () => {
    if (!pincode.trim()) {
      Alert.alert("Error", "Please enter a valid pincode.")
      return
    }
    setLoading(true)
    setGyms([])
    setPage(1)
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_MAPS_API_KEY}`,
      )
      const location = response.data.results[0].geometry.location
      const addressComponents = response.data.results[0].address_components
      const cityComponent = addressComponents.find(
        (component) => component.types.includes("locality") || component.types.includes("administrative_area_level_2"),
      )
      const city = cityComponent ? cityComponent.long_name : null
      navigation.navigate("SearchGymList", { query: "", lat: location.lat, long: location.lng, city })
    } catch (error) {
      console.error("Error fetching location from pincode:", error)
      Alert.alert("Error", "Could not retrieve location for the entered pincode.")
    } finally {
      setLoading(false)
    }
  }

  const loadMoreGyms = () => {
    if (hasMoreGyms && !loadingMore) {
      setPage((prevPage) => prevPage + 1)
      fetchGyms(lat, long)
    }
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

    return (
      <View style={styles.starContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesome key={`full_${i}`} name="star" size={16} color="#FFD700" />
        ))}
        {halfStar && <FontAwesome name="star-half-o" size={16} color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesome key={`empty_${i}`} name="star-o" size={16} color="#FFD700" />
        ))}
      </View>
    )
  }

  const renderGym = ({ item }) => (
    <TouchableOpacity style={styles.gymCard} onPress={() => navigation.navigate("GymDetails", { gym_id: item.gymId })}>
      <Image
        source={{ uri: item.images?.[0]?.imageUrl || "https://example.com/default-gym.png" }}
        style={styles.gymImage}
      />
      <View style={styles.gymInfo}>
        <View style={styles.gymNameRating}>
          <Text style={styles.gymName}>{item.gymName}</Text>
          {renderStars(item.gymRating)}
        </View>
        <Text style={styles.gymDistance}>
          <MaterialIcons name="location-on" size={14} color="#757575" />
          {item.distance ? `${item.distance.toFixed(1)} km away` : "N/A"}
        </Text>
        <Text style={styles.gymPrice}>₹ {item.subscriptionPrices?.[0] || "N/A"}/hour</Text>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={() => navigation.navigate("GymDetails", { gym_id: item.gymId })}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderLoadingGym = () => <GymLoader />
  return (
    <>
      <LocationPermissionModal
  isVisible={showLocationModal}
  onPermissionGranted={() => {
    setShowLocationModal(false);
    getLocation();
  }}
/>
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       >
       {/* StatusBar Configuration */}
       <StatusBar
        barStyle="dark-content" 
        backgroundColor="#f5f5f5" 
        translucent={false} 
      />

      <SearchHeader fetchGymsByPincode={fetchGymsByPincode} setPincode={setPincode} address={address} pincode={pincode} navigation={navigation} lat={lat} long={long}/>

      {loading ? (
       <><GymLoader /><><FlatList
            data={[gyms]}
             /></></>
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGym}
          keyExtractor={(item) => item.gymId.toString()}
          contentContainerStyle={styles.gymList}
          onEndReached={loadMoreGyms}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            !hasMoreGyms ? (
              <Text style={styles.noMoreText}>No more gyms to load</Text>
            ) : null
          }
        />
      )}
      {!isKeyboardVisible && <Footer navigation={navigation} style={styles.footer} />}
      </KeyboardAvoidingView>
    
  </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center', // Ensures centering when loading

  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  locationText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  pincodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
  },
  pincodeInput: {
    flex: 1,
    color: '#333',
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  searchGymButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 25,
  },
  searchGymText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  gymList: {
    padding: 15,
  },
  gymCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  gymImage: {
    width: '100%',
    height: 180,
    
   
  },
  gymInfo: {
    padding: 15,
    fontSize: 10,
  },
  gymNameRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gymName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  gymDistance: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 5,
  },
  gymPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 12,
  },
  bookNowButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-end', // This moves the button to the right
    marginTop: 10,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    marginVertical: 20,
  },
  noMoreText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    padding: 20,
    fontWeight: '500',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
});