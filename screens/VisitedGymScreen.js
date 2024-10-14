import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getVisitedGyms } from '../api/apiService'; // API call
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you have react-native-vector-icons installed
import Footer from '../components/Footer';

const VisitedGymScreen = ({ navigation }) => {
  const [visitedGyms, setVisitedGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitedGyms = async () => {
      try {
        const response = await getVisitedGyms();
        console.log('Visited Gyms:', response);
        if (response.visitedGyms) {
          setVisitedGyms(response.visitedGyms);
        } else {
          setVisitedGyms([]);
        }
      } catch (error) {
        console.error('Error fetching visited gyms:', error);
        Alert.alert('Error', 'Could not fetch visited gyms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVisitedGyms();
  }, []);

  const renderGymItem = ({ item }) => (
    <View style={styles.gymItem}>
      <Text style={styles.gymName}>{item.gymName}</Text>
      <View style={styles.detailsRow}>
        <Icon name="star" size={20} color="#FFD700" />
        <Text style={styles.gymDetails}>Rating: {item.gymRating}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Icon name="time" size={20} color="#4CAF50" />
        <Text style={styles.gymDetails}>Workout Hours: {item.totalWorkoutHours / 60} hrs</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visitedGyms}
        renderItem={renderGymItem}
        keyExtractor={(item) => item.gymId.toString()}
      />
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymItem: {
    backgroundColor: '#f1f1f1',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  gymName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  gymDetails: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
  footer: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default VisitedGymScreen;
