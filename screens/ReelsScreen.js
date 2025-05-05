// ✅ FIXED VERSION of ReelsScreen — restored action icons (like, comment, delete, report, share)
// Also includes proper video rendering and state management

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

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const PRELOAD_AHEAD = 2;
const PAGE_LIMIT = 5;

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
  const flatListRef = useRef(null);

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

  const preloadNextVideos = useCallback(() => {}, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentVisibleIndex(index);
      setPlayVideoIndex(index);
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80, minimumViewTime: 300 };

  const handleEndReached = () => {
    if (!loadingMore && hasMore) loadReels(page);
  };

  const setVideoRef = useCallback((ref, index) => {
    if (ref) videoRefs.current[index] = ref;
    else if (videoRefs.current[index]) delete videoRefs.current[index];
  }, []);

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

  const renderItem = ({ item, index }) => {
    const isCurrentVideo = playVideoIndex === index;
    const isVideoReady = videoReadyStates[index];

    return (
      <View style={{ width: screenWidth, height: screenHeight }}>
        <TouchableWithoutFeedback onPress={() => setIsPaused(prev => !prev)}>
          <View style={{ flex: 1 }}>
            <Video
              source={{ uri: item.videoUrl, headers: { Authorization: `Bearer ${authToken}` } }}
              ref={(ref) => setVideoRef(ref, index)}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: isCurrentVideo && isVideoReady ? 1 : 0 }}
              resizeMode="cover"
              shouldPlay={isCurrentVideo && !isPaused}
              isLooping
              isMuted={false}
              useNativeControls={false}
              onReadyForDisplay={() => handleVideoReady(index)}
              onError={(e) => console.error('Video load error:', e)}
              progressUpdateIntervalMillis={500}
            />

            {(!isVideoReady && isCurrentVideo) && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }]}> 
                <ActivityIndicator color="white" />
              </View>
            )}

            {!isCurrentVideo && (
              <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/720x1280.png?text=Thumbnail' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            )}

               {/* Vertical right-side icon buttons above footer */}
               <View style={styles.verticalActionsContainer}>
              <TouchableOpacity style={styles.iconButton}><Icon name="heart" size={24} color="#fff" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('CommentScreen', { postId: item.id })}><Icon name="comment" size={24} color="#fff" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}><Icon name="share" size={24} color="#fff" /></TouchableOpacity>
              {item.canDelete && <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteReel(item)}><Icon name="trash" size={24} color="#FF3B30" /></TouchableOpacity>}
              {item.canReport && <TouchableOpacity style={styles.iconButton}><Icon name="flag" size={24} color="#FFC107" /></TouchableOpacity>}
            </View>

            {/* Overlay for profile and text */}
            <View style={styles.overlayContainer}>
              <View style={styles.userInfo}>
                <Image source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.profilePic} />
                <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
              </View>
              {!!item.title && <Text style={styles.title}>{item.title}</Text>}
              {!!item.description && <Text style={styles.description}>{item.description}</Text>}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#aaa', marginTop: 8 }}>Loading Reels...</Text>
        </View>
      ) : (
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
          getItemLayout={(data, index) => ({ length: screenHeight, offset: screenHeight * index, index })}
          removeClippedSubviews
          maxToRenderPerBatch={3}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          initialNumToRender={2}
        />
      )}
    <TouchableOpacity style={[styles.uploadButton, { top: 60, bottom: undefined }]} onPress={handleUploadReel}>
    <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
      </View>   
       </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  verticalActionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    zIndex: 3
  },
  uploadButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#4CAF50',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 100,
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
  footerContainer: {
    position: 'absolute', // Fix it at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    //height: 60, // Adjust height as needed
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',}
});
