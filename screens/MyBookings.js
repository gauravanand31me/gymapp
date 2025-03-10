import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, Modal, SafeAreaView, ActivityIndicator,StatusBar
} from 'react-native';
import { fetchAllBookings, fetchBuddyInvites, rateBooking } from '../api/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import BookingQRCode from '../components/BookingQRCode';
import Footer from '../components/Footer';

export default function BookingsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const [bookings, setBookings] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invites, setInvites] = useState([]);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const getBookings = async () => {
      setIsLoading(true);
      setIsChanged(false);
      const allBookings = await fetchAllBookings(selectedTab);
      
      if (allBookings) {
        const sortedBookings = allBookings.sort((a, b) => new Date(b.create) - new Date(a.create));
        setBookings(sortedBookings);
        setIsEmpty(sortedBookings.length === 0);
      }
      setIsLoading(false);
    };
    getBookings();
  }, [isChanged, selectedTab]);

  const fetchInvitesForBooking = async (booking) => {
    const inviteList = await fetchBuddyInvites(booking.id);
    setInvites(inviteList);
    setCurrentBookingId(booking.bookingId);
    setShowInviteModal(true);
  };

  const handleRating = async (bookingId, gymId, star) => {
    await rateBooking(bookingId, gymId, star);
    setIsChanged(true);
    setSelectedTab("Completed");
  };



// Function to calculate "Valid Till" using plain JS Date
const calculateValidTill = (date, type) => {
  const bookingDate = new Date(date);

  switch (type) {
    case 'daily':
      bookingDate.setDate(bookingDate.getDate() + 1);
      break;
    case 'monthly':
      bookingDate.setMonth(bookingDate.getMonth() + 1);
      break;
    case 'quarterly':
      bookingDate.setMonth(bookingDate.getMonth() + 3);
      break;
    case 'halfyearly':
      bookingDate.setMonth(bookingDate.getMonth() + 6);
      break;
    case 'yearly':
      bookingDate.setFullYear(bookingDate.getFullYear() + 1);
      break;
    default:
      return '-';
  }

  return bookingDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingDate}>{item.date}</Text>
        <View style={styles.locationContainer}>
          <MaterialIcon name="location-on" size={16} color="#6B7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.gymDetails}>
          <TouchableOpacity onPress={() => navigation.navigate("GymDetails", { gym_id: item.gymId })}>
            <Text style={styles.gymName}>{item.gymName}</Text>
          </TouchableOpacity>

          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{item.rating} ({item.reviews} Reviews)</Text>
          </View>

          <View style={[styles.paymentStatus, item.paymentStatus === 'Paid' ? styles.paid : styles.notPaid]}>
            <Text style={styles.paymentStatusText}>{item.paymentStatus}</Text>
          </View>

          <Text style={styles.bookingInfoText}>Booking ID: {item.bookingId}</Text>
          <Text style={styles.bookingInfoText}>Subscription type: {item.type}</Text>
          {item.type !== "daily" && <Text style={styles.validTillText}>
            Valid Till: {calculateValidTill(item.date, item.type)}
          </Text>}
          {item.type === "daily" && <Text style={styles.bookingInfoText}>Slot time: {item.time}</Text>}
          {item.type === "daily"  && <Text style={styles.bookingInfoText}>Duration: {item.duration} minutes</Text>}
          <Text style={styles.priceText}>Price: ₹ {item.price}</Text>

                      <View style={styles.inviteAddMoreContainer}>
              <TouchableOpacity onPress={() => fetchInvitesForBooking(item)} style={styles.inviteButton}>
                <Icon name="users" size={14} color="#6B7280" />
                <Text style={styles.inviteText}> {item.invites} Invites</Text>
              </TouchableOpacity>

              {selectedTab === "Upcoming" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('InviteFriendBuddy', { bookingId: item.id, gymName: item.gymName })}
                  style={styles.addMoreButton}
                >
                  <Text style={styles.addMoreButtonText}>Send Invite</Text>
                </TouchableOpacity>
              )}
            </View>

          {selectedTab === "Upcoming" && (
            <>
              <Text style={styles.qrCodeText}>
                Please scan the QR code below to log your workout hours.
              </Text>
     
                <BookingQRCode booking_id={item.bookingId} booking_date={item.date} type="daily" />
              
              
              <Text style={styles.cancellationText}>
                For cancellations, please contact the administrator.
              </Text>
            </>
          )}
        </View>

        {selectedTab === "Completed" && (
          <View style={styles.starRatingContainer}>
            <Text style={styles.ratingPrompt}>Rate Your Experience:</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(item.id, item.gymId, star)}>
                  <Icon
                    name="star"
                    size={24}
                    color={star <= item.bookingRating ? '#FBBF24' : '#E5E7EB'}
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
    <View style={styles.safeArea}>
  <View style={styles.container}>
      {/* StatusBar Configuration */}
      <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
        <Text style={styles.headerText}>My Bookings</Text>

        <View style={styles.tabContainer}>
          {['Upcoming', 'Completed', 'No Show'].map((tab) => (
     <TouchableOpacity
     key={tab}
     style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
     onPress={() => setSelectedTab(tab)}  // Use the same value as displayed
   >
     <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
       {tab}
     </Text>
   </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
        ) : (
          <View style={styles.contentContainer}>
            {isEmpty ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nothing to show!</Text>
                <TouchableOpacity onPress={() => navigation.navigate("GymList")}>
                  <Text style={styles.linkText}>Go to Gym List</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={bookings}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBooking}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}

        <Modal visible={showInviteModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Buddy Invites for Booking ID: {currentBookingId}</Text>
              <FlatList
                data={invites}
                keyExtractor={(invite) => invite.id}
                renderItem={({ item }) => (
                  <View style={styles.inviteItem}>
                    <View style={styles.inviteInfoContainer}>
                      <Image
                        source={{ uri: item.toUser.profile_pic }}
                        style={styles.profileImage}
                      />
                      <Text style={styles.inviteText}>{item.toUser.full_name}</Text>
                    </View>
                    <View style={[styles.statusContainer, getStatusStyle(item.status)]}>
                      <Text style={styles.statusText}>{item.status}</Text>
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
      </View>
      <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
}

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'accepted': return styles.statusAccepted;
    case 'pending': return styles.statusPending;
    case 'declined': return styles.statusDeclined;
    default: return styles.statusDefault;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop:10
  },
  container: {
    flex: 1,
    padding: 16,
  },
  
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1F2937',
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
    flex: 1
  },
  activeTabButton: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#777',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeTabText: {
    color: '#FFFFFF',  // White text color when active
    fontWeight: 'bold', // Bold text when active
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  cardBody: {
    flex: 1,
  },
  gymDetails: {
    marginBottom: 12,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  paymentStatus: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  paid: {
    backgroundColor: '#10B981',
  },
  notPaid: {
    backgroundColor: '#EF4444',
  },
  paymentStatusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  bookingInfoText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  inviteAddMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',  // Align items to the start
    alignItems: 'center',
    marginTop: 12,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  inviteText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',  // Make it bold for emphasis
    color: '#1F2937',
  },
  addMoreButton: {
    backgroundColor: '#4F46E5',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 4,
  marginLeft: 10,
  },
  addMoreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  qrCodeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
  },
  cancellationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  starRatingContainer: {
    marginTop: 12,
  },
  ratingPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  inviteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inviteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusAccepted: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusDeclined: {
    backgroundColor: '#EF4444',
  },
  statusDefault: {
    backgroundColor: '#6B7280',
  },
  closeButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    position: 'absolute', // Fix it at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    //height: 60, // Adjust height as needed
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  validTillText: {
    fontSize: 14,
    color: 'green',
    marginTop: 4,
    fontWeight: "bold"
  },
});