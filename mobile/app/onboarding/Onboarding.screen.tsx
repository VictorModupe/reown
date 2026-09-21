import { View, StyleSheet, TouchableOpacity, Text, ImageBackground } from "react-native";
import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function OnboardingScreen() {
    const handleGetStarted = () => router.replace("/(customer-tabs)");
    const handleLoginAsVendor = () => router.replace("/(routes)/login");

    return (
        <ImageBackground
            source={require("../assets/onboarding/auth-image.png")}
            style={styles.container}
            resizeMode="cover"
        >
            {/* Dark fade so the text stays readable over any image */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.75)"]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.contentContainer}>
                <Text style={styles.title}>Welcome to FOU</Text>
                <Text style={styles.subtitle}>
                    Discover many amazing thrift Products and Shop with us
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleGetStarted}
                    accessibilityRole="button"
                >
                    <LinearGradient
                        colors={["#4F2B50", "#8264A9"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Continue as a Customer</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLoginAsVendor}
                    accessibilityRole="button"
                >
                    <LinearGradient
                        colors={["#ebd9eb", "#c9b3e0"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={[styles.buttonText, styles.buttonTextDark]}>
                            Sign in as a Vendor
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#F0E5F1",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#F0E5F1",
        marginBottom: 30,
        textAlign: "center",
        opacity: 0.8,
    },
    button: {
        width: "100%",
        marginTop: 20,
        borderRadius: 10,
        overflow: "hidden",
    },
    buttonGradient: {
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#F0E5F1",
        fontSize: 18,
        fontWeight: "bold",
    },
    buttonTextDark: {
        color: "#4F2B50",
    },
});