import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import './css/scrollbar-styles.css';
import { ThemeProvider } from './context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: "Joe's Habit Tracker" }}
          />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Habit Calendar' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}