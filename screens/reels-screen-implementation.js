import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../components/Footer';
import { fetchUserReels, deleteReel, uploadReelVideo, getToken } from '../api/apiService';
import VideoCacheManager from '../utils/video-cache-manager';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Number of videos to preload ahead of current video
const PRELOAD_AHEAD = 2;

export default function ReelsScreen({ navigation, route }) {
  const [isPaused, setIsPaused] = useState(false);
  const [reels, setReels] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [playVideoIndex, setPlayVideoIndex] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { reelId, userId } = route.params || {};
  const videoRefs = useRef({});
  const [authToken, setAuthToken] = useState(null);
  const [videoReadyStates, setVideoReadyStates] = useState({});
  const [videoSources, setVideoSources] = useState({});
  const flatListRef = useRef(null);
  const PAGE_LIMIT = 5; // Increased to ensure we have enough videos to preload
  
  // Use our custom hook for video preloading
  const { preloadVideoToMemory, releaseVideo, releaseAllVideos } = VideoCacheManager.useVideoPreloader();

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken(); 
      setAuthToken(token);
    };
    setReels([]);
    setPage(0);
    setHasMore(true);
    loadReels(0);
    loadToken();
    
    // Cleanup function
    return () => {
      releaseAllVideos();
    };
  }, [reelId]);

  // Load reels data from API
  const loadReels = async (currentPage) => {
    try {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
      const data = await fetchUserReels({ page: currentPage, limit: PAGE_LIMIT, reelId, userId });
      if (data?.length > 0) {
        setReels(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
        setHasMore(data.length === PAGE_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load video source with caching
  const loadVideoSource = useCallback(async (videoUrl, index) => {
    if (!videoUrl || !authToken || videoSources[index]) return;
    
    try {
      const source = await VideoCacheManager.getVideoSource(
        videoUrl, 
        { Authorization: `Bearer ${authToken}` }
      );
      
      setVideoSources(prev => ({
        ...prev,
        [index]: source
      }));
    } catch (error) {
      console.error('Error loading video source:', error);
    }
  }, [authToken, videoSources]);

  // Preload multiple videos ahead of current index
  const preloadNextVideos = useCallback(async (currentIndex) => {
    for (let i = 1; i <= PRELOAD_AHEAD; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < reels.length && reels[nextIndex]?.videoUrl) {
        // Load video source (cached if available)
        loadVideoSource(reels[nextIndex].videoUrl, nextIndex);
        
        // Preload to memory if we're just one ahead
        if (i === 1) {
          preloadVideoToMemory(
            reels[nextIndex].videoUrl,
            { Authorization: `Bearer ${authToken}` }
          );
        }
      }
    }
  }, [reels, authToken, loadVideoSource, preloadVideoToMemory]);

  // Handle when videos become visible
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentVisibleIndex(index);
      setPlayVideoIndex(index);
      
      // Reset video ready state for newly visible video
      setVideoReadyStates(prev => ({ ...prev, [index]: false }));
      
      // Load source for current video if not already loaded
      loadVideoSource(reels[index]?.videoUrl, index);
      
      // Preload next videos
      preloadNextVideos(index);
      
      // Release videos that are far from current view
      Object.keys(videoRefs.current).forEach(key => {
        const videoIndex = parseInt(key);
        if (videoIndex !== index && Math.abs(videoIndex - index) > PRELOAD_AHEAD + 1) {
          const ref = videoRefs.current[key];
          if (ref && ref.unloadAsync) {
            ref.unloadAsync().catch(() => {});
            delete videoRefs.current[key];
          }
          
          // Also release from memory preloader
          if (reels[videoIndex]?.videoUrl) {
            releaseVideo(reels[videoIndex].videoUrl);
          }
        }
      });
    }
  }).current;

  const viewabilityConfig = { 
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 300
  };

  const handleEndReached = () => {
    if (!loadingMore && hasMore) {
      loadReels(page);
    }
  };

  // Store video ref with proper cleanup
  const setVideoRef = useCallback((ref, index) => {
    if (ref) {
      videoRefs.current[index] = ref;
    } else if (videoRefs.current[index]) {
      delete videoRefs.current[index];
    }
  }, []);

  // Handle video ready state
  const handleVideoReady = useCallback((index) => {
    setVideoReadyStates(prev => ({ ...prev, [index]: true }));
  }, []);

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
            videoUrl: uploadedUrl.videoUrl,
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

  const handleDeleteReel = (reel) => {
    Alert.alert(
      'Delete Reel',
      'Are you sure you want to delete this reel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteReel(reel.id);
              if (result.success) {
                setReels(prev => prev.filter(r => r.id !== reel.id));
                Alert.alert('Success', 'Reel deleted successfully.');
              } else {
                Alert.alert('Error', result.message || 'Could not delete reel.');
              }
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Error', 'Server error.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleReportReel = (reel) => {
    Alert.alert('Reported', 'Reel has been reported.');
  };

  // Optimized video rendering with placeholder
  const renderItem = ({ item, index }) => {
    const isCurrentVideo = playVideoIndex === index;
    const isVideoReady = videoReadyStates[index];
    const videoSource = videoSources[index];
    
    // Load video source when this item renders
    useEffect(() => {
      if (item.videoUrl && authToken && !videoSources[index]) {
        loadVideoSource(item.videoUrl, index);
      }
    }, [item.videoUrl, authToken, index]);
    
    return (
      <View style={styles.reelContainer}>
        <TouchableWithoutFeedback onPress={() => setIsPaused((prev) => !prev)}>
          <View style={{ width: '100%', height: '100%' }}>
            {/* Video player */}
            {isCurrentVideo && videoSource && (
              <Video
                source={videoSource}
                ref={(ref) => setVideoRef(ref, index)}
                style={[
                  styles.reelVideo,
                  { opacity: isVideoReady ? 1 : 0 }
                ]}
                resizeMode="cover"
                shouldPlay={!isPaused}
                isLooping
                isMuted={false}
                useNativeControls={false}
                onReadyForDisplay={() => handleVideoReady(index)}
                onError={(e) => console.error('Video load error:', e)}
                progressUpdateIntervalMillis={500}
                positionMillis={0}
                // Prioritize playback quality
                rate={1.0}
                volume={1.0}
              />
            )}

            {/* Placeholder shown while video loads */}
            {(!isVideoReady && isCurrentVideo) && (
              <View style={[styles.reelVideo, styles.placeholderContainer]}>
                {/* Profile Section */}
                <View style={styles.placeholderContent}>
                  <Image
                    source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                    style={styles.placeholderProfilePic}
                  />
                  <Text style={styles.placeholderUsername}>
                    {item.user?.name || 'Unknown User'}
                  </Text>
                  
                  {/* Video Title */}
                  <Text style={styles.placeholderTitle}>
                    {item.title || 'Loading...'}
                  </Text>
                  
                  {/* No loading indicator to avoid showing loaders */}
                </View>
              </View>
            )}
            
            {/* Thumbnail for non-current videos */}
            {!isCurrentVideo && (
              <Image
                source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/720x1280.png?text=Thumbnail' }}
                style={styles.reelVideo}
                resizeMode="cover"
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Overlay with user info and actions */}
        {(isVideoReady || !isCurrentVideo) && (
          <View style={styles.overlay}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                style={styles.profilePic}
              />
              <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
            </View>

            {item.title && <Text style={styles.title}>{item.title}</Text>}
            {item.description && <Text style={styles.description}>{item.description}</Text>}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="heart" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('CommentScreen', { postId: item.id })}
              >
                <Icon name="comment" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton}>
                <Icon name="share" size={24} color="#fff" />
              </TouchableOpacity>

              {item.canDelete && (
                <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteReel(item)}>
                  <Icon name="trash" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}

              {item.canReport && (
                <TouchableOpacity style={styles.iconButton} onPress={() => handleReportReel(item)}>
                  <Icon name="flag" size={24} color="#FFC107" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#aaa', marginTop: 8 }}>Loading Reels...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={reels}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={screenHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            getItemLayout={(data, index) => ({
              length: screenHeight,
              offset: screenHeight * index,
              index,
            })}
            // Optimize FlatList performance
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={50}
            windowSize={5}
            initialNumToRender={2}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadReel}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  reelContainer: { 
    width: screenWidth, 
    height: screenHeight, 
    position: 'relative' 
  },
  reelVideo: { 
    width: '100%', 
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },
  placeholderContainer: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  placeholderContent: {
    alignItems: 'center',
    padding: 20
  },
  placeholderProfilePic: {
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    marginBottom: 10,
    borderWidth: 1, 
    borderColor: '#fff'
  },
  placeholderUsername: {
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 20
  },
  placeholderTitle: {
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center'
  },
  overlay: { 
    position: 'absolute', 
    bottom: 100, 
    left: 20, 
    right: 20,
    zIndex: 2
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  profilePic: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#fff' 
  },
  userName: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  title: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18, 
    marginBottom: 4 
  },
  description: { 
    color: '#ccc', 
    fontSize: 14, 
    marginBottom: 10 
  },
  actions: {
    position: 'absolute',
    right: 12,
    bottom: 90,
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  uploadCard: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  uploadingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});