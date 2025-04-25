import React, { useState, useEffect } from 'react';
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
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { Video } from 'expo-av';
import Footer from '../components/Footer';
import { uploadReelVideo, fetchUserReels } from '../api/apiService'; // ✅ import both
// Make sure fetchUserReels is correctly created based on our previous function

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 70;

const ReelsScreen = ({ navigation }) => {
  const [reels, setReels] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true); // screen initial loading

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      const fetchedReels = await fetchUserReels(0, 10); // page=0, limit=10
      setReels(fetchedReels);
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReel = () => {
    navigation.navigate('UploadReelScreen', {
      onVideoSelected: async (videoUri) => {
        try {
          setUploading(true);
          setUploadProgress(0);
      
          const result = await uploadReelVideo(videoUri, (progress) => {
            setUploadProgress(progress);
          });
      
          const uploadedUrl = result.fileUrl;
      
          const newReel = {
            id: Date.now().toString(),
            videoUri: uploadedUrl,
            title: 'Your Reel',
            user: { name: 'You', profilePic: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
            likes: 0,
            comments: 0,
          };
          setReels(prev => [newReel, ...prev]);
        } catch (error) {
          console.error('Upload failed:', error);
          Alert.alert('Upload Failed', 'Could not upload reel.');
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    });
  };

  const renderReel = ({ item }) => (
    <View style={styles.reelContainer}>
      <Video
        source={{ uri: item.videoUrl || item.videoUri }}
        style={styles.reelVideo}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />
      <View style={styles.overlay}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.profilePic} />
          <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
        </View>

        <View style={styles.reelActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="heart" size={24} color="#fff" />
            <Text style={styles.iconLabel}>{item.likeCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="comment" size={24} color="#fff" />
            <Text style={styles.iconLabel}>{item.commentCount || 0}</Text>
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
      <StatusBar barStyle="light-content" />

      {uploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{uploadProgress}%</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadReel}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Reels */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#fff', marginTop: 8 }}>Loading Reels...</Text>
        </View>
      ) : (
        <FlatList
          data={reels}
          renderItem={renderReel}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT }}
        />
      )}

      {/* Footer */}
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 35
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  uploadText: {
    color: '#fff',
    fontSize: 14,
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
    bottom: 90,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  progressContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50', // green
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  
});

export default ReelsScreen;
