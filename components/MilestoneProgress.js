import { View, Text, Image, Animated } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useEffect, useRef, useState } from 'react';

const MilestoneProgress = ({ progress, hoursToNextMilestone, nextMilestone }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    if (hoursToNextMilestone <= 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [progress]);

  return (
    <View style={styles.milestoneContainer}>
      <Text style={styles.sectionTitle}>🎯 Milestone Progress</Text>

      <View style={styles.milestoneIcons}>
        <Image source={require('../assets/bronzemedal.jpg')} style={[styles.milestoneIcon, progress >= 0.25 && styles.glow]} />
        <Image source={require('../assets/silvermedal.jpg')} style={[styles.milestoneIcon, progress >= 0.5 && styles.glow]} />
        <Image source={require('../assets/goldmedal.jpg')} style={[styles.milestoneIcon, progress >= 0.75 && styles.glow]} />
        <Image source={require('../assets/diamondmedal.jpg')} style={[styles.milestoneIcon, progress >= 1 && styles.glow]} />
      </View>

      <Animated.View>
        <ProgressBar
          progress={progress}
          width={null}
          height={12}
          color="#FFD700"
          unfilledColor="#E0E0E0"
          borderColor="transparent"
          style={styles.progressBar}
        />
      </Animated.View>

      <Text style={styles.milestoneText}>
        {hoursToNextMilestone > 0
          ? `⏳ ${Math.floor(hoursToNextMilestone)} hours away from earning ${nextMilestone}! Keep going! 🚀`
          : `🎉 Congratulations! You've reached the ${nextMilestone} milestone! 🏆`}
      </Text>

      {showConfetti && <ConfettiCannon count={100} origin={{ x: 180, y: 0 }} />}
    </View>
  );
};

const styles = {
  milestoneContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  milestoneIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 50,
    height: 50,
    opacity: 0.5,
  },
  glow: {
    opacity: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  progressBar: {
    marginTop: 10,
    height: 10,
    borderRadius: 10,
  },
  milestoneText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default MilestoneProgress;
