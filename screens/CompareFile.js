import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for notification icon
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'; // For the location icon

export default function GymListScreen({ navigation }) {
  const [searchText, setSearchText] = useState(''); // State to track search input
  const [gyms, setGyms] = useState([
    {
      id: '1',
      name: 'Fitness Gym Pro',
      description: 'High-quality equipment and trainers available.',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fHww', // Replace with actual image URL
    },
    {
      id: '2',
      name: 'Superfit Gym',
      description: '24/7 availability and best workout environment.',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fHww', // Replace with actual image URL
    },
    {
      id: '3',
      name: 'Power House Gym',
      description: 'Affordable pricing and great community.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fHww', // Replace with actual image URL
    },
  ]);

  // Filter gyms based on search input
  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderGym = ({ item }) => (
    <TouchableOpacity style={styles.gymCard} onPress={() => navigation.navigate('GymDetails', { gymId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.gymImage} />
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{item.name}</Text>
        <Text style={styles.gymDescription}>{item.description}</Text>
        <Text style={styles.gymRating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom header with greeting and search bar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
    
            <Text style={styles.locationText}><MaterialIcon name="location-on" size={18} color="#fff" />Downtown</Text> {/* Location text */}
          </View>
          <TouchableOpacity onPress={() => alert('Notifications!')}>
            <Text><Icon name="bell" size={24} color="#fff" /> </Text>{/* Notification icon */}
          </TouchableOpacity>
        </View>
        <Text style={styles.greetingText}>Hey, Sourav, looking for a gym or work out buddy?</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search gyms..."
          placeholderTextColor="#666" // Light gray placeholder text
          value={searchText}
          onChangeText={setSearchText} // Updates the search text state
        />
      </View>

      {/* Display filtered gyms */}
      <FlatList
        data={filteredGyms}
        keyExtractor={(item) => item.id}
        renderItem={renderGym}
        contentContainerStyle={styles.gymList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
    paddingTop: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#1c1c1c', // Dark background for header
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Aligns icon and text vertically in center
  },
  locationText: {
    fontSize: 16, // Reduced font size for location text
    color: '#fff',
    marginLeft: 5, // Spacing between icon and text
  },
  notificationIcon: {
    padding: 5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // White text for the greeting
    textAlign: 'center',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff', // White background for search box
    borderRadius: 10,
    padding: 10,
    color: '#000', // Black text for search input
    fontSize: 16,
    borderColor: '#ccc', // Light gray border for input
    borderWidth: 1,
  },
  gymList: {
    paddingHorizontal: 20,
  },
  gymCard: {
    backgroundColor: '#1c1c1c', // Dark background for each gym card
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  gymImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover', // Cover the entire area of the card
  },
  gymInfo: {
    padding: 15,
  },
  gymName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // White text
    marginBottom: 5,
  },
  gymDescription: {
    fontSize: 14,
    color: '#ccc', // Light gray text for description
    marginBottom: 10,
  },
  gymRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745', // Green color for rating
  },
});
