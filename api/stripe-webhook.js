// Stripe webhook: activates/revokes NEXUS ARCADE PRO in Supabase (saves.data.nexus_pro).
// Register in Stripe Dashboard -> Developers -> Webhooks:
//   URL: https://nexusarcade.vercel.app/api/stripe-webhook
//   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
// Requires env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
const Stripe = require("stripe");
const { setProStatus } = require("./_supabase-admin");

// Needs the raw body for Stripe signature verification -> disable Vercel's JSON body parser.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("stripe-webhook signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || (session.metadata && session.metadata.userId);
        await setProStatus(userId, true, session.customer);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata && sub.metadata.userId;
        const active = sub.status === "active" || sub.status === "trialing";
        if (userId) await setProStatus(userId, active, sub.customer);
        break;
      }
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("stripe-webhook handler failed", e);
    // 500 so Stripe retries delivery
    return res.status(500).json({ error: "webhook_handler_failed" });
  }
};
