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
import FeedCard from '../components/Feedcard';
import FeedQuestionCard from '../components/FeedQuestionCard';

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
    console.log("Data is", data);
    setFeedData(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    const refreshed = await fetchUserFeed(0, limit);
    setFeedData(refreshed);
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
        return <FeedCard item={item} formatTime={formatTime} />;
      

      // Add your other cases here (checkin, workoutInvite, etc.)

      default:
        return null;
    }
  };

  const handleAnswerSubmit = (answer) => {
    
  };

  return (
    <View style={styles.wrapper}>
      <CustomHeader navigation={navigation} />
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={
            <FeedQuestionCard
              question="What's your fitness goal this week?"
              onSubmit={handleAnswerSubmit}
            />
          }
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
  gymName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
});
