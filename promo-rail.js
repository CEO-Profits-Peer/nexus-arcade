// ============================================================
//  NEXUS ARCADE — Eigenwerbung in der linken Skyscraper-Rail
//  Zeigt neben jedem Spiel (Desktop, breites Fenster) eine kleine Karte für
//  eines unserer anderen Projekte - läuft sofort, braucht kein Ad-Netzwerk-
//  Konto. Die RECHTE Rail (.ad-rail-r) bleibt für Google AdSense reserviert,
//  siehe ads.js.
// ============================================================
(function () {
  "use strict";

  // Dieses Script liegt im <head> (laedt zusammen mit ads.js/analytics.js),
  // wird also VOR dem <body> geparst - #railL existiert zu dem Zeitpunkt noch
  // nicht. Deshalb erst nach DOMContentLoaded ausfuehren.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
  var PROMOS = [
    {
      name: "Nexus Node",
      url: "https://getnexusnode.github.io/nexus-node-site/",
      pitch: "Turn your network into interactive maps & graphs.",
      color: "#39e6ff",
    },
    {
      name: "Olympos",
      url: "https://olympos-gym.vercel.app",
      pitch: "Strength tracker styled after ancient Greece.",
      color: "#ff3ea5",
    },
  ];

  var rail = document.getElementById("railL");
  if (!rail) return;

  var promo = PROMOS[Math.floor(Math.random() * PROMOS.length)];

  rail.style.cssText += "border-style:solid;border-color:" + promo.color + "44;" +
    "background:rgba(255,255,255,0.03);display:flex;flex-direction:column;" +
    "justify-content:flex-start;padding:18px 14px;box-sizing:border-box;text-align:center;";

  var link = document.createElement("a");
  link.href = promo.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.style.cssText = "text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:10px;";

  var eyebrow = document.createElement("div");
  eyebrow.textContent = "ALSO BY US";
  eyebrow.style.cssText = "font-size:10px;letter-spacing:1.5px;color:" + promo.color + ";font-weight:700;";

  var name = document.createElement("div");
  name.textContent = promo.name;
  name.style.cssText = "font-size:16px;font-weight:800;color:#eaf6ff;";

  var pitch = document.createElement("div");
  pitch.textContent = promo.pitch;
  pitch.style.cssText = "font-size:12px;line-height:1.4;color:#8a97c2;";

  var cta = document.createElement("div");
  cta.textContent = "Visit →";
  cta.style.cssText = "font-size:12px;font-weight:700;color:" + promo.color + ";margin-top:4px;";

  link.appendChild(eyebrow);
  link.appendChild(name);
  link.appendChild(pitch);
  link.appendChild(cta);
  rail.appendChild(link);
  }
})();
