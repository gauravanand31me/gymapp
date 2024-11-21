import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, KeyboardAvoidingView, Platform, Animated,StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dumbbell, Search, UserPlus, UserCheck, UserClock, User } from 'lucide-react-native'
import Footer from '../components/Footer';
import { fetchAllNearByUser } from '../api/apiService';
import { addFriend } from '../api/apiService'; // Import the addFriend function
import { LinearGradient } from 'expo-linear-gradient'
import EmptyFriendsContainer from '../components/EmptyFriendContainer';
import { Ionicons } from '@expo/vector-icons';
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const InviteBuddiesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  const [isFooterVisible, setIsFooterVisible] = useState(true); // State to manage footer visibility
  const message = "Add users to collaborate for better gyming"; // The message for placeholder
  const [scrollY] = useState(new Animated.Value(0))
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

      <TouchableOpacity style={styles.invitedButton} onPress={() => navigation.navigate("UserProfile", { userId: item.id })}>
          <Text style={styles.invitedButtonText}><Ionicons name="person" size={20} color="#28A745" /></Text>
      </TouchableOpacity>

      {/* {(item?.invited?.accepted) && (
        <TouchableOpacity style={styles.invitedButton}>
          <Text style={styles.invitedButtonText}>Friends</Text>
        </TouchableOpacity>
      )}
      {(item?.invited?.sent && !item?.invited?.accepted) && (
        <TouchableOpacity style={styles.invitedButton}>
          <Text style={styles.invitedButtonText}>Request Sent</Text>
        </TouchableOpacity>
      )}
      {(item?.invited?.received && !item?.invited?.accepted) && (
        <TouchableOpacity style={styles.invitedButton}>
          <Text style={styles.invitedButtonText}>Request Received</Text>
        </TouchableOpacity>
      )}
      {(!item?.invited?.sent && !item?.invited?.accepted && !item?.invited?.received) && (
        <TouchableOpacity style={styles.inviteButton} onPress={() => handleInvite(item.id)}>
          <Text style={styles.invitedButtonText}>Add Friend</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  const renderEmptyList = () => (
    <EmptyFriendsContainer />
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* StatusBar Configuration */}
      <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
      <AnimatedLinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={[styles.header, { opacity: headerOpacity }]}
      >
        <Dumbbell size={40} color="#FFFFFF" />
        <Text style={styles.headerText}>Find Gym Buddies</Text>
      </AnimatedLinearGradient>

      <View style={styles.searchContainer}>
        <Search size={24} color="#888" />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFooterVisible(false)}
          onBlur={() => setIsFooterVisible(true)}
          placeholder="Search for gym buddies..."
          placeholderTextColor="#B0BEC5"
        />
      </View>

      {/* Buddy List */}
    
      <View style={styles.listContainer}>
        <FlatList
          data={buddyList}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 60,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  buddyList: {
    padding: 16,
  },
  buddyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  buddyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#66BB6A',
    marginTop: 4,
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
  },
  invitedButton: {
    padding: 10,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#B0BEC5',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default InviteBuddiesScreen;
