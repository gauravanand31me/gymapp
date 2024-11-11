import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Linking, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { registerUser } from '../api/apiService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import images
import logoImage from '../assets/logowithouticon.jpg';
import indiaFlagImage from '../assets/india-flag.png';

const RegisterScreen = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!fullName || !phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    if (!isPolicyAccepted) {
      Alert.alert('Error', 'Please accept the Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(fullName, phoneNumber);
      console.log("Registration Success:", response);
      navigation.navigate('OTPVerification', { mobileNumber: phoneNumber, got_otp: response.otp });
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Registration Error', 'Something went wrong during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <Image
          source={logoImage}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join us to book your workouts!</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor='#808080'
          value={fullName}
          onChangeText={setFullName}
        />

        <View style={styles.phoneInputContainer}>
          <View style={styles.flagContainer}>
            <Image
              source={indiaFlagImage}
              style={styles.flagIcon}
            />
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <View style={styles.policyContainer}>
          <TouchableOpacity onPress={() => setIsPolicyAccepted(!isPolicyAccepted)}>
            <View style={[styles.checkbox, isPolicyAccepted && styles.checkboxSelected]}>
              {isPolicyAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://yupluck.com/privacy')}>
            <Text style={styles.policyLink}>I have read and agree to the Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, (!isPolicyAccepted || loading) && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={!isPolicyAccepted || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Login Now</Text>
          </TouchableOpacity>
        </View>
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
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    backgroundColor: '#F0F0F0',
    color: '#333',
    marginBottom: 20,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
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
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#0ED94A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#0ED94A',
  },
  policyLink: {
    color: '#0ED94A',
    textDecorationLine: 'underline',
    fontSize: 14,
    flex: 1,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94d3a2',
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
});

export default RegisterScreen;