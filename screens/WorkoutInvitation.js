import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Animated, Dimensions,StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { acceptBuddyRequest, declineBuddyRequest } from '../api/apiService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WorkoutInvitation({ route }) {
  const { relatedId } = route.params;
  const [booking, setBooking] = useState({});
  const [isExpired, setIsExpired] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    const handleActionRequest = async (requestId) => {
      try {
        const data = await acceptBuddyRequest(requestId);
        
        setBooking(data.booking);
        checkExpiration(data.booking);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        Alert.alert("Error", "Failed to load invitation details. Please try again.");
      }
    };
    handleActionRequest(relatedId);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [relatedId, fadeAnim, slideAnim]);

  const checkExpiration = (bookingData) => {
    if (bookingData.bookingDate && bookingData.slotStartTime) {
      const bookingDateTime = new Date(`${bookingData.bookingDate}T${bookingData.slotStartTime}`);
      const now = new Date();
      //setIsExpired(bookingDateTime < now);
    }
  };

  const handleDecline = async () => {
    try {
      await declineBuddyRequest(relatedId);
      Alert.alert("Success", "Buddy Request declined");
      navigation.navigate("GymList");
    } catch (error) {
      console.error("Error declining request:", error);
      Alert.alert("Error", "Failed to decline the request. Please try again.");
    }
  };


  const renderType = (type) => {
    switch (type) {
      case "daily":
        return "1 Day";
        break;
      case "monthly":
        return "1 month";
        break;
      case "quarterly":
        return "3 months";
        break;
      case "halfyearly":
        return "6 months"
        break;
      case "yearly":
        return "12 months";
        break;
    }
  }

  const {
    bookingDate,
    bookingDuration,
    gymName,
    slotStartTime,
    subscriptionPrice,
    gymRating,
    bookingType,
  } = booking;

  const formattedDate = bookingDate ? new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const formattedTime = slotStartTime || '';

  const renderDetailItem = (icon, label, value) => (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={24} color="#28A745" style={styles.icon} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        {/* StatusBar Configuration */}
      <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
        <View style={styles.header}>
          <Ionicons name="fitness" size={60} color="#28A745" />
          <Text style={styles.title}>
            You're <Text style={styles.highlightedText}>Invited</Text>
          </Text>
          <Text style={styles.subtitle}>to an Exciting Workout Session!</Text>
        </View>

        {isExpired ? (
        <>
          <View style={styles.expiredMessage}>
            <Ionicons name="alert-circle" size={40} color="#F44336" />
            <Text style={styles.expiredText}>This invitation has expired.</Text>
          </View>
          <TouchableOpacity style={[styles.expireButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Invitation Details</Text>
              {renderDetailItem("business", "Gym", gymName || 'Loading...')}
              {renderDetailItem("calendar", "Date", formattedDate || 'Loading...')}
              {bookingType === "daily" &&  renderDetailItem("time", "Time", formattedTime || 'Loading...')}
              {renderDetailItem("timer", "Booking Durations", `${renderType(bookingType) || '...'}`)}
              {bookingType === "daily" && renderDetailItem("timer", "Duration", `${bookingDuration || '...'} minutes`)}
              {renderDetailItem("cash", "Price", `₹${subscriptionPrice || '...'}`)}
              {renderDetailItem("star", "Rating", `${gymRating || '...'} / 5`)}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => navigation.navigate('PaymentScreen', { slotDetails: booking, requestId: relatedId })}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.declineButton]}  onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </>
        )}


        {!isExpired && <Text style={styles.footerText}>We look forward to seeing you there!</Text>}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
  },
  highlightedText: {
    color: '#28A745',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#000000',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  footerText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  expiredMessage: {
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  expiredText: {
    fontSize: 18,
    color: '#F44336',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height:'20%',
    marginBottom: 20,
  },  
    expireButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      paddingVertical: 10, // Reduced padding for smaller height
      paddingHorizontal: 15, // Horizontal padding can remain as is
      marginHorizontal: 5,
      elevation: 3,
      backgroundColor: '#000000',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});

