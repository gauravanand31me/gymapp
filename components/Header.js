import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const Header = ({ navigation }) => {
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />
      <View style={{ height: STATUSBAR_HEIGHT }} />

      <View style={styles.headerContent}>
        <Text style={styles.title}>Yupluck</Text>

        <View style={styles.rightActions}>
          {/* Search Friends (Leaderboard) */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate("InviteBuddy")}
          >
            <Icon name="search" size={18} color="#388E3C" />
            <Text style={styles.searchLabel}>Search Friends</Text>
          </TouchableOpacity>

          {/* Profile Icon */}
          <TouchableOpacity
            style={[styles.actionButton, { marginLeft: 16 }]}
            onPress={() => navigation.navigate("Profile")}
          >
            <Icon name="user-circle" size={26} color="#388E3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#2E7D32",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  searchLabel: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default Header;
