import React, { useState, useEffect, useRef } from 'react';
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

export default function ReelsScreen({ navigation, route }) {
  const [isPaused, setIsPaused] = useState(false);
  const [reels, setReels] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playVideoIndex, setPlayVideoIndex] = useState(null);
  const { reelId, userId } = route.params || {};
  const videoRefs = useRef([]);
  const [authToken, setAuthToken] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false); // Track readiness

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken(); // get token from storage or API
      console.log(token)
      setAuthToken(token);
    };
    loadReels();
    loadToken();
  }, []);



  const loadReels = async () => {
    try {
      setLoading(true);
      const data = await fetchUserReels({ page: 0, limit: 10, reelId, userId });
      setReels(data || []);
    } catch (err) {
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(false);
    }
  };


  const preloadNextVideos = async (currentIndex) => {
    const nextIndices = [currentIndex + 1, currentIndex + 2, currentIndex + 3];
    for (const i of nextIndices) {
      const ref = videoRefs.current[i];
      const item = reels[i];
  
      if (ref && item && authToken) {
        try {
          await ref.loadAsync(
            {
              uri: item.videoUrl,
              headers: { Authorization: `Bearer ${authToken}` },
            },
            {
              shouldPlay: false,
              positionMillis: 0,
              isMuted: true,
              isLooping: false,
            },
            false
          );
        } catch (error) {
          console.warn(`Failed to preload video at index ${i}:`, error.message);
        }
      }
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setPlayVideoIndex(index);
      preloadNextVideos(index); // 👈 preload next 3
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

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

  const renderItem = ({ item, index }) => (
    <View style={styles.reelContainer}>
      {playVideoIndex === index ? (
        <TouchableWithoutFeedback onPress={() => setIsPaused((prev) => !prev)}>
          <View>
            {/* Thumbnail overlay shown until video is ready */}
            {!isVideoReady && (
              <Image
                source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/720x1280.png?text=Loading' }}
                style={[styles.reelVideo, { position: 'absolute', zIndex: 1 }]}
                resizeMode="cover"
              />
            )}

            <Video
              source={{
                uri: item.videoUrl,
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }}
              ref={(ref) => (videoRefs.current[index] = ref)}
              style={styles.reelVideo}
              resizeMode="cover"
              shouldPlay={!isPaused}
              isLooping
              isMuted={false}
              useNativeControls={false}
              onReadyForDisplay={() => setIsVideoReady(true)}
              onError={(e) => console.error('Video load error:', e)}
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

          <TouchableOpacity style={styles.iconButton}>
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
    </View>
  );

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
  actions: { position: 'absolute', right: 10, bottom: 20, alignItems: 'center' },
  iconButton: { marginBottom: 20 },
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
