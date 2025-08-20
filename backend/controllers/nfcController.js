// NFC Controller for handling NFC card generation and payment processing

// Function to get the io instance (lazy loading to avoid circular imports)
const getIO = () => {
  return require("../app").io;
};

// Cleanup function to expire old unused cards
const expireOldCards = async () => {
    try {
        const { NFCCard } = require("../models/models");
        
        // Expire cards older than 24 hours that are still active
        const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        const expiredCards = await NFCCard.update(
            { status: 'expired' },
            { 
                where: {
                    status: 'active',
                    createdAt: {
                        [require('sequelize').Op.lt]: expiryTime
                    }
                }
            }
        );
        
        if (expiredCards[0] > 0) {
            console.log(`🕐 Expired ${expiredCards[0]} old unused NFC cards`);
        }
    } catch (error) {
        console.error("❌ Error expiring old cards:", error);
    }
};

// Set up periodic cleanup (run every hour)
setInterval(expireOldCards, 60 * 60 * 1000); // 1 hour

// Generate a one-time use virtual card
const generateVirtualCard = () => {
    // Generate a random 16-digit card number
    const cardNumber = Array.from({length: 16}, () => Math.floor(Math.random() * 10)).join('');
    // Generate a random 3-digit CVV
    const cvv = Array.from({length: 3}, () => Math.floor(Math.random() * 10)).join('');
    // Generate expiry date (1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryMonth = expiryDate.getMonth() + 1;
    const expiryYear = expiryDate.getFullYear().toString().slice(-2);
    
    return {
        cardNumber,
        cvv,
        expiryDate: `${expiryMonth.toString().padStart(2, '0')}/${expiryYear}`,
    };
};

// Generate NFC card for group payment
exports.generateNFCCard = async (req, res) => {
    const { groupId, totalAmount } = req.body;
    
    try {
        const { NFCCard } = require("../models/models");
        
        // Generate virtual card details
        const virtualCard = generateVirtualCard();
        const nfcCardId = "NFC_" + Math.random().toString(36).substr(2, 9);
        
        // Store the card in database
        const storedCard = await NFCCard.create({
            nfcCardId: nfcCardId,
            groupID: groupId,
            cardNumber: virtualCard.cardNumber,
            cvv: virtualCard.cvv,
            expiryDate: virtualCard.expiryDate,
            totalAmount: totalAmount,
            status: 'active'
        });
        
        console.log(`💳 Generated NFC card ${nfcCardId} for group ${groupId} - Amount: $${totalAmount}`);
        
        res.status(200).send({
            success: true,
            nfcCardId: nfcCardId,
            groupId: groupId,
            amount: totalAmount,
            cardDetails: {
                lastFour: virtualCard.cardNumber.slice(-4),
                expiryDate: virtualCard.expiryDate,
                // Don't send full card number or CVV in response
            },
            message: "NFC card generated successfully for group payment"
        });
        
    } catch (error) {
        console.error("❌ Error generating NFC card:", error);
        res.status(500).send({
            success: false,
            error: "Failed to generate NFC card",
            details: error.message
        });
    }
};

// Process NFC payment
exports.processNFCPayment = async (req, res) => {
    const { nfcCardId, amount, groupId } = req.body;
    
    // Generate transaction ID
    const transactionId = "NFC_TXN_" + Math.random().toString(36).substr(2, 9);
    
    console.log(`📋 Processing payment for group ${groupId} (type: ${typeof groupId})`);
    console.log(`💰 Amount: $${amount}, NFC Card: ${nfcCardId}`);
    
    try {
        // Get database models
        const { Group, User, NFCCard } = require("../models/models");
        
        // 1. Verify the NFC card exists and is active
        const nfcCard = await NFCCard.findOne({
            where: { 
                nfcCardId: nfcCardId,
                groupID: groupId
            }
        });
        
        if (!nfcCard) {
            console.log(`❌ NFC card ${nfcCardId} not found for group ${groupId}`);
            return res.status(404).send({
                success: false,
                error: "NFC card not found",
                message: "Invalid or expired payment card"
            });
        }
        
        if (nfcCard.status !== 'active') {
            console.log(`❌ NFC card ${nfcCardId} is ${nfcCard.status}, not active`);
            return res.status(400).send({
                success: false,
                error: "Card not active",
                message: `NFC card is ${nfcCard.status} and cannot be used`
            });
        }
        
        // 2. Verify the amount matches
        const expectedAmount = parseFloat(nfcCard.totalAmount);
        const requestedAmount = parseFloat(amount);
        if (Math.abs(expectedAmount - requestedAmount) > 0.01) { // Allow for small rounding differences
            console.log(`❌ Amount mismatch: expected $${expectedAmount}, got $${requestedAmount}`);
            return res.status(400).send({
                success: false,
                error: "Amount mismatch",
                message: "Payment amount does not match card amount"
            });
        }
        
        console.log(`✅ NFC card ${nfcCardId} verified - proceeding with payment`);
        
        // Ensure groupId is treated as a number for socket rooms
        const normalizedGroupId = parseInt(groupId);
        console.log(`🔧 Normalized groupId: ${normalizedGroupId} (type: ${typeof normalizedGroupId})`);
        
        // 3. Deactivate the NFC card (mark as used)
        await NFCCard.update(
            { 
                status: 'used',
                usedAt: new Date(),
                transactionId: transactionId
            },
            { where: { nfcCardId: nfcCardId } }
        );
        console.log(`🔒 NFC card ${nfcCardId} marked as used`);
        
        // 4. FIRST: Emit payment completion event to all group members (while they're still in the group)
        const io = getIO();
        const roomName = `group-${normalizedGroupId}`;
        console.log(`📡 Attempting to emit to room: ${roomName}`);
        
        io.to(roomName).emit("paymentComplete", {
            transactionId: transactionId,
            groupId: normalizedGroupId,
            amount: parseFloat(amount),
            message: "Payment has been completed successfully!"
        });
        
        console.log(`💳 Payment completed for group ${normalizedGroupId}: $${amount} (Transaction: ${transactionId})`);
        console.log(`📡 Broadcasted payment completion to ${roomName}`);
        
        // 5. THEN: Group cleanup after successful payment (after users have been notified)
        console.log(`🧹 Starting group cleanup for group ${normalizedGroupId}...`);
        
        // Mark the group as completed
        await Group.update(
            { status: 'completed' },
            { where: { groupID: normalizedGroupId } }
        );
        console.log(`✅ Group ${normalizedGroupId} marked as completed`);
        
        // Remove all users from the group (reset their groupID to null)
        const usersRemoved = await User.update(
            { groupID: null, approval_status: false },
            { where: { groupID: normalizedGroupId } }
        );
        console.log(`✅ Removed ${usersRemoved[0]} users from completed group ${normalizedGroupId}`);
        
        res.status(200).send({
            success: true,
            transactionId: transactionId,
            nfcCardId: nfcCardId,
            groupId: normalizedGroupId,
            amount: parseFloat(amount),
            status: "completed",
            cardStatus: "used",
            message: "NFC payment processed successfully"
        });
        
    } catch (error) {
        console.error("❌ Error during payment processing or group cleanup:", error);
        res.status(500).send({
            success: false,
            error: "Payment processing failed",
            details: error.message
        });
    }
};

// Get NFC card status
exports.getNFCCardStatus = async (req, res) => {
    const { nfcCardId } = req.params;
    
    try {
        const { NFCCard } = require("../models/models");
        
        // Check the card status in the database
        const nfcCard = await NFCCard.findOne({
            where: { nfcCardId: nfcCardId }
        });
        
        if (!nfcCard) {
            return res.status(404).send({
                success: false,
                error: "NFC card not found",
                message: "Card does not exist or has been deleted"
            });
        }
        
        res.status(200).send({
            success: true,
            nfcCardId: nfcCardId,
            status: nfcCard.status,
            groupId: nfcCard.groupID,
            totalAmount: nfcCard.totalAmount,
            createdAt: nfcCard.createdAt,
            usedAt: nfcCard.usedAt,
            transactionId: nfcCard.transactionId,
            message: `NFC card is ${nfcCard.status}`
        });
        
    } catch (error) {
        console.error("❌ Error checking NFC card status:", error);
        res.status(500).send({
            success: false,
            error: "Failed to check card status",
            details: error.message
        });
    }
}; 