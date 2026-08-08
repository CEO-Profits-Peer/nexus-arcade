// POST { userId, email, promoCode? } -> { url }  (Stripe Checkout, subscription mode)
// Requires env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      return res.status(503).json({ error: "pro_not_configured" });
    }
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId, email, promoCode } = req.body || {};
    if (!userId) return res.status(400).json({ error: "missing_user_id" });

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const sessionParams = {
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: userId,
      customer_email: email || undefined,
      success_url: `${origin}/pro/?success=1`,
      cancel_url: `${origin}/pro/?canceled=1`,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    };

    // Promo-Popup verlinkt hierher mit ?promo=CODE -> Rabatt direkt vorausgewählt statt
    // den Nutzer den Code manuell eintippen zu lassen. "discounts" und
    // "allow_promotion_codes" schliessen sich in der Stripe-API gegenseitig aus.
    let discountApplied = false;
    if (promoCode) {
      try {
        const codes = await stripe.promotionCodes.list({ code: String(promoCode), active: true, limit: 1 });
        if (codes.data.length) {
          sessionParams.discounts = [{ promotion_code: codes.data[0].id }];
          discountApplied = true;
        }
      } catch (e) {
        console.warn("promo code lookup failed", e.message);
      }
    }
    if (!discountApplied) sessionParams.allow_promotion_codes = true;

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("create-checkout-session", e);
    return res.status(500).json({ error: "checkout_failed" });
  }
};
