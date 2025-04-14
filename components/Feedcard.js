// components/FeedCard.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function FeedCard({ item, formatTime }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>
          <Text style={styles.usernameLink}>{item.user?.name}</Text> {item.description}
        </Text>

        {/* Display Gym Name if exists */}
        {item.gym && (
          <Text style={styles.gymName}>
            🏋️ {item.gym.name}
          </Text>
        )}

        {/* Show attached image */}
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.gymImage} />
        )}

        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  gymImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginTop: 10,
  },
  usernameLink: {
    fontWeight: 'bold',
    color: '#0044CC',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  gymName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
});
