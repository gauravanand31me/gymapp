// Updated `UserProfileScreen.js`
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Clock, UserPlus, UserCheck, UserMinus } from 'lucide-react-native';
import ImageViewing from 'react-native-image-viewing';
import Footer from '../components/Footer';
import MilestoneProgress from '../components/MilestoneProgress';
import {
  userDetails,
  fetchAllNearByUser,
  addFriend,
  rejectFriendRequest,
  acceptFriendRequest,
  fetchUserReels,
  fetchMyFeed,
  getVisitedGyms,
  getVisitedBuddies,
} from '../api/apiService';

const milestones = { bronze: 50, silver: 100, gold: 200, diamond: 300 };

export default function UserProfileScreen({ navigation, route }) {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState({ invited: {} });
  const [loadFriend, setLoadFriend] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [sameUser, setSameUser] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Reels");
  const [reels, setReels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [visitedGyms, setVisitedGyms] = useState([]);
  const [visitedBuddies, setVisitedBuddies] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await userDetails(userId);
      const self = await userDetails();
      setSameUser(self.id === data.id);
      setUserData(data);
      loadTabData(data.id);
      getFriendShip(data.username);
    } catch (e) {
      Alert.alert('Error fetching user');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (id) => {
    try {
      const [r, p, g, b] = await Promise.all([
        fetchUserReels({ page: 0, limit: 30, userId: id }),
        fetchMyFeed(0, 30),
        getVisitedGyms(),
        getVisitedBuddies(),
      ]);
      setReels(r || []);
      setPosts(p || []);
      setVisitedGyms(g.visitedGyms || []);
      setVisitedBuddies(b.buddiesWithWorkoutHours || []);
    } catch (e) {
      console.error(e);
    }
  };

  const getFriendShip = async (username) => {
    setLoadFriend(true);
    try {
      const data = await fetchAllNearByUser(username);
      setFriends(data[0] || {});
    } finally {
      setLoadFriend(false);
    }
  };

  const handleFriendAction = async () => {
    const { invited } = friends;
    if (invited?.accepted) {
      await rejectFriendRequest(invited.id);
    } else if (invited?.sent) {
      await rejectFriendRequest(invited.id);
    } else {
      await addFriend(userId);
    }
    getFriendShip(userData.username);
  };

  const handleAcceptRequest = async () => {
    await acceptFriendRequest(friends?.invited?.id);
    getFriendShip(userData.username);
  };

  const handleDeclineRequest = async () => {
    await rejectFriendRequest(friends?.invited?.id);
    getFriendShip(userData.username);
  };

  const progress = (userData?.total_work_out_time || 0) / 60;
  const milestoneLabel =
    progress > 200 ? 'Diamond' :
    progress > 100 ? 'Gold' :
    progress > 50 ? 'Silver' : 'Bronze';
  const hoursToNext = Math.max(0, milestones[milestoneLabel.toLowerCase()] - progress);

  const getDataToShow = () => {
    if (selectedTab === 'Reels') return reels;
    if (selectedTab === 'Posts') return posts;
    if (selectedTab === 'Visited Gym') return visitedGyms;
    if (selectedTab === 'Gym Buddies') return visitedBuddies;
    return [];
  };

  const renderItem = ({ item }) => {
    if (selectedTab === 'Reels') {
      return (
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("ReelsScreen", { reelId: item.id })}>
          <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} style={styles.gridImage} />
        </TouchableOpacity>
      );
    } else if (selectedTab === 'Posts') {
      return (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate(item.type === 'aiPromo' ? 'ReelsScreen' : 'FeedDetailScreen', { feedId: item.id })}>
          <Text style={styles.listItemText}>{item.title || 'Untitled Post'}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() =>
            selectedTab === 'Visited Gym'
              ? navigation.navigate('GymDetails', { gym_id: item.gymId })
              : navigation.navigate('UserProfile', { userId: item.buddyId })
          }
        >
          <Text style={styles.listItemText}>{item.gymName || item.buddyName || 'Unknown'}</Text>
        </TouchableOpacity>
      );
    }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <FlatList
        data={getDataToShow()}
        key={selectedTab}
        numColumns={selectedTab === 'Reels' ? 3 : 1}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={
          <>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.header}>
              <TouchableOpacity onPress={() => setIsVisible(true)}>
                <Image source={{ uri: userData?.profile_pic }} style={styles.profileImage} />
              </TouchableOpacity>
              <ImageViewing
                images={[{ uri: userData?.profile_pic }]}
                imageIndex={0}
                visible={isVisible}
                onRequestClose={() => setIsVisible(false)}
              />
              <Text style={styles.name}>{userData.full_name}</Text>
              <Text style={styles.username}>@{userData.username}</Text>
              {!sameUser && (
                <TouchableOpacity style={styles.friendButton} onPress={handleFriendAction}>
                  {loadFriend ? <ActivityIndicator color="#fff" /> : friends?.invited?.accepted ? (
                    <UserCheck color="#fff" size={20} />
                  ) : friends?.invited?.sent ? (
                    <UserMinus color="#fff" size={20} />
                  ) : (
                    <UserPlus color="#fff" size={20} />
                  )}
                  <Text style={styles.friendButtonText}>
                    {friends?.invited?.accepted ? 'Friends' : friends?.invited?.sent ? 'Cancel Request' : 'Add Friend'}
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Users color="#4CAF50" size={24} />
                <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Clock color="#4CAF50" size={24} />
                <Text style={styles.statValue}>{Math.floor(progress)}</Text>
                <Text style={styles.statLabel}>Workout Hours</Text>
              </View>
            </View>

            <MilestoneProgress progress={progress} hoursToNextMilestone={hoursToNext} nextMilestone={milestoneLabel} />

            <View style={styles.tabs}>
              {['Reels'].map(tab => (
                <TouchableOpacity key={tab} style={[styles.tabItem, selectedTab === tab && styles.tabItemSelected]} onPress={() => setSelectedTab(tab)}>
                  <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
      />
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 20, paddingTop: 40 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  username: { color: '#eee', fontSize: 14, marginBottom: 10 },
  friendButton: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20, alignItems: 'center' },
  friendButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 16, marginTop: -20 },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: 'bold', fontSize: 18 },
  statLabel: { color: '#777' },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ddd' },
  tabItem: { flex: 1, padding: 12, alignItems: 'center' },
  tabItemSelected: { borderBottomWidth: 2, borderBottomColor: '#4CAF50' },
  tabText: { color: '#777' },
  tabTextSelected: { color: '#4CAF50', fontWeight: '600' },
  gridItem: { flex: 1 / 3, aspectRatio: 1, backgroundColor: '#eee', margin: 1 },
  gridImage: { width: '100%', height: '100%' },
  listItem: { padding: 14, borderBottomWidth: 1, borderColor: '#eee' },
  listItemText: { fontSize: 15, color: '#333' },
});
