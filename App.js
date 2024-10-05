import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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

      </Stack.Navigator>
    </NavigationContainer>
  );
}
