// ============================================================
//  NEXUS ARCADE — PRO-Promo-Popup
//  Zeigt gelegentlich (max. 1x/24h) ein Popup mit allen PRO-Vorteilen
//  + einem zeitlich begrenzten Willkommensangebot, wenn der Spieler
//  noch kein PRO hat. Kein Popup auf /pro/ selbst (dort werden nur
//  die geteilten Helfer unter window.NexusPromo bereitgestellt) und
//  keins, solange isPro() aktiv ist.
// ============================================================
(function () {
  "use strict";
  var cfg = window.NEXUS_PRO_PROMO || {};
  var PROMO_CODE = cfg.code || "";
  var PROMO_PERCENT = cfg.percent || 20;
  var SHOW_DELAY_MS = 25000;
  var REPEAT_MS = 24 * 3600 * 1000;
  var OFFER_MS = 15 * 60 * 1000;

  function fmt(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60); s = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  // Liefert den Ablaufzeitpunkt des aktuellen Willkommensangebots (localStorage-persistiert,
  // damit es beim Wechsel zwischen Popup -> /pro/ konsistent bleibt). Legt bei Bedarf ein
  // neues 15-Minuten-Fenster an.
  function offerExpiry() {
    var exp = +(localStorage.getItem("nx_promo_offer_exp") || 0);
    if (!exp || exp < Date.now()) {
      exp = Date.now() + OFFER_MS;
      localStorage.setItem("nx_promo_offer_exp", String(exp));
    }
    return exp;
  }

  function build() {
    if (document.getElementById("nxPromoOverlay")) return; // schon offen, nicht doppelt einfügen
    var L = ((localStorage.getItem("nr_lang") || localStorage.getItem("nw_lang") || localStorage.getItem("nd_lang") || navigator.language || "en").toLowerCase().startsWith("de")) ? "de" : "en";
    var TXT = {
      en: { title: "✨ Go PRO", sub: "Remove ads everywhere + unlock the exclusive PRO frame.",
        b1: "🚫 No ads on any game", b2: "✨ Exclusive animated profile frame", b3: "❤️ Support development",
        offer: "🎁 Welcome offer: " + PROMO_PERCENT + "% off your first month", expired: "Offer expired",
        cta: "Claim offer", later: "Maybe later" },
      de: { title: "✨ Hol dir PRO", sub: "Werbung überall weg + exklusiven PRO-Rahmen freischalten.",
        b1: "🚫 Keine Werbung in Spielen", b2: "✨ Exklusiver animierter Profilrahmen", b3: "❤️ Entwicklung unterstützen",
        offer: "🎁 Willkommensangebot: " + PROMO_PERCENT + "% Rabatt auf den 1. Monat", expired: "Angebot abgelaufen",
        cta: "Angebot sichern", later: "Vielleicht später" }
    }[L];

    var overlay = document.createElement("div");
    overlay.id = "nxPromoOverlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(5,6,15,.82);display:flex;align-items:center;justify-content:center;padding:16px;z-index:110;";
    overlay.innerHTML =
      '<div style="background:var(--panel,#101428);border:1px solid rgba(255,207,92,.5);border-radius:20px;max-width:380px;width:100%;padding:26px 22px;color:var(--text,#eaf6ff);box-shadow:0 0 60px rgba(255,207,92,.15);font-family:inherit;text-align:center;position:relative">' +
        '<span id="nxPromoClose" style="position:absolute;top:14px;right:16px;cursor:pointer;font-size:18px;color:var(--muted,#8a97c2)">✕</span>' +
        '<div style="font-size:22px;font-weight:900;background:linear-gradient(90deg,#ffcf5c,#ff3ea5,#c77dff);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:6px">' + TXT.title + '</div>' +
        '<div style="font-size:13px;color:var(--muted,#8a97c2);margin-bottom:16px">' + TXT.sub + '</div>' +
        '<div style="text-align:left;font-size:13px;line-height:2;margin-bottom:16px">' + TXT.b1 + '<br>' + TXT.b2 + '<br>' + TXT.b3 + '</div>' +
        (PROMO_CODE ?
          '<div style="background:rgba(255,207,92,.1);border:1px solid rgba(255,207,92,.4);border-radius:12px;padding:12px;margin-bottom:16px">' +
            '<div style="font-size:13px;font-weight:700;color:var(--gold,#ffcf5c)">' + TXT.offer + '</div>' +
            '<div id="nxPromoTimer" style="font-size:20px;font-weight:900;margin-top:4px;font-variant-numeric:tabular-nums"></div>' +
          '</div>' : '') +
        '<button id="nxPromoCta" style="width:100%;padding:13px;border:none;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;background:linear-gradient(90deg,#ffcf5c,#ff3ea5);color:#160a24;margin-bottom:10px">' + TXT.cta + '</button>' +
        '<span id="nxPromoLater" style="font-size:12px;color:var(--muted,#8a97c2);cursor:pointer">' + TXT.later + '</span>' +
      '</div>';
    document.body.appendChild(overlay);

    var timerHandle = null;
    function close() { overlay.remove(); if (timerHandle) clearInterval(timerHandle); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#nxPromoClose").onclick = close;
    overlay.querySelector("#nxPromoLater").onclick = close;
    overlay.querySelector("#nxPromoCta").onclick = function () {
      location.href = "/pro/" + (PROMO_CODE ? ("?promo=" + encodeURIComponent(PROMO_CODE)) : "");
    };

    if (PROMO_CODE) {
      var exp = offerExpiry();
      var timerEl = overlay.querySelector("#nxPromoTimer");
      var tick = function () {
        var left = exp - Date.now();
        if (left <= 0) { timerEl.textContent = TXT.expired; clearInterval(timerHandle); return; }
        timerEl.textContent = fmt(left);
      };
      tick();
      timerHandle = setInterval(tick, 1000);
    }
  }

  window.NexusPromo = { fmt: fmt, offerExpiry: offerExpiry, code: PROMO_CODE, percent: PROMO_PERCENT, openCard: build };

  if (location.pathname.indexOf("/pro/") === 0) return; // nur Helfer/openCard bereitstellen, kein Auto-Popup
  if (localStorage.getItem("nexus_pro") === "1") return;

  var last = +(localStorage.getItem("nx_promo_last") || 0);
  if (Date.now() - last < REPEAT_MS) return;

  setTimeout(function () {
    if (localStorage.getItem("nexus_pro") === "1") return; // seit Laden könnte sich das geändert haben
    localStorage.setItem("nx_promo_last", String(Date.now()));
    build();
  }, SHOW_DELAY_MS);
})();
