import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const screenHeight = Dimensions.get('window').height;

export default function EmptyFeedMessage({ navigation }) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../assets/yupluck-hero.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Your Feed is Empty 😅</Text>
      <Text style={styles.subtitle}>
        Book a gym session, track milestones, invite buddies, and build your fitness story with Yupluck!
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('GymList')}
        >
          <Icon name="building-o" size={18} color="#fff" />
          <Text style={styles.buttonText}>Book Gym</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('InviteBuddy')}
        >
          <Icon name="trophy" size={18} color="#fff" />
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight * 0.2,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  image: {
    width: 220,
    height: 180,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginHorizontal: 8,
    gap: 8,
    elevation: 2, // adds shadow on Android
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
