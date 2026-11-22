tem">• ' + x + '</div>').join('') + '</div>').join('') +
    '<div class="src-note">তৃতীয় পক্ষের ডেটাসেটে ভুল বা অসম্পূর্ণতা থাকতে পারে। ধর্মীয় সিদ্ধান্তের আগে মূল গ্রন্থ বা যোগ্য আলেমের কাছে যাচাই করুন।</div>';
};
// Slugs come from the spa5k/tafsir_api edition list (ids 381 and 164 are Quran.com resource ids).
// First item is the default tafsir; its package is installed offline automatically.
const TAFSIRS = [[381,"তাফসির ফাতহুল মাজীদ","bn-tafisr-fathul-majid"],[164,"তাফসির ইবনে কাসীর","bn-tafseer-ibn-e-kaseer"]];
const TAFSIR_CDN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@v1.2.3/tafsir/";
// Fallback when the pinned release does not contain an edition.
const TAFSIR_CDN_MAIN = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/";
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
      const copied = window.prompt("স্বয়ংক্রিয়ভাবে কপি করা যায়নি। নিচের লেখাটি ম্যানুয়ালি কপি করুন:", String(text));
      if (copied !== null) {
        notify("টেক্সটটি নির্বাচন করে কপি করুন।");
        return true;
      }
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
  
  const body = document.createElement("div"); body.className = "tafseer-body";
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
let tab = "home";
let fs = 30;
try { fs = parseInt(localStorage.getItem("fs")) || 30; } catch(e){}
document.documentElement.style.setProperty("--qx-fs-ar", fs + "px");

const TABS = [["all","সব সূরা"],["Meccan","মাক্কী"],["Medinan","মাদানী"],["juz","পারা"],["topic","বিষয়ভিত্তিক আয়াত"],["dict","অভিধান"],["bm","সংরক্ষিত"]];

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
  if (d && Array.isArray(d.bm)) return { items: d.bm.map(k => ({ c: "quran", id: k, f: null, ts: Date.no