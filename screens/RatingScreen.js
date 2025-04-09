import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchUserRatings } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';

export default function UserRatingsScreen({ route }) {
  const navigation = useNavigation();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { gymId, gymName } = route.params;

  useEffect(() => {
    fetchRating();
  }, [gymId]);

  const fetchRating = async () => {
    setLoading(true);
    try {
      const resp = await fetchUserRatings(gymId);
      setRatings(resp.ratings);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name="star"
          size={18}
          color={s <= count ? '#FBBF24' : '#E5E7EB'}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.userName}>👤 {item.username || 'User'}</Text>
      {renderStars(item.rating)}
      {item.description ? (
        <Text style={styles.description}>📝 {item.description}</Text>
      ) : (
        <Text style={styles.noDescription}>No description provided.</Text>
      )}
      <Text style={styles.date}>🕒 Rated on: {new Date(item.ratedOn).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color="#111827" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Ratings for {gymName || 'Gym'}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" />
      ) : (
        <FlatList
          data={ratings}
          renderItem={renderItem}
          keyExtractor={(item) => item.ratingId}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backText: {
      marginLeft: 6,
      fontSize: 16,
      color: '#111827',
      fontWeight: '500',
    },
    heading: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#111827',
    },
    card: {
      backgroundColor: '#f9fafb',
      padding: 16,
      borderRadius: 10,
      marginBottom: 14,
      elevation: 2,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: '#1f2937'
    },
    starRow: {
      flexDirection: 'row',
      marginBottom: 6
    },
    description: {
      color: '#374151',
      fontSize: 14,
      marginBottom: 4
    },
    noDescription: {
      color: '#9CA3AF',
      fontStyle: 'italic',
      marginBottom: 4
    },
    date: {
      fontSize: 12,
      color: '#6B7280'
    }
  });
  