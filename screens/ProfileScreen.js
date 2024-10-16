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
            <Text style={styles.fullName}>{userData?.full_name || 'N/A'}</Text>
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
          <Text style={styles.statValue}>{userData?.friends || 0}</Text>
          <Text style={styles.statValue}>{userData?.total_work_out_time / 60 || 0} hrs.</Text>
        </View>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileImageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 5,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 20,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#777',
  },
  mobileNumber: {
    fontSize: 16,
    color: '#777',
  },
  settingsButton: {
    padding: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    width: '100%',
  },
  statText: {
    fontSize: 16,
    color: '#777',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  milestoneContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  milestoneIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestoneIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  progressBar: {
    marginTop: 15,
  },
  milestoneText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listItemText: {
    fontSize: 16,
  },
  listItemHours: {
    fontSize: 16,
    color: '#777',
  },
  footerContainer: {
    marginTop: 10,
  },
});

export default ProfileScreen;
