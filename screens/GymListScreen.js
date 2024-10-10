import React, { useEffect, useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { fetchAllGyms } from '../api/apiService';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import CustomHeader from '../components/Header';

export default function GymListScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [gyms, setGyms] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [address, setAddress] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); 
  const [hasMoreGyms, setHasMoreGyms] = useState(true);
  const [fullName, setFullName] = useState(''); 
  const [isInputFocused, setIsInputFocused] = useState(false); 
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const limit = 9;

  const GOOGLE_MAPS_API_KEY = '<<AP _KEY>>';  // Replace with your actual API key

  const fetchGyms = async (lat, long, searchText = '', page = 1) => {
    if ((loading || !hasMoreGyms) && !searchText) return; 
    setLoading(true);
    setError('');
    try {
      const gymList = await fetchAllGyms(lat, long, searchText, limit, page, pincode);
   
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
      console.log("Status nis", status);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to access your location.');
        setError('Location permission denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log("Fetching all gyms near you")
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

  // const fetchUserName = async () => {
  //   try {
  //     const user = await AsyncStorage.getItem('user');
  //     if (user) {
  //       const userInfo = JSON.parse(user);
  //       setFullName(userInfo.full_name || ''); 
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user name:', error);
  //     setError('Unable to load user details.');
  //   }
  // };

  // Function to fetch latitude and longitude based on pincode
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
      //Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true); // Set loading to true before validation
      if (!validatePincode()) {
        getLocation();
      } else {
        fetchLatLongFromPincode();
      }
      setLoading(false); // Set loading to false after the operation
    }, 2000); // Delay of 2 seconds

    return () => clearTimeout(timer); // Clear timeout on unmount
  }, [searchText]);

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

  const renderGym = ({ item }) => (
    <TouchableOpacity style={styles.gymCard} onPress={() => redirectToGymDetails(item.gymId)}>
      <Image source={{ uri: item.images?.[0]?.imageUrl || 'https://www.hussle.com/blog/wp-content/uploads/2020/12/Gym-structure-1080x675.png' }} style={styles.gymImage} />
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{item.gymName}</Text>
        <Text style={styles.gymDescription}>
          {item.gymDescription ? item.gymDescription.substring(0, 100) + '...' : 'No description available'}
        </Text>
        <Text style={styles.gymPrice}>₹ {item.subscriptionPrices?.[0] || 'N/A'}/session</Text>
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
            <TextInput
              style={styles.pincodeInput}
              placeholder="Enter pincode"
              placeholderTextColor="#ccc"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
            />
          </View>
          
        </View>
        <Text style={styles.greetingText}>Hey {fullName}, looking for a gym or a workout buddy?</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search nearby gyms"
          placeholderTextColor="#ccc"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsInputFocused(true)} 
          onBlur={() => setIsInputFocused(false)} 
        />
      </View>

      {loading && <ActivityIndicator size="large" color="#f4511e" style={styles.loader} />}
      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <FlatList
        data={gyms}
        renderItem={renderGym}
        keyExtractor={(item, index) => `${item.gymId}-${index}`}
        onEndReached={loadMoreGyms}
        onEndReachedThreshold={0.5}
        ListFooterComponent={hasMoreGyms && !loading ? <Text style={styles.loadMoreText}>Loading more gyms...</Text> : null}
      />
      <Footer navigation={navigation} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationPincodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    maxWidth: '70%',  // Ensures it doesn't overflow
  },
  pincodeInput: {
    backgroundColor: '#fff',
    color: '#333',
    padding: 10,
    borderRadius: 5,
    width: 120,
    textAlign: 'center',
    fontSize: 16,
  },
  greetingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    color: '#333',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  gymCard: {
    flexDirection: 'row',
    padding: 10,
    margin: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    elevation: 3,
  },
  gymImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  gymInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gymDescription: {
    fontSize: 14,
    color: '#666',
  },
  gymPrice: {
    fontSize: 14,
    color: '#f4511e',
  },
  gymDistance: {
    fontSize: 12,
    color: '#999',
  },
  gymRating: {
    fontSize: 12,
    color: '#333',
  },
  bookNowButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  errorMessage: {
    color: '#f00',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 16,
    color: '#666',
  },
});