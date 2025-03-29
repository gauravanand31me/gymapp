import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const PromotionalBanner = ({ navigation }) => {
  return (
    <View style={styles.banner}>
      {/* Trophy Icon */}
      <Icon name="trophy" size={28} color="#FFD700" style={styles.trophyIcon} />

      {/* Main Promotional Text */}
      <Text style={styles.bannerText}>
        🎉 Complete your workout milestones & win exciting gifts! 🏆
      </Text>

      {/* Subtext for motivation */}
      <Text style={styles.subText}>
        Stay consistent, hit your fitness goals, and unlock exclusive rewards.  
      </Text>

      {/* CTA Button */}
      <TouchableOpacity 
        style={styles.ctaButton} 
        onPress={() => navigation?.navigate('RewardScreen')}
      >
        <Text style={styles.ctaText}>View Rewards</Text>
        <Icon name="arrow-right" size={16} color="#fff" style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#4CAF50', // Green for a positive fitness vibe
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 10,
    elevation: 5, // Shadow effect for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  trophyIcon: {
    marginBottom: 5,
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subText: {
    color: '#f1f1f1',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800', // Eye-catching orange
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  arrowIcon: {
    marginTop: 2,
  },
});

export default PromotionalBanner;
