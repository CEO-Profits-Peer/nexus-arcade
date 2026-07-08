/* ============================================================
   NEXUS ARCADE — game-ui.js
   Kleines, eigenständiges Modul für Spiel-Seiten:
   - Fullscreen-Button unter dem Spielbereich (#belowGame)
   - Spielname-Tag neben der Marke (welches Spiel läuft gerade)
   - "Das könnte dir gefallen" — Vorschlagszeile unter dem Spiel
   Auf allen Spielseiten eingebunden (nicht auf der Startseite).
   ============================================================ */
(function(){
  "use strict";
  function icon(on){
    return on
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5v4M15 3h4v4M9 21H5v-4M15 21h4v-4"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  }
  function initFullscreen(){
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

  /* ---------- welches Spiel läuft gerade? ---------- */
  const GAME_IDS=["dash","idle","words","racer","merge","run3d","snake","breaker","tycoon","stack","blocks","finance"];
  function detectGame(){
    const p=location.pathname.toLowerCase();
    for(const id of GAME_IDS) if(p.indexOf("/"+id)>=0) return id;
    return null;
  }
  const LANG_KEY_BY_GAME={dash:"nd_lang",idle:"nr_lang",words:"nw_lang"};
  function lang(gid){
    const specific=gid&&LANG_KEY_BY_GAME[gid];
    const v=(specific&&localStorage.getItem(specific))||localStorage.getItem("nx_lang")||navigator.language||"en";
    return v.toLowerCase().startsWith("de")?"de":"en";
  }
  function injectStyles(){
    if(document.getElementById("nxGuiStyles")) return;
    const st=document.createElement("style"); st.id="nxGuiStyles";
    st.textContent=
      ".nxGameTag{font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--muted,#8a97c2);background:var(--panel,rgba(16,20,42,.82));border:1px solid var(--line,rgba(120,140,220,.25));padding:3px 9px;border-radius:999px;margin-left:2px;text-transform:uppercase;}"+
      ".nxSuggest{width:100%;max-width:600px;margin:0 auto;padding:8px 16px 4px;box-sizing:border-box;}"+
      ".nxSuggestH{font-size:12px;color:var(--muted,#8a97c2);text-transform:uppercase;letter-spacing:1px;margin:6px 0 10px;text-align:center;font-weight:800;}"+
      ".nxSuggestRow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}"+
      ".nxSuggestCard{display:flex;flex-direction:column;align-items:center;gap:6px;width:78px;padding:10px 6px;border-radius:12px;background:var(--panel,rgba(16,20,42,.82));border:1px solid var(--line,rgba(120,140,220,.25));text-decoration:none;color:var(--text,#eaf6ff);font-size:11px;font-weight:700;text-align:center;transition:.15s;}"+
      ".nxSuggestCard:hover{border-color:var(--neon,#39e6ff);transform:translateY(-2px);}"+
      ".nxSuggestIc{width:26px;height:26px;color:var(--neon,#39e6ff);}"+
      ".nxSuggestIc svg{width:100%;height:100%;}";
    document.head.appendChild(st);
  }

  function injectGameTag(gid,catalog){
    const g=catalog.find(x=>x.id===gid); if(!g) return;
    const brand=document.querySelector(".brand");
    if(!brand||document.getElementById("nxGameTag")) return;
    const L=lang(gid);
    const tag=document.createElement("span");
    tag.id="nxGameTag"; tag.className="nxGameTag";
    tag.textContent=(g.short&&g.short[L])||g.name[L];
    brand.appendChild(tag);
  }

  /* ---------- "Das könnte dir gefallen" ---------- */
  function favList(){ try{ return JSON.parse(localStorage.getItem("nexus_favs")||"[]"); }catch(e){ return []; } }
  function pickForYou(catalog,currentId,favs,n){
    const current=catalog.find(g=>g.id===currentId);
    const cats=(current&&current.cats)||[];
    const pool=catalog.filter(g=>g.id!==currentId);
    const scored=pool.map((g,i)=>{
      let score=0;
      if(favs.indexOf(g.id)>=0) score+=100;
      if(cats.some(c=>g.cats.indexOf(c)>=0)) score+=10;
      return {g:g,score:score,i:i};
    });
    scored.sort((a,b)=>b.score-a.score||a.i-b.i);
    return scored.slice(0,n).map(s=>s.g);
  }
  async function fetchPopular(excludeId){
    try{
      const URL=window.NEXUS_SUPABASE_URL, KEY=window.NEXUS_SUPABASE_ANON_KEY;
      if(!URL||!KEY||/DEIN-|YOUR-/i.test(URL)||/DEIN-|YOUR-/i.test(KEY)) return [];
      const res=await fetch(URL+"/rest/v1/likes?select=game",{headers:{apikey:KEY,Authorization:"Bearer "+KEY}});
      if(!res.ok) return [];
      const rows=await res.json();
      const counts={};
      rows.forEach(function(r){ counts[r.game]=(counts[r.game]||0)+1; });
      return Object.keys(counts).filter(function(id){return id!==excludeId;}).sort(function(a,b){return counts[b]-counts[a];});
    }catch(e){ return []; }
  }
  async function renderSuggestions(gid,catalog,icons){
    const mount=document.getElementById("belowGame"); if(!mount||document.getElementById("nxSuggest")) return;
    const L=lang(gid);
    const favs=favList();
    const picks=pickForYou(catalog,gid,favs,3);
    const popIds=await fetchPopular(gid);
    const pickedIds={}; pickedIds[gid]=1; picks.forEach(function(g){pickedIds[g.id]=1;});
    const popular=popIds.filter(function(id){return !pickedIds[id];}).slice(0,2).map(function(id){return catalog.find(function(g){return g.id===id;});}).filter(Boolean);
    let combined=picks.concat(popular);
    if(combined.length<3){
      for(const g of catalog){ if(combined.length>=5) break; if(g.id===gid) continue; if(combined.indexOf(g)>=0) continue; combined.push(g); }
    }
    if(!combined.length) return;
    if(document.getElementById("nxSuggest")) return; // erneut prüfen (async-Rennen)
    const heading = L==="de" ? "Das könnte dir auch gefallen" : "You might also like";
    const sec=document.createElement("section");
    sec.id="nxSuggest"; sec.className="nxSuggest";
    sec.innerHTML='<div class="nxSuggestH">'+heading+'</div><div class="nxSuggestRow">'+
      combined.map(function(g){
        const path=icons[g.id]||"";
        return '<a class="nxSuggestCard" href="'+g.href+'"><span class="nxSuggestIc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg></span><span>'+(g.name[L])+'</span></a>';
      }).join("")+
      '</div>';
    mount.insertAdjacentElement("afterend", sec);
  }

  function init(){
    initFullscreen();
    const D=window.NEXUS_DATA||{}; const catalog=D.GAMES_CATALOG||[]; const icons=D.GAME_ICONS||{};
    const gid=detectGame();
    if(gid&&catalog.length){
      injectStyles();
      injectGameTag(gid,catalog);
      renderSuggestions(gid,catalog,icons);
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
