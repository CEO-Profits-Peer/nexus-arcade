// ============================================================
//  NEXUS ARCADE — Werbe-Loader (Google AdSense)
//  Lädt AdSense nur, wenn in ads-config.js eine adsenseClientId gesetzt ist.
//  Ohne Client-ID ist diese Datei ein reines No-Op: kein Request, keine
//  Änderung an der Seite.
//
//  1) Auto Ads: Google platziert automatisch Anzeigen (u.a. in den
//     reservierten .ad-slot-Flächen oben/unten) — keine weitere Änderung
//     pro Spiel nötig, läuft allein über den Client-Code unten.
//  2) Rechte Skyscraper-Rail (.ad-rail-r neben jedem Spiel): nur aktiv, wenn
//     zusätzlich railSlotId gesetzt ist. Eine responsive AdSense-Anzeigen-
//     einheit füllt die Rail automatisch passend zur jeweiligen Breite
//     (jedes Spiel hat ein anderes Layout -> andere Rail-Breite).
//     Die LINKE Rail (.ad-rail-l) gehört fest der Eigenwerbung (siehe
//     promo-rail.js) - Google AdSense läuft nur rechts.
// ============================================================
(function () {
  "use strict";
  var cfg = window.NEXUS_ADS || {};
  var clientId = cfg.adsenseClientId;
  if (!clientId) return;

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(clientId);
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  if (!cfg.railSlotId) return;

  // Dieses Script liegt im <head>, das DOM (inkl. .ad-rail-r) existiert dort
  // noch nicht - deshalb erst nach DOMContentLoaded UND nach Laden des
  // AdSense-Scripts nach Rails suchen.
  script.addEventListener("load", function () {
    var fillRails = function () {
      var rails = document.querySelectorAll(".ad-rail-r");
      rails.forEach(function (rail) {
        var ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.setAttribute("data-ad-client", clientId);
        ins.setAttribute("data-ad-slot", cfg.railSlotId);
        ins.setAttribute("data-ad-format", "auto");
        ins.setAttribute("data-full-width-responsive", "true");
        rail.appendChild(ins);
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fillRails);
    } else {
      fillRails();
    }
  });
})();
