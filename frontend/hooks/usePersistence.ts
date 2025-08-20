import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage interface to handle both web sessionStorage and mobile AsyncStorage
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use sessionStorage on web for tab-specific storage
      return sessionStorage.getItem(key);
    } else {
      // Use AsyncStorage on mobile for persistent storage
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use sessionStorage on web for tab-specific storage
      sessionStorage.setItem(key, value);
    } else {
      // Use AsyncStorage on mobile for persistent storage
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    if (Platform.OS === 'web') {
      keys.forEach(key => sessionStorage.removeItem(key));
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  }
};

export function usePersistence<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await storage.getItem(key);
        if (stored !== null) {
          setValue(JSON.parse(stored));
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage whenever it changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save initial value

    const saveValue = async () => {
      try {
        await storage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
      }
    };

    saveValue();
  }, [key, value, isLoaded]);

  return [value, setValue, isLoaded] as const;
}

// Utility function to clear all app data (useful for logout)
export const clearAllPersistedData = async () => {
  try {
    await storage.multiRemove(['userId', 'groupId']);
  } catch (error) {
    console.error('Error clearing persisted data:', error);
  }
};

// Utility function to check if we're using persistent storage (mobile) or session storage (web)
export const isUsingPersistentStorage = () => {
  return Platform.OS !== 'web';
}; 