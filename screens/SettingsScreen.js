import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking, StatusBar, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; // Add expo-linear-gradient for gradient effects
import { deleteUserAccount, updateName } from '../api/apiService';

const SettingsScreen = ({ navigation, route }) => {
  const { fullName } = route.params;
  const [name, setName] = useState(fullName);

  const handleUpdateName = async () => {
    await updateName(name);
    navigation.navigate("Profile", { reload: true });
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

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://yupluck.com/privacy');
  };

  const handleTermsAndConditions = () => {
    Linking.openURL('https://yupluck.com/privacy');
  };

  const handleUserDeleteAccount = async () => {
    const resp = await deleteUserAccount();
    if (resp) {
      navigation.navigate("Login", { delete: true });
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleUserDeleteAccount() }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" translucent={false} />
 

      <TouchableOpacity style={[styles.backButton, styles.backButtonMoved]} onPress={() => navigation.goBack()}>
    <Text style={styles.backButtonText}>← Back</Text>
  </TouchableOpacity>
  <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Update Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your new name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity onPress={handleUpdateName}>
          <LinearGradient colors={['#28a745', '#218838']} style={styles.button}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Useful Links</Text>
        <TouchableOpacity onPress={handlePrivacyPolicy}>
          <LinearGradient colors={['#007bff', '#0056b3']} style={styles.button}>
            <Text style={styles.buttonText}>Privacy Policy</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTermsAndConditions}>
          <LinearGradient colors={['#007bff', '#0056b3']} style={styles.button}>
            <Text style={styles.buttonText}>Terms and Conditions</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Delete My Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.contactContainer}>
        <Text style={styles.contactText}>
          For any disputes, contact us at <Text style={styles.linkText}>contact@yupluck.com</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f5',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonMoved: {
    marginTop: 30, // Adds spacing after the title
    marginBottom: 20,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 15,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 25,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    borderRadius: 25,
    backgroundColor: '#6c757d',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    fontWeight: '600',
  },
});

export default SettingsScreen;
