import { useSSO } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";

// npx expo start --clear --port 8081   

// Warm up the browser for faster OAuth presentation on Android
WebBrowser.maybeCompleteAuthSession();

// Extract strategy types directly from Clerk's official definitions
type SSOStrategy = "oauth_google" | "oauth_apple";
type UserRole = "customer" | "vendor";

function useSocialAuth() {
  const [loadingStrategy, setLoadingStrategy] = useState<SSOStrategy | null>(null);
  const { startSSOFlow } = useSSO();

  // Clean up browser sessions on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      WebBrowser.dismissBrowser();
    };
  }, []);

  const handleSocialAuth = useCallback(async (strategy: SSOStrategy, role: UserRole) => {
    setLoadingStrategy(strategy);

    try {
      // Creates a reliable redirect URI matching your app's deep linking configuration
      const redirectUrl = makeRedirectUri({
        scheme: "reown",
        path: "oauth-native-callback",
      });

      const { createdSessionId, setActive } = await startSSOFlow({ 
        strategy, 
        redirectUrl,
        unsafeMetadata: { role },
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.error("💥 Error in social auth:", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert("Authentication Failed", `Could not sign in with ${provider}. Please try again.`);
    } finally {
      setLoadingStrategy(null);
    }
  }, [startSSOFlow]);

  return { loadingStrategy, handleSocialAuth };
}

export default useSocialAuth;
