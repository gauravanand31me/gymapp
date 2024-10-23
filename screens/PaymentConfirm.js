import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { createBooking, createOrder } from '../api/apiService';

const PaymentScreen = ({ route, navigation }) => {
  const { slotDetails, requestId } = route.params; // Extract slot details from navigation parameters
  const [loading, setLoading] = useState(false); // Loading state for button



  // Function to create an order by calling your backend


  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create the payment order first
      const orderResponse = await createOrder(slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice);
      console.log("orderResponse", orderResponse);
      if (orderResponse && orderResponse.orderId) {
        // Step 2: Open Razorpay payment link in the browser
        const paymentOptions = {
          description: 'Slot Booking Payment',
          image: 'https://your-logo-url.com',
          currency: orderResponse.currency,
          key: 'rzp_test_EldByscIlZGrQb', // Your Razorpay key
          amount: orderResponse.amount, // Amount in paise
          order_id: orderResponse.id, // Razorpay order ID
          prefill: {
            email: 'user@example.com',
            contact: '9191919191',
            name: 'User Name',
          },
          theme: { color: '#F37254' },
        };

        const result = await WebBrowser.openBrowserAsync(orderResponse.paymentLink);
       
        console.log("Result is", result);
        // Step 3: After successful payment, create the booking
   
        if (requestId) {
          slotDetails.requestId = requestId;
        }

        
        if (result.type === 'opened') {
          const bookingResponse = await createBooking(slotDetails); // Create booking on success
          if (bookingResponse) {
            // Navigate to confirmation page after booking
            navigation.replace('ConfirmationScreen', { slotDetails, data: bookingResponse });
          } else {
            Alert.alert('Booking creation failed.');
          }
        } else {
          Alert.alert('Payment was not completed.');
        }
      } else {
        Alert.alert('Some error occurred while creating the payment order.');
      }
    } catch (error) {
      Alert.alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  

  return (
    <ImageBackground
      style={styles.background}
    >
      <View style={styles.container}>

        {/* Gym Information Section */}
        <View style={styles.card}>
          <Text style={styles.gymName}>{slotDetails.gymName}</Text>
          <Text style={styles.gymDescription}>
            Please verify the details before booking this gym. Welcome to {slotDetails.gymName}, your ultimate fitness destination!
           
          </Text>
          <Text style={styles.gymLocation}>{slotDetails.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="access-time" size={24} color="#2e7d32" />
          <Text style={styles.detail}>Date: {slotDetails.date || slotDetails.bookingDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="access-time" size={24} color="#2e7d32" />
          <Text style={styles.detail}>Time: {slotDetails.time || slotDetails.slotStartTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="hourglass-empty" size={24} color="#2e7d32" />
          <Text style={styles.detail}>Duration: {slotDetails.duration || slotDetails.bookingDuration} mn</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.price}>Price: INR {slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Proceed</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '90%',
    elevation: 5,
    marginVertical: 50,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  gymDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  gymLocation: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
    fontFamily: 'Roboto',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 10,
    backgroundColor: '#c8e6c9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2e7d32',
    fontSize: 18,
  },
});

export default PaymentScreen;
