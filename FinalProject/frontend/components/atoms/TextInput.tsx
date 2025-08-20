import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextStyle,
  ViewStyle,
  View,
} from "react-native";
import { TextStyles } from "@/constants/Typography";
import { BrandColors, NeutralColors } from "@/constants/Colors";

interface TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  textAlign?: "left" | "center" | "right";
  keyboardType?: "default" | "number-pad" | "decimal-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: TextStyle;
  returnKeyType?: "done" | "next" | "search" | "send" | "go" | "default";
  onSubmitEditing?: () => void;
  secureTextEntry?: boolean;
  maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  textAlign = "left",
  keyboardType = "default",
  autoCapitalize = "none",
  style,
  returnKeyType = "done",
  onSubmitEditing,
  secureTextEntry = false,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <RNTextInput
        style={[
          styles.input, 
          { textAlign }, 
          isFocused && styles.focusedInput,
          style
        ]}
        placeholder={placeholder}
        placeholderTextColor={NeutralColors.gray400}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        selectionColor={BrandColors.primary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
      />
    </View>
  );
};

const baseTextStyle: TextStyle = {
  fontFamily: TextStyles.h4.fontFamily,
  fontSize: TextStyles.h4.fontSize,
  fontWeight: "600",
  lineHeight: TextStyles.h4.lineHeight,
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    ...baseTextStyle,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: NeutralColors.gray200,
    borderRadius: 10,
    minHeight: 48,
    padding: 16,
    color: BrandColors.bodyText,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  focusedInput: {
    borderColor: BrandColors.primary,
    borderWidth: 2,
  },
}); 