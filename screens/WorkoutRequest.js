import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the hook for navigation

const WorkoutRequest = () => {
  const navigation = useNavigation(); // Get the navigation object

  return (
    // Wrap the entire view with ImageBackground for the background image
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
          
          {/* Make the username clickable */}
          <Text style={styles.detailText}>
            {' '}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.username}>John</Text>
            </TouchableOpacity>
            {' '}has accepted your invitation to join the gym 
            session.
          </Text>
          
          <Text style={styles.detailText}>Session Date & Time: <Text style={styles.bold}>September 15, 2024, 9:00 AM - 10:00 AM</Text></Text>
          <Text style={styles.detailText}>Session Duration: <Text style={styles.bold}>1 hour</Text></Text>
          <Text style={styles.detailText}>Gym Location: <Text style={styles.bold}>Bhanshankari, Bengaluru, IN 560085</Text></Text>
        </View>

        <Text style={styles.footerText}>We look forward to seeing you there!</Text>
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
