# Nexus Arcade — Projektkontext für Claude Code

> Diese Datei liest Claude Code automatisch. Sie beschreibt Architektur & Konventionen.
> **Sprache:** Antworte dem Nutzer auf **Deutsch**. Code-Kommentare/Strings sind zweisprachig DE/EN.

## Was ist das?
**Nexus Arcade** — eine Sammlung kostenloser Browser-Spiele mit gemeinsamem Konto-/Level-/Erfolgs-/Shop-System.
Ziel: über **SEO + Teilen** wachsen (Traffic statt Marketing), monetarisiert über Ads.
Live: `https://nexusarcade.vercel.app`

## Tech-Stack
- **Reines statisches HTML/CSS/Vanilla-JS. KEIN Build, kein Bundler, kein Framework.**
- Hosting: **Vercel** (Deploy: `vercel --prod`). `vercel.json` setzt JS/CSS auf revalidieren.
- Backend: **Supabase** (Auth = E-Mail Magic Link; Tabellen: `saves`, `scores`, `likes`). SQL steht in `SUPABASE-SETUP.md`.
- Zum lokal Testen: `vercel dev` oder `npx serve` / `python -m http.server`. **Immer im echten Browser testen.**

## Dateistruktur
- `index.html` — Portal/Startseite (Suche, Kategorien, Spielraster, Favoriten/Likes).
- Je ein Spiel pro Ordner als **eine** `index.html` (HTML+CSS+JS in einer Datei):
  `dash/` (Arcade), `idle/` (Idle-Action-RPG „Nexus Realms"), `words/` (Wordle), `racer/` (Rennen),
  `merge/` (2048), `run3d/` (3D-Runner, Three.js), `snake/`, `breaker/` (Breakout), `tycoon/` (Idle-Business),
  `stack/` (Timing-Stapeln), `blocks/` (Tetris-artig), `finance/` (Trading-Simulator, 75s-Runde).
- Gemeinsame Module (Reihenfolge auf **jeder** Seite so einhalten):
  1. `account-config.js` — Supabase URL + Publishable Key (vom Nutzer gepflegt)
  2. supabase-js (CDN)
  3. `nexus-i18n.js` — Konto-Texte → `window.NEXUS_I18N`
  4. `nexus-data.js` — **163 Erfolge, Rahmen, Titel, Cosmetics, Quests, SCORE_MAP** + Helfer → `window.NEXUS_DATA`
  5. `account.js` — Konto/Level/XP/Coins/Shop/Quests/Leaderboards/Sync (nutzt NEXUS_I18N + NEXUS_DATA)
  6. `game-ui.js` (Spielseiten: Fullscreen-Button) bzw. `social.js` (Portal: Favoriten+Likes)
- Doku: `ANLEITUNG.md`, `SUPABASE-SETUP.md`, `ROADMAP.md`.

## Konventionen (bitte einhalten)
- **Jedes Spiel bleibt eine einzige, eigenständige `index.html`.** Neonoptik, CSS-Variablen, mobil + Desktop.
- **Zweisprachig DE/EN**: `I = {en:{...}, de:{...}}`, Sprache via `localStorage nr_lang`/`nx_lang` + `navigator.language`, Umschalt-Chip oben rechts.
- **localStorage-Keys** (Bestwerte/Speicherstände):
  Dash `nd_best`, Racer `nx_racer_best`, 2048 `nx_2048_best`, Run3D `nx_run3d_best`, Snake `nx_snake_best`,
  Breaker `nx_breaker_best`, Tycoon `nx_tycoon` (State) + `nx_tycoon_best` (lifetime), Stack `nx_stack_best`,
  Blocks `nx_blocks_best`, Finance `nx_finance_best` (bester Nettovermögen-Endstand der 75s-Runde) + `nx_finance_empire` (State des persistenten Empire-Immobilien-Modus: `capital`, `xp`, `stats.flips/careerProfit`, `owned[]`, `market[]`), Realms `nr_save_v1` (Feld `maxZone`=Region, `gems`, `heroLv`, `gold`, …),
  Words `nw_v1_en`/`nw_v1_de` (`.stats.max`=Streak). Meta: `nexus_profile`, `nexus_ach`, `nexus_quests`, `nexus_favs`.
- **Konto-Anbindung aus Spielen** (immer defensiv, `if(window.NexusArcade)`):
  - `window.NexusArcade.addXP(n)` bei Fortschritt/Game-Over.
  - `window.NexusArcade.submitScore("<gameKey>", best)` bei Game-Over (Leaderboard). gameKeys = dash/racer/merge/run3d/snake/breaker/tycoon/stack/blocks/finance/idle/words.
  - Erfolge schalten **automatisch** frei: `account.js` liest die localStorage-Stats (siehe `readStats()`), keine manuellen Calls nötig.
- **Neues Spiel hinzufügen** = Ordner + `index.html` (Muster von einem bestehenden Spiel kopieren), die 6 Script-Includes ans Ende, in `index.html` (Portal) zur `GAMES`-Liste + SVG-Icon, in `account.js` `detectGame()` + Erfolge (in `nexus-data.js`) + `SCORE_MAP` (in `nexus-data.js`) ergänzen, `sitemap.xml` erweitern.
- **Sync/Datensicherheit:** Login **merged** lokal+Cloud (`mergeKey` in `account.js` behält pro Feld den besseren Wert — niemals blind überschreiben).

## Bekannte Baustellen / Aufräumen
- `account.js` ist groß; optional weiter modularisieren (UI/Render in `nexus-ui.js`). Nur mit Browser-Test.
- Nach jedem Deploy **Hard-Refresh** (alter „immutable"-Cache).
- Sync-Fehler (fehlende Tabelle/RLS) werden jetzt als Toast angezeigt (`syncErrToast` in `account.js`), nicht mehr nur in der Konsole.

## Definition of Done für Änderungen
1. Im **echten Browser** getestet (Desktop + schmales Fenster).
2. DE/EN geprüft.
3. Konto-Fenster öffnet, alle Tabs rendern, keine Konsolenfehler.
4. `vercel --prod` deploybar (statisch, keine Build-Fehler).
