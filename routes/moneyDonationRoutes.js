const express = require('express');
const router = express.Router();
const moneyDonationController = require('../controllers/moneyDonation.controller');

router.post('/create-checkout-session', moneyDonationController.createCheckoutSession);
router.patch('/update-status', moneyDonationController.updateDonationStatus);

module.exports = router;