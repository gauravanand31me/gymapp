import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getLeaderBoard } from '../api/apiService';

const EmptyFriendsContainer = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await getLeaderBoard();
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "#0044CC"; // Default blue
  };

  return (
    <View style={styles.container}>
      <Text style={styles.leaderboardTitle}>🏆 Gym Leaderboard 🏆</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0044CC" />
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { width: '15%' }]}>Rank</Text>
            <Text style={[styles.headerText, { width: '50%' }]}>Username</Text>
            <Text style={[styles.headerText, { width: '35%', textAlign: 'right' }]}>Workout Time</Text>
          </View>

          <FlatList
            data={leaderboard}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={[styles.tableRow, index < 3 && styles.topThree]} 
                onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
              >
                <Text style={[styles.cellText, { width: '15%', color: getMedalColor(index + 1) }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.cellText, { width: '50%', color: "#333" }]}>{item.username}</Text>
                <Text style={[styles.cellText, { width: '35%', textAlign: 'right', color: '#28A745' }]}>
                  {(item.total_work_out_time / 60).toFixed(1)} hr
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  leaderboardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0044CC',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  tableContainer: {
    width: '90%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAF2FF',
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0044CC',
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#FFF',
  },
  topThree: {
    backgroundColor: '#FAFAFA',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
  },
});

export default EmptyFriendsContainer;