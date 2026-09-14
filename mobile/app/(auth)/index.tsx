//C:\Users\USER\Downloads\reown-app\reown\mobile\app\(auth)\index.tsx
import useSocialAuth from "@/hooks/useSocialAuth";
import { useAuth, useSessionList, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type AuthMode = "signIn" | "signUp" | "forgot" | "verifySignUp" | "verifyReset" | "resetPassword";
type UserRole = "customer" | "vendor";

const getErrorMessage = (error: any) =>
  error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || "Something went wrong. Please try again.";

const isAlreadySignedInError = (error: any) => {
  const message = getErrorMessage(error).toLowerCase();
  return error?.errors?.some((item: any) => item.code === "session_exists" || item.code === "already_signed_in") || message.includes("already signed in");
};

const showToast = (type: "success" | "error", text1: string, text2: string) =>
  Toast.show({ type, text1, text2 });

const getSignupRequirementMessage = (result: any) => {
  const missingFields = result.missingFields?.join(", ");
  const unverifiedFields = result.unverifiedFields?.join(", ");

  if (unverifiedFields) return `Still waiting to verify: ${unverifiedFields}.`;
  if (missingFields) return `Clerk still needs: ${missingFields}.`;
  return "Clerk still requires another account step. Check the Clerk sign-up settings.";
};

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();
  const { isSignedIn } = useAuth();
  const { isLoaded: isSessionListLoaded, sessions } = useSessionList();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [role, setRole] = useState<UserRole>("customer");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const resetForm = (nextMode: AuthMode) => {
    setMode(nextMode);
    setCode("");
    setPassword("");
  };

  const finishSession = async (sessionId: string | null | undefined, activate: typeof setSignInActive) => {
    if (sessionId && activate) await activate({ session: sessionId });
  };

  const activateExistingSession = async () => {
  const availableSessions = sessions ?? [];
  const existingSession = availableSessions.find((session) => session.status === "active") || availableSessions[0];
  if (!isSessionListLoaded || !existingSession) return false;
  await finishSession(existingSession.id, setSignInActive);
  return true; // no manual navigation — layout handles it
};

  const handleSignIn = async () => {
  // drop the `if (isSignedIn) { router.replace(...) }` guard —
  // the layout already prevents this screen being reachable when signed in
  if (!isSignInLoaded || !email.trim() || !password) {
    showToast("error", "Missing details", "Enter your email and password.");
    return;
  }
  setBusy(true);
  try {
    const result = await signIn.create({ identifier: email.trim(), password });
    if (result.status !== "complete" || !result.createdSessionId) {
      showToast("error", "Sign in incomplete", "Clerk requires another sign-in step before continuing.");
      return;
    }
    await finishSession(result.createdSessionId, setSignInActive);
  } catch (error) {
    if (isAlreadySignedInError(error)) {
      const recovered = await activateExistingSession();
      if (!recovered) {
        showToast("error", "Session needs attention", "Clerk has an existing session, but it could not be restored. Restart the app and try again.");
      }
      return;
    }
    showToast("error", "Sign in failed", getErrorMessage(error));
  } finally {
    setBusy(false);
  }
};

  const handleSignUp = async () => {
    if (!isSignUpLoaded || !email.trim() || !password || !name.trim()) {
      showToast("error", "Missing details", "Enter your name, email, and password.");
      return;
    }
    setBusy(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: name.trim(),
        unsafeMetadata: { role },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verifySignUp");
    } catch (error) {
      showToast("error", "Sign up failed", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const verifySignUp = async () => {
  if (!isSignUpLoaded || code.trim().length < 4) {
    showToast("error", "Enter your code", "Enter the verification code sent to your email.");
    return;
  }
  setBusy(true);
  try {
    const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
    if (result.status !== "complete" || !result.createdSessionId) {
      console.warn("Clerk sign-up is incomplete", {
        status: result.status,
        missingFields: result.missingFields,
        unverifiedFields: result.unverifiedFields,
      });
      showToast("error", "Verification incomplete", getSignupRequirementMessage(result));
      return;
    }
    showToast("success", "Email verified", "Your account is ready.");
    await finishSession(result.createdSessionId, setSignUpActive);
  } catch (error) {
    showToast("error", "Verification failed", getErrorMessage(error));
  } finally {
    setBusy(false);
  }
};

  const resendSignUpCode = async () => {
    if (!isSignUpLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      showToast("success", "Code sent", "A new verification code is on its way.");
    } catch (error) {
      showToast("error", "Could not resend code", getErrorMessage(error));
    }
  };

  const sendResetCode = async () => {
    if (!isSignInLoaded || !email.trim()) {
      showToast("error", "Enter your email", "Enter the email connected to your account.");
      return;
    }
    setBusy(true);
    try {
      await signIn.create({ identifier: email.trim() });
      const emailFactor = signIn.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === "reset_password_email_code"
      ) as { emailAddressId?: string } | undefined;
      if (!emailFactor?.emailAddressId) throw new Error("Password reset is not available for this account.");
      await signIn.prepareFirstFactor({ strategy: "reset_password_email_code", emailAddressId: emailFactor.emailAddressId });
      setMode("verifyReset");
    } catch (error) {
      showToast("error", "Could not send code", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const verifyResetCode = async () => {
    if (!isSignInLoaded || code.trim().length < 4) {
      showToast("error", "Enter your code", "Enter the reset code sent to your email.");
      return;
    }
    setBusy(true);
    try {
      await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code: code.trim() });
      setMode("resetPassword");
    } catch (error) {
      showToast("error", "Verification failed", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
  if (!isSignInLoaded || password.length < 8) {
    showToast("error", "Password too short", "Your new password must be at least 8 characters.");
    return;
  }
  setBusy(true);
  try {
    const result = await signIn.resetPassword({ password });
    if (result.status !== "complete" || !result.createdSessionId) {
      showToast("error", "Reset incomplete", "Clerk requires another step before finishing the reset.");
      return;
    }
    showToast("success", "Password updated", "You're signed in with your new password.");
    await finishSession(result.createdSessionId, setSignInActive);
  } catch (error) {
    showToast("error", "Could not reset password", getErrorMessage(error));
  } finally {
    setBusy(false);
  }
};

  const isVerification = mode === "verifySignUp" || mode === "verifyReset";
  const isForm = mode === "signIn" || mode === "signUp" || mode === "forgot";
  const title = mode === "signUp" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "resetPassword" ? "Choose a new password" : isVerification ? "Check your email" : "Welcome back";
  const submit = mode === "signIn" ? handleSignIn : mode === "signUp" ? handleSignUp : mode === "forgot" ? sendResetCode : mode === "verifySignUp" ? verifySignUp : mode === "verifyReset" ? verifyResetCode : resetPassword;
  const submitLabel = mode === "signIn" ? "Sign In" : mode === "signUp" ? "Create Account" : mode === "forgot" ? "Send Reset Code" : isVerification ? "Verify Code" : "Update Password";

  return (
    <ImageBackground source={require("../../assets/images/auth-image.png")} className="flex-1" resizeMode="cover">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-end bg-black/25 px-6 pb-8 pt-20">
            <View className="rounded-3xl bg-white px-5 py-6">
              <Text className="text-3xl font-bold text-gray-900">{title}</Text>
              {mode === "signIn" && <Text className="mt-2 text-gray-500">Sign in to continue shopping.</Text>}
              {mode === "signUp" && <Text className="mt-2 text-gray-500">Join as a buyer or seller.</Text>}
              {isVerification && <Text className="mt-2 text-gray-500">We sent a code to {email}.</Text>}

              {mode === "signIn" || mode === "signUp" ? (
                <View className="mt-5 flex-row rounded-xl bg-gray-100 p-1">
                  <Pressable className={`flex-1 rounded-lg py-3 ${mode === "signIn" ? "bg-white" : ""}`} onPress={() => resetForm("signIn")}>
                    <Text className="text-center font-semibold text-gray-800">Sign In</Text>
                  </Pressable>
                  <Pressable className={`flex-1 rounded-lg py-3 ${mode === "signUp" ? "bg-white" : ""}`} onPress={() => resetForm("signUp")}>
                    <Text className="text-center font-semibold text-gray-800">Sign up</Text>
                  </Pressable>
                </View>
              ) : null}

              {mode === "signUp" ? (
                <>
                  <AuthInput icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} />
                  <View className="mt-3 flex-row gap-2">
                    {(["customer", "vendor"] as UserRole[]).map((item) => (
                      <Pressable key={item} className={`flex-1 rounded-xl border py-3 ${role === item ? "border-[#4F2B50] bg-[#4F2B50]" : "border-gray-200"}`} onPress={() => setRole(item)}>
                        <Text className={`text-center font-semibold capitalize ${role === item ? "text-white" : "text-gray-600"}`}>{item === "customer" ? "Buyer" : "Seller"}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {isForm ? <AuthInput icon="mail-outline" placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /> : null}
              {mode === "signIn" || mode === "signUp" ? <AuthInput icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry /> : null}
              {mode === "resetPassword" ? <AuthInput icon="lock-closed-outline" placeholder="New password" value={password} onChangeText={setPassword} secureTextEntry /> : null}
              {isVerification ? <AuthInput icon="keypad-outline" placeholder="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" /> : null}

              <Pressable className="mt-5 rounded-xl bg-[#4F2B50] py-4" onPress={() => void submit()} disabled={busy}>
                {busy ? <ActivityIndicator color="white" /> : <Text className="text-center text-base font-bold text-white">{submitLabel}</Text>}
              </Pressable>

              {mode === "signIn" ? <Pressable className="mt-4" onPress={() => resetForm("forgot")}><Text className="text-center font-semibold text-[#4F2B50]">Forgot password?</Text></Pressable> : null}
              {isVerification ? <Pressable className="mt-4" onPress={mode === "verifySignUp" ? resendSignUpCode : sendResetCode}><Text className="text-center font-semibold text-[#4F2B50]">Resend code</Text></Pressable> : null}
              {mode !== "signIn" && mode !== "signUp" ? <Pressable className="mt-4" onPress={() => resetForm("signIn")}><Text className="text-center font-semibold text-[#4F2B50]">Back to sign in</Text></Pressable> : null}

              {mode === "signIn" || mode === "signUp" ? (
                <>
                  <View className="my-5 flex-row items-center"><View className="h-px flex-1 bg-gray-200" /><Text className="mx-3 text-gray-400">or continue with</Text><View className="h-px flex-1 bg-gray-200" /></View>
                  <Text className="mb-2 font-semibold text-gray-700">I want to join as</Text>
                  <View className="mb-3 flex-row gap-2">
                    {(["customer", "vendor"] as UserRole[]).map((item) => (
                      <Pressable key={item} className={`flex-1 rounded-xl border py-3 ${role === item ? "border-[#4F2B50] bg-[#4F2B50]" : "border-gray-200"}`} onPress={() => setRole(item)}>
                        <Text className={`text-center font-semibold ${role === item ? "text-white" : "text-gray-600"}`}>{item === "customer" ? "Buyer" : "Seller"}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <SocialButton label="Continue with Google" image={require("../../assets/images/google.png")} loading={loadingStrategy === "oauth_google"} onPress={() => handleSocialAuth("oauth_google", role)} />
                  <SocialButton label="Continue with Apple" image={require("../../assets/images/apple.png")} loading={loadingStrategy === "oauth_apple"} onPress={() => handleSocialAuth("oauth_apple", role)} />
                </>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

function AuthInput(props: React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }) {
  return <View className="mt-3 flex-row items-center rounded-xl border border-gray-200 px-4"><Ionicons name={props.icon} size={20} color="#8b728c" /><TextInput {...props} className="ml-3 flex-1 py-4 text-base text-gray-900" placeholderTextColor="#9ca3af" /></View>;
}

function SocialButton({ label, image, loading, onPress }: { label: string; image: any; loading: boolean; onPress: () => void }) {
  return <Pressable className="mb-3 flex-row items-center justify-center rounded-xl border border-gray-200 py-3" onPress={onPress} disabled={loading}>{loading ? <ActivityIndicator color="#4F2B50" /> : <><Image source={image} className="mr-3 h-7 w-7" resizeMode="contain" /><Text className="font-semibold text-gray-800">{label}</Text></>}</Pressable>;
}

export default AuthScreen;
