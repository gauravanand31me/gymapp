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
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
// Make sure fetchUserReels is correctly created based on our previous function

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 50;

const ReelsScreen = ({ route, navigation }) => {
  const [reels, setReels] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true); // screen initial loading
  const [page, setPage] = useState(0);        // current page
  const [hasMore, setHasMore] = useState(true); // if more reels are available
  const LIMIT = 10; // you can change to any number like 5, 10, 15
  const { reelId, userId } = route.params || {}; // 👈 get reelId and userId if passed
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    loadReels();
  }, []);

  const handleScreenTap = () => {
    setShowFooter(true);

    // Optional: Hide Footer after 3 seconds automatically
    setTimeout(() => {
      setShowFooter(false);
    }, 3000);
  };


  const loadReels = async (pageNumber = 0) => {
    let queryParams = { page: pageNumber, limit: LIMIT };

    if (reelId) queryParams.reelId = reelId;     // 👈 if reelId available
    if (userId) queryParams.userId = userId;     // 👈 if userId available
    if (!hasMore && pageNumber !== 0) return; // no more reels to load

    try {
      setLoading(true);
      const fetchedReels = await fetchUserReels(queryParams);

      if (pageNumber === 0) {
        setReels(fetchedReels); // first load, replace
      } else {
        setReels(prevReels => [...prevReels, ...fetchedReels]); // next loads, append
      }

      if (fetchedReels.length < LIMIT) {
        setHasMore(false); // no more data
      }
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUploadReel = () => {
    navigation.navigate('UploadReelScreen', {
      onVideoSelected: async (videoData) => {
        try {
          const { uri, title, description, postType } = videoData;
          setUploading(true);
          setUploadProgress(0);

          const result = await uploadReelVideo(uri, { title, description, postType }, (progress) => {
            setUploadProgress(progress);
          });


          const uploadedUrl = result.reel;

          const newReel = {
            id: Date.now().toString(),
            videoUri: uploadedUrl.videoUrl,
            title: uploadedUrl?.title,
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

  const loadMoreReels = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadReels(nextPage);
    }
  };

  const renderReel = ({ item }) => (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
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
          {/* Left side: Profile + Title + Description */}
          <View style={styles.leftContent}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                style={styles.profilePic}
              />
              <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item?.userId })}>
                <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
              </TouchableOpacity>
            </View>

            {item.title ? (
              <Text style={styles.reelTitle}>{item.title}</Text>
            ) : null}

            {item.description ? (
              <Text style={styles.reelDescription}>{item.description}</Text>
            ) : null}
          </View>

          {/* Right side: Actions */}
          <View style={styles.reelActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="heart" size={30} color="#fff" />
              <Text style={styles.iconLabel}>{item.likeCount || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="comment" size={30} color="#fff" />
              <Text style={styles.iconLabel}>{item.commentCount || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="share" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );



  return (

    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {uploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <Text style={styles.uploadingLabel}>Uploading...</Text>

            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
            </View>

            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
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
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={screenHeight}
          decelerationRate="fast"
          snapToAlignment="start"
          onEndReached={loadMoreReels}    // 👈 trigger when end is reached
          onEndReachedThreshold={0.5}     // 👈 when 50% from bottom
          contentContainerStyle={{}}
          style={{ flex: 1 }}
        />
      )}

      {/* Footer */}
      {showFooter && <Footer navigation={navigation} />}
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
    height: screenHeight,
    position: 'relative',
  },
  reelVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 100,  // leave space for footer
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  leftContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    fontWeight: '700',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  reelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  reelDescription: {
    color: '#ddd',
    fontSize: 13,
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  reelActions: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  iconButton: {
    marginBottom: 20,
    alignItems: 'center',
  },

  iconLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
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

  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // black transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // ensure it overlays everything
  },

  uploadCard: {
    backgroundColor: '#1c1c1e', // nice dark card
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8, // for Android shadow
  },

  uploadingLabel: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },

  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: 'linear-gradient(90deg, #00ff88, #00d4ff)', // use expo-linear-gradient if you want real gradient
    backgroundColor: '#00d4ff', // fallback solid if linear gradient not used
    borderRadius: 6,
  },

  progressText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  reelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 50,
  },

  reelDescription: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 50,
  },

});

export default ReelsScreen;
