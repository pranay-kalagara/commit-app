import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { goals } = useAppSelector(state => state.goals);
    const { checkIns } = useAppSelector(state => state.checkIns);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser()) },
            ]
        );
    };

    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const totalStreak = Math.max(...goals.map(g => g.currentStreak), 0);
    const bestStreak = Math.max(...goals.map(g => g.longestStreak), 0);

    const stats = [
        { label: 'Active Goals', value: activeGoals.length, icon: 'flag' },
        { label: 'Completed Goals', value: completedGoals.length, icon: 'check-circle' },
        { label: 'Total Check-ins', value: checkIns.length, icon: 'camera-alt' },
        { label: 'Current Streak', value: totalStreak, icon: 'local-fire-department' },
        { label: 'Best Streak', value: bestStreak, icon: 'star' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="logout" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>
                        {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user?.username || 'User'
                        }
                    </Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    {user?.bio && (
                        <Text style={styles.userBio}>{user.bio}</Text>
                    )}
                </View>

                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Your Stats</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <Icon name={stat.icon} size={24} color="#007AFF" />
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.achievementsSection}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    <View style={styles.achievementsList}>
                        {bestStreak >= 7 && (
                            <View style={styles.achievementItem}>
                                <Text style={styles.achievementEmoji}>🔥</Text>
                                <View style={styles.achievementInfo}>
                                    <Text style={styles.achievementTitle}>Week Warrior</Text>
                                    <Text style={styles.achievementDescription}>Maintained a 7-day streak</Text>
                                </View>
                            </View>
                        )}
                        {completedGoals.length > 0 && (
                            <View style={styles.achievementItem}>
                                <Text style={styles.achievementEmoji}>🏆</Text>
                                <View style={styles.achievementInfo}>
                                    <Text style={styles.achievementTitle}>Goal Crusher</Text>
                                    <Text style={styles.achievementDescription}>Completed your first goal</Text>
                                </View>
                            </View>
                        )}
                        {checkIns.length >= 10 && (
                            <View style={styles.achievementItem}>
                                <Text style={styles.achievementEmoji}>📸</Text>
                                <View style={styles.achievementInfo}>
                                    <Text style={styles.achievementTitle}>Consistent Checker</Text>
                                    <Text style={styles.achievementDescription}>Made 10+ check-ins</Text>
                                </View>
                            </View>
                        )}
                        {bestStreak >= 30 && (
                            <View style={styles.achievementItem}>
                                <Text style={styles.achievementEmoji}>💎</Text>
                                <View style={styles.achievementInfo}>
                                    <Text style={styles.achievementTitle}>Diamond Dedication</Text>
                                    <Text style={styles.achievementDescription}>Maintained a 30-day streak</Text>
                                </View>
                            </View>
                        )}
                        {stats.every(stat => stat.value === 0) && (
                            <View style={styles.emptyAchievements}>
                                <Text style={styles.emptyText}>No achievements yet</Text>
                                <Text style={styles.emptySubtext}>Start creating goals and checking in to earn achievements!</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="edit" size={20} color="#666" />
                        <Text style={styles.settingText}>Edit Profile</Text>
                        <Icon name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="notifications" size={20} color="#666" />
                        <Text style={styles.settingText}>Notifications</Text>
                        <Icon name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="privacy-tip" size={20} color="#666" />
                        <Text style={styles.settingText}>Privacy</Text>
                        <Icon name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <Icon name="help" size={20} color="#666" />
                        <Text style={styles.settingText}>Help & Support</Text>
                        <Icon name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButtonFull} onPress={handleLogout}>
                    <Icon name="logout" size={20} color="#fff" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
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
    logoutButton: {
        padding: 8,
    },
    scrollContent: {
        padding: 16,
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    userBio: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    statsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '48%',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    achievementsSection: {
        marginBottom: 16,
    },
    achievementsList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    achievementEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    achievementDescription: {
        fontSize: 14,
        color: '#666',
    },
    emptyAchievements: {
        alignItems: 'center',
        paddingVertical: 24,
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
    settingsSection: {
        marginBottom: 24,
    },
    settingItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    logoutButtonFull: {
        backgroundColor: '#ff4444',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
