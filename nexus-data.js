/* ============================================================
   NEXUS ARCADE — nexus-data.js
   Daten fuer account.js: Erfolge, Rahmen, Titel, Cosmetics, Quests.
   Laedt VOR account.js und stellt window.NEXUS_DATA bereit.
   ============================================================ */
window.NEXUS_DATA=(function(){
  const FRAMES = [
    {id:"none",   req:1,  label:{en:"Basic",de:"Standard"}, css:"border-color:#5a6187"},
    {id:"bronze", req:3,  label:{en:"Bronze",de:"Bronze"},  css:"border-color:#c98a3a;box-shadow:0 0 10px #c98a3a88"},
    {id:"leaf",   req:5,  label:{en:"Leaf",de:"Blatt"},     css:"border-color:#5bbf4a;box-shadow:0 0 12px #5bbf4a99"},
    {id:"cyan",   req:7,  label:{en:"Aqua",de:"Aqua"},      css:"border-color:#39e6ff;box-shadow:0 0 14px #39e6ff99"},
    {id:"ember",  req:10, label:{en:"Ember",de:"Glut"},     css:"border-color:#ff7a3a;color:#ff7a3a;animation:nxPulse 1.6s infinite"},
    {id:"ice",    req:13, label:{en:"Frost",de:"Frost"},    css:"border-color:#9fe8ff;box-shadow:0 0 14px #9fe8ff99"},
    {id:"magenta",req:16, label:{en:"Neon",de:"Neon"},      css:"border-color:#c77dff;box-shadow:0 0 16px #c77dff99"},
    {id:"cosmic", req:20, label:{en:"Cosmic",de:"Kosmos"},  css:"border-image:linear-gradient(135deg,#7b2ff7,#39e6ff) 1;box-shadow:0 0 16px #7b2ff799"},
    {id:"gold",   req:25, label:{en:"Gold",de:"Gold"},      css:"border-color:#ffcf5c;box-shadow:0 0 18px #ffcf5ccc"},
    {id:"rainbow",req:32, label:{en:"Prisma",de:"Prisma"},  css:"border-color:#ff4d6d;animation:nxHue 5s linear infinite;box-shadow:0 0 16px currentColor"},
    {id:"void",   req:42, label:{en:"Void",de:"Leere"},     css:"border-color:#3a2b5c;box-shadow:0 0 18px #7b2ff7,inset 0 0 10px #000"},
    {id:"nexus",  req:55, label:{en:"Nexus",de:"Nexus"},    css:"border-image:linear-gradient(135deg,#39e6ff,#c77dff,#ffcf5c) 1;animation:nxHue 6s linear infinite;box-shadow:0 0 22px #39e6ff"},
  ];
  const PREMIUM_FRAMES = [
    {id:"aurora",price:300,shop:true,label:{en:"Aurora",de:"Aurora"},css:"border-image:linear-gradient(135deg,#7cff6b,#39e6ff,#c77dff) 1;animation:nxHue 7s linear infinite;box-shadow:0 0 18px #39e6ff"},
    {id:"lava",price:500,shop:true,label:{en:"Lava",de:"Lava"},css:"border-color:#ff5a2a;color:#ff5a2a;animation:nxPulse 1.15s infinite;box-shadow:0 0 16px #ff5a2a"},
    {id:"matrix",price:800,shop:true,label:{en:"Matrix",de:"Matrix"},css:"border-color:#3aff7a;box-shadow:0 0 18px #3aff7a,inset 0 0 12px #052"}
  ];
  const ALLFRAMES = FRAMES.concat(PREMIUM_FRAMES);
  const frameById = id => ALLFRAMES.find(f=>f.id===id)||FRAMES[0];
  const PREMIUM_AVATARS = [
    {id:"av_cool",e:"😎",price:120},{id:"av_ninja",e:"🥷",price:160},{id:"av_vamp",e:"🧛",price:180},
    {id:"av_alien",e:"👽",price:200},{id:"av_dragon",e:"🐉",price:260},{id:"av_lion",e:"🦁",price:150}
  ];
  const SVG_ICON={
    nexus:c=>'<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="'+c+'" stroke-width="2" stroke-linejoin="round"><path d="M12 3l7 4v10l-7 4-7-4V7z"/><circle cx="12" cy="12" r="2.6" fill="'+c+'"/></svg>',
    bot:c=>'<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round"><rect x="5" y="8" width="14" height="10" rx="2"/><circle cx="9.5" cy="13" r="1.2" fill="'+c+'"/><circle cx="14.5" cy="13" r="1.2" fill="'+c+'"/><path d="M12 4v4M8 18v2M16 18v2"/></svg>',
    ghost:c=>'<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="'+c+'" stroke-width="2" stroke-linejoin="round"><path d="M5 20v-9a7 7 0 0 1 14 0v9l-2.3-1.8L14 20l-2-1.8L10 20l-2.7-1.8z"/><circle cx="9.5" cy="11" r="1" fill="'+c+'"/><circle cx="14.5" cy="11" r="1" fill="'+c+'"/></svg>',
    bolt:c=>'<svg viewBox="0 0 24 24" width="100%" height="100%" fill="'+c+'" stroke="none"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    crown:c=>'<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="'+c+'" stroke-width="2" stroke-linejoin="round"><path d="M4 18h16M4 18l-1-9 5 4 4-7 4 7 5-4-1 9"/></svg>'
  };
  const SVG_AVATARS=[
    {id:"nexus",c:"#39e6ff"},{id:"nexus",c:"#c77dff"},{id:"nexus",c:"#7cff6b"},{id:"nexus",c:"#ffcf5c"},
    {id:"bot",c:"#39e6ff"},{id:"ghost",c:"#c77dff"},{id:"bolt",c:"#ffcf5c"},{id:"crown",c:"#ffcf5c"}
  ];
  const CUSTOM_IMG_LEVEL = 5; // eigenes Profilbild erst ab diesem Level

  /* ---------- Titel (Reward, wählbar) ---------- */
  const TITLES = [
    {id:"rookie",    req:1,  name:{en:"Rookie",de:"Neuling"}},
    {id:"challenger",req:5,  name:{en:"Challenger",de:"Herausforderer"}},
    {id:"veteran",   req:10, name:{en:"Veteran",de:"Veteran"}},
    {id:"elite",     req:18, name:{en:"Elite",de:"Elite"}},
    {id:"master",    req:28, name:{en:"Master",de:"Meister"}},
    {id:"legend",    req:40, name:{en:"Legend",de:"Legende"}},
    {id:"ascendant", req:55, name:{en:"Nexus Ascendant",de:"Nexus-Aufgestiegener"}},
  ];
  const titleById = id => TITLES.find(x=>x.id===id)||TITLES[0];

  /* ---------- Achievements-Register (spielübergreifend) ---------- */
  const ACH = [
    // --- Arcade / Meta ---
    {id:"welcome",   game:"arcade", icon:"🎉", xp:50,  name:{en:"Welcome to Nexus",de:"Willkommen im Nexus"}, desc:{en:"Open Nexus Arcade for the first time",de:"Nexus Arcade zum ersten Mal öffnen"}},
    {id:"play_dash", game:"dash",   icon:"🟢", xp:40,  name:{en:"Reflexes",de:"Reflexe"},           desc:{en:"Play Nexus Dash",de:"Nexus Dash spielen"}},
    {id:"play_idle", game:"idle",   icon:"🐲", xp:40,  name:{en:"Adventurer",de:"Abenteurer"},      desc:{en:"Play Nexus Realms",de:"Nexus Realms spielen"}},
    {id:"play_words",game:"words",  icon:"🟩", xp:40,  name:{en:"Wordsmith",de:"Wortkünstler"},     desc:{en:"Play Nexus Words",de:"Nexus Words spielen"}},
    {id:"explorer",  game:"arcade", icon:"🧭", xp:120, name:{en:"Explorer",de:"Entdecker"},         desc:{en:"Play all three games",de:"Alle drei Spiele spielen"}},
    {id:"lvl5",      game:"arcade", icon:"⭐", xp:100, name:{en:"Rising Star",de:"Aufsteiger"},     desc:{en:"Reach account level 5",de:"Konto-Level 5 erreichen"}},
    {id:"lvl10",     game:"arcade", icon:"🌟", xp:200, name:{en:"Seasoned",de:"Routiniert"},        desc:{en:"Reach account level 10",de:"Konto-Level 10 erreichen"}},
    {id:"lvl25",     game:"arcade", icon:"💫", xp:500, name:{en:"Nexus Elite",de:"Nexus-Elite"},    desc:{en:"Reach account level 25",de:"Konto-Level 25 erreichen"}},
    {id:"lvl40",     game:"arcade", icon:"👑", xp:900, name:{en:"Living Legend",de:"Lebende Legende"},desc:{en:"Reach account level 40",de:"Konto-Level 40 erreichen"}},
    {id:"collector", game:"arcade", icon:"🖼️", xp:150, name:{en:"Collector",de:"Sammler"},         desc:{en:"Unlock 5 profile frames",de:"5 Profilrahmen freischalten"}},
    // --- Nexus Dash ---
    {id:"dash_500",  game:"dash",   icon:"⚡", xp:60,  name:{en:"Quick",de:"Flink"},               desc:{en:"Score 500 in Nexus Dash",de:"500 Punkte in Nexus Dash"}},
    {id:"dash_1000", game:"dash",   icon:"🏅", xp:100, name:{en:"Sharp",de:"Scharf"},              desc:{en:"Score 1000 in Nexus Dash",de:"1000 Punkte in Nexus Dash"}},
    {id:"dash_2000", game:"dash",   icon:"🏆", xp:180, name:{en:"Untouchable",de:"Unberührbar"},    desc:{en:"Score 2000 in Nexus Dash",de:"2000 Punkte in Nexus Dash"}},
    {id:"dash_5000", game:"dash",   icon:"👑", xp:400, name:{en:"Ghost",de:"Geist"},               desc:{en:"Score 5000 in Nexus Dash",de:"5000 Punkte in Nexus Dash"}},
    {id:"dash_combo",game:"dash",   icon:"🎯", xp:90,  name:{en:"Combo King",de:"Combo-König"},     desc:{en:"Reach a x10 multiplier",de:"x10-Multiplikator erreichen"}},
    // --- Nexus Realms ---
    {id:"idle_realm5", game:"idle", icon:"🗺️", xp:80,  name:{en:"Realm Walker",de:"Reich-Wanderer"},desc:{en:"Reach Realm 5",de:"Reich 5 erreichen"}},
    {id:"idle_realm10",game:"idle", icon:"🏔️", xp:180, name:{en:"Pathfinder",de:"Pfadfinder"},     desc:{en:"Reach Realm 10",de:"Reich 10 erreichen"}},
    {id:"idle_ascend", game:"idle", icon:"✦",  xp:150, name:{en:"Ascended",de:"Aufgestiegen"},      desc:{en:"Ascend for the first time",de:"Zum ersten Mal aufsteigen"}},
    {id:"idle_ascend5",game:"idle", icon:"✨", xp:400, name:{en:"Reborn",de:"Wiedergeboren"},       desc:{en:"Ascend 5 times",de:"5-mal aufsteigen"}},
    {id:"idle_gold",   game:"idle", icon:"💰", xp:150, name:{en:"Rich",de:"Reich"},                desc:{en:"Earn 1M gold total",de:"Insgesamt 1 Mio. Gold verdienen"}},
    {id:"idle_party",  game:"idle", icon:"🧝", xp:100, name:{en:"Fellowship",de:"Gefährten"},       desc:{en:"Hire 10 companion levels",de:"10 Gefährten-Level anheuern"}},
    // --- Nexus Words ---
    {id:"words_win",     game:"words", icon:"✅", xp:60,  name:{en:"Solved",de:"Gelöst"},           desc:{en:"Win a daily word puzzle",de:"Ein Tagesrätsel lösen"}},
    {id:"words_perfect", game:"words", icon:"🎯", xp:140, name:{en:"Sniper",de:"Scharfschütze"},    desc:{en:"Solve in 2 guesses or fewer",de:"In 2 Versuchen oder weniger lösen"}},
    {id:"words_streak5", game:"words", icon:"🔥", xp:150, name:{en:"On Fire",de:"In Flammen"},      desc:{en:"Reach a 5-day streak",de:"5-Tage-Serie erreichen"}},
    {id:"words_streak15",game:"words", icon:"🌋", xp:380, name:{en:"Unstoppable",de:"Unaufhaltsam"},desc:{en:"Reach a 15-day streak",de:"15-Tage-Serie erreichen"}},
    {id:"words_25",      game:"words", icon:"💯", xp:450, name:{en:"Lexicon",de:"Lexikon"},         desc:{en:"Win 25 puzzles",de:"25 Rätsel gewinnen"}},
  ];
  const achById = id => ACH.find(a=>a.id===id);

  /* ---------- Auto-Bedingungen + zusätzliche Erfolge (100+) ---------- */
  function fmtN(n){ return n>=1e9?(n/1e9)+"B":n>=1e6?(n/1e6)+"M":n>=1e3?(n/1e3)+"K":(""+n); }
  const BASE_CONDS = {
    lvl5:{stat:"level",gte:5}, lvl10:{stat:"level",gte:10}, lvl25:{stat:"level",gte:25}, lvl40:{stat:"level",gte:40},
    collector:{stat:"framesUnlocked",gte:5},
    dash_500:{stat:"dash_best",gte:500}, dash_1000:{stat:"dash_best",gte:1000}, dash_2000:{stat:"dash_best",gte:2000}, dash_5000:{stat:"dash_best",gte:5000},
    idle_realm5:{stat:"idle_zone",gte:5}, idle_realm10:{stat:"idle_zone",gte:10},
    idle_ascend:{stat:"idle_shards",gte:1}, idle_ascend5:{stat:"idle_shards",gte:5},
    idle_gold:{stat:"idle_gold",gte:1000000}, idle_party:{stat:"idle_dps",gte:10},
    words_win:{stat:"words_wins",gte:1}, words_perfect:{stat:"words_perfect"},
    words_streak5:{stat:"words_max",gte:5}, words_streak15:{stat:"words_max",gte:15}, words_25:{stat:"words_wins",gte:25}
  };
  Object.keys(BASE_CONDS).forEach(function(id){ const a=achById(id); if(a) a.cond=BASE_CONDS[id]; });
  function addTier(prefix,game,icon,stat,vals,nEn,nDe,dEn,dDe,big){
    vals.forEach(function(val,i){
      if(achById(prefix+"_"+val)) return;
      const lab = big?fmtN(val):(""+val);
      ACH.push({id:prefix+"_"+val,game:game,icon:icon,xp:40+i*35,
        name:{en:nEn+" "+lab,de:nDe+" "+lab},
        desc:{en:dEn.replace("{n}",lab),de:dDe.replace("{n}",lab)},
        cond:{stat:stat,gte:val}});
    });
  }
  addTier("lvl","arcade","⭐","level",[15,20,30,35,45,50,60,70,80,90,100],"Level","Level","Reach account level {n}","Konto-Level {n} erreichen",false);
  addTier("dash","dash","⚡","dash_best",[100,250,750,1500,3000,7500,10000,15000,25000],"Dash","Dash","Score {n} in Nexus Dash","{n} Punkte in Nexus Dash",false);
  addTier("realm","idle","🗺️","idle_zone",[2,3,4,7,13,16,20,25,30,40,50],"Realm","Reich","Reach Realm {n}","Reich {n} erreichen",false);
  addTier("hero","idle","🛡️","idle_hero",[5,10,20,35,50,75,100,150,200],"Hero Lv","Held Lv","Reach hero level {n}","Heldenlevel {n} erreichen",false);
  addTier("shard","idle","✦","idle_shards",[2,3,10,20,50,100],"Shards","Splitter","Own {n} Nexus Shards","{n} Nexus-Splitter besitzen",false);
  addTier("party","idle","🧝","idle_dps",[5,25,50,100,200],"Party","Gefährten","Reach {n} companion levels","{n} Gefährten-Level erreichen",false);
  addTier("gold","idle","💰","idle_gold",[1000,10000,100000,10000000,100000000,1000000000],"Gold","Gold","Hold {n} gold","{n} Gold besitzen",true);
  addTier("wwin","words","✅","words_wins",[3,5,10,50,100,200],"Wins","Siege","Win {n} word puzzles","{n} Worträtsel gewinnen",false);
  addTier("wstreak","words","🔥","words_max",[2,3,10,25,50],"Streak","Serie","Reach a {n}-day streak","{n}-Tage-Serie erreichen",false);
  addTier("wplay","words","📅","words_played",[5,10,25,50,100],"Puzzles","Rätsel","Play {n} word puzzles","{n} Worträtsel spielen",false);
  addTier("frames","arcade","🖼️","framesUnlocked",[3,8,12],"Frames","Rahmen","Unlock {n} profile frames","{n} Profilrahmen freischalten",false);
  addTier("titles","arcade","🏷️","titlesUnlocked",[3,5,7],"Titles","Titel","Unlock {n} titles","{n} Titel freischalten",false);
  ACH.push({id:"custom_pic",game:"arcade",icon:"📷",xp:80,name:{en:"Face of Nexus",de:"Gesicht des Nexus"},desc:{en:"Set a custom profile picture",de:"Eigenes Profilbild setzen"},cond:{stat:"customImg"}});
  // neue Spiele: Spielen-Erfolge + Meta
  ACH.push({id:"play_racer",game:"racer",icon:"🏎️",xp:40,name:{en:"Driver",de:"Fahrer"},desc:{en:"Play Nexus Racer",de:"Nexus Racer spielen"}});
  ACH.push({id:"play_merge",game:"merge",icon:"🔢",xp:40,name:{en:"Merger",de:"Verschmelzer"},desc:{en:"Play Nexus 2048",de:"Nexus 2048 spielen"}});
  ACH.push({id:"play_run3d",game:"run3d",icon:"🧊",xp:40,name:{en:"Runner",de:"Läufer"},desc:{en:"Play Nexus Run 3D",de:"Nexus Run 3D spielen"}});
  ACH.push({id:"gamer",game:"arcade",icon:"🕹️",xp:350,name:{en:"True Gamer",de:"Echter Gamer"},desc:{en:"Play all eight games",de:"Alle acht Spiele spielen"}});
  addTier("racer","racer","🏎️","racer_best",[500,1500,3000,6000,10000,20000],"Racer","Racer","Drive {n}m in Nexus Racer","{n}m in Nexus Racer fahren",false);
  addTier("merge","merge","🔢","merge_best",[500,2000,5000,10000,20000,50000],"2048","2048","Score {n} in Nexus 2048","{n} Punkte in Nexus 2048",false);
  addTier("run3d","run3d","🧊","run3d_best",[200,500,1000,2000,4000,8000],"Run","Run","Run {n}m in Nexus Run 3D","{n}m in Nexus Run 3D laufen",false);
  ACH.push({id:"play_snake",game:"snake",icon:"🐍",xp:40,name:{en:"Serpent",de:"Schlange"},desc:{en:"Play Nexus Snake",de:"Nexus Snake spielen"}});
  ACH.push({id:"play_breaker",game:"breaker",icon:"🧱",xp:40,name:{en:"Smasher",de:"Zerschmetterer"},desc:{en:"Play Nexus Breaker",de:"Nexus Breaker spielen"}});
  addTier("snake","snake","🐍","snake_best",[50,100,200,300,500,800],"Snake","Snake","Score {n} in Nexus Snake","{n} Punkte in Nexus Snake",false);
  addTier("breaker","breaker","🧱","breaker_best",[200,500,1000,2000,4000,8000],"Breaker","Breaker","Score {n} in Nexus Breaker","{n} Punkte in Nexus Breaker",false);
  ACH.push({id:"play_tycoon",game:"tycoon",icon:"💼",xp:40,name:{en:"Entrepreneur",de:"Unternehmer"},desc:{en:"Play Nexus Tycoon",de:"Nexus Tycoon spielen"}});
  ACH.push({id:"play_stack",game:"stack",icon:"🧱",xp:40,name:{en:"Builder",de:"Baumeister"},desc:{en:"Play Nexus Stack",de:"Nexus Stack spielen"}});
  ACH.push({id:"play_blocks",game:"blocks",icon:"🟪",xp:40,name:{en:"Stacker",de:"Stapler"},desc:{en:"Play Nexus Blocks",de:"Nexus Blocks spielen"}});
  ACH.push({id:"play_finance",game:"finance",icon:"💹",xp:40,name:{en:"Trader",de:"Trader"},desc:{en:"Play Nexus Finance",de:"Nexus Finance spielen"}});
  ACH.push({id:"play_ticker",game:"ticker",icon:"📈",xp:40,name:{en:"Day Trader",de:"Day-Trader"},desc:{en:"Play Nexus Ticker",de:"Nexus Ticker spielen"}});
  addTier("tycoon","tycoon","💼","tycoon_best",[1000,100000,1000000,100000000,10000000000,1000000000000],"Empire","Imperium","Earn {n} total in Nexus Tycoon","{n} gesamt in Nexus Tycoon verdienen",true);
  addTier("stack","stack","🏢","stack_best",[10,25,50,100,150,250],"Tower","Turm","Stack {n} blocks in Nexus Stack","{n} Blöcke in Nexus Stack stapeln",false);
  addTier("blocks","blocks","🟪","blocks_best",[500,2000,5000,10000,25000,50000],"Blocks","Blocks","Score {n} in Nexus Blocks","{n} Punkte in Nexus Blocks",false);
  addTier("ticker","ticker","💹","ticker_best",[1500,2500,4000,6000,10000,20000],"Net Worth","Nettovermögen","Reach ${n} net worth in Nexus Ticker","{n}$ Nettovermögen in Nexus Ticker erreichen",true);
  ACH.push({id:"finance_flip1",game:"finance",icon:"🏠",xp:60,name:{en:"First Flip",de:"Erster Flip"},desc:{en:"Sell your first renovated property in Nexus Empire",de:"Dein erstes renoviertes Objekt in Nexus Empire verkaufen"},cond:{stat:"finance_flips",gte:1}});
  addTier("financeflips","finance","🏠","finance_flips",[5,15,40,100],"Flips","Flips","Sell {n} properties in Nexus Empire","{n} Objekte in Nexus Empire verkaufen",false);
  addTier("financeprofit","finance","💰","finance_career_profit",[5000,25000,100000,500000],"Realtor","Makler","Earn ${n} career profit in Nexus Empire","{n}$ Karriere-Gewinn in Nexus Empire erreichen",true);
  ACH.push({id:"finance_biz1",game:"finance",icon:"🏪",xp:60,name:{en:"Business Owner",de:"Unternehmer"},desc:{en:"Open your first business in Nexus Empire",de:"Dein erstes Unternehmen in Nexus Empire eröffnen"},cond:{stat:"finance_biz_count",gte:1}});
  ACH.push({id:"finance_manager1",game:"finance",icon:"🤖",xp:220,name:{en:"Hands Off",de:"Loslassen"},desc:{en:"Hire your first manager to automate a business",de:"Deinen ersten Manager anheuern, der ein Unternehmen automatisiert"},cond:{stat:"finance_managers",gte:1}});
  addTier("financebizprofit","finance","💼","finance_biz_profit",[5000,25000,100000],"Mogul","Mogul","Earn ${n} total business profit in Nexus Empire","{n}$ Unternehmensgewinn in Nexus Empire erreichen",true);
  ACH.push({id:"finance_stock1",game:"finance",icon:"📈",xp:60,name:{en:"Market Debut",de:"Börsendebüt"},desc:{en:"Buy your first stock in Nexus Empire",de:"Deine erste Aktie in Nexus Empire kaufen"},cond:{stat:"finance_stock_trades",gte:1}});
  addTier("financeportfolio","finance","📊","finance_stock_companies",[2,4,6],"Diversified","Diversifiziert","Own shares in {n} different companies at once","Aktien von {n} verschiedenen Firmen gleichzeitig besitzen",false);
  ACH.push({id:"finance_day1",game:"finance",icon:"⚡",xp:80,name:{en:"Day Trader",de:"Day-Trader"},desc:{en:"Complete your first Day Trading session",de:"Deine erste Day-Trading-Session abschließen"},cond:{stat:"finance_day_trades",gte:1}});
  addTier("financedaywin","finance","⚡","finance_day_profit",[1000,5000,20000],"High Roller","High Roller","Earn ${n} total from Day Trading sessions","{n}$ insgesamt durch Day-Trading-Sessions verdienen",true);

  /* ---------- Taegliche Quests ---------- */
  const QUESTS = [
    {id:"play1", xp:40,  target:1,   name:{en:"Warm up",de:"Aufwärmen"},          prog:(s,sn,v)=>v.length},
    {id:"play3", xp:120, target:3,   name:{en:"Sampler",de:"Vielspieler"},        prog:(s,sn,v)=>v.length},
    {id:"xp150", xp:80,  target:150, name:{en:"Grinder",de:"XP-Jäger"},           prog:(s,sn,v)=>Math.max(0,(s.xp||0)-sn.xp)},
    {id:"beat",  xp:100, target:1,   name:{en:"Record breaker",de:"Rekordbrecher"},prog:(s,sn,v)=>((s.dash_best>sn.dash_best||s.racer_best>sn.racer_best||s.merge_best>sn.merge_best||s.run3d_best>sn.run3d_best)?1:0)},
    {id:"word",  xp:90,  target:1,   name:{en:"Word of the day",de:"Wort des Tages"},prog:(s,sn,v)=>Math.max(0,s.words_wins-sn.words_wins)},
    {id:"realm", xp:90,  target:1,   name:{en:"Onward",de:"Voran"},               prog:(s,sn,v)=>Math.max(0,s.idle_zone-sn.idle_zone)}
  ];
  const questSub={play1:{en:"Play any game today",de:"Heute irgendein Spiel spielen"},play3:{en:"Play 3 different games today",de:"Heute 3 verschiedene Spiele spielen"},xp150:{en:"Earn 150 XP today",de:"Heute 150 XP verdienen"},beat:{en:"Beat any highscore today",de:"Heute einen Highscore knacken"},word:{en:"Win a word puzzle today",de:"Heute ein Worträtsel gewinnen"},realm:{en:"Reach a new realm today",de:"Heute ein neues Reich erreichen"}};
  const questById=id=>QUESTS.find(q=>q.id===id);
  const SCORE_MAP={dash:"dash_best",racer:"racer_best",merge:"merge_best",run3d:"run3d_best",snake:"snake_best",breaker:"breaker_best",tycoon:"tycoon_best",stack:"stack_best",blocks:"blocks_best",ticker:"ticker_best",idle:"idle_zone",words:"words_max"};

  /* ---------- Spiele-Katalog (fuer Top-Bar-Spielname + "Das koennte dir gefallen") ---------- */
  const GAMES_CATALOG=[
    {id:"dash",href:"/dash/",name:{en:"Nexus Dash",de:"Nexus Dash"},short:{en:"Dash",de:"Dash"},cats:["arcade"]},
    {id:"idle",href:"/idle/",name:{en:"Nexus Realms",de:"Nexus Realms"},short:{en:"Realms",de:"Realms"},cats:["rpg"]},
    {id:"words",href:"/words/",name:{en:"Nexus Words",de:"Nexus Words"},short:{en:"Words",de:"Words"},cats:["puzzle","daily"]},
    {id:"racer",href:"/racer/",name:{en:"Nexus Racer",de:"Nexus Racer"},short:{en:"Racer",de:"Racer"},cats:["racing","arcade"]},
    {id:"merge",href:"/merge/",name:{en:"Nexus 2048",de:"Nexus 2048"},short:{en:"2048",de:"2048"},cats:["puzzle"]},
    {id:"run3d",href:"/run3d/",name:{en:"Nexus Run 3D",de:"Nexus Run 3D"},short:{en:"Run 3D",de:"Run 3D"},cats:["3d","arcade"]},
    {id:"snake",href:"/snake/",name:{en:"Nexus Snake",de:"Nexus Snake"},short:{en:"Snake",de:"Snake"},cats:["arcade"]},
    {id:"breaker",href:"/breaker/",name:{en:"Nexus Breaker",de:"Nexus Breaker"},short:{en:"Breaker",de:"Breaker"},cats:["arcade"]},
    {id:"tycoon",href:"/tycoon/",name:{en:"Nexus Tycoon",de:"Nexus Tycoon"},short:{en:"Tycoon",de:"Tycoon"},cats:["idle"]},
    {id:"stack",href:"/stack/",name:{en:"Nexus Stack",de:"Nexus Stack"},short:{en:"Stack",de:"Stack"},cats:["arcade"]},
    {id:"blocks",href:"/blocks/",name:{en:"Nexus Blocks",de:"Nexus Blocks"},short:{en:"Blocks",de:"Blocks"},cats:["puzzle"]},
    {id:"finance",href:"/finance/",name:{en:"Nexus Finance",de:"Nexus Finance"},short:{en:"Finance",de:"Finance"},cats:["idle"]},
    {id:"ticker",href:"/ticker/",name:{en:"Nexus Ticker",de:"Nexus Ticker"},short:{en:"Ticker",de:"Ticker"},cats:["arcade"]}
  ];
  const GAME_ICONS={
    dash:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    idle:'<path d="M14 3l7 7-4 1-1 4-7-7"/><path d="M9 8l-6 6 3 3 6-6"/><path d="M5 17l-2 4 4-2"/>',
    words:'<rect x="3" y="3" width="6.5" height="6.5" rx="1.4"/><rect x="14.5" y="3" width="6.5" height="6.5" rx="1.4"/><rect x="3" y="14.5" width="6.5" height="6.5" rx="1.4"/><rect x="14.5" y="14.5" width="6.5" height="6.5" rx="1.4"/>',
    racer:'<path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5v5h-3.5"/><path d="M3 13v5h3.5"/><path d="M6.5 18h11"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    merge:'<path d="M4 9h16M4 15h16M9 4v16M15 4v16"/>',
    run3d:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2v20M3 7l9 5 9-5"/>',
    snake:'<path d="M5 7h7a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9"/><circle cx="19" cy="6" r="1.3" fill="currentColor" stroke="none"/>',
    breaker:'<rect x="3" y="4" width="5" height="3" rx="1"/><rect x="10" y="4" width="5" height="3" rx="1"/><rect x="16" y="4" width="5" height="3" rx="1"/><circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none"/><rect x="8" y="19" width="8" height="2.4" rx="1.2"/>',
    tycoon:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    stack:'<rect x="6" y="15" width="12" height="4" rx="1"/><rect x="4" y="10" width="12" height="4" rx="1"/><rect x="8" y="5" width="12" height="4" rx="1"/>',
    blocks:'<rect x="3.5" y="10" width="5" height="5" rx="1"/><rect x="9.5" y="10" width="5" height="5" rx="1"/><rect x="15.5" y="10" width="5" height="5" rx="1"/><rect x="9.5" y="4" width="5" height="5" rx="1"/>',
    finance:'<path d="M4 20V10M10 20V4M16 20v-7M4 20h16"/>',
    ticker:'<path d="M3 17l5-5 4 4 7-8"/><path d="M15 6h5v5"/>'
  };
  return {FRAMES:FRAMES,PREMIUM_FRAMES:PREMIUM_FRAMES,ALLFRAMES:ALLFRAMES,frameById:frameById,PREMIUM_AVATARS:PREMIUM_AVATARS,SVG_ICON:SVG_ICON,SVG_AVATARS:SVG_AVATARS,CUSTOM_IMG_LEVEL:CUSTOM_IMG_LEVEL,TITLES:TITLES,titleById:titleById,ACH:ACH,achById:achById,QUESTS:QUESTS,questSub:questSub,questById:questById,SCORE_MAP:SCORE_MAP,GAMES_CATALOG:GAMES_CATALOG,GAME_ICONS:GAME_ICONS};
})();
