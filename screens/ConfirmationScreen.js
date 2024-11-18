import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Footer from '../components/Footer';

const ConfirmationScreen = ({ route, navigation }) => {
  const { slotDetails, data } = route.params;
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/equipment.jpg')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
          style={styles.gradient}
        />
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Feather name="check-circle" size={60} color="#4CAF50" />
            <Text style={styles.title}>Confirmed!</Text>
            <Text style={styles.subtitle}>Get ready to sweat and achieve your goals.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booking Details</Text>
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={20} color="#34495E" />
              <Text style={styles.detailText}>{slotDetails.gymName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Feather name="map" size={20} color="#34495E" />
              <Text style={styles.detailText}>{slotDetails.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={20} color="#34495E" />
              <Text style={styles.detailText}>{slotDetails.date || slotDetails.bookingDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Feather name="clock" size={20} color="#34495E" />
              <Text style={styles.detailText}>{slotDetails.time || slotDetails.slotStartTime}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("InviteFriendBuddy", {bookingId: data.bookingId, gymName: slotDetails.gymName})}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.buttonGradient}
            >
              <Feather name="users" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Invite Friends</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>
      <View style={styles.footerContainer}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 10,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default ConfirmationScreen;