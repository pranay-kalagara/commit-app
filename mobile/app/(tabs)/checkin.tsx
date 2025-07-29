import { StyleSheet, Text, View } from 'react-native';

export default function CheckInScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Check-In</Text>
            <Text style={styles.subtitle}>Share your progress with proof</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
