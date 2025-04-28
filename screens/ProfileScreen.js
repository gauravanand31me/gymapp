"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImageManipulator from "expo-image-manipulator";
import Footer from "../components/Footer";
import ProfileSection from '../components/ProfileSection';


import {
  userDetails,
  uploadProfileImage,
  getVisitedGyms,
  getVisitedBuddies,
  deleteProfileImage,
  fetchMyFeed,
  fetchUserReels,
} from "../api/apiService";
import MilestoneProgress from "../components/MilestoneProgress";

const milestones = { bronze: 50, silver: 100, gold: 200, diamond: 300 };

export default function ProfileScreen({ navigation, route }) {
  const [profileImage, setProfileImage] = useState("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Reels");

  const [reels, setReels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [visitedGyms, setVisitedGyms] = useState([]);
  const [visitedBuddies, setVisitedBuddies] = useState([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isImageOptionsVisible, setIsImageOptionsVisible] = useState(false);
  const totalWorkoutHours = (userData?.total_work_out_time || 0) / 60;
  const currentMilestone = getCurrentMilestone(totalWorkoutHours);


  function getCurrentMilestone(hours) {
    if (parseInt(hours) >= milestones.diamond) return "Diamond";
    if (parseInt(hours) >= milestones.gold) return "Gold";
    if (parseInt(hours) >= milestones.silver) return "Silver";
    if (parseInt(hours) >= milestones.bronze) return "Bronze";
    return "Newbie";
  }


  const getProgress = (hours) => {
    if (hours >= 300) return 1; // Full progress for Diamond milestone
    if (hours >= 200) return (hours - 200) / 100 + 0.75; // Progress towards Diamond (200-300 hours)
    if (hours >= 100) return (hours - 100) / 100 + 0.5; // Progress towards Gold (100-200 hours)
    if (hours >= 50) return (hours - 50) / 50 + 0.25; // Progress towards Silver (50-100 hours)
    return hours / 50 * 0.25; // Progress towards Bronze (0-50 hours)
  };

  const fetchUser = async () => {
    try {
      const data = await userDetails();
      setUserData(data);
      setProfileImage(data?.profile_pic || profileImage);
    } catch (error) {
      Alert.alert("Error", "Failed to load user details.");
    }
  };

  const loadInitialData = async () => {
    try {
      const [reelsData, postsData, gymsData, buddiesData] = await Promise.all([
        fetchUserReels({ page: 0, limit: 30 }),
        fetchMyFeed(0, 30),
        getVisitedGyms(),
        getVisitedBuddies(),
      ]);
      setReels(reelsData || []);
      setPosts(postsData || []);
      setVisitedGyms(gymsData?.visitedGyms || []);
      setVisitedBuddies(buddiesData?.buddiesWithWorkoutHours || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    loadInitialData();
  }, [route.params]);

  const processAndUploadImage = async (uri) => {
    try {
      setUploadingImage(true);
      const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      setProfileImage(manipulated.uri);
      await uploadProfileImage(manipulated.uri);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setIsImageOptionsVisible(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSelectImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } else {
      Alert.alert("Permission required", "Please enable gallery permissions.");
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } else {
      Alert.alert("Permission required", "Please enable camera permissions.");
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      await deleteProfileImage();
      setProfileImage("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleImageOptions = () => {
    setIsImageOptionsVisible(!isImageOptionsVisible);
  };

  const getDataToShow = () => {
   
    if (selectedTab === "Reels") return reels;
    if (selectedTab === "Posts") return posts;
    if (selectedTab === "Visited Gym") return visitedGyms;
    if (selectedTab === "Gym Buddies") return visitedBuddies;
    return [];
  };

  const renderItem = ({ item }) => {
    if (selectedTab === "Reels") {
      // Reel view (thumbnail grid)
      return (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate("ReelPlayerScreen", { reelId: item.id })}
        >
          <Image
            source={{ uri: item.thumbnailUrl || "https://via.placeholder.com/150" }}
            style={styles.gridImage}
          />
        </TouchableOpacity>
      );
    } else if (selectedTab === "Posts") {
      return (
        <TouchableOpacity
          style={styles.postCard}
          onPress={() => navigation.navigate("FeedDetailScreen", { feedId: item.id })}
        >
          <Text style={styles.postCardTitle}>
            {item.title || "Untitled Post"}
          </Text>
          {item.description ? (
            <Text style={styles.postCardDescription}>
              {item.description.slice(0, 120)}...
            </Text>
          ) : (
            <Text style={styles.postCardDescription}>
              (No description)
            </Text>
          )}
        </TouchableOpacity>
      );
    } else {
      // For Visited Gym or Gym Buddies
      return (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            if (selectedTab === "Visited Gym") {
              navigation.navigate("GymDetails", { gym_id: item.gymId });
            } else if (selectedTab === "Gym Buddies") {
              navigation.navigate("UserProfile", { userId: item.buddyId });
            }
          }}
        >
          <Text style={styles.listItemText}>
            {item.gymName || item.buddyName || "Unknown"}
          </Text>
        </TouchableOpacity>
      );
    }
  };
  
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const progress = getProgress(totalWorkoutHours);

  const nextMilestone = currentMilestone === 'bronze'
    ? 'Silver'
    : currentMilestone === 'silver'
      ? 'Gold'
      : currentMilestone === 'gold'
        ? 'Diamond'
        : 'Bronze'; // Reset to 'Bronze' if at Diamond

  const hoursToNextMilestone = milestones[nextMilestone.toLowerCase()] - totalWorkoutHours;

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Settings", { fullName: userData?.full_name })}>
          <Icon name="cog" size={26} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setIsImageOptionsVisible(true)}>
          <Icon name="camera" size={26} color="#4CAF50" />
        </TouchableOpacity>
      </View>
   
      {uploadSuccess && (
        <View style={styles.successBanner}>
          <Icon name="check-circle" size={18} color="#4CAF50" />
          <Text style={styles.successText}>Profile Updated Successfully!</Text>
        </View>
      )}

      <FlatList
        data={getDataToShow()}
        key={selectedTab}
        numColumns={selectedTab === "Reels" ? 3 : 1}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.profileSection}>
              <ProfileSection userData={userData} profileImage={profileImage} uploadingImage={uploadingImage} currentMilestone={currentMilestone} toggleImageOptions={toggleImageOptions} />
              <View style={styles.statsRow}>
                
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{Math.round(totalWorkoutHours)}</Text>
                  <Text style={styles.statLabel}>Workout Hours</Text>
                </View>
              </View>
              <MilestoneProgress progress={Math.round(progress * 10) / 10} hoursToNextMilestone={hoursToNextMilestone} nextMilestone={nextMilestone} />
            </View>

            <View style={styles.tabs}>
              {["Reels", "Posts", "Visited Gym", "Gym Buddies"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabItem, selectedTab === tab && styles.tabItemSelected]}
                  onPress={() => setSelectedTab(tab)}
                >
                  <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
      </View>

      {/* Image Modal */}
      <Modal
        visible={isImageOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleSelectImage}>
              <Text style={styles.modalButton}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTakePhoto}>
              <Text style={styles.modalButton}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteProfileImage}>
              <Text style={styles.modalButton}>Delete Profile Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsImageOptionsVisible(false)}>
              <Text style={[styles.modalButton, { color: "red" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 💬 Styles (I'll paste next because this message is large)

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 20
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 12,
  },
  statBlock: {
    alignItems: "center",
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
  },
  milestoneText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    backgroundColor: "#fafafa",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabItemSelected: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  tabTextSelected: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: "#eee",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  listItemText: {
    fontSize: 14,
    color: "#333",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalButton: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: "center",
    color: "#4CAF50",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postCard: {
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  postCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  postCardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  
});
