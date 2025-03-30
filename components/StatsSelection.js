import { View, Text, TouchableOpacity, Animated } from 'react-native';
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
        style={[styles.statItem, styles.statCard]}
        onPress={() => navigation.navigate("InviteFriendBuddy")}
      >
        <FontAwesome5 name="user-friends" size={30} color="#FF9800" />
        <Text style={styles.statValue}>{userData?.followers_count || 0}</Text>
        <Text style={styles.statText}>Friends</Text>
      </TouchableOpacity>

      <View style={[styles.statItem, styles.statCard]}>
        <MaterialIcons name="fitness-center" size={30} color="#4CAF50" />
        <Animated.Text style={styles.statValue}>
          {workoutAnim.interpolate({
            inputRange: [0, totalWorkoutHours],
            outputRange: [`0 hrs`, `${Math.round(totalWorkoutHours)} hrs`], // Ensuring same format
          })}
        </Animated.Text>
        <Text style={styles.statText}>Workout Time</Text>
      </View>
    </View>
  );
};

const styles = {
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    padding: 15,
    width: 140,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 5,
  },
  statCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
};

export default StatsSection;
