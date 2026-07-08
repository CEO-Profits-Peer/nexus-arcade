# Nexus Arcade — Vision & Roadmap

## Vision
Nexus Arcade ist ein **wachsender Hub kostenloser Sofort-Browser-Spiele**, der über **Suchtraffic und Teilen wächst
(nicht über Werbebudget)** und über **Ads** monetarisiert wird. Eine verbindende **Meta-Ebene** (Konto, Level/XP,
Erfolge, Nexus Coins, Cosmetics, globale Leaderboards, Favoriten/Likes) hält Spieler und bringt sie zurück.
Jedes Spiel: kostenlos, sofort spielbar, zweisprachig (DE/EN), mobil + Desktop, kein Download.

**Nordstern:** So viele kleine, süchtig machende, gut auffindbare Spiele wie möglich unter einem starken Konto-/Belohnungs-System.

---

## Aktueller Stand (fertig)
13 Spiele + Portal, darunter **Nexus Finance** (dauerhaftes Finanzimperium: Immobilien-Flipping mit Realtor-
Level, Unternehmen mit Personal/Lategame-Manager, Aktien mit Day-/Regular-Trading + News-Engine, eigene
Bottom-Nav-Bar) und **Nexus Ticker** (die schnelle 75s-Trading-Runde, seit dem Nav-Umbau ein eigenständiges
Mini-Game — speist einen Bonus in Finance's Empire-Kapital ein) · Konto mit Level/XP/Erfolgen/Quests/Coins +
Cosmetics-Shop · globale Leaderboards (Supabase) · Favoriten (★) + Likes (❤) · Portal-Leaderboard-Vorschau ·
PWA (Manifest + Service Worker) · Sync-Fehler sichtbar als Toast (statt stillem console.warn) ·
Modularisiert: `nexus-i18n.js`, `nexus-data.js`.

---

## Offene Features (priorisiert)

### 1. Bugs — konkret, zuerst beheben
- [x] **Nexus 2048**: Lose-Screen rendert hinter dem Spielfeld — behoben (`z-index` auf `.over`).
- [x] **Nexus Stack**: Breitbild-/Wide-Modus rendert falsch — behoben (Blockhöhe im Chill-Modus proportional angepasst).
- [ ] **Nexus Finance Empire**: Neon-Diner-Buttons (Nachschub/Werbung/Schicht/Personal) laut Nutzer teils ohne
      Reaktion. Im Test (frischer State, alle Buttons) konnte ich das nicht reproduzieren — sehr wahrscheinlich der
      bekannte Cache-Fallstrick (Hard-Refresh nach Deploy nötig, siehe unten). Nutzer um Hard-Refresh + erneuten
      Test gebeten; falls es bleibt, genaue Reproduktionsschritte einholen.
- [x] **Leaderboards** — Ursache war fehlender vollständiger Login-Test; Nutzer hat inzwischen echt eingeloggt
      getestet, `scores`-Tabelle hat jetzt reale Einträge, funktioniert. Danach zwei weitere Verbesserungen:
      eigener Rang wird auch außerhalb der Top 10 angezeigt; und ein **Flacker-Bug behoben** — die Liste baute
      sich bei jedem XP-Gewinn (z. B. Auto-Kills in Nexus Realms) neu auf und verschwand kurz, weil
      `evaluateStats()` das ganze Konto-Fenster neu rendert. Ranks-Tab wird davon jetzt ausgenommen.
- [x] **Top-Bar zu eng** — Nutzer-Feedback „Spiele kleben an der Top-Bar". `header.top`-Bottom-Padding auf allen
      13 Seiten von 4px auf 18px erhöht (mechanisch, einheitlich).

### 2. Fehlendes Pause-/Escape-Menü
- [x] Nexus 2048
- [x] Nexus Dash
- [x] Nexus Racer

Alle drei: Escape-Taste + kleiner Pause-Button (oben rechts im Spielfeld, Icon) öffnen ein Overlay mit
Weiter/Neustart/Zum-Hub. Simulation/Eingabe pausiert währenddessen sauber (State-Flag `paused`, Guard in
`update()`/`move()`).

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
- [x] **Nexus Finance**: Trading-Runde **beiträgt** jetzt zum Empire — ein Viertel des Rundengewinns (nur bei
      Gewinn, Verluste bleiben ohne Auswirkung auf das Empire-Kapital) wandert dauerhaft ins Empire-Kapital,
      sichtbar auf dem Ergebnis-Screen ("🏛️ +$X ans Empire-Kapital"). Bewusst nur ein Viertel und nur bei Gewinn,
      damit Trading eine Zusatzchance bleibt statt eines Exploits fürs Farmen von Empire-Kapital.
- [x] **Nexus Finance — Stocks (Day Trading + Regular Trading)**: dritter Empire-Sub-Tab, komplett getrennt von
      der 75s-Arcade-Runde. Handel mit **echtem, dauerhaft besessenem Empire-Kapital**: Regular Trading kauft/
      verkauft jederzeit direkt gegen das Kapital, Day Trading bindet einen gewählten Einsatz für eine getimte
      75s-Session mit beschleunigtem Kurstick, am Ende automatische Auszahlung (Gewinn **oder Verlust**, echtes
      Risiko). 6 Firmen mit eigenem Sektor + thematisch passendem News-Pool; News-getriebene Kurssprünge sind
      dadurch nachvollziehbar (Schlagzeile erklärt die Richtung) statt anonymem Zufall. Firmenprofil (Sparkline +
      firmenspezifische News) + "Nexus Finanz-Zeitung" (globaler News-Feed). Kurse bewegen sich auch offline
      weiter (Aufholung analog Business-Manager). 4 neue Achievements, Fortschritt zählt in Cloud-Merge/Konto mit.
      **Beim Bauen gefunden & behoben:** Firmen-vol/-drift waren für den schnellen Day-Trading-Tick kalibriert,
      liefen aber auch im Normalbetrieb/Offline-Aufholung — Zufallslauf-Varianz wächst mit √(Tick-Anzahl), das
      erzeugte nach nur wenigen Stunden Abwesenheit absurde 150–300%-Kurssprünge. Fix: eigene, stark gedämpfte
      Kalibrierung für Normalbetrieb + hartes Sicherheitsnetz (Faktor pro Offline-Durchlauf auf −60 %/+200 %
      gedeckelt).
- [x] **News erscheinen vor dem Kurseffekt**: Schlagzeile ist sofort in der Zeitung sichtbar ("noch nicht
      eingepreist"-Badge), der Kurs reagiert erst 8s später — aufmerksame Leser können vorher reagieren.
      News-Häufigkeit erhöht.
- [x] **Nexus Finance / Nexus Ticker getrennt** (Nutzer-Feedback: „Trading Runde und Empire ist keine gute
      Einteilung"): die 75s-Arcade-Runde ist jetzt ein **eigenständiges Mini-Game** `ticker/` (eigene URL,
      eigenes Leaderboard `nx_ticker_best`, alte `nx_finance_best`-Bestwerte werden beim ersten Besuch einmalig
      migriert). Nexus Finance ist jetzt reines Empire (Immobilien/Unternehmen/Aktien) mit einer neuen
      **Bottom-Nav-Bar** (Icons, app-artig, unten fixiert) statt der alten Top-Tab-Einteilung
      "Trading Floor vs. Empire" — schafft auch Platz für künftige weitere Bereiche. Ticker speist weiterhin
      per `touchEmpireCapital()` einen Bonus (¼ Rundengewinn, nur bei Gewinn) in Finance's Empire-Kapital ein,
      auch wenn Nexus Finance selbst noch nie geöffnet wurde.
- [ ] **Nexus Finance — Jobs-System**: "jederzeit arbeiten" für Zusatzeinkommen (Nutzer-Idee, „eventuell").
      Bewusst nicht mit den Stocks gebaut — eigene Scoping-Runde (welche Jobs, aktiv vs. passiv, Cooldowns).
- [ ] **Nexus Finance — Tutorial/Onboarding**: Nutzerwunsch, Finance/Empire soll "eines der größten Spiele" der
      Seite werden — dafür braucht es eine geführte Einführung über Trading-Runde + alle 3 Empire-Bereiche
      (Immobilien/Unternehmen/Aktien). Eigene Runde, nicht Teil des Stocks-Umbaus.
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
- [x] **Profilbilder in Leaderboards**: kleiner Avatar (Emoji/Nexus-SVG) neben jedem Ranks-Eintrag. Eigene
      Foto-Uploads werden bewusst nicht öffentlich geteilt (Fallback-Emoji, Größe + Privatsphäre). Fremde
      Avatar-Werte aus der öffentlichen `scores`-Tabelle werden strikt validiert gerendert (kein rohes HTML/SVG
      aus der DB — sonst wäre über einen direkten API-Call stored XSS möglich gewesen).
- [x] **E-Mails auch in `saves` gespeichert** (nur eigene Zeile lesbar, nicht öffentlich) — praktisch, um im
      Supabase Table Editor Nutzer einer Zeile zuzuordnen, ohne in Authentication → Users nachzusehen.
      **⚠️ Setup-Schritt nötig:** bestehendes Supabase-Projekt braucht die 2 neuen Spalten per SQL (siehe
      `SUPABASE-SETUP.md`, Abschnitt „Bereits ein bestehendes Projekt?"). Code fällt bis dahin automatisch und
      ohne Fehler-Toasts auf das alte Schema zurück (kein Leaderboard-Ausfall in der Übergangszeit).
- [x] **5 Demo-/Test-Konten vorbereitet**: `scripts/seed-fake-accounts.mjs` (nicht deployed, siehe `.vercelignore`)
      legt 5 Fake-Konten mit Scores in 7 Spielen an (dash/racer/merge/snake/breaker/blocks/stack), inkl.
      unterschiedlicher Avatare. Braucht den Supabase **Service-Role-Key** (Admin-API, umgeht RLS) — bewusst
      **nicht** von mir ausgeführt, da dieser Key niemals durch den Chat/Client laufen sollte. Nutzer führt das
      Skript selbst lokal aus (Anleitung im Skript-Kommentar). **Kritischer Bug behoben:** der Konto-Suche-Filter
      hat ein falsches, echtes Konto getroffen und dessen Scores überschrieben — jetzt wird die E-Mail immer
      exakt gegengeprüft, betroffene Daten wurden per SQL wiederhergestellt.
- [x] **Like ohne Login**: Klick öffnet jetzt direkt das Konto-Fenster auf dem Login-Tab (`openLogin()` in
      `account.js`), statt nur einen Hinweis-Toast zu zeigen.

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
