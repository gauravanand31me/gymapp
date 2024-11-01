// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { registerUser } from '../api/apiService'; // Import the registerUser function

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false); // State for policy checkbox

  const handleRegister = async () => {
    if (!fullName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true); // Show loader while registering
    try {
      const response = await registerUser(fullName, phoneNumber);
      console.log("Registration Success:", response);
      setLoading(false); // Hide loader after successful registration
      // Navigate to OTP screen with phoneNumber
      navigation.navigate('OTPVerification', { mobileNumber: phoneNumber, got_otp: response.otp });
    } catch (error) {
      setLoading(false); // Hide loader if there's an error
      console.error('Registration failed:', error);
      Alert.alert('Registration Error', 'Something went wrong during registration. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={{ uri: 'https://example.com/logo.png' }} // Replace with your logo URL
        style={styles.logo}
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
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        maxLength={10}
        placeholderTextColor='#808080'
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Privacy Policy Section */}
      <View style={styles.policyContainer}>
        <TouchableOpacity onPress={() => Linking.openURL('https://yupluck.com/privacy')}>
          <Text style={styles.policyLink}>I have read and agree to the Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setIsPolicyAccepted(!isPolicyAccepted)}
        >
          <View style={isPolicyAccepted ? styles.checkboxSelected : styles.checkboxUnselected} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !isPolicyAccepted && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={!isPolicyAccepted || loading} // Disable button while loading or if policy is not accepted
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
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  policyLink: {
    color: '#0ED94A',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#0ED94A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  checkboxUnselected: {
    width: 16,
    height: 16,
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    width: 16,
    height: 16,
    backgroundColor: '#0ED94A',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94d3a2', // Light green for disabled state
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
});

export default RegisterScreen;
