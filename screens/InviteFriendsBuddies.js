import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert,
  KeyboardAvoidingView, Platform, Keyboard, Dimensions, SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import { fetchFriends, inviteBuddyRequest, fetchBuddyInvites } from '../api/apiService';

const { width } = Dimensions.get('window');

export default function Component({ navigation, route }) {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  const [invitedBuddies, setInvitedBuddies] = useState([]);
  const [alreadyInvited, setAlreadyInvited] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const bookingId = route?.params?.bookingId;

  const fetchBuddyList = useCallback(async () => {
    try {
      const data = await fetchFriends();
 
      setBuddyList(data.accepted);
    } catch (error) {
      console.error('Error fetching buddy list:', error);
    }
  }, []);

  const fetchAlreadyInvitedBuddies = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await fetchBuddyInvites(bookingId);
      const invitedIds = data.map(invite => invite.toUserId);
      setAlreadyInvited(invitedIds);
    } catch (error) {
      console.error('Error fetching invited buddies:', error);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchAlreadyInvitedBuddies();
    fetchBuddyList();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [fetchAlreadyInvitedBuddies, fetchBuddyList]);

  const inviteBuddy = async (id) => {
    try {
      const resp = await inviteBuddyRequest(bookingId, id);
      if (resp.status === "pending") {
        Alert.alert("Success", "Invitation sent successfully!");
        setInvitedBuddies(prev => [...prev, id]);
      } else {
        Alert.alert("Error", "Failed to send the invitation.");
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const renderBuddy = ({ item }) => {
    const isInvited = alreadyInvited.includes(item.fromUserId) || invitedBuddies.includes(item.fromUserId);

    return (
      <View style={styles.buddyItem}>
        <Image
          source={item.profile_pic ? { uri: item.profile_pic } : require('../assets/cultfit.jpg')}
          style={styles.buddyImage}
        />
        <TouchableOpacity 
          style={styles.buddyInfo}
          onPress={() => navigation.navigate('UserProfile', { userId: item.fromUserId })}
        >
          <Text style={styles.buddyName}>{item.full_name}</Text>
        </TouchableOpacity>
        {bookingId ? (
          <TouchableOpacity
            style={[styles.inviteButton, isInvited && styles.invitedButton]}
            onPress={() => inviteBuddy(item.fromUserId)}
            disabled={isInvited}
          >
            <Text style={styles.inviteButtonText}>
              {isInvited ? 'Invited' : 'Invite'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.unfriendButton} onPress={() => navigation.navigate('UserProfile', { userId: item.fromUserId })}>
            <Text style={styles.unfriendButtonText}>View Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
      {bookingId && (
            <View style={styles.bookingIdContainer}>
              <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>
            </View>
          )}

          <View style={styles.searchContainer}>
            <Icon name="magnify" size={24} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Friends"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={buddyList.filter(buddy => buddy.full_name.toLowerCase().includes(searchText.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={renderBuddy}
            contentContainerStyle={styles.buddyList}
            ListFooterComponent={<View style={{ height: 120 }} />}
          />
        </View>
      </KeyboardAvoidingView>
      {!isKeyboardVisible && <Footer navigation={navigation} style={styles.footer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  bookingIdContainer: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bookingIdText: {
    fontSize: 14,
    color: '#495057',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  buddyList: {
    paddingTop: 8,
  },
  buddyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderRadius: 20,
  },
  invitedButton: {
    backgroundColor: '#ccc',
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unfriendButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unfriendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
});