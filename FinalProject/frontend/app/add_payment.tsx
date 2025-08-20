import React, { useState } from "react";
import { View, StyleSheet, Alert, Text, TextStyle, TextInput, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { Button } from "@/components/atoms";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { TextStyles } from "@/constants/Typography";
import { router, useFocusEffect } from "expo-router";
import { useUser } from "./providers/user-provider";
import { API_URL } from "@/config/api";

export default function AddPayment() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser();

  // Clear form when navigating back to this page
  useFocusEffect(
    React.useCallback(() => {
      // Reset form state for clean user flow
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardholderName("");
      setIsLoading(false);
      console.log("Payment page focused - form cleared for clean user flow");
    }, [])
  );

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
      setExpiryDate(formatted);
    } else {
      setExpiryDate(cleaned);
    }
  };

  // Format CVV (3-4 digits only)
  const formatCvv = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const validateForm = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    if (!cardholderName.trim()) {
      Alert.alert("Error", "Please enter the cardholder name");
      return false;
    }
    
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      Alert.alert("Error", "Please enter a valid card number");
      return false;
    }
    
    if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
      Alert.alert("Error", "Please enter expiry date as MM/YY");
      return false;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert("Error", "Please enter a valid CVV");
      return false;
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/');
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) {
      Alert.alert("Error", "Please enter a valid month (01-12)");
      return false;
    }
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      Alert.alert("Error", "Card has expired");
      return false;
    }

    return true;
  };

  const handleAddPaymentMethod = async () => {
    if (!validateForm()) return;

    if (!userId) {
      Alert.alert("Error", "No user ID found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/payment/method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
          expiryDate: expiryDate,
          cvv: cvv,
          cardholderName: cardholderName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success", 
          `Payment method added: ${data.paymentMethod.brand} ending in ${data.paymentMethod.last_four}`,
          [
            {
              text: "Continue",
              onPress: () => router.push("/join_create")
            }
          ]
        );
      } else {
        Alert.alert("Error", data.error || "Could not add payment method");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = cardholderName.trim() && 
                     cardNumber.replace(/\s/g, '').length >= 13 && 
                     expiryDate.length === 5 && 
                     cvv.length >= 3 && 
                     !isLoading;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Add Payment Method</Text>
            <Text style={styles.subtitle}>Add your card to automatically pay your share</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                placeholder="Name on Card"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={formatCardNumber}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={formatExpiryDate}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  placeholder="123"
                  value={cvv}
                  onChangeText={formatCvv}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              label={isLoading ? "Adding Payment Method..." : "Add Payment Method"}
              size="full"
              variant={isFormValid ? "primary" : "primaryDisabled"}
              action={{
                type: "confirmation",
                onConfirm: handleAddPaymentMethod,
              }}
            />
            
            <Text style={styles.securityNote}>
              🔒 Your card details are securely tokenized and encrypted
            </Text>
          </View>
        </View>
      </ScrollView>
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
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    ...TextStyles.label,
    color: BrandColors.bodyText,
    fontWeight: "600",
  } as TextStyle,
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: BrandColors.lightAccent + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: BrandColors.bodyText,
    shadowColor: BrandColors.bodyText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  buttonSection: {
    gap: 16,
    alignItems: "center",
  },
  securityNote: {
    ...TextStyles.bodySmall,
    color: NeutralColors.gray500,
    textAlign: "center",
    fontStyle: "italic",
  } as TextStyle,
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});