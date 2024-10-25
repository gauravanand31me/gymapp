import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Keyboard, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchAllGyms } from '../api/apiService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export default function AutocompleteSearchComponent({ route }) {
  const [query, setQuery] = useState('Fit');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const navigation = useNavigation();

  const {lat, long} = route.params;

  useEffect(() => {
    setSuggestions([]);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setSuggestions([]);
    }, [])
  );

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
    navigation.navigate('SearchGymList', { query:gym.gymName, lat, long });
  };

  const handleSearchSubmit = () => {
    if (query.length > 2) {
      navigation.navigate("SearchGymList", {query, lat, long})
      setSuggestions([]);
      Keyboard.dismiss();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedGym(null);
    
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
      <Text style={styles.suggestionText}>{item.gymName} <Icon name="chevron-right" size={16} color="#555" /></Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
 

      <View style={styles.searchContainer}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Icon name="arrow-left" size={24} color="#333" />
  </TouchableOpacity>
  <TextInput
    style={styles.input}
    placeholder="Search gym..."
    placeholderTextColor="#999"
    value={query}
    onChangeText={setQuery}
    returnKeyType="search"
    onSubmitEditing={handleSearchSubmit}
  />
  {query && <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
    <Icon name="times-circle" size={22} color="#fff" />
  </TouchableOpacity>}
  <Icon name="search" size={20} color="#666" style={styles.searchIcon} onPress={handleSearchSubmit} />
</View>

      {loading && <ActivityIndicator size="small" color="#0000ff" />}

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.gymId.toString()}
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
    borderRadius: 10,
    marginVertical: 20,

  },
  searchContainer: {
    flexDirection: 'row', // Align elements in a row
    alignItems: 'center', // Vertically center items
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 25,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  input: {
    flex: 1, // Take up remaining space
    fontSize: 16,
    color: '#333',
  
  },
  searchIcon: {
    marginLeft: 10,

  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
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
    fontSize: 12,
    color: '#333',
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
