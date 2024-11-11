import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native'
import { acceptFriendRequest, fetchAllNotifications, markAllNotificationsAsRead, rejectFriendRequest, acceptBuddyRequest } from '../api/apiService'
import Footer from '../components/Footer'
import { Bell, Check, X, ChevronRight } from 'lucide-react-native'

export default function NotificationListScreen({ navigation }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await fetchAllNotifications()
        if (data.notifications) {
          setNotifications(data.notifications)
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start()
        } else {
          setError(data.message)
        }
      } catch (error) {
        setError("Failed to fetch notifications. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const markNotificationsAsRead = async () => {
      try {
        await markAllNotificationsAsRead()
      } catch (error) {
        console.error("Failed to mark notifications as read:", error)
      }
    }

    markNotificationsAsRead()
    fetchNotifications()
  }, [])

  const handleActionRequest = async (requestId, action, type) => {
    try {
      if (action === 'accept') {
        if (type === 'buddyInvite') {
          const data = await acceptBuddyRequest(requestId)
          navigation.navigate('PaymentScreen', { slotDetails: data.booking, requestId })
        } else {
          await acceptFriendRequest(requestId)
        }
      } else if (action === 'reject') {
        await rejectFriendRequest(requestId)
      }
      setNotifications(prev => prev.filter(notification => notification.relatedId !== requestId))
    } catch (error) {
      setError(error.message)
      Alert.alert("Error", error.message)
    }
  }

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.notificationItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
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
              <Check size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleActionRequest(item.relatedId, 'reject', item.type)}
              accessibilityLabel="Decline Buddy Request"
            >
              <X size={20} color="#fff" />
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
              <Check size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleActionRequest(item.relatedId, 'reject', item.type)}
              accessibilityLabel="Decline Friend Request"
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {(item.type === 'workoutRequestInvite' ||
          item.type === 'acceptedBuddyRequest' ||
          item.type === 'acceptedSelfBuddyRequest' ||
          item.type === 'declinedBuddyRequest') && (
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => navigation.navigate(
              item.type === 'workoutRequestInvite' ? 'WorkoutInvitation' : 'WorkoutRequest',
              {relatedId: item.relatedId, message: item.message}
            )}
            accessibilityLabel={`View ${item.type === 'workoutRequestInvite' ? 'Workout Invitation' : 'Workout Request'}`}
          >
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Footer navigation={navigation} />
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell size={24} color="#4CAF50" />
        <Text style={styles.headerText}>Notifications</Text>
      </View>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.relatedId.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Footer navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 25
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
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
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  declineButton: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 20,
  },
  viewButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
  },
})