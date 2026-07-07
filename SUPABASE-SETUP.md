# Nexus Arcade — Cloud-Konto einrichten (Supabase)

Einmalige Einrichtung, ca. 10 Minuten. Danach haben Spieler ein Konto (Login per Magic Link), und Fortschritt, Profil, globales Level, XP und Erfolge werden geräteübergreifend gespeichert.

Das Spiel funktioniert **auch ohne** diese Einrichtung — dann läuft alles als „Gast" lokal im Browser. Login schaltet nur die Cloud-Synchronisierung frei.

## 1. Supabase-Projekt anlegen

1. Auf **supabase.com** kostenlos registrieren.
2. **New Project** → Name z.B. `nexus-arcade`, ein Datenbank-Passwort setzen (nur intern), Region nahe deinen Nutzern wählen. Erstellen (dauert ~1 Min).

## 2. Deine 2 Schlüssel eintragen

Supabase hat das Key-System umgestellt — du brauchst den **Publishable key** (ersetzt den alten „anon public"-Key, gleiche Rechte, browsersicher).

1. **Publishable key:** Project Settings → **API Keys** → Abschnitt **Publishable key** → die Zeile `default` (`sb_publishable_…`) → rechts auf **Kopieren** klicken.
2. **Project URL:** oben auf den grünen **Connect**-Button klicken → dort steht `https://<dein-ref>.supabase.co`. (Format immer `https://<PROJECT-REF>.supabase.co`; die REF steht auch in der Dashboard-Adresse `.../project/<REF>`.)
3. Öffne **`account-config.js`** und trage beide Werte ein:
   ```js
   window.NEXUS_SUPABASE_URL      = "https://<dein-ref>.supabase.co";
   window.NEXUS_SUPABASE_ANON_KEY = "sb_publishable_....";
   ```
   Der Publishable-Key darf öffentlich im Frontend stehen — er ist durch Row-Level-Security geschützt (so ist Supabase gebaut).

## 3. Datenbank-Tabelle anlegen

Im Supabase-Dashboard: **SQL Editor → New query**, das hier einfügen und **Run**:

```sql
create table if not exists public.saves (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null default '{}',
  updated_at timestamptz default now()
);

alter table public.saves enable row level security;

create policy "own saves - select" on public.saves
  for select using (auth.uid() = user_id);
create policy "own saves - insert" on public.saves
  for insert with check (auth.uid() = user_id);
create policy "own saves - update" on public.saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Zusätzlich für globale Leaderboards

Damit die Bestenlisten (Ranks-Tab) funktionieren, führe auch dieses SQL aus:

```sql
create table if not exists public.scores (
  user_id    uuid references auth.users on delete cascade,
  game       text not null,
  score      int  not null default 0,
  name       text,
  updated_at timestamptz default now(),
  primary key (user_id, game)
);

alter table public.scores enable row level security;

-- Jeder darf die Bestenliste LESEN (öffentlich):
create policy "scores public read" on public.scores
  for select using (true);
-- Aber nur den eigenen Eintrag schreiben:
create policy "scores insert own" on public.scores
  for insert with check (auth.uid() = user_id);
create policy "scores update own" on public.scores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Danach werden deine Bestwerte beim Einloggen automatisch hochgeladen, und im Konto-Fenster unter **Ranks** siehst du die Top 10 pro Spiel. (Ohne Login kannst du die Listen ansehen, aber nicht drin erscheinen.)

### Zusätzlich für Likes (Stern) auf der Startseite

```sql
create table if not exists public.likes (
  user_id uuid references auth.users on delete cascade,
  game    text not null,
  primary key (user_id, game)
);

alter table public.likes enable row level security;

-- Jeder darf die Likes LESEN (für den globalen Zähler):
create policy "likes public read" on public.likes
  for select using (true);
-- Aber nur die eigenen Likes setzen/entfernen:
create policy "likes insert own" on public.likes
  for insert with check (auth.uid() = user_id);
create policy "likes delete own" on public.likes
  for delete using (auth.uid() = user_id);
```

Damit können eingeloggte Spieler Spiele mit ★ liken (1 pro Spiel), und die Startseite sortiert die meistgelikten Spiele automatisch nach oben. Herz-Favoriten (♥) funktionieren auch ohne Login lokal und werden bei eingeloggten Spielern mitsynchronisiert.

Damit kann jeder Nutzer **nur seine eigenen** Daten lesen/schreiben.

## 4. Login (Magic Link) konfigurieren

1. **Authentication → Providers → Email**: ist standardmäßig an. „Confirm email" kann an bleiben; für reine Magic-Links ist keine weitere Einstellung nötig.
2. **Authentication → URL Configuration**:
   - **Site URL**: deine Live-Adresse, z.B. `https://nexusarcade-ceo-profits.vercel.app`
   - **Redirect URLs**: dieselbe Adresse hinzufügen, plus zum Testen `http://localhost:3000` (optional).
   Ohne korrekte Redirect-URL landet der Klick im Login-Mail-Link auf einer Fehlseite.

   **WICHTIG:** Die **Site URL** muss deine App sein (`https://nexusarcade.vercel.app`), NICHT die `...supabase.co`-Adresse. Steht dort die supabase.co-Domain, landest du nach dem Klick auf `{"error":"requested path is invalid"}`. Bei **Redirect URLs** am besten `https://nexusarcade.vercel.app/**` eintragen (das `**` erlaubt alle Unterseiten).

3b. **Optional — E-Mail auf „Nexus Arcade" branden:** Authentication → **Email Templates** → Vorlage „Magic Link" bzw. „Confirm signup" bearbeiten (Betreff/Text, z. B. „Dein Nexus-Arcade-Login"). Für einen eigenen Absender*namen*/Adresse brauchst du eigenes SMTP unter Authentication → **SMTP Settings** (z. B. über einen Mail-Dienst). Ohne SMTP verschickt Supabase über die Standard-Adresse.

## 5. Deployen & testen

1. `account-config.js` mit deinen Werten speichern, alles neu deployen (`vercel --prod`).
2. Seite öffnen → oben rechts **Konto**-Button → Tab **Konto** → E-Mail eingeben → **Magic-Link senden**.
3. Mail öffnen, Link klicken → du bist eingeloggt, oben steht dein Level + Name.
4. Auf einem anderen Gerät mit derselben E-Mail einloggen → dein Fortschritt ist da.

## Was schon eingebaut ist

- **Login/Logout** per Magic Link, Session bleibt erhalten.
- **Profil**: Anzeigename, Avatar (Emoji **oder** eigenes Bild), Profilrahmen.
- **Globales Level & XP** über alle Spiele hinweg (Level-Kurve, Fortschrittsbalken).
- **Erfolge** (spielübergreifend), die XP geben — erste Erfolge (Spiele öffnen/spielen) werden automatisch vergeben.
- **Profilrahmen als Rewards**, die sich mit steigendem Level freischalten.
- **Auto-Sync**: alle Spielstände + Einstellungen + Profil landen in der Cloud, sobald man eingeloggt ist; als Gast bleibt alles lokal.

## Nächste Ausbaustufe (Phase 2)

Tiefere, spielspezifische Erfolge (z.B. „2000 Punkte in Dash", „Reich 5 in Realms", „5-Tage-Serie in Words") sowie XP für konkrete Leistungen und Boost-Rewards, die im Spiel wirken. Das Gerüst dafür steht bereits (`NexusArcade.unlock(id)` / `NexusArcade.addXP(n)`).
