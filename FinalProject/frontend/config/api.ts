import Constants from "expo-constants";

// Get the local IP address from Expo's manifest
const getLocalIP = () => {
  if (__DEV__) {
    // In development, use the local IP from Expo
    const manifest = Constants.expoConfig?.hostUri;
    if (manifest) {
      // hostUri looks like '192.168.1.1:19000'
      // We just want the IP part
      return manifest.split(":")[0];
    }
  }
  return "localhost"; // Fallback
};

// Configuration for different environments
const config = {
  development: {
    apiUrl: `http://${getLocalIP()}:3001`,
  },
};

// Use development config in dev mode, production config in prod mode
export const API_URL = config.development.apiUrl;
