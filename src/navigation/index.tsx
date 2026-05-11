import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import GameDetailScreen from '../screens/GameDetailScreen'
import SearchResultsScreen from '../screens/SearchResultsScreen'
import CartScreen from '../screens/CartScreen'
import ProfileScreen from '../screens/ProfileScreen'
import LibraryScreen from '../screens/LibraryScreen'
import type { Game } from '@shared/types/games'

export type RootStackParams = {
  MainTabs: undefined
  GameDetail: { game: Game }
  SearchResults: { query: string }
}

export type TabParams = {
  Home: undefined
  Cart: { cartCount: number }
  Library: undefined
  Profile: undefined
}

const Stack = createStackNavigator<RootStackParams>()
const Tab = createBottomTabNavigator<TabParams>()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICON: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home:    { active: 'home',         inactive: 'home-outline' },
  Cart:    { active: 'bag',          inactive: 'bag-outline' },
  Library: { active: 'library',      inactive: 'library-outline' },
  Profile: { active: 'person',       inactive: 'person-outline' },
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#07070f',
          borderTopColor: '#14142a',
        },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICON[route.name]
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Carrito' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Biblioteca' }} />
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
