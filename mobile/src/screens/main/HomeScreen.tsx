import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { fetchCheckIns } from '../../store/slices/checkInsSlice';
import { logoutUser } from '../../store/slices/authSlice';

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { goals } = useAppSelector(state => state.goals);
    const { checkIns } = useAppSelector(state => state.checkIns);

    useEffect(() => {
        dispatch(fetchGoals());
        dispatch(fetchCheckIns());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const activeGoals = goals.filter(goal => goal.status === 'active');
    const todayCheckIns = checkIns.filter(checkIn => {
        const today = new Date().toISOString().split('T')[0];
        const checkInDate = new Date(checkIn.checkInDate).toISOString().split('T')[0];
        return checkInDate === today;
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Welcome back, {user?.firstName || user?.username}! 👋
                    </Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{activeGoals.length}</Text>
                        <Text style={styles.statLabel}>Active Goals</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{todayCheckIns.length}</Text>
                        <Text style={styles.statLabel}>Today's Check-ins</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {Math.max(...goals.map(g => g.currentStreak), 0)}
                        </Text>
                        <Text style={styles.statLabel}>Best Streak</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {checkIns.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No check-ins yet</Text>
                            <Text style={styles.emptySubtext}>Start by creating a goal and checking in daily!</Text>
                        </View>
                    ) : (
                        checkIns.slice(0, 5).map((checkIn) => (
                            <View key={checkIn.id} style={styles.activityItem}>
                                <Text style={styles.activityTitle}>{checkIn.goal.title}</Text>
                                <Text style={styles.activityDescription}>{checkIn.description}</Text>
                                <Text style={styles.activityDate}>
                                    {new Date(checkIn.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Goals</Text>
                    {activeGoals.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No active goals</Text>
                            <Text style={styles.emptySubtext}>Create your first goal to get started!</Text>
                        </View>
                    ) : (
                        activeGoals.slice(0, 3).map((goal) => (
                            <View key={goal.id} style={styles.goalItem}>
                                <Text style={styles.goalTitle}>{goal.title}</Text>
                                <Text style={styles.goalCategory}>{goal.category.name} {goal.category.icon}</Text>
                                <Text style={styles.goalStreak}>🔥 {goal.currentStreak} day streak</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#ff4444',
        borderRadius: 6,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    emptyState: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    activityItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    activityDate: {
        fontSize: 12,
        color: '#999',
    },
    goalItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    goalCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    goalStreak: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});
