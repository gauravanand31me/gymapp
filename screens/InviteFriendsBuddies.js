import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';
import { fetchFriends, inviteBuddyRequest, fetchBuddyInvites } from '../api/apiService';

const InviteFriendBuddiesScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  const [invitedBuddies, setInvitedBuddies] = useState([]);
  const [alreadyInvited, setAlreadyInvited] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  let bookingId;
  if (route?.params?.bookingId) {
    bookingId = route.params.bookingId;
  }

  const fetchBuddyList = async () => {
    try {
      const data = await fetchFriends();
      console.log("Data is", data);
      setBuddyList(data.accepted);
    } catch (error) {
      console.error('Error fetching buddy list:', error);
    }
  };

  const fetchAlreadyInvitedBuddies = async () => {
    try {
      const data = await fetchBuddyInvites(bookingId);
      const invitedIds = data.map(invite => invite.toUserId);
      setAlreadyInvited(invitedIds);
    } catch (error) {
      console.error('Error fetching invited buddies:', error);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchAlreadyInvitedBuddies();
    }
    fetchBuddyList();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const searchUser = (user) => {
    setSearchText(user);
  };

  const inviteBuddy = async (bookingId, id) => {
    try {
      const resp = await inviteBuddyRequest(bookingId, id);
      
      if (resp.status == "pending") {
        Alert.alert("Success", "Invitation sent successfully!");
        setInvitedBuddies((prev) => [...prev, id]);
      } else {
        Alert.alert("Error", "Failed to send the invitation.");
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

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
          disabled={alreadyInvited.includes(item.fromUserId) || invitedBuddies.includes(item.fromUserId)}
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {bookingId && <View style={styles.header}>
        {/* Back arrow button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        
        <View>
          <Text style={styles.headerTitle}>Invite Friends</Text>
          <Text style={styles.headerSubtitle}>Add your buddies for a workout!</Text>
        </View>
      </View>}

      {bookingId && <View style={styles.bookingIdContainer}>
        <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>
      </View> }

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

      <FlatList
        data={buddyList.filter((buddy) => buddy.full_name.toLowerCase().includes(searchText.toLowerCase()))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBuddy}
        contentContainerStyle={styles.buddyList}
        ListFooterComponent={<View style={{ height: 120 }} />} // Added enough padding at the bottom
      />

      {!isKeyboardVisible && <Footer navigation={navigation} style={styles.footer} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30 // Ensure space for Android devices
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,  // Adjust padding based on platform
    height: Platform.OS === 'ios' ? 100 : 80,    // Adjust height for both platforms
    width: '100%',  // Ensure the header takes full width
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
});

export default InviteFriendBuddiesScreen;