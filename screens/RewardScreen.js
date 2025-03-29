import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const rewards = [
  { tier: 'Bronze', points: 50, reward: 'Yupluck T-Shirt', color: '#CD7F32', icon: 'tshirt' },
  { tier: 'Silver', points: 100, reward: 'Exclusive Water Bottle', color: '#C0C0C0', icon: 'tint' },
  { tier: 'Gold', points: 200, reward: 'Premium Gym Bag', color: '#FFD700', icon: 'shopping-bag' },
];

const RewardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 Your Rewards 🏆</Text>

      {rewards.map((reward, index) => (
        <View key={index} style={[styles.rewardCard, { borderColor: reward.color }]}>
          <Icon name={reward.icon} size={30} color={reward.color} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.rewardTier, { color: reward.color }]}>{reward.tier} Tier</Text>
            <Text style={styles.points}>🔸 {reward.points} Points</Text>
            <Text style={styles.rewardText}>{reward.reward}</Text>
          </View>
        </View>
      ))}

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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    marginBottom: 15,
    elevation: 4,
    borderLeftWidth: 6,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  rewardTier: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginTop: 5,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RewardScreen;
