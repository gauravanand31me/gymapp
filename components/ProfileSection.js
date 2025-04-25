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

const ProfileSection = ({
  userData,
  profileImage,
  uploadingImage,
  currentMilestone,
  toggleImageOptions,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!isModalVisible);

  const milestoneIcon =
    currentMilestone === "bronze"
      ? require("../assets/bronzemedal.jpg")
      : currentMilestone === "silver"
      ? require("../assets/silvermedal.jpg")
      : currentMilestone === "gold"
      ? require("../assets/goldmedal.jpg")
      : currentMilestone === "diamond"
      ? require("../assets/diamondmedal.jpg")
      : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleModal} style={styles.imageWrapper}>
        <Image source={{ uri: profileImage }} style={styles.image} />
        {uploadingImage && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        <TouchableOpacity
          style={styles.cameraIcon}
          onPress={toggleImageOptions}
        >
          <Icon name="camera-alt" size={18} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{userData?.full_name || "User"}</Text>
          {milestoneIcon && (
            <Image source={milestoneIcon} style={styles.milestone} />
          )}
        </View>
        <Text style={styles.username}>@{userData?.username || "username"}</Text>
        <Text style={styles.mobile}>{userData?.mobile_number || "Phone"}</Text>
      </View>

      <Modal visible={isModalVisible} transparent onRequestClose={toggleModal}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={toggleModal}
          activeOpacity={1}
        >
          <Image source={{ uri: profileImage }} style={styles.modalImage} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#eee",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 45,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 6,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginRight: 8,
  },
  milestone: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  mobile: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: "#fff",
  },
});

export default ProfileSection;
