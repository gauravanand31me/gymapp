import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, TextInput,Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, userDetails } from '../api/apiService';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import indiaFlag from "../assets/india-flag.png";


const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const data = await userDetails();
      if (data.id) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'GymList' }],
          })
        );
      }
    };
  
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      setErrorVisible(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await loginUser(phoneNumber);
      if (data.status) {
        await AsyncStorage.setItem('userToken', phoneNumber);
        navigation.navigate('OTPVerification', { mobileNumber: phoneNumber, got_otp: data.data.otp});
      } else {
        if (data.message === "User not found") {
          const fullName = "user";
          const response = await registerUser(fullName, phoneNumber);
          await AsyncStorage.setItem('userToken', phoneNumber);
          navigation.navigate('OTPVerification', { mobileNumber: phoneNumber, got_otp: response.otp});
        }
      }
    } catch (error) {
      
      setErrorMessage(error.response?.data?.message || 'Login Failed');
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
  

        <Text style={styles.title}>Welcome to YUPLUCK</Text>
        <Text style={styles.subtitle}>Your instant GYM booking platform!</Text>

        <View style={styles.phoneInputContainer}>
          <View style={styles.flagContainer}>
            <Image
              source={indiaFlag}
              style={styles.flagIcon}
            />
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
            
          )}
          
        </TouchableOpacity>
        <View style={styles.policyContainer}>
    
          <TouchableOpacity onPress={() => Linking.openURL('https://yupluck.com/privacy')}>
            <Text style={styles.linkText}>By clicking in, I accept the terms service & privacy policy</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.footer}>
          
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Register Now</Text>
          </TouchableOpacity>
        </View> */}

        <Modal
          animationType="fade"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  },
  policyContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  policyLink: {
    color: '#0ED94A',
    textDecorationLine: 'underline',
    fontSize: 14,
    textAlign: 'center',
  
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
    fontWeight: '500',
  },
  phoneInputContainer: {
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  flagIcon: {
    width: 25,
    height: 15,
    marginRight: 5,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#aaa',
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