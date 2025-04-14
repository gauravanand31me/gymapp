import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function FeedQuestion({ question, onSubmit }) {
  const [answer, setAnswer] = useState('');

  const handleShare = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
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

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: answer.trim() ? '#0044CC' : '#ccc' },
          ]}
          onPress={handleShare}
          disabled={!answer.trim()}
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
  button: {
    marginTop: 12,
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
