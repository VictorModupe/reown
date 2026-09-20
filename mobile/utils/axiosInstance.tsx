import * as SecureStore from "expo-secure-store";

const storeAccessToken = async (token: string): Promise<void> => { 
  try { 
    await SecureStore.setItemAsync("access_token", token); 
  } catch (error) { 
    console.error("Error saving to secure store:", error); 
  } 
};