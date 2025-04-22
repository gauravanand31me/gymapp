// Beautifully styled ProfileSection component with polished layout and milestone design
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const ProfileSection = ({ userData, profileImage, uploadingImage, currentMilestone, toggleImageOptions }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!isModalVisible);

  const milestoneIcon =
    currentMilestone === "bronze"
      ? require("../assets/bronzemedal.jpg")
      : currentMilestone === "silver"
      ? require("../assets/silvermedal.jpg")
      : currentMilestone === "gold"
      ? require("../assets/goldmedal.jpg")
      : require("../assets/diamondmedal.jpg");

  return (
    <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.profileSection}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={toggleModal} style={styles.profileImageWrapper}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton} onPress={toggleImageOptions}>
            <Icon name="camera-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.profileDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{userData?.full_name || "N/A"}</Text>
            {currentMilestone && <Image source={milestoneIcon} style={styles.milestoneIcon} />}
          </View>
          <Text style={styles.username}>@{userData?.username || "N/A"}</Text>
          <Text style={styles.mobileNumber}>{userData?.mobile_number || "N/A"}</Text>
        </View>
      </View>

      <Modal visible={isModalVisible} transparent onRequestClose={toggleModal}>
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

const styles = StyleSheet.create({
  profileSection: {
    padding: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#ffa000",
    padding: 6,
    borderRadius: 20,
    elevation: 6,
  },
  profileDetails: {
    marginLeft: 20,
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
  },
  milestoneIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  username: {
    fontSize: 15,
    color: "#e0f7fa",
    opacity: 0.9,
  },
  mobileNumber: {
    fontSize: 13,
    color: "#c8e6c9",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  enlargedProfileImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: "#fff",
  },
  closeModalButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
});

export default ProfileSection;