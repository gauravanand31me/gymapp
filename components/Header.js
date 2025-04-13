import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Header = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Yupluck! 🎉</Text>
      <Text style={styles.subtitle}>
        Book gyms, track your fitness, celebrate milestones, and grow with your friends.
      </Text>

      <TouchableOpacity style={styles.profileSection} onPress={() => navigation.navigate('Profile')}>
        <Icon name="user-circle" size={20} color="#fff" style={styles.profileIcon} />
        <Text style={styles.profileText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E7D32',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileSection: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderColor: '#ffffff50',
    borderWidth: 1,
    borderRadius: 8,
  },
  profileIcon: {
    marginRight: 8,
  },
  profileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Header;
