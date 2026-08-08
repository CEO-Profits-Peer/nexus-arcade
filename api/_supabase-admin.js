// Shared Supabase admin client for serverless functions (service role key = bypasses RLS).
// Never import this file from client-side code.
const { createClient } = require("@supabase/supabase-js");

let client = null;
function supabaseAdmin() {
  if (client) return client;
  const url = process.env.NEXUS_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

// Merges into saves.data (jsonb) without clobbering other synced keys (profile, scores, etc.)
async function setProStatus(userId, isPro, stripeCustomerId) {
  if (!userId) return;
  const sb = supabaseAdmin();
  const existing = await sb.from("saves").select("data").eq("user_id", userId).maybeSingle();
  // Bei einem echten Lesefehler (Netzwerk/DB) NICHT mit einem leeren Basisobjekt weitermachen -
  // der anschliessende upsert wuerde sonst saves.data komplett ersetzen und Profil/Scores/
  // Achievements des Nutzers loeschen, nur um das nexus_pro-Flag zu setzen. Stattdessen werfen,
  // damit der Webhook-Handler 500 zurueckgibt und Stripe automatisch erneut zustellt.
  if (existing.error) throw existing.error;
  const data = Object.assign({}, (existing.data && existing.data.data) || {}, { nexus_pro: isPro ? "1" : "0" });
  if (stripeCustomerId) data.stripe_customer_id = stripeCustomerId;
  const payload = { user_id: userId, data, updated_at: new Date().toISOString() };
  const r = await sb.from("saves").upsert(payload);
  if (r.error) throw r.error;
}

async function getStripeCustomerId(userId) {
  const sb = supabaseAdmin();
  const r = await sb.from("saves").select("data").eq("user_id", userId).maybeSingle();
  return (r.data && r.data.data && r.data.data.stripe_customer_id) || null;
}

module.exports = { supabaseAdmin, setProStatus, getStripeCustomerId };
