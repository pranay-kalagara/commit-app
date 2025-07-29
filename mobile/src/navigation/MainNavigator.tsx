import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import GoalsScreen from '../screens/main/GoalsScreen';
import CheckInScreen from '../screens/main/CheckInScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateGoalScreen from '../screens/main/CreateGoalScreen';
import GoalDetailScreen from '../screens/main/GoalDetailScreen';
import GroupDetailScreen from '../screens/main/GroupDetailScreen';
import CreateGroupScreen from '../screens/main/CreateGroupScreen';

export type MainTabParamList = {
    HomeTab: undefined;
    GoalsTab: undefined;
    CheckInTab: undefined;
    GroupsTab: undefined;
    ProfileTab: undefined;
};

export type MainStackParamList = {
    MainTabs: undefined;
    CreateGoal: undefined;
    GoalDetail: { goalId: string };
    GroupDetail: { groupId: string };
    CreateGroup: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'HomeTab':
                            iconName = 'home';
                            break;
                        case 'GoalsTab':
                            iconName = 'flag';
                            break;
                        case 'CheckInTab':
                            iconName = 'camera-alt';
                            break;
                        case 'GroupsTab':
                            iconName = 'group';
                            break;
                        case 'ProfileTab':
                            iconName = 'person';
                            break;
                        default:
                            iconName = 'help';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen 
                name="GoalsTab" 
                component={GoalsScreen}
                options={{ tabBarLabel: 'Goals' }}
            />
            <Tab.Screen 
                name="CheckInTab" 
                component={CheckInScreen}
                options={{ tabBarLabel: 'Check In' }}
            />
            <Tab.Screen 
                name="GroupsTab" 
                component={GroupsScreen}
                options={{ tabBarLabel: 'Groups' }}
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

export default function MainNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="MainTabs" 
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="CreateGoal" 
                component={CreateGoalScreen}
                options={{ 
                    title: 'Create Goal',
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen 
                name="GoalDetail" 
                component={GoalDetailScreen}
                options={{ 
                    title: 'Goal Details',
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen 
                name="GroupDetail" 
                component={GroupDetailScreen}
                options={{ 
                    title: 'Group Details',
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen 
                name="CreateGroup" 
                component={CreateGroupScreen}
                options={{ 
                    title: 'Create Group',
                    headerBackTitleVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}
