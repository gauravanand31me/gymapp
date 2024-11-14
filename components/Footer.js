import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchAllNotifications } from '../api/apiService'; // Import the fetch function
import { NotificationContext } from '../context/NotificationContext';

const Footer = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { notification } = useContext(NotificationContext)
  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      console.log("loadNotifications is called...")
      const data = await fetchAllNotifications();
      if (data && data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    };

    loadNotifications();
  }, [notification]);

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('GymList', {"id": 1})} style={styles.iconContainer}>
        <Icon name="home" size={22} color="#808080" />
        <Text style={styles.iconText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('InviteBuddy')} style={styles.iconContainer}>
        <Icon name="search" size={22} color="#808080" />
        <Text style={styles.iconText}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('MyBookings')} style={styles.iconContainer}>
        <Icon name="calendar" size={22} color="#808080" />
        <Text style={styles.iconText}>Bookings</Text>
      </TouchableOpacity>

      {/* Notification Icon with Unread Badge */}
      <TouchableOpacity onPress={() => navigation.navigate('NotificationListScreen')} style={styles.iconContainer}>
        <View style={styles.iconWithBadge}>
          <Icon name="bell" size={22} color="#808080" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.iconText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconContainer}>
        <Icon name="user" size={22} color="#808080" />
        <Text style={styles.iconText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 55,
    backgroundColor: '#ffffff', // Change background to white
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0', // Lighter border color
    elevation: 5, // Add a shadow effect for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    padding: 8, // Add padding for better touch area
  },
  iconText: {
    color: '#1c1c1c', // Change text color to a darker shade for contrast
    fontSize: 12, // Slightly increase font size
    marginTop: 4, // Space between icon and text
  },
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Footer;
