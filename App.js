import * as React from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { initializeApp as firebaseInitializeApp } from 'firebase/app';
import * as SplashScreen from 'expo-splash-screen'; // Updated import name

import CustomSplashScreen from './components/SplashScreen'; // Renamed to avoid confusion
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
import VisitedGymScreen from './screens/VisitedGymScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import SearchListScreen from './screens/SearchGymScreen';
import AutocompleteSearchComponent from './components/AutoCompleteInput';
import PaymentFailedScreen from './screens/PaymentFailedScreen';
import { NotificationProvider } from './context/NotificationContext';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isSplashVisible, setSplashVisible] = React.useState(true);
  const appState = React.useRef(AppState.currentState);

  const firebaseConfig = {
    apiKey: "AIzaSyBNB-AqGA4kAErWwpmtjfsxjCjZ2BWpNf4",
    authDomain: "yupluck-b30f0.firebasestorage.app",
    projectId: "yupluck-b30f0",
    storageBucket: "yupluck-b30f0.firebasestorage.app",
    messagingSenderId: "284884578210",
    appId: "1:284884578210:android:871427ecf49fa13d6b8cfb"
  };

  const isFirstInstall = async () => {
    try {
      const hasRunBefore = await AsyncStorage.getItem('hasRunBefore');
      if (hasRunBefore === null) {
        await AsyncStorage.setItem('hasRunBefore', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking first install:', error);
      return false;
    }
  };


  const checkAuthentication = async () => {
    try {
      const isNewInstall = await isFirstInstall();
      if (isNewInstall) {
        // If it's a new install, clear any existing auth token
        await AsyncStorage.removeItem('authToken');
        return false;
      }
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };

  const initializeApplication = async () => {
    try {

      const app = firebaseInitializeApp(firebaseConfig);
      if (app) {
        console.log('Firebase initialized successfully!');
        await registerForPushNotificationsAsync();
      } else {
        throw new Error('Firebase initialization failed!');
      }
      const authStatus = await checkAuthentication();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error('Error during app initialization:', error);
    } finally {
      setIsLoading(false);
      // Hide the system splash screen
      await SplashScreen.hideAsync();
      // Show custom splash for exactly 2 seconds
      setSplashVisible(true);
      setTimeout(() => {
        setSplashVisible(false);
      }, 1000);
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
        console.log('Push notification permission not granted.');
        return;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: "5c0cf145-3b66-4a09-a5aa-0b76f76d6260"
      });

      if (token) {
        await AsyncStorage.setItem('expoPushToken', token);
        console.log('Expo Push Token:', token);
      } else {
        console.log('Failed to generate push notification token.');
      }
    } catch (error) {
      console.error('Error during push notification setup:', error);
    }
  };

  const handleAppStateChange = async (nextAppState) => {
    if (appState.current === 'background' && nextAppState === 'active') {
      const backgroundTime = await AsyncStorage.getItem('backgroundTime');
      const isReturningFromBrowser = await AsyncStorage.getItem('isReturningFromBrowser');
      
      if (backgroundTime && isReturningFromBrowser !== 'true') {
        const timeDiff = Date.now() - parseInt(backgroundTime);
        if (timeDiff > 2 * 60 * 1000) { // More than 2 minutes
          setSplashVisible(true);
          setTimeout(async () => {
            const authStatus = await checkAuthentication();
            setIsAuthenticated(authStatus);
            setSplashVisible(false);
          }, 1000); // Show splash for 2 seconds when returning from background
        }
      }
      
      await AsyncStorage.removeItem('backgroundTime');
      await AsyncStorage.setItem('isReturningFromBrowser', 'false');
    } else if (nextAppState === 'background') {
      await AsyncStorage.setItem('backgroundTime', Date.now().toString());
    }
    
    appState.current = nextAppState;
  };

  React.useEffect(() => {
    initializeApplication();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (isLoading || isSplashVisible) {
    return <CustomSplashScreen />;
  }

  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "GymList" : "Login"}
          screenOptions={{ headerShown: false }}
        >
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
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
}

