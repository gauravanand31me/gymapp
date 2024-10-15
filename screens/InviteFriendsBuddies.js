import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';
import { fetchFriends, inviteBuddyRequest, fetchBuddyInvites } from '../api/apiService'; // Add fetchInvitedBuddies

const InviteFriendBuddiesScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  const [invitedBuddies, setInvitedBuddies] = useState([]); // Track invited buddies
  const [alreadyInvited, setAlreadyInvited] = useState([]); // Track already invited buddies

  let bookingId;
  if (route?.params?.bookingId) {
    bookingId = route.params.bookingId; // Assuming bookingId is passed as a parameter
  }

  // Fetch friends on component mount
  const fetchBuddyList = async () => {
    try {
      const data = await fetchFriends();
      setBuddyList(data.accepted); // Use the "accepted" array from the response
    } catch (error) {
      console.error('Error fetching buddy list:', error);
    }
  };

  // Fetch already invited buddies for this booking
  const fetchAlreadyInvitedBuddies = async () => {
    try {
      const data = await fetchBuddyInvites(bookingId); // Assuming this API returns invited users by bookingId
      console.log("Data is", data);
      const invitedIds = data.map(invite => invite.toUserId); // Assuming userId is in the response
      console.log("invitedIds", invitedIds);
      setAlreadyInvited(invitedIds); // Store already invited buddy IDs
    } catch (error) {
      console.error('Error fetching invited buddies:', error);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchAlreadyInvitedBuddies(); // Fetch invited buddies if bookingId is present
    }
    fetchBuddyList(); // Fetch the buddy list
  }, []);

  const searchUser = (user) => {
    setSearchText(user);
  };

  const inviteBuddy = async (bookingId, id) => {
    try {
      const resp = await inviteBuddyRequest(bookingId, id);
      
      if (resp.status == "pending") {
        Alert.alert("Success", "Invitation sent successfully!");
        setInvitedBuddies((prev) => [...prev, id]); // Add the buddy to the invited list
      } else {
        Alert.alert("Error", "Failed to send the invitation.");
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  // Render a buddy
  const renderBuddy = ({ item }) => (
    <View style={styles.buddyItem}>
      <Image
        source={item.profile_pic ? { uri: item.profile_pic } : require('../assets/cultfit.jpg')}
        style={styles.buddyImage}
      />
      <View style={styles.buddyInfo}>
        <Text style={styles.buddyName}>{item.full_name}</Text>
      </View>
      {bookingId && (
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => inviteBuddy(bookingId, item.fromUserId)}
          disabled={alreadyInvited.includes(item.fromUserId) || invitedBuddies.includes(item.fromUserId)} // Disable if already invited
        >
          <Text style={styles.inviteButtonText}>
            {alreadyInvited.includes(item.fromUserId) || invitedBuddies.includes(item.fromUserId) ? 'Invited' : 'Invite buddy'}
          </Text>
        </TouchableOpacity>
      )}

      {!bookingId && (
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Unfriend</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Invite buddies */}
      <View style={styles.header}>
        <Text>
          <Icon name="dumbbell" size={40} color="#fff" />
        </Text>
        <View>
          <Text style={styles.headerTitle}>Invite Friends</Text>
          <Text style={styles.headerSubtitle}>Add your buddies for a workout!</Text>
        </View>
      </View>

      {/* Display Booking ID */}
      <View style={styles.bookingIdContainer}>
        <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text>
          <Icon name="magnify" size={24} color="#888" />
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Friends"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={(text) => searchUser(text)}
        />
      </View>

      {/* Buddy List */}
      <FlatList
        data={buddyList.filter((buddy) => buddy.full_name.toLowerCase().includes(searchText.toLowerCase()))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBuddy}
        contentContainerStyle={styles.buddyList}
      />

      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#66BB6A',
    marginLeft: 10,
  },
  bookingIdContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  bookingIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  buddyList: {
    padding: 16,
  },
  buddyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
  },
  buddyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InviteFriendBuddiesScreen;
