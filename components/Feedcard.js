import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  Dimensions
} from 'react-native';
import { MoreVertical, MessageCircle, Share2 } from 'lucide-react-native';
import { reactToPost } from '../api/apiService';

const { width, height } = Dimensions.get('window');

const FeedCard = ({ item, formatTime, onDelete, onReport, onComment, onShare, onUserPress, navigation }) => {
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [liked, setLiked] = useState(item.userReaction === 'like');
  const [modalVisible, setModalVisible] = useState(false);

  const handleLike = async () => {
    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic UI update
    setLiked(!liked);
    setLikeCount(prev => (liked ? prev - 1 : prev + 1));

    try {
      await reactToPost(item.id, liked ? null : 'like'); // null to remove like
    } catch (error) {
      // Rollback on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Reaction error:', error);
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

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userContainer}
          onPress={() => onUserPress?.(item)}
        >
          <Image
            source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.user?.name || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <MoreVertical size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Gym Name */}
      {item.gym && (
        <TouchableOpacity onPress={() => navigation.navigate('GymDetails', { gym_id: item.gym.id })}>
          <Text style={styles.gymName}>🏋️ {item.gym.name}</Text>
        </TouchableOpacity>
      )}

      {/* Image Preview */}
      {item.imageUrl && (
        <>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              {/* Close Button */}
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

      {/* Like Count */}
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

        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            onShare?.(item) || Share.share({ message: `Check this post: ${item.description}` })
          }
        >
          <Share2 size={18} color="#666" />
          <Text style={styles.reactionText}>Share</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
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
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 6,
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
});

export default FeedCard;
