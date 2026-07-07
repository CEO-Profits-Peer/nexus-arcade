/* ============================================================
   NEXUS ARCADE — social.js
   Favoriten (Herz, lokal + über Konto synchronisiert) und
   globale Likes (Stern, Supabase). Läuft eigenständig neben
   account.js; nutzt dieselbe Supabase-Session.

   API (window.NexusSocial):
     .isFav(game) / .toggleFav(game) / .getFavs()
     .likeCount(game) / .isLiked(game) / .toggleLike(game) -> {ok,reason,liked}
     .isConfigured() / .hasUser()
     .ready(cb)     -> feuert, wenn Likes geladen sind
     .onChange(cb)  -> feuert bei Änderungen (Login, Like getoggelt)
   ============================================================ */
(function(){
  "use strict";
  const URL=window.NEXUS_SUPABASE_URL, KEY=window.NEXUS_SUPABASE_ANON_KEY;
  const configured = !!(URL && KEY && !/DEIN-|YOUR-/i.test(URL) && !/DEIN-|YOUR-/i.test(KEY) && window.supabase);
  let sb=null, user=null, counts={}, myLikes={}, ready=false, readyCbs=[], changeCbs=[];

  /* ---- Favoriten (lokal, wird von account.js mitsynchronisiert) ---- */
  function loadFavs(){ try{ return JSON.parse(localStorage.getItem("nexus_favs")||"[]"); }catch(e){ return []; } }
  function saveFavs(a){ localStorage.setItem("nexus_favs", JSON.stringify(a)); }
  function isFav(g){ return loadFavs().indexOf(g)>=0; }
  function toggleFav(g){ const a=loadFavs(); const i=a.indexOf(g); if(i>=0) a.splice(i,1); else a.push(g); saveFavs(a); notify(); return i<0; }
  function getFavs(){ return loadFavs(); }

  /* ---- Likes (global) ---- */
  function likeCount(g){ return counts[g]||0; }
  function isLiked(g){ return !!myLikes[g]; }
  async function toggleLike(g){
    if(!configured||!sb) return {ok:false,reason:"nocfg"};
    if(!user) return {ok:false,reason:"login"};
    const liked=!!myLikes[g];
    try{
      if(liked){ await sb.from("likes").delete().eq("user_id",user.id).eq("game",g); myLikes[g]=false; counts[g]=Math.max(0,(counts[g]||1)-1); }
      else { await sb.from("likes").upsert([{user_id:user.id,game:g}],{onConflict:"user_id,game"}); myLikes[g]=true; counts[g]=(counts[g]||0)+1; }
      notify(); return {ok:true,liked:!liked};
    }catch(e){ console.warn("[nexus] like",e); return {ok:false,reason:"err"}; }
  }
  async function fetchCounts(){
    if(!sb) return;
    try{ const r=await sb.from("likes").select("game"); if(!r.error&&r.data){ const c={}; r.data.forEach(x=>c[x.game]=(c[x.game]||0)+1); counts=c; } }catch(e){ console.warn(e); }
  }
  async function fetchMine(){
    myLikes={}; if(!sb||!user) return;
    try{ const r=await sb.from("likes").select("game").eq("user_id",user.id); if(!r.error&&r.data) r.data.forEach(x=>myLikes[x.game]=true); }catch(e){}
  }

  /* ---- events ---- */
  function fireReady(){ ready=true; readyCbs.forEach(cb=>{try{cb();}catch(e){}}); readyCbs=[]; }
  function notify(){ changeCbs.forEach(cb=>{try{cb();}catch(e){}}); }

  async function init(){
    if(configured){
      try{
        sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,detectSessionInUrl:false,autoRefreshToken:true}});
        const s=await sb.auth.getSession(); user=s.data.session?s.data.session.user:null;
        sb.auth.onAuthStateChange(async(_e,session)=>{ user=session?session.user:null; await fetchMine(); notify(); });
        await fetchCounts(); await fetchMine();
      }catch(e){ console.warn("[nexus] social init",e); }
    }
    fireReady(); notify();
  }

  window.NexusSocial={
    isFav, toggleFav, getFavs,
    likeCount, isLiked, toggleLike,
    isConfigured:()=>configured, hasUser:()=>!!user,
    ready:cb=>{ if(typeof cb!=="function")return; if(ready)cb(); else readyCbs.push(cb); },
    onChange:cb=>{ if(typeof cb==="function") changeCbs.push(cb); }
  };
  init();
})();
