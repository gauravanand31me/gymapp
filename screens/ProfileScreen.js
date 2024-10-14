import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker'; // Using expo-image-picker
import Footer from '../components/Footer';
import {
  userDetails,
  uploadProfileImage,
  fetchUploadedImages,
  uploadImages,
  getUserImage,
} from '../api/apiService'; // Ensure you have the correct path
import MileStoneContainer from '../components/MileStoneContainer';

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [images, setImages] = useState([]); // Change to an array to hold multiple images
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userDetails();
        console.log("User Profile Information received", data);
        setUserData(data);
        setProfileImage(data.profile_pic || profileImage);
        await fetchImages(data.id); // Pass user ID directly to fetch images
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Could not fetch user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchImages = async (userId) => {
      try {
        const response = await getUserImage(userId); // Get images for the specific user ID
        console.log("uploadedImages", response);
        
        // Check if the response has userImages and set them to the state
        if (response.userImages) {
          setImages(response.userImages); // Update the state with the array of images
        } else {
          setImages([]); // Reset to an empty array if no images found
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        Alert.alert('Error', 'Could not fetch images. Please try again later.');
      }
    };

    fetchUserData();
  }, []);

  const selectProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);

      // Upload the selected image to the server
      try {
        setUploading(true);
        await uploadProfileImage(selectedImage); // Ensure this API is defined
        Alert.alert('Success', 'Profile image uploaded successfully.');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        Alert.alert('Upload Error', 'Failed to upload profile image.');
      } finally {
        setUploading(false);
      }
    }
  };

  const selectImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      selectionLimit: 0, // 0 for unlimited selection
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;

      try {
        setUploading(true);
        await uploadImages(selectedImage); // Ensure this API handles array of images
        Alert.alert('Success', 'Images uploaded successfully.');
      } catch (error) {
        console.error('Upload Error:', error);
        Alert.alert('Upload Error', 'Failed to upload images.');
      } finally {
        setUploading(false);
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.gridItem}>
      <Image source={{ uri: item.user_image }} style={styles.gridImage} />
    </View>
  );

  if (loading || uploading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
<View style={styles.container}>
    {/* Profile Header with Stats */}
    <View style={styles.headerContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.addPhotoButton} onPress={selectProfileImage}>
            <Icon name="plus" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.fullName}>{userData?.full_name || 'N/A'}</Text>
          <Text style={styles.username}>@{userData?.username || 'N/A'}</Text>
          <Text style={styles.mobileNumber}>{userData?.mobile_number || 'N/A'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
        <Icon name="cog" size={20} color="#4CAF50" />
      </TouchableOpacity>

      {/* Send Request Button */}
      <TouchableOpacity style={styles.sendRequestButton} onPress={() => Alert.alert('Request Sent!')}>
        <Text style={styles.sendRequestText}>Send Request</Text>
      </TouchableOpacity>
   
      </View>

      {/* Combined Stats Container */}
      <View style={styles.statsContainer}>
        {/* <View style={styles.statCard}>
          <Text style={styles.statValue}>{userData?.upload_count || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View> */}
        <View style={styles.statCard}>
          <TouchableOpacity onPress={() => navigation.navigate("InviteFriendBuddy")}>
            <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueTime}>{userData?.total_work_out_time/60 || 0} h.</Text>
          <Text style={styles.statLabel}>Workout Time</Text>
          <ProgressBar progress={0.75} color="#4CAF50" style={styles.progressBar} />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button}  onPress={() => navigation.navigate('VisitedGymScreen')}>
          <Icon name="dumbbell" size={20} color="#fff" />
          <Text style={styles.buttonText}>Visited Gyms</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.button}>
          <Icon name="account-group" size={20} color="#fff" />
          <Text style={styles.buttonText}>Gym Buddies</Text>
        </TouchableOpacity> */}
        
      </View>

      {/* Image Grid using FlatList */}
      {/* <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} // Use unique image ID
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        style={styles.imageGrid}
      /> */}

      <MileStoneContainer workoutTime={userData?.total_work_out_time/60}/>

      {/* Footer at the Bottom */}
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 30, // Space from status bar
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 4,
    elevation: 2,
  },
  profileDetails: {
    marginLeft: 15,
  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#555',
  },
  mobileNumber: {
    fontSize: 14,
    color: '#777',
  },
  settingsButton: {
    padding: 10,
  },
  sendRequestButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Space between settings button and send request button
    marginTop: 50, // Add margin to move the button down

  },
  sendRequestText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 100,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statValueTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 8,
    elevation: 2,
  },
  imageGrid: {
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});


export default ProfileScreen;