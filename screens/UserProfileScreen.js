import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    FlatList, // Import FlatList
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
    addFriend,  // Import the API call
} from '../api/apiService'; // Ensure you have the correct path

const UserProfileScreen = ({ navigation, route }) => {
    const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [visitedGyms, setVisitedGyms] = useState([]);  // State to store visited gyms
    const [selectedTab, setSelectedTab] = useState('Visited Gym'); // State for selected tab
    const [visitedBuddies, setVisitedBuddies] = useState([]);
    const [friends, setFriends] = useState({});

    const { userId } = route.params;

    const getFriendShip = async () => {
        const data = await fetchAllNearByUser(userData?.username);
        setFriends(data[0]);
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
                const response = await getVisitedGyms(userId);  // Fetch visited gyms
                setVisitedGyms(response.visitedGyms);  // Set the visited gyms data
            } catch (error) {
                console.error('Error fetching visited gyms:', error);
                Alert.alert('Error', 'Could not fetch visited gyms. Please try again later.');
            }
        };


        const fetchVisitedBuddies = async () => {
            try {
                const response = await getVisitedBuddies(userId);  // Fetch visited gyms
                console.log("Response received", response.buddiesWithWorkoutHours);
                setVisitedBuddies(response.buddiesWithWorkoutHours);  // Set the visited gyms data
            } catch (error) {
                console.error('Error fetching visited gyms:', error);
                Alert.alert('Error', 'Could not fetch visited gyms. Please try again later.');
            }
        };

        

        fetchUserData();
        fetchVisitedGyms();  // Call the API to fetch visited gyms
        fetchVisitedBuddies();
        getFriendShip();
    }, []);

    const sendFriendRequest = async (id) => {
        try {
            const response = await addFriend(id);
            console.log('Friend request sent:', response);
            getFriendShip();
          } catch (error) {
            console.error('Error inviting friend:', error);
          }
    }



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
            medalImage = require('../assets/defaultmedal.jpg');
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

    return (
        <View style={styles.container}>
           
            {/* Profile Header */}
            <View style={styles.headerContainer}>
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />

                    </View>
                    <View style={styles.profileDetails}>
                        <Text style={styles.fullName}>{userData?.full_name || 'N/A'}</Text>
                        <Text style={styles.username}>@{userData?.username || 'N/A'}</Text>
                        <Text style={styles.mobileNumber}>{userData?.mobile_number || 'N/A'}</Text>
                    </View>
                </View>
                
                {friends && <TouchableOpacity
                    style={styles.sendRequestButton}
                    onPress={() => {
                        if (!friends?.invited?.accepted && !friends?.invited?.sent) {
                            sendFriendRequest(userId)
                            // Handle send request logic here
                        }
                    }}
                >
                    <Text style={styles.sendRequestText}>
                        {friends?.invited?.accepted && !friends?.invited?.sent ? 'Friends' : friends?.invited?.sent && !friends?.invited?.accepted ? 'Invited' : 'Send Request'}
                    </Text>
                </TouchableOpacity>}

            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <TouchableOpacity onPress={() => navigation.navigate("InviteFriendBuddy")}>
                        <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
                        <Text style={styles.statLabel}>Friends</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.workoutTimeContainer}>
                        <Text style={styles.statValueTime}>{(userData?.total_work_out_time / 60).toFixed(1)} h</Text>
                    </View>
                    <Text style={styles.statLabel}>Workout Time</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.medalContainer}>
                        <Image source={medalImage} style={styles.medalImage} />
                        <Text style={styles.medalLabel}>{medalLabel}</Text>
                    </View>
                </View>
            </View>

            {/* Tabs for Visited Gym and Gym Buddies */}
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
                {selectedTab === 'Visited Gym' ? (
                    <FlatList
                        data={visitedGyms}  // Use the visitedGyms state
                        keyExtractor={(item) => item.gymId}
                        renderItem={({ item }) => (
                            <View style={styles.gymItem}>
                                <View style={styles.gymInfoContainer}>
                                    <Text style={styles.gymName}>{item.gymName}</Text>
                                    <Text style={styles.gymWorkoutHours}>{item.totalWorkoutHours / 60} hours</Text>
                                </View>
                            </View>
                        )}
                    />
                ) : (
                    <FlatList
                        data={visitedBuddies}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.buddyItem}>
                                <View style={styles.buddyInfoContainer}>
                                    <Text style={styles.buddyUsername}>{item.buddyName}</Text>
                                    <Text style={styles.buddyWorkoutHours}>{item.totalWorkoutHours / 60} h</Text>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>

            {/* Footer */}
            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginTop: 30, // Space from status bar
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        position: 'relative',
        borderRadius: 50,
        padding: 5,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    addPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 4,
        elevation: 2,
    },
    profileDetails: {
        marginLeft: 10,
    },
    fullName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 16,
        color: '#555',
    },
    mobileNumber: {
        fontSize: 16,
        color: '#555',
    },
    settingsButton: {
        padding: 10,
    },
    sendRequestButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    sendRequestText: {
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        alignItems: 'center',
        flexDirection: 'column', // Stack items vertically
        justifyContent: 'center',
    },
    workoutTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center', // Center text
    },
    statValueTime: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    medalContainer: {
        alignItems: 'center',
    },
    medalImage: {
        width: 40,
        height: 40,
    },
    medalLabel: {
        fontSize: 16,
        marginTop: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginVertical: 10,
    },
    tabButton: {
        paddingVertical: 10,
        flex: 1,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4CAF50',
    },
    tabText: {
        fontSize: 18,
        color: '#555',
    },
    activeTabText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 10,
    },
    gymItem: {
        //backgroundColor: '#e8f5e9',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    gymName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    gymWorkoutHours: {
        color: '#555',
        fontWeight: 'bold',
    },
    buddyItem: {
        //backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    buddyUsername: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    buddyWorkoutHours: {
        color: '#555',
        fontWeight: 'bold',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,  // Adjust based on footer height
        backgroundColor: '#f5f5f5',
    },
    gymInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buddyInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center', // Center text
        marginTop: 4, // Space between value and label
    },
});

export default UserProfileScreen;
