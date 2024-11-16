import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { fetchIndividualGymData } from '../api/apiService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const AmenitiesListScreen = ({ gymId, onClose }) => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const data = await fetchIndividualGymData(gymId);
        setAmenities(data.equipment_list || []);
      } catch (error) {
        console.error('Error fetching amenities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, [gymId]);

  const renderAmenityIcon = (amenityName) => {
    const iconMap = {
      'Treadmill': 'run',
      'Weights': 'dumbbell',
      'Yoga Mat': 'yoga',
      'Bicycle': 'bike',
      'Pool': 'pool',
      'Sauna': 'hot-tub',
      'Locker': 'locker',
      'Shower': 'shower',
    };

    const iconName = iconMap[amenityName] || 'fitness';
    return <Icon name={iconName} size={24} color="#4CAF50" />;
  };

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gym Amenities</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {amenities.length > 0 ? (
              amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  {renderAmenityIcon(amenity.equipment_name)}
                  <Text style={styles.amenityText}>
                    {amenity.equipment_name || 'Unnamed Equipment'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noAmenitiesContainer}>
                <Icon name="alert-circle-outline" size={48} color="#999" />
                <Text style={styles.noAmenitiesText}>No amenities listed for this gym.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flexGrow: 1,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  amenityText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
  },
  noAmenitiesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAmenitiesText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  loader: {
    marginVertical: 20,
  },
});

export default AmenitiesListScreen;