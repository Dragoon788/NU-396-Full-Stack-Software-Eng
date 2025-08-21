const express = require("express");
const http = require("http");
const { Server: ioServer } = require("socket.io");
const app = express();
// const router = express.Router();
const { sequelize, connectToDb } = require("./models/db");
const { Group, User } = require("./models/models");
const groupRoutes = require("./routes/groupRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const nfcRoutes = require("./routes/nfcRoutes");
const PORT = 3001;

// Create HTTP server and integrate Socket.IO
const httpServer = http.createServer(app);
const io = new ioServer(httpServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  },
});

// Export io instance for use in controllers
module.exports = { io };

// More detailed logging for debugging
const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} - ${
        res.statusCode
      } - ${duration}ms`
    );
  });
  next();
};

app.use(express.json());
app.use(logRequest);

// Add CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Test route to keep server alive
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Debug route to check Socket.IO room status
app.get("/debug/rooms", async (req, res) => {
  try {
    const rooms = {};
    const allRooms = io.sockets.adapter.rooms;
    
    for (const [roomName, socketSet] of allRooms) {
      // Only show group rooms (not individual socket rooms)
      if (roomName.startsWith('group-')) {
        rooms[roomName] = {
          socketCount: socketSet.size,
          sockets: Array.from(socketSet)
        };
      }
    }
    
    res.json({
      totalRooms: Object.keys(rooms).length,
      rooms: rooms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use("/group", groupRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/nfc", nfcRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to our prototype for our payment application");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message,
  });
});

// Keep track of connection errors
let connectionErrors = 0;
const MAX_CONNECTION_ERRORS = 5;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  connectionErrors++;
  if (connectionErrors > MAX_CONNECTION_ERRORS) {
    console.error("Too many connection errors, shutting down...");
    shutdown();
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  connectionErrors++;
  if (connectionErrors > MAX_CONNECTION_ERRORS) {
    console.error("Too many connection errors, shutting down...");
    shutdown();
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  try {
    await sequelize.close();
    console.log("Database connections closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Keep the process running
process.stdin.resume();

let server;
const startServer = async () => {
  try {
    await connectToDb();
    server = httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log("Press Ctrl+C to stop the server");
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      connectionErrors++;
      if (connectionErrors > MAX_CONNECTION_ERRORS) {
        console.error("Too many server errors, shutting down...");
        shutdown();
      }
    });

    // Keep the connection alive
    setInterval(() => {
      sequelize
        .authenticate()
        .then(() => {
          connectionErrors = 0; // Reset error count on successful connection
        })
        .catch((err) => {
          console.error("Database connection error:", err);
          connectionErrors++;
          if (connectionErrors > MAX_CONNECTION_ERRORS) {
            console.error("Too many database errors, shutting down...");
            shutdown();
          }
        });
    }, 5000); // Check every 5 seconds

    // Keep track of recent approval events to prevent duplicates
    const recentApprovals = new Map(); // userId -> timestamp
    
    // Socket.IO connection handling
    io.on("connection", async (socket) => {
      console.log("🔌 User connected:", socket.id);

      // Debug: Log all rooms when socket connects
      console.log("🏠 Socket initial rooms:", Array.from(socket.rooms));

      // Join a group room
      socket.on("joinGroup", async (data) => {
        const { groupId, userId } = data;
        console.log(`🔌 User ${userId || 'unknown'} joining group ${groupId} via WebSocket (Socket ID: ${socket.id})`);
        
        // Join the socket to the group room
        socket.join(`group-${groupId}`);
        console.log(`📍 Socket ${socket.id} joined room group-${groupId}. Current rooms:`, Array.from(socket.rooms));
        
        // Get all sockets in this room for debugging
        const socketsInRoom = await io.in(`group-${groupId}`).allSockets();
        console.log(`👥 Total sockets in group-${groupId}:`, socketsInRoom.size, Array.from(socketsInRoom));
        
        try {
          // Fetch real-time group data from database
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
            
            console.log(`📡 Broadcasting initial group state to room group-${groupId} (${socketsInRoom.size} sockets)`);
            
            // Send current group state to ALL users in the room (including the new joiner)
            // This ensures everyone sees the updated member list
            io.to(`group-${groupId}`).emit("groupState", groupData);
            
            console.log(`✅ Broadcasted updated group state to all ${group.Users.length} members in group ${groupId}`);
            
            // Only emit userJoined event if we have a specific userId (not from GroupProvider)
            if (userId && userId !== 'null') {
              const joiningUser = group.Users.find(u => u.UID === parseInt(userId));
              if (joiningUser) {
                console.log(`👋 Broadcasting userJoined event for ${joiningUser.username} to other sockets`);
                socket.to(`group-${groupId}`).emit("userJoined", {
                  userId,
                  username: joiningUser.username,
                  message: `${joiningUser.username} joined the group!`
                });
              }
            }
          }
        } catch (error) {
          console.error("🚨 Error fetching group data:", error);
          socket.emit("error", { message: "Could not fetch group data" });
        }
      });

      // Handle user approval
      socket.on("userApproval", async (data) => {
        const { groupId, userId, approved } = data;
        console.log(`📝 User ${userId} ${approved ? "approved" : "unapproved"} in group ${groupId} (Socket: ${socket.id})`);
        
        // Check for duplicate requests within 1 second
        const approvalKey = `${userId}-${groupId}-${approved}`;
        const now = Date.now();
        const lastApproval = recentApprovals.get(approvalKey);
        
        if (lastApproval && (now - lastApproval) < 1000) {
          console.log(`⚠️ Ignoring duplicate approval event for user ${userId} (within 1 second)`);
          return;
        }
        
        // Record this approval event
        recentApprovals.set(approvalKey, now);
        
        // Clean up old entries (older than 5 seconds)
        for (const [key, timestamp] of recentApprovals.entries()) {
          if (now - timestamp > 5000) {
            recentApprovals.delete(key);
          }
        }
        
        try {
          // Update user approval status in database
          const updateResult = await User.update(
            { approval_status: approved },
            { where: { UID: userId } }
          );
          console.log(`📊 Database update result:`, updateResult);

          // Only proceed if the database was actually updated
          if (updateResult[0] > 0) {
            // Fetch updated group data
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
              
              // Get current room members for debugging
              const socketsInRoom = await io.in(`group-${groupId}`).allSockets();
              console.log(`📡 Broadcasting approval update to group-${groupId}:`, {
                userId,
                approved,
                totalMembers: group.Users.length,
                roomName: `group-${groupId}`,
                socketsInRoom: Array.from(socketsInRoom),
                sendingSocket: socket.id,
                socketRooms: Array.from(socket.rooms)
              });
              
              // Broadcast updated group state to all users in the group
              io.to(`group-${groupId}`).emit("groupState", groupData);
              
              console.log(`✅ Broadcasted updated group state to all ${socketsInRoom.size} sockets in group ${groupId}`);
              
              // Check if all members have approved
              const allApproved = group.Users.every(user => user.approval_status);
              console.log(`🔍 All members approved check: ${allApproved}`);
              if (allApproved) {
                console.log(`🎉 All members approved! Broadcasting allApproved event to group-${groupId}`);
                io.to(`group-${groupId}`).emit("allApproved", {
                  message: "All members have approved the transaction!"
                });
              }
            } else {
              console.error(`❌ Group ${groupId} not found when updating approval`);
            }
          } else {
            console.log(`ℹ️ No database update needed for user ${userId} - already in desired state`);
          }
        } catch (error) {
          console.error("🚨 Error updating approval status:", error);
          socket.emit("error", { message: "Could not update approval status" });
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        console.log("🏠 Socket was in rooms:", Array.from(socket.rooms));
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();