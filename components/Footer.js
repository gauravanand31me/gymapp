import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchAllNotifications } from '../api/apiService'; // Import the fetch function
import { NotificationContext } from '../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

const Footer = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentRoute = navigation.getState()?.routes?.[navigation.getState().index]?.name;
  
  const { notification } = useContext(NotificationContext)
  // Fetch notifications on component mount


  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      console.log("Footer Screen focused");

    }, []),
  )

  const loadNotifications = async () => {
    console.log("loadNotifications is called...")
    const data = await fetchAllNotifications();
    if (data && data.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [notification]);
  
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('FriendsFeedScreen')} style={[
        styles.iconContainer,
        currentRoute === 'FriendsFeedScreen' && styles.activeLink
      ]} >
        <Icon name="newspaper-o" size={22} color={currentRoute === 'FriendsFeedScreen' ? '#4CAF50' : '#808080'} />
        <Text style={[styles.iconText, currentRoute === 'FriendsFeedScreen' && styles.activeText]}>Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('GymList', { id: 1 })}
        style={[
          styles.iconContainer,
          currentRoute === 'GymList' && styles.activeLink
        ]}
      >
        <Icon name="building-o" size={22} color={currentRoute === 'GymList' ? '#4CAF50' : '#808080'} />
        <Text style={[styles.iconText, currentRoute === 'GymList' && styles.activeText]}>Gyms</Text>
      </TouchableOpacity>

      

      <TouchableOpacity
  onPress={() => navigation.navigate('ReelsScreen')}
  style={[
    styles.iconContainer,
    currentRoute === 'ReelsScreen' && styles.activeLink
  ]}
>
  <Icon
    name="video-camera"
    size={22}
    color={currentRoute === 'ReelsScreen' ? '#4CAF50' : '#808080'}
  />
  <Text
    style={[
      styles.iconText,
      currentRoute === 'ReelsScreen' && styles.activeText
    ]}
  >
    Reels
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('MyBookings')}
        style={[
          styles.iconContainer,
          currentRoute === 'MyBookings' && styles.activeLink
        ]}
      >
        <Icon
          name="calendar-check-o"
          size={22}
          color={currentRoute === 'MyBookings' ? '#4CAF50' : '#808080'}
        />
        <Text
          style={[
            styles.iconText,
            currentRoute === 'MyBookings' && styles.activeText
          ]}
        >
          Bookings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('NotificationListScreen')}
        style={[
          styles.iconContainer,
          currentRoute === 'NotificationListScreen' && styles.activeLink
        ]}
      >
        <View style={styles.iconWithBadge}>
          <Icon
            name="bell"
            size={22}
            color={currentRoute === 'NotificationListScreen' ? '#4CAF50' : '#808080'}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.iconText,
            currentRoute === 'NotificationListScreen' && styles.activeText
          ]}
        >
          Notifications
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconContainer}>
        <Icon name="user-circle-o" size={22} color="#808080" />
        <Text style={styles.iconText}>Profile</Text>
      </TouchableOpacity> */}

    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
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
    marginBottom: 10,
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
  activeLink: {
    borderTopWidth: 2,
    borderTopColor: '#4CAF50',
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Footer;