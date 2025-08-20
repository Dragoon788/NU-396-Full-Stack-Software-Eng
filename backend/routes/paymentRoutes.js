const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Test the webhook endpoint
router.get('/test', paymentController.test);

// Payment method management
router.post('/method', paymentController.addPaymentMethod);
router.get('/method/:userId', paymentController.getPaymentMethod);

// Payment processing
router.post('/process', paymentController.processPayment);

// A Post to a webhook for card generation?
router.post('/card', paymentController.generateCard);

// A call to database to get receipt of all recent transactions
router.get('/transactions', paymentController.recentTransactions);

module.exports = router;



// // A call to database to get receipt of most recent payment
// // PROB DONT NEED RIGHT
// router.get('/', )