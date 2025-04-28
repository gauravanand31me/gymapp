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
} from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../components/Footer';
import { fetchUserReels, deleteReel } from '../api/apiService';
import * as ImagePicker from 'expo-image-picker'; // ✅ Added for selecting video

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function ReelsScreen({ navigation, route }) {
  const [reels, setReels] = useState([]);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playVideoIndex, setPlayVideoIndex] = useState(null);
  const { reelId, userId } = route.params || {};
  const videoRefs = useRef([]);

  useEffect(() => {
    loadReels();
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

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentVisibleIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  // ✅ Upload new Reel
  const onVideoSelected = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow media access to upload a reel.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled) {
        const videoUri = result.assets[0].uri;
        navigation.navigate('UploadReelScreen', { videoUri }); // ✅ Pass to Upload Reel Screen
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Could not open gallery.');
    }
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
    // You can add API call for reporting later
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.reelContainer}
      onPress={() => setPlayVideoIndex(index)}
    >
      {playVideoIndex === index ? (
        <Video
          source={{ uri: item.videoUrl }}
          ref={(ref) => (videoRefs.current[index] = ref)}
          style={styles.reelVideo}
          resizeMode="cover"
          shouldPlay
          isMuted={false}
          useNativeControls={false}
          onError={(e) => console.error('Video load error:', e)}
        />
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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

          {/* ✅ Floating Upload Reel Button */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={onVideoSelected} // ✅ Pick video when pressed
          >
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
});
