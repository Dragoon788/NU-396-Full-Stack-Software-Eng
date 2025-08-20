const express = require('express');
const router = express.Router();
const nfcController = require('../controllers/nfcController');

// Generate NFC card for group payment
router.post('/generate', nfcController.generateNFCCard);

// Process payment using NFC card
router.post('/process', nfcController.processNFCPayment);

// Get NFC card status
router.get('/status/:nfcCardId', nfcController.getNFCCardStatus);

module.exports = router; 