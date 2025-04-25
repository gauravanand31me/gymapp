import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

const UploadReelScreen = ({ navigation, route }) => {
  const { onVideoSelected } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);

  const pickVideo = async () => {
    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true, // allows basic trimming (only some phones)
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

      if (durationMillis > 30000) {
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
      onVideoSelected(selectedVideoUri);
      navigation.goBack();
    }
  };

  const handleTrim = () => {
    setSelectedVideoUri(null);
    pickVideo();
  };

  useEffect(() => {
    pickVideo();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Preparing your video...</Text>
        </>
      ) : selectedVideoUri ? (
        <>
          <Video
            source={{ uri: selectedVideoUri }}
            shouldPlay
            isMuted={false}
            resizeMode="contain"
            style={styles.video}
            onLoad={handleVideoLoad}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.trimButton} onPress={handleTrim}>
              <Text style={styles.buttonText}>✂️ Trim Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <Text style={styles.buttonText}>🚀 Upload Reel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.infoText}>Opening Gallery...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#fff', fontSize: 16 },
  infoText: { color: '#fff', fontSize: 16 },
  video: {
    width: '100%',
    height: '60%',
    backgroundColor: '#000',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trimButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  uploadButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default UploadReelScreen;
