import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { MoreVertical, MessageCircle } from 'lucide-react-native';
import { getToken, reactToPost } from '../api/apiService';
import { Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import yupluckLoader from '../assets/yupluck-hero.png'; // adjust path as needed

const { width, height } = Dimensions.get('window');

const FeedCard = ({
  item,
  index,
  visibleIndex,
  formatTime,
  onDelete,
  onReport,
  onComment,
  onShare,
  onUserPress,
  navigation,
}) => {
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [liked, setLiked] = useState(item.userLiked);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageHeight, setImageHeight] = useState(280);
  const [authToken, setAuthToken] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const calculateImageHeight = (uri) => {
    if (!uri) return;

    Image.getSize(
      uri,
      (width, height) => {
        const screenWidth = Dimensions.get('window').width;
        const ratio = height / width;
        const calculatedHeight = screenWidth * ratio;
        const minHeight = screenWidth * 1;
        const maxHeight = screenWidth * 1.25;
        setImageHeight(Math.min(Math.max(calculatedHeight, minHeight), maxHeight));
      },
      (error) => {
        console.error('Error getting image size:', error);
      }
    );
  };


  const toggleMute = async () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      try {
        await videoRef.current.setStatusAsync({ isMuted: !isMuted });
      } catch (e) {
        console.error('Mute toggle error:', e);
      }
    }
  };

  const getVideoHeight = () => {
    return item.type === 'aiPromo' ? width * 1.78 : width * 1.25;
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      setAuthToken(token);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (item.imageUrl && item.type !== 'aiPromo') {
      calculateImageHeight(item.imageUrl);
    }
  }, [item.imageUrl]);

  useEffect(() => {
    const controlVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.setStatusAsync({
            positionMillis: 0,
            shouldPlay: index === visibleIndex,
            isMuted: true,
            isLooping: true,
          });
        } catch (e) {
          console.error('Error controlling video:', e);
        }
      }
    };
    controlVideo();
  }, [visibleIndex]);

  const handleLike = async () => {
    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      await reactToPost(item.id, liked ? null : 'like');
    } catch (error) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Reaction error:', error);
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'public':
        return { icon: 'globe', label: 'Public' };
      case 'private':
        return { icon: 'users', label: 'Friends Only' };
      case 'onlyme':
        return { icon: 'lock', label: 'Only Me' };
      default:
        return null;
    }
  };

  const handleMenuPress = () => {
    const options = [{ text: 'Cancel', style: 'cancel' }];

    if (item.canReport) {
      options.push({
        text: 'Report Post',
        onPress: () => onReport?.(item),
      });
    }




    if (item.canDelete) {
      options.push({
        text: 'Delete Post',
        onPress: () => onDelete?.(item),
        style: 'destructive',
      });
    }

    Alert.alert('Post Options', 'What would you like to do?', options, {
      cancelable: true,
    });
  };

  const postTypeInfo = getPostTypeIcon(item.postType);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userContainer} onPress={() => onUserPress?.(item)}>
          <Image
            source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.user?.name || 'Anonymous'}</Text>
            <View style={styles.postMetaRow}>
              {postTypeInfo && (
                <View style={styles.privacyBadge}>
                  <Feather name={postTypeInfo.icon} size={12} color="#888" />
                  <Text style={styles.privacyLabel}>{postTypeInfo.label}</Text>
                </View>
              )}
              <Text style={styles.timestamp}>· {formatTime(item.timestamp)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <MoreVertical size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <TouchableOpacity onPress={() => navigation.navigate('FeedDetailScreen', { feedId: item.id })}>
        <Text style={styles.description}>{item.description}</Text>
      </TouchableOpacity>

      {/* Gym Name */}
      {item.gym && (
        <TouchableOpacity onPress={() => navigation.navigate('GymDetails', { gym_id: item.gym.id })}>
          <Text style={styles.gymName}>{item.gym.name}</Text>
        </TouchableOpacity>
      )}

      {/* Media */}
      {item.imageUrl && (
        <View style={styles.mediaContainer}>
          {item.type === 'aiPromo' ? (
            <TouchableOpacity
              style={styles.fullWidthMedia}
              onPress={() => navigation.navigate('ReelsScreen', { reelId: item.id })}
            >

              {!isVideoLoaded && (
                <Image
                  source={yupluckLoader}
                  style={{
                    position: 'absolute',
                    width,
                    height,
                    zIndex: 1,
                  }}
                  resizeMode="contain"
                />
              )}
              <Video
                ref={videoRef}
                source={{
                  uri: item.imageUrl,
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }}
                style={[styles.postVideo, { height: getVideoHeight() }]}
                resizeMode="cover"
                shouldPlay={index === visibleIndex}
                isMuted={isMuted}
                useNativeControls={false}
                onLoad={() => {
                  setIsVideoLoaded(true);
                  videoRef.current?.setStatusAsync({
                    positionMillis: 0,
                    shouldPlay: index === visibleIndex,
                  });
                }}
                onError={(e) => console.error('Video load error:', e)}
              />
              <TouchableOpacity
                onPress={toggleMute}
                style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 10,
                  borderRadius: 20,
                  zIndex: 2,
                }}
              >
                <Feather name={isMuted ? 'volume-x' : 'volume-2'} size={24} color="#fff" />
              </TouchableOpacity>

            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.fullWidthMedia}
                onPress={() => setModalVisible(true)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[styles.postImage, { height: imageHeight }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>

                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.fullscreenImage}
                    resizeMode="contain"
                  />
                </View>
              </Modal>
            </>
          )}
        </View>
      )}

      {/* Like Summary */}
      {likeCount > 0 && (
        <View style={styles.likeSummary}>
          <Text style={styles.reactionText}>👍 {likeCount}</Text>
        </View>
      )}

      {/* Reaction Bar */}
      <View style={styles.reactionBar}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Text style={[styles.reactionEmoji, liked && styles.liked]}>👍</Text>
          <Text style={styles.reactionText}>{liked ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(item)}
        >
          <MessageCircle size={18} color="#666" />
          <Text style={styles.reactionText}> {item?.commentCount} Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  menuButton: {
    padding: 6,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    lineHeight: 20,
  },
  gymName: {
    fontWeight: '500',
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  mediaContainer: {
    marginHorizontal: -14,
    marginTop: 6,
  },
  fullWidthMedia: {
    width: width,
  },
  postImage: {
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  postVideo: {
    width: '100%',
    backgroundColor: '#000',
  },
  likeSummary: {
    marginTop: 8,
    paddingHorizontal: 6,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    gap: 6,
  },
  reactionText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  reactionEmoji: {
    fontSize: 20,
    color: '#666',
  },
  liked: {
    color: '#0d6efd',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 4,
  },
  privacyLabel: {
    fontSize: 11,
    color: '#666',
  },
});

export default FeedCard;
