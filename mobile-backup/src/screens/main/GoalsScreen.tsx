import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchGoals, fetchCategories } from '../../store/slices/goalsSlice';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

type GoalsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Props {
    navigation: GoalsScreenNavigationProp;
}

export default function GoalsScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const { goals, isLoading } = useAppSelector(state => state.goals);

    useEffect(() => {
        dispatch(fetchGoals());
        dispatch(fetchCategories());
    }, [dispatch]);

    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Goals</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateGoal')}
                >
                    <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeGoals.length === 0 && completedGoals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="flag" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Goals Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Create your first goal to start your accountability journey!
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('CreateGoal')}
                        >
                            <Text style={styles.createButtonText}>Create Goal</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {activeGoals.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Active Goals ({activeGoals.length})</Text>
                                {activeGoals.map((goal) => (
                                    <TouchableOpacity
                                        key={goal.id}
                                        style={styles.goalCard}
                                        onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
                                    >
                                        <View style={styles.goalHeader}>
                                            <View style={styles.goalInfo}>
                                                <Text style={styles.goalTitle}>{goal.title}</Text>
                                                <Text style={styles.goalCategory}>
                                                    {goal.category.icon} {goal.category.name}
                                                </Text>
                                            </View>
                                            <View style={styles.goalStats}>
                                                <Text style={styles.streakText}>🔥 {goal.currentStreak}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.goalDescription} numberOfLines={2}>
                                            {goal.description}
                                        </Text>
                                        <View style={styles.goalFooter}>
                                            <Text style={styles.goalDates}>
                                                {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                                            </Text>
                                            <View style={[styles.statusBadge, styles.activeBadge]}>
                                                <Text style={styles.statusText}>Active</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {completedGoals.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Completed Goals ({completedGoals.length})</Text>
                                {completedGoals.map((goal) => (
                                    <TouchableOpacity
                                        key={goal.id}
                                        style={[styles.goalCard, styles.completedCard]}
                                        onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
                                    >
                                        <View style={styles.goalHeader}>
                                            <View style={styles.goalInfo}>
                                                <Text style={styles.goalTitle}>{goal.title}</Text>
                                                <Text style={styles.goalCategory}>
                                                    {goal.category.icon} {goal.category.name}
                                                </Text>
                                            </View>
                                            <View style={styles.goalStats}>
                                                <Text style={styles.streakText}>🏆 {goal.longestStreak}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.goalFooter}>
                                            <Text style={styles.goalDates}>
                                                Completed {new Date(goal.updatedAt).toLocaleDateString()}
                                            </Text>
                                            <View style={[styles.statusBadge, styles.completedBadge]}>
                                                <Text style={styles.statusText}>Completed</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 32,
    },
    createButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    goalCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    completedCard: {
        opacity: 0.8,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    goalCategory: {
        fontSize: 14,
        color: '#666',
    },
    goalStats: {
        alignItems: 'center',
    },
    streakText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    goalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    goalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalDates: {
        fontSize: 12,
        color: '#999',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#e8f5e8',
    },
    completedBadge: {
        backgroundColor: '#e8f0ff',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF',
    },
});
