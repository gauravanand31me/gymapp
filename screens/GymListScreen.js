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
import { fetchAllGyms, storePushToken, userDetails } from '../api/apiService';
import Footer from '../components/Footer';
import * as Linking from 'expo-linking';
import SearchHeader from '../components/SearchComponent';
import GymLoader from '../components/GymLoader';
import PromotionalBanner from '../components/PromotionalBanner';



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
  const [page, setPage] = useState(1);
  const [hasMoreGyms, setHasMoreGyms] = useState(true);
  const limit = 3;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false); // Show modal initially
  const [isLocation, setIsLocation] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});


  useEffect(() => {
    console.log("Initial useEffect running")
    checkLogin();
    getLocation();
   
  }, [])

  useEffect(() => {
    console.log("Initial useEffect running");
    checkLocationPermission();
  }, []);

  const checkLogin = async () => {
    const data = await userDetails();
    if (!data) {
      setIsLoggedIn(false);
      setUserData({});
    } else {
      setIsLoggedIn(true);
      setUserData(data);
      await storePushToken();
    }
  }

  useFocusEffect(
    useCallback(() => {
      checkLogin();
      console.log("Screen focused")
      if (lat && long && gyms.length === 0) {
        console.log("Fetching gyms on focus")
        fetchGyms(lat, long)
      }
    }, [lat, long, gyms.length, error]),
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
        console.log("Location permission denied, using default location.");
        setLocationPermissionGranted(false);
        setLat(12.9124);
        setLong(77.6416);
        fetchGyms(12.9124, 77.6416); // Fetch gyms for default location
        fetchAddress(12.9124, 77.6416); // Fetch address for default location
        return;
      }
      setShowLocationModal(false);
      const location = await Location.getCurrentPositionAsync({})
      console.log("Location obtained:", location.coords)
      setLat(location.coords.latitude)
      setLong(location.coords.longitude)
      fetchAddress(location.coords.latitude, location.coords.longitude)
      setError("");
    } catch (error) {
      setError(error);
      console.error("Error getting location:", error)
      setPage(1);
      setLat(12.9124);
      setLong(77.6416);
      fetchGyms(12.9124, 77.6416);
      fetchAddress(12.9124, 77.6416);
      setIsLocation(false);
      //Alert.alert("Error", "Could not retrieve location. Please try again later.")
    }
  };

  const fetchGyms = async (latitude, longitude) => {
    console.log("Fetching gyms", { latitude, longitude, page })
    
    if (page === 1) {
      setLoading(true)
      
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
          {item.distance && isLocation ? `${item.distance.toFixed(1)} km away` : "N/A"}
        </Text>
        <Text style={styles.gymPrice}>₹ {item.subscriptionPrices?.[0] || "N/A"}/Session</Text>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={() => navigation.navigate("GymDetails", { gym_id: item.gymId })}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.smallText}>Other subscription options are also available.</Text>
        <View style={styles.verifiedContainer}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.verifiedText}>Verified by Yupluck</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  

  const renderLoadingGym = () => <GymLoader />
  return (
    <>
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

      <SearchHeader data={userData} fetchGymsByPincode={fetchGymsByPincode} setPincode={setPincode} address={address} pincode={pincode} navigation={navigation} lat={lat} long={long}/>

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
      {!isKeyboardVisible && isLoggedIn && <Footer navigation={navigation} style={styles.footer} />}
      {!isLoggedIn && <PromotionalBanner navigation={navigation} />}
      </KeyboardAvoidingView>
    
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Light elegant background
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#2E7D32', // Muted professional green
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  locationText: {
    color: '#E3F2FD', // Soft light blue for contrast
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  pincodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  pincodeInput: {
    flex: 1,
    color: '#333333', // Deep charcoal for text readability
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
  },
  searchGymButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 14,
    borderRadius: 30,
  },
  searchGymText: {
    color: '#E3F2FD', // Light blue for elegance
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  gymCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gymImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  gymInfo: {
    marginLeft: 14,
    flex: 1,
  },
  gymName: {
    fontSize: 15, // Slightly smaller
    fontWeight: '600', // Medium-bold for elegance
    color: '#1B5E20', // Dark green for premium feel
    letterSpacing: 0.3, // Slight spacing for refined look
    textTransform: 'capitalize', // Capitalize each word
  },
  gymDistance: {
    fontSize: 14,
    color: '#555', // Softer dark gray
    marginBottom: 5,
  },
  gymPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388E3C', // Slightly deeper green
    marginBottom: 10,
  },
  bookNowButton: {
    backgroundColor: '#1B5E20', // Dark green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-end',
    marginTop: 8,
    elevation: 3,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  starContainer: {
    flexDirection: 'row',
    marginLeft: 10,
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
    elevation: 3,
  },
  smallText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verifiedText: {
    fontSize: 13,
    color: '#388E3C',
    marginLeft: 5,
  },
});



