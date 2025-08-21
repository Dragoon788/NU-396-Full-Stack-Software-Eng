import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TextStyle } from "react-native";
import { Button } from "@/components/atoms";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { TextStyles } from "@/constants/Typography";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "./providers/user-provider";
import { useGroup } from "./providers/group-provider";
import { clearAllPersistedData } from "@/hooks/usePersistence";
import { API_URL } from "@/config/api";

interface NFCCard {
  nfcCardId: string;
  lastFour: string;
  cardBrand: string;
}

interface GroupMember {
  UID: number;
  username: string;
  approval_status: boolean;
}

interface GroupDetails {
  groupId: number;
  adminId: number;
  totalAmount: number;
  members: GroupMember[];
}

export default function PaymentConfirmation() {
  const [isLoading, setIsLoading] = useState(false);
  const [nfcCard, setNfcCard] = useState<NFCCard | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  
  const { userId, setUserId } = useUser();
  const { groupId, setGroupId } = useGroup();
  const params = useLocalSearchParams();

  // Helper function to safely convert to number
  const safeToNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Calculate amounts
  const totalAmount = safeToNumber(groupDetails?.totalAmount || 0);
  const memberCount = groupDetails?.members.length || 1;
  const amountPerPerson = totalAmount / memberCount;

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  // Generate NFC card only after group details are loaded
  useEffect(() => {
    if (groupDetails && groupId) {
      generateNFCCard();
    }
  }, [groupDetails, groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/group/${groupId}`);
      const data = await response.json();
      
      if (response.ok) {
        setGroupDetails(data.group);
      } else {
        Alert.alert("Error", "Could not load group details");
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      Alert.alert("Error", "Could not connect to server");
    }
  };

  const generateNFCCard = async () => {
    try {
      setIsGeneratingCard(true);
      
      // Calculate total amount based on current group details
      const currentTotalAmount = safeToNumber(groupDetails?.totalAmount || 0);
      
      console.log("🔧 Generating NFC card with amount:", currentTotalAmount);
      
      const response = await fetch(`${API_URL}/nfc/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: groupId,
          totalAmount: currentTotalAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNfcCard({
          nfcCardId: data.nfcCardId,
          lastFour: data.cardDetails.lastFour,
          cardBrand: "NFC Card", // For NFC generated cards
        });
        console.log("NFC card generated:", data.nfcCardId);
      } else {
        Alert.alert("Error", "Could not generate payment card");
      }
    } catch (error) {
      console.error("Error generating NFC card:", error);
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleContinuePayment = async () => {
    if (!nfcCard || !groupDetails) {
      Alert.alert("Error", "Payment details not ready");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/nfc/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nfcCardId: nfcCard.nfcCardId,
          amount: totalAmount,
          groupId: groupId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTransactionId(data.transactionId);
        setPaymentComplete(true);
        // Don't clear groupId here - let user manually choose to start new group
      } else {
        Alert.alert("Payment Failed", data.message || "Could not process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Could not process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinNewGroup = async () => {
    console.log("🔄 Starting new group flow - clearing all state and navigating to name entry");
    
    // Clear all state from providers
    setUserId(null);
    setGroupId(null);
    
    // Clear all persisted data
    await clearAllPersistedData();
    
    // Navigate back to the name entry page
    router.replace("/");
  };

  if (isGeneratingCard) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.loadingSection}>
            <Text style={styles.title}>Preparing Payment...</Text>
            <Text style={styles.loadingText}>Generating NFC payment card</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!groupDetails || !nfcCard) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorSection}>
            <Text style={styles.title}>Payment Error</Text>
            <Text style={styles.errorText}>Could not load payment details. Please try again later.</Text>
          </View>
        </View>
      </View>
    );
  }

  if (paymentComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successSection}>
            <Text style={styles.successTitle}>Payment Complete!</Text>
            <Text style={styles.successSubtitle}>Your payment has been processed successfully</Text>
            
            <View style={styles.successCard}>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Transaction ID:</Text>
                <Text style={styles.successValue}>{transactionId}</Text>
              </View>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Amount Paid:</Text>
                <Text style={styles.successValue}>${totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Your Share:</Text>
                <Text style={styles.successValue}>${amountPerPerson.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.successNote}>
              Thank you for using our group payment system!
            </Text>

            <View style={styles.actionSection}>
              <Button
                label="JOIN A NEW GROUP"
                size="full"
                variant="primary"
                action={{
                  type: "confirmation",
                  onConfirm: handleJoinNewGroup,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Confirmation</Text>
          <Text style={styles.subtitle}>Please confirm the following transaction:</Text>
        </View>

        <View style={styles.transactionCard}>
          <View style={styles.transactionRow}>
            <Text style={styles.label}>From:</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNumber}>**** **** **** {nfcCard.lastFour}</Text>
              <Text style={styles.cardType}>(Debit/Credit Card)</Text>
            </View>
          </View>

          <View style={styles.transactionRow}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.merchantInfo}>Group Payment System</Text>
          </View>

          <View style={styles.transactionRow}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.amount}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.perPersonCard}>
          <View style={styles.perPersonRow}>
            <Text style={styles.perPersonLabel}>Amount per person:</Text>
            <Text style={styles.perPersonAmount}>${amountPerPerson.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Button
            label={isLoading ? "PROCESSING PAYMENT..." : "CONTINUE WITH PAYMENT"}
            size="full"
            variant="primary"
            action={{
              type: "confirmation",
              onConfirm: handleContinuePayment,
            }}
          />
        </View>
      </View>
    </View>
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
    gap: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    ...TextStyles.h1,
    color: BrandColors.primary,
    textAlign: "center",
  } as TextStyle,
  subtitle: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: BrandColors.bodyText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BrandColors.lightAccent + "20",
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    ...TextStyles.body,
    color: BrandColors.darkAccent,
    fontWeight: "600",
    flex: 1,
  } as TextStyle,
  cardInfo: {
    alignItems: "flex-end",
    flex: 2,
  },
  cardNumber: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    fontWeight: "bold",
  } as TextStyle,
  cardType: {
    ...TextStyles.bodySmall,
    color: NeutralColors.gray500,
    fontStyle: "italic",
  } as TextStyle,
  merchantInfo: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    fontWeight: "bold",
    flex: 2,
    textAlign: "right",
  } as TextStyle,
  amount: {
    ...TextStyles.body,
    color: BrandColors.primary,
    fontWeight: "bold",
    flex: 2,
    textAlign: "right",
  } as TextStyle,
  perPersonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: BrandColors.bodyText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BrandColors.lightAccent + "20",
  },
  perPersonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  perPersonLabel: {
    ...TextStyles.body,
    color: BrandColors.darkAccent,
    fontWeight: "600",
  } as TextStyle,
  perPersonAmount: {
    ...TextStyles.body,
    color: BrandColors.primary,
    fontWeight: "bold",
  } as TextStyle,
  actionSection: {
    marginTop: 8,
  },
  loadingSection: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
  } as TextStyle,
  errorSection: {
    alignItems: "center",
    gap: 20,
  },
  errorText: {
    ...TextStyles.body,
    color: BrandColors.secondary,
    textAlign: "center",
  } as TextStyle,
  successSection: {
    alignItems: "center",
    gap: 24,
  },
  successTitle: {
    ...TextStyles.h1,
    color: BrandColors.primary,
    textAlign: "center",
  } as TextStyle,
  successSubtitle: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: BrandColors.bodyText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: BrandColors.lightAccent + "20",
    width: "100%",
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  successLabel: {
    ...TextStyles.body,
    color: BrandColors.darkAccent,
    fontWeight: "600",
  } as TextStyle,
  successValue: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    fontWeight: "bold",
  } as TextStyle,
  successNote: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
}); 