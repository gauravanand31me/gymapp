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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

  // Milestone thresholds (in hours)
  const milestones = {
    bronze: 50,
    silver: 100,
    gold: 200,
    diamond: 1000,
  };

  const getCurrentMilestone = (hours) => {
    
    if (parseInt(hours) <= milestones.diamond & parseInt(hours) > milestones.gold) return 'diamond';
    if (parseInt(hours) <= milestones.gold && parseInt(hours) > milestones.silver) return 'gold';
    if (parseInt(hours) <= milestones.silver && parseInt(hours) > milestones.bronze) return 'silver';
    if (parseInt(hours) <= milestones.bronze) return 'bronze';
    return null;
  };

  const getProgress = (hours) => {
    if (hours >= milestones.diamond) return 1;
    if (hours >= milestones.gold) return hours / milestones.diamond;
    if (hours >= milestones.silver) return hours / milestones.gold;
    if (hours >= milestones.bronze) return hours / milestones.silver;
    return hours / milestones.bronze;
  };

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

  const selectProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);

      try {
        await uploadProfileImage(selectedImage);
        Alert.alert('Success', 'Profile image uploaded successfully.');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        Alert.alert('Upload Error', 'Failed to upload profile image.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Calculate user's total workout hours
  const totalWorkoutHours = userData?.total_work_out_time / 60 || 0;
  const currentMilestone = getCurrentMilestone(totalWorkoutHours);
  {console.log("Current milestone", currentMilestone)}
  const progress = getProgress(totalWorkoutHours);

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <TouchableOpacity style={styles.addPhotoButton} onPress={selectProfileImage}>
              <Icon name="plus-circle-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.fullName}>
              {userData?.full_name || 'N/A'}
              {currentMilestone && (
                <Image
                  source={
                    currentMilestone === 'bronze'
                      ? require('../assets/bronzemedal.png')
                      : currentMilestone === 'silver'
                      ? require('../assets/silvermedal.png')
                      : currentMilestone === 'gold'
                      ? require('../assets/goldmedal.png')
                      : require('../assets/diamondmedal.jpg')
                  }
                  style={styles.milestoneIconNearName}
                />
              )}
            </Text>
            <Text style={styles.username}>@{userData?.username || 'N/A'}</Text>
            <Text style={styles.mobileNumber}>{userData?.mobile_number || 'N/A'}</Text>
          </View>
          {/* Settings Icon */}
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Icon name="cog" size={30} color="#555" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Friends</Text>
          <Text style={styles.statText}>Workout Time</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
          <Text style={styles.statValue}>{totalWorkoutHours} hrs.</Text>
        </View>
      </View>

      {/* Milestone Progress */}
      <View style={styles.milestoneContainer}>
        <Text style={styles.sectionTitle}>Milestone Progress</Text>
        <View style={styles.milestoneIcons}>
          <Image source={require('../assets/bronzemedal.png')} style={styles.milestoneIcon} />
          <Image source={require('../assets/silvermedal.png')} style={styles.milestoneIcon} />
          <Image source={require('../assets/goldmedal.png')} style={styles.milestoneIcon} />
          <Image source={require('../assets/diamondmedal.jpg')} style={styles.milestoneIcon} />
        </View>
        <ProgressBar
          progress={progress}
          width={null}
          height={10}
          color="#6FCF97"
          unfilledColor="#E0E0E0"
          borderColor="transparent"
          style={styles.progressBar}
        />
        <Text style={styles.milestoneText}>
          {milestones[currentMilestone] - totalWorkoutHours} hours away from earning{' '}
          {currentMilestone === 'bronze'
            ? 'Silver'
            : currentMilestone === 'silver'
            ? 'Gold'
            : currentMilestone === 'gold'
            ? 'Diamond'
            : 'Bronze'}
          .
        </Text>
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
                <Text style={styles.listItemSubText}>{item.visits} visits</Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={visitedBuddies}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.buddyName}</Text>
                <Text style={styles.listItemSubText}>{item.workoutHours} hours together</Text>
              </View>
            )}
          />
        )}
      </View>

      <Footer navigation={navigation}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 5,
  },
  profileDetails: {
    marginLeft: 20,
    flex: 1,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  milestoneIconNearName: {
    width: 30,
    height: 30,
    marginLeft: 5,
  },
  username: {
    fontSize: 16,
    color: '#555',
  },
  mobileNumber: {
    fontSize: 14,
    color: '#888',
  },
  settingsButton: {
    marginLeft: 'auto',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 16,
    color: '#555',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  milestoneContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  milestoneIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
  },
  progressBar: {
    marginBottom: 10,
  },
  milestoneText: {
    fontSize: 14,
    color: '#555',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  tabButton: {
    padding: 15,
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemSubText: {
    fontSize: 14,
    color: '#888',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
