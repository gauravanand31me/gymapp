import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { acceptBuddyRequest, createBooking, createOrder } from '../api/apiService';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationContext } from '../context/NotificationContext';

const PaymentScreen = ({ route, navigation }) => {
  const { slotDetails, requestId } = route.params; // Extract slot details from navigation parameters
  const [loading, setLoading] = useState(false); // Loading state for button
  const [isExpired, setIsExpired] = useState(false); // State to check if the booking is expired
  const [openModel, setOpenModel] = useState(true);
  const [paymentLink, setPaymentLink] = useState("");
  const {notification} = useContext(NotificationContext);
  // Effect to check if the booking is expired


  useEffect(() => {
    if (notification) {
      console.log('New notification received:', notification.request.content);
      // Handle the notification (e.g., show a message or update the UI)
    }
  }, [notification]);

  useEffect(() => {
    const checkExpiration = () => {
      if (!slotDetails.date || !slotDetails.time) return; // Ensure date and time are available
  
      let formattedDate;
  
      // Conditionally format the date based on the platform
      if (slotDetails.date) {
        const [day, month, year] = slotDetails.date.split("/");
        formattedDate = `${year}-${month}-${day}`;
      }
  
      // iOS expects a 'T' between date and time for reliable parsing
      const slotDateTimeString = Platform.OS === 'ios'
        ? `${formattedDate || slotDetails.bookingDate}T${slotDetails.time || slotDetails.slotStartTime}`
        : `${formattedDate || slotDetails.bookingDate} ${slotDetails.time || slotDetails.slotStartTime}`;
  
      console.log("Formatted Slot Date and Time:", slotDateTimeString);
  
      const slotDateTime = new Date(slotDateTimeString);
      const currentDate = new Date();
  
      if (isNaN(slotDateTime.getTime())) {
        console.error("Invalid date format:", slotDateTimeString);
        return;
      }
      
      console.log("slotDateTimeString", currentDate);
      console.log("slotDateTime", slotDateTime);

      
      // Check if the current date and time is greater than the slot date and time
      if (currentDate > slotDateTime) {
        setIsExpired(true); // Set expired state
      }
    };
  
    checkExpiration(); // Run the expiration check
  }, [slotDetails.date, slotDetails.time]); // Dependency array includes date and time

  const handlePayment = async () => {
    try {
      setLoading(true);
      if (requestId) {
        slotDetails.requestId = requestId;
      }
      const bookingResponse = await createBooking(slotDetails); // Create booking on success

      if (bookingResponse) {
      // Step 1: Create the payment order first
      const orderResponse = await createOrder(slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice, bookingResponse.bookingId, requestId);
    
      if (orderResponse && orderResponse.orderId) {
        // Step 2: Open Razorpay payment link in the browser
        setOpenModel(true);
        setPaymentLink(orderResponse.paymentLink)
        const result = await WebBrowser.openBrowserAsync(orderResponse.paymentLink);
        // Step 3: After successful payment, create the booking
        
        if (result.type === 'dismiss') {
          // Handle the case where the user closed or dismissed the browser
          console.log('User dismissed the payment page');
          // You can add additional logic here to notify the user or retry payment
      } else if (result.type === 'opened') {
          // Browser was successfully opened
          console.log('Payment page opened');
      }
      
  
        if (result.type === 'opened' || result.type === 'cancel') {
          pollPaymentStatus(bookingResponse.bookingId, bookingResponse);
        } else {
          Alert.alert('Payment was not completed.');
        }
      } else {
        Alert.alert('Some error occurred while creating the payment order.');
      }
      } else {
        Alert.alert("Slot or gym may not be available for booking");
      }
    } catch (error) {
      console.log("error", error.response)
      Alert.alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  async function pollPaymentStatus(orderId, bookingResponse) {
    const pollInterval = setInterval(async () => {
      try {
        const indvBooking = await acceptBuddyRequest(orderId);
      
        if (indvBooking.booking.isPaid) {
            clearInterval(pollInterval); // Stop polling when payment is successful
            navigation.replace('ConfirmationScreen', { slotDetails, data: bookingResponse });
        } else {
            clearInterval(pollInterval); // Stop polling when payment fails
            navigation.replace('PaymentFailed');
        }
      } catch (e) {
        clearInterval(pollInterval); // Stop polling when payment fails
      }
    }, 3000); // Poll every 3 seconds
}


  return (
    <ImageBackground style={styles.background}>
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

        {isExpired ? (
          <Text style={styles.expiredText}>This booking time has expired.</Text>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Proceed</Text>
            )}
          </TouchableOpacity>
        )}

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
  expiredText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PaymentScreen;
