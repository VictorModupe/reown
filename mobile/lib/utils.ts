import * as SecureStore from "expo-secure-store";

export const storeAccessToken = async (token: string): Promise<void> => { 
  try { 
    await SecureStore.setItemAsync("access_token", token); 
  } catch (error) { 
    console.error("Error saving to secure store:", error); 
  } 
};

export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "#10B981";
    case "shipped":
      return "#3B82F6";
    case "pending":
      return "#F59E0B";
    default:
      return "#666";
  }
};
