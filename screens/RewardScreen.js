import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const rewards = [
  { tier: 'Bronze', points: 50, reward: '🎽 Yupluck T-Shirt', color: '#CD7F32', icon: 'shirtsinbulk' },
  { tier: 'Silver', points: 100, reward: '💧 Exclusive Water Bottle', color: '#C0C0C0', icon: 'tint' },
  { tier: 'Gold', points: 200, reward: '🎒 Premium Gym Bag', color: '#FFD700', icon: 'shopping-bag' },
];

const RewardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 Your Rewards 🏆</Text>
      <Text style={styles.subHeader}>Earn points, unlock rewards, and stay motivated! 🔥</Text>

      {rewards.map((reward, index) => (
        <Animated.View key={index} style={[styles.rewardCard, { borderColor: reward.color }]}>
          <Icon name={reward.icon} size={35} color={reward.color} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.rewardTier, { color: reward.color }]}>{reward.tier} Tier</Text>
            <Text style={styles.points}>🔸 {reward.points} Points</Text>
            <Text style={styles.rewardText}>{reward.reward}</Text>
          </View>
        </Animated.View>
      ))}

      <View style={styles.scanSection}>
        <Icon name="qrcode" size={50} color="#4CAF50" />
        <Text style={styles.scanText}>
          🏋️ Your gym will **scan your booking QR code** to add **workout hours** to your profile.  
          Keep pushing to **unlock more rewards!**
        </Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    width: '90%',
    marginBottom: 15,
    elevation: 6,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  rewardTier: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 15,
    color: '#555',
    marginTop: 2,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginTop: 5,
  },
  scanSection: {
    marginTop: 30,
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  scanText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RewardScreen;
