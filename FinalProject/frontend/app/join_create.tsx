import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TextStyle, Platform, KeyboardAvoidingView, TextInput as RNTextInput } from "react-native";
import { Button } from "@/components/atoms";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { TextStyles } from "@/constants/Typography";
import { router, useFocusEffect } from "expo-router";
import { useUser } from "./providers/user-provider";
import { useGroup } from "./providers/group-provider";
import { API_URL } from "@/config/api";

export default function JoinCreate() {
  const [groupCode, setGroupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser();
  const { setGroupId } = useGroup();

  // Clear form when navigating back to this page
  useFocusEffect(
    React.useCallback(() => {
      // Reset form state for clean user flow
      setGroupCode("");
      setIsLoading(false);
      console.log("Join/Create page focused - form cleared for clean user flow");
    }, [])
  );

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) return;

    setIsLoading(true);
    try {
      console.log("Attempting to join group:", {
        newGroupID: groupCode.trim(),
        userID: userId,
      });

      const response = await fetch(`${API_URL}/group/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newGroupID: groupCode.trim(),
          userID: userId,
        }),
      });

      console.log("Join response status:", response.status);
      const data = await response.json();
      console.log("Join response data:", data);

      if (response.ok) {
        console.log("Successfully joined group, setting group ID:", groupCode.trim());
        setGroupId(groupCode.trim());
        console.log("Navigating to group page...");
        router.push("/group");
      } else {
        console.log("Error joining group:", data);
        Alert.alert("Error", "Could not join group");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/bill");
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Choose an option</Text>
          <Text style={styles.subtitle}>Join an existing group or create a new one</Text>
        </View>

        <View style={styles.joinSection}>
          <RNTextInput
            placeholder="Enter Group Code"
            value={groupCode}
            onChangeText={setGroupCode}
            style={styles.groupCodeInput}
            textAlign="center"
            autoCapitalize="characters"
            placeholderTextColor={NeutralColors.gray400}
            selectionColor={BrandColors.primary}
            returnKeyType="done"
            onSubmitEditing={handleJoinGroup}
          />
          <Button
            label={isLoading ? "Joining..." : "Join Group"}
            size="full"
            variant={
              groupCode.trim() && !isLoading ? "primary" : "primaryDisabled"
            }
            action={{
              type: "confirmation",
              onConfirm: handleJoinGroup,
            }}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Button
          label="Create New Group"
          size="full"
          variant="secondary"
          action={{
            type: "confirmation",
            onConfirm: handleCreateNew,
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 32,
  },
  headerSection: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    ...TextStyles.h2,
    color: BrandColors.primary,
    textAlign: "center",
  } as TextStyle,
  subtitle: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
  joinSection: {
    gap: 20,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: BrandColors.lightAccent + "40", // 40% opacity
  },
  orText: {
    ...TextStyles.bodySmall,
    color: BrandColors.darkAccent,
    fontWeight: "600",
    paddingHorizontal: 16,
  } as TextStyle,
  groupCodeInput: {
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
