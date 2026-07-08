/* ============================================================
 * Nexus Arcade — Einmal-Skript: 5 Demo-/Test-Konten anlegen
 * + Leaderboard-Scores in 7 Spielen befuellen.
 *
 * NUR LOKAL AUSFUEHREN (nie deployen, nie den Service-Role-Key
 * committen). Braucht den SERVICE-ROLE-Key aus dem Supabase-
 * Dashboard: Project Settings -> API Keys -> "service_role"
 * (NICHT der publishable/anon-Key aus account-config.js — der
 * hier verwendete Key umgeht Row-Level-Security komplett).
 *
 * Ausfuehren (Node 18+, wegen globalem fetch):
 *
 *   PowerShell:
 *     $env:SUPABASE_SERVICE_ROLE_KEY="<dein-service-role-key>"
 *     node scripts/seed-fake-accounts.mjs
 *
 *   bash:
 *     SUPABASE_SERVICE_ROLE_KEY="<dein-service-role-key>" node scripts/seed-fake-accounts.mjs
 *
 * Mehrfach ausfuehrbar ohne Duplikate: existiert eine E-Mail schon,
 * wird das bestehende Konto wiederverwendet; Scores werden upsertet.
 * ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ovgllouqieyxsmjlvkkd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("Fehlt: Umgebungsvariable SUPABASE_SERVICE_ROLE_KEY (siehe Kommentar oben im Skript).");
  process.exit(1);
}

// 7 Spiele, in denen die Demo-Konten Scores bekommen (frei anpassbar):
const GAMES = ["dash", "racer", "merge", "snake", "breaker", "blocks", "stack"];

// Fake-E-Mails bewusst auf ".invalid" (von der IANA reservierte, garantiert nicht zustellbare
// Endung) -> es wird nie eine echte Mail verschickt, keine Namensraum-Kollision moeglich.
const ACCOUNTS = [
  { email: "demo.neonfox@nexusarcade.invalid",      name: "NeonFox",      avatar: "svg:nexus:#39e6ff", scores: { dash: 1200, racer: 1400, merge: 900,  snake: 85,  breaker: 650,  blocks: 260, stack: 27 } },
  { email: "demo.pixelviper@nexusarcade.invalid",   name: "PixelViper",   avatar: "svg:bot:#c77dff",   scores: { dash: 2600, racer: 2100, merge: 520,  snake: 55,  breaker: 480,  blocks: 150, stack: 14 } },
  { email: "demo.retromia@nexusarcade.invalid",     name: "Retro_Mia",    avatar: "svg:ghost:#ffcf5c", scores: { dash: 340,  racer: 260,  merge: 310,  snake: 30,  breaker: 140,  blocks: 95,  stack: 7  } },
  { email: "demo.zephyr99@nexusarcade.invalid",     name: "Zephyr99",     avatar: "svg:bolt:#7cff6b",  scores: { dash: 700,  racer: 600,  merge: 1750, snake: 70,  breaker: 590,  blocks: 480, stack: 38 } },
  { email: "demo.glitchknight@nexusarcade.invalid", name: "GlitchKnight", avatar: "svg:crown:#ff3ea5", scores: { dash: 3100, racer: 2800, merge: 2200, snake: 130, breaker: 1100, blocks: 520, stack: 45 } },
];

function randomPassword() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + "!Aa1";
}

async function adminFetch(path, opts = {}) {
  const res = await fetch(SUPABASE_URL + path, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: "Bearer " + SERVICE_KEY,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function findUserByEmail(email) {
  // Neuere Supabase-Versionen unterstuetzen den direkten Filter:
  const direct = await adminFetch("/auth/v1/admin/users?email=" + encodeURIComponent(email));
  if (direct.ok && direct.data && Array.isArray(direct.data.users) && direct.data.users[0]) {
    return direct.data.users[0];
  }
  // Fallback: Nutzerliste durchblaettern (fuer ein kleines Projekt meist 1 Seite).
  for (let page = 1; page <= 5; page++) {
    const r = await adminFetch("/auth/v1/admin/users?page=" + page + "&per_page=200");
    if (!r.ok || !r.data || !Array.isArray(r.data.users)) break;
    const found = r.data.users.find((u) => u.email === email);
    if (found) return found;
    if (r.data.users.length < 200) break;
  }
  return null;
}

async function ensureUser(acc) {
  const existing = await findUserByEmail(acc.email);
  if (existing) {
    console.log("  vorhanden:", acc.email, "->", existing.id);
    return existing;
  }
  const r = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: acc.email,
      password: randomPassword(),
      email_confirm: true,
      user_metadata: { display_name: acc.name },
    }),
  });
  if (!r.ok) {
    console.error("  Fehler beim Anlegen von", acc.email, "->", r.status, r.data);
    return null;
  }
  console.log("  neu angelegt:", acc.email, "->", r.data.id);
  return r.data;
}

async function upsertScores(user, acc) {
  const rows = GAMES.filter((g) => acc.scores[g] != null).map((g) => ({
    user_id: user.id,
    game: g,
    score: acc.scores[g],
    name: acc.name,
    avatar: acc.avatar,
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return;
  const r = await adminFetch("/rest/v1/scores?on_conflict=user_id,game", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) {
    console.error("  Fehler beim Scores-Upsert fuer", acc.name, "->", r.status, r.data);
  } else {
    console.log("  Scores gesetzt:", acc.name, "->", rows.map((x) => x.game + "=" + x.score).join(", "));
  }
}

(async () => {
  console.log("Nexus Arcade: 5 Demo-Konten + Scores anlegen ...\n");
  for (const acc of ACCOUNTS) {
    console.log(acc.name, "(" + acc.email + ")");
    const user = await ensureUser(acc);
    if (!user) continue;
    await upsertScores(user, acc);
    console.log("");
  }
  console.log("Fertig. Im Konto-Fenster -> Ranks-Tab nachsehen.");
})();
