import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const secureStoreKeys: string[] = ["refreshToken" /* Add more keys here as needed */];

const storage = {
  clearAllStorage,
  checkStorage,
};

async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    console.log("[STORAGE] AsyncStorage cleared");

    for (const key of secureStoreKeys) {
      await SecureStore.deleteItemAsync(key);
    }
    console.log("[STORAGE] SecureStore cleared");
  } catch (error) {
    console.error("[STORAGE] Error clearing storage", error);
  }
}

async function checkStorage() {
  try {
    const asyncKeys = await AsyncStorage.getAllKeys();
    for (const key of asyncKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log("[STORAGE] AsyncStorage key: " + key + ", value:", value);
    }

    for (const key of secureStoreKeys) {
      const value = await SecureStore.getItemAsync(key);
      console.log("[STORAGE] SecureStore key: " + key + ", value:", value);
    }
  } catch (error) {
    console.error("[STORAGE] Error checking storage", error);
  }
}

export default storage;
