import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const ProfileSection = ({ userData, profileImage, uploadingImage, currentMilestone, toggleImageOptions }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => setModalVisible(!isModalVisible);

  return (
    <LinearGradient
      colors={["#6FCF97", "#4CAF50"]}
      style={styles.profileSection}
    >
      <View style={styles.profileHeader}>
        {/* Profile Image */}
        <TouchableOpacity onPress={toggleImageOptions}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            {uploadingImage && (
              <View style={[styles.profileImage, styles.uploadingOverlay]}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            <TouchableOpacity style={styles.addPhotoButton} onPress={toggleImageOptions}>
              <Icon name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        
            
        {/* Profile Details */}
        <View style={styles.profileDetails}>
          <Text style={styles.fullName}>
            {userData?.full_name || "N/A"}{" "} 
            {currentMilestone && (
              <Image
                source={
                  currentMilestone === "bronze"
                    ? require("../assets/bronzemedal.jpg")
                    : currentMilestone === "silver"
                    ? require("../assets/silvermedal.jpg")
                    : currentMilestone === "gold"
                    ? require("../assets/goldmedal.jpg")
                    : require("../assets/diamondmedal.jpg")
                }
                style={styles.milestoneIconNearName}
              />
            )}
          </Text>
          <Text style={styles.username}>@{userData?.username || "N/A"}</Text>
          <Text style={styles.mobileNumber}>{userData?.mobile_number || "N/A"}</Text>
        </View>
      </View>

      {/* Profile Image Modal */}
      <Modal visible={isModalVisible} transparent={true} onRequestClose={toggleModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeModalButton} onPress={toggleModal}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: profileImage }} style={styles.enlargedProfileImage} />
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = {
  profileSection: {
    padding: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  uploadingOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 55,
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#ff9800",
    borderRadius: 15,
    padding: 5,
    elevation: 5,
  },
  profileDetails: {
    marginLeft: 20,
    flex: 1,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  milestoneIconNearName: {
    width: 24,
    height: 24,
    marginLeft: 5,
  },
  username: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginTop: 3,
  },
  mobileNumber: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  enlargedProfileImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: "#fff",
  },
  closeModalButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
};

export default ProfileSection;
