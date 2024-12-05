import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Android full screen green.jpg')} // Your splash screen image
        style={styles.splashImage}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Full screen white background
  },
  splashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Adjust the image to cover the full screen
  },
});

export default SplashScreen;
