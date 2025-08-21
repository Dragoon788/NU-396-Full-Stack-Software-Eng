import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TextStyle, Platform, KeyboardAvoidingView, TextInput as RNTextInput } from "react-native";
import { Button } from "@/components/atoms";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { TextStyles } from "@/constants/Typography";
import { router, useFocusEffect } from "expo-router";
import { useUser } from "./providers/user-provider";
import { useGroup } from "./providers/group-provider";
import { API_URL } from "@/config/api";

export default function Bill() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser();
  const { setGroupId } = useGroup();

  // Clear form when navigating back to this page
  useFocusEffect(
    React.useCallback(() => {
      // Reset form state for clean user flow
      setAmount("");
      setIsLoading(false);
      console.log("Bill page focused - form cleared for clean user flow");
    }, [])
  );

  const handleCreateGroup = async () => {
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "No user ID found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating group with:", {
        amount: parseFloat(amount),
        creatorId: userId,
      });

      const response = await fetch(`${API_URL}/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          creatorId: userId,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("Setting group ID:", data.groupId);
        setGroupId(data.groupId.toString());
        router.push("/group");
      } else {
        console.log("Error creating group:", data);
        Alert.alert("Error", data.error || "Could not create group");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Enter Bill Amount</Text>
          <Text style={styles.subtitle}>Set the total amount to be split among group members</Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.currencyLabel}>Total Bill Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <RNTextInput
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              textAlign="left"
              style={styles.amountInput}
              placeholderTextColor={NeutralColors.gray400}
              selectionColor={BrandColors.primary}
            />
          </View>
          <Text style={styles.helpText}>
            Enter the total amount that needs to be split
          </Text>
        </View>

        <Button
          label={isLoading ? "Creating Group..." : "Create Group"}
          size="full"
          variant={amount.trim() && !isLoading ? "primary" : "primaryDisabled"}
          action={{
            type: "confirmation",
            onConfirm: handleCreateGroup,
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
    gap: 40,
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
  amountSection: {
    gap: 16,
  },
  currencyLabel: {
    ...TextStyles.label,
    color: BrandColors.bodyText,
    fontWeight: "600",
    marginBottom: 8,
  } as TextStyle,
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: BrandColors.lightAccent + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: BrandColors.bodyText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 56,
  },
  currencySymbol: {
    ...TextStyles.h3,
    color: BrandColors.darkAccent,
    marginRight: 8,
    fontWeight: "bold",
  } as TextStyle,
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: BrandColors.bodyText,
    lineHeight: 28,
    paddingVertical: 12,
    borderWidth: 0,
    backgroundColor: "transparent",
  } as TextStyle,
  helpText: {
    ...TextStyles.bodySmall,
    color: NeutralColors.gray500,
    textAlign: "center",
    fontStyle: "italic",
  } as TextStyle,
});
