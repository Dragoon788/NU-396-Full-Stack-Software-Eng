const { Group, User } = require("../models/models");
const userController = require("./userController");

// Function to get the io instance (lazy loading to avoid circular imports)
const getIO = () => {
  return require("../app").io;
};

// Function to fetch and broadcast updated group data
const broadcastGroupUpdate = async (groupId) => {
  try {
    console.log(`🔄 Broadcasting group update for group ${groupId}...`);
    
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          attributes: ["UID", "username", "approval_status"],
        },
      ],
    });

    if (group) {
      const groupData = {
        groupId: group.groupID,
        adminId: group.adminID,
        totalAmount: group.total_amount,
        approvalStatus: group.approval_status,
        members: group.Users,
      };
      
      console.log(`📡 Emitting groupState to room 'group-${groupId}':`, {
        groupId: groupData.groupId,
        totalAmount: groupData.totalAmount,
        membersCount: groupData.members.length,
        memberApprovals: groupData.members.map(m => ({ id: m.UID, name: m.username, approved: m.approval_status }))
      });
      
      // Broadcast to all users in the group room
      const io = getIO();
      io.to(`group-${groupId}`).emit("groupState", groupData);
      console.log(`✅ Broadcasted group update for group ${groupId} to ${group.Users.length} members`);
    } else {
      console.log(`❌ Group ${groupId} not found for broadcasting`);
    }
  } catch (error) {
    console.error("🚨 Error broadcasting group update:", error);
  }
};

// Code for handling logic of group creation and joining

// test logic
exports.test = (req, res) => {
  res.status(200).send({
    id: 2012313,
    approved: true,
  });
};

// logic for implementing group creation
exports.createGroup = async (req, res) => {
  console.log("Received group creation request:", req.body);
  const { amount, creatorId } = req.body;

  if (!amount || !creatorId) {
    console.log("Missing required fields:", { amount, creatorId });
    return res.status(400).json({
      error: "Amount and creatorId are required",
      received: req.body,
    });
  }

  try {
    console.log("Creating group with:", { amount, creatorId });
    const group = await Group.create({
      group_name: `Group-${Date.now()}`, // Generate a default name
      total_amount: amount,
      adminID: creatorId,
    });

    console.log("Group created:", group.toJSON());

    // Set the creator's group ID
    await userController.setGroupIDByUID(creatorId, group.groupID);
    console.log("Creator's group ID updated");

    res.status(201).json({
      message: "Group created",
      groupId: group.groupID,
      group: group.toJSON(),
    });
  } catch (err) {
    console.error("Error creating group:", err);
    res
      .status(500)
      .json({ error: "Could not create group", details: err.message });
  }
};

// logic for implementing group joining
exports.joinGroup = async (req, res) => {
  const { newGroupID, userID } = req.body;

  try {
    // Get user details before joining
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if group exists
    const group = await Group.findByPk(newGroupID);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    console.log(`User ${user.username} (ID: ${userID}) joining group ${newGroupID}`);
    
    // Set the user's group ID
    await userController.setGroupIDByUID(userID, newGroupID);
    
    // Reset all user approval statuses since group composition changed
    await User.update(
      { approval_status: false },
      { where: { groupID: newGroupID } }
    );
    
    console.log(`User ${user.username} joined group ${newGroupID}. All user approvals reset due to membership change.`);
    
    // DON'T broadcast here - let the WebSocket joinGroup event handle real-time updates
    // This ensures the user has joined the socket room before any broadcasts happen
    
    res.status(200).json({ 
      message: "Joined group successfully",
      user: {
        id: user.UID,
        username: user.username
      }
    });
  } catch (err) {
    console.error("Error joining group:", err);
    res
      .status(500)
      .json({ error: "Failed to join group", details: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  const groupID = req.params.groupID;

  try {
    await Group.destroy({ where: { groupID } });
    res.status(200).json({
      message: "Group successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete group",
      details: err.message,
    });
  }
};

// logic for approving purchase and checking approval or websocket to update admin when all approve
exports.groupApprove = (req, res) => {
  const userId = req.params.userId;

  // Update database and check whether admin approval is ready
  res.status(200).send({});
};

// logic for admin approving payment and card
exports.finalApprove = (req, res) => {
  const groupId = req.params.groupId;

  // ensure admin approval is ready, generate card, and notify group
  res.status(200).send({});
};

// Get group details including members
exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findByPk(groupId, {
      where: { status: 'active' }, // Only fetch active groups
      include: [
        {
          model: User,
          attributes: ["UID", "username", "approval_status"],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found or already completed" });
    }

    res.status(200).json({
      group: {
        groupId: group.groupID,
        adminId: group.adminID,
        totalAmount: group.total_amount,
        approvalStatus: group.approval_status,
        status: group.status,
        members: group.Users,
      },
    });
  } catch (err) {
    console.error("Error fetching group details:", err);
    res
      .status(500)
      .json({ error: "Could not fetch group details", details: err.message });
  }
};

// Update group total amount
exports.updateTotalAmount = async (req, res) => {
  const { groupId } = req.params;
  const { totalAmount } = req.body;

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Update the total amount
    group.total_amount = totalAmount;
    await group.save();

    // Reset all user approval statuses since the amount changed
    await User.update(
      { approval_status: false },
      { where: { groupID: groupId } }
    );

    console.log(`Total amount updated for group ${groupId}. All user approvals reset.`);

    // Broadcast updated group state to all members in real-time
    await broadcastGroupUpdate(groupId);

    res.status(200).json({
      message: "Total amount updated and approvals reset",
      group: {
        groupId: group.groupID,
        totalAmount: group.total_amount,
      },
    });
  } catch (err) {
    console.error("Error updating total amount:", err);
    res
      .status(500)
      .json({ error: "Could not update total amount", details: err.message });
  }
};

// Export the broadcastGroupUpdate function for use in other parts of the app
exports.broadcastGroupUpdate = broadcastGroupUpdate;
