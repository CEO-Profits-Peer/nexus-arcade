# Nexus Arcade — Vision & Roadmap

## Vision
Nexus Arcade ist ein **wachsender Hub kostenloser Sofort-Browser-Spiele**, der über **Suchtraffic und Teilen wächst
(nicht über Werbebudget)** und über **Ads** monetarisiert wird. Eine verbindende **Meta-Ebene** (Konto, Level/XP,
Erfolge, Nexus Coins, Cosmetics, globale Leaderboards, Favoriten/Likes) hält Spieler und bringt sie zurück.
Jedes Spiel: kostenlos, sofort spielbar, zweisprachig (DE/EN), mobil + Desktop, kein Download.

**Nordstern:** So viele kleine, süchtig machende, gut auffindbare Spiele wie möglich unter einem starken Konto-/Belohnungs-System.

---

## Aktueller Stand (fertig)
11 Spiele + Portal · Konto mit Level/XP/**163 Erfolgen**/Quests/**Coins + Cosmetics-Shop** · globale Leaderboards (Supabase)
· Favoriten (★) + Likes (❤) · Konto-Politur (Scrollbar, feste Größe, SVG-Tabs, Fullscreen) · Merge-Sync (kein Reset)
· Modularisiert: `nexus-i18n.js`, `nexus-data.js`.

---

## Offene Features (priorisiert)

### 1. Aufräumen & Stabilität (zuerst)
- [ ] **Toten Kommentarblock aus `account.js` löschen** (Daten sind in `nexus-data.js`). Danach ganze Datei im Browser testen.
- [ ] **Rekord-/Highscore-Audit** über alle Spiele: prüfen, dass Bestwert überall korrekt gespeichert **und** angezeigt wird und ins Leaderboard geht. (Nutzer meldete: „manche Rekorde nicht ganz funktionierend" — konkrete Spiele erfragen.)
- [ ] Konto-Fenster nach Modularisierung end-to-end im Browser verifizieren (alle Tabs).

### 2. Monetarisierung
- [ ] **Rewarded Ads**: Ad-Netzwerk-Konto nötig (AdSense oder AdinPlay/CreativeClan für Games). Danach: „Video ansehen → Belohnung" (z. B. 2× Gold/Coins, Continue in Arcade-Spielen). Reward-Hook + Platzhalter vorbereiten.
- [ ] Ad-Slots füllen (sind als leere `.ad-slot` vorhanden, `:empty`=unsichtbar).

### 3. Content / Spiele
- [ ] **In-Game-Piktogramme statt Emojis** pro Spiel, wo es passt (SVG, wie in Portal/Tabs).
- [ ] **Nexus Realms v2 nachbalancen** (Loot-Rate, HP-/Gold-Kurve) + mehr Tiefe: Fähigkeiten/Skills, Set-Boni, mehr Ausrüstungs-Slots (Ring/Amulett), Prestige-Upgrades.
- [ ] **NEXUS FINANCE** — großes Wirtschaftsspiel: Firmen gründen, **Steuern** zahlen, **Steuerberater** anheuern, **Aktien** (Kurse), **Immobilien**, Kredite. Eigene Runde, umfangreich.
- [ ] Weitere kleine Spiele nach Bedarf (jede neue Seite = neue SEO-Tür + Cross-Traffic).

### 4. Meta / QoL
- [ ] Portal-Leaderboard-Vorschau (Top-Scores direkt auf der Startseite).
- [ ] Globale Sound-Einstellung, evtl. Theme-Optionen.
- [ ] PWA / installierbar (Manifest + Service Worker) für „App"-Gefühl.
- [ ] Weitere Cosmetics/Titel/Rahmen; Achievement-Belohnungen (Coins).

### 5. Wachstum / SEO
- [ ] Eigene Domain kaufen + verbinden (statt vercel.app) — besser fürs SEO.
- [ ] Spiele auf Portale hochladen: itch.io, CrazyGames, Poki, GameDistribution (bringen eigenen Traffic).
- [ ] `sitemap.xml` bei Google Search Console einreichen; strukturierte Daten sind pro Spiel schon drin.

---

## ⬇️ Start-Prompt für Claude Code (kopier das als erste Nachricht)

```
Das ist "Nexus Arcade", ein statisches Web-Projekt (Vanilla JS, kein Build) — siehe CLAUDE.md für Architektur &
Konventionen und ROADMAP.md für Vision & offene Features. Bitte lies beide zuerst.

Kontext: Vorher in einer eingeschränkten Sandbox entwickelt, deshalb konnten große Dateien nicht am Stück getestet
werden. Das ist hier nicht mehr der Fall — bitte teste im echten Browser (z. B. `vercel dev` + Playwright/manuell).

Bitte starte mit "1. Aufräumen & Stabilität" aus ROADMAP.md:
1) Lösche den toten auskommentierten Datenblock in account.js (Daten liegen in nexus-data.js) und verifiziere danach,
   dass das Konto-Fenster (alle Tabs: Profil/Erfolge/Quests/Ranks/Shop/Konto) im Browser fehlerfrei rendert.
2) Danach ein Rekord-/Highscore-Audit über alle 11 Spiele: Bestwert wird korrekt gespeichert, angezeigt und via
   window.NexusArcade.submitScore bzw. Auto-Submit ins Supabase-Leaderboard geschrieben. Liste mir gefundene Bugs.

Regeln: Spiele bleiben je eine eigenständige index.html; alles zweisprachig DE/EN; nichts an der Sync-Logik
(mergeKey) kaputt machen; nach Änderungen im Browser testen; committe in sinnvollen Schritten mit klaren Messages.
Antworte mir auf Deutsch.
```
