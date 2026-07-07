# Nexus Arcade — Anleitung, Deployment & Geld-Strategie

Zwei fertige Browser-Games plus ein Portal, das beide verbindet. Alles statisches HTML in einer Datei pro Spiel — kein Build, keine Datenbank, kein Server. Genau darauf ausgelegt, **durch Traffic statt Marketing** zu wachsen.

## Was gebaut wurde

- **`/` (index.html)** — Portal „Nexus Arcade". Landingpage + SEO-Anker, verlinkt beide Spiele. Neue Spiele hier einfach als Kachel ergänzen.
- **`/dash/`** — *Nexus Dash*: schnelles Reflex-Arcade mit Highscore, Share-Button, Sound. Dein gewählter Typ (Highscore-Arcade).
- **`/idle/`** — *Nexus Realms*: Idle-RPG (dein Lieblingsgenre). Monster kloppen, Held leveln, Gefährten anheuern, „Aufsteigen" für dauerhafte Boni — **inklusive Offline-Fortschritt**. Idle-Games haben die höchste Wiederkehr-Rate und passen perfekt zum Ad-Modell.
- **`/words/`** — *Nexus Words*: tägliches Wort-Rätsel (Wordle-Stil). Deterministisches Tageswort (jeder bekommt dasselbe), teilbares Emoji-Ergebnis 🟩🟨⬛, Streak-Statistik, Countdown zum nächsten Rätsel. **Der stärkste Traffic-Magnet**: Leute googeln täglich danach und teilen ihr Ergebnis. ~679 EN- und ~259 DE-Wörter = fast 2 Jahre tägliche Rätsel.

Beide: zweisprachig DE/EN (Auto-Erkennung), mobil + desktop, Speichern via localStorage, Ad-Platzhalter schon eingebaut.

## Warum diese Kombi (Bewertungs-Fazit)

Browser-Game schlägt Steam/Play für dein Ziel klar: kostenlos veröffentlichbar, über Google auffindbar, teilbar, und Ad-Umsatz skaliert direkt mit Besuchern. Der Trick ist **nicht ein Spiel**, sondern eine **kleine Welt/Portal mit mehreren Spielen**: Spieler von Game A entdecken Game B, jede neue Seite ist eine neue Google-Landeseite, und die Verweildauer (v.a. durch das Idle-RPG) treibt Ad-Erlöse. Deshalb: 2 Games + Hub statt nur eines zu polieren.

## Schritt 1 — Auf Vercel live stellen (5 Minuten, kostenlos)

Am einfachsten ohne Git:

1. Konto auf vercel.com anlegen (kostenlos).
2. Vercel CLI: im Ordner `Game Profits` Terminal öffnen und
   ```
   npm i -g vercel
   vercel
   ```
   Fragen mit Enter bestätigen → du bekommst sofort eine `...vercel.app`-URL.
3. `vercel --prod` für die finale Produktions-URL.

Alternativ per GitHub: Ordner als Repo pushen → auf Vercel „Import Project" → fertig. Kein Framework wählen, es ist „Other / Static".

Danach in allen Dateien `YOUR-DOMAIN.example` durch deine echte Domain ersetzen (steht in den `<link canonical>`, `og:url`, `robots.txt`, `sitemap.xml`). Eigene Domain kannst du später in Vercel für ~10 €/Jahr verbinden — besser fürs SEO als die vercel.app-Subdomain.

## Schritt 2 — Geld verdienen (Ads einbauen)

Die Ad-Flächen sind schon als `.ad-slot` / `<div class="ad-slot">` markiert. So füllst du sie:

- **Google AdSense** (Standard): Konto beantragen, Seite braucht etwas echten Content/Traffic zur Freischaltung. Danach den AdSense-Code in die `ad-slot`-Divs einsetzen.
- **Adinplay / AdSense-Alternativen für Games** (z.B. AdinPlay, CreativeClan): auf Spielseiten oft höhere Erlöse, ausgelegt auf „rewarded" und Interstitial-Ads.
- **Rewarded Ads** sind bei Games am lukrativsten: z.B. im Idle-RPG „Video ansehen → 2× Gold für 30 Min" oder in Dash „Video → Continue". Empfehlung: als Nächstes einbauen, das steigert RPM deutlich.

Realistische Erwartung: Web-Game-Ads bringen grob **1–5 € pro 1000 Seitenaufrufe** (RPM), je nach Land und Format. Geld kommt also aus **Menge × Verweildauer** — beides adressiert das Idle-RPG + Portal.

## Schritt 3 — Wachstum durch Traffic (nicht Marketing)

1. **Game-Portale = größter Hebel.** Lade die Spiele bei kostenlosen Portalen hoch, die selbst Traffic bringen:
   - **itch.io** (sofort, HTML5-Upload, keine Freigabe nötig)
   - **CrazyGames, Poki, GameDistribution, Newgrounds** (Reichweite in Mio.; teils mit eigener Ad-Beteiligung — du verdienst an deren Traffic mit).
   Ein Spiel kann parallel auf deiner Domain UND auf diesen Portalen laufen.
2. **SEO-Longtail.** Titel/Meta zielen schon auf Suchbegriffe wie „free idle rpg browser", „arcade highscore game no download". Ergänze pro Spiel etwas Textinhalt (der „About"-Absatz ist der Anfang) — Google rankt Seiten mit echtem Text besser.
3. **Sharing eingebaut.** Beide Spiele haben Share-Buttons mit Score/Fortschritt im Text. Jeder geteilte Score ist gratis Traffic.
4. **Retention.** Das Idle-RPG mit Offline-Gold und Speichern holt Leute zurück — wiederkehrende Besucher = wiederkehrende Ad-Impressions ohne neuen Aufwand.
5. **Mehr Spiele = mehr Landeseiten.** Jedes weitere Mini-Game im Portal ist eine neue Google-Tür und Cross-Promo für die bestehenden.

## Schritt 4 — Realistische To-dos danach

- Domain kaufen + verbinden (SEO + Vertrauen).
- AdSense/AdinPlay-Konto beantragen und Slots füllen.
- Bei itch.io + 1–2 Portalen hochladen.
- Google Search Console + sitemap.xml einreichen.
- Rewarded Ads ins Idle-RPG einbauen (höchster Umsatz-Hebel).
- Nexus Words täglich bewerben lassen (z.B. Reddit/Discord-Communities für Wortspiele) — der Emoji-Share macht das fast von selbst.

Kurz: veröffentlichen → auf Portale streuen → Ads rein → Verweildauer & Suchtraffic aufbauen. Alles ohne Werbebudget.
