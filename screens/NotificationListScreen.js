import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, SafeAreaView, Alert } from 'react-native';
import { acceptFriendRequest, fetchAllNotifications, markAllNotificationsAsRead, rejectFriendRequest, acceptBuddyRequest } from '../api/apiService'; // Ensure this path is correct
import Footer from '../components/Footer';

const NotificationListScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await fetchAllNotifications();
        console.log("Data is", data);
        if (data.notifications) {
          setNotifications(data.notifications); 
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("Failed to fetch notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const markNotificationsAsRead = async () => {
      try {
        await markAllNotificationsAsRead(); // Mark all notifications as read
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    };

    markNotificationsAsRead();
    fetchNotifications();
  }, []);

  const handleActionRequest = async (requestId, action, type) => {
    try {
      if (action === 'accept') {
        if (type === 'buddyInvite') {
          const data = await acceptBuddyRequest(requestId);
          navigation.navigate('PaymentScreen', { slotDetails: data.booking, requestId });
        } else {
          await acceptFriendRequest(requestId);
        }
      } else if (action === 'reject') {
        await rejectFriendRequest(requestId);
      }
      // Optimistically update UI
      setNotifications(prev => prev.filter(notification => notification.relatedId !== requestId));
    } catch (error) {
      setError(error.message);
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Image
        source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
        style={styles.profileImage}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          {item.others ? `, ${item.others}` : ''} {item.message || 'No message available.'}
        </Text>
        <Text style={styles.time}>{item.createdAt || 'Time not available.'}</Text>
      </View>
      <View style={styles.actionButtons}>
        {item.type === 'buddyInvite' && (
          <>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleActionRequest(item.relatedId, 'accept', item.type)}
              accessibilityLabel="Accept Buddy Request"
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleActionRequest(item.relatedId, 'reject', item.type)}
              accessibilityLabel="Decline Buddy Request"
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {item.type === 'friendRequest' && (
          <>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleActionRequest(item.relatedId, 'accept', item.type)}
              accessibilityLabel="Accept Friend Request"
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleActionRequest(item.relatedId, 'reject', item.type)}
              accessibilityLabel="Decline Friend Request"
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {item.type === 'workoutRequestInvite' && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate('WorkoutInvitation', {relatedId: item.relatedId})}
            accessibilityLabel="View Workout Invitation"
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        )}
        {item.type === 'acceptedBuddyRequest' && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate('WorkoutRequest', {relatedId: item.relatedId, message: item.message})}
            accessibilityLabel="View Workout Request"
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        )} 

        {item.type === 'acceptedSelfBuddyRequest' && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate('WorkoutRequest', {relatedId: item.relatedId, message: item.message})}
            accessibilityLabel="View Workout Request"
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        )} 
        {item.type === 'declinedBuddyRequest' && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate('WorkoutRequest', {relatedId: item.relatedId, message: item.message})}
            accessibilityLabel="View Workout Request"
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
        </View>
       
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.relatedId.toString()} // Use a unique key
        contentContainerStyle={styles.listContent}
      />
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,  // Adjust based on footer height
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  declineButton: {
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  viewButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight:'bold',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NotificationListScreen;
