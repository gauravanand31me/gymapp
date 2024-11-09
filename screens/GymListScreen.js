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
} from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { fetchAllGyms } from '../api/apiService';
import Footer from '../components/Footer';
import * as Linking from 'expo-linking';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAAMaXbIBC1IgC_B1kyALkcH87grvcSBhY';

export default function GymListScreen({ navigation }) {
  const [gyms, setGyms] = useState([]);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true); // For initial load
  const [loadingMore, setLoadingMore] = useState(false); // For loading more gyms
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreGyms, setHasMoreGyms] = useState(true);
  const [pageStart, setPageStart] = useState(false);
  const limit = 3;

  useFocusEffect(
    useCallback(() => {
      setPincode("");
      setGyms([]);
      setPage(1);
      setPageStart(true)
      setHasMoreGyms(true); // Reset hasMoreGyms on focus
    
      return () => {
        console.log("Screen is unfocused!");
      };
    }, [])
  );

  useEffect(() => {
    if (!pincode  && !pageStart) {
      getLocation();
    } else {
      fetchGyms(lat, long);
    }
    
  }, [page]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app requires location permission to show gyms nearby. Please enable location permissions in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
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
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await fetchAllGyms(lat, long, '', limit, page);
      console.log("page number received", response.length);
      
      if (response?.length > 0) {
        setHasMoreGyms(true);
        setGyms(prevGyms => [...prevGyms, ...response]);
      } else {
        setHasMoreGyms(false); // No more gyms to load
      }
      setPageStart(false)
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to load gyms. Please try again later.');
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
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
    setGyms([]);
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_MAPS_API_KEY}`);
      const location = response.data.results[0].geometry.location;
      const addressComponents = response.data.results[0].address_components;

      const cityComponent = addressComponents.find(component =>
        component.types.includes("locality") || component.types.includes("administrative_area_level_2")
      );

      const city = cityComponent ? cityComponent.long_name : null;
      setAddress(city || 'Unknown location');
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

  const loadMoreGyms = () => {
    if (hasMoreGyms && !loadingMore) {
      setPage(prevPage => prevPage + 1);
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
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGym}
          keyExtractor={(item) => item.gymId.toString()}
          contentContainerStyle={styles.gymList}
          onEndReached={loadMoreGyms}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#f4511e" />
            ) : hasMoreGyms ? null : (
              <Text style={styles.noMoreText}>No more gyms to load</Text>
            )
          }
          
        />
      )}
      {!loading && isFooterVisible && <Footer navigation={navigation}/>}
    </KeyboardAvoidingView>
  );
}

// Add styles here based on your preferences



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
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
  pincodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    height: 35,
  },
  pincodeInput: {
    flex: 1,
    color: '#000',
    padding: 5,
    height: '100%',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bookNowButton: {
    backgroundColor: '#4CAF50',
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
  noMoreText: {
    fontSize: 16,
    color: '#888',         // Soft gray color for subtlety
    textAlign: 'center',    // Center-align the text
    paddingVertical: 20,    // Add padding for spacing
    fontWeight: 'bold',     // Make it bold to stand out
    backgroundColor: '#f0f0f0', // Light background to make it pop
    borderRadius: 10,       // Rounded corners
    marginHorizontal: 40,   // Horizontal margin for centering
  },
});
