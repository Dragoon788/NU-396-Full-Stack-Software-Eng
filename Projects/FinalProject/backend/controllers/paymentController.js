// Code for handling logic of payment features

const { PaymentMethod, User } = require("../models/models");

// Mock payment processor functions (in real app, use Stripe/Square/etc.)
const mockTokenizeCard = (cardData) => {
  // In real implementation, this would call Stripe/Square API to tokenize card
  return {
    token: `tok_${Math.random().toString(36).substr(2, 9)}`,
    last_four: cardData.cardNumber.slice(-4),
    brand: detectCardBrand(cardData.cardNumber),
  };
};

const detectCardBrand = (cardNumber) => {
  const firstDigit = cardNumber.charAt(0);
  const firstTwoDigits = cardNumber.substring(0, 2);
  
  if (firstDigit === '4') return 'visa';
  if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) || 
      (parseInt(firstTwoDigits) >= 22 && parseInt(firstTwoDigits) <= 27)) return 'mastercard';
  if (['34', '37'].includes(firstTwoDigits)) return 'amex';
  if (firstTwoDigits === '60') return 'discover';
  return 'unknown';
};

// Add payment method for user
exports.addPaymentMethod = async (req, res) => {
  const { userId, cardNumber, expiryDate, cvv, cardholderName } = req.body;

  try {
    // Validate required fields
    if (!userId || !cardNumber || !expiryDate || !cvv || !cardholderName) {
      return res.status(400).json({
        error: "All payment fields are required",
        required: ["userId", "cardNumber", "expiryDate", "cvv", "cardholderName"]
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse expiry date (MM/YY format)
    const [expMonth, expYear] = expiryDate.split('/');
    const fullYear = parseInt(`20${expYear}`);

    // Mock tokenization (in real app, use payment processor)
    const tokenData = mockTokenizeCard({ cardNumber, cvv, cardholderName });

    // Deactivate any existing payment methods for this user
    await PaymentMethod.update(
      { is_active: false },
      { where: { userID: userId } }
    );

    // Create new payment method
    const paymentMethod = await PaymentMethod.create({
      userID: userId,
      card_last_four: tokenData.last_four,
      card_brand: tokenData.brand,
      card_exp_month: parseInt(expMonth),
      card_exp_year: fullYear,
      cardholder_name: cardholderName,
      payment_token: tokenData.token,
      is_active: true
    });

    console.log(`Payment method added for user ${userId}: ${tokenData.brand} ending in ${tokenData.last_four}`);

    res.status(201).json({
      message: "Payment method added successfully",
      paymentMethod: {
        id: paymentMethod.paymentID,
        last_four: paymentMethod.card_last_four,
        brand: paymentMethod.card_brand,
        exp_month: paymentMethod.card_exp_month,
        exp_year: paymentMethod.card_exp_year,
        cardholder_name: paymentMethod.cardholder_name
      }
    });
  } catch (err) {
    console.error("Error adding payment method:", err);
    res.status(500).json({
      error: "Could not add payment method",
      details: err.message
    });
  }
};

// Get user's active payment method
exports.getPaymentMethod = async (req, res) => {
  const { userId } = req.params;

  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: { userID: userId, is_active: true },
      attributes: ['paymentID', 'card_last_four', 'card_brand', 'card_exp_month', 'card_exp_year', 'cardholder_name']
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: "No active payment method found" });
    }

    res.status(200).json({ paymentMethod });
  } catch (err) {
    console.error("Error fetching payment method:", err);
    res.status(500).json({
      error: "Could not fetch payment method",
      details: err.message
    });
  }
};

// Process payment (mock implementation)
exports.processPayment = async (req, res) => {
  const { userId, amount, description } = req.body;

  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: { userID: userId, is_active: true }
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: "No active payment method found" });
    }

    // Mock payment processing (in real app, use Stripe/Square API)
    const transactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Mock payment processed: $${amount} from user ${userId} (${paymentMethod.card_brand} ****${paymentMethod.card_last_four})`);

    res.status(200).json({
      success: true,
      transaction_id: transactionId,
      amount: amount,
      description: description,
      card_used: `${paymentMethod.card_brand} ****${paymentMethod.card_last_four}`
    });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({
      error: "Could not process payment",
      details: err.message
    });
  }
};

// test logic
exports.test = (req, res) => {
    res.status(200).send({
        id: 2012313,
        approved: true
    });
};

// logic for posting to external webhook for card generaiton
exports.generateCard = (req,res) =>{
    const { name, totalAmount } = req.body;
    // use sequelize function to insert new group into database and respond once created
    res.status(200).send({

    })
}

// logic for generating all recent transaction 
exports.recentTransactions = (req,res) =>{
    const paymentInfo = req.params.paymentInfo;
    // get most recent payment info from database and send as response

    res.status(200).send({

    })
}

