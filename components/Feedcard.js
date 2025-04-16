import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import {
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react-native';

export default function FeedCard({ item, formatTime, onDelete, onReport }) {
  const [liked, setLiked] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleMenuPress = () => {
    Alert.alert(
      'Post Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report Post', onPress: () => onReport?.(item) },
        { text: 'Delete Post', onPress: () => onDelete?.(item), style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: item.user?.profilePic ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user?.name || 'Anonymous'}</Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <MoreVertical size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Gym Name */}
      {item.gym && <Text style={styles.gymName}>🏋️ {item.gym.name}</Text>}

      {/* Image */}
      {item.imageUrl && (
        <>
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          </TouchableOpacity>

          {/* Fullscreen Modal */}
          <Modal visible={imageModalVisible} transparent={true}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.fullImage} />

              {/* Close Button */}
              <Pressable
                onPress={() => setImageModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={28} color="#fff" />
              </Pressable>

              {/* Reactions in Modal */}
              <View style={styles.modalReactionBar}>
                <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.reactionButton}>
                  <ThumbsUp size={20} color={liked ? '#0d6efd' : '#fff'} />
                  <Text style={[styles.reactionText, liked && { color: '#0d6efd' }]}>
                    {liked ? 'Liked' : 'Like'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reactionButton}>
                  <MessageCircle size={20} color="#fff" />
                  <Text style={styles.reactionText}>Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reactionButton}>
                  <Share2 size={20} color="#fff" />
                  <Text style={styles.reactionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* Reaction Bar */}
      <View style={styles.reactionBar}>
        <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.reactionButton}>
          <ThumbsUp size={18} color={liked ? '#0d6efd' : '#666'} />
          <Text style={[styles.reactionText, liked && { color: '#0d6efd' }]}>
            {liked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reactionButton}>
          <MessageCircle size={18} color="#666" />
          <Text style={styles.reactionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reactionButton}>
          <Share2 size={18} color="#666" />
          <Text style={styles.reactionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 6,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  reactionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  reactionText: {
    fontSize: 13,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 30,
    zIndex: 10,
  },
  modalReactionBar: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
