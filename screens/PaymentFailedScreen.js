import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PaymentFailedScreen() {
  const navigation = useNavigation();

  const handleRetry = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={80} color="#FFF" />
          </View>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.message}>
            Oops! Something went wrong with your payment. Please try again or contact support if the issue persists.
          </Text>
          <Image 
            source={require('../assets/paymentFailed.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <RefreshCw size={24} color="#FF6B6B" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  image: {
    width: width * 0.7,
    height: width * 0.5,
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  supportButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  supportButtonText: {
    color: '#FFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});