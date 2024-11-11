import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert,
  KeyboardAvoidingView, Platform, Keyboard, Animated, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import { fetchFriends, inviteBuddyRequest, fetchBuddyInvites } from '../api/apiService';

const { width } = Dimensions.get('window');

const ITEM_HEIGHT = 82; // Adjust this value based on your buddyItem height

export default function InviteFriendBuddiesScreen({ navigation, route }) {
  const [searchText, setSearchText] = useState('');
  const [buddyList, setBuddyList] = useState([]);
  const [invitedBuddies, setInvitedBuddies] = useState([]);
  const [alreadyInvited, setAlreadyInvited] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const scrollY = new Animated.Value(0);
  const headerHeight = 50;
  const headerY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

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

  const renderBuddy = ({ item, index }) => {
    const isInvited = alreadyInvited.includes(item.fromUserId) || invitedBuddies.includes(item.fromUserId);
    const itemTranslateY = scrollY.interpolate({
      inputRange: [-1, 0, index * ITEM_HEIGHT, (index + 2) * ITEM_HEIGHT],
      outputRange: [0, 0, 0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.buddyItem, { transform: [{ translateY: itemTranslateY }] }]}>
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
              {isInvited ? 'Invited' : 'Invite buddy'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.unfriendButton}>
            <Text style={styles.unfriendButtonText}>Unfriend</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.header, { transform: [{ translateY: headerY }] }]}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.headerGradient}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Invite Friends</Text>
            <Text style={styles.headerSubtitle}>Add your buddies for a workout!</Text>
          </View>
        </LinearGradient>
      </Animated.View>

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

      <Animated.FlatList
        data={buddyList.filter(buddy => buddy.full_name.toLowerCase().includes(searchText.toLowerCase()))}
        keyExtractor={item => item.id.toString()}
        renderItem={renderBuddy}
        contentContainerStyle={styles.buddyList}
        ListFooterComponent={<View style={{ height: 120 }} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      {!isKeyboardVisible && <Footer navigation={navigation} style={styles.footer} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  bookingIdContainer: {
    marginTop: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    margin: 16,
    borderRadius: 25,
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
    padding: 16,
    paddingTop: 96,
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
    height: ITEM_HEIGHT,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
});