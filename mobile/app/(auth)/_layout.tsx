// //C:\Users\USER\Downloads\reown-app\reown\mobile\app\(auth)\_layout.tsx
// import { Redirect, Stack } from "expo-router";
// import { useAuth } from "@clerk/clerk-expo";

// export default function AuthRoutesLayout() {
//   const { isSignedIn, isLoaded } = useAuth();

//   if (!isLoaded) return null; // for a better ux

//   if (isSignedIn) {
//     return <Redirect href={"/(tabs)"} />;
//   }

//   return <Stack screenOptions={{ headerShown: false }} />;
// }

// app/(auth)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { getDashboardRoute } from "@/lib/navigation";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  if (!isAuthLoaded || (isSignedIn && !isUserLoaded)) return null;

  if (isSignedIn) {
    const role = user?.unsafeMetadata?.role as string | undefined;
    return <Redirect href={getDashboardRoute(role)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}