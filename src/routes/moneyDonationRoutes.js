const express = require('express');
const router = express.Router();
const donationController = require('../controllers/moneyDonation.controller');

router.post('/create-checkout-session', donationController.createCheckoutSession);
router.patch('/update-status', donationController.updateDonationStatus);

module.exports = router;
