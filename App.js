import * as React from 'react';
import * as Notifications from 'expo-notifications';
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
  React.useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);


  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // React.useEffect(() => {
  //   const subscription = Notifications.addNotificationReceivedListener(notification => {
  //     console.log("Notification received:", notification);
  //   });

  //   const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log("Notification tapped:", response);
  //   });

  //   return () => {
  //     subscription.remove();
  //     responseSubscription.remove();
  //   };
  // }, []);



  const firebaseConfig = {
    apiKey: "AIzaSyBNB-AqGA4kAErWwpmtjfsxjCjZ2BWpNf4",
    authDomain: "yupluck-b30f0.firebasestorage.app",
    projectId: "yupluck-b30f0",
    storageBucket: "yupluck-b30f0.firebasestorage.app",
    messagingSenderId: "284884578210",
    appId: "1:284884578210:android:871427ecf49fa13d6b8cfb"
  };

  React.useEffect(() => {

    const initializeAndRegister = async () => {
      try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        console.log("App received", app);

        // Check if Firebase app initialized correctly
        if (app) {
          console.log('Firebase initialized successfully!');
          // Register for push notifications after Firebase initialization
          await registerForPushNotificationsAsync();
        } else {
          throw new Error('Firebase initialization failed!');
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Call the async function
    initializeAndRegister();
  }, []); // This will run once after the first render


  const registerForPushNotificationsAsync = async () => {
    try {
      // Check for existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If not granted, request permission
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permission is not granted, show error and return
      if (finalStatus !== 'granted') {
        setNotificationError('Push notification permission not granted.');
        Alert.alert('Permission Error', 'Failed to get push token for push notification!');
        return;
      }

      // Get the Expo push token (not Firebase Messaging token)
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: "5c0cf145-3b66-4a09-a5aa-0b76f76d6260" // Your Expo project ID
      });

      // If no token is generated, handle the error
      if (!token) {
        setNotificationError('Failed to generate push notification token.');
        return;
      }

      // Store the push token locally using AsyncStorage
      await AsyncStorage.setItem('expoPushToken', token);

      // Set the token in state and display success
      setNotificationError(`Push token generated: ${token}`);
      console.log('Expo Push Token:', token);

    } catch (error) {
      setNotificationError(`Error during push notification setup: ${error.message}`);
      console.error(error);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false); // Hide the splash screen after 3 seconds
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, []);

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