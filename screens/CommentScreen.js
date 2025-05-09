import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';

import { fetchComments, addComment, deleteComment } from '../api/apiService'; // Adjust path

export default function CommentScreen({ route, navigation, postId: propPostId, closeModel }) {
  const postId = route?.params?.postId || propPostId;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);


  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchComments(postId);
      console.log("data.comments", data.comments);
      setComments(data.comments || []);
    } catch (e) {
      console.error('Failed to fetch comments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const added = await addComment(postId, newComment.trim());
    if (added) {
      setNewComment('');
      loadComments();
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => (typeof closeModel === 'function' ? closeModel() : navigation.goBack())}>
  <X size={24} color="#000" />
</TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Comments list */}
      <FlatList
        data={comments}
        keyExtractor={(item, index) => index.toString()}
        refreshing={loading}
        onRefresh={loadComments}
        contentContainerStyle={styles.commentList}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.user?.id })}>
              <Image
                source={{
                  uri: item.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                }}
                style={styles.commentAvatar}
              />
            </TouchableOpacity>
            <View style={styles.commentContent}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentUser}>{item.user?.name || 'User'}</Text>
                {item.canDelete && (
                  <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.commentText}>{item.commentText}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No comments yet.</Text>}
      />

      {/* Input to add comment */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputRow}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            style={styles.input}
          />
          <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentList: {
    padding: 16,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    marginLeft: 8
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 12
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 20,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#0d6efd',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // push name left, delete right
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 12,
    color: 'red',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  commentAvatar: {
    width: 36,
    height: 36,

  }
});
