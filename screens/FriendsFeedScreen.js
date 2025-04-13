import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import CustomHeader from '../components/Header';

const demoFeedData = [
  {
    id: '1',
    activityType: 'checkin',
    userId: 'user123',
    username: 'Sourav',
    profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    gymId: 'gym456',
    gymName: 'Eclipz Fitness 💪',
    gymImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    timestamp: '2025-04-13T09:20:00Z',
  },
  {
    id: '2',
    activityType: 'workoutInvite',
    userId: 'user789',
    username: 'Neha',
    profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    fromUserId: 'user555',
    fromUserName: 'Ankit',
    timestamp: '2025-04-13T10:05:00Z',
  },
  {
    id: '3',
    activityType: 'milestone',
    userId: 'user555',
    username: 'Ankit',
    profileImage: 'https://randomuser.me/api/portraits/men/66.jpg',
    hours: 75,
    timestamp: '2025-04-12T18:40:00Z',
  },
  {
    id: '4',
    activityType: 'questionPrompt',
    userId: 'user321',
    username: 'Isha',
    profileImage: 'https://randomuser.me/api/portraits/women/70.jpg',
    question: 'What did you eat post workout today?',
    timestamp: '2025-04-13T07:50:00Z',
  },
  {
    id: '5',
    activityType: 'gymAd',
    gymName: 'Blaze Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1579758629934-03608ccdbaba?auto=format&fit=crop&w=800&q=80',
    timestamp: '2025-04-13T11:00:00Z'
  },
  {
    id: '6',
    activityType: 'aiPromo',
    price: 199,
    timestamp: '2025-04-13T08:00:00Z'
  }
];

export default function YupluckFeedScreen({ navigation }) {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  
const handleRefresh = () => {
  setRefreshing(true);
  // Simulate API call
  setTimeout(() => {
    setRefreshing(false);
  }, 1500);
};

  const renderFeedItem = ({ item }) => {
    switch (item.activityType) {
      case 'checkin':
        return (
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.text}><Text style={styles.usernameLink} onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>{item.username}</Text> checked in at <Text style={styles.gymLink} onPress={() => navigation.navigate('GymDetailsScreen', { gym_id: item.gymId })}>{item.gymName}</Text></Text>
              <Image source={{ uri: item.gymImage }} style={styles.gymImage} />
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
              <View style={styles.reactionBar}>
                <TouchableOpacity><Text style={styles.reaction}>👍</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.reaction}>❤️</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.reaction}>🔥</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.reaction}>😂</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.reaction}>💯</Text></TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      case 'workoutInvite':
        return (
          <View style={styles.card}>
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.text}><Text style={styles.usernameLink} onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>{item.username}</Text> accepted a workout invite from <Text style={styles.usernameLink} onPress={() => navigation.navigate('UserProfile', { userId: item.fromUserId })}>{item.fromUserName}</Text></Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        );

      case 'milestone':
        return (
          <LinearGradient colors={["#ffe0c3", "#ffb3c6"]} style={styles.card}>
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.text}><Text style={styles.usernameLink}>{item.username}</Text> completed {item.hours} workout hours 🎉🔥</Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
              <TouchableOpacity><Text style={styles.link}>👏 Congratulate</Text></TouchableOpacity>
            </View>
          </LinearGradient>
        );

      case 'questionPrompt':
        return (
          <LinearGradient colors={["#f5f7fa", "#c3cfe2"]} style={styles.card}>
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.text}><Text style={styles.usernameLink}>{item.username}</Text> asks: {item.question}</Text>
              <TouchableOpacity style={styles.uploadBtn}><Text style={styles.uploadText}>📸 Share your answer</Text></TouchableOpacity>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          </LinearGradient>
        );

      case 'gymAd':
        return (
          <LinearGradient colors={["#fdfcfb", "#e2d1c3"]} style={styles.adCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.adImage} />
            <Text style={styles.text}>{item.gymName} just opened near you!</Text>
            <TouchableOpacity style={styles.ctaBtn}><Text style={styles.ctaText}>Check it out</Text></TouchableOpacity>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
          </LinearGradient>
        );

      case 'aiPromo':
        return (
          <LinearGradient colors={["#a8edea", "#fed6e3"]} style={styles.promoCard}>
            <Text style={styles.title}>Train with AI. Just ₹{item.price}/month!</Text>
            <Text style={styles.subtext}>Get personalized fitness coaching and progress tracking.</Text>
            <TouchableOpacity style={styles.ctaBtn}><Text style={styles.ctaText}>Join Now</Text></TouchableOpacity>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
          </LinearGradient>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.wrapper}>
      <CustomHeader navigation={navigation} />
      <View style={styles.container}>
      <FlatList
  data={demoFeedData}
  renderItem={renderFeedItem}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ paddingBottom: 100 }}
  showsVerticalScrollIndicator={false}
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>
      </View>
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
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
  adCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  promoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center'
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  adImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 8,
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
  gymLink: {
    fontWeight: 'bold',
    color: '#28A745',
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
  link: {
    color: '#007aff',
    marginTop: 8,
    fontWeight: '500',
  },
  uploadBtn: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#444',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaBtn: {
    marginTop: 10,
    backgroundColor: '#0044CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reactionBar: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  reaction: {
    fontSize: 20,
  },
});
