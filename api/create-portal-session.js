// POST { userId } -> { url }  (Stripe Billing Portal, so users can self-serve cancel/update card)
// Requires env vars: STRIPE_SECRET_KEY
const Stripe = require("stripe");
const { getStripeCustomerId } = require("./_supabase-admin");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "pro_not_configured" });
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "missing_user_id" });

    const customerId = await getStripeCustomerId(userId);
    if (!customerId) return res.status(404).json({ error: "no_subscription" });

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/pro/`,
    });
    return res.status(200).json({ url: portal.url });
  } catch (e) {
    console.error("create-portal-session", e);
    return res.status(500).json({ error: "portal_failed" });
  }
};
