import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { Calendar, Clock, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react-native'
import * as WebBrowser from 'expo-web-browser'
import { acceptBuddyRequest, createBooking, createOrder } from '../api/apiService'

import { LinearGradient } from 'expo-linear-gradient'

export default function PaymentScreen({ route, navigation }) {
  const { slotDetails, requestId } = route.params
  const [loading, setLoading] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [confirm, setConfirm] = useState(false)


  

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

    checkExpiration()
  }, [slotDetails.date, slotDetails.time])

  const handlePayment = async () => {
    try {
      setLoading(true)
      if (requestId) {
        slotDetails.requestId = requestId
      }
      const bookingResponse = await createBooking(slotDetails)

      if (bookingResponse) {
        const orderResponse = await createOrder(
          slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice,
          bookingResponse.bookingId,
          requestId
        )

        if (orderResponse && orderResponse.orderId) {
          const result = await WebBrowser.openBrowserAsync(orderResponse.paymentLink)

          if (result.type === 'dismiss') {
            console.log('User dismissed the payment page')
          } else if (result.type === 'opened') {
            console.log('Payment page opened')
          }

          if (result.type === 'opened' || result.type === 'cancel') {
            setConfirm(true)
            pollPaymentStatus(bookingResponse.bookingId, bookingResponse)
          } else {
            Alert.alert('Payment was not completed.')
          }
        } else {
          Alert.alert('An error occurred while creating the payment order.')
        }
      } else {
        Alert.alert("Slot or gym may not be available for booking")
      }
    } catch (error) {
      console.log("error", error.response)
      Alert.alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

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
    }, 3000)
  }

  return (
    <SafeAreaView style={styles.container}>
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
              <View style={styles.detailRow}>
                <Calendar size={24} color="#4CAF50" />
                <Text style={styles.detail}>Date: {slotDetails.date || slotDetails.bookingDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={24} color="#4CAF50" />
                <Text style={styles.detail}>Time: {slotDetails.time || slotDetails.slotStartTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={24} color="#4CAF50" />
                <Text style={styles.detail}>Duration: {slotDetails.duration || slotDetails.bookingDuration} min</Text>
              </View>
              <View style={styles.detailRow}>
                
                <Text style={styles.price}>₹  Price: INR {slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice}
                </Text>
              </View>
            </View>

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
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gymName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  gymDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detail: {
    fontSize: 18,
    color: '#333',
    marginLeft: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  expiredText: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: 'bold',
  },
})