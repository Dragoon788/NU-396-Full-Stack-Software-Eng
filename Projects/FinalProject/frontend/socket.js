import { io } from "socket.io-client";
import Constants from "expo-constants";

// Get the local IP address from Expo's manifest (same logic as API config)
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

// Backend WebSocket server URL - use same IP as API
const URL = process.env.NODE_ENV === "production" ? undefined : `http://${getLocalIP()}:3001`;

let socket = null;

// Function to connect to socket (only when needed)
export const connectSocket = () => {
  if (!socket || socket.disconnected) {
    console.log("🔌 Creating new WebSocket connection...");
    console.log("🔌 WebSocket URL:", URL);
    
    socket = io(URL, {
      autoConnect: true, // Auto-connect immediately
      forceNew: false, // Reuse existing connection if possible
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      timeout: 10000, // 10 second connection timeout
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 10, // Try reconnecting 10 times
      reconnectionDelay: 1000, // Wait 1 second between attempts
      reconnectionDelayMax: 5000, // Max 5 seconds between attempts
    });
    
    // Add connection event handlers for debugging
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully! Socket ID:", socket.id);
    });
    
    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, reconnect manually
        console.log("🔄 Server disconnected, attempting to reconnect...");
        socket.connect();
      }
    });
    
    socket.on("connect_error", (error) => {
      console.error("🚨 Socket connection error:", error);
    });
    
    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });
    
    socket.on("reconnect_error", (error) => {
      console.error("🚨 Socket reconnection error:", error);
    });
  }
  
  return socket;
};

// Function to disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting from websocket...");
    socket.disconnect();
    socket = null;
  }
}; 