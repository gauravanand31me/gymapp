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
import { fetchUserReels, deleteReel, uploadReelVideo, getToken, updatePostVisibility } from '../api/apiService';
import yupluckLoader from '../assets/yupluck-hero.png'; // adjust path as needed
import { useFocusEffect } from '@react-navigation/native';
import { cacheMultipleVideos } from '../utils/reelCacheHelper';
import CommentScreen from './CommentScreen';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function ReelsScreen({ navigation, route }) {
  const [isPaused, setIsPaused] = useState(false);
  const [reels, setReels] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [playVideoIndex, setPlayVideoIndex] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { reelId, userId } = route.params || {};
  const videoRefs = useRef([]);
  const [authToken, setAuthToken] = useState(null);
  const [videoReadyStates, setVideoReadyStates] = useState({});
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoCache, setVideoCache] = useState({});
  const [failedVideos, setFailedVideos] = useState({});
  const PAGE_LIMIT = 2;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



  useFocusEffect(
    useCallback(() => {
      // When screen is focused: do nothing

      return () => {
        // When screen is unfocused: unload all video refs
        videoRefs.current.forEach(async (ref) => {
          if (ref) {
            try {
              await ref.unloadAsync();
            } catch (err) {
              console.warn('Error unloading video:', err);
            }
          }
        });
      };
    }, [])
  );


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
  }, [reelId]);


  useEffect(() => {
    const backgroundPreload = async () => {
      if (authToken && reels.length) {
        const urls = reels.map(r => r.videoUrl);
        const cachedMap = await cacheMultipleVideos(urls, authToken);
        setVideoCache(prev => ({ ...prev, ...cachedMap }));
      }
    };
    backgroundPreload();
  }, [authToken, reels]);



  const loadReels = async (currentPage) => {
    try {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
      const data = await fetchUserReels({ page: currentPage, limit: PAGE_LIMIT, reelId, userId });
      console.log("Data received", data);
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


  const preloadNextVideos = async (currentIndex) => {
    const nextReels = reels.slice(currentIndex, currentIndex + 3);
    const urls = nextReels.map(r => r.videoUrl);
    const cachedMap = await cacheMultipleVideos(urls, authToken);

    setVideoCache(prev => ({ ...prev, ...cachedMap }));
  };




  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setVideoReadyStates({ [index]: false });
      setPlayVideoIndex(index);
      preloadNextVideos(index);
    }


  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const handleEndReached = () => {
    if (!loadingMore && hasMore) {
      loadReels(page);
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

  const handleVisibilityChange = async (reelId, newVisibility) => {
    try {
      await updatePostVisibility(reelId, newVisibility);
      Alert.alert('Visibility Updated', `Reel is now ${newVisibility}`);
    } catch (err) {
      console.error('Visibility update failed:', err);
      Alert.alert('Error', 'Failed to update visibility.');
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.reelContainer}>
      {playVideoIndex === index ? (
        <TouchableWithoutFeedback onPress={() => setIsPaused((prev) => !prev)}>
          <View>
            {/* Thumbnail overlay shown until video is ready */}

            {!videoReadyStates[index] && (
              <Image
                source={{
                  uri: item.thumbnailUrl || 'https://via.placeholder.com/720x1280.png?text=No+Thumbnail',
                }}
                style={{ width: screenWidth, height: screenHeight, resizeMode: 'cover' }}
              />

            )}

            <Video
              source={{
                uri: failedVideos[item.id] ? item.videoUrl : videoCache[item.videoUrl] || item.videoUrl,
                ...(videoCache[item.videoUrl]?.startsWith('file://') ? {} : {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: 'video/*',
                  }
                })
              }}
              ref={(ref) => (videoRefs.current[index] = ref)}
              style={styles.reelVideo}
              resizeMode="contain"
              shouldPlay={!isPaused}
              isLooping
              isMuted={false}
              useNativeControls={false}
              onReadyForDisplay={() => {
                if (typeof index === 'number') {
                  setVideoReadyStates(prev => ({ ...prev, [index]: true }));
                  console.log('✅ Video ready for index:', index);
                } else {
                  console.warn('⚠️ Video ready but index is invalid:', index);
                }
              }}
              onError={async (e) => {
                console.error('❌ Video load error at index', index, e);
                const failedUri = videoCache[item.videoUrl];
                console.log("failedUri", failedUri);
                if (failedUri?.startsWith('file://')) {
                  await FileSystem.deleteAsync(failedUri, { idempotent: true });
                }
                setFailedVideos(prev => ({ ...prev, [item.id]: true }));
              }}
            />

          </View>
        </TouchableWithoutFeedback>
      ) : (
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/720x1280.png?text=Thumbnail' }}
          style={styles.reelVideo}
          resizeMode="cover"
        />
      )}

      {videoReadyStates[index] && <View style={styles.overlay}>
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
            <Icon name="heart" size={18} color="#fff" />
            <Text style={styles.likeCountText}>{item?.likeCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setSelectedPostId(item.id);
              setShowCommentModal(true);
            }}
          >
            <Icon name="comment" size={18} color="#fff" />
            <Text style={styles.commentCountText}>{item?.commentCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share" size={18} color="#fff" />
          </TouchableOpacity>

          {item.canDelete && (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteReel(item)}>
                <Icon name="trash" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleVisibilityChange(item.id, item.postType === 'public' ? 'private' : 'public')}>
                <Icon name="eye" size={18} color={item.postType === 'public' ? '#4CAF50' : '#aaa'} />
              </TouchableOpacity>
            </>
          )}

          {item.canReport && (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleReportReel(item)}>
                <Icon name="flag" size={18} color="#FFC107" />
              </TouchableOpacity>

            </>
          )}
        </View>
      </View>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
   {showCommentModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.halfModal}>
      <CommentScreen postId={selectedPostId} navigation={navigation} closeModel={() => setShowCommentModal(false)}/>
    </View>
  </View>
)}
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
  container: { flex: 1, backgroundColor: '#000' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  reelContainer: { width: screenWidth, height: screenHeight, position: 'relative' },
  reelVideo: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 100, left: 20, right: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#fff' },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  description: { color: '#ccc', fontSize: 14, marginBottom: 10 },
  actions: {
    position: 'absolute',
    bottom: 100,
    right: 12,
    alignItems: 'center',
    gap: 22, // vertical spacing
  },

  iconButton: {
    alignItems: 'center',
  },

  likeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  likeCountText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },

  commentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentCountText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
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
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  commentCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  likeCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // optional dim background
    justifyContent: 'flex-end',
  },
  
  halfModal: {
    height: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});