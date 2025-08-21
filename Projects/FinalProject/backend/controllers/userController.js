const { Group, User } = require("../models/models");
const { Op } = require("sequelize");

// Code for handling logic of user creation and groupID updating

// test logic
exports.test = (req, res) => {
  res.status(200).send({
    id: 2012313,
    approved: true,
  });
};

// logic for implementing user creation with duplicate prevention
exports.createUser = async (req, res) => {
  console.log("Received create user request");
  console.log("Request body:", req.body);

  const { username } = req.body;
  if (!username) {
    console.log("Username missing in request");
    return res.status(400).json({
      error: "Username is required",
    });
  }

  console.log("Attempting to create user with username:", username);

  try {
    // Check for existing user with same username
    const existingUser = await User.findOne({ 
      where: { username: username.trim() } 
    });

    if (existingUser) {
      console.log("User with username already exists:", existingUser.toJSON());
      
      // If user exists but has no group (orphaned), reuse them
      if (!existingUser.groupID) {
        console.log("Reusing orphaned user with same username");
        res.status(200).json({
          message: "Existing user found and reused",
          user: existingUser.toJSON(),
        });
        return;
      }
      
      // If user exists and has a group, suggest a different username
      return res.status(409).json({
        error: "Username already taken. Please choose a different name.",
      });
    }

    console.log("Creating new user in database...");
    const user = await User.create({ username: username.trim() });
    console.log("User created successfully:", user.toJSON());
    res.status(201).json({
      message: "User created successfully",
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({
      error: "Could not create user",
      details: err.message,
    });
  }
};

// logic for cleaning up orphaned users (users without groups)
exports.cleanupOrphanedUsers = async (req, res) => {
  try {
    console.log("Starting orphaned user cleanup...");
    
    // Find users who don't have a groupID (orphaned users)
    const orphanedUsers = await User.findAll({
      where: {
        groupID: {
          [Op.is]: null
        }
      }
    });

    console.log(`Found ${orphanedUsers.length} orphaned users`);

    // Delete orphaned users older than 1 hour (or your preferred timeframe)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await User.destroy({
      where: {
        groupID: {
          [Op.is]: null
        },
        createdAt: {
          [Op.lt]: oneHourAgo
        }
      }
    });

    console.log(`Cleaned up ${result} orphaned users`);
    res.status(200).json({
      message: "Cleanup completed",
      orphanedUsersFound: orphanedUsers.length,
      usersDeleted: result
    });
  } catch (err) {
    console.error("Error during cleanup:", err);
    res.status(500).json({
      error: "Could not complete cleanup",
      details: err.message,
    });
  }
};

// logic for setting a users ID
exports.setGroupIDByUID = async (userID, newGroupID) => {
  const user = await User.findByPk(userID);
  if (!user) throw new Error("User not found");
  const group = await Group.findByPk(newGroupID);
  if (!group) throw new Error("Group not found");

  user.groupID = newGroupID;
  await user.save();
  return user;
};

exports.setGroupID = async (req, res) => {
  const { userID, newGroupID } = req.body;
  // use sequelize function to insert new group into database and respond once created
  try {
    const updatedUser = await exports.setGroupIDByUID(userID, newGroupID);
    res.status(201).json({ message: "User updated", updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Could not update user", details: err.message });
  }
};
