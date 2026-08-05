// ============================================================
//  NEXUS ARCADE — Cloudflare Web Analytics Loader
//  Ohne gesetzten Token (siehe analytics-config.js) ein reines No-Op: kein
//  Request, keine Änderung an der Seite.
// ============================================================
(function () {
  "use strict";
  var token = (window.NEXUS_ANALYTICS || {}).cloudflareToken;
  if (!token) return;

  var script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token: token }));
  document.head.appendChild(script);
})();
