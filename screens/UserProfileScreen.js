import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserCircle, Users, Clock, Settings, UserPlus, UserCheck, UserMinus } from 'lucide-react-native';
import Footer from '../components/Footer';
import {
  userDetails,
  fetchAllNearByUser,
  addFriend,
  rejectFriendRequest,
} from '../api/apiService';

export default function UserProfileScreen({ navigation, route }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState({ invited: { accepted: false, sent: false } });
  const [loadFriend, setLoadFriend] = useState(false);

  const { userId } = route.params;

  useEffect(() => {
    fetchUserData();
    const timer = setTimeout(() => getFriendShip(), 2000);
    return () => clearTimeout(timer);
  }, [userData?.username]);

  const fetchUserData = async () => {
    try {
      const data = await userDetails(userId);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getFriendShip = async () => {
    setLoadFriend(true);
    try {
      const data = await fetchAllNearByUser(userData?.username);
      console.log("Datya is", data);
      setFriends(data[0]);
    } catch (error) {
      console.error('Error fetching friendship status:', error);
    } finally {
      setLoadFriend(false);
    }
  };

  const handleFriendAction = async () => {
    if (friends?.invited?.accepted) {
      Alert.alert(
        'Unfriend',
        'Are you sure you want to unfriend this user?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unfriend', onPress: () => cancelFriendRequest(friends?.invited?.id) }
        ]
      );
    } else if (friends?.invited?.sent) {
      Alert.alert(
        'Cancel Friend Request',
        'Do you want to cancel this friend request?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => cancelFriendRequest(friends?.invited?.id) }
        ]
      );
    } else {
      sendFriendRequest(userId);
    }
  };

  const cancelFriendRequest = async (id) => {
    try {
      await rejectFriendRequest(id);
      fetchUserData();
      getFriendShip();
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      Alert.alert("Sorry, an error occurred");
    }
  };

  const sendFriendRequest = async (id) => {
    try {
      await addFriend(id);
      getFriendShip();
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert("Sorry, an error occurred");
    }
  };

  const getMilestoneDetails = () => {
    const workoutHours = (userData?.total_work_out_time || 0) / 60;
    if (workoutHours > 1000) return { image: require('../assets/diamondmedal.jpg'), label: 'Diamond' };
    if (workoutHours > 500) return { image: require('../assets/goldmedal.jpg'), label: 'Gold' };
    if (workoutHours > 100) return { image: require('../assets/silvermedal.jpg'), label: 'Silver' };
    return { image: require('../assets/bronzemedal.jpg'), label: 'Bronze' };
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const { image: milestoneImage, label: milestoneLabel } = getMilestoneDetails();
  const totalWorkoutHours = Math.floor(userData?.total_work_out_time / 60) || 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.header}
        >
       
          <Image source={{ uri: userData?.profile_pic || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          <Text style={styles.name}>{userData?.full_name || 'N/A'}</Text>
          <Text style={styles.username}>@{userData?.username || 'N/A'}</Text>
          <TouchableOpacity style={styles.friendButton} onPress={handleFriendAction} disabled={loadFriend}>
            {loadFriend ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                {friends?.invited?.accepted ? (
                  <UserCheck color="#fff" size={20} />
                ) : friends?.invited?.sent ? (
                  <UserMinus color="#fff" size={20} />
                ) : (
                  <UserPlus color="#fff" size={20} />
                )}
                <Text style={styles.friendButtonText}>
                  {friends?.invited?.accepted ? 'Friends' : friends?.invited?.sent ? 'Cancel Request' : 'Add Friend'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users color="#4CAF50" size={24} />
            <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statItem}>
            <Clock color="#4CAF50" size={24} />
            <Text style={styles.statValue}>{totalWorkoutHours}</Text>
            <Text style={styles.statLabel}>Workout Hours</Text>
          </View>
        </View>

        <View style={styles.milestoneContainer}>
          <Text style={styles.sectionTitle}>Current Milestone</Text>
          <View style={styles.milestoneContent}>
            <Image source={milestoneImage} style={styles.milestoneImage} />
            <View>
              <Text style={styles.milestoneLabel}>{milestoneLabel}</Text>
              <Text style={styles.milestoneDescription}>
                {totalWorkoutHours} hours of total workout time
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 15,
  },
  friendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  friendButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: -20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  milestoneContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  milestoneLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666',
  },
});