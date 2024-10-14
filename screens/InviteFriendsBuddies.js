import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';
import { fetchFriends, inviteBuddyRequest } from '../api/apiService';

const InviteFriendBuddiesScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  let bookingId;
  if(route?.params?.bookingId) {
      bookingId  = route.params.bookingId; // Assuming bookingId is passed as a parameter
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

  useEffect(() => {
    fetchBuddyList();
  }, []);

  const searchUser = (user) => {
    setSearchText(user);
  };

  const inviteBuddy = async (bookingId, id) => {
        const resp = await inviteBuddyRequest(bookingId, id);
        console.log("Response Successful", resp);
        navigation.navigate("MyBookings");
  }

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
      {bookingId && <TouchableOpacity style={styles.inviteButton} onPress={() => inviteBuddy(bookingId, item.fromUserId)}>
        <Text style={styles.inviteButtonText}>Invite buddy</Text>
      </TouchableOpacity>}

      {!bookingId && <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteButtonText}>Unfriend</Text>
      </TouchableOpacity>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Invite buddies */}
      <View style={styles.header}>
        <Text><Icon name="dumbbell" size={40} color="#fff" /></Text>
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
        <Text><Icon name="magnify" size={24} color="#888" /></Text>
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
