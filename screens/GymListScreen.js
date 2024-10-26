import React, { useEffect, useState, useCallback } from 'react';
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
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { fetchAllGyms } from '../api/apiService';
import Footer from '../components/Footer';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCe_VHcmc7i6jbNl0oFDVHwQyavPgYFU10';

export default function GymListScreen({ navigation }) {
  const [gyms, setGyms] = useState([]);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [isFooterVisible, setIsFooterVisible] = useState(true); // New state for footer visibility

  useEffect(() => {
    getLocation();

    // Keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsFooterVisible(false); // Hide footer when keyboard is shown
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsFooterVisible(true); // Show footer when keyboard is hidden
    });

    // Cleanup listeners on component unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPincode("");
      getLocation();
      return () => {
        console.log("Screen is unfocused!");
      };
    }, [])
  );

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to access your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude);
      setLong(location.coords.longitude);
      fetchAddress(location.coords.latitude, location.coords.longitude);
      fetchGyms(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not retrieve location. Please try again later.');
    }
  };

  const fetchGyms = async (lat, long) => {
    setLoading(true);
    try {
      const response = await fetchAllGyms(lat, long);
      setGyms(response);
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to load gyms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (lat, long) => {
    try {
      const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`);
      if (response.data) {
        setAddress(response.data.city || 'Unknown location');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Location not available');
    }
  };

  const fetchGymsByPincode = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_MAPS_API_KEY}`);
      const location = response.data.results[0].geometry.location;
      const addressComponents = response.data.results[0].address_components;

      const cityComponent = addressComponents.find(component =>
        component.types.includes("locality") || component.types.includes("administrative_area_level_2")
      );

      const city = cityComponent ? cityComponent.long_name : null;
      setAddress(city || 'Unknown location');
      console.log("location", response.data.results[0].geometry);
      setLat(location.lat);
      setLong(location.lng);
      fetchGyms(location.lat, location.lng);
    } catch (error) {
      console.error('Error fetching location from pincode:', error);
      Alert.alert('Error', 'Could not retrieve location for the entered pincode.');
    } finally {
      setLoading(false);
    }
  };

  const renderGym = ({ item }) => (
    <View style={styles.gymCard}>
      <TouchableOpacity  onPress={() => navigation.navigate('GymDetails', { gym_id: item.gymId })}>
      <Image source={{ uri: item.images?.[0]?.imageUrl || 'https://example.com/default-gym.png' }} style={styles.gymImage} />
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{item.gymName}</Text>
        <Text style={styles.gymDistance}>📍 {item.distance ? item.distance.toFixed(1) : 'N/A'} km away</Text>
        <Text style={styles.gymPrice}>₹ {item.subscriptionPrices?.[0] || 'N/A'}/session</Text>
        <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('GymDetails', { gym_id: item.gymId })}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.locationText}>
          <MaterialIcon name="location-on" size={18} color="#fff" /> {address || 'Fetching location...'}
        </Text>
        <View style={styles.pincodeContainer}>
          <TextInput
            style={styles.pincodeInput}
            placeholder="Enter pincode"
            placeholderTextColor="#ccc"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={fetchGymsByPincode} style={styles.searchButton}>
            <Icon name="search" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.searchGymButton}
          onPress={() => navigation.navigate('SearchGym', { lat, long })}
        >
          <MaterialIcon name="search" size={20} color="#fff" />
          <Text style={styles.searchGymText}>Search nearby Gym</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGym}
          keyExtractor={(item) => item.gymId.toString()}
          contentContainerStyle={styles.gymList}
        />
      )}
      {isFooterVisible && <Footer navigation={navigation} />} 
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingtop: 30
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    paddingTop: 30,
  },
  messageContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
  },
  pincodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // Change background color to white
    paddingVertical: 4, // Reduce vertical padding for height adjustment
    paddingHorizontal: 8,
    borderRadius: 5,
    height: 35, // Set a specific height for the pincode container
  },
  pincodeInput: {
    flex: 1,
    color: '#000', // Make text color black for better contrast
    padding: 5,
    height: '100%', // Ensure it takes up the full container height
  },
  searchButton: {
    padding: 5,
    marginLeft: 5,
    borderRadius: 5,
  },
  searchGymButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  searchGymText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  gymList: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  gymCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  gymImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  gymInfo: {
    padding: 15,
    alignItems: 'center',
  },
  gymName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  gymDistance: {
    fontSize: 14,
    color: '#757575',
    marginVertical: 5,
  },
  gymPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loader: {
    marginTop: 20,
  },
  bookNowButton: {
    backgroundColor: '#4CAF50', // Vibrant orange color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
    marginTop: 10,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});