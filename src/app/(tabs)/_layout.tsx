import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: RospiereColors.primary,
        tabBarInactiveTintColor: RospiereColors.secondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Descubrir',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="auto-stories" size={21} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="libros"
        options={{
          title: 'Libros',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="menu-book" size={21} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="cuestionarios"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="quiz" size={21} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="asistente"
        options={{
          title: 'Compañero',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="psychology" size={22} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(249, 249, 249, 0.96)',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
