import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the hook for navigation
import { acceptBuddyRequest } from '../api/apiService';

const WorkoutRequest = ({ route, navigation }) => {
  const { message, relatedId } = route.params;
  const [booking, setBooking] = React.useState({});
  console.log("relatedId", relatedId);

  React.useEffect(() => {
    const handleActionRequest = async (requestId) => {
      const data = await acceptBuddyRequest(requestId);
      console.log("data.booking", data);
      setBooking(data.booking);
      console.log("Data is in this page", data);
    };
    handleActionRequest(relatedId);
  }, []);

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
    <ImageBackground 
      source={require('../assets/goldmedal.png')} // Add your downloaded image path here
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          <Text style={styles.highlightedText}>Invite</Text> Accepted!
        </Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Invitation Details:</Text>
          <Text>
            <TouchableOpacity onPress={() => navigation.navigate('GymDetails')}>
              <Text style={styles.username}>{gymName}</Text>
            </TouchableOpacity>.
          </Text>

          {/* Make the username clickable */}
          <Text style={styles.detailText}>
            {' '}
            {message}
          </Text>

          <Text style={styles.detailText}>Session Date & Time: <Text style={styles.bold}>{formattedDate}, {formattedTime}</Text></Text>
          <Text style={styles.detailText}>Session Duration: <Text style={styles.bold}>{bookingDuration} minutes</Text></Text>
        </View>

        <Text style={styles.footerText}>We look forward to seeing you there!</Text>

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Adjust the background image to cover the whole screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(243, 244, 246, 0.8)', // Semi-transparent background to overlay on the image
  },
  backButton: {
    position: 'absolute',
    bottom: 30, // Position it 30 pixels from the bottom
    padding: 15,
    backgroundColor: '#28A745', // Green background
    borderRadius: 5,
    width: '50%', // Adjust the width of the button
    alignItems: 'center', // Center text
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  footerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default WorkoutRequest;
