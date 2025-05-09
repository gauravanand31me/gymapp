// Updated `UserProfileScreen.js` with clean white design
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
} from 'react-native';
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
import { Users, Clock, UserPlus, UserCheck, UserMinus } from 'lucide-react-native';

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
      const r = await fetchUserReels({ page: 0, limit: 30, userId: data.id });
      setReels(r || []);
      getFriendShip(data.username);
    } catch (e) {
      Alert.alert('Error fetching user');
    } finally {
      setLoading(false);
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

  const progress = (userData?.total_work_out_time || 0) / 60;
  const milestoneLabel =
    progress > 200 ? 'Diamond' :
    progress > 100 ? 'Gold' :
    progress > 50 ? 'Silver' : 'Bronze';
  const hoursToNext = Math.max(0, milestones[milestoneLabel.toLowerCase()] - progress);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("ReelsScreen", { reelId: item.id })}>
      <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <FlatList
        data={reels}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
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
                    <UserCheck color="#4CAF50" size={20} />
                  ) : friends?.invited?.sent ? (
                    <UserMinus color="#4CAF50" size={20} />
                  ) : (
                    <UserPlus color="#4CAF50" size={20} />
                  )}
                  <Text style={styles.friendButtonText}>
                    {friends?.invited?.accepted ? 'Friends' : friends?.invited?.sent ? 'Cancel Request' : 'Add Friend'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

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
  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  username: { color: '#777', fontSize: 14, marginBottom: 10 },
  friendButton: { flexDirection: 'row', backgroundColor: '#e6f7ea', padding: 8, borderRadius: 20, alignItems: 'center', marginTop: 8 },
  friendButtonText: { color: '#333', marginLeft: 8, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: 'bold', fontSize: 18 },
  statLabel: { color: '#777' },
  gridItem: { flex: 1 / 3, aspectRatio: 1, backgroundColor: '#eee', margin: 1 },
  gridImage: { width: '100%', height: '100%' },
  tabWrapper: { padding: 10, backgroundColor: '#fff' },
  tabTitle: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
});
