import React from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, BarChart3, Link2, User, Ear } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size} color={color} />
          ),
          headerTitle: 'ShortyPro',
        }}
      />
      <Tabs.Screen
        name="listening"
        options={{
          tabBarLabel: 'Listening',
          title: 'Listening',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ear size={size} color={color} />
          ),
          headerTitle: 'Social Listening',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: 'Analytics',
          title: 'Analytics',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <BarChart3 size={size} color={color} />
          ),
          headerTitle: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          tabBarLabel: 'Connect',
          title: 'Connect',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Link2 size={size} color={color} />
          ),
          headerTitle: 'Connect Accounts',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User size={size} color={color} />
          ),
          headerTitle: 'Profile',
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
