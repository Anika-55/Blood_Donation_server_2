const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // use test key
const { ObjectId } = require('mongodb');

// Create Stripe Checkout Session (Test Mode)
exports.createCheckoutSession = async (req, res) => {
  const { amount, userId } = req.body;
  const db = req.app.locals.db;

  try {
    // Save donation as pending
    const donation = { userId: userId || null, amount, status: 'pending', date: new Date() };
    const result = await db.collection('donations').insertOne(donation);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Blood Donation Support' },
          unit_amount: amount * 100, // cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/donate-success?donationId=${result.insertedId}`,
      cancel_url: 'http://localhost:5173/donate-cancel',
    });

    res.json({ url: session.url }); // send Stripe-hosted page URL
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update donation status
exports.updateDonationStatus = async (req, res) => {
  const { donationId, status } = req.body;
  const db = req.app.locals.db;

  try {
    await db.collection('donations').updateOne(
      { _id: new ObjectId(donationId) },
      { $set: { status } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
