import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Keyboard, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchAllGyms } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';

export default function AutocompleteSearchComponent({ lat, long, onSearch, onClear }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async (input) => {
    setLoading(true);
    try {
      const response = await fetchAllGyms(lat, long, input);
      if (response) {
        setSuggestions(response);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (gym) => {
    setQuery(gym.gymName);
    setSelectedGym(gym);
    setSuggestions([]);
    navigation.navigate('GymDetails', { gym_id: gym.gymId });
  };

  const handleSearchSubmit = () => {
 
      onSearch(query);
      setSuggestions([]);
      Keyboard.dismiss();
   
  };

  // Function to clear the search input and suggestions
  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedGym(null);
    onClear();
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
      <Text style={styles.suggestionText}>{item.gymName}</Text>
      <Text style={styles.locationText}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search gym..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
          <Icon name="times-circle" size={20} color="#666" />
        </TouchableOpacity>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} onPress={handleSearchSubmit} />
      </View>

      {loading && <ActivityIndicator size="small" color="#0000ff" />}

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.gymId}
          renderItem={renderSuggestion}
          style={styles.suggestionList}
        />
      )}

      {selectedGym && (
        <View style={styles.selectedGymContainer}>
          <Text style={styles.selectedGymText}>Selected: {selectedGym.gymName}</Text>
          <Text style={styles.selectedGymLocation}>{selectedGym.location}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 20,
  },
  searchContainer: {
    position: 'relative',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    right: 50, // Adjusted to accommodate the clear button
    top: 15,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 10,
  },
  suggestionList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionItem: {
    padding: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#777',
  },
  selectedGymContainer: {
    marginTop: 15,
  },
  selectedGymText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  selectedGymLocation: {
    fontSize: 14,
    color: '#777',
  },
});
