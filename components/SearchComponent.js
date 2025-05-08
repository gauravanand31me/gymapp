import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function SearchHeader({
  data,
  setPincode,
  fetchGymsByPincode,
  address,
  pincode,
  navigation,
  lat,
  long,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [profileImage] = useState(
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  );

  return (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Top Section */}
      <View style={styles.topRow}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color="#4CAF50" />
          <Text style={styles.locationText} numberOfLines={1}>
            {address || 'Fetching location...'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileInfo}
          onPress={() => navigation.navigate(data?.username ? 'Profile' : 'Login')}
        >
          {data?.username ? (
            <>
              <Text style={styles.userName} numberOfLines={1}>
                {data.username}
              </Text>
              <Image
                source={{ uri: data?.profile_pic || profileImage }}
                style={styles.profileImage}
              />
              <TouchableOpacity onPress={() => navigation.navigate('RewardScreen')}>
                <Ionicons name="gift-outline" size={20} color="#FF9800" />
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.loginText}>Login / Register</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, isSearchFocused && styles.searchFocused]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Pincode to Find Gym"
          placeholderTextColor="#999"
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

      {/* Search Nearby */}
      <TouchableOpacity
        style={styles.nearbyButton}
        onPress={() => navigation.navigate('SearchGym', { lat, long })}
      >
        <MaterialIcons name="near-me" size={20} color="#4CAF50" />
        <Text style={styles.nearbyText}>Search Gym by Name</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    flexShrink: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 8,
  },
  userName: {
    fontSize: 14,
    color: '#333',
    maxWidth: 80,
  },
  loginText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  nearbyText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
});
