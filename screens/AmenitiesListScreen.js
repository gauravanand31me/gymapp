import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { fetchIndividualGymData } from '../api/apiService'; // Adjust the import path as needed

const AmenitiesListScreen = ({ gymId, onClose }) => {
  const [amenities, setAmenities] = React.useState([]);

  React.useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await fetchIndividualGymData(gymId); // Fetch amenities using gymId
        setAmenities(data.equipment_list || []); // Set amenities list
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };

    fetchAmenities();
  }, [gymId]);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✖️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Amenities</Text>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {amenities.length > 0 ? (
            amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.amenityText}>{amenity.equipment_name || 'Unnamed Equipment'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAmenitiesText}>No amenities listed.</Text>
          )}
        </ScrollView>
      </View>
    </View>
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
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  amenityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  amenityText: {
    fontSize: 16,
    color: '#333',
  },
  noAmenitiesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
});


export default AmenitiesListScreen;
