import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchAllNotifications } from '../api/apiService';
import { NotificationContext } from '../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

const Footer = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentRoute = navigation.getState()?.routes?.[navigation.getState().index]?.name;
  const { notification } = useContext(NotificationContext);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    const data = await fetchAllNotifications();
    if (data && data.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [notification]);

  const FooterButton = ({ routeName, icon, label }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(routeName)}
      style={styles.buttonContainer}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        <Icon
          name={icon}
          size={24}
          color={currentRoute === routeName ? '#4CAF50' : '#777'}
        />
        {routeName === 'NotificationListScreen' && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, currentRoute === routeName && styles.activeLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.footer}>
      <FooterButton routeName="FriendsFeedScreen" icon="newspaper-o" label="Feed" />
      <FooterButton routeName="GymList" icon="building-o" label="Gyms" />
      <FooterButton routeName="ReelsScreen" icon="video-camera" label="Reels" />
      <FooterButton routeName="MyBookings" icon="calendar-check-o" label="Bookings" />
      <FooterButton routeName="NotificationListScreen" icon="bell" label="Alerts" />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 65,
    backgroundColor: '#fdfdfd',
    borderTopWidth: 0.5,
    borderTopColor: '#dcdcdc',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    color: '#777',
    marginTop: 4,
  },
  activeLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Footer;
