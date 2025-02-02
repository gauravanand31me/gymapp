import React, { useState, useEffect } from "react";
import LottieView from "lottie-react-native";

import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";

export default function LocationPermissionModal({ isVisible, onPermissionGranted }) {
    const [modalVisible, setModalVisible] = useState(isVisible);
  
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
  
      if (status === "granted") {
        setModalVisible(false); // Close modal after permission is granted
        onPermissionGranted(); // Callback function to continue the app flow
      } else {
        setModalVisible(true); // Keep the modal open if permission is denied
      }
    };
  
    return (
      <Modal transparent visible={modalVisible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LottieView
                 source={require("../assets/location-pin.json")} // Ensure the file exists
                 autoPlay
                 loop
                 style={styles.animation}
               />

          {/* Title */}
          <Text style={styles.title}>Location permission is off</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Please enable location permission for better gym experience.
          </Text>

          {/* Continue Button */}
          <TouchableOpacity style={styles.button} onPress={requestLocationPermission}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
        justifyContent: "center",
        alignItems: "center",
      },
      modalContent: {
        backgroundColor: "#fff",
        width: "85%",
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
        height: 350, // Increased height
        justifyContent: "center", // Centers content
      },
      animation: {
        width: 150, // Adjust width
        height: 150, // Adjust height
        marginBottom: 20, // Add spacing
      },
  image: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#FF3B5C",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

