import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProgressBar } from 'react-native-paper';


const MileStoneContainer = ({ workoutTime }) => {
  const milestones = [
    { hours: 50, name: 'Bronze', starColor: '#cd7f32' }, // Bronze color
    { hours: 100, name: 'Silver', starColor: '#c0c0c0' }, // Silver color
    { hours: 150, name: 'Gold', starColor: '#ffd700' }, // Gold color
    { hours: 200, name: 'Pro', starColor: '#4CAF50' }, // Pro color (Green)
    { hours: 250, name: 'Almighty', starColor: '#8b00ff' }, // Almighty color (Purple)
  ];

  const getCurrentMilestone = (workoutHours) => {
    return milestones.find(m => workoutHours < m.hours) || milestones[milestones.length - 1];
  };

  const renderMilestoneProgress = (workoutHours) => {
    const currentMilestone = getCurrentMilestone(workoutHours);
    const progress = workoutHours / currentMilestone.hours;

    return (
      <View style={styles.milestoneContainer}>
        <Text style={styles.milestoneTitle}>Milestone Progress</Text>
        <View style={styles.milestoneTimeline}>
          {milestones.map((milestone, index) => (
            <View key={milestone.hours} style={styles.milestoneStep}>
              <View style={[styles.tag, { backgroundColor: milestone.starColor }]}>
                <Text style={styles.tagText}>{milestone.name}</Text>
              </View>
              <Icon
                name="star"
                size={30}
                color={workoutHours >= milestone.hours ? milestone.starColor : '#ddd'}
              />
              {index < milestones.length - 1 && (
                <View style={styles.milestoneConnector} />
              )}
            </View>
          ))}
        </View>
        <ProgressBar progress={progress} color="#4CAF50" style={styles.milestoneProgressBar} />
        <Text style={styles.milestoneText}>
          {workoutHours} hours out of {currentMilestone.hours} for {currentMilestone.name} Badge
        </Text>
      </View>
    );
  };

  const workoutHours = workoutTime; // Example workout hours, this should be fetched dynamically

  return (
    <View style={styles.container}>

      
      {/* Milestone Progress */}
      {renderMilestoneProgress(workoutHours)}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  milestoneContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 10,
    elevation: 3,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  milestoneTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneStep: {
    alignItems: 'center',
  },
  milestoneConnector: {
    height: 2,
    backgroundColor: '#ddd',
    flex: 1,
    marginHorizontal: 5,
  },
  milestoneProgressBar: {
    height: 8,
    marginTop: 10,
  },
  milestoneText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },
  tag: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default MileStoneContainer;
