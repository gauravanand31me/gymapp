import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function SearchHeader({ setPincode, fetchGymsByPincode, address, pincode, navigation, lat, long }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    // Simulate fetching location
    const timer = setTimeout(() => {
      // This would be replaced with actual location fetching logic
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" />
   
      <View style={styles.headerContent}>
        <View style={styles.topRow}>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={24} color="#fff" />
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {address || 'Fetching location...'}
            </Text>
          </View>
        </View>
        <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Gym using Pincode"
            placeholderTextColor="#fff"
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
        <TouchableOpacity
          style={styles.nearbyButton}
          onPress={() => navigation.navigate('SearchGym', { lat, long })}
        >
          <MaterialIcons name="near-me" size={20} color="#fff" />
          <Text style={styles.nearbyButtonText}>Search Gym by name</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    // paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    backgroundColor: '#4CAF50', // Semi-transparent green
  },
  headerContent: {
    padding: 15,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 50,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  searchContainerFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 25,
  },
  nearbyButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
});