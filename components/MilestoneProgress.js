import { View, Text, Image, Animated, StyleSheet } from 'react-native';
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
      <Text style={styles.sectionTitle}>🎯 Your Milestone Journey</Text>

      <View style={styles.milestoneIcons}>
        <Image source={require('../assets/bronzemedal.jpg')} style={[styles.milestoneIcon, progress >= 0.25 && styles.glow]} />
        <Image source={require('../assets/silvermedal.jpg')} style={[styles.milestoneIcon, progress >= 0.5 && styles.glow]} />
        <Image source={require('../assets/goldmedal.jpg')} style={[styles.milestoneIcon, progress >= 0.75 && styles.glow]} />
        <Image source={require('../assets/diamondmedal.jpg')} style={[styles.milestoneIcon, progress >= 1 && styles.glow]} />
      </View>

      <Animated.View style={styles.animatedProgressWrapper}>
        <ProgressBar
          progress={progress}
          width={null}
          height={14}
          color="#FFC107"
          unfilledColor="#f0f0f0"
          borderColor="transparent"
          style={styles.progressBar}
        />
      </Animated.View>

      <Text style={styles.milestoneText}>
        {hoursToNextMilestone > 0
          ? `⏳ ${Math.floor(hoursToNextMilestone)} hrs to ${nextMilestone} milestone. Push your limits! 💪`
          : `🎉 Congrats! You hit the ${nextMilestone} milestone! 🔥`}
      </Text>

      {showConfetti && <ConfettiCannon count={120} origin={{ x: 200, y: -10 }} fadeOut={true} explosionSpeed={300} fallSpeed={2500} />} 
    </View>
  );
};

const styles = StyleSheet.create({
  milestoneContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
    marginBottom: 14,
  },
  milestoneIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 5,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    opacity: 0.4,
  },
  glow: {
    opacity: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  animatedProgressWrapper: {
    paddingHorizontal: 4,
  },
  progressBar: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 14,
  },
  milestoneText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
    marginTop: 14,
    fontWeight: '600',
  },
});

export default MilestoneProgress;