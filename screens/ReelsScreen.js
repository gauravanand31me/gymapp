import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../components/Footer';

const screenWidth = Dimensions.get('window').width;

const dummyReels = [
  {
    id: '1',
    thumbnail: 'https://via.placeholder.com/300x500.png?text=Reel+1',
    title: 'Reel 1',
  },
  {
    id: '2',
    thumbnail: 'https://via.placeholder.com/300x500.png?text=Reel+2',
    title: 'Reel 2',
  },
  {
    id: '3',
    thumbnail: 'https://via.placeholder.com/300x500.png?text=Reel+3',
    title: 'Reel 3',
  },
  {
    id: '4',
    thumbnail: 'https://via.placeholder.com/300x500.png?text=Reel+4',
    title: 'Reel 4',
  },
];

const ReelsScreen = ({navigation}) => {
  const [reels, setReels] = useState(dummyReels);

  const handleUploadReel = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Please allow access to upload a reel.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newReel = {
        id: Date.now().toString(),
        thumbnail: 'https://via.placeholder.com/300x500.png?text=New+Reel',
        title: 'Your Reel',
        uri: result.assets[0].uri,
      };
      setReels(prev => [newReel, ...prev]);
    }
  };

  const renderReel = ({ item }) => (
    <TouchableOpacity style={styles.reelCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.reelImage} />
      <Text style={styles.reelTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Reels</Text>
        <TouchableOpacity onPress={handleUploadReel} style={styles.uploadButton}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.uploadText}>Upload Reel</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reels}
        renderItem={renderReel}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
      />
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 16,
    marginTop: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    paddingBottom: 100,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reelCard: {
    width: (screenWidth - 36) / 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reelImage: {
    width: '100%',
    height: 220,
  },
  reelTitle: {
    padding: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
});

export default ReelsScreen;
