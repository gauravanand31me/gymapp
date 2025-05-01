import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const UploadReelScreen = ({ navigation, route }) => {
  const { onVideoSelected } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('public');
  const [videoRef, setVideoRef] = useState(null);

  const pickVideo = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const video = result.assets[0];
        setSelectedVideoUri(video.uri);
      } else {
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while picking video.');
      navigation.goBack();
    }
    setLoading(false);
  };

  const handleVideoLoad = (status) => {
    if (status.isLoaded) {
      const durationMillis = status.durationMillis;
      if (durationMillis > 60000) {
        Alert.alert('Video Too Long', 'Please pick or trim a video under 30 seconds.');
        navigation.goBack();
      }
    } else {
      Alert.alert('Error', 'Could not load video duration.');
      navigation.goBack();
    }
  };

  const handleUpload = () => {
    if (selectedVideoUri) {
      onVideoSelected({
        uri: selectedVideoUri,
        title: title.trim(),
        description: description.trim(),
        postType: postType,
      });
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  useEffect(() => {
    pickVideo();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Preparing your video...</Text>
        </View>
      ) : selectedVideoUri ? (
        <>
          <Video
            source={{ uri: selectedVideoUri }}
            shouldPlay
            isMuted={false}
            resizeMode="contain"
            style={styles.video}
            onLoad={handleVideoLoad}
            ref={(ref) => setVideoRef(ref)}
          />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Add a Title..."
              placeholderTextColor="#ccc"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <TextInput
              placeholder="Write a Description..."
              placeholderTextColor="#ccc"
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />

            <View style={styles.postTypeContainer}>
              {['public', 'private', 'onlyme'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.postTypeButton, postType === type && styles.selectedPostTypeButton]}
                  onPress={() => setPostType(type)}
                >
                  <Text style={[styles.postTypeText, postType === type && styles.selectedPostTypeText]}>
                    {type === 'public' ? '🌎 Public' : type === 'private' ? '👥 Friends Only' : '🔒 Only Me'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <Text style={styles.buttonText}>🚀 Upload</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.infoWrapper}>
          <Text style={styles.infoText}>Opening Gallery...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#aaa',
    fontSize: 18,
    fontStyle: 'italic',
  },
  video: {
    width: screenWidth - 40,
    height: screenHeight * 0.4,
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  postTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
    marginHorizontal: 6,
    marginTop: 8,
  },
  selectedPostTypeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  postTypeText: {
    color: '#aaa',
    fontSize: 13,
  },
  selectedPostTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#e74c3c',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  uploadButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#27ae60',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UploadReelScreen;
