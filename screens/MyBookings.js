import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { fetchAllBookings, fetchBuddyInvites } from '../api/apiService'; // Add the new API import
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import BookingQRCode from '../components/BookingQRCode';
import Footer from '../components/Footer';

export default function BookingsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const [bookings, setBookings] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false); // State for modal visibility
  const [invites, setInvites] = useState([]); // State to hold buddy invites
  const [currentBookingId, setCurrentBookingId] = useState(null); // To track current booking ID
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const [rating, setRating] = useState(0); // initial rating from the item
  useEffect(() => {
    const getBookings = async () => {
      setIsLoading(true); // Start loader
      const allBookings = await fetchAllBookings();
      console.log("allBookings", allBookings);
      if (allBookings) {
        // Sort bookings by date
        const sortedBookings = allBookings.sort((a, b) => new Date(b.create) - new Date(a.create));
        setBookings(sortedBookings);
        setIsEmpty(sortedBookings.length === 0);
      }
      setIsLoading(false); // Stop loader
    };
    getBookings();
  }, []);

  // Function to fetch invites for a booking
  const fetchInvitesForBooking = async (booking) => {
    const inviteList = await fetchBuddyInvites(booking.id);
    
    setInvites(inviteList);
    setCurrentBookingId(booking.bookingId); // Set the current booking id
    setShowInviteModal(true); // Show the modal when invites are loaded
  };


  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    return bookingDate >= currentDate && !booking.visited;
  });



  const completedBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);

    // Get current date and subtract one day
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    
    return (bookingDate < currentDate && booking.visited);
  });


  const noShowBooking = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);

    // Get current date and subtract one day
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    return bookingDate < currentDate && !booking.visited;
  });

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return { backgroundColor: '#4CAF50' }; // Green for accepted
      case 'pending':
        return { backgroundColor: '#FFC107' }; // Yellow for pending
      case 'declined':
        return { backgroundColor: '#F44336' }; // Red for declined
      default:
        return { backgroundColor: '#777' }; // Grey for unknown statuses
    }
  };

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
        <View style={styles.gymDetails}>
          <TouchableOpacity onPress={() => navigation.navigate("GymDetails", {gym_id: item.gymId})}>
            <Text style={styles.gymName}>{item.gymName}</Text>
          </TouchableOpacity>
  
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating} ({item.reviews} Reviews)</Text>
          </View>
  
          {/* Payment Status Display */}
          <Text style={[styles.paymentStatus, item.paymentStatus === 'Paid' ? styles.paid : styles.notPaid]}>
            {item.paymentStatus === 'Paid' ? 'Paid' : 'Not Paid'}
          </Text>
  
          {/* Booking ID and Price */}
          <Text style={styles.bookingIdText}>Booking ID: {item.bookingId}</Text>
          <Text style={styles.priceText}>Price: ₹ {item.price}</Text>
  
          {/* Invites and Add More Options */}
          <View style={styles.inviteAddMoreContainer}>
            <TouchableOpacity onPress={() => fetchInvitesForBooking(item)}>
              <Text style={styles.inviteText}>
                <Icon name="users" size={14} color="#777" /> {item.invites} Invites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('InviteFriendBuddy', { bookingId: item.id })}>
              {selectedTab == "Upcoming" && <View style={styles.addMoreButton}>
                <Text style={styles.addMoreButtonText}>+1</Text>
              </View>}
            </TouchableOpacity>
          </View>
  
          {/* QR Code Message */}
          {selectedTab == "Upcoming" && <Text style={styles.qrCodeText}>
            Please scan the QR code below to log your workout hours.
          </Text>}
          
          {selectedTab == "Upcoming" && <BookingQRCode booking_id={item.bookingId} booking_date={item.date} type="daily" />}
  
          {/* Cancellation Notice */}
          {selectedTab == "Upcoming" && <Text style={styles.cancellationText}>
            For cancellations, please contact the administrator.
          </Text>}
        </View>
  
        {/* Star Rating for Completed Bookings */}
        {selectedTab === "Completed" && (
            <View style={styles.starRatingContainer}>
              <Text style={styles.ratingPrompt}>Rate Your Experience:</Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star}>
                    <Icon
                      name="star"
                      size={20}
                      color={star <= rating ? '#FFD700' : '#CCC'}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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



          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'noShow' && styles.activeTabButton]}
            onPress={() => setSelectedTab('noShow')}
          >
            <Text style={[styles.tabText, selectedTab === 'noShow' && styles.activeTabText]}>
              No Show
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loader */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View style={{ flex: 1 }}>
            {isEmpty ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Start your first booking with us!</Text>
                <TouchableOpacity onPress={() => navigation.navigate("GymList")}>
                  <Text style={styles.linkText}>Go to Gym List</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={
                  selectedTab === 'Upcoming'
                    ? upcomingBookings
                    : selectedTab === 'Completed'
                      ? completedBookings
                      : selectedTab === 'noShow'
                        ? noShowBooking
                        : []
                }
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBooking}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}

        {/* Invite Modal */}
        <Modal visible={showInviteModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Buddy Invites for Booking ID: {currentBookingId}</Text>
              <FlatList
                data={invites}
                keyExtractor={(invite) => invite.id}
                renderItem={({ item }) => (
                  <View style={styles.inviteItem}>
                    {/* Profile Image and Names */}
                    <View style={styles.inviteInfoContainer}>
                      <Image
                        source={{ uri: item.toUser.profile_pic }}
                        style={styles.profileImage}
                      />
                      <Text style={styles.inviteText}>
                        {item.toUser.full_name}
                      </Text>
                    </View>

                    {/* Status as a Tag */}
                    <View style={styles.statusContainer}>
                      <Text style={[styles.statusText, getStatusStyle(item.status)]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowInviteModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Footer */}
        <View style={styles.footer}>
          <Footer navigation={navigation} />
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-end',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40, // Added extra margin to increase space
    marginBottom: 20,
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
    width: '25%',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#777',
    fontWeight: 'bold',
    fontSize: 12
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
    padding: 8,
    alignItems: 'center',
    width: '30%',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookAgainButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    width: '30%',
  },
  bookAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  cancellationText: {
    fontSize: 14,
    color: '#ff5722', // A warning color, can change according to your design
    marginTop: 10,
    textAlign: 'center', // Center the text for better presentation
  },
  qrCodeText: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center', // Center the text for better presentation
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inviteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inviteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    padding: 5,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    height: 50,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#007BFF', // Adjust the color to match your design
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  starRatingContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  ratingPrompt: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: 2,
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  paid: {
    color: '#4CAF50', // Green for paid
  },
  notPaid: {
    color: '#F44336', // Red for not paid
  },
});
