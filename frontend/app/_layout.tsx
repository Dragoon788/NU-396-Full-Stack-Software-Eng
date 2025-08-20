import { Stack } from "expo-router";
import { UserProvider } from "./providers/user-provider";
import { GroupProvider } from "./providers/group-provider";
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Commissioner_400Regular,
  Commissioner_500Medium,
  Commissioner_600SemiBold,
  Commissioner_700Bold,
} from '@expo-google-fonts/commissioner';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    // Fraunces fonts
    'Fraunces': Fraunces_400Regular,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
    'Fraunces-Bold': Fraunces_700Bold,
    'Fraunces-Italic': Fraunces_400Regular_Italic,
    'Fraunces-SemiBold-Italic': Fraunces_600SemiBold_Italic,
    'Fraunces-Bold-Italic': Fraunces_700Bold_Italic,
    
    // Commissioner fonts
    'Commissioner': Commissioner_400Regular,
    'Commissioner-Medium': Commissioner_500Medium,
    'Commissioner-SemiBold': Commissioner_600SemiBold,
    'Commissioner-Bold': Commissioner_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <GroupProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              title: "Welcome",
            }}
          />
          <Stack.Screen
            name="join_create"
            options={{
              headerShown: true,
              title: "Join or Create Group",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="bill"
            options={{
              headerShown: true,
              title: "Enter Bill Amount",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="group"
            options={{
              headerShown: true,
              title: "Group Details",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </GroupProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#001303',
    fontFamily: 'System', // Use system font for loading text since custom fonts aren't loaded yet
  },
});
