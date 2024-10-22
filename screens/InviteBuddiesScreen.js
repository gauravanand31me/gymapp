import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';
import { fetchAllNearByUser } from '../api/apiService';
import { addFriend } from '../api/apiService'; // Import the addFriend function
import EmptyFriendsContainer from '../components/EmptyFriendContainer';

const InviteBuddiesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  const [isFooterVisible, setIsFooterVisible] = useState(true); // State to manage footer visibility
  const message = "Add users to collaborate for better gyming"; // The message for placeholder

  // Fetch nearby users from the API
  const fetchNearbyUsers = async () => {
    try {
      const data = await fetchAllNearByUser(searchText);
      setBuddyList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
  };

  useEffect(() => {
    fetchNearbyUsers();
  }, [searchText]);

  const handleInvite = async (id) => {
    try {
      const response = await addFriend(id);
      console.log('Friend request sent:', response);
      fetchNearbyUsers();
    } catch (error) {
      console.error('Error inviting friend:', error);
    }
  };

  const searchUser = async (user) => {

    setSearchText(user);

  };

  const renderBuddy = ({ item }) => (
    <View style={styles.buddyItem}>
      <Image source={{ uri: item.image }} style={styles.buddyImage} />
      <TouchableOpacity  style={styles.buddyInfo} onPress={() => navigation.navigate("UserProfile", { userId: item.id })}>
        <View>
          <Text style={styles.buddyName}>{item.name}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </TouchableOpacity>


      {(item?.invited?.accepted) && (
        <TouchableOpacity style={styles.invitedButton}>
          <Text style={styles.invitedButtonText}>Friends</Text>
        </TouchableOpacity>
      )}
      {(item?.invited?.sent && !item?.invited?.accepted) && (
        <TouchableOpacity style={styles.invitedButton}>
          <Text style={styles.invitedButtonText}>Request Sent</Text>
        </TouchableOpacity>
      )}
      {(!item?.invited?.sent && !item?.invited?.accepted) && (
        <TouchableOpacity style={styles.inviteButton} onPress={() => handleInvite(item.id)}>
          <Text style={styles.invitedButtonText}>Add Friend</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyList = () => (
    <EmptyFriendsContainer />
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <Text><Icon name="dumbbell" size={40} color="#fff" /></Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text><Icon name="magnify" size={24} color="#888" /></Text>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={(text) => searchUser(text)}
          onFocus={() => setIsFooterVisible(false)} // Hide footer on focus
          onBlur={() => setIsFooterVisible(true)} // Show footer on blur
          placeholder={message} // Use the message as placeholder
          placeholderTextColor="#D3D3D3" // Adjust the color of the placeholder text if needed
        />
      </View>

      {/* Buddy List */}
      <View style={styles.listContainer}>
        <FlatList
          data={buddyList.filter((buddy) => buddy.name.toLowerCase().includes(searchText.toLowerCase()))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBuddy}
          contentContainerStyle={styles.buddyList}
          ListEmptyComponent={renderEmptyList} // Use ListEmptyComponent for no data scenario
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Ensures that taps are handled even when the keyboard is up
        />
      </View>

      {/* Conditional rendering of Footer */}
      {isFooterVisible && (
        <View style={styles.footer}>
          <Footer navigation={navigation} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    // Add any styles you want for the header
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    margin: 10,
    borderRadius: 8,
    height: 40,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    flex: 1,
    paddingBottom: 80, // Add padding for the footer
  },
  buddyList: {
    padding: 16,
  },
  buddyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  buddyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 12,
    color: '#66BB6A',
    fontWeight: 'bold',
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  invitedButton: {
    backgroundColor: '#B0BEC5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  invitedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // Additional styles if necessary
  },
});

export default InviteBuddiesScreen;
