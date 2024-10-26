import * as React from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const Stack = createStackNavigator();

export default function App() {
  const [isSplashVisible, setSplashVisible] = React.useState(true); // Track splash screen visibility

  React.useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Token is", token);
    
    // Store the token in AsyncStorage
    try {
      await AsyncStorage.setItem('expoPushToken', token);
      console.log('Push token stored:', token);
    } catch (error) {
      console.error('Error storing the push token:', error);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false); // Hide the splash screen after 3 seconds
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clear the timer on component unmount
  }, []);

  return (
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
            <Stack.Screen name="VisitedGymScreen" component={VisitedGymScreen} options={{ title: 'Visited Gyms' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
