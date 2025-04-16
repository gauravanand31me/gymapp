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
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function FeedQuestion({ question, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [media, setMedia] = useState(null); // { uri, type: 'image' }

  const handleShare = async () => {
    if (answer.trim() || media) {
      try {
        const formData = new FormData();
        
        formData.append('answer', answer);
  
        if (media?.uri) {
          const fileExtension = media.uri.split('.').pop();
          formData.append('image', {
            uri: media.uri,
            name: `upload.${fileExtension}`,
            type: `image/${fileExtension}`,
          });
        }


        setAnswer('');
        setMedia(null);
  
        onSubmit(formData)
        
      } catch (err) {
        console.error('Upload Error:', err);
        alert('Something went wrong');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia({ uri: result.assets[0].uri, type: 'image' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          <Feather name="message-circle" size={16} color="#4A90E2" /> {question}
        </Text>

        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Write your thoughts..."
          placeholderTextColor="#999"
          multiline
          maxLength={180}
        />

        {media && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: media.uri }} style={styles.image} />
            <TouchableOpacity onPress={() => setMedia(null)}>
              <Text style={styles.removeMedia}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image Upload Button */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity onPress={pickImage}>
            <Feather name="image" size={22} color="#0044CC" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  uploadOptions: {
    flexDirection: 'row',
    marginTop: 12,
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
  removeMedia: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
  },
});
