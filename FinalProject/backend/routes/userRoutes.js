const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// test logic
router.get('/test', userController.test);

// a post to application with payment amount, etc. to handle group creation 
router.post('/create', userController.createUser);

// a post to update a user's groupID
router.post('/setGroup', userController.setGroupID);

// cleanup orphaned users (users without groups)
router.post('/cleanup', userController.cleanupOrphanedUsers);

module.exports = router;
