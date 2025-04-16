// components/AdCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Gift, MapPin } from 'lucide-react-native';

export default function AdCard({ item }) {
  const handleCTA = () => {
    // For now open Yupluck homepage or future gym detail
    Linking.openURL('https://yupluck.com');
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {item.gym?.name && (
          <View style={styles.gymRow}>
            <MapPin size={16} color="#4CAF50" />
            <Text style={styles.gymName}>{item.gym.name}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.ctaButton} onPress={handleCTA}>
          <Gift size={16} color="#fff" />
          <Text style={styles.ctaText}>{item.cta || 'Explore Offer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  gymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  gymName: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
  },
});
