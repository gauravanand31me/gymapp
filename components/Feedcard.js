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
  Share,
} from 'react-native';
import {
  MoreVertical,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react-native';
import { reactToPost } from '../api/apiService';

const REACTIONS = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'haha', emoji: '😂' },
  { type: 'wow', emoji: '😮' },
  { type: 'angry', emoji: '😡' },
];

export default function FeedCard({ item, formatTime, onDelete, onReport, onComment, onShare }) {
 
  const initialCounts = {};
  console.log("reactionsBreakdown", item);
(item.reactionsBreakdown || []).forEach(r => {
  console.log("R is", r)
  initialCounts[r.type] = r.count;
});

console.log("initialCounts", initialCounts);
const [reactionCounts, setReactionCounts] = useState(initialCounts);
const [selectedReaction, setSelectedReaction] = useState(item.userReaction || null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleReaction = async (type) => {
    try {
      const previousReaction = selectedReaction;
  
      setSelectedReaction((prev) => {
        const newCounts = { ...reactionCounts };
        if (prev && newCounts[prev]) newCounts[prev] -= 1;
        newCounts[type] = (newCounts[type] || 0) + 1;
        setReactionCounts(newCounts);
        return type;
      });
  
      // Call backend API to save reaction
      const result = await reactToPost(item.id, type);
  
  
     
        // Rollback UI change if backend failed
        setSelectedReaction(previousReaction);
        setReactionCounts((prev) => {
          const rollbackCounts = { ...prev };
          if (rollbackCounts[type]) rollbackCounts[type] -= 1;
          if (previousReaction) rollbackCounts[previousReaction] = (rollbackCounts[previousReaction] || 0) + 1;
          return rollbackCounts;
        });

 
    } catch (error) {
      console.error('Reaction error:', error);
    }
  };
  


  

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

  const renderReactionSummary = () => {
    const total = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    const firstReaction = selectedReaction || Object.keys(reactionCounts)[0];
    const emoji = REACTIONS.find((r) => r.type === firstReaction)?.emoji || '👍';
    return <Text style={styles.reactionText}>{emoji} {total}</Text>;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
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

          <Modal visible={imageModalVisible} transparent={true}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.fullImage} />
              <Pressable onPress={() => setImageModalVisible(false)} style={styles.closeButton}>
                <X size={28} color="#fff" />
              </Pressable>

              <View style={styles.modalReactionBar}>
                {REACTIONS.map((reaction) => (
                  <TouchableOpacity
                    key={reaction.type}
                    onPress={() => handleReaction(reaction.type)}
                    style={styles.reactionButton}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        </>
      )}

{console.log("reactionCounts", reactionCounts)}
{Object.keys(reactionCounts).length > 0 && (
  <View style={styles.reactionBreakdown}>
    {Object.entries(reactionCounts).map(([type, count]) => {
      const emoji = REACTIONS.find(r => r.type === type)?.emoji || '👍';
      return (
        <View key={type} style={styles.reactionGroup}>
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          <Text style={styles.reactionCount}>{count}</Text>
        </View>
      );
    })}
  </View>
)}

      {/* Reaction Bar */}
      <View style={styles.reactionBar}>
        <View style={styles.reactionSummary}>
          {renderReactionSummary()}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(item)}
        >
          <MessageCircle size={18} color="#666" />
          <Text style={styles.reactionText}>{item.commentCount || 0} Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (onShare) {
              onShare(item);
            } else {
              Share.share({
                message: `Check this post: ${item.description}`,
              });
            }
          }}
        >
          <Share2 size={18} color="#666" />
          <Text style={styles.reactionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Options */}
      <View style={styles.reactionPicker}>
        {REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.type}
            onPress={() => handleReaction(reaction.type)}
            style={[
              styles.reactionButton,
              selectedReaction === reaction.type && styles.selectedReaction,
            ]}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'center',
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  reactionPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
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
  },
  selectedReaction: {
    borderBottomWidth: 2,
    borderColor: '#0d6efd',
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
  reactionBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
    paddingHorizontal: 6,
  },
  reactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reactionCount: {
    fontSize: 13,
    marginLeft: 4,
    color: '#444',
  },
});
