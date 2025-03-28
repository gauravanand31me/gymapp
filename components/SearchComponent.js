import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { userDetails } from '../api/apiService';

export default function SearchHeader({ 
  data,
  setPincode, 
  fetchGymsByPincode, 
  address, 
  pincode, 
  navigation, 
  lat, 
  long
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [profileImage, setProfileImage] = useState('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
  const [userName, setUserName] = useState(data.username);
  console.log("Data is", data);
  


  

  

  return (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />

      {/* Top Section with Location & Profile */}
  
  <View style={styles.topRow}>
    <View style={styles.locationContainer}>
      <MaterialIcons name="location-on" size={24} color="#fff" />
      <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
        {address || 'Fetching location...'}
      </Text>
    </View>

    {/* Profile Section */}
    <View style={styles.profileContainer}>
    
      {data?.username ? (
        <>
          <Text style={styles.userName} numberOfLines={1}>{data?.username ? data?.username : profileImage }</Text>
          <Image source={{ uri: data?.profile_pic ? data?.profile_pic : profileImage }} style={styles.profileImage} />
        </>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>


      {/* Search Input */}
      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Pincode to Find Gym"
          placeholderTextColor="#ddd"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          returnKeyType="search"
          onSubmitEditing={fetchGymsByPincode}
        />
        <TouchableOpacity onPress={fetchGymsByPincode} style={styles.searchButton}>
          <FontAwesome name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Nearby Button */}
      <TouchableOpacity
        style={styles.nearbyButton}
        onPress={() => navigation.navigate('SearchGym', { lat, long })}
      >
        <MaterialIcons name="near-me" size={22} color="#fff" />
        <Text style={styles.nearbyButtonText}>Search Gym by Name</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    backgroundColor: '#2E7D32', // Elegant dark green
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#FFC107', // Gold for better visibility
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flexShrink: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFC107', // Gold border
    marginRight: 8,
  },
  userName: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#FFC107', // Gold border for better contrast
    marginHorizontal: 20,
  },
  searchContainerFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#FF6F00', // Deep orange for action buttons
    borderRadius: 50,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 10,
    marginHorizontal: 20,
  },
  nearbyButtonText: {
    color: '#FFC107', // Gold text for better contrast
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }
});
