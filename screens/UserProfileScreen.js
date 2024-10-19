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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker'; // Using expo-image-picker
import Footer from '../components/Footer';
import {
    userDetails,
    uploadProfileImage,
    getVisitedGyms,
    getVisitedBuddies,
    fetchAllNearByUser,
    addFriend,
} from '../api/apiService'; // Ensure you have the correct path

const UserProfileScreen = ({ navigation, route }) => {
    const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [visitedGyms, setVisitedGyms] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Visited Gym');
    const [visitedBuddies, setVisitedBuddies] = useState([]);
    const [friends, setFriends] = useState({});

    const { userId } = route.params;

    const getFriendShip = async () => {
        const data = await fetchAllNearByUser(userData?.username);
        if (data) {
          setFriends(data[0]);
        }
       
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await userDetails(userId);
                setUserData(data);
                setProfileImage(data.profile_pic || profileImage);
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'Could not fetch user data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const fetchVisitedGyms = async () => {
            try {
                const response = await getVisitedGyms(userId);
                setVisitedGyms(response.visitedGyms);
            } catch (error) {
                console.error('Error fetching visited gyms:', error);
                Alert.alert('Error', 'Could not fetch visited gyms. Please try again later.');
            }
        };

        const fetchVisitedBuddies = async () => {
            try {
                const response = await getVisitedBuddies(userId);
                setVisitedBuddies(response.buddiesWithWorkoutHours);
            } catch (error) {
                console.error('Error fetching visited buddies:', error);
                Alert.alert('Error', 'Could not fetch visited buddies. Please try again later.');
            }
        };

        fetchUserData();
        fetchVisitedGyms();
        fetchVisitedBuddies();
        getFriendShip();
    }, [userData]);

    const sendFriendRequest = async (id) => {
        try {
            const response = await addFriend(id);
            console.log('Friend request sent:', response);
            getFriendShip();
        } catch (error) {
            console.error('Error inviting friend:', error);
        }
    }



    const milestones = {
        bronze: 50,
        silver: 100,
        gold: 200,
        diamond: 1000,
      };
    
      const getCurrentMilestone = (hours) => {
        
        if (parseInt(hours) >= milestones.diamond) return 'diamond';
        if (parseInt(hours) >= milestones.gold) return 'gold';
        if (parseInt(hours) >= milestones.silver) return 'silver';
        if (parseInt(hours) >= milestones.bronze) return 'bronze';
        return null;
      };
    
      const getProgress = (hours) => {
        if (hours >= milestones.diamond) return 1;
        if (hours >= milestones.gold) return hours / milestones.diamond;
        if (hours >= milestones.silver) return hours / milestones.gold;
        if (hours >= milestones.bronze) return hours / milestones.silver;
        return hours / milestones.bronze;
      };

    const getMedalDetails = () => {
        const workoutHours = (userData?.total_work_out_time || 0) / 60;
        let medalImage, medalLabel;

        if (workoutHours > 1000) {
            medalImage = require('../assets/goldmedal.png');
            medalLabel = 'Pro';
        } else if (workoutHours > 500) {
            medalImage = require('../assets/silvermedal.png');
            medalLabel = 'Advance';
        } else if (workoutHours > 100) {
            medalImage = require('../assets/bronzemedal.png');
            medalLabel = 'Bronze';
        } else {
            medalImage = require('../assets/diamondmedal.jpg');
            medalLabel = 'Beginner Mode';
        }
        return { medalImage, medalLabel };
    };

    if (loading || uploading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    const { medalImage, medalLabel } = getMedalDetails();
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
                  {friends && <TouchableOpacity
                    style={styles.sendRequestButton}
                    onPress={() => {
                        if (!friends?.invited?.accepted && !friends?.invited?.sent) {
                            sendFriendRequest(userId);
                        }
                    }}
                >
                 
                    <Text style={styles.sendRequestText}>
                        {friends?.invited?.accepted && !friends?.invited?.sent ? 'Friends' : friends?.invited?.sent && !friends?.invited?.accepted ? 'Request sent' : 'Send Request'}
                    </Text>
                </TouchableOpacity>}
                  {/* Settings Icon */}
                  
                </View>
                <View style={styles.statsContainer}>
          <View>
            <Text style={styles.statText}>Friends</Text>
            <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
          </View>
          <View>
            <Text style={styles.statText}>Workout Time</Text>
            <Text style={styles.statValue}>{totalWorkoutHours} hrs.</Text>
          </View>
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
        
              <Footer navigation={navigation} />
            </View>
          );
  
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 30
    },
    profileSection: {
      padding: 20,
      backgroundColor: '#fff',
      marginBottom: 5, 
    },
    profileHeader: {
      alignItems: 'center',
      justifyContent: 'center', // Center the content horizontally and vertically
      marginBottom: 20,
    },
    profileImageContainer: {
      position: 'relative',
      alignItems: 'center', // Center the profile image container
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: '#4CAF50',
    },
    addPhotoButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#4CAF50',
      borderRadius: 20,
      padding: 0,
    },
    profileDetails: {
      marginTop: 10,
      alignItems: 'center', // Center the text elements
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
      position: 'absolute',
      top: 10,
      right: 10,
    
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#fff', // Light green background for the stats section
      padding: 15, // Padding inside the container for a clean look
      borderRadius: 10, // Rounded corners for a softer look
      marginTop: 5, // Reduced margin to bring stats closer to profile section
      marginHorizontal: 20, // Margin on sides to align with other content
    },
    statText: {
      fontSize: 18, // Font size for better readability
      fontWeight: '600', // Semi-bold for labels
      color: '#333', // Darker text for a professional look
      //marginBottom: 5, // Slight space between label and value
    },
    statValue: {
      fontSize: 20, // Font size increased for emphasis
      fontWeight: 'bold', // Bold to make the values stand out
      color: '#4CAF50', // Use the green theme color for consistency
    },
    milestoneContainer: {
      marginTop: 5, // Reduced space above the milestone container
      paddingHorizontal: 10,
      paddingVertical: 5, // Reduced vertical padding to shrink the container
      backgroundColor: '#fff',
      borderRadius: 10, // Optional: Adjusted for rounded corners
      marginHorizontal: 20, // Aligning with the profile section and stats
    },
    sectionTitle: {
      fontSize: 16, // Slightly smaller font for title
      fontWeight: 'bold',
      marginBottom: 5, // Reduced space below the title
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
      marginTop: 5, // Reduced space above the text
      fontSize: 12, // Smaller font for milestone text
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
      fontWeight:'bold',
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
    sendRequestButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        padding: 10,
    },
    sendRequestText: {
        color: '#fff',
        fontSize: 16,
    },
  });

export default UserProfileScreen;
