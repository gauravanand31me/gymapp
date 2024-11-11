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
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImageManipulator from 'expo-image-manipulator';

import {
  userDetails,
  uploadProfileImage,
  getVisitedGyms,
  getVisitedBuddies,
} from '../api/apiService';

const milestones = {
  bronze: 50,
  silver: 100,
  gold: 200,
  diamond: 300,
};

const getCurrentMilestone = (hours) => {
  if (parseInt(hours) >= milestones.diamond) return 'diamond';
  if (parseInt(hours) >= milestones.gold) return 'gold';
  if (parseInt(hours) >= milestones.silver) return 'silver';
  if (parseInt(hours) >= milestones.bronze) return 'bronze';
  return null;
};

const getProgress = (hours) => {
  if (hours >= 300) return 1; // Full progress for Diamond milestone
  if (hours >= 200) return (hours - 200) / 100 + 0.75; // Progress towards Diamond (200-300 hours)
  if (hours >= 100) return (hours - 100) / 100 + 0.5; // Progress towards Gold (100-200 hours)
  if (hours >= 50) return (hours - 50) / 50 + 0.25; // Progress towards Silver (50-100 hours)
  return hours / 50 * 0.25; // Progress towards Bronze (0-50 hours)
};

export default function ProfileScreen({ navigation, route }) {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedGyms, setVisitedGyms] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Visited Gym');
  const [visitedBuddies, setVisitedBuddies] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);



  const fetchUserData = async () => {
    try {
      const data = await userDetails();
      setUserData(data);
      setProfileImage(data.profile_pic || profileImage);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [route.params]);

  useEffect(() => {
    const fetchVisitedGyms = async () => {
      try {
        const response = await getVisitedGyms();
        setVisitedGyms(response.visitedGyms || []);
      } catch (error) {
        console.error('Error fetching visited gyms:', error);
        Alert.alert('Error', 'Could not fetch visited gyms. Please try again later.');
      }
    };

    const fetchVisitedBuddies = async () => {
      try {
        const response = await getVisitedBuddies();
        setVisitedBuddies(response.buddiesWithWorkoutHours || []);
      } catch (error) {
        console.error('Error fetching gym buddies:', error);
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

      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          selectedImage,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setProfileImage(manipulatedImage.uri);
        await uploadProfileImage(manipulatedImage.uri);
        Alert.alert('Success', 'Profile image uploaded successfully.');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        Alert.alert('Upload Error', 'Failed to upload profile image.');
      }
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  const totalWorkoutHours = (userData?.total_work_out_time || 0) / 60;
  const currentMilestone = getCurrentMilestone(totalWorkoutHours);
  const progress = getProgress(totalWorkoutHours);

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        if (selectedTab === 'Visited Gym') {
          navigation.navigate('GymDetails', { gym_id: item.gymId });
        }
      }}
    >
      <View style={styles.listItemContent}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/50' }}
          style={styles.listItemImage}
        />
        <View style={styles.listItemTextContainer}>
          <Text style={styles.listItemText}>{item.gymName || item.buddyName || 'N/A'}</Text>
          <Text style={styles.listItemSubText}>
            {selectedTab === 'Visited Gym'
              ? `${Math.round((item.totalWorkoutHours || 0) / 60)} hrs visits`
              : `${item.workoutHours || 0} hours together`}
          </Text>
        </View>
      </View>
      {selectedTab === 'Visited Gym' && (
        <Icon name="chevron-right" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={toggleModal}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              <TouchableOpacity style={styles.addPhotoButton} onPress={selectProfileImage}>
                <Icon name="plus-circle-outline" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <Modal visible={isModalVisible} transparent={true} onRequestClose={toggleModal}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeModalButton} onPress={toggleModal}>
                <Icon name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <Image source={{ uri: profileImage }} style={styles.enlargedProfileImage} />
            </View>
          </Modal>
            <View style={styles.profileDetails}>
              <Text style={styles.fullName}>
                {userData?.full_name || 'N/A'}
                {currentMilestone && (
                <Image
                  source={
                    currentMilestone === 'bronze'
                      ? require('../assets/bronzemedal.jpg')
                      : currentMilestone === 'silver'
                      ? require('../assets/silvermedal.jpg')
                      : currentMilestone === 'gold'
                      ? require('../assets/goldmedal.jpg')
                      : require('../assets/diamondmedal.jpg')
                  }
                  style={styles.milestoneIconNearName}
                  />
                )}
              </Text>
              <Text style={styles.username}>@{userData?.username || 'N/A'}</Text>
              <Text style={styles.mobileNumber}>{userData?.mobile_number || 'N/A'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings', { fullName: userData?.full_name })}
          >
            <Icon name="cog" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        {uploadSuccess && (
          <View style={styles.successMessage}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.successText}>Profile image updated successfully!</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate("InviteFriendBuddy")}
          >
            <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
            <Text style={styles.statText}>Friends</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(totalWorkoutHours)} hrs</Text>
            <Text style={styles.statText}>Workout Time</Text>
          </View>
        </View>

        <View style={styles.milestoneContainer}>
        <Text style={styles.sectionTitle}>Milestone Progress</Text>
        <View style={styles.milestoneIcons}>
          <Image source={require('../assets/bronzemedal.jpg')} style={styles.milestoneIcon} />
          <Image source={require('../assets/silvermedal.jpg')} style={styles.milestoneIcon} />
          <Image source={require('../assets/goldmedal.jpg')} style={styles.milestoneIcon} />
          <Image source={require('../assets/diamondmedal.jpg')} style={styles.milestoneIcon} />
        </View>
        <ProgressBar
         progress={progress} // Use the updated progress logic here
         width={null}
         height={10}
         color="#6FCF97"
         unfilledColor="#E0E0E0"
         borderColor="transparent"
         style={styles.progressBar}
        />
        <Text style={styles.milestoneText}>
          {milestones[currentMilestone || 'bronze'] - totalWorkoutHours} hours away from earning{' '}
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

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Visited Gym' && styles.activeTab]}
            onPress={() => setSelectedTab('Visited Gym')}
          >
            <Text style={[styles.tabText, selectedTab === 'Visited Gym' && styles.activeTabText]}>
              Visited Gym
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Gym Buddies' && styles.activeTab]}
            onPress={() => setSelectedTab('Gym Buddies')}
          >
            <Text style={[styles.tabText, selectedTab === 'Gym Buddies' && styles.activeTabText]}>
              Gym Buddies
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {selectedTab === 'Visited Gym' && visitedGyms.length === 0 ? (
            <Text style={styles.noDataText}>No visited gyms yet</Text>
          ) : selectedTab === 'Gym Buddies' && visitedBuddies.length === 0 ? (
            <Text style={styles.noDataText}>No gym buddies yet</Text>
          ) : (
            <FlatList
              data={selectedTab === 'Visited Gym' ? visitedGyms : visitedBuddies}
              renderItem={renderListItem}
              keyExtractor={(item) => (selectedTab === 'Visited Gym' ? item.gymId : item.userId)}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
      <Footer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 25,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  uploadingOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 5,
  },
  profileDetails: {
    marginLeft: 20,
    flex: 1,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  milestoneIconNearName: {
    width: 24,
    height: 24,
    marginLeft: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  mobileNumber: {
    fontSize: 14,
    color: '#888',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  successText: {
    marginLeft: 10,
    color: '#4CAF50',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  milestoneContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  milestoneIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5, // Reduced space below the icons
    marginLeft: 20,  // This moves the icons slightly to the right
    backgroundColor:'#fff'
  },
  milestoneIcon: {
    width: 40, // Reduced icon size
    height: 40, // Reduced icon size
  },
  progressBar: {
    marginTop: 10, // Reduced space above the progress bar
    height: 8, // Slightly thinner progress bar
  },
  milestoneText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listItemSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  enlargedProfileImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});