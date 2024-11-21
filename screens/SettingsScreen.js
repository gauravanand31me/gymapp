import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking,StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    Linking.openURL('https://yupluck.com/terms');
  };

  const handleUserDeleteAccount = async () => {
     const resp = await deleteUserAccount();
     if (resp) {
        navigation.navigate("Login", {delete: true});
     }
  }

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
       {/* StatusBar Configuration */}
       <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Settings</Text>

      {/* Update Name Section */}
      <Text style={styles.sectionTitle}>Update Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your new name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateName}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Links Section */}
      <Text style={styles.sectionTitle}>Useful Links</Text>
      <TouchableOpacity style={styles.linkButton} onPress={handlePrivacyPolicy}>
        <Text style={styles.linkButtonText}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={handleTermsAndConditions}>
        <Text style={styles.linkButtonText}>Terms and Conditions</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteButtonText}>Delete My Account</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Contact Information */}
      <TouchableOpacity style={styles.contactContainer} onPress={handleContactPress}>
        <Text style={styles.contactText}>
          For any disputes, contact us at <Text style={styles.linkText}>contact@yupluck.com</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#6c757d',
    width: '100%',
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
