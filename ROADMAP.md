# Nexus Arcade — Vision & Roadmap

## Vision
Nexus Arcade ist ein **wachsender Hub kostenloser Sofort-Browser-Spiele**, der über **Suchtraffic und Teilen wächst
(nicht über Werbebudget)** und über **Ads** monetarisiert wird. Eine verbindende **Meta-Ebene** (Konto, Level/XP,
Erfolge, Nexus Coins, Cosmetics, globale Leaderboards, Favoriten/Likes) hält Spieler und bringt sie zurück.
Jedes Spiel: kostenlos, sofort spielbar, zweisprachig (DE/EN), mobil + Desktop, kein Download.

**Nordstern:** So viele kleine, süchtig machende, gut auffindbare Spiele wie möglich unter einem starken Konto-/Belohnungs-System.

---

## Aktueller Stand (fertig)
12 Spiele + Portal (inkl. **Nexus Finance**: 75s-Trading-Runde + **Empire-Modus** — Immobilien-Flipping mit
Realtor-Level, Unternehmen mit Personal/Lategame-Manager) · Konto mit Level/XP/Erfolgen/Quests/Coins + Cosmetics-Shop
· globale Leaderboards (Supabase) · Favoriten (★) + Likes (❤) · Portal-Leaderboard-Vorschau · PWA (Manifest + Service
Worker) · Sync-Fehler sichtbar als Toast (statt stillem console.warn) · Modularisiert: `nexus-i18n.js`, `nexus-data.js`.

---

## Offene Features (priorisiert)

### 1. Bugs — konkret, zuerst beheben
- [x] **Nexus 2048**: Lose-Screen rendert hinter dem Spielfeld — behoben (`z-index` auf `.over`).
- [x] **Nexus Stack**: Breitbild-/Wide-Modus rendert falsch — behoben (Blockhöhe im Chill-Modus proportional angepasst).
- [ ] **Nexus Finance Empire**: Neon-Diner-Buttons (Nachschub/Werbung/Schicht/Personal) laut Nutzer teils ohne
      Reaktion. Im Test (frischer State, alle Buttons) konnte ich das nicht reproduzieren — sehr wahrscheinlich der
      bekannte Cache-Fallstrick (Hard-Refresh nach Deploy nötig, siehe unten). Nutzer um Hard-Refresh + erneuten
      Test gebeten; falls es bleibt, genaue Reproduktionsschritte einholen.
- [ ] **Leaderboards weiterhin unzuverlässig** — Nutzer meldet „funktioniert immer noch nicht sooo gescheit".
      Genaue Symptome reproduzieren (welche Spiele, eingeloggt/Gast, welcher Browser) und Ursache finden.

### 2. Fehlendes Pause-/Escape-Menü
- [ ] Nexus 2048
- [ ] Nexus Dash
- [ ] Nexus Racer

### 3. Hauptmenü & Top-Bar — Redesign (hohe Priorität)
- [x] **Einheitliche Top-Bar über Portal + alle 12 Spiele** — umgesetzt. Brand zeigt überall "NEXUS ARCADE"
      (Klick = zurück zum Hub, kein separater "← Games"-Chip mehr), Sprachumschalter + neuer Leaderboard-Shortcut
      als cleane SVG-Icons statt Emoji, dünne Akzentlinie in der jeweiligen Spielfarbe unter der Bar. Fullscreen-
      Button sitzt jetzt unter dem Spielbereich statt in der Top-Bar (`game-ui.js` → `#belowGame`).
- [ ] Rest vom Portal-Hauptmenü (Grid/Kategorien/Suche) noch nicht angefasst — bei Bedarf eigene Runde.

### 4. UI/UX — Grundsatzfrage (Entscheidung offen)
- [ ] Abwägen: Spiele stärker „geframed"/strukturiert gestalten (klarer, aber wirkt weniger offen) vs. aktuellen
      offenen Look beibehalten. Noch keine Entscheidung — erst grundsätzlich klären, dann ggf. umsetzen.

### 5. Pro Spiel — Content & Tiefe
- [ ] **Nexus Finance**: Trading-Runde soll zum Empire-Hauptspiel **beitragen** (Brücke Trading-Ergebnis → Empire-
      Kapital), sauber und balanciert einbauen (aktuell bewusst getrennte Wirtschaft — Kopplung war Nutzerwunsch).
- [ ] **Nexus Dash**: Upgrade-Shop interessanter gestalten.
- [ ] **Nexus Words**: mehrere Runden pro Tag, mehr Sprachen, eigenes Menü, unterschiedliche Wortlängen.
- [ ] **Nexus Racer**: Shop mit Strecken-Upgrades u. Ä.
- [ ] **Nexus Run 3D**: eigenes Upgrade-System (niedrige Priorität, „später mal").
- [ ] **Nexus Blocks**: Versus-Modus.
- [ ] **Nexus Realms v2** nachbalancen (Loot-Rate, HP-/Gold-Kurve) + mehr Tiefe: Skills, Set-Boni, mehr Slots, Prestige.
- [ ] In-Game-Piktogramme statt Emojis pro Spiel, wo es passt (SVG, wie in Portal/Tabs).
- [ ] Weitere kleine Spiele nach Bedarf (jede neue Seite = neue SEO-Tür + Cross-Traffic).
- [ ] **Neue Spielideen (Nutzer-Vorschläge, noch nicht eingeplant):** Tower-Defence-Spiel · PvE-Spiel ·
      Aufbauspiel im Clash-of-Clans-Stil. Größere Würfe — vor Umsetzung jeweils eigene Scoping-Runde.

### 6. Monetarisierung
- [ ] **Rewarded Ads zuerst** (opt-in, z. B. „Video ansehen → 2× Gold/Coins, Continue"): können **jetzt schon**
      sinnvoll sein — Spieler entscheiden sich freiwillig dafür, geringes Risiko fürs Nutzererlebnis, monetarisiert
      jeden Traffic der schon da ist. Ad-Netzwerk-Konto nötig (AdSense oder AdinPlay/CreativeClan für Games).
- [ ] **Display-/Banner-Ads (die vorhandenen `.ad-slot`-Platzhalter) erst später füllen**: aktuell noch keine eigene
      Domain, nicht bei Search Console eingereicht, kein organischer Traffic — Banner würden nur den ersten
      Eindruck für frühe Tester verschlechtern, ohne nennenswert Umsatz zu bringen (zu wenig Impressionen für
      Ad-Netzwerk-Fill-Rate). Sinnvoller Trigger: **nach** eigener Domain + Search-Console-Einreichung, sobald
      im Analytics echter (nicht selbst erzeugter) Traffic über mehrere Wochen ankommt.

### 7. Meta / QoL
- [ ] Globale Sound-Einstellung, evtl. Theme-Optionen.
- [ ] Weitere Cosmetics/Titel/Rahmen; Achievement-Belohnungen (Coins).

### 8. Wachstum / SEO
- [ ] Eigene Domain kaufen + verbinden (statt vercel.app) — besser fürs SEO.
- [ ] Spiele auf Portale hochladen: itch.io, CrazyGames, Poki, GameDistribution (bringen eigenen Traffic).
- [ ] `sitemap.xml` bei Google Search Console einreichen; strukturierte Daten sind pro Spiel schon drin.

---

## Notiz: Fable 5
Nutzer-Haltung: Fable 5 ist „wie ein Gott" — nicht für kleine Dinge (Flavor-Texte etc.) einsetzen. Falls überhaupt,
dann für etwas ganz Großes: ein **Generational Game** oder ein **Engine-Upgrade Extreme**. Kein aktueller Task,
nur als Haltung/Ambition festgehalten für spätere große Weichenstellungen.

---

## ⬇️ Start-Prompt für Claude Code (kopier das als erste Nachricht)

```
Das ist "Nexus Arcade", ein statisches Web-Projekt (Vanilla JS, kein Build) — siehe CLAUDE.md für Architektur &
Konventionen und ROADMAP.md für Vision & offene Features. Bitte lies beide zuerst.

Bitte starte mit Abschnitt "1. Bugs" aus ROADMAP.md (2048 Lose-Screen-Layering, Stack Widescreen-Bug, Leaderboard-
Zuverlässigkeit), danach Abschnitt "2. Fehlendes Pause-/Escape-Menü" (2048/Dash/Racer).

Regeln: Spiele bleiben je eine eigenständige index.html; alles zweisprachig DE/EN; nichts an der Sync-Logik
(mergeKey) kaputt machen; nach Änderungen im echten Browser testen; committe in sinnvollen Schritten mit klaren
Messages. Antworte mir auf Deutsch.
```
