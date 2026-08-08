// POST { userId, email, promoCode? } -> { url }  (Stripe Checkout, subscription mode)
// Requires env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      return res.status(503).json({ error: "pro_not_configured" });
    }
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });
    const { userId, email, promoCode } = req.body || {};
    if (!userId) return res.status(400).json({ error: "missing_user_id" });

    // Geld-Sicherheitsnetz: NIE eine zweite Subscription fuer denselben Nutzer anlegen.
    // Fragt direkt bei Stripe nach (nicht nur unserem eigenen, webhook-gefuellten
    // "nexus_pro"-Flag) - das ist race-frei, auch wenn der Webhook noch nicht
    // durchgelaufen ist: Stripe legt die Subscription synchron beim Checkout an,
    // unser DB-Sync passiert erst asynchron danach ueber den Webhook.
    if (email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 20 });
      for (const cust of existingCustomers.data) {
        const subs = await stripe.subscriptions.list({ customer: cust.id, status: "all", limit: 20 });
        const alreadyActive = subs.data.some(
          (s) =>
            (s.status === "active" || s.status === "trialing") &&
            s.items.data.some((i) => i.price && i.price.id === process.env.STRIPE_PRICE_ID)
        );
        if (alreadyActive) {
          return res.status(409).json({ error: "already_subscribed" });
        }
      }
    }

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
