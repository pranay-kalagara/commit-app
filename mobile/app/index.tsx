import { Text, View } from "react-native";

export default function Index() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
            }}
        >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                Commit App
            </Text>
            <Text style={{ fontSize: 16, marginTop: 10, color: "#666" }}>
                Your social accountability platform
            </Text>
        </View>
    );
}
