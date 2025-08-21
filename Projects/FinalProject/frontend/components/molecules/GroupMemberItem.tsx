import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TextStyles } from "@/constants/Typography";
import { BrandColors, NeutralColors } from "@/constants/Colors";

interface GroupMemberItemProps {
  name: string;
  isApproved: boolean;
  isCurrentUser?: boolean;
  onApprovalToggle?: () => void;
}

export const GroupMemberItem: React.FC<GroupMemberItemProps> = ({
  name,
  isApproved,
  isCurrentUser = false,
  onApprovalToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading || !onApprovalToggle) return;
    
    setIsLoading(true);
    try {
      await onApprovalToggle();
    } finally {
      // Reset loading after a short delay to prevent rapid clicks
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {name} {isCurrentUser && "(You)"}
        </Text>
      </View>
      
      {isCurrentUser && onApprovalToggle ? (
        // Current user gets an interactive approval button
        <TouchableOpacity
          style={[
            styles.approvalButton,
            isApproved ? styles.approvedButton : styles.pendingButton,
            isLoading && styles.loadingButton
          ]}
          onPress={handleToggle}
          disabled={isLoading}
        >
          <Text style={[
            styles.buttonText,
            isApproved ? styles.approvedButtonText : styles.pendingButtonText,
            isLoading && styles.loadingButtonText
          ]}>
            {isLoading ? "..." : (isApproved ? "✓ Approved" : "Tap to Approve")}
          </Text>
        </TouchableOpacity>
      ) : (
        // Other users just show status
        <View
          style={[
            styles.statusContainer,
            isApproved ? styles.approved : styles.pending,
          ]}
        >
          <Text
            style={[
              styles.status,
              isApproved ? styles.approvedText : styles.pendingText,
            ]}
          >
            {isApproved ? "✓ Approved" : "Pending"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NeutralColors.gray200,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    ...TextStyles.body,
    fontWeight: "500",
    color: BrandColors.bodyText,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  approved: {
    backgroundColor: `${BrandColors.primary}10`,
  },
  pending: {
    backgroundColor: NeutralColors.gray100,
  },
  status: {
    ...TextStyles.bodySmall,
    fontWeight: "500",
  },
  approvedText: {
    color: BrandColors.primary,
  },
  pendingText: {
    color: NeutralColors.gray500,
  },
  approvalButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    padding: 12,
    borderRadius: 20,
    gap: 4,
  },
  approvedButton: {
    backgroundColor: BrandColors.primary,
  },
  pendingButton: {
    backgroundColor: NeutralColors.gray100,
  },
  buttonText: {
    ...TextStyles.bodySmall,
    fontWeight: "500",
  },
  approvedButtonText: {
    color: "#FFFFFF",
  },
  pendingButtonText: {
    color: BrandColors.primary,
  },
  loadingButton: {
    backgroundColor: NeutralColors.gray200,
  },
  loadingButtonText: {
    color: NeutralColors.gray500,
  },
}); 