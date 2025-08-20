import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { TextStyles } from "@/constants/Typography";

type ButtonSize = "full" | "half" | "quarter";
type ButtonVariant =
  | "primary"
  | "secondary"
  | "primaryDisabled"
  | "secondaryDisabled";
type AppRoute = "/(tabs)" | "/(tabs)/explore" | "/(tabs)/join_create" | string;

type ButtonAction = {
  type: "navigation" | "confirmation";
  // For navigation actions, specify the route
  route?: AppRoute;
  // For confirmation actions, specify the callback
  onConfirm?: () => void;
};

interface ButtonProps {
  label: string;
  size: ButtonSize;
  variant: ButtonVariant;
  action: ButtonAction;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  size,
  variant,
  action,
}) => {
  const handlePress = () => {
    if (variant.includes("Disabled")) return;

    // Add haptic feedback for mobile
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (action.type === "navigation" && action.route) {
      router.push(action.route as any); // Type assertion needed due to Expo Router typing limitations
    } else if (action.type === "confirmation" && action.onConfirm) {
      action.onConfirm();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: "100%",
      minHeight: 48, // Minimum 48dp touch target for mobile
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: BrandColors.bodyText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: BrandColors.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: BrandColors.secondary,
        };
      case "primaryDisabled":
        return {
          ...baseStyle,
          backgroundColor: `${BrandColors.primary}50`, // 30% opacity
          borderColor: NeutralColors.gray300,
          borderWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
        };
      case "secondaryDisabled":
        return {
          ...baseStyle,
          backgroundColor: `${BrandColors.secondary}50`, // 30% opacity
          borderColor: NeutralColors.gray300,
          borderWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const disabled = variant.includes("Disabled");
    return {
      ...TextStyles.button,
      color: disabled ? NeutralColors.gray500 : "#FFFFFF",
      fontWeight: "600",
    };
  };

  const getContainerStyle = (): ViewStyle => {
    switch (size) {
      case "half":
        return { width: "48%" }; // Slightly less than 50% to account for gap
      case "quarter":
        return { width: "23%" }; // Slightly less than 25% to account for gap
      case "full":
      default:
        return { width: "100%" };
    }
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        disabled={variant.includes("Disabled")}
        activeOpacity={variant.includes("Disabled") ? 1 : 0.7}
        delayPressIn={0}
        delayPressOut={100}
      >
        <Text style={getTextStyle()}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
}); 