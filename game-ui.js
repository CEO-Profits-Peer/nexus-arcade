/* ============================================================
   NEXUS ARCADE — game-ui.js
   Kleines, eigenständiges Modul für Spiel-Seiten. Fügt einen
   Fullscreen-Button unter dem Spielbereich (#belowGame) ein.
   Auf allen Spielseiten eingebunden (nicht auf der Startseite).
   ============================================================ */
(function(){
  "use strict";
  function icon(on){
    return on
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5v4M15 3h4v4M9 21H5v-4M15 21h4v-4"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  }
  function init(){
    const mount = document.getElementById("belowGame");
    if(!mount || document.getElementById("nxFsBtn")) return;
    const btn = document.createElement("div");
    btn.className = "chip"; btn.id = "nxFsBtn"; btn.title = "Fullscreen";
    btn.style.cursor = "pointer"; btn.style.display = "inline-flex"; btn.style.alignItems = "center"; btn.style.gap = "6px";
    btn.innerHTML = icon(false);
    btn.addEventListener("click", toggle);
    mount.appendChild(btn);
    document.addEventListener("fullscreenchange", ()=>{ btn.innerHTML = icon(!!document.fullscreenElement); });
    document.addEventListener("webkitfullscreenchange", ()=>{ btn.innerHTML = icon(!!document.webkitFullscreenElement); });
  }
  function toggle(){
    const el = document.documentElement;
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    try{
      if(!fsEl){
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if(req) req.call(el);
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if(exit) exit.call(document);
      }
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
