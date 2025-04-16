import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"

const Header = ({ navigation }) => {
  // Get status bar height based on platform
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

  return (
    <View style={styles.container}>
      {/* Configure the status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Add a spacer for the status bar */}
      <View style={[styles.statusBarSpacer, { height: STATUSBAR_HEIGHT }]} />

      <Text style={styles.title}>Yupluck</Text>

      <Text style={styles.subtitle}>Book gyms, track your fitness, celebrate milestones, and grow with friends.</Text>

      <TouchableOpacity style={styles.profileSection} onPress={() => navigation.navigate("Profile")}>
        <Icon name="user-circle" size={20} color="#43A047" style={styles.profileIcon} />
        <Text style={styles.profileText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    paddingTop: 0, // Remove paddingTop as we'll use the spacer
  },
  statusBarSpacer: {
    width: "100%",
    backgroundColor: "transparent",
  },
  title: {
    color: "#43A047",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12,
    marginTop: 10, // Reduced from 35 since we now have the status bar spacer
  },
  subtitle: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  profileSection: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  profileIcon: {
    marginRight: 8,
  },
  profileText: {
    color: "#43A047",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default Header
