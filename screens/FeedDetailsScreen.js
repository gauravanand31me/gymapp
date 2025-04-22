import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../components/Footer';
import {
    getPostById,
    fetchComments,
    addComment,
    deleteComment,
} from '../api/apiService';

export default function FeedDetailScreen({ navigation, route }) {
    const { feedId } = route.params;

    const [feed, setFeed] = useState(null);
    const [loading, setLoading] = useState(true);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const loadPost = async () => {
        const result = await getPostById(feedId);
        if (result.success) {
            setFeed(result.post);
        } else {
            console.warn(result.message);
        }
        setLoading(false);
    };

    const loadComments = async () => {
        try {
            setCommentLoading(true);
            const data = await fetchComments(feedId);
            setComments(data.comments || []);
        } catch (e) {
            console.error('Failed to fetch comments', e);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const added = await addComment(feedId, newComment.trim());
        if (added) {
            setNewComment('');
            loadComments();
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            loadComments();
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    useEffect(() => {
        loadPost();
        loadComments();
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    if (!feed) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Post not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>


                {/* Comments Section */}
                <View style={styles.commentSection}>


                    <FlatList
                        ListHeaderComponent={
                            <View style={styles.card}>
                                <View style={styles.userRow}>
                                    <Image
                                        source={{
                                            uri:
                                                feed.user?.profilePic ||
                                                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                                        }}
                                        style={styles.avatar}
                                    />
                                    <View>
                                        <Text style={styles.userName}>{feed.user?.full_name || 'User'}</Text>
                                        <Text style={styles.timestamp}>
                                            {new Date(feed.timestamp).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>

                                {feed.relatedUser?.full_name && (
                                    <Text style={styles.relatedText}>
                                        with <Text style={styles.relatedUserName}>{feed.relatedUser.full_name}</Text>
                                    </Text>
                                )}

                                {feed.title && <Text style={styles.title}>{feed.title}</Text>}

                                {feed.imageUrl && (
                                    <Image
                                        source={{ uri: feed.imageUrl }}
                                        style={styles.postImage}
                                        resizeMode="cover"
                                    />
                                )}

                                {feed.description && (
                                    <Text style={styles.description}>{feed.description}</Text>
                                )}

                                {feed.gym?.name && (
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate('GymDetails', { gym_id: feed.gym.id })
                                        }
                                    >
                                        <Text style={styles.gymInfo}>🏋️‍♂️ {feed.gym.name}</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.reactionRow}>
                                    <TouchableOpacity style={styles.reactionButton}>
                                        <Icon name="heart" size={18} color="#e91e63" />
                                        <Text style={styles.reactionText}>{feed.like_count} Likes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.reactionButton}>
                                        <Icon name="comment" size={18} color="#3f51b5" />
                                        <Text style={styles.reactionText}>{feed.comment_count} Comments</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.commentHeading}>Comments</Text>
                            </View>
                        }
                        data={comments}
                        keyExtractor={(item, index) => index.toString()}
                        refreshing={commentLoading}
                        onRefresh={loadComments}
                        renderItem={({ item }) => (
                            <View style={styles.commentCard}>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('UserProfile', { userId: item.user?.id })
                                    }
                                >
                                    <Image
                                        source={{
                                            uri:
                                                item.user?.profilePic ||
                                                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
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
            </ScrollView>
            <Footer navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scroll: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    relatedText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },
    relatedUserName: {
        fontWeight: '600',
        color: '#007AFF',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#222',
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 10,
    },
    gymInfo: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#4CAF50',
        marginBottom: 10,
        textDecorationLine: 'underline',
    },
    reactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 14,
    },
    reactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#555',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f6f6f6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#b00020',
        textAlign: 'center',
    },
    commentSection: {
        marginTop: 24,
    },
    commentHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingHorizontal: 4,
        color: '#222',
    },
    commentList: {
        paddingBottom: 8,
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
        color: '#333',
    },
    commentText: {
        fontSize: 14,
        color: '#444',
        marginTop: 2,
    },
    commentTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 12,
        color: 'red',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
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
        marginTop: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 14,
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: '#0d6efd',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});
