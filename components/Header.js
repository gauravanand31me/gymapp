import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from "react-native";
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
          <TouchableOpacity onPress={() => navigation.navigate("InviteBuddy")}>
            <Text style={styles.linkText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{ marginLeft: 12 }}>
            <Icon name="user-circle" size={24} color="#43A047" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#43A047",
    fontSize: 20,
    fontWeight: "bold",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Header;
