import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from '../screens/HomeScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import VideoChatScreen from '../screens/VideoChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MatchingScreen from '../screens/MatchingScreen';
import ChatScreen from '../screens/ChatScreen';
import SupportScreen from '../screens/SupportScreen';
import MarketingScreen from '../screens/MarketingScreen';
import AboutScreen from '../screens/AboutScreen';

// Components
import TabBarIcon from '../components/TabBarIcon';

// Export navigation types for TypeScript
export type RootStackParamList = {
  Main: undefined;
  VideoCall: { roomUrl?: string; roomId?: string };
  VideoChat: { roomUrl?: string; roomId?: string };
  Matching: undefined;
  Chat: { roomId?: string; roomName?: string; participantName?: string; participantId?: string };
  Support: undefined;
  Marketing: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator for main app screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 5,
          paddingBottom: 20,
          height: 85,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <TabBarIcon name="user" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack for all screens
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="VideoCall" 
        component={VideoCallScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen 
        name="VideoChat" 
        component={VideoChatScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen 
        name="Matching" 
        component={MatchingScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="Marketing" 
        component={MarketingScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator - Simplified for demo
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
} 