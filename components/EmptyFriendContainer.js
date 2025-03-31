import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getLeaderBoard } from '../api/apiService';

const EmptyFriendsContainer = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return "#FFF"; // Default white
  };

  return (
    <View style={styles.container}>
      <Text style={styles.leaderboardTitle}>🏆 Gym Leaderboard 🏆</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
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
              <View style={[styles.tableRow, index < 3 && styles.topThree]}>
                <Text style={[styles.cellText, { width: '15%', color: getMedalColor(index + 1) }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.cellText, { width: '50%' }]}>{item.username}</Text>
                <Text style={[styles.cellText, { width: '35%', textAlign: 'right', color: '#66BB6A' }]}>
                  {item.total_work_out_time / 60} hr
                </Text>
              </View>
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
    backgroundColor: '#121212',
  },
  leaderboardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  tableContainer: {
    width: '90%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  topThree: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  cellText: {
    fontSize: 13,
    color: '#FFF',
  },
});

export default EmptyFriendsContainer;
