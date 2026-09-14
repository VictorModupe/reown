//C:\Users\USER\Downloads\reown-app\reown\mobile\app\_layout.tsx

import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => console.error("Query error:", error),
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => console.error("Mutation error:", error),
  }),
});

export default function RootLayout() {
  return (
    <ClerkProvider 
    publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    tokenCache={tokenCache}
    taskUrls={{
      "choose-organization": "/(auth)",
      "reset-password": "/(auth)",
      "setup-mfa": "/(auth)",
    }}>
      <ThemeProvider>
        <ThemeRoot />
      </ThemeProvider>
      <Toast config={toastConfig} topOffset={56} />
    </ClerkProvider>
  );
}

const toastConfig = {
  success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toast, styles.successToast]}>
      <View style={styles.icon}><Text style={styles.iconText}>✓</Text></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toast, styles.errorToast]}>
      <View style={[styles.icon, styles.errorIcon]}><Text style={styles.iconText}>!</Text></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: { alignSelf: "center", width: "90%", flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 18, borderWidth: 1, shadowColor: "#1d1620", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  successToast: { backgroundColor: "#fffaf2", borderColor: "#f0d7a7" },
  errorToast: { backgroundColor: "#fff6f5", borderColor: "#efb8b2" },
  icon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#4f2b50" },
  errorIcon: { backgroundColor: "#b83232" },
  iconText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  copy: { flex: 1, marginLeft: 11 },
  title: { color: "#241b26", fontSize: 15, fontWeight: "800" },
  message: { color: "#756875", fontSize: 13, marginTop: 2 },
});

function ThemeRoot() {
  const { themeVariables } = useTheme();

  return (
    <View className="flex-1" style={themeVariables}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </View>
  );
}
