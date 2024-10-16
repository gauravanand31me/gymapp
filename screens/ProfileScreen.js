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
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Footer from '../components/Footer'; // Assuming you have a Footer component
import {
  userDetails,
  uploadProfileImage,
  getVisitedGyms,
  getVisitedBuddies,
} from '../api/apiService'; // Custom API services to get user details, gyms, and buddies

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedGyms, setVisitedGyms] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Visited Gym');
  const [visitedBuddies, setVisitedBuddies] = useState([]);

  // Fetch user data and visited gyms/buddies on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userDetails();
        setUserData(data);
        setProfileImage(data.profile_pic || profileImage);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchVisitedGyms = async () => {
      try {
        const response = await getVisitedGyms();
        setVisitedGyms(response.visitedGyms);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch visited gyms. Please try again later.');
      }
    };

    const fetchVisitedBuddies = async () => {
      try {
        const response = await getVisitedBuddies();
        setVisitedBuddies(response.buddiesWithWorkoutHours);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch gym buddies.');
      }
    };

    fetchUserData();
    fetchVisitedGyms();
    fetchVisitedBuddies();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.nameText}>{userData?.full_name || 'User Name'}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Friends</Text>
          <Text style={styles.statText}>Workout Time</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statValue}>{userData?.friends || 0}</Text>
          <Text style={styles.statValue}>{userData?.total_work_out_time || 0} hrs.</Text>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      </View>

      {/* Milestone Progress */}
      <View style={styles.milestoneContainer}>
        <Text style={styles.sectionTitle}>Milestone Progress</Text>
        <View style={styles.milestoneIcons}>
          <Image source={require('../assets/bronzemedal.png')} style={styles.milestoneIcon} />
          <Image source={require('../assets/silvermedal.png')} style={styles.milestoneIcon} />
          <Image source={require('../assets/goldmedal.png')} style={styles.milestoneIcon} />
          <Image source={require('../assets/defaultmedal.jpg')} style={styles.milestoneIcon} />
        </View>
        <ProgressBar 
          progress={0.7} 
          width={null} 
          height={10} 
          color="#6FCF97" 
          unfilledColor="#E0E0E0" 
          borderColor="transparent" 
          style={styles.progressBar}
        />
        <Text style={styles.milestoneText}>20 hours away from earning Bronze.</Text>
      </View>

      {/* Tabs for Visited Gyms and Gym Buddies */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Visited Gym' && styles.activeTab]}
          onPress={() => setSelectedTab('Visited Gym')}
        >
          <Text style={[styles.tabText, selectedTab === 'Visited Gym' && styles.activeTabText]}>Visited Gym</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Gym Buddies' && styles.activeTab]}
          onPress={() => setSelectedTab('Gym Buddies')}
        >
          <Text style={[styles.tabText, selectedTab === 'Gym Buddies' && styles.activeTabText]}>Gym Buddies</Text>
        </TouchableOpacity>
      </View>

      {/* List Data */}
      <View style={styles.listContainer}>
        {selectedTab === 'Visited Gym' ? (
          <FlatList
            data={visitedGyms}
            keyExtractor={(item) => item.gymId}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.gymName}</Text>
                <Text style={styles.listItemHours}>{item.totalWorkoutHours / 60} h</Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={visitedBuddies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.buddyName}</Text>
                <Text style={styles.listItemHours}>{item.totalWorkoutHours / 60} h</Text>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 10,
  },
  statText: {
    fontSize: 16,
    color: '#555',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 30,
    marginTop: 10,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  milestoneIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  milestoneIcon: {
    width: 30,
    height: 30,
  },
  progressBar: {
    marginVertical: 10,
  },
  milestoneText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  
  },
  milestoneContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  tabButton: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  listItemHours: {
    fontSize: 16,
    color: '#4CAF50',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,  // Adjust based on footer height
    backgroundColor: '#f5f5f5',
  }
});

export default ProfileScreen;
