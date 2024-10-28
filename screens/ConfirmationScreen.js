import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Footer from '../components/Footer';

const ConfirmationScreen = ({ route, navigation }) => {
  const { slotDetails, data } = route.params; // Get slot details from navigation parameters
  console.log("slotDetails received in ConfirmScreen", slotDetails);

 

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageBackground
          source={require('../assets/equipment.jpg')}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
        </ImageBackground>
      </View>
  
      <View style={styles.textContainer}>
        <Text style={styles.title}>Confirmed! Get ready to sweat.</Text>
        <Text style={styles.subtitle}>Spot secured! Get ready for a great workout.</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Booking details</Text>
          <Text style={styles.detail}>Gym: {slotDetails.gymName}</Text>
          <Text style={styles.detail}>Location: {slotDetails.location}</Text>
          <Text style={styles.detail}>Date & time: {slotDetails.date || slotDetails.bookingDate} - {slotDetails.time || slotDetails.slotStartTime}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("InviteFriendBuddy", {bookingId: data.bookingId})}>
          <Text style={styles.buttonText}>Invite friends</Text>
        </TouchableOpacity>
      </View>
       {/* Footer */}
       <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  imageContainer: {
    flex: 0.5, // 50% for the image
    paddingLeft: 20, // Shift the image slightly to the right
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Lighter overlay for better visibility
  },
  textContainer: {
    flex: 0.5, // 50% for the text
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%', // Full width for details container
    elevation: 5,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#28A745', // Green button
    padding: 15,
    borderRadius: 10,
    width: '80%', // Adjust the width as needed
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConfirmationScreen;
