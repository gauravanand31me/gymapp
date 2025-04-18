import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Footer from '../components/Footer';
import CustomHeader from '../components/Header';
import { deletePost, fetchUserFeed, uploadFeedAnswer } from '../api/apiService';
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
      case 'questionPrompt':
        return (
          <FeedCard
            item={item}
            formatTime={formatTime}
            onComment={(post) => navigation.navigate('CommentScreen', { postId: post.id })}
            onUserPress={(user) =>{
              console.log("User is", user);
              navigation.navigate('UserProfile', { userId: user.userId })
            } }
            onDelete={(post) => {
              // Example logic: show confirmation and delete
              Alert.alert(
                'Delete Post',
                'Are you sure you want to delete this post?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      // TODO: call delete API and refresh feed
                      console.log('Deleting post with ID:', post.id);
                      const result = await deletePost(post.id);
                        if (result.success) {
                          // optionally refresh feed or show a toast
                          handleRefresh();
                        } else {
                          Alert.alert('Error', result.message);
                        }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        );
      case 'advertisement':
        return <AdCard item={item} />;
      default:
        return null;
    }
  };

  const handleAnswerSubmit = async (answer) => {
    await uploadFeedAnswer(answer);
    loadFeedData();
  };

  return (
    <View style={styles.wrapper}>
      <CustomHeader navigation={navigation} />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.container}>
          <FlatList
            ListHeaderComponent={
              <View style={styles.questionCard}>
                <FeedQuestionCard
                  question="What's your fitness goal this week?"
                  onSubmit={handleAnswerSubmit}
                />
              </View>
            }
            data={feedData}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
          {feedData?.length === 0 && !refreshing && (
            <Text style={styles.noFeedText}>No feed activity found.</Text>
          )}
        </View>
      </Animated.View>
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
