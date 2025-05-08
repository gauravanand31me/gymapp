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

  useEffect(() => {
    loadNotifications();
  }, [notification]);

  const loadNotifications = async () => {
    const data = await fetchAllNotifications();
    if (data && data.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  };

  const FooterButton = ({ routeName, icon, label }) => {
    const isActive = currentRoute === routeName;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(routeName)}
        style={styles.buttonContainer}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrapper}>
          <Icon
            name={icon}
            size={isActive ? 26 : 22}
            color={isActive ? '#4CAF50' : '#888'}
          />
          {routeName === 'NotificationListScreen' && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.label, isActive && styles.activeLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

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
    height: 70,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Footer;
