import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('GymList')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Hero image */}
      <Image
        source={require('../assets/yupluck-hero.png')} // Place your green-themed image here
        style={styles.heroImage}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Discover, Book, and Connect</Text>

      {/* Description */}
      <Text style={styles.description}>
        Yupluck is your ultimate fitness companion. Find nearby gyms, book slots easily, and connect with fitness buddies.
      </Text>

      {/* Feature List */}
      <View style={styles.featureList}>
        <FeaturePoint text="🏋️‍♂️ Book gym slots hassle-free" />
        <FeaturePoint text="📍 Find gyms near your location" />
        <FeaturePoint text="🤝 Connect & follow workout buddies" />
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('GymList')}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const FeaturePoint = ({ text }) => (
  <View style={styles.featureItem}>
    <View style={styles.dot} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',

  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    marginTop:13,
  },
  heroImage: {
    width: 250,
    height: 250,
    marginVertical: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#14532D', // dark green text
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  featureList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E', // green dot
    marginRight: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#22C55E', // green button
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  loginText: {
    color: '#16A34A', // lighter green
    fontSize: 14,
    marginTop: 6,
  },
});

export default LandingScreen;
