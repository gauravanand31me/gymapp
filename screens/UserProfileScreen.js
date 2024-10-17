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
                            sendFriendRequest(userId);
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
                        data={visitedGyms}
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
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#4CAF50',
        marginRight: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    profileDetails: {
        justifyContent: 'center',
    },
    fullName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    username: {
        fontSize: 16,
        color: '#777',
    },
    mobileNumber: {
        fontSize: 14,
        color: '#999',
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 5,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statLabel: {
        fontSize: 16,
        color: '#777',
    },
    workoutTimeContainer: {
        alignItems: 'center',
    },
    statValueTime: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    medalContainer: {
        alignItems: 'center',
    },
    medalImage: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    medalLabel: {
        fontSize: 16,
        color: '#777',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginVertical: 10,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#4CAF50',
    },
    tabText: {
        fontSize: 16,
        color: '#333',
    },
    activeTabText: {
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    listContainer: {
        flex: 1,
    },
    gymItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    gymInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gymName: {
        fontSize: 18,
        color: '#333',
    },
    gymWorkoutHours: {
        fontSize: 16,
        color: '#777',
    },
    buddyItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    buddyInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buddyUsername: {
        fontSize: 18,
        color: '#333',
    },
    buddyWorkoutHours: {
        fontSize: 16,
        color: '#777',
    },
    footerContainer: {
        paddingVertical: 10,
    },
});

export default UserProfileScreen;
