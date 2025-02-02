import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";

const GymLoader = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/gymloader.json")} // Ensure the file exists
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.loadingText}>Finding the best gyms for you...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
  },
  animation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: 10,
  },
});

export default GymLoader;
