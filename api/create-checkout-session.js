// POST { userId, email } -> { url }  (Stripe Checkout, subscription mode)
// Requires env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      return res.status(503).json({ error: "pro_not_configured" });
    }
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId, email } = req.body || {};
    if (!userId) return res.status(400).json({ error: "missing_user_id" });

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: userId,
      customer_email: email || undefined,
      success_url: `${origin}/pro/?success=1`,
      cancel_url: `${origin}/pro/?canceled=1`,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      allow_promotion_codes: true,
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("create-checkout-session", e);
    return res.status(500).json({ error: "checkout_failed" });
  }
};
