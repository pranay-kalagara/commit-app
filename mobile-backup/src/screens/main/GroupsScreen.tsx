import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUserGroups, fetchPublicGroups } from '../../store/slices/groupsSlice';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

type GroupsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Props {
    navigation: GroupsScreenNavigationProp;
}

export default function GroupsScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const { groups, publicGroups, isLoading } = useAppSelector(state => state.groups);

    useEffect(() => {
        dispatch(fetchUserGroups());
        dispatch(fetchPublicGroups());
    }, [dispatch]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Groups</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateGroup')}
                >
                    <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {groups.length === 0 && publicGroups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="group" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Groups Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Join or create a group to add accountability to your goals!
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('CreateGroup')}
                        >
                            <Text style={styles.createButtonText}>Create Group</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {groups.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>My Groups ({groups.length})</Text>
                                {groups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={styles.groupCard}
                                        onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                                    >
                                        <View style={styles.groupHeader}>
                                            <View style={styles.groupInfo}>
                                                <Text style={styles.groupName}>{group.name}</Text>
                                                <Text style={styles.groupDescription} numberOfLines={2}>
                                                    {group.description}
                                                </Text>
                                            </View>
                                            <View style={styles.groupStats}>
                                                <Icon name="group" size={20} color="#666" />
                                                <Text style={styles.memberCount}>{group.memberCount}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.groupFooter}>
                                            <Text style={styles.groupDate}>
                                                Joined {new Date(group.createdAt).toLocaleDateString()}
                                            </Text>
                                            <View style={[styles.statusBadge, group.isPrivate ? styles.privateBadge : styles.publicBadge]}>
                                                <Text style={styles.statusText}>
                                                    {group.isPrivate ? 'Private' : 'Public'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {publicGroups.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Discover Groups</Text>
                                {publicGroups.slice(0, 5).map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={styles.groupCard}
                                        onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                                    >
                                        <View style={styles.groupHeader}>
                                            <View style={styles.groupInfo}>
                                                <Text style={styles.groupName}>{group.name}</Text>
                                                <Text style={styles.groupDescription} numberOfLines={2}>
                                                    {group.description}
                                                </Text>
                                            </View>
                                            <View style={styles.groupStats}>
                                                <Icon name="group" size={20} color="#666" />
                                                <Text style={styles.memberCount}>{group.memberCount}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.groupFooter}>
                                            <Text style={styles.groupDate}>
                                                Created {new Date(group.createdAt).toLocaleDateString()}
                                            </Text>
                                            <TouchableOpacity style={styles.joinButton}>
                                                <Text style={styles.joinButtonText}>Join</Text>
                                            </TouchableOpacity>
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
    groupCard: {
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
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    groupInfo: {
        flex: 1,
        marginRight: 12,
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    groupDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    groupStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    groupFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    groupDate: {
        fontSize: 12,
        color: '#999',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    privateBadge: {
        backgroundColor: '#ffe8e8',
    },
    publicBadge: {
        backgroundColor: '#e8f5e8',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF',
    },
    joinButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
