import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { connectSocket, disconnectSocket } from "../../socket.js";

// Storage helper functions
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return sessionStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      sessionStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};

type GroupContextType = {
  groupId: string | null;
  setGroupId: (id: string | null) => void;
  isGroupLoaded: boolean;
  socketConnected: boolean;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groupId, setGroupIdState] = useState<string | null>(null);
  const [isGroupLoaded, setIsGroupLoaded] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Load persisted group ID on mount
  useEffect(() => {
    const loadGroupId = async () => {
      try {
        const savedGroupId = await storage.getItem("groupId");
        if (savedGroupId) {
          console.log("📱 Loaded persisted group ID:", savedGroupId);
          setGroupIdState(JSON.parse(savedGroupId));
        }
      } catch (error) {
        console.error("Error loading group ID:", error);
      } finally {
        setIsGroupLoaded(true);
      }
    };

    loadGroupId();
  }, []);

  // Handle WebSocket connection when groupId changes
  useEffect(() => {
    if (!isGroupLoaded) return;

    if (groupId) {
      // Connect to WebSocket when user joins a group
      console.log("🔌 [GroupProvider] Connecting to WebSocket for group:", groupId);
      const socket = connectSocket();
      
      // Set up global connection handlers
      socket.on("connect", () => {
        console.log("✅ [GroupProvider] WebSocket connected globally");
        setSocketConnected(true);
        
        // Join group room immediately upon connection
        console.log("📡 [GroupProvider] Joining group room:", groupId);
        socket.emit("joinGroup", { groupId, userId: null }); // userId will be set by individual pages
      });
      
      socket.on("disconnect", (reason: string) => {
        console.log("❌ [GroupProvider] WebSocket disconnected:", reason);
        setSocketConnected(false);
      });
      
      socket.on("connect_error", (error: any) => {
        console.error("🚨 [GroupProvider] WebSocket connection error:", error);
        setSocketConnected(false);
      });
      
      // If already connected, join the group room
      if (socket.connected) {
        console.log("📡 [GroupProvider] Socket already connected, joining group room:", groupId);
        socket.emit("joinGroup", { groupId, userId: null });
        setSocketConnected(true);
      }
      
    } else {
      // Disconnect from WebSocket when user leaves group
      console.log("🔌 [GroupProvider] Disconnecting WebSocket - no group");
      disconnectSocket();
      setSocketConnected(false);
    }
  }, [groupId, isGroupLoaded]);

  const setGroupId = async (id: string | null) => {
    console.log("📝 Setting group ID:", id);
    setGroupIdState(id);
    
    try {
      if (id) {
        await storage.setItem("groupId", JSON.stringify(id));
        console.log("💾 Group ID persisted:", id);
      } else {
        await storage.removeItem("groupId");
        console.log("🗑️ Group ID cleared from storage");
      }
    } catch (error) {
      console.error("Error persisting group ID:", error);
    }
  };

  return (
    <GroupContext.Provider 
      value={{ 
        groupId, 
        setGroupId, 
        isGroupLoaded,
        socketConnected 
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}
