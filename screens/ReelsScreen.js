import React, { useState, useEffect, useRef } from 'react';
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
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Video } from 'expo-av';
import Footer from '../components/Footer';
import { uploadReelVideo, fetchUserReels, deleteReel, reactToPost } from '../api/apiService';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 50;
const LIMIT = 3;

const ReelsScreen = ({ route, navigation }) => {
  const [reels, setReels] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [videoProgress, setVideoProgress] = useState({}); // 👈 new state
  const videoRefs = useRef({}); // 👈 ref for multiple videos

  const { reelId, userId } = route.params || {};

  useEffect(() => {
    loadReels();
  }, []);

  const handleScreenTap = () => {
    setShowFooter(true);
    setTimeout(() => {
      setShowFooter(false);
    }, 3000);
  };


  const handleLike = async (item) => {
    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic Update (immediately show in UI)
    setLiked(!liked);
    setLikeCount(prev => (liked ? prev - 1 : prev + 1));

    try {
      // If previously liked, remove like by sending null
      // Otherwise, send 'like' reaction
      await reactToPost(item.id, liked ? null : 'like');
    } catch (error) {
      // Rollback if API call fails
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('❌ Reaction error:', error);
    }
  };

  const loadReels = async (pageNumber = 0) => {
    if (!hasMore && pageNumber !== 0) return;

    let queryParams = { page: pageNumber, limit: LIMIT };
    if (reelId) queryParams.reelId = reelId;
    if (userId) queryParams.userId = userId;

    try {
      setLoading(true);
      const fetchedReels = await fetchUserReels(queryParams);
      if (pageNumber === 0) {
        setReels(fetchedReels);
      } else {
        setReels(prev => [...prev, ...fetchedReels]);
      }

      if (fetchedReels.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReels = () => {

    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadReels(nextPage);
    }
  };

  const handleDeleteReel = (reelId) => {
    Alert.alert(
      'Delete Reel',
      'Are you sure you want to delete this reel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteReel(reelId) }
      ]
    );
  };

  const confirmDeleteReel = async (reelId) => {
    try {
      const result = await deleteReel(reelId);
      if (result.success) {
        setReels(prev => prev.filter(r => r.id !== reelId));
        Alert.alert('Deleted', result.message || 'Reel deleted successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to delete reel.');
      }
    } catch (error) {
      console.error('Error deleting reel:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };



  const handleReportReel = (reelId) => {
    Alert.alert(
      'Report Reel',
      'Are you sure you want to report this reel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => console.log('Reported reel:', reelId) }
      ]
    );
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
        <View style={{ flex: 1 }}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <Image
              source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              style={styles.profilePic}
            />
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item?.userId })}>
              <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          {item.title ? (
            <Text style={styles.reelTitle}>
              {item.title}
            </Text>
          ) : null}

          {/* Description */}
          {item.description ? (
            <Text style={styles.reelDescription}>
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.reelActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleLike(item)}>
            <Icon
              name={liked ? 'heart' : 'heart-o'}
              size={24}
              color={liked ? 'red' : '#fff'}
            />
            <Text style={styles.iconLabel}>{likeCount}</Text>
          </TouchableOpacity>

          {/* ⬇️ Navigate to Comments on clicking comment icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('CommentScreen', { postId: item.id })}
          >
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
        <TouchableOpacity onPress={() => navigation.navigate('FriendsFeedScreen')}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadReel}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Reels List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#fff', marginTop: 8 }}>Loading Reels...</Text>
        </View>
      ) : (
        <FlatList
          data={reels}
          renderItem={renderReel}
          keyExtractor={(item) => item.id?.toString()}
          pagingEnabled
          horizontal={false}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.9}
          snapToInterval={screenHeight}  // 🔥 Important for 1 full screen snap
          onEndReached={loadMoreReels}
          onEndReachedThreshold={0.5}
          getItemLayout={(data, index) => ({
            length: screenHeight,
            offset: screenHeight * index,
            index,
          })}
          style={{ flex: 1 }}
        />
      )}

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
    marginTop: 30,
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
  uploadText: { color: '#fff', fontSize: 14, marginLeft: 6, fontWeight: '600' },
  reelContainer: { width: screenWidth, height: screenHeight, position: 'relative' },
  reelVideo: { width: '100%', height: '100%' },
  progressBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    width: '100%',
    backgroundColor: '#333',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#00ff88',
  },
  overlay: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  leftContent: { flex: 1, justifyContent: 'flex-end' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profilePic: { height: 40, width: 40, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#fff' },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  reelTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  reelDescription: { color: '#ddd', fontSize: 13, marginBottom: 8 },
  reelActions: { alignItems: 'center', justifyContent: 'flex-end' },
  iconButton: { marginBottom: 20, alignItems: 'center' },
  iconLabel: { color: '#fff', fontSize: 12, marginTop: 4 },
  uploadOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  uploadCard: { backgroundColor: '#1c1c1e', padding: 20, borderRadius: 20, width: '80%', alignItems: 'center', elevation: 8 },
  uploadingLabel: { color: '#aaa', fontSize: 16, marginBottom: 16, fontWeight: '500', letterSpacing: 1 },
  progressBarBackground: { width: '100%', height: 12, backgroundColor: '#333', borderRadius: 6, overflow: 'hidden' },
  progressText: { marginTop: 12, fontSize: 18, fontWeight: 'bold', color: '#00ff88' },
});

export default ReelsScreen;
