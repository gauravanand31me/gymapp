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
