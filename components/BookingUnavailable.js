import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ChevronLeft from 'react-native-vector-icons/Feather'; // Ensure you have this icon library installed

const screenWidth = Dimensions.get('window').width;

const BookingUnavailable = ({ navigation, gym }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft color="#333333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Unavailable</Text>
      </View>

      {/* Main Content */}
      <View style={styles.loadingContainer}>
        <Text style={styles.message}>
          Sorry, <Text style={styles.gymName}>{gym.name}</Text> is not available for booking now.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: '#555555',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  gymName: {
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default BookingUnavailable;
