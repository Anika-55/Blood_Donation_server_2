
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Use test key: sk_test_...
const { ObjectId } = require('mongodb');

// Create Stripe checkout session (TEST MODE)
exports.createCheckoutSession = async (req, res) => {
  const { amount, userId } = req.body;
  const db = req.app.locals.db;

  try {
    // Save donation in MongoDB with pending status
    const donation = {
      userId: userId || null,
      amount,
      status: 'pending',
      date: new Date(),
    };
    const result = await db.collection('donations').insertOne(donation);

    // Create Stripe-hosted checkout session (TEST MODE)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Blood Donation Support',
            },
            unit_amount: amount * 100, // $ → cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/donate-success?donationId=${result.insertedId}`,
      cancel_url: 'http://localhost:5173/donate-cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Update donation status after success
exports.updateDonationStatus = async (req, res) => {
  const { donationId, status } = req.body;
  const db = req.app.locals.db;

  try {
    await db.collection('donations').updateOne(
      { _id: new ObjectId(donationId) },
      { $set: { status } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
