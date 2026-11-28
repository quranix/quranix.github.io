/* js/quran.js
   WHAT IT IS: the main part of the app. Home screen, surah list, reader, audio, offline audio,
   99 names, hadith, notes, bookmarks, and the screens for the topics tab and the word-meaning tab.
   LOADS AFTER:  quran-data.js, data/topics.js, data/dictionary.js, data/district.js
   LOADS BEFORE: js/apps.js (apps.js uses many names from this file)

   EDIT RULES
   1. Keep the code formatted and readable. Do not minify.
   2. Change a function where it is. Do not keep the old one and add a new one with the same name.
   3. Before you rename a function or a window.* name, search js/apps.js too. It may use it.
   4. Put big new data lists in the data/ folder, not here.
   5. After any change, raise the CACHE number in sw.js (example: quranix-v2.0.32 to quranix-v2.0.33).

   LOAD ORDER: quran-data.js, data/topics.js, data/dictionary.js, data/district.js, js/quran.js, js/apps.js
*/

// SECTION INDEX (search: "[NAME] start")
//   [CARD: Asma of the Day]
//   [PAGE: Asma ul Husna]
//   [PAGE: Asma Detail]
//   [CARD: Hadith of the Day]
//   [CARD: Hadith/Ayah card]
//   [PAGE: Hadith Offline Collections list]
//   [PAGE: Hadith Offline Collection Detail]
//   [PAGE: Hadith]
//   [PAGE: Hadith List]
//   [PAGE: Hadith Detail]
//   [SHEET: Ayah Note Editor]
//   [CARD: Reading Goal]
//   [MENU: Quick Jump (surah/ayah)]
//   [CARD: Ayah of the Day]
//   [SHEET: Tafseer]
//   [TABS: Quran tab bar]
//   [ROUTER: renderHome (mode -> page)]
//   [PAGE: Topics]
//   [PAGE: Dictionary (More page wrapper)]
//   [PAGE: Dictionary (tab)]
//   [PAGE: Dictionary List]
//   [PAGE: Dictionary Detail]
//   [PAGE: Topic Detail]
//   [PAGE: Quran Home]
//   [SHEET: Today]
//   [PAGE: Reader shell]
//   [PAGE: Surah Reader]
//   [PAGE: Juz Reader]

/* ===== সূরা ===== */
// সব সূরা + বাংলা অনুবাদ
// API: https://api.alquran.cloud/v1 - LOCAL = window.QURAN thakle offline use kore

const SURAH_META = [
  {n:1, name:"Al-Fatiha", bn:"আল-ফাতিহা", ayahs:7, type:"Makki"},
  {n:2, name:"Al-Baqarah", bn:"আল-বাকারা", ayahs:286, type:"Madani"},
  {n:3, name:"Aal-e-Imran", bn:"আলে ইমরান", ayahs:200, type:"Madani"},
  {n:4, name:"An-Nisa", bn:"আন-নিসা", ayahs:176, type:"Madani"},
  {n:5, name:"Al-Ma'idah", bn:"আল-মায়িদাহ", ayahs:120, type:"Madani"},
  {n:6, name:"Al-An'am", bn:"আল-আনআম", ayahs:165, type:"Makki"},
  {n:7, name:"Al-A'raf", bn:"আল-আরাফ", ayahs:206, type:"Makki"},
  {n:8, name:"Al-Anfal", bn:"আল-আনফাল", ayahs:75, type:"Madani"},
  {n:9, name:"At-Tawbah", bn:"আত-তাওবাহ", ayahs:129, type:"Madani"},
  {n:10, name:"Yunus", bn:"ইউনুস", ayahs:109, type:"Makki"},
  {n:11, name:"Hud", bn:"হুদ", ayahs:123, type:"Makki"},
  {n:12, name:"Yusuf", bn:"ইউসুফ", ayahs:111, type:"Makki"},
  {n:13, name:"Ar-Ra'd", bn:"আর-রাদ", ayahs:43, type:"Madani"},
  {n:14, name:"Ibrahim", bn:"ইবরাহিম", ayahs:52, type:"Makki"},
  {n:15, name:"Al-Hijr", bn:"আল-হিজর", ayahs:99, type:"Makki"},
  {n:16, name:"An-Nahl", bn:"আন-নাহল", ayahs:128, type:"Makki"},
  {n:17, name:"Al-Isra", bn:"আল-ইসরা", ayahs:111, type:"Makki"},
  {n:18, name:"Al-Kahf", bn:"আল-কাহফ", ayahs:110, type:"Makki"},
  {n:19, name:"Maryam", bn:"মারইয়াম", ayahs:98, type:"Makki"},
  {n:20, name:"Taha", bn:"ত্ব-হা", ayahs:135, type:"Makki"},
  {n:21, name:"Al-Anbiya", bn:"আল-আম্বিয়া", ayahs:112, type:"Makki"},
  {n:22, name:"Al-Hajj", bn:"আল-হাজ্জ", ayahs:78, type:"Madani"},
  {n:23, name:"Al-Mu'minun", bn:"আল-মুমিনুন", ayahs:118, type:"Makki"},
  {n:24, name:"An-Nur", bn:"আন-নূর", ayahs:64, type:"Madani"},
  {n:25, name:"Al-Furqan", bn:"আল-ফুরকান", ayahs:77, type:"Makki"},
  {n:26, name:"Ash-Shu'ara", bn:"আশ-শুআরা", ayahs:227, type:"Makki"},
  {n:27, name:"An-Naml", bn:"আন-নামল", ayahs:93, type:"Makki"},
  {n:28, name:"Al-Qasas", bn:"আল-কাসাস", ayahs:88, type:"Makki"},
  {n:29, name:"Al-Ankabut", bn:"আল-আনকাবুত", ayahs:69, type:"Makki"},
  {n:30, name:"Ar-Rum", bn:"আর-রুম", ayahs:60, type:"Makki"},
  {n:31, name:"Luqman", bn:"লুকমান", ayahs:34, type:"Makki"},
  {n:32, name:"As-Sajdah", bn:"আস-সাজদাহ", ayahs:30, type:"Makki"},
  {n:33, name:"Al-Ahzab", bn:"আল-আহযাব", ayahs:73, type:"Madani"},
  {n:34, name:"Saba", bn:"সাবা", ayahs:54, type:"Makki"},
  {n:35, name:"Fatir", bn:"ফাতির", ayahs:45, type:"Makki"},
  {n:36, name:"Ya-Sin", bn:"ইয়াসিন", ayahs:83, type:"Makki"},
  {n:37, name:"As-Saffat", bn:"আস-সাফফাত", ayahs:182, type:"Makki"},
  {n:38, name:"Sad", bn:"সাদ", ayahs:88, type:"Makki"},
  {n:39, name:"Az-Zumar", bn:"আয-যুমার", ayahs:75, type:"Makki"},
  {n:40, name:"Ghafir", bn:"গাফির", ayahs:85, type:"Makki"},
  {n:41, name:"Fussilat", bn:"ফুসসিলাত", ayahs:54, type:"Makki"},
  {n:42, name:"Ash-Shura", bn:"আশ-শূরা", ayahs:53, type:"Makki"},
  {n:43, name:"Az-Zukhruf", bn:"আয-যুখরুফ", ayahs:89, type:"Makki"},
  {n:44, name:"Ad-Dukhan", bn:"আদ-দুখান", ayahs:59, type:"Makki"},
  {n:45, name:"Al-Jathiyah", bn:"আল-জাসিয়া", ayahs:37, type:"Makki"},
  {n:46, name:"Al-Ahqaf", bn:"আল-আহকাফ", ayahs:35, type:"Makki"},
  {n:47, name:"Muhammad", bn:"মুহাম্মদ", ayahs:38, type:"Madani"},
  {n:48, name:"Al-Fath", bn:"আল-ফাতহ", ayahs:29, type:"Madani"},
  {n:49, name:"Al-Hujurat", bn:"আল-হুজুরাত", ayahs:18, type:"Madani"},
  {n:50, name:"Qaf", bn:"কাফ", ayahs:45, type:"Makki"},
  {n:51, name:"Adh-Dhariyat", bn:"আয-যারিয়াত", ayahs:60, type:"Makki"},
  {n:52, name:"At-Tur", bn:"আত-তূর", ayahs:49, type:"Makki"},
  {n:53, name:"An-Najm", bn:"আন-নাজম", ayahs:62, type:"Makki"},
  {n:54, name:"Al-Qamar", bn:"আল-কামার", ayahs:55, type:"Makki"},
  {n:55, name:"Ar-Rahman", bn:"আর-রহমান", ayahs:78, type:"Madani"},
  {n:56, name:"Al-Waqi'ah", bn:"আল-ওয়াকিয়াহ", ayahs:96, type:"Makki"},
  {n:57, name:"Al-Hadid", bn:"আল-হাদিদ", ayahs:29, type:"Madani"},
  {n:58, name:"Al-Mujadila", bn:"আল-মুজাদিলা", ayahs:22, type:"Madani"},
  {n:59, name:"Al-Hashr", bn:"আল-হাশর", ayahs:24, type:"Madani"},
  {n:60, name:"Al-Mumtahanah", bn:"আল-মুমতাহিনাহ", ayahs:13, type:"Madani"},
  {n:61, name:"As-Saff", bn:"আস-সাফ", ayahs:14, type:"Madani"},
  {n:62, name:"Al-Jumu'ah", bn:"আল-জুমুআহ", ayahs:11, type:"Madani"},
  {n:63, name:"Al-Munafiqun", bn:"আল-মুনাফিকুন", ayahs:11, type:"Madani"},
  {n:64, name:"At-Taghabun", bn:"আত-তাগাবুন", ayahs:18, type:"Madani"},
  {n:65, name:"At-Talaq", bn:"আত-তালাক", ayahs:12, type:"Madani"},
  {n:66, name:"At-Tahrim", bn:"আত-তাহরিম", ayahs:12, type:"Madani"},
  {n:67, name:"Al-Mulk", bn:"আল-মুলক", ayahs:30, type:"Makki"},
  {n:68, name:"Al-Qalam", bn:"আল-কলম", ayahs:52, type:"Makki"},
  {n:69, name:"Al-Haqqah", bn:"আল-হাক্কাহ", ayahs:52, type:"Makki"},
  {n:70, name:"Al-Ma'arij", bn:"আল-মাআরিজ", ayahs:44, type:"Makki"},
  {n:71, name:"Nuh", bn:"নূহ", ayahs:28, type:"Makki"},
  {n:72, name:"Al-Jinn", bn:"আল-জিন", ayahs:28, type:"Makki"},
  {n:73, name:"Al-Muzzammil", bn:"আল-মুযযাম্মিল", ayahs:20, type:"Makki"},
  {n:74, name:"Al-Muddaththir", bn:"আল-মুদ্দাসসির", ayahs:56, type:"Makki"},
  {n:75, name:"Al-Qiyamah", bn:"আল-কিয়ামাহ", ayahs:40, type:"Makki"},
  {n:76, name:"Al-Insan", bn:"আল-ইনসান", ayahs:31, type:"Madani"},
  {n:77, name:"Al-Mursalat", bn:"আল-মুরসালাত", ayahs:50, type:"Makki"},
  {n:78, name:"An-Naba", bn:"আন-নাবা", ayahs:40, type:"Makki"},
  {n:79, name:"An-Nazi'at", bn:"আন-নাযিআত", ayahs:46, type:"Makki"},
  {n:80, name:"Abasa", bn:"আবাসা", ayahs:42, type:"Makki"},
  {n:81, name:"At-Takwir", bn:"আত-তাকভীর", ayahs:29, type:"Makki"},
  {n:82, name:"Al-Infitar", bn:"আল-ইনফিতার", ayahs:19, type:"Makki"},
  {n:83, name:"Al-Mutaffifin", bn:"আল-মুতাফফিফীন", ayahs:36, type:"Makki"},
  {n:84, name:"Al-Inshiqaq", bn:"আল-ইনশিকাক", ayahs:25, type:"Makki"},
  {n:85, name:"Al-Buruj", bn:"আল-বুরুজ", ayahs:22, type:"Makki"},
  {n:86, name:"At-Tariq", bn:"আত-তারিক", ayahs:17, type:"Makki"},
  {n:87, name:"Al-A'la", bn:"আল-আলা", ayahs:19, type:"Makki"},
  {n:88, name:"Al-Ghashiyah", bn:"আল-গাশিয়াহ", ayahs:26, type:"Makki"},
  {n:89, name:"Al-Fajr", bn:"আল-ফাজর", ayahs:30, type:"Makki"},
  {n:90, name:"Al-Balad", bn:"আল-বালাদ", ayahs:20, type:"Makki"},
  {n:91, name:"Ash-Shams", bn:"আশ-শামস", ayahs:15, type:"Makki"},
  {n:92, name:"Al-Layl", bn:"আল-লাইল", ayahs:21, type:"Makki"},
  {n:93, name:"Ad-Duha", bn:"আদ-দুহা", ayahs:11, type:"Makki"},
  {n:94, name:"Ash-Sharh", bn:"আশ-শারহ", ayahs:8, type:"Makki"},
  {n:95, name:"At-Tin", bn:"আত-তীন", ayahs:8, type:"Makki"},
  {n:96, name:"Al-Alaq", bn:"আল-আলাক", ayahs:19, type:"Makki"},
  {n:97, name:"Al-Qadr", bn:"আল-কদর", ayahs:5, type:"Makki"},
  {n:98, name:"Al-Bayyinah", bn:"আল-বাইয়্যিনাহ", ayahs:8, type:"Madani"},
  {n:99, name:"Az-Zalzalah", bn:"আয-যালযালাহ", ayahs:8, type:"Madani"},
  {n:100, name:"Al-Adiyat", bn:"আল-আদিয়াত", ayahs:11, type:"Makki"},
  {n:101, name:"Al-Qari'ah", bn:"আল-কারিআহ", ayahs:11, type:"Makki"},
  {n:102, name:"At-Takathur", bn:"আত-তাকাসুর", ayahs:8, type:"Makki"},
  {n:103, name:"Al-Asr", bn:"আল-আসর", ayahs:3, type:"Makki"},
  {n:104, name:"Al-Humazah", bn:"আল-হুমাযাহ", ayahs:9, type:"Makki"},
  {n:105, name:"Al-Fil", bn:"আল-ফীল", ayahs:5, type:"Makki"},
  {n:106, name:"Quraysh", bn:"কুরাইশ", ayahs:4, type:"Makki"},
  {n:107, name:"Al-Ma'un", bn:"আল-মাউন", ayahs:7, type:"Makki"},
  {n:108, name:"Al-Kawthar", bn:"আল-কাওসার", ayahs:3, type:"Makki"},
  {n:109, name:"Al-Kafirun", bn:"আল-কাফিরুন", ayahs:6, type:"Makki"},
  {n:110, name:"An-Nasr", bn:"আন-নাসর", ayahs:3, type:"Madani"},
  {n:111, name:"Al-Masad", bn:"আল-মাসাদ", ayahs:5, type:"Makki"},
  {n:112, name:"Al-Ikhlas", bn:"আল-ইখলাস", ayahs:4, type:"Makki"},
  {n:113, name:"Al-Falaq", bn:"আল-ফালাক", ayahs:5, type:"Makki"},
  {n:114, name:"An-Nas", bn:"আন-নাস", ayahs:6, type:"Makki"}
];
window.SURAH_META = SURAH_META;
// Bangla onubad API theke ase - AlQuran Cloud bn.bengali edition
async function loadSurah(n){
  const API = "https://api.alquran.cloud/v1";
  const getOk = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error("API HTTP " + r.status);
    const j = await r.json();
    if (!j || !j.data) throw new Error("API ডেটা পাওয়া যায়নি");
    return j;
  };
  const [ar, bn] = await Promise.all([
    getOk(`${API}/surah/${n}`),
    getOk(`${API}/surah/${n}/bn.bengali`)
  ]);
  return { ar: ar.data, bn: bn.data };
}
window.loadSurah = loadSurah;



/* ===== CUSTOM DIALOG (ac-ov) — Browser prompt/confirm/alert er bodole ===== */
window.qxShowConfirm = window.qxShowConfirm || function(message, onConfirm, onCancel){
  try{
    var ov=document.createElement('div'); ov.className='ac-ov'; ov.style.zIndex='140';
    var box=document.createElement('div'); box.className='ac-box';
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:16px">নিশ্চিত করুন</b><button type="button" class="pp-close" id="qxConfirmClose" style="position:static">×</button></div>'
      +'<div style="line-height:1.7;margin:8px 0">'+message+'</div>'
      +'<div class="ac-row" style="display:flex;gap:10px;margin-top:16px"><button type="button" class="ac-btn ghost" id="qxConfirmNo" style="flex:1;height:44px;border:1px solid var(--qx-border);border-radius:999px;background:var(--qx-card-bg)">বাতিল</button><button type="button" class="ac-btn" id="qxConfirmYes" style="flex:1;height:44px;border-radius:999px;background:var(--qx-main-color);color:#fff;border:0">সংরক্ষণ</button></div>';
    ov.appendChild(box); document.body.appendChild(ov);
    var cleanup=function(){ try{ ov.remove(); }catch(e){} };
    var onNo=function(){ cleanup(); if(typeof onCancel==='function') onCancel(); };
    var onYes=function(){ cleanup(); if(typeof onConfirm==='function') onConfirm(); };
    ov.addEventListener('click',function(e){ if(e.target===ov) onNo(); });
    box.querySelector('#qxConfirmClose').onclick=onNo;
    box.querySelector('#qxConfirmNo').onclick=onNo;
    box.querySelector('#qxConfirmYes').onclick=onYes;
  }catch(e){ if(typeof onConfirm==='function') { if(confirm(message)) onConfirm(); } }
};
window.qxShowAlert = window.qxShowAlert || function(message, onOk){
  try{
    var ov=document.createElement('div'); ov.className='ac-ov'; ov.style.zIndex='140';
    var box=document.createElement('div'); box.className='ac-box';
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:16px">নোটিশ</b><button type="button" class="pp-close" id="qxAlertClose" style="position:static">×</button></div>'
      +'<div style="line-height:1.7;margin:8px 0">'+message+'</div>'
      +'<div class="ac-row" style="display:flex;gap:10px;margin-top:16px"><button type="button" class="ac-btn" id="qxAlertOk" style="flex:1;height:44px;border-radius:999px;background:var(--qx-main-color);color:#fff;border:0">ঠিক আছে</button></div>';
    ov.appendChild(box); document.body.appendChild(ov);
    var cleanup=function(){ try{ ov.remove(); }catch(e){} if(typeof onOk==='function') onOk(); };
    ov.addEventListener('click',function(e){ if(e.target===ov) cleanup(); });
    box.querySelector('#qxAlertClose').onclick=cleanup;
    box.querySelector('#qxAlertOk').onclick=cleanup;
  }catch(e){ alert(message); if(typeof onOk==='function') onOk(); }
};
window.qxShowPrompt = window.qxShowPrompt || function(message, defaultVal, onConfirm){
  try{
    var ov=document.createElement('div'); ov.className='ac-ov'; ov.style.zIndex='140';
    var box=document.createElement('div'); box.className='ac-box';
    var def=(defaultVal||'').replace(/"/g,'&quot;');
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:16px">ইনপুট দিন</b><button type="button" class="pp-close" id="qxPromptClose" style="position:static">×</button></div>'
      +'<div style="line-height:1.7;margin:8px 0">'+message+'</div>'
      +'<input type="text" id="qxPromptInput" value="'+def+'" style="width:100%;height:44px;padding:0 14px;border:1px solid var(--qx-border);border-radius:12px;background:var(--qx-card-bg);margin-top:8px" />'
      +'<div class="ac-row" style="display:flex;gap:10px;margin-top:16px"><button type="button" class="ac-btn ghost" id="qxPromptNo" style="flex:1;height:44px;border:1px solid var(--qx-border);border-radius:999px;background:var(--qx-card-bg)">বাতিল</button><button type="button" class="ac-btn" id="qxPromptYes" style="flex:1;height:44px;border-radius:999px;background:var(--qx-main-color);color:#fff;border:0">সংরক্ষণ</button></div>';
    ov.appendChild(box); document.body.appendChild(ov);
    var input=box.querySelector('#qxPromptInput');
    setTimeout(function(){ try{ input.focus(); input.select(); }catch(e){} },100);
    var cleanup=function(val){ try{ ov.remove(); }catch(e){} if(typeof onConfirm==='function') onConfirm(val); };
    ov.addEventListener('click',function(e){ if(e.target===ov) cleanup(null); });
    box.querySelector('#qxPromptClose').onclick=function(){ cleanup(null); };
    box.querySelector('#qxPromptNo').onclick=function(){ cleanup(null); };
    box.querySelector('#qxPromptYes').onclick=function(){ cleanup(input.value); };
    input.addEventListener('keydown',function(e){ if(e.key==='Enter'){ cleanup(input.value); } });
  }catch(e){ if(typeof onConfirm==='function') onConfirm(null); }
};


window.qxConfirmAsync = window.qxConfirmAsync || function(message){
  return new Promise(function(resolve){
    window.qxShowConfirm(message, function(){ resolve(true); }, function(){ resolve(false); });
  });
};
window.qxAlertAsync = window.qxAlertAsync || function(message){
  return new Promise(function(resolve){
    window.qxShowAlert(message, function(){ resolve(); });
  });
};
window.qxPromptAsync = window.qxPromptAsync || function(message, def){
  return new Promise(function(resolve){
    window.qxShowPrompt(message, def, function(val){ resolve(val); });
  });
};


/* ===== বিষয়ভিত্তিক আয়াত ===== */


/* QX_TOPICS (বিষয়ভিত্তিক ডেটা) এখন data/topics.js-এ আছে */
// S01-S99 বিষয়ভিত্তিক — Root based topics, source Quranic Arabic Corpus (corpus.quran.com)


/* ===== অডিও ===== */

/* ===== STEP 3: OFFLINE AUDIO (IndexedDB) ===== */
(function(){
  var DB='quranix-audio', STORE='audio';
  var openAudioDbs = new Set();
  function closeAudioDb(d){
    if(!d) return;
    openAudioDbs.delete(d);
    try{ d.close(); }catch(e){}
  }
  window.qxCloseOfflineAudioConnections = function(){
    openAudioDbs.forEach(function(d){ try{ d.close(); }catch(e){} });
    openAudioDbs.clear();
  };
  function db(){
    return new Promise(function(res,rej){
      var r=indexedDB.open(DB,1);
      r.onupgradeneeded=function(){ try{r.result.createObjectStore(STORE);}catch(e){} };
      r.onsuccess=function(){
        openAudioDbs.add(r.result);
        r.result.onversionchange=function(){ closeAudioDb(r.result); };
        res(r.result);
      };
      r.onerror=function(){rej(r.error)};
    });
  }
  function put(key, blob){
    return db().then(function(d){
      return new Promise(function(res,rej){
        var tx=d.transaction(STORE,'readwrite');
        tx.objectStore(STORE).put(blob,key);
        tx.oncomplete=function(){closeAudioDb(d);res()};
        tx.onerror=function(){var error=tx.error;closeAudioDb(d);rej(error)};
        tx.onabort=function(){var error=tx.error;closeAudioDb(d);rej(error)};
      });
    });
  }
  function get(key){
    return db().then(function(d){
      return new Promise(function(res,rej){
        var q=d.transaction(STORE).objectStore(STORE).get(key);
        q.onsuccess=function(){var value=q.result||null;closeAudioDb(d);res(value)};
        q.onerror=function(){var error=q.error;closeAudioDb(d);rej(error)};
      });
    });
  }
  function del(key){
    return db().then(function(d){
      return new Promise(function(res,rej){
        var tx=d.transaction(STORE,'readwrite');
        tx.objectStore(STORE).delete(key);
        tx.oncomplete=function(){closeAudioDb(d);res()};
        tx.onerror=function(){var error=tx.error;closeAudioDb(d);rej(error)};
        tx.onabort=function(){var error=tx.error;closeAudioDb(d);rej(error)};
      });
    });
  }
  function keys(){
    return db().then(function(d){
      return new Promise(function(res,rej){
        var q=d.transaction(STORE).objectStore(STORE).getAllKeys();
        q.onsuccess=function(){var value=q.result||[];closeAudioDb(d);res(value)};
        q.onerror=function(){var error=q.error;closeAudioDb(d);rej(error)};
      });
    });
  }
  function meta(){ try{ return JSON.parse(localStorage.getItem('quranix_dl_meta')||'{}'); }catch(e){ return {}; } }
  function saveMeta(m){ localStorage.setItem('quranix_dl_meta', JSON.stringify(m)); }
  function pad(n){ return String(n).padStart(3,'0'); }
  function urlFor(rec, s, a){ return 'https://everyayah.com/data/'+rec+'/'+pad(s)+pad(a)+'.mp3'; }
  function keyFor(rec,s,a){ return rec+'/'+pad(s)+pad(a); }
  function currentSurah(){
    var list=window._activeAyahList||[];
    if(list.length && list[0] && list[0].s) return {n:list[0].s.number, name:list[0].s.englishName, count:list.length, list:list};
    if(typeof reading!=='undefined' && reading && reading.t==='s'){ var s=(window.surahs||[]).find(function(x){return x.number===reading.n}); if(s) return {n:s.number,name:s.englishName,count:s.numberOfAyahs,list:null}; }
    return null;
  }
  // The player's current reciter is a let in the main script, so this part reads it from localStorage.
  function reciterNow(){ try{ var v=localStorage.getItem('reciter'); return v?JSON.parse(v):'Saood_ash-Shuraym_128kbps'; }catch(e){ return 'Saood_ash-Shuraym_128kbps'; } }
  // IIFE-র বাইরের প্লেয়ার কোড (playAyahAtIndex, qxPreloadNextAyah) এগুলো এখান দিয়ে ব্যবহার করে
  window.qxAudioDb = { get: get, keyFor: keyFor, urlFor: urlFor, reciterNow: reciterNow };
  function reciterName(id){ var f=(typeof RECITERS!=='undefined'?RECITERS:[]).find(function(r){return r[0]===id}); return f?f[1]:id; }

  var downloading=false;
  async function refreshDlBar(){
    const bar = document.getElementById('dlBar'); if(!bar) return;
    var cur=currentSurah();
    // show only inside a surah reader (nav hidden = reader open)
    const nav = document.getElementById('nav');
    var inReader = nav && nav.style.display==='none' && cur;
    bar.classList.toggle('show', !!inReader);
    if(!inReader) return;
    var rec=reciterNow(); var m=meta(); var k=cur.n+'|'+rec;
    var info=m[k];
    var fullPackage=packageMeta()['audio|'+rec];
    var hasFullPackage=!!(fullPackage && fullPackage.status==='complete');
    document.getElementById('dlTitle').textContent='{{download}} '+cur.name+' — তেলাওয়াত';
    const btn = document.getElementById('dlBtn');
    if(info || hasFullPackage){
      var savedCount=info?info.count:cur.count;
      document.getElementById('dlSub').innerHTML='<span class="offline-badge2">{{check_circle:f}} অফলাইন</span> '+savedCount+' আয়াত · '+reciterName(rec)+' · ডাটা ছাড়াই চলবে'+(hasFullPackage?' · সম্পূর্ণ কুরআন ডাউনলোড করা':'');
      btn.textContent=info?'{{delete}} মুছুন':'সম্পূর্ণ প্যাকেজ ডাউনলোডেড';
      btn.disabled=!info;
    } else { document.getElementById('dlSub').textContent=cur.count+' আয়াত · '+reciterName(rec)+' · একবার ডাউনলোড করলেই অফলাইনে চলবে'; btn.textContent='{{download}} ডাউনলোড'; btn.disabled=downloading; }
  }
  async function downloadCurrent(){
    if(downloading) return; var cur=currentSurah(); if(!cur) return;
    var rec=reciterNow(); var m=meta(); var k=cur.n+'|'+rec;
    const btn = document.getElementById('dlBtn');
    const sub = document.getElementById('dlSub');
    if(sub) sub.textContent = 'ডাউনলোড হচ্ছে... 0%';
    if(btn){
      btn.textContent = 'ডাউনলোড হচ্ছে... 0%';
      btn.disabled = true;
      if(typeof window.qxDownloadFix !== 'undefined'){
        var card = document.querySelector('.dl-card, #dlBar, .download-card');
        window.qxDownloadFix.showDownloading(card, 0);
      }
    }
    if(m[k]){ // delete - custom ac-ov dialog
      window.qxShowConfirm('এই সূরার ডাউনলোড মুছে ফেলবা?', async function(){
        var count=Number(cur.count||0);
        if(!count && window.surahs){var sm=window.surahs.find(function(x){return Number(x.number)===Number(cur.n);});count=sm?Number(sm.numberOfAyahs||0):0;}
        if(cur.list && cur.list.length){for (let i=0;i<cur.list.length;i++){try{await del(keyFor(rec,cur.list[i].s.number,cur.list[i].no));}catch(e){}}}
        else {for (let ai=1;ai<=count;ai++){try{await del(keyFor(rec,cur.n,ai));}catch(e){}}}
        delete m[k]; saveMeta(m); if(typeof showToast==='function') showToast('ডাউনলোড মুছে ফেলা হয়েছে'); refreshDlBar();
      });
      return;
    }
    if(!navigator.onLine){ if(typeof showToast==='function') showToast('ডাউনলোডের জন্য ইন্টারনেট লাগবে'); return; }
    downloading=true; refreshDlBar();
    try{
      var list=cur.list||[];
      // if list missing, build from surahs count (fetch ayahs via openSurah already loaded, so list should exist)
      var done=0, failed=0;
      for (let i=0;i<list.length;i++){
        var a=list[i]; var key=keyFor(rec,a.s.number,a.no);
        try{ var ex=await get(key); if(!ex){ var r=await fetch(urlFor(rec,a.s.number,a.no)); if(!r.ok) throw new Error('HTTP '+r.status); await put(key, await r.blob()); } done++; }
        catch(e){ failed++; }
        if(btn) btn.textContent='{{hourglass_top}} '+Math.round((i+1)/list.length*100)+'% ('+(window.toBn?toBn(i+1):i+1)+'/'+(window.toBn?toBn(list.length):list.length)+')';
        if((i%5)===4) await new Promise(function(r){setTimeout(r,30)});
      }
      var mm=meta();
      if(failed===0 && done===list.length){mm[k]={count:done, at:new Date().toISOString(), reciter:rec, name:cur.name};saveMeta(mm);}
      else {delete mm[k];saveMeta(mm);}
      if(typeof showToast==='function') showToast(failed?('ডাউনলোড অসম্পূর্ণ — '+done+'টি হয়েছে, '+failed+'টি হয়নি। আবার চেষ্টা করো।'):'{{check_circle:f}} ডাউনলোড শেষ! এখন অফলাইনে চলবে');
      if(sub) sub.textContent = failed ? ('অসম্পূর্ণ — '+done+'/'+list.length) : 'ডাউনলোড করা ✓';
      if(btn){ 
        if(!failed){ btn.innerHTML = '<span class="ms" aria-hidden="true" data-nosnippet>check_circle</span> ডাউনলোড করা'; btn.style.background = '#16a34a'; btn.style.color = '#fff'; btn.classList.add('done'); }
        else { btn.textContent = '{{download}} আবার চেষ্টা'; }
        btn.disabled = false; 
      }
      if(typeof window.qxDownloadFix !== 'undefined' && !failed){
        var card2 = document.querySelector('.dl-card, #dlBar, .download-card');
        window.qxDownloadFix.showDone(card2);
      }
    }catch(e){ 
      var isWeak = !navigator.onLine || /Network|Failed to fetch|TypeError|Abort/.test(String(e.message||e));
      if(typeof showToast==='function') showToast(isWeak ? 'কানেকশন দুর্বল, আবার চেষ্টা করুন' : 'ডাউনলোড হয়নি, আবার চেষ্টা করো');
      if(sub) sub.textContent = isWeak ? 'কানেকশন দুর্বল, আবার চেষ্টা করুন' : 'ডাউনলোড হয়নি';
      if(btn){ btn.textContent = isWeak ? 'আবার চেষ্টা করুন' : '{{download}} ডাউনলোড'; btn.disabled = false; }
    }
    downloading=false; refreshDlBar();
  }
  document.getElementById('dlBtn').onclick=downloadCurrent;
  document.getElementById('dlManageBtn').onclick=function(){ if(window.openGridPopup) window.openGridPopup('downloads'); };
  var dlBarTmr = null;
  function startDlBarTimer(){ if(dlBarTmr) return; dlBarTmr = setInterval(refreshDlBar, 800); }
  function stopDlBarTimer(){ if(dlBarTmr){ clearInterval(dlBarTmr); dlBarTmr=null; } }
  startDlBarTimer();
  document.addEventListener('click', function(){ setTimeout(refreshDlBar, 400); });
  document.addEventListener('visibilitychange', function(){ if(document.hidden){ stopDlBarTimer(); }else{ refreshDlBar(); startDlBarTimer(); } });
  window.addEventListener('pagehide', function(){ stopDlBarTimer(); });
  window.qxDlBarTimer = { start: startDlBarTimer, stop: stopDlBarTimer };

  // --- Playback: use the IndexedDB Blob directly when it is available offline ---
  var origPlay = window.playAyahAtIndex;
  var offlineAudioObjectUrl = null;
  window.playAyahAtIndex = async function(idx){
    try{
      // currentPlaylist and audioObj are top-level lexical bindings, not window properties.
      var list = (typeof currentPlaylist !== 'undefined' && currentPlaylist.length)
        ? currentPlaylist
        : (window._activeAyahList || []);
      var item = list[idx];
      if(item){
        var rec = reciterNow();
        var blob = await get(keyFor(rec, item.s.number, item.no));
        if(blob){
          if(offlineAudioObjectUrl) URL.revokeObjectURL(offlineAudioObjectUrl);
          offlineAudioObjectUrl = URL.createObjectURL(blob);
          currentPlayIdx = idx;
          audioObj.src = offlineAudioObjectUrl;
          audioObj.playbackRate = 1;
          audioTitle.textContent = item.s.englishName + ' · আয়াত ' + toBn(item.no);
          audioReciterLabel.textContent = reciterName(rec) + ' · অফলাইন';
          qxAudioBarShow();
          highlightPlayingCard(item.s.number, item.no);
          await audioObj.play();
          audioPlayPause.textContent = '{{pause}}';
  try{ qxPreloadNextAyah(); }catch(e){}
          return;
        }
      }
    }catch(e){
      // If the offline blob is missing or cannot be played, use the normal online player.
    }
    if(offlineAudioObjectUrl){ URL.revokeObjectURL(offlineAudioObjectUrl); offlineAudioObjectUrl=null; }
    return origPlay(idx);
  };
  try{ playAyahAtIndex = window.playAyahAtIndex; }catch(e){}

  var packageJob = null;
  var CONTENT_DB = 'quranix-content';
  var CONTENT_STORE = 'chapters';
  var openContentDbs = new Set();
  function closeContentDb(d){
    if(!d) return;
    openContentDbs.delete(d);
    try{ d.close(); }catch(e){}
  }
  window.qxCloseOfflineContentConnections = function(){
    openContentDbs.forEach(function(d){ try{ d.close(); }catch(e){} });
    openContentDbs.clear();
  };
  window.qxCancelActivePackageJob = function(){
    if(!packageJob || packageJob.finished) return;
    packageJob.cancelled = true;
    if(packageJob.controller){ try{ packageJob.controller.abort(); }catch(e){} }
  };
  function contentDb(){
    return new Promise(function(resolve,reject){
      var req=indexedDB.open(CONTENT_DB,1);
      req.onupgradeneeded=function(){ if(!req.result.objectStoreNames.contains(CONTENT_STORE)) req.result.createObjectStore(CONTENT_STORE); };
      req.onsuccess=function(){
        openContentDbs.add(req.result);
        req.result.onversionchange=function(){ closeContentDb(req.result); };
        resolve(req.result);
      };
      req.onerror=function(){ reject(req.error); };
    });
  }
  async function contentPut(key,value){
    var d=await contentDb();
    return new Promise(function(resolve,reject){
      var tx=d.transaction(CONTENT_STORE,'readwrite');
      tx.objectStore(CONTENT_STORE).put(value,key);
      tx.oncomplete=function(){closeContentDb(d);resolve();};
      tx.onerror=function(){var error=tx.error;closeContentDb(d);reject(error);};
      tx.onabort=function(){var error=tx.error;closeContentDb(d);reject(error);};
    });
  }
  async function contentGet(key){
    var d=await contentDb();
    return new Promise(function(resolve,reject){
      var q=d.transaction(CONTENT_STORE).objectStore(CONTENT_STORE).get(key);
      q.onsuccess=function(){var value=q.result||null;closeContentDb(d);resolve(value);};
      q.onerror=function(){var error=q.error;closeContentDb(d);reject(error);};
    });
  }
  async function contentDel(key){
    var d=await contentDb();
    return new Promise(function(resolve,reject){
      var tx=d.transaction(CONTENT_STORE,'readwrite');
      tx.objectStore(CONTENT_STORE).delete(key);
      tx.oncomplete=function(){closeContentDb(d);resolve();};
      tx.onerror=function(){var error=tx.error;closeContentDb(d);reject(error);};
      tx.onabort=function(){var error=tx.error;closeContentDb(d);reject(error);};
    });
  }
  function packageMeta(){ try{return JSON.parse(localStorage.getItem('quranix_content_packages')||'{}');}catch(e){return {};} }
  function savePackageMeta(m){ localStorage.setItem('quranix_content_packages',JSON.stringify(m)); }
  function editionLabel(){
    const sel = document.getElementById('transSel');
    if(!sel) return currentEdition;
    var opt=sel.options[sel.selectedIndex]; return opt ? opt.textContent.trim() : currentEdition;
  }
  function tafsirLabel(id){ var item=(typeof TAFSIRS!=='undefined'?TAFSIRS:[]).find(function(x){return Number(x[0])===Number(id);}); return item?item[1]:'তাফসির '+id; }
  function packageKey(type,id){ return type+'|'+String(id); }
  // Hadith corpus source: KafelaNetwork's public six-collection JSON repository.
  // Keep source attribution visible; this community dataset is not an official publisher API.
  var HADITH_CORPUS=[
    {id:'Bukhari',name:'সহিহ আল-বুখারি',chapters:97,meta:'bukhari.json',folder:'Bukhari'},
    {id:'Muslim',name:'সহিহ মুসলিম',chapters:56,meta:'muslim.json',folder:'Muslim'},
    {id:'AbuDaud',name:'সুনান আবু দাউদ',chapters:43,meta:'abudaud.json',folder:'AbuDaud'},
    {id:'At-tirmizi',name:'জামে আত-তিরমিজি',chapters:46,meta:'at-tirmizi.json',folder:'At-tirmizi'},
    {id:'Al-Nasai',name:'সুনান আন-নাসাঈ',chapters:50,meta:"nasa'i.json",folder:'Al-Nasai'},
    {id:'Ibne-Mazah',name:'সুনান ইবনে মাজাহ',chapters:37,meta:'ibnemajah.json',folder:'Ibne-Mazah'}
  ];
  /* TODO: 'main' বদলে GitHub রিপোর সর্বশেষ কমিট হ্যাশ বা ট্যাগ বসাও (পিন করলে রিপো বদলালেও অ্যাপ ভাঙবে না) */
var HADITH_CDN_REF='e7bdd85';
var HADITH_CDN='https://cdn.jsdelivr.net/gh/kafelanetwork/hadith-api@'+HADITH_CDN_REF+'/';
  function normalizeHadithRows(payload){
    var rows=Array.isArray(payload)?payload:(payload&&Array.isArray(payload.hadiths)?payload.hadiths:(payload&&Array.isArray(payload.data)?payload.data:(payload&&Array.isArray(payload.items)?payload.items:(payload&&Array.isArray(payload.hadith)?payload.hadith:null))));
    if(!rows && payload && payload.hadith) rows=[payload];
    if(!rows && payload && typeof payload==='object'){
      rows=Object.keys(payload).map(function(k){return payload[k];}).filter(function(v){return v&&typeof v==='object'&&(v.hadith||v.hadith_id||v.id);});
    }
    if(!Array.isArray(rows)) return [];
    return rows.map(function(item){var h=item&&item.hadith?item.hadith:item;return h&&typeof h==='object'?h:null;}).filter(function(h){
      var bn=h&&(h.bn||h.text||h.translation), ar=h&&(h.ar||h.arabic);
      return h && (h.hadith_id!==undefined || h.id!==undefined) && String(bn||'').trim() && String(ar||'').trim();
    });
  }
  function hadithChapterUrl(collection,chapter){return HADITH_CDN+collection.folder+'/Chapter/'+chapter+'.json';}
  function hadithChapterKey(collectionId,chapter){return 'hadith|'+collectionId+'|'+chapter;}
  function hadithMetaKey(collectionId){return 'hadith-meta|'+collectionId;}
  function hadithMetaIndex(collection,chapter){return collection.id==='Ibne-Mazah'?String(chapter-1):String(chapter);}
  function hadithRangeCount(range){
    if(!range)return 0;
    var normalized=String(range).replace(/[০-৯]/g,function(d){return '০১২৩৪৫৬৭৮৯'.indexOf(d);}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);});
    var nums=normalized.match(/\d+/g);
    return nums&&nums.length>=2?Math.max(0,Number(nums[1])-Number(nums[0])+1):0;
  }
  function allSurahList(){
    if(window.surahs && window.surahs.length) return Promise.resolve(window.surahs);
    return loadSurahList();
  }
  function jobPauseWait(job){
    return new Promise(function(resolve,reject){
      function check(){ if(job.cancelled){reject(new Error('cancelled'));return;} if(!job.paused){resolve();return;} setTimeout(check,250); }
      check();
    });
  }
  function updatePackageProgress(job){
    const pct = job.total ? Math.min(100,Math.round(job.done/job.total*100)) : 0;
    const p = document.getElementById('qxPackageProgress');
    const t = document.getElementById('qxPackageStatus');
    const label = document.getElementById('qxPackagePct');
    const bar = document.getElementById('qxPackageProgressBar');
    const action = document.getElementById('qxPackageAction');
    if(p) p.value=pct;
    if(label) label.textContent=pct+'%';
    if(bar) bar.style.width=pct+'%';
    if(t) t.textContent=job.finished && pct===100 ? 'ডাউনলোড করা ✓' : (job.message+' · '+job.done+'/'+job.total);
    if(action) action.textContent=job.paused?'আবার চালু':'বিরতি';
  }
  async function loadSurahAyahsForEdition(edition, surahNo){
    if(LOCAL && edition === 'bn.bengali'){
      var localMeta = LOCAL.meta[surahNo-1];
      if(!localMeta || !LOCAL.ar[surahNo-1] || !LOCAL.bn[surahNo-1]) throw new Error('স্থানীয় অনুবাদ পাওয়া যায়নি: সূরা '+surahNo);
      return LOCAL.ar[surahNo-1].map(function(ar,i){
        return {no:i+1,ar:ar,bn:LOCAL.bn[surahNo-1][i]||''};
      });
    }
    if(edition === 'bn.zakaria'){
      var zakaria = await getZakariaSurahTranslation(surahNo);
      if(LOCAL && LOCAL.meta[surahNo-1]){
        return LOCAL.ar[surahNo-1].map(function(ar,i){return {no:i+1,ar:ar,bn:zakaria[i]||''};});
      }
      var arabicData = await getJSON('/surah/'+surahNo+'/quran-uthmani');
      return arabicData.ayahs.map(function(a,i){return {no:a.numberInSurah,ar:a.text,bn:zakaria[i]||''};});
    }
    var data = await getJSON('/surah/'+surahNo+'/editions/quran-uthmani,'+edition);
    if(!Array.isArray(data) || !data[0] || !data[1] || !Array.isArray(data[0].ayahs) || !Array.isArray(data[1].ayahs)){
      throw new Error('অনুবাদের ডেটা অসম্পূর্ণ: সূরা '+surahNo);
    }
    return data[0].ayahs.map(function(a,i){return {no:a.numberInSurah,ar:a.text,bn:data[1].ayahs[i]?data[1].ayahs[i].text:''};});
  }

  async function runPackage(type,id,label){
    // Immediate feedback - Task 47
    var _immediateStatus = document.getElementById('qxPackageStatus');
    var _immediatePct = document.getElementById('qxPackagePct');
    if(_immediateStatus){ _immediateStatus.textContent = 'ডাউনলোড হচ্ছে... 0%'; }
    if(_immediatePct){ _immediatePct.textContent = '0%'; }
    var _dlBar = document.getElementById('qxPackageProgressBar');
    if(_dlBar){ _dlBar.style.width = '0%'; }
    if(typeof window.qxDownloadFix !== 'undefined'){
      var card = document.querySelector('.dl-card, .download-card, #qxPackageStatus');
      window.qxDownloadFix.showDownloading(card ? card.closest('.dl-item') : null, 0);
    }

    if(packageJob && !packageJob.finished){ showToast('আগের ডাউনলোডটি আগে শেষ বা বাতিল করো'); return; }
    if(!navigator.onLine){ 
      showToast('কানেকশন দুর্বল, আবার চেষ্টা করুন'); 
      if(_immediateStatus) _immediateStatus.textContent = 'কানেকশন দুর্বল, আবার চেষ্টা করুন';
      return; 
    }
    if(type==='audio'){ var _ok = await window.qxConfirmAsync('সম্পূর্ণ কুরআনের ৬,২৩৬টি অডিও ফাইল ডাউনলোড হবে। এতে অনেক স্টোরেজ ও ডেটা লাগতে পারে। চালিয়ে যাবে?'); if(!_ok) return; }
    if(navigator.storage && navigator.storage.estimate){
      try{
        var estimate=await navigator.storage.estimate();
        if(estimate.quota && estimate.usage/estimate.quota>.95){ showToast('ডিভাইসের স্টোরেজ প্রায় পূর্ণ। আগে জায়গা খালি করো।'); return; }
      }catch(e){}
    }
    if(navigator.storage && navigator.storage.persist){
      try{ await navigator.storage.persist(); }catch(e){}
    }
    var surahList;
    try{ surahList=await allSurahList(); }catch(e){ showToast('সূরার তালিকা পাওয়া যায়নি: '+e.message); return; }
    if(!surahList || surahList.length!==114){ showToast('পূর্ণ ১১৪ সূরার তালিকা যাচাই করা যায়নি'); return; }
    var totalAyahs=surahList.reduce(function(sum,item){return sum+Number(item.numberOfAyahs||0);},0);
    if(totalAyahs!==6236){ showToast('আয়াতের মোট সংখ্যা যাচাইয়ে সমস্যা হয়েছে ('+totalAyahs+')'); return; }

    var job={type:type,id:String(id),label:label,done:0,bytes:0,total:type==='audio'?totalAyahs:(type==='hadith'?(HADITH_CORPUS.find(function(c){return c.id===String(id);})||{chapters:0}).chapters:114),paused:false,cancelled:false,finished:false,message:'প্রস্তুতি চলছে',controller:null};
    packageJob=job;
    renderDownloadsPopup().then(function(){updatePackageProgress(job);});
    var metaMap=packageMeta(), key=packageKey(type,id);
    var previous=metaMap[key]||{};
    metaMap[key]={type:type,id:String(id),label:label,status:'downloading',done:0,bytes:previous.bytes||0,total:job.total,updated:new Date().toISOString()};
    savePackageMeta(metaMap);
    try{
      if(type==='translation'){
        for (let sn=1;sn<=114;sn++){
          await jobPauseWait(job);
          var storeKey='translation|'+id+'|'+sn;
          var existing=await contentGet(storeKey);
          var expected=Number(surahList[sn-1].numberOfAyahs||0);
          var validChapter=Array.isArray(existing) && existing.length===expected && existing.every(function(a,i){return Number(a.no)===i+1 && String(a.ar||'').trim() && String(a.bn||'').trim();});
          if(!validChapter){
            var chapter=await loadSurahAyahsForEdition(String(id),sn);
            if(!chapter || chapter.length!==expected) throw new Error('অনুবাদের আয়াতসংখ্যা মেলেনি: সূরা '+sn);
            existing=chapter.map(function(a){return {no:Number(a.no),ar:String(a.ar||''),bn:String(a.bn||'')};});
            if(!existing.every(function(a,i){return a.no===i+1 && a.ar.trim() && a.bn.trim();})) throw new Error('অনুবাদের কিছু আয়াতের আরবি বা অনুবাদ খালি: সূরা '+sn);
            await contentPut(storeKey,existing);
          }
          job.done=sn;
          job.bytes+=new Blob([JSON.stringify(existing)]).size;
          job.message='অনুবাদ ডাউনলোড হচ্ছে'; updatePackageProgress(job);
          metaMap=packageMeta(); metaMap[key].done=job.done; metaMap[key].bytes=job.bytes; metaMap[key].updated=new Date().toISOString(); savePackageMeta(metaMap);
        }
      } else if(type==='tafsir'){
        var tafsirSlug=getTafsirSlug(id);
        if(!tafsirSlug) throw new Error('নির্বাচিত তাফসিরের ডেটাসেট পাওয়া যায়নি');
        for (let ts=1;ts<=114;ts++){
          await jobPauseWait(job);
          var tafKey='tafsir|'+id+'|'+ts;
          var tafData=await contentGet(tafKey);
          var tafExpected=Number(surahList[ts-1].numberOfAyahs||0);
          function validTafsirRows(rows){
            if(!Array.isArray(rows) || !rows.length) return false;
            var seen={};
            return rows.every(function(row){
              var n=Number(row&&row.verse_number);
              if(!row || !Number.isInteger(n) || n<1 || n>tafExpected || !String(row.text||'').trim() || seen[n]) return false;
              seen[n]=true; return true;
            });
          }
          if(!validTafsirRows(tafData)){
            job.controller=new AbortController();
            /* একই আয়াত নম্বরে একাধিক সারি থাকলে জোড়া লাগানো হয়, সূরার আয়াতসংখ্যার বাইরের নম্বর বাদ যায়।
               প্রথম উৎসে ব্যবহারযোগ্য ডেটা না পেলে দ্বিতীয় উৎস (main) চেষ্টা করা হয়। */
            var tafsirFromUrl=async function(base){
              var response=await fetch(base+tafsirSlug+'/'+ts+'.json',{signal:job.controller.signal});
              if(!response.ok) return {status:response.status,rows:[]};
              var payload=await response.json();
              if(!payload || !Array.isArray(payload.ayahs)) return {status:200,rows:[],badShape:true};
              var byNo={};
              payload.ayahs.forEach(function(row){
                var n=Number(row&&(row.ayah||row.verse_number)||0), t=String(row&&row.text||'').trim();
                if(!Number.isInteger(n) || n<1 || n>tafExpected || !t) return;
                if(!byNo[n]) byNo[n]=[];
                if(byNo[n].indexOf(t)<0) byNo[n].push(t);
              });
              var rows=Object.keys(byNo).map(Number).sort(function(x,y){return x-y;}).map(function(n){return {verse_number:n,verse_key:ts+':'+n,text:byNo[n].join('\n\n')};});
              return {status:200,rows:rows};
            };
            var tafResult=await tafsirFromUrl(TAFSIR_CDN);
            if(!tafResult.rows.length) tafResult=await tafsirFromUrl(TAFSIR_CDN_MAIN);
            if(!tafResult.rows.length){
              if(tafResult.status!==200) throw new Error('তাফসির API HTTP '+toBn(tafResult.status)+' (সূরা '+toBn(ts)+')');
              if(tafResult.badShape) throw new Error('তাফসিরের ডেটা কাঠামো সঠিক নয়: সূরা '+toBn(ts));
              throw new Error('সূরা '+toBn(ts)+'-এর তাফসির ডেটা উৎসে পাওয়া যায়নি');
            }
            tafData=tafResult.rows;
            await contentPut(tafKey,tafData);
          }
          job.done=ts; job.bytes+=new Blob([JSON.stringify(tafData)]).size; job.message='তাফসির ডাউনলোড হচ্ছে'; updatePackageProgress(job);
          metaMap=packageMeta(); metaMap[key].done=job.done; metaMap[key].bytes=job.bytes; metaMap[key].updated=new Date().toISOString(); savePackageMeta(metaMap);
        }
      } else if(type==='audio'){
        var rec=String(id);
        for (let si=0;si<surahList.length;si++){
          var surah=surahList[si];
          for (let ai=1;ai<=Number(surah.numberOfAyahs);ai++){
            await jobPauseWait(job);
            var audioKey=keyFor(rec,surah.number,ai);
            var blob=await get(audioKey);
            if(!blob){
              job.controller=new AbortController();
              var audioResponse=await fetch(urlFor(rec,surah.number,ai),{signal:job.controller.signal});
              if(!audioResponse.ok) throw new Error('অডিও ফাইল পাওয়া যায়নি: '+surah.number+':'+ai+' (HTTP '+audioResponse.status+')');
              blob=await audioResponse.blob();
              if(!blob || !blob.size) throw new Error('খালি অডিও ফাইল: '+surah.number+':'+ai);
              await put(audioKey,blob);
            }
            job.done++; job.bytes+=blob.size||0; job.message='অডিও ডাউনলোড হচ্ছে';
            if(job.done%5===0 || job.done===job.total) updatePackageProgress(job);
            if(job.done%20===0){ metaMap=packageMeta(); metaMap[key].done=job.done; metaMap[key].bytes=job.bytes; metaMap[key].updated=new Date().toISOString(); savePackageMeta(metaMap); }
          }
        }
      } else if(type==='hadith'){
        var collection=HADITH_CORPUS.find(function(c){return c.id===String(id);});
        if(!collection) throw new Error('হাদিসের সংগ্রহটি চেনা যায়নি');
        job.total=collection.chapters;
        var sourceMetaUrl=HADITH_CDN+collection.folder+'/Meta/'+collection.meta;
        var metaResponse=await fetch(sourceMetaUrl);
        if(!metaResponse.ok) throw new Error('হাদিসের অধ্যায়-তথ্য পাওয়া যায়নি (HTTP '+metaResponse.status+')');
        var chapterMeta=await metaResponse.json();
        if(!chapterMeta || typeof chapterMeta!=='object') throw new Error('অধ্যায়-তথ্য অসম্পূর্ণ; প্যাকেজ সম্পূর্ণ করা হয়নি');
        for (let hm=1;hm<=collection.chapters;hm++){
          var metaEntry=chapterMeta[hadithMetaIndex(collection,hm)];
          if(!metaEntry || !String(metaEntry.title||'').trim() || !String(metaEntry.hadis_range||'').trim()) throw new Error('অধ্যায়-তথ্যে ঘাটতি: '+collection.name+' · অধ্যায় '+hm);
        }
        await contentPut(hadithMetaKey(collection.id),chapterMeta);
        for (let hc=1;hc<=collection.chapters;hc++){
          await jobPauseWait(job);
          var hKey=hadithChapterKey(collection.id,hc), cached=await contentGet(hKey);
          var chapterInfo=chapterMeta[hadithMetaIndex(collection,hc)];
          var expectedHadiths=hadithRangeCount(chapterInfo.hadis_range);
          var cachedValid=Array.isArray(cached) && cached.length>0 && cached.every(function(h){return h && (h.hadith_id!==undefined || h.id!==undefined) && String(h.bn||h.text||h.translation||'').trim() && String(h.ar||h.arabic||'').trim();}) && (!expectedHadiths || cached.length===expectedHadiths);
          if(!cachedValid){
            job.controller=new AbortController();
            var hResponse=await fetch(hadithChapterUrl(collection,hc),{signal:job.controller.signal});
            if(!hResponse.ok) throw new Error(collection.name+' · অধ্যায় '+hc+' (HTTP '+hResponse.status+')');
            var hPayload=await hResponse.json();
            cached=normalizeHadithRows(hPayload);
            if(!cached.length) throw new Error(collection.name+' · অধ্যায় '+hc+'-এ আরবি ও বাংলা উভয় পাঠসহ ব্যবহারযোগ্য হাদিস পাওয়া যায়নি');
            if(expectedHadiths && cached.length!==expectedHadiths) throw new Error(collection.name+' · অধ্যায় '+hc+'-এ হাদিসসংখ্যা মেলেনি (পাওয়া '+cached.length+', প্রত্যাশিত '+expectedHadiths+')');
            await contentPut(hKey,cached);
          }
          job.done=hc; job.bytes+=new Blob([JSON.stringify(cached)]).size;
          job.message=collection.name+' ডাউনলোড হচ্ছে'; updatePackageProgress(job);
          metaMap=packageMeta(); metaMap[key].done=job.done; metaMap[key].bytes=job.bytes; metaMap[key].updated=new Date().toISOString(); savePackageMeta(metaMap);
        }
      } else {
        throw new Error('অজানা প্যাকেজের ধরন');
      }
      if(job.cancelled) throw new Error('cancelled');
      job.finished=true; job.message='ডাউনলোড করা ✓'; job.done=job.total; updatePackageProgress(job);
      // Green tick UI
      try{
        var doneBar = document.getElementById('qxPackageProgressBar');
        if(doneBar){ doneBar.style.background = '#16a34a'; doneBar.style.width = '100%'; }
        var doneStatus = document.getElementById('qxPackageStatus');
        if(doneStatus){ doneStatus.textContent = 'ডাউনলোড করা ✓'; doneStatus.style.color = '#16a34a'; }
      }catch(e){}
      metaMap=packageMeta(); metaMap[key]={type:type,id:String(id),label:label,status:'complete',done:job.total,bytes:job.bytes,total:job.total,updated:new Date().toISOString()}; savePackageMeta(metaMap);
      showToast(label+' সম্পূর্ণ ডাউনলোড হয়েছে');
    }catch(error){
      job.finished=true;
      var cancelled=job.cancelled || error.name==='AbortError' || error.message==='cancelled';
      var isWeak = !navigator.onLine || /Network|Failed to fetch|TypeError|fetch|HTTP/.test(String(error.message||error)) || error.message.indexOf('HTTP')>=0;
      var weakMsg = 'কানেকশন দুর্বল, আবার চেষ্টা করুন';
      job.message=cancelled?'ডাউনলোড বাতিল':(isWeak?weakMsg:'ডাউনলোডে সমস্যা: '+error.message);
      updatePackageProgress(job);
      var failedStatus=document.getElementById('qxPackageStatus');
      if(failedStatus && isWeak) failedStatus.textContent=weakMsg;
      metaMap=packageMeta();
      if(metaMap[key]){metaMap[key].status=cancelled?'paused':'incomplete';metaMap[key].done=job.done;metaMap[key].bytes=job.bytes;metaMap[key].updated=new Date().toISOString();savePackageMeta(metaMap);}
      showToast(cancelled?'ডাউনলোড থামানো হয়েছে':(isWeak?weakMsg:'ডাউনলোড সম্পূর্ণ হয়নি: '+error.message));
      // Keep resume info - don't delete, so next try resumes from where it stopped
      console.log('[QX] Download paused at '+job.done+'/'+job.total+' for resume');
    }
    packageJob=null;
    renderDownloadsPopup();
  }

  async function deletePackage(type,id){
    var key=packageKey(type,id), m=packageMeta();
    if(!m[key]) return;
    var _ok = await window.qxConfirmAsync('“'+(m[key].label||'প্যাকেজ')+'” ডাউনলোড মুছে ফেলবে?'); if(!_ok) return;
    if(type==='translation' || type==='tafsir'){
      for (let n=1;n<=114;n++) await contentDel((type==='translation'?'translation':'tafsir')+'|'+id+'|'+n);
    } else if(type==='hadith'){
      var hc=HADITH_CORPUS.find(function(c){return c.id===String(id);});
      if(hc){for (let hn=1;hn<=hc.chapters;hn++) await contentDel(hadithChapterKey(hc.id,hn));await contentDel(hadithMetaKey(hc.id));}
    } else if(type==='audio'){
      var list=await allSurahList();
      var audioMeta=meta();
      // Keep any audio files that are also part of a separately downloaded single-surah package.
      for (let si=0;si<list.length;si++){
        var singleKey=list[si].number+'|'+id;
        if(audioMeta[singleKey]) continue;
        for (let ai=1;ai<=Number(list[si].numberOfAyahs);ai++) await del(keyFor(String(id),list[si].number,ai));
      }
    }
    delete m[key]; savePackageMeta(m); showToast('প্যাকেজ মুছে ফেলা হয়েছে'); renderDownloadsPopup(); refreshDlBar();
  }
  async function getPackageStorage(){
    try{ if(navigator.storage&&navigator.storage.estimate){var e=await Promise.race([navigator.storage.estimate(), new Promise(function(resolve,reject){ setTimeout(reject,1500); })]);return {usage:e.usage||0,quota:e.quota||0};} }catch(e){}
    return {usage:0,quota:0};
  }
  function formatBytes(bytes){ if(!bytes) return '—'; var units=['B','KB','MB','GB']; var i=0; while(bytes>=1024&&i<3){bytes/=1024;i++;} return bytes.toFixed(i?1:0)+' '+units[i]; }
  // Task 09: hide download-list entries without deleting downloaded data.
  function qxHiddenDownloads(){
    try{ var v=JSON.parse(localStorage.getItem('qx_hidden_downloads')||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; }
  }
  function qxSetHiddenDownloads(list){
    try{ localStorage.setItem('qx_hidden_downloads',JSON.stringify(list)); }catch(e){}
  }
  function qxHideDownloadRow(key){
    var hidden=qxHiddenDownloads(); if(hidden.indexOf(key)<0) hidden.push(key); qxSetHiddenDownloads(hidden);
    var old=document.getElementById('qxDownloadUndoToast'); if(old) old.remove();
    var toast=document.createElement('div'); toast.id='qxDownloadUndoToast'; toast.className='toast qx-download-undo-toast';
    toast.appendChild(document.createTextNode('ডাউনলোড আইটেম লুকানো হয়েছে'));
    var undo=document.createElement('button'); undo.type='button'; undo.textContent='Undo'; undo.setAttribute('aria-label','লুকানো আইটেম ফিরিয়ে আনুন');
    undo.onclick=function(){ qxSetHiddenDownloads(qxHiddenDownloads().filter(function(x){return x!==key;})); toast.remove(); renderDownloadsPopup('open'); };
    toast.appendChild(undo); document.body.appendChild(toast);
    setTimeout(function(){ if(toast.isConnected) toast.remove(); },3000);
    renderDownloadsPopup('open');
  }
  async function renderDownloadsPopup(opener){
    try{
      await renderDownloadsPopupInner(opener);
    }catch(err){
      console.error('Downloads popup error:', err);
      const box = document.getElementById('gridPopupBox'), overlay=document.getElementById('gridPopupOverlay');
      if(box && overlay && overlay.classList.contains('open')){
        box.innerHTML='<div class="pp-header"><h3>{{download}} ডাউনলোড</h3><button type="button" class="pp-close" aria-label="বন্ধ করুন">{{close}}</button></div><div class="pp-mini" style="text-align:center;padding:20px 12px">ডাউনলোড তালিকা লোড হয়নি।<br><small>'+String(err && err.message || err)+'</small></div>';
      }
    }
  }
  async function renderDownloadsPopupInner(opener){
    const box = document.getElementById('gridPopupBox'), overlay=document.getElementById('gridPopupOverlay');
    if(!box||!overlay) return;
    if(opener!=='open' && !(overlay.classList.contains('open') && box.querySelector('#qxDlMarker'))){
      var pm=packageMeta(), cnt=Object.keys(pm).filter(function(k){return ['complete','incomplete','paused'].includes(pm[k].status);}).length;
      const gm = document.getElementById('gDlMini'); if(gm) gm.textContent=cnt+' প্যাকেজ {{chevron_right}}';
      return;
    }
    overlay.classList.add('open');
    if(!box.querySelector('#qxDlMarker')){
      box.innerHTML='<div class="pp-header"><h3>{{download}} ডাউনলোড</h3><button type="button" class="pp-close" aria-label="বন্ধ করুন">{{close}}</button></div><div class="pp-mini" style="text-align:center;padding:20px 12px">লোড হচ্ছে...</div>';
    }
    var selectedEdition=(typeof currentEdition!=='undefined'?currentEdition:'bn.bengali');
    var selectedTafsir=(typeof tafsirId!=='undefined'?tafsirId:381);
    var selectedReciter=reciterNow();
    var packages=packageMeta();
    var hiddenDownloads=qxHiddenDownloads();
    Object.keys(packages).forEach(function(k){
      if(packages[k].status==='downloading' && (!packageJob || packageJob.finished)) packages[k].status='incomplete';
    });
    savePackageMeta(packages);
    var html='<div class="pp-header"><h3>{{download}} ডাউনলোড</h3><button type="button" class="pp-close" aria-label="বন্ধ করুন" onclick="document.getElementById(\'gridPopupOverlay\').classList.remove(\'open\')">{{close}}</button></div>'+ 
      '<span id="qxDlMarker" hidden></span>'
      +'<div style="margin:8px 0 6px"><input id="qxDlSearch" class="pp-input" placeholder="অনুবাদ, তাফসির, কারি, হাদিস বা সূরা খুঁজুন..." autocomplete="off" style="margin-bottom:0"></div>'
      +'<div id="qxDlSearchInfo" class="pp-mini" style="display:none;margin-bottom:8px"></div>';
    var isDone=function(k){return packages[k]&&packages[k].status==='complete';};
    var card=function(btnId,title,note,btnText){return '<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms" data-nosnippet>{{folder_open}}</span><b>'+title+'</b></div><small style="display:block;margin:4px 0 8px">'+note+'</small><button class="pp-btn" id="'+btnId+'">{{download}} '+btnText+'</button></div>';};
    if(!isDone(packageKey('translation','bn.zakaria'))) html+=card('qxDownloadTranslation','অনুবাদ · ড. আবু বকর মুহাম্মাদ যাকারিয়া','সম্পূর্ণ ১১৪ সূরার বাংলা অনুবাদ','সম্পূর্ণ অনুবাদ ডাউনলোড');
    if(!isDone(packageKey('translation','en.pickthall'))) html+=card('qxDownloadEnglishOffline','English · Marmaduke Pickthall','ইংরেজি অনুবাদ সম্পূর্ণ ১১৪ সূরা ডাউনলোড করে অফলাইনে পড়ুন','ইংরেজি অনুবাদ ডাউনলোড');
    var pendingTafsir=TAFSIRS.filter(function(t){return !isDone(packageKey('tafsir',t[0]));});
    if(pendingTafsir.length){
      html+='<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms" data-nosnippet>{{menu_book}}</span><b>তাফসির</b></div><small style="display:block;margin:4px 0 8px">সম্পূর্ণ কুরআনের তাফসির অফলাইনে সংরক্ষণ করুন</small><div class="dl-grid cols-2">';
      pendingTafsir.forEach(function(t){html+='<button class="pp-btn" data-tafsir-dl="'+t[0]+'">{{download}} '+t[1]+'</button>';});
      html+='</div></div>';
    }
    var pendingAudio=RECITERS.filter(function(r){return !isDone(packageKey('audio',r[0]));});
    if(pendingAudio.length){
      html+='<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms" data-nosnippet>{{volume_up}}</span><b>অডিও তিলাওয়াত</b></div><small style="display:block;margin:4px 0 8px">কারি অনুযায়ী সম্পূর্ণ কুরআন ডাউনলোড করুন</small><div class="dl-grid cols-2">';
      pendingAudio.forEach(function(r){html+='<button class="pp-btn" data-audio-dl="'+r[0]+'">{{download}} '+r[1]+'</button>';});
      html+='</div></div>';
    }
    var pendingHadith=HADITH_CORPUS.filter(function(c){return !isDone(packageKey('hadith',c.id));});
    if(pendingHadith.length){
      html+='<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms" style="display:grid;place-items:center;width:28px;height:28px;border-radius:var(--qx-radius);background:var(--qx-main-soft);color:var(--qx-main-color);font-size:var(--qx-fs-xl)" data-nosnippet>{{i_hadith}}</span><b>হাদিসের কিতাব</b></div><small style="display:block;margin:4px 0 8px">বাংলা ও আরবি ডেটা অধ্যায়ভিত্তিক সংরক্ষণ</small><div class="dl-grid cols-2">';
      pendingHadith.forEach(function(c){html+='<button class="pp-btn" data-hadith-dl="'+c.id+'"><span class="ms" style="font-size:var(--qx-fs-xl);margin-right:4px" data-nosnippet>{{download}}</span>'+c.name+'</button>';});
      html+='</div></div>';
    }
    var m=meta(), ks=Object.keys(m);
    var visibleSurahAudio=ks.filter(function(k){return hiddenDownloads.indexOf('surah-audio:'+k)<0;});
    var hasSurahAudio = visibleSurahAudio.length>0;
    if(visibleSurahAudio.length){
      html+='<h4 style="margin:16px 0 8px;display:flex;align-items:center;gap:8px"><span class="ms" style="display:grid;place-items:center;width:28px;height:28px;border-radius:var(--qx-radius);background:var(--qx-main-soft);color:var(--qx-main-color);font-size:var(--qx-fs-xl)" data-nosnippet>{{headphones}}</span> সূরা-ভিত্তিক অডিও ডাউনলোড</h4>';
      visibleSurahAudio.forEach(function(k){var info=m[k],parts=k.split('|'),sn=parseInt(parts[0],10); html+='<div class="dl-item"><div><b>'+(info.name||('সূরা '+sn))+'</b><br><small>'+getReciterName(info.reciter)+' · '+info.count+' আয়াত</small></div><div style="display:flex;gap:6px"><button class="dl-btn ghost" data-hide-dl="surah-audio:'+k+'" aria-label="তালিকা থেকে লুকান">×</button><button class="dl-btn ghost" data-del="'+k+'">{{delete}}</button></div></div>';});
    }
    if(packageJob && !packageJob.finished){
      html+='<div class="dl-item" style="display:block;background:color-mix(in srgb,var(--qx-main-color) 8%, var(--qx-card-bg));border-color:var(--qx-main-color)"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b id="qxPackageStatus">'+packageJob.message+'</b><small id="qxPackagePct" class="pp-mini">0%</small></div><div style="width:100%;height:10px;background:var(--qx-border);border-radius:var(--qx-radius-pill);overflow:hidden;margin:10px 0"><div id="qxPackageProgressBar" style="height:100%;width:0%;background:var(--qx-main-color);border-radius:var(--qx-radius-pill);transition:width .2s"></div></div><progress id="qxPackageProgress" max="100" value="0" style="width:100%;height:4px;opacity:0;position:absolute;pointer-events:none"></progress><div style="display:flex;gap:8px"><button class="dl-btn" id="qxPackageAction">বিরতি</button><button class="dl-btn ghost" id="qxPackageCancel">বাতিল</button></div></div>';
    }
    var storage=await getPackageStorage();
    (function(){
      var usage=storage.usage||0, quota=storage.quota||0, hasQuota=quota>0;
      var pct=hasQuota?Math.min(100, Math.round((usage/quota)*100)):0;
      var free=hasQuota?(quota-usage):0;
      var barColor = pct>85 ? '#dc2626' : pct>65 ? '#d97706' : 'var(--qx-main-color)';
      html+='<div class="dl-item" style="display:block;margin-top:12px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px"><b>{{folder_open}} স্টোরেজ স্ট্যাটাস</b><small>'+ (hasQuota?pct+'% ব্যবহৃত':'তথ্য নেই') +'</small></div>'
        + (hasQuota ? '<div style="width:100%;height:10px;background:var(--qx-border);border-radius:var(--qx-radius-pill);overflow:hidden;margin-bottom:6px"><div style="height:100%;width:'+pct+'%;background:'+barColor+';border-radius:var(--qx-radius-pill);transition:width .3s"></div></div>' : '')
        +'<div class="pp-mini" style="line-height:1.5">'
        +(hasQuota? 'ব্যবহৃত: <b>'+formatBytes(usage)+'</b> / মোট: <b>'+formatBytes(quota)+'</b> · খালি: <b>'+formatBytes(free)+'</b><br>':'ব্রাউজার স্টোরেজ তথ্য দেয়নি।<br>')
        +'<div style="margin-top:6px;font-size:11px"><i>*অডিও প্যাকেজের জন্য যথেষ্ট পরিমাণ জায়গা প্রয়োজন হতে পারে।*</i></div>'
        +'</div></div>';
    })();
    var entries=Object.keys(packages).filter(function(k){return ['complete','incomplete','paused'].includes(packages[k].status);});
    var visibleEntries=entries.filter(function(k){return hiddenDownloads.indexOf('package:'+k)<0;});
    var hasPackages = visibleEntries.length>0;
    if(visibleEntries.length){ html+='<h4 style="margin:16px 0 8px;display:flex;align-items:center;gap:8px"><span class="ms" style="display:grid;place-items:center;width:28px;height:28px;border-radius:var(--qx-radius);background:var(--qx-main-soft);color:var(--qx-main-color);font-size:var(--qx-fs-xl)" data-nosnippet>{{folder_open}}</span> ডাউনলোড করা প্যাকেজ</h4>';
    if(visibleEntries.length){
      visibleEntries.forEach(function(k){
        var item=packages[k];
        var state=item.status==='complete'?'সম্পূর্ণ':item.status==='paused'?'থামানো':'অসম্পূর্ণ';
        var total=Number(item.total||0), done=Number(item.done||0);
        var pct=total>0?Math.min(100, Math.round((done/total)*100)): (item.status==='complete'?100:0);
        var showProg=item.status!=='complete';
        html+='<div class="dl-item" data-search="'+String(item.label||'প্যাকেজ').toLowerCase()+' '+state+'" style="display:flex;flex-direction:column;align-items:stretch;gap:6px">'
          +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;width:100%"><div style="min-width:0;flex:1"><b>'+String(item.label||'প্যাকেজ')+'</b><br><small>'+state+' · '+done+'/'+total+' · '+formatBytes(item.bytes||0)+'</small></div>'
          +'<div style="display:flex;gap:6px;flex-shrink:0">'
          +(item.status==='complete'?'':'<button class="dl-btn" data-pkgretry="'+k+'">আবার চেষ্টা</button>')
          +'<button class="dl-btn ghost" data-hide-dl="package:'+k+'" aria-label="তালিকা থেকে লুকান">×</button>'+'<button class="dl-btn ghost" data-pkgdel="'+k+'">{{delete}} মুছুন</button></div></div>'
          +(showProg?'<div style="width:100%;height:8px;background:var(--qx-border);border-radius:var(--qx-radius-pill);overflow:hidden"><div style="height:100%;width:'+pct+'%;background:var(--qx-main-color);border-radius:var(--qx-radius-pill);transition:width .3s"></div></div><small class="pp-mini" style="text-align:right">'+pct+'% · '+done+'/'+total+'</small>':'')
          +'</div>';
      });
    } }

    if(!hasPackages && !hasSurahAudio){
      html+='<div class="pp-mini" style="text-align:center;padding:20px 12px;margin-top:12px;border:1px dashed var(--qx-border);border-radius:var(--qx-radius-lg)">এখনো কোনো প্যাকেজ বা সূরা-ভিত্তিক অডিও ডাউনলোড করা হয়নি।<br><small>উপরের তালিকা থেকে ডাউনলোড শুরু করো</small></div>';
    }
    html+='<div class="pp-mini" style="margin-top:16px;padding:10px;background:var(--qx-card-bg);border:1px solid var(--qx-border);border-radius:var(--qx-radius-lg);text-align:center;line-height:1.5;font-size:var(--qx-fs-xs)">আরবি ও অনুবাদ অফলাইনে আছে। ডিফল্ট তাফসির স্বয়ংক্রিয়ভাবে ডাউনলোড হয়। নিচের প্যাকেজগুলো অফলাইনের জন্য। মাঝপথে থামলে "আবার চেষ্টা" দিয়ে চালানো যাবে।</div>';
    box.innerHTML=html;
    (function(){
      var searchInput=box.querySelector('#qxDlSearch');
      var infoEl=box.querySelector('#qxDlSearchInfo');
      if(!searchInput) return;
      function doFilter(){
        var q=(searchInput.value||'').trim().toLowerCase();
        var visibleCount=0;
        box.querySelectorAll('.dl-item').forEach(function(item){
          var htmlInner=item.innerHTML||'';
          var isSpecial = htmlInner.indexOf('স্টোরেজ স্ট্যাটাস')>=0 || item.querySelector('#qxPackageStatus') || htmlInner.indexOf('অফলাইনে আছে। ডিফল্ট তাফসির')>=0;
          if(isSpecial){
            if(!q){ item.style.display=''; }
            else { item.style.display='none'; }
            return;
          }
          var txt=(item.textContent||'').toLowerCase() + ' ' + (item.getAttribute('data-search')||'');
          var match = !q || txt.indexOf(q)>=0;
          if(item.querySelector('.dl-grid') && q){
            var anyVisible=false;
            var btns=item.querySelectorAll('.dl-grid button');
            btns.forEach(function(b){
              var bt=(b.textContent||'').toLowerCase();
              var bm = !q || bt.indexOf(q)>=0;
              b.style.display = bm ? '' : 'none';
              if(bm) anyVisible=true;
            });
            match = anyVisible || txt.indexOf(q)>=0;
          } else if(!q){
            item.querySelectorAll('button').forEach(function(b){ b.style.display=''; });
          }
          item.style.display = match ? '' : 'none';
          if(match && item.style.display!=='none' && !isSpecial) visibleCount++;
        });
        if(q){
          infoEl.style.display='block';
          infoEl.textContent = visibleCount ? visibleCount+' টি ফলাফল পাওয়া গেছে "'+q+'" এর জন্য' : 'কোনো ফলাফল পাওয়া যায়নি "'+q+'" এর জন্য';
        } else {
          infoEl.style.display='none';
        }
      }
      searchInput.addEventListener('input', doFilter);
      try{ if(window.innerWidth>480) searchInput.focus(); }catch(e){}
    })();
    (function(){
      var prog=document.getElementById('qxPackageProgress');
      var pctEl=document.getElementById('qxPackagePct');
      var barEl=document.getElementById('qxPackageProgressBar');
      if(prog && pctEl){
        setInterval(function(){
          if(prog && pctEl){
            var v=prog.value||0;
            pctEl.textContent=v+'%';
            if(barEl) barEl.style.width=v+'%';
          }
        }, 300);
      }
    })();
    var bind=function(id,fn){var el=box.querySelector('#'+id);if(el)el.onclick=fn;};
    bind('qxDownloadTranslation',function(){runPackage('translation','bn.zakaria','অনুবাদ · ড. আবু বকর মুহাম্মাদ যাকারিয়া');});
    bind('qxDownloadEnglishOffline',function(){runPackage('translation','en.pickthall','English · Marmaduke Pickthall (Offline)');});
    box.querySelectorAll('[data-tafsir-dl]').forEach(function(b){b.onclick=function(){var tid=parseInt(b.dataset.tafsirDl,10);runPackage('tafsir',tid,'তাফসির · '+tafsirLabel(tid));};});
    box.querySelectorAll('[data-audio-dl]').forEach(function(b){b.onclick=function(){var rid=b.dataset.audioDl;runPackage('audio',rid,'অডিও · '+getReciterName(rid));};});
    box.querySelectorAll('[data-hadith-dl]').forEach(function(b){b.onclick=function(){var c=HADITH_CORPUS.find(function(x){return x.id===b.dataset.hadithDl;});if(c)runPackage('hadith',c.id,c.name);};});
    bind('qxPackageAction',function(){if(!packageJob)return;packageJob.paused=!packageJob.paused;updatePackageProgress(packageJob);});
    bind('qxPackageCancel',function(){if(!packageJob)return;packageJob.cancelled=true;if(packageJob.controller)packageJob.controller.abort();});
    box.querySelectorAll('[data-pkgretry]').forEach(function(b){b.onclick=function(){var bits=b.dataset.pkgretry.split('|'),type=bits.shift(),id=bits.join('|'),item=packages[b.dataset.pkgretry];runPackage(type,id,item.label||'প্যাকেজ');};});
    box.querySelectorAll('[data-pkgdel]').forEach(function(b){b.onclick=function(){var bits=b.dataset.pkgdel.split('|');deletePackage(bits[0],bits.slice(1).join('|'));};});
    box.querySelectorAll('[data-hide-dl]').forEach(function(b){b.onclick=function(e){e.preventDefault();e.stopPropagation();qxHideDownloadRow(b.dataset.hideDl);};});
    box.querySelectorAll('[data-del]').forEach(function(b){
      b.onclick=async function(e){
        e.preventDefault(); e.stopPropagation();
        var k=b.dataset.del;
        var curMeta=meta();
        var info=curMeta[k] || m[k];
        if(!info){
          var partsTmp=k.split('|');
          info={reciter:partsTmp[1]||'', count:0};
        }
        var parts=k.split('|'),sn=parseInt(parts[0],10);
        var rec=info.reciter || (parts[1]||'');
        var _ok = await window.qxConfirmAsync('এই সূরার অডিও ডাউনলোড মুছে ফেলবে?'); if(!_ok) return;
        b.disabled=true; b.textContent='মুছছি...';
        try{
          var total=Number(info.count||0)+2;
          for (let i=1;i<=total;i++){ try{ await del(keyFor(rec,sn,i)); }catch(err){} }
          var fresh=meta(); delete fresh[k]; saveMeta(fresh);
          if(typeof showToast==='function') showToast('সূরার অডিও মুছে ফেলা হয়েছে');
          await renderDownloadsPopup('open');
          if(typeof refreshDlBar==='function') refreshDlBar();
        }catch(err){
          if(typeof showToast==='function') showToast('মুছতে সমস্যা হয়েছে');
          b.disabled=false; b.textContent='{{delete}}';
        }
      };
    });
    const mini = document.getElementById('gDlMini'); if(mini) mini.textContent=entries.length+' প্যাকেজ {{chevron_right}}';
  }
  window.quranixHadithCollections=HADITH_CORPUS;
  window.quranixPackageStore={
    getHadithChapter:async function(id,chapter){return contentGet(hadithChapterKey(id,chapter));},
    getHadithMeta:async function(id){return contentGet(hadithMetaKey(id));},
    getTranslation:async function(edition,surah){return contentGet('translation|'+edition+'|'+surah);},
    getTafsir:async function(id,surah,ayah){var rows=await contentGet('tafsir|'+id+'|'+surah);if(!Array.isArray(rows))return null;var row=rows.find(function(x){return Number(x.verse_number)===Number(ayah)||x.verse_key===surah+':'+ayah;});return row?(row.text||'এই আয়াতের জন্য এই তাফসিরে আলাদা ব্যাখ্যা পাওয়া যায়নি।'):'এই আয়াতের জন্য এই তাফসিরে আলাদা ব্যাখ্যা পাওয়া যায়নি।';}
  };
  window.renderDownloadsPopup=renderDownloadsPopup;
  window.packageMeta=packageMeta;
  window.runPackage=runPackage;
  window.quranixOffline={ refresh:refreshDlBar, download:downloadCurrent };
  /* default package: the default tafsir (first in TAFSIRS) is installed automatically when online.
     A package the person cancelled (status 'paused') is not restarted by itself. */
  function autoInstallDefaults(){
    try{
      if(!navigator.onLine || packageJob) return;
      var defId=TAFSIRS[0][0], m=packageMeta(), k=packageKey('tafsir',defId);
      if(m[k] && (m[k].status==='complete' || m[k].status==='paused')) return;

      var consent = localStorage.getItem('quranix_auto_dl_consent');
      if(consent === 'no') return;
      var startDefault=function(){ if(!packageJob) runPackage('tafsir',defId,'তাফসির · '+tafsirLabel(defId)); };
      if(consent !== 'yes'){
        /* ব্রাউজারের confirm() এর বদলে অ্যাপের নিজস্ব ডায়ালগ */
        var ov=document.createElement('div'); ov.className='ac-ov'; ov.style.zIndex='140';
        var box=document.createElement('div'); box.className='ac-box';
        box.innerHTML='<div class="ac-head"><span>{{download}} তাফসির অফলাইনে রাখবেন?</span></div>'
          +'<div style="line-height:1.7;margin:8px 0">তাফসির ডাউনলোড করে রাখলে ইন্টারনেট ছাড়াই পড়া যাবে।<br>আনুমানিক সাইজ: ২–৫ এমবি। মোবাইল ডাটা ব্যবহার হতে পারে।</div>'
          +'<div class="ac-row"><button type="button" class="ac-btn ghost" id="qxAutoDlNo">এখন না</button><button type="button" class="ac-btn" id="qxAutoDlYes">ডাউনলোড করুন</button></div>';
        ov.appendChild(box); document.body.appendChild(ov);
        var answer=function(yes){
          try{ localStorage.setItem('quranix_auto_dl_consent', yes ? 'yes' : 'no'); }catch(storageError){}
          ov.remove(); if(yes) startDefault();
        };
        box.querySelector('#qxAutoDlNo').onclick=function(){ answer(false); };
        box.querySelector('#qxAutoDlYes').onclick=function(){ answer(true); };
        return;
      }
      startDefault();
    }catch(e){}
  }
  window.addEventListener('load',function(){ setTimeout(autoInstallDefaults,5000); });
})();


/* ===== ৯৯ নাম ===== */

var ASMA_DATA=[["الله", "আল্লাহ", "একমাত্র উপাস্য", "১:১", "সব নামের মূল। সূরা ফাতিহায় আল্লাহ নাম দিয়েই শুরু।"], ["الرَّحْمَنُ", "আর-রহমান", "পরম করুণাময়", "৫৫:১", "যাঁর দয়া সব সৃষ্টিকে ঘিরে আছে। সূরা আর-রহমানের শুরু।"], ["الرَّحِيمُ", "আর-রহিম", "অতি দয়ালু", "১:১", "মুমিনদের প্রতি বিশেষ দয়ালু। ফাতিহার প্রতিটি রাকাতে পড়ি।"], ["الْمَلِكُ", "আল-মালিক", "সার্বভৌম অধিপতি", "৫৯:২৩", "সব রাজত্বের মালিক একমাত্র তিনি।"], ["الْقُدُّوسُ", "আল-কুদ্দুস", "পরম পবিত্র", "৫৯:২৩", "সব দোষ-ত্রুটি থেকে পবিত্র।"], ["السَّلَامُ", "আস-সালাম", "শান্তির উৎস", "৫৯:২৩", "যাঁর থেকে সব শান্তি ও নিরাপত্তা আসে।"], ["الْمُؤْمِنُ", "আল-মুমিন", "নিরাপত্তাদানকারী", "৫৯:২৩", "বান্দাকে ভয় থেকে নিরাপত্তা দেন।"], ["الْمُهَيْمِنُ", "আল-মুহাইমিন", "সবকিছুর তত্ত্বাবধায়ক", "৫৯:২৩", "সবকিছু দেখেন, রক্ষা করেন, নিয়ন্ত্রণ করেন।"], ["الْعَزِيزُ", "আল-আজিজ", "পরাক্রমশালী", "৫৯:২৩", "যাঁকে কেউ পরাজিত করতে পারে না।"], ["الْجَبَّارُ", "আল-জাব্বার", "প্রতাপশালী", "৫৯:২৩", "অহংকারীদের দমনকারী, ভাঙা হৃদয় জোড়া লাগান।"], ["الْمُتَكَبِّرُ", "আল-মুতাকাব্বির", "মহিমান্বিত", "৫৯:২৩", "বড়ত্ব শুধু তাঁরই শোভা পায়।"], ["الْخَالِقُ", "আল-খালিক", "সৃষ্টিকর্তা", "৫৯:২৪", "সবকিছু শূন্য থেকে সৃষ্টি করেছেন।"], ["الْبَارِئُ", "আল-বারি", "নিখুঁত সৃষ্টিকারী", "৫৯:২৪", "কোনো নমুনা ছাড়াই সৃষ্টি করেন।"], ["الْمُصَوِّرُ", "আল-মুসাওয়ির", "আকৃতিদানকারী", "৫৯:২৪", "প্রত্যেককে আলাদা আকৃতি দিয়েছেন।"], ["الْغَفَّارُ", "আল-গাফফার", "বারবার ক্ষমাকারী", "৩৮:৬৬", "যতবারই ফিরে আসো, ক্ষমা করেন।"], ["الْقَهَّارُ", "আল-কাহহার", "সবার উপর বিজয়ী", "৩৮:৬৫", "সবকিছু তাঁর ক্ষমতার অধীন।"], ["الْوَهَّابُ", "আল-ওয়াহহাব", "অফুরন্ত দানকারী", "৩:৮", "চাওয়া ছাড়াও দান করেন, বিনিময় চান না।"], ["الرَّزَّاقُ", "আর-রজ্জাক", "রিজিকদাতা", "৫১:৫৮", "সবার রিজিক তাঁর হাতে।"], ["الْفَتَّاحُ", "আল-ফাত্তাহ", "বিজয় ও সমাধানদানকারী", "৩৪:২৬", "বন্ধ দরজা খুলে দেন, ফয়সালা করেন।"], ["الْعَلِيمُ", "আল-আলিম", "সর্বজ্ঞ", "২:২৯", "প্রকাশ্য-গোপন সব জানেন।"], ["الْقَابِضُ", "আল-কাবিদ", "সংকোচনকারী", "২:২৪৫", "রিজিক ও জীবন সংকুচিত করেন হিকমত অনুযায়ী।"], ["الْبَاسِطُ", "আল-বাসিত", "প্রসারিতকারী", "২:২৪৫", "রিজিক ও বরকত প্রশস্ত করেন।"], ["الْخَافِضُ", "আল-খাফিদ", "নতকারী", "৫৬:৩", "অহংকারীকে নত করেন।"], ["الرَّافِعُ", "আর-রাফি", "উন্নতকারী", "৫৮:১১", "বিনয়ীদের মর্যাদা বাড়িয়ে দেন।"], ["الْمُعِزُّ", "আল-মুইজ্জ", "সম্মানদানকারী", "৩:২৬", "যাকে চান সম্মান দেন।"], ["الْمُذِلُّ", "আল-মুযিল্ল", "অপমানকারী", "৩:২৬", "যাকে চান অপমান করেন — সবই ন্যায়।"], ["السَّمِيعُ", "আস-সামি", "সর্বশ্রোতা", "২:১২৭", "ফিসফিস দোয়াও শোনেন।"], ["الْبَصِيرُ", "আল-বাসির", "সর্বদ্রষ্টা", "২:১১০", "চোখের পলকও তাঁর অগোচর নয়।"], ["الْحَكَمُ", "আল-হাকাম", "ন্যায়বিচারক", "২২:৬৯", "কিয়ামতে চূড়ান্ত ফয়সালা করবেন।"], ["الْعَدْلُ", "আল-আদল", "পরম ন্যায়পরায়ণ", "৬:১১৫", "তাঁর বিচারে বিন্দুমাত্র জুলুম নেই।"], ["اللَّطِيفُ", "আল-লতিফ", "সূক্ষ্মদর্শী, কোমল", "২২:৬৩", "সূক্ষ্ম উপায়ে বান্দার উপকার করেন।"], ["الْخَبِيرُ", "আল-খাবির", "সব খবর রাখেন", "৬:১৮", "ভেতরের খবরও জানেন।"], ["الْحَلِيمُ", "আল-হালিম", "পরম সহনশীল", "২:২২৫", "পাপের পরও সাথে সাথে শাস্তি দেন না।"], ["الْعَظِيمُ", "আল-আজিম", "মহান", "২:২৫৫", "আয়াতুল কুরসিতে এই নাম এসেছে।"], ["الْغَفُورُ", "আল-গাফুর", "ক্ষমাশীল", "২:১৭৩", "তওবা করলেই ক্ষমা করেন।"], ["الشَّكُورُ", "আশ-শাকুর", "কৃতজ্ঞতা গ্রহণকারী", "৩৫:৩০", "ছোট আমলকেও বড় প্রতিদান দেন।"], ["الْعَلِيُّ", "আল-আলিয়্য", "সুমহান", "৪:৩৪", "সবার ঊর্ধ্বে, সবচেয়ে উঁচু।"], ["الْكَبِيرُ", "আল-কাবির", "সুমহান, বড়", "২২:৬২", "তাঁর চেয়ে বড় কেউ নেই।"], ["الْحَفِيظُ", "আল-হাফিজ", "রক্ষাকারী", "১১:৫৭", "বান্দাকে সব বিপদ থেকে রক্ষা করেন।"], ["الْمُقِيتُ", "আল-মুকিত", "সবার খাদ্য ও শক্তিদাতা", "৪:৮৫", "সবার প্রয়োজন মেটান।"], ["الْحَسِيبُ", "আল-হাসিব", "হিসাব গ্রহণকারী", "৪:৬", "প্রতিটি কাজের হিসাব নেবেন।"], ["الْجَلِيلُ", "আল-জালিল", "মহিমান্বিত", "৫৫:২৭", "মর্যাদা ও মহিমার অধিকারী।"], ["الْكَرِيمُ", "আল-কারিম", "পরম দয়ালু, সম্মানিত", "২৭:৪০", "দানেও সম্মানিত, ক্ষমায়ও।"], ["الرَّقِيبُ", "আর-রকিব", "পর্যবেক্ষণকারী", "৪:১", "সবসময় তোমাকে দেখছেন।"], ["الْمُجِيبُ", "আল-মুজিব", "দোয়া কবুলকারী", "১১:৬১", "ডাকলেই সাড়া দেন।"], ["الْوَاسِعُ", "আল-ওয়াসি", "সবকিছু পরিবেষ্টনকারী", "২:১১৫", "তাঁর দয়া ও জ্ঞান সীমাহীন।"], ["الْحَكِيمُ", "আল-হাকিম", "প্রজ্ঞাময়", "৩১:২৭", "প্রতিটি সিদ্ধান্তে হিকমত আছে।"], ["الْوَدُودُ", "আল-ওয়াদুদ", "অতি স্নেহময়", "১১:৯০", "বান্দাকে গভীরভাবে ভালোবাসেন।"], ["الْمَجِيدُ", "আল-মাজিদ", "মহা সম্মানিত", "১১:৭৩", "সম্মান ও মর্যাদায় পরিপূর্ণ।"], ["الْبَاعِثُ", "আল-বায়িস", "পুনরুত্থানকারী", "২২:৭", "মৃতদের আবার জীবিত করবেন।"], ["الشَّهِيدُ", "আশ-শাহিদ", "সাক্ষী", "৪:৭৯", "সবকিছুর সাক্ষী তিনি।"], ["الْحَقُّ", "আল-হাক্ক", "চিরন্তন সত্য", "২২:৬", "তিনিই একমাত্র সত্য।"], ["الْوَكِيلُ", "আল-ওয়াকিল", "কর্মবিধায়ক", "৩:১৭৩", "তাঁর উপর ভরসা করাই যথেষ্ট।"], ["الْقَوِيُّ", "আল-কাওয়িয়্য", "মহাশক্তিশালী", "১১:৬৬", "তাঁর শক্তির কোনো সীমা নেই।"], ["الْمَتِينُ", "আল-মাতিন", "সুদৃঢ়", "৫১:৫৮", "তাঁর শক্তি কখনো কমে না।"], ["الْوَلِيُّ", "আল-ওয়ালিয়্য", "অভিভাবক, বন্ধু", "২:২৫৭", "মুমিনদের অভিভাবক তিনি।"], ["الْحَمِيدُ", "আল-হামিদ", "প্রশংসিত", "১১:৭৩", "সব প্রশংসা তাঁরই।"], ["الْمُحْصِي", "আল-মুহসি", "সবকিছু গণনাকারী", "৭৮:২৯", "কিছুই তাঁর গণনার বাইরে নয়।"], ["الْمُبْدِئُ", "আল-মুবদি", "প্রথম সৃষ্টিকারী", "৩০:২৭", "সৃষ্টির শুরু তাঁর হাতে।"], ["الْمُعِيدُ", "আল-মুয়িদ", "পুনরায় সৃষ্টিকারী", "৩০:২৭", "আবার ফিরিয়ে আনবেন।"], ["الْمُحْيِي", "আল-মুহয়ি", "জীবনদানকারী", "৩০:৫০", "মৃত জমিনকেও জীবিত করেন।"], ["الْمُمِيتُ", "আল-মুমিত", "মৃত্যুদানকারী", "৩:১৫৬", "জীবন-মৃত্যু তাঁর হাতে।"], ["الْحَيُّ", "আল-হায়্য", "চিরঞ্জীব", "২:২৫৫", "আয়াতুল কুরসির নাম — কখনো মরেন না।"], ["الْقَيُّومُ", "আল-কাইয়্যুম", "সবকিছুর ধারক", "২:২৫৫", "সবকিছু তাঁর উপর নির্ভরশীল।"], ["الْوَاجِدُ", "আল-ওয়াজিদ", "সবকিছু পাওয়া যায় যাঁর কাছে", "৩৮:৩৭", "কোনো কিছুর অভাব নেই তাঁর।"], ["الْمَاجِدُ", "আল-মাজিদ", "মহা মর্যাদাবান", "৮৫:১৫", "আরশের মালিক, মর্যাদাবান।"], ["الْوَاحِدُ", "আল-ওয়াহিদ", "একক", "১৩:১৬", "তিনি এক, তাঁর কোনো শরিক নেই।"], ["الصَّمَدُ", "আস-সামাদ", "অমুখাপেক্ষী", "১১২:২", "সবাই তাঁর মুখাপেক্ষী, তিনি কারো নন।"], ["الْقَادِرُ", "আল-কাদির", "সর্বশক্তিমান", "৬:৬৫", "সবকিছু করতে সক্ষম।"], ["الْمُقْتَدِرُ", "আল-মুকতাদির", "পূর্ণ ক্ষমতাবান", "৫৪:৫৫", "তাঁর ক্ষমতা পরিপূর্ণ।"], ["الْمُقَدِّمُ", "আল-মুকাদ্দিম", "অগ্রবর্তীকারী", "১৬:৬১", "যাকে চান আগে আনেন।"], ["الْمُؤَخِّرُ", "আল-মুআখখির", "পশ্চাৎবর্তীকারী", "৭১:৪", "যাকে চান পিছিয়ে দেন।"], ["الْأَوَّلُ", "আল-আউয়াল", "প্রথম", "৫৭:৩", "সবকিছুর আগে ছিলেন।"], ["الْآخِرُ", "আল-আখির", "শেষ", "৫৭:৩", "সবকিছুর পরেও থাকবেন।"], ["الظَّاهِرُ", "আজ-জাহির", "প্রকাশ্য", "৫৭:৩", "নিদর্শনে প্রকাশ্য।"], ["الْبَاطِنُ", "আল-বাতিন", "গোপন", "৫৭:৩", "গোপন রহস্য জানেন।"], ["الْوَالِي", "আল-ওয়ালি", "পরিচালক", "১৩:১১", "সবকিছুর পরিচালনা করেন।"], ["الْمُتَعَالِي", "আল-মুতাআলি", "সবার ঊর্ধ্বে", "১৩:৯", "সব ত্রুটির ঊর্ধ্বে।"], ["الْبَرُّ", "আল-বার্র", "পরম কল্যাণকারী", "৫২:২৮", "বান্দার প্রতি দয়ায় ভরা।"], ["التَّوَّابُ", "আত-তাওয়াব", "তওবা কবুলকারী", "২:৩৭", "বারবার তওবা কবুল করেন।"], ["الْمُنْتَقِمُ", "আল-মুনতাকিম", "প্রতিশোধ গ্রহণকারী", "৩২:২২", "জালিমদের শাস্তি দেন।"], ["الْعَفُوُّ", "আল-আফুও", "ক্ষমাকারী, মুছে দেন", "৪:৯৯", "পাপ পুরো মুছে দেন।"], ["الرَّؤُوفُ", "আর-রাউফ", "পরম স্নেহশীল", "৯:১১৭", "বান্দার প্রতি দয়ায় ভরা।"], ["مَالِكُ الْمُلْكِ", "মালিকুল মুলক", "রাজত্বের মালিক", "৩:২৬", "রাজত্ব দেন, কেড়ে নেন।"], ["ذُو الْجَلَالِ وَالْإِكْرَامِ", "যুল-জালালি ওয়াল-ইকরাম", "মহিমা ও সম্মানের অধিকারী", "৫৫:২৭", "সূরা আর-রহমানে বারবার এসেছে।"], ["الْمُقْسِطُ", "আল-মুকসিত", "ন্যায় প্রতিষ্ঠাকারী", "৭:২৯", "সবাইকে ন্যায় দেন।"], ["الْجَامِعُ", "আল-জামি", "একত্রকারী", "৩:৯", "কিয়ামতে সবাইকে জমা করবেন।"], ["الْغَنِيُّ", "আল-গানিয়্য", "অমুখাপেক্ষী", "৩৫:১৫", "তাঁর কিছুই লাগে না।"], ["الْمُغْنِي", "আল-মুগনি", "অভাব দূরকারী", "৯৩:৮", "অভাবীকে ধনী করেন।"], ["الْمَانِعُ", "আল-মানি", "বাধাদানকারী", "৬৭:২১", "যা দিতে চান না, কেউ দিতে পারে না।"], ["الضَّارُّ", "আদ-দার্র", "ক্ষতির মালিক", "৬:১৭", "ক্ষতিও তাঁর হুকুমে হয়।"], ["النَّافِعُ", "আন-নাফি", "উপকারকারী", "৬:১৭", "উপকারও তাঁর হাতেই।"], ["النُّورُ", "আন-নূর", "আলো", "২৪:৩৫", "আসমান-জমিনের আলো। সূরা নূর।"], ["الْهَادِي", "আল-হাদি", "পথপ্রদর্শক", "২৫:৩১", "সঠিক পথ দেখান।"], ["الْبَدِيعُ", "আল-বাদি", "অতুলনীয় স্রষ্টা", "২:১১৭", "যেমন আগে কেউ বানায়নি।"], ["الْبَاقِي", "আল-বাকি", "চিরস্থায়ী", "৫৫:২৭", "সব ধ্বংস হবে, তিনি থাকবেন।"], ["الْوَارِثُ", "আল-ওয়ারিস", "উত্তরাধিকারী", "১৫:২৩", "সবকিছুর শেষ মালিক।"], ["الرَّشِيدُ", "আর-রশিদ", "সঠিক পথ দেখানেওয়ালা", "১১:৮৭", "ভুল পথে যেতে দেন না।"], ["الصَّبُورُ", "আস-সাবুর", "পরম ধৈর্যশীল", "২:১৫৩", "বান্দার ভুলেও সাথে সাথে ধরেন না।"]];
function asmaToday(){var d=new Date();return ASMA_DATA[(d.getDate()-1)%99];}
// [CARD: Asma of the Day] start
function buildAsmaCard(){var t=asmaToday();var idx=ASMA_DATA.indexOf(t);var box=document.createElement('div');box.className='khatam-card';box.innerHTML='<div class="khatam-row"><b>{{i_asma}} আজকের নাম</b><span>'+(typeof toBn==='function'?toBn(idx+1):idx+1)+' / ৯৯</span></div><div style="text-align:center"><div style="font-family:var(--qx-font-arabic);font-size:30px;color:var(--qx-main-color)">'+t[0]+'</div><b>'+t[1]+' — '+t[2]+'</b><div class="trk-mini">'+t[4]+'</div></div><div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">৯৯ নাম দেখো →</span><span>সূরা '+t[3]+'</span></div>';box.onclick=function(){if(typeof setMode==='function')setMode('asma');};return box;}
// [CARD: Asma of the Day] end
// [PAGE: Asma ul Husna] start
function renderAsma(){if(typeof showOther==='function')showOther('{{i_asma}} আসমাউল হুসনা');const appEl = document.getElementById('app');var favs={};try{favs=JSON.parse(localStorage.getItem('quranix_asma_fav')||'{}');}catch(e){}var counts={};try{counts=JSON.parse(localStorage.getItem('quranix_asma_count')||'{}');}catch(e){}var t=asmaToday();var top=document.createElement('div');top.className='asma-top';top.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><small>{{i_asma}} আজকের নাম · '+(ASMA_DATA.indexOf(t)+1)+' / ৯৯</small><span class="asma-arrow ms">chevron_right</span></div><div class="ar">'+t[0]+'</div><b>'+t[1]+' — '+t[2]+'</b><div><small>রেফারেন্স: সূরা '+t[3]+' · '+t[4]+'</small></div>';top.onclick=function(){openAsmaDetail(ASMA_DATA.indexOf(t));};appEl.appendChild(top);var info=document.createElement('div');info.className='trk-mini';info.style.textAlign='center';info.textContent='৯৯টি নাম মুখস্থ করো, প্রতিটা নামে ট্যাপ করে অর্থ + কুরআনের রেফারেন্স দেখো। {{star:f}} প্রিয় করো, {{i_tasbih}} জিকির করো।';appEl.appendChild(info);var search=document.createElement('input');search.className='asma-search';search.placeholder='নাম খুঁজুন... যেমন: রহমান, গাফুর, রজ্জাক';appEl.appendChild(search);var grid=document.createElement('div');grid.className='asma-grid';appEl.appendChild(grid);function draw(filter){grid.innerHTML='';ASMA_DATA.forEach(function(item,i){var txt=(item[1]+' '+item[2]+' '+item[0]).toLowerCase();if(filter&&txt.indexOf(filter.toLowerCase())<0)return;var c=document.createElement('div');c.className='asma-card'+(favs[i]?' fav':'');c.innerHTML='<div class="ar">'+item[0]+'</div><b>'+(typeof toBn==='function'?toBn(i+1):i+1)+'. '+item[1]+'</b><small>'+item[2]+'</small><div class="trk-mini">সূরা '+item[3]+(counts[i]?' · {{i_tasbih}} '+counts[i]+' বার':'')+'</div>';c.onclick=function(){openAsmaDetail(i);};grid.appendChild(c);});}search.oninput=function(){draw(search.value);};draw('');}
// [PAGE: Asma ul Husna] end
// [PAGE: Asma Detail] start
function openAsmaDetail(idx){var item=ASMA_DATA[idx];var favs={};try{favs=JSON.parse(localStorage.getItem('quranix_asma_fav')||'{}');}catch(e){}var counts={};try{counts=JSON.parse(localStorage.getItem('quranix_asma_count')||'{}');}catch(e){}var ov=document.createElement('div');ov.className='ac-ov';ov.style.zIndex='130';var box=document.createElement('div');box.className='ac-box';box.innerHTML='<div class="ac-head"><span>'+(typeof toBn==='function'?toBn(idx+1):idx+1)+' / ৯৯ — '+item[1]+'</span><button id="asmaX">{{close}}</button></div><div class="qx-asma-hero"><div class="qx-asma-bn"><b>'+item[1]+'</b><span>'+item[2]+'</span></div><div class="qx-asma-div" aria-hidden="true"></div><div class="qx-asma-ar" lang="ar" dir="rtl">'+item[0]+'</div></div><div class="trk-cat" style="margin:12px 0 0"><b>{{menu_book}} সংক্ষিপ্ত পরিচয়</b><div style="margin-top:6px;line-height:1.7">'+item[4]+'</div><div class="trk-mini" style="margin-top:8px">{{auto_stories}} কুরআন রেফারেন্স: <b>সূরা '+item[3]+'</b> — এই নামটি এই সূরায় এসেছে।</div></div><div class="ac-row"><button class="ac-btn ghost" id="asmaFav">'+(favs[idx]?'{{star:f}} প্রিয় থেকে সরাও':'{{star}} প্রিয় করো')+'</button><button class="ac-btn" id="asmaTasbih">{{i_tasbih}} জিকির +১ (<span id="asmaCnt">'+(counts[idx]||0)+'</span>)</button></div><div class="ac-row"><button class="ac-btn ghost" id="asmaPrev">{{arrow_back}} আগের নাম</button><button class="ac-btn ghost" id="asmaNext">পরের নাম {{arrow_forward}}</button></div><div class="ac-row"><button class="ac-btn" id="asmaShare">{{share}} এই নাম শেয়ার করো</button></div>';ov.appendChild(box);document.body.appendChild(ov);var close=function(){ov.remove();if(typeof mode!=='undefined'&&mode==='asma')renderAsma();};box.querySelector('#asmaX').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};box.querySelector('#asmaFav').onclick=function(){if(favs[idx])delete favs[idx];else favs[idx]=1;localStorage.setItem('quranix_asma_fav',JSON.stringify(favs));this.textContent=favs[idx]?'{{star:f}} প্রিয় থেকে সরাও':'{{star}} প্রিয় করো';};box.querySelector('#asmaTasbih').onclick=function(){counts[idx]=(counts[idx]||0)+1;localStorage.setItem('quranix_asma_count',JSON.stringify(counts));box.querySelector('#asmaCnt').textContent=counts[idx];if(typeof showToast==='function')showToast(item[1]+' — '+counts[idx]+' বার');};box.querySelector('#asmaPrev').onclick=function(){ov.remove();openAsmaDetail((idx+98)%99);};box.querySelector('#asmaNext').onclick=function(){ov.remove();openAsmaDetail((idx+1)%99);};box.querySelector('#asmaShare').onclick=async function(){var text=''+item[1]+' — '+item[2]+'\n'+item[4]+'\nরেফারেন্স: সূরা '+item[3]+'\n— Quranix · আসমাউল হুসনা';await shareTextOrCopy(text,item[1],'শেয়ার করা যায়নি, টেক্সট কপি করা হয়েছে!');};}
// [PAGE: Asma Detail] end
window.renderAsma=renderAsma;window.buildAsmaCard=buildAsmaCard;window.openAsmaDetail=openAsmaDetail;


/* ===== হাদিস ===== */

var HADITH_DATA={"nawawi": [["নিয়ত", "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", "সব আমল নিয়তের উপর নির্ভরশীল। যে যেজন্য হিজরত করবে, সে তা-ই পাবে।", "বুখারি ১, মুসলিম ১৯০৭"], ["ইসলাম, ঈমান, ইহসান", "فَإِنَّهُ جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ", "ইসলাম ৫ ভিত্তির উপর: কালিমা, নামাজ, যাকাত, রমজান, হজ। জিবরাইল (আ.) এসে ঈমান-ইসলাম-ইহসান শিখিয়েছিলেন।", "মুসলিম"], ["ইসলামের স্তম্ভ", "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ", "শাহাদাত, নামাজ কায়েম, যাকাত, রমজান, হজ — এই ৫টাই ইসলামের ভিত্তি।", "বুখারি ও মুসলিম"], ["গর্ভে সৃষ্টি", "إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ", "মানুষের সৃষ্টি মায়ের গর্ভে ৪০+৪০+৪০ দিনে হয়, তারপর রূহ ফুঁকা হয়, রিজিক-আয়ু-আমল লেখা হয়।", "বুখারি ও মুসলিম"], ["বিদআত", "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ", "দ্বীনে নতুন কিছু বানালে তা প্রত্যাখ্যাত।", "বুখারি ও মুসলিম"], ["হালাল-হারাম", "إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ", "হালাল স্পষ্ট, হারাম স্পষ্ট, মাঝে সন্দেহজনক জিনিস — সন্দেহ থেকে বাঁচো।", "বুখারি ও মুসলিম"], ["দ্বীনই নসিহত", "الدِّينُ النَّصِيحَةُ", "দ্বীন মানেই কল্যাণকামিতা — আল্লাহ, কিতাব, রাসূল, নেতা ও সাধারণ মানুষের জন্য।", "মুসলিম"], ["মুসলিমের রক্ত", "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ", "মানুষ কালিমা পড়ে নামাজ-যাকাত আদায় করলে তার জান-মাল নিরাপদ।", "বুখারি ও মুসলিম"], ["সন্দেহ ছাড়ো", "دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ", "যাতে সন্দেহ হয় তা ছেড়ে নিঃসন্দেহ জিনিসটা ধরো।", "তিরমিজি ২৫২০ (হাসান সহিহ), নাসায়ি"], ["পবিত্র রিজিক", "إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا", "আল্লাহ পবিত্র, পবিত্র ছাড়া কবুল করেন না। হারাম খেয়ে দোয়া কবুল হয় না।", "মুসলিম"], ["অপ্রয়োজনীয় ছাড়ো", "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ", "ভালো মুসলিমের লক্ষণ — যা তার কাজের না, তা ছেড়ে দেওয়া।", "তিরমিজি ২৩১৭ ও অন্যান্য (হাসান)"], ["নিজের জন্য যা চাও", "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", "নিজের জন্য যা পছন্দ করো, ভাইয়ের জন্যও তা পছন্দ না করলে পূর্ণ মুমিন না।", "বুখারি ১৩, মুসলিম ৪৫"], ["মুসলিমের সম্মান", "لَا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ", "মুসলিমের রক্ত-সম্মান হারাম — ৩ ক্ষেত্র ছাড়া।", "বুখারি ও মুসলিম"], ["মেহমানদারি", "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ", "যে আল্লাহ ও আখিরাতে ঈমান রাখে, সে মেহমানকে সম্মান করুক, ভালো কথা বলুক বা চুপ থাকুক।", "বুখারি ও মুসলিম"], ["রাগ কোরো না", "لَا تَغْضَبْ", "এক ব্যক্তি বারবার বললেন, উপদেশ দিন — রাসূল ﷺ বললেন: রাগ কোরো না।", "বুখারি"], ["ইহসান", "إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ", "আল্লাহ সবকিছুতে ইহসান লিখে দিয়েছেন — জবাইতেও দয়া করো।", "মুসলিম"], ["আল্লাহর ফরজ", "إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلَا تُضَيِّعُوهَا", "ফরজগুলো নষ্ট কোরো না, হারাম ছাড়ো, সীমা লঙ্ঘন কোরো না।", "দারাকুতনি (হাসান)"], ["তাকওয়া", "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", "যেখানেই থাকো আল্লাহকে ভয় করো, খারাপের পর ভালো করো, মানুষের সাথে ভালো আচরণ করো।", "তিরমিজি ১৯৮৭ (হাসান)"], ["লজ্জা", "إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلَامِ النُّبُوَّةِ", "লজ্জা না থাকলে যা ইচ্ছা করো — লজ্জা নবুয়তের কথা।", "বুখারি"], ["আল্লাহর সাহায্য", "احْفَظِ اللَّهَ يَحْفَظْكَ", "আল্লাহকে স্মরণ রাখো, তিনি তোমাকে রক্ষা করবেন। সুখে তাঁকে চিনো, দুঃখে তিনি তোমাকে চিনবেন।", "তিরমিজি ২৫১৬ (হাসান সহিহ) ও অন্য বর্ণনা"], ["দুনিয়া থেকে বেঁচে থাকা", "ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ", "দুনিয়ার প্রতি নির্লিপ্ত হও, আল্লাহ তোমাকে ভালোবাসবেন। মানুষের কাছে যা আছে তার প্রতি নির্লিপ্ত হও, মানুষ ভালোবাসবে।", "ইবনে মাজাহ ৪১০২ (হাসান)"], ["আল্লাহর নৈকট্য", "مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ", "আল্লাহর ওলির সাথে শত্রুতা মানে আল্লাহর সাথে যুদ্ধ। ফরজ দিয়ে বান্দা কাছে আসে, নফল দিয়ে ভালোবাসা পায়।", "বুখারি"], ["পবিত্রতা", "الطُّهُورُ شَطْرُ الْإِيمَانِ", "পবিত্রতা ঈমানের অর্ধেক। আলহামদুলিল্লাহ মিজান ভরে দেয়।", "মুসলিম"], ["নিষেধ থেকে বিরত", "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ", "যা নিষেধ করেছি তা ছাড়ো, যা আদেশ করেছি সাধ্যমতো করো।", "বুখারি ও মুসলিম"], ["সদকা", "كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ", "প্রতিদিন সূর্য ওঠার সাথে মানুষের প্রতিটি জোড়ার জন্য সদকা আছে — দুজনের মাঝে ন্যায়বিচার করা, বাহনে ওঠাতে সাহায্য করা, ভালো কথা বলা, নামাজের পথে প্রতিটি পদক্ষেপ এবং রাস্তা থেকে কষ্টদায়ক জিনিস সরানো — সবই সদকা।", "বুখারি ও মুসলিম"], ["ভাইয়ের সাহায্য", "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً", "যে মুমিনের কষ্ট দূর করে, আল্লাহ কিয়ামতে তার কষ্ট দূর করবেন।", "মুসলিম"], ["মুসলিম ভাই ভাই", "لَا تَحَاسَدُوا", "হিংসা কোরো না, বিদ্বেষ কোরো না, একে অপর থেকে মুখ ফিরিয়ে নিয়ো না — আল্লাহর বান্দা ভাই ভাই হয়ে যাও।", "মুসলিম"], ["জুলুম হারাম", "يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي", "হে আমার বান্দারা, আমি জুলুমকে নিজের উপর হারাম করেছি, তোমরাও জুলুম কোরো না।", "মুসলিম"], ["জান্নাতের পথ", "أَرَأَيْتَ إِذَا صَلَّيْتُ الْمَكْتُوبَاتِ", "ফরজ নামাজ, ফরজ রমজান, হালালকে হালাল-হারামকে হারাম মানলে জান্নাতে যাবে।", "মুসলিম"], ["সুন্নত আঁকড়ে ধরো", "عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيينَ، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الْأُمُورِ؛ فَإِنَّ كُلَّ بِدْعَةٍ ضَلَالَةٌ", "আমার সুন্নত ও খুলাফায়ে রাশেদিনের সুন্নত মাড়ির দাঁত দিয়ে আঁকড়ে ধরো। নতুন বানানো জিনিস থেকে বাঁচো — প্রতিটা বিদআতই ভ্রষ্টতা।", "আবু দাউদ ও তিরমিজি (তিরমিজি: হাসান সহিহ)"], ["দুনিয়া", "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ", "দুনিয়ায় এমন থাকো যেন অপরিচিত / পথিক।", "বুখারি"]], "qudsi": [["আমি যেমন ধারণা", "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي", "আমি আমার বান্দার ধারণা অনুযায়ী। সে আমাকে স্মরণ করলে আমি তার সাথে থাকি — সে মনে মনে স্মরণ করলে আমিও মনে মনে তাকে স্মরণ করি, সভায় স্মরণ করলে তার চেয়ে উত্তম সভায় তাকে স্মরণ করি। সে এক বিঘত কাছে এলে আমি এক হাত এগোই, সে এক হাত এলে আমি এক বাঁও এগোই; সে হেঁটে এলে আমি দৌড়ে যাই।", "বুখারি (এছাড়া মুসলিম, তিরমিজি, ইবনে মাজাহ)"], ["হে আমার বান্দারা", "يَا عِبَادِي: إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلَا تَظَالَمُوا", "আমি জুলুমকে নিজের উপর হারাম করেছি এবং তোমাদের মধ্যেও হারাম করেছি, তাই একে অপরের উপর জুলুম কোরো না। তোমরা দিনরাত গুনাহ করো, আমি সব গুনাহ ক্ষমা করি — তাই আমার কাছে ক্ষমা চাও, আমি ক্ষমা করব। এগুলো তোমাদেরই আমল, আমি গুনে রাখি, তারপর পূর্ণ প্রতিদান দিই; যে ভালো পায় সে আল্লাহর প্রশংসা করুক, আর যে অন্য কিছু পায় সে নিজেকেই দোষ দিক।", "মুসলিম (এছাড়া তিরমিজি, ইবনে মাজাহ)"], ["রমজান আমার জন্য", "يَقُولُ اللَّهُ عَزَّ وَجَلَّ: الصَّوْمُ لِي، وَأَنَا أَجْزِي بِهِ", "রমজান আমার জন্য, আমিই এর প্রতিদান দেব। সে আমার জন্য নিজের কামনা, খাবার ও পানীয় ত্যাগ করে। রমজান ঢালস্বরূপ। রমজানদারের দুটি আনন্দ — ইফতারের সময় আর রবের সাথে সাক্ষাতের সময়। রমজানদারের মুখের গন্ধ আল্লাহর কাছে মিশকের সুগন্ধির চেয়েও উত্তম।", "বুখারি (এছাড়া মুসলিম, মালিক, তিরমিজি, নাসায়ি, ইবনে মাজাহ)"], ["আমার ওলি", "مَنْ عَادَى لِي وَلِيًّا", "যে আমার ওলির সাথে শত্রুতা করে, আমি তার বিরুদ্ধে যুদ্ধ ঘোষণা করি।", "বুখারি"], ["ক্ষমা", "يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي", "হে আদম সন্তান, যতক্ষণ তুমি আমাকে ডাকবে ও আমার কাছে আশা করবে, তোমার অতীত গুনাহ যা-ই হোক আমি ক্ষমা করব, পরোয়া করব না। তোমার গুনাহ আকাশের মেঘ পর্যন্ত পৌঁছালেও ক্ষমা চাইলে ক্ষমা করব। পৃথিবীভরা গুনাহ নিয়েও যদি আমার সাথে কাউকে শরিক না করে আমার সাথে সাক্ষাৎ করো, আমি পৃথিবীভরা ক্ষমা নিয়ে তোমার কাছে আসব।", "তিরমিজি ৩৫৪০ (এছাড়া আহমাদ) — সনদ হাসান"], ["জান্নাতের নিয়ামত", "أَعْدَدْتُ لِعِبَادِيَ الصَّالِحِينَ", "আমি আমার নেক বান্দাদের জন্য এমন নিয়ামত তৈরি করেছি, যা কোনো চোখ দেখেনি, কান শোনেনি।", "বুখারি (এছাড়া মুসলিম, তিরমিজি, ইবনে মাজাহ)"], ["দান", "أَنْفِقْ يَا ابْنَ آدَمَ، أُنْفِقْ عَلَيْكَ", "হে আদম সন্তান, খরচ করো — আমি তোমার উপর খরচ করবো।", "বুখারি (এছাড়া মুসলিম)"], ["অসুস্থের সেবা", "يَا ابْنَ آدَمَ، مَرِضْتُ فَلَمْ تَعُدْنِي", "কিয়ামতের দিন আল্লাহ বলবেন: হে আদম সন্তান, আমি অসুস্থ হয়েছিলাম, তুমি আমাকে দেখতে আসোনি। সে বলবে: হে রব, আপনি তো সারা জাহানের রব, আমি কীভাবে আপনাকে দেখতে যাব? তিনি বলবেন: আমার অমুক বান্দা অসুস্থ ছিল, তুমি তাকে দেখতে যাওনি; তাকে দেখতে গেলে তুমি আমাকে তার কাছে পেতে। (একইভাবে খাবার ও পানীয় চাওয়ার কথাও আছে।)", "মুসলিম"], ["রহমত", "إِنَّ رَحْمَتِي تَغْلِبُ غَضَبِي", "আল্লাহ সৃষ্টি স্থির করার সময় নিজের কিতাবে নিজের উপর লিখে রেখেছেন: আমার রহমত আমার রাগের উপর প্রবল।", "মুসলিম (এছাড়া বুখারি, নাসায়ি, ইবনে মাজাহ)"], ["নিয়ত", "إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ، ثُمَّ بَيَّنَ ذَلِكَ", "আল্লাহ ভালো ও মন্দ লিখে রেখেছেন। কেউ ভালো কাজের ইচ্ছা করে তা না করলেও আল্লাহ তার জন্য একটি পূর্ণ নেকি লেখেন; ইচ্ছা করে করলে দশ থেকে সাতশো গুণ বা তারও বেশি লেখেন। খারাপ কাজের ইচ্ছা করে না করলে একটি পূর্ণ নেকি লেখেন; করলে একটি গুনাহ লেখেন।", "বুখারি ও মুসলিম"], ["শেষ রাত", "يَتَنَزَّلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى سَمَاءِ الدُّنْيَا، حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الْآخِرُ", "আমাদের রব প্রতি রাতের শেষ তৃতীয়াংশে দুনিয়ার আসমানে নেমে আসেন এবং বলেন: কে আমাকে ডাকবে, আমি সাড়া দেব? কে আমার কাছে চাইবে, আমি দেব? কে ক্ষমা চাইবে, আমি ক্ষমা করব?", "বুখারি (এছাড়া মুসলিম, মালিক, তিরমিজি, আবু দাউদ)"]], "short": [["কুরআন শেখা", "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", "তোমাদের মধ্যে উত্তম সে-ই, যে কুরআন শেখে ও শেখায়।", "বুখারি ৫০২৭"], ["পবিত্রতা", "الطُّهُورُ شَطْرُ الْإِيمَانِ", "পবিত্রতা ঈমানের অর্ধেক।", "মুসলিম ২২৩"], ["ভালো কথা", "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", "ভালো কথা সদকা।", "বুখারি ২৯৮৯"], ["হাসি", "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ", "ভাইয়ের মুখে হাসি সদকা।", "তিরমিজি ১৯৫৬"], ["রাস্তা", "إِمَاطَةُ الْأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ", "রাস্তা থেকে কষ্টদায়ক জিনিস সরানো সদকা।", "মুসলিম ১০০৯"], ["বাবা-মা", "رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ", "আল্লাহর সন্তুষ্টি বাবা-মায়ের সন্তুষ্টিতে।", "তিরমিজি ১৮৯৯"], ["প্রতিবেশী", "مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ", "জিবরাইল প্রতিবেশীর ব্যাপারে এত বলতেন, মনে হতো ওয়ারিশ বানিয়ে দেবেন।", "বুখারি ৬০১৪"], ["সত্য", "عَلَيْكُمْ بِالصِّدْقِ", "সত্য বলো — সত্য জান্নাতের পথ দেখায়।", "বুখারি ৬০৯৪"], ["ধৈর্য", "وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ", "যে ধৈর্য ধরতে চায়, আল্লাহ তাকে ধৈর্য দেন।", "বুখারি ১৪৬৯"], ["কৃতজ্ঞতা", "مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ", "যে মানুষের কৃতজ্ঞতা করে না, সে আল্লাহরও করে না।", "আবু দাউদ ৪৮১১"], ["লজ্জা", "الْحَيَاءُ مِنَ الْإِيمَانِ", "লজ্জা ঈমানের অংশ।", "বুখারি ২৪"], ["নম্রতা", "مَا كَانَ الرِّفْقُ فِي شَيْءٍ إِلَّا زَانَهُ", "নম্রতা যেখানেই থাকে, তাকে সুন্দর করে।", "মুসলিম ২৫৯৪"], ["ক্ষমা", "مَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا", "ক্ষমা করলে আল্লাহ বান্দার সম্মান বাড়িয়ে দেন।", "মুসলিম ২৫৮৮"], ["জ্ঞান", "طَلَبُ الْعِلْمِ فَرِيضَةٌ", "ইলম শেখা প্রত্যেক মুসলিমের উপর ফরজ।", "ইবনে মাজাহ ২২৪"], ["নিয়মিত আমল", "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا", "সবচেয়ে প্রিয় আমল — যা নিয়মিত, যদিও অল্প।", "বুখারি ৬৪৬৪"], ["দোয়া", "الدُّعَاءُ هُوَ الْعِبَادَةُ", "দোয়াই ইবাদত।", "তিরমিজি ৩৩৭২"], ["সালাম", "أَفْشُوا السَّلَامَ", "সালাম ছড়িয়ে দাও — ভালোবাসা বাড়বে।", "মুসলিম ৫৪"], ["খাবার", "يَا غُلَامُ سَمِّ اللَّهَ", "হে বালক, বিসমিল্লাহ বলো, ডান হাতে খাও, সামনে থেকে খাও।", "বুখারি ৫৩৭৬"], ["অপচয়", "مَا مَلَأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ", "মানুষ পেটের চেয়ে খারাপ কোনো পাত্র ভরে না।", "তিরমিজি ২৩৮০"], ["মিথ্যা", "إِنَّ الْكَذِبَ يَهْدِي إِلَى الْفُجُورِ", "মিথ্যা পাপের পথ দেখায়, পাপ জাহান্নামের পথ দেখায়।", "বুখারি ৬০৯৪"], ["আমানত", "لَا إِيمَانَ لِمَنْ لَا أَمَانَةَ لَهُ", "যার আমানতদারি নেই, তার ঈমান নেই।", "আহমাদ (সূত্র যাচাই প্রয়োজন)"], ["গীবত", "أَتَدْرُونَ مَا الْغِيبَةُ؟ ... ذِكْرُكَ أَخَاكَ بِمَا يَكْرَهُ", "রাসূল ﷺ জিজ্ঞেস করলেন, গীবত কী জানো? সাহাবিরা বললেন, আল্লাহ ও তাঁর রাসূলই ভালো জানেন। তিনি বললেন: তোমার ভাইয়ের অনুপস্থিতিতে এমন কথা বলা, যা সে অপছন্দ করে।", "মুসলিম ২৫৮৯"], ["রাগ", "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ", "আসল শক্তিশালী সে নয় যে কুস্তিতে জেতে — যে রাগের সময় নিজেকে সামলায়।", "বুখারি ৬১১৪"], ["মা", "فَالْزَمْهَا فَإِنَّ الْجَنَّةَ تَحْتَ رِجْلَيْهَا", "এক সাহাবি জিহাদে যেতে চাইলে রাসূল ﷺ জিজ্ঞেস করলেন, তোমার মা আছেন? তিনি বললেন, হ্যাঁ। রাসূল ﷺ বললেন: তাঁর সেবায় লেগে থাকো, কারণ জান্নাত তাঁর পায়ের কাছে।", "নাসায়ি ৩১০৪ (সনদ হাসান)"], ["সন্তান", "كُلُّكُمْ رَاعٍ", "তোমরা সবাই দায়িত্বশীল, প্রত্যেককে তার দায়িত্ব সম্পর্কে জিজ্ঞেস করা হবে।", "বুখারি ৮৯৩"]]};
(function(){try{if(localStorage.getItem('quranix_hadith_mem_v2'))return;var map={21:9,22:21,24:22,25:23,26:24,27:25,28:26,29:27,30:28,31:29,32:30,33:30,34:30,38:31};for(var q=1;q<=20;q++)map[q]=q;var mem=JSON.parse(localStorage.getItem('quranix_hadith_mem')||'{}');var out={};Object.keys(mem).forEach(function(k){var m=k.match(/^nawawi:(\d+)$/);if(!m){out[k]=mem[k];return;}var n=map[parseInt(m[1],10)+1];if(n)out['nawawi:'+(n-1)]=1;});localStorage.setItem('quranix_hadith_mem',JSON.stringify(out));localStorage.setItem('quranix_hadith_mem_v2','1');}catch(e){}})();
(function(){try{if(localStorage.getItem('quranix_hadith_mem_v3'))return;var map={1:1,2:2,3:3,4:1,5:4,6:5,7:2,8:1,9:6,10:7,13:8,14:2,15:9,16:10,18:2,19:4,20:11};var mem=JSON.parse(localStorage.getItem('quranix_hadith_mem')||'{}');var out={};Object.keys(mem).forEach(function(k){var m=k.match(/^qudsi:(\d+)$/);if(!m){out[k]=mem[k];return;}var n=map[parseInt(m[1],10)+1];if(n)out['qudsi:'+(n-1)]=1;});localStorage.setItem('quranix_hadith_mem',JSON.stringify(out));localStorage.setItem('quranix_hadith_mem_v3','1');}catch(e){}})();
function hadithAll(){var out=[];['nawawi','qudsi','short'].forEach(function(k){HADITH_DATA[k].forEach(function(h,i){out.push({pkg:k,idx:i,title:h[0],ar:h[1],bn:h[2],ref:h[3]});});});return out;}
function hadithToday(){var all=hadithAll();var d=new Date();return all[(d.getDate()-1)%all.length];}
// [CARD: Hadith of the Day] start
function buildHadithCard(){var h=hadithToday();var box=document.createElement('div');box.className='khatam-card';box.innerHTML='<div class="khatam-row"><b>{{i_hadith}} আজকের হাদিস</b><span>'+(h.pkg==='nawawi'?'৪০ হাদিস':h.pkg==='qudsi'?'হাদিসে কুদসি':'ছোট হাদিস')+'</span></div><div style="text-align:center"><div style="font-family:var(--qx-font-arabic);font-size:22px;color:var(--qx-main-color)">'+h.ar+'</div><b>'+h.title+'</b><div class="trk-mini">'+h.bn+'</div><div class="trk-mini">{{auto_stories}} '+h.ref+'</div></div><div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">হাদিস প্যাকেজ দেখো →</span><span>৩টি প্যাকেজ · '+(hadithAll().length)+'টি হাদিস</span></div>';box.onclick=function(){if(typeof setMode==='function')setMode('hadith');};return box;}
// [CARD: Hadith of the Day] end
/* ===== হাদিস বুকমার্ক (⭐ সংরক্ষণ থেকে আলাদা) =====
   বুকমার্ক = "এখানে থেমেছি, পরে ফিরব"। ⭐ সংরক্ষণ = প্রিয় হাদিসের সংগ্রহ। দুটো আলাদা স্টোরে থাকে।
   ৩ ধরনের বুকমার্ক: book (হাদিসের বই) · chapter (অধ্যায়) · hadith (একটা হাদিস)
   স্টোর: localStorage "quranix_hadith_bookmarks" = [ item, ... ] (নতুন আগে)
   item: {id, type, col, colName, chapter, chapterTitle, hid, title, ts}
   id:   book → "book|Bukhari" · chapter → "chapter|Bukhari|1" · hadith → "hadith|Bukhari|1" */
var HADITH_BM_KEY='quranix_hadith_bookmarks';
var HADITH_BM_TYPES={book:'হাদিসের বই',chapter:'অধ্যায়',hadith:'হাদিস'};
// শুধু উদাহরণ (সেভ হয় না): একই বইয়ের ৩ স্তর — বই → অধ্যায় → হাদিস
var HADITH_BM_EXAMPLE=[
  {type:'book',col:'Bukhari',colName:'সহিহ আল-বুখারি',title:'সহিহ আল-বুখারি'},
  {type:'chapter',col:'Bukhari',colName:'সহিহ আল-বুখারি',chapter:1,chapterTitle:'ওহীর সূচনা',title:'ওহীর সূচনা'},
  {type:'hadith',col:'Bukhari',colName:'সহিহ আল-বুখারি',chapter:1,chapterTitle:'ওহীর সূচনা',hid:1,title:'নিয়ত'}
];
function hadithBmId(type,col,chapter,hid){
  if(type==='book') return 'book|'+col;
  if(type==='chapter') return 'chapter|'+col+'|'+chapter;
  return 'hadith|'+col+'|'+hid;
}
function hadithBmLoad(){ try{ var a=JSON.parse(localStorage.getItem(HADITH_BM_KEY)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function hadithBmSave(a){ try{ localStorage.setItem(HADITH_BM_KEY,JSON.stringify(a)); }catch(e){} }
function hadithBmHas(id){ return hadithBmLoad().some(function(x){return x.id===id;}); }
// info = {type,col,colName,chapter,chapterTitle,hid,title} → true হলে বুকমার্ক যোগ হলো, false হলে সরলো
function hadithBmToggle(info){
  var id=hadithBmId(info.type,info.col,info.chapter,info.hid);
  var a=hadithBmLoad(), i=a.findIndex(function(x){return x.id===id;});
  if(i>=0) a.splice(i,1); else a.unshift(Object.assign({id:id,ts:Date.now()},info));
  hadithBmSave(a);
  return i<0;
}
function hadithBmList(type){ var a=hadithBmLoad(); return type?a.filter(function(x){return x.type===type;}):a; }

/* ===== হাদিস কার্ড: "পড়া হয়েছে" ট্র্যাকার (কী = কার্ডের key, যেমন hadith|কিতাব|নম্বর|অধ্যায়) ===== */
function hadithReadMap(){ try{ return JSON.parse(localStorage.getItem('quranix_hadith_read')||'{}')||{}; }catch(e){ return {}; } }
function hadithReadHas(key){ return !!hadithReadMap()[key]; }
function hadithReadToggle(key){
  var m=hadithReadMap();
  if(m[key]) delete m[key]; else m[key]=Date.now();
  try{ localStorage.setItem('quranix_hadith_read',JSON.stringify(m)); }catch(e){}
  return !!m[key];
}
// [CARD: Hadith/Ayah card] start
function buildHadithAyahCard(h){
  var ar=h.ar||h.arabic||'';
  var bn=h.bn||h.text||h.translation||'';
  var hid=h.hadith_id||h.id||'';
  var narrator=h.narrator||'';
  var grade=h.grade||'';
  var chapterTitle=h._qxChapterTitle||'';
  var colName=h._colName||'';
  var label='হাদিস '+(hid?toBn(hid):'');
  if(colName) label=colName+' • '+label;
  var key='hadith|'+(h._colId||'')+'|'+hid;
  var ex=(typeof QX_HADITH!=='undefined' && QX_HADITH[(h._colId||'')+'|'+hid]) || {};
  var d=document.createElement('div');
  d.className='ayah hadith-card';
  d.dataset.key=key;

  var no=document.createElement('div'); no.className='no';
  var b=document.createElement('b'); b.textContent=chapterTitle? chapterTitle+' • '+('হাদিস '+(hid?toBn(hid):'')) : ('হাদিস '+(hid?toBn(hid):''));
  no.appendChild(b);

  var actions=document.createElement('div'); actions.className='actions';
  var menuItems=[];
  function addMenu(rank,lblFn,fn){ menuItems.push([lblFn,fn,null,rank]); }

  var st=document.createElement('button'); st.type='button'; st.className='star';
  st.setAttribute('aria-label','বুকমার্ক');
  try{
    var has=typeof savedHas==='function' ? savedHas('hadith',key) : false;
    st.textContent=has?'{{star:f}}':'{{star}}';
  }catch(e){ st.textContent='{{star}}'; }
  st.onclick=function(e){
    e.stopPropagation();
    try{
      var on=savedToggle('hadith',key,{title:label,ar:ar,bn:bn,ref:[narrator,grade].filter(Boolean).join(' • ')});
      st.textContent=on?'{{star:f}}':'{{star}}';
      if(typeof showToast==='function') showToast(on?'সংরক্ষিত হয়েছে':'সংরক্ষণ সরানো হয়েছে');
    }catch(err){}
  };

  var shareFn=async function(){
    var txt=label+'\n'+ar+'\n\n'+bn+'\n'+[narrator,grade].filter(Boolean).join(' • ')+'\n— Quranix';
    if(typeof shareTextOrCopy==='function'){ await shareTextOrCopy(txt,label,'শেয়ার করা যায়নি, টেক্সট কপি করা হয়েছে!'); }
    else if(navigator.share){ try{ await navigator.share({title:label,text:txt}); }catch(e){} }
    else if(navigator.clipboard){ try{ await navigator.clipboard.writeText(txt); if(typeof showToast==='function') showToast('কপি করা হয়েছে'); }catch(e){} }
  };
  var copyFn=async function(){
    var refLine=[narrator,grade].filter(Boolean).join(' • ');
    var txt=ar+'\n\n'+bn+(refLine?'\n'+refLine:'');
    if(typeof copyText==='function'){ await copyText(txt,'কপি করা হয়েছে'); return; }
    try{ await navigator.clipboard.writeText(txt); if(typeof showToast==='function') showToast('কপি করা হয়েছে'); }catch(e){}
  };
  var imageFn=function(){
    if(window.openAyahCard){ window.openAyahCard(label,ar,bn); }
    else { shareFn(); }
  };

  addMenu(10,function(){return '{{share}} শেয়ার করুন';},shareFn);
  addMenu(20,function(){return '{{image}} ছবি বানাও';},imageFn);

  menuItems.sort(function(a,b){return (a[3]||50)-(b[3]||50);});

  var more=document.createElement('button'); more.type='button'; more.className='more-btn'; more.setAttribute('aria-haspopup','menu'); more.setAttribute('aria-expanded','false'); more.title='আরও'; more.textContent='{{more_horiz}}';
  var menu=document.createElement('div'); menu.className='ayah-menu'; menu.setAttribute('role','menu');
  var closeMenu=function(restore){ menu.classList.remove('open','open-up','align-left'); more.setAttribute('aria-expanded','false'); if(restore) more.focus(); };
  more.onclick=function(e){
    e.stopPropagation();
    var wasOpen=menu.classList.contains('open');
    document.querySelectorAll('.ayah-menu.open').forEach(function(m){ m.classList.remove('open','open-up','align-left'); var tr=m.parentElement&&m.parentElement.querySelector('.more-btn'); if(tr) tr.setAttribute('aria-expanded','false'); });
    if(wasOpen) return;
    menu.innerHTML='';
    menuItems.forEach(function(it){
      var itBtn=document.createElement('button'); itBtn.type='button'; itBtn.setAttribute('role','menuitem'); itBtn.textContent=it[0]();
      itBtn.onclick=function(ev){ ev.stopPropagation(); closeMenu(false); it[1](); };
      menu.appendChild(itBtn);
    });
    menu.classList.add('open'); more.setAttribute('aria-expanded','true');
    var rect=more.getBoundingClientRect();
    if(rect.right>window.innerWidth-12) menu.classList.add('align-left');
    if(rect.bottom+Math.min(menu.scrollHeight,320)>window.innerHeight-12 && rect.top>window.innerHeight/2) menu.classList.add('open-up');
    var first=menu.querySelector('button'); if(first) first.focus();
  };
  more.addEventListener('keydown',function(e){ if(e.key==='ArrowDown' && !menu.classList.contains('open')){ e.preventDefault(); more.click(); } });
  menu.addEventListener('keydown',function(e){
    var items=Array.from(menu.querySelectorAll('button[role=menuitem]')); var idx=items.indexOf(document.activeElement);
    if(e.key==='Escape'){ e.preventDefault(); closeMenu(true); }
    else if(e.key==='ArrowDown' || e.key==='ArrowUp'){ e.preventDefault(); if(items.length) items[(idx + (e.key==='ArrowDown'?1:items.length-1))%items.length].focus(); }
    else if(e.key==='Home' || e.key==='End'){ e.preventDefault(); if(items.length) items[e.key==='Home'?0:items.length-1].focus(); }
  });

  // NO play button here
  // কার্ডের অ্যাকশন: পড়া হয়েছে · সংরক্ষণ (⭐) · কপি · শেয়ার · আরও
  var rd=document.createElement('button'); rd.type='button'; rd.className='more-btn hadith-read'; rd.setAttribute('aria-label','পড়া হয়েছে'); rd.title='পড়া হয়েছে';
  var paintRead=function(){ var on=hadithReadHas(key); rd.textContent=on?'{{check_circle:f}}':'{{check_circle}}'; rd.setAttribute('aria-pressed',on?'true':'false'); d.classList.toggle('read',on); };
  rd.onclick=function(e){ e.stopPropagation(); var on=hadithReadToggle(key); paintRead(); if(typeof showToast==='function') showToast(on?'পড়া হয়েছে হিসেবে মার্ক করা হয়েছে':'মার্ক সরানো হয়েছে'); };
  paintRead();
  var cp=document.createElement('button'); cp.type='button'; cp.className='more-btn'; cp.setAttribute('aria-label','কপি'); cp.title='কপি'; cp.textContent='{{content_copy}}';
  cp.onclick=function(e){ e.stopPropagation(); copyFn(); };
  var bmInfo={type:'hadith',col:h._colId||'',colName:colName,chapter:h._qxChapterNo||'',chapterTitle:chapterTitle,hid:hid,title:label};
  var bmId=hadithBmId('hadith',bmInfo.col,bmInfo.chapter,hid);
  var bm=document.createElement('button'); bm.type='button'; bm.className='more-btn hadith-bm'; bm.setAttribute('aria-label','বুকমার্ক'); bm.title='বুকমার্ক';
  var paintBm=function(){ var on=hadithBmHas(bmId); bm.textContent=on?'{{bookmark:f}}':'{{bookmark}}'; bm.setAttribute('aria-pressed',on?'true':'false'); };
  bm.onclick=function(e){ e.stopPropagation(); var on=hadithBmToggle(bmInfo); paintBm(); if(typeof showToast==='function') showToast(on?'বুকমার্ক করা হয়েছে':'বুকমার্ক সরানো হয়েছে'); };
  paintBm();
  actions.appendChild(rd);
  actions.appendChild(st);
  actions.appendChild(bm);
  actions.appendChild(cp);
  actions.appendChild(more);
  actions.appendChild(menu);
  no.appendChild(actions);

  var arEl=document.createElement('div'); arEl.className='ar'; arEl.textContent=ar;
  var bnEl=document.createElement('div'); bnEl.className='bn'; bnEl.textContent=bn;
  var ref=document.createElement('div'); ref.className='ref'; ref.style.cssText='font-size:var(--qx-fs-xs);color:var(--qx-meta-color);margin-top:6px';
  ref.textContent=[narrator,grade,chapterTitle].filter(Boolean).join(' • ');

  d.appendChild(no);
  if(ex.title){ var ttl=document.createElement('div'); ttl.className='hadith-title'; ttl.style.cssText='font-weight:700;color:var(--qx-main-color);margin:6px 0'; ttl.textContent=ex.title; d.appendChild(ttl); }
  if(ar) d.appendChild(arEl);
  d.appendChild(bnEl);
  if(ref.textContent) d.appendChild(ref);
  if(ex.topics && ex.topics.length){ var tp=document.createElement('div'); tp.className='ref hadith-topics'; tp.style.cssText=ref.style.cssText; tp.textContent='বিষয়: '+ex.topics.join(', '); d.appendChild(tp); }

  return d;
}
// [CARD: Hadith/Ayah card] end

// [PAGE: Hadith Offline Collections list] start
function renderOfflineHadithCollections(appEl){
  var m={};try{m=JSON.parse(localStorage.getItem('quranix_content_packages')||'{}');}catch(e){}
  var keys=Object.keys(m).filter(function(k){return k.indexOf('hadith|')===0 && (m[k].status==='complete'||m[k].status==='incomplete'||m[k].status==='paused');});
  if(!keys.length)return;
  var wrap=document.createElement('div');wrap.className='hadith-pkg';
  wrap.innerHTML='<h3>অফলাইনে সংরক্ষিত হাদিসগ্রন্থ</h3><div class="sub">ডাউনলোড করা অধ্যায়গুলো ইন্টারনেট ছাড়াই পড়া যাবে</div>';
  keys.forEach(function(k){var item=m[k],id=k.split('|').slice(1).join('|'),c=(window.quranixHadithCollections||[]).find(function(x){return x.id===id;});if(!c)return;var b=document.createElement('button');b.className='dl-btn';b.style.margin='6px 6px 0 0';b.textContent=c.name+' · '+(item.status==='complete'?'সম্পূর্ণ':item.status==='paused'?'থামানো':'অসম্পূর্ণ');b.onclick=function(){openOfflineHadithCollection(c);};wrap.appendChild(b);});
  appEl.appendChild(wrap);
}
// [PAGE: Hadith Offline Collections list] end
// [PAGE: Hadith Offline Collection Detail] start
async function openOfflineHadithCollection(collection){
  if(typeof showOther==='function') showOther(collection.name);
  var appEl=document.getElementById('app'); appEl.innerHTML='';
  var back=document.createElement('button'); back.className='dl-btn ghost'; back.textContent='← হাদিস প্যাকেজ'; back.onclick=function(){ renderHadith(); }; appEl.appendChild(back);
  var search=document.createElement('input'); search.className='asma-search'; search.placeholder='হাদিস খুঁজুন...'; appEl.appendChild(search);
  var list=document.createElement('div'); appEl.appendChild(list);
  var rows=[];
  try{
    var hadithMeta=await window.quranixPackageStore.getHadithMeta(collection.id)||{};
    for(var i=1;i<=collection.chapters;i++){
      var chapter=await window.quranixPackageStore.getHadithChapter(collection.id,i);
      var chapterInfo=hadithMeta[collection.id==='Ibne-Mazah'?String(i-1):String(i)]||{};
      if(Array.isArray(chapter)) chapter.forEach(function(h){
        var copy=Object.assign({},h);
        copy._qxChapterTitle=chapterInfo.title||'';
        copy._colId=collection.id;
        copy._colName=collection.name;
        copy._qxChapterNo=i;
        rows.push(copy);
      });
    }
  }catch(e){}
  function draw(q){
    list.innerHTML='';
    var term=(q||'').toLowerCase();
    rows.forEach(function(h){
      var ar=h.ar||h.arabic||'',bn=h.bn||h.text||h.translation||'',narrator=h.narrator||'',grade=h.grade||'',chapterTitle=h._qxChapterTitle||'';
      var hay=(ar+' '+bn+' '+narrator+' '+grade+' '+chapterTitle).toLowerCase();
      if(term&&hay.indexOf(term)<0) return;
      var card=buildHadithAyahCard(h);
      list.appendChild(card);
    });
    if(!list.children.length) list.textContent='এই অনুসন্ধানে কোনো হাদিস পাওয়া যায়নি।';
  }
  search.oninput=function(){ draw(search.value); };
  draw('');
}
// [PAGE: Hadith Offline Collection Detail] end
// [PAGE: Hadith] start
function renderHadith(){if(typeof showOther==='function')showOther('{{i_hadith}} হাদিস প্যাকেজ');const appEl = document.getElementById('app');var info=document.createElement('div');info.className='note';info.style.textAlign='center';info.textContent='একে একে পড়ো, মুখস্থ হলে চিহ্নিত করো — ৬টি সহিহ গ্রন্থসহ';appEl.appendChild(info);
var pkgs=[{k:'nawawi',icon:'{{menu_book}}',name:'৪০ হাদিস (ইমাম নববী)',desc:'ইমাম নববীর সংকলন থেকে সোর্স-যাচাইকৃত নির্বাচিত হাদিস',count:HADITH_DATA.nawawi.length},{k:'qudsi',icon:'{{auto_awesome}}',name:'হাদিসে কুদসি',desc:'আল্লাহর কথা, রাসূল ﷺ-এর ভাষায় — হাদিস কুদসি থেকে সোর্স-যাচাইকৃত',count:HADITH_DATA.qudsi.length},{k:'short',icon:'{{lightbulb}}',name:'ছোট হাদিস — দৈনন্দিন জীবন',desc:'ছোট ছোট হাদিস, মুখস্থ করা সহজ — প্রতিদিন ১টা',count:HADITH_DATA.short.length}];pkgs.forEach(function(pk){var mem={};try{mem=JSON.parse(localStorage.getItem('quranix_hadith_mem')||'{}');}catch(e){}var done=0;for (let i=0;i<pk.count;i++){if(mem[pk.k+':'+i])done++;}var card=document.createElement('div');card.className='hadith-pkg';card.innerHTML='<h3>'+pk.icon+' '+pk.name+'</h3><div class="sub">'+pk.desc+'</div><div class="khatam-row" style="margin-top:8px"><span>'+(typeof toBn==='function'?toBn(pk.count):pk.count)+'টি হাদিস</span><span>মুখস্থ: '+(typeof toBn==='function'?toBn(done):done)+'/'+(typeof toBn==='function'?toBn(pk.count):pk.count)+'</span><span style="color:var(--qx-main-color);font-weight:700">খোলো →</span></div><div class="goal-track"><div class="goal-fill" style="width:'+Math.round(done/pk.count*100)+'%" ></div></div>';card.onclick=function(){renderHadithList(pk.k,pk.name);};appEl.appendChild(card);});
// --- Six canonical Hadith collections (Kutub al-Sittah) ---
var corpusTitle=document.createElement('div');
corpusTitle.className='home-section-title';
corpusTitle.style.marginTop='16px';
corpusTitle.textContent='কুতুবুস সিত্তাহ · ৬টি হাদিসগ্রন্থ';
appEl.appendChild(corpusTitle);
var corpusGrid=document.createElement('div');
corpusGrid.className='hadith-books-grid';
corpusGrid.setAttribute('aria-label','ছয়টি প্রধান হাদিসগ্রন্থ');
var pkgMeta=packageMeta();
(HADITH_CORPUS||[]).forEach(function(c){
  var key='hadith|'+c.id;
  var st=pkgMeta[key]||{};
  var isDone=st.status==='complete';
  var isPaused=st.status==='paused';
  var isPartial=st.status==='incomplete';
  var stateLabel=isDone?'অফলাইনে সংরক্ষিত':isPaused?'ডাউনলোড স্থগিত':isPartial?'আংশিক ডাউনলোড':'ডাউনলোড করতে চাপ দিন';
  var card=document.createElement('button');
  card.type='button';
  card.className='hadith-book-card';
  card.setAttribute('aria-label',c.name+' · '+c.chapters+' অধ্যায় · '+stateLabel);
  card.innerHTML='<span class="t-ic" style="display:grid;place-items:center;width:38px;height:38px;margin:0 auto 9px;border-radius:12px;background:var(--qx-main-soft);color:var(--qx-main-color)">{{menu_book}}</span>'+
    '<b>'+c.name+'</b>'+
    '<small>'+toBn(c.chapters)+' অধ্যায়</small>'+
    '<span class="hadith-book-badge">'+stateLabel+'</span>';
  card.onclick=function(){
    if(isDone){
      openOfflineHadithCollection(c);
    } else if(typeof runPackage==='function'){
      runPackage('hadith',c.id,c.name);
    } else if(typeof showToast==='function'){
      showToast('ডাউনলোড মেনু থেকে '+c.name+' ডাউনলোড করুন');
    }
  };
  corpusGrid.appendChild(card);
});
appEl.appendChild(corpusGrid);
var today=hadithToday();var tc=document.createElement('div');tc.className='hadith-pkg';tc.innerHTML='<h3>{{i_hadith}} আজকের হাদিস</h3><div class="ar" style="font-family:var(--qx-font-arabic);font-size:22px;direction:rtl;text-align:right;color:var(--qx-main-color)">'+today.ar+'</div><b>'+today.title+'</b><div class="note">'+today.bn+'</div><div class="ref" style="font-size:var(--qx-fs-xs);color:var(--qx-meta-color)">{{auto_stories}} '+today.ref+'</div>';tc.onclick=function(){openHadithDetail(today.pkg,today.idx);};appEl.appendChild(tc);renderOfflineHadithCollections(appEl);}
// [PAGE: Hadith] end
// [PAGE: Hadith List] start
function renderHadithList(pkgKey,pkgName){if(typeof showOther==='function')showOther('{{i_hadith}} '+pkgName);const appEl = document.getElementById('app');var back=document.createElement('button');back.className='dl-btn ghost';back.textContent='← সব প্যাকেজ';back.onclick=function(){renderHadith();};appEl.appendChild(back);var search=document.createElement('input');search.className='asma-search';search.placeholder='হাদিস খুঁজুন... যেমন: নিয়ত, রাগ, ধৈর্য';appEl.appendChild(search);var list=document.createElement('div');appEl.appendChild(list);function draw(f){list.innerHTML='';var mem={};try{mem=JSON.parse(localStorage.getItem('quranix_hadith_mem')||'{}');}catch(e){}HADITH_DATA[pkgKey].forEach(function(h,i){if(f&&(h[0]+h[2]+h[3]).toLowerCase().indexOf(f.toLowerCase())<0)return;var item=document.createElement('div');item.className='hadith-item'+(mem[pkgKey+':'+i]?' done':'');item.innerHTML='<div class="ar">'+h[1]+'</div><b>'+(typeof toBn==='function'?toBn(i+1):i+1)+'. '+h[0]+'</b><div style="font-size:var(--qx-fs-md);margin:4px 0">'+h[2]+'</div><div class="ref">{{auto_stories}} '+h[3]+(mem[pkgKey+':'+i]?' · {{check_circle:f}} মুখস্থ':'')+'</div>';var hkey=pkgKey+':'+i;var sv=document.createElement('button');sv.type='button';sv.className='star qx-star';sv.setAttribute('aria-label','সংরক্ষণ করুন');sv.textContent=savedHas('hadith',hkey)?'{{star:f}}':'{{star}}';sv.onclick=function(e){e.stopPropagation();var on=savedToggle('hadith',hkey,{title:h[0],ar:h[1],bn:h[2],ref:h[3]});sv.textContent=on?'{{star:f}}':'{{star}}';showToast(on?'সংরক্ষিত হয়েছে':'সংরক্ষণ সরানো হয়েছে');};item.appendChild(sv);item.onclick=function(){openHadithDetail(pkgKey,i);};list.appendChild(item);});}search.oninput=function(){draw(search.value);};draw('');}
// [PAGE: Hadith List] end
// [PAGE: Hadith Detail] start
function openHadithDetail(pkgKey,idx){var h=HADITH_DATA[pkgKey][idx];var mem={};try{mem=JSON.parse(localStorage.getItem('quranix_hadith_mem')||'{}');}catch(e){}var key=pkgKey+':'+idx;var ov=document.createElement('div');ov.className='ac-ov';ov.style.zIndex='130';var box=document.createElement('div');box.className='ac-box';box.innerHTML='<div class="ac-head"><span>{{i_hadith}} '+(pkgKey==='nawawi'?'৪০ হাদিস':pkgKey==='qudsi'?'হাদিসে কুদসি':'ছোট হাদিস')+' · '+(typeof toBn==='function'?toBn(idx+1):idx+1)+'</span><button id="hX">{{close}}</button></div><div class="ar" style="font-family:var(--qx-font-arabic);font-size:26px;direction:rtl;text-align:center;color:var(--qx-main-color);line-height:1.8">'+h[1]+'</div><b style="font-size:var(--qx-fs-xl)">'+h[0]+'</b><div style="line-height:1.7;margin:10px 0">'+h[2]+'</div><div class="trk-mini">{{auto_stories}} রেফারেন্স: '+h[3]+'</div><div class="trk-mini" style="margin-top:6px">{{lightbulb}} এই হাদিসটা আজকের দিনে কীভাবে আমল করবা, একটু ভেবে নাও। মুখস্থ হলে {{check_circle:f}} চাপ দাও।</div><div class="ac-row"><button class="ac-btn ghost" id="hSave">'+(savedHas('hadith',key)?'{{star:f}} সংরক্ষিত':'{{star}} সংরক্ষণ')+'</button><button class="ac-btn ghost" id="hMem">'+(mem[key]?'{{check_circle:f}} মুখস্থ — সরাও':'{{star}} মুখস্থ মার্ক করো')+'</button><button class="ac-btn" id="hShare">{{share}} শেয়ার করো</button></div><div class="ac-row"><button class="ac-btn ghost" id="hPrev">← আগের হাদিস</button><button class="ac-btn ghost" id="hNext">পরের হাদিস →</button></div>';ov.appendChild(box);document.body.appendChild(ov);var close=function(){ov.remove();if(typeof mode!=='undefined'&&mode==='hadith'){};};box.querySelector('#hX').onclick=close;ov.onclick=function(e){if(e.target===ov)close();};box.querySelector('#hSave').onclick=function(){var on=savedToggle('hadith',key,{title:h[0],ar:h[1],bn:h[2],ref:h[3]});this.textContent=on?'{{star:f}} সংরক্ষিত':'{{star}} সংরক্ষণ';if(typeof showToast==='function')showToast(on?'সংরক্ষিত হয়েছে':'সংরক্ষণ সরানো হয়েছে');};
box.querySelector('#hMem').onclick=function(){if(mem[key])delete mem[key];else mem[key]=1;localStorage.setItem('quranix_hadith_mem',JSON.stringify(mem));this.textContent=mem[key]?'{{check_circle:f}} মুখস্থ — সরাও':'{{star}} মুখস্থ মার্ক করো';if(typeof showToast==='function')showToast(mem[key]?'মুখস্থ মার্ক হয়েছে':'মার্ক সরানো হয়েছে');};box.querySelector('#hShare').onclick=async function(){var text=''+h[0]+'\n'+h[1]+'\n'+h[2]+'\n'+h[3]+'\n— Quranix · হাদিস প্যাকেজ';await shareTextOrCopy(text,h[0],'শেয়ার করা যায়নি, টেক্সট কপি করা হয়েছে!');};box.querySelector('#hPrev').onclick=function(){ov.remove();openHadithDetail(pkgKey,(idx+HADITH_DATA[pkgKey].length-1)%HADITH_DATA[pkgKey].length);};box.querySelector('#hNext').onclick=function(){ov.remove();openHadithDetail(pkgKey,(idx+1)%HADITH_DATA[pkgKey].length);};}
// [PAGE: Hadith Detail] end
window.renderHadith=renderHadith;
window.hadithBm={has:hadithBmHas,toggle:hadithBmToggle,list:hadithBmList,id:hadithBmId,TYPES:HADITH_BM_TYPES,EXAMPLE:HADITH_BM_EXAMPLE};window.buildHadithAyahCard=buildHadithAyahCard;window.openOfflineHadithCollection=openOfflineHadithCollection;window.buildHadithCard=buildHadithCard;window.openHadithDetail=openHadithDetail;window.renderHadithList=renderHadithList;



(function(){
  var theme = "dark";
  try { theme = localStorage.getItem("theme") === "light" ? "light" : "dark"; } catch(e) {}
  document.documentElement.setAttribute("data-theme", theme);
})();




// Logo + "Quranix" title tap -> Home (home = 4 tiles + label row). Not used inside reader/other pages (they have their own back button).
(function(){
  function goHome(){
    try{
      tab='home'; if(mode!=='quran') mode='quran'; if(qEl) qEl.value='';
      if(typeof renderTabs==='function') renderTabs();
      if(typeof setMode==='function') setMode('quran'); else if(typeof renderHome==='function') renderHome();
    }catch(e){}
    window.scrollTo(0,0);
  }
  window.goHome=goHome;
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('.app-logo,#title');
    if(!t || document.body.classList.contains('inside-page')) return;
    goHome();
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ') return;
    var t=e.target.closest&&e.target.closest('.app-logo,#title');
    if(!t || document.body.classList.contains('inside-page')) return;
    e.preventDefault(); goHome();
  });
  // label row sticks right under the header: keep its offset equal to the real header height
  var hd=document.querySelector('header');
  function setHdr(){ if(hd) document.documentElement.style.setProperty('--qx-hdr-h',hd.offsetHeight+'px'); }
  setHdr(); window.addEventListener('resize',setHdr);
  if(window.ResizeObserver && hd) new ResizeObserver(setHdr).observe(hd);
})();




// Keep the page behind dialogs and sheets from scrolling (including on mobile Safari).
(function(){
  var body = document.body;
  var root = document.documentElement;
  var locked = false;
  var savedScrollY = 0;
  var savedStyles = null;
  var overlaySelector = ".modal-overlay, .ac-ov, .sheet-ov, #gridPopupOverlay.open";

  function syncScrollLock(){
    var shouldLock = !!document.querySelector(overlaySelector);
    if (shouldLock && !locked) {
      locked = true;
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      savedStyles = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width
      };
      root.classList.add("qx-modal-open");
      body.classList.add("qx-modal-open");
      body.style.position = "fixed";
      body.style.top = (-savedScrollY) + "px";
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    } else if (!shouldLock && locked) {
      locked = false;
      root.classList.remove("qx-modal-open");
      body.classList.remove("qx-modal-open");
      body.style.position = savedStyles.position;
      body.style.top = savedStyles.top;
      body.style.left = savedStyles.left;
      body.style.right = savedStyles.right;
      body.style.width = savedStyles.width;
      window.scrollTo(0, savedScrollY);
      savedStyles = null;
    }
  }

  var observer = new MutationObserver(syncScrollLock);
  observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  syncScrollLock();
})();




/* আইকন সাহায্যকারী: i_ দিয়ে শুরু নাম = ইসলামিক আইকন ফন্ট (fonts/islamic-icons.ttf), বাকিগুলো Material */
function qxTopicSortOnly(){
  // Phase 3: sort শুধু topic + dictionary tab-এ
  try{
    const active = document.querySelector('.tab-btn.on')?.dataset?.tab || window.tab;
    const sortEl = document.querySelector('.qx-topic-sort');
    if(sortEl) sortEl.style.display = (active==='topic'||active==='dictionary') ? 'flex' : 'none';
  }catch(e){}
}
function qxIco(name, filled){
  name = String(name);
  if(name.indexOf('i_') === 0) return '<span class="ms qi' + (filled ? ' f' : '') + '" data-i="' + name.slice(2) + '" aria-hidden="true" data-nosnippet></span>';
  return '<span class="ms' + (filled ? ' f' : '') + '" aria-hidden="true" data-nosnippet>' + name + '</span>';
}
/* {{icon}} / {{icon:f}} tokens in any text become Material icon spans (also for dynamically added text) */
(function(){
  var RX=/\{\{([a-z_0-9]+)(:f)?\}\}/g, SKIP={OPTION:1,TITLE:1,TEXTAREA:1}, NOCONV={SCRIPT:1,STYLE:1};
  function conv(n){
    var s=n.nodeValue; if(!s||s.indexOf('{{')<0) return;
    var p=n.parentNode; if(!p||NOCONV[p.nodeName]) return;
    if(SKIP[p.nodeName]){ n.nodeValue=s.replace(RX,'').replace(/^\s+/,''); return; }
    var f=document.createDocumentFragment(), last=0, m; RX.lastIndex=0;
    while((m=RX.exec(s))){
      if(m.index>last) f.appendChild(document.createTextNode(s.slice(last,m.index)));
      var i=document.createElement('span'); i.className='ms'+(m[1].indexOf('i_')===0?' qi':'')+(m[2]?' f':''); i.setAttribute('aria-hidden','true'); i.setAttribute('data-nosnippet',''); if(m[1].indexOf('i_')===0) i.setAttribute('data-i',m[1].slice(2)); else i.textContent=m[1]; f.appendChild(i);
      last=RX.lastIndex;
    }
    if(last<s.length) f.appendChild(document.createTextNode(s.slice(last)));
    p.replaceChild(f,n);
  }
  function walk(r){
    if(r.nodeType===3){ conv(r); return; }
    if(r.nodeType!==1||r.nodeName==='SCRIPT'||r.nodeName==='STYLE') return;
    var w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,null), a=[], x;
    while((x=w.nextNode())) if(x.nodeValue.indexOf('{{')>=0) a.push(x);
    a.forEach(conv);
  }
  walk(document.body);
  new MutationObserver(function(ms){
    ms.forEach(function(m){
      if(m.type==='characterData') conv(m.target);
      else m.addedNodes.forEach(walk);
    });
  }).observe(document.body,{childList:true,subtree:true,characterData:true});
})();




const LOCAL = window.QURAN || null;
const API = "https://api.alquran.cloud/v1";

/* Speed control removed: playback remains at normal speed. */

/* --- ব্যক্তিগত আয়াত নোট (Personal Notes) --- */
let ayahNotes = lsGet("notes", {});
function saveAyahNote(k, text){
  const trimmed = text.trim();
  if (trimmed) ayahNotes[k] = trimmed;
  else delete ayahNotes[k];
  lsSet("notes", ayahNotes);
}

// [SHEET: Ayah Note Editor] start
function openNoteEditor(surahNo, ayahNo, label, onSaved){
  const k = surahNo + ":" + ayahNo;
  const previousFocus = document.activeElement;
  const overlay = document.createElement("div"); overlay.className = "modal-overlay";
  const content = document.createElement("div"); content.className = "modal-content"; content.setAttribute("role", "dialog"); content.setAttribute("aria-modal", "true"); content.setAttribute("aria-labelledby", "personalNoteDialogTitle"); content.tabIndex = -1;

  const header = document.createElement("div"); header.className = "modal-header";
  const h3 = document.createElement("h3"); h3.id = "personalNoteDialogTitle"; h3.textContent = "ব্যক্তিগত নোট · " + label;
  const close = document.createElement("button"); close.className = "close-btn"; close.textContent = "{{close}}";
  const dismissTafsir = () => { overlay.remove(); document.removeEventListener("keydown", onTafsirKeydown); if (previousFocus && previousFocus.isConnected) previousFocus.focus(); };
  const onTafsirKeydown = (e) => { if (e.key === "Escape") { e.preventDefault(); dismissTafsir(); } };
  close.setAttribute("aria-label", "নোট সম্পাদক বন্ধ করুন"); close.onclick = dismissTafsir;
  header.appendChild(close);
  content.appendChild(header);

  const ta = document.createElement("textarea");
  ta.rows = 5;
  ta.placeholder = "এই আয়াত সম্পর্কে আপনার নোট বা শিক্ষা লিখে রাখুন...";
  ta.style.cssText = "width:100%;padding:10px;border-radius:var(--qx-radius-lg);border:1px solid var(--qx-border);background:var(--qx-bg);color:var(--qx-text-color);font:inherit;resize:vertical;";
  ta.value = ayahNotes[k] || "";
  content.appendChild(ta);

  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:8px;margin-top:12px;justify-content:flex-end;";
  if (ayahNotes[k]) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "মুছুন";
    delBtn.style.color = "#d9534f";
    delBtn.onclick = () => {
      saveAyahNote(k, "");
      overlay.remove();
      showToast("নোট মুছে ফেলা হয়েছে");
      if (onSaved) onSaved("");
    };
    row.appendChild(delBtn);
  }
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "সংরক্ষণ করুন";
  saveBtn.style.cssText = "background:var(--qx-main-color);color:var(--qx-on-main);border-color:var(--qx-main-color);font-weight:600;";
  saveBtn.onclick = () => {
    saveAyahNote(k, ta.value);
    overlay.remove();
    showToast(ta.value.trim() ? "নোট সংরক্ষিত হয়েছে" : "নোট মুছে ফেলা হয়েছে");
    if (onSaved) onSaved(ta.value.trim());
  };
  row.appendChild(saveBtn);
  content.appendChild(row);

  overlay.appendChild(content);
  overlay.onclick = (e) => { if (e.target === overlay) dismissTafsir(); };
  document.body.appendChild(overlay); document.addEventListener("keydown", onTafsirKeydown); close.focus();
  setTimeout(() => ta.focus(), 50);
}
// [SHEET: Ayah Note Editor] end

/* --- দৈনিক পড়ার লক্ষ্য ও অগ্রগতি (Reading Goal & Progress) --- */
function todayStr(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
let goalData = lsGet("goal", { target: 10, date: todayStr(), readKeys: [] });
if (goalData.date !== todayStr()) {
  goalData = { target: goalData.target || 10, date: todayStr(), readKeys: [] };
  lsSet("goal", goalData);
}

function toggleReadAyah(k){
  if (goalData.date !== todayStr()) {
    goalData = { target: goalData.target || 10, date: todayStr(), readKeys: [] };
  }
  const idx = goalData.readKeys.indexOf(k);
  let marked = false;
  if (idx >= 0) {
    goalData.readKeys.splice(idx, 1);
  } else {
    goalData.readKeys.push(k);
    marked = true;
  }
  lsSet("goal", goalData);
  try { if (window.qxKhatamOnRead) window.qxKhatamOnRead(k, marked); } catch(e) {}
  return marked;
}

// [CARD: Reading Goal] start
function buildGoalCard(){
  if (goalData.date !== todayStr()) {
    goalData = { target: goalData.target || 10, date: todayStr(), readKeys: [] };
    lsSet("goal", goalData);
  }
  const count = goalData.readKeys.length;
  const target = goalData.target || 10;
  const pct = Math.min(100, Math.round((count / target) * 100));

  const box = document.createElement("div");
  box.className = "goal-bar";

  const top = document.createElement("div");
  top.className = "goal-top";
  const left = document.createElement("span");
  left.innerHTML = `{{target}} আজকের পঠন লক্ষ্য: <b>${toBn(count)} / ${toBn(target)}</b> আয়াত (${toBn(pct)}%)`;

  const editBtn = document.createElement("button");
  editBtn.textContent = "লক্ষ্য পরিবর্তন";
  editBtn.style.cssText = "padding:3px 8px;font-size:var(--qx-fs-xs);border-radius:var(--qx-radius);cursor:pointer;";
  editBtn.onclick = () => {
    window.qxShowPrompt("প্রতিদিন কয়টি আয়াত পড়ার লক্ষ্য রাখতে চান? (যেমন: ১০, ২০, ৫০)", String(target), function(val){
      if(val===null) return;
      const num = parseInt(val, 10);
      if (num && num > 0 && num <= 6236) {
        goalData.target = num;
        lsSet("goal", goalData);
        box.replaceWith(buildGoalCard());
        showToast("দৈনিক লক্ষ্য আপডেট হয়েছে: " + toBn(num) + " আয়াত");
      }
    });
  };
  top.appendChild(left);
  top.appendChild(editBtn);

  const track = document.createElement("div");
  track.className = "goal-track";
  const fill = document.createElement("div");
  fill.className = "goal-fill";
  fill.style.width = pct + "%";
  track.appendChild(fill);

  box.appendChild(top);
  box.appendChild(track);
  return box;
}
// [CARD: Reading Goal] end

/* --- দ্রুত সূরা ও আয়াত নেভিগেশন (Quick Jump) --- */
// [MENU: Quick Jump (surah/ayah)] start
function initQuickJump(){
  const sSel = document.getElementById("jumpSurah");
  const aInp = document.getElementById("jumpAyah");
  const goBtn = document.getElementById("jumpGo");
  if (!sSel || !aInp || !goBtn) return;
  sSel.innerHTML = "";
  let ayahList = document.getElementById("jumpAyahSuggestions");
  if (!ayahList) {
    ayahList = document.createElement("datalist");
    ayahList.id = "jumpAyahSuggestions";
    document.body.appendChild(ayahList);
  }
  aInp.setAttribute("list", "jumpAyahSuggestions");
  aInp.setAttribute("autocomplete", "off");
  aInp.setAttribute("inputmode", "numeric");
  aInp.placeholder = "আয়াত নং (তালিকা থেকে বাছুন)";
  const refreshAyahSuggestions = () => {
    const selected = surahs.find(x => x.number === +sSel.value);
    const count = selected ? selected.numberOfAyahs : 286;
    aInp.max = count;
    ayahList.innerHTML = "";
    for (let n = 1; n <= count; n++) {
      const option = document.createElement("option");
      option.value = String(n);
      option.label = `আয়াত ${toBn(n)}`;
      ayahList.appendChild(option);
    }
  };
  surahs.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.number;
    opt.textContent = `${toBn(s.number)}. ${s.englishName} (${toBn(s.numberOfAyahs)})`;
    sSel.appendChild(opt);
  });
  sSel.onchange = () => {
    refreshAyahSuggestions();
    aInp.value = "";
  };
  const doJump = () => {
    const sn = +sSel.value || 1;
    const s = surahs.find(x => x.number === sn);
    const maxA = s ? s.numberOfAyahs : 286;
    let an = parseInt(aInp.value, 10) || 1;
    if (an < 1) an = 1;
    if (an > maxA) {
      showToast(`এই সূরায় মোট আয়াত ${toBn(maxA)}টি`);
      an = maxA;
    }
    openSurah(sn, 0, an);
  };
  refreshAyahSuggestions();
  goBtn.onclick = doJump;
  aInp.onkeydown = (e) => { if (e.key === "Enter") doJump(); };
}
// [MENU: Quick Jump (surah/ayah)] end


/* --- আজকের বিশেষ আয়াত (Ayah of the Day) --- */
const DAILY_AYAHS = [
  { s: 94, a: 5, name: "Al-Inshirah" }, { s: 2, a: 286, name: "Al-Baqarah" },
  { s: 2, a: 152, name: "Al-Baqarah" }, { s: 65, a: 3, name: "At-Talaq" },
  { s: 3, a: 139, name: "Ali 'Imran" }, { s: 13, a: 28, name: "Ar-Ra'd" },
  { s: 39, a: 53, name: "Az-Zumar" }, { s: 2, a: 186, name: "Al-Baqarah" },
  { s: 16, a: 97, name: "An-Nahl" }, { s: 29, a: 69, name: "Al-'Ankabut" },
  { s: 8, a: 46, name: "Al-Anfal" }, { s: 40, a: 60, name: "Ghafir" },
  { s: 3, a: 173, name: "Ali 'Imran" }, { s: 55, a: 13, name: "Ar-Rahman" }
];

let aotdOffset = 0;
function getTodayAyah(){
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const idx = (dayOfYear + aotdOffset) % DAILY_AYAHS.length;
  return DAILY_AYAHS[idx];
}

// [CARD: Ayah of the Day] start
function buildAotdCard(){
  const base = getTodayAyah();
  // আরবি ও অনুবাদ সরাসরি অ্যাপের লাইসেন্স-যাচাইযোগ্য লোকাল ডেটা থেকে (হাতে লেখা নয়)
  const item = LOCAL && LOCAL.ar[base.s-1] ? { ...base, ar: LOCAL.ar[base.s-1][base.a-1] || "", bn: (LOCAL.bn[base.s-1] || [])[base.a-1] || "" } : null;
  if (!item || !item.ar) return document.createElement("div");
  const sObj = surahs.find(x => x.number === item.s);
  const sName = sObj ? sObj.englishName : item.name;
  const label = `${sName} · আয়াত ${toBn(item.a)}`;

  const card = document.createElement("div");
  card.className = "aotd-card";

  const head = document.createElement("div");
  head.className = "aotd-head";
  const badge = document.createElement("span");
  badge.className = "aotd-badge";
  badge.textContent = "{{stars}} আজকের বিশেষ আয়াত";
  const ref = document.createElement("span");
  ref.className = "aotd-ref";
  ref.textContent = label;
  head.appendChild(badge);
  head.appendChild(ref);

  const ar = document.createElement("div");
  ar.className = "aotd-ar";
  ar.textContent = item.ar;

  const bn = document.createElement("div");
  bn.className = "aotd-bn";
  bn.textContent = item.bn;

  const foot = document.createElement("div");
  foot.className = "aotd-foot";

  const openBtn = document.createElement("button");
  openBtn.className = "aotd-link";
  openBtn.textContent = "সূরায় পড়ুন →";
  openBtn.onclick = () => openSurah(item.s);

  const acts = document.createElement("div");
  acts.className = "ayah-actions";

  const playBtn = document.createElement("button");
  playBtn.className = "icon-btn";
  playBtn.title = "তেলাওয়াত শুনুন";
  playBtn.textContent = "{{volume_up}}";
  playBtn.onclick = () => {
    const aObj = { s: { number: item.s, englishName: sName }, no: item.a, ar: item.ar, bn: item.bn };
    playAyahFromList([aObj], item.s, item.a);
  };

  const favoriteBtn = document.createElement("button");
  favoriteBtn.type = "button";
  favoriteBtn.className = "icon-btn";
  favoriteBtn.title = "Favorite-এ Add";
  favoriteBtn.setAttribute("aria-label", "Favorite-এ Add");
  const favoriteKey = item.s + ":" + item.a;
  const syncFavoriteButton = () => {
    const isFavorite = savedHas("quran", favoriteKey);
    favoriteBtn.textContent = isFavorite ? "{{star:f}}" : "{{star}}";
    favoriteBtn.title = isFavorite ? "Favorite থেকে সরান" : "Favorite-এ Add";
    favoriteBtn.setAttribute("aria-label", favoriteBtn.title);
    favoriteBtn.setAttribute("aria-pressed", String(isFavorite));
  };
  syncFavoriteButton();
  favoriteBtn.onclick = () => {
    const on = savedToggle("quran", favoriteKey);
    syncFavoriteButton();
    showToast(on ? "Favorite-এ যোগ হয়েছে" : "Favorite থেকে সরানো হয়েছে");
  };

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.setAttribute("aria-label", "আয়াত কপি করুন");
  copyBtn.className = "icon-btn";
  copyBtn.title = "কপি করুন";
  copyBtn.textContent = "{{content_copy}}";
  copyBtn.onclick = () => {
    const text = `[${label}]\n${item.ar}\n\n${item.bn}\n— Quranix`;
    copyText(text, "আয়াত কপি হয়েছে!");
  };

  const nextBtn = document.createElement("button");
  nextBtn.className = "icon-btn";
  nextBtn.title = "অন্য আয়াত দেখুন";
  nextBtn.textContent = "{{refresh}}";
  nextBtn.onclick = () => {
    aotdOffset = (aotdOffset + 1) % DAILY_AYAHS.length;
    const fresh = buildAotdCard();
    card.replaceWith(fresh);
  };

  acts.appendChild(playBtn);
  acts.appendChild(favoriteBtn);
  acts.appendChild(copyBtn);
  acts.appendChild(nextBtn);

  foot.appendChild(openBtn);
  foot.appendChild(acts);

  card.appendChild(head);
  card.appendChild(ar);
  card.appendChild(bn);
  card.appendChild(foot);
  return card;
}
// [CARD: Ayah of the Day] end


/* --- অডিও তেলাওয়াত ও প্লেয়ার --- */
const RECITERS = [
  ["Saood_ash-Shuraym_128kbps", "সৌদ আশ-শুরাইম"],
  ["Alafasy_128kbps", "মিশারি রশিদ আল-আফাসি"],
  ["Abdul_Basit_Murattal_192kbps", "আব্দুল বাসিত (মুরাত্তাল)"],
  ["Abdurrahmaan_As-Sudais_192kbps", "আব্দুর রহমান আস-সুদাইস"],
  ["MaherAlMuaiqly128kbps", "মাহের আল-মুআইকলি"]
];
let currentReciter = lsGet("reciter", "Saood_ash-Shuraym_128kbps");
if (!RECITERS.some(r => r[0] === currentReciter)) currentReciter = RECITERS[0][0];
let autoPlayNext = lsGet("autoPlayNext", true);
let currentPlaylist = [];
let currentPlayIdx = -1;
let audioObj = new Audio();
let _nextAudioObj = new Audio();
let _nextPreloadedIdx = -1;
let _crossfadeTimer = null;
let _crossfadeRaf = null;

// --- P11: blob revoke + room-tone + real 300ms crossfade ---
function qxIsBlobUrl(u){ return typeof u === 'string' && u.indexOf('blob:') === 0; }
function qxRevokeBlobUrl(u){ if(qxIsBlobUrl(u)){ try{ URL.revokeObjectURL(u); }catch(e){} } }
function qxSafeRevokeAudioSrc(aud){
  try{
    const s = aud && aud.src ? aud.src : '';
    if(qxIsBlobUrl(s)) qxRevokeBlobUrl(s);
  }catch(e){}
}

// Room-tone (Decision 3): very low pink noise to avoid dead silence between ayahs
let qxRoomCtx = null;
let qxRoomGain = null;
function qxEnsureRoomTone(){
  try{
    if(qxRoomCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const len = ctx.sampleRate * 1;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for(let i=0;i<len;i++){ ch[i] = (Math.random()*2-1) * 0.006; }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(gain);
    src.start(0);
    qxRoomCtx = ctx;
    qxRoomGain = gain;
  }catch(e){}
}
function qxRoomToneFade(to, durMs){
  try{
    qxEnsureRoomTone();
    if(!qxRoomCtx || !qxRoomGain) return;
    if(qxRoomCtx.state === 'suspended') qxRoomCtx.resume().catch(()=>{});
    const g = qxRoomGain.gain;
    const now = qxRoomCtx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + durMs/1000);
  }catch(e){}
}

function qxPreloadNextAyah(){
  try{
    if(!autoPlayNext) return;
    const nextIdx = currentPlayIdx + 1;
    if(nextIdx < 0 || nextIdx >= currentPlaylist.length) return;
    if(_nextPreloadedIdx === nextIdx && _nextAudioObj.src) return;
    const nextItem = currentPlaylist[nextIdx];
    if(!nextItem) return;
    const rec = qxAudioDb.reciterNow();
    qxAudioDb.get(qxAudioDb.keyFor(rec, nextItem.s.number, nextItem.no)).then(blob => {
      if(blob){
        qxSafeRevokeAudioSrc(_nextAudioObj);
        _nextAudioObj.src = URL.createObjectURL(blob);
      } else {
        if(qxIsBlobUrl(_nextAudioObj.src)) qxSafeRevokeAudioSrc(_nextAudioObj);
        _nextAudioObj.src = qxAudioDb.urlFor(rec, nextItem.s.number, nextItem.no);
      }
      _nextAudioObj.preload = 'auto';
      _nextAudioObj.volume = 1;
      try{ _nextAudioObj.load(); }catch(e){}
      _nextPreloadedIdx = nextIdx;
    }).catch(()=>{});
  }catch(e){}
}

function qxDoRealCrossfade(oldAud, newAud, duration){
  return new Promise((resolve)=>{
    try{
      let done = false;
      const finish = ()=>{
        if(done) return;
        done = true;
        oldAud.volume = 0;
        newAud.volume = 1;
        resolve();
      };
      // ব্যাকগ্রাউন্ডে/স্ক্রিন বন্ধে requestAnimationFrame চলে না: তখন ফেড ছাড়াই সরাসরি পরের আয়াত পূর্ণ ভলিউমে
      if(document.hidden){ finish(); return; }
      // ফেডের মাঝে অ্যাপ ব্যাকগ্রাউন্ডে গেলেও যেন আটকে না থাকে
      setTimeout(finish, duration + 400);
      const start = performance.now();
      const fromVol = oldAud.volume;
      newAud.volume = 0;
      const tick = (now)=>{
        if(done) return;
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const ease = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t;
        oldAud.volume = Math.max(0, fromVol * (1 - ease));
        newAud.volume = Math.min(1, ease);
        if(t < 1){
          _crossfadeRaf = requestAnimationFrame(tick);
        } else {
          finish();
        }
      };
      _crossfadeRaf = requestAnimationFrame(tick);
    }catch(e){ resolve(); }
  });
}

function qxPlayWithCrossfade(nextIdx){
  try{
    if(_nextPreloadedIdx === nextIdx && _nextAudioObj.src){
      const oldAud = audioObj;
      const newAud = _nextAudioObj;
      newAud.playbackRate = 1;
      // Start newAud for overlap
      try{ newAud.currentTime = 0; }catch(e){}
      const playP = newAud.play().catch(()=>{});
      qxEnsureRoomTone();
      qxRoomToneFade(0.012, 80);
      qxDoRealCrossfade(oldAud, newAud, 300).then(()=>{
        try{ oldAud.pause(); }catch(e){}
        qxSafeRevokeAudioSrc(oldAud);
        oldAud.src = '';
        oldAud.volume = 1;
        // Swap: newAud becomes main audioObj, old becomes preload holder
        const tmp = audioObj;
        audioObj = _nextAudioObj;
        _nextAudioObj = tmp;
        _nextAudioObj.volume = 1;
        _nextAudioObj.src = '';
        _nextPreloadedIdx = -1;
        qxRoomToneFade(0, 200);
        // Re-attach listeners for new main if needed
        qxRebindAudioEvents();
        qxPreloadNextAyah();
      });
      return true;
    }
  }catch(e){}
  return false;
}

let _qxAudioEventsBound = false;
function qxRebindAudioEvents(){
  if(_qxAudioEventsBound) return;
  _qxAudioEventsBound = true;
  // This will be called after swap to ensure both audios have listeners via global handlers
  try{
    // timeupdate, playing etc are bound to audioObj variable dynamically via wrapper below
  }catch(e){}
}

// Phase 2 — Hide / Float button
function qxInitAudioHide(){
  const hideBtn = document.getElementById('audioHide');
  const floatWrap = document.getElementById('audioFloat');
  const floatBtn = document.getElementById('audioFloatBtn');
  if(hideBtn && floatWrap){
    hideBtn.onclick = () => {
      audioBar.style.display = 'none';
      // Hiding the player must also release the page scroll lock; playback continues.
      document.documentElement.classList.remove('qx-audio-open');
      document.body.classList.remove('qx-audio-open');
      floatWrap.style.display = 'block';
      updateAudioBarPos();
    };
  }
  if(floatBtn && floatWrap){
    floatBtn.onclick = () => {
      qxAudioBarShow();
    };
  }
}

const audioBar = document.getElementById("audioBar");
const audioTitle = document.getElementById("audioTitle");
const audioReciterLabel = document.getElementById("audioReciterLabel");
const audioPlayPause = document.getElementById("audioPlayPause");
const audioRepeatBtn = document.getElementById('audioRepeat');
const audioSleepTimerBtn = document.getElementById('audioSleepTimer');
let qxAudioRepeatMode = 0; // 0=off, 1=playlist repeat, 2=current ayah repeat
let qxAudioSleepTimerId = null;

function pad3(n){ return String(n).padStart(3, "0"); }
function getReciterName(id){ const f = RECITERS.find(r => r[0] === id); return f ? f[1] : RECITERS[0][1]; }

function updateAudioBarPos(){
  const navVisible = navEl && navEl.style.display !== "none";
  audioBar.classList.toggle("with-nav", navVisible);
  const floatEl = document.getElementById("audioFloat");
  if (floatEl) floatEl.classList.toggle("with-nav", navVisible);
}

/* প্লেয়ার বার দেখানো: ভাসমান বৃত্ত থাকলে সেটা লুকায়, দুটো একসাথে দেখা যায় না */
function qxAudioBarShow(){
  const floatEl = document.getElementById("audioFloat");
  if (floatEl) floatEl.style.display = "none";
  audioBar.style.display = "block";
  document.documentElement.classList.add('qx-audio-open');
  document.body.classList.add('qx-audio-open');
  updateAudioBarPos();
}

let qxReaderUserScrolled = false;
let qxReaderSessionAutoScroll = true;
function qxAyahIsInViewport(card, margin){
  if(!card) return false;
  const r = card.getBoundingClientRect();
  const pad = Math.max(0, Number(margin) || 0);
  return r.bottom >= pad && r.top <= window.innerHeight - pad;
}
function highlightPlayingCard(surahNo, ayahNo, forceScroll){
  document.querySelectorAll(".ayah.playing").forEach(el => el.classList.remove("playing"));
  const card = document.querySelector(`.ayah[data-key="${surahNo}:${ayahNo}"]`);
  if (card) {
    card.classList.add("playing");
    // Follow playback only when the user has not taken control of scrolling.
    if(forceScroll || (qxReaderSessionAutoScroll && !qxReaderUserScrolled && !qxAyahIsInViewport(card, 72))){
      card.scrollIntoView({ behavior: forceScroll ? "auto" : qxScrollBehavior(), block: "center" });
    }
  }
}

function playAyahAtIndex(idx){
  if (typeof window.qxStopFullSurahAudio === "function") {
    window.qxStopFullSurahAudio();
  }
  if (idx < 0 || idx >= currentPlaylist.length) {
    stopAudio();
    return;
  }
  currentPlayIdx = idx;
  const item = currentPlaylist[idx];
  const rec = qxAudioDb.reciterNow();
  // P11: try offline blob first, revoke old blob url
  qxSafeRevokeAudioSrc(audioObj);
  const remoteUrl = `https://everyayah.com/data/${currentReciter}/${pad3(item.s.number)}${pad3(item.no)}.mp3`;
  // Async offline check
  qxAudioDb.get(qxAudioDb.keyFor(rec, item.s.number, item.no)).then(blob => {
    if(blob){
      audioObj.src = URL.createObjectURL(blob);
    } else {
      audioObj.src = remoteUrl;
    }
    audioObj.playbackRate = 1;
    audioObj.volume = 1;
    audioTitle.textContent = `${item.s.englishName} · আয়াত ${toBn(item.no)}`;
    audioReciterLabel.textContent = getReciterName(currentReciter);
    qxAudioBarShow();
    highlightPlayingCard(item.s.number, item.no);
    // Ensure room tone ctx resumed on user gesture
    qxEnsureRoomTone();
    if(qxRoomCtx && qxRoomCtx.state === 'suspended') qxRoomCtx.resume().catch(()=>{});
    audioObj.play().then(() => {
      audioPlayPause.textContent = "{{pause}}";
      audioPlayPause.setAttribute("aria-label", "অডিও বিরতি দাও");
      qxPreloadNextAyah();
    }).catch(() => {
      showToast("অডিও লোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।");
      audioPlayPause.textContent = "{{play_arrow}}";
      audioPlayPause.setAttribute("aria-label", "আবার চালাও");
    });
  }).catch(()=>{
    audioObj.src = remoteUrl;
    audioObj.playbackRate = 1;
    audioObj.volume = 1;
    audioTitle.textContent = `${item.s.englishName} · আয়াত ${toBn(item.no)}`;
    audioReciterLabel.textContent = getReciterName(currentReciter);
    qxAudioBarShow();
    highlightPlayingCard(item.s.number, item.no);
    qxEnsureRoomTone();
    audioObj.play().then(() => {
      audioPlayPause.textContent = "{{pause}}";
      audioPlayPause.setAttribute("aria-label", "অডিও বিরতি দাও");
      qxPreloadNextAyah();
    }).catch(() => {
      showToast("অডিও লোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।");
      audioPlayPause.textContent = "{{play_arrow}}";
      audioPlayPause.setAttribute("aria-label", "আবার চালাও");
    });
  });
}

function playAyahFromList(list, targetSurah, targetAyah){
  currentPlaylist = list;
  const idx = list.findIndex(x => x.s.number === targetSurah && x.no === targetAyah);
  if (idx >= 0) playAyahAtIndex(idx);
}

function stopAudio(){
  try{ audioObj.pause(); }catch(e){}
  qxSafeRevokeAudioSrc(audioObj);
  // Also revoke next preloaded if blob
  qxSafeRevokeAudioSrc(_nextAudioObj);
  if(_crossfadeRaf){ try{ cancelAnimationFrame(_crossfadeRaf); }catch(e){} _crossfadeRaf=null; }
  try{ audioObj.src = ""; }catch(e){}
  try{ _nextAudioObj.src = ""; }catch(e){}
  _nextPreloadedIdx = -1;
  audioBar.style.display = "none";
  if(qxAudioSleepTimerId){ clearTimeout(qxAudioSleepTimerId); qxAudioSleepTimerId=null; }
  if(audioSleepTimerBtn){ audioSleepTimerBtn.classList.remove('on'); audioSleepTimerBtn.setAttribute('aria-label','স্লিপ টাইমার'); }
  document.documentElement.classList.remove('qx-audio-open');
  document.body.classList.remove('qx-audio-open');
  const floatAfterStop = document.getElementById("audioFloat");
  if (floatAfterStop) floatAfterStop.style.display = "none";
  currentPlayIdx = -1;
  qxRoomToneFade(0, 150);
  const statusEl = document.getElementById('audioStatus');
  if(statusEl) statusEl.textContent = '';
  document.querySelectorAll(".ayah.playing").forEach(el => el.classList.remove("playing"));
}

audioPlayPause.onclick = () => {
  if (!audioObj.src) return;
  if (audioObj.paused) {
    audioObj.play().then(() => audioPlayPause.textContent = "{{pause}}").catch(() => {});
  } else {
    audioObj.pause();
    audioPlayPause.textContent = "{{play_arrow}}";
  }
};
document.getElementById("audioPrev").onclick = () => {
  if (currentPlayIdx > 0) playAyahAtIndex(currentPlayIdx - 1);
};
document.getElementById("audioNext").onclick = () => {
  if (currentPlayIdx + 1 < currentPlaylist.length) playAyahAtIndex(currentPlayIdx + 1);
};
if(audioRepeatBtn){
  const repeatLabels = ['পুনরাবৃত্তি বন্ধ', 'সব আয়াত পুনরাবৃত্তি', 'বর্তমান আয়াত পুনরাবৃত্তি'];
  const repeatIcons = ['repeat', 'repeat', 'repeat_one'];
  function qxUpdateRepeatButton(){
    audioRepeatBtn.classList.toggle('on', qxAudioRepeatMode !== 0);
    audioRepeatBtn.dataset.repeatMode = String(qxAudioRepeatMode);
    audioRepeatBtn.setAttribute('aria-pressed', qxAudioRepeatMode !== 0 ? 'true' : 'false');
    audioRepeatBtn.setAttribute('aria-label', repeatLabels[qxAudioRepeatMode]);
    const icon = audioRepeatBtn.querySelector('.ms');
    if(icon) icon.textContent = repeatIcons[qxAudioRepeatMode];
    audioRepeatBtn.title = repeatLabels[qxAudioRepeatMode];
  }
  qxUpdateRepeatButton();
  audioRepeatBtn.onclick = () => {
    qxAudioRepeatMode = (qxAudioRepeatMode + 1) % 3;
    qxUpdateRepeatButton();
    showToast(['পুনরাবৃত্তি বন্ধ', 'সব আয়াত ধারাবাহিকভাবে পুনরাবৃত্তি হবে', 'বর্তমান আয়াত পুনরাবৃত্তি হবে'][qxAudioRepeatMode]);
  };
}
if(audioSleepTimerBtn){
  audioSleepTimerBtn.onclick = async () => {
    if(typeof window.qxPromptAsync !== 'function') return;
    const value = await window.qxPromptAsync('কত মিনিট পরে অডিও বন্ধ হবে? ১–১৮০ মিনিট লিখুন। ০ দিলে চালু থাকা টাইমার বাতিল হবে।', '15');
    if(value === null) return;
    const minutes = Number.parseInt(String(value).trim(), 10);
    if(!Number.isInteger(minutes) || minutes < 0 || minutes > 180){
      showToast('১ থেকে ১৮০ মিনিটের মধ্যে সময় দিন, অথবা ০ লিখুন');
      return;
    }
    if(qxAudioSleepTimerId){ clearTimeout(qxAudioSleepTimerId); qxAudioSleepTimerId = null; }
    if(minutes === 0){
      audioSleepTimerBtn.classList.remove('on');
      audioSleepTimerBtn.setAttribute('aria-label', 'স্লিপ টাইমার');
      showToast('স্লিপ টাইমার বাতিল হয়েছে');
      return;
    }
    audioSleepTimerBtn.classList.add('on');
    audioSleepTimerBtn.setAttribute('aria-label', minutes + ' মিনিট পরে অডিও বন্ধ হবে');
    qxAudioSleepTimerId = window.setTimeout(() => {
      try{ audioObj.pause(); }catch(e){}
      audioPlayPause.textContent = '{{play_arrow}}';
      audioPlayPause.setAttribute('aria-label', 'আবার চালাও');
      const statusEl = document.getElementById('audioStatus');
      if(statusEl) statusEl.textContent = '';
      audioSleepTimerBtn.classList.remove('on');
      audioSleepTimerBtn.setAttribute('aria-label', 'স্লিপ টাইমার');
      qxAudioSleepTimerId = null;
      showToast('স্লিপ টাইমার শেষ—অডিও বন্ধ হয়েছে');
    }, minutes * 60 * 1000);
    showToast(minutes + ' মিনিট পরে অডিও বন্ধ হবে');
  };
}
document.getElementById("audioClose").onclick = stopAudio;
try{ qxInitAudioHide(); }catch(e){}
/* দুটো অডিও এলিমেন্টেই (আসল ও প্রিলোড/ক্রসফেড) "ended" শোনা হয়: swap-এর পর নতুন মূল এলিমেন্টেও অটো-প্লে চলে */
function qxHandleAudioEnded(){
  if(qxAudioRepeatMode === 2 && currentPlayIdx >= 0 && currentPlayIdx < currentPlaylist.length){
    playAyahAtIndex(currentPlayIdx);
    return;
  }
  const hasNext = currentPlayIdx + 1 < currentPlaylist.length;
  if (qxAudioRepeatMode === 1 && currentPlaylist.length > 0) {
    const nextIndex = hasNext ? currentPlayIdx + 1 : 0;
    if(!qxPlayWithCrossfade(nextIndex)) playAyahAtIndex(nextIndex);
    else {
      try{
        const ni = currentPlaylist[nextIndex];
        if(ni){ currentPlayIdx = nextIndex; audioTitle.textContent = ni.s.englishName + ' · আয়াত ' + toBn(ni.no); highlightPlayingCard(ni.s.number, ni.no); }
      }catch(e){}
    }
    return;
  }
  if (autoPlayNext && hasNext) {
    // Phase 2: try preloaded crossfade first, else normal
    if(!qxPlayWithCrossfade(currentPlayIdx + 1)){
      playAyahAtIndex(currentPlayIdx + 1);
    } else {
      // Update title for next item
      try{
        const ni = currentPlaylist[currentPlayIdx + 1];
        if(ni){ currentPlayIdx = currentPlayIdx + 1; audioTitle.textContent = ni.s.englishName + ' · আয়াত ' + toBn(ni.no); highlightPlayingCard(ni.s.number, ni.no); }
      }catch(e){}
    }
  } else {
    audioPlayPause.textContent = "{{play_arrow}}";
  }
}
[audioObj, _nextAudioObj].forEach(aud => aud.addEventListener("ended", () => { if (aud === audioObj) qxHandleAudioEnded(); }));

/* Keep every ayah card's play/pause quick button in step with the audio element */
function qxSyncPlayButtons(){
  const cur = currentPlayIdx >= 0 ? currentPlaylist[currentPlayIdx] : null;
  const playing = !!cur && !audioObj.paused && !audioObj.ended;
  document.querySelectorAll(".ayah-play-btn").forEach(b => {
    const mine = !!cur && Number(b.dataset.s) === cur.s.number && Number(b.dataset.a) === cur.no;
    const want = mine && playing ? "pause" : "play_arrow";
    if (b.dataset.state !== want) {
      b.dataset.state = want;
      b.textContent = "{{" + want + "}}";
      b.title = want === "pause" ? "বিরতি দিন" : "তেলাওয়াত শুনুন";
      b.setAttribute("aria-label", b.title);
    }
    b.classList.toggle("on", mine);
  });
}
[audioObj, _nextAudioObj].forEach(aud => ["play", "playing", "pause", "ended", "emptied", "error"].forEach(ev => aud.addEventListener(ev, qxSyncPlayButtons)));

/* Phase 4 + P11: progress, network, lock-screen, background check, blob revoke, বিরতি যাচাই */
(function(){
  const seek=document.getElementById('audioSeek');
  const curEl=document.getElementById('audioCurrentTime');
  const durEl=document.getElementById('audioDuration');
  const status=document.getElementById('audioStatus');
  const fillEl=document.getElementById('audioProgressFill');
  if(!seek||!curEl||!durEl||!status) return;
  const getMain = ()=> audioObj;
  const bnTime=function(s){
    if(!Number.isFinite(s)||s<0) s=0;
    const m=Math.floor(s/60), sec=Math.floor(s%60);
    return toBn(m)+':'+toBn(String(sec).padStart(2,'0'));
  };
  const updateProgress=function(){
    const aud = getMain();
    const d=aud.duration, t=aud.currentTime||0;
    curEl.textContent=bnTime(t);
    if(Number.isFinite(d)&&d>0){
      durEl.textContent=bnTime(d);
      if(document.activeElement!==seek) seek.value=String(Math.round(t/d*1000));
      seek.disabled=false;
    }else{durEl.textContent='০:০০';seek.value='0';seek.disabled=true;}
    if(fillEl) fillEl.style.width=(Number(seek.value)/10)+'%';
  };
  seek.addEventListener('input',function(){
    const aud = getMain();
    if(Number.isFinite(aud.duration)&&aud.duration>0){
      aud.currentTime=(Number(seek.value)/1000)*aud.duration;
      updateProgress();
    }
  });
  function bindAud(aud){
    if(!aud || aud._qxP4Bound) return;
    aud._qxP4Bound = true;
    aud.addEventListener('timeupdate',function(){ if(aud===getMain()) updateProgress(); });
    aud.addEventListener('durationchange',function(){ if(aud===getMain()) updateProgress(); });
    aud.addEventListener('loadedmetadata',function(){
      if(aud!==getMain()) return;
      updateProgress();
      status.textContent='';
      // MediaMetadata
      try{
        const item=currentPlaylist[currentPlayIdx];
        if(item && 'mediaSession' in navigator && 'MediaMetadata' in window){
          navigator.mediaSession.metadata=new MediaMetadata({title:'আয়াত '+toBn(item.no),artist:getReciterName(currentReciter),album:item.s.englishName+' · Quranix'});
        }
      }catch(e){}
    });
    aud.addEventListener('waiting',function(){ if(aud===getMain()) status.textContent='অডিও লোড হচ্ছে…'; });
    aud.addEventListener('playing',function(){
      if(aud!==getMain()) return;
      status.textContent='';
      audioPlayPause.textContent='{{pause}}';
      // P11: background check - ensure room tone off when playing
      qxRoomToneFade(0, 150);
    });
    aud.addEventListener('pause',function(){
      if(aud!==getMain()) return;
      // বিরতির সময় স্ট্যাটাস লাইন খালি থাকে।
      if(aud.src && !aud.ended){
        status.textContent='';
      }
    });
    aud.addEventListener('error',function(){
      if(aud!==getMain() || !aud.src) return;
      status.textContent=navigator.onLine?'অডিও পাওয়া যাচ্ছে না — আবার চেষ্টা করো':'ইন্টারনেট সংযোগ নেই';
      audioPlayPause.textContent='{{play_arrow}}';
    });
    aud.addEventListener('emptied',function(){
      if(aud!==getMain()) return;
      seek.value='0';seek.disabled=true;curEl.textContent='০:০০';durEl.textContent='০:০০';status.textContent='';
      if(fillEl) fillEl.style.width='0%';
      // P11: revoke blob on emptied to prevent leak
      qxSafeRevokeAudioSrc(aud);
    });
    aud.addEventListener('timeupdate',function(){
      if(aud!==getMain()) return;
      if('mediaSession' in navigator && navigator.mediaSession.setPositionState && Number.isFinite(aud.duration) && aud.duration>0){
        try{navigator.mediaSession.setPositionState({duration:aud.duration,playbackRate:aud.playbackRate,position:Math.min(aud.currentTime,aud.duration)});}catch(e){}
      }
    });
  }
  bindAud(audioObj);
  bindAud(_nextAudioObj);
  // Re-bind after swap
  const origRebind = window.qxRebindAudioEvents;
  window.qxRebindAudioEvents = function(){
    try{ if(origRebind) origRebind(); }catch(e){}
    bindAud(audioObj);
    bindAud(_nextAudioObj);
  };
  window.addEventListener('online',function(){if(status.textContent==='ইন্টারনেট সংযোগ নেই')status.textContent='সংযোগ ফিরে এসেছে';});
  window.addEventListener('offline',function(){const aud=getMain(); if(aud.paused)status.textContent='অফলাইন — সংরক্ষিত অডিও থাকলে চালানো যাবে';});
  // P11: background check - audio should continue in background, do NOT pause on visibilitychange
  document.addEventListener('visibilitychange',function(){
    // Explicitly do nothing - let audio continue
    // If browser pauses, try resume if was playing
    if(document.visibilityState === 'visible'){
      // No auto-resume, just ensure status correct
    }
  });
  if('mediaSession' in navigator){
    const action=function(name,handler){try{navigator.mediaSession.setActionHandler(name,handler);}catch(e){}}
    action('play',function(){ getMain().play().catch(function(){}); });
    action('pause',function(){ getMain().pause(); });
    action('previoustrack',function(){if(currentPlayIdx>0)playAyahAtIndex(currentPlayIdx-1);});
    action('nexttrack',function(){if(currentPlayIdx+1<currentPlaylist.length)playAyahAtIndex(currentPlayIdx+1);});
    action('seekto',function(details){
      try{
        const aud=getMain();
        if(details.fastSeek && 'fastSeek' in aud){ aud.fastSeek(details.seekTime); return; }
        aud.currentTime = details.seekTime;
      }catch(e){}
    });
  }
  updateProgress();
})();


/* স্ক্রল স্মুথ হবে কি না: সিস্টেম সেটিং বা অ্যাপের "অ্যানিমেশন কম" চালু থাকলে স্মুথ নয় */
function qxScrollBehavior(){
  const rm = document.documentElement.hasAttribute("data-reduced-motion") || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  return rm ? "auto" : "smooth";
}
function lsGet(k,d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }
function lsSet(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }

/* P9 v2.0.32 — F-05: তাফসির HTML allowlist sanitizer (লাইব্রেরি ছাড়া, অফলাইনে চলে)
   শুধু নিচের ট্যাগ থাকে, কোনো attribute থাকে না। বিপজ্জনক ট্যাগ লেখাসহ বাদ যায়,
   অন্য অচেনা ট্যাগ খুলে ভেতরের লেখা রাখা হয়। */
const QX_SAFE_TAGS = new Set(["p","br","b","strong","i","em","u","ul","ol","li","blockquote","span","div","sub","sup","small","h1","h2","h3","h4","h5","h6"]);
const QX_DROP_TAGS = new Set(["script","style","iframe","object","embed","link","meta","form","input","button","textarea","select","svg","math","template","noscript","title"]);
function safeHtml(html){
  const doc = new DOMParser().parseFromString(String(html == null ? "" : html), "text/html");
  const out = document.createElement("div");
  (function walk(src, dst){
    src.childNodes.forEach(n => {
      if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1) return;
      const t = n.tagName.toLowerCase();
      if (QX_DROP_TAGS.has(t)) return;
      if (QX_SAFE_TAGS.has(t)) { const e = document.createElement(t); walk(n, e); dst.appendChild(e); }
      else walk(n, dst);
    });
  })(doc.body, out);
  return out.innerHTML;
}

/* Sources & references: one list used by the settings sheet and the menu popup. */
window.qxSourcesHtml = function(){
  const A = (u, t) => '<a href="' + u + '" target="_blank" rel="noopener">' + (t || u.replace(/^https:\/\//, '')) + '</a>';
  const SECTIONS = [
    ['কুরআনের পাঠ ও অনুবাদ', [
      'আরবি পাঠ: Tanzil Project, AlQuran Cloud-এর মাধ্যমে · ' + A('https://tanzil.net') + ' · ' + A('https://alquran.cloud') + ' · অ্যাপের সাথে অফলাইন',
      'বাংলা অনুবাদ (মাওলানা মুহিউদ্দীন খান): AlQuran Cloud সংস্করণ bn.bengali · অ্যাপের সাথে অফলাইন',
      'বাংলা অনুবাদ (ড. আবু বকর মুহাম্মাদ যাকারিয়া): প্রকাশক King Fahd Glorious Quran Printing Complex, উৎস ' + A('https://quranenc.com') + ' · সংস্করণ V1.1.1 · ডাউনলোড করে অফলাইনে ব্যবহার করা যায়',
      'ইংরেজি অনুবাদ (Saheeh International, Yusuf Ali, Muhammad Asad): AlQuran Cloud API · ' + A('https://alquran.cloud') + ' · অনলাইন সংস্করণ',
      'ইংরেজি অনুবাদ (Marmaduke Pickthall, 1930): en.pickthall · AlQuran Cloud API · ডাউনলোড করে অ্যাপের স্টোরেজে অফলাইনে রাখা যায়; মূল ১৯৩০ সংস্করণ পাবলিক ডোমেইন হিসেবে নথিভুক্ত ' + A('https://en.wikisource.org/wiki/The_Meaning_of_the_Glorious_Koran'),
      'শব্দে শব্দে অর্থ ও উচ্চারণ: Quran.com API v4 · ' + A('https://quran.com') + ' · ইন্টারনেট প্রয়োজন'
    ]],
    ['তাফসির', [
      'তাফসির ফাতহুল মাজীদ: আব্দুর রহমান বিন হাসান আল-আলশেখ · Quran.com রিসোর্স ৩৮১ · ডিফল্ট তাফসির; ইন্টারনেট পেলে নিজে থেকে ডাউনলোড হয়ে অফলাইনে থাকে',
      'তাফসির ইবনে কাসীর (বাংলা): তাওহীদ পাবলিকেশন্স · Quran.com রিসোর্স ১৬৪ · ডাউনলোডযোগ্য',
      'ডেটা-উৎস: spa5k/tafsir_api (MIT লাইসেন্স) · ' + A('https://github.com/spa5k/tafsir_api')
    ]],
    ['হাদিস', [
      'ছয় হাদিসগ্রন্থের বাংলা ও আরবি ডেটা: KafelaNetwork Hadith API (কমিউনিটি GitHub ডেটাসেট, অফিসিয়াল প্রকাশকের API নয়) · ' + A('https://github.com/kafelanetwork/hadith-api'),
      'অ্যাপে বিল্ট-ইন হাদিস, ৯৯ নাম ও দোয়া: প্রতিটির সাথে দেওয়া রেফারেন্স মূল গ্রন্থে মিলিয়ে নিন'
    ]],
    ['বিষয়ভিত্তিক আয়াত ও শব্দার্থ', [
      'ধাতু (Root), শব্দের সংখ্যা ও আয়াতের তালিকা: Quranic Arabic Corpus (Morphology v0.4) · ' + A('https://corpus.quran.com') + ' · ধাতু ধরে গণনা, তাই সংখ্যা চূড়ান্ত হিসাব নয়'
    ]],
    ['অডিও তিলাওয়াত', [
      'EveryAyah.com থেকে (অনলাইন, অথবা ডাউনলোড করে অফলাইন) · ' + A('https://everyayah.com'),
      'কারি: সৌদ আশ-শুরাইম (ডিফল্ট), মিশারি আল-আফাসি, আব্দুল বাসিত (মুরাত্তাল), আব্দুর রহমান আস-সুদাইস, মাহের আল-মুআইকলি',
      'প্রতিটি কারির সম্পূর্ণ অডিও ডাউনলোড ম্যানেজার থেকে আলাদাভাবে ডাউনলোড করা যায়'
        ]],
    ['ডাউনলোড করা ডেটা', [
      'ডাউনলোড করা অনুবাদ, তাফসির, হাদিস ও অডিও শুধু এই ডিভাইসের অ্যাপ/ব্রাউজার স্টোরেজে থাকে। ডাউনলোড ম্যানেজার থেকে যেকোনো সময় মুছে ফেলা যায়।'
    ]],
    ['নামাজের সময়ের এলাকা', [
      'উপজেলার আনুমানিক স্থানাঙ্ক: nuhil/bangladesh-geocode (MIT লাইসেন্স) · ' + A('https://github.com/nuhil/bangladesh-geocode') + ' · অ্যাপের সাথে অফলাইন'
    ]],
    ['ফন্ট ও আইকন', [
      'Hind Siliguri (Indian Type Foundry, SIL Open Font License 1.1) — অ্যাপের সাথেই সংরক্ষিত, অফলাইনে চলে',
      'Noto Naskh Arabic (The Noto Project Authors, SIL Open Font License 1.1) — আরবি ডিফল্ট ফন্ট, অ্যাপের সাথে সংরক্ষিত',
      'Material Symbols Rounded (Google)'
    ]]
  ];
  return SECTIONS.map(s => '<div class="src-sec"><b>' + s[0] + '</b>' + s[1].map(x => '<div class="src-item">• ' + x + '</div>').join('') + '</div>').join('') +
    '<div class="src-note">তৃতীয় পক্ষের ডেটাসেটে ভুল বা অসম্পূর্ণতা থাকতে পারে। ধর্মীয় সিদ্ধান্তের আগে মূল গ্রন্থ বা যোগ্য আলেমের কাছে যাচাই করুন।</div>';
};
// Slugs come from the spa5k/tafsir_api edition list (ids 381 and 164 are Quran.com resource ids).
// First item is the default tafsir; its package is installed offline automatically.
const TAFSIRS = [[381,"তাফসির ফাতহুল মাজীদ","bn-tafisr-fathul-majid"],[164,"তাফসির ইবনে কাসীর","bn-tafseer-ibn-e-kaseer"]];
const TAFSIR_CDN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@v1.2.3/tafsir/";
// Fallback when the pinned release does not contain an edition.
/* TODO: ফলব্যাক ref 'main'-ও পিন করো (কমিট হ্যাশ) */
const TAFSIR_CDN_FALLBACK_REF = "311a038";
const TAFSIR_CDN_MAIN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@" + TAFSIR_CDN_FALLBACK_REF + "/tafsir/";
function getTafsirSlug(id){ const item=TAFSIRS.find(t=>Number(t[0])===Number(id)); return item?item[2]:""; }
let tafsirId = lsGet("tafsirId", 381);
async function shareTextOrCopy(text, title, copyMessage){
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: title || "Quranix", text: text });
      return true;
    } catch (error) {
      // A user-cancelled share is not a failure; do not unexpectedly copy instead.
      if (error && error.name === "AbortError") return false;
      if (typeof copyText === "function") {
        return await copyText(text, copyMessage || "শেয়ার করা যায়নি, টেক্সট কপি করা হয়েছে!");
      }
      if (typeof showToast === "function") showToast("শেয়ার করা যায়নি।");
      return false;
    }
  }
  if (typeof copyText === "function") {
    return await copyText(text, copyMessage || "শেয়ার সমর্থিত নয়, টেক্সট কপি করা হয়েছে!");
  }
  return false;
}

async function copyText(text, okMsg){
  const notify = function(message){
    if (typeof showToast === "function") showToast(message);
  };
  const done = function(){ notify(okMsg || "কপি হয়েছে!"); return true; };
  const manualCopy = function(){
    try {
      window.qxShowAlert("স্বয়ংক্রিয়ভাবে কপি করা যায়নি। নিচের লেখাটি ম্যানুয়ালি কপি করুন:\n\n"+String(text).slice(0,500), function(){
        notify("টেক্সটটি নির্বাচন করে কপি করুন।");
      });
      return true;
    } catch(e) {}
    notify("কপি করা যায়নি।");
    return false;
  };
  const legacyCopy = function(){
    let field = null;
    try {
      field = document.createElement("textarea");
      field.value = String(text);
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;";
      document.body.appendChild(field);
      field.focus();
      field.select();
      field.setSelectionRange(0, field.value.length);
      if (document.execCommand("copy")) return done();
    } catch(e) {
      // Continue to the visible manual-copy fallback.
    } finally {
      if (field && field.parentNode) field.parentNode.removeChild(field);
    }
    return manualCopy();
  };
  if (navigator.clipboard && window.isSecureContext && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(String(text));
      return done();
    } catch(e) {
      return legacyCopy();
    }
  }
  return legacyCopy();
}
// [SHEET: Tafseer] start
async function openTafseer(surahNo, ayahNo, label){
  const tfName = (TAFSIRS.find(t => t[0] === tafsirId) || TAFSIRS[0])[1];
  const previousFocus = document.activeElement;
  const overlay = document.createElement("div"); overlay.className = "modal-overlay";
  const content = document.createElement("div"); content.className = "modal-content"; content.setAttribute("role", "dialog"); content.setAttribute("aria-modal", "true"); content.setAttribute("aria-labelledby", "tafseerDialogTitle"); content.tabIndex = -1;
  
  const header = document.createElement("div"); header.className = "modal-header";
  const h3 = document.createElement("h3"); h3.id = "tafseerDialogTitle"; h3.textContent = tfName + " · " + label;
  const close = document.createElement("button"); close.className = "close-btn"; close.textContent = "{{close}}";
  const dismissTafsir = () => { overlay.remove(); document.removeEventListener("keydown", onTafsirKeydown); if (previousFocus && previousFocus.isConnected) previousFocus.focus(); };
  const onTafsirKeydown = (e) => { if (e.key === "Escape") { e.preventDefault(); dismissTafsir(); } };
  close.setAttribute("aria-label", "তাফসির বন্ধ করুন"); close.onclick = dismissTafsir;
  header.appendChild(close);
  content.appendChild(header);
  
  const body = document.createElement("div"); body.className = "tafseer-body" + (Number(tafsirId) === 164 ? " tafseer-ibn-kathir" : "");
  body.textContent = "তাফসির লোড হচ্ছে…";
  content.appendChild(body);
  overlay.appendChild(content);
  overlay.onclick = (e) => { if (e.target === overlay) dismissTafsir(); };
  document.body.appendChild(overlay); document.addEventListener("keydown", onTafsirKeydown); close.focus();

  try {
    const cacheKey = `tafseer:${tafsirId}:${surahNo}:${ayahNo}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      body.innerHTML = safeHtml(cached);
      return;
    }
    if (window.quranixPackageStore) {
      const offlineTafsir = await window.quranixPackageStore.getTafsir(tafsirId, surahNo, ayahNo);
      if (offlineTafsir) {
        body.innerHTML = safeHtml(offlineTafsir);
        return;
      }
    }
    const tafsirSlug = getTafsirSlug(tafsirId);
    if (!tafsirSlug) throw new Error("Unknown tafsir edition");
    let r = await fetch(`${TAFSIR_CDN}${tafsirSlug}/${surahNo}/${ayahNo}.json`);
    if (r.status === 404) {
      try { const r2 = await fetch(`${TAFSIR_CDN_MAIN}${tafsirSlug}/${surahNo}/${ayahNo}.json`); if (r2.ok) r = r2; } catch(e) {}
    }
    if (r.status === 404) {
      body.textContent = "এই আয়াতের জন্য নির্বাচিত তাফসিরে আলাদা ব্যাখ্যা নেই।";
      return;
    }
    if (!r.ok) throw new Error("Tafsir API HTTP " + r.status);
    const j = await r.json();
    if (j && j.text) {
      cacheSet(cacheKey, j.text);
      body.innerHTML = safeHtml(j.text);
    } else {
      body.textContent = "এই আয়াতের তাফসির পাওয়া যায়নি।";
    }
  } catch(e) {
    body.textContent = "তাফসির লোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।";
  }
}
// [SHEET: Tafseer] end

let currentEdition = lsGet("edition", "bn.bengali");
document.getElementById("transSel").value = currentEdition;
document.getElementById("transSel").onchange = (e) => {
  currentEdition = e.target.value;
  lsSet("edition", currentEdition);
  if (reading) {
    if (reading.t === "s") openSurah(reading.n, window.scrollY);
    else if (reading.t === "j") openJuz(reading.n, window.scrollY);
  }
};

const app = document.getElementById("app");
const titleEl = document.getElementById("title");
const backBtn = document.getElementById("back");
const controls = document.getElementById("controls");
const qEl = document.getElementById("q");
const tabsEl = document.getElementById("tabs");
const navEl = document.getElementById("nav");
let mode = "quran";
let tmr = null;
function stopTimer(){ if (tmr) { clearInterval(tmr); tmr = null; } }

let surahs = [];
let tab = "all";
let fs = 30;
try { fs = parseInt(localStorage.getItem("fs")) || 30; } catch(e){}
document.documentElement.style.setProperty("--qx-fs-ar", fs + "px");

const TABS = [["all","সব সূরা"],["topic","বিষয়ভিত্তিক আয়াত"],["dict","শব্দার্থ"],["juz","পারা"],["Meccan","মাক্কী"],["Medinan","মাদানী"],["bm","সংরক্ষিত"]];

function toBn(n){ return String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]); }

/* --- সংরক্ষিত: বুকমার্ক ও ফেভারিট একটাই ফিচার ---
   items: {c:"quran|hadith|dua", id, f:ফোল্ডার id বা null, ts, snap}, folders: {id, name} */
let saved = lsGet("saved", null);
if (!saved || !Array.isArray(saved.items) || !Array.isArray(saved.folders)) {
  saved = { items: [], folders: [] };
  lsGet("bm", []).forEach(k => saved.items.push({ c: "quran", id: k, f: null, ts: Date.now() }));
  lsSet("saved", saved);
}
function qxSaveStore(){ lsSet("saved", saved); }
function savedFind(c, id){ return saved.items.find(x => x.c === c && x.id === id); }
function savedHas(c, id){ return !!savedFind(c, id); }
function savedToggle(c, id, snap){
  const i = saved.items.findIndex(x => x.c === c && x.id === id);
  if (i >= 0) saved.items.splice(i, 1); else saved.items.push({ c: c, id: id, f: null, ts: Date.now(), snap: snap || null });
  qxSaveStore();
  return i < 0;
}
function qxSavedFromBackup(d){
  if (d && d.saved && Array.isArray(d.saved.items) && Array.isArray(d.saved.folders)) return d.saved;
  if (d && Array.isArray(d.bm)) return { items: d.bm.map(k => ({ c: "quran", id: k, f: null, ts: Date.now() })), folders: [] };
  return null;
}
let last = lsGet("last", null);
let reading = null;
const bmKey = a => a.s.number + ":" + a.no;
function saveScroll(){ if (reading && last) { last.y = window.scrollY; lsSet("last", last); } }
function restoreReaderScroll(y, renderToken){
  const target = Math.max(0, Number(y) || 0);
  if (!target) return;
  // A delayed restore must never scroll a newer reader opened in the meantime.
  const apply = () => {
    if (renderToken !== readerRenderToken || !reading) return;
    window.scrollTo({ top: target, left: 0, behavior: "instant" });
  };
  requestAnimationFrame(() => requestAnimationFrame(apply));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(apply)).catch(() => {});
  }
}
let scrollSaveTimer = 0;
function qxMarkReaderUserScroll(){ if(reading) qxReaderUserScrolled = true; }
window.addEventListener("wheel", qxMarkReaderUserScroll, { passive:true });
window.addEventListener("touchstart", qxMarkReaderUserScroll, { passive:true });
window.addEventListener("keydown", event => {
  if(reading && ["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key) && !/^(INPUT|TEXTAREA|SELECT)$/.test(event.target && event.target.tagName || "")) qxMarkReaderUserScroll();
});
function updateReaderProgress(){
  const bar = document.getElementById("readerProgress");
  const fill = document.getElementById("readerProgressFill");
  if (!bar || !fill || !reading) return;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const value = Math.max(0, Math.min(100, Math.round((window.scrollY / max) * 100)));
  fill.style.width = value + "%";
  bar.setAttribute("aria-valuenow", String(value));
}
window.addEventListener("scroll", () => {
  if (!reading) return;
  updateReaderProgress();
  clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(saveScroll, 350);
}, { passive: true });
window.addEventListener("resize", updateReaderProgress, { passive: true });
document.addEventListener("visibilitychange", () => { if (document.hidden) saveScroll(); });
window.addEventListener("pagehide", saveScroll);

// Reader keyboard navigation: Alt + ↑/↓ moves between the rendered ayahs.
document.addEventListener("keydown", event => {
  if (!reading || !event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
  const target = event.target;
  if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))) return;
  const cards = Array.from(document.querySelectorAll("#app .ayah[data-key]"));
  if (!cards.length) return;
  let current = target && target.closest ? target.closest(".ayah[data-key]") : null;
  if (!current) {
    const y = window.innerHeight * 0.45;
    current = cards.reduce((best, card) => {
      const distance = Math.abs(card.getBoundingClientRect().top - y);
      return !best || distance < best.distance ? { card, distance } : best;
    }, null).card;
  }
  const index = cards.indexOf(current);
  const next = cards[index + (event.key === "ArrowDown" ? 1 : -1)];
  if (!next) return;
  event.preventDefault();
  next.scrollIntoView({ behavior: qxScrollBehavior(), block: "center" });
  next.focus({ preventScroll: true });
  saveScroll();
});

function cacheGet(k){ try { const v = localStorage.getItem("c:"+k); return v ? JSON.parse(v) : null; } catch(e){ return null; } }
function cacheSet(k,v){ try { localStorage.setItem("c:"+k, JSON.stringify(v)); } catch(e){} }

async function getJSON(path){
  const cached = cacheGet(path);
  if (cached) return cached;
  const r = await fetch(API + path);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  if (!j || j.code !== 200) throw new Error("API error");
  cacheSet(path, j.data);
  return j.data;
}

async function loadSurahList(){
  if (LOCAL) return LOCAL.meta.map(m => ({number:m.n,name:m.name,englishName:m.en,englishNameTranslation:m.tr,revelationType:m.type,numberOfAyahs:m.count}));
  return getJSON("/surah");
}

async function getZakariaSurahTranslation(surahNo){
  const cacheKey = `quranenc_zakaria:${surahNo}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const r = await fetch(`https://quranenc.com/api/v1/translation/sura/bengali_zakaria/${surahNo}`);
  if (!r.ok) throw new Error("QuranEnc HTTP " + r.status);
  const j = await r.json();
  const rows = Array.isArray(j) ? j : (Array.isArray(j.result) ? j.result : (Array.isArray(j.translations) ? j.translations : []));
  if (!rows.length) throw new Error("QuranEnc অনুবাদের ডেটা পাওয়া যায়নি");
  const cleaned = rows.slice().sort((a,b)=>Number(a.aya||a.ayah||0)-Number(b.aya||b.ayah||0)).map(row => String(row.translation || row.text || "").replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]+>/g, "").trim());
  if (cleaned.some(text => !text)) throw new Error("QuranEnc অনুবাদে খালি আয়াত রয়েছে");
  cacheSet(cacheKey, cleaned);
  return cleaned;
}

async function getQuranComTrans(endpoint, resourceId){
  const cacheKey = `qcom_tr:${resourceId}:${endpoint}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const r = await fetch(`https://api.quran.com/api/v4/quran/translations/${resourceId}?${endpoint}`);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  if (!j || !j.translations) throw new Error("API error");
  const cleaned = j.translations.map(t => (t.text || "").replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]+>/g, "").trim());
  cacheSet(cacheKey, cleaned);
  return cleaned;
}

async function loadSurahAyahs(n){
  if (window.quranixPackageStore) {
    try {
      const offlineChapter = await window.quranixPackageStore.getTranslation(currentEdition, n);
      if (offlineChapter && offlineChapter.length) {
        const meta = (LOCAL && LOCAL.meta[n-1]) || (surahs.find(x => x.number === n) || {});
        const chapterInfo = {number:n, name:meta.name || "", englishName:meta.en || meta.englishName || "সূরা " + n};
        return offlineChapter.map(row => ({s:chapterInfo, no:row.no, ar:row.ar, bn:row.bn || ""}));
      }
    } catch(e) {}
  }
  if (LOCAL && currentEdition === "bn.bengali") {
    const m = LOCAL.meta[n-1], s = {number:n,name:m.name,englishName:m.en};
    return LOCAL.ar[n-1].map((t,i) => ({s,no:i+1,ar:t,bn:LOCAL.bn[n-1][i] || ""}));
  }
  if (currentEdition === "bn.zakaria") {
    const trList = await getZakariaSurahTranslation(n);
    if (LOCAL) {
      const m = LOCAL.meta[n-1], s = {number:n,name:m.name,englishName:m.en};
      return LOCAL.ar[n-1].map((t,i) => ({s,no:i+1,ar:t,bn:trList[i] || ""}));
    }
    const d = await getJSON("/surah/" + n + "/quran-uthmani");
    const s = {number:n,name:d.name,englishName:d.englishName};
    return d.ayahs.map((a,i) => ({s,no:a.numberInSurah,ar:a.text,bn:trList[i] || ""}));
  }
  const d = await getJSON("/surah/" + n + "/editions/quran-uthmani," + currentEdition);
  const s = {number:n,name:d[0].name,englishName:d[0].englishName};
  return d[0].ayahs.map((a,i) => ({s,no:a.numberInSurah,ar:a.text,bn:d[1].ayahs[i] ? d[1].ayahs[i].text : ""}));
}

async function loadJuzAyahs(j){
  if (window.quranixPackageStore && LOCAL && currentEdition !== "bn.bengali" && currentEdition !== "bn.zakaria") {
    const neededSurahs = Array.from(new Set(LOCAL.juz.reduce((out, arr, si) => {
      if (arr.some(jj => jj === j)) out.push(si + 1);
      return out;
    }, [])));
    const offlineTranslations = {};
    let allOffline = neededSurahs.length > 0;
    for (const surahNo of neededSurahs) {
      const rows = await window.quranixPackageStore.getTranslation(currentEdition, surahNo);
      if (!Array.isArray(rows) || !rows.length) { allOffline = false; break; }
      offlineTranslations[surahNo] = rows;
    }
    if (allOffline) {
      const out = [];
      LOCAL.juz.forEach((arr, si) => arr.forEach((jj, i) => {
        if (jj !== j) return;
        const meta = LOCAL.meta[si], row = offlineTranslations[si + 1][i];
        out.push({s:{number:si+1,name:meta.name,englishName:meta.en},no:i+1,ar:LOCAL.ar[si][i],bn:row && row.bn ? row.bn : ""});
      }));
      if (out.length) return out;
    }
  }
  if (LOCAL && currentEdition === "bn.bengali") {
    const out = [];
    LOCAL.juz.forEach((arr, si) => arr.forEach((jj, i) => {
      if (jj === j) { const m = LOCAL.meta[si]; out.push({s:{number:si+1,name:m.name,englishName:m.en},no:i+1,ar:LOCAL.ar[si][i],bn:LOCAL.bn[si][i] || ""}); }
    }));
    return out;
  }
  if (currentEdition === "bn.zakaria") {
    if (LOCAL) {
      const translations = {};
      for (let si=0;si<LOCAL.juz.length;si++) {
        if (LOCAL.juz[si].some(jj => jj === j)) translations[si+1] = await getZakariaSurahTranslation(si+1);
      }
      const out = [];
      LOCAL.juz.forEach((arr, si) => arr.forEach((jj, i) => {
        if (jj === j) { const m=LOCAL.meta[si]; out.push({s:{number:si+1,name:m.name,englishName:m.en},no:i+1,ar:LOCAL.ar[si][i],bn:translations[si+1][i]||""}); }
      }));
      return out;
    }
    const d = await getJSON("/juz/" + j + "/quran-uthmani");
    const translations = {};
    const surahNumbers = Array.from(new Set(d.ayahs.map(a=>a.surah.number)));
    for (const sn of surahNumbers) translations[sn] = await getZakariaSurahTranslation(sn);
    return d.ayahs.map(a => ({s:{number:a.surah.number,name:a.surah.name,englishName:a.surah.englishName},no:a.numberInSurah,ar:a.text,bn:translations[a.surah.number][a.numberInSurah-1]||""}));
  }
  const d = await getJSON("/juz/" + j + "/editions/quran-uthmani," + currentEdition);
  return d[0].ayahs.map((a,i) => ({s:{number:a.surah.number,name:a.surah.name,englishName:a.surah.englishName},no:a.numberInSurah,ar:a.text,bn:d[1].ayahs[i] ? d[1].ayahs[i].text : ""}));
}

async function loadBismillah(){
  if (LOCAL) return LOCAL.ar[0][0];
  const d = await getJSON("/surah/1/quran-uthmani");
  return d.ayahs[0].text;
}
function cleanText(a){ return stripBismillah(a.ar, a.s.number, a.no); }

function msg(t){ app.innerHTML = ""; const d = document.createElement("div"); d.className = "msg"; d.setAttribute("role", /লোড করা যায়নি|ব্যর্থ|সমস্যা/i.test(String(t)) ? "alert" : "status"); d.setAttribute("aria-live", /লোড করা যায়নি|ব্যর্থ|সমস্যা/i.test(String(t)) ? "assertive" : "polite"); d.setAttribute("aria-atomic", "true"); d.textContent = t; app.appendChild(d); }

function stripBismillah(text, surahNo, ayahNo){
  if (!text || ayahNo !== 1 || surahNo === 1 || surahNo === 9) return text;
  // Never cut by word count. Compare a normalized copy (no harakat/tatweel, alef variants -> alef)
  // and cut the original text only when the real Bismillah prefix is found.
  const src = String(text);
  const target = "بسماللهالرحمنالرحيم";
  const mapped = { "\u0671":"\u0627", "\u0622":"\u0627", "\u0623":"\u0627", "\u0625":"\u0627" };
  let norm = "";
  const ends = [];
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const code = ch.charCodeAt(0);
    const isMark = (code >= 0x064B && code <= 0x065F) || code === 0x0670 || code === 0x0640 ||
                   (code >= 0x06D6 && code <= 0x06ED) || code === 0x200C || code === 0x200D;
    const isSpace = /\s/.test(ch);
    if (isMark || isSpace) {
      if (ends.length) ends[ends.length - 1] = i + 1;
      continue;
    }
    if (norm.length >= target.length) break; // prefix complete, marks already consumed
    norm += (mapped[ch] || ch);
    ends.push(i + 1);
  }
  if (norm !== target) return text; // no Bismillah prefix: keep Quran text untouched
  const rest = src.slice(ends[target.length - 1]).trim();
  return rest.length > 0 ? rest : text;
}

// [TABS: Quran tab bar] start
function renderTabs(){
  const selectedTab = TABS.some(([key]) => key === tab) ? tab : "all";
  tabsEl.setAttribute("role", "tablist");
  tabsEl.setAttribute("aria-label", "কুরআন ব্রাউজের ধরন");
  tabsEl.innerHTML = "";
  TABS.forEach(([k,label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", k === selectedTab ? "true" : "false");
    b.setAttribute("tabindex", k === selectedTab ? "0" : "-1");
    b.setAttribute("aria-controls", "app");
    b.textContent = label;
    if (k === selectedTab) b.className = "on";
    b.onclick = () => { tab = k; qEl.value = ""; renderTabs(); renderHome(); };
    b.onkeydown = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      const current = TABS.findIndex(([key]) => key === selectedTab);
      const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
      const nextTab = TABS[next][0];
      tab = nextTab;
      qEl.value = "";
      renderTabs();
      renderHome();
      const nextButton = tabsEl.querySelectorAll('[role="tab"]')[next];
      if (nextButton) nextButton.focus();
    };
    tabsEl.appendChild(b);
  });
}
// [TABS: Quran tab bar] end

/* রিফ্রেশে বর্তমান মোড ও ট্যাব ধরে রাখা ("qxNav" কী-তে সেভ) */
var QX_NAV_MODES = ["quran","prayer","tasbih","dua","tracker","asma","hijri","hadith","more","saved","dict"];
function qxSaveNav(){ lsSet("qxNav", { mode: mode, tab: tab }); }
function qxRestoreNav(){
  const sv = lsGet("qxNav", null);
  if (!sv || typeof sv !== "object") return;
  if (QX_NAV_MODES.indexOf(sv.mode) !== -1 || (typeof QX_SECTIONS !== "undefined" && QX_SECTIONS[sv.mode])) mode = sv.mode;
  if (sv.tab === "home") tab = "home";
  else if (TABS.some(([k]) => k === sv.tab)) tab = sv.tab;
}
/* রিফ্রেশে বর্তমান মোড ও ট্যাব মনে রাখা (কী: quranix_view — রিসেটে নিজে মুছে যায়) */
function qxSaveView(){
  try { lsSet("quranix_view", { mode: mode, tab: tab === "bm" ? "all" : tab }); } catch(e){}
}
function qxRestoreView(){
  try {
    var v = lsGet("quranix_view", null); if (!v) return;
    var okModes = ["quran","prayer","tasbih","dua","tracker","asma","hijri","hadith","more","saved","dict"];
    var okTab = v.tab === "home" || TABS.some(function(t){ return t[0] === v.tab && t[0] !== "bm"; });
    var okMode = okModes.indexOf(v.mode) >= 0 || !!QX_SECTIONS[v.mode];
    if (okTab) tab = v.tab === "home" ? "home" : v.tab;
    if (okMode && v.mode !== "quran") {
      mode = v.mode;
      document.querySelectorAll("#nav button").forEach(function(b){
        b.classList.toggle("on", b.dataset.m === mode || (mode === "tasbih" && b.dataset.m === "dua") || ((mode === "tracker" || mode === "saved" || mode === "dict" || mode === "hadith" || mode === "asma") && b.dataset.m === "more"));
      });
      qxNav.pushMode();
    }
  } catch(e){}
}
// [ROUTER: renderHome (mode -> page)] start
function renderHome(){
  qxSaveView();
  stopTimer();
  qxSaveNav();

  if (mode === "prayer") return renderPrayer();
  if (mode === "tasbih") return renderTasbih();
  if (mode === "dua") return renderDua();
  if (mode === "tracker") return renderTracker();
  if (mode === "asma") return renderAsma();
  if (mode === "hijri") return renderHijri();
  if (mode === "hadith") return renderHadith();
  if (mode === "more") return renderMore();
  if (mode === "saved") return renderSaved();
  if (mode === "dict") return renderDictPage();
  if (QX_SECTIONS[mode]) return renderSection(mode);
  renderQuranHome();
}
// [ROUTER: renderHome (mode -> page)] end

/* ===== কুরআন তালিকার গ্রিড / লিস্ট ভিউ (সব ট্যাবে) =====
   পছন্দ localStorage-এ "qxListView" নামে সেভ থাকে: "grid" বা "list". */
function qxListView(){ return lsGet("qxListView", "grid") === "list" ? "list" : "grid"; }
function qxApplyListView(view){
  lsSet("qxListView", view);
  document.querySelectorAll(".surah-grid").forEach(g => g.classList.toggle("is-list", view === "list"));
  // Single toggle (dark/light pattern): button always shows the NEXT view icon — grid shown => list icon, list shown => grid icon
  document.querySelectorAll(".qx-view-btn").forEach(b => {
    const next = view === "grid" ? "list" : "grid";
    b.dataset.view = next;
    b.textContent = next === "grid" ? "{{grid_view}}" : "{{list_alt}}";
    b.setAttribute("aria-label", next === "grid" ? "গ্রিড ভিউ" : "লিস্ট ভিউ");
    b.setAttribute("aria-pressed", view === "list" ? "true" : "false");
    b.classList.toggle("on", true);
  });
}
function qxListHeading(countText){
  const heading = document.createElement("div");
  heading.className = "surah-list-heading";
  const count = document.createElement("span");
  count.textContent = countText;
  const toggle = document.createElement("div");
  toggle.className = "qx-view-toggle";
  const view = qxListView();
  // Single button (dark/light pattern): shows NEXT view icon
  const next = view === "grid" ? "list" : "grid";
  const b = document.createElement("button");
  b.type = "button";
  b.className = "qx-view-btn on";
  b.dataset.view = next;
  b.setAttribute("aria-label", next === "grid" ? "গ্রিড ভিউ" : "লিস্ট ভিউ");
  b.setAttribute("aria-pressed", view === "list" ? "true" : "false");
  b.textContent = next === "grid" ? "{{grid_view}}" : "{{list_alt}}";
  b.onclick = () => qxApplyListView(b.dataset.view);
  toggle.appendChild(b);
  heading.append(count, toggle);
  return heading;
}
function qxListGrid(){
  const grid = document.createElement("div");
  grid.className = "surah-grid" + (qxListView() === "list" ? " is-list" : "");
  return grid;
}
function qxAddGridTag(card, label){
  if (!card || card.querySelector(".qx-grid-tag")) return card;
  const tag = document.createElement("span");
  tag.className = "qx-grid-tag";
  tag.textContent = label;
  tag.setAttribute("aria-hidden", "true");
  card.appendChild(tag);
  return card;
}
/* Sort — বিষয়ভিত্তিক ট্যাবে সাজানো। গ্রিড / লিস্ট — ২ ভিউতেই একই Sort কাজ করে।
   কালার: ফাইলের নিজের ভেরিয়েবল — var(--qx-card-bg), var(--qx-border), var(--qx-meta-color), var(--qx-text-color), var(--qx-main-color) / var(--qx-on-main)। নতুন হার্ডকোড কালার নাই।
   Grid/List বাটন: .qx-view-btn-এর পুরান রুলই ব্যবহার হয় (off = card-bg + meta, on = main-color + on-main)।
   count = শব্দের সংখ্যা বেশি থেকে কম | pair = জোড়া পাশাপাশি | bn = বাংলা অভিধান ক্রম | imp = কুরআনে গুরুত্ব (কত আয়াতে আছে, তারপর সংখ্যা) */
let qxTopicSort = "count";
let qxTopicQ = "";
const QX_PAIR_GROUPS = [[1,6,24],[7,8,48],[9,10,17],[11,12],[13,14],[15,16,31],[18,19],[20,21],[22,23],[25,26],[27,28],[29,30],[32,33],[34,35],[36,37],[38,39],[40,41],[42,43],[44,45],[46,47],[49,50],[51,52],[53,54],[55,56],[57,58],[59,60],[61,62],[63,64],[65,66],[67,68],[69,70],[71,72],[73,74],[75,76],[77,78],[79,80],[81,82],[83,84],[85,86],[87,88],[89,90],[91,92],[93,94],[95,96],[97,98]];
function qxTopicPairGroup(serial){
  for (const g of QX_PAIR_GROUPS) if (g.includes(serial)) return Math.min(...g);
  return serial;
}
function qxSortTopics(list){
  const withSerial = list.map((t, idx) => ({ t, serial: idx + 1 }));
  if (qxTopicSort === "pair"){
    withSerial.sort((a, b) => (qxTopicPairGroup(a.serial) - qxTopicPairGroup(b.serial)) || (b.t.count - a.t.count));
  } else if (qxTopicSort === "bn"){
    withSerial.sort((a, b) => a.t.bn.localeCompare(b.t.bn, "bn"));
  } else if (qxTopicSort === "imp"){
    withSerial.sort((a, b) => (b.t.ayahs.length - a.t.ayahs.length) || (b.t.count - a.t.count));
  } else {
    withSerial.sort((a, b) => b.t.count - a.t.count);
  }
  return withSerial;
}
/* ===== সবার জন্য এক সর্ট ড্রপডাউন ও এক সার্চ বক্স (বিষয়ভিত্তিক ট্যাব + শব্দার্থ ট্যাব) =====
   qxSortDropdown(opts, current, onPick, ariaLabel): opts = [[মান, লেবেল], ...]; ছোট আইকন বাটন + মেনু। নেটিভ <select> মোবাইলে ক্লিক না খাওয়ার কারণে বাদ।
   qxSearchBox(value, placeholder, ariaLabel, onInput): .qx-search বক্স; ইনপুট নতুন করে বানানো হয় না, শুধু onInput-এ তালিকা ছেঁকে দেখানো হয়। */
const QX_SORT_ICON = "sort"; // Material icon name of the sort button. If this icon is missing from the icon font, change only this name.
function qxSortDropdown(opts, current, onPick, ariaLabel){
  const currentLabel = (opts.find(([v]) => v === current) || opts[0])[1];
  // Wrapper + button look comes from .qx-topic-sort in index.html (icon button, .on = menu open).
  // margin-left:auto pushes [sort][grid/list] to the right end of the heading row.
  const sortWrap = document.createElement("div");
  sortWrap.className = "qx-topic-sort";
  sortWrap.style.cssText = "position:relative;margin-left:auto;";
  const sortBtn = document.createElement("button");
  sortBtn.type = "button";
  sortBtn.setAttribute("aria-label", ariaLabel + ": " + currentLabel);
  sortBtn.setAttribute("aria-haspopup", "menu");
  sortBtn.setAttribute("aria-expanded", "false");
  sortBtn.textContent = "{{" + QX_SORT_ICON + "}}";
  const sortMenu = document.createElement("div");
  sortMenu.setAttribute("role", "menu");
  sortMenu.setAttribute("aria-label", ariaLabel);
  sortMenu.style.cssText = "display:none;position:absolute;top:calc(100% + 4px);z-index:var(--qx-z-dropdown);min-width:190px;max-width:calc(100vw - 28px);max-height:min(60vh,320px);overflow-y:auto;border:1px solid var(--qx-border);border-radius:var(--qx-radius);background:var(--qx-card-bg);color:var(--qx-text-color);box-shadow:0 8px 24px rgba(0,0,0,.18);";
  // Menu rows are divs (not buttons) so the icon-button rules of .qx-topic-sort do not apply to them.
  opts.forEach(([v, label], i) => {
    const isOn = v === current;
    const o = document.createElement("div");
    o.setAttribute("role", "menuitemradio");
    o.setAttribute("aria-checked", isOn ? "true" : "false");
    o.tabIndex = 0;
    o.style.cssText = "display:flex;align-items:center;min-height:40px;box-sizing:border-box;padding:8px 12px;font-size:var(--qx-fs-sm);cursor:pointer;" + (i < opts.length - 1 ? "border-bottom:1px solid var(--qx-border);" : "") + "background:" + (isOn ? "var(--qx-main-color)" : "var(--qx-card-bg)") + ";color:" + (isOn ? "var(--qx-on-main)" : "var(--qx-text-color)") + ";";
    o.textContent = label + (isOn ? " ✓" : "");
    const pick = (ev) => { ev.stopPropagation(); closeSortMenu(); onPick(v); };
    o.onclick = pick;
    o.onkeydown = (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(ev); } };
    sortMenu.appendChild(o);
  });
  const onDocClick = (ev) => { if (!sortWrap.contains(ev.target)) closeSortMenu(); };
  const onDocKey = (ev) => { if (ev.key === "Escape") { closeSortMenu(); sortBtn.focus(); } };
  function closeSortMenu(){
    sortMenu.style.display = "none";
    sortBtn.classList.remove("on");
    sortBtn.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onDocKey);
  }
  function openSortMenu(){
    sortMenu.style.display = "block";
    // keep the menu fully inside the screen: right edge on the button, clamped to 8px from both screen sides
    const wr = sortWrap.getBoundingClientRect();
    const mw = sortMenu.offsetWidth;
    const left = Math.min(Math.max(wr.right - mw, 8), window.innerWidth - 8 - mw);
    sortMenu.style.left = (left - wr.left) + "px";
    sortBtn.classList.add("on");
    sortBtn.setAttribute("aria-expanded", "true");
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onDocKey);
  }
  sortBtn.onclick = (ev) => { ev.stopPropagation(); if (sortMenu.style.display === "block") closeSortMenu(); else openSortMenu(); };
  sortWrap.append(sortBtn, sortMenu);
  return sortWrap;
}
function qxSearchBox(value, placeholder, ariaLabel, onInput){
  const box = document.createElement("div");
  box.className = "qx-search";
  box.style.cssText = "width:100%;margin:0 0 10px 0;";
  const ic = document.createElement("span");
  ic.className = "qx-search-ic";
  ic.textContent = "{{search}}";
  const input = document.createElement("input");
  input.type = "search";
  input.autocomplete = "off";
  input.value = value;
  input.placeholder = placeholder;
  input.setAttribute("aria-label", ariaLabel);
  input.oninput = () => onInput(input.value);
  box.append(ic, input);
  return box;
}
// [PAGE: Topics] start
function renderTopics(){
  app.innerHTML = "";
  const sorted = qxSortTopics(QX_TOPICS.slice());
  const topicHead = document.createElement("div");
  topicHead.className = "bn";
  topicHead.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:2px 0 8px;text-align:center;";
  topicHead.textContent = "*প্রতিটা শব্দের সংখ্যা চূড়ান্ত হিসাব নয়।";
  app.appendChild(topicHead);
  // Sort — Grid/List-এর একই লাইনে, কাস্টম ড্রপডাউন (বাটন + মেনু)। নেটিভ <select> মোবাইলে ক্লিক না খাওয়ার কারণে বাদ দেওয়া।
  const topicHeading = qxListHeading(toBn(QX_TOPICS.length) + "টি বিষয়");
  const sortOpts = [["count","সংখ্যা অনুযায়ী"],["pair","জোড়া অনুযায়ী"],["bn","বাংলা বর্ণক্রম"],["imp","গুরুত্ব অনুযায়ী"]];
  const sortWrap = qxSortDropdown(sortOpts, qxTopicSort, v => { qxTopicSort = v; renderTopics(); }, "বিষয় সাজানো");
  // heading: [count] ........ [sort আইকন] [single view toggle] — sort ও toggle ডানে
  const toggleEl = topicHeading.querySelector(".qx-view-toggle");
  topicHeading.insertBefore(sortWrap, toggleEl);
  app.appendChild(topicHeading);
  // সার্চ বার: ইনপুট নতুন করে বানানো হয় না (বাংলা কিবোর্ডে টাইপ নষ্ট হয় না), শুধু তালিকা ছেঁকে দেখায়
  const qxTopicFilterApply = () => {
    const norm = (x) => String(x || "").replace(/[০-৯]/g, c => "০১২৩৪৫৬৭৮৯".indexOf(c)).replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/\s+/g, "").toLowerCase();
    const q = norm(qxTopicQ);
    let shown = 0;
    Array.from(grid.children).forEach((el, i) => {
      const row = sorted[i]; if (!row) return;
      const hit = !q || String(row.serial) === q || norm(row.t.bn).includes(q) || norm(row.t.ar).includes(q);
      el.style.display = hit ? "" : "none";
      if (hit) shown++;
    });
    topicEmpty.style.display = shown ? "none" : "";
  };
  const topicSearch = qxSearchBox(qxTopicQ, "বিষয়ের নাম, আরবি ধাতু বা নম্বর লিখুন…", "বিষয়ভিত্তিক আয়াতে খুঁজুন", v => { qxTopicQ = v; qxTopicFilterApply(); });
  app.appendChild(topicSearch);
  if (!QX_TOPICS.length) return msg("এখনো কোনো বিষয় যোগ হয়নি");
  const grid = qxListGrid();
  sorted.forEach(({ t, serial }) => {
    const topicItem = item(toBn(serial), t.bn, toBn(t.count) + " বার", t.ar, () => renderTopicDetail(t));
    topicItem.classList.add("surah-item");
    qxAddGridTag(topicItem, "বিষয়");
    const arabic = topicItem.querySelector(".ar-name");
    if (arabic) { arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); }
    grid.appendChild(topicItem);
  });
  app.appendChild(grid);
  const topicEmpty = document.createElement("div");
  topicEmpty.className = "msg";
  topicEmpty.textContent = "কিছু পাওয়া যায়নি";
  topicEmpty.style.display = "none";
  app.appendChild(topicEmpty);
  qxTopicFilterApply();
  const topicFoot = document.createElement("div");
  topicFoot.className = "bn";
  topicFoot.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:12px 0 0;text-align:center;";
  topicFoot.textContent = "উৎস: Quranic Arabic Corpus (corpus.quran.com) v0.4 | শব্দের ধাতু/Root ধরে গণনা";
  app.appendChild(topicFoot);
}
// [PAGE: Topics] end

let qxDictQ = "", qxDictFilter = "all";

/* ===== ১৫০ শব্দের অভিধান (শব্দার্থ ট্যাব ও "আরও" পেজ) =====
   ডেটা (QX_DICT150, QX_DICT150_CATS, QX_DICT150_SOURCE, QX_DICT150_MEANING_SRC) এখন data/dictionary.js-এ। নিচে শুধু UI কোড। */

let qxDict150Q = "", qxDict150Cat = 0;

function qxDict150Norm(s){
  return String(s || "").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[آأإٱ]/g, "ا").toLowerCase();
}
function qxDict150CountText(d){
  return (d[5] ? "≈" : "") + toBn(d[4]) + " বার";
}

/* "আরও" পেজ থেকে খোলা অভিধান পেজ (mode = "dict") */
// [PAGE: Dictionary (More page wrapper)] start
function renderDictPage(){
  showOther("{{abc}} শব্দার্থ");
  renderDict();
}
// [PAGE: Dictionary (More page wrapper)] end

// [PAGE: Dictionary (tab)] start
function renderDict(){
  app.innerHTML = "";
  const head = document.createElement("div");
  head.className = "bn";
  head.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:2px 0 8px;text-align:center;";
  head.textContent = "*প্রতিটা শব্দের সংখ্যা চূড়ান্ত হিসাব নয়।";
  app.appendChild(head);
  // ক্যাটাগরি চিপ এখন সর্ট ড্রপডাউনে — বিষয়ভিত্তিক ট্যাবের মতোই [সংখ্যা] [ড্রপডাউন] [গ্রিড/লিস্ট]
  const dictHeading = qxListHeading(toBn(QX_DICT150.length) + "টি শব্দ");
  const catOpts = [[0, "সব"]].concat(QX_DICT150_CATS.slice(1).map((n, i) => [i + 1, n]));
  const dictSort = qxSortDropdown(catOpts, qxDict150Cat, v => { qxDict150Cat = v; renderDict(); }, "শব্দের ধরন");
  dictHeading.insertBefore(dictSort, dictHeading.querySelector(".qx-view-toggle"));
  app.appendChild(dictHeading);
  app.appendChild(qxSearchBox(qxDict150Q, "বাংলা অর্থ, আরবি শব্দ বা নম্বর (১–" + toBn(QX_DICT150.length) + ") লেখো…", "শব্দার্থে খোঁজো", v => { qxDict150Q = v; renderDict150List(); }));
  const wrap = document.createElement("div"); wrap.id = "qx-dict150-list"; app.appendChild(wrap);
  renderDict150List();
  const pnote = document.createElement("div"); pnote.className = "bn qx-dict-note"; pnote.textContent = QX_DICT150_PRON_NOTE;
  app.appendChild(pnote);
  const foot = document.createElement("div");
  foot.className = "bn";
  foot.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:12px 0 0;text-align:center;";
  foot.textContent = "উৎস: " + QX_DICT150_SOURCE + (QX_DICT150_MEANING_SRC ? " | বাংলা অর্থ: " + QX_DICT150_MEANING_SRC : "");
  app.appendChild(foot);
}
// [PAGE: Dictionary (tab)] end

function qxDict150Plain(s){
  return String(s || "").replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[آأإٱ]/g, "ا");
}
function qxDict150PronNorm(s){
  return String(s || "").replace(/[\s\-\u2010-\u2015]/g, "").toLowerCase();
}

// [PAGE: Dictionary List] start
function renderDict150List(){
  const wrap = document.getElementById("qx-dict150-list"); if (!wrap) return;
  const qRaw = qxDict150Q.trim();
  const qBn = qRaw.replace(/[০-৯]/g, ch => "০১২৩৪৫৬৭৮৯".indexOf(ch));
  const qAr = qxDict150Norm(qRaw);
  const qPron = qxDict150PronNorm(qRaw);
  let list = QX_DICT150.map((d, i) => ({ d, rank: i + 1 }));
  if (qxDict150Cat) list = list.filter(x => x.d[0] === qxDict150Cat);
  if (qRaw) {
    if (/^\d+$/.test(qBn)) {
      const n = +qBn;
      list = list.filter(x => x.rank === n);
    } else {
      const ql = qRaw.toLowerCase();
      list = list.filter(x => x.d[2].toLowerCase().includes(ql)
        || qxDict150Norm(x.d[1]).includes(qAr)
        || (x.d[3] && qxDict150Norm(x.d[3]).includes(qAr))
        || (qPron && x.d[6] && qxDict150PronNorm(x.d[6]).includes(qPron)));
    }
  }
  wrap.innerHTML = "";
  const grid = qxListGrid();
  list.forEach(({ d, rank }) => {
    const sub = (d[6] ? "উচ্চারণ : " + d[6] + " · " : "") + QX_DICT150_CATS[d[0]] + " · " + qxDict150CountText(d);
    const it = item(toBn(rank), "শব্দার্থ : " + d[2], sub, d[1], () => renderDict150Detail(d, rank));
    it.classList.add("surah-item");
    qxAddGridTag(it, "শব্দার্থ");
    const arabic = it.querySelector(".ar-name");
    if (arabic) { arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); }
    grid.appendChild(it);
  });
  wrap.appendChild(grid);
  if (!list.length) wrap.appendChild(msg("কিছু পাওয়া যায়নি"));
}
// [PAGE: Dictionary List] end

/* উদাহরণ: আয়াতের আরবি ও অনুবাদ অ্যাপের নিজের ডেটা (window.QURAN) থেকে আসে; ডেটা ফাইলে শুধু রেফারেন্স, শব্দের ক্রম ও শব্দটা থাকে */
function qxDict150AyahData(ref){
  const p = String(ref).split(":"), s = +p[0], a = +p[1];
  const ok = s > 0 && a > 0 && LOCAL && LOCAL.ar && LOCAL.ar[s - 1] && LOCAL.ar[s - 1][a - 1];
  if (!ok) return { s, a, ar: "", bn: "" };
  return { s, a, ar: LOCAL.ar[s - 1][a - 1], bn: (LOCAL.bn && LOCAL.bn[s - 1] && LOCAL.bn[s - 1][a - 1]) || "" };
}
function qxDict150AyahNode(ex){
  const ref = ex[0], pos = ex[1], word = ex[2];
  const x = qxDict150AyahData(ref);
  const card = document.createElement("div"); card.className = "ayah qx-sec-card qx-dict-ex-card";
  const nm = (window.QX_BN_SURAH && window.QX_BN_SURAH[x.s - 1]) || ("সূরা " + toBn(x.s));
  const link = document.createElement("button"); link.type = "button"; link.className = "qx-dict-ref";
  link.textContent = nm + " · আয়াত " + toBn(x.a) + " {{chevron_right}}";
  link.onclick = () => openSurah(x.s, 0, x.a);
  card.appendChild(link);
  if (x.ar) {
    const ar = document.createElement("div"); ar.className = "ar";
    ar.setAttribute("lang", "ar"); ar.setAttribute("dir", "rtl");
    const tokens = x.ar.split(/\s+/).filter(Boolean);
    /* কিছু সূরার ১ম আয়াতের আগে বিসমিল্লাহ থাকলে সেটা শব্দ গণনায় ধরা হয় না */
    let skip = 0;
    if (x.a === 1 && x.s !== 1 && x.s !== 9 && tokens.slice(0, 4).map(qxDict150Plain).join(" ") === "بسم الله الرحمن الرحيم") skip = 4;
    const target = qxDict150Plain(word);
    let n = 0;
    tokens.forEach((t, i) => {
      const plain = qxDict150Plain(t);
      if (i >= skip && plain !== "") n++;
      if (i >= skip && plain !== "" && n === pos && plain === target) {
        const hl = document.createElement("span"); hl.className = "qx-dict-hl"; hl.textContent = t;
        ar.appendChild(hl);
      } else {
        ar.appendChild(document.createTextNode(t));
      }
      ar.appendChild(document.createTextNode(" "));
    });
    card.appendChild(ar);
  }
  if (x.bn) {
    const bn = document.createElement("div"); bn.className = "bn"; bn.textContent = x.bn;
    card.appendChild(bn);
  }
  return card;
}

// [PAGE: Dictionary Detail] start
function renderDict150Detail(d, rank){
  qxNav.pushMode(); showOther(d[2]);
  const back = document.createElement("button");
  back.type = "button"; back.className = "qx-back-link"; back.textContent = "{{chevron_left}} সব শব্দ";
  back.onclick = () => { if (qxNav.modePushed) history.back(); else renderHome(); };
  app.appendChild(back);
  const card = document.createElement("div"); card.className = "ayah qx-sec-card qx-dict-detail";
  const arabic = document.createElement("div"); arabic.className = "ar";
  arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); arabic.textContent = d[1];
  const info = document.createElement("div"); info.className = "bn";
  const b = document.createElement("b"); b.textContent = "শব্দার্থ : " + d[2];
  info.appendChild(b);
  if (d[6]) {
    const pr = document.createElement("div"); pr.className = "qx-dict-line"; pr.textContent = "উচ্চারণ : " + d[6];
    info.appendChild(pr);
  }
  /* ধাতু না থাকলে কিছু লেখা হয় না, কিন্তু লাইনের জায়গা ফাঁকা থাকে (\u00A0) */
  const root = document.createElement("div"); root.className = "bn qx-dict-line";
  root.textContent = d[3] ? "ধাতু: " + d[3].split("").join(" ") : "\u00A0";
  const meta = document.createElement("div"); meta.className = "bn qx-dict-line";
  meta.textContent = "শব্দ #" + toBn(rank) + " · " + QX_DICT150_CATS[d[0]] + " · কুরআনে " + qxDict150CountText(d) + " এসেছে";
  card.append(arabic, info, root, meta); app.appendChild(card);
  const note = document.createElement("div"); note.className = "bn qx-dict-note"; note.textContent = QX_DICT150_PRON_NOTE;
  app.appendChild(note);
  if (d[7] && d[7].length) {
    const title = document.createElement("div"); title.className = "bn qx-dict-ex-title";
    title.textContent = "উদাহরণ (" + toBn(d[7].length) + "টি আয়াত)";
    app.appendChild(title);
    d[7].forEach(ex => app.appendChild(qxDict150AyahNode(ex)));
  }
}
// [PAGE: Dictionary Detail] end


// [PAGE: Topic Detail] start
function renderTopicDetail(t){
  window.qxTopicOpen = t;
  qxNav.pushMode();
  showOther(t.bn);
  const back = document.createElement("button");
  back.type = "button";
  back.className = "qx-back-link";
  back.textContent = "{{chevron_left}} সব বিষয়";
  back.onclick = () => { if (qxNav.modePushed) history.back(); else { window.qxTopicOpen = null; renderHome(); } };
  app.appendChild(back);
  const card = document.createElement("div");
  card.className = "ayah qx-sec-card";
  const arabic = document.createElement("div");
  arabic.className = "ar";
  arabic.setAttribute("lang", "ar");
  arabic.setAttribute("dir", "rtl");
  arabic.textContent = t.ar;
  const info = document.createElement("div");
  info.className = "bn";
  info.textContent = toBn(t.count) + " বার এসেছে · " + toBn(t.ayahs.length) + "টি আয়াতের তালিকা";
  card.append(arabic, info);
  app.appendChild(card);
  const grid = qxListGrid();
  t.ayahs.forEach(([sn, an]) => {
    const name = (window.QX_BN_SURAH && window.QX_BN_SURAH[sn - 1]) || ("সূরা " + toBn(sn));
    const ayahItem = item(toBn(an), name + " · আয়াত " + toBn(an), "সূরা " + toBn(sn) + ":" + toBn(an), "", () => openSurah(sn, 0, an));
    ayahItem.classList.add("surah-item");
    qxAddGridTag(ayahItem, "আয়াত");
    grid.appendChild(ayahItem);
  });
  app.appendChild(grid);
}
// [PAGE: Topic Detail] end

// [PAGE: Quran Home] start
function renderQuranHome(){
  if(typeof window.qxInvalidateReaderRender === "function") window.qxInvalidateReaderRender();
  window.qxTopicOpen = null;
  document.body.classList.remove("inside-page");
  titleEl.textContent = "Quranix";
  navEl.style.display = "flex";
  updateAudioBarPos();
  backBtn.style.display = "none";
  document.body.classList.remove("reader-active");
  /* Search controls must stay hidden on the page and appear only from the header search button. */
  controls.style.display = controls.classList.contains("open") ? "flex" : "none";
  qEl.style.display = (tab === "juz" || tab === "topic" || tab === "dict" || tab === "bm") ? "none" : "block";
  app.innerHTML = "";
  if (tab === "bm") { tab = "all"; return setMode("saved"); }
  if (tab === "home") return;   /* home = tiles + label row only (built by buildHero) */
  const qVal = qEl.value.trim();
  /* home top boxes are built by buildHero() (4 square tiles) */
  if (last && tab !== "juz" && tab !== "all") {
    const sn = last.t === "s" ? surahs.find(x => x.number === last.n) : null;
    const nm = last.t === "s" ? (sn ? sn.englishName : "সূরা " + last.n) : "পারা " + toBn(last.n);
    const r = document.createElement("div"); r.className = "resume"; r.textContent = "শেষ পড়া: " + nm + " — চালিয়ে যান";
    r.onclick = () => last.t === "s" ? openSurah(last.n, last.y) : openJuz(last.n, last.y);
    app.appendChild(r);
  }
  if (tab === "juz") {
    app.appendChild(qxListHeading(toBn(30) + "টি পারা"));
    const juzGrid = qxListGrid();
    for (let i = 1; i <= 30; i++) {
      const juzItem = item(i, "পারা " + toBn(i), "Juz " + i, "", () => openJuz(i));
      juzItem.classList.add("surah-item");
      qxAddGridTag(juzItem, "পারা");
      juzGrid.appendChild(juzItem);
    }
    app.appendChild(juzGrid);
    return;
  }
  if (tab === "topic") return renderTopics();
  if (tab === "dict") return renderDict();
  const q = qEl.value.trim().toLowerCase();
  let list = surahs.filter(s => tab === "all" || s.revelationType === tab);
  if (q) list = list.filter(s => String(s.number) === q || s.englishName.toLowerCase().includes(q) || s.englishNameTranslation.toLowerCase().includes(q) || s.name.includes(q));
  if (!list.length) return msg("কিছু পাওয়া যায়নি");

  app.appendChild(qxListHeading(toBn(list.length) + "টি সূরা"));

  const surahGrid = qxListGrid();
  list.forEach(s => {
    const type = s.revelationType === "Meccan" ? "মাক্কী" : "মাদানী";
    const surahItem = item(s.number, s.englishName, s.englishNameTranslation, s.name, () => openSurah(s.number));
    surahItem.classList.add("surah-item");
    // Task 07: remove the Surah-specific grid label; retain the revelation and ayah metadata.
    surahItem.setAttribute("role", "button");
    surahItem.setAttribute("tabindex", "0");
    surahItem.setAttribute("aria-label", "সূরা " + toBn(s.number) + ": " + s.englishName + ", " + s.englishNameTranslation + ", " + type + ", আয়াত " + toBn(s.numberOfAyahs));
    const number = surahItem.querySelector(".num");
    if (number) number.textContent = toBn(s.number);
    const meta = document.createElement("div");
    meta.className = "surah-meta";
    const meaning = document.createElement("span");
    meaning.className = "surah-meaning";
    meaning.textContent = s.englishNameTranslation;
    const revelation = document.createElement("span");
    revelation.className = "surah-revelation";
    revelation.textContent = type;
    const ayahs = document.createElement("span");
    ayahs.className = "surah-ayah-count";
    ayahs.textContent = toBn(s.numberOfAyahs) + " আয়াত";
    meta.append(meaning, revelation, ayahs);
    const oldSmall = surahItem.querySelector(".mid small");
    if (oldSmall) oldSmall.replaceWith(meta);
    const arabic = surahItem.querySelector(".ar-name");
    if (arabic) { arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); arabic.setAttribute("aria-hidden", "true"); }
    surahItem.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSurah(s.number);
      }
    });
    surahGrid.appendChild(surahItem);
  });
  app.appendChild(surahGrid);
}
// [PAGE: Quran Home] end

function item(n, name, sub, arName, onClick){
  const d = document.createElement("div"); d.className = "item";
  const num = document.createElement("div"); num.className = "num"; num.textContent = n;
  const mid = document.createElement("div"); mid.className = "mid";
  const b = document.createElement("b"); b.textContent = name;
  const sm = document.createElement("small"); sm.textContent = sub;
  mid.appendChild(b); mid.appendChild(sm);
  d.appendChild(num); d.appendChild(mid);
  if (arName) { const a = document.createElement("div"); a.className = "ar-name"; a.textContent = arName; d.appendChild(a); }
  d.onclick = onClick;
  return d;
}

function showToast(msg){
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

document.addEventListener("click", () => document.querySelectorAll(".ayah-menu.open").forEach(m => { m.classList.remove("open", "open-up", "align-left"); const trigger=m.parentElement && m.parentElement.querySelector(".more-btn"); if(trigger) trigger.setAttribute("aria-expanded", "false"); }));
// [SHEET: Today] start
function openTodaySheet(){
  const ov = document.createElement("div"); ov.className = "sheet-ov";
  const box = document.createElement("div"); box.className = "sheet-box";
  const head = document.createElement("div"); head.className = "sheet-head";
  const t = document.createElement("span"); t.textContent = "আজকের আয়াত ও লক্ষ্য";
  const x = document.createElement("button"); x.textContent = "{{close}}";
  const close = (refresh) => { ov.remove(); if (refresh && mode === "quran") renderHome(); };
  x.onclick = () => close(true);
  ov.onclick = (e) => { if (e.target === ov) close(true); };
  head.appendChild(t); head.appendChild(x);
  box.appendChild(head); box.appendChild(buildAotdCard()); box.appendChild(buildGoalCard());
  box.addEventListener("click", (e) => { if (e.target.closest(".aotd-link")) close(false); });
  ov.appendChild(box); document.body.appendChild(ov);
}
// [SHEET: Today] end
function ayahCard(label, ar, bn, a, removable){
  const d = document.createElement("div"); d.className = "ayah";
  d.tabIndex = -1;
  d.setAttribute("aria-label", label + "। আয়াতের বিষয়বস্তু");
  if (a) d.dataset.key = bmKey(a);
  const no = document.createElement("div"); no.className = "no";
  const l = document.createElement("span"); l.className = "ayah-number"; l.textContent = label; no.appendChild(l);

  const actions = document.createElement("div");
  actions.className = "ayah-actions";
  const menuItems = [];
  // Dropdown order = how often people need it (lower rank first). Items added elsewhere (hifz) default to rank 50.
  const addMenu = (rank, lbl, fn, cond) => { const it = [lbl, fn, cond]; it.rank = rank; menuItems.push(it); };
  // Saved (star) button: created below inside `if (a)`; the menu item uses it, so it lives here.
  let st = null;

  const copyBtn = document.createElement("button");
  copyBtn.className = "icon-btn";
  copyBtn.title = "আয়াত কপি করুন";
  copyBtn.textContent = "{{content_copy}}";
  copyBtn.onclick = () => {
    const text = `[${label}]\n${ar}\n\n${bn}\n— Quranix`;
    copyText(text, "আয়াত ক্লিপবোর্ডে কপি হয়েছে!");
  };
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.setAttribute("aria-label", "আয়াত শেয়ার করুন");
  shareBtn.className = "icon-btn";
  shareBtn.title = "আয়াত শেয়ার করুন";
  shareBtn.textContent = "{{share}}";
  shareBtn.onclick = async () => {
    const text = `[${label}]\n${ar}\n\n${bn}\n— Quranix`;
    await shareTextOrCopy(text, label, "শেয়ার করা যায়নি, টেক্সট কপি করা হয়েছে!");
  };
  addMenu(10, () => "{{share}} শেয়ার করুন", () => shareBtn.onclick());
  addMenu(20, () => "{{image}} ছবি বানাও", () => { if(window.openAyahCard) window.openAyahCard(label, ar, bn); });
  addMenu(30, () => "{{star}} Favorite-এ Add", () => st.onclick(), () => !!st);
  addMenu(40, () => "{{content_copy}} কপি করুন", () => copyBtn.onclick());

  if (a) {
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.setAttribute("aria-label", "এই আয়াতের তেলাওয়াত শুনুন");
    playBtn.className = "icon-btn ayah-play-btn";
    playBtn.dataset.s = a.s.number; playBtn.dataset.a = a.no;
    const cur0 = currentPlayIdx >= 0 ? currentPlaylist[currentPlayIdx] : null;
    const mine0 = !!cur0 && cur0.s.number === a.s.number && cur0.no === a.no;
    const playing0 = mine0 && !audioObj.paused;
    playBtn.dataset.state = playing0 ? "pause" : "play_arrow";
    playBtn.title = playing0 ? "বিরতি দিন" : "তেলাওয়াত শুনুন";
    playBtn.setAttribute("aria-label", playBtn.title);
    playBtn.classList.toggle("on", mine0);
    playBtn.textContent = playing0 ? "{{pause}}" : "{{play_arrow}}";
    playBtn.onclick = () => {
      const cur = currentPlayIdx >= 0 ? currentPlaylist[currentPlayIdx] : null;
      if (cur && cur.s.number === a.s.number && cur.no === a.no && audioObj.src) {
        // Same ayah: toggle pause / resume instead of restarting
        if (audioObj.paused) audioObj.play().catch(() => {}); else audioObj.pause();
        return;
      }
      const list = window._activeAyahList && window._activeAyahList.length ? window._activeAyahList : [a];
      playAyahFromList(list, a.s.number, a.no);
    };

    const tafseerBtn = document.createElement("button");
    tafseerBtn.type = "button";
    tafseerBtn.setAttribute("aria-label", "তাফসির দেখুন");
    tafseerBtn.className = "icon-btn";
    tafseerBtn.title = "তাফসির দেখুন";
    tafseerBtn.textContent = "{{menu_book}}";
    tafseerBtn.onclick = () => {
      openTafseer(a.s.number, a.no, label);
    };

    const k = bmKey(a);
    const isRead = goalData.readKeys.includes(k);
    if (isRead) d.classList.add("read-done");

    const readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.setAttribute("aria-label", "পঠিত হিসেবে চিহ্নিত করুন");
    readBtn.className = "icon-btn";
    readBtn.title = "পঠিত হিসেবে চিহ্নিত করুন";
    readBtn.textContent = isRead ? "{{check_circle:f}}" : "{{radio_button_unchecked}}";
    readBtn.onclick = () => {
      const nowRead = toggleReadAyah(k);
      readBtn.textContent = nowRead ? "{{check_circle:f}}" : "{{radio_button_unchecked}}";
      d.classList.toggle("read-done", nowRead);
      showToast(nowRead ? `পঠিত চিহ্নিত (${toBn(goalData.readKeys.length)}/${toBn(goalData.target)})` : "পঠিত চিহ্ন সরানো হয়েছে");
    };
        const noteBtn = document.createElement("button");
    noteBtn.className = "icon-btn";
    noteBtn.title = "ব্যক্তিগত নোট লিখুন";
    noteBtn.textContent = ayahNotes[k] ? "{{edit_note}}" : "{{edit}}";
            st = document.createElement("button"); st.type = "button"; st.setAttribute("aria-label", "সংরক্ষিত আয়াত"); st.className = "star";
    st.textContent = savedHas("quran", k) ? "{{star:f}}" : "{{star}}";
    st.onclick = () => { const on = savedToggle("quran", k); st.textContent = on ? "{{star:f}}" : "{{star}}"; showToast(on ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ সরানো হয়েছে"); if (removable && !on) d.remove(); };
  const hifzOn = () => document.body.classList.contains("hifz-on") && !!d._hifz;
        const renderNoteEl = (txt) => {
      const oldBox = d.querySelector(".note-box");
      if (oldBox) oldBox.remove();
      noteBtn.textContent = txt ? "{{edit_note}}" : "{{edit}}";
      if (txt) {
        const nb = document.createElement("div");
        nb.className = "note-box";
        const nh = document.createElement("div");
        nh.className = "note-box-head";
        nh.textContent = "{{push_pin}} ব্যক্তিগত নোট";
        const nt = document.createElement("div");
        nt.textContent = txt;
        nb.appendChild(nh);
        nb.appendChild(nt);
        nb.onclick = () => openNoteEditor(a.s.number, a.no, label, renderNoteEl);
        d.appendChild(nb);
      }
    };
    noteBtn.onclick = () => openNoteEditor(a.s.number, a.no, label, renderNoteEl);
    if (ayahNotes[k]) setTimeout(() => renderNoteEl(ayahNotes[k]), 0);
    // Quick row order: audio, saved, copy, tafsir, then the ⋯ menu
    actions.appendChild(playBtn); actions.appendChild(st); actions.appendChild(copyBtn); actions.appendChild(tafseerBtn);
  }
  if (a && window.qxHifzMenuItems) window.qxHifzMenuItems(d, menuItems);
  menuItems.sort((x, y) => (x.rank == null ? 50 : x.rank) - (y.rank == null ? 50 : y.rank));
  if (menuItems.length) {
    const more = document.createElement("button"); more.type = "button"; more.setAttribute("aria-label", "আয়াতের আরও বিকল্প"); more.setAttribute("aria-haspopup", "menu"); more.setAttribute("aria-expanded", "false"); more.className = "more-btn"; more.title = "আরও"; more.textContent = "{{more_horiz}}";
    const menu = document.createElement("div"); menu.className = "ayah-menu"; menu.setAttribute("role", "menu");
    const closeMenu = (restoreFocus) => { menu.classList.remove("open", "open-up", "align-left"); more.setAttribute("aria-expanded", "false"); if (restoreFocus) more.focus(); };
    more.onclick = (e) => {
      e.stopPropagation();
      const wasOpen = menu.classList.contains("open");
      document.querySelectorAll(".ayah-menu.open").forEach(m => { m.classList.remove("open", "open-up", "align-left"); const trigger=m.parentElement && m.parentElement.querySelector(".more-btn"); if(trigger) trigger.setAttribute("aria-expanded", "false"); });
      if (wasOpen) return;
      menu.innerHTML = "";
      menuItems.filter(m => !m[2] || m[2]()).forEach(([lbl, fn]) => {
        const it = document.createElement("button"); it.type = "button"; it.setAttribute("role", "menuitem"); it.textContent = lbl();
        it.onclick = (ev) => { ev.stopPropagation(); closeMenu(false); fn(); };
        menu.appendChild(it);
      });
      menu.classList.add("open"); more.setAttribute("aria-expanded", "true");
      const rect=more.getBoundingClientRect();
      if (rect.right > window.innerWidth - 12) menu.classList.add("align-left");
      if (rect.bottom + Math.min(menu.scrollHeight, 320) > window.innerHeight - 12 && rect.top > window.innerHeight / 2) menu.classList.add("open-up");
      const first=menu.querySelector("button"); if(first) first.focus();
    };
    more.addEventListener("keydown", (e) => { if(e.key === "ArrowDown" && !menu.classList.contains("open")){ e.preventDefault(); more.click(); } });
    menu.addEventListener("keydown", (e) => {
      const items=Array.from(menu.querySelectorAll("button[role=menuitem]")); const i=items.indexOf(document.activeElement);
      if(e.key === "Escape"){ e.preventDefault(); closeMenu(true); }
      else if(e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); if(items.length) items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus(); }
      else if(e.key === "Home" || e.key === "End"){ e.preventDefault(); if(items.length) items[e.key === "Home" ? 0 : items.length-1].focus(); }
    });
    actions.appendChild(more); actions.appendChild(menu);
  }
  no.appendChild(actions);

  const ar_ = document.createElement("div"); ar_.className = "ar"; ar_.dataset.raw = ar; if(a){ ar_.dataset.surah = a.s.number; ar_.dataset.ayah = a.no; } if(window.renderAyahArabic){ ar_.innerHTML = window.renderAyahArabic(ar, a?a.s.number:0, a?a.no:0); } else { ar_.textContent = ar; }
  const b = document.createElement("div"); b.className = "bn"; b.textContent = bn;
  d.appendChild(no); d.appendChild(ar_); d.appendChild(b);
  // Ayah-card click no longer opens Tafsir; Tafsir remains available in the ... menu.
  return d;
}

// Prevent slower previous reader requests from replacing the page the user opened most recently.
let readerRenderToken = 0;
window.qxInvalidateReaderRender = function(){
  saveScroll();
  readerRenderToken++;
  reading = null;
  qxReaderUserScrolled = false;
  qxReaderSessionAutoScroll = false;
};

// [PAGE: Reader shell] start
function showReader(title){
  document.body.classList.add("reader-active");
  titleEl.textContent = title;
  navEl.style.display = "none";
  updateAudioBarPos();
  backBtn.style.display = "inline-block";
  controls.style.display = "none";
  qEl.style.display = "none";
  window.scrollTo(0,0);
}
// [PAGE: Reader shell] end

// [PAGE: Surah Reader] start
async function openSurah(n, y, targetAyah){
  const renderToken = ++readerRenderToken;
  qxReaderUserScrolled = false;
  qxReaderSessionAutoScroll = !targetAyah;
  reading = last = {t:"s", n, y:0}; lsSet("last", last);
  const s = surahs.find(x => x.number === n);
  showReader(s ? s.englishName : "সূরা " + n);
  msg("লোড হচ্ছে…");
  try {
    const ayahs = await loadSurahAyahs(n);
    const bism = await loadBismillah();
    if (renderToken !== readerRenderToken) return;
    app.innerHTML = "";

    // পূর্ণ সূরার অডিও প্লেয়ার শুধু Grid Menu-এর Full Audio Quran আইটেম থেকে খোলা যাবে।
    const surahHeader = document.createElement("div");
    const revelation = String(s && (s.revelationType || s.type) || "").toLowerCase();
    const isMadani = revelation.indexOf("mad") >= 0 || revelation.indexOf("med") >= 0;
    surahHeader.className = "sh qx-surah-header qx-surah-banner " + (isMadani ? "madani" : "makki");
    const surahHeaderText = document.createElement("div");
    surahHeaderText.className = "qx-surah-banner-text";
    const surahHeaderName = document.createElement("span");
    surahHeaderName.className = "qx-surah-header-name";
    surahHeaderName.textContent = (s ? s.name : "সূরা " + n);
    const surahHeaderSub = document.createElement("small");
    surahHeaderSub.className = "qx-surah-banner-sub";
    surahHeaderSub.textContent = (s && s.englishNameTranslation ? s.englishNameTranslation + " · " : "") + (s && s.englishName ? s.englishName : "") + " · " + (isMadani ? "মাদানী" : "মাক্কী");
    surahHeaderText.appendChild(surahHeaderName);
    surahHeaderText.appendChild(surahHeaderSub);
    surahHeader.appendChild(surahHeaderText);
    app.appendChild(surahHeader);

    if (n !== 1 && n !== 9) {
      const b = document.createElement("div"); b.className = "bism"; b.textContent = bism;
      app.appendChild(b);
    }
    window._activeAyahList = ayahs;
    ayahs.forEach(a => app.appendChild(ayahCard("আয়াত " + toBn(a.no), cleanText(a), a.bn, a)));
    if (targetAyah) {
      qxReaderUserScrolled = true; // Explicit navigation: don't later override the user's target.
      qxReaderSessionAutoScroll = false;
      const targetCard = document.querySelector(`.ayah[data-key="${n}:${targetAyah}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "auto", block: "center" });
        targetCard.style.transition = "box-shadow 0.4s ease";
        targetCard.style.boxShadow = "0 0 0 2px var(--qx-main-color)";
        setTimeout(() => { targetCard.style.boxShadow = ""; }, 2200);
      }
    } else if (y) {
      // An explicit resume position takes priority over the currently playing ayah.
      restoreReaderScroll(y, renderToken);
    } else if (currentPlayIdx >= 0 && currentPlaylist[currentPlayIdx]) {
      highlightPlayingCard(currentPlaylist[currentPlayIdx].s.number, currentPlaylist[currentPlayIdx].no);
    }
    requestAnimationFrame(updateReaderProgress);
  } catch(e) {
    if (renderToken === readerRenderToken) msg("লোড করা যায়নি। ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
  }
}
// [PAGE: Surah Reader] end

// [PAGE: Juz Reader] start
async function openJuz(n, y){
  const renderToken = ++readerRenderToken;
  qxReaderUserScrolled = false;
  qxReaderSessionAutoScroll = true;
  reading = last = {t:"j", n, y:0}; lsSet("last", last);
  showReader("পারা " + toBn(n));
  msg("লোড হচ্ছে…");
  try {
    const ayahs = await loadJuzAyahs(n);
    if (renderToken !== readerRenderToken) return;
    app.innerHTML = "";
    let cur = null;
    window._activeAyahList = ayahs;
    ayahs.forEach(a => {
      if (a.s.number !== cur) {
        cur = a.s.number;
        const h = document.createElement("div"); h.className = "sh";
        h.textContent = a.s.englishName + " · " + a.s.name;
        app.appendChild(h);
      }
      app.appendChild(ayahCard(a.s.englishName + " · আয়াত " + toBn(a.no), cleanText(a), a.bn, a));
    });
    if (y) restoreReaderScroll(y, renderToken);
    requestAnimationFrame(updateReaderProgress);
  } catch(e) {
    if (renderToken === readerRenderToken) msg("লোড করা যায়নি। ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
  }
}
// [PAGE: Juz Reader] end

// Phase 7 v2.0.31 — Download + Offline + Cache helpers
function qxP7DownloadHelpers(){
  // Offline badge: online/offline status
  function updateOfflineBadge(){
    const badge = document.querySelector('.offline-badge');
    if(!badge) return;
    const online = navigator.onLine;
    badge.classList.toggle('offline', !online);
    badge.innerHTML = '<span class="ms" data-nosnippet>' + (online ? 'wifi' : 'wifi_off') + '</span>' + (online ? 'অনলাইন' : 'অফলাইন — সংরক্ষিত');
  }
  window.addEventListener('online', updateOfflineBadge);
  window.addEventListener('offline', updateOfflineBadge);
  setTimeout(updateOfflineBadge, 500);
  // Download retry: if package failed, allow retry via existing runPackage
  document.addEventListener('click', (e) => {
    const retryBtn = e.target.closest('[data-qx-retry-package]');
    if(retryBtn){
      const type = retryBtn.dataset.qxRetryPackage;
      const id = retryBtn.dataset.qxRetryId;
      const label = retryBtn.dataset.qxRetryLabel || '';
      if(typeof runPackage === 'function') runPackage(type, id, label);
    }
    const cancelBtn = e.target.closest('[data-qx-cancel-package]');
    if(cancelBtn){
      const jobKey = cancelBtn.dataset.qxCancelPackage;
      // Cancel via jobPause / job cancel if available
      try{
        if(window._activeDownloadJobs && window._activeDownloadJobs[jobKey]){
          window._activeDownloadJobs[jobKey].cancelled = true;
        }
      }catch(err){}
    }
  });
  // Cache status: show sw.js version
  try{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistration().then(reg => {
        const el = document.querySelector('.cache-status-version');
        if(el && reg) el.textContent = 'Cache: ' + (reg.active ? 'সক্রিয়' : 'প্রস্তুত');
      });
    }
  }catch(e){}
}
try{ qxP7DownloadHelpers(); }catch(e){}

