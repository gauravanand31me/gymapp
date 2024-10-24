import React, {useEffect, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the hook for navigation
import { acceptBuddyRequest } from '../api/apiService';

const WorkoutInvitation = ({navigation, route}) => {
  const {relatedId} = route.params;
  const [booking, setBooking] = useState({});
  console.log("relatedId", relatedId);
  const handleAccept = () => {
    // Logic to handle acceptance of the invitation
    console.log('Invitation accepted!');
  };

  const handleDecline = () => {
    // Logic to handle declining the invitation
    console.log('Invitation declined!');
  };


  useEffect(() => {
    const handleActionRequest = async (requestId) => {
      const data = await acceptBuddyRequest(requestId);
      console.log("data.booking", data.booking);
      setBooking(data.booking);
      console.log("Data is in this page", data);
    }
    handleActionRequest(relatedId);
  }, [])

  const {
    bookingDate,
    bookingDuration,
    gymName,
    slotStartTime,
    subscriptionPrice,
    gymRating,
  } = booking;

  // Format date and time display
  const formattedDate = new Date(bookingDate).toDateString(); // Format date
  const formattedTime = slotStartTime; // Assuming slotStartTime is already in HH:MM:SS format



  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        You're <Text style={styles.highlightedText}>Invited</Text> to a Workout!
      </Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Invitation Details:</Text>

        {/* Make the username clickable */}
        <Text style={styles.detailText}>
          You've been invited to join a gym session at{' '}
          <TouchableOpacity onPress={() => navigation.navigate('GymDetails')}>
            <Text style={styles.username}>{gymName}</Text>
          </TouchableOpacity>.
        </Text>

        <Text style={styles.detailText}>
          Session Date & Time:{' '}
          <Text style={styles.bold}>
            {formattedDate}, {formattedTime}
          </Text>
        </Text>

        <Text style={styles.detailText}>
          Session Duration:{' '}
          <Text style={styles.bold}>{bookingDuration} minutes</Text>
        </Text>

        <Text style={styles.detailText}>
          Subscription Price: <Text style={styles.bold}>INR {subscriptionPrice}</Text>
        </Text>

        <Text style={styles.detailText}>
          Gym Rating: <Text style={styles.bold}>{gymRating}</Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => navigation.navigate('PaymentScreen', { slotDetails: booking, requestId: relatedId })}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={handleDecline}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>We look forward to seeing you there!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  detailsContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: '100%',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495E',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  highlightedText: {
    fontWeight: 'bold',
    color: '#28A745', // Green color for "Invited"
  },
  username: {
    fontWeight: 'bold',
    color: '#28A745', // Green color for emphasis
    textDecorationLine: 'underline', // Add underline to indicate it's clickable
  },
  bold: {
    fontWeight: 'bold',
    color: '#28A745',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginHorizontal: 5, // Adjusted to fit all buttons
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  backButton: {
    backgroundColor: '#000000', // Black color for the back button
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default WorkoutInvitation;
