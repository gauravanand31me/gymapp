import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  Animated, 
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { acceptBuddyRequest } from '../api/apiService';
import { Ionicons } from '@expo/vector-icons';
import goldMedal from "../assets/goldmedal.jpg";

const { width } = Dimensions.get('window');

const WorkoutRequest = ({ route }) => {
  const { message, relatedId } = route.params;
  const [booking, setBooking] = useState({});
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    const handleActionRequest = async (requestId) => {
      try {
        const data = await acceptBuddyRequest(requestId);
        setBooking(data.booking);
        if (booking.bookingType && booking.bookingType !== "daily") {
          setBooking(prevBooking => ({
            ...prevBooking,
            bookingDate: new Date().toLocaleDateString('en-CA') // Ensures YYYY-MM-DD format in local timezone
          }));
        }

      } catch (error) {
        console.error("Error fetching booking details:", error);
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
    gymId
  } = booking;

  const formattedDate = bookingDate ? new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading...';
  const formattedTime = slotStartTime || 'Loading...';


  const renderDetailItem = (icon, label, value) => (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={24} color="#28A745" style={styles.icon} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        {label === 'Gym' ? (
          <TouchableOpacity onPress={() => navigation.navigate("GymDetails", {gym_id: gymId})} style={styles.linkContainer}>
            <Text style={styles.linkText}>{value}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.detailValue}>{value}</Text>
        )}
      </View>
    </View>
  );

  

  return (
    <ImageBackground 
      source={goldMedal}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {/* StatusBar Configuration */}
      <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
            <View style={styles.header}>
              <Ionicons name="checkmark-circle" size={60} color="#28A745" />
              <Text style={styles.title}>
                <Text style={styles.highlightedText}>Invite</Text> Accepted!
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Invitation Details</Text>
              {renderDetailItem("business", "Gym", gymName || 'Loading...')}
              {renderDetailItem("calendar", "Date", formattedDate)}
              {renderDetailItem("timer", "Booking Durations", `${renderType(bookingType) || '...'}`)}
              {bookingType === "daily" && renderDetailItem("time", "Time", formattedTime)}
              {bookingType === "daily" && renderDetailItem("timer", "Duration", `${bookingDuration || '...'} minutes`)}
              {renderDetailItem("cash", "Price", `₹${subscriptionPrice || '...'}`)}
              {renderDetailItem("star", "Rating", `${gymRating || '...'} / 5`)}
              <Text style={styles.message}>{message}</Text>
            </View>

            <Text style={styles.footerText}>We look forward to seeing you there!</Text>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    textTransform: 'uppercase',
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
  
  linkContainer: {
    borderBottomWidth: 1.5,
    borderColor: '#007bff',
    paddingBottom: 2,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  message: {
    fontSize: 16,
    color: '#34495E',
    fontStyle: 'italic',
    marginTop: 10,
  },
  footerText: {
    marginTop: 20,
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default WorkoutRequest;