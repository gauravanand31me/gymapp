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

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';

export default function SearchGymList({ navigation, route }) {
  const { query, lat, long } = route.params;
  const [searchText, setSearchText] = useState(query);
  const [gyms, setGyms] = useState([]);
  const [address, setAddress] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMoreGyms, setHasMoreGyms] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const limit = 9;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    fetchGyms();

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [page]);

  const fetchGyms = async () => {
    if (loading) return; // Prevent multiple requests at the same time

    setLoading(true);
    try {
      const gymList = await fetchAllGyms(lat, long, searchText, limit, page);
      console.log("page", page);
      if (gymList?.length > 0) {
        setGyms(prevGyms => [...prevGyms, ...gymList]); // Append new gyms to existing list
      } else {
        setHasMoreGyms(false); // No more gyms to load
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to load gyms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGyms = () => {
    if (!loading && hasMoreGyms) {
      setPage(prevPage => prevPage + 1); // Increment page number
    }
  };

  const renderGym = ({ item }) => (
    <TouchableOpacity style={styles.gymCard} onPress={() => navigation.navigate('GymDetails', { gym_id: item.gymId })}>
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
        <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('GymDetails', { gym_id: item.gymId })}>
          <Text style={styles.bookNowText}>
            <Icon name="check-circle" size={18} color="#fff" /> Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Results for "{searchText}"</Text>
      </View>

      <FlatList
        data={gyms}
        renderItem={renderGym}
        keyExtractor={(item) => item.gymId.toString()}
        onEndReached={loadMoreGyms} // Load more gyms when reaching the end of the list
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#f4511e" /> : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          )
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
    marginTop: 10,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 10,
    backgroundColor: '#4CAF50',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  gymCard: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  gymImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  gymInfo: {
    marginLeft: 10,
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#666",
  },
  gymPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

