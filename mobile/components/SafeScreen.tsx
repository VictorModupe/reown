import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, backgroundColor: isDark ? "#4F2B50" : "#F0E5F1" }}
    >
      {children}
    </View>
  );
};

export default SafeScreen;
