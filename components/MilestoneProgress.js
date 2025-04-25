import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const MilestoneProgress = ({ progress, hoursToNextMilestone, nextMilestone }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (hoursToNextMilestone <= 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [hoursToNextMilestone]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {hoursToNextMilestone > 0
          ? `⏳ ${Math.floor(hoursToNextMilestone)} hrs to ${nextMilestone} milestone`
          : `🎉 Congrats! You reached ${nextMilestone}!`}
      </Text>

      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: 200, y: -10 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={2400}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default MilestoneProgress;
