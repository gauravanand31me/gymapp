import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Adjust to your icon library

const EmptyFriendsContainer = () => {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="account-group-outline" size={60} color="#66BB6A" />
      <Text style={styles.headingText}>Making Friends is Essential!</Text>
      <Text style={styles.bodyText}>
        Friends motivate you to achieve your fitness goals. Working out together makes it more fun and helps you stay committed!
      </Text>
      <Text style={styles.bodyText}>
        Invite your friends to join the gym and reach new heights together. Let's build a healthy community!
      </Text>
      <Text style={styles.searchText}>
        Search for your friends by username or name to invite them to the gym!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  bodyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#66BB6A',
    marginTop: 20,
    paddingHorizontal: 10,
  },
});

export default EmptyFriendsContainer;
