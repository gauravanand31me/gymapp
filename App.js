import * as React from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app'; // Firebase for non-messaging purposes

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import GymListScreen from './screens/GymListScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import GymDetailScreen from './screens/GymDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import InviteBuddiesScreen from './screens/InviteBuddiesScreen';
import AmenitiesListScreen from './screens/AmenitiesListScreen';
import NotificationListScreen from './screens/NotificationListScreen';
import WorkoutInvitation from './screens/WorkoutInvitation';
import WorkoutRequest from './screens/WorkoutRequest';
import MyBookings from './screens/MyBookings';
import SlotSelectionScreen from './screens/SlotSelectionScreen';
import PaymentScreen from './screens/PaymentConfirm';
import ConfirmationScreen from './screens/ConfirmationScreen';
import InviteFriendBuddiesScreen from './screens/InviteFriendsBuddies';
import SettingsScreen from './screens/SettingsScreen';
import SplashScreen from './components/SplashScreen';
import VisitedGymScreen from './screens/VisitedGymScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import SearchListScreen from './screens/SearchGymScreen';
import AutocompleteSearchComponent from './components/AutoCompleteInput';
import PaymentFailedScreen from './screens/PaymentFailedScreen';
import { NotificationProvider } from './context/NotificationContext';

const Stack = createStackNavigator();

export default function App() {
  const [isSplashVisible, setSplashVisible] = React.useState(true); // Track splash screen visibility
  const [notificationError, setNotificationError] = React.useState("");
  const appState = React.useRef(AppState.currentState); // Track current app state
  const [inactiveTimer, setInactiveTimer] = React.useState(null);

  React.useEffect(() => {
    registerForPushNotificationsAsync();
    initializeFirebase();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false); // Hide the splash screen after 3 seconds
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, []);

  // App State Listener for Inactivity
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove(); // Clean up listener
      clearInactivityTimer(); // Clear timer on unmount
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      clearInactivityTimer();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      startInactivityTimer();
    }
    appState.current = nextAppState;
  };

  const startInactivityTimer = () => {
    if (inactiveTimer) clearTimeout(inactiveTimer);

    const timer = setTimeout(() => {
      Alert.alert(
        'Session Expired',
        'You were inactive for 2 minutes. Restarting the app.',
        [{ text: 'OK', onPress: () => restartApp() }]
      );
    }, 2 * 60 * 1000);

    setInactiveTimer(timer);
  };

  const clearInactivityTimer = () => {
    if (inactiveTimer) clearTimeout(inactiveTimer);
    setInactiveTimer(null);
  };

  const restartApp = () => {
    setSplashVisible(true);
    setInactiveTimer(null);
    appState.current = 'active';
  };

  const initializeFirebase = async () => {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyBNB-AqGA4kAErWwpmtjfsxjCjZ2BWpNf4",
        authDomain: "yupluck-b30f0.firebasestorage.app",
        projectId: "yupluck-b30f0",
        storageBucket: "yupluck-b30f0.firebasestorage.app",
        messagingSenderId: "284884578210",
        appId: "1:284884578210:android:871427ecf49fa13d6b8cfb"
      };

      const app = initializeApp(firebaseConfig);
      if (!app) throw new Error('Firebase initialization failed!');
      console.log('Firebase initialized successfully!');
    } catch (error) {
      console.error('Error initializing Firebase:', error.message);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setNotificationError('Push notification permission not granted.');
        return;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: "de28077c-3982-44ff-8d62-6e1125668220"
      });

      if (!token) {
        setNotificationError('Failed to generate push notification token.');
        return;
      }

      await AsyncStorage.setItem('expoPushToken', token);
      console.log('Expo Push Token:', token);
    } catch (error) {
      setNotificationError(`Error during push notification setup: ${error.message}`);
    }
  };

  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          {isSplashVisible ? (
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="GymList" component={GymListScreen} />
              <Stack.Screen name="ConfirmationScreen" component={ConfirmationScreen} />
              <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
              <Stack.Screen name="GymDetails" component={GymDetailScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="InviteBuddy" component={InviteBuddiesScreen} />
              <Stack.Screen name="AmenitiesListScreen" component={AmenitiesListScreen} />
              <Stack.Screen name="NotificationListScreen" component={NotificationListScreen} />
              <Stack.Screen name="WorkoutInvitation" component={WorkoutInvitation} />
              <Stack.Screen name="WorkoutRequest" component={WorkoutRequest} />
              <Stack.Screen name="MyBookings" component={MyBookings} />
              <Stack.Screen name="SlotSelectionScreen" component={SlotSelectionScreen} />
              <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
              <Stack.Screen name="InviteFriendBuddy" component={InviteFriendBuddiesScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="UserProfile" component={UserProfileScreen} />
              <Stack.Screen name="SearchGym" component={AutocompleteSearchComponent} />
              <Stack.Screen name="SearchGymList" component={SearchListScreen} />
              <Stack.Screen name="SlotSelection" component={SlotSelectionScreen} />
              <Stack.Screen name="PaymentFailed" component={PaymentFailedScreen} />
              <Stack.Screen name="VisitedGymScreen" component={VisitedGymScreen} options={{ title: 'Visited Gyms' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
}
