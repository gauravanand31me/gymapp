import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { acceptFriendRequest, fetchAllNotifications, rejectFriendRequest } from '../api/apiService'; // Ensure this path is correct

const NotificationListScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from API when the component is mounted
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await fetchAllNotifications();
        console.log("Data is", data);
        if (data.results) {
          setNotifications(data.results); 
        } else {
          setError(data.message);
        }
        setLoading(false);
      } catch (error) {
        console.log("Error is", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const acceptRejectRequest = async (requestId, action) => {
    try {
        if (action === 'accept') {
            await acceptFriendRequest(requestId);
            setNotifications(prev => prev.filter(notification => notification.id !== requestId));
            navigation.navigate('Profile')

        } else if (action === 'reject') {
            await rejectFriendRequest(requestId);
            setNotifications(prev => prev.filter(notification => notification.id !== requestId));
            navigation.navigate('Profile')
        }
    } catch (error) {
        setError(error.message);
    }
};

  // Render individual notification item
  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.username}>{item.user || 'Unknown User'}</Text> 
          {item.others ? `, ${item.others}` : ''} {item.message || 'No message available.'}
        </Text>
        <Text style={styles.time}>{item.time || 'Time not available.'}</Text>
      </View>
      <View style={styles.actionButtons}>
        {item.type === 'buddyRequest' && (
          <>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {item.type === 'friendRequest' && (
          <>
            <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRejectRequest(item.relatedId, 'accept')}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton} onPress={() => acceptRejectRequest(item.relatedId, 'reject')}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        
        {item.type === 'workoutRequestInvite' && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate('WorkoutInvitation')}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        )}
        {item.type === 'workoutSentInvite' && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate('WorkoutRequest')}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Show a loader or error message if applicable
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
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
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    color: '#333',
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
    color: 'red',
    fontSize: 16,
  },
});

export default NotificationListScreen;
