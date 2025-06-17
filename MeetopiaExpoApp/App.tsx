import 'react-native-get-random-values';
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Contexts
import { AuthProvider } from './src/context/AuthContext';
import { VideoCallProvider } from './src/context/VideoCallContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import FeaturesScreen from './src/screens/FeaturesScreen';
import TutorialScreen from './src/screens/TutorialScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Home and its sub-screens
function HomeStack() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Features" component={FeaturesScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for VideoCall and its sub-screens  
function VideoCallStack() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VideoCallMain" component={VideoCallScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
    </Stack.Navigator>
  );
}

// Main tab navigation
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#1f2937',
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffffff',
        },
        headerTintColor: '#ffffff',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          title: 'Meetopia',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="VideoCall" 
        component={VideoCallStack}
        options={{
          title: 'Video Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📹</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VideoCallProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#1f2937" />
            <MainTabs />
          </NavigationContainer>
        </VideoCallProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 