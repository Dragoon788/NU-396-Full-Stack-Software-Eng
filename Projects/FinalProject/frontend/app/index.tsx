import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, Platform, TextStyle, KeyboardAvoidingView, TextInput as RNTextInput } from "react-native";
import { Button } from "@/components/atoms";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { TextStyles } from "@/constants/Typography";
import { router } from "expo-router";
import { useUser } from "./providers/user-provider";
import { useGroup } from "./providers/group-provider";
import { clearAllPersistedData } from "@/hooks/usePersistence";
import { API_URL } from "@/config/api";

export default function Index() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userId, setUserId, isUserLoaded } = useUser();
  const { groupId, setGroupId, isGroupLoaded } = useGroup();

  const handleLogin = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      console.log("Making request to:", `${API_URL}/user/create`);
      console.log("Request body:", { username: name.trim() });

      const response = await fetch(`${API_URL}/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name.trim(),
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("User created:", data.user.username);
        setUserId(data.user.UID.toString());
        router.push("/join_create");
      } else if (response.status === 409) {
        // Handle duplicate username
        Alert.alert(
          "Username Taken", 
          "This username is already in use. Please choose a different name.",
          [{ text: "OK", onPress: () => setName("") }]
        );
      } else {
        console.log("Error response:", data);
        Alert.alert("Error", data.error || "Could not create user");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert(
        "Error",
        "Could not connect to server. Make sure you're on the same network as the backend server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while persistence is loading
  if (!isUserLoaded || !isGroupLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Always show name entry screen - no welcome back behavior
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.buttonContainer}>
        <View style={styles.welcomeSection}>
          <Text style={styles.appTitle}>Split Bills Together</Text>
          <Text style={styles.appSubtitle}>Create or join a group to split expenses</Text>
        </View>

        {Platform.OS === 'web' && (
          <Text style={styles.webInfo}>
            🌐 Web Mode: Each tab acts as a separate user session
          </Text>
        )}
        
        <View style={styles.joinSection}>
          <RNTextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.nameInput}
            textAlign="center"
            autoCapitalize="words"
            placeholderTextColor={NeutralColors.gray400}
            selectionColor={BrandColors.primary}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Button
            label={isLoading ? "Creating account..." : "Continue"}
            size="full"
            variant={name.trim() && !isLoading ? "primary" : "primaryDisabled"}
            action={{
              type: "confirmation",
              onConfirm: handleLogin,
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 32,
  },
  welcomeSection: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  appTitle: {
    ...TextStyles.h1,
    color: BrandColors.primary,
    textAlign: "center",
  } as TextStyle,
  appSubtitle: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
  joinSection: {
    gap: 20,
  },
  webInfo: {
    ...TextStyles.bodySmall,
    textAlign: "center",
    color: BrandColors.darkAccent,
    backgroundColor: BrandColors.lightAccent + "20", // 20% opacity
    padding: 12,
    borderRadius: 8,
    fontWeight: "500",
  } as TextStyle,
  loadingText: {
    ...TextStyles.body,
    textAlign: "center",
    color: BrandColors.bodyText,
  } as TextStyle,
  nameInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: NeutralColors.gray200,
    borderRadius: 10,
    minHeight: 48, // Minimum touch target size for mobile
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "500",
    color: BrandColors.bodyText,
    lineHeight: 20, // Proper line height for cursor sizing
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  } as TextStyle,
});
