import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;

export default function EmptyFeedMessage() {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../assets/yupluck-hero.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <ActivityIndicator size="large" color="#0044CC" style={styles.loader} />

      <Text style={styles.loadingText}>Your feed is loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight * 0.4,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFF',
  },
  image: {
    width: 180,
    height: 140,
    marginBottom: 25,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0044CC',
    textAlign: 'center',
  },
});
