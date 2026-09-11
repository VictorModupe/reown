import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { View } from "react-native";
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
    tokenCache={tokenCache}>
      <ThemeProvider>
        <ThemeRoot />
      </ThemeProvider>
      <Toast />
    </ClerkProvider>
  );
}

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
