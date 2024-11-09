import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateName } from '../api/apiService';

const SettingsScreen = ({ navigation, route }) => {
  const {fullName} = route.params;
  const [name, setName] = useState(fullName);
  
  const handleUpdateName = async () => {
    await updateName(name);
    navigation.navigate("Profile", {reload: true});
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      navigation.navigate('Login');
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Failed to log out:', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  const handleContactPress = () => {
    Linking.openURL('https://contact.yupluck.com');
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>

      <TextInput
        style={styles.input}
        placeholder="Update your name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateName}>
        <Text style={styles.buttonText}>Update Name</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Contact Information */}
      <TouchableOpacity style={styles.contactContainer} onPress={handleContactPress}>
        <Text style={styles.contactText}>
          For any disputes, contact us at <Text style={styles.linkText}>contact.yupluck.com</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#dc3545',
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contactContainer: {
    marginTop: 30,
    padding: 10,
  },
  contactText: {
    color: '#555',
    textAlign: 'center',
    fontSize: 14,
  },
  linkText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
