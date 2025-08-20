import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextStyle,
  ViewStyle,
  Alert,
  TextInput as RNTextInput,
  TouchableOpacity,
} from "react-native";
import { Button, TextInput } from "@/components/atoms";
import { GroupMemberItem } from "@/components/molecules";
import { useGroup } from "./providers/group-provider";
import { useUser } from "./providers/user-provider";
import { TextStyles } from "@/constants/Typography";
import { BrandColors, NeutralColors } from "@/constants/Colors";
import { API_URL } from "@/config/api";
import { connectSocket, disconnectSocket } from "../socket.js";
import { router } from "expo-router";
import { clearAllPersistedData } from "@/hooks/usePersistence";

const textStyles = {
  label: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    fontWeight: "600",
    marginBottom: 8,
  } as TextStyle,
  groupId: {
    ...TextStyles.body,
    color: BrandColors.darkAccent,
    fontWeight: "bold",
  } as TextStyle,
  amount: {
    ...TextStyles.body,
    color: BrandColors.primary,
    fontWeight: "bold",
  } as TextStyle,
  waitingText: {
    ...TextStyles.bodySmall,
    color: NeutralColors.gray500,
    textAlign: "center",
    fontStyle: "italic",
  } as TextStyle,
  sectionTitle: {
    ...TextStyles.h4,
    color: BrandColors.primary,
    marginBottom: 12,
  } as TextStyle,
  statusConnected: {
    ...TextStyles.bodySmall,
    color: BrandColors.lightAccent,
    fontWeight: "600",
  } as TextStyle,
  statusDisconnected: {
    ...TextStyles.bodySmall,
    color: BrandColors.secondary,
    fontWeight: "600",
  } as TextStyle,
};

type GroupMember = {
  UID: number;
  username: string;
  approval_status: boolean;
};

type GroupDetails = {
  groupId: number;
  adminId: number;
  totalAmount: number;
  approvalStatus: boolean;
  members: GroupMember[];
};

export default function GroupPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [billTotal, setBillTotal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    transactionId: string;
    amount: number;
  } | null>(null);
  const { groupId, isGroupLoaded, setGroupId, socketConnected } = useGroup();
  const { userId, isUserLoaded } = useUser();

  // Helper function to safely convert to number
  const safeToNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Approval toggle function
  const handleApprovalToggle = async () => {
    if (!groupId || !userId) return;
    
    // Find current user's approval status
    const currentUser = groupDetails?.members.find(member => member.UID === Number(userId));
    const currentApprovalStatus = currentUser?.approval_status || false;
    const newApprovalStatus = !currentApprovalStatus;
    
    console.log(`Toggling approval: ${currentApprovalStatus} -> ${newApprovalStatus}`);
    
    // Optimistically update the UI immediately
    if (groupDetails) {
      const updatedMembers = groupDetails.members.map(member => 
        member.UID === Number(userId) 
          ? { ...member, approval_status: newApprovalStatus }
          : member
      );
      setGroupDetails({
        ...groupDetails,
        members: updatedMembers
      });
    }
    
    // Use the global socket connection (don't create a new one)
    const socket = connectSocket();
    console.log(`📡 Sending approval via socket ${socket.id} to group ${groupId}`);
    socket.emit("userApproval", {
      groupId,
      userId: Number(userId),
      approved: newApprovalStatus
    });
  };

  const isLeader = groupDetails?.adminId === Number(userId);

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/group/${groupId}`);
      const data = await response.json();

      if (response.ok) {
        console.log('Backend response data:', data.group);
        console.log('totalAmount type:', typeof data.group.totalAmount);
        console.log('totalAmount value:', data.group.totalAmount);
        setGroupDetails(data.group);
        setBillTotal(data.group.totalAmount ? data.group.totalAmount.toString() : "0");
      } else {
        Alert.alert("Error", "Could not fetch group details");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // Update total amount
  const updateTotalAmount = async () => {
    console.log("🔧 Starting amount update...", {
      groupId,
      currentAmount: billTotal,
      newAmount: parseFloat(billTotal)
    });
    
    try {
      const response = await fetch(`${API_URL}/group/${groupId}/total`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalAmount: parseFloat(billTotal),
        }),
      });

      const data = await response.json();
      console.log("📡 Backend response:", { status: response.status, data });

      if (response.ok) {
        setIsEditing(false);
        console.log("✅ Amount updated successfully:", data.message);
        
        // The WebSocket will handle updating the UI with reset approvals
        // Just show a success message
        Alert.alert("Success", "Amount updated! All member approvals have been reset.");
      } else {
        console.log("❌ Error updating amount:", data);
        Alert.alert("Error", data.error || "Could not update total amount");
      }
    } catch (error) {
      console.error("🚨 Network error updating amount:", error);
      Alert.alert("Error", "Could not connect to server");
    }
  };

  // Handle joining a new group - clear all state and navigate to name entry
  const handleJoinNewGroup = async () => {
    console.log("🔄 Starting new group flow from group page - clearing all state and navigating to name entry");
    
    // Clear all state from providers
    setGroupId(null);
    
    // Clear all persisted data
    await clearAllPersistedData();
    
    // Navigate back to the name entry page
    router.replace("/");
  };

  // Initial fetch and socket setup
  useEffect(() => {
    // Wait for both user and group data to load from persistence
    if (!isUserLoaded || !isGroupLoaded) {
      return;
    }

    console.log("Group page mounted with groupId:", groupId);
    console.log("User ID:", userId);
    
    if (groupId && userId) {
      fetchGroupDetails();
      
      // Use the global socket connection (managed by GroupProvider)
      // DON'T create a new connection - just get the existing one
      console.log("🔌 Using global WebSocket connection for group:", groupId);
      const socket = connectSocket();
      
      // Remove any existing listeners to prevent duplicates
      socket.off("groupState");
      socket.off("allApproved");
      socket.off("userJoined");
      socket.off("paymentComplete");
      socket.off("error");
      
      // Ensure we're joined to the group room with userId (only if connected)
      if (socket.connected) {
        console.log("📡 Re-joining group room with userId:", { groupId, userId });
        socket.emit("joinGroup", { groupId, userId });
      } else {
        // If not connected yet, wait for connection then join
        socket.once("connect", () => {
          console.log("📡 Socket connected, joining group room with userId:", { groupId, userId });
          socket.emit("joinGroup", { groupId, userId });
        });
      }
      
      // Listen for real-time group updates
      socket.on("groupState", (data: GroupDetails) => {
        console.log("🔄 Received real-time group state update:", {
          groupId: data.groupId,
          totalAmount: data.totalAmount,
          membersCount: data.members.length,
          allMembersApproved: data.members.every(m => m.approval_status),
          memberApprovals: data.members.map(m => ({ id: m.UID, name: m.username, approved: m.approval_status }))
        });
        
        // Check if this is an approval reset (all members now have approval_status = false)
        const allApprovalsReset = data.members.every(member => !member.approval_status);
        const previouslyHadApprovals = groupDetails?.members.some(member => member.approval_status);
        
        // If approvals were reset but there were previous approvals, it's likely due to amount change
        if (allApprovalsReset && previouslyHadApprovals) {
          console.log("✅ All approvals were reset - likely due to amount change");
          // Don't show additional alert here since updateTotalAmount already shows one
        }
        
        // Update the group details with new data
        console.log("📝 Updating local group state...");
        setGroupDetails(data);
        
        // Also update the bill total input if it was changed by admin
        if (data.totalAmount !== undefined) {
          console.log(`💰 Updating bill total from ${billTotal} to ${data.totalAmount}`);
          setBillTotal(data.totalAmount.toString());
        }
        
        // Show success message if current user's approval status changed
        const currentUser = data.members.find(member => member.UID === Number(userId));
        if (currentUser) {
          const previousUser = groupDetails?.members.find(member => member.UID === Number(userId));
          if (previousUser && currentUser.approval_status !== previousUser.approval_status) {
            const message = currentUser.approval_status 
              ? "✅ Payment approved!" 
              : "❌ Approval revoked";
            console.log("🔔 User approval status changed:", message);
          }
        }
      });
      
      // Listen for when all members approve
      socket.on("allApproved", (data: { message: string }) => {
        console.log("All members approved:", data);
        Alert.alert("Success", data.message);
      });
      
      // Listen for when users join
      socket.on("userJoined", (data: { userId: string; username: string; message: string }) => {
        console.log("User joined:", data);
      });
      
      // Listen for payment completion
      socket.on("paymentComplete", (data: { transactionId: string; groupId: number; amount: number; message: string }) => {
        console.log("🎉 Payment completed event received:", data);
        console.log(`💰 Transaction ID: ${data.transactionId}, Amount: $${data.amount}`);
        console.log(`👥 Current user ID: ${userId}, Group ID: ${groupId}`);
        setPaymentDetails({
          transactionId: data.transactionId,
          amount: data.amount
        });
        setPaymentComplete(true);
        console.log("✅ Payment complete state updated - showing success screen");
      });
      
      // Listen for errors
      socket.on("error", (error: any) => {
        console.error("🚨 Socket connection error:", error);
      });

      // Cleanup function - only remove listeners, don't disconnect global socket
      return () => {
        console.log("Cleaning up socket listeners (keeping global connection)");
        socket.off("groupState");
        socket.off("allApproved");
        socket.off("userJoined");
        socket.off("paymentComplete");
        socket.off("error");
        // DON'T call disconnectSocket() - let GroupProvider manage the connection
      };
    } else {
      // If no groupId or userId after loading, stop loading
      setIsLoading(false);
    }
  }, [groupId, userId, isGroupLoaded, isUserLoaded]);

  // Show loading while waiting for persistence to load or while fetching data
  if (!isUserLoaded || !isGroupLoaded || (isLoading && (groupId && userId))) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={textStyles.label}>Loading group details...</Text>
        </View>
      </View>
    );
  }

  // If no groupId after persistence loads, user hasn't joined a group yet
  if (!groupId) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={textStyles.label}>No group found. Please join or create a group.</Text>
        </View>
      </View>
    );
  }

  // If no group details loaded yet but we have groupId, still loading
  if (!groupDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={textStyles.label}>Loading group details...</Text>
        </View>
      </View>
    );
  }

  const memberCount = groupDetails.members.length; // Admin is included in members list
  const totalAmount = safeToNumber(groupDetails.totalAmount);
  const costPerPerson = totalAmount > 0
    ? `$${(totalAmount / memberCount).toFixed(2)}`
    : "$0.00";

  const allMembersApproved = groupDetails.members.every(
    (member) => member.approval_status
  );

  // If payment is complete, show the success screen
  if (paymentComplete && paymentDetails) {
    const memberCount = groupDetails.members.length;
    const amountPerPerson = paymentDetails.amount / memberCount;
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.paymentCompleteSection}>
          <Text style={styles.paymentCompleteTitle}>Payment Complete!</Text>
          <Text style={styles.paymentCompleteSubtitle}>
            The group payment has been processed successfully
          </Text>
          
          <View style={styles.paymentCompleteCard}>
            <View style={styles.paymentCompleteRow}>
              <Text style={styles.paymentCompleteLabel}>Transaction ID:</Text>
              <Text style={styles.paymentCompleteValue}>{paymentDetails.transactionId}</Text>
            </View>
            <View style={styles.paymentCompleteRow}>
              <Text style={styles.paymentCompleteLabel}>Total Amount:</Text>
              <Text style={styles.paymentCompleteValue}>${paymentDetails.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentCompleteRow}>
              <Text style={styles.paymentCompleteLabel}>Your Share:</Text>
              <Text style={styles.paymentCompleteValue}>${amountPerPerson.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.paymentCompleteNote}>
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
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Socket Connection Status */}
      <View style={styles.statusBar}>
        <Text style={socketConnected ? textStyles.statusConnected : textStyles.statusDisconnected}>
          {socketConnected ? '🟢 Real-time Connected' : '🔴 Real-time Disconnected'}
        </Text>
      </View>

      {/* Group ID Section */}
      <View style={styles.section}>
        <Text style={textStyles.sectionTitle}>Group Information</Text>
        <View style={styles.infoRow}>
          <Text style={textStyles.label}>Group ID</Text>
          <Text style={textStyles.groupId}>{groupId}</Text>
        </View>
      </View>

      {/* Bill Total Section */}
      <View style={styles.section}>
        <Text style={textStyles.sectionTitle}>Bill Details</Text>
        {isLeader && isEditing ? (
          <View style={styles.editRow}>
            <View style={styles.editInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <RNTextInput
                placeholder="0.00"
                value={billTotal}
                onChangeText={setBillTotal}
                keyboardType="decimal-pad"
                style={styles.editInput}
              />
            </View>
            <TouchableOpacity
              onPress={updateTotalAmount}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.amountDisplaySection}>
            <View style={styles.infoRow}>
              <Text style={textStyles.label}>Total Amount</Text>
              <Text style={textStyles.amount}>
                ${safeToNumber(groupDetails.totalAmount).toFixed(2)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={textStyles.label}>Cost Per Person</Text>
              <Text style={textStyles.amount}>{costPerPerson}</Text>
            </View>
            {isLeader && (
              <Button
                label="Edit Amount"
                size="full"
                variant="secondary"
                action={{
                  type: "confirmation",
                  onConfirm: () => setIsEditing(true),
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* Members List Section */}
      <View style={styles.section}>
        <Text style={textStyles.sectionTitle}>Members ({memberCount})</Text>
        <View style={styles.membersList}>
          {groupDetails.members.map((member) => (
            <GroupMemberItem
              key={member.UID}
              name={member.username}
              isApproved={member.approval_status}
              isCurrentUser={member.UID === Number(userId)}
              onApprovalToggle={member.UID === Number(userId) ? handleApprovalToggle : undefined}
            />
          ))}
        </View>
      </View>

      {/* Final Approval Button (Leader Only) */}
      {isLeader && (
        <View style={styles.finalApproval}>
          <Button
            label="Proceed to Payment"
            size="full"
            variant={allMembersApproved ? "primary" : "primaryDisabled"}
            action={{
              type: "confirmation",
              onConfirm: () => {
                if (allMembersApproved) {
                  console.log("Proceeding to NFC payment confirmation");
                  router.push("/payment_confirmation");
                } else {
                  Alert.alert("Not Ready", "All members must approve before proceeding to payment.");
                }
              },
            }}
          />
          {!allMembersApproved && (
            <Text style={textStyles.waitingText}>
              Waiting for all members to approve...
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  } as ViewStyle,
  section: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: BrandColors.bodyText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  amountDisplaySection: {
    gap: 16,
  } as ViewStyle,
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  } as ViewStyle,
  editInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: BrandColors.lightAccent + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  } as ViewStyle,
  currencySymbol: {
    ...TextStyles.body,
    color: BrandColors.darkAccent,
    marginRight: 8,
    fontWeight: "bold",
    fontSize: 18,
  } as TextStyle,
  editInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.bodyText,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    lineHeight: 24,
  },
  membersList: {
    gap: 12,
  } as ViewStyle,
  finalApproval: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  } as ViewStyle,
  statusBar: {
    padding: 16,
    backgroundColor: BrandColors.lightAccent + "20",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: "center",
  } as ViewStyle,
  paymentCompleteSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 24,
  } as ViewStyle,
  paymentCompleteTitle: {
    ...TextStyles.h1,
    color: BrandColors.primary,
    textAlign: "center",
  } as TextStyle,
  paymentCompleteSubtitle: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
  paymentCompleteCard: {
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
  } as ViewStyle,
  paymentCompleteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  } as ViewStyle,
  paymentCompleteLabel: {
    ...TextStyles.body,
    color: BrandColors.darkAccent,
    fontWeight: "600",
  } as TextStyle,
  paymentCompleteValue: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    fontWeight: "bold",
  } as TextStyle,
  paymentCompleteNote: {
    ...TextStyles.body,
    color: BrandColors.bodyText,
    textAlign: "center",
    opacity: 0.8,
  } as TextStyle,
  actionSection: {
    marginTop: 8,
  } as ViewStyle,
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  editButtonText: {
    ...TextStyles.bodySmall,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  } as TextStyle,
});
