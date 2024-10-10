import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { fetchAllBookings } from '../api/apiService'; // Adjust the import as necessary

export default function BookingsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const getBookings = async () => {
      const allBookings = await fetchAllBookings();
      if (allBookings) {
        setBookings(allBookings);
      }
    };

    getBookings();
  }, []);

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const currentDate = new Date();
    return bookingDate >= currentDate;
  });

  const completedBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const currentDate = new Date();
    return bookingDate < currentDate;
  });

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingDate}>Booking Date: {item.date}</Text>
        <View style={styles.locationContainer}>
          <MaterialIcon name="location-on" size={16} color="#777" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Image source={{ uri: item.imageUrl }} style={styles.gymImage} />
        <View style={styles.gymDetails}>
          <Text style={styles.gymName}>{item.gymName}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating} ({item.reviews} Reviews)</Text>
          </View>

          {/* Add Price and Booking ID */}
          <Text style={styles.bookingIdText}>Booking ID: {item.bookingId}</Text>
          <Text style={styles.priceText}>Price: ${item.price}</Text>

          {/* Invites and Add More Options */}
          <View style={styles.inviteAddMoreContainer}>
            <Text style={styles.inviteText}>
              <Icon name="users" size={14} color="#777" /> {item.invites} Invites
            </Text>
            <View style={styles.addMoreContainer}>
              <Text style={styles.addMoreText}>Add More</Text>
              <View style={styles.addMoreButton}>
                <Text style={styles.addMoreButtonText}>+1</Text>
              </View>
            </View>
          </View>

          {/* Move Cancel Button Below the Add More Options */}
          {selectedTab === 'Upcoming' && (
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Move Book Again Button to Card Footer */}
      {selectedTab === 'Completed' && (
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.bookAgainButton}>
            <Text style={styles.bookAgainButtonText}>Book Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>My Bookings</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Upcoming' && styles.activeTabButton]}
          onPress={() => setSelectedTab('Upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'Upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Completed' && styles.activeTabButton]}
          onPress={() => setSelectedTab('Completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'Completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking List */}
      <FlatList
        data={selectedTab === 'Upcoming' ? upcomingBookings : completedBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-end',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tabButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginHorizontal: 5,
    width: '45%',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#777',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 10,
  },
  bookingDate: {
    fontSize: 14,
    color: '#777',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  cardBody: {
    flexDirection: 'row',
  },
  gymImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  gymDetails: {
    marginLeft: 10,
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    color: '#777',
  },
  priceText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  bookingIdText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  inviteAddMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  inviteText: {
    fontSize: 14,
    color: '#777',
  },
  addMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 14,
    color: '#777',
    marginRight: 5,
  },
  addMoreButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
  },
  addMoreButtonText: {
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    padding: 8, // Reduced padding
    alignItems: 'center',
    width: '30%', // Adjusted width for smaller button
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14, // Reduced font size
  },
  bookAgainButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 8, // Reduced padding
    alignItems: 'center',
    width: '30%', // Adjusted width for smaller button
  },
  bookAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14, // Reduced font size
  },
  listContent: {
    paddingBottom: 20,
  },
});
