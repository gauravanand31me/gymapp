import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

const StatsSection = ({ userData, totalWorkoutHours, navigation }) => {
  const workoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(workoutAnim, {
      toValue: totalWorkoutHours,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [totalWorkoutHours]);

  return (
    <View style={styles.statsContainer}>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate("InviteFriendBuddy")}
      >
        <FontAwesome5 name="user-friends" size={24} color="#FF9800" style={styles.icon} />
        <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
        <Text style={styles.statText}>Friends</Text>
      </TouchableOpacity>

      <View style={styles.statItem}>
        <MaterialIcons name="fitness-center" size={24} color="#4CAF50" style={styles.icon} />
        <Text style={styles.statValue}>{Math.round(totalWorkoutHours)}</Text>
        <Text style={styles.statText}>Workout Hours</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    width: '40%',
  },
  icon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statText: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default StatsSection;
