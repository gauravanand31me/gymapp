import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Video } from 'expo-av';
import Footer from '../components/Footer';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const HEADER_HEIGHT = 80; // approx
const FOOTER_HEIGHT = 80; // adjust as per your Footer component

const dummyReels = [
  {
    id: '1',
    videoUri: 'https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    title: 'Reel 1',
    user: { name: 'John Doe', profilePic: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    likes: 122,
    comments: 45,
  },
  {
    id: '2',
    videoUri: 'https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    title: 'Reel 2',
    user: { name: 'Jane Smith', profilePic: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    likes: 90,
    comments: 21,
  },
];

const ReelsScreen = ({ navigation }) => {
  const [reels, setReels] = useState(dummyReels);

  const handleUploadReel = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Please allow access to upload a reel.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newReel = {
        id: Date.now().toString(),
        videoUri: result.assets[0].uri,
        title: 'Your Reel',
        user: { name: 'You', profilePic: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
        likes: 0,
        comments: 0,
      };
      setReels(prev => [newReel, ...prev]);
    }
  };

  const renderReel = ({ item }) => (
    <View style={styles.reelContainer}>
      <Video
        source={{ uri: item.videoUri }}
        style={styles.reelVideo}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />
      <View style={styles.overlay}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profilePic }} style={styles.profilePic} />
          <Text style={styles.userName}>{item.user.name}</Text>
        </View>

        <View style={styles.reelActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="heart" size={24} color="#fff" />
            <Text style={styles.iconLabel}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="comment" size={24} color="#fff" />
            <Text style={styles.iconLabel}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadReel}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, marginBottom: FOOTER_HEIGHT }}>
        <FlatList
          data={reels}
          renderItem={renderReel}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  uploadBtn: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
  reelContainer: {
    width: screenWidth,
    height: screenHeight - HEADER_HEIGHT - FOOTER_HEIGHT,
    position: 'relative',
  },
  reelVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 100, // changed from 80 to 100
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 20, // extra padding
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reelActions: {
    alignItems: 'center',

  },
  iconButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ReelsScreen;
