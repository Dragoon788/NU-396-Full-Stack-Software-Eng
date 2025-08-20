const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

// test logic
router.get("/test", groupController.test);

// a post to application with payment amount, etc. to handle group creation
router.post("/create", groupController.createGroup);

// A post to application with joinID and name to handle group joining
router.post("/join", groupController.joinGroup);

// A Post to databse to delete a group from Groups table'
router.post("/delete/:groupID", groupController.deleteGroup);

// A post to database to update individual's approval status and notify admin
router.post("/approve/:userID", groupController.groupApprove);

// A post to
router.post("/final-approve/:groupID", groupController.finalApprove);

// Get group details
router.get("/:groupId", groupController.getGroupDetails);

// Update total amount
router.put("/:groupId/total", groupController.updateTotalAmount);

module.exports = router;
