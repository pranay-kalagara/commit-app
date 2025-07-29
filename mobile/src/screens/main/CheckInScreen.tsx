import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { createCheckIn } from '../../store/slices/checkInsSlice';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CheckInScreen() {
    const [selectedGoal, setSelectedGoal] = useState<string>('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useAppDispatch();
    const { goals } = useAppSelector(state => state.goals);

    useEffect(() => {
        dispatch(fetchGoals());
    }, [dispatch]);

    const activeGoals = goals.filter(goal => goal.status === 'active');

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!selectedGoal) {
            Alert.alert('Error', 'Please select a goal');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please add a description');
            return;
        }

        if (!imageUri) {
            Alert.alert('Error', 'Please add a photo as proof');
            return;
        }

        setIsSubmitting(true);

        try {
            // In a real app, you would upload the image to a server first
            // For now, we'll use a placeholder URL
            await dispatch(createCheckIn({
                goalId: selectedGoal,
                description: description.trim(),
                imageUrl: 'https://via.placeholder.com/400x300?text=Check-in+Proof',
            })).unwrap();

            Alert.alert('Success', 'Check-in submitted successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setSelectedGoal('');
                        setDescription('');
                        setImageUri('');
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit check-in');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedGoalData = goals.find(goal => goal.id === selectedGoal);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Daily Check-In</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeGoals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="flag" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Active Goals</Text>
                        <Text style={styles.emptySubtitle}>
                            Create a goal first to start checking in!
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Goal</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsList}>
                                {activeGoals.map((goal) => (
                                    <TouchableOpacity
                                        key={goal.id}
                                        style={[
                                            styles.goalOption,
                                            selectedGoal === goal.id && styles.selectedGoal,
                                        ]}
                                        onPress={() => setSelectedGoal(goal.id)}
                                    >
                                        <Text style={styles.goalEmoji}>{goal.category.icon}</Text>
                                        <Text style={[
                                            styles.goalOptionTitle,
                                            selectedGoal === goal.id && styles.selectedGoalText,
                                        ]}>
                                            {goal.title}
                                        </Text>
                                        <Text style={styles.goalStreak}>🔥 {goal.currentStreak}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {selectedGoalData && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Goal Progress</Text>
                                <View style={styles.progressCard}>
                                    <Text style={styles.progressTitle}>{selectedGoalData.title}</Text>
                                    <Text style={styles.progressStats}>
                                        Current Streak: {selectedGoalData.currentStreak} days
                                    </Text>
                                    <Text style={styles.progressStats}>
                                        Best Streak: {selectedGoalData.longestStreak} days
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Add Photo Proof</Text>
                            <View style={styles.photoSection}>
                                {imageUri ? (
                                    <View style={styles.imageContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => setImageUri('')}
                                        >
                                            <Icon name="close" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.photoButtons}>
                                        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                                            <Icon name="camera-alt" size={32} color="#007AFF" />
                                            <Text style={styles.photoButtonText}>Take Photo</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                            <Icon name="photo-library" size={32} color="#007AFF" />
                                            <Text style={styles.photoButtonText}>Choose Photo</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <TextInput
                                style={styles.descriptionInput}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="How did today go? What did you accomplish?"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedGoal || !description.trim() || !imageUri || isSubmitting) && styles.disabledButton,
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedGoal || !description.trim() || !imageUri || isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
                            </Text>
                        </TouchableOpacity>
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
        paddingHorizontal: 32,
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
    goalsList: {
        flexDirection: 'row',
    },
    goalOption: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginRight: 12,
        alignItems: 'center',
        minWidth: 120,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedGoal: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    goalEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    goalOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    selectedGoalText: {
        color: '#007AFF',
    },
    goalStreak: {
        fontSize: 12,
        color: '#666',
    },
    progressCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    progressStats: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    photoSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    imageContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    photoButton: {
        alignItems: 'center',
        padding: 20,
    },
    photoButtonText: {
        marginTop: 8,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    descriptionInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
