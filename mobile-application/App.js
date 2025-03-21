import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen'; // หน้า Login
import HomeScreen from './src/screens/HomeScreen'; // หน้า Home
import AddClass from './src/screens/AddClass'; // หน้า Add Class
import ScanQRCode from './src/screens/ScanQRCode'; // หน้า Scan QR Code
import ClassroomsScreen from './src/screens/ClassroomsScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import ClassroomDetailsScreen from './src/screens/ClassroomDetailsScreen';
import AnswerQuestionScreen from './src/screens/AnswerQuestionScreen';

// สร้าง Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddClass" component={AddClass} />
        <Stack.Screen name="ScanQRCode" component={ScanQRCode} />
        <Stack.Screen name="ClassroomsScreen" component={ClassroomsScreen} />
        <Stack.Screen name="CheckInScreen" component={CheckInScreen} />
        <Stack.Screen name="ClassroomDetails" component={ClassroomDetailsScreen} />
        <Stack.Screen name="AnswerQuestion" component={AnswerQuestionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

