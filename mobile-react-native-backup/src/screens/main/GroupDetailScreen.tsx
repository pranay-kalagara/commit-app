import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GroupDetailScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Group Detail Screen</Text>
            <Text style={styles.subtext}>Coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 16,
        color: '#666',
    },
});
