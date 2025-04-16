import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import Footer from '../components/Footer';
import CustomHeader from '../components/Header';
import { fetchUserFeed, uploadFeedAnswer } from '../api/apiService';
import FeedCard from '../components/Feedcard';
import FeedQuestionCard from '../components/FeedQuestionCard';
import AdCard from '../components/AdCard';

const ads = {
  id: 'ad-001',
  type: 'advertisement',
  title: '🔥 Get Fit Now!',
  description: 'Join Shriram Gym today and get 30% OFF on monthly plans!',
  imageUrl: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?cs=srgb&dl=pexels-willpicturethis-1954524.jpg&fm=jpg',
  gym: {
    name: 'Shriram Gym',
  },
  timestamp: new Date().toISOString(),
  cta: 'Book Now',
  user: {
    name: 'Yupluck Promotion',
    profilePic: 'https://cdn-icons-png.flaticon.com/512/2331/2331943.png',
  },
};


export default function YupluckFeedScreen({ navigation }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const [refreshing, setRefreshing] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadFeedData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFeedData = async () => {
    const data = await fetchUserFeed(page, limit);
    data.push(ads);
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
      case 'questionPrompt':
          return <FeedCard item={item} formatTime={formatTime} />;

      // Add your other cases here (checkin, workoutInvite, etc.)

      default:
        return null;
    }
  };

  const handleAnswerSubmit = async (answer) => {
        const upload_result = await uploadFeedAnswer(answer);
        loadFeedData();
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
    backgroundColor: '#F9F9FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  questionCard: {
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
  noFeedText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
});
