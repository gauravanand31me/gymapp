import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { fetchAllGyms } from '../api/apiService';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../components/Header';
import { Link } from '@react-navigation/native';
import { Button } from 'react-native-elements';

export default function GymListScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [gyms, setGyms] = useState([]);
  const [address, setAddress] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMoreGyms, setHasMoreGyms] = useState(true);
  const [fullName, setFullName] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Track keyboard visibility
  const limit = 9;
 
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCe_VHcmc7i6jbNl0oFDVHwQyavPgYFU10';  // Replace with your actual API key

  useEffect(() => {
    
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const fetchGyms = async (lat, long, searchText = '', page = 1) => {
    setLoading(true);
    setError('');
    try {
      const gymList = await fetchAllGyms(lat, long, searchText, limit, page, pincode);
      console.log("gymList", gymList);
      if (gymList?.length > 0) {
        setGyms(gymList);
      } else {
        setHasMoreGyms(false);
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      setError('Failed to fetch gyms. Please check your network connection.');
      Alert.alert('Error', 'Failed to load gyms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to access your location.');
        setError('Location permission denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      fetchGyms(location.coords.latitude, location.coords.longitude, searchText, page);
      fetchAddress(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to retrieve location. Please try again.');
      Alert.alert('Error', 'Could not retrieve location. Please try again later.');
      fetchGyms();
    }
  };

  const fetchAddress = async (lat, long) => {
    try {
      const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`);
      if (response.data) {
        setAddress(response.data.city || response.data.locality || 'Unknown location');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Error fetching address');
      setError('Unable to retrieve address details.');
    }
  };

  const fetchLatLongFromPincode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_MAPS_API_KEY}`);
      
      if (response.data.results && response.data.results?.length > 0) {
        const location = response.data.results[0].geometry.location;
        fetchAddress(location.lat, location.lng);
        fetchGyms(location.lat, location.lng, searchText, 1); // Fetch gyms for the new location
      } else {
        setError('Invalid pincode or no results found.');
        Alert.alert('Invalid Pincode', 'Could not retrieve location for the given pincode.');
      }
    } catch (error) {
      console.error('Error fetching location from pincode:', error);
      setError('Failed to retrieve location. Please try again.');
      Alert.alert('Error', 'Could not retrieve location for the entered pincode.');
    } finally {
      setLoading(false);
    }
  };

  const validatePincode = () => {
    
    if (!pincode || pincode?.length !== 6 || isNaN(pincode)) {
      return false;
    }
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      // Re-fetch gyms or reset page whenever screen is focused
      setPage(1);  // Reset the page if necessary
      getLocation();  // Fetch location and gyms again when navigation focuses back on this screen
    }, [])
  );

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setLoading(true);
      if (!validatePincode()) {
        getLocation();
      } else {
        fetchLatLongFromPincode();
      }
      setLoading(false);
    }, 2000); // Delay of 2 seconds

    return () => clearTimeout(timer);
  }, [page]);

  useEffect(() => {
   
    if (validatePincode()) {
      fetchLatLongFromPincode();  // Fetch location based on pincode when changed
    }
  }, [pincode]);

  const loadMoreGyms = () => {
    if (hasMoreGyms && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const redirectToGymDetails = (gymId) => {
    navigation.navigate('GymDetails', { gym_id: gymId });
  };

  const handleSearch = async () => {
    setPincode('')
    getLocation(); 
  }

  const renderGym = ({ item }) => (
    <TouchableOpacity style={styles.gymCard} onPress={() => redirectToGymDetails(item.gymId)}>
      <Image source={{ uri: item.images?.[0]?.imageUrl || 'https://www.hussle.com/blog/wp-content/uploads/2020/12/Gym-structure-1080x675.png' }} style={styles.gymImage} />
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{item.gymName}</Text>

        <Text style={styles.gymPrice}>₹ {item.subscriptionPrices?.[0] || 'N/A'}/session</Text>
        <Text style={styles.gymAddress}>
          <Text style={styles.locationIcon}>📍</Text>
          {item.address ? item.address.split(',').pop().trim() : 'Address not available'}
        </Text>
        <Text style={styles.gymDistance}>📍 {(item.distance ? item.distance.toFixed(1) : 'N/A')} km</Text>
        <Text style={styles.gymRating}>⭐ {item.gymRating || 'N/A'}</Text>
        <TouchableOpacity style={styles.bookNowButton} onPress={() => redirectToGymDetails(item.gymId)}>
          <Text style={styles.bookNowText}>
            <Icon name="check-circle" size={18} color="#fff" /> Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.locationPincodeContainer}>
            <Text style={styles.locationText}>
              <MaterialIcon name="location-on" size={20} color="#fff" />
              {address || 'Fetching location...'}
            </Text>
            <Text style={styles.orText}> or </Text>

            <TextInput
              style={styles.pincodeInput}
              placeholder="Enter pincode"
              placeholderTextColor="#ccc"
              value={pincode}
              onChangeText={(text) => {
                setPincode(text);
                if (text === '') {
                  setError('');  // Clear error when pincode is empty
                }
              }}
              keyboardType="numeric"
            />
          </View>

        </View>
        <Text style={styles.greetingText}>Hey {fullName}, looking for a gym or a workout buddy?</Text>
        <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search nearby gyms"
        placeholderTextColor="#ccc"
        value={searchText}
        onChangeText={setSearchText}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />
      <TouchableOpacity  style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
      </View>


      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <FlatList
        data={gyms}
        renderItem={renderGym}
        keyExtractor={(item) => item.gymId.toString()}
        ListFooterComponent={
          <>
            {loading ? <ActivityIndicator size="large" color="#f4511e" /> : null}

            {!loading && (
              <TouchableOpacity style={styles.seeMoreButton} onPress={loadMoreGyms}>
                <Text style={styles.seeMoreText}>See More Results</Text>
              </TouchableOpacity>
            )}
          </>
        }
      />



      {!isKeyboardVisible && <Footer navigation={navigation} />}
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    height: 200,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  locationPincodeContainer: {
    flexDirection: 'row', // Row direction to align location text and input
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  pincodeInput: {
    flex: 1,
    height: 30,
    color: '#000',
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,  // Increase the border width for a bolder look
    borderRadius: 5,
    paddingHorizontal: 10,
  
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#66BB6A',  // Customize your button color
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymList: {
    paddingBottom: 80, // Add some padding at the bottom
  },
  gymCard: {
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row', // Arrange items in a row
    justifyContent: 'space-between', // Space between elements
    alignItems: 'center', // Align items vertically centered
    backgroundColor: '#fff',

  },
  gymImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  gymInfo: {
    marginLeft: 10,
    flex: 1,
    paddingBottom: 20,
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    color: "#666"
  },
  gymDescription: {
    fontSize: 14,
    color: '#777',
  },
  gymPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  gymDistance: {
    fontSize: 14,
    color: '#777',
  },
  gymRating: {
    fontSize: 14,
    color: '#777',
  },
  bookNowButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: -15,
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orText: {
    color: '#fff', // Adjust the color if needed
    marginHorizontal: 5, // Space around the text
    fontSize: 16, // Adjust the size to match surrounding text
    fontWeight: "bold"
  },
  seeMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    margin: 20,
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  gymAddress: {
    fontSize: 16,
    color: '#4a4a4a',      // Softer grey for modern look
    fontWeight: '500',      // Medium weight for emphasis
    paddingVertical: 5,     // Add padding for better spacing
    textAlign: 'left',      // Align left for readability
  },
  locationIcon: {
    fontSize: 18,           // Make icon slightly larger than text
    color: '#ff6347',       // Use a highlight color for the icon (e.g., a soft red)
    paddingRight: 5,        // Space between icon and text
  },
});