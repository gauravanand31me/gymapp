import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getLeaderBoard } from '../api/apiService';

const EmptyFriendsContainer = ({leaderboard}) => {
  console.log("leaderboard", leaderboard);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#0044CC';
  };

  const renderItem = ({ item, index }) => {
    const rank = index + 1;
    const backgroundColor = rank <= 3 ? '#F4F8FF' : '#FFF';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor }]}
        onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
      >
        <Text style={[styles.rank, { color: getMedalColor(rank) }]}>{rank}</Text>
        <Image
          source={{
            uri: item.profile_pic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.profilePic}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.workoutTime}>
            🕒 {(item.total_work_out_time / 60).toFixed(1)} hrs
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0044CC" />
      ) : (
        <View style={styles.innerContainer}>
          <FlatList
            data={leaderboard}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Text style={styles.leaderboardTitle}>🏆 Gym Leaderboard 🏆</Text>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF2FF',
  },
  innerContainer: {
    flex: 1, // ✨ This ensures FlatList gets full height
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0044CC',
    marginVertical: 15,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: '#FFF',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  profilePic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginHorizontal: 10,
    backgroundColor: '#DDD',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutTime: {
    fontSize: 13,
    color: '#28A745',
    marginTop: 2,
  },
});

export default EmptyFriendsContainer;
