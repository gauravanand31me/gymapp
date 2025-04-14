import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Feather, Camera, Video } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function FeedQuestion({ question, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [media, setMedia] = useState(null); // { uri, type }

  const handleShare = () => {
    if (answer.trim() || media) {
      onSubmit({ answer, media });
      setAnswer('');
      setMedia(null);
    }
  };

  const pickMedia = async (type) => {
    let result;
    const options = {
      mediaTypes: type === 'image' 
        ? ImagePicker.MediaTypeOptions.Images 
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 30, // limit video to 30 seconds
    };

    result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.cancelled) {
      setMedia({ uri: result.assets[0].uri, type });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          <Feather name="message-circle" size={18} color="#0044CC" /> {question}
        </Text>

        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Write your thoughts..."
          placeholderTextColor="#999"
          multiline
        />

        {/* Media Preview */}
        {media && (
          <View style={styles.mediaPreview}>
            {media.type === 'image' ? (
              <Image source={{ uri: media.uri }} style={styles.image} />
            ) : (
              <Text style={styles.videoLabel}>🎥 Video Selected</Text>
            )}
            <TouchableOpacity onPress={() => setMedia(null)}>
              <Text style={styles.removeMedia}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Upload Buttons */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity onPress={() => pickMedia('image')}>
            <Feather name="image" size={22} color="#0044CC" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickMedia('video')}>
            <Feather name="video" size={22} color="#0044CC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: answer.trim() || media ? '#0044CC' : '#ccc' },
          ]}
          onPress={handleShare}
          disabled={!answer.trim() && !media}
        >
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    padding: 16,
    borderColor: '#ddeeff',
    borderWidth: 1,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0044CC',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    backgroundColor: '#fff',
    color: '#333',
  },
  uploadOptions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-start',
    gap: 16,
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  videoLabel: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  removeMedia: {
    fontSize: 18,
    color: '#FF4444',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
