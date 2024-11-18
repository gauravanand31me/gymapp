import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userDetails, verifyOtp } from '../api/apiService';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerificationScreen({ route }) {
  const { got_otp, mobileNumber } = route.params;
  const [otp, setOtp] = useState(got_otp);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const inputRefs = useRef([]);

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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [navigation, fadeAnim]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true); // Set loading to true before API call
    try {
      const data = await verifyOtp(mobileNumber, otp);
      if (data.status) {
        await AsyncStorage.setItem('authToken', data.token);
        navigation.navigate('GymList');
      } else {
        Alert.alert('Verification Failed', data.message || 'The OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false); // Set loading to false after API call, regardless of success or failure
    }
  };

  const handleResendOtp = () => {
    // Implement resend OTP logic here
    setTimer(30);
    Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number.');
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Autofill case: User pastes the full OTP
      const newOtp = value.split('').slice(0, 6); // Take only the first 6 characters
      setOtp(newOtp.join(''));
  
      // Automatically populate inputs
      newOtp.forEach((digit, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].setNativeProps({ text: digit });
        }
      });
  
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus(); // Focus the last field after autofill
      }
    } else {
      // Normal single-character input
      const newOtp = otp.split('');
      newOtp[index] = value;
      setOtp(newOtp.join(''));
  
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus(); // Move to the next box
      }
    }
  };
  
  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      const newOtp = otp.split('');
      newOtp[index - 1] = '';
      setOtp(newOtp.join(''));
      inputRefs.current[index - 1]?.focus(); // Move to the previous box
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Ionicons name="lock-closed" size={64} color="#0ED94A" style={styles.icon} />
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the verification code we just sent to {mobileNumber}.
          </Text>

          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="numeric"
                maxLength={6} // Allow pasting full OTP
                value={otp[index] || ''}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(event) => handleKeyPress(event, index)} // Backspace handling
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.disabledButton]} 
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity 
              onPress={handleResendOtp} 
              disabled={timer > 0}
            >
              <Text style={[styles.linkText, timer > 0 && styles.disabledLink]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0ED94A',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#808080',
    marginBottom: 40,
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#0ED94A',
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#F0F0F0',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#808080',
    fontSize: 16,
  },
  linkText: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledLink: {
    color: '#A0A0A0',
  },
  disabledButton: { // Added style for disabled button
    backgroundColor: '#94d3a2',
  },
});