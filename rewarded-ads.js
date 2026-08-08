// ============================================================
//  NEXUS ARCADE — Rewarded-Ads (AdinPlay)
//  Lädt AdinPlay nur, wenn in rewarded-ads-config.js publisherId+siteId
//  gesetzt sind. Ohne die beiden ist diese Datei ein reines No-Op.
//
//  Stellt window.NexusRewarded bereit:
//    .isConfigured() -> bool, Netzwerk eingerichtet?
//    .isAvailable()  -> bool, gerade zeigbar (Konfiguriert + kein Ad
//                       gerade aktiv + Mindestabstand zum letzten Ad
//                       verstrichen — AdinPlay empfiehlt selbst >=15min
//                       zwischen Video-Ads, siehe unten)
//    .show()         -> Promise<boolean>. true = Ad wurde bis zum Ende
//                       gezeigt (Reward vergeben), false = kein Fill /
//                       Fehler / Timeout / nicht konfiguriert.
//
//  API-Aufrufe (aiptag.cmd.player.push, AIP_REMOVE, startPreRoll, ...)
//  entsprechen der offiziellen AdinPlay-Preroll-Integration, wie sie
//  z.B. im Open-Source-Spiel shapez.io produktiv eingesetzt wird.
//  "Reward" = Nutzer hat den Preroll bis zum Schließen angeschaut,
//  AdinPlay unterscheidet auf dieser Ebene nicht separat zwischen
//  Preroll und "echtem" Rewarded-Format — für unseren Zweck (Bonus nur
//  nach vollständig angesehenem Ad) reicht das.
// ============================================================
(function () {
  "use strict";
  var cfg = window.NEXUS_REWARDED_ADS || {};
  var publisherId = cfg.publisherId, siteId = cfg.siteId;
  var MIN_GAP_MS = 15 * 60 * 1000; // AdinPlay-Empfehlung: nicht öfter als alle 15min

  var initStarted = false, adEl = null, innerEl = null, pending = null;
  var lastShownAt = -Infinity;

  function isConfigured() { return !!(publisherId && siteId); }

  function buildOverlay() {
    adEl = document.createElement("div");
    adEl.id = "nxRewardedAd";
    adEl.style.cssText = "position:fixed;inset:0;z-index:9999;background:#000;display:none;align-items:center;justify-content:center;";
    innerEl = document.createElement("div");
    innerEl.style.cssText = "width:100%;max-width:640px;aspect-ratio:16/9;";
    adEl.appendChild(innerEl);
    document.body.appendChild(adEl);
  }

  function ensureInit() {
    if (initStarted || !isConfigured()) return;
    initStarted = true;

    window.aiptag = window.aiptag || {};
    aiptag.cmd = aiptag.cmd || [];
    aiptag.cmd.display = aiptag.cmd.display || [];
    aiptag.cmd.player = aiptag.cmd.player || [];
    aiptag.gdprShowConsentTool = 0;
    aiptag.gdprAlternativeConsentTool = 1;
    aiptag.gdprConsent = 1;

    var start = function () {
      if (!adEl) buildOverlay();
      aiptag.cmd.player.push(function () {
        window.nxAdPlayer = new window.aipPlayer({
          AD_WIDTH: 640,
          AD_HEIGHT: 360,
          AD_FULLSCREEN: false,
          AD_CENTERPLAYER: false,
          LOADING_TEXT: "Loading ad…",
          PREROLL_ELEM: function () { return innerEl; },
          AIP_REMOVE: function () {
            if (pending) { var p = pending; pending = null; hide(); p.resolve(true); }
          },
        });
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://api.adinplay.com/libs/aiptag/pub/" + encodeURIComponent(publisherId) + "/" + encodeURIComponent(siteId) + "/tag.min.js";
    document.head.appendChild(s);
  }

  function show() { if (adEl) adEl.style.display = "flex"; }
  function hide() { if (adEl) adEl.style.display = "none"; }

  function isAvailable() {
    return isConfigured() && !pending && (performance.now() - lastShownAt) > MIN_GAP_MS;
  }

  function showRewardedAd() {
    return new Promise(function (resolve) {
      if (!isAvailable()) { resolve(false); return; }
      ensureInit();
      lastShownAt = performance.now();
      pending = { resolve: resolve };
      show();
      try {
        aiptag.cmd.player.push(function () { window.nxAdPlayer.startPreRoll(); });
      } catch (e) {
        pending = null; hide(); resolve(false); return;
      }
      // Sicherheitsnetz: falls AIP_REMOVE nie feuert (Adblocker, kein Fill), nach 30s aufgeben.
      setTimeout(function () {
        if (pending) { var p = pending; pending = null; hide(); p.resolve(false); }
      }, 30000);
    });
  }

  ensureInit(); // früh laden -> besseres Fill bis zum ersten Klick

  window.NexusRewarded = { isConfigured: isConfigured, isAvailable: isAvailable, show: showRewardedAd };
})();
