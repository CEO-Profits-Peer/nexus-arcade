/* ============================================================
   NEXUS ARCADE — Account, globales Level/XP, Erfolge, Sync
   - Läuft als Gast (localStorage). Login (Magic Link) via Supabase
     synchronisiert Profil + alle Spielstände geräteübergreifend.
   - Öffentliche API (window.NexusArcade):
       .addXP(n, reason)          -> globale Erfahrung vergeben
       .unlock(id)                -> Erfolg freischalten (vergibt XP)
       .getProfile()              -> {name,avatar,frame,xp,level,...}
       .open()                    -> Konto-/Profil-Fenster öffnen
       .ready(cb)                 -> Callback wenn bereit
   ============================================================ */
(function(){
  "use strict";

  /* ---------- Sprache ---------- */
  const L = ((localStorage.getItem("nr_lang")||localStorage.getItem("nw_lang")||localStorage.getItem("nd_lang")||navigator.language||"en").toLowerCase().startsWith("de")) ? "de" : "en";
  const TXT = window.NEXUS_I18N || {en:{},de:{}};
  const t = TXT[L] || TXT.en || {};

  /* ---------- Sync-Keys (alle Spielstände + Einstellungen + Profil) ---------- */
  const SYNC_KEYS = ["nexus_profile","nexus_ach","nexus_quests","nexus_favs","nd_best","nd_muted","nd_lang","nr_save_v1","nr_lang","nw_lang","nw_v1_en","nw_v1_de","nx_racer_best","nx_2048_best","nx_run3d_best","nx_snake_best","nx_breaker_best","nx_tycoon","nx_tycoon_best","nx_stack_best","nx_blocks_best","nx_lang","nx_muted"];

  /* ---------- Level-Kurve ---------- */
  // Kumulierte XP bis Level L: 50*(L-1)*L  -> Lv2=100, Lv3=300, Lv4=600, Lv5=1000 ...
  const cumXp = l => 50*(l-1)*l;
  function levelFromXp(xp){ let l=1; while(cumXp(l+1)<=xp) l++; return l; }
  function levelProgress(xp){ const l=levelFromXp(xp); const cur=cumXp(l), next=cumXp(l+1); return {level:l, into:xp-cur, need:next-cur, pct:Math.min(100,(xp-cur)/(next-cur)*100)}; }

  /* ---------- Daten aus nexus-data.js ---------- */
  const _D=window.NEXUS_DATA||{};
  const FRAMES=_D.FRAMES||[],PREMIUM_FRAMES=_D.PREMIUM_FRAMES||[],ALLFRAMES=_D.ALLFRAMES||[],frameById=_D.frameById||(function(x){return FRAMES[0];}),PREMIUM_AVATARS=_D.PREMIUM_AVATARS||[],SVG_ICON=_D.SVG_ICON||{},SVG_AVATARS=_D.SVG_AVATARS||[],CUSTOM_IMG_LEVEL=_D.CUSTOM_IMG_LEVEL||5,TITLES=_D.TITLES||[],titleById=_D.titleById||(function(x){return TITLES[0];}),ACH=_D.ACH||[],achById=_D.achById||(function(x){return null;}),QUESTS=_D.QUESTS||[],questSub=_D.questSub||{},questById=_D.questById||(function(x){return null;}),SCORE_MAP=_D.SCORE_MAP||{};
  /* Alte inline-Daten (FRAMES/TITLES/ACH/QUESTS) leben jetzt in nexus-data.js. */
  /* ---------- Zustand ---------- */
  function loadJSON(k,def){ try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch(e){return def;} }
  let profile = Object.assign({name:"", avatar:"🎮", frame:"none", title:"rookie", xp:0, coins:0, owned:{}}, loadJSON("nexus_profile",{}));
  let achieved = loadJSON("nexus_ach",{}); // {id:isoDate}
  let sb=null, user=null, configured=false, pushTimer=null, pulling=false, readyCbs=[];

  function saveProfile(){ localStorage.setItem("nexus_profile", JSON.stringify(profile)); }
  function saveAch(){ localStorage.setItem("nexus_ach", JSON.stringify(achieved)); }

  /* ---------- XP & Erfolge ---------- */
  const GAME_KEYS = ["nd_best","nr_save_v1","nw_v1_en","nw_v1_de","nx_racer_best","nx_2048_best","nx_run3d_best","nx_snake_best","nx_breaker_best","nx_tycoon_best","nx_stack_best","nx_blocks_best"];
  let quiet=false, evalTimer=null;
  function grantXP(n){
    if(!n) return;
    const before=levelFromXp(profile.xp);
    profile.xp+=n;
    const after=levelFromXp(profile.xp);
    if(after>before){ const c=(after-before)*50; profile.coins=(profile.coins||0)+c; if(!quiet) toast("⭐ "+t.levelup+" "+after+"  +"+c+"💰"); }
    saveProfile();
  }
  function unlockCore(id){
    if(achieved[id]) return false;
    const a=achById(id); if(!a) return false;
    achieved[id]=new Date().toISOString(); saveAch();
    if(!quiet) toast(a.icon+" "+t.unlocked+" "+a.name[L]);
    grantXP(a.xp);
    return true;
  }
  function readStats(){
    const st={};
    st.level=levelFromXp(profile.xp); st.xp=profile.xp;
    st.framesUnlocked=FRAMES.filter(f=>st.level>=f.req).length;
    st.titlesUnlocked=TITLES.filter(x=>st.level>=x.req).length;
    st.customImg=(""+(profile.avatar||"")).indexOf("data:")===0?1:0;
    st.dash_best=parseInt(localStorage.getItem("nd_best")||"0",10)||0;
    st.racer_best=parseInt(localStorage.getItem("nx_racer_best")||"0",10)||0;
    st.merge_best=parseInt(localStorage.getItem("nx_2048_best")||"0",10)||0;
    st.run3d_best=parseInt(localStorage.getItem("nx_run3d_best")||"0",10)||0;
    st.snake_best=parseInt(localStorage.getItem("nx_snake_best")||"0",10)||0;
    st.breaker_best=parseInt(localStorage.getItem("nx_breaker_best")||"0",10)||0;
    st.tycoon_best=parseInt(localStorage.getItem("nx_tycoon_best")||"0",10)||0;
    st.stack_best=parseInt(localStorage.getItem("nx_stack_best")||"0",10)||0;
    st.blocks_best=parseInt(localStorage.getItem("nx_blocks_best")||"0",10)||0;
    try{ const r=JSON.parse(localStorage.getItem("nr_save_v1")||"{}");
      st.idle_zone=r.maxZone||1; st.idle_hero=r.heroLv||1; st.idle_shards=r.gems||0;
      st.idle_dps=(r.up&&r.up.dps)||0; st.idle_gold=r.gold||0;
    }catch(e){ st.idle_zone=1; st.idle_hero=1; st.idle_shards=0; st.idle_dps=0; st.idle_gold=0; }
    let wins=0,played=0,mx=0,perfect=0;
    for(const lg of ["en","de"]){ try{ const w=JSON.parse(localStorage.getItem("nw_v1_"+lg)||"null"); if(w&&w.stats){ wins+=w.stats.wins||0; played+=w.stats.played||0; mx=Math.max(mx,w.stats.max||0); const d=w.stats.dist||[]; if((d[0]||0)+(d[1]||0)>0) perfect=1; } }catch(e){} }
    st.words_wins=wins; st.words_played=played; st.words_max=mx; st.words_perfect=perfect;
    return st;
  }
  function condMet(c,st){ const v=st[c.stat]; return c.gte!=null ? (v||0)>=c.gte : !!v; }
  function evaluateStats(initial){
    quiet=!!initial; let total=0, pass;
    do{ pass=0; const st=readStats();
      for(let i=0;i<ACH.length;i++){ const a=ACH[i]; if(a.cond && !achieved[a.id] && condMet(a.cond,st) && unlockCore(a.id)) pass++; }
      if(achieved.play_dash&&achieved.play_idle&&achieved.play_words&&!achieved.explorer&&unlockCore("explorer")) pass++;
      if(achieved.play_dash&&achieved.play_idle&&achieved.play_words&&achieved.play_racer&&achieved.play_merge&&achieved.play_run3d&&achieved.play_snake&&achieved.play_breaker&&!achieved.gamer&&unlockCore("gamer")) pass++;
      total+=pass;
    } while(pass>0 && total<600);
    checkQuests();
    quiet=false;
    if(initial && total>0) toast("🏆 +"+total+" "+t.tab_ach);
    renderButton(); if(dom.modal && dom.modal.style.display!=="none") renderModal();
  }
  function scheduleEval(){ clearTimeout(evalTimer); evalTimer=setTimeout(function(){ evaluateStats(false); }, 600); }
  function addXP(n){ if(!n) return; grantXP(n); evaluateStats(false); }
  function unlock(id){ const r=unlockCore(id); evaluateStats(false); return r; }

  /* ---------- Tägliche Quests ---------- */
  let questState=loadJSON("nexus_quests",null);
  function saveQuests(){ localStorage.setItem("nexus_quests",JSON.stringify(questState)); }
  function todayNum(){ const t=new Date(); t.setHours(0,0,0,0); return Math.floor(t.getTime()/86400000); }
  function pickDaily(day){ const n=QUESTS.length, out=[]; for(let i=0;i<3;i++){ const id=QUESTS[(day*7+i*5)%n].id; if(out.indexOf(id)<0) out.push(id); } let k=0; while(out.length<3){ const id=QUESTS[k++%n].id; if(out.indexOf(id)<0) out.push(id); } return out; }
  function questSnap(){ const s=readStats(); return {xp:profile.xp,dash_best:s.dash_best,racer_best:s.racer_best,merge_best:s.merge_best,run3d_best:s.run3d_best,idle_zone:s.idle_zone,words_wins:s.words_wins}; }
  function ensureQuests(){ const day=todayNum(); if(!questState||questState.day!==day){ questState={day:day,snap:questSnap(),visited:[],done:{},quests:pickDaily(day)}; saveQuests(); } const g=detectGame(); if(g!=="arcade"&&questState.visited.indexOf(g)<0){ questState.visited.push(g); saveQuests(); } }
  // questById -> nexus-data.js
  function checkQuests(){ if(!questState)return; const s=readStats(); let changed=false; for(const id of questState.quests){ if(questState.done[id])continue; const q=questById(id); if(!q)continue; if(q.prog(s,questState.snap,questState.visited)>=q.target){ questState.done[id]=1; changed=true; profile.coins=(profile.coins||0)+30; if(!quiet) toast("✅ "+q.name[L]+" +"+q.xp+" +30💰"); grantXP(q.xp); saveProfile(); } } if(changed) saveQuests(); }

  /* ---------- Auto-Erkennung: welches Spiel wird gerade gespielt ---------- */
  function detectGame(){
    const p = location.pathname.toLowerCase();
    if(p.indexOf("/dash")>=0) return "dash";
    if(p.indexOf("/idle")>=0) return "idle";
    if(p.indexOf("/words")>=0) return "words";
    if(p.indexOf("/racer")>=0) return "racer";
    if(p.indexOf("/merge")>=0) return "merge";
    if(p.indexOf("/run3d")>=0) return "run3d";
    if(p.indexOf("/snake")>=0) return "snake";
    if(p.indexOf("/breaker")>=0) return "breaker";
    if(p.indexOf("/tycoon")>=0) return "tycoon";
    if(p.indexOf("/stack")>=0) return "stack";
    if(p.indexOf("/blocks")>=0) return "blocks";
    return "arcade";
  }

  /* ============================================================
     UI (selbst-injiziert, nutzt die CSS-Variablen der Seite)
     ============================================================ */
  const dom = {};
  function injectUI(){
    if(!document.getElementById("nxStyles")){
      const st=document.createElement("style"); st.id="nxStyles";
      st.textContent="@keyframes nxHue{to{filter:hue-rotate(360deg)}}@keyframes nxPulse{0%,100%{box-shadow:0 0 8px currentColor}50%{box-shadow:0 0 20px currentColor}}#nxCard{scrollbar-width:thin;scrollbar-color:#39e6ff transparent;overscroll-behavior:contain}#nxCard::-webkit-scrollbar{width:9px}#nxCard::-webkit-scrollbar-track{background:rgba(255,255,255,.03);border-radius:9px;margin:6px}#nxCard::-webkit-scrollbar-thumb{background:linear-gradient(#39e6ff,#c77dff);border-radius:9px;border:2px solid transparent;background-clip:padding-box}#nxCard::-webkit-scrollbar-thumb:hover{background:#39e6ff}";
      (document.head||document.documentElement).appendChild(st);
    }
    // Konto-Button in vorhandene Kopfzeile einfügen (oder fixiert)
    const chip = document.createElement(location ? "div":"div");
    chip.id = "nxAccountBtn";
    chip.style.cssText = "display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none;"+
      "background:var(--panel,rgba(16,20,42,.85));border:1px solid var(--line,rgba(120,140,220,.3));"+
      "color:var(--text,#eaf6ff);padding:5px 12px 5px 6px;border-radius:999px;font-size:13px;font-family:inherit;";
    chip.innerHTML = '<span id="nxAv" style="width:26px;height:26px;border:2px solid #5a6187;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;overflow:hidden;background:#1a2140"></span>'+
                     '<span id="nxBtnTxt" style="font-weight:700;white-space:nowrap"></span>';
    chip.addEventListener("click", open);

    const controls = document.querySelector(".controls") || document.querySelector("header .controls");
    if(controls){ controls.insertBefore(chip, controls.firstChild); }
    else {
      const header = document.querySelector("header.top") || document.querySelector("header");
      if(header){ chip.style.marginLeft="auto"; header.appendChild(chip); }
      else { chip.style.position="fixed"; chip.style.top="10px"; chip.style.right="10px"; chip.style.zIndex="90"; document.body.appendChild(chip); }
    }

    // Modal
    const m = document.createElement("div");
    m.id="nxModal"; m.className="hidden";
    m.style.cssText="position:fixed;inset:0;background:rgba(5,6,15,.82);display:none;align-items:center;justify-content:center;padding:16px;z-index:100;";
    m.innerHTML = '<div id="nxCard" style="background:var(--panel,#101428);border:1px solid var(--neon,#39e6ff);border-radius:18px;'+
      'width:100%;max-width:420px;height:min(82vh,560px);overflow:auto;overscroll-behavior:contain;padding:20px;color:var(--text,#eaf6ff);'+
      'box-shadow:0 0 40px rgba(57,230,255,.2);font-family:inherit;"></div>';
    m.addEventListener("click", e=>{ if(e.target.id==="nxModal") close(); });
    document.body.appendChild(m);
    dom.modal=m; dom.card=m.querySelector("#nxCard");
    dom.btn=chip; dom.av=chip.querySelector("#nxAv"); dom.btnTxt=chip.querySelector("#nxBtnTxt");
    renderButton();
  }

  function avatarHTML(size){
    const av = profile.avatar||"🎮";
    if(av.indexOf("data:")===0) return '<img src="'+av+'" style="width:100%;height:100%;object-fit:cover" alt="">';
    if(av.indexOf("svg:")===0){ const p=av.split(":"); const fn=SVG_ICON[p[1]]; if(fn) return '<span style="width:78%;height:78%;display:inline-flex;align-items:center;justify-content:center">'+fn(p[2]||"#39e6ff")+'</span>'; }
    return '<span style="font-size:'+(size||15)+'px">'+av+'</span>';
  }
  function renderButton(){
    if(!dom.av) return;
    const pr = levelProgress(profile.xp);
    const fr = frameById(profile.frame);
    dom.av.style.cssText = "width:26px;height:26px;border:2px solid #5a6187;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;overflow:hidden;background:#1a2140;"+fr.css;
    dom.av.innerHTML = avatarHTML(15);
    const nm = profile.name || (user? user.email.split("@")[0] : t.guest);
    dom.btnTxt.textContent = "Lv "+pr.level+" · "+nm;
  }

  let activeTab = "profile", lbGame="dash";
  function open(){ activeTab="profile"; renderModal(); dom.modal.classList.remove("hidden"); dom.modal.style.display="flex"; }
  function close(){ dom.modal.classList.add("hidden"); dom.modal.style.display="none"; }

  function renderModal(){
    const pr = levelProgress(profile.xp);
    const fr = frameById(profile.frame);
    const nm = profile.name || (user? user.email.split("@")[0] : t.guest);
    const tabBtn = (id,label)=>'<button data-tab="'+id+'" style="flex:1;padding:9px 4px;border:none;cursor:pointer;font-weight:700;font-size:13px;border-radius:8px;display:flex;align-items:center;justify-content:center;'+
      (activeTab===id?'background:var(--neon,#39e6ff);color:#04121a':'background:transparent;color:var(--muted,#8a97c2)')+'">'+label+'</button>';
    const TABICON={
      profile:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
      ach:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/><path d="M9 20h6M12 13v4"/></svg>',
      quests:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
      ranks:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 20V11M12 20V4M19 20v-6"/></svg>',
      shop:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.2 11h10l2-8H6.5"/></svg>',
      acc:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>'
    };

    let body="";
    if(activeTab==="profile"){
      body = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">'+
        '<div style="width:64px;height:64px;border:3px solid #5a6187;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;overflow:hidden;background:#1a2140;'+fr.css+'">'+avatarHTML(34)+'</div>'+
        '<div style="flex:1"><div style="font-size:18px;font-weight:800">'+esc(nm)+'</div>'+
        '<div style="font-size:11px;color:var(--neon,#39e6ff);font-weight:700">« '+titleById(profile.title).name[L]+' »</div>'+
        '<div style="font-size:12px;color:var(--muted,#8a97c2)">'+t.level+' '+pr.level+' · '+pr.into+'/'+pr.need+' '+t.xp+'</div>'+
        '<div style="height:8px;background:rgba(0,0,0,.4);border-radius:6px;margin-top:5px;overflow:hidden"><div style="height:100%;width:'+pr.pct+'%;background:linear-gradient(90deg,#39e6ff,#7cff6b)"></div></div>'+
        '<div style="font-size:12px;color:var(--gold,#ffcf5c);font-weight:700;margin-top:5px">💰 '+(profile.coins||0)+' '+t.coins+'</div>'+
        '</div></div>'+
        '<label style="font-size:12px;color:var(--muted,#8a97c2)">'+t.name+'</label>'+
        '<input id="nxName" value="'+esc(profile.name)+'" maxlength="18" style="width:100%;margin:4px 0 12px;padding:9px 12px;border-radius:9px;border:1px solid var(--line,#333);background:#0d1226;color:inherit;font-family:inherit">'+
        '<div style="font-size:12px;color:var(--muted,#8a97c2);margin-bottom:5px">'+t.avatar+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'+
          ["🎮","🐲","🟩","👾","🧙","🚀","🔥","🦊","👑","🤖","🐺","💎"].map(e=>'<button class="nxEmo" data-e="'+e+'" style="width:38px;height:38px;font-size:20px;border-radius:8px;border:1px solid var(--line,#333);background:'+(profile.avatar===e?'var(--neon,#39e6ff)':'#141a33')+';cursor:pointer">'+e+'</button>').join("")+
          PREMIUM_AVATARS.map(a=>{const has=profile.owned&&profile.owned[a.id];return has?'<button class="nxEmo" data-e="'+a.e+'" style="width:38px;height:38px;font-size:20px;border-radius:8px;border:1px solid var(--line,#333);background:'+(profile.avatar===a.e?'var(--neon,#39e6ff)':'#141a33')+';cursor:pointer">'+a.e+'</button>':'<button disabled title="Shop 💰'+a.price+'" style="width:38px;height:38px;font-size:15px;border-radius:8px;border:1px solid var(--line,#333);background:#141a33;opacity:.45;cursor:not-allowed">🔒</button>';}).join("")+
          SVG_AVATARS.map(a=>{const tok="svg:"+a.id+":"+a.c;return '<button class="nxSvgAv" data-av="'+tok+'" title="Nexus" style="width:38px;height:38px;padding:6px;border-radius:8px;border:1px solid var(--line,#333);background:#141a33;cursor:pointer'+(profile.avatar===tok?';outline:2px solid var(--neon,#39e6ff);outline-offset:1px':'')+'">'+SVG_ICON[a.id](a.c)+'</button>';}).join("")+
        '</div>'+
        (pr.level>=CUSTOM_IMG_LEVEL
          ? '<label style="display:inline-block;font-size:12px;color:var(--neon,#39e6ff);cursor:pointer;margin-bottom:14px">📷 '+t.pickimg+'<input id="nxImg" type="file" accept="image/*" style="display:none"></label>'
          : '<div style="font-size:12px;color:var(--muted,#8a97c2);margin-bottom:14px">🔒 '+t.pickimg+' — '+t.unlockAt+' '+CUSTOM_IMG_LEVEL+'</div>')+
        '<div style="font-size:12px;color:var(--muted,#8a97c2);margin-bottom:5px">'+t.title+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">'+
          TITLES.map(x=>{const ok=pr.level>=x.req; return '<button class="nxTitle" data-t="'+x.id+'" '+(ok?'':'disabled')+' title="'+(ok?'':(t.unlockAt+" "+x.req))+'" style="padding:6px 10px;border-radius:8px;font-size:12px;cursor:'+(ok?'pointer':'not-allowed')+';opacity:'+(ok?1:.4)+';background:'+(profile.title===x.id?'var(--neon,#39e6ff);color:#04121a':'#141a33;color:var(--text,#eaf6ff)')+';border:1px solid var(--line,#333)">'+(ok?'':'🔒 ')+x.name[L]+'</button>';}).join("")+
        '</div>'+
        '<div style="font-size:12px;color:var(--muted,#8a97c2);margin-bottom:5px">'+t.frame+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">'+
          FRAMES.map(f=>{const ok=pr.level>=f.req; return '<button class="nxFrame" data-f="'+f.id+'" '+(ok?'':'disabled')+' title="'+(ok?f.id:(t.unlockAt+" "+f.req))+'" style="width:40px;height:40px;border-radius:50%;background:#1a2140;cursor:'+(ok?'pointer':'not-allowed')+';opacity:'+(ok?1:.35)+';display:flex;align-items:center;justify-content:center;font-size:10px;color:#889;border:3px solid #5a6187;'+f.css+(profile.frame===f.id?';outline:2px solid var(--neon,#39e6ff);outline-offset:2px':'')+'">'+(ok?'':'🔒')+'</button>';}).join("")+
          PREMIUM_FRAMES.filter(f=>profile.owned&&profile.owned[f.id]).map(f=>'<button class="nxFrame" data-f="'+f.id+'" title="'+f.label[L]+'" style="width:40px;height:40px;border-radius:50%;background:#1a2140;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;border:3px solid #5a6187;'+f.css+(profile.frame===f.id?';outline:2px solid var(--neon,#39e6ff);outline-offset:2px':'')+'">✦</button>').join("")+
        '</div>'+
        '<button id="nxSave" style="width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:800;background:linear-gradient(90deg,var(--neon,#39e6ff),#7cff6b);color:#04121a">'+t.save+'</button>';
    }
    else if(activeTab==="ach"){
      const got = Object.keys(achieved).filter(id=>achById(id)).length;
      const gLabel={arcade:"Nexus Arcade",dash:"Nexus Dash",idle:"Nexus Realms",words:"Nexus Words",racer:"Nexus Racer",merge:"Nexus 2048",run3d:"Nexus Run 3D",snake:"Nexus Snake",breaker:"Nexus Breaker",tycoon:"Nexus Tycoon",stack:"Nexus Stack",blocks:"Nexus Blocks"};
      const gOrder={arcade:0,dash:1,idle:2,words:3,racer:4,merge:5,run3d:6,snake:7,breaker:8,tycoon:9,stack:10,blocks:11};
      const sorted=ACH.slice().sort((a,b)=>(gOrder[a.game]-gOrder[b.game]));
      let lastG=null;
      body = '<div style="font-size:13px;color:var(--muted,#8a97c2);margin-bottom:6px">🏆 '+got+' '+t.of+' '+ACH.length+' '+t.progress+'</div>'+
        sorted.map(a=>{const on=!!achieved[a.id];
          let hdr=''; if(a.game!==lastG){ lastG=a.game; hdr='<div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--neon,#39e6ff);margin:12px 0 6px;font-weight:800">'+gLabel[a.game]+'</div>'; }
          return hdr+'<div style="display:flex;align-items:center;gap:10px;padding:8px 9px;border-radius:10px;margin-bottom:5px;background:'+(on?'rgba(57,230,255,.08)':'rgba(255,255,255,.02)')+';opacity:'+(on?1:.5)+'">'+
          '<div style="font-size:22px;filter:'+(on?'none':'grayscale(1)')+'">'+a.icon+'</div>'+
          '<div style="flex:1"><div style="font-weight:700;font-size:14px">'+a.name[L]+'</div><div style="font-size:11px;color:var(--muted,#8a97c2)">'+a.desc[L]+'</div></div>'+
          '<div style="font-size:12px;font-weight:800;color:'+(on?'#7cff6b':'#556')+'">+'+a.xp+'</div></div>';}).join("");
    }
    else if(activeTab==="quests"){
      const s=readStats();
      body='<div style="font-size:12px;color:var(--muted,#8a97c2);margin-bottom:10px">🗓️ '+t.questsInfo+'</div>'+
        (questState?questState.quests.map(function(id){var q=questById(id);if(!q)return"";var p=Math.min(q.target,q.prog(s,questState.snap,questState.visited));var done=!!questState.done[id];var pct=Math.min(100,p/q.target*100);
          return '<div style="background:rgba(255,255,255,.03);border:1px solid var(--line,#333);border-radius:12px;padding:11px;margin-bottom:8px">'+
          '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">'+(done?"✅ ":"")+q.name[L]+'</b><span style="color:'+(done?"#7cff6b":"var(--gold,#ffcf5c)")+';font-weight:800;font-size:13px">+'+q.xp+'</span></div>'+
          '<div style="font-size:12px;color:var(--muted,#8a97c2);margin:3px 0 6px">'+questSub[id][L]+'</div>'+
          '<div style="height:7px;background:rgba(0,0,0,.4);border-radius:5px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--neon,#39e6ff),#7cff6b)"></div></div>'+
          '<div style="font-size:11px;color:var(--muted,#8a97c2);margin-top:3px;text-align:right">'+p+' / '+q.target+'</div></div>';}).join(""):"");
    }
    else if(activeTab==="ranks"){
      const games=[["dash","Dash"],["racer","Racer"],["merge","2048"],["run3d","Run 3D"],["snake","Snake"],["breaker","Breaker"],["tycoon","Tycoon"],["stack","Stack"],["blocks","Blocks"],["idle","Realms"],["words","Words"]];
      body='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'+games.map(function(g){return '<button class="nxLb" data-g="'+g[0]+'" style="padding:6px 10px;border-radius:8px;font-size:12px;cursor:pointer;background:'+(lbGame===g[0]?'var(--neon,#39e6ff);color:#04121a':'#141a33;color:var(--text,#eaf6ff)')+';border:1px solid var(--line,#333)">'+g[1]+'</button>';}).join('')+'</div>'+
        '<div id="nxLbList" style="min-height:120px;color:var(--muted,#8a97c2);font-size:13px">'+t.loading+'</div>'+
        (user?'':'<div style="font-size:12px;color:var(--muted,#8a97c2);margin-top:10px">🔒 '+t.lbLoginToRank+'</div>');
    }
    else if(activeTab==="shop"){
      const owned=profile.owned||{}; const coins=profile.coins||0;
      const item=function(id,inner,price,has){ return '<div style="display:flex;align-items:center;gap:10px;padding:9px;border-radius:10px;margin-bottom:6px;background:rgba(255,255,255,.02)">'+inner+
        (has?'<span style="color:#7cff6b;font-weight:700;font-size:13px">✓ '+t.owned+'</span>':'<button class="nxBuy" data-buy="'+id+'" data-price="'+price+'" '+(coins<price?'disabled':'')+' style="border:none;cursor:'+(coins<price?'not-allowed':'pointer')+';font-weight:800;font-size:13px;padding:8px 12px;border-radius:9px;color:#160a24;background:linear-gradient(90deg,var(--gold,#ffcf5c),#ff9a3a);opacity:'+(coins<price?'.5':'1')+'">💰 '+price+'</button>')+'</div>'; };
      const frames=PREMIUM_FRAMES.map(function(f){return item(f.id,'<div style="width:38px;height:38px;border-radius:50%;background:#1a2140;border:3px solid #5a6187;'+f.css+'"></div><div style="flex:1"><div style="font-weight:700;font-size:14px">'+f.label[L]+'</div><div style="font-size:11px;color:var(--muted,#8a97c2)">'+t.frame+'</div></div>',f.price,!!owned[f.id]);}).join("");
      const avs=PREMIUM_AVATARS.map(function(a){return item(a.id,'<div style="width:38px;height:38px;font-size:22px;display:flex;align-items:center;justify-content:center">'+a.e+'</div><div style="flex:1"><div style="font-weight:700;font-size:14px">'+t.avatar+'</div></div>',a.price,!!owned[a.id]);}).join("");
      body='<div style="text-align:center;font-size:16px;font-weight:900;color:var(--gold,#ffcf5c);margin-bottom:12px">💰 '+coins+' '+t.coins+'</div>'+
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--neon,#39e6ff);font-weight:800;margin:6px 0 6px">'+t.frame+'</div>'+frames+
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--neon,#39e6ff);font-weight:800;margin:12px 0 6px">'+t.avatar+'</div>'+avs+
        '<div style="font-size:11px;color:var(--muted,#8a97c2);margin-top:10px">'+t.shopInfo+'</div>';
    }
    else { // account
      if(!configured){
        body = '<p style="color:var(--muted,#8a97c2);line-height:1.6">'+t.notcfg+'</p>';
      } else if(user){
        body = '<p style="color:var(--muted,#8a97c2);margin-bottom:6px">'+t.signedin+'</p>'+
          '<div style="font-weight:700;margin-bottom:6px">'+esc(user.email)+'</div>'+
          '<div style="font-size:13px;color:#7cff6b;margin-bottom:16px">☁️ '+t.cloudon+'</div>'+
          '<button id="nxLogout" style="width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:800;background:transparent;color:var(--text,#eaf6ff);border:1px solid var(--line,#444)">'+t.logout+'</button>';
      } else {
        body = '<div style="font-size:13px;color:var(--muted,#8a97c2);margin-bottom:12px">☁️ '+t.cloudoff+'</div>'+
          '<label style="font-size:12px;color:var(--muted,#8a97c2)">'+t.email+'</label>'+
          '<input id="nxEmail" type="email" placeholder="name@mail.com" style="width:100%;margin:4px 0 12px;padding:10px 12px;border-radius:9px;border:1px solid var(--line,#333);background:#0d1226;color:inherit;font-family:inherit">'+
          '<button id="nxLogin" style="width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:800;background:linear-gradient(90deg,var(--neon,#39e6ff),#7cff6b);color:#04121a">'+t.sendlink+'</button>'+
          '<div id="nxLoginMsg" style="font-size:13px;color:#7cff6b;margin-top:10px;min-height:18px"></div>';
      }
    }

    dom.card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'+
        '<b style="font-size:16px;letter-spacing:1px">NEXUS '+t.account.toUpperCase()+'</b>'+
        '<span id="nxClose" style="cursor:pointer;font-size:20px;color:var(--muted,#8a97c2)">✕</span></div>'+
      '<div style="display:flex;gap:5px;margin-bottom:16px;background:rgba(0,0,0,.25);padding:4px;border-radius:10px">'+
        tabBtn("profile",TABICON.profile)+tabBtn("ach",TABICON.ach)+tabBtn("quests",TABICON.quests)+tabBtn("ranks",TABICON.ranks)+tabBtn("shop",TABICON.shop)+tabBtn("acc",TABICON.acc)+'</div>'+
      body;

    // events
    dom.card.querySelector("#nxClose").onclick=close;
    dom.card.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{activeTab=b.getAttribute("data-tab");renderModal();});
    if(activeTab==="ranks"){ dom.card.querySelectorAll(".nxLb").forEach(b=>b.onclick=()=>{lbGame=b.getAttribute("data-g");renderModal();}); loadLeaderboard(); }
    if(activeTab==="shop"){ dom.card.querySelectorAll(".nxBuy").forEach(b=>{ if(b.disabled)return; b.onclick=()=>{ const id=b.getAttribute("data-buy"), price=+b.getAttribute("data-price"); if((profile.coins||0)<price){ toast(t.needMore); return; } if(profile.owned&&profile.owned[id])return; profile.owned=profile.owned||{}; profile.owned[id]=1; profile.coins=(profile.coins||0)-price; saveProfile(); syncPush(); toast("✓ "+t.bought); renderModal(); renderButton(); }; }); }
    if(activeTab==="profile"){
      dom.card.querySelectorAll(".nxEmo").forEach(b=>b.onclick=()=>{profile.avatar=b.getAttribute("data-e");saveProfile();syncPush();renderModal();renderButton();});
      dom.card.querySelectorAll(".nxSvgAv").forEach(b=>b.onclick=()=>{profile.avatar=b.getAttribute("data-av");saveProfile();syncPush();renderModal();renderButton();});
      dom.card.querySelectorAll(".nxFrame").forEach(b=>{ if(!b.disabled) b.onclick=()=>{profile.frame=b.getAttribute("data-f");saveProfile();syncPush();renderModal();renderButton();}; });
      dom.card.querySelectorAll(".nxTitle").forEach(b=>{ if(!b.disabled) b.onclick=()=>{profile.title=b.getAttribute("data-t");saveProfile();syncPush();renderModal();renderButton();}; });
      const img=dom.card.querySelector("#nxImg");
      if(img) img.onchange=e=>{ const f=e.target.files[0]; if(f) resizeImg(f,url=>{profile.avatar=url;saveProfile();syncPush();renderModal();renderButton();}); };
      dom.card.querySelector("#nxSave").onclick=()=>{ profile.name=(dom.card.querySelector("#nxName").value||"").trim(); saveProfile(); syncPush(); renderButton(); toast("✓ "+t.saved); };
    }
    if(activeTab==="acc"){
      const lb=dom.card.querySelector("#nxLogin");
      if(lb) lb.onclick=async()=>{ const em=dom.card.querySelector("#nxEmail").value.trim(); if(!em) return; lb.disabled=true; lb.textContent=t.syncing;
        try{ await sb.auth.signInWithOtp({email:em, options:{emailRedirectTo:location.origin+location.pathname}}); dom.card.querySelector("#nxLoginMsg").textContent=t.sent; }
        catch(err){ dom.card.querySelector("#nxLoginMsg").textContent="⚠ "+err.message; lb.disabled=false; lb.textContent=t.sendlink; } };
      const lo=dom.card.querySelector("#nxLogout");
      if(lo) lo.onclick=async()=>{ try{ await sb.auth.signOut(); }catch(e){} sessionStorage.removeItem("nexus_pulled"); user=null; renderButton(); renderModal(); };
    }
  }

  function resizeImg(file, cb){
    const r=new FileReader();
    r.onload=()=>{ const img=new Image(); img.onload=()=>{ const s=96,c=document.createElement("canvas"); c.width=s;c.height=s; const x=c.getContext("2d");
      const sc=Math.max(s/img.width,s/img.height), w=img.width*sc, h=img.height*sc; x.drawImage(img,(s-w)/2,(s-h)/2,w,h); cb(c.toDataURL("image/jpeg",0.82)); }; img.src=r.result; };
    r.readAsDataURL(file);
  }

  /* ---------- Toast ---------- */
  let toastEl;
  function toast(msg){
    if(!toastEl){ toastEl=document.createElement("div"); toastEl.style.cssText="position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:var(--panel,#101428);border:1px solid var(--neon,#39e6ff);color:var(--text,#eaf6ff);padding:11px 18px;border-radius:12px;font-size:14px;font-weight:600;z-index:120;opacity:0;transition:.3s;font-family:sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4);pointer-events:none;max-width:88vw;text-align:center"; document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.style.opacity="1"; clearTimeout(toastEl._t); toastEl._t=setTimeout(()=>toastEl.style.opacity="0",2600);
  }

  /* ---------- Supabase Sync ---------- */
  const shownSyncErrors = {};
  function syncErrToast(raw){
    const msg = String((raw&&raw.message)||raw||"");
    let key="generic", friendly=t.syncErrGeneric+msg;
    if(/does not exist|relation .* does not exist|42P01/i.test(msg)){ key="table"; friendly=t.syncErrTable; }
    else if(/row-level security|policy|42501/i.test(msg)){ key="rls"; friendly=t.syncErrRls; }
    if(shownSyncErrors[key]) return; // pro Fehlerart nur einmal pro Session zeigen
    shownSyncErrors[key]=true;
    console.warn("[nexus] sync", msg);
    toast("⚠ "+friendly);
  }
  function initSupabase(){
    const URL=window.NEXUS_SUPABASE_URL, KEY=window.NEXUS_SUPABASE_ANON_KEY;
    configured = !!(URL && KEY && !/DEIN-|YOUR-/i.test(URL) && !/DEIN-|YOUR-/i.test(KEY) && window.supabase);
    if(!configured) return;
    sb = window.supabase.createClient(URL, KEY, {auth:{persistSession:true, detectSessionInUrl:true, autoRefreshToken:true}});
    sb.auth.getSession().then(({data})=>onAuth(data.session));
    sb.auth.onAuthStateChange((_e,session)=>onAuth(session));
  }
  async function onAuth(session){
    user = session ? session.user : null;
    renderButton();
    if(dom.modal && dom.modal.style.display!=="none") renderModal();
    if(user) await pull();
    evaluateStats(false);
    if(user) submitAllScores();
  }
  function numMerge(a,b){ const x=parseInt(a||"0",10)||0,y=parseInt(b||"0",10)||0; return String(Math.max(x,y)); }
  function progScore(sv){ try{const o=JSON.parse(sv)||{}; return (o.gems||0)*1e9+(o.maxZone||0)*1e6+(o.heroLv||0)*1e3+(o.gold||0);}catch(e){return -1;} }
  const NUM_BESTS=["nd_best","nx_racer_best","nx_2048_best","nx_run3d_best","nx_snake_best","nx_breaker_best","nx_tycoon_best","nx_stack_best","nx_blocks_best"];
  function mergeKey(k,local,cloud){
    if(cloud==null) return local;
    if(local==null) return cloud;
    if(NUM_BESTS.indexOf(k)>=0) return numMerge(local,cloud);
    if(k==="nexus_profile"){ try{const a=JSON.parse(local)||{},b=JSON.parse(cloud)||{};const hi=(b.xp||0)>=(a.xp||0)?b:a,lo=(hi===b)?a:b;const win=Object.assign({},lo,hi);win.xp=Math.max(a.xp||0,b.xp||0);win.coins=Math.max(a.coins||0,b.coins||0);win.owned=Object.assign({},a.owned||{},b.owned||{});return JSON.stringify(win);}catch(e){return local;} }
    if(k==="nexus_ach"){ try{return JSON.stringify(Object.assign({},JSON.parse(cloud)||{},JSON.parse(local)||{}));}catch(e){return local;} }
    if(k==="nexus_favs"){ try{const a=JSON.parse(local)||[],b=JSON.parse(cloud)||[];return JSON.stringify(Array.from(new Set(a.concat(b))));}catch(e){return local;} }
    if(k==="nr_save_v1"){ return progScore(cloud)>progScore(local)?cloud:local; }
    if(k==="nw_v1_en"||k==="nw_v1_de"){ try{const a=JSON.parse(local),b=JSON.parse(cloud);const as=(a&&a.stats)||{},bs=(b&&b.stats)||{};return ((bs.played||0)+(bs.wins||0))>((as.played||0)+(as.wins||0))?cloud:local;}catch(e){return local;} }
    return local; // Einstellungen/Quests: lokal bevorzugen
  }
  async function pull(){
    try{
      const r=await sb.from("saves").select("data").eq("user_id",user.id).maybeSingle();
      if(r.error){ syncErrToast(r.error); return; }
      const cloud=(r.data&&r.data.data)||{};
      pulling=true; let changed=false;
      for(const k of SYNC_KEYS){ const local=localStorage.getItem(k); const m=mergeKey(k,local,(k in cloud)?cloud[k]:null); if(m!=null && m!==local){ localStorage.setItem(k,m); changed=true; } }
      pulling=false;
      profile=Object.assign({name:"",avatar:"🎮",frame:"none",title:"rookie",xp:0,coins:0,owned:{}}, loadJSON("nexus_profile",{}));
      achieved=loadJSON("nexus_ach",{});
      renderButton();
      syncPush(); // gemergtes Ergebnis zurück in die Cloud
      if(changed && !sessionStorage.getItem("nexus_pulled")){ sessionStorage.setItem("nexus_pulled","1"); location.reload(); return; }
    }catch(e){ syncErrToast(e); }
  }
  function syncPush(){ if(!user||!sb) return; clearTimeout(pushTimer); pushTimer=setTimeout(doPush,1400); }
  async function doPush(){
    if(!user||!sb) return;
    const bundle={}; for(const k of SYNC_KEYS){ const v=localStorage.getItem(k); if(v!=null) bundle[k]=v; }
    try{ const r=await sb.from("saves").upsert({user_id:user.id, data:bundle, updated_at:new Date().toISOString()}); if(r.error) syncErrToast(r.error); }
    catch(e){ syncErrToast(e); }
  }

  /* ---------- Leaderboards ---------- */
  // SCORE_MAP -> nexus-data.js
  function displayName(){ return (profile.name && profile.name.trim()) || (user? user.email.split("@")[0] : "Player"); }
  let lbTimer=null;
  function scheduleScores(){ if(!user||!sb) return; clearTimeout(lbTimer); lbTimer=setTimeout(submitAllScores,1600); }
  async function submitAllScores(){
    if(!user||!sb) return;
    const st=readStats(); const rows=[];
    for(const gk in SCORE_MAP){ const v=st[SCORE_MAP[gk]]||0; if(v>0) rows.push({user_id:user.id,game:gk,score:Math.floor(v),name:displayName(),updated_at:new Date().toISOString()}); }
    if(!rows.length) return;
    try{ const r=await sb.from("scores").upsert(rows,{onConflict:"user_id,game"}); if(r.error) syncErrToast(r.error); }catch(e){ syncErrToast(e); }
  }
  async function submitScore(game,score){
    if(!user||!sb||!score) return;
    try{ const r=await sb.from("scores").upsert([{user_id:user.id,game:game,score:Math.floor(score),name:displayName(),updated_at:new Date().toISOString()}],{onConflict:"user_id,game"}); if(r.error) syncErrToast(r.error); }catch(e){ syncErrToast(e); }
  }
  async function fetchLeaderboard(game){
    if(!sb) return null;
    try{ const r=await sb.from("scores").select("name,score").eq("game",game).order("score",{ascending:false}).limit(10); if(r.error){syncErrToast(r.error);return[];} return r.data||[]; }
    catch(e){ syncErrToast(e); return []; }
  }
  async function loadLeaderboard(){
    const el=dom.card&&dom.card.querySelector("#nxLbList"); if(!el)return; const t=TXT[L]||{};
    if(!configured){ el.textContent=t.notcfg; return; }
    const rows=await fetchLeaderboard(lbGame);
    const el2=dom.card&&dom.card.querySelector("#nxLbList"); if(!el2)return;
    if(!rows||!rows.length){ el2.innerHTML='<div style="padding:14px 0;text-align:center">'+t.lbEmpty+'</div>'; return; }
    const me=displayName();
    el2.innerHTML=rows.map(function(r,i){const mine=!!user&&r.name===me;return '<div style="display:flex;align-items:center;gap:10px;padding:7px 9px;border-radius:8px;margin-bottom:4px;background:'+(mine?'rgba(57,230,255,.12)':'rgba(255,255,255,.02)')+'">'+
      '<div style="width:22px;font-weight:800;color:'+(i===0?"#ffcf5c":i===1?"#c9d3f2":i===2?"#c98a3a":"var(--muted,#8a97c2)")+'">'+(i+1)+'</div>'+
      '<div style="flex:1;font-weight:600">'+esc(r.name||"Player")+(mine?' <span style="color:var(--neon,#39e6ff);font-size:11px">('+t.lbYou+')</span>':'')+'</div>'+
      '<div style="font-weight:800;color:var(--neon,#39e6ff)">'+r.score+'</div></div>';}).join("");
  }

  /* ---------- Start ---------- */
  function boot(){
    injectUI();
    initSupabase();
    // localStorage-Hook: Erfolge automatisch prüfen (+ Cloud-Push wenn eingeloggt)
    const orig = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(k,v){ orig(k,v);
      if(pulling) return;
      if(GAME_KEYS.indexOf(k)>=0){ scheduleEval(); if(user) scheduleScores(); }
      if(user && SYNC_KEYS.indexOf(k)>=0) syncPush();
    };
    setTimeout(function(){
      quiet=true;
      unlockCore("welcome");
      const g=detectGame();
      if(g==="dash") unlockCore("play_dash");
      else if(g==="idle") unlockCore("play_idle");
      else if(g==="words") unlockCore("play_words");
      else if(g==="racer") unlockCore("play_racer");
      else if(g==="merge") unlockCore("play_merge");
      else if(g==="run3d") unlockCore("play_run3d");
      else if(g==="snake") unlockCore("play_snake");
      else if(g==="breaker") unlockCore("play_breaker");
      else if(g==="tycoon") unlockCore("play_tycoon");
      else if(g==="stack") unlockCore("play_stack");
      else if(g==="blocks") unlockCore("play_blocks");
      quiet=false;
      ensureQuests();
      evaluateStats(true);
      readyCbs.forEach(function(cb){ try{cb(api);}catch(e){} }); readyCbs=[];
    }, 400);
  }

  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  /* ---------- öffentliche API ---------- */
  const api = {
    addXP, unlock, open, submitScore, fetchLeaderboard,
    getProfile: ()=>Object.assign({}, profile, levelProgress(profile.xp)),
    hasAchievement: id=>!!achieved[id],
    ready: cb=>{ if(typeof cb==="function") readyCbs.push(cb); }
  };
  window.NexusArcade = api;

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
/* nexus-account v2 */
