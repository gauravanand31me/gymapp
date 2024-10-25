import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { loginUser, userDetails } from '../api/apiService'; // Import the loginUser function
import { Ionicons } from '@expo/vector-icons'; // For adding icons

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loader

  // Check AsyncStorage on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const data = await userDetails();
      console.log("Data is", data);
      // try {
      //   const storedValue = await AsyncStorage.getItem('userToken'); // Change 'userToken' to your actual key
      //   if (storedValue) {
      //     // If value exists, navigate to GymList screen
      //     navigation.navigate('GymList');
      //   }
      // } catch (error) {
      //   console.error("Failed to fetch user token", error);
      // }
    };

    checkLoginStatus();
  }, [navigation]); // Adding navigation as a dependency

  const handleLogin = async () => {
    if (!phoneNumber) {
      setErrorMessage('Please enter your phone number.');
      setErrorVisible(true);
      return;
    }

    setIsLoading(true); // Start the loader
    try {
      const data = await loginUser(phoneNumber); // Call the API service

      // Navigate to OTP screen on successful login
      if (data.status) {
        await AsyncStorage.setItem('userToken', phoneNumber); // Store user token
        navigation.navigate('OTPVerification', { mobileNumber: phoneNumber });
      } else {
        console.log("Data received", data);
        setErrorMessage(data.message);
        setErrorVisible(true);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login Failed');
      setErrorVisible(true);
    } finally {
      setIsLoading(false); // Stop the loader
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        // source={require('../assets/logowithouticon.jpg')} // Your splash screen image
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Text style={styles.title}>Welcome To YUPLUCK</Text>
      <Text style={styles.subtitle}>your instant GYM booking platform!</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        maxLength={10}
        placeholderTextColor='#808080'
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]} // Disable button style if loading
        onPress={handleLogin}
        disabled={isLoading} // Disable button when loading
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" /> // Show loader
        ) : (
          <Text style={styles.buttonText}>Login</Text> // Show normal text
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Register Now</Text>
        </TouchableOpacity>
      </View>

      {/* Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={errorVisible}
        onRequestClose={() => setErrorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="warning" size={50} color="#D9534F" />
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#0ED94A',
  },
  subtitle: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    backgroundColor: '#D3D3D3',
    color: '#333',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#aaa', // Change button color when disabled
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D9534F',
    marginVertical: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
