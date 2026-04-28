import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Text } from 'react-native'
import HomeScreen from '../screens/HomeScreen'
import GameDetailScreen from '../screens/GameDetailScreen'
import SearchResultsScreen from '../screens/SearchResultsScreen'
import CartScreen from '../screens/CartScreen'
import ProfileScreen from '../screens/ProfileScreen'
import type { Game } from '../types/games'

export type RootStackParams = {
  MainTabs: undefined
  GameDetail: { game: Game }
  SearchResults: { query: string }
}

export type TabParams = {
  Home: undefined
  Cart: { cartCount: number }
  Profile: undefined
}

const Stack = createStackNavigator<RootStackParams>()
const Tab = createBottomTabNavigator<TabParams>()

const TAB_ICON: Record<string, string> = {
  Home: '🏠',
  Cart: '🛒',
  Profile: '👤',
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {TAB_ICON[name]}
    </Text>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1b1b1b',
          borderTopColor: '#2d2d2d',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Carrito' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  )
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="GameDetail"
          component={GameDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{ presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
