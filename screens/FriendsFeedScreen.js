import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import CustomHeader from '../components/Header';
import { fetchUserFeed } from '../api/apiService';

export default function YupluckFeedScreen({ navigation }) {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    const data = await fetchUserFeed(page, limit);
    setFeedData(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    const refreshed = await fetchUserFeed(0, limit);
    console.log("data from refresh", refreshed);
    setFeedData(refreshed.feed);
    setRefreshing(false);
  };

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

  const renderFeedItem = ({ item }) => {
    switch (item.type) {
      case 'general':
        return (
          <View style={styles.card}>
            <Image
              source={{ uri: item.user?.profilePic || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>
                <Text style={styles.usernameLink}>{item.user?.name}</Text> {item.description}
              </Text>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.gymImage} />
              )}
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>

            </View>
          </View>
        );

      // Add your other cases here (checkin, workoutInvite, etc.)

      default:
        return null;
    }
  };

  return (
    <View style={styles.wrapper}>
      <CustomHeader navigation={navigation} />
      <View style={styles.container}>
        {console.log("Feed Data is", feedData)}
        <FlatList
          data={feedData}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
      {feedData?.length === 0 && !refreshing && (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No feed activity found.</Text>
      )}
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
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
