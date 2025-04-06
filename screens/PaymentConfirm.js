import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Calendar, Clock, DollarSign, ArrowLeft, CheckCircle, CalendarClock } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { acceptBuddyRequest, createBooking, createOrder, fetchIndividualGymData } from '../api/apiService';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import CouponSection from '../components/CouponCodeContainer';

export default function PaymentScreen({ route, navigation }) {
  const { slotDetails, requestId } = route.params
  const [loading, setLoading] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [gymData, setGymData] = useState(null);



  useEffect(() => {
    const checkExpiration = () => {
      if (!slotDetails.date || !slotDetails.time) return

      const formattedDate = slotDetails.date instanceof Date
        ? slotDetails.date.toISOString().split('T')[0]
        : slotDetails.date.split('/').reverse().join('-')

      const slotDateTimeString = `${formattedDate}T${slotDetails.time}`
      const slotDateTime = new Date(slotDateTimeString)
      const currentDate = new Date()

      if (isNaN(slotDateTime.getTime())) {
        console.error("Invalid date format:", slotDateTimeString)
        return
      }

      if (currentDate > slotDateTime) {
        setIsExpired(true)
      }
    }

    checkExpiration();
    fetchGymData();
  }, [slotDetails.date, slotDetails.time])


  const fetchGymData = async () => {
    try {

      const data = await fetchIndividualGymData(slotDetails?.gymId);
      setGymData(data);
    } catch (error) {
      console.error('Error fetching gym details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      if (requestId) {
        slotDetails.requestId = requestId;
      }
      const bookingResponse = await createBooking(slotDetails);



      if (bookingResponse) {
        const orderResponse = await createOrder(
          slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice,
          bookingResponse.bookingId,
          requestId
        );

        if (orderResponse && orderResponse.orderId) {
          // Set the returning from browser flag before opening WebBrowser
          global.isReturningFromBrowser = true;
          const result = await WebBrowser.openBrowserAsync(orderResponse.paymentLink);
          global.isReturningFromBrowser = false;

          if (result.type === 'dismiss') {
            console.log('User dismissed the payment page');
          } else if (result.type === 'opened') {
            console.log('Payment page opened');
          }

          if (result.type === 'opened' || result.type === 'cancel') {
            setConfirm(true);
            pollPaymentStatus(bookingResponse.bookingId, bookingResponse);
          } else {
            Alert.alert('Payment was not completed.');
          }
        } else {
          Alert.alert('An error occurred while creating the payment order.');
        }
      } else {
        Alert.alert("Slot or gym may not be available for booking");
      }
    } catch (error) {
      console.log("error", error.response);
      Alert.alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (orderId, bookingResponse) => {
    const pollInterval = setInterval(async () => {
      try {
        const indvBooking = await acceptBuddyRequest(orderId)

        if (indvBooking.booking.isPaid) {
          clearInterval(pollInterval)
          navigation.replace('ConfirmationScreen', { slotDetails, data: bookingResponse })
        } else {
          clearInterval(pollInterval)
          navigation.replace('PaymentFailed')
        }
      } catch (e) {
        clearInterval(pollInterval)
      }
    }, 3000);


    useFocusEffect(
      useCallback(() => {
        return () => {
          clearInterval(pollInterval);
        };
      }, [])
    );
  }


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar Configuration */}
      <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.gymName}>{slotDetails.gymName}</Text>
            <Text style={styles.gymDescription}>
              Please verify the details before booking this gym. Welcome to {slotDetails.gymName}, your ultimate fitness destination!
            </Text>

            <View style={styles.detailsContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("SlotSelection", { gym: gymData, requestId: requestId })}>
                <Text style={styles.changeText}>Change subscription</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Calendar size={24} color="#4CAF50" />
                <Text style={styles.detail}>
                  Date: {slotDetails.date ? slotDetails.date : formatDate(slotDetails.bookingDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <CalendarClock size={24} color="#4CAF50" />
                <Text style={styles.detail}>Subscription Type: {slotDetails.type || slotDetails.bookingType}</Text>
              </View>

              {slotDetails.type === "Daily" && <View style={styles.detailRow}>
                <Clock size={24} color="#4CAF50" />
                <Text style={styles.detail}>Time: {slotDetails.time || slotDetails.slotStartTime}</Text>
              </View>}
              {slotDetails.type === "Daily" && <View style={styles.detailRow}>
                <Clock size={24} color="#4CAF50" />
                <Text style={styles.detail}>Duration: {slotDetails.duration || slotDetails.bookingDuration} min</Text>
              </View>}
              <View style={styles.detailRow}>

                <Text style={styles.price}>₹  Price: INR {slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice}
                </Text>
              </View>
            </View>

            <CouponSection
              couponCode={slotDetails.couponCode || ''}
              onCouponChange={(text) => {
                slotDetails.couponCode = text; // You can update this to use useState if needed
              }}
              onApplyCoupon={() => {
                // Optional: Add coupon validation logic here
                Alert.alert("Coupon Applied!", `Code: ${slotDetails.couponCode}`);
              }}
              onNavigateToCouponList={() => navigation.navigate('CouponListScreen')}
            />

            {isExpired ? (
              <Text style={styles.expiredText}>This booking time has expired.</Text>
            ) : !confirm ? (
              <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Proceed to Payment</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.statusText}>Verifying Payment Status...</Text>
              </View>
            )}



            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#4CAF50" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginVertical: 12,
  },
  gymName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  gymDescription: {
    fontSize: 17,
    color: '#555',
    marginBottom: 26,
    textAlign: 'center',
    lineHeight: 26,
  },
  detailsContainer: {
    marginBottom: 26,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  detail: {
    fontSize: 18,
    color: '#444',
    marginLeft: 14,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 14,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 19,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  backButtonText: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  expiredText: {
    color: '#D32F2F',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  statusText: {
    fontSize: 19,
    color: '#2E7D32',
    marginTop: 12,
    fontWeight: 'bold',
  },
  changeText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
  }
});
