import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function EmptyFeedMessage({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/empty-feed.png')} // Optional: you can use a local image or use Image from URL
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Your Feed is Empty 😅</Text>
      <Text style={styles.subtitle}>
        Book a gym session, track milestones, compete with friends, and build your fitness story!
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GymList')}
        >
          <Icon name="map-pin" size={18} color="#fff" />
          <Text style={styles.buttonText}>Book Gym</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Icon name="trophy" size={18} color="#fff" />
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  image: {
    width: 200,
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
