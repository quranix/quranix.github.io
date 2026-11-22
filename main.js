
(function(){
  var theme = "dark";
  try { theme = localStorage.getItem("theme") === "light" ? "light" : "dark"; } catch(e) {}
  document.documentElement.setAttribute("data-theme", theme);
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


// Logo + "Quranix" title tap -> Home (home = 4 tiles + label row). Not used inside reader/other pages (they have their own back button).
(function(){
  function goHome(){
    try{
      tab='home'; if(qEl) qEl.value='';
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


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


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


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


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
      var i=document.createElement('span'); i.className='ms'+(m[2]?' f':''); i.setAttribute('aria-hidden','true'); i.textContent=m[1]; f.appendChild(i);
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


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


const LOCAL = window.QURAN || null;
const API = "https://api.alquran.cloud/v1";

/* --- অডিও স্পিড কন্ট্রোল --- */
const SPEEDS = [1, 1.25, 1.5, 0.75];
let audioSpeedIdx = lsGet("audioSpeedIdx", 0);
const audioSpeedBtn = document.getElementById("audioSpeed");
if (audioSpeedBtn) {
  audioSpeedBtn.textContent = SPEEDS[audioSpeedIdx] + "x";
  audioSpeedBtn.onclick = () => {
    audioSpeedIdx = (audioSpeedIdx + 1) % SPEEDS.length;
    lsSet("audioSpeedIdx", audioSpeedIdx);
    const rate = SPEEDS[audioSpeedIdx];
    audioObj.playbackRate = rate;
    audioSpeedBtn.textContent = rate + "x";
    showToast("তেলাওয়াতের গতি: " + rate + "x");
  };
}

/* --- ব্যক্তিগত আয়াত নোট (Personal Notes) --- */
let ayahNotes = lsGet("notes", {});
function saveAyahNote(k, text){
  const trimmed = text.trim();
  if (trimmed) ayahNotes[k] = trimmed;
  else delete ayahNotes[k];
  lsSet("notes", ayahNotes);
}

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
    const val = prompt("প্রতিদিন কয়টি আয়াত পড়ার লক্ষ্য রাখতে চান? (যেমন: ১০, ২০, ৫০)", String(target));
    const num = parseInt(val, 10);
    if (num && num > 0 && num <= 6236) {
      goalData.target = num;
      lsSet("goal", goalData);
      box.replaceWith(buildGoalCard());
      showToast("দৈনিক লক্ষ্য আপডেট হয়েছে: " + toBn(num) + " আয়াত");
    }
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

/* --- দ্রুত সূরা ও আয়াত নেভিগেশন (Quick Jump) --- */
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
const audioObj = new Audio();
const audioBar = document.getElementById("audioBar");
const audioTitle = document.getElementById("audioTitle");
const audioReciterLabel = document.getElementById("audioReciterLabel");
const audioPlayPause = document.getElementById("audioPlayPause");
const audioAuto = document.getElementById("audioAuto");

function pad3(n){ return String(n).padStart(3, "0"); }
function getReciterName(id){ const f = RECITERS.find(r => r[0] === id); return f ? f[1] : RECITERS[0][1]; }

function updateAudioBarPos(){
  const navVisible = navEl && navEl.style.display !== "none";
  audioBar.classList.toggle("with-nav", navVisible);
}

function highlightPlayingCard(surahNo, ayahNo){
  document.querySelectorAll(".ayah.playing").forEach(el => el.classList.remove("playing"));
  const card = document.querySelector(`.ayah[data-key="${surahNo}:${ayahNo}"]`);
  if (card) {
    card.classList.add("playing");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function playAyahAtIndex(idx){
  if (idx < 0 || idx >= currentPlaylist.length) {
    stopAudio();
    return;
  }
  currentPlayIdx = idx;
  const item = currentPlaylist[idx];
  const url = `https://everyayah.com/data/${currentReciter}/${pad3(item.s.number)}${pad3(item.no)}.mp3`;
  audioObj.src = url;
  audioObj.playbackRate = SPEEDS[audioSpeedIdx] || 1;
  audioTitle.textContent = `${item.s.englishName} · আয়াত ${toBn(item.no)}`;
  audioReciterLabel.textContent = getReciterName(currentReciter);
  audioBar.style.display = "block";
  updateAudioBarPos();
  audioAuto.classList.toggle("on", autoPlayNext);
  highlightPlayingCard(item.s.number, item.no);
  audioObj.play().then(() => {
    audioPlayPause.textContent = "{{pause}}";
    audioPlayPause.setAttribute("aria-label", "অডিও বিরতি দাও");
  }).catch(() => {
    showToast("অডিও লোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।");
    audioPlayPause.textContent = "{{play_arrow}}";
    audioPlayPause.setAttribute("aria-label", "আবার চালাও");
  });
}

function playAyahFromList(list, targetSurah, targetAyah){
  currentPlaylist = list;
  const idx = list.findIndex(x => x.s.number === targetSurah && x.no === targetAyah);
  if (idx >= 0) playAyahAtIndex(idx);
}

function stopAudio(){
  audioObj.pause();
  audioObj.src = "";
  audioBar.style.display = "none";
  currentPlayIdx = -1;
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
audioAuto.onclick = () => {
  autoPlayNext = !autoPlayNext;
  lsSet("autoPlayNext", autoPlayNext);
  audioAuto.classList.toggle("on", autoPlayNext);
  showToast(autoPlayNext ? "অটো-প্লে চালু হয়েছে" : "অটো-প্লে বন্ধ হয়েছে");
};
document.getElementById("audioClose").onclick = stopAudio;
audioObj.onended = () => {
  if (autoPlayNext && currentPlayIdx + 1 < currentPlaylist.length) {
    playAyahAtIndex(currentPlayIdx + 1);
  } else {
    audioPlayPause.textContent = "{{play_arrow}}";
  }
};

/* Phase 4: accessible playback progress, network feedback and lock-screen controls */
(function(){
  const seek=document.getElementById('audioSeek');
  const current=document.getElementById('audioCurrentTime');
  const duration=document.getElementById('audioDuration');
  const status=document.getElementById('audioStatus');
  if(!seek||!current||!duration||!status) return;
  const bnTime=function(seconds){
    if(!Number.isFinite(seconds)||seconds<0) seconds=0;
    const m=Math.floor(seconds/60), sec=Math.floor(seconds%60);
    return toBn(m)+':'+toBn(String(sec).padStart(2,'0'));
  };
  const updateProgress=function(){
    const d=audioObj.duration, t=audioObj.currentTime||0;
    current.textContent=bnTime(t);
    if(Number.isFinite(d)&&d>0){
      duration.textContent=bnTime(d);
      if(document.activeElement!==seek) seek.value=String(Math.round(t/d*1000));
      seek.disabled=false;
    }else{duration.textContent='০:০০';seek.value='0';seek.disabled=true;}
  };
  seek.addEventListener('input',function(){
    if(Number.isFinite(audioObj.duration)&&audioObj.duration>0){
      audioObj.currentTime=(Number(seek.value)/1000)*audioObj.duration;
      updateProgress();
    }
  });
  audioObj.addEventListener('timeupdate',updateProgress);
  audioObj.addEventListener('durationchange',updateProgress);
  audioObj.addEventListener('loadedmetadata',function(){updateProgress();status.textContent='অডিও চলছে';});
  audioObj.addEventListener('waiting',function(){status.textContent='অডিও লোড হচ্ছে…';});
  audioObj.addEventListener('playing',function(){status.textContent='অডিও চলছে';audioPlayPause.textContent='{{pause}}';});
  audioObj.addEventListener('pause',function(){if(audioObj.src)status.textContent='বিরতি';});
  audioObj.addEventListener('error',function(){
    if(!audioObj.src)return;
    status.textContent=navigator.onLine?'অডিও পাওয়া যাচ্ছে না — আবার চেষ্টা করো':'ইন্টারনেট সংযোগ নেই';
    audioPlayPause.textContent='{{play_arrow}}';
  });
  audioObj.addEventListener('emptied',function(){seek.value='0';seek.disabled=true;current.textContent='০:০০';duration.textContent='০:০০';status.textContent='বন্ধ';});
  window.addEventListener('online',function(){if(status.textContent==='ইন্টারনেট সংযোগ নেই')status.textContent='সংযোগ ফিরে এসেছে';});
  window.addEventListener('offline',function(){if(audioObj.paused)status.textContent='অফলাইন — সংরক্ষিত অডিও থাকলে চালানো যাবে';});
  if('mediaSession' in navigator){
    const action=function(name,handler){try{navigator.mediaSession.setActionHandler(name,handler);}catch(e){}}
    action('play',function(){audioObj.play().catch(function(){});});
    action('pause',function(){audioObj.pause();});
    action('previoustrack',function(){if(currentPlayIdx>0)playAyahAtIndex(currentPlayIdx-1);});
    action('nexttrack',function(){if(currentPlayIdx+1<currentPlaylist.length)playAyahAtIndex(currentPlayIdx+1);});
    audioObj.addEventListener('loadedmetadata',function(){
      const item=currentPlaylist[currentPlayIdx];
      if(item&&'MediaMetadata' in window){
        try{navigator.mediaSession.metadata=new MediaMetadata({title:'আয়াত '+toBn(item.no),artist:getReciterName(currentReciter),album:item.s.englishName+' · Quranix'});}catch(e){}
      }
      updateProgress();
    });
    audioObj.addEventListener('timeupdate',function(){
      if(navigator.mediaSession.setPositionState&&Number.isFinite(audioObj.duration)&&audioObj.duration>0){
        try{navigator.mediaSession.setPositionState({duration:audioObj.duration,playbackRate:audioObj.playbackRate,position:Math.min(audioObj.currentTime,audioObj.duration)});}catch(e){}
      }
    });
  }
  updateProgress();
})();


function lsGet(k,d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }
function lsSet(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }

function safeHtml(html){
  const doc = new DOMParser().parseFromString("<div>" + String(html) + "</div>", "text/html");
  const root = doc.body.firstChild;
  root.querySelectorAll("script,style,iframe,object,embed,link,meta,form,input,button,textarea,svg,math").forEach(n => n.remove());
  root.querySelectorAll("*").forEach(el => {
    Array.from(el.attributes).forEach(a => {
      const n = a.name.toLowerCase();
      if (n.startsWith("on") || n === "href" || n === "src" || n === "xlink:href" || n === "style") el.removeAttribute(a.name);
    });
  });
  return root.innerHTML;
}

/* Sources & references: one list used by the settings sheet and the menu popup. */
window.qxSourcesHtml = function(){
  const A = (u, t) => '<a href="' + u + '" target="_blank" rel="noopener">' + (t || u.replace(/^https:\/\//, '')) + '</a>';
  const SECTIONS = [
    ['কুরআনের পাঠ ও অনুবাদ', [
      'আরবি পাঠ: Tanzil Project, AlQuran Cloud-এর মাধ্যমে · ' + A('https://tanzil.net') + ' · ' + A('https://alquran.cloud') + ' · অ্যাপের সাথে অফলাইন',
      'বাংলা অনুবাদ (মাওলানা মুহিউদ্দীন খান): AlQuran Cloud সংস্করণ bn.bengali · অ্যাপের সাথে অফলাইন',
      'বাংলা অনুবাদ (ড. আবু বকর মুহাম্মাদ যাকারিয়া): প্রকাশক King Fahd Glorious Quran Printing Complex, উৎস ' + A('https://quranenc.com') + ' · সংস্করণ V1.1.1 · ডাউনলোড করে অফলাইনে ব্যবহার করা যায়',
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
    ['অডিও তিলাওয়াত', [
      'EveryAyah.com থেকে (অনলাইন, অথবা ডাউনলোড করে অফলাইন) · ' + A('https://everyayah.com'),
      'কারি: সৌদ আশ-শুরাইম (ডিফল্ট), মিশারি আল-আফাসি, আব্দুল বাসিত (মুরাত্তাল), আব্দুর রহমান আস-সুদাইস, মাহের আল-মুআইকলি',
      'প্রতিটি কারির সম্পূর্ণ অডিও ডাউনলোড ম্যানেজার থেকে আলাদাভাবে ডাউনলোড করা যায়'
        ]],
    ['ডাউনলোড করা ডেটা', [
      'ডাউনলোড করা অনুবাদ, তাফসির, হাদিস ও অডিও শুধু এই ডিভাইসের অ্যাপ/ব্রাউজার স্টোরেজে থাকে। ডাউনলোড ম্যানেজার থেকে যেকোনো সময় মুছে ফেলা যায়।'
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
  next.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
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

function renderHome(){
  stopTimer();
  if (mode === "prayer") return renderPrayer();
  if (mode === "tasbih") return renderTasbih();
  if (mode === "dua") return renderDua();
  if (mode === "tracker") return renderTracker();
  if (mode === "asma") return renderAsma();
  if (mode === "hijri") return renderHijri();
  if (mode === "hadith") return renderHadith();
  if (mode === "more") return renderMore();
  if (mode === "saved") return renderSaved();
  if (QX_SECTIONS[mode]) return renderSection(mode);
  renderQuranHome();
}

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
    b.textContent = next === "grid" ? "{{grid_view}}" : "{{view_list}}";
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
  b.textContent = next === "grid" ? "{{grid_view}}" : "{{view_list}}";
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

/* ===== বিষয়ভিত্তিক আয়াত =====
   উৎস: Quranic Arabic Corpus Morphology v0.4 — mustafa0x/quran-morphology ফোর্ক (ইমেইল ছাড়া পাবলিক মিরর)।
   যাচাই: এই ফাইলের count গুলো অফিশিয়াল corpus.quran.com পেজের count-এর সাথে মিলিয়ে দেখা — রহমত 339, সবর 103, সালাত 99 মিলেছে।
   পদ্ধতি: ধাতু (Root) ধরে গণনা। একই আয়াতে একই ধাতু একাধিকবার এলে count বাড়ে, কিন্তু ayahs-এ ওই আয়াত ১ বারই থাকে।
   তাই count আর ayahs.length মিলবে না, এটাই স্বাভাবিক।
   সিরিয়াল — অটো সিংক: সিরিয়াল = অ্যারেতে অবস্থান (১ থেকে শুরু)।
   কোনো ঘর কাটলে নিচের সব ঘরের সিরিয়াল আপনা-আপনি ১ করে এগিয়ে আসবে। নতুন বিষয় সবসময় শেষে যোগ হবে।
   তথ্য যোগ করার নিয়ম: নিচে একটা করে ঘর যোগ করো:
     { ar: "رحم", bn: "রহমত", count: 339, ayahs: [[2,64],[2,105]] }
   ar    = ধাতুর আরবি রূপ (ফোর্কের ROOT ফিল্ড অনুযায়ী, হরকত ছাড়া)
   bn    = বাংলা অর্থ, এটাই বিষয়ের নাম
   count = ধাতুটি কুরআনে মোট কতবার এসেছে (শব্দ-সংখ্যা, আয়াত-সংখ্যা নয়)
   ayahs = যেসব আয়াতে আছে, [সূরা নম্বর, আয়াত নম্বর] জোড়ায়, সূরা → আয়াত ক্রমে, ডুপ্লিকেট ছাড়া
   তালিকা আপনা-আপনি count অনুযায়ী বেশি থেকে কম সাজানো হয়।
   জোড়া: প্রতিটা বিষয়ের উল্টাটাও লিস্টে থাকবে, জোড়া কমেন্টে লেখা থাকবে।
   ট্যাবের হেডারে (প্রথম লাইন, গ্রিডের উপরে, ছোট + ইটালিক): *প্রতিটা শব্দের সংখ্যা চূড়ান্ত হিসাব নয়। / ফুটারে (ছোট + ইটালিক): উৎস লাইন। শব্দের ভিতরে কোনো নোট নেই। */
const QX_DICT = [["أله", "ইলাহ / উপাস্য", 2851, 1879, "اللَّه¦إِلٰه¦اللَّهُمَّ", "1:1"], ["قول", "বলা", 1722, 1383, "قالَ¦قَوْل¦قائِل¦قِيل¦تَقَوَّلَ", "2:8"], ["كون", "হওয়া", 1390, 1176, "كانَ¦مَكان¦مَكانَت", "2:10"], ["ربب", "পালনকর্তা / প্রতিপালন", 980, 871, "رَبّ¦رَبّانِيِّن¦رِبِّيّ¦رَبائِب", "1:2"], ["أمن", "ঈমান", 879, 723, "آمَنَ¦مُؤْمِن¦إِيمان¦مُؤْمِنَة¦أَمِنَ", "2:3"], ["علم", "ইলম", 854, 728, "عَلِمَ¦عَلِيم¦عِلْم¦عالَم¦أَعْلَم", "1:2"], ["قوم", "দাঁড়ানো", 660, 597, "قَوْم¦قِيامَة¦أَقامَ¦مُسْتَقِيم¦قامَ", "1:6"], ["أيي", "যে / যা", 597, 562, "آيَة¦أَيّ", "2:21"], ["أتي", "আসা", 549, 486, "آتَى¦أَتَى¦آتِي¦إِيتاء¦مُؤْتي", "2:23"], ["كفر", "কুফর", 525, 465, "كَفَرَ¦كافِر¦كُفْر¦كَفَّرَ¦كَفُور", "2:6"], ["بين", "", 523, 454, "بَيْن¦مُبِين¦بَيِّنَة¦بَيَّنُ¦تَبَيَّنَ", "2:66"], ["شيأ", "", 519, 449, "شَىْء¦شاءَ", "2:20"], ["رسل", "রাসূল / পাঠানো", 513, 429, "رَسُول¦أَرْسَلَ¦مُرْسَل¦رِسالَة¦مُرْسِل", "2:87"], ["يوم", "দিন", 475, 437, "يَوْم", "1:4"], ["أرض", "পৃথিবী / জমিন", 461, 440, "أَرْض", "2:11"], ["سمو", "আকাশ / নাম", 381, 352, "سَماء¦اسْم¦مُسَمًّى¦سَمَّى¦سَمِيّ", "1:1"], ["كلل", "", 377, 355, "كُلّ¦كُلَّما¦كَلالَة¦كَلّ", "2:20"], ["عذب", "আজাব", 373, 336, "عَذاب¦عَذَّبَ¦مُعَذِّب¦مُعَذَّب¦عَذْب", "2:7"], ["عمل", "কাজ করা", 360, 313, "عَمِلَ¦عَمَل¦عامِل¦عامِلَة", "2:25"], ["جعل", "বানানো", 346, 311, "جَعَلَ¦جاعِل", "2:19"], ["رحم", "রহমত", 339, 313, "رَحِيم¦رَحْمَة¦رَحْمٰن¦رَحِمَ¦أَرْحام", "1:1"], ["أنس", "", 338, 317, "ناس¦إِنسان¦إِنس¦آنَسَ¦إِنسِيّ", "2:8"], ["رأي", "", 328, 297, "رَأَى¦أَرَيْ¦رُءْيا¦رِئاء¦رَأْى", "2:55"], ["كتب", "লেখা / কিতাব", 319, 279, "كِتاب¦كَتَبَ¦كاتِب¦مَكْتُوب¦كاتِبُ", "2:2"], ["هدي", "হিদায়াত", 316, 268, "هَدَى¦هُدًى¦اهْتَدَى¦مُهْتَدي¦هَدْي", "1:6"], ["ظلم", "জুলুম", 315, 290, "ظالِم¦ظَلَمَ¦ظُلُمَة¦ظُلْم¦أَظْلَم", "2:17"], ["نفس", "আত্মা / নিজ", 298, 270, "نَفْس¦تَنَفَّسَ¦يَتَنافَسِ¦مُتَنافِس", "2:9"], ["قبل", "", 294, 282, "قَبْل¦تَقَبَّلَ¦يَقْبَلُ¦أَقْبَلَ¦قِبْلَة", "2:4"], ["نزل", "নাযিল হওয়া", 293, 257, "أَنزَلَ¦نَزَّلَ¦تَنزِيل¦نُزُل¦تَنَزَّلَتْ", "2:4"], ["ذكر", "জিকির", 292, 264, "ذَكَرَ¦ذِكْر¦تَذَكَّرَ¦ذِكْرَى¦ذُكِّرَ", "2:40"], ["حقق", "হক", 287, 263, "حَقّ¦حَقَّ¦أَحَقّ¦يُحِقَّ¦حاقَّة", "2:26"], ["كذب", "মিথ্যা", 282, 257, "كَذَّبَ¦كَذِب¦كاذِب¦مُكَذِّب¦كَذَبَ", "2:10"], ["جيأ", "", 278, 262, "جاءَ", "2:71"], ["عبد", "ইবাদত", 275, 251, "عَبْد¦عَبَدَ¦عابِد¦عِبادَت¦عَبَّد", "1:5"], ["أخذ", "", 273, 244, "أَخَذَ¦اتَّخَذَ¦يُؤاخِذُ¦أَخْذ¦آخِذ", "2:48"], ["خلق", "সৃষ্টি", 261, 218, "خَلَقَ¦خَلْق¦خالِق¦خَلاق¦خَلّاق", "2:21"], ["وقي", "তাকওয়া", 258, 237, "اتَّقَى¦مُتَّقي¦تَقْوَى¦وَقَى¦تَقِيّ", "2:2"], ["أخر", "", 250, 242, "آخِر¦آخَر¦أَخَّرَ¦يَسْتَأْخِرُ¦تَأَخَّرَ", "2:4"], ["أمر", "আদেশ", 248, 226, "أَمْر¦أَمَرَ¦يَأْتَمِرُ¦آمِر¦أَمّارَة", "2:27"], ["بعد", "", 235, 223, "بَعْد¦بَعِيد¦بُعْد¦بَعُدَتْ¦مُبْعَد", "2:27"], ["غفر", "মাগফিরাত", 234, 202, "غَفُور¦غَفَرَ¦اسْتَغْفَرَ¦مَغْفِرَة¦غَفّار", "2:58"], ["ولي", "", 232, 202, "وَلِيّ¦تَوَلَّى¦وَلَّى¦مَوْلَى¦أَوْلَى", "2:64"], ["دعو", "দোয়া", 212, 182, "دَعا¦دُعاء¦دَعْوَة¦دَعْوَى¦داعِي", "2:23"], ["حكم", "হিকমাহ", 210, 189, "حَكِيم¦حَكَمَ¦حُكْم¦حِكْمَة¦حاكِم", "2:32"], ["ملك", "রাজত্ব / মালিক", 206, 191, "مَلَك¦مُلْك¦مَلَكَتْ¦مَلِك¦مالِك", "1:4"], ["جنن", "", 201, 196, "جَنَّة¦جِنّ¦مَجْنُون¦جِنَّة¦جانّ", "2:25"], ["عند", "", 201, 189, "عِند¦عَنِيد", "2:54"], ["خير", "ভালো / কল্যাণ", 196, 178, "خَيْر¦خَيْرَة¦اخْتارَ¦خِيَرَة¦يَتَخَيَّرُ", "2:54"], ["حسن", "", 194, 177, "مُحْسِن¦أَحْسَن¦حَسَنَة¦أَحْسَنَ¦حَسَن", "2:58"], ["نور", "নূর", 194, 174, "نار¦نُور¦مُنِير", "2:17"], ["ضلل", "গোমরাহি", 191, 170, "أَضَلَّ¦ضَلَّ¦ضَلال¦ضالّ¦ضَلالَة", "1:7"], ["حيي", "হায়াত", 189, 166, "حَياة¦أَحْيا¦حَيّ¦يَسْتَحْىِۦ¦حَىَّ", "2:26"], ["سمع", "শোনা", 185, 163, "سَمِعَ¦سَمِيع¦سَمْع¦اسْتَمَعَ¦أَسْمَعَ", "2:7"], ["بني", "", 184, 150, "بُنَىّ¦ابْن¦بِنْت¦بَنَى¦بُنْيان", "2:22"], ["خرج", "বের হওয়া", 182, 157, "أَخْرَجَ¦خَرَجَ¦إِخْراج¦خُرُوج¦مُخْرَج", "2:22"], ["صلح", "", 180, 170, "صالِح¦صالِحَة¦أَصْلَحَ¦إِصْلاح¦مُصْلِح", "2:11"], ["سبل", "", 176, 164, "سَبِيل", "2:108"], ["تبع", "", 172, 156, "اتَّبَعَ¦أَتْبَعَ¦تَبِعَ¦تابِع¦اتِّباع", "2:38"], ["قتل", "", 170, 122, "قَتَلَ¦قاتَلَ¦قِتال¦قَتْل¦اقْتَتَلَ", "2:54"], ["مثل", "", 169, 148, "مَثَل¦مِثْل¦تَماثِيل¦مَثُلَة¦تَمَثَّلَ", "2:17"], ["شرك", "", 168, 143, "أَشْرَكَ¦مُشْرِك¦شَرِيك¦مُشْرِكَة¦شِرْك", "2:96"], ["قلب", "", 168, 155, "قَلْب¦انقَلَبَ¦قَلَّبُ¦تَقَلُّب¦مُنقَلِب", "2:7"], ["سوأ", "", 167, 151, "سَيِّئَة¦سُوء¦ساءَ¦سَوْء¦سَوْءَة", "2:49"], ["كثر", "", 167, 162, "أَكْثَر¦كَثِير¦كَثِيرَة¦اسْتَكْثَرْ¦كَثُرَ", "2:26"], ["موت", "মউত", 165, 143, "مَوْت¦ماتَ¦مَيِّت¦أَماتَ¦مَيْتَة", "2:19"], ["كبر", "অহংকার", 161, 153, "اسْتَكْبَرَ¦كَبِير¦أَكْبَر¦كَبُرَ¦كَبِيرَة", "2:34"], ["شهد", "", 160, 123, "شَهِيد¦شَهِدَ¦شَهادَة¦شاهِد¦أَشْهَدَ", "2:23"], ["نبأ", "", 160, 151, "نَبِيّ¦نَبَّأَ¦نَبَأ¦نُبُوَّة¦أَنۢبَأَ", "2:31"], ["بعض", "", 158, 87, "بَعْض¦بَعُوضَة", "2:26"], ["نصر", "সাহায্য", 158, 137, "نَصَرَ¦نَصِير¦نَصْر¦نَصْرانِيّ¦ناصِر", "2:48"], ["صدق", "সত্য", 155, 144, "صادِق¦مُصَدِّق¦صَدَقَ¦صِدْق¦صَدَقَة", "2:23"], ["غير", "", 154, 146, "غَيْر¦يُغَيِّرُ¦مُغَيِّر¦يَتَغَيَّرْ¦مُغِيرَة", "1:7"], ["وعد", "", 151, 130, "وَعَدَ¦وَعْد¦مَوْعِد¦مِيعاد¦وَعِيد", "2:51"], ["بصر", "দেখা", 148, 139, "بَصِير¦بَصَر¦أَبْصَرَ¦بَصِيرَة¦مُبْصِر", "2:7"], ["رود", "", 148, 120, "أَرادَ¦راوَدُ¦رُوَيْد", "2:26"], ["لقي", "", 146, 135, "أَلْقَى¦لِقاء¦لَقُ¦الْتَقَى¦لَقَّى", "2:14"], ["دون", "", 144, 142, "دُون", "2:23"], ["سلم", "সালাম", 140, 127, "سَلام¦مُسْلِم¦أَسْلَمَ¦إِسْلام¦سَلَّمَ", "2:71"], ["نعم", "নিয়ামত", 140, 128, "نِعْمَة¦نَعَم¦نِعْمَ¦أَنْعَمَ¦نَعِيم", "1:7"], ["دنو", "", 133, 128, "دُنْيا¦أَدْنَى¦دانِيَة¦دَنا¦دان", "2:61"], ["قدر", "", 132, 121, "قَدِير¦قَدَرَ¦قَدَّرَ¦قادِر¦قَدَر", "2:20"], ["نذر", "", 130, 115, "نَذِير¦أَنذَرَ¦مُنذِر¦مُنذَر¦نَذَرْ", "2:6"], ["جمع", "", 129, 123, "جَمِيع¦أَجْمَع¦جَمَعَ¦جَمْع¦أَجْمَعُ", "2:29"], ["سأل", "জিজ্ঞাসা করা", 129, 118, "سَأَلَ¦يَتَساءَلُ¦سائِل¦مَسْئُول¦سُؤْل", "2:61"], ["طوع", "", 129, 118, "أَطاعَ¦اسْتَطاعَ¦طَوْع¦طاعَة¦تَطَوَّعَ", "2:158"], ["نظر", "", 129, 115, "نَظَرَ¦يُنظَرُ¦يَنتَظِرُ¦مُنتَظِر¦مُنظَر", "2:50"], ["عظم", "", 128, 127, "عَظِيم¦عِظام¦أَعْظَم¦عَظْم¦يُعَظِّمْ", "2:7"], ["أهل", "", 127, 120, "أَهْل", "2:105"], ["خلف", "", 127, 116, "اخْتَلَفَ¦خَلْف¦أَخْلَفُ¦مُخْتَلِف¦خَلِيفَة", "2:30"], ["دخل", "প্রবেশ করা", 126, 111, "دَخَلَ¦أُدْخِلَ¦مُدْخَل¦داخِل¦دَخَل", "2:58"], ["أول", "", 125, 119, "أَوَّل¦آل¦تَأْوِيل", "2:41"], ["خوف", "ভয়", 124, 112, "خافَ¦خَوْف¦خِيفَة¦يُخَوِّفُ¦خائِف", "2:38"], ["بشر", "", 123, 119, "بُشِّرَ¦بَشَر¦بُشْرَى¦بَشِير¦مُبَشِّر", "2:25"], ["رزق", "রিজিক", 123, 109, "رَزَقَ¦رِزْق¦رازِق¦رَزّاق", "2:3"], ["عزز", "সম্মান / শক্তি", 120, 117, "عَزِيز¦عِزَّة¦أَعَزّ¦تُعِزُّ¦عِزّ", "2:129"], ["يدي", "", 120, 110, "يَد", "2:66"], ["أمم", "", 119, 108, "أُمَّة¦أُمّ¦إِمام¦أُمِّيّ¦آمّ", "2:78"], ["جزي", "", 118, 109, "جَزَى¦جَزاء¦جِزْيَة¦جاز¦نُجازِي", "2:48"], ["أبو", "", 117, 104, "آباء¦أَب¦أَبَوان", "2:133"], ["نهر", "", 113, 102, "نَهار¦نَهَر¦تَنْهَرْ", "2:25"], ["نفق", "মুনাফিকি", 111, 86, "أَنفَقَ¦مُنافِق¦مُنافِقَة¦نَفَقَة¦نِفاق", "2:3"], ["أكل", "খাওয়া", 109, 101, "أَكَلَ¦أُكُل¦أَكْل¦آكِل¦أَكّال", "2:35"], ["حسب", "", 109, 102, "حَسِبَ¦حِساب¦حَسْب¦حَسِيب¦حاسَبْ", "2:202"], ["أجر", "পুরস্কার", 108, 99, "أَجْر¦اسْتَأْجَرْ¦تَأْجُرَ", "2:62"], ["فعل", "", 108, 102, "فَعَلَ¦فاعِل¦مَفْعُول¦فَعّال¦فِعْل", "2:24"], ["وجد", "", 107, 99, "وَجَدَ¦وُجْد", "2:96"], ["عدو", "", 106, 92, "عَدُوّ¦اعْتَدَى¦عُدْوان¦عاد¦مُعْتَدي", "2:36"], ["رجع", "ফিরে আসা", 104, 103, "رَجَعَ¦مَرْجِع¦راجِع¦رَجْع¦يَتَراجَعَ", "2:18"], ["فضل", "অনুগ্রহ", 104, 92, "فَضْل¦فَضَّلَ¦تَفْضِيل¦يَتَفَضَّلَ", "2:47"], ["صبر", "সবর", 103, 93, "صَبَرَ¦صابِر¦صَبْر¦صَبّار¦اصْطَبِرْ", "2:45"], ["أذن", "", 102, 90, "إِذْن¦أَذِنَ¦أُذُن¦اسْتَأْذَنَ¦أَذَّنَ", "2:19"], ["شدد", "", 102, 99, "شَدِيد¦أَشَدّ¦أَشُدّ¦شَدَدْ¦اشْتَدَّتْ", "2:74"], ["ولد", "", 102, 80, "وَلَد¦والِد¦والِدَي¦وَلَدَ¦وَلِيد", "2:83"], ["دين", "দ্বীন / ধর্ম", 101, 87, "دِين¦دَيْن¦مَدِين¦تَدايَن¦يَدِينُ", "1:4"], ["صلو", "সালাত", 99, 90, "صَلاة¦صَلَّى¦مُصَلّي¦مُصَلًّى", "2:3"], ["صحب", "", 97, 89, "أَصْحاب¦صاحِب¦صاحِبَة¦تُصاحِبْ¦يُصْحَبُ", "2:39"], ["أخو", "", 96, 80, "أَخ¦أُخْت¦إِخْوَة", "2:178"], ["بغي", "", 96, 90, "ابْتَغَى¦بَغَى¦ابْتِغاء¦بَغْي¦يَنۢبَغِي", "2:90"], ["قرب", "", 96, 91, "قَرِيب¦أَقْرَب¦قُرْبَى¦يَقْرَبُ¦مُقَرَّب", "2:35"], ["حبب", "ভালোবাসা", 95, 85, "أَحْبَبْ¦حُبّ¦حَبّ¦حَبَّة¦اسْتَحَبُّ", "2:165"], ["سبح", "", 92, 87, "سَبَّحَ¦سُبْحان¦تَسْبِيح¦يَسْبَحُ¦مُسَبِّح", "2:30"], ["سجد", "", 92, 81, "سَجَدَ¦مَسْجِد¦ساجِد¦سُجُود", "2:34"], ["ليل", "", 92, 81, "لَيْل¦لَيْلَة", "2:51"], ["ليس", "", 89, 85, "لَيْسَ", "2:113"], ["شطن", "", 88, 78, "شَيْطان", "2:14"], ["قرأ", "", 88, 79, "قُرْءان¦قَرَأَ¦قُرُوء¦نُقْرِئُ", "2:185"], ["توب", "তওবা", 87, 69, "تابَ¦تَوّاب¦تَوْبَة¦مَتاب¦تائِب", "2:37"], ["خلد", "", 87, 86, "خالِد¦خُلْد¦أَخْلَدَ¦يَخْلُدْ¦مُخَلَّد", "2:25"], ["مول", "", 86, 80, "مال", "2:155"], ["أحد", "", 85, 82, "أَحَد¦إِحْدَى", "2:96"], ["نجو", "", 84, 75, "نَجَّى¦أَنجَى¦نَجْوَى¦تَناجَيْ¦نَجا", "2:49"], ["حرم", "", 83, 71, "حَرَّمَ¦حَرام¦مُحَرَّم¦مَحْرُوم¦حُرُمَة", "2:85"], ["سوي", "", 83, 80, "اسْتَوَى¦سَواء¦سَوَّى¦سَوِيّ¦تُسَوَّى", "2:6"], ["كيف", "", 83, 83, "كَيْف", "2:28"], ["زوج", "", 81, 72, "زَوْج¦زُوِّجَتْ", "2:25"], ["عقب", "শাস্তি", 80, 74, "عاقِبَة¦عِقاب¦عَقِب¦عُقْبَى¦عاقَبَ", "2:143"], ["عرض", "মুখ ফেরানো", 79, 72, "أَعْرَضَ¦مُعْرِض¦عَرَضَ¦عَرَض¦عَرْض", "2:31"], ["وجه", "", 78, 71, "وَجْه¦وَجِيه¦وَجَّهْ¦وِجْهَة¦تَوَجَّهَ", "2:112"], ["وحي", "", 78, 70, "أَوْحَى¦وَحْى", "3:44"], ["بلغ", "", 77, 73, "بَلَغَ¦بَلاغ¦بَلَّغْ¦بالِغ¦أَبْلَغُ", "2:196"], ["صوب", "", 77, 56, "أَصابَ¦مُصِيبَة¦صَيِّب¦مُصِيب¦صَواب", "2:19"], ["قلل", "", 76, 74, "قَلِيل¦أَقَلّ¦قَلِيلَة¦قَلَّ¦أَقَلَّتْ", "2:41"], ["ألم", "", 75, 73, "أَلِيم¦يَأْلَمُ", "2:10"], ["شكر", "শুকর", 75, 69, "شَكَرَ¦شاكِر¦شَكُور¦مَشْكُور¦شُكُور", "2:52"], ["كلم", "কথা", 75, 71, "كَلِمَة¦كَلَّمَ¦كَلام¦كَلِم¦يَتَكَلَّمُ", "2:37"], ["ضرر", "", 74, 70, "يَضُرَّ¦ضُرّ¦ضَرّ¦ضَرّاء¦اضْطُرَّ", "2:102"], ["بأس", "", 73, 70, "بِئْسَ¦بَأْس¦بَأْساء¦تَبْتَئِسْ¦بَئِيس", "2:90"], ["بيت", "", 73, 54, "بَيْت¦بَيَّتَ¦بَيات¦يَبِيتُ", "2:125"], ["رجل", "", 73, 66, "رَجُل¦رِجال¦رِجْل¦رَجِل", "2:228"], ["رضو", "সন্তুষ্টি (আল্লাহর)", 73, 64, "رَضِيَ¦رِضْوان¦مَرْضات¦راضِيَة¦يُرْضُ", "2:120"], ["غني", "", 73, 72, "أَغْنَتْ¦غَنِيّ¦أَغْنَى¦اسْتَغْنَى¦مُغْني", "2:263"], ["فرق", "", 72, 66, "فَرِيق¦فَرَّقُ¦تَفَرَّقَ¦فُرْقان¦فَرَقْ", "2:50"], ["عرف", "", 71, 63, "مَعْرُوف¦عَرَفَ¦اعْتَرَفُ¦أَعْراف¦عُرْف", "2:89"], ["يمن", "", 71, 63, "يَمِين¦أَيْمَن¦مَيْمَنَة", "2:224"], ["علو", "", 70, 68, "تَعالَى¦عَلِيّ¦أَعْلَى¦تَعالَ¦عَلا", "2:255"], ["متع", "", 70, 65, "مَتاع¦مَتَّعْ¦تَمَتَّعَ¦اسْتَمْتَعَ", "2:36"], ["وكل", "তাওয়াক্কুল", 70, 61, "تَوَكَّلْ¦وَكِيل¦مُتَوَكِّل¦وُكِّلَ", "3:122"], ["سكن", "প্রশান্তি", 69, 66, "مِسْكِين¦سَكَنَ¦مَسْكَن¦سَكِينَة¦أَسْكَن", "2:35"], ["ظنن", "", 69, 57, "ظَنَّ¦ظَنّ¦ظانّ", "2:46"], ["حمد", "", 68, 66, "حَمْد¦حَمِيد¦مُحَمَّد¦يُحْمَدُ¦حامِد", "1:2"], ["هلك", "", 68, 63, "أَهْلَكَ¦هَلَكَ¦مُهْلِك¦هالِك¦مَهْلِك", "2:195"], ["وحد", "", 68, 67, "واحِدَة¦واحِد¦وَحْد¦وَحِيد", "2:61"], ["بعث", "", 67, 64, "بَعَثَ¦مَبْعُوث¦بَعْث¦انبِعاث¦انۢبَعَثَ", "2:56"], ["كسب", "", 67, 60, "كَسَبَ¦اكْتَسَبَ", "2:79"], ["جرم", "", 66, 65, "مُجْرِم¦أَجْرَمُ¦جَرَم¦يَجْرِمَ¦إِجْرام", "5:2"], ["وفي", "ওয়াদা রক্ষা", 66, 64, "تَوَفَّى¦أَوْفَى¦وَفَّى¦مُوفي¦مُتَوَفِّي", "2:40"], ["خسر", "", 65, 60, "خاسِر¦خَسِرَ¦أَخْسَر¦خُسْران¦خَسار", "2:27"], ["عين", "", 65, 63, "عَيْن¦مَعِين¦عِين", "2:60"], ["جري", "", 64, 64, "جَرَيْ¦جَوار¦جارِيَة¦مَجْرى", "2:25"], ["حمل", "", 64, 50, "حَمَلَ¦حَمْل¦حُمِّلَ¦احْتَمَلَ¦حِمْل", "2:248"], ["تلو", "", 63, 61, "تَلَى¦تِلاوَت¦تالِيَة", "2:44"], ["ذوق", "", 63, 61, "ذاقُ¦أَذاقَ¦ذائِقَة¦ذائِقُوا", "3:106"], ["سحر", "", 63, 59, "سِحْر¦ساحِر¦مَسْحُور¦سَحَر¦سَحَرُ", "2:102"], ["عود", "", 63, 58, "عاد¦عادَ¦أُعِيدُ¦عِيد¦مَعاد", "2:275"], ["قضي", "", 63, 59, "قَضَى¦مَقْضِيّ¦قاض¦قاضِيَة", "2:117"], ["موه", "", 63, 60, "ماء", "2:22"], ["زيد", "", 61, 59, "زادَ¦ازْدادُ¦زِيادَة¦مَزِيد", "2:10"], ["مسس", "", 61, 57, "مَسَّ¦مَسّ¦يَتَماسَّ¦مِساس", "2:80"], ["غيب", "", 60, 59, "غَيْب¦غُيُوب¦غائِب¦غَيابَت¦غائِبَة", "2:3"], ["فتن", "", 60, 58, "فِتْنَة¦فَتَنُ¦فُتُون¦فاتِن¦مَفْتُون", "2:102"], ["فري", "", 60, 54, "افْتَرَى¦افْتِراء¦مُفْتَري¦مُفْتَرًى¦مُفْتَرَيَة", "3:24"], ["ردد", "", 59, 57, "رَدَّ¦ارْتَدَّ¦مَرَدّ¦رادّ¦رَدّ", "2:85"], ["زكو", "আত্মশুদ্ধি", 59, 56, "زَكاة¦زَكَّى¦تَزَكَّى¦أَزْكَى¦زَكِيَّة", "2:43"], ["ظهر", "", 59, 57, "ظَهْر¦ظَهَرَ¦ظاهِر¦أَظْهَرَ¦ظاهَرُ", "2:85"], ["نسو", "", 59, 53, "نِساء", "2:49"], ["ضرب", "", 58, 54, "ضَرَبَ¦ضَرْب", "2:26"], ["روح", "", 57, 52, "رِيح¦رُوح¦رَوْح¦رَيْحان¦تُرِيحُ", "2:87"], ["عدد", "", 57, 50, "أَعَدَّ¦عِدَّة¦عَدَّ¦مَعْدُودَة¦عَدَد", "2:24"], ["قري", "", 57, 54, "قَرْيَة", "2:58"], ["أجل", "", 56, 48, "أَجَل¦أَجَّلَ¦مُؤَجَّل¦أَجْل", "2:231"], ["ذهب", "যাওয়া", 56, 56, "ذَهَبَ¦أَذْهَبَ¦ذَهَب¦ذَهاب¦ذاهِب", "2:17"], ["نهي", "নিষেধ", 56, 54, "نَهَى¦انتَهَى¦مُنتَهَى¦نُهَى¦يَتَناهَ", "2:192"], ["دور", "", 55, 53, "دار¦دائِرَة¦تُدِيرُ¦دَوائِر¦تَدُورُ", "2:84"], ["فسق", "", 54, 54, "فاسِق¦فَسَقَ¦فُسُوق¦فِسْق", "2:26"], ["ندي", "", 53, 50, "نادَى¦نِداء¦نادِي¦مُنادِي¦نَدِيّ", "2:171"], ["خبر", "", 52, 52, "خَبِير¦أَخْبار¦خُبْر¦خَبَر", "2:234"], ["ضعف", "", 52, 45, "ضِعْف¦يُضاعِفُ¦ضَعِيف¦اسْتَضْعَفُ¦مُسْتَضْعَف", "2:245"], ["تحت", "", 51, 50, "تَحْت", "2:25"], ["حلل", "", 51, 43, "أَحَلَّ¦حَلَلْ¦حَلال¦حِلّ¦مَحِلّ", "2:168"], ["طيب", "", 50, 46, "طَيِّبَة¦طَيِّب¦طابَ¦طُوبَى", "2:57"], ["فسد", "ফাসাদ", 50, 47, "مُفْسِد¦أَفْسَدُ¦فَساد¦فَسَدَتِ", "2:11"], ["نفع", "", 50, 49, "نَفَعَ¦نَفْع¦مَنافِع", "2:102"], ["سوع", "", 49, 44, "ساعَة¦سُواع", "6:31"], ["عقل", "", 49, 49, "عَقَلُ", "2:44"], ["أثم", "পাপ", 48, 42, "إِثْم¦أَثِيم¦آثِم¦تَأْثِيم¦أَثام", "2:85"], ["خشي", "", 48, 40, "خَشِيَ¦خَشْيَة", "2:74"], ["طعم", "", 48, 41, "طَعام¦أَطْعَمَ¦طَعِمُ¦إِطْعام¦طاعِم", "2:61"], ["قدم", "", 48, 48, "قَدَّمَ¦قَدَم¦يَسْتَقْدِمُ¦قَدِيم¦قَدِمْ", "2:95"], ["عجل", "", 47, 44, "اسْتَعْجَلَ¦عِجْل¦عَجِلَ¦عَجَّلَ¦عاجِلَة", "2:51"], ["كرم", "দানশীলতা", 47, 46, "كَرِيم¦مُكْرَم¦أَكْرَمَ¦كَرَّمْ¦أَكْرَم", "4:31"], ["زين", "", 46, 43, "زَيَّنَ¦زِينَة¦ازَّيَّنَتْ", "2:212"], ["صدر", "", 46, 43, "صَدْر¦يُصْدِرَ¦يَصْدُرُ", "3:29"], ["عهد", "", 46, 36, "عَهْد¦عاهَدَ¦عَهِدَ", "2:27"], ["صبح", "", 45, 43, "أَصْبَحَ¦صُبْح¦مُصْبِح¦مِصْباح¦إِصْباح", "3:103"], ["صرط", "", 45, 45, "صِراط", "1:6"], ["نسي", "ভুলে যাওয়া", 45, 37, "نَسِيَ¦أَنسَى¦نَسْي¦مَنسِيّ¦نَسِيّ", "2:44"], ["وذر", "", 45, 43, "يَذَرَ", "2:234"], ["بدل", "", 44, 40, "بَدَّلَ¦تَبْدِيل¦يَسْتَبْدِلْ¦يَتَبَدَّلِ¦مُبَدِّل", "2:59"], ["حفظ", "", 44, 42, "حافِظ¦حَفِيظ¦حَفِظَ¦يُحافِظُ¦حِفْظ", "2:238"], ["دبر", "", 44, 44, "دُبُر¦مُدْبِر¦يَتَدَبَّرُ¦دابِر¦يُدَبِّرُ", "3:111"], ["سرر", "", 44, 43, "أَسَرَّ¦سِرّ¦سُرُر¦سَرّاء¦إِسْرار", "2:69"], ["يسر", "", 44, 40, "يَسِير¦يَسَّرَ¦يُسْر¦مَيْسِر¦اسْتَيْسَرَ", "2:185"], ["ترك", "", 43, 37, "تَرَكَ¦تارِك", "2:17"], ["جوب", "", 43, 41, "اسْتَجابَ¦أُجِيبَت¦جَواب¦مُجِيب¦جابُ", "2:186"], ["حشر", "", 43, 43, "حَشَرَ¦حاشِر¦حَشْر¦مَحْشُورَة", "2:203"], ["فصل", "", 43, 42, "فَصَّلَ¦فَصْل¦فَصَلَ¦تَفْصِيل¦فِصال", "2:233"], ["فوق", "", 43, 41, "فَوْق¦أَفاقَ¦فَواق", "2:26"], ["مكر", "", 43, 23, "مَكَرَ¦مَكْر¦ماكِر", "3:54"], ["بحر", "", 42, 40, "بَحْر¦بَحِيرَة", "2:50"], ["حزن", "", 42, 42, "يَحْزُن¦حَزَن¦حُزْن", "2:38"], ["سخر", "", 42, 35, "سَخَّرَ¦سَخِرَ¦مُسَخَّرَة¦سِخْرِيّ¦مُسَخَّر", "2:164"], ["صدد", "", 42, 41, "صَدَّ¦صَدّ¦صُدُود¦صُدُّ¦صَدِيد", "2:217"], ["قوي", "", 42, 39, "قُوَّة¦قَوِيّ¦مُقْوي", "2:63"], ["جبل", "", 41, 39, "جَبَل¦جِبِلَّة", "2:260"], ["جهد", "জিহাদ", 41, 36, "جاهَدَ¦جَهْد¦مُجاهِد¦جِهاد¦جُهْد", "2:218"], ["طوف", "", 41, 35, "طائِفَة¦طافَ¦طائِف¦يَطَّوَّفَ¦طُوفان", "2:125"], ["كره", "", 41, 35, "كَرِهَ¦كارِه¦كَرْه¦أُكْرِهَ¦كُرْه", "2:216"], ["لعن", "", 41, 36, "لَعَنَ¦لَعْنَة¦لاعِن¦مَلْعُونَة¦مَلْعُون", "2:88"], ["شعر", "", 40, 40, "يَشْعُرُ¦شاعِر¦شَعائِر¦يُشْعِرُ¦شِعْر", "2:9"], ["فلح", "", 40, 40, "أَفْلَحَ¦مُفْلِح", "2:5"], ["ملأ", "", 40, 40, "مَلَأ¦مُلِئَتْ¦مالِئ¦مِلْء¦امْتَلَأْ", "2:246"], ["ذنب", "গুনাহ", 39, 37, "ذَنب¦ذَنُوب", "3:11"], ["سلط", "", 39, 39, "سُلْطان¦سَلَّطَ", "3:151"], ["شرب", "পান করা", 39, 34, "شَرِبَ¦شَراب¦شارِب¦مَشْرَب¦شِرْب", "2:60"], ["طغي", "", 39, 39, "طَغَى¦طُغْيان¦طاغُوت¦طاغي¦أَطْغَيْ", "2:15"], ["بلو", "", 38, 35, "بَلَوْ¦ابْتَلَى¦بَلاء¦مُبْتَلِي¦يُبْلِيَ", "2:49"], ["ذرر", "", 38, 36, "ذُرِّيَّة¦ذَرَّة", "2:124"], ["فتح", "বিজয় / খোলা", 38, 33, "فَتَحَ¦فَتْح¦اسْتَفْتَحُ¦مَفاتِح¦تُفَتَّحُ", "2:76"], ["قرر", "", 38, 37, "مُسْتَقَرّ¦قَرار¦تَقَرَّ¦أَقْرَرْ¦قُرَّة", "2:36"], ["مرأ", "", 38, 37, "امْرَأَت¦امْرِئ¦مَرْء¦مَرِيئ¦امْرُؤٌا", "2:102"], ["هوي", "", 38, 37, "أَهْواء¦هَواء¦هَوَى¦اسْتَهْوَتْ¦هاوِيَة", "2:87"], ["ألو", "", 37, 37, "آلاء¦يُؤْلُ¦يَأْلُ¦يَأْتَلِ", "2:226"], ["سبق", "", 37, 35, "سَبَقَ¦سابِق¦اسْتَبَقَ¦مَسْبُوق¦سابِقُ", "2:148"], ["نكر", "", 37, 37, "مُنكَر¦نَكِير¦مُنكِر¦يُنكِرُ¦نُكْر", "3:104"], ["أوي", "", 36, 36, "مَأْوَى¦آوَى¦أَوَى", "3:151"], ["بطل", "বাতিল", 36, 34, "باطِل¦مُبْطِل¦يُبْطِلَ¦بَطَلَ", "2:42"], ["حدث", "", 36, 36, "حَدِيث¦تُحَدِّثُ¦يُحْدِثُ¦مُحْدَث", "2:76"], ["ريب", "", 36, 35, "رَيْب¦ارْتابَ¦مُرِيب¦رِيبَة¦مُرْتاب", "2:2"], ["قرن", "", 36, 34, "قَرْن¦قَرِين¦مُقَرَّن¦مُقْرِن¦مُقْتَرِن", "4:38"], ["قطع", "", 36, 36, "قُطِعَ¦قَطَّعَ¦تَقَطَّعَ¦قِطَع¦قِطْع", "2:27"], ["حين", "", 35, 33, "حِين", "2:36"], ["عفو", "ক্ষমা", 35, 31, "عَفا¦عَفُوّ¦عَفْو¦عافي", "2:52"], ["غفل", "উদাসীনতা", 35, 35, "غافِل¦غَفْلَة¦تَغْفُلُ¦أَغْفَلْ¦غافِلَة", "2:74"], ["كيد", "", 35, 29, "كَيْد¦كِيدُ¦مَكِيد", "3:120"], ["مرر", "", 35, 32, "مَرَّة¦مَرَّ¦مُسْتَمِرّ¦مَرّ¦مِرَّة", "2:229"], ["ورث", "", 35, 34, "وَرِثَ¦أَوْرَثَ¦وارِث¦مِيراث¦تُراث", "2:233"], ["جنح", "", 34, 32, "جُناح¦جَناح¦جَنَحُ", "2:158"], ["خفي", "", 34, 31, "أُخْفِيَ¦يَخْفَى¦يَسْتَخْفُ¦خُفْيَة¦خَفِيّ", "2:271"], ["هزأ", "", 34, 32, "اسْتُهْزِئَ¦هُزُو¦مُسْتَهْزِء", "2:14"], ["وثق", "", 34, 29, "مِيثاق¦مَوْثِق¦وُثْقَى¦وَثاق¦واثَقَ", "2:27"], ["جنب", "", 33, 31, "اجْتَنَبُ¦جانِب¦جَنب¦جُنُب¦اجْنُبْ", "3:191"], ["حجج", "হজ", 33, 26, "حاجَّ¦حَجّ¦حُجَّة¦حَجَّ¦حِجّ", "2:76"], ["شمس", "", 33, 32, "شَمْس", "2:258"], ["ظلل", "", 33, 31, "ظِلّ¦ظَلَّ¦ظُلَّة¦ظَلَّلْ¦ظَلِيل", "2:57"], ["عرش", "", 33, 32, "عَرْش¦مَعْرُوشَة¦يَعْرِشُ", "2:259"], ["عمي", "", 33, 30, "أَعْمَى¦عَمِيَ¦عَمي¦عَمًى¦عُمِّيَتْ", "2:18"], ["قسم", "", 33, 31, "أَقْسَمُ¦قِسْمَة¦قَسَمْ¦قَسَم¦تَسْتَقْسِمُ", "4:8"], ["كفي", "", 33, 32, "كَفَى¦كاف", "2:137"], ["برر", "নেক আমল", 32, 30, "بَرّ¦بِرّ¦تَبَرُّ", "2:44"], ["برك", "", 32, 32, "تَبارَكَ¦مُبارَك¦بارَكَ¦مُبارَكَة¦بَرَكَة", "3:96"], ["ثلث", "", 32, 28, "ثَلاثَة¦ثَلاث¦ثُلُث¦ثُلاث¦ثالِث", "2:196"], ["عصي", "", 32, 32, "عَصا¦عَصِيّ¦مَعْصِيَت¦عِصْيان", "2:61"], ["مدد", "", 32, 29, "مَدَّ¦أَمَدَّ¦مَدّ¦مَمْدُود¦مُمِدّ", "2:15"], ["نصب", "", 32, 29, "نَصِيب¦نَصَب¦نُصُب¦نُصِبَتْ¦نُصْب", "2:202"], ["وري", "", 32, 31, "وَراء¦وُۥرِيَ¦تَوارَتْ¦تُورُ¦مُورِيَة", "2:91"], ["وسع", "", 32, 29, "واسِع¦سَعَة¦وَسِعَ¦وُسْع¦واسِعَة", "2:115"], ["وصي", "", 32, 21, "وَصَّى¦وَصِيَّة¦أَوْصا¦تَواصَ¦مُوص", "2:132"], ["بدو", "", 31, 29, "يُبْدِيَ¦بَدا¦بادِي¦بَدْو¦باد", "2:33"], ["برأ", "", 31, 28, "بَرِيء¦تَبَرَّأَ¦بارِئ¦تُبْرِئُ¦بَراءَة", "2:54"], ["حيث", "", 31, 29, "حَيْث", "2:35"], ["خلص", "ইখলাস", 31, 30, "مُخْلِص¦مُخْلَص¦خالِصَة¦أَخْلَصُ¦خالِص", "2:94"], ["شرر", "", 31, 30, "شَرّ¦شَرَر", "2:216"], ["شفع", "", 31, 26, "شَفاعَة¦شَفِيع¦يَشْفَعُ¦شافِع¦شَفْع", "2:48"], ["طهر", "", 31, 26, "طَهَّرَ¦مُطَهَّرَة¦تَطَهَّرْ¦أَطْهَر¦طَهُور", "2:25"], ["غلب", "", 31, 28, "غَلَبُ¦غالِب¦غَلَب¦مَغْلُوب¦غُلْب", "2:249"], ["قعد", "বসে থাকা", 31, 26, "قَعَدَ¦قاعِد¦مَقْعَد¦قُعُود¦قَواعِد", "2:127"], ["لبث", "", 31, 27, "لَبِثَ¦لابِث", "2:259"], ["هجر", "", 31, 27, "هاجَرَ¦مُهاجِر¦اهْجُرْ¦مَهْجُور¦مُهاجِرَة", "2:218"], ["أفك", "", 30, 29, "أُفِكَ¦إِفْك¦مُؤْتَفِكَة¦أَفّاك", "5:75"], ["أنث", "", 30, 26, "أُنثَى¦أُنثَيَيْن", "2:178"], ["سعي", "", 30, 28, "سَعَى¦سَعْي", "2:114"], ["صرف", "", 30, 29, "صَرَفَ¦صَرَّفْ¦تَصْرِيف¦انصَرَفُ¦مَصْرُوف", "2:164"], ["عسي", "", 30, 28, "عَسَى", "2:216"], ["قصص", "", 30, 25, "قَصَّ¦قَصَص¦قِصاص", "2:178"], ["هود", "", 30, 29, "هادُ¦هُود¦يَهُود", "2:62"], ["ثني", "", 29, 24, "اثْنَيْن¦اثْنَتَيْن¦مَثْنَى¦ثانِي¦مَثانِي", "2:60"], ["جدل", "", 29, 27, "جادَلُ¦جِدال¦جَدَل", "2:197"], ["جند", "", 29, 27, "جُند", "2:249"], ["دري", "", 29, 28, "أَدْرَى¦تَدْرِي", "4:11"], ["رفع", "", 29, 29, "رَفَعَ¦مَرْفُوعَة¦رافِع¦رَفِيع¦مَرْفُوع", "2:63"], ["صير", "", 29, 29, "مَصِير¦تَصِيرُ", "2:126"], ["طير", "", 29, 24, "طَيْر¦طائِر¦اطَّيَّرْ¦يَطِيرُ¦مُسْتَطِير", "2:260"], ["غشو", "", 29, 26, "غَشِيَ¦أُغْشِيَتْ¦غاشِيَة¦غَشَّى¦غِشاوَة", "2:7"], ["فوز", "", 29, 27, "فَوْز¦فائِز¦فازَ¦مَفازَة¦مَفاز", "3:185"], ["ودد", "", 29, 28, "وَدَّ¦مَوَدَّة¦وَدُود¦وُدّ¦وَدّ", "2:96"], ["أبد", "", 28, 28, "أَبَدًا", "2:95"], ["ثقل", "", 28, 26, "مِثْقال¦ثَقَل¦ثَقِيل¦ثَقُلَتْ¦مُثْقَل", "4:40"], ["ثوب", "", 28, 23, "ثَواب¦ثِياب¦أَثابَ¦مَثُوبَة¦مَثابَة", "2:103"], ["حوط", "", 28, 27, "أَحاطَ¦مُحِيط¦مُحِيطَة", "2:19"], ["خلو", "", 28, 28, "خَلا¦خَلُّ¦خالِيَة¦تَخَلَّتْ", "2:14"], ["رجو", "আশা", 28, 27, "يَرْجُوا۟¦تُرْجِي¦مُرْجَوْن¦مَرْجُوّ¦أَرْجائ", "2:218"], ["سبع", "", 28, 24, "سَبْع¦سَبْعَة¦سَبُع", "2:29"], ["شقق", "", 28, 25, "شِقاق¦شاقُّ¦انشَقَّ¦يَشَّقَّقُ¦شَقَقْ", "2:74"], ["عدل", "ন্যায়", 28, 24, "عَدْل¦عَدَلَ", "2:48"], ["نشأ", "", 28, 25, "أَنشَأَ¦نَشْأَة¦يُنَشَّؤُا۟¦مُنشَآت¦إِنشاء", "6:6"], ["يقن", "", 28, 28, "يُوقِنُ¦يَقِين¦مُوقِن¦اسْتَيْقَنَتْ¦مُسْتَيْقِن", "2:4"], ["بوب", "", 27, 24, "باب", "2:58"], ["سير", "", 27, 25, "سارَ¦سُيِّرَتْ¦سَيّارَة¦سَيْر¦سِيرَت", "3:137"], ["شجر", "", 27, 26, "شَجَرَة¦شَجَر¦شَجَرَ", "2:35"], ["عجب", "", 27, 24, "أَعْجَبَ¦عَجِبُ¦عَجَب¦عَجِيب¦عُجاب", "2:204"], ["عشر", "", 27, 26, "عَشْر¦عَشَر¦عَشْرَة¦مَعْشَر¦عَشِيرَت", "2:60"], ["غرر", "", 27, 21, "غَرَّ¦غُرُور¦غَرُور", "3:24"], ["قمر", "", 27, 26, "قَمَر", "6:77"], ["مدن", "", 27, 27, "مَدِينَة¦مَدْيَن¦مَدائِن", "7:85"], ["مسك", "", 27, 24, "أَمْسَكَ¦اسْتَمْسَكَ¦إِمْساك¦يُمَسِّكُ¦مُمْسِك", "2:229"], ["منن", "", 27, 25, "مَنَّ¦مَنّ¦مَمْنُون¦مَنُون", "2:57"], ["وزر", "", 27, 14, "وِزْر¦يَزِرُ¦وازِرَة¦وَزِير¦وَزَر", "6:31"], ["جحم", "", 26, 26, "جَحِيم", "2:119"], ["خزي", "", 26, 24, "أَخْزَيْ¦خِزْى¦مُخْزِي¦نَخْزَى¦أَخْزَى", "2:85"], ["عجز", "", 26, 25, "مُعْجِز¦يُعْجِزَ¦عَجُوز¦مُعاجِز¦أَعْجاز", "5:31"], ["نبت", "", 26, 23, "أَنۢبَتَ¦نَبات¦تَنۢبُتُ", "2:61"], ["هون", "", 26, 26, "مُهِين¦هُون¦هَيِّن¦أَهانَ¦هَوْن", "2:90"], ["وضع", "", 26, 24, "وَضَعَ¦مَواضِع¦أَوْضَعُ¦مَوْضُوعَة", "3:36"], ["أدم", "", 25, 25, "آدَم", "2:31"], ["بسط", "", 25, 23, "بَسَطَ¦باسِط¦بَصطَة¦مَبْسُوطَتان¦بَسْط", "2:245"], ["بطن", "", 25, 25, "بَطْن¦باطِن¦بِطانَة¦بَطَنَ¦باطِنَة", "2:174"], ["حدد", "", 25, 20, "حُدُود¦حَدِيد¦حادَّ¦يُحادُّ¦حِداد", "2:187"], ["حضر", "", 25, 25, "مُحْضَر¦حَضَرَ¦أَحْضَرَتْ¦حاضِرَة¦حاضِرِي", "2:133"], ["حول", "", 25, 25, "حَوْل¦حالَ¦تَحْوِيل¦حِيلَة¦حِوَل", "2:17"], ["سقي", "", 25, 24, "سَقَى¦أَسْقَيْ¦اسْتَسْقَى¦سِقايَة¦سُقْيا", "2:60"], ["شري", "", 25, 23, "اشْتَرَى¦شَرَ", "2:16"], ["صلي", "", 25, 25, "يَصْلَى¦أُصْلِي¦تَصْطَلُ¦صالُوا¦صِلِيّ", "4:10"], ["فلك", "", 25, 25, "فُلْك¦فَلَك", "2:164"], ["قسط", "", 25, 22, "قِسْط¦تُقْسِطُ¦مُقْسِط¦أَقْسَط¦قاسِط", "2:282"], ["لسن", "", 25, 24, "لِسان", "3:78"], ["وعظ", "", 25, 24, "وَعَظْ¦مَوْعِظَة¦واعِظ", "2:66"], ["وهب", "", 25, 22, "وَهَبَ¦وَهّاب", "3:8"], ["أذي", "", 24, 22, "أُوذِيَ¦أَذًى", "2:196"], ["ثمر", "", 24, 22, "ثَمَرَة¦ثَمَر¦أَثْمَرَ", "2:22"], ["جهل", "মূর্খতা", 24, 24, "جاهِل¦يَجْهَلُ¦جاهِلِيَّة¦جَهالَة¦جَهُول", "2:67"], ["ذلل", "অপমান / নম্রতা", 24, 23, "ذِلَّة¦أَذِلَّة¦ذُلّ¦ذَلُول¦ذُلِّلَتْ", "2:61"], ["رقب", "", 24, 20, "رَقَبَة¦رَقِيب¦ارْتَقِبْ¦يَرْقُبُ¦يَتَرَقَّبُ", "2:177"], ["عمر", "", 24, 19, "عُمُر¦يُعَمَّرُ¦عَمَرُ¦عُمْرَة¦اعْتَمَرَ", "2:96"], ["غضب", "", 24, 21, "غَضَب¦غَضِبَ¦غَضْبان¦مَغْضُوب¦مُغاضِب", "1:7"], ["فجر", "", 24, 21, "فَجْر¦فُجِّرَتْ¦فُجّار¦يَفْجُرَ¦تَفْجِير", "2:60"], ["فحش", "", 24, 23, "فاحِشَة¦فَحْشاء", "2:169"], ["كود", "", 24, 24, "كادَ", "2:20"], ["مرض", "রোগ", 24, 23, "مَرَض¦مَرِيض¦مَرِضْ", "2:10"], ["وقع", "", 24, 22, "وَقَعَ¦واقِع¦واقِعَة¦يُوقِعَ¦مُواقِعُو", "4:100"], ["سرع", "", 23, 23, "سَرِيع¦يُسارِعُ¦أَسْرَع¦سِراع", "2:202"], ["سرف", "", 23, 21, "مُسْرِف¦أَسْرَفَ¦إِسْراف", "3:147"], ["طلق", "", 23, 21, "طَلَّقَ¦انطَلَقَ¦طَلاق¦مُطَلَّقَة", "2:227"], ["غرق", "", 23, 23, "أُغْرِقُ¦مُغْرَق¦غَرَق¦غَرْق", "2:50"], ["لبس", "", 23, 20, "لَبَسْ¦لِباس¦لَبُوس¦لَبْس", "2:42"], ["مشي", "হাঁটা", 23, 20, "مَشَ¦مَشْي¦مَشّاء", "2:20"], ["نكح", "", 23, 19, "نَكَحَ¦نِكاح¦تُنكِحُ¦يَسْتَنكِحَ", "2:221"], ["وزن", "", 23, 21, "مِيزان¦وَزْن¦وَزَنُ¦مَوْزُون", "6:152"], ["يتم", "", 23, 22, "يَتِيم", "2:83"], ["ألف", "", 22, 19, "أَلْف¦أَلَّفَ¦إِلاف¦مُؤَلَّفَة", "2:96"], ["ترب", "", 22, 22, "تُراب¦أَتْراب¦تَرائِب¦مَتْرَبَة", "2:264"], ["تمم", "", 22, 20, "أَتَمَّ¦تَمَّ¦تَمام¦مُتِمّ", "2:124"], ["خطأ", "", 22, 20, "خَطِيئَة¦خاطِئ¦أَخْطَأْ¦خَطَأ¦خاطِئَة", "2:58"], ["ربع", "", 22, 21, "أَرْبَعَة¦أَرْبَع¦رُباع¦رُبُع¦رابِع", "2:51"], ["عرب", "", 22, 22, "عَرَبِيّ¦أَعْراب¦عُرُب", "9:90"], ["غوي", "", 22, 18, "أَغْوَيْ¦غاوي¦غَيّ¦غَوَى¦غَوِيّ", "2:256"], ["فرح", "", 22, 21, "فَرِحَ¦فَرِح", "3:120"], ["مني", "", 22, 19, "أُمْنِيَّت¦يَتَمَنَّ¦تَمَنَّى¦يُمْنَى¦يُمَنِّي", "2:78"], ["أثر", "", 21, 21, "أَثَر¦آثَرَ¦أَثارَة¦يُؤْثَرُ", "5:46"], ["بقي", "", 21, 21, "أَبْقَى¦باقِيَة¦بَقِيَّت¦بَقِيَ¦باقي", "2:248"], ["حجر", "", 21, 18, "حِجارَة¦حِجْر¦حَجَر¦مَحْجُور¦حُجُور", "2:24"], ["حذر", "", 21, 19, "يَحْذَرُ¦حِذْر¦حَذَر¦يُحَذِّرُ¦مَحْذُور", "2:19"], ["حلم", "", 21, 20, "حَلِيم¦حُلُم", "2:225"], ["حمم", "", 21, 20, "حَمِيم¦يَحْمُوم", "6:70"], ["سنن", "", 21, 15, "سُنَّة¦مَسْنُون¦سِنّ", "3:137"], ["شهر", "", 21, 17, "شَهْر", "2:185"], ["فتي", "", 21, 19, "يَسْتَفْتُ¦يُفْتِي¦فَتَى¦فِتْيَة¦فَتاة", "4:25"], ["كتم", "", 21, 20, "كَتَمَ", "2:33"], ["نشر", "", 21, 20, "نُشُور¦نُشِرَتْ¦أَنشَرَ¦تَنتَشِرُ¦مَنشُور", "17:13"], ["حزب", "", 20, 17, "حِزْب", "5:56"], ["درج", "", 20, 20, "دَرَجَة¦نَسْتَدْرِجُ", "2:228"], ["ربو", "", 20, 15, "رِبا¦رَبَتْ¦رَبْوَة¦أَرْبَى¦رَبَّيَ", "2:265"], ["سنو", "", 20, 20, "سِنِين¦سَنَة¦سَنا", "2:96"], ["صنع", "", 20, 19, "صَنَعُ¦صُنْع¦اصْطَنَعْ¦صَنْعَة¦مَصانِع", "5:14"], ["فطر", "", 20, 19, "فَطَرَ¦فاطِر¦فِطْرَت¦فُطُور¦مُنفَطِر", "6:14"], ["فقه", "", 20, 20, "يَفْقَهُ¦يَتَفَقَّهُ", "4:78"], ["كشف", "", 20, 20, "كَشَفَ¦كاشِف¦كاشِفَة¦كَشْف", "6:17"], ["لعب", "", 20, 20, "يَلْعَبْ¦لَعِب¦لاعِب", "5:57"], ["مري", "", 20, 19, "يَمْتَرُ¦مِرْيَة¦مُمْتَري¦تَمارَ¦تُمارِ", "2:147"], ["نخل", "", 20, 20, "نَخْل¦نَخِيل¦نَخْلَة", "2:266"], ["نزع", "", 20, 20, "نَزَعَ¦تَنازَعُ¦يُنازِعُ¦نَزّاعَة¦نازِعَة", "3:26"], ["نفخ", "", 20, 18, "نَفَخَ¦نَفْخَة", "3:49"], ["بلد", "", 19, 19, "بَلَد¦بَلْدَة", "2:126"], ["ثمن", "", 19, 19, "ثَمَن¦ثَمانِيَة¦ثُمُن¦ثامِن¦ثَمانِين", "2:41"], ["رشد", "", 19, 19, "رُشْد¦رَشَد¦رَشِيد¦رَشاد¦يَرْشُدُ", "2:186"], ["سعر", "", 19, 19, "سَعِير¦سُعُر¦سُعِّرَتْ", "4:10"], ["صور", "", 19, 17, "صُور¦صَوَّرَ¦صُورَة¦صُرْ¦مُصَوِّر", "2:260"], ["طلع", "", 19, 18, "طَلَعَ¦طَلْع¦طَلَعَت¦طُلُوع¦يُطْلِعَ", "3:179"], ["غرب", "", 19, 17, "مَغْرِب¦غُراب¦غَرَبَت¦غُرُوب¦غَرْبِيَّة", "2:115"], ["فكه", "", 19, 19, "فاكِهَة¦فَواكِه¦فاكِه¦تَفَكَّهُ¦فَكِه", "23:19"], ["ثبت", "", 18, 17, "ثَبَّتْ¦تَثْبِيت¦يُثْبِتُ¦ثابِت¦اثْبُتُ", "2:250"], ["حصن", "", 18, 12, "مُحْصَنَة¦أَحْصَنَتْ¦مُحْصِن¦تَحَصُّن¦حُصُون", "4:24"], ["خصم", "", 18, 17, "اخْتَصَمُ¦خَصِيم¦خَصْم¦تَخاصُم¦خَصِم", "2:204"], ["دبب", "", 18, 18, "دابَّة", "2:164"], ["رأس", "", 18, 17, "رَأْس", "2:196"], ["فرض", "", 18, 14, "فَرَضَ¦فَرِيضَة¦مَفْرُوض¦فارِض", "2:68"], ["فكر", "", 18, 18, "يَتَفَكَّرُ¦فَكَّرَ", "2:219"], ["لدن", "", 18, 17, "لَدُن", "3:8"], ["مكن", "", 18, 16, "مَكَّ¦مَكِين¦أَمْكَنَ", "6:6"], ["ملل", "", 18, 16, "مِلَّة¦يُمِلَّ", "2:120"], ["نفر", "", 18, 16, "نَفَرَ¦نُفُور¦نَفَر¦نَفِير¦مُسْتَنفِرَة", "4:71"], ["نوب", "", 18, 18, "أَنابَ¦مُنِيب", "11:75"], ["أوب", "", 17, 17, "مَآب¦أَوّاب¦أَوِّبِ¦إِياب", "3:14"], ["بوأ", "", 17, 16, "باءَ¦بَوَّأَ¦يَتَبَوَّأُ¦مُبَوَّأ", "2:61"], ["خشع", "বিনয়", 17, 16, "خاشِع¦خَشَعَتِ¦خُشُوع", "2:45"], ["خفف", "", 17, 17, "خَفَّفَ¦خَفَّتْ¦اسْتَخَفَّ¦خَفِيف¦تَخْفِيف", "2:86"], ["ربص", "", 17, 12, "تَرَبَّصْ¦مُتَرَبِّص¦تَرَبُّص", "2:226"], ["زعم", "", 17, 16, "زَعَمَ¦زَعْم¦زَعِيم", "4:60"], ["سور", "", 17, 16, "سُورَة¦أَساوِر¦تَسَوَّرُ¦سُور", "2:23"], ["سوق", "", 17, 16, "سِيقَ¦سُوق¦ساق¦سائِق¦مَساق", "7:57"], ["شرق", "", 17, 17, "مَشْرِق¦مُشْرِق¦شَرْقِيّ¦شَرْقِيَّة¦إِشْراق", "2:115"], ["صفو", "", 17, 16, "اصْطَفَى¦أَصْفَى¦صَفْوان¦مُصْطَفَيْن¦مُصَفًّى", "2:130"], ["عوذ", "", 17, 17, "عُذْ¦اسْتَعِذْ¦مَعاذ¦أُعِيذُ", "2:67"], ["منع", "", 17, 17, "مَنَعَ¦مَنّاع¦مَمْنُوعَة¦مانِعَت¦مَنُوع", "2:114"], ["نقم", "", 17, 16, "انتَقَمْ¦انتِقام¦نَقَمُ¦مُنتَقِم", "3:4"], ["جهر", "", 16, 15, "جَهْر¦جَهَرَ¦جَهْرَة¦جِهار", "2:55"], ["حبط", "", 16, 16, "حَبِطَ¦أَحْبَطَ", "2:217"], ["خبث", "নোংরামি", 16, 10, "خَبِيث¦خَبِيثَة¦خَبُثَ", "2:267"], ["خون", "খিয়ানত", 16, 11, "خانُ¦خائِن¦يَخْتانُ¦خَوّان¦خائِنَة", "2:187"], ["سطر", "", 16, 16, "أَساطِير¦مَسْطُور¦مُصَيْطِر¦مُسْتَطَر¦يَسْطُرُ", "6:25"], ["عتد", "", 16, 16, "أَعْتَدَتْ¦عَتِيد", "4:18"], ["علن", "", 16, 16, "أَعْلَن¦عَلانِيَة", "2:77"], ["غدو", "", 16, 16, "غُدُوّ¦غَد¦غَدَ¦غَداة¦غَداء", "3:121"], ["غلل", "", 16, 13, "غِلّ¦غَلَّ¦مَغْلُولَة", "3:161"], ["فأد", "", 16, 15, "فُؤاد", "6:110"], ["كيل", "", 16, 13, "كَيْل¦مِكْيال¦اكْتالُ¦كالُ", "6:152"], ["لبب", "", 16, 16, "أَلْباب", "2:179"], ["لهو", "", 16, 15, "لَهْو¦أَلْهَى¦لاهِيَة¦تَلَهَّى", "6:32"], ["مهد", "", 16, 15, "مِهاد¦مَهْد¦يَمْهَدُ¦ماهِد¦مَهَّد", "2:206"], ["بدأ", "", 15, 14, "بَدَأَ¦يُبْدِئُ", "7:29"], ["بيع", "", 15, 11, "بَيْع¦بايَعْ¦تَبايَعْ¦بِيَع", "2:254"], ["حرج", "", 15, 11, "حَرَج", "4:65"], ["حرر", "", 15, 11, "تَحْرِير¦حَرّ¦حَرِير¦حُرّ¦مُحَرَّر", "2:178"], ["ركب", "", 15, 15, "رَكِبَ¦رُكْبان¦مُتَراكِب¦رَكْب¦رَكُوب", "2:239"], ["سوم", "", 15, 15, "سِيما¦يَسُومُ¦مُسَوَّمَة¦مُسَوِّم¦تُسِيمُ", "2:49"], ["شكك", "", 15, 15, "شَكّ", "4:157"], ["صمم", "", 15, 14, "أَصَمّ¦صَمُّ¦أَصَمَّ", "2:18"], ["كفف", "", 15, 14, "كَفَّ¦كافَّة¦كَفَّي", "2:208"], ["مسح", "", 15, 12, "مَسِيح¦امْسَحُ¦مَسْح", "3:45"], ["مطر", "", 15, 9, "مَطَر¦أُمْطِرَتْ¦مُمْطِر", "4:102"], ["ثوي", "", 14, 14, "مَثْوًى¦ثاوِي", "3:151"], ["حرث", "", 14, 11, "حَرْث¦تَحْرُثُ", "2:71"], ["رجم", "", 14, 14, "رَجِيم¦رَجَمْ¦رَجْم¦مَرْجُوم¦رُجُوم", "3:36"], ["رسو", "", 14, 14, "رَواسِي¦مُرْسَى¦أَرْسَى", "7:187"], ["زرع", "", 14, 12, "زَرْع¦تَزْرَعُ¦زُرّاع¦زارِع", "6:141"], ["صفف", "", 14, 12, "صَفّ¦صافَّة¦مَصْفُوفَة¦صَوافّ¦صافّ", "18:48"], ["صوم", "রোজা", 14, 11, "صِيام¦يَصُمْ¦صَوْم¦صائِم¦صائِمَة", "2:183"], ["عشو", "", 14, 14, "عَشِيّ¦عِشاء¦يَعْشُ¦عَشِيَّة", "3:41"], ["عطو", "", 14, 12, "أَعْطَى¦عَطاء¦تَعاطَى", "9:29"], ["فقر", "", 14, 14, "فَقِير¦فَقْر¦فاقِرَة", "2:268"], ["لوم", "", 14, 12, "مَلُوم¦لُمْ¦مُلِيم¦لَوْمَة¦لائِم", "5:54"], ["وصف", "", 14, 14, "يَصِفُ¦وَصْف", "6:100"], ["ولج", "", 14, 9, "يُولِجُ¦يَلِجَ¦وَلِيجَة", "3:27"], ["أبي", "", 13, 12, "أَبَى", "2:34"], ["بغت", "", 13, 13, "بَغْتَة", "6:31"], ["جلد", "", 13, 9, "جُلُود¦اجْلِدُ¦جَلْدَة", "4:56"], ["جور", "", 13, 10, "يُجِيرُ¦جار¦اسْتَجارَ¦مُتَجاوِرَة¦جائِر", "4:36"], ["حلف", "", 13, 12, "حَلَفْ¦حَلّاف", "4:62"], ["حور", "", 13, 12, "حَوارِيّ¦حُور¦يُحاوِرُ¦تَحاوُر¦يَحُورَ", "3:52"], ["خزن", "", 13, 13, "خَزائِن¦خَزَنَت¦خازِن", "6:50"], ["خلل", "", 13, 13, "خِلال¦خَلِيل¦خُلَّة", "2:254"], ["رأف", "", 13, 13, "رَءُوف¦رَأْفَة", "2:143"], ["ركع", "", 13, 10, "راكِع¦يَرْكَعُ", "2:43"], ["شهو", "", 13, 13, "اشْتَهَتْ¦شَهَوَة¦شَهْوَة", "3:14"], ["صغر", "", 13, 13, "صاغِر¦صَغِير¦صَغِيرَة¦أَصْغَر¦صَغار", "2:282"], ["صيح", "", 13, 13, "صَيْحَة", "11:67"], ["ضيق", "", 13, 12, "ضاقَ¦ضَيِّق¦ضَيْق¦ضائِق¦تُضَيِّقُ", "6:125"], ["طمأن", "", 13, 12, "اطْمَأَنَّ¦مُطْمَئِنّ¦مُطْمَئِنَّة", "2:260"], ["عصم", "", 13, 12, "اعْتَصَمُ¦يَعْصِمُ¦عاصِم¦اسْتَعْصَمَ¦عِصَم", "3:101"], ["غلظ", "", 13, 13, "غَلِيظ¦اغْلُظْ¦غِلْظَة¦اسْتَغْلَظَ", "3:159"], ["غلم", "", 13, 13, "غُلام", "3:40"], ["فدي", "", 13, 13, "افْتَدَى¦فِدْيَة¦تُفادُ¦فَدَيْ¦فِداء", "2:85"], ["فوه", "", 13, 13, "أَفْواه¦فا", "3:118"], ["قرض", "", 13, 7, "أَقْرَضُ¦قَرْض¦تَقْرِضُ", "2:245"], ["قنت", "", 13, 12, "قانِت¦قانِتَة¦يَقْنُتْ", "2:116"], ["نجم", "", 13, 13, "نَجْم", "6:97"], ["نصح", "", 13, 11, "ناصِح¦نَصَحُ¦نُصْح¦نَصُوح", "7:21"], ["وقت", "", 13, 13, "مِيقات¦وَقْت¦مَوْقُوت¦أُقِّتَتْ", "2:189"], ["يأس", "হতাশা", 13, 11, "يَئِسَ¦يَئُوس¦اسْتَيْأَسَ", "5:3"], ["بخل", "কৃপণতা", 12, 7, "بَخِلَ¦بُخْل", "3:180"], ["بكر", "", 12, 12, "بُكْرَة¦بِكْر¦إِبْكار", "2:68"], ["بيض", "", 12, 12, "أَبْيَض¦ابْيَضَّتْ¦بَيْض", "2:187"], ["جبي", "", 12, 12, "اجْتَبَى¦يُجْبَى¦جَواب", "3:179"], ["جحد", "", 12, 12, "جَحَدُ", "6:33"], ["حسر", "", 12, 12, "حَسْرَة¦حَسْرَت¦مَحْسُور¦يَسْتَحْسِرُ¦حَسْرَتَى", "2:167"], ["حنف", "", 12, 12, "حَنِيف", "2:135"], ["خرر", "", 12, 12, "خَرَّ", "7:143"], ["خطب", "", 12, 12, "خَطْب¦خاطَبَ¦خِطاب¦خِطْبَة", "2:235"], ["خوض", "", 12, 9, "خاضُ¦خَوْض¦خائِض", "4:140"], ["درك", "", 12, 11, "أَدْرَكَ¦ادّارَكَ¦دَرْك¦دَرَك¦مُدْرَك", "4:78"], ["رهب", "", 12, 12, "يَرْهَبُ¦رُهْبان¦اسْتَرْهَبُ¦تُرْهِبُ¦رَهَب", "2:40"], ["سجن", "", 12, 12, "سِجْن¦يُسْجَنَ¦سِجِّين¦مَسْجُون", "12:25"], ["سفر", "", 12, 12, "سَفَر¦أَسْفار¦أَسْفَرَ¦سَفَرَة¦مُسْفِرَة", "2:184"], ["سلك", "", 12, 12, "سَلَكَ", "15:12"], ["شبه", "", 12, 9, "مُتَشابِه¦تَشابَهَ¦شُبِّهَ¦مُشْتَبِه", "2:25"], ["شقو", "", 12, 12, "شَقِيّ¦شَقُ¦أَشْقَى¦شِقْوَت", "11:105"], ["شمل", "", 12, 11, "شِمال¦اشْتَمَلَتْ¦شَمائِل", "6:143"], ["شيع", "", 12, 11, "شِيعَة¦تَشِيعَ", "6:65"], ["طمع", "লোভ", 12, 12, "يَطْمَعُ¦طَمَع", "2:75"], ["طين", "", 12, 12, "طِين", "3:49"], ["عذر", "", 12, 11, "يَعْتَذِرُ¦مَعْذِرَة¦عُذْر¦مُعَذِّر¦مَعاذِير", "7:164"], ["عسر", "", 12, 12, "عُسْر¦عُسْرَة¦عَسِير¦عَسِر¦تَعاسَرْ", "2:185"], ["عصو", "", 12, 12, "عَصا¦عِصِيّ", "2:60"], ["عون", "", 12, 11, "اسْتَعِينُ¦تَعاوَنُ¦مُسْتَعان¦أَعانَ¦عَوان", "1:5"], ["كنن", "", 12, 12, "أَكِنَّة¦مَكْنُون¦أَكْنَن¦أَكْنان", "2:235"], ["لحم", "", 12, 12, "لَحْم", "2:173"], ["نبذ", "", 12, 12, "نَبَذَ¦انتَبَذَتْ", "2:100"], ["نطف", "", 12, 12, "نُطْفَة", "16:4"], ["نطق", "", 12, 11, "يَنطِقُ¦أَنطَقَ¦مَنطِق", "21:63"], ["نيل", "", 12, 10, "يَنالُ¦نَيْل", "2:124"], ["ودي", "", 12, 11, "واد¦دِيَة¦أَوْدِيَة¦وادِي", "4:92"], ["وصل", "", 12, 10, "يَصِلُ¦وَصِيلَة¦وَصَّلْ", "2:27"], ["أيد", "", 11, 11, "أَيَّدَ¦أَيْيد", "2:87"], ["جمل", "", 11, 11, "جَمِيل¦جَمَل¦جَمال¦جُمْلَة¦جِمالَت", "7:40"], ["حرب", "যুদ্ধ", 11, 11, "حَرْب¦مِحْراب¦حارَبَ¦مَحارِيب", "2:279"], ["حصي", "", 11, 11, "أَحْصَى", "14:34"], ["رضع", "", 11, 6, "أَرْضَعَتْ¦رَضاعَة¦يُرْضِعْ¦تَسْتَرْضِعُ¦مُرْضِعَة", "2:233"], ["زبر", "", 11, 11, "زُبُر¦زَبُور¦زُبَر", "3:184"], ["سبب", "", 11, 10, "سَبَب¦يَسُبُّ", "2:166"], ["سحب", "", 11, 11, "سَحاب¦يُسْحَبُ", "2:164"], ["سفه", "", 11, 10, "سَفِيه¦سَفاهَة¦سَفِهَ¦سَفَه", "2:13"], ["شفق", "", 11, 11, "مُشْفِق¦أَشْفَقْ¦شَفَق", "18:49"], ["صعق", "", 11, 10, "صاعِقَة¦صَعِقَ¦صَعِق", "2:19"], ["طبع", "", 11, 11, "طَبَعَ", "4:155"], ["طرف", "", 11, 11, "طَرْف¦طَرَف", "3:127"], ["طرق", "", 11, 11, "طَرِيقَة¦طَرِيق¦طارِق", "4:168"], ["طور", "", 11, 11, "طُور¦أَطْوار", "2:63"], ["عنب", "", 11, 11, "عِنَب", "2:266"], ["غمم", "", 11, 10, "غَمّ¦غَمام¦غُمَّة", "2:57"], ["غيظ", "", 11, 10, "غَيْظ¦يَغِيظُ¦تَغَيُّظ¦غائِظ", "3:119"], ["فأي", "", 11, 9, "فِئَة¦فِئَت", "2:249"], ["فرر", "", 11, 10, "فَرَّتْ¦فِرار¦مَفَرّ", "18:18"], ["قصر", "", 11, 11, "قَصْر¦قاصِرَة¦تَقْصُرُ¦يُقْصِرُ¦مُقَصِّر", "4:101"], ["لغو", "", 11, 11, "لَغْو¦الْغَ¦لاغِيَة", "2:225"], ["ورد", "", 11, 9, "وارِد¦وِرْد¦وَرَدَ¦أَوْرَدَ¦مَوْرُود", "11:98"], ["وقد", "", 11, 11, "أَوْقَدُ¦وَقُود¦اسْتَوْقَدَ¦مُوقَدَة", "2:17"], ["وكأ", "", 11, 11, "مُتَّكِئ¦مُتَّكَأ¦أَتَوَكَّؤُا۟¦يَتَّكِئُ", "12:31"], ["يمم", "", 11, 10, "يَمّ¦تَيَمَّمُ", "2:267"], ["أصل", "", 10, 10, "أَصِيل¦أَصْل", "7:205"], ["بطش", "", 10, 8, "بَطَشْ¦بَطْش¦بَطْشَة", "7:195"], ["جبر", "", 10, 10, "جَبّار", "5:22"], ["جدد", "", 10, 10, "جَدِيد¦جُدَد¦جَدّ", "13:5"], ["حيق", "", 10, 10, "حاقَ", "6:10"], ["دفع", "", 10, 9, "دَفَعْ¦دَفْع¦دافِع¦يُدافِعُ", "2:251"], ["دمر", "", 10, 8, "دَمَّرَ¦تَدْمِير", "7:137"], ["دمو", "", 10, 10, "دَم", "2:30"], ["رجز", "", 10, 9, "رِجْز¦رُجْز", "2:59"], ["رجس", "", 10, 9, "رِجْس", "5:90"], ["رعي", "", 10, 9, "راعِ¦رَعَ¦راعي¦مَرْعَى¦رِعاء", "2:104"], ["رهق", "", 10, 10, "يَرْهَقُ¦يُرْهِقَ¦رَهَق", "10:26"], ["زلف", "", 10, 10, "أُزْلِفَتْ¦زُلْفَى¦زُلْفَة", "11:114"], ["زيل", "", 10, 10, "زالَت¦زَيَّلْ¦تَزَيَّلُ", "2:217"], ["سفل", "", 10, 9, "أَسْفَل¦سافِل¦سُفْلَى", "4:145"], ["سود", "", 10, 9, "سَيِّد¦اسْوَدَّتْ¦مُسْوَدّ¦أَسْوَد¦سُود", "2:187"], ["ضحك", "", 10, 10, "ضَحِكَتْ¦ضاحِك¦أَضْحَكَ¦ضاحِكَة", "9:82"], ["ضيع", "", 10, 10, "أَضاعُ", "2:143"], ["طول", "", 10, 10, "طَوْل¦طالَ¦طَوِيل¦طُول¦تَطاوَلَ", "4:25"], ["عتو", "", 10, 9, "عَتَ¦عِتِيّ¦عُتُوّ¦عاتِيَة", "7:77"], ["عزل", "", 10, 10, "اعْتَزَلَ¦مَعْزِل¦مَعْزُول¦عَزَلْ", "2:222"], ["قدس", "", 10, 10, "قُدُس¦مُقَدَّس¦قُدُّوس¦نُقَدِّسُ¦مُقَدَّسَة", "2:30"], ["قهر", "", 10, 10, "قَهّار¦قاهِر¦تَقْهَرْ", "6:18"], ["كفل", "", 10, 10, "كِفْل¦يَكْفُلُ¦كَفَّلَ¦كَفِيل¦أَكْفِلْ", "3:37"], ["مأي", "", 10, 7, "مِائَة", "2:259"], ["ملو", "", 10, 9, "أَمْلَى¦مَلِيّ", "3:178"], ["نقص", "", 10, 10, "يُنقَصُ¦نَقْص¦مَنقُوص", "2:155"], ["بثث", "", 9, 9, "بَثَّ¦بَثّ¦مُنبَثّ¦مَبْثُوثَة¦مَبْثُوث", "2:164"], ["برز", "", 9, 9, "بَرَزَ¦بُرِّزَتِ¦بارِزَة¦بارِز", "2:250"], ["بقر", "", 9, 9, "بَقَرَة¦بَقَر", "2:67"], ["تجر", "", 9, 8, "تِجارَة", "2:16"], ["حرق", "", 9, 9, "حَرِيق¦حَرِّقُ¦احْتَرَقَتْ", "2:266"], ["حلي", "", 9, 9, "حِلْيَة¦حُلُّ¦حُلِيّ", "7:148"], ["خيل", "", 9, 9, "خَيْل¦مُخْتال¦يُخَيَّلُ", "3:14"], ["دوم", "", 9, 9, "دامُ¦دائِم", "3:75"], ["ذبح", "", 9, 9, "ذُبِحَ¦يُذَبِّحُ¦ذِبْح", "2:49"], ["رمي", "", 9, 7, "رَمَى", "4:112"], ["زني", "", 9, 5, "زانِيَة¦زان¦يَزْنُ¦زِنَى", "17:32"], ["زيغ", "", 9, 8, "زاغَ¦أَزاغَ¦زَيْغ", "3:7"], ["سبت", "", 9, 7, "سَبْت¦سُبات¦يَسْبِتُ", "2:65"], ["سرق", "", 9, 7, "سَرَقَ¦سارِق¦سارِقَة¦اسْتَرَقَ", "5:38"], ["صحف", "", 9, 9, "صُحُف¦صِحاف", "20:133"], ["صعد", "", 9, 9, "صَعِيد¦تُصْعِدُ¦يَصَّعَّدُ¦يَصْعَدُ¦صَعَد", "3:153"], ["عبر", "", 9, 9, "عِبْرَة¦عابِرِي¦تَعْبُرُ¦اعْتَبِرُ", "3:13"], ["عرج", "", 9, 9, "يَعْرُجُ¦أَعْرَج¦مَعارِج", "15:14"], ["عزم", "", 9, 9, "عَزْم¦عَزَمَ", "2:227"], ["عكف", "", 9, 9, "عاكِف¦يَعْكُفُ¦مَعْكُوف", "2:125"], ["عنق", "", 9, 9, "عُنُق", "8:12"], ["عوج", "", 9, 9, "عِوَج", "3:99"], ["عوم", "", 9, 7, "عام", "2:259"], ["غنم", "", 9, 9, "مَغانِم¦غَنَم¦غَنِمْ", "4:94"], ["فرج", "", 9, 9, "فَرْج¦فُرِجَتْ", "21:91"], ["فضض", "", 9, 9, "فِضَّة¦انفَضُّ", "3:14"], ["فيض", "", 9, 8, "أَفاضَ¦تَفِيضُ", "2:198"], ["قبض", "", 9, 7, "قَبَضْ¦قَبْضَة¦مَقْبُوضَة¦قَبْض", "2:245"], ["قذف", "", 9, 8, "قَذَفَ", "20:39"], ["كنز", "", 9, 7, "كَنز¦كَنَزْ", "9:34"], ["لون", "", 9, 7, "لَوْن", "2:69"], ["نقض", "", 9, 9, "نَقَضَتْ¦نَقْض¦أَنقَضَ", "2:27"], ["نوم", "", 9, 9, "مَنام¦نَوْم¦نائِم", "2:255"], ["همم", "", 9, 8, "هَمَّ¦أَهَمَّتْ", "3:122"], ["وقر", "", 9, 9, "وَقْر¦تُوَقِّرُ¦وِقْر¦وَقار", "6:25"], ["وهن", "", 9, 8, "وَهَنَ¦وَهْن¦مُوهِن¦أَوْهَن", "3:139"], ["أني", "", 8, 8, "آناء¦آنِيَة¦إِنَى¦آن¦يَأْنِ", "3:113"], ["أون", "", 8, 8, "آن", "2:71"], ["برهن", "", 8, 8, "بُرْهان", "2:111"], ["بهت", "", 8, 8, "بُهْتان¦بُهِتَ", "2:258"], ["ترف", "", 8, 8, "مُتْرَف¦أُتْرِفُ", "11:116"], ["حجب", "", 8, 8, "حِجاب¦مَحْجُوب", "7:46"], ["ختم", "", 8, 8, "خَتَمَ¦خاتَم¦مَخْتُوم¦خِتام", "2:7"], ["خسف", "", 8, 8, "خَسَفَ", "16:45"], ["خضر", "", 8, 8, "خُضْر¦خَضِر¦مُخْضَرَّة¦أَخْضَر", "6:99"], ["خمس", "", 8, 8, "خَمْسَة¦خامِسَة¦خَمْسِين¦خُمُس", "3:125"], ["خول", "", 8, 6, "خالَة¦خَوَّلَ¦خال", "4:23"], ["دلل", "", 8, 8, "دَلَّ¦دَلِيل", "7:22"], ["رجف", "", 8, 7, "رَجْفَة¦تَرْجُفُ¦مُرْجِف¦راجِفَة", "7:78"], ["رغب", "", 8, 8, "يَرْغَبُ¦راغِب¦رَغَب", "2:130"], ["ستت", "", 8, 8, "سِتَّة¦سِتِّين", "7:54"], ["سري", "", 8, 8, "أَسْرَى¦سَرِيّ¦يَسْرِ", "11:81"], ["سقط", "", 8, 8, "سُقِطَ¦تُسْقِطَ¦تُساقِطْ¦ساقِط", "6:59"], ["سلف", "", 8, 8, "سَلَفَ¦أَسْلَفَتْ¦سَلَف", "2:275"], ["صفح", "", 8, 7, "يَصْفَحُ¦صَفْح", "2:109"], ["صلب", "", 8, 8, "يُصَلَّبُ¦صُلْب¦صَلَبُ", "4:23"], ["صوت", "", 8, 5, "صَوْت", "17:64"], ["ضرع", "", 8, 8, "يَتَضَرَّعُ¦تَضَرُّع¦تَضَرَّعُ¦ضَرِيع", "6:42"], ["عقر", "", 8, 8, "عَقَرَ¦عاقِر", "3:40"], ["عيش", "", 8, 8, "مَعِيشَة¦مَعايِش¦عِيشَة¦مَعاش", "7:10"], ["غبر", "", 8, 8, "غابِر¦غَبَرَة", "7:83"], ["فرط", "", 8, 8, "فَرَّط¦مُفْرَط¦فُرُط¦يَفْرُطَ", "6:31"], ["قبر", "", 8, 8, "قَبْر¦أَقْبَرَ¦مَقابِر", "9:84"], ["كلف", "", 8, 8, "يُكَلِّفُ¦مُتَكَلِّف", "2:233"], ["لطف", "", 8, 8, "لَطِيف¦يَتَلَطَّفْ", "6:103"], ["هبط", "", 8, 8, "يَهْبِطُ", "2:36"], ["وبل", "", 8, 7, "وَبال¦وابِل¦وَبِيل", "2:264"], ["أسو", "", 7, 7, "تَأْسَ¦أُسْوَة", "5:26"], ["بخس", "", 7, 7, "يَبْخَسْ¦بَخْس", "2:282"], ["برج", "", 7, 6, "بُرُوج¦مُتَبَرِّجَة¦تَبَرَّجْ¦تَبَرُّج", "4:78"], ["برق", "", 7, 7, "بَرْق¦أَبارِيق¦بَرِقَ", "2:19"], ["بضع", "", 7, 6, "بِضاعَة¦بِضْع", "12:19"], ["بعل", "", 7, 5, "بَعْل", "2:228"], ["بكي", "", 7, 7, "بَكَتْ¦بُكِيّ¦أَبْكَى", "9:82"], ["تسع", "", 7, 6, "تِسْع¦تِسْعَة", "17:101"], ["حبل", "", 7, 6, "حَبْل", "3:103"], ["حظظ", "", 7, 7, "حَظّ", "3:176"], ["خطف", "", 7, 6, "خَطِفَ¦يَتَخَطَّفَ¦خَطْفَة", "2:20"], ["خمر", "", 7, 7, "خَمْر¦خُمُر", "2:219"], ["دكك", "", 7, 4, "دَكّ¦دُكَّتِ¦دَكّاء¦دَكَّة", "7:143"], ["زيت", "", 7, 6, "زَيْتُون¦زَيْتُونَة¦زَيْت", "6:99"], ["سرح", "", 7, 5, "سَرِّحُ¦سَراح¦تَسْرِيح¦تَسْرَحُ", "2:229"], ["سكر", "", 7, 6, "سُكارَى¦سَكْرَة¦سُكِّرَتْ¦سَكَر", "4:43"], ["ضحو", "", 7, 7, "ضُحًى¦تَضْحَى", "7:98"], ["عصف", "", 7, 6, "عَصْف¦عاصِف¦عاصِفَة", "10:22"], ["عقد", "", 7, 7, "عُقْدَة¦عَقَدَتْ¦عُقُود¦عَقَّد", "2:235"], ["علق", "", 7, 6, "عَلَقَة¦مُعَلَّقَة¦عَلَق", "4:129"], ["عمد", "", 7, 7, "عَمَد¦مُتَعَمِّد¦تَعَمَّدَتْ¦عِماد", "4:93"], ["عمه", "", 7, 7, "يَعْمَهُ", "2:15"], ["غرف", "", 7, 5, "غُرْفَة¦اغْتَرَفَ¦غُرُفَة", "2:249"], ["فيأ", "", 7, 6, "فاءُ¦أَفاءَ¦يَتَفَيَّؤُا۟", "2:226"], ["قسو", "", 7, 6, "قَسَتْ¦قاسِيَة¦قَسْوَة", "2:74"], ["مكث", "", 7, 7, "مَكَثَ¦ماكِث¦مُكْث", "13:17"], ["موج", "", 7, 6, "مَوْج¦يَمُوجُ", "10:22"], ["ندم", "", 7, 7, "نادِم¦نَدامَة", "5:31"], ["نسك", "", 7, 6, "مَنسَك¦نُسُك¦ناسِكُو", "2:128"], ["نصف", "", 7, 7, "نِصْف", "2:237"], ["نكث", "", 7, 6, "نَكَثَ¦أَنكاث", "7:135"], ["نوق", "", 7, 7, "ناقَة", "7:73"], ["وعي", "", 7, 4, "وِعاء¦أَوْعَى¦تَعِيَ¦واعِيَة", "12:76"], ["أدي", "", 6, 5, "يُؤَدِّ¦أَداء", "2:178"], ["أسر", "", 6, 6, "أَسِير¦تَأْسِرُ¦أَسْر", "2:85"], ["بكم", "", 6, 6, "أَبْكَم", "2:18"], ["تبر", "", 6, 4, "تَبَّرْ¦تَتْبِير¦مُتَبَّر¦تَبار", "7:139"], ["ثقف", "", 6, 6, "ثُقِفُ", "2:191"], ["حبر", "", 6, 6, "أَحْبار¦يُحْبَرُ", "5:44"], ["حرف", "", 6, 6, "يُحَرِّفُ¦مُتَحَرِّف¦حَرْف", "2:75"], ["حسس", "", 6, 6, "أَحَسَّ¦تَحُسُّ¦تَحَسَّسُ¦حَسِيس", "3:52"], ["حصد", "", 6, 6, "حَصِيد¦حَصاد¦حَصَد", "6:141"], ["حصر", "", 6, 6, "أُحْصِرُ¦حَصِرَتْ¦حَصُور¦حَصِير", "2:196"], ["حطم", "", 6, 6, "حُطام¦حُطَمَة¦يَحْطِمَ", "27:18"], ["حمر", "", 6, 6, "حِمار¦حُمْر", "2:259"], ["حمي", "", 6, 5, "حَمِيَّة¦حامِيَة¦حام¦يُحْمَى", "5:103"], ["خلط", "", 6, 6, "اخْتَلَطَ¦تُخالِطُ¦خَلَطُ¦خُلَطاء", "2:220"], ["دأب", "", 6, 6, "دَأْب¦دَأَب¦دائِبَيْن", "3:11"], ["درس", "", 6, 6, "دَرَسُ¦دِراسَت", "3:79"], ["ذرأ", "", 6, 6, "ذَرَأَ", "6:136"], ["ردي", "", 6, 6, "أَرْدَى¦مُتَرَدِّيَة¦تَرْدَى¦تَرَدَّى", "5:3"], ["رصد", "", 6, 6, "رَصَد¦مِرْصاد¦مَرْصَد¦إِرْصاد", "9:5"], ["زجر", "", 6, 5, "زَجْرَة¦زاجِرَة¦زَجْر¦مُزْدَجَر¦ازْدُجِرَ", "37:2"], ["زلزل", "", 6, 4, "زُلْزِلُ¦زِلْزال¦زَلْزَلَة", "2:214"], ["زور", "", 6, 6, "زُور¦تَزاوَرُ¦زُرْ", "18:17"], ["سدد", "", 6, 5, "سَدّ¦سَدِيد", "4:9"], ["شفي", "শিফা", 6, 6, "شِفاء¦يَشْفِ", "9:14"], ["صرر", "জেদ", 6, 6, "أَصَرُّ¦صِرّ¦صَرَّة", "3:117"], ["صيد", "", 6, 5, "صَيْد¦اصْطادُ", "5:1"], ["ضوأ", "", 6, 6, "أَضاءَ¦ضِياء", "2:17"], ["ضيف", "", 6, 6, "ضَيْف¦يُضَيِّفُ", "11:78"], ["غرم", "", 6, 6, "مَغْرَم¦غارِم¦غَرام¦مُغْرَم", "9:60"], ["فخر", "", 6, 6, "فَخُور¦فَخّار¦تَفاخُر", "4:36"], ["فرش", "", 6, 6, "فِراش¦فَرْش¦فَرَشْ¦فَراش", "2:22"], ["فرغ", "", 6, 6, "أَفْرِغْ¦فَرَغْ¦فارِغ", "2:250"], ["فزع", "", 6, 6, "فَزِعَ¦فَزَع¦فُزِّعَ", "21:103"], ["قصد", "", 6, 6, "مُقْتَصِد¦مُقْتَصِدَة¦قاصِد¦قَصْد¦اقْصِدْ", "5:66"], ["قمص", "", 6, 6, "قَمِيص", "12:18"], ["قنط", "", 6, 6, "قَنَطُ¦قانِط¦قَنُوط", "15:55"], ["كأس", "", 6, 6, "كَأْس", "37:45"], ["كرر", "", 6, 6, "كَرَّة", "2:167"], ["كظم", "", 6, 6, "كَظِيم¦كاظِم¦مَكْظُوم", "3:134"], ["كلب", "", 6, 4, "كَلْب¦مُكَلِّب", "5:4"], ["كهف", "", 6, 6, "كَهْف", "18:9"], ["لؤلؤ", "", 6, 6, "لُؤْلُؤ", "22:23"], ["لحد", "", 6, 6, "يُلْحِدُ¦مُلْتَحَد¦إِلْحاد", "7:180"], ["لحق", "", 6, 6, "أَلْحَقْ¦يَلْحَقُ", "3:170"], ["لوح", "", 6, 6, "لَوْح¦لَوّاحَة", "7:145"], ["مرج", "", 6, 6, "مَرَجَ¦مَرْجان¦مَرِيج¦مارِج", "25:53"], ["مقت", "", 6, 5, "مَقْت", "4:22"], ["مهل", "", 6, 5, "مُهْل¦مَهِّلِ¦أَمْهِلْ", "18:29"], ["ميل", "", 6, 3, "يَمِيلُ¦مَيْل¦مَيْلَة", "4:27"], ["ندد", "", 6, 6, "أَنداد", "2:22"], ["نزغ", "", 6, 4, "نَزَغَ¦نَزْغ", "7:200"], ["وطأ", "", 6, 5, "يَطَأُ¦يُواطِئُ¦مَوْطِئ¦وَطْء", "9:37"], ["أرك", "", 5, 5, "أَرائِك", "18:31"], ["أسف", "", 5, 5, "أَسِف¦أَسَف¦آسَفُ", "7:150"], ["برد", "", 5, 5, "بَرْد¦بارِد¦بَرَد", "21:69"], ["بغض", "ঘৃণা", 5, 5, "بَغْضاء", "3:118"], ["بلس", "", 5, 5, "مُبْلِس¦يُبْلِسُ", "6:44"], ["بور", "", 5, 5, "بُور¦يَبُورُ¦بَوار", "14:28"], ["ثبر", "", 5, 4, "ثُبُور¦مَثْبُور", "17:102"], ["ثور", "", 5, 5, "أَثارُ", "2:71"], ["جثم", "", 5, 5, "جاثِم", "7:78"], ["جلو", "", 5, 5, "تَجَلَّى¦جَلَّى¦جَلاء", "7:143"], ["جوز", "", 5, 5, "جاوَزَ¦نَتَجاوَزُ", "2:249"], ["جوع", "", 5, 5, "جُوع¦تَجُوعَ", "2:155"], ["حرص", "", 5, 5, "حَرَصْ¦أَحْرَص¦حَرِيص", "2:96"], ["حسد", "", 5, 4, "حَسَدَ¦حَسَد¦حاسِد", "2:109"], ["حصب", "", 5, 5, "حاصِب¦حَصَب", "17:68"], ["حوت", "", 5, 5, "حُوت", "7:163"], ["حيص", "", 5, 5, "مَحِيص", "4:121"], ["خدع", "", 5, 3, "يُخادِعُ¦يَخْدَعُ¦خادِع", "2:9"], ["خرص", "", 5, 5, "يَخْرُصُ¦خَرّاص", "6:116"], ["خطو", "", 5, 4, "خُطُوَة", "2:168"], ["خنزر", "", 5, 5, "خِنزِير", "2:173"], ["خوي", "", 5, 5, "خاوِيَة", "2:259"], ["خيب", "", 5, 5, "خابَ¦خائِب", "3:127"], ["درأ", "", 5, 5, "يَدْرَؤُا۟¦ادّارَأَ", "2:72"], ["دهن", "", 5, 4, "يُدْهِنُ¦دُهْن¦دِهان¦مُدْهِن", "23:20"], ["ذرع", "", 5, 4, "ذَرْع¦ذِراع", "11:77"], ["ذمم", "", 5, 5, "مَذْمُوم¦ذِمَّة", "9:8"], ["ربط", "", 5, 5, "رَبَطْ¦رابِطُ¦رِباط", "3:200"], ["رعب", "", 5, 5, "رُعْب", "3:151"], ["رفق", "", 5, 5, "مُرْتَفَق¦رَفِيق¦مَرافِق¦مِرْفَق", "4:69"], ["زهق", "", 5, 4, "زَهَقَ¦زَهُوق¦زاهِق", "9:55"], ["سبط", "", 5, 5, "أَسْباط", "2:136"], ["سدس", "", 5, 4, "سُدُس¦سادِس", "4:11"], ["سنبل", "", 5, 4, "سُنبُلَة¦سُنبُل", "2:261"], ["شتت", "", 5, 5, "شَتَّى¦أَشْتات", "20:53"], ["شحح", "", 5, 4, "شُحّ", "4:128"], ["شرح", "", 5, 5, "شَرَحَ", "6:125"], ["شرع", "", 5, 5, "شَرَعَ¦شِرْعَة¦شُرَّع¦شَرِيعَة", "5:48"], ["شطر", "", 5, 3, "شَطْر", "2:144"], ["شهب", "", 5, 5, "شِهاب¦شُهُب", "15:18"], ["صبب", "", 5, 4, "صَبَّ¦صَبّ", "22:19"], ["صدع", "", 5, 5, "اصْدَعْ¦يَصَّدَّعُ¦يُصَدَّعُ¦مُتَصَدِّع¦صَدْع", "15:94"], ["صدف", "", 5, 3, "صَدَفَ¦صَدَفَيْن", "6:46"], ["صرخ", "", 5, 4, "مُصْرِخ¦يَسْتَصْرِخُ¦يَصْطَرِخُ¦صَرِيخ", "14:22"], ["صفر", "", 5, 5, "مُصْفَرّ¦صَفْراء¦صُفْر", "2:69"], ["صنم", "", 5, 5, "أَصْنام", "6:74"], ["طرد", "", 5, 4, "طَرَد¦طارِد", "6:52"], ["طمس", "", 5, 5, "طُمِسَتْ", "4:47"], ["طوي", "", 5, 4, "طُوًى¦نَطْوِي¦طَىّ¦مَطْوِيَّة", "20:12"], ["عتب", "", 5, 4, "يَسْتَعْتِبُ¦مُعْتَب", "16:84"], ["عثو", "", 5, 5, "تَعْثَ", "2:60"], ["عصب", "", 5, 5, "عُصْبَة¦عَصِيب", "11:77"], ["عصر", "", 5, 5, "يَعْصِرُ¦إِعْصار¦مُعْصِرَة¦عَصْر", "2:266"], ["عمم", "", 5, 3, "عَمَّة¦عَمّ", "4:23"], ["عنت", "", 5, 5, "عَنِ¦أَعْنَتَ¦عَنَت", "2:220"], ["غوث", "", 5, 4, "اسْتَغاثَ¦يُغاثُ", "8:9"], ["فرد", "", 5, 5, "فَرْد¦فُرادَى", "6:94"], ["فوت", "", 5, 5, "فاتَ¦فَوْت¦تَفاوُت", "3:153"], ["فوج", "", 5, 5, "فَوْج", "27:83"], ["قتر", "", 5, 5, "مُقْتِر¦قَتَر¦قَتُور¦يَقْتُرُ¦قَتَرَة", "2:236"], ["قدد", "", 5, 5, "قُدَّ¦قِدَد", "12:25"], ["قرع", "", 5, 5, "قارِعَة", "13:31"], ["قرف", "", 5, 4, "اقْتَرَفْ¦مُقْتَرِف", "6:113"], ["قصو", "", 5, 5, "أَقْصا¦قُصْوَى¦قَصِيّ", "8:42"], ["قطر", "", 5, 5, "قِطْر¦أَقْطار¦قَطِران", "14:50"], ["قفو", "", 5, 4, "قَفَّيْ¦تَقْفُ", "2:87"], ["كسف", "", 5, 5, "كِسَف¦كِسْف", "17:92"], ["كسو", "", 5, 5, "كَسَوْ¦كِسْوَت", "2:233"], ["كمل", "", 5, 5, "أَكْمَلْ¦كامِلَة¦كامِلَيْن", "2:185"], ["كوكب", "", 5, 5, "كَوْكَب", "6:76"], ["لزم", "", 5, 5, "أَلْزَمَ¦لِزام", "11:28"], ["لمس", "", 5, 5, "لَمَسُ¦الْتَمِسُ", "4:43"], ["لوي", "", 5, 5, "يَلْ¦لَيّ¦لَوَّ", "3:78"], ["لين", "", 5, 5, "لِن¦لَيِّن¦أَلَ¦لِينَة", "3:159"], ["مرد", "", 5, 5, "مَرِيد¦مَرَدُ¦مُمَرَّد¦مارِد", "4:117"], ["مصر", "", 5, 5, "مِصْر", "2:61"], ["مضي", "", 5, 5, "مَضَى¦مُضِيّ", "8:38"], ["ميد", "", 5, 5, "تَمِيدَ¦مائِدَة", "5:112"], ["نسف", "", 5, 3, "نُسِفَتْ¦نَسْف", "20:97"], ["نشز", "", 5, 4, "نُشُوز¦انشُزُ¦نُنشِزُ", "2:259"], ["نفد", "", 5, 4, "نَفِدَ¦نَفاد", "16:96"], ["نقذ", "", 5, 5, "أَنقَذَ¦يَسْتَنقِذُ", "3:103"], ["نكل", "", 5, 5, "نَكال¦تَنكِيل¦أَنكال", "2:66"], ["هزز", "", 5, 5, "اهْتَزَّتْ¦هُزِّ", "19:25"], ["هلل", "", 5, 5, "أُهِلَّ¦أَهِلَّة", "2:173"], ["وجل", "", 5, 5, "وَجِلَتْ¦وَجِل¦وَجِلَة", "8:2"], ["وزع", "", 5, 5, "يُوزَعُ¦أَوْزِعْ", "27:17"], ["وسط", "", 5, 5, "أَوْسَط¦وَسَط¦وُسْطَى¦وَسَطْ", "2:143"], ["وسوس", "", 5, 5, "وَسْوَسَ¦وَسْواس", "7:20"], ["أفل", "", 4, 3, "أَفَلَ¦آفِل", "6:76"], ["أمد", "", 4, 4, "أَمَد", "3:30"], ["بدع", "", 4, 4, "بَدِيع¦بِدْع¦ابْتَدَعُ", "2:117"], ["بول", "", 4, 4, "بال", "12:50"], ["تبب", "", 4, 3, "تَبَّ¦تَتْبِيب¦تَباب", "11:101"], ["جدر", "", 4, 4, "جِدار¦أَجْدَر¦جُدُر", "9:97"], ["جرح", "", 4, 4, "جَوارِح¦جُرُوح¦جَرَحْ¦اجْتَرَحُ", "5:4"], ["جسد", "", 4, 4, "جَسَد", "7:148"], ["جهز", "", 4, 2, "جَهَّزَ¦جَهاز", "12:59"], ["حمأ", "", 4, 4, "حَمَإ¦حَمِئَة", "15:26"], ["حيض", "", 4, 2, "مَحِيض¦يَحِضْ", "2:222"], ["خرق", "", 4, 3, "خَرَقَ", "6:100"], ["خسأ", "", 4, 4, "خاسِئ¦اخْسَأُ", "2:65"], ["خصص", "", 4, 4, "يَخْتَصُّ¦خاصَّة¦خَصاصَة", "2:105"], ["خفض", "", 4, 4, "اخْفِضْ¦خافِضَة", "15:88"], ["دحر", "", 4, 4, "مَدْحُور¦دُحُور", "7:18"], ["دحض", "", 4, 4, "يُدْحِضُ¦مُدْحَض¦داحِضَة", "18:56"], ["دخر", "", 4, 4, "داخِر", "16:48"], ["درر", "", 4, 4, "مِدْرار¦دُرِّيّ", "6:6"], ["دلو", "", 4, 3, "أَدْلَى¦دَلْو¦تَدَلَّى", "2:188"], ["رتل", "", 4, 2, "رَتَّلْ¦تَرْتِيل", "25:32"], ["رحب", "", 4, 4, "رَحُبَتْ¦مَرْحَب", "9:25"], ["رحل", "", 4, 4, "رَحْل¦رِحْلَة", "12:62"], ["رذل", "", 4, 4, "أَرْذَل", "11:27"], ["رقي", "", 4, 3, "تَرْقَى¦رُقِيّ¦يَرْتَقُ¦راق", "17:93"], ["ركن", "", 4, 4, "رُكْن¦تَرْكَنُ", "11:80"], ["زخرف", "", 4, 4, "زُخْرُف", "6:112"], ["زلل", "", 4, 4, "زَلَلْ¦أَزَلَّ¦اسْتَزَلَّ", "2:36"], ["زول", "", 4, 3, "زالَ¦زَوال", "14:44"], ["سجل", "", 4, 4, "سِجِّيل¦سِجِلّ", "11:82"], ["سحت", "", 4, 4, "سُحْت¦يُسْحِتَ", "5:42"], ["سخط", "অসন্তোষ", 4, 4, "سَخِطَ¦سَخَط¦أَسْخَطَ", "3:162"], ["سدر", "", 4, 4, "سِدْر¦سِدْرَة", "34:16"], ["سرب", "", 4, 4, "سَراب¦سارِب¦سَرَب", "13:10"], ["سرج", "", 4, 4, "سِراج", "25:61"], ["سفح", "", 4, 4, "مُسافِح¦مُسافِحَة¦مَسْفُوح", "4:24"], ["سفن", "", 4, 3, "سَفِينَة", "18:71"], ["سقف", "", 4, 4, "سَقْف", "16:26"], ["سلح", "", 4, 1, "أَسْلِحَت", "4:102"], ["سمر", "", 4, 4, "سامِرِيّ¦سامِر", "20:85"], ["سمم", "", 4, 4, "سَمُوم¦سَمّ", "7:40"], ["سمن", "", 4, 4, "سَمِين¦يُسْمِنُ", "12:43"], ["سول", "", 4, 4, "سَوَّلَ", "12:18"], ["سيل", "", 4, 3, "سَيْل¦سالَتْ¦أَسَلْ", "13:17"], ["شأن", "", 4, 4, "شَأْن", "10:61"], ["شور", "", 4, 4, "تَشاوُر¦شاوِرْ¦أَشارَتْ¦شُورَى", "2:233"], ["شيخ", "", 4, 4, "شَيْخ", "11:72"], ["صرح", "", 4, 3, "صَرْح", "27:44"], ["صلصل", "", 4, 4, "صَلْصال", "15:26"], ["طبق", "", 4, 3, "طَبَق", "67:3"], ["طفل", "", 4, 4, "طِفْل", "22:5"], ["طلب", "", 4, 3, "يَطْلُبُ¦طَلَب¦طالِب¦مَطْلُوب", "7:54"], ["طوق", "", 4, 4, "طاقَة¦يُطِيقُ¦يُطَوَّقُ", "2:184"], ["عجم", "", 4, 3, "أَعْجَمِيّ¦أَعْجَمِين", "16:103"], ["عفف", "", 4, 4, "يَسْتَعْفِفْ¦تَعَفُّف", "2:273"], ["عقم", "", 4, 4, "عَقِيم", "22:55"], ["عور", "", 4, 3, "عَوْرَة", "24:31"], ["غسق", "", 4, 4, "غَسّاق¦غَسَق¦غاسِق", "17:78"], ["غسل", "", 4, 4, "تَغْتَسِلُ¦اغْسِلُ¦مُغْتَسَل¦غِسْلِين", "4:43"], ["غضض", "", 4, 4, "يَغُضُّ", "24:30"], ["غمر", "", 4, 4, "غَمْرَة¦غَمَرَة", "6:93"], ["غور", "", 4, 4, "غَوْر¦غار¦مَغارَة", "9:40"], ["غيث", "", 4, 4, "غَيْث¦يُغاثُ", "12:49"], ["فشل", "", 4, 4, "فَشِلْ", "3:122"], ["فلق", "", 4, 4, "فالِق¦انفَلَقَ¦فَلَق", "6:95"], ["فور", "", 4, 4, "فارَ¦فَوْر", "3:125"], ["قلد", "", 4, 4, "قَلائِد¦مَقالِيد", "5:2"], ["قلم", "", 4, 4, "قَلَم", "3:44"], ["قنطر", "", 4, 3, "قِنطار¦مُقَنطَرَة", "3:14"], ["كرب", "", 4, 4, "كَرْب", "6:64"], ["كعب", "", 4, 4, "كَعْبَة¦كَعْبَيْن¦كَواعِب", "5:6"], ["كوب", "", 4, 4, "أَكْواب", "43:71"], ["لجج", "", 4, 4, "لَجُّ¦لُجِّيّ¦لُجَّة", "23:75"], ["لمز", "", 4, 4, "يَلْمِزُ¦لُمَزَة", "9:58"], ["مجد", "", 4, 4, "مَجِيد", "11:73"], ["مزق", "", 4, 2, "مُزِّقْ¦مُمَزَّق", "34:7"], ["مهن", "", 4, 4, "مَهِين", "32:8"], ["ميز", "", 4, 4, "يَمِيزَ¦امْتازُ¦تَمَيَّزُ", "3:179"], ["نحت", "", 4, 4, "يَنْحِتُ", "7:74"], ["نسخ", "", 4, 4, "يَنسَخُ¦نُسْخَت¦نَسْتَنسِخُ", "2:106"], ["نسل", "", 4, 4, "نَسْل¦يَنسِلُ", "2:205"], ["نصي", "", 4, 4, "ناصِيَة¦نَواصِي", "11:56"], ["نعج", "", 4, 2, "نَعْجَة", "38:23"], ["نفل", "", 4, 3, "أَنفال¦نافِلَة", "8:1"], ["نقر", "", 4, 3, "نَقِير¦نُقِرَ¦ناقُور", "4:53"], ["نمل", "", 4, 2, "نَمْل¦أَنامِل¦نَمْلَة", "3:119"], ["هات", "", 4, 4, "هاتُ", "2:111"], ["هنأ", "", 4, 4, "هَنِيئ", "4:4"], ["هيأ", "", 4, 4, "هَيْئَة¦يُهَيِّئْ", "3:49"], ["ودع", "", 4, 4, "مُسْتَوْدَع¦دَعْ¦وَدَّعَ", "6:98"], ["ورق", "", 4, 4, "وَرَق¦وَرَقَة¦وَرِق", "6:59"], ["وفق", "", 4, 4, "تَوْفِيق¦يُوَفِّقِ¦وِفاق", "4:35"], ["وقف", "", 4, 4, "وُقِفُ¦مَوْقُوف", "6:27"], ["يبس", "", 4, 4, "يابِسَة¦يابِس¦يَبَس", "6:59"], ["أبل", "", 3, 3, "إِبِل¦أَبابِيل", "6:144"], ["أجج", "", 3, 3, "أُجاج", "25:53"], ["أزف", "", 3, 2, "آزِفَة¦أَزِفَتِ", "40:18"], ["أسس", "", 3, 2, "أَسَّسَ", "9:108"], ["أصر", "", 3, 3, "إِصْر", "2:286"], ["أفف", "", 3, 3, "أُفّ", "17:23"], ["أفق", "", 3, 3, "أُفُق", "41:53"], ["أنف", "", 3, 2, "أَنف¦آنِف", "5:45"], ["بذر", "", 3, 2, "تُبَذِّرْ¦تَبْذِير¦مُبَذِّر", "17:26"], ["برح", "", 3, 3, "أَبْرَحَ", "12:80"], ["برزخ", "", 3, 3, "بَرْزَخ", "23:100"], ["بهج", "", 3, 3, "بَهِيج¦بَهْجَة", "22:5"], ["بهم", "", 3, 3, "بَهِيمَة", "5:1"], ["ثلل", "", 3, 3, "ثُلَّة", "56:13"], ["جأر", "", 3, 3, "يَجْأَرُ", "16:53"], ["جثو", "", 3, 3, "جِثِيّ¦جاثِيَة", "19:68"], ["جدث", "", 3, 3, "أَجْداث", "36:51"], ["جذع", "", 3, 3, "جِذْع", "19:23"], ["جزأ", "", 3, 3, "جُزْء", "2:260"], ["جيب", "", 3, 3, "جَيْب", "24:31"], ["حدق", "", 3, 3, "حَدائِق", "27:60"], ["حرض", "", 3, 3, "حَرِّضِ¦حَرَض", "4:84"], ["حضض", "", 3, 3, "يَحُضُّ¦تَحاضُّ", "69:34"], ["حفو", "", 3, 3, "حَفِيّ¦يُحْفِ", "7:187"], ["حلق", "", 3, 3, "تَحْلِقُ¦مُحَلِّق¦حُلْقُوم", "2:196"], ["حوج", "", 3, 3, "حاجَة", "12:68"], ["خبت", "", 3, 3, "أَخْبَتُ¦مُخْبِت", "11:23"], ["خذل", "পরিত্যাগ", 3, 3, "يَخْذُلْ¦مَخْذُول¦خَذُول", "3:160"], ["خفت", "", 3, 3, "يَتَخافَتُ¦تُخافِتْ", "17:110"], ["خيط", "", 3, 2, "خَيْط¦خِياط", "2:187"], ["دعع", "", 3, 2, "يَدُعُّ¦دَعّ", "52:13"], ["ذأب", "", 3, 3, "ذِئْب", "12:13"], ["ذرو", "", 3, 2, "تَذْرُو¦ذارِيَة¦ذَرْو", "18:45"], ["ذقن", "", 3, 3, "أَذْقان", "17:107"], ["ردف", "", 3, 3, "مُرْدِف¦رَدِفَ¦رادِفَة", "8:9"], ["رغد", "", 3, 3, "رَغَد", "2:35"], ["رقم", "", 3, 3, "مَرْقُوم¦رَقِيم", "18:9"], ["ركض", "", 3, 3, "يَرْكُضُ", "21:12"], ["ركم", "", 3, 3, "يَرْكُمَ¦رُكام¦مَرْكُوم", "8:37"], ["رمن", "", 3, 3, "رُمّان", "6:99"], ["رهط", "", 3, 3, "رَهْط", "11:91"], ["رهن", "", 3, 3, "رِهان¦رَهِين¦رَهِينَة", "2:283"], ["روغ", "", 3, 3, "راغَ", "37:91"], ["زبد", "", 3, 1, "زَبَد", "13:17"], ["زجو", "", 3, 3, "يُزْجِي¦مُزْجاة", "12:88"], ["زفر", "", 3, 3, "زَفِير", "11:106"], ["زقم", "", 3, 3, "زَقُّوم", "37:62"], ["سأم", "", 3, 3, "يَسْأَمُ", "2:282"], ["ستر", "", 3, 3, "مَسْتُور¦سِتْر¦تَسْتَتِرُ", "17:45"], ["سجر", "", 3, 3, "يُسْجَرُ¦مَسْجُور¦سُجِّرَتْ", "40:72"], ["سربل", "", 3, 2, "سَرابِيل", "14:50"], ["سلخ", "", 3, 3, "انسَلَخَ¦نَسْلَخُ", "7:175"], ["سلسل", "", 3, 3, "سِلْسِلَة", "40:71"], ["سلل", "", 3, 3, "سُلالَة¦يَتَسَلَّلُ", "23:12"], ["سلو", "", 3, 3, "سَلْوَى", "2:57"], ["سوغ", "", 3, 3, "سائِغ¦يُسِيغُ", "14:17"], ["سيح", "", 3, 3, "سِيحُ¦سائِح¦سائِحَة", "9:2"], ["شأم", "", 3, 2, "مَشْأَمَة", "56:9"], ["شحن", "", 3, 3, "مَشْحُون", "26:119"], ["شطط", "", 3, 3, "شَطَط¦تُشْطِطْ", "18:14"], ["شكو", "", 3, 3, "أَشْكُوا۟¦مِشْكاة¦تَشْتَكِي", "12:86"], ["شنأ", "", 3, 3, "شَنَآن¦شانِئ", "5:2"], ["شيب", "", 3, 3, "شَيْب¦شَيْبَة¦شِيب", "19:4"], ["صبأ", "", 3, 3, "صابِئ", "2:62"], ["صبغ", "", 3, 2, "صِبْغَة¦صِبْغ", "2:138"], ["صبو", "", 3, 3, "صَبِيّ¦أَصْبُ", "12:33"], ["صخر", "", 3, 3, "صَخْرَة¦صَخْر", "18:63"], ["صرصر", "", 3, 3, "صَرْصَر", "41:16"], ["صرم", "", 3, 3, "يَصْرِمُ¦صَرِيم¦صارِم", "68:17"], ["ضجع", "", 3, 3, "مَضاجِع", "3:154"], ["ضغث", "", 3, 3, "ضِغْث", "12:44"], ["طفأ", "", 3, 3, "أَطْفَأَ", "5:64"], ["طفق", "", 3, 3, "طَفِقَ", "7:22"], ["ظمأ", "", 3, 3, "ظَمَأ¦تَظْمَؤُا۟¦ظَمْآن", "9:120"], ["عبس", "", 3, 3, "عَبَسَ¦عَبُوس", "74:22"], ["عرو", "", 3, 3, "عُرْوَة¦اعْتَرَى", "2:256"], ["عري", "", 3, 3, "عَراء¦تَعْرَى", "20:118"], ["عزر", "", 3, 3, "عَزَّرُ", "5:12"], ["عير", "", 3, 3, "عِير", "12:70"], ["فتر", "", 3, 3, "فَتْرَة¦يَفْتُرُ¦يُفَتَّرُ", "5:19"], ["فتل", "", 3, 3, "فَتِيل", "4:49"], ["فجج", "", 3, 3, "فَجّ", "21:31"], ["فرت", "", 3, 3, "فُرات", "25:53"], ["فزز", "", 3, 3, "يَسْتَفِزَّ", "17:64"], ["فسح", "", 3, 1, "يَفْسَحِ¦تَفَسَّحُ", "58:11"], ["فقد", "", 3, 3, "تَفْقِدُ¦تَفَقَّدَ", "12:71"], ["قبس", "", 3, 3, "قَبَس¦نَقْتَبِسْ", "20:10"], ["قرح", "", 3, 2, "قَرْح", "3:140"], ["قرد", "", 3, 3, "قِرَدَة", "2:65"], ["كبت", "", 3, 2, "كُبِتَ", "3:127"], ["كور", "", 3, 2, "كُوِّرَتْ", "39:5"], ["لجأ", "", 3, 3, "مَلْجَإ", "9:57"], ["لذذ", "", 3, 3, "لَذَّة¦تَلَذُّ", "37:46"], ["لفت", "", 3, 3, "يَلْتَفِتْ¦تَلْفِتَ", "10:78"], ["لفف", "", 3, 3, "لَفِيف¦الْتَفَّتِ¦أَلْفاف", "17:104"], ["لفو", "", 3, 3, "أَلْفَ", "2:170"], ["لقف", "", 3, 3, "تَلْقَفُ", "7:117"], ["لهب", "", 3, 3, "لَهَب", "77:31"], ["متن", "", 3, 3, "مَتِين", "7:183"], ["محو", "", 3, 3, "مَحَوْ", "13:39"], ["مرح", "", 3, 3, "مَرَح¦تَمْرَحُ", "17:37"], ["مزج", "", 3, 3, "مِزاج", "76:5"], ["مضغ", "", 3, 2, "مُضْغَة", "22:5"], ["مور", "", 3, 2, "تَمُورُ¦مَوْر", "52:9"], ["نأي", "", 3, 3, "نَأَى", "6:26"], ["نثر", "", 3, 3, "مَنثُور¦انتَثَرَتْ", "25:23"], ["نحس", "", 3, 3, "نَحِسَة¦نَحْس¦نُحاس", "41:16"], ["نسب", "", 3, 3, "نَسَب", "23:101"], ["نضد", "", 3, 3, "مَنضُود¦نَضِيد", "11:82"], ["نضر", "", 3, 3, "نَضْرَة¦ناضِرَة", "75:22"], ["نفذ", "", 3, 1, "تَنفُذُ", "55:33"], ["نقب", "", 3, 3, "نَقِيب¦نَقْب¦نَقَّبُ", "5:12"], ["نكس", "", 3, 3, "نُكِسُ¦ناكِسُوا¦نُنَكِّسْ", "21:65"], ["نكف", "", 3, 2, "اسْتَنكَفُ", "4:172"], ["هزم", "", 3, 3, "هَزَمُ¦مَهْزُوم", "2:251"], ["هطع", "", 3, 3, "مُهْطِع", "14:43"], ["همز", "", 3, 3, "هَمَزَة¦هَمّاز¦هُمَزَة", "23:97"], ["وتد", "", 3, 3, "أَوْتاد", "38:12"], ["وتر", "", 3, 3, "تَتْرا¦يَتِرَ¦وَتْر", "23:44"], ["وثن", "", 3, 3, "أَوْثان", "22:30"], ["وجس", "", 3, 3, "أَوْجَسَ", "11:70"], ["وصد", "", 3, 3, "مُؤْصَدَة¦وَصِيد", "18:18"], ["أثث", "", 2, 2, "أَثاث", "16:80"], ["أرب", "", 2, 2, "مَآرِب¦إِرْبَة", "20:18"], ["أزر", "", 2, 2, "أَزْر¦آزَرَ", "20:31"], ["أزز", "", 2, 1, "تَؤُزُّ¦أَزّ", "19:83"], ["أشر", "", 2, 2, "أَشِر", "54:25"], ["ألل", "", 2, 2, "إِلّ", "9:8"], ["أمل", "", 2, 2, "أَمَل", "15:3"], ["أمو", "", 2, 2, "أَمَة", "2:221"], ["أوه", "", 2, 2, "أَوّاه", "9:114"], ["بتل", "", 2, 1, "تَبَتَّلْ¦تَبْتِيل", "73:8"], ["بخع", "", 2, 2, "باخِع", "18:6"], ["بدن", "", 2, 2, "بَدَن¦بُدْن", "10:92"], ["برص", "", 2, 2, "أَبْرَص", "3:49"], ["برم", "", 2, 1, "أَبْرَمُ¦مُبْرِم", "43:79"], ["بزغ", "", 2, 2, "بازِغ¦بازِغَة", "6:77"], ["بسر", "", 2, 2, "بَسَرَ¦باسِرَة", "74:22"], ["بسس", "", 2, 1, "بُسَّتِ¦بَسّ", "56:5"], ["بسل", "", 2, 1, "أُبْسِلُ", "6:70"], ["بطر", "", 2, 2, "بَطَر¦بَطِرَتْ", "8:47"], ["بعثر", "", 2, 2, "بُعْثِرَ", "82:4"], ["بعر", "", 2, 2, "بَعِير", "12:65"], ["بنن", "", 2, 2, "بَنان", "8:12"], ["تور", "", 2, 2, "تارَة", "17:69"], ["ثخن", "", 2, 2, "أَثْخَن", "8:67"], ["ثعب", "", 2, 2, "ثُعْبان", "7:107"], ["ثقب", "", 2, 2, "ثاقِب", "37:10"], ["جبب", "", 2, 2, "جُبّ", "12:10"], ["جذذ", "", 2, 2, "مَجْذُوذ¦جُذاذ", "11:108"], ["جرد", "", 2, 2, "جَراد", "7:133"], ["جرز", "", 2, 2, "جُرُز", "18:8"], ["جزع", "", 2, 2, "جَزِعْ¦جَزُوع", "14:21"], ["جسم", "", 2, 2, "جِسْم", "2:247"], ["جلب", "", 2, 2, "أَجْلِبْ¦جَلابِيب", "17:64"], ["جلل", "", 2, 2, "جَلال", "55:27"], ["جنف", "", 2, 2, "جَنَف¦مُتَجانِف", "2:182"], ["جني", "", 2, 2, "جَنِيّ¦جَنَى", "19:25"], ["جود", "", 2, 2, "جُودِيّ¦جِياد", "11:44"], ["حبس", "", 2, 2, "يَحْبِسُ", "5:106"], ["حجز", "", 2, 2, "حاجِز", "27:61"], ["حطب", "", 2, 2, "حَطَب", "72:15"], ["حطط", "", 2, 2, "حِطَّة", "2:58"], ["حظر", "", 2, 2, "مَحْظُور¦مُحْتَظِر", "17:20"], ["حفر", "", 2, 2, "حُفْرَة¦حافِرَة", "3:103"], ["حفف", "", 2, 2, "حَفَفْ¦حافّ", "18:32"], ["حقب", "", 2, 2, "حُقُب¦أَحْقاب", "18:60"], ["حنث", "", 2, 2, "تَحْنَثْ¦حِنث", "38:44"], ["حنجر", "", 2, 2, "حَناجِر", "33:10"], ["حوذ", "", 2, 2, "اسْتَحْوَذَ", "4:141"], ["حوش", "", 2, 2, "حاش", "12:31"], ["حوي", "", 2, 2, "حَوايا¦أَحْوَى", "6:146"], ["خبل", "", 2, 2, "خَبال", "3:118"], ["خدد", "", 2, 2, "خَدّ¦أُخْدُود", "31:18"], ["خدن", "", 2, 2, "أَخْدان", "4:25"], ["خرب", "", 2, 2, "خَراب¦يُخْرِبُ", "2:114"], ["خردل", "", 2, 2, "خَرْدَل", "21:47"], ["خصف", "", 2, 2, "يَخْصِفَ", "7:22"], ["خضع", "", 2, 2, "خاضِع¦تَخْضَعْ", "26:4"], ["خمد", "", 2, 2, "خامِد", "21:15"], ["خمص", "", 2, 2, "مَخْمَصَة", "5:3"], ["خنس", "", 2, 2, "خُنَّس¦خَنّاس", "81:15"], ["خور", "", 2, 2, "خُوار", "7:148"], ["دخن", "", 2, 2, "دُخان", "41:11"], ["دمع", "", 2, 2, "دَمْع", "5:83"], ["دهر", "", 2, 2, "دَهْر", "45:24"], ["دول", "", 2, 2, "نُداوِلُ¦دُولَة", "3:140"], ["ذبب", "", 2, 1, "ذُباب", "22:73"], ["رجج", "", 2, 1, "رُجَّتِ¦رَجّ", "56:4"], ["رسخ", "", 2, 2, "راسِخ", "3:7"], ["رسس", "", 2, 2, "رَسّ", "25:38"], ["رطب", "", 2, 2, "رَطْب¦رُطَب", "6:59"], ["رعد", "", 2, 2, "رَعْد", "2:19"], ["رفت", "", 2, 2, "رُفات", "17:49"], ["رفث", "", 2, 2, "رَفَث", "2:187"], ["رفد", "", 2, 1, "رِفْد¦مَرْفُود", "11:99"], ["رقد", "", 2, 2, "رُقُود¦مَرْقَد", "18:18"], ["ركس", "", 2, 2, "أَرْكَسَ", "4:88"], ["رمم", "", 2, 2, "رَمِيم", "36:78"], ["روض", "", 2, 2, "رَوْضَة", "30:15"], ["زجج", "", 2, 1, "زُجاجَة", "24:35"], ["زحزح", "", 2, 2, "مُزَحْزِح¦زُحْزِحَ", "2:96"], ["زلق", "", 2, 2, "زَلَق¦يُزْلِقُ", "18:40"], ["زلم", "", 2, 2, "أَزْلام", "5:3"], ["زمر", "", 2, 2, "زُمَر", "39:71"], ["زود", "", 2, 1, "تَزَوَّدُ¦زاد", "2:197"], ["سبأ", "", 2, 2, "سَبَإ", "27:22"], ["سبغ", "", 2, 2, "أَسْبَغَ¦سابِغَة", "31:20"], ["سحق", "", 2, 2, "سَحِيق¦سُحْق", "22:31"], ["سرمد", "", 2, 2, "سَرْمَد", "28:71"], ["سعد", "", 2, 2, "سَعِيد¦سُعِدُ", "11:105"], ["سفك", "", 2, 2, "يَسْفِكُ", "2:30"], ["سقم", "", 2, 2, "سَقِيم", "37:89"], ["سهو", "", 2, 2, "ساهي", "51:11"], ["شخص", "", 2, 2, "تَشْخَصُ¦شاخِصَة", "14:42"], ["شطأ", "", 2, 2, "شاطِئ¦شَطْء", "28:30"], ["شعب", "", 2, 2, "شُعُوب¦شُعَب", "49:13"], ["شغل", "", 2, 2, "شُغُل¦شَغَلَتْ", "36:55"], ["شفو", "", 2, 2, "شَفا", "3:103"], ["شكل", "", 2, 2, "شاكِلَت¦شَكْل", "17:84"], ["شهق", "", 2, 2, "شَهِيق", "11:106"], ["شوي", "", 2, 2, "يَشْوِي¦شَوَى", "18:29"], ["شيد", "", 2, 2, "مُشَيَّدَة¦مَشِيد", "4:78"], ["صبع", "", 2, 2, "أَصابِع", "2:19"], ["صدي", "", 2, 2, "تَصْدِيَة¦تَصَدَّى", "8:35"], ["صغو", "", 2, 2, "صَغَتْ", "6:113"], ["صفد", "", 2, 2, "أَصْفاد", "14:49"], ["صنو", "", 2, 1, "صِنْوان", "13:4"], ["صهر", "", 2, 2, "يُصْهَرُ¦صِهْر", "22:20"], ["ضغن", "", 2, 2, "أَضْغان", "47:29"], ["ضمم", "", 2, 2, "اضْمُمْ", "20:22"], ["طرو", "", 2, 2, "طَرِيّ", "16:14"], ["طعن", "", 2, 2, "طَعْن¦طَعَنُ", "4:46"], ["طمث", "", 2, 2, "يَطْمِثْ", "55:56"], ["ظفر", "", 2, 2, "ظُفُر¦أَظْفَرَ", "6:146"], ["عبث", "", 2, 2, "عَبَث¦تَعْبَثُ", "23:115"], ["عتق", "", 2, 2, "عَتِيق", "22:29"], ["عتل", "", 2, 2, "اعْتِلُ¦عُتُلّ", "44:47"], ["عثر", "", 2, 2, "عُثِرَ¦أَعْثَرْ", "5:107"], ["عجف", "", 2, 2, "عِجاف", "12:43"], ["عرر", "", 2, 2, "مُعْتَرّ¦مَعَرَّة", "22:36"], ["عزب", "", 2, 2, "يَعْزُبُ", "10:61"], ["عضد", "", 2, 2, "عَضُد", "18:51"], ["عضض", "", 2, 2, "عَضُّ", "3:119"], ["عضل", "", 2, 2, "تَعْضُلُ", "2:232"], ["عطل", "", 2, 2, "مُعَطَّلَة¦عُطِّلَتْ", "22:45"], ["عنكب", "", 2, 1, "عَنكَبُوت", "29:41"], ["عهن", "", 2, 2, "عِهْن", "70:9"], ["عيل", "", 2, 2, "عَيْلَة¦عائِل", "9:28"], ["عيي", "", 2, 2, "عَيِي", "46:33"], ["غثو", "", 2, 2, "غُثاء", "23:41"], ["غدر", "", 2, 2, "يُغادِرُ", "18:47"], ["غرو", "", 2, 2, "أَغْرَيْ", "5:14"], ["غطو", "", 2, 2, "غِطاء", "18:101"], ["غلف", "", 2, 2, "غُلْف", "2:88"], ["غلو", "", 2, 2, "تَغْلُو", "4:171"], ["غلي", "", 2, 2, "يَغْلِي¦غَلْى", "44:45"], ["غوص", "", 2, 2, "يَغُوصُ¦غَوّاص", "21:82"], ["غوط", "", 2, 2, "غائِط", "4:43"], ["غيض", "", 2, 2, "غِيضَ", "11:44"], ["فكك", "", 2, 2, "فَكّ¦مُنفَكّ", "90:13"], ["قحم", "", 2, 2, "مُقْتَحِم¦اقْتَحَمَ", "38:59"], ["قدو", "", 2, 2, "اقْتَدِهْ¦مُقْتَدي", "6:90"], ["قرطس", "", 2, 2, "قِرْطاس", "6:7"], ["قسطس", "", 2, 2, "قِسْطاس", "17:35"], ["قطف", "", 2, 2, "قُطُوف", "69:23"], ["قلي", "", 2, 2, "قالي¦قَلَى", "26:168"], ["قنع", "সন্তুষ্টি", 2, 2, "مُقْنِعِي¦قانِع", "14:43"], ["قوت", "", 2, 2, "مُقِيت¦أَقْوات", "4:85"], ["قوع", "", 2, 2, "قاع¦قِيعَة", "20:106"], ["قيض", "", 2, 2, "قَيَّضْ", "41:25"], ["قيل", "", 2, 2, "قائِل¦مَقِيل", "7:4"], ["كبب", "", 2, 2, "كُبَّتْ¦مُكِبّ", "27:90"], ["كدح", "", 2, 1, "كادِح¦كَدْح", "84:6"], ["كرس", "", 2, 2, "كُرْسِيّ", "2:255"], ["كسل", "", 2, 2, "كُسالَى", "4:142"], ["كلو", "", 2, 2, "كِلا¦كِلْتا", "17:23"], ["كمم", "", 2, 2, "أَكْمام", "41:47"], ["كمه", "", 2, 2, "أَكْمَه", "3:49"], ["كهل", "", 2, 2, "كَهْل", "3:46"], ["كهن", "", 2, 2, "كاهِن", "52:29"], ["كين", "", 2, 2, "اسْتَكانُ", "3:146"], ["لبد", "", 2, 2, "لِبَد¦لُبَد", "72:19"], ["لبن", "", 2, 2, "لَبَن", "16:66"], ["لدد", "", 2, 2, "أَلَدّ¦لُدّ", "2:204"], ["لغب", "", 2, 2, "لُغُوب", "35:35"], ["لقط", "", 2, 2, "الْتَقَطَ", "12:10"], ["لمح", "", 2, 2, "لَمْح", "16:77"], ["لمم", "", 2, 2, "لَمَم¦لَمّ", "53:32"], ["لهث", "", 2, 1, "يَلْهَثْ", "7:176"], ["محص", "", 2, 2, "يُمَحِّصَ", "3:141"], ["محق", "", 2, 2, "يَمْحَقُ", "2:276"], ["محن", "", 2, 2, "امْتَحَنَ", "49:3"], ["مخر", "", 2, 2, "مَواخِر", "16:14"], ["ملح", "", 2, 2, "مِلْح", "25:53"], ["ملق", "", 2, 2, "إِمْلاق", "6:151"], ["نبع", "", 2, 2, "يَنبُوع", "17:90"], ["نحل", "", 2, 2, "نِحْلَة¦نَحْل", "4:4"], ["نزف", "", 2, 2, "يُنزَفُ", "37:47"], ["نسأ", "", 2, 2, "نَسِيء¦مِنسَأَت", "9:37"], ["نشط", "", 2, 1, "ناشِطَة¦نَشْط", "79:2"], ["نصت", "", 2, 2, "أَنصِتُ", "7:204"], ["نعس", "", 2, 2, "نُعاس", "3:154"], ["نفش", "", 2, 2, "نَفَشَتْ¦مَنفُوش", "21:78"], ["نكب", "", 2, 2, "ناكِب¦مَناكِب", "23:74"], ["نكص", "", 2, 2, "نَكَصَ", "8:48"], ["هبو", "", 2, 2, "هَباء", "25:23"], ["هرع", "", 2, 2, "يُهْرَعُ", "11:78"], ["هشم", "", 2, 2, "هَشِيم", "18:45"], ["هضم", "", 2, 2, "هَضْم¦هَضِيم", "20:112"], ["هلم", "", 2, 2, "هَلُمّ", "6:150"], ["همن", "", 2, 2, "مُهَيْمِن", "5:48"], ["هور", "", 2, 1, "هار¦انْهارَ", "9:109"], ["هيج", "", 2, 2, "يَهِيجُ", "39:21"], ["هيم", "", 2, 2, "يَهِيمُ¦هِيم", "26:225"], ["وبق", "", 2, 2, "مَوْبِق¦يُوبِقْ", "18:52"], ["وجف", "", 2, 2, "أَوْجَفْ¦واجِفَة", "59:6"], ["ودق", "", 2, 2, "وَدْق", "24:43"], ["وسق", "", 2, 2, "وَسَقَ¦اتَّسَقَ", "84:17"], ["وسل", "", 2, 2, "وَسِيلَة", "5:35"], ["وسم", "", 2, 2, "مُتَوَسِّم¦نَسِمُ", "15:75"], ["وصب", "", 2, 2, "واصِب", "16:52"], ["وطر", "", 2, 1, "وَطَر", "33:37"], ["أبب", "", 1, 1, "أَبّ", "80:31"], ["أبق", "", 1, 1, "أَبَقَ", "37:140"], ["أثل", "", 1, 1, "أَثْل", "34:16"], ["أدد", "", 1, 1, "إِدّ", "19:89"], ["أسن", "", 1, 1, "آسِن", "47:15"], ["ألت", "", 1, 1, "أَلَتْ", "52:21"], ["أمت", "", 1, 1, "أَمْت", "20:107"], ["أنم", "", 1, 1, "أَنام", "55:10"], ["أود", "", 1, 1, "يَئُودُ", "2:255"], ["أيم", "", 1, 1, "أَيامَى", "24:32"], ["بأر", "", 1, 1, "بِئْر", "22:45"], ["بتر", "", 1, 1, "أَبْتَر", "108:3"], ["بتك", "", 1, 1, "يُبَتِّكُ", "4:119"], ["بجس", "", 1, 1, "انۢبَجَسَتْ", "7:160"], ["بحث", "", 1, 1, "يَبْحَثُ", "5:31"], ["بدر", "", 1, 1, "بِدار", "4:6"], ["بسق", "", 1, 1, "باسِقَة", "50:10"], ["بسم", "", 1, 1, "تَبَسَّمَ", "27:19"], ["بصل", "", 1, 1, "بَصَل", "2:61"], ["بطأ", "", 1, 1, "يُبَطِّئَ", "4:72"], ["بغل", "", 1, 1, "بِغال", "16:8"], ["بقع", "", 1, 1, "بُقْعَة", "28:30"], ["بقل", "", 1, 1, "بَقْل", "2:61"], ["بلع", "", 1, 1, "ابْلَعِ", "11:44"], ["بهل", "", 1, 1, "نَبْتَهِلْ", "3:61"], ["بيد", "", 1, 1, "تَبِيدَ", "18:35"], ["ترق", "", 1, 1, "تَراقِي", "75:26"], ["تعس", "", 1, 1, "تَعْس", "47:8"], ["تفث", "", 1, 1, "تَفَث", "22:29"], ["تقن", "", 1, 1, "أَتْقَنَ", "27:88"], ["تلل", "", 1, 1, "تَلَّ", "37:103"], ["تين", "", 1, 1, "تِين", "95:1"], ["تيه", "", 1, 1, "يَتِيهُ", "5:26"], ["ثبط", "", 1, 1, "ثَبَّطَ", "9:46"], ["ثبي", "", 1, 1, "ثُبَة", "4:71"], ["ثجج", "", 1, 1, "ثَجّاج", "78:14"], ["ثرب", "", 1, 1, "تَثْرِيب", "12:92"], ["ثري", "", 1, 1, "ثَرَى", "20:6"], ["ثيب", "", 1, 1, "ثَيِّبَة", "66:5"], ["جبت", "", 1, 1, "جِبْت", "4:51"], ["جبن", "", 1, 1, "جَبِين", "37:103"], ["جبه", "", 1, 1, "جِباه", "9:35"], ["جثث", "", 1, 1, "اجْتُثَّتْ", "14:26"], ["جذو", "", 1, 1, "جَذْوَة", "28:29"], ["جرر", "", 1, 1, "يَجُرُّ", "7:150"], ["جرع", "", 1, 1, "يَتَجَرَّعُ", "14:17"], ["جرف", "", 1, 1, "جُرُف", "9:109"], ["جسس", "", 1, 1, "تَجَسَّسُ", "49:12"], ["جفأ", "", 1, 1, "جُفاء", "13:17"], ["جفن", "", 1, 1, "جِفان", "34:13"], ["جفو", "", 1, 1, "تَتَجافَى", "32:16"], ["جلس", "", 1, 1, "مَجالِس", "58:11"], ["جمح", "", 1, 1, "يَجْمَحُ", "9:57"], ["جمد", "", 1, 1, "جامِدَة", "27:88"], ["جمم", "", 1, 1, "جَمّ", "89:20"], ["جوس", "", 1, 1, "جاسُ", "17:5"], ["جوف", "", 1, 1, "جَوْف", "33:4"], ["جوو", "", 1, 1, "جَوّ", "16:79"], ["جيد", "", 1, 1, "جِيد", "111:5"], ["حبك", "", 1, 1, "حُبُك", "51:7"], ["حتم", "", 1, 1, "حَتْم", "19:71"], ["حثث", "", 1, 1, "حَثِيث", "7:54"], ["حدب", "", 1, 1, "حَدَب", "21:96"], ["حرد", "", 1, 1, "حَرْد", "68:25"], ["حرس", "", 1, 1, "حَرَس", "72:8"], ["حرك", "", 1, 1, "تُحَرِّكْ", "75:16"], ["حري", "", 1, 1, "تَحَرَّ", "72:14"], ["حسم", "", 1, 1, "حُسُوم", "69:7"], ["حصحص", "", 1, 1, "حَصْحَصَ", "12:51"], ["حصل", "", 1, 1, "حُصِّلَ", "100:10"], ["حفد", "", 1, 1, "حَفَدَة", "16:72"], ["حقف", "", 1, 1, "أَحْقاف", "46:21"], ["حنذ", "", 1, 1, "حَنِيذ", "11:69"], ["حنك", "", 1, 1, "أَحْتَنِكَ", "17:62"], ["حنن", "", 1, 1, "حَنان", "19:13"], ["حوب", "", 1, 1, "حُوب", "4:2"], ["حوز", "", 1, 1, "مُتَحَيِّز", "8:16"], ["حيد", "", 1, 1, "تَحِيدُ", "50:19"], ["حير", "", 1, 1, "حَيْران", "6:71"], ["حيف", "", 1, 1, "يَحِيفَ", "24:50"], ["خبأ", "", 1, 1, "خَبْء", "27:25"], ["خبز", "", 1, 1, "خُبْز", "12:36"], ["خبط", "", 1, 1, "يَتَخَبَّطُ", "2:275"], ["خبو", "", 1, 1, "خَبَتْ", "17:97"], ["ختر", "", 1, 1, "خَتّار", "31:32"], ["خرطم", "", 1, 1, "خُرْطُوم", "68:16"], ["خشب", "", 1, 1, "خُشُب", "63:4"], ["خضد", "", 1, 1, "مَخْضُود", "56:28"], ["خطط", "", 1, 1, "تَخُطُّ", "29:48"], ["خلع", "", 1, 1, "اخْلَعْ", "20:12"], ["خمط", "", 1, 1, "خَمْط", "34:16"], ["خنق", "", 1, 1, "مُنْخَنِقَة", "5:3"], ["خيم", "", 1, 1, "خِيام", "55:72"], ["دثر", "", 1, 1, "مُدَّثِّر", "74:1"], ["دحو", "", 1, 1, "دَحَى", "79:30"], ["درهم", "", 1, 1, "دَراهِم", "12:20"], ["دسر", "", 1, 1, "دُسُر", "54:13"], ["دسس", "", 1, 1, "يَدُسُّ", "16:59"], ["دسو", "", 1, 1, "دَسَّى", "91:10"], ["دفأ", "", 1, 1, "دِفْء", "16:5"], ["دفق", "", 1, 1, "دافِق", "86:6"], ["دلك", "", 1, 1, "دُلُوك", "17:78"], ["دمدم", "", 1, 1, "دَمْدَمَ", "91:14"], ["دمغ", "", 1, 1, "يَدْمَغُ", "21:18"], ["دنر", "", 1, 1, "دِينار", "3:75"], ["دهق", "", 1, 1, "دِهاق", "78:34"], ["دهم", "", 1, 1, "مُدْهامَّتان", "55:64"], ["دهي", "", 1, 1, "أَدْهَى", "54:46"], ["ذأم", "", 1, 1, "مَذْءُوم", "7:18"], ["ذبذب", "", 1, 1, "مُذَبْذَب", "4:143"], ["ذخر", "", 1, 1, "تَدَّخِرُ", "3:49"], ["ذعن", "", 1, 1, "مُذْعِن", "24:49"], ["ذكو", "", 1, 1, "ذَكَّيْ", "5:3"], ["ذهل", "", 1, 1, "تَذْهَلُ", "22:2"], ["ذود", "", 1, 1, "تَذُودَ", "28:23"], ["ذيع", "", 1, 1, "أَذاعُ", "4:83"], ["ربح", "", 1, 1, "رَبِحَت", "2:16"], ["رتع", "", 1, 1, "يَرْتَعْ", "12:12"], ["رتق", "", 1, 1, "رَتْق", "21:30"], ["رحق", "", 1, 1, "رَحِيق", "83:25"], ["رخو", "", 1, 1, "رُخاء", "38:36"], ["ردأ", "", 1, 1, "رِدْء", "28:34"], ["ردم", "", 1, 1, "رَدْم", "18:95"], ["رصص", "", 1, 1, "مَرْصُوص", "61:4"], ["رغم", "", 1, 1, "مُراغَم", "4:100"], ["رفرف", "", 1, 1, "رَفْرَف", "55:76"], ["رقق", "", 1, 1, "رَقّ", "52:3"], ["ركد", "", 1, 1, "رَواكِد", "42:33"], ["ركز", "", 1, 1, "رِكْز", "19:98"], ["رمح", "", 1, 1, "رِماح", "5:94"], ["رمد", "", 1, 1, "رَماد", "14:18"], ["رمز", "", 1, 1, "رَمْز", "3:41"], ["رمض", "", 1, 1, "رَمَضان", "2:185"], ["رهو", "", 1, 1, "رَهْو", "44:24"], ["روع", "", 1, 1, "رَوْع", "11:74"], ["ريش", "", 1, 1, "رِيش", "7:26"], ["ريع", "", 1, 1, "رِيع", "26:128"], ["رين", "", 1, 1, "رانَ", "83:14"], ["زبن", "", 1, 1, "زَبانِيَة", "96:18"], ["زحف", "", 1, 1, "زَحْف", "8:15"], ["زرب", "", 1, 1, "زَرابِيّ", "88:16"], ["زرق", "", 1, 1, "زُرْق", "20:102"], ["زري", "", 1, 1, "تَزْدَرِي", "11:31"], ["زفف", "", 1, 1, "يَزِفُّ", "37:94"], ["زمل", "", 1, 1, "مُزَّمِّل", "73:1"], ["زمهر", "", 1, 1, "زَمْهَرِير", "76:13"], ["زنم", "", 1, 1, "زَنِيم", "68:13"], ["زهد", "", 1, 1, "زاهِد", "12:20"], ["زهر", "", 1, 1, "زَهْرَة", "20:131"], ["سجو", "", 1, 1, "سَجَى", "93:2"], ["سحل", "", 1, 1, "ساحِل", "20:39"], ["سدي", "", 1, 1, "سُدًى", "75:36"], ["سرد", "", 1, 1, "سَرْد", "34:11"], ["سردق", "", 1, 1, "سُرادِق", "18:29"], ["سطح", "", 1, 1, "سُطِحَتْ", "88:20"], ["سطو", "", 1, 1, "يَسْطُ", "22:72"], ["سغب", "", 1, 1, "مَسْغَبَة", "90:14"], ["سفع", "", 1, 1, "نَسْفَعًۢ", "96:15"], ["سكب", "", 1, 1, "مَسْكُوب", "56:31"], ["سكت", "", 1, 1, "سَكَتَ", "7:154"], ["سلب", "", 1, 1, "يَسْلُبْ", "22:73"], ["سلق", "", 1, 1, "سَلَقُ", "33:19"], ["سمد", "", 1, 1, "سامِد", "53:61"], ["سمك", "", 1, 1, "سَمْك", "79:28"], ["سند", "", 1, 1, "مُسَنَّدَة", "63:4"], ["سنم", "", 1, 1, "تَسْنِيم", "83:27"], ["سنه", "", 1, 1, "يَتَسَنَّهْ", "2:259"], ["سهر", "", 1, 1, "ساهِرَة", "79:14"], ["سهل", "", 1, 1, "سُهُول", "7:74"], ["سهم", "", 1, 1, "ساهَمَ", "37:141"], ["سوح", "", 1, 1, "ساحَت", "37:177"], ["سوط", "", 1, 1, "سَوْط", "89:13"], ["سيب", "", 1, 1, "سائِبَة", "5:103"], ["شتو", "", 1, 1, "شِتاء", "106:2"], ["شحم", "", 1, 1, "شُحُوم", "6:146"], ["شرد", "", 1, 1, "شَرِّدْ", "8:57"], ["شرذم", "", 1, 1, "شِرْذِمَة", "26:54"], ["شرط", "", 1, 1, "أَشْراط", "47:18"], ["شعل", "", 1, 1, "اشْتَعَلَ", "19:4"], ["شغف", "", 1, 1, "شَغَفَ", "12:30"], ["شفه", "", 1, 1, "شَفَتَيْن", "90:9"], ["شكس", "", 1, 1, "مُتَشاكِس", "39:29"], ["شمت", "", 1, 1, "تُشْمِتْ", "7:150"], ["شمخ", "", 1, 1, "شامِخَة", "77:27"], ["شمز", "", 1, 1, "اشْمَأَزَّتْ", "39:45"], ["شوب", "", 1, 1, "شَوْب", "37:67"], ["شوظ", "", 1, 1, "شُواظ", "55:35"], ["شوك", "", 1, 1, "شَوْكَة", "8:7"], ["صخخ", "", 1, 1, "صاخَّة", "80:33"], ["صرع", "", 1, 1, "صَرْعَى", "69:7"], ["صعر", "", 1, 1, "تُصَعِّرْ", "31:18"], ["صفصف", "", 1, 1, "صَفْصَف", "20:106"], ["صفن", "", 1, 1, "صافِنَة", "38:31"], ["صكك", "", 1, 1, "صَكَّتْ", "51:29"], ["صلد", "", 1, 1, "صَلْد", "2:264"], ["صمت", "", 1, 1, "صامِت", "7:193"], ["صمد", "", 1, 1, "صَمَد", "112:2"], ["صمع", "", 1, 1, "صَوامِع", "22:40"], ["صوع", "", 1, 1, "صُواع", "12:72"], ["صوف", "", 1, 1, "أَصْواف", "16:80"], ["صيص", "", 1, 1, "صَياصِي", "33:26"], ["صيف", "", 1, 1, "صَيْف", "106:2"], ["ضأن", "", 1, 1, "ضَأْن", "6:143"], ["ضبح", "", 1, 1, "ضَبْح", "100:1"], ["ضدد", "", 1, 1, "ضِدّ", "19:82"], ["ضفدع", "", 1, 1, "ضَفادِع", "7:133"], ["ضمر", "", 1, 1, "ضامِر", "22:27"], ["ضنك", "", 1, 1, "ضَنك", "20:124"], ["ضنن", "", 1, 1, "ضَنِين", "81:24"], ["ضهأ", "", 1, 1, "يُضاهِئُ", "9:30"], ["ضير", "", 1, 1, "ضَيْر", "26:50"], ["ضيز", "", 1, 1, "ضِيزَى", "53:22"], ["طحو", "", 1, 1, "طَحَى", "91:6"], ["طرح", "", 1, 1, "اطْرَحُ", "12:9"], ["طفف", "", 1, 1, "مُطَفِّف", "83:1"], ["طلح", "", 1, 1, "طَلْح", "56:29"], ["طلل", "", 1, 1, "طَلّ", "2:265"], ["طمم", "", 1, 1, "طامَّة", "79:34"], ["طود", "", 1, 1, "طَوْد", "26:63"], ["ظعن", "", 1, 1, "ظَعْن", "16:80"], ["عبأ", "", 1, 1, "يَعْبَؤُا۟", "25:77"], ["عبقر", "", 1, 1, "عَبْقَرِيّ", "55:76"], ["عدس", "", 1, 1, "عَدَس", "2:61"], ["عرجن", "", 1, 1, "عُرْجُون", "36:39"], ["عرم", "", 1, 1, "عَرِم", "34:16"], ["عزو", "", 1, 1, "عِزِين", "70:37"], ["عسعس", "", 1, 1, "عَسْعَسَ", "81:17"], ["عسل", "", 1, 1, "عَسَل", "47:15"], ["عضو", "", 1, 1, "عِضِين", "15:91"], ["عطف", "", 1, 1, "عِطْف", "22:9"], ["عفر", "", 1, 1, "عِفْرِيت", "27:39"], ["عمق", "", 1, 1, "عَمِيق", "22:27"], ["عنو", "", 1, 1, "عَنَتِ", "20:111"], ["عوق", "", 1, 1, "مُعَوِّق", "33:18"], ["عول", "", 1, 1, "تَعُولُ", "4:3"], ["عيب", "", 1, 1, "أَعِيبَ", "18:79"], ["غبن", "", 1, 1, "تَغابُن", "64:9"], ["غدق", "", 1, 1, "غَدَق", "72:16"], ["غزل", "", 1, 1, "غَزْل", "16:92"], ["غزو", "", 1, 1, "غُزًّى", "3:156"], ["غصب", "", 1, 1, "غَصْب", "18:79"], ["غصص", "", 1, 1, "غُصَّة", "73:13"], ["غطش", "", 1, 1, "أَغْطَشَ", "79:29"], ["غلق", "", 1, 1, "غَلَّقَتِ", "12:23"], ["غمز", "", 1, 1, "يَتَغامَزُ", "83:30"], ["غمض", "", 1, 1, "تُغْمِضُ", "2:267"], ["غول", "", 1, 1, "غَوْل", "37:47"], ["فتأ", "", 1, 1, "تَفْتَؤُا۟", "12:85"], ["فتق", "", 1, 1, "فَتَقْ", "21:30"], ["فجو", "", 1, 1, "فَجْوَة", "18:17"], ["فرث", "", 1, 1, "فَرْث", "16:66"], ["فرع", "", 1, 1, "فَرْع", "14:24"], ["فره", "", 1, 1, "فارِه", "26:149"], ["فسر", "", 1, 1, "تَفْسِير", "25:33"], ["فصح", "", 1, 1, "أَفْصَح", "28:34"], ["فصم", "", 1, 1, "انفِصام", "2:256"], ["فضح", "", 1, 1, "تَفْضَحُ", "15:68"], ["فضو", "", 1, 1, "أَفْضَى", "4:21"], ["فظظ", "", 1, 1, "فَظّ", "3:159"], ["فقع", "", 1, 1, "فاقِع", "2:69"], ["فلن", "", 1, 1, "فُلان", "25:28"], ["فند", "", 1, 1, "تُفَنِّدُ", "12:94"], ["فنن", "", 1, 1, "أَفْنان", "55:48"], ["فني", "", 1, 1, "فان", "55:26"], ["فهم", "", 1, 1, "فَهَّمْ", "21:79"], ["فوض", "", 1, 1, "أُفَوِّضُ", "40:44"], ["فوم", "", 1, 1, "فُوم", "2:61"], ["فيل", "", 1, 1, "فِيل", "105:1"], ["قبح", "", 1, 1, "مَقْبُوح", "28:42"], ["قثأ", "", 1, 1, "قِثّائ", "2:61"], ["قدح", "", 1, 1, "قَدْح", "100:2"], ["قرش", "", 1, 1, "قُرَيْش", "106:1"], ["قسر", "", 1, 1, "قَسْوَرَة", "74:51"], ["قسس", "", 1, 1, "قِسِّيس", "5:82"], ["قشعر", "", 1, 1, "تَقْشَعِرُّ", "39:23"], ["قصف", "", 1, 1, "قاصِف", "17:69"], ["قصم", "", 1, 1, "قَصَمْ", "21:11"], ["قضب", "", 1, 1, "قَضْب", "80:28"], ["قضض", "", 1, 1, "يَنقَضَّ", "18:77"], ["قطط", "", 1, 1, "قِطّ", "38:16"], ["قطمر", "", 1, 1, "قِطْمِير", "35:13"], ["قعر", "", 1, 1, "مُنقَعِر", "54:20"], ["قفل", "", 1, 1, "أَقْفال", "47:24"], ["قلع", "", 1, 1, "أَقْلِعِ", "11:44"], ["قمح", "", 1, 1, "مُقْمَح", "36:8"], ["قمطر", "", 1, 1, "قَمْطَرِير", "76:10"], ["قمع", "", 1, 1, "مَقامِع", "22:21"], ["قمل", "", 1, 1, "قُمَّل", "7:133"], ["قنو", "", 1, 1, "قِنْوان", "6:99"], ["قني", "", 1, 1, "أَقْنَى", "53:48"], ["قوب", "", 1, 1, "قاب", "53:9"], ["قوس", "", 1, 1, "قَوْسَيْن", "53:9"], ["كبد", "", 1, 1, "كَبَد", "90:4"], ["كبكب", "", 1, 1, "كُبْكِبُ", "26:94"], ["كثب", "", 1, 1, "كَثِيب", "73:14"], ["كدر", "", 1, 1, "انكَدَرَتْ", "81:2"], ["كدي", "", 1, 1, "أَكْدَى", "53:34"], ["كسد", "", 1, 1, "كَساد", "9:24"], ["كشط", "", 1, 1, "كُشِطَتْ", "81:11"], ["كفأ", "", 1, 1, "كُفُو", "112:4"], ["كفت", "", 1, 1, "كِفات", "77:25"], ["كلأ", "", 1, 1, "يَكْلَؤُ", "21:42"], ["كلح", "", 1, 1, "كالِح", "23:104"], ["كند", "", 1, 1, "كَنُود", "100:6"], ["كنس", "", 1, 1, "كُنَّس", "81:16"], ["كوي", "", 1, 1, "تُكْوَى", "9:35"], ["لحف", "", 1, 1, "إِلْحاف", "2:273"], ["لحن", "", 1, 1, "لَحْن", "47:30"], ["لحي", "", 1, 1, "لِحْيَت", "20:94"], ["لزب", "", 1, 1, "لازِب", "37:11"], ["لظي", "", 1, 1, "تَلَظَّى", "92:14"], ["لفح", "", 1, 1, "تَلْفَحُ", "23:104"], ["لفظ", "", 1, 1, "يَلْفِظُ", "50:18"], ["لقب", "", 1, 1, "أَلْقاب", "49:11"], ["لقح", "", 1, 1, "لَواقِح", "15:22"], ["لقم", "", 1, 1, "الْتَقَمَ", "37:142"], ["لهم", "", 1, 1, "أَلْهَمَ", "91:8"], ["لوت", "", 1, 1, "لاتَ", "38:3"], ["لوذ", "", 1, 1, "لِواذ", "24:63"], ["ليت", "", 1, 1, "يَلِتْ", "49:14"], ["مجس", "", 1, 1, "مَجُوس", "22:17"], ["محل", "", 1, 1, "مِحال", "13:13"], ["مخض", "", 1, 1, "مَخاض", "19:23"], ["مرو", "", 1, 1, "مَرْوَة", "2:158"], ["مزن", "", 1, 1, "مُزْن", "56:69"], ["مسخ", "", 1, 1, "مَسَخْ", "36:67"], ["مسد", "", 1, 1, "مَسَد", "111:5"], ["مسو", "", 1, 1, "تُمْسُ", "30:17"], ["مشج", "", 1, 1, "أَمْشاج", "76:2"], ["مطو", "", 1, 1, "يَتَمَطَّى", "75:33"], ["معز", "", 1, 1, "مَعْز", "6:143"], ["معي", "", 1, 1, "أَمْعاء", "47:15"], ["مكو", "", 1, 1, "مُكاء", "8:35"], ["مير", "", 1, 1, "نَمِيرُ", "12:65"], ["نبز", "", 1, 1, "تَنابَزُ", "49:11"], ["نبط", "", 1, 1, "يَسْتَنۢبِطُ", "4:83"], ["نتق", "", 1, 1, "نَتَقْ", "7:171"], ["نجد", "", 1, 1, "نَجْدَيْن", "90:10"], ["نجس", "", 1, 1, "نَجَس", "9:28"], ["نحب", "", 1, 1, "نَحْب", "33:23"], ["نحر", "", 1, 1, "انْحَرْ", "108:2"], ["نخر", "", 1, 1, "نَخِرَة", "79:11"], ["نسر", "", 1, 1, "نَسْر", "71:23"], ["نضج", "", 1, 1, "نَضِجَتْ", "4:56"], ["نضخ", "", 1, 1, "نَضّاخَتان", "55:66"], ["نطح", "", 1, 1, "نَطِيحَة", "5:3"], ["نعق", "", 1, 1, "يَنْعِقُ", "2:171"], ["نعل", "", 1, 1, "نَعْلَي", "20:12"], ["نغض", "", 1, 1, "يُنْغِضُ", "17:51"], ["نفث", "", 1, 1, "نَفّاثَة", "113:4"], ["نفح", "", 1, 1, "نَفْحَة", "21:46"], ["نفي", "", 1, 1, "يُنفَ", "5:33"], ["نقع", "", 1, 1, "نَقْع", "100:4"], ["نكد", "", 1, 1, "نَكِد", "7:58"], ["نمرق", "", 1, 1, "نَمارِق", "88:15"], ["نمم", "", 1, 1, "نَمِيم", "68:11"], ["نهج", "", 1, 1, "مِنْهاج", "5:48"], ["نوأ", "", 1, 1, "تَنُوأُ", "28:76"], ["نوش", "", 1, 1, "تَناوُش", "34:52"], ["نوص", "", 1, 1, "مَناص", "38:3"], ["نون", "", 1, 1, "نُون", "21:87"], ["نوي", "", 1, 1, "نَوَى", "6:95"], ["هاء", "", 1, 1, "هاؤُم", "69:19"], ["هجد", "", 1, 1, "تَهَجَّدْ", "17:79"], ["هجع", "", 1, 1, "يَهْجَعُ", "51:17"], ["هدد", "", 1, 1, "هَدّ", "19:90"], ["هدم", "", 1, 1, "هُدِّمَتْ", "22:40"], ["هدهد", "", 1, 1, "هُدْهُد", "27:20"], ["هرب", "", 1, 1, "هَرَب", "72:12"], ["هزل", "", 1, 1, "هَزْل", "86:14"], ["هشش", "", 1, 1, "أَهُشُّ", "20:18"], ["هلع", "", 1, 1, "هَلُوع", "70:19"], ["همد", "", 1, 1, "هامِدَة", "22:5"], ["همر", "", 1, 1, "مُنْهَمِر", "54:11"], ["همس", "", 1, 1, "هَمْس", "20:108"], ["هيت", "", 1, 1, "هَيْتَ", "12:23"], ["هيل", "", 1, 1, "مَهِيل", "73:14"], ["وأد", "", 1, 1, "مَوْءُدَة", "81:8"], ["وأل", "", 1, 1, "مَوْئِل", "18:58"], ["وبر", "", 1, 1, "أَوْبار", "16:80"], ["وتن", "", 1, 1, "وَتِين", "69:46"], ["وجب", "", 1, 1, "وَجَبَتْ", "22:36"], ["وحش", "", 1, 1, "وُحُوش", "81:5"], ["وسن", "", 1, 1, "سِنَة", "2:255"], ["وشي", "", 1, 1, "شِيَة", "2:71"], ["وضن", "", 1, 1, "مَوْضُونَة", "56:15"], ["وطن", "", 1, 1, "مَواطِن", "9:25"], ["وفد", "", 1, 1, "وَفْد", "19:85"], ["وفر", "", 1, 1, "مَوْفُور", "17:63"], ["وفض", "", 1, 1, "يُوفِضُ", "70:43"], ["وقب", "", 1, 1, "وَقَبَ", "113:3"], ["وقذ", "", 1, 1, "مَوْقُوذَة", "5:3"], ["وكد", "", 1, 1, "تَوْكِيد", "16:91"], ["وكز", "", 1, 1, "وَكَزَ", "28:15"], ["وني", "", 1, 1, "تَنِيَ", "20:42"], ["وهج", "", 1, 1, "وَهّاج", "78:13"], ["وهي", "", 1, 1, "واهِيَة", "69:16"], ["يقظ", "", 1, 1, "أَيْقاظ", "18:18"], ["ينع", "", 1, 1, "يَنْع", "6:99"]];
// QX_TOPICS -> js/quran/subjective.js

/* Sort — বিষয়ভিত্তিক ট্যাবে সাজানো। গ্রিড / লিস্ট — ২ ভিউতেই একই Sort কাজ করে।
   কালার: ফাইলের নিজের ভেরিয়েবল — var(--qx-card-bg), var(--qx-border), var(--qx-meta-color), var(--qx-text-color), var(--qx-main-color) / var(--qx-on-main)। নতুন হার্ডকোড কালার নাই।
   Grid/List বাটন: .qx-view-btn-এর পুরান রুলই ব্যবহার হয় (off = card-bg + meta, on = main-color + on-main)।
   count = শব্দের সংখ্যা বেশি থেকে কম | pair = জোড়া পাশাপাশি | bn = বাংলা অভিধান ক্রম | imp = কুরআনে গুরুত্ব (কত আয়াতে আছে, তারপর সংখ্যা) */
let qxTopicSort = "count";
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
  const sortWrap = document.createElement("div");
  sortWrap.className = "qx-topic-sort";
  sortWrap.style.cssText = "flex:1 1 auto;min-width:0;position:relative;";
  const sortOpts = [["count","শব্দের সংখ্যা"],["pair","জোড়া"],["bn","বাংলা অভিধান ক্রম"],["imp","কুরআনে গুরুত্ব"]];
  const sortBtn = document.createElement("button");
  sortBtn.type = "button";
  sortBtn.setAttribute("aria-label", "বিষয় সাজানো");
  sortBtn.setAttribute("aria-haspopup", "true");
  sortBtn.setAttribute("aria-expanded", "false");
  sortBtn.style.cssText = "width:100%;display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:var(--qx-fs-sm);padding:6px 8px;border:1.5px solid var(--qx-main-color);border-radius:var(--qx-radius);background:var(--qx-card-bg);color:var(--qx-text-color);cursor:pointer;";
  const sortBtnLabel = document.createElement("span");
  sortBtnLabel.textContent = (sortOpts.find(([v]) => v === qxTopicSort) || sortOpts[0])[1];
  const sortBtnArrow = document.createElement("span");
  sortBtnArrow.textContent = "▾";
  sortBtnArrow.style.cssText = "opacity:.7;flex:0 0 auto;";
  sortBtn.append(sortBtnLabel, sortBtnArrow);
  const sortMenu = document.createElement("div");
  sortMenu.style.cssText = "display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:20;border:1px solid var(--qx-border);border-radius:var(--qx-radius);background:var(--qx-card-bg);color:var(--qx-text-color);box-shadow:0 8px 24px rgba(0,0,0,.18);overflow:hidden;";
  sortOpts.forEach(([v, label]) => {
    const o = document.createElement("button");
    o.type = "button";
    o.style.cssText = "width:100%;display:block;text-align:left;padding:9px 10px;border:0;border-bottom:1px solid var(--qx-border);background:" + (v === qxTopicSort ? "var(--qx-main-color)" : "var(--qx-card-bg)") + ";color:" + (v === qxTopicSort ? "var(--qx-on-main)" : "var(--qx-text-color)") + ";font-size:var(--qx-fs-sm);cursor:pointer;";
    o.textContent = label + (v === qxTopicSort ? " ✓" : "");
    o.onclick = (ev) => { ev.stopPropagation(); qxTopicSort = v; renderTopics(); };
    sortMenu.appendChild(o);
  });
  const closeSortMenu = (ev) => { if (!sortWrap.contains(ev.target)) { sortMenu.style.display = "none"; sortBtn.setAttribute("aria-expanded", "false"); document.removeEventListener("click", closeSortMenu); } };
  sortBtn.onclick = (ev) => { ev.stopPropagation(); const open = sortMenu.style.display === "block"; sortMenu.style.display = open ? "none" : "block"; sortBtn.setAttribute("aria-expanded", open ? "false" : "true"); if (!open) document.addEventListener("click", closeSortMenu); };
  sortWrap.append(sortBtn, sortMenu);
  // heading: [count] [sort] [single view toggle] — sort মাঝখানে, toggle ডানে
  const toggleEl = topicHeading.querySelector(".qx-view-toggle");
  topicHeading.insertBefore(sortWrap, toggleEl);
  app.appendChild(topicHeading);
  if (!QX_TOPICS.length) return msg("এখনো কোনো বিষয় যোগ হয়নি");
  const grid = qxListGrid();
  sorted.forEach(({ t, serial }) => {
    const topicItem = item(toBn(serial), t.bn, toBn(t.count) + " বার", t.ar, () => renderTopicDetail(t));
    topicItem.classList.add("surah-item");
    const arabic = topicItem.querySelector(".ar-name");
    if (arabic) { arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); }
    grid.appendChild(topicItem);
  });
  app.appendChild(grid);
  const topicFoot = document.createElement("div");
  topicFoot.className = "bn";
  topicFoot.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:12px 0 0;text-align:center;";
  topicFoot.textContent = "উৎস: Quranic Arabic Corpus v0.4 — mustafa0x ফোর্ক | শব্দের ধাতু/Root ধরে গণনা";
  app.appendChild(topicFoot);
}

let qxDictQ = "", qxDictFilter = "all";
function renderDict(){
  app.innerHTML = "";
  const head = document.createElement("div");
  head.className = "bn";
  head.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:2px 0 8px;text-align:center;";
  head.textContent = "আরবি টাইপ করতে হবে না — বাংলা অর্থ লেখো, বা ধাতুর নম্বর লেখো। ১টা ধাতু জানলে ওই ধাতুর সব শব্দ চেনা যায়।";
  app.appendChild(head);
  app.appendChild(qxListHeading(toBn(QX_DICT.length) + "টি ধাতু"));
  const search = document.createElement("input");
  search.type = "search"; search.value = qxDictQ; search.placeholder = "বাংলা অর্থ লেখো, বা ধাতুর নম্বর লেখো (১–১৬৫১)…";
  search.style.cssText = "width:100%;padding:10px;border:1px solid var(--qx-border);border-radius:var(--qx-radius);background:var(--qx-card-bg);color:var(--qx-text-color);font:inherit;margin-bottom:8px;";
  search.oninput = () => { qxDictQ = search.value; renderDictList(); };
  app.appendChild(search);
  const filters = document.createElement("div");
  filters.style.cssText = "display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;";
  [["all","সব"],["bn","অর্থ আছে"],["nobn","অর্থ বাকি"]].forEach(([v,label]) => {
    const b = document.createElement("button"); b.type = "button";
    b.textContent = label;
    b.style.cssText = "padding:6px 12px;border:1px solid var(--qx-border);border-radius:999px;background:" + (qxDictFilter===v?"var(--qx-main-color)":"var(--qx-card-bg)") + ";color:" + (qxDictFilter===v?"var(--qx-on-main)":"var(--qx-text-color)") + ";cursor:pointer;font:inherit;";
    b.onclick = () => { qxDictFilter = v; renderDict(); };
    filters.appendChild(b);
  });
  app.appendChild(filters);
  const wrap = document.createElement("div"); wrap.id = "qx-dict-list"; app.appendChild(wrap);
  renderDictList();
  const foot = document.createElement("div");
  foot.className = "bn";
  foot.style.cssText = "opacity:.7;font-size:11px;font-style:italic;margin:12px 0 0;text-align:center;";
  foot.textContent = "উৎস: Quranic Arabic Corpus v0.4 — mustafa0x ফোর্ক | বাংলা অর্থ ধাপে ধাপে পূরণ হচ্ছে";
  app.appendChild(foot);
}
function renderDictList(){
  const wrap = document.getElementById("qx-dict-list"); if (!wrap) return;
  const qRaw = qxDictQ.trim().toLowerCase();
  const q = qRaw.replace(/[০-৯]/g, ch => "০১২৩৪৫৬৭৮৯".indexOf(ch));
  let list = QX_DICT.map((d, i) => ({ d, rank: i + 1 }));
  if (qxDictFilter === "bn") list = list.filter(x => x.d[1]);
  if (qxDictFilter === "nobn") list = list.filter(x => !x.d[1]);
  if (q) {
    if (/^\d+$/.test(q)) {
      const n = +q;
      list = list.filter(x => x.rank === n);
    } else {
      list = list.filter(x => x.d[0].includes(qRaw) || x.d[1].toLowerCase().includes(qRaw) || x.d[4].toLowerCase().includes(qRaw));
    }
  }
  wrap.innerHTML = "";
  const shown = list.slice(0, 300);
  const note = document.createElement("div"); note.className = "bn";
  note.style.cssText = "opacity:.7;font-size:12px;margin-bottom:8px;";
  note.textContent = "দেখাইতেছি: " + toBn(shown.length) + "টা ধাতু" + (list.length > 300 ? " (প্রথম ৩০০টা — বাংলা অর্থ বা নম্বর লিখলে বাকিগুলা আসবে)" : "") + (/^\\d+$/.test(q) ? " · নম্বর " + toBn(q) + "-এর ধাতু" : "");
  wrap.appendChild(note);
  const grid = qxListGrid();
  shown.forEach(({ d, rank }) => {
    const title = d[1] || "—";
    const it = item(toBn(rank), title, toBn(d[2]) + " বার · " + toBn(d[3]) + "টি আয়াত", d[0], () => renderDictDetail(d, rank));
    it.classList.add("surah-item");
    const arabic = it.querySelector(".ar-name");
    if (arabic) { arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); }
    grid.appendChild(it);
  });
  wrap.appendChild(grid);
  if (!shown.length) wrap.appendChild(msg("কিছু পাওয়া যায়নি"));
}
function renderDictDetail(d, rank){
  qxNav.pushMode(); showOther(d[1] || "ধাতু " + d[0]);
  const back = document.createElement("button");
  back.type = "button"; back.className = "qx-back-link"; back.textContent = "‹ সব ধাতু";
  back.onclick = () => { if (qxNav.modePushed) history.back(); else renderHome(); };
  app.appendChild(back);
  const card = document.createElement("div"); card.className = "ayah qx-sec-card";
  const arabic = document.createElement("div"); arabic.className = "ar";
  arabic.setAttribute("lang", "ar"); arabic.setAttribute("dir", "rtl"); arabic.textContent = d[0];
  const info = document.createElement("div"); info.className = "bn";
  info.innerHTML = "<b>" + (d[1] || "— বাংলা অর্থ এখনো দেওয়া হয় নাই") + "</b><br>ধাতু #" + toBn(rank) + " · " + toBn(d[2]) + " বার · " + toBn(d[3]) + "টি আয়াতে · প্রথম আয়াত: " + d[5];
  const lems = document.createElement("div"); lems.className = "bn";
  lems.style.cssText = "opacity:.85;margin-top:8px;";
  lems.textContent = "একই ধাতুর শব্দ (LEM): " + (d[4] ? d[4].split("¦").join(" • ") : "—");
  card.append(arabic, info, lems); app.appendChild(card);
  const topic = QX_TOPICS.find(t => t.ar === d[0]);
  if (topic) {
    const tb = document.createElement("button"); tb.type = "button"; tb.className = "qx-back-link";
    tb.textContent = "এই ধাতুর বিষয় দেখো: " + topic.bn + " ›";
    tb.onclick = () => renderTopicDetail(topic);
    app.appendChild(tb);
  }
  const ob = document.createElement("button"); ob.type = "button"; ob.className = "qx-back-link";
  const parts = d[5].split(":"); ob.textContent = "প্রথম আয়াত খুলো: সূরা " + toBn(parts[0]) + ":" + toBn(parts[1]) + " ›";
  ob.onclick = () => openSurah(+parts[0], 0, +parts[1]);
  app.appendChild(ob);
}
function renderTopicDetail(t){
  window.qxTopicOpen = t;
  qxNav.pushMode();
  showOther(t.bn);
  const back = document.createElement("button");
  back.type = "button";
  back.className = "qx-back-link";
  back.textContent = "‹ সব বিষয়";
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
    grid.appendChild(ayahItem);
  });
  app.appendChild(grid);
}

function renderQuranHome(){
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
  if (LOCAL && LOCAL.info) { const f = document.createElement("div"); f.className = "msg"; f.style.fontSize = "12px"; f.textContent = LOCAL.info; app.appendChild(f); }
}

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

  const copyBtn = document.createElement("button");
  copyBtn.className = "icon-btn";
  copyBtn.title = "আয়াত কপি করুন";
  copyBtn.textContent = "{{content_copy}}";
  copyBtn.onclick = () => {
    const text = `[${label}]\n${ar}\n\n${bn}\n— Quranix`;
    copyText(text, "আয়াত ক্লিপবোর্ডে কপি হয়েছে!");
  };
  menuItems.push([() => "{{content_copy}} কপি করুন", () => copyBtn.onclick()]);

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
  menuItems.push([() => "{{share}} শেয়ার করুন", () => shareBtn.onclick()]);
  menuItems.push([() => "{{image}} ছবি বানাও", () => { if(window.openAyahCard) window.openAyahCard(label, ar, bn); }]);

  if (a) {
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.setAttribute("aria-label", "এই আয়াতের তেলাওয়াত শুনুন");
    playBtn.className = "icon-btn";
    playBtn.title = "তেলাওয়াত শুনুন";
    playBtn.textContent = "{{volume_up}}";
    playBtn.onclick = () => {
      const list = window._activeAyahList && window._activeAyahList.length ? window._activeAyahList : [a];
      playAyahFromList(list, a.s.number, a.no);
    };
    actions.appendChild(playBtn);

    const tafseerBtn = document.createElement("button");
    tafseerBtn.type = "button";
    tafseerBtn.setAttribute("aria-label", "তাফসির দেখুন");
    tafseerBtn.className = "icon-btn";
    tafseerBtn.title = "তাফসির দেখুন";
    tafseerBtn.textContent = "{{menu_book}}";
    tafseerBtn.onclick = () => {
      openTafseer(a.s.number, a.no, label);
    };
    menuItems.push([() => "{{menu_book}} তাফসির দেখুন", () => tafseerBtn.onclick()]);

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
    menuItems.push([() => goalData.readKeys.includes(k) ? "{{check_circle:f}} পঠিত চিহ্ন সরান" : "{{radio_button_unchecked}} পঠিত চিহ্নিত করুন", () => readBtn.onclick()]);

    const noteBtn = document.createElement("button");
    noteBtn.className = "icon-btn";
    noteBtn.title = "ব্যক্তিগত নোট লিখুন";
    noteBtn.textContent = ayahNotes[k] ? "{{edit_note}}" : "{{edit}}";
    menuItems.push([() => ayahNotes[k] ? "{{edit_note}} নোট দেখুন/এডিট" : "{{edit}} ব্যক্তিগত নোট", () => noteBtn.onclick()]);
    menuItems.push([() => "{{translate}} অনুবাদ পরিবর্তন", () => { if (window.openGridPopup) window.openGridPopup("trans"); }]);

    const st = document.createElement("button"); st.type = "button"; st.setAttribute("aria-label", "সংরক্ষিত আয়াত"); st.className = "star";
    st.textContent = savedHas("quran", k) ? "{{star:f}}" : "{{star}}";
    st.onclick = () => { const on = savedToggle("quran", k); st.textContent = on ? "{{star:f}}" : "{{star}}"; showToast(on ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ সরানো হয়েছে"); if (removable && !on) d.remove(); };
    actions.appendChild(st);

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
  }
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
      menuItems.forEach(([lbl, fn]) => {
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

async function openSurah(n, y, targetAyah){
  const renderToken = ++readerRenderToken;
  reading = last = {t:"s", n, y:0}; lsSet("last", last);
  const s = surahs.find(x => x.number === n);
  showReader(s ? s.englishName : "সূরা " + n);
  msg("লোড হচ্ছে…");
  try {
    const ayahs = await loadSurahAyahs(n);
    const bism = await loadBismillah();
    if (renderToken !== readerRenderToken) return;
    app.innerHTML = "";
    if (n !== 1 && n !== 9) {
      const b = document.createElement("div"); b.className = "bism"; b.textContent = bism;
      app.appendChild(b);
    }
    window._activeAyahList = ayahs;
    ayahs.forEach(a => app.appendChild(ayahCard("আয়াত " + toBn(a.no), cleanText(a), a.bn, a)));
    if (targetAyah) {
      const targetCard = document.querySelector(`.ayah[data-key="${n}:${targetAyah}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
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

async function openJuz(n, y){
  const renderToken = ++readerRenderToken;
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

/* ===== নামাজের সময়, তাসবিহ, দোয়া ===== */
function setMode(m){
  mode = m; qEl.value = "";
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.m === m || (m === "tasbih" && b.dataset.m === "dua") || ((m === "tracker" || m === "saved") && b.dataset.m === "more")));
  renderHome();
}
document.querySelectorAll("#nav button[data-m]").forEach(b => b.onclick = () => {
  if (b.dataset.m === "quran") { tab = "all"; renderTabs(); }
  setMode(b.dataset.m);
});
function mk(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function showOther(title){
  stopTimer();
  document.body.classList.remove("reader-active");
  document.body.classList.add("inside-page");
  titleEl.innerHTML = String(title).replace(/\{\{([a-z_0-9]+)(:f)?\}\}/g, function(match, name, filled){
    return '<span class="ms' + (filled ? ' f' : '') + '" aria-hidden="true">' + name + '</span>';
  });
  backBtn.style.display = "none";
  controls.style.display = "none";
  qEl.style.display = "none";
  navEl.style.display = "flex";
  updateAudioBarPos();
  app.innerHTML = "";
  window.scrollTo(0,0);
}

/* --- আরও পেইজ ও নতুন বিভাগের পেইজ (তালিকা প্যাটার্ন) --- */
var RAMADAN_ARTICLE = {
  intro: "রমজান রহমত, মাগফিরাত ও নাজাতের মাস। এই মাসে কুরআন নাজিল হয়েছে, রোজা ফরজ করা হয়েছে এবং জান্নাতের দরজাগুলো খুলে দেওয়া হয়। রোজা শুধু না খেয়ে থাকা নয় — চোখ, কান, জিহ্বা ও মনকে গুনাহ থেকে বাঁচিয়ে রাখাই আসল রোজা।",
  quotes: [
    { kind: "কুরআন", ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ", bn: "হে ঈমানদারগণ! তোমাদের উপর রোজা ফরজ করা হয়েছে, যেমন ফরজ করা হয়েছিল তোমাদের পূর্ববর্তীদের উপর — যাতে তোমরা তাকওয়া অর্জন করতে পারো।", ref: "সূরা আল-বাকারা ২:১৮৩" },
    { kind: "কুরআন", ar: "شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ وَبَيِّنَاتٍ مِنَ الْهُدَى وَالْفُرْقَانِ", bn: "রমজান মাস — এ মাসেই কুরআন নাজিল হয়েছে, মানুষের জন্য হিদায়াত এবং সত্য-মিথ্যার পার্থক্যকারী সুস্পষ্ট নিদর্শন হিসেবে।", ref: "সূরা আল-বাকারা ২:১৮৫" },
    { kind: "হাদিস", ar: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", bn: "যে ব্যক্তি ঈমান ও সওয়াবের আশায় রমজানে রোজা রাখে, তার আগের সব গুনাহ ক্ষমা করে দেওয়া হয়।", ref: "সহিহ বুখারি ৩৮, সহিহ মুসলিম ৭৬০" },
    { kind: "হাদিস", ar: "الصِّيَامُ جُنَّةٌ", bn: "রোজা হলো ঢাল স্বরূপ — যা বান্দাকে জাহান্নাম থেকে রক্ষা করে।", ref: "সহিহ বুখারি ১৮৯৪, সহিহ মুসলিম ১১৫১" }
  ]
};
var KALIMA_DATA = [
  { num: "১", title: "কালিমা তাইয়্যিবা", ar: "لَا إِلَهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ", bn: "আল্লাহ ছাড়া কোনো সত্য ইলাহ নেই, মুহাম্মাদ ﷺ আল্লাহর রাসূল।", ref: "সূত্র: সহিহ বুখারি ও সহিহ মুসলিম — লা ইলাহা ইল্লাল্লাহ-এর ফজিলত" },
  { num: "২", title: "কালিমা শাহাদাত", ar: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", bn: "আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো সত্য ইলাহ নেই এবং মুহাম্মাদ ﷺ তাঁর বান্দা ও রাসূল।", ref: "সূত্র: সহিহ বুখারি ৮, সহিহ মুসলিম ১৬ — ইসলামের ৫ ভিত্তি" },
  { num: "৩", title: "কালিমা তামজিদ", ar: "سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ", bn: "আল্লাহ পবিত্র, সব প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো ইলাহ নেই, আল্লাহ সবচেয়ে বড়; মহান আল্লাহ ছাড়া কোনো শক্তি-ক্ষমতা নেই।", ref: "সূত্র: সহিহ মুসলিম — তাসবিহ, তাহমিদ, তাহলিল ও তাকবিরের ফজিলত" },
  { num: "৪", title: "কালিমা তাওহিদ", ar: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", bn: "আল্লাহ ছাড়া কোনো ইলাহ নেই, তিনি এক, তাঁর কোনো শরিক নেই; রাজত্ব ও প্রশংসা তাঁরই, তিনি জীবন-মৃত্যু দেন, তিনি সবকিছুর ওপর ক্ষমতাবান।", ref: "সূত্র: সহিহ বুখারি ৩২৯৩, সহিহ মুসলিম ২৬৯১" },
  { num: "৫", title: "কালিমা আস্তাগফার", ar: "أَسْتَغْفِرُ اللهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", bn: "আমি আমার রব আল্লাহর কাছে সব গুনাহ থেকে ক্ষমা চাই এবং তাঁর দিকেই ফিরে আসি।", ref: "সূত্র: সহিহ বুখারি ৬৩০৬ — ইস্তিগফার ও সাইয়্যিদুল ইস্তিগফারের ফজিলত" }
];

var QX_SECTIONS = {
  ramadan: { icon: "no_meals", title: "রমজান", sub: "রোজা ও রমজানের আমল" },
  kalima: { icon: "auto_awesome", title: "কালিমা", sub: "ঈমানের ঘোষণা" },
  hajj: { icon: "view_in_ar", title: "হজ্জ", sub: "হজ্জের পরিচিতি" },
  zakat: { icon: "toll", title: "যাকাত", sub: "যাকাতের পরিচিতি" },
  books: { icon: "edit_note", title: "বই ও অনুচ্ছেদ", sub: "বই ও লেখা" }
};
function qxRow(icon, title, sub, onclick){
  const b = mk("button", "qx-row");
  b.type = "button";
  b.innerHTML = '<span class="qx-row-ic">{{' + icon + '}}</span><span class="qx-row-tx"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="qx-row-go">›</span>';
  b.onclick = onclick;
  return b;
}
function renderMore(){
  showOther("{{more_horiz}} আরও");
  const box = mk("div", "qx-list");
  box.appendChild(qxRow("star", "সংরক্ষিত", "বুকমার্ক ও ফেভারিট", function(){ setMode("saved"); }));
  box.appendChild(qxRow("bar_chart", "ট্র্যাকার", "প্রতিদিনের হিসাব", function(){ setMode("tracker"); }));
  app.appendChild(box);
}
function qxSecSource(card, ref){
  if(!ref) return;
  card.appendChild(qxNmSource(String(ref).replace(/^সূত্র:\s*/, "")));
}
function qxSecQuote(card, q){
  const ar = mk("div", "ar", q.ar);
  ar.dir = "rtl"; ar.lang = "ar";
  card.appendChild(ar);
  card.appendChild(mk("div", "bn", q.bn));
  qxSecSource(card, q.ref);
}
function renderSection(key){
  const sc = QX_SECTIONS[key];
  showOther("{{" + sc.icon + "}} " + sc.title);
  const page = mk("div", "qx-nm qx-sec-page");
  if(key === "ramadan"){
    const intro = mk("div", "ayah qx-sec-card");
    const head = mk("div", "no");
    head.appendChild(mk("span", "ayah-number", "রমজান — রোজা ও রমজানের আমল"));
    intro.appendChild(head);
    intro.appendChild(mk("div", "bn", RAMADAN_ARTICLE.intro));
    page.appendChild(intro);
    RAMADAN_ARTICLE.quotes.forEach(function(q){
      const card = mk("div", "ayah qx-sec-card");
      const h = mk("div", "no");
      h.appendChild(mk("span", "ayah-number", q.kind));
      card.appendChild(h);
      qxSecQuote(card, q);
      page.appendChild(card);
    });
  } else if(key === "kalima"){
    KALIMA_DATA.forEach(function(k){
      const card = mk("div", "ayah qx-sec-card");
      const h = mk("div", "no qx-sec-head");
      const left = mk("div", "qx-sec-left");
      left.appendChild(mk("span", "qx-num-badge", k.num));
      left.appendChild(mk("span", "ayah-number qx-sec-title", k.title));
      h.appendChild(left);
      const arrow = mk("span", "qx-tri-badge", "▽");
      h.appendChild(arrow);
      h.onclick = function(){
        const isOpen = card.classList.toggle("open");
        arrow.textContent = isOpen ? "▼" : "▽";
      };
      card.appendChild(h);
      const body = mk("div", "qx-sec-body");
      qxSecQuote(body, k);
      card.appendChild(body);
      page.appendChild(card);
    });
  } else {
    const card = mk("div", "ayah qx-sec-card");
    const empty = mk("div", "qx-empty");
    empty.innerHTML = "<b>এই বিভাগে এখনো কিছু যোগ হয়নি</b><small>কনটেন্ট যুক্ত হলে এখানে তালিকা আকারে দেখা যাবে।</small>";
    card.appendChild(empty);
    page.appendChild(card);
  }
  app.appendChild(page);
}

/* --- সংরক্ষিত পেইজ --- */
var savedView = "cat";
var savedFolder = null;
function qxSheet(title, build){
  const ov = mk("div", "sheet-ov"), box = mk("div", "sheet-box"), head = mk("div", "sheet-head");
  const x = mk("button"); x.type = "button"; x.textContent = "{{close}}";
  const close = () => ov.remove();
  x.onclick = close; ov.onclick = (e) => { if (e.target === ov) close(); };
  head.appendChild(mk("span", "", title)); head.appendChild(x); box.appendChild(head);
  build(box, close);
  ov.appendChild(box); document.body.appendChild(ov);
}
function qxAskName(title, initial, ok){
  qxSheet(title, function(box, close){
    const inp = mk("input", "qx-input"); inp.type = "text"; inp.maxLength = 40; inp.value = initial || ""; inp.placeholder = "ফোল্ডারের নাম";
    const go = mk("button", "qx-btn", "সংরক্ষণ করুন"); go.type = "button";
    go.onclick = function(){ const v = inp.value.trim(); if (!v) { inp.focus(); return; } close(); ok(v); };
    inp.onkeydown = function(e){ if (e.key === "Enter") go.onclick(); };
    box.appendChild(inp); box.appendChild(go); setTimeout(function(){ inp.focus(); }, 60);
  });
}
function qxConfirm(text, okLabel, ok){
  qxSheet(text, function(box, close){
    const go = mk("button", "qx-btn danger", okLabel); go.type = "button";
    go.onclick = function(){ close(); ok(); };
    const no = mk("button", "qx-btn ghost", "বাতিল"); no.type = "button"; no.onclick = close;
    box.appendChild(go); box.appendChild(no);
  });
}
function qxMoveItem(it, after){
  qxSheet("ফোল্ডার বাছাই করুন", function(box, close){
    const list = mk("div", "qx-list");
    [[null, "ফোল্ডার ছাড়া"]].concat(saved.folders.map(f => [f.id, f.name])).forEach(function(o){
      const cur = (o[0] === null && !it.f) || o[0] === it.f;
      list.appendChild(qxRow(cur ? "check" : "folder_open", o[1], "", function(){ it.f = o[0]; qxSaveStore(); close(); showToast("সরানো হয়েছে"); after(); }));
    });
    box.appendChild(list);
    const nf = mk("button", "qx-btn", "নতুন ফোল্ডার বানান"); nf.type = "button";
    nf.onclick = function(){ close(); qxAskName("নতুন ফোল্ডার", "", function(name){ const f = { id: "f" + Date.now(), name: name }; saved.folders.push(f); it.f = f.id; qxSaveStore(); showToast("ফোল্ডারে সরানো হয়েছে"); after(); }); };
    box.appendChild(nf);
  });
}
function qxSavedEntry(it, after){
  const wrap = mk("div", "qx-saved"), body = mk("div", "qx-saved-body");
  wrap.appendChild(body);
  const sn = it.snap || {};
  if (it.c === "quran") {
    const p = it.id.split(":").map(Number);
    body.appendChild(mk("div", "msg", "লোড হচ্ছে…"));
    loadSurahAyahs(p[0]).then(function(list){
      const a = list[p[1] - 1]; body.innerHTML = "";
      if (!a) { body.appendChild(mk("div", "msg", "আয়াত পাওয়া যায়নি")); return; }
      body.appendChild(ayahCard(a.s.englishName + " · আয়াত " + toBn(a.no), cleanText(a), a.bn, a, false));
    }).catch(function(){ body.innerHTML = ""; body.appendChild(mk("div", "msg", "লোড করা যায়নি।")); });
  } else if (it.c === "hadith") {
    const h = mk("div", "hadith-item");
    h.appendChild(mk("div", "ar", sn.ar || "")); h.appendChild(mk("b", "", sn.title || ""));
    h.appendChild(mk("div", "qx-sn", sn.bn || "")); h.appendChild(mk("div", "ref", sn.ref || ""));
    body.appendChild(h);
  } else {
    const c = ayahCard(sn.title || it.id, sn.ar || "", sn.bn || "", null);
    if (sn.src) c.appendChild(mk("div", "src", "সূত্র: " + sn.src));
    body.appendChild(c);
  }
  const act = mk("div", "qx-saved-act");
  const mv = mk("button", "qx-link"); mv.type = "button"; mv.innerHTML = "{{folder_open}} ফোল্ডারে সরান"; mv.onclick = function(){ qxMoveItem(it, after); };
  const rm = mk("button", "qx-link danger"); rm.type = "button"; rm.innerHTML = "{{delete}} সরান";
  rm.onclick = function(){ savedToggle(it.c, it.id); showToast("সংরক্ষণ সরানো হয়েছে"); after(); };
  act.appendChild(mv); act.appendChild(rm); wrap.appendChild(act);
  return wrap;
}
function qxSavedEmpty(text){
  const box = mk("div", "qx-list"), e = mk("div", "qx-empty");
  e.innerHTML = "<b>" + text + "</b><small>আয়াত, হাদিস বা দোয়ার পাশের {{star}} চাপলে এখানে জমা হবে।</small>";
  box.appendChild(e); app.appendChild(box);
}
function renderSaved(){
  showOther("{{star:f}} সংরক্ষিত");
  const seg = mk("div", "qx-seg");
  [["cat", "ক্যাটাগরি অনুযায়ী"], ["folders", "আমার ফোল্ডার"]].forEach(function(o){
    const b = mk("button", o[0] === savedView ? "on" : "", o[1]); b.type = "button";
    b.onclick = function(){ savedView = o[0]; savedFolder = null; renderSaved(); };
    seg.appendChild(b);
  });
  app.appendChild(seg);
  if (savedView === "cat") renderSavedByCategory(); else renderSavedFolders();
}
function renderSavedByCategory(){
  let any = false;
  [["quran", "কুরআন"], ["hadith", "হাদিস"], ["dua", "দোয়া"]].forEach(function(g){
    const its = saved.items.filter(x => x.c === g[0]);
    if (!its.length) return;
    any = true;
    app.appendChild(mk("div", "qx-gh", g[1] + " · " + toBn(its.length)));
    its.slice().reverse().forEach(it => app.appendChild(qxSavedEntry(it, renderSaved)));
  });
  if (!any) qxSavedEmpty("কিছু সংরক্ষিত নেই");
}
function renderSavedFolders(){
  const f = savedFolder ? saved.folders.find(x => x.id === savedFolder) : null;
  if (savedFolder && !f) savedFolder = null;
  if (f) {
    const bar = mk("div", "qx-fbar");
    const back = mk("button", "qx-link", "← সব ফোল্ডার"); back.type = "button"; back.onclick = function(){ savedFolder = null; renderSaved(); };
    const ren = mk("button", "qx-link"); ren.type = "button"; ren.innerHTML = "{{edit}} নাম বদলান";
    ren.onclick = function(){ qxAskName("ফোল্ডারের নাম", f.name, function(v){ f.name = v; qxSaveStore(); renderSaved(); }); };
    const del = mk("button", "qx-link danger"); del.type = "button"; del.innerHTML = "{{delete}} ফোল্ডার মুছুন";
    del.onclick = function(){ qxConfirm("ফোল্ডারটি মুছবে? ভেতরের আইটেম মুছবে না, ক্যাটাগরি তালিকায় থেকে যাবে।", "ফোল্ডার মুছুন", function(){ saved.items.forEach(x => { if (x.f === f.id) x.f = null; }); saved.folders = saved.folders.filter(x => x.id !== f.id); savedFolder = null; qxSaveStore(); renderSaved(); }); };
    bar.appendChild(back); bar.appendChild(ren); bar.appendChild(del); app.appendChild(bar);
    app.appendChild(mk("div", "qx-gh", f.name));
    const its = saved.items.filter(x => x.f === f.id);
    if (!its.length) { qxSavedEmpty("এই ফোল্ডার খালি"); return; }
    its.slice().reverse().forEach(it => app.appendChild(qxSavedEntry(it, renderSaved)));
    return;
  }
  if (saved.folders.length) {
    const list = mk("div", "qx-list");
    saved.folders.forEach(function(fo){
      const n = saved.items.filter(x => x.f === fo.id).length;
      list.appendChild(qxRow("folder_open", fo.name, toBn(n) + "টি আইটেম", function(){ savedFolder = fo.id; renderSaved(); }));
    });
    app.appendChild(list);
  } else {
    const box = mk("div", "qx-list"), e = mk("div", "qx-empty");
    e.innerHTML = "<b>কোনো ফোল্ডার নেই</b><small>নিজের মতো সাজাতে ফোল্ডার বানান, তারপর সংরক্ষিত আইটেম সেখানে সরান।</small>";
    box.appendChild(e); app.appendChild(box);
  }
  const nf = mk("button", "qx-btn", "নতুন ফোল্ডার বানান"); nf.type = "button";
  nf.onclick = function(){ qxAskName("নতুন ফোল্ডার", "", function(name){ saved.folders.push({ id: "f" + Date.now(), name: name }); qxSaveStore(); renderSaved(); }); };
  app.appendChild(nf);
}

/* --- নামাজের সময় ও ইউটিলিটি (Phase 3) --- */
const D2R = Math.PI / 180;
const dsin = d => Math.sin(d*D2R), dcos = d => Math.cos(d*D2R), dtan = d => Math.tan(d*D2R);
const darcsin = x => Math.asin(x)/D2R, darccos = x => Math.acos(x)/D2R;
const darctan2 = (y,x) => Math.atan2(y,x)/D2R, darccot = x => Math.atan(1/x)/D2R;
const fixA = a => a - 360*Math.floor(a/360), fixH = a => a - 24*Math.floor(a/24);

/* হিসাব পদ্ধতিসমূহ (Calculation Methods) */
const CALC_METHODS = {
  karachi: { name: "করাচি (ইসলামিক সায়েন্সেস বিশ্ববিদ্যালয়)", fajr: 18, isha: 18, ishaMin: 0 },
  mwl:     { name: "মুসলিম ওয়ার্ল্ড লীগ (MWL)", fajr: 18, isha: 17, ishaMin: 0 },
  isna:    { name: "ইসনা (ISNA - উত্তর আমেরিকা)", fajr: 15, isha: 15, ishaMin: 0 },
  egypt:   { name: "মিশরীয় জেনারেল অথরিটি", fajr: 19.5, isha: 17.5, ishaMin: 0 },
  makkah:  { name: "উম্মুল কুরা (মক্কা)", fajr: 18.5, isha: 0, ishaMin: 90 }
};

let calcMethodKey = lsGet("calcMethod", "karachi");
if (!CALC_METHODS[calcMethodKey]) calcMethodKey = "karachi";
let tzMode = lsGet("tzMode", "auto"); // "auto" or numeric offset e.g. 6, 5.5, 0
let dstAdd = lsGet("dstAdd", 0); // 0 or 1 hour
let prayerSubTab = "learn"; // "learn" | "times" | "qibla" | "alerts"

/* নামাজের নোটিফিকেশন ও আজান সেটিংস */
let alertCfg = lsGet("prayerAlerts", {
  enabled: false,
  sound: "adhan", // "adhan" | "beep" | "silent"
  prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }
});
let lastTriggeredKey = "";

function playAdhanTone(type){
  if (type === "silent") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = type === "adhan"
      ? [[440, 0, 0.55], [493.88, 0.6, 0.55], [523.25, 1.2, 0.9], [493.88, 2.2, 0.55], [440, 2.8, 1.1]]
      : [[587.33, 0, 0.25], [880, 0.3, 0.45]];
    notes.forEach(([freq, start, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === "adhan" ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
  } catch(e){}
}

function triggerPrayerAlert(prayerKey, prayerLabel, timeText){
  const trigId = todayStr() + ":" + prayerKey;
  if (lastTriggeredKey === trigId) return;
  lastTriggeredKey = trigId;
  playAdhanTone(alertCfg.sound);
  showToast(`এখন ${prayerLabel} নামাজের ওয়াক্ত (${timeText})`);
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`Quranix · ${prayerLabel} নামাজের সময়`, {
        body: `${loc.n} — এখন ${prayerLabel} নামাজের ওয়াক্ত শুরু হয়েছে (${timeText})।`
      });
    } catch(e){}
  }
}

function julian(y,m,d){ if (m <= 2) { y -= 1; m += 12; } const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4); return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5; }
function sunPos(jd){
  const D = jd - 2451545.0, g = fixA(357.529 + 0.98560028*D), q = fixA(280.459 + 0.98564736*D);
  const L = fixA(q + 1.915*dsin(g) + 0.020*dsin(2*g)), e = 23.439 - 0.00000036*D;
  const RA = darctan2(dcos(e)*dsin(L), dcos(L))/15;
  return { eqt: q/15 - fixH(RA), decl: darcsin(dsin(e)*dsin(L)) };
}
function getEffectiveTz(date){
  const baseTz = tzMode === "auto" ? (-date.getTimezoneOffset()/60) : Number(tzMode);
  return baseTz + (tzMode === "auto" ? 0 : (Number(dstAdd) || 0));
}
function calcDay(date, lat, lng, asrF){
  const m = CALC_METHODS[calcMethodKey] || CALC_METHODS.karachi;
  const tz = getEffectiveTz(date);
  const jd = julian(date.getFullYear(), date.getMonth()+1, date.getDate()) - lng/360;
  const pos = t => sunPos(jd + t), mid = t => fixH(12 - pos(t).eqt);
  const ang = (a, t, ccw) => {
    const p = pos(t), x = (-dsin(a) - dsin(p.decl)*dsin(lat)) / (dcos(p.decl)*dcos(lat));
    if (x > 1 || x < -1) return NaN;
    const v = darccos(x)/15; return mid(t) + (ccw ? -v : v);
  };
  const asr = t => ang(-darccot(asrF + dtan(Math.abs(lat - pos(t).decl))), t, false);
  const maghribH = ang(0.833, 18/24, false);
  const ishaH = m.ishaMin > 0 ? (maghribH + m.ishaMin/60) : ang(m.isha, 18/24, false);
  const raw = {
    fajr: ang(m.fajr, 5/24, true),
    sunrise: ang(0.833, 6/24, true),
    dhuhr: mid(12/24) + 1/60,
    asr: asr(13/24),
    maghrib: maghribH,
    isha: ishaH
  };
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(), out = {};
  for (const k in raw) { const h = raw[k] + tz - lng/15; out[k] = isNaN(h) ? null : new Date(Math.round((base + h*3600000)/60000)*60000); }
  return out;
}

/* বিভাগ → জেলা (জেলা সদরের আনুমানিক স্থানাঙ্ক) */
const BD_DISTRICTS = {
  "ঢাকা": [["ঢাকা", 23.8103, 90.4125], ["গাজীপুর", 24.0023, 90.4264], ["নারায়ণগঞ্জ", 23.6238, 90.5], ["নরসিংদী", 23.9322, 90.7151], ["মুন্সিগঞ্জ", 23.5422, 90.5305], ["মানিকগঞ্জ", 23.8617, 90.0003], ["টাঙ্গাইল", 24.2513, 89.9167], ["কিশোরগঞ্জ", 24.4449, 90.7766], ["ফরিদপুর", 23.607, 89.8429], ["গোপালগঞ্জ", 23.005, 89.8266], ["মাদারীপুর", 23.1641, 90.1897], ["রাজবাড়ী", 23.7574, 89.6445], ["শরীয়তপুর", 23.2423, 90.4348]],
  "চট্টগ্রাম": [["চট্টগ্রাম", 22.3569, 91.7832], ["কক্সবাজার", 21.4272, 92.0058], ["কুমিল্লা", 23.4607, 91.1809], ["ফেনী", 23.0159, 91.3976], ["ব্রাহ্মণবাড়িয়া", 23.9571, 91.1115], ["নোয়াখালী", 22.8696, 91.0995], ["চাঁদপুর", 23.2332, 90.6713], ["লক্ষ্মীপুর", 22.9425, 90.8412], ["খাগড়াছড়ি", 23.1193, 91.9847], ["রাঙ্গামাটি", 22.7324, 92.2985], ["বান্দরবান", 22.1953, 92.2184]],
  "রাজশাহী": [["রাজশাহী", 24.3745, 88.6042], ["বগুড়া", 24.8465, 89.3773], ["জয়পুরহাট", 25.0968, 89.0227], ["নওগাঁ", 24.7936, 88.9318], ["নাটোর", 24.4206, 89.0], ["চাঁপাইনবাবগঞ্জ", 24.5965, 88.2775], ["পাবনা", 24.0064, 89.2372], ["সিরাজগঞ্জ", 24.4534, 89.7007]],
  "খুলনা": [["খুলনা", 22.8456, 89.5403], ["বাগেরহাট", 22.6602, 89.7895], ["চুয়াডাঙ্গা", 23.6401, 88.8418], ["যশোর", 23.1634, 89.2182], ["ঝিনাইদহ", 23.545, 89.1726], ["কুষ্টিয়া", 23.9013, 89.1205], ["মাগুরা", 23.4873, 89.4199], ["মেহেরপুর", 23.7622, 88.6318], ["নড়াইল", 23.1725, 89.5126], ["সাতক্ষীরা", 22.7185, 89.0705]],
  "বরিশাল": [["বরিশাল", 22.701, 90.3535], ["বরগুনা", 22.1591, 90.1256], ["ভোলা", 22.6859, 90.6482], ["ঝালকাঠি", 22.6406, 90.1987], ["পটুয়াখালী", 22.3596, 90.3298], ["পিরোজপুর", 22.5841, 89.972]],
  "সিলেট": [["সিলেট", 24.8949, 91.8687], ["হবিগঞ্জ", 24.3745, 91.4156], ["মৌলভীবাজার", 24.4829, 91.7774], ["সুনামগঞ্জ", 25.0658, 91.4073]],
  "রংপুর": [["রংপুর", 25.7439, 89.2752], ["দিনাজপুর", 25.6217, 88.6354], ["গাইবান্ধা", 25.3297, 89.543], ["কুড়িগ্রাম", 25.8054, 89.6361], ["লালমনিরহাট", 25.9923, 89.2847], ["নীলফামারী", 25.9318, 88.856], ["পঞ্চগড়", 26.3411, 88.5541], ["ঠাকুরগাঁও", 26.0337, 88.4616]],
  "ময়মনসিংহ": [["ময়মনসিংহ", 24.7471, 90.4203], ["জামালপুর", 24.9375, 89.9378], ["নেত্রকোনা", 24.87, 90.7279], ["শেরপুর", 25.0204, 90.0153]]
};

/* জেলা → থানা/উপজেলা [নাম, lat, lng]; তথ্য থাকলে থানা অপশন চালু হয় */
const BD_THANAS = {
  "ঢাকা": [["মিরপুর",23.8069,90.3687],["গুলশান",23.7925,90.4078],["ধানমন্ডি",23.7461,90.3742],["উত্তরা",23.8759,90.3795],["মতিঝিল",23.7330,90.4172],["মোহাম্মদপুর",23.7662,90.3589],["তেজগাঁও",23.7590,90.3930],["যাত্রাবাড়ী",23.7104,90.4349],["ডেমরা",23.7184,90.4929],["সাভার",23.8583,90.2667],["কেরানীগঞ্জ",23.6981,90.3540]]
};

const CITIES = [
  ["ঢাকা",23.8103,90.4125],
  ["চট্টগ্রাম",22.3569,91.7832],
  ["সিলেট",24.8949,91.8687],
  ["রাজশাহী",24.3745,88.6042],
  ["খুলনা",22.8456,89.5403],
  ["বরিশাল",22.7010,90.3535],
  ["রংপুর",25.7439,89.2752],
  ["ময়মনসিংহ",24.7471,90.4203],
  ["কুমিল্লা",23.4607,91.1809],
  ["মক্কা",21.4225,39.8262],
  ["মদিনা",24.4672,39.6111],
  ["কলকাতা",22.5726,88.3639],
  ["লন্ডন",51.5072,-0.1276],
  ["নিউ ইয়র্ক",40.7128,-74.0060]
];
const PRAYERS = [["fajr","ফজর"],["sunrise","সূর্যোদয়"],["dhuhr","যোহর"],["asr","আসর"],["maghrib","মাগরিব"],["isha","এশা"]];
let loc = lsGet("loc", { n:"ঢাকা", lat:23.8103, lng:90.4125 });
let asrF = lsGet("asr", 2);
function fmtTime(d){ if (!d) return "—"; let h = d.getHours(); const m = d.getMinutes(), ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return toBn(String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0")) + " " + ap; }
function fmtCd(ms){ const s = Math.max(0, Math.floor(ms/1000)); return toBn([Math.floor(s/3600), Math.floor(s%3600/60), s%60].map(v => String(v).padStart(2,"0")).join(":")); }
function nextPrayer(now){
  const t = calcDay(now, loc.lat, loc.lng, asrF);
  for (const [k,l] of PRAYERS) { if (k !== "sunrise" && t[k] && t[k] > now) return { k, l, at:t[k], today:true }; }
  const t2 = calcDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()+1), loc.lat, loc.lng, asrF);
  return { k:"fajr", l:"ফজর", at:t2.fajr, today:false };
}
function addOpt(sel, v, text){ const o = document.createElement("option"); o.value = String(v); o.textContent = text; sel.appendChild(o); }
function useGps(status){
  if (!navigator.geolocation) { if (status) status.textContent = "এই ডিভাইসে লোকেশন সাপোর্ট নেই। তালিকা থেকে শহর বেছে নিন।"; return; }
  if (status) status.textContent = "লোকেশন খোঁজা হচ্ছে…";
  navigator.geolocation.getCurrentPosition(p => {
    loc = { n:"আপনার অবস্থান (GPS)", lat:Number(p.coords.latitude.toFixed(4)), lng:Number(p.coords.longitude.toFixed(4)), gps:true };
    lsSet("loc", loc); renderPrayer();
  }, () => { if (status) status.textContent = "লোকেশন পাওয়া যায়নি। অনুমতি দিন বা ম্যানুয়াল লোকেশন ব্যবহার করুন।"; renderPrayerSelectReset(); }, { timeout:12000 });
}
let prayerSel = null;
function renderPrayerSelectReset(){
  if (!prayerSel) return;
  if (loc.gps) prayerSel.value = "cur";
  else if (loc.manual) prayerSel.value = "manual";
  else prayerSel.value = String(Math.max(0, CITIES.findIndex(c => c[0] === (loc.div || loc.n))));
}

/* --- কিবলা দিক ও দূরত্ব গণনা (Great Circle Bearing) --- */
function calcQiblaInfo(lat, lng){
  const kLat = 21.422487 * D2R;
  const kLng = 39.826206 * D2R;
  const pLat = lat * D2R;
  const pLng = lng * D2R;
  const dLng = kLng - pLng;
  const y = Math.sin(dLng);
  const x = Math.cos(pLat) * Math.tan(kLat) - Math.sin(pLat) * Math.cos(dLng);
  let deg = Math.atan2(y, x) / D2R;
  deg = (deg + 360) % 360;

  // Haversine distance to Kaaba in km
  const R = 6371;
  const a = Math.sin((kLat - pLat)/2)**2 + Math.cos(pLat)*Math.cos(kLat)*Math.sin(dLng/2)**2;
  const dist = Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return { deg: Math.round(deg * 10) / 10, dist };
}

let compassCleanup = null;
function stopCompass(){
  if (compassCleanup) { compassCleanup(); compassCleanup = null; }
}

function renderQiblaView(){
  stopCompass();
  const qInfo = calcQiblaInfo(loc.lat, loc.lng);
  const card = mk("div", "p3-card qibla-box");
  card.appendChild(mk("b", null, `{{location_on}} ${loc.n} (${toBn(loc.lat)}°, ${toBn(loc.lng)}°)`));
  card.appendChild(mk("div", "note", `কাবা শরীফের দিক: উত্তর দিক থেকে ${toBn(qInfo.deg)}° · দূরত্ব: প্রায় ${toBn(qInfo.dist)} কি.মি.`));

  const dial = mk("div", "compass-dial");
  const ring = mk("div", "compass-ring");
  const mN = mk("span", "compass-mark n", "N");
  const mS = mk("span", "compass-mark s", "S");
  const mE = mk("span", "compass-mark e", "E");
  const mW = mk("span", "compass-mark w", "W");
  ring.appendChild(mN); ring.appendChild(mS); ring.appendChild(mE); ring.appendChild(mW);

  const pointer = mk("div", "kaaba-pointer");
  pointer.style.transform = `rotate(${qInfo.deg}deg)`;
  const badge = mk("div", "kaaba-badge", "{{mosque}} কিবলা");
  const needle = mk("div", "kaaba-needle");
  pointer.appendChild(badge);
  pointer.appendChild(needle);
  ring.appendChild(pointer);

  const center = mk("div", "compass-center");
  dial.appendChild(ring);
  dial.appendChild(center);
  card.appendChild(dial);

  const sensorStatus = mk("div", "note", "ফোনটি সমতল রেখে ঘোরান — সেন্সর সাপোর্ট থাকলে কম্পাস স্বয়ংক্রিয়ভাবে ঘুরবে।");
  card.appendChild(sensorStatus);

  const btnRow = mk("div", "row2");
  btnRow.style.width = "100%";
  const sensorBtn = mk("button", null, "{{explore}} সেন্সর চালু করুন");
  const gpsBtn = mk("button", null, "{{location_on}} GPS আপডেট");
  gpsBtn.onclick = () => useGps(sensorStatus);

  const attachOrientation = () => {
    stopCompass();
    const handler = (e) => {
      let heading = null;
      if (typeof e.webkitCompassHeading === "number") heading = e.webkitCompassHeading;
      else if (e.absolute === true && typeof e.alpha === "number") heading = 360 - e.alpha; // relative (non-absolute) ইভেন্ট বাদ
      if (heading !== null && !isNaN(heading)) {
        ring.style.transform = `rotate(${-heading}deg)`;
        const diff = Math.abs(((heading - qInfo.deg + 540) % 360) - 180);
        dial.classList.toggle("qibla-aligned", diff <= 6);
        sensorStatus.textContent = diff <= 6
          ? `{{check_circle:f}} আপনি ঠিক কিবলামুখী আছেন! (${toBn(Math.round(heading))}°)`
          : `ডিভাইসের দিক: ${toBn(Math.round(heading))}° · কিবলা: ${toBn(qInfo.deg)}°`;
      }
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    compassCleanup = () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  };

  sensorBtn.onclick = async () => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === "granted") {
          attachOrientation();
          showToast("কম্পাস সেন্সর চালু হয়েছে");
        } else {
          sensorStatus.textContent = "কম্পাস সেন্সর অনুমতি দেওয়া হয়নি। ডায়ালে দেখানো ডিগ্রি অনুসরণ করুন।";
        }
      } catch(e) {
        sensorStatus.textContent = "সেন্সর চালু করা যায়নি।";
      }
    } else {
      attachOrientation();
      showToast("কম্পাস সেন্সর সক্রিয়");
    }
  };
  attachOrientation();

  btnRow.appendChild(sensorBtn);
  btnRow.appendChild(gpsBtn);
  card.appendChild(btnRow);
  app.appendChild(card);
}

function renderAlertsView(){
  const card = mk("div", "p3-card");
  const top = mk("div", "alert-row");
  const left = document.createElement("div");
  left.innerHTML = `<b>আজান ও নামাজের অ্যালার্ট</b><br><small style="color:var(--qx-meta-color)">অ্যাপ খোলা ও স্ক্রিন চালু থাকলে যেকোনো পাতায় শব্দ দেবে। ব্যাকগ্রাউন্ডে বা স্ক্রিন বন্ধে কাজ করবে না।</small>`;
  const toggle = mk("button", "switch-btn" + (alertCfg.enabled ? " on" : ""), alertCfg.enabled ? "চালু আছে" : "বন্ধ");
  toggle.onclick = async () => {
    alertCfg.enabled = !alertCfg.enabled;
    if (alertCfg.enabled && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch(e){}
    }
    lsSet("prayerAlerts", alertCfg);
    renderPrayer();
    showToast(alertCfg.enabled ? "নামাজের অ্যালার্ট চালু হয়েছে" : "নামাজের অ্যালার্ট বন্ধ হয়েছে");
  };
  top.appendChild(left);
  top.appendChild(toggle);
  card.appendChild(top);

  const soundRow = mk("div", "alert-row");
  soundRow.appendChild(mk("span", null, "অ্যালার্টের ধরন"));
  const sSel = document.createElement("select");
  sSel.style.width = "auto";
  addOpt(sSel, "adhan", "আজান সুর (মেলেডি)");
  addOpt(sSel, "beep", "সাধারণ অ্যালার্ট টোন");
  addOpt(sSel, "silent", "নিঃশব্দ নোটিফিকেশন");
  sSel.value = alertCfg.sound;
  sSel.onchange = () => {
    alertCfg.sound = sSel.value;
    lsSet("prayerAlerts", alertCfg);
    playAdhanTone(alertCfg.sound);
  };
  soundRow.appendChild(sSel);
  card.appendChild(soundRow);

  const testRow = mk("div", "alert-row");
  testRow.appendChild(mk("span", null, "শব্দ ও নোটিফিকেশন পরীক্ষা"));
  const testBtn = mk("button", null, "{{play_arrow}} টেস্ট অ্যালার্ট");
  testBtn.onclick = () => {
    playAdhanTone(alertCfg.sound === "silent" ? "adhan" : alertCfg.sound);
    showToast("টেস্ট অ্যালার্ট: নামাজের ওয়াক্ত হয়েছে!");
  };
  testRow.appendChild(testBtn);
  card.appendChild(testRow);
  app.appendChild(card);

  const listCard = mk("div", "p3-card");
  listCard.appendChild(mk("b", null, "কোন ওয়াক্তে অ্যালার্ট চান:"));
  [["fajr","ফজর"],["dhuhr","যোহর"],["asr","আসর"],["maghrib","মাগরিব"],["isha","এশা"]].forEach(([k, l]) => {
    const r = mk("div", "alert-row");
    r.appendChild(mk("span", null, l));
    const b = mk("button", "switch-btn" + (alertCfg.prayers[k] ? " on" : ""), alertCfg.prayers[k] ? "সক্রিয়" : "নিষ্ক্রিয়");
    b.onclick = () => {
      alertCfg.prayers[k] = !alertCfg.prayers[k];
      lsSet("prayerAlerts", alertCfg);
      renderPrayer();
    };
    r.appendChild(b);
    listCard.appendChild(r);
  });
  app.appendChild(listCard);
}


// ===== NAMAZ-E-NABVI (S) - Sheikh Albani - Chapter Wise Data for Quranix =====
// Namaz-e-Nabvi: full-text chapters
// ===== NAMAZ-E-NABVI (S) - 15 + 1 Source = 16 Chapters =====
const NAMAZ_NABVI_DATA = [
{
    id: "vumika",
    no: 1,
    title: "ভূমিকা",
    subtitle: "গ্রন্থ পরিচিতি ও সালাতের গুরুত্ব",
    topics: ["গ্রন্থের পরিচয়", "লেখক ও সংক্ষিপ্ত গ্রন্থের পরিচিতি", "সালাতের গুরুত্ব", "রাসূল ﷺ-এর সালাত অনুসরণের ভিত্তি"],
    ar: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي",
    bn_meaning: "তোমরা সেভাবে সালাত আদায় করো যেভাবে আমাকে দেখেছো",
    content: [
      "শায়খ আলবানী (রহঃ) বড় গ্রন্থ 'সিফাতু সালাতিন নবী ﷺ' এর সংক্ষিপ্ত রূপ করেছেন যাতে সাধারণ মানুষ বুঝতে পারে।",
      "বৈশিষ্ট্য: কোনো মাযহাব নয়, প্রতিটি সহীহ হাদীস গ্রহণ। প্রতিটি মাসআলায় রুকন, শর্ত, ওয়াজিব, সুন্নাত উল্লেখ।",
      "আল্লাহ বলেন: 'নিশ্চয়ই সালাত মুমিনদের উপর নির্দিষ্ট সময়ে ফরজ' (নিসা ১০৩)।",
      "বিষয়বস্তু ১৫টি মূল অধ্যায়ে সাজানো হয়েছে; ১৬তম অংশে তথ্যসূত্র ও উৎসের নোট রয়েছে।"
    ],
    hadith: { text: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي", ref: "বুখারী ৬৩১" }
  },
{
    id: "qibla",
    no: 2,
    title: "কিবলা ও সুতরাহ",
    subtitle: "সালাতে কিবলামুখী হওয়া ও সুতরাহ",
    topics: ["কিবলামুখী হওয়া", "সুতরাহর বিধান ও অবস্থান", "সুতরাহ ও সিজদার স্থানের দূরত্ব", "সুতরাহর সামনে দিয়ে অতিক্রমের আলোচনা"],
    ar: "فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ",
    bn_meaning: "তোমার মুখ মসজিদে হারামের দিকে ফেরাও",
    content: [
      "ফরজ-নফল সর্বাবস্থায় কা'বার দিকে মুখ করা রুকন। কা'বা দেখলে সরাসরি, না দেখলে দিকের দিকে।",
      "সুতরাহ ওয়াজিব — 'لَا تُصَلُّوا إِلَّا إِلَى سُتْرَةٍ'। সুতরাহ ও সিজদার মাঝে ছাগল যাওয়ার ফাঁক।",
      "সামনে দিয়ে যাওয়া হারাম, এমনকি মসজিদে হারামেও।"
    ],
    hadith: { text: "لَا تُصَلُّوا إِلَّا إِلَى سُتْرَةٍ", ref: "ইবনে খুযাইমা সহীহ ৭৪" }
  },
{
    id: "qiyam",
    no: 3,
    title: "দাঁড়ানো (কিয়াম)",
    subtitle: "ফরজ সালাতে কিয়াম ও অক্ষমতার অবস্থা",
    topics: ["ফরজ সালাতে দাঁড়ানো", "অসুস্থতা বা অক্ষমতায় সালাত", "নফল সালাতে বসে আদায়", "জুতা পরে বা খালি পায়ে সালাত"],
    ar: "وَقُومُوا لِلَّهِ قَانِتِينَ",
    content: [
      "ফরজে দাঁড়ানো রুকন। অসুস্থ, ভয়, জাহাজ/প্লেনে বসা জায়েজ।",
      "নফলে বসে জায়েজ, দাঁড়িয়ে উত্তম।",
      "জুতা পরে/খালি পায়ে দুইটাই জায়েজ।"
    ],
    hadith: { text: "صَلِّ قَائِمًا فَإِنْ لَمْ تَسْتَطِعْ فَقَاعِدًا", ref: "বুখারী ১১১৭" }
  },
{
    id: "niyyah",
    no: 4,
    title: "নিয়ত",
    subtitle: "নিয়তের স্থান ও সালাতে তার ভূমিকা",
    topics: ["নিয়তের অর্থ ও গুরুত্ব", "নিয়তের স্থান: অন্তর", "মুখে নিয়ত উচ্চারণের আলোচনা"],
    ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    content: [
      "নিয়ত ফরজ, স্থান অন্তরে। 'নাওয়াইতুয়ান' বিদআত।",
      "রাসূল ﷺ, সাহাবী, চার ইমাম কেউ মুখে নিয়ত পড়েন নি।"
    ],
    hadith: { text: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", ref: "বুখারী ১" }
  },
{
    id: "takbir",
    no: 5,
    title: "তাকবীরে তাহরীমা ও হাত বাঁধা",
    subtitle: "তাকবীর, রাফউল ইয়াদাইন ও হাতের অবস্থান",
    topics: ["তাকবীরে তাহরীমা", "তাকবীরের সময় হাত তোলা", "রুকুতে যাওয়া ও ওঠার সময় রাফউল ইয়াদাইন", "দাঁড়ানো অবস্থায় হাত বাঁধা"],
    ar: "اللَّهُ أَكْبَرُ",
    content: [
      "তাকবীর রুকন। রাফউল ইয়াদাইন কাঁধ/কান বরাবর সুন্নাত।",
      "হাত বাঁধা বুকের উপর — নাভির নিচের হাদীস জঈফ।"
    ],
    hadith: { text: "كَانَ يَرْفَعُ يَدَيْهِ حَذْوَ مَنْكِبَيْهِ", ref: "বুখারী ২৫৬" }
  },
{
    id: "qiraah",
    no: 6,
    title: "কিরাত ও আমীন",
    subtitle: "সূরা ফাতিহা, অন্যান্য কিরাত ও আমীন",
    topics: ["সানা ও কিরাতের শুরু", "সূরা ফাতিহা পাঠ", "আমীন বলার পদ্ধতি", "ইমাম ও মুক্তাদির কিরাত", "বিভিন্ন সালাতে কিরাত"],
    ar: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    content: [
      "ফাতিহা প্রতি রাকাতে রুকন। থেমে থেমে পড়া সুন্নাত।",
      "আমীন জোরে বলা সুন্নাত, ফেরেশতার আমীনের সাথে মিললে গুনাহ মাফ।",
      "জোরে কেরাতে মুক্তাদী চুপ, আস্তে কেরাতে ফাতিহা পড়বে।"
    ],
    hadith: { text: "لَا صَلَاةَ لِمَنْ لَمْ يَقْرَأْ بِفَاتِحَةِ الْكِتَابِ", ref: "বুখারী ৭৫৬" }
  },
{
    id: "ruku",
    no: 7,
    title: "রুকু ও রুকু থেকে ওঠা",
    subtitle: "রুকু, কওমা ও সংশ্লিষ্ট যিকর",
    topics: ["রুকুতে যাওয়ার পদ্ধতি", "রুকুর অবস্থান ও স্থিরতা", "রুকুর তাসবীহ ও দোয়া", "রুকু থেকে ওঠা", "রুকুর পর সোজা দাঁড়ানো (কওমা)"],
    ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    content: [
      "রুকু রুকন, পিঠ-মাথা সমান্তরাল, হাত হাঁটুতে দৃঢ়।",
      "তাসবীহ: সুবহানা রব্বিয়াল আজীম ৩ বার ওয়াজিব।",
      "রুকুতে কুরআন নিষিদ্ধ। স্থিরতা ফরজ।"
    ],
    hadith: { text: "سَوَّى ظَهْرَهُ حَتَّى لَو صُبَّ عَلَيْهِ الْمَاءُ لَاسْتَقَرَّ", ref: "ইবনে মাজাহ সহীহ" }
  },
{
    id: "sujud",
    no: 8,
    title: "সিজদা ও দুই সিজদার মাঝের বসা",
    subtitle: "সিজদার অঙ্গ, ভঙ্গি ও যিকর",
    topics: ["সাত অঙ্গে সিজদা", "হাত, কনুই ও শরীরের অবস্থান", "সিজদার তাসবীহ ও দোয়া", "দুই সিজদার মধ্যবর্তী বসা", "দুই সিজদার মাঝের দোয়া"],
    ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    content: [
      "৭ অঙ্গ: কপাল+নাক, দুই হাত, দুই হাঁটু, দুই পায়ের আঙ্গুল।",
      "হাত কাঁধ বরাবর, কনুই উঁচু, পেট উরু থেকে আলাদা।",
      "সুবহানা রব্বিয়াল আ'লা ৩ বার ওয়াজিব, সিজদায় বেশি দু'আ সুন্নাত।"
    ],
    hadith: { text: "أُمِرْتُ أَنْ أَسْجُدَ عَلَى سَبْعَةِ أَعْظُمٍ", ref: "বুখারী ৮০৯" }
  },
{
    id: "second_rakah",
    no: 9,
    title: "দ্বিতীয় রাকাত ও প্রথম বৈঠক",
    subtitle: "প্রথম তাশাহহুদ ও বৈঠকের পদ্ধতি",
    topics: ["দ্বিতীয় রাকাতের কিরাত", "প্রথম তাশাহহুদ", "ইফতিরাশ পদ্ধতিতে বসা", "তাশাহহুদের পাঠ", "বৈঠকে আঙুলের ইশারা"],
    ar: "التَّحِيَّاتُ لِلَّهِ",
    content: [
      "দ্বিতীয় রাকাত প্রথমের মতো, ছোট।",
      "ইফতিরাশ: বাম পা বিছিয়ে বসা, ডান পা খাড়া।",
      "দুই সিজদার মাঝে দু'আ: রব্বিগফিরলী।"
    ],
    hadith: { text: "يَفْرِشُ رِجْلَهُ الْيُسْرَى", ref: "বুখারী ৮২৮" }
  },
{
    id: "third_fourth",
    no: 10,
    title: "তৃতীয় ও চতুর্থ রাকাত",
    subtitle: "পরবর্তী রাকাতে ওঠা ও কিরাত",
    topics: ["তৃতীয় রাকাতে ওঠা", "চতুর্থ রাকাত", "শেষ দুই রাকাতের কিরাত", "রাকাতে ওঠার সময় হাত তোলার আলোচনা"],
    ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    content: [
      "শুধু ফাতিহা সুন্নাত, অন্য সূরা না। কখনো পড়েছেন তাই মাঝে মাঝে জায়েজ।",
      "তাকবীর দিয়ে উঠবে, হাত তোলা সুন্নাত।"
    ],
    hadith: { text: "يَجْعَلُ فِي الْأُخْرَيَيْنِ فَاتِحَةَ الْكِتَابِ", ref: "মুসলিম ৪৫১" }
  },
{
    id: "qunut",
    no: 11,
    title: "কুনুতে নাযেলা",
    subtitle: "বিপদ-আপদে ফরজ সালাতে কুনুতের আলোচনা",
    topics: ["কুনুতে নাযেলার পরিচয়", "কোন পরিস্থিতিতে কুনুতে নাযেলা পড়া হয়", "ফরজ সালাতে কুনুতের অবস্থান", "কুনুতের সময়কাল ও সংশ্লিষ্ট মতামত"],
    ar: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ",
    content: [
      "উর্দু পাঠের সূচিতে পাঁচ ওয়াক্ত সালাতের মধ্যে কুনুতে নাযেলার আলোচনা উল্লেখ আছে।",
      "এই অধ্যায়ে কুনুতে নাযেলার প্রেক্ষাপট, সালাতে এর অবস্থান এবং সংশ্লিষ্ট আলোচনাগুলো থাকবে।",
      "বিতরের কুনুত আলাদা বিষয়; সেটি ১৫তম অধ্যায়ে রাখা হয়েছে।"
    ],
  },
{
    id: "final_tashahhud",
    no: 12,
    title: "শেষ তাশাহহুদ ও তাওয়াররুক",
    subtitle: "শেষ বৈঠক, বসার ধরন ও তাশাহহুদ",
    topics: ["শেষ বৈঠক", "তাওয়াররুক পদ্ধতিতে বসা", "আত্তাহিয়্যাতু ও তাশাহহুদের পাঠ", "শাহাদাত আঙুলের ইশারা ও দৃষ্টির অবস্থান"],
    ar: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ",
    content: [
      "তাওয়াররুক: বাম পা ডান পায়ের নিচে, নিতম্বে বসা। ৩/৪ রাকাতে, ২ রাকাতে ইফতিরাশ।",
      "আত্তাহিয়্যাতু, শাহাদাত আঙ্গুলে ইশারা, দৃষ্টি আঙ্গুলে।"
    ],
    hadith: { text: "قَدَّمَ رِجْلَهُ الْيُسْرَى", ref: "বুখারী ৮২৮" }
  },
{
    id: "durood",
    no: 13,
    title: "দরূদ ও সালামের আগের দোয়া",
    subtitle: "দরূদে ইবরাহীম ও মাসনূন আশ্রয় প্রার্থনা",
    topics: ["তাশাহহুদের পর দরূদ", "দরূদে ইবরাহীমের পাঠ", "চার বিষয় থেকে আল্লাহর কাছে আশ্রয় প্রার্থনা", "সালামের আগে অন্যান্য দোয়া"],
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    content: [
      "দরূদে ইবরাহীম এবং জাহান্নাম, কবর, জীবন-মৃত্যুর ফিতনা ও দাজ্জালের ফিতনা থেকে আশ্রয় প্রার্থনার আলোচনা।",
      "এরপর যেকোনো দু'আ জায়েজ।"
    ],
    hadith: { text: "فَلْيَتَعَوَّذْ بِاللَّهِ مِنْ أَرْبَعٍ", ref: "মুসলিম ৫৮৮" }
  },
{
    id: "salam",
    no: 14,
    title: "সালাম",
    subtitle: "সালাত সমাপ্ত করার পদ্ধতি",
    topics: ["সালাম ফেরানোর পাঠ", "ডানে ও বামে সালাম", "সালামের সময় মুখ ফেরানোর পদ্ধতি", "সালামের পরের যিকর"],
    ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    content: [
      "ডানে ও বামে সালাম ফেরানোর পদ্ধতি এবং এ বিষয়ে বর্ণিত মতামত।",
      "মুখ ঘুরানো সুন্নাত, হাত দিয়ে ইশারা নিষিদ্ধ। সালামের পর যিকর।"
    ],
    hadith: { text: "تَحْرِيمُهَا التَّكْبِيرُ وَتَحْلِيلُهَا التَّسْلِيمُ", ref: "আবু দাউদ সহীহ" }
  },
{
    id: "witr",
    no: 15,
    title: "বিতর ও সাহু সিজদা",
    subtitle: "বিতর সালাত ও ভুলের জন্য সাহু সিজদা",
    topics: ["বিতর সালাতের রাকাত ও পদ্ধতি", "বিতরের কুনুত", "সাহু সিজদার কারণ", "সাহু সিজদার পদ্ধতি"],
    ar: "الْوِتْرُ حَقٌّ",
    content: [
      "বিতর ১/৩/৫/৭/৯, উত্তম ৩/৫। একটানা ৩, মাঝে তাশাহহুদ নেই — বেশি সহীহ।",
      "সাহু সিজদার কারণ, সময় ও আদায়ের পদ্ধতি—গ্রন্থে আলোচিত বিবরণ অনুযায়ী।"
    ],
    hadith: { text: "الْوِتْرُ حَقٌّ", ref: "আবু দাউদ ১৪১৬ সহীহ" }
  },
{
    id: "source",
    no: 16,
    title: "তথ্যসূত্র ও উৎস",
    subtitle: "মূল গ্রন্থ, উর্দু পাঠ ও যাচাই-সংক্রান্ত নোট",
    topics: ["মূল গ্রন্থ ও লেখক", "উর্দু অনুবাদ/সংস্করণের পরিচয়", "ব্যবহৃত ডিজিটাল পাঠ ও OCR-এর সীমাবদ্ধতা", "হাদিস ও অন্যান্য রেফারেন্স"],
    ar: "وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ",
    bn_meaning: "রাসূল যা দেন তা গ্রহণ করো — হাশর ৭",
    content: [
      "মূল গ্রন্থ: صفة صلاة النبي من التكبير إلى التسليم كأنك تراها — শায়খ মুহাম্মদ নাসিরুদ্দীন আলবানী (রহঃ)।",
      "পর্যালোচনার ভিত্তি: সরবরাহ করা উর্দু OCR টেক্সট (Untitled 1.txt) এবং তার সঙ্গে দেওয়া Verification-Report।",
      "উর্দু OCR পাঠে সুতরাহ, নিয়ত, রাফউল ইয়াদাইন, ফাতিহা, আমীন, রুকু, সিজদা, তাশাহহুদ, দরূদ, সালাম, বিতর ও কুনুতে নাযেলার মতো বিষয়ের শিরোনাম/উল্লেখ পাওয়া যায়।",
      "OCR পাঠে অক্ষর ও শব্দের বিকৃতি আছে। তাই বিষয়ের উপস্থিতি শনাক্ত করা গেলেও প্রতিটি বাংলা বাক্য, হাদিসের নম্বর, আরবি হরকত বা ফিকহি সিদ্ধান্তের শতভাগ মিল এই পাঠ দিয়ে নিশ্চিত করা যায় না।",
      "এই HTML-এর অধ্যায় বিন্যাসটি পাঠযোগ্যতার জন্য সাজানো সম্পাদকীয় কাঠামো; এটি উর্দু বইয়ের সূচির হুবহু প্রতিলিপি নয়।",
      "হাদিসের রেফারেন্স ও ফিকহি বিধান প্রকাশের আগে নির্ভরযোগ্য মুদ্রিত সংস্করণ/মূল হাদিসগ্রন্থের সঙ্গে আলাদাভাবে যাচাই করা প্রয়োজন।"
    ]
  }
];

function qxNmIcon(kind){
  const p = { left:'M15 5l-7 7 7 7', right:'M9 5l7 7-7 7', book:'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20', check:'M5 12.5l4.5 4.5L19 7.5' }[kind];
  const s = document.createElement('span'); s.className = 'qx-nm-ic';
  s.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + p + '"/></svg>';
  return s;
}
function qxNmBtn(cls, label, side, onclick){
  const b = mk('button', cls); b.type = 'button';
  if(side === 'left') b.appendChild(qxNmIcon('left'));
  b.appendChild(mk('span', 'qx-nm-lbl', label));
  if(side === 'right') b.appendChild(qxNmIcon('right'));
  b.onclick = onclick; return b;
}
function qxNmSource(ref){
  const GR = ['সহীহ','হাসান','যঈফ','সহিহ'];
  const parts = String(ref||'').trim().split(/\s+/);
  let grade = ''; if(parts.length > 1 && GR.indexOf(parts[parts.length-1]) >= 0) grade = parts.pop();
  let num = ''; if(parts.length > 1 && /^[০-৯0-9]+$/.test(parts[parts.length-1])) num = parts.pop();
  const row = mk('div', 'qx-nm-src');
  const chip = mk('span', 'qx-nm-src-chip');
  chip.appendChild(qxNmIcon('book'));
  chip.appendChild(mk('b', '', parts.join(' ')));
  if(num) chip.appendChild(mk('span', 'qx-nm-src-no', num));
  row.appendChild(chip);
  if(grade){ const g = mk('span', 'qx-nm-grade'); g.appendChild(qxNmIcon('check')); g.appendChild(mk('span', '', grade)); row.appendChild(g); }
  return row;
}
function renderPrayerLearnView(){
  const currentChapterId = window.qxNamazChapter || null;

  if(currentChapterId){
    const ch = NAMAZ_NABVI_DATA.find(c=>c.id===currentChapterId);
    if(ch){
      showOther('{{menu_book}} ' + ch.title);
      const wrap = mk('div','qx-nm qx-sec-page');

      const back = qxNmBtn('qx-nm-back', 'সব অধ্যায়', 'left', ()=>{ window.qxNamazChapter=null; renderPrayerLearnView(); });
      wrap.appendChild(back);

      const card = mk('div','ayah qx-sec-card');
      const titleRow = mk('div','no');
      const numBadge = mk('span','ayah-number', 'অধ্যায় ' + ch.no);
      titleRow.appendChild(numBadge);
      const titleText = mk('span','', ch.title + ' - ' + ch.subtitle);
      titleText.style.fontWeight='700';
      titleText.style.color='var(--qx-main-color)';
      titleRow.appendChild(titleText);
      card.appendChild(titleRow);

      if(ch.ar){
        const arDiv = mk('div','ar', ch.ar);
        arDiv.dir='rtl';
        arDiv.lang='ar';
        if(ch.bn_ar_meaning){
          const small = mk('div','bn', ch.bn_ar_meaning);
          small.style.fontSize='13px';
          small.style.color='var(--qx-meta-color)';
          card.appendChild(arDiv);
          card.appendChild(small);
        }else{
          card.appendChild(arDiv);
        }
      }

      ch.content.forEach(p=>{
        const bnDiv = mk('div','bn', p);
        bnDiv.style.textAlign='justify';
        card.appendChild(bnDiv);
      });

      if(ch.hadith){
        const hadithBox = mk('div','');
        hadithBox.style.marginTop='14px';
        hadithBox.style.padding='12px';
        hadithBox.style.borderRadius='10px';
        hadithBox.style.background='var(--qx-main-soft)';
        hadithBox.style.borderLeft='4px solid var(--qx-main-color)';
        const arH = ch.hadith.text ? mk('div','ar', ch.hadith.text) : null;
        if(arH){ arH.dir='rtl'; hadithBox.appendChild(arH); }
        hadithBox.appendChild(qxNmSource(ch.hadith.ref));
        card.appendChild(hadithBox);
      }

      const navRow = mk('div','qx-nm-nav');
      const idx = NAMAZ_NABVI_DATA.findIndex(c=>c.id===ch.id);
      if(idx>0){
        navRow.appendChild(qxNmBtn('qx-nm-prev', NAMAZ_NABVI_DATA[idx-1].title, 'left', ()=>{ window.qxNamazChapter=NAMAZ_NABVI_DATA[idx-1].id; renderPrayerLearnView(); window.scrollTo(0,0); }));
      }else{ navRow.appendChild(mk('div','')); }
      if(idx < NAMAZ_NABVI_DATA.length-1){
        navRow.appendChild(qxNmBtn('qx-nm-next', NAMAZ_NABVI_DATA[idx+1].title, 'right', ()=>{ window.qxNamazChapter=NAMAZ_NABVI_DATA[idx+1].id; renderPrayerLearnView(); window.scrollTo(0,0); }));
      }
      card.appendChild(navRow);

      wrap.appendChild(card);
      app.appendChild(wrap);
      return;
    }
  }

  // List view
  showOther('{{menu_book}} নামাজ শিক্ষা - নববী পদ্ধতি');
  const container = mk('div','qx-nm qx-sec-page');

  const introCard = mk('div','ayah qx-sec-card');
  const introNo = mk('div','no');
  introNo.innerHTML = '<span class="ayah-number" style="background:var(--qx-main-soft);color:var(--qx-main-color)">নামাজে নববী ﷺ - শায়খ আলবানী</span>';
  introCard.appendChild(introNo);
  const introBn = mk('div','bn');
  introBn.innerHTML = 'এটি শায়খ নাসিরুদ্দীন আলবানী (রহঃ)-এর <b>সিফাতু সালাতিন নবী ﷺ</b> গ্রন্থের বিষয়ভিত্তিক বাংলা পাঠ-সহায়িকা। সরবরাহ করা উর্দু OCR পাঠের বিষয়সূচি ও উল্লেখ ধরে অধ্যায়গুলো সাজানো হয়েছে। OCR-এ পাঠভ্রংশ থাকায় প্রতিটি বাক্য বা হাদিসের রেফারেন্সের পূর্ণ মিল আলাদাভাবে যাচাই করা প্রয়োজন।';
  introCard.appendChild(introBn);
  container.appendChild(introCard);
  const credit = mk('div','trk-mini');
  credit.style.textAlign='center';
  credit.textContent='মূল গ্রন্থ: সিফাতু সালাতিন নবী ﷺ — শায়খ নাসিরুদ্দীন আলবানী (রহঃ)';
  container.appendChild(credit);

  NAMAZ_NABVI_DATA.forEach(ch=>{
    const item = mk('div','item');
    const num = mk('div','num', String(ch.no));
    num.style.minWidth='44px';
    num.style.height='44px';
    num.style.fontSize='16px';
    const mid = mk('div','mid');
    const b = mk('b','', ch.title);
    const small = mk('small','', ch.subtitle);
    mid.appendChild(b);
    mid.appendChild(small);
    const arrow = mk('div','qx-nm-chev'); arrow.appendChild(qxNmIcon('right'));
    item.appendChild(num);
    item.appendChild(mid);
    item.appendChild(arrow);
    item.onclick = ()=>{ window.qxNamazChapter=ch.id; renderPrayerLearnView(); window.scrollTo(0,0); };
    container.appendChild(item);
  });


  app.appendChild(container);
}


function renderPrayer(){
  stopCompass();
  showOther("নামাজ ও কিবলা");

  // Sub-navigation tabs for Prayer Times, Qibla Compass, and Adhan Alerts
  const subTabs = mk("div", "p3-tabs");
  [["learn","{{menu_book}} নামাজ শিক্ষা"],["times","{{mosque}} নামাজের সময়"],["qibla","{{explore}} কিবলা কম্পাস"],["alerts","{{notifications}} আজান অ্যালার্ট"]].forEach(([k, label]) => {
    const b = mk("button", prayerSubTab === k ? "on" : "", label);
    b.onclick = () => { prayerSubTab = k; renderPrayer(); };
    subTabs.appendChild(b);
  });
  app.appendChild(subTabs);

  if (prayerSubTab === "learn") return renderPrayerLearnView();
  if (prayerSubTab === "qibla") return renderQiblaView();
  if (prayerSubTab === "alerts") return renderAlertsView();

  const now = new Date(), t = calcDay(now, loc.lat, loc.lng, asrF), nx = nextPrayer(now);
  let ds = ""; try { ds = now.toLocaleDateString("bn-BD", { weekday:"long", day:"numeric", month:"long", year:"numeric" }); } catch(e){}
  const hero = mk("div","hero");
  hero.appendChild(mk("small", null, "পরবর্তী নামাজ · " + loc.n));
  hero.appendChild(mk("div","big", nx.l + (nx.at ? " · " + fmtTime(nx.at) : "")));
  const cd = mk("div","cd", nx.at ? "আর " + fmtCd(nx.at - now) + " বাকি" : "");
  hero.appendChild(cd);
  const chip = mk("div", "hero-date"); chip.title = ds; chip.setAttribute("aria-label", ds);
  chip.appendChild(mk("span", "hd-m", now.toLocaleDateString("bn-BD", { month: "short" })));
  chip.appendChild(mk("b", "hd-d", now.toLocaleDateString("bn-BD", { day: "numeric" })));
  hero.appendChild(chip);
  app.appendChild(hero);

  // Location & Asr method row
  const row = mk("div","row2");
  const sel = document.createElement("select"); prayerSel = sel;
  if (loc.gps) addOpt(sel, "cur", "আপনার অবস্থান (GPS)");
  if (loc.manual) addOpt(sel, "manual", "" + loc.n);
  CITIES.forEach((c,i) => addOpt(sel, i, c[0]));
  addOpt(sel, "gps", "GPS দিয়ে খুঁজুন");
  addOpt(sel, "set_manual", "ম্যানুয়াল লোকেশন দিন");
  const status = mk("div","note");
  sel.onchange = () => {
    const v = sel.value;
    if (v === "gps") return useGps(status);
    if (v === "set_manual") {
      const box = document.getElementById("manualLocBox");
      if (box) box.style.display = "block";
      return;
    }
    if (v === "cur" || v === "manual") return;
    const c = CITIES[+v]; loc = { n:c[0], lat:c[1], lng:c[2] };
    if (BD_DISTRICTS[c[0]]) loc.div = c[0];
    lsSet("loc", loc); renderPrayer();
  };
  const as = document.createElement("select");
  addOpt(as, 2, "আসর: হানাফি"); addOpt(as, 1, "আসর: শাফেয়ি");
  as.value = String(asrF);
  as.onchange = () => { asrF = +as.value; lsSet("asr", asrF); renderPrayer(); };
  row.appendChild(sel); row.appendChild(as);
  app.appendChild(row);

  // District & Thana (Bangladesh divisions only)
  if (loc.div && BD_DISTRICTS[loc.div]) {
    const divC = CITIES.find(c => c[0] === loc.div), dists = BD_DISTRICTS[loc.div];
    const row3 = mk("div", "row2");
    const divSel = document.createElement("select");
    Object.keys(BD_DISTRICTS).forEach(function(dn){ addOpt(divSel, dn, "বিভাগ: "+dn); });
    divSel.value = loc.div || "";
    divSel.onchange = () => {
      const dn = divSel.value;
      const cc = CITIES.find(c => c[0] === dn);
      if(cc){ loc = { n: cc[0], lat: cc[1], lng: cc[2], div: dn }; lsSet("loc", loc); renderPrayer(); }
    };
    row3.appendChild(divSel);
    const dSel = document.createElement("select");
    addOpt(dSel, "", "জেলা: বিভাগীয় সদর");
    dists.forEach((d, i) => addOpt(dSel, i, d[0]));
    dSel.value = loc.dist ? String(dists.findIndex(d => d[0] === loc.dist)) : "";
    dSel.onchange = () => {
      if (dSel.value === "") loc = { n: divC[0], lat: divC[1], lng: divC[2], div: loc.div };
      else { const d = dists[+dSel.value]; loc = { n: d[0], lat: d[1], lng: d[2], div: loc.div, dist: d[0] }; }
      lsSet("loc", loc); renderPrayer();
    };
    const tSel = document.createElement("select");
    const ths = loc.dist ? BD_THANAS[loc.dist] : null;
    if (ths) {
      addOpt(tSel, "", "থানা: জেলা সদর");
      ths.forEach((t, i) => addOpt(tSel, i, t[0]));
      tSel.value = loc.thana ? String(ths.findIndex(t => t[0] === loc.thana)) : "";
      tSel.onchange = () => {
        const dd0 = dists.find(d => d[0] === loc.dist);
        if (tSel.value === "") loc = { n: dd0[0], lat: dd0[1], lng: dd0[2], div: loc.div, dist: loc.dist };
        else { const t = ths[+tSel.value]; loc = { n: t[0], lat: t[1], lng: t[2], div: loc.div, dist: loc.dist, thana: t[0] }; }
        lsSet("loc", loc); renderPrayer();
      };
    } else {
      addOpt(tSel, "", loc.dist ? "থানা: তথ্য নেই" : "থানা: আগে জেলা বাছুন");
      tSel.disabled = true;
    }
    row3.appendChild(dSel); row3.appendChild(tSel);
    app.appendChild(row3);
  }
  renderPrayerSelectReset();

  // Manual Location input box (hidden by default unless selected)
  const manualBox = mk("div", "p3-card");
  manualBox.id = "manualLocBox";
  manualBox.style.display = loc.manual ? "block" : "none";
  manualBox.innerHTML = `<b>{{push_pin}} ম্যানুয়াল লোকেশন সেট করুন</b>`;
  const mGrid = mk("div", "p3-grid");
  const mkField = (id, lbl, type, val, ph, full) => {
    const lb = document.createElement("label");
    if (full) lb.style.gridColumn = "1/-1";
    lb.appendChild(document.createTextNode(lbl + " "));
    const inp = document.createElement("input");
    inp.id = id; inp.type = type;
    if (type === "number") inp.step = "0.0001";
    inp.value = String(val);
    if (ph) inp.placeholder = ph;
    lb.appendChild(inp);
    return lb;
  };
  mGrid.appendChild(mkField("mLocName", "স্থানের নাম", "text", loc.n, "যেমন: কুমিল্লা / টোকিও", true));
  mGrid.appendChild(mkField("mLocLat", "অক্ষাংশ (Latitude)", "number", loc.lat));
  mGrid.appendChild(mkField("mLocLng", "দ্রাঘিমাংশ (Longitude)", "number", loc.lng));
  const mSave = mk("button", null, "লোকেশন সংরক্ষণ করুন");
  mSave.style.cssText = "margin-top:8px;width:100%;background:var(--qx-main-color);color:var(--qx-on-main);border-color:var(--qx-main-color);font-weight:600;";
  mSave.onclick = () => {
    const nm = document.getElementById("mLocName").value.trim() || "কাস্টম অবস্থান";
    const la = parseFloat(document.getElementById("mLocLat").value);
    const ln = parseFloat(document.getElementById("mLocLng").value);
    if (isNaN(la) || isNaN(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      showToast("সঠিক Latitude (-90 থেকে 90) ও Longitude (-180 থেকে 180) দিন");
      return;
    }
    loc = { n: nm, lat: la, lng: ln, manual: true };
    lsSet("loc", loc);
    renderPrayer();
    showToast("ম্যানুয়াল লোকেশন সংরক্ষিত হয়েছে");
  };
  manualBox.appendChild(mGrid);
  manualBox.appendChild(mSave);
  app.appendChild(manualBox);

  // Calculation Method & Timezone / DST row
  const settingsCard = mk("div", "p3-card");
  const mRow = mk("div", "p3-grid");
  mRow.style.marginTop = "0";

  const mLabel = document.createElement("label");
  mLabel.style.gridColumn = "1/-1";
  mLabel.textContent = "নামাজের হিসাব পদ্ধতি (Calculation Method)";
  const mSel = document.createElement("select");
  Object.entries(CALC_METHODS).forEach(([k, v]) => addOpt(mSel, k, v.name));
  mSel.value = calcMethodKey;
  mSel.onchange = () => { calcMethodKey = mSel.value; lsSet("calcMethod", calcMethodKey); renderPrayer(); };
  mLabel.appendChild(mSel);
  mRow.appendChild(mLabel);

  const tzLabel = document.createElement("label");
  tzLabel.textContent = "সময় অঞ্চল (Timezone)";
  const tzSel = document.createElement("select");
  addOpt(tzSel, "auto", `অটো (UTC${-new Date().getTimezoneOffset()/60 >= 0 ? "+" : ""}${-new Date().getTimezoneOffset()/60})`);
  [-8,-5,-4,0,1,2,3,3.5,4,5,5.5,6,6.5,7,8,9,10].forEach(z => addOpt(tzSel, String(z), `UTC${z >= 0 ? "+" : ""}${z}`));
  tzSel.value = String(tzMode);
  tzSel.onchange = () => { tzMode = tzSel.value; lsSet("tzMode", tzMode); renderPrayer(); };
  tzLabel.appendChild(tzSel);
  mRow.appendChild(tzLabel);

  const dstLabel = document.createElement("label");
  dstLabel.textContent = "ডে-লাইট সেভিংস (শুধু ম্যানুয়াল টাইমজোনে)";
  const dstSel = document.createElement("select");
  addOpt(dstSel, "0", "বন্ধ (০ ঘণ্টা)");
  addOpt(dstSel, "1", "চালু (+১ ঘণ্টা)");
  dstSel.value = String(dstAdd);
  dstSel.onchange = () => { dstAdd = Number(dstSel.value); lsSet("dstAdd", dstAdd); renderPrayer(); };
  dstLabel.appendChild(dstSel);
  mRow.appendChild(dstLabel);

  settingsCard.appendChild(mRow);
  app.appendChild(settingsCard);

  PRAYERS.forEach(([k,l]) => {
    const r = mk("div","prow" + (nx.today && nx.k === k ? " on" : ""));
    r.appendChild(mk("b", null, l)); r.appendChild(mk("span", null, fmtTime(t[k])));
    app.appendChild(r);
  });
  app.appendChild(status);
  const activeMethod = CALC_METHODS[calcMethodKey] || CALC_METHODS.karachi;
  app.appendChild(mk("div","note",`গণনা: ${activeMethod.name}, ইন্টারনেট ছাড়াই ডিভাইসে হিসাব হয়। স্থানীয় মসজিদের সময়সূচির সাথে কয়েক মিনিটের পার্থক্য হতে পারে; জামাতের সময় মসজিদের সূচিই অনুসরণ করুন।`));

  if (nx.at) tmr = setInterval(() => {
    const n = new Date();
    if (n >= nx.at) { renderPrayer(); return; }
    cd.textContent = "আর " + fmtCd(nx.at - n) + " বাকি";
  }, 1000);
}

/* --- তাসবিহ --- */
const DHIKR = [["sub","সুবহানাল্লাহ","سُبْحَانَ اللَّهِ"],["ham","আলহামদুলিল্লাহ","الْحَمْدُ لِلَّهِ"],["akb","আল্লাহু আকবার","اللَّهُ أَكْبَرُ"],["free","ফ্রি",""]];
function duaTabs(cur){
  const w = mk("div","p3-tabs");
  [["dua","দোয়া"],["tasbih","তাসবিহ"]].forEach(([k,t]) => {
    const b = mk("button", k === cur ? "on" : "", t);
    b.onclick = () => { if (k !== cur) setMode(k); };
    w.appendChild(b);
  });
  return w;
}
let ts = lsGet("tasbih", { k:"sub", c:{ sub:0, ham:0, akb:0, free:0 }, t:33 });
if (!ts.c) ts.c = {};
function renderTasbih(){
  showOther("তাসবিহ");
  app.appendChild(duaTabs("tasbih"));
  const cur = DHIKR.find(d => d[0] === ts.k) || DHIKR[0];
  const chips = mk("div","tabs"); chips.style.marginTop = "0";
  DHIKR.forEach(d => {
    const b = mk("button", d[0] === ts.k ? "on" : "", d[1]);
    b.onclick = () => { ts.k = d[0]; lsSet("tasbih", ts); renderTasbih(); };
    chips.appendChild(b);
  });
  app.appendChild(chips);
  if (cur[2]) app.appendChild(mk("div","bism", cur[2]));
  const wrap = mk("div","tw");
  const btn = mk("button","tbtn"), cnt = mk("div","tcount"), sub = mk("small");
  btn.appendChild(cnt); btn.appendChild(sub);
  const upd = () => { const c = ts.c[ts.k] || 0; cnt.textContent = toBn(c); sub.textContent = ts.t ? (c >= ts.t ? "{{check}} লক্ষ্য পূর্ণ" : "লক্ষ্য " + toBn(ts.t)) : "অসীম"; };
  btn.onclick = () => {
    const c = (ts.c[ts.k] || 0) + 1; ts.c[ts.k] = c; lsSet("tasbih", ts); upd();
    try { if (navigator.vibrate) navigator.vibrate(ts.t && c % ts.t === 0 ? [120,60,120] : 12); } catch(e){}
  };
  upd();
  wrap.appendChild(btn);
  const tg = mk("div","tabs"); tg.style.justifyContent = "center";
  [33,99,100,0].forEach(n => {
    const b = mk("button", ts.t === n ? "on" : "", n ? toBn(n) : "∞");
    b.onclick = () => { ts.t = n; lsSet("tasbih", ts); renderTasbih(); };
    tg.appendChild(b);
  });
  wrap.appendChild(tg);
  const rs = mk("button", null, "রিসেট");
  rs.onclick = () => { ts.c[ts.k] = 0; lsSet("tasbih", ts); upd(); };
  wrap.appendChild(rs);
  app.appendChild(wrap);
}

/* --- দোয়া ও তাসবিহ --- */
const DUAS = [
  ["ঘুম ও জাগরণ", [
    ["ঘুমানোর দোয়া","بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا","হে আল্লাহ, আপনার নামেই আমি মরি (ঘুমাই) ও বাঁচি (জাগি)।","সহীহ বুখারী ৬৩২৪"],
    ["ঘুম থেকে উঠে","الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ","সকল প্রশংসা আল্লাহর, যিনি মৃত্যুর (ঘুমের) পর আমাদের জীবিত করেছেন, আর তাঁর কাছেই ফিরে যেতে হবে।","সহীহ বুখারী ৬৩১২"]
  ]],
  ["খাবার", [
    ["খাওয়ার শুরুতে","بِسْمِ اللَّهِ","আল্লাহর নামে (শুরু করছি)।","আবু দাউদ, তিরমিযী"],
    ["খাওয়ার শেষে","الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ","সকল প্রশংসা আল্লাহর, যিনি আমাদের খাইয়েছেন, পান করিয়েছেন এবং মুসলিম বানিয়েছেন।","আবু দাউদ, তিরমিযী"]
  ]],
  ["ঘর ও মসজিদ", [
    ["ঘর থেকে বের হওয়ার সময়","بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ","আল্লাহর নামে, আল্লাহর ওপর ভরসা করলাম; আল্লাহর সাহায্য ছাড়া কোনো উপায় ও শক্তি নেই।","আবু দাউদ ৫০৯৫, তিরমিযী ৩৪২৬"],
    ["মসজিদে ঢোকার সময়","اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ","হে আল্লাহ, আমার জন্য আপনার রহমতের দরজা খুলে দিন।","সহীহ মুসলিম ৭১৩"],
    ["মসজিদ থেকে বের হওয়ার সময়","اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ","হে আল্লাহ, আমি আপনার অনুগ্রহ প্রার্থনা করছি।","সহীহ মুসলিম ৭১৩"]
  ]],
  ["ক্ষমা প্রার্থনা ও যিকর", [
    ["সাইয়্যিদুল ইস্তিগফার","اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ","হে আল্লাহ, আপনি আমার রব, আপনি ছাড়া কোনো ইলাহ নেই। আপনি আমাকে সৃষ্টি করেছেন, আমি আপনার বান্দা। সাধ্যমতো আপনার অঙ্গীকার ও প্রতিশ্রুতির ওপর আছি। আমার কৃতকর্মের অনিষ্ট থেকে আপনার আশ্রয় চাই। আমার ওপর আপনার নিয়ামত স্বীকার করছি এবং আমার গুনাহও স্বীকার করছি। অতএব আমাকে ক্ষমা করুন, কারণ আপনি ছাড়া কেউ গুনাহ ক্ষমা করতে পারে না।","সহীহ বুখারী ৬৩০৬"],
    ["ইস্তিগফার (নামাজের পর ৩ বার)","أَسْتَغْفِرُ اللَّهَ","আমি আল্লাহর কাছে ক্ষমা চাই।","সহীহ মুসলিম ৫৯১"],
    ["লা হাওলা ওয়ালা কুওয়াতা","لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ","আল্লাহর সাহায্য ছাড়া কোনো উপায় ও শক্তি নেই।","সহীহ বুখারী ও মুসলিম"]
  ]],
  ["কুরআনের দোয়া", [
    ["দুনিয়া ও আখিরাতের কল্যাণ","رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ","হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দিন, আখিরাতেও কল্যাণ দিন এবং আগুনের আযাব থেকে রক্ষা করুন।","সূরা বাকারা ২:২০১"],
    ["পিতা-মাতার জন্য","رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا","হে আমার রব, তাদের উভয়ের প্রতি দয়া করুন, যেভাবে তারা শৈলাইলাতুল আমাকে লালন-পালন করেছেন।","সূরা বনী ইসরাইল ১৭:২৪"],
    ["জ্ঞান বৃদ্ধির দোয়া","رَبِّ زِدْنِي عِلْمًا","হে আমার রব, আমার জ্ঞান বাড়িয়ে দিন।","সূরা ত্বহা ২০:১১৪"]
  ]]
];
function duaCard(d){
  const c = ayahCard(d[0], d[1], d[2], null);
  c.appendChild(mk("div","src","সূত্র: " + d[3]));
  const acts = c.querySelector(".ayah-actions");
  if (acts) {
    const sv = mk("button", "star"); sv.type = "button"; sv.setAttribute("aria-label", "সংরক্ষণ করুন");
    sv.textContent = savedHas("dua", d[0]) ? "{{star:f}}" : "{{star}}";
    sv.onclick = () => { const on = savedToggle("dua", d[0], { title: d[0], ar: d[1], bn: d[2], src: d[3] }); sv.textContent = on ? "{{star:f}}" : "{{star}}"; showToast(on ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ সরানো হয়েছে"); };
    acts.appendChild(sv);
  }
  return c;
}
function renderDua(){
  showOther("দোয়া ও তাসবিহ");
  app.appendChild(duaTabs("dua"));
  DUAS.forEach(([g, items]) => {
    app.appendChild(mk("div","sh",g));
    items.forEach(d => app.appendChild(duaCard(d)));
  });
  app.appendChild(mk("div","sh","কুরআনের সূরা ও আয়াত"));
  const holder = document.createElement("div"); app.appendChild(holder);
  loadSurahAyahs(2).then(l => {
    const a = l[254];
    if (a && holder.isConnected) holder.appendChild(ayahCard("আয়াতুল কুরসী · সূরা বাকারা ২৫৫", cleanText(a), a.bn, a));
  }).catch(() => {});
  [[112,"ইখলাস",4],[113,"ফালাক",5],[114,"নাস",6]].forEach(([n,nm,c]) => {
    var rowEl = item(n, "সূরা " + nm, "আয়াত " + toBn(c), "", () => openSurah(n));
    var sv2 = mk("button", "star qx-star"); sv2.type = "button"; sv2.setAttribute("aria-label", "সংরক্ষণ করুন");
    var skey = "surah:" + n;
    sv2.textContent = savedHas("dua", skey) ? "{{star:f}}" : "{{star}}";
    sv2.onclick = (e) => { e.stopPropagation(); const on = savedToggle("dua", skey, { title: "সূরা " + nm, ar: "", bn: "আয়াত " + toBn(c), src: "সূরা " + nm }); sv2.textContent = on ? "{{star:f}}" : "{{star}}"; showToast(on ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ সরানো হয়েছে"); };
    rowEl.appendChild(sv2);
    app.appendChild(rowEl);
  });
}

backBtn.onclick = () => { if (readerPushed) { history.back(); } else { saveScroll(); reading = null; renderHome(); } };
qEl.oninput = renderHome;
function setFs(d){
  fs = Math.min(52, Math.max(20, fs + d));
  document.documentElement.style.setProperty("--qx-fs-ar", fs + "px");
  try { localStorage.setItem("fs", fs); } catch(e){}
}

// Theme Toggle Logic
const savedTheme = lsGet("theme", null);
const initialTheme = savedTheme === "light" ? "light" : "dark";
document.documentElement.setAttribute("data-theme", initialTheme);
document.getElementById("themeToggle").textContent = initialTheme === "dark" ? "{{light_mode}}" : "{{dark_mode}}";

document.getElementById("themeToggle").onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  let next = "dark";
  if (current === "dark") next = "light";
  else if (current === "light") next = "dark";
  else {
    next = window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark";
  }
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", next);
  lsSet("theme", next);
  const tBtn = document.getElementById("themeToggle");
  const tIcon = tBtn.querySelector(".ms");
  const iconName = next === "dark" ? "light_mode" : "dark_mode";
  if (tIcon) tIcon.textContent = iconName; else tBtn.textContent = "{{" + iconName + "}}";
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
};

// Phase 4: Font Selection, Accessibility, Backup/Restore, Reset, Onboarding & Android Support
const AR_FONTS = [
  ['"Amiri Quran","Noto Naskh Arabic","Traditional Arabic",serif', "আমিরি কুরআন"],
  ['"Noto Naskh Arabic","Traditional Arabic",serif', "নোটো নাসখ"],
  ['system-ui,serif', "ডিফল্ট আরবি"]
];
const BN_FONTS = [
  ['"Hind Siliguri",sans-serif', "হিন্দ শিলিগুড়ি"],
  ['"Noto Serif Bengali",serif', "নোটো সেরিফ বাংলা"],
  ['"Kalpurush",sans-serif', "কালপুরুষ"]
];

let appPrefs = lsGet("appPrefs", {
  arFont: AR_FONTS[0][0],
  bnFont: '"Hind Siliguri",sans-serif',
  bnFs: 16,
  onboarded: false,
  highContrast: false,
  reducedMotion: false
});

function applyAppPrefs(){
  document.documentElement.style.setProperty("--qx-font-arabic", AR_FONTS.some(function(f){ return f[0] === appPrefs.arFont; }) ? appPrefs.arFont : AR_FONTS[0][0]);
  document.documentElement.style.setProperty("--qx-font", appPrefs.bnFont || BN_FONTS[0][0]);
  document.documentElement.style.setProperty("--qx-fs-bn", (appPrefs.bnFs || 16) + "px");
  document.documentElement.toggleAttribute("data-hc", !!appPrefs.highContrast);
  const systemReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.toggleAttribute("data-reduced-motion", !!appPrefs.reducedMotion || !!systemReducedMotion);
}
applyAppPrefs();

// Friendly Global Error Handler & Offline Network Status
window.addEventListener("offline", () => showToast("অফলাইন মোড: সংরক্ষিত কুরআন ও ফিচার চালু আছে"));
window.addEventListener("online", () => showToast("ইন্টারনেট সংযোগ পুনরায় স্থাপিত হয়েছে"));

// Android WebView / Browser Back Button Navigation Handling
function handleBackNavigation(){
  if (qxNav.closeTopOverlay()) return true;
  if (reading) {
    saveScroll();
    reading = null;
    if (window.qxTopicOpen) renderTopicDetail(window.qxTopicOpen);
    else renderHome();
    return true;
  }
  if (window.qxTopicOpen) {
    window.qxTopicOpen = null;
    if (qxNav.modePushed) { qxNav.modePushed = false; qxNav.popTo(1); }
    renderHome();
    return true;
  }
  if (window.qxNamazChapter) {
    window.qxNamazChapter = null;
    if (typeof renderPrayerLearnView === "function") renderPrayerLearnView();
    qxNav.pushMode();
    return true;
  }
  if (mode !== "quran") {
    setMode("quran");
    return true;
  }
  return false;
}

let readerPushed = false;
function pushReaderState(){
  if (readerPushed) return;
  try { history.pushState({ qx: "reader" }, ""); readerPushed = true; } catch(e){}
}

/* In-app history: one entry per open popup, one for any non-home page, one for the reader.
   Browser back, Android back and the swipe gesture all go through this. */
var qxNav = {
  overlaySelector: ".modal-overlay, .ac-ov, .sheet-ov, #gridPopupOverlay.open, .hijri-info-overlay.open",
  ovPushed: 0,
  stale: 0,
  ignore: 0,
  modePushed: false,
  overlays: function(){ return document.querySelectorAll(this.overlaySelector); },
  closeTopOverlay: function(){
    const list = this.overlays();
    if (!list.length) return false;
    const el = list[list.length - 1];
    if (el.id === "gridPopupOverlay" || el.classList.contains("hijri-info-overlay")) el.classList.remove("open");
    else el.remove();
    return true;
  },
  pushMode: function(){
    if (this.modePushed) return;
    try { history.pushState({ qx: "mode" }, ""); this.modePushed = true; } catch(e){}
  },
  popTo: function(n){
    if (n <= 0) return;
    this.ignore++;
    try { history.go(-n); } catch(e){ this.ignore--; }
  },
  syncOverlays: function(){
    const count = this.overlays().length;
    while (this.ovPushed < count) {
      try { history.pushState({ qx: "ov" }, ""); } catch(e){ break; }
      this.ovPushed++;
    }
    if (this.ovPushed > count) {
      const diff = this.ovPushed - count;
      this.ovPushed = count;
      if (history.state && history.state.qx === "ov") this.popTo(diff);
      else this.stale += diff;
    }
  },
  swipeBack: function(){
    if (this.ovPushed > 0 || readerPushed || this.modePushed) { history.back(); return; }
    handleBackNavigation();
  }
};
new MutationObserver(function(){ qxNav.syncOverlays(); })
  .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

window.addEventListener("popstate", (e) => {
  if (qxNav.ignore > 0) { qxNav.ignore--; return; }
  if (qxNav.ovPushed > 0) { qxNav.ovPushed--; qxNav.closeTopOverlay(); return; }
  if (readerPushed) readerPushed = false;
  else if (qxNav.modePushed) qxNav.modePushed = false;
  handleBackNavigation();
  if (qxNav.stale > 0 && e.state && e.state.qx === "ov") { qxNav.stale--; qxNav.popTo(1); }
});

const _origSetMode = setMode;
setMode = function(m){
  if (m !== "quran") qxNav.pushMode();
  else {
    const n = (qxNav.modePushed ? 1 : 0) + (readerPushed ? 1 : 0);
    qxNav.modePushed = false; readerPushed = false;
    qxNav.popTo(n);
  }
  return _origSetMode(m);
};

const _origOpenSurah = openSurah;
openSurah = async function(n, y, targetAyah){ pushReaderState(); return _origOpenSurah(n, y, targetAyah); };
const _origOpenJuz = openJuz;
openJuz = async function(n, y){ pushReaderState(); return _origOpenJuz(n, y); };

/* Swipe back: installed app only (home-screen web app or Capacitor), phone-size screens.
   A swipe in either direction goes back; ignored on inputs, sliders and sideways-scrolling areas. */
(function(){
  const standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true || !!window.Capacitor;
  if (!standalone) return;
  const MIN_DX = 80, MAX_MS = 600;
  let sx = 0, sy = 0, st = 0, track = false;
  function blocked(el){
    for (; el && el !== document.body; el = el.parentElement) {
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "AUDIO") return true;
      if (el.hasAttribute && el.hasAttribute("data-no-swipe")) return true;
      if (el.scrollWidth > el.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(el).overflowX)) return true;
    }
    return false;
  }
  document.addEventListener("touchstart", function(e){
    track = e.touches.length === 1 && window.innerWidth < 900 && !blocked(e.target);
    if (!track) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
  }, { passive: true });
  document.addEventListener("touchend", function(e){
    if (!track) return;
    track = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st > MAX_MS || Math.abs(dx) < MIN_DX || Math.abs(dy) > Math.abs(dx) * 0.5) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;
    qxNav.swipeBack();
  }, { passive: true });
})();

// Capacitor (Android) হার্ডওয়্যার back বাটন
try {
  const CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (CapApp && CapApp.addListener) {
    CapApp.addListener("backButton", () => { if (!handleBackNavigation() && CapApp.exitApp) CapApp.exitApp(); });
  }
} catch(e){}

// Backup & Restore Utilities
async function exportUserBackup(){
  const backup = {
    app: "Quranix",
    version: 4,
    exportedAt: new Date().toISOString(),
    data: {
      saved: lsGet("saved", null),
      last: lsGet("last", null),
      notes: lsGet("notes", {}),
      goal: lsGet("goal", null),
      tasbih: lsGet("tasbih", null),
      loc: lsGet("loc", null),
      asr: lsGet("asr", 2),
      calcMethod: lsGet("calcMethod", "karachi"),
      tzMode: lsGet("tzMode", "auto"),
      dstAdd: lsGet("dstAdd", 0),
      prayerAlerts: lsGet("prayerAlerts", null),
      edition: lsGet("edition", "bn.bengali"),
      reciter: lsGet("reciter", "Saood_ash-Shuraym_128kbps"),
      fs: parseInt(localStorage.getItem("fs")) || 30,
      theme: lsGet("theme", null),
      appPrefs
    }
  };
  const text = JSON.stringify(backup, null, 2);
  const fname = `quranix-backup-${todayStr()}.json`;
  const CapP = window.Capacitor && window.Capacitor.Plugins;
  if (CapP && CapP.Filesystem && CapP.Share) {
    try {
      const r = await CapP.Filesystem.writeFile({ path: fname, data: text, directory: "CACHE", encoding: "utf8" });
      await CapP.Share.share({ title: fname, url: r.uri });
      showToast("ব্যাকআপ ফাইল তৈরি হয়েছে");
      return;
    } catch(e) { if (/cancel/i.test(String((e && e.message) || e))) return; }
  }
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("ব্যাকআপ ফাইল ডাউনলোড হয়েছে");
}

function qxSafeParseBackup(raw){
  try{
    const parsed = JSON.parse(raw);
    if(!parsed || parsed.app !== "Quranix" || !parsed.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) return null;
    const d = parsed.data;
    if(d.bm !== undefined && !Array.isArray(d.bm)) return null;
    if(d.notes !== undefined && (!d.notes || typeof d.notes !== "object" || Array.isArray(d.notes))) return null;
    if(d.tzMode !== undefined && d.tzMode !== "auto" && !Number.isFinite(d.tzMode)) return null;
    if(d.dstAdd !== undefined && !Number.isFinite(d.dstAdd)) return null;
    if(d.fs !== undefined && (!Number.isFinite(d.fs) || d.fs < 20 || d.fs > 48)) return null;
    if(d.theme !== undefined && d.theme !== null && d.theme !== "dark" && d.theme !== "light") return null;
    if(d.appPrefs !== undefined && (!d.appPrefs || typeof d.appPrefs !== "object" || Array.isArray(d.appPrefs))) return null;
    return parsed;
  }catch(e){
    return null;
  }
}
window.qxSafeParseBackup = qxSafeParseBackup;

function importUserBackup(file, onDone){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = qxSafeParseBackup(reader.result);
    if(!parsed){
      showToast("ফাইলটি পড়া যায়নি। সঠিক Quranix JSON ব্যাকআপ দিন।");
      return;
    }

    const d = parsed.data;
    const entries = [];
    const add = (key, value) => entries.push([key, value]);

    { const sv = qxSavedFromBackup(d); if(sv) add("saved", sv); }
    if(d.last && (d.last.t === "s" || d.last.t === "j") && Number.isFinite(d.last.n)) add("last", d.last);
    if(d.notes && typeof d.notes === "object" && !Array.isArray(d.notes)) add("notes", d.notes);
    if(d.goal && Array.isArray(d.goal.readKeys)) add("goal", d.goal);
    if(d.tasbih && d.tasbih.c && typeof d.tasbih.c === "object") add("tasbih", d.tasbih);
    if(d.loc && Number.isFinite(d.loc.lat) && Number.isFinite(d.loc.lng) && typeof d.loc.n === "string") add("loc", d.loc);
    if(d.asr === 1 || d.asr === 2) add("asr", d.asr);
    if(d.calcMethod && CALC_METHODS[d.calcMethod]) add("calcMethod", d.calcMethod);
    if(d.tzMode === "auto" || Number.isFinite(d.tzMode)) add("tzMode", d.tzMode);
    if(Number.isFinite(d.dstAdd)) add("dstAdd", d.dstAdd);
    if(d.prayerAlerts && d.prayerAlerts.prayers && typeof d.prayerAlerts.prayers === "object") add("prayerAlerts", d.prayerAlerts);
    if(d.edition === "bn.bengali" || d.edition === "bn.zakaria") add("edition", d.edition);
    if(d.reciter && RECITERS.some(r => r[0] === d.reciter)) add("reciter", d.reciter);
    if(Number.isFinite(d.fs) && d.fs >= 20 && d.fs <= 48) add("fs", d.fs);
    if(d.theme === "dark" || d.theme === "light") add("theme", d.theme);
    if(d.appPrefs && typeof d.appPrefs === "object" && !Array.isArray(d.appPrefs)) add("appPrefs", { ...appPrefs, ...d.appPrefs });

    const previousValues = new Map();
    try{
      entries.forEach(([key]) => previousValues.set(key, localStorage.getItem(key)));
      entries.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    }catch(e){
      // Remove partially written values first, then restore the exact previous strings.
      entries.forEach(([key]) => { try{ localStorage.removeItem(key); }catch(rollbackError){} });
      previousValues.forEach((value, key) => {
        if(value !== null){ try{ localStorage.setItem(key, value); }catch(rollbackError){} }
      });
      if(e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")){
        alert("স্টোরেজ পূর্ণ — ব্যাকআপ রিস্টোর করা যায়নি। কিছু ডাটা/অফলাইন প্যাকেজ মুছে আবার চেষ্টা করুন।");
      }else{
        showToast("ব্যাকআপ রিস্টোর করা যায়নি। স্টোরেজ অনুমতি পরীক্ষা করুন।");
      }
      return;
    }

    // Update in-memory state only after every storage write has succeeded.
    { const sv = qxSavedFromBackup(d); if(sv) saved = sv; }
    if(d.last && (d.last.t === "s" || d.last.t === "j") && Number.isFinite(d.last.n)) last = d.last;
    if(d.notes && typeof d.notes === "object" && !Array.isArray(d.notes)) ayahNotes = d.notes;
    if(d.goal && Array.isArray(d.goal.readKeys)) goalData = d.goal;
    if(d.tasbih && d.tasbih.c && typeof d.tasbih.c === "object") ts = d.tasbih;
    if(d.loc && Number.isFinite(d.loc.lat) && Number.isFinite(d.loc.lng) && typeof d.loc.n === "string") loc = d.loc;
    if(d.asr === 1 || d.asr === 2) asrF = d.asr;
    if(d.calcMethod && CALC_METHODS[d.calcMethod]) calcMethodKey = d.calcMethod;
    if(d.tzMode === "auto" || Number.isFinite(d.tzMode)) tzMode = d.tzMode;
    if(Number.isFinite(d.dstAdd)) dstAdd = d.dstAdd;
    if(d.prayerAlerts && d.prayerAlerts.prayers && typeof d.prayerAlerts.prayers === "object") alertCfg = d.prayerAlerts;
    if(d.edition === "bn.bengali" || d.edition === "bn.zakaria"){
      currentEdition = d.edition;
      const trSel = document.getElementById("transSel");
      if(trSel) trSel.value = currentEdition;
    }
    if(d.reciter && RECITERS.some(r => r[0] === d.reciter)) currentReciter = d.reciter;
    if(Number.isFinite(d.fs) && d.fs >= 20 && d.fs <= 48){
      fs = d.fs;
      document.documentElement.style.setProperty("--qx-fs-ar", fs + "px");
    }
    if(d.theme === "dark" || d.theme === "light"){
      document.documentElement.setAttribute("data-theme", d.theme);
      const themeToggle = document.getElementById("themeToggle");
      if(themeToggle) themeToggle.textContent = d.theme === "dark" ? "{{light_mode}}" : "{{dark_mode}}";
    }
    if(d.appPrefs && typeof d.appPrefs === "object" && !Array.isArray(d.appPrefs)){
      appPrefs = { ...appPrefs, ...d.appPrefs };
      applyAppPrefs();
    }

    showToast("ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!");
    if(onDone) onDone();
    renderHome();
  };
  reader.onerror = () => showToast("ব্যাকআপ ফাইলটি পড়া যায়নি। আবার চেষ্টা করুন।");
  reader.readAsText(file);
}

async function resetAllAppData(){
  if(!confirm("আপনি কি নিশ্চিত? আপনার বুকমার্ক, নোট, সেটিংস, অফলাইন অডিও ও ডাউনলোড করা কনটেন্ট মুছে যাবে।")) return;
  if(typeof window.qxFullReset !== "function"){
    showToast("রিসেট ফাংশন পাওয়া যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
    return;
  }
  const resetComplete = await window.qxFullReset();
  if(!resetComplete){
    showToast("সব ডেটা মুছতে পারেনি। অন্য Quranix ট্যাব বন্ধ করে আবার চেষ্টা করুন।");
    return;
  }
  showToast("Quranix-এর সব স্থানীয় ডেটা রিসেট হয়েছে");
  setTimeout(() => location.reload(), 600);
}

// Onboarding / User Guide Modal
function openHelpModal(isFirstTime){
  const previousFocus = document.activeElement;
  const overlay = document.createElement("div"); overlay.className = "modal-overlay";
  const content = document.createElement("div"); content.className = "modal-content"; content.setAttribute("role", "dialog"); content.setAttribute("aria-modal", "true"); content.setAttribute("aria-labelledby", "helpDialogTitle"); content.tabIndex = -1;

  const header = document.createElement("div"); header.className = "modal-header";
  const h3 = document.createElement("h3"); h3.id = "helpDialogTitle"; h3.textContent = isFirstTime ? "স্বাগতম Quranix-এ" : "ব্যবহার নির্দেশিকা ও সহায়তা";
  const close = document.createElement("button"); close.className = "close-btn"; close.textContent = "{{close}}";
  close.onclick = () => {
    appPrefs.onboarded = true;
    lsSet("appPrefs", appPrefs);
    overlay.remove();
  };
  header.appendChild(close);
  content.appendChild(header);

  const steps = [
    ["{{menu_book}} অফলাইন কুরআন", "আরবি পাঠ ও মুহিউদ্দীন খানের অনুবাদসহ ১১৪টি সূরা ও ৩০ পারা ইন্টারনেট ছাড়াই পড়ুন (তাফসির, অডিও ও ড. যাকারিয়ার অনুবাদে ইন্টারনেট লাগবে)। আয়াতের পাশের বোতাম থেকে কপি, শেয়ার, বুকমার্ক ({{star}}), ব্যক্তিগত নোট ({{edit}}) ও তাফসির ({{menu_book}}) পাবেন।"],
    ["{{volume_up}} অডিও তেলাওয়াত ও স্পিড", "যেকোনো আয়াতের {{volume_up}} চাপলে তেলাওয়াত শুরু হবে। নিচের প্লেয়ার বার থেকে ক্বারী, প্লেব্যাক স্পিড (1x–1.5x) ও অটো-প্লে নিয়ন্ত্রণ করা যায়।"],
    ["{{mosque}} নামাজ, কিবলা ও আজান অ্যালার্ট", "নিচের 'নামাজ' ট্যাবে গিয়ে GPS বা ম্যানুয়াল লোকেশন, হিসাব পদ্ধতি (করাচি/MWL/ইসনা), কিবলা কম্পাস এবং ওয়াক্তের অ্যালার্ট সেট করতে পারবেন।"],
    ["{{save}} ব্যাকআপ ও নিরাপদ ডেটা", "সেটিংস মেনু থেকে আপনার বুকমার্ক, নোট ও পড়ার অগ্রগতি JSON ফাইল হিসেবে ব্যাকআপ নিয়ে রাখতে এবং যেকোনো সময় রিস্টোর করতে পারবেন।"]
  ];

  steps.forEach(([t, desc]) => {
    const box = mk("div", "help-step");
    box.innerHTML = `<b style="color:var(--qx-main-color)">${t}</b><br>${desc}`;
    content.appendChild(box);
  });

  const okBtn = mk("button", "btn-accent", isFirstTime ? "শুরু করুন" : "বুঝেছি");
  okBtn.style.cssText = "width:100%;padding:10px;margin-top:6px";
  okBtn.onclick = () => {
    appPrefs.onboarded = true;
    lsSet("appPrefs", appPrefs);
    overlay.remove();
  };
  content.appendChild(okBtn);

  overlay.appendChild(content);
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      appPrefs.onboarded = true;
      lsSet("appPrefs", appPrefs);
      overlay.remove();
    }
  };
  document.body.appendChild(overlay);
}

// Comprehensive Settings Modal (Phase 4)
function openSettingsModal() {
  const dd = document.getElementById("gridDropdown"), gm = document.getElementById("gridMenu");
  if (!dd) return;
  dd.querySelectorAll(".g-settings-panel").forEach(function(el){ el.remove(); });
  if (!dd.classList.contains("open") && gm) gm.click();
  const content = document.createElement("div"); content.className = "g-settings-panel"; content.setAttribute("role", "group"); content.setAttribute("aria-label", "কাস্টমাইজেশন");

  const header = document.createElement("div"); header.className = "settings-modal-header";
  const backBtn = document.createElement("button"); backBtn.type = "button"; backBtn.className = "close-btn"; backBtn.textContent = "{{arrow_back}}"; backBtn.setAttribute("aria-label", "পেছনে যান");
  header.appendChild(backBtn);
  const sTitle = mk("h3", "settings-modal-title", " কাস্টমাইজেশন");
  const gearSrc = dd.querySelector('[data-popup="settings"] svg');
  if (gearSrc) sTitle.insertBefore(gearSrc.cloneNode(true), sTitle.firstChild);
  header.appendChild(sTitle);
  const close = document.createElement("button"); close.type = "button"; close.className = "close-btn"; close.textContent = "{{close}}";
  const backToMenu = () => { content.remove(); dd.classList.remove("g-settings-view"); };
  const dismissSettings = () => {
    document.removeEventListener("keydown", onSettingsKeydown);
    backToMenu();
    if (dd.classList.contains("open") && gm) gm.click();
  };
  const onSettingsKeydown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); dismissSettings(); }
  };
  close.setAttribute("aria-label", "বন্ধ করুন"); close.onclick = dismissSettings;
  backBtn.onclick = backToMenu;
  header.appendChild(close);
  content.appendChild(header);

  const body = document.createElement("div"); body.className = "settings-body";

  // Row with a label, a live value and a − / + stepper
  function sizeRow(label, getText, onMinus, onPlus, minusText, plusText) {
    const row = mk("div", "set-row");
    const lab = mk("span", "set-label", label);
    const val = mk("small", null, getText());
    lab.appendChild(val);
    const stepper = mk("div", "set-stepper");
    const minus = mk("button", null, minusText); minus.type = "button"; minus.setAttribute("aria-label", label + " কমান");
    const plus = mk("button", null, plusText); plus.type = "button"; plus.setAttribute("aria-label", label + " বাড়ান");
    minus.onclick = () => { onMinus(); val.textContent = getText(); };
    plus.onclick = () => { onPlus(); val.textContent = getText(); };
    stepper.appendChild(minus); stepper.appendChild(plus);
    row.appendChild(lab); row.appendChild(stepper);
    return row;
  }

  // Select filled from [value, label] pairs
  function selectEl(label, options, isSelected, onChange) {
    const sel = document.createElement("select");
    sel.className = "set-select";
    sel.setAttribute("aria-label", label);
    options.forEach(([val, lbl]) => {
      const o = document.createElement("option"); o.value = val; o.textContent = lbl;
      if (isSelected(val)) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = () => onChange(sel.value);
    return sel;
  }

  function fontField(label, options, isSelected, onChange) {
    const field = mk("div", "set-field");
    field.appendChild(mk("span", "set-label", label));
    field.appendChild(selectEl(label, options, isSelected, onChange));
    return field;
  }

  // 1. Font & accessibility
  const accSec = mk("div", "set-sec");
  accSec.appendChild(mk("div", "set-title", "{{text_fields}} ফন্ট কাস্টমাইজেশন"));

  accSec.appendChild(sizeRow(
    "আরবি আকার",
    () => `${toBn(fs)}px`,
    () => setFs(-2),
    () => setFs(2),
    "A−", "A+"
  ));

  accSec.appendChild(sizeRow(
    "বাংলা আকার",
    () => `${toBn(appPrefs.bnFs || 16)}px`,
    () => { appPrefs.bnFs = Math.max(13, (appPrefs.bnFs || 16) - 1); lsSet("appPrefs", appPrefs); applyAppPrefs(); },
    () => { appPrefs.bnFs = Math.min(24, (appPrefs.bnFs || 16) + 1); lsSet("appPrefs", appPrefs); applyAppPrefs(); },
    "অ−", "অ+"
  ));

  accSec.appendChild(fontField("আরবি ফন্ট", AR_FONTS, (val) => appPrefs.arFont === val, (val) => {
    appPrefs.arFont = val; lsSet("appPrefs", appPrefs); applyAppPrefs();
  }));
  accSec.appendChild(fontField("বাংলা ফন্ট", BN_FONTS, (val) => appPrefs.bnFont === val, (val) => {
    appPrefs.bnFont = val; lsSet("appPrefs", appPrefs); applyAppPrefs();
  }));

  const motionRow = mk("label", "set-row");
  motionRow.appendChild(mk("span", "set-label", "অ্যানিমেশন কম"));
  const motionToggle = document.createElement("input");
  motionToggle.type = "checkbox"; motionToggle.className = "set-switch"; motionToggle.checked = !!appPrefs.reducedMotion;
  motionToggle.setAttribute("aria-label", "অ্যানিমেশন কম");
  motionToggle.onchange = () => { appPrefs.reducedMotion = motionToggle.checked; lsSet("appPrefs", appPrefs); applyAppPrefs(); };
  motionRow.appendChild(motionToggle);
  accSec.appendChild(motionRow);

  body.appendChild(accSec);

  // 2. Translation
  const transSec = mk("div", "set-sec");
  transSec.appendChild(mk("div", "set-title", "{{translate}} অনুবাদ"));
  transSec.appendChild(selectEl("অনুবাদ", [
    ["bn.bengali", "মাওলানা মুহিউদ্দীন খান"],
    ["bn.zakaria", "ড. আবু বকর মুহাম্মাদ যাকারিয়া"]
  ], (val) => val === currentEdition, (val) => {
    currentEdition = val;
    lsSet("edition", currentEdition);
    const origSel = document.getElementById("transSel");
    if (origSel) { origSel.value = currentEdition; origSel.dispatchEvent(new Event('change')); }
    if (typeof refreshMinis === 'function') refreshMinis();
    showToast("অনুবাদ পরিবর্তন করা হয়েছে");
  }));
  body.appendChild(transSec);

  // 3. Tafsir
  const tafsirSec = mk("div", "set-sec");
  tafsirSec.appendChild(mk("div", "set-title", "{{auto_stories}} তাফসির"));
  tafsirSec.appendChild(selectEl("তাফসির", (typeof TAFSIRS !== 'undefined' ? TAFSIRS : []),
    (id) => id === (typeof tafsirId !== 'undefined' ? tafsirId : 381),
    (val) => {
      if (typeof tafsirId !== 'undefined') {
        tafsirId = parseInt(val, 10);
        lsSet('tafsirId', tafsirId);
        if (typeof refreshMinis === 'function') refreshMinis();
        showToast("তাফসির পরিবর্তন করা হয়েছে");
      }
    }));
  body.appendChild(tafsirSec);

  // 4. Reciter / audio
  const recSec = mk("div", "set-sec");
  recSec.appendChild(mk("div", "set-title", "{{headphones}} তেলাওয়াতকারী"));
  recSec.appendChild(selectEl("তেলাওয়াতকারী", (typeof RECITERS !== 'undefined' ? RECITERS : []),
    (id) => id === currentReciter,
    (val) => {
      currentReciter = val;
      lsSet("reciter", currentReciter);
      try { localStorage.setItem('reciter', JSON.stringify(currentReciter)); } catch(err){}
      const labelEl = document.getElementById('audioReciterLabel');
      if (labelEl && typeof getReciterName === 'function') labelEl.textContent = getReciterName(currentReciter);
      if (currentPlayIdx >= 0 && typeof audioObj !== 'undefined' && !audioObj.paused && typeof playAyahAtIndex === 'function') playAyahAtIndex(currentPlayIdx);
      if (typeof refreshMinis === 'function') refreshMinis();
      showToast("ক্বারী পরিবর্তন করা হয়েছে");
    }));
  body.appendChild(recSec);

  content.appendChild(body);
  dd.classList.add("g-settings-view");
  dd.appendChild(content);
  dd.scrollTop = 0;
  document.addEventListener("keydown", onSettingsKeydown);
}

function checkPrayerAlerts(){
  if (!alertCfg.enabled) return;
  const n = new Date(), t = calcDay(n, loc.lat, loc.lng, asrF);
  for (const [pk, pl] of PRAYERS) {
    if (pk === "sunrise" || !alertCfg.prayers[pk] || !t[pk]) continue;
    const diff = n.getTime() - t[pk].getTime();
    if (diff >= 0 && diff < 60000) triggerPrayerAlert(pk, pl, fmtTime(t[pk]));
  }
}
setInterval(checkPrayerAlerts, 5000);

(async function init(){
  renderTabs();
  msg("লোড হচ্ছে…");
  try {
    surahs = await loadSurahList();
    initQuickJump();
    renderHome();
    if (!appPrefs.onboarded) {
      setTimeout(() => openHelpModal(true), 400);
    }
  } catch(e) { msg("সূরার তালিকা লোড করা যায়নি। ইন্টারনেট চেক করুন।"); }
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


(function(){
  const gridBtn = document.getElementById('gridMenu');
  const dd = document.getElementById('gridDropdown');
  const overlay = document.getElementById('gridPopupOverlay');
  const box = document.getElementById('gridPopupBox');
  const qEl = document.getElementById('q');
  const transOrig = document.getElementById('transSel');
  if(!gridBtn||!dd) return;
  function closeDropdown(){ dd.classList.remove('open'); gridBtn.style.background=''; gridBtn.style.color=''; }
  gridBtn.onclick=function(e){ e.stopPropagation(); document.body.classList.remove('bars-hidden'); var isOpen=dd.classList.toggle('open'); gridBtn.style.background=isOpen?'var(--qx-main-color)':''; gridBtn.style.color=isOpen?'var(--qx-on-main)':''; };
  const headerSearchBtn = document.getElementById('headerSearchBtn');
  if(headerSearchBtn){
    headerSearchBtn.onclick=function(e){ e.stopPropagation(); if(typeof openPopup==='function') openPopup('search'); else if(window.openGridPopup) window.openGridPopup('search'); };
  }
  document.addEventListener('click',function(e){ if(!dd.contains(e.target)&&!gridBtn.contains(e.target)&&!overlay.contains(e.target)){ closeDropdown(); }});
  document.addEventListener('click',function(e){
    if(!dd.classList.contains('open')) return;
    if(dd.contains(e.target)||gridBtn.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation(); closeDropdown();
  },true);
  const gq = document.getElementById('gQuick'); if(gq) gq.addEventListener('click',function(e){ if(e.target.closest('.g-quick-btn')) setTimeout(closeDropdown,0); });
  overlay.addEventListener('click',function(e){ e.stopPropagation(); if(e.target===overlay) closePopup(); });
  box.addEventListener('click',function(e){ e.stopPropagation(); });

  // Close button inside the popup: handle it first so nothing underneath receives the click.
  // Other clicks (results, options, buttons) must reach their own handlers; the bubble listener above stops them leaving the box.
  box.addEventListener('click', function(e){
    var closeButton = e.target.closest('.pp-close');
    if(closeButton){
      e.preventDefault();
      e.stopPropagation();
      closePopup();
    }
  }, true);

  function closePopup(){ overlay.classList.remove('open'); box.innerHTML=''; box.classList.remove('wide','wide-fixed'); }
  window.closeGridPopup=closePopup;
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && overlay.classList.contains('open')) closePopup(); });
  function openPopup(type){
    if(type==='settings'){ openSettingsModal(); return; }
    closeDropdown();
    box.classList.remove('wide','wide-fixed');
    overlay.classList.add('open');
    if(type==='search') renderSearchPopup();
    else if(type==='filter') renderFilterPopup();
    else if(type==='trans') renderTransPopup();
    else if(type==='reciter') renderReciterPopup();
    else if(type==='tafsir') renderTafsirPopup();
    else if(type==='font') renderFontPopup();
    else if(type==='settings'){ closePopup(); openSettingsModal(); }
    else if(type==='backup') renderBackupPopup();
    else if(type==='source') renderSourcePopup();
    else if(type==='khatam') renderKhatamPopup();
    else if(type==='downloads') renderDownloadsPopup('open');
    else if(type==='hadith'){ closePopup(); if(typeof setMode==='function') setMode('hadith'); }
    else if(type==='pwa'){ renderPwaPopup(); }
    else if(type==='hijri'){ closePopup(); if(typeof setMode==='function') setMode('hijri'); }
    else if(type==='wordbyword'){ if(window.toggleWordMode) window.toggleWordMode(); }
    else if(type==='tajweed'){ if(window.toggleTajweed) window.toggleTajweed(); }
    else if(type==='asma'){ if(typeof setMode==='function') setMode('asma'); }
    else if(type==='tracker'){ if(typeof setMode==='function') setMode('tracker'); }
  }
  dd.querySelectorAll('[data-popup]').forEach(function(btn){ btn.onclick=function(e){ e.stopPropagation(); openPopup(btn.dataset.popup); }; });
  window.openGridPopup=openPopup;
  function head(title){ return '<div class="pp-header"><h3>'+title+'</h3><button type="button" class="pp-close" aria-label="বন্ধ করুন" onclick="document.getElementById(\'gridPopupOverlay\').classList.remove(\'open\')">{{close}}</button></div>'; }
  function renderPwaPopup(){
    var installed=window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
    var ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    var android=/Android/i.test(navigator.userAgent);
    var mobile=ios||android;
    var title='{{smartphone}} Quranix অ্যাপ';
    var mobileSteps=ios
      ? '<div class="pp-mini">Safari-তে Share <b>{{share}}</b> → Add to Home Screen → Add চাপুন। iPhone-এ ব্রাউজারের নিজস্ব নিয়মে ইনস্টল করতে হয়।</div>'
      : '<div class="pp-mini">Install বাটনে চাপুন। প্রম্পট না এলে Chrome-এর ⋮ মেনু → Add to Home screen নির্বাচন করুন।</div>';
    var pcSteps='<div class="pp-mini">Install বাটনে চাপুন অথবা Chrome, Firefox বা Edge-এ URL bar → Install app বাটনে চাপুন।</div>';
    var content=installed
      ? '<div class="pp-mini" style="text-align:center;padding:12px 4px">Quranix ইতিমধ্যে এই ডিভাইসে ইনস্টল করা আছে। হোম স্ক্রিন বা অ্যাপ তালিকা দেখুন।</div>'
      : '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:10px 0 12px">'
        +'<div style="border:1px solid var(--qx-border);border-radius:var(--qx-radius-lg);padding:12px 9px;background:var(--qx-card-bg)"><div style="font-size:25px;text-align:center;color:var(--qx-main-color);margin-bottom:5px">{{smartphone}}</div><b style="display:block;text-align:center;font-size:var(--qx-fs-md);margin-bottom:6px">মোবাইল</b>'+mobileSteps+'</div>'
        +'<div style="border:1px solid var(--qx-border);border-radius:var(--qx-radius-lg);padding:12px 9px;background:var(--qx-card-bg)"><div style="font-size:25px;text-align:center;color:var(--qx-main-color);margin-bottom:5px"><svg class="ms-svg" viewBox="0 0 24 24" style="font-size:1em" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg></div><b style="display:block;text-align:center;font-size:var(--qx-fs-md);margin-bottom:6px">ল্যাপটপ</b>'+pcSteps+'</div>'
        +'</div><p class="pp-mini" style="margin:0 0 10px">*ইনস্টল বাটন কাজ করতে ব্রাউজারে PWA install সমর্থিত হতে হবে।</p>';
    box.innerHTML=head(title)+'<div style="text-align:center;padding:8px 0 4px"><div style="width:54px;height:54px;margin:0 auto 9px;border-radius:var(--qx-radius-lg);background:var(--qx-main-color);color:var(--qx-on-main);display:grid;place-items:center;font-size:26px">{{download}}</div><b>অফলাইনে পড়ুন</b><p class="pp-mini">মোবাইল বা ডেস্কটপে Quranix ইনস্টল করে অ্যাপের মতো ব্যবহার করুন।</p></div>'+content+(!installed?'<button class="pp-btn" id="quranixPopupInstall">{{download}} এখনই ইনস্টল করুন</button>':'');
    var installButton=box.querySelector('#quranixPopupInstall');
    if(installButton){
      installButton.onclick=function(){ if(window.quranixInstall) window.quranixInstall(); };
      if(!ios && !android && !window.quranixInstallAvailable) installButton.textContent='ইনস্টল অপশন যাচাই করুন';
    }
  }
  var BN_SURAH=['আল-ফাতিহা','আল-বাকারা','আলে ইমরান','আন-নিসা','আল-মায়িদা','আল-আনআম','আল-আরাফ','আল-আনফাল','আত-তাওবা','ইউনুস','হুদ','ইউসুফ','আর-রাদ','ইবরাহীম','আল-হিজর','আন-নাহল','বনি ইসরাঈল','আল-কাহফ','মারইয়াম','ত্বা-হা','আল-আম্বিয়া','আল-হাজ্জ','আল-মুমিনুন','আন-নূর','আল-ফুরকান','আশ-শুআরা','আন-নামল','আল-কাসাস','আল-আনকাবুত','আর-রূম','লুকমান','আস-সাজদা','আল-আহযাব','সাবা','ফাতির','ইয়াসীন','আস-সাফফাত','সোয়াদ','আয-যুমার','গাফির','ফুসসিলাত','আশ-শূরা','আয-যুখরুফ','আদ-দুখান','আল-জাসিয়া','আল-আহকাফ','মুহাম্মাদ','আল-ফাতহ','আল-হুজুরাত','ক্বাফ','আয-যারিয়াত','আত-তূর','আন-নাজম','আল-ক্বামার','আর-রাহমান','আল-ওয়াকিয়া','আল-হাদীদ','আল-মুজাদালা','আল-হাশর','আল-মুমতাহিনা','আস-সাফ','আল-জুমুআ','আল-মুনাফিকুন','আত-তাগাবুন','আত-তালাক','আত-তাহরীম','আল-মুলক','আল-কালাম','আল-হাক্কাহ','আল-মাআরিজ','নূহ','আল-জিন','আল-মুয্যাম্মিল','আল-মুদ্দাসসির','আল-কিয়ামাহ','আদ-দাহর','আল-মুরসালাত','আন-নাবা','আন-নাযিআত','আবাসা','আত-তাকউীর','আল-ইনফিতার','আল-মুতাফফিফীন','আল-ইনশিক্বাক','আল-বুরূজ','আত-তারিক','আল-আ\'লা','আল-গাশিয়া','আল-ফাজর','আল-বালাদ','আশ-শামস','আল-লাইল','আদ-দুহা','আল-ইনশিরাহ','আত-তীন','আল-আলাক','আল-কদর','আল-বাইয়্যিনাহ','আয-যিলযাল','আল-আদিয়াত','আল-কারিআ','আত-তাকাসুর','আল-আসর','আল-হুমাযাহ','আল-ফীল','কুরাইশ','আল-মাউন','আল-কাউসার','আল-কাফিরুন','আন-নাসর','আল-মাসাদ','আল-ইখলাস','আল-ফালাক','আন-নাস'];
  window.QX_BN_SURAH=BN_SURAH;
  // ---- SEARCH : 2 modes ----
  var searchMode='word';
  function renderSearchPopup(){
    box.classList.add('wide'); box.classList.toggle('wide-fixed', searchMode==='word');
    box.innerHTML = head('{{search}} সার্চ') +
      '<div class="pp-tabs" role="tablist" aria-label="সার্চের ধরন"><button id="ppTabWord" type="button" role="tab" aria-controls="ppSearchBody" tabindex="'+(searchMode==='word'?'0':'-1')+'" aria-selected="'+(searchMode==='word'?'true':'false')+'" class="'+(searchMode==='word'?'on':'')+'">শব্দ দিয়ে</button><button id="ppTabNum" type="button" role="tab" aria-controls="ppSearchBody" tabindex="'+(searchMode==='num'?'0':'-1')+'" aria-selected="'+(searchMode==='num'?'true':'false')+'" class="'+(searchMode==='num'?'on':'')+'">সূরা ও আয়াত</button></div>' +
      '<div id="ppSearchBody"></div>';
    document.getElementById('ppTabWord').onclick=function(){ searchMode='word'; renderSearchPopup(); };
    document.getElementById('ppTabNum').onclick=function(){ searchMode='num'; renderSearchPopup(); };
    const body = document.getElementById('ppSearchBody');
    if(searchMode==='word'){
      body.innerHTML='<input class="pp-input" id="ppWordInput" type="search" autocomplete="off" aria-label="যেকোনো শব্দ, সূরা বা আয়াত নম্বর দিয়ে সার্চ করুন" placeholder="যেকোনো শব্দ, সূরা বা আয়াত নম্বর দিয়ে সার্চ করুন"><div id="ppWordStatus" role="status" aria-live="polite" aria-atomic="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">শব্দ লিখলে সূরা ও আয়াতের মিল এখানে দেখাবে।</div><div id="ppWordResults" role="group" aria-label="সার্চের ফলাফল"></div>';
      const inp = document.getElementById('ppWordInput');
      inp.focus();
      doWordSearch('');
      inp.oninput=function(){ doWordSearch(inp.value.trim()); };
    } else {
      renderNumSearch(body);
    }
  }
  function makeSearchResultsKeyboardAccessible(root, activate){
    if(!root) return;
    var items=Array.prototype.slice.call(root.querySelectorAll('.pp-result'));
    items.forEach(function(el,index){
      el.setAttribute('role','button');
      el.setAttribute('tabindex','0');
      el.setAttribute('aria-keyshortcuts','Enter Space ArrowDown ArrowUp');
      el.onkeydown=function(e){
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); activate(el); }
        else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
          e.preventDefault(); var next=index+(e.key==='ArrowDown'?1:-1);
          if(items[next]) items[next].focus();
        } else if(e.key==='Home'&&items.length){ e.preventDefault(); items[0].focus(); }
        else if(e.key==='End'&&items.length){ e.preventDefault(); items[items.length-1].focus(); }
      };
    });
  }
  function normalizeQuranSearch(value){
    return String(value==null?'':value).normalize('NFKC').toLowerCase()
      .replace(/[ً-ٰٟۖ-ۭـ]/g,'')
      .replace(/[০-৯]/g,function(c){return String(c.charCodeAt(0)-0x09E6);})
      .replace(/[٠-٩]/g,function(c){return String(c.charCodeAt(0)-0x0660);})
      .replace(/[\s\-_’'`.,:;\/]+/g,'').trim();
  }
  function renderNumSearch(body){
    var list=(typeof surahs!=='undefined'&&surahs&&surahs.length)?surahs:BN_SURAH.map(function(n,i){ return {number:i+1,englishName:n,englishNameTranslation:'',name:'',numberOfAyahs:286}; });
    function toAscii(t){ return String(t).replace(/[\u09E6-\u09EF]/g,function(c){return c.charCodeAt(0)-0x09E6;}).replace(/[\u0660-\u0669]/g,function(c){return c.charCodeAt(0)-0x0660;}).replace(/[\u06F0-\u06F9]/g,function(c){return c.charCodeAt(0)-0x06F0;}); }
    function norm(t){ return String(t).toLowerCase().replace(/[\s\-_'\u2019`.,:;\/]/g,''); }
    function bn(n){ return BN_SURAH[n-1]||''; }
    function num(n){ return typeof toBn==='function'?toBn(n):n; }
    body.innerHTML='<div class="pp-row"><select class="pp-input" id="ppSurahSel" aria-label="সূরা নির্বাচন করুন" style="flex:2"></select><select class="pp-input" id="ppAyahSel" aria-label="আয়াত নির্বাচন করুন" style="flex:1"></select></div>'+
      '<button class="pp-btn" id="ppGoBtn" type="button">যান →</button>';
    const ss = document.getElementById('ppSurahSel'), as=document.getElementById('ppAyahSel');
    ss.innerHTML=list.map(function(s){ return '<option value="'+s.number+'">'+s.number+'. '+(bn(s.number)||s.englishName)+' · '+s.englishName+'</option>'; }).join('');
    function fillAyah(){ var selectedNumber=parseInt(ss.value,10); var s=list.find(function(item){return item.number===selectedNumber;}); var n=s?s.numberOfAyahs:286; var h='<option value="0">আয়াত</option>'; for (let i=1;i<=n;i++) h+='<option value="'+i+'">আয়াত '+i+'</option>'; as.innerHTML=h; }
    ss.onchange=fillAyah; fillAyah();
    function go(s,a){ closePopup(); if(typeof openSurah!=='function') return; if(a) openSurah(s,0,a); else openSurah(s); }
    document.getElementById('ppGoBtn').onclick=function(){ go(parseInt(ss.value,10),parseInt(as.value,10)||0); };

  }
  // ---- Gray highlight of the typed word / number inside results ----
  function escHtml(t){
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function buildHighlightRegex(query){
    var tokens = String(query==null?'':query).normalize('NFKC').split(/[\s:,\-]+/).filter(Boolean);
    tokens.sort(function(a,b){ return b.length-a.length; });
    var parts = [];
    tokens.forEach(function(tok){
      var ascii = tok.replace(/[০-৯]/g,function(c){return String(c.charCodeAt(0)-0x09E6);}).replace(/[٠-٩]/g,function(c){return String(c.charCodeAt(0)-0x0660);}).replace(/[۰-۹]/g,function(c){return String(c.charCodeAt(0)-0x06F0);});
      if(/^[0-9]+$/.test(ascii)){
        var bnDigits = ascii.replace(/[0-9]/g,function(d){return String.fromCharCode(0x09E6+Number(d));});
        parts.push('(?<![0-9০-৯])'+ascii+'(?![0-9০-৯])');
        parts.push('(?<![0-9০-৯])'+bnDigits+'(?![0-9০-৯])');
      } else {
        parts.push(tok.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
      }
    });
    if(!parts.length) return null;
    try{ return new RegExp(parts.join('|'),'gi'); }catch(e){ return null; }
  }
  function hl(text, re){
    text = String(text==null?'':text).normalize('NFKC');
    if(!re) return escHtml(text);
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while((m = re.exec(text)) !== null){
      if(m[0] === ''){ re.lastIndex++; continue; }
      out += escHtml(text.slice(last,m.index))+'<mark class="pp-hl">'+escHtml(m[0])+'</mark>';
      last = m.index+m[0].length;
    }
    return out+escHtml(text.slice(last));
  }
  function hlSnippet(text, re, max){
    text = String(text==null?'':text).normalize('NFKC');
    var start = 0;
    if(re){
      re.lastIndex = 0;
      var m = re.exec(text);
      if(m && m.index > 30) start = m.index-30;
    }
    var part = text.slice(start,start+max);
    return (start>0?'…':'')+hl(part,re)+(start+max<text.length?'…':'');
  }
  function doWordSearch(word){
    const resEl = document.getElementById('ppWordResults'); if(!resEl) return;
    const statusEl = document.getElementById('ppWordStatus');
    if(!word){ resEl.innerHTML='<div class="pp-empty">সূরার নাম, আয়াতের শব্দ বা সংখ্যা লিখলে ফলাফল এখানে দেখাবে।</div>'; if(statusEl) statusEl.textContent='শব্দ লিখলে সূরা ও আয়াতের মিল এখানে দেখাবে।'; return; }
    var lw=normalizeQuranSearch(word);
    var hre=buildHighlightRegex(word);
    var out='';
    // Direct jump: "2:255", "২ ২৫৫" or surah name + ayah ("বাকারা ২৫৫", "baqara 255")
    try{
      var asciiWord=String(word).replace(/[০-৯]/g,function(c){return String(c.charCodeAt(0)-0x09E6);}).replace(/[٠-٩]/g,function(c){return String(c.charCodeAt(0)-0x0660);}).replace(/[۰-۹]/g,function(c){return String(c.charCodeAt(0)-0x06F0);});
      var directNums=(asciiWord.match(/\d+/g)||[]).map(Number);
      var directText=normalizeQuranSearch(asciiWord.replace(/\d+/g,' '));
      var allSurahs=(typeof surahs!=='undefined'?surahs:[]);
      var directPairs=[];
      if(directNums.length>=2 && !directText){
        if(directNums[0]>=1 && directNums[0]<=114){
          var ds=allSurahs.find(function(x){return x.number===directNums[0];}) || {number:directNums[0],englishName:'সূরা '+directNums[0],name:'',numberOfAyahs:0};
          directPairs.push([ds,directNums[1]]);
        }
      } else if(directNums.length>=1 && directText){
        allSurahs.forEach(function(s){
          if(normalizeQuranSearch(s.englishName).includes(directText) || normalizeQuranSearch(s.englishNameTranslation||'').includes(directText) || normalizeQuranSearch(s.name||'').includes(directText) || normalizeQuranSearch(BN_SURAH[s.number-1]||'').includes(directText)) directPairs.push([s,directNums[0]]);
        });
      }
      directPairs.slice(0,4).forEach(function(p){
        var s=p[0], ay=p[1];
        if(ay>=1 && (!s.numberOfAyahs || ay<=s.numberOfAyahs)){
          var tx=''; try{ tx=(LOCAL&&LOCAL.bn&&LOCAL.bn[s.number-1]&&LOCAL.bn[s.number-1][ay-1])||''; }catch(e){}
          out+='<div class="pp-result" data-ayah="'+s.number+':'+ay+'"><b>'+hl(s.englishName,hre)+' · আয়াত '+hl(ay,hre)+'</b><small>'+(tx?hlSnippet(tx,hre,120):'সরাসরি এই আয়াতে যান')+'</small></div>';
        } else {
          out+='<div class="pp-result" data-surah="'+s.number+'"><b>'+hl(s.number,hre)+'. '+hl(s.englishName,hre)+(s.name?' - '+hl(s.name,hre):'')+'</b><small>এই সূরায় মাত্র '+s.numberOfAyahs+'টি আয়াত — সূরাটি খুলুন</small></div>';
        }
      });
    }catch(e){}
    // Surah name matches
    var sList=(typeof surahs!=='undefined'?surahs:[]).filter(function(s){ return normalizeQuranSearch(s.number)===lw || normalizeQuranSearch(s.englishName).includes(lw) || normalizeQuranSearch(s.englishNameTranslation||'').includes(lw) || normalizeQuranSearch(s.name||'').includes(lw) || normalizeQuranSearch(BN_SURAH[s.number-1]||'').includes(lw); });
    sList.slice(0,8).forEach(function(s){
      out+='<div class="pp-result" data-surah="'+s.number+'"><b>'+hl(s.number,hre)+'. '+hl(s.englishName,hre)+' - '+hl(s.name,hre)+'</b><small>'+hl(s.englishNameTranslation||'',hre)+' · '+(s.revelationType==='Meccan'?'মাক্কী':'মাদানী')+' · আয়াত '+s.numberOfAyahs+'</small></div>';
    });
    // Ayah text matches (LOCAL bn/ar)
    var ayahCount=0;
    try{
      if(typeof LOCAL!=='undefined' && LOCAL && LOCAL.bn){
        for (let si=0; si<LOCAL.bn.length && ayahCount<8; si++){
          var arr=LOCAL.bn[si]||[];
          for (let ai=0; ai<arr.length && ayahCount<8; ai++){
            var bnTxt=arr[ai]||'';
            var arTxt=(LOCAL.ar && LOCAL.ar[si] && LOCAL.ar[si][ai])?LOCAL.ar[si][ai]:'';
            if(normalizeQuranSearch(bnTxt).includes(lw) || normalizeQuranSearch(arTxt).includes(lw)){
              var sObj=(typeof surahs!=='undefined')?surahs.find(function(x){return x.number===si+1}):null;
              var sName=sObj?sObj.englishName:'সূরা '+(si+1);
              out+='<div class="pp-result" data-ayah="'+(si+1)+':'+(ai+1)+'"><b>'+hl(sName,hre)+' · আয়াত '+hl(ai+1,hre)+'</b><small>'+hlSnippet(bnTxt,hre,120)+'</small></div>';
              ayahCount++;
            }
          }
        }
      }
    }catch(e){}
    if(!out) out='<div class="pp-mini">কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।</div>';
    resEl.innerHTML=out;
    var resultCount=resEl.querySelectorAll('[data-surah],[data-ayah]').length;
    if(statusEl) statusEl.textContent=resultCount?'মোট '+resultCount+'টি ফলাফল দেখানো হয়েছে।':'কোনো ফলাফল পাওয়া যায়নি।';
    function activateWordResult(el){
      closePopup();
      if(el.dataset.surah && typeof openSurah==='function') openSurah(parseInt(el.dataset.surah,10));
      else if(el.dataset.ayah && typeof openSurah==='function'){ var parts=el.dataset.ayah.split(':'); openSurah(parseInt(parts[0],10),0,parseInt(parts[1],10)); }
    }
    makeSearchResultsKeyboardAccessible(resEl,activateWordResult);
    resEl.querySelectorAll('[data-surah],[data-ayah]').forEach(function(el){ el.onclick=function(){ activateWordResult(el); }; });
    // Also sync home list filtering
    if(qEl){ qEl.value=word; }
  }
  // ---- FILTER ----
  function renderFilterPopup(){
    var labels={all:'সব সূরা',Meccan:'মাক্কী',Medinan:'মাদানী',juz:'পারা',topic:'বিষয়ভিত্তিক আয়াত',bm:'সংরক্ষিত'};
    var html=head('{{filter_list}} সূরা ফিল্টার');
    ['all','Meccan','Medinan','juz','topic','bm'].forEach(function(k){
      html+='<button type="button" class="pp-opt'+(tab===k?' on':'')+'" data-tab="'+k+'" aria-pressed="'+(tab===k?'true':'false')+'">'+labels[k]+'<span aria-hidden="true">'+(tab===k?'{{check}}':'')+'</span></button>';
    });
    box.innerHTML=html;
    box.querySelectorAll('[data-tab]').forEach(function(el){ el.onclick=function(){ tab=el.dataset.tab; if(qEl) qEl.value=''; if(typeof renderTabs==='function') renderTabs(); if(typeof renderHome==='function') renderHome(); refreshMinis(); closePopup(); }; });
    var selectedOption=box.querySelector('[data-tab="'+tab+'"]');
    if(selectedOption) selectedOption.focus();
  }
  function refreshMinis(){
    var labels={all:'সব সূরা',Meccan:'মাক্কী',Medinan:'মাদানী',juz:'পারা',topic:'বিষয়ভিত্তিক আয়াত',bm:'সংরক্ষিত'};
    const activeTab=(typeof mode!=='undefined'&&mode==='saved')?'bm':tab;
    const f = document.getElementById('gFilterMini'); if(f) f.textContent=(labels[activeTab]||'সব সূরা')+' ›';
    var v=transOrig?transOrig.value:'bn.bengali'; const t = document.getElementById('gTransMini'); if(t) t.textContent=(v==='bn.zakaria'?'ড. আবু বকর যাকারিয়া':'মুহিউদ্দীন খান')+' ›';
    var tf=TAFSIRS.find(function(x){return x[0]===tafsirId}); const tm = document.getElementById('gTafsirMini'); if(tm) tm.textContent=(tf?tf[1]:'')+' ›';
    var cur=(typeof currentReciter!=='undefined')?currentReciter:'Saood_ash-Shuraym_128kbps'; try{cur=JSON.parse(cur);}catch(e){} var rn=(typeof getReciterName==='function')?getReciterName(cur):cur; const r = document.getElementById('gReciterMini'); if(r) r.textContent=rn+' ›';
  }
  // ---- TRANSLATION ----
  function renderTransPopup(){
    var v=transOrig?transOrig.value:'bn.bengali';
    box.innerHTML=head('{{translate}} অনুবাদ') +
      '<div class="pp-opt'+(v==='bn.bengali'?' on':'')+'" data-trans="bn.bengali">মাওলানা মুহিউদ্দীন খান<span>'+(v==='bn.bengali'?'{{check}}':'')+'</span></div>' +
      '<div class="pp-opt'+(v==='bn.zakaria'?' on':'')+'" data-trans="bn.zakaria">ড. আবু বকর মুহাম্মাদ যাকারিয়া<span>'+(v==='bn.zakaria'?'{{check}}':'')+'</span></div>';
    box.querySelectorAll('[data-trans]').forEach(function(el){ el.onclick=function(){ if(transOrig){ transOrig.value=el.dataset.trans; transOrig.dispatchEvent(new Event('change')); } refreshMinis(); closePopup(); }; });
  }
  if(transOrig) transOrig.addEventListener('change', refreshMinis);
  // ---- TAFSIR ----
  function renderTafsirPopup(){
    var cur=(typeof tafsirId!=='undefined')?tafsirId:381;
    var html=head('{{auto_stories}} তাফসির');
    TAFSIRS.forEach(function(t){ html+='<div class="pp-opt'+(t[0]===cur?' on':'')+'" data-taf="'+t[0]+'">'+t[1]+'<span>'+(t[0]===cur?'{{check}}':'')+'</span></div>'; });
    html+='<div class="pp-mini">আয়াতে ট্যাপ করলে এই তাফসির খুলবে। তাফসির লোড করতে ইন্টারনেট লাগে।</div>';
    box.innerHTML=html;
    box.querySelectorAll('[data-taf]').forEach(function(el){ el.onclick=function(){ tafsirId=parseInt(el.dataset.taf,10); lsSet('tafsirId',tafsirId); refreshMinis(); closePopup(); }; });
  }
  // ---- RECITER ----
  function renderReciterPopup(){
    var cur=(typeof currentReciter!=='undefined')?currentReciter:'Saood_ash-Shuraym_128kbps'; try{cur=JSON.parse(cur);}catch(e){}
    var html=head('{{headphones}} তেলাওয়াতকারী');
    (typeof RECITERS!=='undefined'?RECITERS:[]).forEach(function(r){ html+='<div class="pp-opt'+(r[0]===cur?' on':'')+'" data-rec="'+r[0]+'">'+r[1]+'<span>'+(r[0]===cur?'{{check}}':'')+'</span></div>'; });
    box.innerHTML=html;
    box.querySelectorAll('[data-rec]').forEach(function(el){ el.onclick=function(){ try{ if(typeof currentReciter!=='undefined') currentReciter=el.dataset.rec; localStorage.setItem('reciter', JSON.stringify(el.dataset.rec)); if(typeof lsSet==='function') lsSet('reciter', el.dataset.rec); const al = document.getElementById('audioReciterLabel'); if(al) al.textContent=(function(n){n=n.cloneNode(true);n.querySelectorAll('.ms').forEach(function(x){x.remove()});return n.textContent})(el).trim(); if(typeof showToast==='function') showToast('ক্বারী পরিবর্তন করা হয়েছে'); }catch(e){} refreshMinis(); closePopup(); }; });
  }
  // ---- FONT ----
  function getFs(){ try{ return parseInt(localStorage.getItem('fs'))||30; }catch(e){ return 30; } }
  function renderFontPopup(){
    var arFs=getFs(); var bnFs=(typeof appPrefs!=='undefined'&&appPrefs.bnFs)?appPrefs.bnFs:16;
    var arOpts='', bnOpts='';
    if(typeof AR_FONTS!=='undefined') AR_FONTS.forEach(function(f){ arOpts+='<option value="'+f[0].replace(/"/g,'&quot;')+'" '+(typeof appPrefs!=='undefined'&&appPrefs.arFont===f[0]?'selected':'')+'>'+f[1]+'</option>'; });
    if(typeof BN_FONTS!=='undefined') BN_FONTS.forEach(function(f){ bnOpts+='<option value="'+f[0].replace(/"/g,'&quot;')+'" '+(typeof appPrefs!=='undefined'&&appPrefs.bnFont===f[0]?'selected':'')+'>'+f[1]+'</option>'; });
    box.innerHTML=head('{{text_fields}} ফন্ট কাস্টমাইজ') +
      '<div class="pp-mini">বাংলা ফন্ট পরিবর্তন</div><select class="pp-input" id="ppBnFont">'+bnOpts+'</select>' +
      '<div class="frow"><span>বাংলা ফন্টের সাইজ (<b>'+bnFs+'px</b>)</span><span class="fsz"><button id="ppBnMinus" title="ছোট"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg></button><button id="ppBnReset" title="রিসেট"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg></button><button id="ppBnPlus" title="বড়"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg></button></span></div>' +
      '<div class="pp-mini">আরবি ফন্ট পরিবর্তন</div><select class="pp-input" id="ppArFont">'+arOpts+'</select>' +
      '<div class="frow"><span>আরবি ফন্টের সাইজ (<b>'+arFs+'px</b>)</span><span class="fsz"><button id="ppArMinus" title="ছোট"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg></button><button id="ppArReset" title="রিসেট"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg></button><button id="ppArPlus" title="বড়"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg></button></span></div>';
    document.getElementById('ppArReset').onclick=function(){ localStorage.setItem('fs','30'); document.documentElement.style.setProperty('--qx-fs-ar','30px'); renderFontPopup(); };
    document.getElementById('ppBnReset').onclick=function(){ if(typeof appPrefs==='undefined') return; appPrefs.bnFs=16; if(typeof lsSet==='function') lsSet('appPrefs',appPrefs); if(typeof applyAppPrefs==='function') applyAppPrefs(); renderFontPopup(); };
    document.getElementById('ppArMinus').onclick=function(){ var v=Math.max(20,getFs()-2); localStorage.setItem('fs', String(v)); document.documentElement.style.setProperty('--qx-fs-ar', v+'px'); renderFontPopup(); };
    document.getElementById('ppArPlus').onclick=function(){ var v=Math.min(48,getFs()+2); localStorage.setItem('fs', String(v)); document.documentElement.style.setProperty('--qx-fs-ar', v+'px'); renderFontPopup(); };
    document.getElementById('ppBnMinus').onclick=function(){ if(typeof appPrefs==='undefined') return; appPrefs.bnFs=Math.max(13,(appPrefs.bnFs||16)-1); if(typeof lsSet==='function') lsSet('appPrefs',appPrefs); if(typeof applyAppPrefs==='function') applyAppPrefs(); renderFontPopup(); };
    document.getElementById('ppBnPlus').onclick=function(){ if(typeof appPrefs==='undefined') return; appPrefs.bnFs=Math.min(24,(appPrefs.bnFs||16)+1); if(typeof lsSet==='function') lsSet('appPrefs',appPrefs); if(typeof applyAppPrefs==='function') applyAppPrefs(); renderFontPopup(); };
    document.getElementById('ppArFont').onchange=function(){ if(typeof appPrefs==='undefined') return; appPrefs.arFont=this.value; if(typeof lsSet==='function') lsSet('appPrefs',appPrefs); if(typeof applyAppPrefs==='function') applyAppPrefs(); };
    document.getElementById('ppBnFont').onchange=function(){ if(typeof appPrefs==='undefined') return; appPrefs.bnFont=this.value; if(typeof lsSet==='function') lsSet('appPrefs',appPrefs); if(typeof applyAppPrefs==='function') applyAppPrefs(); };
  }
  // ---- BACKUP / SOURCE ----
  function renderBackupPopup(){
    box.innerHTML=head('{{save}} ব্যাকআপ ও রিস্টোর') + '<button class="pp-btn" id="ppExport">{{share}} ব্যাকআপ ডাউনলোড</button><div style="height:8px"></div><button class="pp-btn" id="ppImport" style="background:var(--qx-card-bg);color:var(--qx-text-color);border:1px solid var(--qx-border)">{{download}} ব্যাকআপ রিস্টোর</button><input type="file" id="ppFile" accept=".json,application/json" style="display:none">';
    document.getElementById('ppExport').onclick=function(){ if(typeof exportUserBackup==='function') exportUserBackup(); };
    document.getElementById('ppImport').onclick=function(){ document.getElementById('ppFile').click(); };
    document.getElementById('ppFile').onchange=function(e){ if(typeof importUserBackup==='function') importUserBackup(e.target.files[0], function(){ closePopup(); }); };
  }
  function renderSourcePopup(){
    box.innerHTML=head('{{info}} উৎস ও তথ্যসূত্র') + '<div class="pp-mini">' + window.qxSourcesHtml() + '</div>';
  }
  refreshMinis();
  // ---- Home Hero ----
  var origRenderQuranHome = window.renderQuranHome;
  function buildHero(){
    if(tab==='bm') return;
    var qv=qEl?qEl.value.trim():''; if(qv) return;
    const appEl = document.getElementById('app'); if(!appEl) return;
    appEl.querySelectorAll('.home-tiles,.home-browse-nav,.home-browse-heading').forEach(function(el){el.remove();});
    var browse=document.createElement('section'); browse.className='home-browse-nav'+(tab==='home'?'':' is-sticky'); browse.setAttribute('role','group'); browse.setAttribute('aria-label','কুরআন ব্রাউজ করুন');
    var browseItems=[['all','সব সূরা'],['Meccan','মাক্কী'],['Medinan','মাদানী'],['juz','পারা'],['topic','বিষয়ভিত্তিক আয়াত']];
    browseItems.forEach(function(pair){
      var b=document.createElement('button'); b.type='button'; b.textContent=pair[1]; b.setAttribute('aria-pressed',tab===pair[0]?'true':'false');
      if(tab===pair[0]){b.className='on';b.setAttribute('aria-current','page');}
      b.onclick=function(){tab=pair[0];if(qEl)qEl.value='';if(typeof renderTabs==='function')renderTabs();if(typeof renderHome==='function')renderHome();window.scrollTo(0,0);};
      browse.appendChild(b);
    });
    if(tab==='juz'){
      var heading=document.createElement('div');heading.className='home-browse-heading';heading.innerHTML='<h2>পারা অনুযায়ী পড়ুন</h2><p>৩০টি পারার যেকোনোটি নির্বাচন করুন</p>';
      appEl.prepend(heading);appEl.prepend(browse);return;
    }
    if(tab!=='home'){ appEl.prepend(browse); return; }
    var lastNm='আল-ফাতিহা'; var lastMeta='এখনই কুরআন পড়া শুরু করুন'; var lastAction=function(){ openSurah(1); };
    try{
      if(typeof last!=='undefined' && last){
        var sn=(typeof surahs!=='undefined')?surahs.find(function(x){return x.number===last.n}):null;
        if(last.t==='s'){
          lastNm=sn?sn.englishName:'সূরা '+toBn(last.n);
          lastMeta=(sn&&sn.name?sn.name+' · ':'')+(last.y>0?'আগের সংরক্ষিত অবস্থান থেকে চালিয়ে যান':'এই সূরার শুরু থেকে পড়ুন');
          lastAction=function(){ openSurah(last.n, last.y); };
        } else {
          lastNm='পারা '+toBn(last.n);
          lastMeta=last.y>0?'আগের সংরক্ষিত অবস্থান থেকে চালিয়ে যান':'এই পারার শুরু থেকে পড়ুন';
          lastAction=function(){ openJuz(last.n, last.y); };
        }
      }
    }catch(e){}
    var cnt=0, tgt=10; try{ if(typeof goalData!=='undefined'){ if(goalData.date===todayStr()) cnt=goalData.readKeys?goalData.readKeys.length:0; tgt=goalData.target||10; } }catch(e){}
    var defs=[
      ['history_edu','শেষ পড়া',lastNm,function(){ lastAction(); },lastMeta],
      ['auto_stories','আজকের পড়া',toBn(cnt)+'/'+toBn(tgt)+' আয়াত',function(){ openTodaySheet(); }],
      ['auto_awesome','৯৯ নাম','আসমাউল হুসনা',function(){ if(typeof setMode==='function') setMode('asma'); }],
      ['calendar_month','খতম প্ল্যান','পরিকল্পনা',function(){ openPopup('khatam'); }]
    ];
    var row=document.createElement('div'); row.className='home-tiles';
    defs.forEach(function(d){
      var t=document.createElement('button'); t.type='button'; t.className='home-tile';
      t.setAttribute('aria-label',d[1]+': '+d[2]+(d[4]?'. '+d[4]:''));
      t.innerHTML='<span class="t-ic">{{'+d[0]+'}}</span><span class="tile-copy"><b>'+d[1]+'</b><strong>'+d[2]+'</strong>'+(d[4]?'<small>'+d[4]+'</small>':'')+'</span>';
      t.onclick=d[3]; row.appendChild(t);
    });
    var navGo=function(m){ return function(){ var nb=document.querySelector('#nav [data-m="'+m+'"]'); if(nb) nb.click(); else setMode(m); }; };
    var cats=[
      ['menu_book','কুরআন','সূরা ও পারা',navGo('quran')],
      ['history_edu','হাদিস','হাদিস প্যাকেজ',navGo('hadith')],
      ['mosque','নামাজ','সময় ও শিক্ষা',navGo('prayer')],
      ['front_hand','দোয়া ও তাসবিহ','দোয়া ও যিকির',navGo('dua')],
      ['no_meals','রমজান','রোজা ও আমল',function(){ setMode('ramadan'); }],
      ['auto_awesome','কালিমা','ঈমানের ঘোষণা',function(){ setMode('kalima'); }],
      ['view_in_ar','হজ্জ','পরিচিতি',function(){ setMode('hajj'); }],
      ['toll','যাকাত','পরিচিতি',function(){ setMode('zakat'); }],
      ['edit_note','বই ও অনুচ্ছেদ','বই ও লেখা',function(){ setMode('books'); }],
      ['bar_chart','ট্র্যাকার','প্রতিদিনের হিসাব',function(){ setMode('tracker'); }],
      ['star','সংরক্ষিত','বুকমার্ক ও ফেভারিট',function(){ setMode('saved'); }]
    ];
    cats.forEach(function(d){
      var t=document.createElement('button'); t.type='button'; t.className='home-tile';
      t.setAttribute('aria-label',d[1]+': '+d[2]);
      t.innerHTML='<span class="t-ic">{{'+d[0]+'}}</span><span class="tile-copy"><strong>'+d[1]+'</strong><small>'+d[2]+'</small></span>';
      t.onclick=d[3]; row.appendChild(t);
    });
    appEl.prepend(row);
  }
  if(origRenderQuranHome){ window.renderQuranHome=function(){ origRenderQuranHome(); buildHero(); }; setTimeout(function(){ if(typeof renderHome==='function') renderHome(); }, 100); }
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


(function(){
  var lastY=window.scrollY, ticking=false;
  window.addEventListener('scroll',function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      var y=window.scrollY, d=y-lastY;
      const dd = document.getElementById('gridDropdown'), ov=document.getElementById('gridPopupOverlay');
      var busy=(dd&&dd.classList.contains('open'))||(ov&&ov.classList.contains('open'))||document.querySelector('.modal-overlay,.sheet-ov');
      if(busy||y<60){ document.body.classList.remove('bars-hidden'); lastY=y; }
      else if(d>8){ document.body.classList.add('bars-hidden'); lastY=y; }
      else if(d<-8){ document.body.classList.remove('bars-hidden'); lastY=y; }
      ticking=false;
    });
  },{passive:true});
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== STEP 1: HIFZ MODE ===== */
(function(){
  var MODE = localStorage.getItem('quranix_hifz_mode') || 'off'; // off | bn | ar | both
  var MEM = {}; try{ MEM = JSON.parse(localStorage.getItem('quranix_hifz_mem')||'{}'); }catch(e){ MEM={}; }
  function save(){ localStorage.setItem('quranix_hifz_mode', MODE); localStorage.setItem('quranix_hifz_mem', JSON.stringify(MEM)); }
  function applyMode(){
    document.body.classList.toggle('hifz-on', MODE!=='off');
    document.querySelectorAll('#hifzBar .hifz-chip').forEach(function(c){ c.classList.toggle('on', c.dataset.hifz===MODE); });
    const t = document.getElementById('hifzToggle'); if(t) t.classList.toggle('on', MODE!=='off');
    document.querySelectorAll('.ayah').forEach(applyToCard);
    updateProgress();
  }
  function applyToCard(card){
    var ar=card.querySelector('.ar'), bn=card.querySelector('.bn');
    if(ar) ar.classList.toggle('hifz-hide', MODE==='ar'||MODE==='both');
    if(bn) bn.classList.toggle('hifz-hide', MODE==='bn'||MODE==='both');
    // tap to reveal / hide again
    [ar,bn].forEach(function(el){ if(!el||el.dataset.hifzBound) return; el.dataset.hifzBound='1';
      el.addEventListener('click', function(e){ if(!el.classList.contains('hifz-hide')) return; e.stopPropagation(); el.classList.toggle('revealed'); });
    });
    // per-ayah eye + memorized tick
    var acts=card.querySelector('.ayah-actions'); if(acts && !acts.dataset.hifzBound){ acts.dataset.hifzBound='1';
      var eye=document.createElement('button'); eye.className='hifz-eye'; eye.title='এই আয়াত লুকাও / দেখাও'; eye.textContent='{{visibility}}';
      eye.onclick=function(e){ e.stopPropagation(); var b=card.querySelector('.bn');
        if(!b) return;
        var hiding = !b.classList.contains('hifz-hide');
        b.classList.toggle('hifz-hide', hiding);
        b.classList.remove('revealed');
        eye.classList.toggle('on', hiding); };
      var tick=document.createElement('button'); tick.className='hifz-eye'; tick.title='মুখস্থ হয়েছে'; tick.textContent='{{psychology}}';
      var key=card.dataset.key||'';
      function paintTick(){ tick.classList.toggle('on', !!MEM[key]); card.classList.toggle('hifz-memorized', !!MEM[key]); tick.textContent = MEM[key] ? '{{check_circle:f}}' : '{{psychology}}'; }
      tick.onclick=function(e){ e.stopPropagation(); if(!key) return; if(MEM[key]) delete MEM[key]; else MEM[key]=1; save(); paintTick(); updateProgress();
        if(typeof showToast==='function') showToast(MEM[key] ? 'মুখস্থ হিসেবে চিহ্নিত' : 'মুখস্থ চিহ্ন সরানো হয়েছে'); };
      paintTick(); acts.prepend(tick); acts.prepend(eye);
    }
  }
  function updateProgress(){
    const el = document.getElementById('hifzProgress'); if(!el) return;
    var cards=document.querySelectorAll('.ayah').length;
    var done=Object.keys(MEM).length;
    el.textContent = cards ? ('এই পেজে '+cards+' আয়াত · মোট মুখস্থ '+done+'টি') : ('মোট মুখস্থ '+done+'টি');
  }
  // Header toggle button
  function addToggle(){
    const tools = document.getElementById('gQuick'); if(!tools||document.getElementById('hifzToggle')) return;
    var b=document.createElement('button'); b.id='hifzToggle'; b.className='g-quick-btn'; b.title='হিফজ মোড'; b.innerHTML='{{psychology}}<span>হিফজ</span>';
    b.onclick=function(){ MODE = (MODE==='off' ? 'bn' : 'off'); save(); applyMode();
      if(typeof showToast==='function') showToast(MODE==='off' ? 'হিফজ মোড বন্ধ' : 'হিফজ মোড চালু — বাংলা লুকানো আছে'); };
    tools.insertBefore(b, tools.firstChild);
  }
  document.querySelectorAll('#hifzBar .hifz-chip').forEach(function(c){
    c.onclick=function(){ MODE=c.dataset.hifz; save(); applyMode(); };
  });
  // Watch for new ayah cards (Surah / Juz load)
  var obs=new MutationObserver(function(){ applyMode(); });
  obs.observe(document.getElementById('app')||document.body, {childList:true, subtree:true});
  // Also re-apply after any click that opens a surah (delayed render)
  document.addEventListener('click', function(){ setTimeout(applyMode, 350); });
  addToggle(); setTimeout(addToggle, 500); applyMode();
  window.quranixHifz = { getMode:function(){return MODE;}, setMode:function(m){MODE=m;save();applyMode();} };
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== STEP 2: KHATAM PLANNER ===== */
(function(){
  var KEY='quranix_khatam', TOTAL=6236;
  function bn(x){ return window.toBn ? window.toBn(x) : x; }
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null')||null; }catch(e){ return null; } }
  function save(p){ try{ localStorage.setItem(KEY, JSON.stringify(p)); }catch(e){} }
  function pad(n){ return String(n).padStart(2,'0'); }
  function ymd(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function todayStr2(){ return ymd(new Date()); }
  function parse(s){ var a=String(s||'').split('-'); if(a.length<3) return null; var d=new Date(+a[0],(+a[1])-1,+a[2]); return isNaN(d.getTime())?null:d; }
  function daysBetween(a,b){ var x=parse(a), y=parse(b); if(!x||!y) return 0; return Math.round((y-x)/86400000); }
  function addDays(s,n){ var d=parse(s)||new Date(); d.setDate(d.getDate()+n); return ymd(d); }
  function fmtDate(s){ var d=parse(s); if(!d) return '—'; try{ return d.toLocaleDateString('bn-BD',{day:'numeric',month:'long',year:'numeric'}); }catch(e){ return s; } }

  /* সূরার তথ্য SURAH_META (quran.js) থেকে — বাংলা নাম ও আয়াতসংখ্যা */
  function meta(){ return (window.SURAH_META && window.SURAH_META.length===114) ? window.SURAH_META : null; }
  function fromGlobal(idx){
    idx=Math.max(0,Math.min(TOTAL-1,idx));
    var M=meta(); if(!M) return {s:1,a:idx+1,name:'সূরা'};
    var acc=0;
    for(var i=0;i<M.length;i++){ var n=M[i].ayahs; if(idx<acc+n) return {s:M[i].n,a:idx-acc+1,name:M[i].bn||M[i].name}; acc+=n; }
    return {s:114,a:6,name:M[113].bn||M[113].name};
  }
  function toGlobal(s,a){
    var M=meta(); if(!M) return -1;
    var acc=0;
    for(var i=0;i<M.length;i++){ if(M[i].n===s) return (a>=1&&a<=M[i].ayahs)?acc+a-1:-1; acc+=M[i].ayahs; }
    return -1;
  }
  /* [from,to) গ্লোবাল ইনডেক্সকে সূরা-ভিত্তিক টুকরোয় ভাঙে: কোন সূরা, কত থেকে কত, কয়টি আয়াত */
  function segments(from,to){
    var out=[], M=meta(); if(!M||to<=from) return out;
    var acc=0;
    for(var i=0;i<M.length;i++){
      var s0=acc, s1=acc+M[i].ayahs; acc=s1;
      if(s1<=from) continue; if(s0>=to) break;
      var a=Math.max(from,s0)-s0+1, b=Math.min(to,s1)-s0;
      out.push({s:M[i].n,name:M[i].bn||M[i].name,from:a,to:b,count:b-a+1});
    }
    return out;
  }
  function segLines(segs){
    return segs.map(function(g){
      return g.name+' · আয়াত '+bn(g.from)+(g.to>g.from?'–'+bn(g.to):'')+' ('+bn(g.count)+'টি)';
    });
  }

  /* পড়ার হিসাব: bits = ৬২৩৬ অক্ষরের '0'/'1' স্ট্রিং, প্রতিটি আয়াত পড়া হয়েছে কি না */
  function ensure(p){
    if(typeof p.bits!=='string' || p.bits.length!==TOTAL){
      var c=Math.max(0,Math.min(TOTAL,p.current||0));
      p.bits=new Array(c+1).join('1')+new Array(TOTAL-c+1).join('0');
    }
    if(!p.log) p.log={};
    return p;
  }
  function countOnes(bits,a,b){ var n=0; for(var i=a;i<b;i++) if(bits.charCodeAt(i)===49) n++; return n; }
  function firstZero(bits){ var i=bits.indexOf('0'); return i<0?TOTAL:i; }
  function getPlan(){ var p=load(); return p?ensure(p):null; }
  function addLog(p,delta){ var t=todayStr2(); p.log[t]=Math.max(0,(p.log[t]||0)+delta); }

  function planStats(p){
    ensure(p);
    var today=todayStr2(), days=p.days||30;
    var perDay=Math.ceil(TOTAL/days);
    var elapsed=daysBetween(p.start,today);
    var notStarted=elapsed<0, over=elapsed>=days;
    var dayNo=Math.max(1,Math.min(days,elapsed+1));
    var todayStart=Math.min(TOTAL,(dayNo-1)*perDay), todayEnd=Math.min(TOTAL,dayNo*perDay);
    var done=countOnes(p.bits,0,TOTAL), next=firstZero(p.bits);
    var endDate=addDays(p.start,days-1);
    var remain=Math.max(0,daysBetween(today,endDate)+1);
    var needToday=notStarted?0:todayEnd-countOnes(p.bits,0,todayEnd);      // আজ রাতের মধ্যে ট্র্যাকে থাকতে যত আয়াত বাকি
    var behind=notStarted?0:Math.max(0,todayStart-countOnes(p.bits,0,todayStart)); // আগের দিনগুলোর জমা
    var readToday=p.log[today]||0;
    var state = notStarted?'future' : (done>=TOTAL?'finished' : (over?'over' : (needToday===0?'ok' : (behind>0?'behind' : (readToday>0?'part':'todo')))));
    var catchUp = Math.ceil((TOTAL-done)/Math.max(1,remain));
    return {total:TOTAL,done:done,next:next,perDay:perDay,dayNo:dayNo,todayStart:todayStart,todayEnd:todayEnd,
            endDate:endDate,remain:remain,pct:Math.round(done/TOTAL*100),needToday:needToday,behind:behind,
            readToday:readToday,state:state,notStarted:notStarted,over:over,catchUp:catchUp,days:days};
  }
  function statusHtml(st){
    switch(st.state){
      case 'future':   return '{{hourglass_top}} শুরু হয়নি';
      case 'finished': return '{{check_circle:f}} খতম সম্পন্ন';
      case 'over':     return '{{warning}} মেয়াদ শেষ';
      case 'ok':       return '{{check_circle:f}} আজকের লক্ষ্য পূর্ণ';
      case 'behind':   return '{{warning}} পিছিয়ে '+bn(st.behind)+' আয়াত';
      case 'part':     return '{{hourglass_top}} আজ চলছে';
      default:         return '{{hourglass_top}} আজ বাকি';
    }
  }
  function resumeSegs(st){
    var to = st.state==='over' ? TOTAL : st.todayEnd;
    return st.next<to ? segments(st.next,to) : [];
  }
  function openAtNext(st){
    var r=fromGlobal(Math.min(st.next,TOTAL-1));
    if(typeof openSurah==='function') openSurah(r.s,0,r.a);
  }

  function buildKhatamCard(){
    var box=document.createElement('div'); box.className='khatam-card';
    var p=getPlan();
    if(!p){
      box.innerHTML='<b>{{calendar_month}} খতম প্ল্যান</b><div class="khatam-row"><span>এখনো কোনো প্ল্যান নেই — ৩০ দিন / রমজান / ১ বছরে পুরো কুরআন শেষ করুন</span></div><div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">+ প্ল্যান বানান →</span><span>৬,২৩৬ আয়াত</span></div>';
      box.onclick=function(){ renderKhatamPopup(); };
      return box;
    }
    var st=planStats(p), segs=resumeSegs(st);
    var h='<div class="khatam-row"><b>{{calendar_month}} খতম প্ল্যান — '+bn(st.dayNo)+' / '+bn(st.days)+' দিন</b><span>'+statusHtml(st)+'</span></div>';
    if(st.state==='finished'){
      h+='<div class="khatam-row"><span>মাশাআল্লাহ! পুরো কুরআন শেষ হয়েছে</span></div>';
    } else if(st.state==='future'){
      h+='<div class="khatam-row"><span>শুরু</span><b>'+fmtDate(p.start)+'</b></div>';
    } else if(segs.length){
      h+='<div class="khatam-row"><span>আজকের পড়া</span><b style="text-align:right">'+segLines(segs).join('<br>')+'</b></div>';
    }
    h+='<div class="khatam-row"><span>শেষ হবে</span><b>'+fmtDate(st.endDate)+' · আর '+bn(st.remain)+' দিন</b></div>'
     + '<div class="goal-track" style="margin:8px 0"><div class="goal-fill" style="width:'+st.pct+'%"></div></div>'
     + '<div class="khatam-row"><span>'+bn(st.done)+' / '+bn(st.total)+' আয়াত ('+bn(st.pct)+'%)</span><span>আজ পড়া '+bn(st.readToday)+' আয়াত</span></div>'
     + '<div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">'+(st.state==='finished'?'প্ল্যান দেখুন':'আজকের পড়া শুরু করুন →')+'</span><span>প্ল্যান দেখুন</span></div>';
    box.innerHTML=h;
    box.onclick=function(){ if(st.state==='finished'||st.state==='future') renderKhatamPopup(); else openAtNext(st); };
    return box;
  }
  window.buildKhatamCard=buildKhatamCard;

  function closeBtn(){ return '<button type="button" class="pp-close" aria-label="বন্ধ করুন" onclick="document.getElementById(\'gridPopupOverlay\').classList.remove(\'open\')">{{close}}</button>'; }
  function refreshHome(){ if(typeof renderHome==='function') renderHome(); }
  function toast(t){ if(typeof showToast==='function') showToast(t); }

  function renderKhatamPopup(){
    var box=document.getElementById('gridPopupBox'), overlay=document.getElementById('gridPopupOverlay');
    if(!box||!overlay) return;
    overlay.classList.add('open');
    var p=getPlan();
    if(!p){ renderSetup(box,overlay); return; }
    renderPlan(box,overlay,p);
  }
  window.renderKhatamPopup=renderKhatamPopup;

  function renderSetup(box,overlay){
    box.innerHTML='<div class="pp-header"><h3>{{calendar_month}} খতম প্ল্যান বানান</h3>'+closeBtn()+'</div>'
      +'<div class="khatam-setup"><label>কত দিনে শেষ করবেন?</label>'
      +'<div class="pp-tabs wrap" id="khDays"><button data-d="30" class="on">৩০ দিন</button><button data-d="60">৬০ দিন</button><button data-d="90">৯০ দিন</button><button data-d="365">১ বছর</button><button data-d="custom">কাস্টম</button></div>'
      +'<div id="khCustomWrap" style="display:none"><label>কত দিন? (১ থেকে ৭৩০)</label><input type="number" inputmode="numeric" min="1" max="730" class="pp-input" id="khCustom" placeholder="যেমন: ১৫"></div>'
      +'<label>শুরুর তারিখ</label><input type="date" class="pp-input" id="khStart" value="'+todayStr2()+'">'
      +'<div class="pp-mini" id="khPreview"></div>'
      +'<button class="pp-btn" id="khCreate">{{check_circle:f}} প্ল্যান শুরু করুন</button></div>';
    var days=30, custom=false;
    var startEl=document.getElementById('khStart'), customEl=document.getElementById('khCustom'), prevEl=document.getElementById('khPreview');
    function getDays(){
      if(!custom) return days;
      var v=parseInt(customEl.value,10);
      return (v>=1&&v<=730)?v:0;
    }
    function upd(){
      var d=getDays();
      if(!d){ prevEl.textContent='দিনের সংখ্যা লিখুন (১ থেকে ৭৩০)'; return; }
      var start=startEl.value||todayStr2(), per=Math.ceil(TOTAL/d), end=addDays(start,d-1), diff=daysBetween(todayStr2(),start);
      var h='প্রতিদিন প্রায় <b>'+bn(per)+' আয়াত</b> · শেষ হবে <b>'+fmtDate(end)+'</b>';
      if(diff>0){ h+='<br>শুরু হবে '+bn(diff)+' দিন পরে'; }
      else if(diff<0){
        var gone=-diff, rem=d-gone;
        if(rem>0) h+='<br>শুরুর তারিখ '+bn(gone)+' দিন আগের, আজ প্ল্যানের '+bn(gone+1)+' নম্বর দিন। এখনো কিছু না পড়া হলে বাকি '+bn(rem)+' দিনে প্রতিদিন প্রায় <b>'+bn(Math.ceil(TOTAL/rem))+' আয়াত</b> পড়তে হবে';
        else h+='<br>এই তারিখ থেকে শুরু করলে প্ল্যানের মেয়াদ আগেই শেষ হয়ে যায়';
      }
      prevEl.innerHTML=h;
    }
    document.querySelectorAll('#khDays button').forEach(function(b){
      b.onclick=function(){
        document.querySelectorAll('#khDays button').forEach(function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        custom=(b.dataset.d==='custom');
        document.getElementById('khCustomWrap').style.display=custom?'block':'none';
        if(custom){ customEl.focus(); } else { days=parseInt(b.dataset.d,10); }
        upd();
      };
    });
    customEl.oninput=upd; startEl.onchange=upd; startEl.oninput=upd; upd();
    document.getElementById('khCreate').onclick=function(){
      var d=getDays(); if(!d){ toast('দিনের সংখ্যা ঠিক করুন (১ থেকে ৭৩০)'); return; }
      var np={days:d, start:startEl.value||todayStr2(), created:todayStr2(), log:{}, bits:new Array(TOTAL+1).join('0')};
      save(np); overlay.classList.remove('open');
      toast('খতম প্ল্যান শুরু! প্রতিদিন প্রায় '+bn(Math.ceil(TOTAL/d))+' আয়াত');
      refreshHome();
    };
  }

  function renderPlan(box,overlay,p){
    var st=planStats(p), segs=resumeSegs(st);
    var dots='';
    var perDay=st.perDay;
    for(var i=1;i<=p.days;i++){
      var ds=addDays(p.start,i-1), a=(i-1)*perDay, b=Math.min(TOTAL,i*perDay);
      var got=countOnes(p.bits,a,b), full=(b>a&&got>=b-a);
      dots+='<span class="khatam-dot'+(full?' done':(got>0?' part':''))+(i===st.dayNo&&!st.notStarted?' today':'')+'" title="'+ds+'">'+bn(i)+'</span>';
    }
    var h='<div class="pp-header"><h3>{{calendar_month}} খতম প্ল্যান</h3>'+closeBtn()+'</div>'
      +'<div class="khatam-row"><b>দিন '+bn(st.dayNo)+' / '+bn(st.days)+'</b><span>'+statusHtml(st)+'</span></div>';
    if(st.state==='future') h+='<div class="khatam-row"><span>শুরু হবে</span><b>'+fmtDate(p.start)+'</b></div>';
    if(segs.length) h+='<div class="khatam-row"><span>আজকের পড়া</span><b style="text-align:right">'+segLines(segs).join('<br>')+'</b></div>';
    h+='<div class="khatam-row"><span>দৈনিক লক্ষ্য</span><b>প্রায় '+bn(st.perDay)+' আয়াত</b></div>';
    if(st.state!=='future') h+='<div class="khatam-row"><span>আজ পড়া হয়েছে</span><b>'+bn(st.readToday)+' আয়াত'+(st.needToday>0?' · বাকি '+bn(st.needToday):'')+'</b></div>';
    if(st.behind>0 && st.state!=='over') h+='<div class="pp-mini">আগের দিনগুলোর '+bn(st.behind)+' আয়াত জমে আছে। বাকি '+bn(st.remain)+' দিনে শেষ করতে প্রতিদিন প্রায় '+bn(st.catchUp)+' আয়াত লাগবে।</div>';
    h+='<div class="goal-track" style="margin:8px 0"><div class="goal-fill" style="width:'+st.pct+'%"></div></div>'
      +'<div class="khatam-row"><span>মোট</span><b>'+bn(st.done)+' / ৬,২৩৬ ('+bn(st.pct)+'%)</b></div>'
      +'<div class="khatam-row"><span>শেষ হবে</span><b>'+fmtDate(st.endDate)+'</b></div>'
      +'<div class="pp-mini">দিনগুলো — সবুজ = পূর্ণ, আধা রং = আংশিক, বর্ডার = আজ</div><div class="khatam-dots">'+dots+'</div>'
      +'<div class="pp-mini" style="margin-top:6px">আজ কত আয়াত পড়লেন? সংখ্যা লিখে যোগ করুন (ভুল হলে মাইনাস লিখে কমান, যেমন −৫)</div>'
      +'<div style="display:flex;gap:8px;margin:6px 0 10px"><input type="number" inputmode="numeric" class="pp-input" id="khAddN" style="margin:0;flex:1" placeholder="যেমন: ৫">'
      +'<button class="pp-btn" id="khAdd" style="width:auto;flex:0 0 38%">যোগ করুন</button></div>'
      +(st.state==='finished'?'':'<button class="pp-btn" id="khGo">{{play_arrow}} আজকের পড়া শুরু করুন</button><div style="height:8px"></div>')
      +(st.needToday>0?'<button class="pp-btn" id="khDone" style="background:var(--qx-card-bg);color:var(--qx-text-color);border:1px solid var(--qx-border)">{{check_circle:f}} আজকের বাকি পড়া শেষ করেছি</button><div style="height:8px"></div>':'')
      +'<button class="pp-btn" id="khReset" style="background:none;color:var(--qx-danger);border:1px solid var(--qx-danger)">{{delete}} প্ল্যান মুছে ফেলুন</button>';
    box.innerHTML=h;
    var mini=document.getElementById('gKhatamMini'); if(mini) mini.textContent=bn(st.pct)+'% ›';

    var go=document.getElementById('khGo');
    if(go) go.onclick=function(){ overlay.classList.remove('open'); openAtNext(st); };

    document.getElementById('khAdd').onclick=function(){
      var n=parseInt(document.getElementById('khAddN').value,10);
      if(!n){ toast('আয়াতের সংখ্যা লিখুন'); return; }
      var arr=p.bits.split(''), moved=0, i;
      if(n>0){
        i=firstZero(p.bits);
        while(moved<n && i<TOTAL){ if(arr[i]!=='1'){ arr[i]='1'; moved++; } i++; }
        p.bits=arr.join(''); addLog(p,moved);
        toast(bn(moved)+' আয়াত যোগ হয়েছে');
      } else {
        i=firstZero(p.bits)-1;
        while(moved<-n && i>=0){ if(arr[i]==='1'){ arr[i]='0'; moved++; } i--; }
        p.bits=arr.join(''); addLog(p,-moved);
        toast(bn(moved)+' আয়াত কমানো হয়েছে');
      }
      save(p); renderPlan(box,overlay,p); refreshHome();
    };
    var done=document.getElementById('khDone');
    if(done) done.onclick=function(){
      var arr=p.bits.split(''), moved=0;
      for(var i=0;i<st.todayEnd;i++){ if(arr[i]!=='1'){ arr[i]='1'; moved++; } }
      p.bits=arr.join(''); addLog(p,moved); save(p);
      toast('আজকের পড়া সম্পন্ন'); renderPlan(box,overlay,p); refreshHome();
    };
    document.getElementById('khReset').onclick=function(){
      if(confirm('খতম প্ল্যান মুছে ফেলবেন?')){ try{ localStorage.removeItem(KEY); }catch(e){} overlay.classList.remove('open'); refreshHome(); }
    };
  }

  /* রিডারে কোনো আয়াত "পঠিত" চিহ্নিত/বাতিল করলে খতম প্ল্যানেও সেটা গুনে যাবে */
  window.qxKhatamOnRead=function(k,marked){
    try{
      var p=getPlan(); if(!p) return;
      var a=String(k).split(':'), g=toGlobal(parseInt(a[0],10),parseInt(a[1],10));
      if(g<0) return;
      var has=p.bits.charCodeAt(g)===49;
      if(!!marked===has) return;
      p.bits=p.bits.slice(0,g)+(marked?'1':'0')+p.bits.slice(g+1);
      addLog(p,marked?1:-1); save(p);
    }catch(e){}
  };
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== STEP 4: AYAH IMAGE CARD ===== */
window.openAyahCard = function(label, ar, bn){
  const THEMES =[
    {name:'সবুজ', bg:'#0f766e', bg2:'#0b5c56', ar:'#ffffff', bn:'#e8f5ee', muted:'#bfe3d0', accent:'#ffd98a'},
    {name:'ক্রিম', bg:'#faf6ec', bg2:'#f0e6cc', ar:'#0b5c56', bn:'#3a3a32', muted:'#7a7a68', accent:'#0f766e'},
    {name:'মধ্যরাত', bg:'#101820', bg2:'#1d2f3a', ar:'#ffffff', bn:'#cfe3e8', muted:'#8fa8b0', accent:'#ffd98a'},
    {name:'গোলাপি', bg:'#3b1f3a', bg2:'#5a2d57', ar:'#ffffff', bn:'#f5d9e8', muted:'#d9a8c8', accent:'#ffd98a'},
  ];
  var state={theme:0, aspect:'4:5', showBn:true, showRef:true};
  var ov=document.createElement('div'); ov.className='ac-ov';
  var box=document.createElement('div'); box.className='ac-box';
  box.innerHTML='<div class="ac-head"><span>{{image}} আয়াতের ছবি</span><button id="acClose">{{close}}</button></div>'
    +'<canvas id="acCanvas" class="ac-canvas"></canvas>'
    +'<div class="ac-chips" id="acThemes"></div>'
    +'<div class="ac-chips" id="acAspects"><button class="ac-chip" data-a="1:1">{{crop_square}} ১:১ পোস্ট</button><button class="ac-chip on" data-a="4:5">{{crop_portrait}} ৪:৫ পোস্ট</button><button class="ac-chip" data-a="9:16">{{smartphone}} ৯:১৬ স্টোরি</button></div>'
    +'<label class="ac-toggle"><span>বাংলা অনুবাদ দেখাও</span><input type="checkbox" id="acBn" checked></label>'
    +'<label class="ac-toggle"><span>সূরা · আয়াত রেফারেন্স দেখাও</span><input type="checkbox" id="acRef" checked></label>'
    +'<div class="ac-row"><button class="ac-btn ghost" id="acDl">{{download}} ডাউনলোড</button><button class="ac-btn" id="acShare">{{share}} শেয়ার করো</button></div>'
    +'<div class="pp-mini" style="text-align:center">ছবিতে Quranix লেখা থাকবে · ফেসবুক / WhatsApp / স্টোরিতে সরাসরি শেয়ার করা যাবে</div>';
  ov.appendChild(box); document.body.appendChild(ov);
  var canvas=box.querySelector('#acCanvas'); var ctx=canvas.getContext('2d');
  function sizes(){ if(state.aspect==='1:1') return [1080,1080]; if(state.aspect==='9:16') return [1080,1920]; return [1080,1350]; }
  function wrap(ctx, text, maxW){
    var words=String(text||'').split(/\s+/); var lines=[], line='';
    words.forEach(function(w){ var test=line?line+' '+w:w; if(ctx.measureText(test).width>maxW && line){ lines.push(line); line=w; } else line=test; });
    if(line) lines.push(line); return lines;
  }
  function draw(){
    var th=THEMES[state.theme]; var W,H=sizes(); canvas.width=W; canvas.height=H;
    var g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,th.bg); g.addColorStop(1,th.bg2);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    // border + corner ornaments
    ctx.strokeStyle=th.accent; ctx.globalAlpha=.55; ctx.lineWidth=3; ctx.strokeRect(36,36,W-72,H-72);
    ctx.globalAlpha=.25; ctx.strokeRect(52,52,W-104,H-104); ctx.globalAlpha=1;
    ctx.fillStyle=th.accent; ctx.font='600 34px "Hind Siliguri", sans-serif'; ctx.textAlign='center';
    ctx.fillText('—  Quranix  —', W/2, 108);
    var y=200;
    // Arabic (RTL) - draw bottom-to-top lines reversed order handled by canvas RTL
    ctx.direction='rtl'; ctx.textAlign='right';
    var arSize = ar.length>220 ? 62 : ar.length>120 ? 72 : 84;
    ctx.font=arSize+'px "Noto Naskh Arabic", serif'; ctx.fillStyle=th.ar;
    var arLines=wrap(ctx, ar, W-180);
    // centre block: if too many lines, shrink
    while(arLines.length* (arSize*1.9) > H*0.52 && arSize>44){ arSize-=4; ctx.font=arSize+'px "Noto Naskh Arabic", serif'; arLines=wrap(ctx, ar, W-180); }
    // For RTL, canvas draws each line; start x = right margin
    arLines.forEach(function(l){ ctx.fillText(l, W-90, y); y+=arSize*1.9; });
    ctx.direction='ltr'; ctx.textAlign='center';
    y+=18; ctx.fillStyle=th.accent; ctx.fillRect(W/2-60, y, 120, 3); y+=58;
    if(state.showBn){
      ctx.font='28px "Hind Siliguri", sans-serif'; ctx.fillStyle=th.bn;
      var bnLines=wrap(ctx, bn, W-180);
      bnLines.forEach(function(l){ ctx.fillText(l, W/2, y); y+=44; });
      y+=20;
    }
    if(state.showRef){
      ctx.font='600 30px "Hind Siliguri", sans-serif'; ctx.fillStyle=th.muted; ctx.fillText(label, W/2, H-110);
    }
    ctx.font='24px "Hind Siliguri", sans-serif'; ctx.fillStyle=th.muted; ctx.fillText('Quranix', W/2, H-68);
  }
  function renderChips(){
    var tw=box.querySelector('#acThemes'); tw.innerHTML='';
    THEMES.forEach(function(th,i){ var b=document.createElement('button'); b.className='ac-chip'+(i===state.theme?' on':''); b.textContent=th.name; b.onclick=function(){ state.theme=i; renderChips(); draw(); }; tw.appendChild(b); });
    box.querySelectorAll('#acAspects .ac-chip').forEach(function(b){ b.classList.toggle('on', b.dataset.a===state.aspect); b.onclick=function(){ state.aspect=b.dataset.a; box.querySelectorAll('#acAspects .ac-chip').forEach(function(x){x.classList.remove('on')}); b.classList.add('on'); draw(); }; });
  }
  box.querySelector('#acBn').onchange=function(){ state.showBn=this.checked; draw(); };
  box.querySelector('#acRef').onchange=function(){ state.showRef=this.checked; draw(); };
  box.querySelector('#acClose').onclick=function(){ ov.remove(); };
  ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
  async function toBlob(){ return new Promise(function(res){ canvas.toBlob(res, 'image/png'); }); }
  box.querySelector('#acDl').onclick=async function(){ var blob=await toBlob(); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='quranix-ayah.png'; a.click(); if(typeof showToast==='function') showToast('ছবি ডাউনলোড হয়েছে'); };
  box.querySelector('#acShare').onclick=async function(){
    var blob=await toBlob(); var file=new File([blob], 'quranix-ayah.png', {type:'image/png'});
    if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
      try{
        await navigator.share({title:label, text:'['+label+']\n'+bn+'\n— Quranix', files:[file]});
        return;
      }catch(e){
        // Do not download a duplicate file when the user explicitly cancels sharing.
        if(e && e.name==='AbortError') return;
      }
    }
    // Fallback: download the image when file sharing is unavailable or fails.
    var a=document.createElement('a');
    var imageUrl=URL.createObjectURL(blob);
    a.href=imageUrl;
    a.download='quranix-ayah.png';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(imageUrl); }, 1000);
    if(typeof showToast==='function') showToast('শেয়ার সমর্থিত নয়, ছবি ডাউনলোড করে দিলাম');
  };
  renderChips();
  // wait for Arabic font, then draw
  if(document.fonts && document.fonts.load){ Promise.all([document.fonts.load('84px "Noto Naskh Arabic"'),document.fonts.load('28px "Hind Siliguri"'),document.fonts.load('600 34px "Hind Siliguri"')]).catch(function(){}).finally(function(){ draw(); setTimeout(draw, 300); }); }
  draw();
};


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== STEP 5: TRACKER WINDOW - MULTI CATEGORY ===== */
function trkToday(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function trkLoad(){ try{ return JSON.parse(localStorage.getItem('quranix_tracker')||'null')||{namaz:{},roza:{},dhikr:{},habits:[]}; }catch(e){ return {namaz:{},roza:{},dhikr:{},habits:[]}; } }
function trkSave(d){ localStorage.setItem('quranix_tracker', JSON.stringify(d)); }
function trkDateOffset(n){ var d=new Date(); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function trkBn(n){ return (typeof toBn==='function'?toBn(n):String(n)); }
function trkDots(getDone){
  var w=document.createElement('div'); w.className='trk-dots';
  var labels=['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি'];
  for (let i=-6;i<=0;i++){ var ds=trkDateOffset(i); var d=new Date(ds+'T00:00:00');
    var s=document.createElement('span'); s.className='trk-dot'+(getDone(ds)?' done':'')+(i===0?' today':''); s.title=ds;
    s.textContent = i===0?'আজ':labels[d.getDay()]; w.appendChild(s); }
  return w;
}
function trkRow(label, sub, done, onToggle){
  var row=document.createElement('div'); row.className='trk-row';
  var l=document.createElement('div'); l.innerHTML='<b>'+label+'</b>'+(sub?'<div class="trk-mini">'+sub+'</div>':'');
  var b=document.createElement('button'); b.className='trk-tick'+(done?' on':''); b.textContent=done?'{{check}}':'';
  b.onclick=function(){ onToggle(!done); };
  row.appendChild(l); row.appendChild(b); return row;
}
function buildTrackerCard(){
  var d=trkLoad(); var td=trkToday();
  var nm=d.namaz[td]||{}; var nDone=Object.keys(nm).filter(function(k){return nm[k]}).length;
  var dh=d.dhikr[td]||{}; var dhDone=Object.keys(dh).filter(function(k){return dh[k]}).length;
  var box=document.createElement('div'); box.className='khatam-card';
  var score=Math.round(((nDone/5)*0.6+(dhDone/4)*0.2+((d.roza[td]?1:0)*0.2))*100);
  box.innerHTML='<div class="khatam-row"><b>{{bar_chart}} আজকের ট্র্যাকার</b><span>'+trkBn(score)+'%</span></div>'
    +'<div class="khatam-row"><span>{{mosque}} নামাজ '+trkBn(nDone)+'/৫</span><span>{{nights_stay}} রমজান '+(d.roza[td]?'{{check_circle:f}}':'{{hourglass_top}}')+'</span><span>{{bubble_chart}} জিকির '+trkBn(dhDone)+'/৪</span></div>'
    +'<div class="goal-track" style="margin:8px 0"><div class="goal-fill" style="width:'+score+'%"></div></div>'
    +'<div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">ট্র্যাকার খোলো →</span><span>সব ক্যাটাগরি এক জায়গায়</span></div>';
  box.onclick=function(){ if(typeof setMode==='function') setMode('tracker'); };
  return box;
}
function renderTracker(){
  if(typeof showOther==='function') showOther('{{bar_chart}} ট্র্যাকার');
  var d=trkLoad(); var td=trkToday();
  const appEl = document.getElementById('app');
  // overall
  var nm=d.namaz[td]||{}, nDone=Object.keys(nm).filter(function(k){return nm[k]}).length;
  var dh=d.dhikr[td]||{}, dhDone=Object.keys(dh).filter(function(k){return dh[k]}).length;
  var habitDone=d.habits.filter(function(h){ return h.days && h.days[td]; }).length;
  var head=document.createElement('div'); head.className='trk-head';
  var dateStr=new Date().toLocaleDateString('bn-BD',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  head.innerHTML='<small>'+dateStr+'</small><div class="big">আজকের আমল</div><div>{{mosque}} '+trkBn(nDone)+'/৫ নামাজ &nbsp;·&nbsp; {{nights_stay}} '+(d.roza[td]?'রমজান {{check_circle:f}}':'রমজান {{hourglass_top}}')+' &nbsp;·&nbsp; {{bubble_chart}} '+trkBn(dhDone)+'/৪ জিকির</div>';
  appEl.appendChild(head);

  // 1. NAMAZ
  var c1=document.createElement('div'); c1.className='trk-cat';
  c1.innerHTML='<h3>{{mosque}} নামাজ ট্র্যাকার</h3><div class="sub">আজ কোন ওয়াক্ত পড়লা, টিক দাও</div>';
  c1.appendChild(trkDots(function(ds){ var x=d.namaz[ds]||{}; return Object.keys(x).filter(function(k){return x[k]}).length>=5; }));
  var prayers=[['fajr','ফজর'],['dhuhr','যোহর'],['asr','আসর'],['maghrib','মাগরিব'],['isha','এশা']];
  prayers.forEach(function(p){
    c1.appendChild(trkRow('{{mosque}} '+p[1], '', !!(d.namaz[td]||{})[p[0]], function(v){
      d.namaz[td]=d.namaz[td]||{}; if(v) d.namaz[td][p[0]]=1; else delete d.namaz[td][p[0]]; trkSave(d); renderTracker();
      if(v && typeof showToast==='function') showToast(p[1]+' নামাজ');
    }));
  });
  var wk=document.createElement('div'); wk.className='trk-mini'; wk.style.marginTop='6px';
  var last7=0; for (let i=-6;i<=0;i++){ var x=d.namaz[trkDateOffset(i)]||{}; last7+=Object.keys(x).filter(function(k){return x[k]}).length; }
  wk.textContent='গত ৭ দিনে মোট '+trkBn(last7)+' ওয়াক্ত পড়া হয়েছে';
  c1.appendChild(wk); appEl.appendChild(c1);

  // 2. QURAN
  var c2=document.createElement('div'); c2.className='trk-cat';
  var todayRead=0; try{ todayRead=(typeof goalData!=='undefined' && goalData.date===td)?goalData.readKeys.length:0; }catch(e){}
  var kh=null; try{ kh=JSON.parse(localStorage.getItem('quranix_khatam')||'null'); }catch(e){}
  c2.innerHTML='<h3>{{menu_book}} কুরআন ট্র্যাকার</h3><div class="sub">আজ '+trkBn(todayRead)+' আয়াত পড়া হয়েছে'+(kh?' · খতম প্ল্যান চলছে ('+trkBn(kh.days)+' দিনের)':'')+'</div>';
  var goBtn=document.createElement('button'); goBtn.className='dl-btn'; goBtn.style.marginTop='6px'; goBtn.textContent='{{menu_book}} কুরআন পড়তে যাও';
  goBtn.onclick=function(){ if(typeof setMode==='function') setMode('quran'); };
  var khBtn=document.createElement('button'); khBtn.className='dl-btn ghost'; khBtn.style.marginTop='6px'; khBtn.style.marginLeft='6px'; khBtn.textContent='{{calendar_month}} খতম প্ল্যান দেখো';
  khBtn.onclick=function(){ if(typeof renderKhatamPopup==='function') renderKhatamPopup(); };
  c2.appendChild(goBtn); c2.appendChild(khBtn); appEl.appendChild(c2);

  // 3. HIFZ
  var c3=document.createElement('div'); c3.className='trk-cat';
  var mem={}; try{ mem=JSON.parse(localStorage.getItem('quranix_hifz_mem')||'{}'); }catch(e){}
  var memCount=Object.keys(mem).length;
  c3.innerHTML='<h3>{{psychology}} হিফজ ট্র্যাকার</h3><div class="sub">মোট মুখস্থ মার্ক করা আয়াত: <b>'+trkBn(memCount)+'টি</b></div><div class="trk-mini">নতুন আয়াত মুখস্থ করতে সূরা খুলে {{psychology}} হিফজ মোড চালু করো, মুখস্থ হলে {{check_circle:f}} মার্ক করো</div>';
  appEl.appendChild(c3);

  // 4. ROZA
  var c4=document.createElement('div'); c4.className='trk-cat';
  c4.innerHTML='<h3>{{nights_stay}} রমজান ট্র্যাকার</h3><div class="sub">নফল রমজান / কাজা রমজান — আজ রাখলে টিক দাও</div>';
  c4.appendChild(trkDots(function(ds){ return !!d.roza[ds]; }));
  var thisMonth=0; Object.keys(d.roza).forEach(function(ds){ if(ds.slice(0,7)===td.slice(0,7)) thisMonth++; });
  c4.appendChild(trkRow('{{nights_stay}} আজ রমজান রেখেছি', 'এই মাসে '+trkBn(thisMonth)+'টি রমজান', !!d.roza[td], function(v){ if(v) d.roza[td]=1; else delete d.roza[td]; trkSave(d); renderTracker(); }));
  appEl.appendChild(c4);

  // 5. DHIKR / AZKAR
  var c5=document.createElement('div'); c5.className='trk-cat';
  c5.innerHTML='<h3>{{bubble_chart}} জিকির ট্র্যাকার</h3><div class="sub">দৈনিক জিকির — সকাল / সন্ধ্যা / ঘুমের আগে</div>';
  c5.appendChild(trkDots(function(ds){ var x=d.dhikr[ds]||{}; return Object.keys(x).filter(function(k){return x[k]}).length>=4; }));
  var dz=[['morning','{{wb_sunny}} সকালের জিকির'],['evening','{{wb_twilight}} সন্ধ্যার জিকির'],['sleep','{{bedtime}} ঘুমের আগের দোয়া'],['durud','{{front_hand}} দুরুদ ১০০ বার']];
  dz.forEach(function(z){
    c5.appendChild(trkRow(z[1], '', !!(d.dhikr[td]||{})[z[0]], function(v){ d.dhikr[td]=d.dhikr[td]||{}; if(v) d.dhikr[td][z[0]]=1; else delete d.dhikr[td][z[0]]; trkSave(d); renderTracker(); }));
  });
  appEl.appendChild(c5);

  // 6. CUSTOM HABITS
  var c6=document.createElement('div'); c6.className='trk-cat';
  c6.innerHTML='<h3>{{star:f}} নিজের হ্যাবিট ট্র্যাকার</h3><div class="sub">নিজের মতো হ্যাবিট যোগ করো — যেমন পানি খাওয়া, ব্যায়াম, মিথ্যা না বলা, রাগ কন্ট্রোল ইত্যাদি</div>';
  c6.appendChild(trkDots(function(ds){ return d.habits.some(function(h){ return h.days && h.days[ds]; }); }));
  if(!d.habits.length){ var e=document.createElement('div'); e.className='trk-mini'; e.textContent='এখনো কোনো হ্যাবিট নেই — নিচে + দিয়ে যোগ করো'; c6.appendChild(e); }
  d.habits.forEach(function(h){
    var streak=0; for (let i=0;i<30;i++){ if(h.days && h.days[trkDateOffset(-i)]) streak++; else if(i>0) break; }
    var row=trkRow((h.icon||'{{star:f}}')+' '+h.name, 'স্ট্রিক: '+trkBn(streak)+' দিন', !!(h.days&&h.days[td]), function(v){ h.days=h.days||{}; if(v) h.days[td]=1; else delete h.days[td]; trkSave(d); renderTracker(); });
    // delete button
    var del=document.createElement('button'); del.textContent='{{delete}}'; del.style.cssText='border:0;background:none;font-size:var(--qx-fs-lg);cursor:pointer'; del.onclick=function(){ if(confirm('“'+h.name+'” হ্যাবিটটা মুছে ফেলবা?')){ d.habits=d.habits.filter(function(x){return x.id!==h.id}); trkSave(d); renderTracker(); } };
    row.appendChild(del); c6.appendChild(row);
  });
  var add=document.createElement('button'); add.className='dl-btn ghost'; add.style.marginTop='8px'; add.textContent='+ নিজের হ্যাবিট যোগ করো';
  add.onclick=function(){
    var name=prompt('হ্যাবিটের নাম কী? (যেমন: ব্যায়াম, ৮ গ্লাস পানি, রাগ কন্ট্রোল)');
    if(!name) return; var icon=prompt('একটা ইমোজি দাও (ঐচ্ছিক)', '')||'{{star:f}}';
    d.habits.push({id:Date.now(), name:name.trim(), icon:icon.trim(), days:{}}); trkSave(d); renderTracker();
    if(typeof showToast==='function') showToast('হ্যাবিট যোগ হয়েছে');
  };
  c6.appendChild(add); appEl.appendChild(c6);

  var note=document.createElement('div'); note.className='trk-mini'; note.style.textAlign='center'; note.style.margin='12px 0 30px';
  note.textContent='সব ট্র্যাকার ফোনেই সেভ থাকে — ব্যাকআপে সাথে যাবে না, তাই গুরুত্বপূর্ণ হলে স্ক্রিনশট রেখো';
  appEl.appendChild(note);
}
window.renderTracker=renderTracker; window.buildTrackerCard=buildTrackerCard;


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== TAJWEED COLOR CODE ===== */
(function(){
  var ON = localStorage.getItem('quranix_tajweed')==='1';
  window.tajweedOn = ON;
  function isComb(ch){ var c=ch.charCodeAt(0); return (c>=0x064B && c<=0x0652) || c===0x0670 || c===0x0653 || c===0x0654 || c===0x0655; }
  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // Split into clusters: base char + following combining marks
  function clusters(text){
    var out=[]; var cur='';
    for (let i=0;i<text.length;i++){ var ch=text[i]; if(isComb(ch) && cur){ cur+=ch; } else { if(cur) out.push(cur); cur=ch; } }
    if(cur) out.push(cur); return out;
  }
  function baseOf(cl){ return cl[0]; }
  function has(cl, code){ return cl.indexOf(code)>=0; }
  function renderTajweed(text){
    if(!text) return '';
    var cls=clusters(text);
    var IKHFA=['ت','ث','ج','د','ذ','ز','س','ش','ص','ض','ط','ظ','ف','ق','ك'];
    var IDGHAM=['ي','ر','م','ل','و','ن'];
    var QAL=['ق','ط','ب','ج','د'];
    var out='';
    for (let i=0;i<cls.length;i++){
      var cl=cls[i]; var b=baseOf(cl); var next = cls[i+1] ? baseOf(cls[i+1]) : '';
      var hasSukun = has(cl, '\u0652');
      var hasTanween = has(cl,'\u064B')||has(cl,'\u064C')||has(cl,'\u064D');
      var hasShadda = has(cl,'\u0651');
      var hasMadd = has(cl,'\u0653')||has(cl,'\u0670');
      var klass='';
      // Madd: madda sign OR long vowel with superscript alef
      if(hasMadd) klass='tj-madd';
      // Ghunnah: nun/mim mushaddad
      else if(hasShadda && (b==='ن'||b==='م')) klass='tj-ghunnah';
      // Qalqalah: qalb letters with sukun
      else if(hasSukun && QAL.indexOf(b)>=0) klass='tj-qalqalah';
      // Nun sakinah / tanween rules - look at next base letter
      else if((hasSukun||hasTanween) && b==='ن'){
        if(next==='ب') klass='tj-iqlab';
        else if(IDGHAM.indexOf(next)>=0) klass='tj-idgham';
        else if(IKHFA.indexOf(next)>=0) klass='tj-ikhfa';
      }
      // Tanween on other letters (e.g. ً on ا/ت etc) - same nun rules
      else if(hasTanween && next){
        if(next==='ب') klass='tj-iqlab';
        else if(IDGHAM.indexOf(next)>=0) klass='tj-idgham';
        else if(IKHFA.indexOf(next)>=0) klass='tj-ikhfa';
      }
      // Mim sakinah + ba = ikhfa shafawi (pink-ish: use ikhfa)
      else if(hasSukun && b==='م' && next==='ب') klass='tj-ikhfa';
      // Lam of Allah? keep default - skip to avoid false positives
      if(klass) out+='<span class="'+klass+'">'+esc(cl)+'</span>'; else out+=esc(cl);
    }
    return out;
  }
  window.renderTajweed=renderTajweed;
  function apply(){
    window.tajweedOn=ON;
    localStorage.setItem('quranix_tajweed', ON?'1':'0');
    document.querySelectorAll('.ayah .ar').forEach(function(el){
      var raw=el.dataset.raw||el.textContent;
      el.dataset.raw=raw;
      if(ON) el.innerHTML=renderTajweed(raw); else el.textContent=raw;
    });
    const leg = document.getElementById('tajweedLegend'); if(leg) leg.classList.toggle('show', ON);
    const tg = document.getElementById('tajweedToggle'); if(tg) tg.classList.toggle('on', ON);
    const mini = document.getElementById('gTajweedMini'); if(mini) mini.textContent=ON?'চালু ›':'বন্ধ ›';
    if(ON && typeof showToast==='function') showToast('তাজভিদ কালার চালু');
  }
  window.toggleTajweed=function(){ ON=!ON; apply(); };
  window.setTajweed=function(v){ ON=!!v; apply(); };
  // Tajweed Color shortcut is placed in the first quick-grid row.
  function addTajweedQuick(){
    const tools = document.getElementById('gQuick');
    if(!tools || document.getElementById('tajweedQuickToggle')) return;
    var b=document.createElement('button');
    b.id='tajweedQuickToggle'; b.className='g-quick-btn'; b.title='তাজভিদ কালার';
    b.innerHTML='{{palette}}<span>তাজভিদ কালার</span>';
    b.onclick=function(){ window.toggleTajweed(); };
    tools.appendChild(b);
    b.classList.toggle('on', ON);
  }
  addTajweedQuick(); setTimeout(addTajweedQuick, 700);
  // Keep the quick-grid button state synchronized with the setting.
  var oldApply=apply;
  apply=function(){ oldApply(); const quick = document.getElementById('tajweedQuickToggle'); if(quick) quick.classList.toggle('on', ON); };
  // Tajweed color remains available from the grid navigation quick row.
  const lc = document.getElementById('tajweedLegendClose');
  if(lc) lc.onclick=function(){ ON=false; apply(); };
  // Apply after surah loads (ayahCards render later)
  document.addEventListener('click', function(){ setTimeout(apply, 400); });
  setTimeout(apply, 800);
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== WORD-BY-WORD TRANSLATION ===== */
(function(){
  var ON = localStorage.getItem('quranix_ww')==='1';
  window.wwOn = ON;
  // Common words fallback dictionary (word without diacritics -> meaning)
  var DICT = {
    'الله':'আল্লাহ','الرحمن':'পরম করুণাময়','الرحيم':'অতি দয়ালু','رب':'প্রতিপালক','العالمين':'সব জগতের','مالك':'মালিক','يوم':'দিন','الدين':'বিচার / প্রতিদান','إياك':'শুধু তোমারই','نعبد':'আমরা ইবাদত করি','نستعين':'আমরা সাহায্য চাই','اهدنا':'আমাদের পথ দেখাও','الصراط':'পথ','المستقيم':'সোজা, সরল','الذين':'যারা','أنعمت':'তুমি অনুগ্রহ করেছ','عليهم':'তাদের উপর','المغضوب':'ক্রোধপ্রাপ্ত','الضالين':'পথভ্রষ্ট','قل':'বলো','هو':'তিনি','أحد':'এক, অদ্বিতীয়','الصمد':'অমুখাপেক্ষী','لم':'না, কখনো না','يلد':'জন্�্ম দেন','يولد':'জন্ম নেন','كفوا':'সমকক্ষ','من':'থেকে / যে','شر':'অনিষ্ট','ما':'যা','خلق':'সৃষ্টি করেছেন','الناس':'মানুষ','الفلق':'ভোর / ফেটে ওঠা','الناس':'মানুষ','ملك':'বাদশাহ','إله':'ইলাহ, উপাস্য','الوسواس':'কুমন্ত্রণাদাতা','الخناس':'আত্মগোপনকারী','صدور':'বুকসমূহ','الجنة':'জিন','الحمد':'সব প্রশংসা','لله':'আল্লাহর জন্য','الذي':'যিনি','كان':'ছিলেন','ما':'যা / না','في':'মধ্যে','إلى':'দিকে','على':'উপর','إن':'নিশ্চয়ই','أن':'যে','لا':'না','قد':'নিশ্চয়ই','كل':'সব','هذا':'এই','ذلك':'ওই','كان':'ছিল','قال':'বললেন','آمنوا':'ঈমান এনেছে','كفروا':'কুফরি করেছে','الذين':'যারা','رسول':'রাসূল','كتاب':'কিতাব','آية':'আয়াত / নিদর্শন','سماء':'আসমান','أرض':'জমিন','نار':'আগুন','جنة':'জান্নাত','ماء':'পানি','نور':'আলো','ظلمات':'অন্ধকার','حق':'সত্য','باطل':'মিথ্যা','صبر':'ধৈর্য','صلاة':'নামাজ','زكاة':'যাকাত','صوم':'রমজান','حج':'হজ','مؤمن':'মুমিন','كافر':'কাফের','ظالم':'জালিম','متقون':'মুত্তাকি','رحمة':'রহমত, দয়া','عذاب':'শাস্তি','مغفرة':'ক্ষমা','توبة':'তওবা','دعاء':'দোয়া','شكر':'কৃতজ্ঞতা','خير':'কল্যাণ','شر':'অকল্যাণ','حياة':'জীবন','موت':'মৃত্যু','آخرة':'আখিরাত','دنيا':'দুনিয়া','قلب':'অন্তর','علم':'জ্ঞান','عمل':'আমল','نفس':'আত্মা','روح':'রূহ'
  };
  function stripDiacritics(s){ return s.replace(/[\u064B-\u0652\u0670\u0653\u0654\u0655\u0671]/g,'').replace(/[\u0640]/g,'').trim(); }
  function dictLookup(word){
    var clean=stripDiacritics(word);
    if(DICT[clean]) return DICT[clean];
    // try removing prefixes: ال, و, ف, ب, ل, من
    var variants=[clean.replace(/^و?ال/,'ال'), clean.replace(/^ال/,'') , clean.replace(/^[وفبل]/,'')];
    for (let i=0;i<variants.length;i++){ if(DICT[variants[i]]) return DICT[variants[i]]; }
    return null;
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // Cache: ww:Surah:Ayah -> [{word, translit, meaning}]
  function cacheGet(s,a){ try{ return JSON.parse(localStorage.getItem('ww:'+s+':'+a)||'null'); }catch(e){ return null; } }
  function cacheSet(s,a,v){ try{ localStorage.setItem('ww:'+s+':'+a, JSON.stringify(v)); }catch(e){} }
  async function fetchWords(s,a){
    var cached=cacheGet(s,a); if(cached) return cached;
    try{
      var url='https://api.quran.com/api/v4/verses/by_key/'+s+':'+a+'?words=true&language=bn&word_fields=text_uthmani,transliteration';
      var r=await fetch(url); if(!r.ok) throw new Error('HTTP '+r.status);
      var j=await r.json(); var verse=j.verse||j;
      var words=verse.words||[];
      // Filter out end markers / pauses, keep real words
      var out=words.filter(function(w){ return w.char_type_name==='word'; }).map(function(w){
        var tr=''; if(w.transliteration) tr=w.transliteration.text||'';
        var mean=''; if(w.translation) mean=w.translation.text||'';
        // Quran.com word translation is often English when language=bn fails - keep it, fallback dict will override if English-looking? Keep as is
        return {word:w.text_uthmani||w.text, translit:tr, meaning:mean};
      });
      if(out.length) cacheSet(s,a,out);
      return out;
    }catch(e){ return null; }
  }
  window.quranixFetchWords=fetchWords;
  function renderAyahArabic(ar, surah, ayah){
    var base = (window.tajweedOn && window.renderTajweed) ? window.renderTajweed(ar) : esc(ar);
    // If WW off, return base (tajweed or plain)
    if(!ON) return base;
    // Split original Arabic by spaces, apply tajweed per word if on, wrap each word
    var words=String(ar).split(/\s+/);
    var html=words.map(function(w,i){
      var inner = (window.tajweedOn && window.renderTajweed) ? window.renderTajweed(w) : esc(w);
      return '<span class="ww-word" data-w="'+i+'" data-s="'+surah+'" data-a="'+ayah+'">'+inner+'</span>';
    }).join(' ');
    return html;
  }
  window.renderAyahArabic=renderAyahArabic;
  function apply(){
    window.wwOn=ON; localStorage.setItem('quranix_ww', ON?'1':'0');
    document.body.classList.toggle('ww-on', ON);
    const bar = document.getElementById('wwBar'); if(bar) bar.classList.toggle('show', ON);
    const tg = document.getElementById('wwToggle'); if(tg) tg.classList.toggle('on', ON);
    const mini = document.getElementById('gWwMini'); if(mini) mini.textContent=ON?'চালু ›':'বন্ধ ›';
    document.querySelectorAll('.ayah .ar').forEach(function(el){
      var raw=el.dataset.raw||el.textContent; el.dataset.raw=raw;
      el.innerHTML=renderAyahArabic(raw, parseInt(el.dataset.surah||0,10), parseInt(el.dataset.ayah||0,10));
    });
  }
  window.toggleWordMode=function(){ ON=!ON; apply(); if(ON && typeof showToast==='function') showToast('শব্দে শব্দে মোড চালু — যেকোনো শব্দে ট্যাপ করো'); };
  // Click delegation for words
  document.addEventListener('click', function(e){
    var w=e.target.closest('.ww-word'); if(!w) return;
    if(!ON) return;
    e.stopPropagation(); e.preventDefault();
    openWordSheet(w);
  });
  async function openWordSheet(el){
    var s=parseInt(el.dataset.s||0,10), a=parseInt(el.dataset.a||0,10), idx=parseInt(el.dataset.w||0,10);
    var wordText=el.textContent.trim();
    // close existing
    var old=document.querySelector('.ww-sheet'); if(old) old.remove();
    var sheet=document.createElement('div'); sheet.className='ww-sheet';
    sheet.innerHTML='<button class="ww-close" id="wwX">{{close}}</button><div class="ww-ar">'+esc(wordText)+'</div><div style="text-align:center;color:var(--qx-meta-color);font-size:var(--qx-fs-md)">সূরা '+s+' · আয়াত '+a+' · শব্দ '+(idx+1)+'</div><div id="wwBody" style="text-align:center;margin-top:10px">লোড হচ্ছে...</div>';
    document.body.appendChild(sheet);
    sheet.querySelector('#wwX').onclick=function(){ sheet.remove(); };
    var body=sheet.querySelector('#wwBody');
    // Try API first (has transliteration + meaning)
    var words= (s&&a) ? await fetchWords(s,a) : null;
    var entry = words && words[idx] ? words[idx] : null;
    var dictMean=dictLookup(wordText);
    var translit=entry&&entry.translit?entry.translit:'';
    var meaning=entry&&entry.meaning?entry.meaning:'';
    // If API meaning looks like English or empty, prefer dict
    if(!meaning || /^[A-Za-z]/.test(meaning)) { if(dictMean) meaning=dictMean; }
    if(!meaning) meaning='এই শব্দের বাংলা অর্থ ডাটাবেসে পাওয়া যায়নি — পুরো আয়াতের অনুবাদ দেখো।';
    var html='';
    if(translit) html+='<div style="font-size:var(--qx-fs-lg);color:var(--qx-main-color);font-weight:700">'+esc(translit)+'</div>';
    html+='<div style="font-size:20px;font-weight:700;margin:8px 0">'+esc(meaning)+'</div>';
    html+='<div style="font-size:var(--qx-fs-sm);color:var(--qx-meta-color)">{{lightbulb}} টিপস: এই শব্দটা মনে রাখতে পুরো আয়াতটা ৩ বার পড়ো, তারপর শুধু এই শব্দটা ৩ বার বলো।</div>';
    html+='<div style="margin-top:12px;display:flex;gap:8px"><button class="ac-btn ghost" id="wwPrev">← আগের শব্দ</button><button class="ac-btn" id="wwNext">পরের শব্দ →</button></div>';
    body.innerHTML=html;
    var prevBtn=body.querySelector('#wwPrev'), nextBtn=body.querySelector('#wwNext');
    // Find sibling words in same ayah card
    var card=el.closest('.ayah'); var all=card?Array.from(card.querySelectorAll('.ww-word')):[];
    if(prevBtn) prevBtn.onclick=function(){ sheet.remove(); if(idx>0 && all[idx-1]) openWordSheet(all[idx-1]); };
    if(nextBtn) nextBtn.onclick=function(){ sheet.remove(); if(idx<all.length-1 && all[idx+1]) openWordSheet(all[idx+1]); };
  }
  function addBtn(){
    const tools = document.getElementById('gQuick'); if(!tools||document.getElementById('wwToggle')) return;
    var b=document.createElement('button'); b.id='wwToggle'; b.className='g-quick-btn'; b.title='শব্দে শব্দে অনুবাদ'; b.innerHTML='{{abc}}<span>শব্দে শব্দে</span>';
    b.onclick=function(){ window.toggleWordMode(); };
    tools.insertBefore(b, tools.firstChild);
  }
  addBtn(); setTimeout(addBtn, 600);
  const bc =document.getElementById('wwBarClose'); if(bc) bc.onclick=function(){ ON=false; apply(); };
  document.addEventListener('click', function(){ setTimeout(function(){ if(ON) apply(); }, 400); });
  setTimeout(apply, 800);
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */



/* ===== HIJRI CALENDAR ===== */
(function(){
  var MONTHS_BN=['মুহাররম','সফর','রবিউল আউয়াল','রবিউল আখির','জুমাদাল উলা','জুমাদাল আখিরা','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'];
  var MONTHS_AR=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  function hijriParts(date){
    try{
      var fmt=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});
      var parts={}; fmt.formatToParts(date).forEach(function(p){ parts[p.type]=p.value; });
      return {day:parseInt(parts.day,10), month:parseInt(parts.month,10), year:parseInt(parts.year,10)};
    }catch(e){
      try{
        var fmt2=new Intl.DateTimeFormat('en-u-ca-islamic',{day:'numeric',month:'numeric',year:'numeric'});
        var p2={}; fmt2.formatToParts(date).forEach(function(p){ p2[p.type]=p.value; });
        return {day:parseInt(p2.day,10), month:parseInt(p2.month,10), year:parseInt(p2.year,10)};
      }catch(e2){ return null; }
    }
  }
  window.quranixHijriParts=hijriParts;
  function bnNum(n){ return (typeof toBn==='function'?toBn(n):String(n)); }
  function fmtGreg(d){ return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }
  function hijriStr(date){ var h=hijriParts(date); if(!h) return '—'; return bnNum(h.day)+' '+MONTHS_BN[h.month-1]+' '+bnNum(h.year)+' হিজরি'; }
  function findNextHijri(m, day){
    var today=new Date(); today.setHours(0,0,0,0);
    for (let i=0;i<400;i++){
      var d=new Date(today); d.setDate(d.getDate()+i);
      var h=hijriParts(d); if(h && h.month===m && h.day===day) return {date:d, days:i};
    }
    return null;
  }
  var EVENTS=[
    {m:1,d:1,ic:'event',name:'হিজরি নববর্ষ',desc:'নতুন হিজরি বছরের শুরু'},
    {m:1,d:10,ic:'wb_twilight',name:'আশুরা',desc:'মুহাররমের ১০ তারিখ — রোজা রাখা সুন্নত'},
    {m:3,d:12,ic:'auto_awesome',name:'ঈদে মিলাদুন্নবী ﷺ',desc:'নবী ﷺ-এর জন্মস্মরণ — জন্মতারিখ নিয়ে ঐতিহাসিক মতভেদ আছে'},
    {m:7,d:27,ic:'nights_stay',name:'লাইলাতুল মেরাজ',desc:'ইসরা ও মেরাজের স্মরণ — ২৭ রজব তারিখটি প্রমাণিত নয়'},
    {m:8,d:15,ic:'bedtime',name:'লাইলাতুল বরাত',desc:'১৫ শাবানের রাত — এর বিশেষ ফজিলত ও আমল নিয়ে আলেমদের মতভেদ আছে'},
    {m:9,d:1,ic:'calendar_month',name:'রমজান শুরু',desc:'রহমত, মাগফিরাত, নাজাতের মাস'},
    {m:9,d:27,ic:'stars',name:'লাইলাতুল কদর',desc:'শেষ দশকের বেজোড় রাতগুলোতে খুঁজুন — ২৭ তারিখ নিশ্চিত নয়'},
    {m:10,d:1,ic:'star',name:'ঈদুল ফিতর',desc:'রমজান শেষে ঈদ'},
    {m:12,d:9,ic:'wb_sunny',name:'আরাফার দিন',desc:'হজের মূল দিন — হিজরি ৯ জিলহজ'},
    {m:12,d:10,ic:'mosque',name:'ঈদুল আজহা',desc:'কুরবানির ঈদ'},
  ];
  // Concise, source-based notes. Where a date/virtue is disputed, the popup says so explicitly.
  var EVENT_INFO={
    'হিজরি নববর্ষ':{
      about:'১ মুহাররম হিজরি বর্ষপঞ্জির প্রথম দিন। এটি নতুন চন্দ্রবর্ষের সূচনা; দিনটিকে ঘিরে নির্দিষ্ট বিশেষ নামাজ, রোজা বা দোয়া সহিহ সূত্রে নির্ধারিত নয়।',
      quran:'আল্লাহর কাছে মাসের সংখ্যা বারো — সূরা আত-তাওবা ৯:৩৬।',
      hadith:'বছরের চারটি মাস সম্মানিত — সহিহ আল-বুখারি, ৪৬৬২; সহিহ মুসলিম, ১৬৭৯। তবে ১ মুহাররমের জন্য আলাদা ইবাদত নির্দিষ্ট করা হয়নি।',
      source:'কুরআন: আত-তাওবা ৯:৩৬। হাদিস: সহিহ আল-বুখারি ৪৬৬২; সহিহ মুসলিম ১৬৭৯।'
    },
    'আশুরা':{
      about:'১০ মুহাররমকে আশুরা বলা হয়। মূসা (আ.) ও বনী ইসরাঈলকে ফিরআউনের হাত থেকে মুক্তি দেওয়ার ঘটনার কৃতজ্ঞতায় রাসূল ﷺ এ দিনে রোজা রেখেছেন।',
      quran:'মূসা (আ.)-কে তাঁর সম্প্রদায়সহ সমুদ্র পার করানোর ঘটনা — সূরা আল-বাকারা ২:৫০; সূরা ইউনুস ১০:৯০–৯২। আয়াতগুলো ঘটনাটি বর্ণনা করে; আশুরার রোজার নির্দেশ হাদিসে এসেছে।',
      hadith:'আশুরার রোজায় আগের বছরের গুনাহ মোচনের আশা — সহিহ মুসলিম, ১১৬২। পরের বছর বেঁচে থাকলে ৯ তারিখেও রোজা রাখার ইচ্ছা রাসূল ﷺ প্রকাশ করেছিলেন — সহিহ মুসলিম, ১১৩৪।',
      source:'কুরআন: আল-বাকারা ২:৫০; ইউনুস ১০:৯০–৯২। হাদিস: সহিহ মুসলিম ১১৬২, ১১৩৪; সহিহ আল-বুখারি ২০০৪।'
    },
    'ঈদে মিলাদুন্নবী ﷺ':{
      about:'এ দিনটি অনেক মুসলিম নবী মুহাম্মদ ﷺ-এর জন্মস্মরণে পালন করেন। তবে ১২ রবিউল আউয়াল জন্মতারিখ হিসেবে সর্বসম্মতভাবে প্রমাণিত নয়; ঐতিহাসিক মতভেদ রয়েছে। এ উপলক্ষে নির্দিষ্ট বার্ষিক উৎসব পালনের নির্দেশ কুরআন বা সহিহ হাদিসে নেই।',
      quran:'রাসূল ﷺ-কে সমগ্র জগতের জন্য রহমত হিসেবে পাঠানো হয়েছে — সূরা আল-আম্বিয়া ২১:১০৭।',
      hadith:'সোমবারের রোজা সম্পর্কে রাসূল ﷺ বলেছেন, এ দিনেই তিনি জন্মগ্রহণ করেছেন এবং তাঁর ওপর ওহি নাজিল হয়েছে — সহিহ মুসলিম, ১১৬২। হাদিসটি সোমবারের রোজার প্রসঙ্গে; বার্ষিক জন্মোৎসবের নির্দেশ নয়।',
      source:'কুরআন: আল-আম্বিয়া ২১:১০৭। হাদিস: সহিহ মুসলিম ১১৬২।'
    },
    'লাইলাতুল মেরাজ':{
      about:'ইসরা হলো মসজিদুল হারাম থেকে মসজিদুল আকসা পর্যন্ত রাতের সফর; মেরাজে ঊর্ধ্বলোকে আরোহণের বিষয়টি মুসলিম ঐতিহ্যে বর্ণিত। ২৭ রজব তারিখটি নির্ভরযোগ্য সহিহ দলিলে নির্দিষ্ট নয়।',
      quran:'রাতের সফরের উল্লেখ — সূরা আল-ইসরা ১৭:১।',
      hadith:'মেরাজের ঘটনায় পাঁচ ওয়াক্ত সালাত ফরজ হওয়ার বিবরণ — সহিহ আল-বুখারি, ৩৪৯; সহিহ মুসলিম, ১৬২।',
      source:'কুরআন: আল-ইসরা ১৭:১। হাদিস: সহিহ আল-বুখারি ৩৪৯; সহিহ মুসলিম ১৬২।'
    },
    'লাইলাতুল বরাত':{
      about:'১৫ শাবানের রাতকে অনেকে লাইলাতুল বরাত বলেন। এ রাতের বিশেষ ফজিলত সম্পর্কে কিছু বর্ণনা আছে, কিন্তু সেগুলোর গ্রহণযোগ্যতা ও এ রাতে নির্দিষ্ট ইবাদতের বিধান নিয়ে মুহাদ্দিস ও আলেমদের মধ্যে মতভেদ রয়েছে।',
      quran:'কুরআনে ১৫ শাবানের রাতকে লাইলাতুল বরাত নামে নির্দিষ্ট করা হয়নি। সূরা আদ-দুখান ৪৪:৩-কে এ রাতের সঙ্গে যুক্ত করার ব্যাখ্যা প্রচলিত, তবে বহু মুফাসসির আয়াতটিকে লাইলাতুল কদরের সঙ্গে সম্পর্কিত করেছেন।',
      hadith:'১৫ শাবানের রাতের বর্ণনা — সুনান ইবন মাজাহ, ১৩৯০; এ বর্ণনার সনদ ও গ্রহণযোগ্যতা নিয়ে আলেমদের মতভেদ রয়েছে। এ রাতে নির্দিষ্ট ১০০ রাকাত বা বিশেষ পদ্ধতির নামাজের সহিহ প্রমাণ নেই।',
      source:'কুরআন: আদ-দুখান ৪৪:৩ (ব্যাখ্যায় মতভেদ)। হাদিস: সুনান ইবন মাজাহ ১৩৯০ (গ্রেডিং বিষয়ে মতভেদ)।'
    },
    'রমজান শুরু':{
      about:'রমজান ইসলামের নবম মাস। এ মাসে প্রাপ্তবয়স্ক, সক্ষম মুসলিমদের ওপর রোজা ফরজ; কুরআন নাজিলের সূচনাও এ মাসের সঙ্গে সম্পর্কিত।',
      quran:'রমজান মাসেই কুরআন নাজিল করা হয়েছে এবং তোমাদের মধ্যে যে এ মাস পাবে সে যেন রোজা রাখে — সূরা আল-বাকারা ২:১৮৩–১৮৫।',
      hadith:'ঈমান ও সওয়াবের আশায় রমজানের রোজা রাখলে পূর্বের গুনাহ ক্ষমার আশা — সহিহ আল-বুখারি, ১৯০১; সহিহ মুসলিম, ৭৬০।',
      source:'কুরআন: আল-বাকারা ২:১৮৩–১৮৫। হাদিস: সহিহ আল-বুখারি ১৯০১; সহিহ মুসলিম ৭৬০।'
    },
    'লাইলাতুল কদর':{
      about:'লাইলাতুল কদর এমন এক মহিমান্বিত রাত, যা হাজার মাসের চেয়েও উত্তম। এটি রমজানের শেষ দশকে খুঁজতে বলা হয়েছে; ২৭তম রাতেই নিশ্চিত—এমন কথা বলা যায় না।',
      quran:'লাইলাতুল কদর হাজার মাসের চেয়ে উত্তম — সূরা আল-কদর ৯৭:১–৫।',
      hadith:'রমজানের শেষ দশকের বেজোড় রাতগুলোতে লাইলাতুল কদর খুঁজতে নির্দেশ — সহিহ আল-বুখারি, ২০১৭; সহিহ মুসলিম, ১১৬৯।',
      source:'কুরআন: আল-কদর ৯৭:১–৫। হাদিস: সহিহ আল-বুখারি ২০১৭; সহিহ মুসলিম ১১৬৯।'
    },
    'ঈদুল ফিতর':{
      about:'১ শাওয়াল হলো রমজানের রোজা শেষের ঈদুল ফিতর। এ দিন মুসলিমরা ঈদের সালাত আদায় করেন এবং আল্লাহর দেওয়া রোজা পালনের তাওফিকের জন্য কৃতজ্ঞতা প্রকাশ করেন।',
      quran:'রোজার নির্ধারিত দিন পূর্ণ করা এবং আল্লাহর মহিমা ঘোষণা করার নির্দেশ — সূরা আল-বাকারা ২:১৮৫।',
      hadith:'ঈদের সালাতে যাওয়ার আগে রাসূল ﷺ বিজোড় সংখ্যক খেজুর খেতেন — সহিহ আল-বুখারি, ৯৫৩। ফিতরা ঈদের সালাতের আগে আদায়ের নির্দেশ — সহিহ আল-বুখারি, ১৫০৩।',
      source:'কুরআন: আল-বাকারা ২:১৮৫। হাদিস: সহিহ আল-বুখারি ৯৫৩, ১৫০৩।'
    },
    'আরাফার দিন':{
      about:'৯ জিলহজ হজের গুরুত্বপূর্ণ দিন। হাজিরা আরাফার ময়দানে অবস্থান করেন। যারা হজে নেই, তাদের জন্য এ দিনের রোজার বিশেষ ফজিলত বর্ণিত হয়েছে।',
      quran:'হজের বিধান ও আরাফা থেকে ফিরে আল্লাহকে স্মরণের উল্লেখ — সূরা আল-বাকারা ২:১৯৮।',
      hadith:'আরাফার দিনের রোজা আগের ও পরের বছরের গুনাহ মোচনের কারণ হবে বলে আশা — সহিহ মুসলিম, ১১৬২।',
      source:'কুরআন: আল-বাকারা ২:১৯৮। হাদিস: সহিহ মুসলিম ১১৬২।'
    },
    'ঈদুল আজহা':{
      about:'১০ জিলহজ ঈদুল আজহা। এ দিন ঈদের সালাতের পর সামর্থ্যবান মুসলিমরা কুরবানি করেন; এটি ইবরাহিম (আ.)-এর আনুগত্য ও আল্লাহর সন্তুষ্টির জন্য ত্যাগের স্মারক।',
      quran:'কুরবানির পশুর রক্ত-মাংস নয়, আল্লাহর কাছে পৌঁছে তাকওয়া — সূরা আল-হজ ২২:৩৪–৩৭।',
      hadith:'ঈদের সালাতের আগে কুরবানি করলে তা যথাযথ কুরবানি হয় না; সালাতের পর করলে সুন্নাহ অনুযায়ী হয় — সহিহ আল-বুখারি, ৫৫৪৫।',
      source:'কুরআন: আল-হজ ২২:৩৪–৩৭। হাদিস: সহিহ আল-বুখারি ৫৫৪৫।'
    }
  };
  var EVENT_LABELS={
    'হিজরি নববর্ষ':['পরিচিতি','কুরআনের আলোকে','হাদিসের বর্ণনা'],
    'আশুরা':['আশুরার তাৎপর্য','কুরআনে ঘটনার উল্লেখ','রাসূল ﷺ-এর সুন্নাহ'],
    'ঈদে মিলাদুন্নবী ﷺ':['দিনটির পরিচয়','কুরআনের দিকনির্দেশ','হাদিসে যা পাওয়া যায়'],
    'লাইলাতুল মেরাজ':['ইসরা ও মেরাজ','কুরআনের প্রমাণ','হাদিসের বিবরণ'],
    'লাইলাতুল বরাত':['রাতটির পরিচয়','কুরআনের ব্যাখ্যা','বর্ণিত হাদিস'],
    'রমজান শুরু':['রমজানের মাহাত্ম্য','কুরআনের নির্দেশ','নবী ﷺ-এর বাণী'],
    'লাইলাতুল কদর':['মহিমান্বিত রাত','কুরআনে লাইলাতুল কদর','হাদিসের নির্দেশনা'],
    'ঈদুল ফিতর':['ঈদের পরিচয়','কুরআনের নির্দেশনা','ঈদসংক্রান্ত হাদিস'],
    'আরাফার দিন':['আরাফার গুরুত্ব','কুরআনের উল্লেখ','রোজার ফজিলত'],
    'ঈদুল আজহা':['কুরবানির ঈদ','কুরআনের শিক্ষা','সুন্নাহর নির্দেশ']
  };
  var infoOverlay=null;
  function closeEventInfo(){ if(infoOverlay) infoOverlay.classList.remove('open'); }
  function ensureEventInfo(){
    if(infoOverlay) return infoOverlay;
    infoOverlay=document.createElement('div'); infoOverlay.className='hijri-info-overlay'; infoOverlay.setAttribute('role','presentation');
    infoOverlay.innerHTML='<section class="hijri-info-box" role="dialog" aria-modal="true" aria-labelledby="hijriInfoTitle"><button type="button" class="hijri-info-close" aria-label="বন্ধ করুন">×</button><div class="hijri-info-content"></div></section>';
    document.body.appendChild(infoOverlay);
    infoOverlay.addEventListener('click',function(e){ if(e.target===infoOverlay) closeEventInfo(); });
    infoOverlay.querySelector('.hijri-info-close').addEventListener('click',closeEventInfo);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape' && infoOverlay.classList.contains('open')) closeEventInfo(); });
    return infoOverlay;
  }
  function openEventInfo(ev,date){
    var data=EVENT_INFO[ev.name]; if(!data) return;
    var ov=ensureEventInfo(), content=ov.querySelector('.hijri-info-content');
    content.innerHTML='';
    function section(label,value,cls){ var wrap=document.createElement('div'); wrap.className='hijri-info-section'; var b=document.createElement('b'); b.textContent=label; var p=document.createElement('p'); if(cls) p.className=cls; p.textContent=value; wrap.appendChild(b); wrap.appendChild(p); content.appendChild(wrap); }
    var title=document.createElement('div'); title.className='hijri-info-title'; title.id='hijriInfoTitle'; title.textContent=ev.name; content.appendChild(title);
    var dt=document.createElement('div'); dt.className='hijri-info-date'; dt.textContent=(date?fmtGreg(date)+' · ':'')+bnNum(ev.d)+' '+MONTHS_BN[ev.m-1]; content.appendChild(dt);
    var labels=EVENT_LABELS[ev.name]||['পরিচিতি','কুরআনের উল্লেখ','হাদিসের বর্ণনা'];
    section(labels[0],data.about);
    section(labels[1],data.quran);
    section(labels[2],data.hadith);
    section('তথ্যসূত্র',data.source,'hijri-info-source');
    ov.classList.add('open');
    var close=ov.querySelector('.hijri-info-close'); if(close) close.focus();
  }
  function nextEvent(){
    var best=null;
    EVENTS.forEach(function(ev){
      var f=findNextHijri(ev.m, ev.d);
      if(f && (!best || f.days<best.days)) best={ev:ev, date:f.date, days:f.days};
    });
    return best;
  }
  function buildHijriCard(){
    var h=hijriParts(new Date()); var ne=nextEvent();
    var box=document.createElement('div'); box.className='khatam-card';
    box.innerHTML='<div class="khatam-row"><b>{{nights_stay}} হিজরি ক্যালেন্ডার</b><span>আজ</span></div>'
      +'<div style="text-align:center;font-size:var(--qx-fs-xl);font-weight:700;color:var(--qx-main-color)">'+(h?hijriStr(new Date()):'—')+'</div>'
      +(ne?'<div class="khatam-row"><span>{{hourglass_top}} পরের ইভেন্ট: <b>'+ne.ev.name+'</b></span><span>'+(ne.days===0?'আজই!':bnNum(ne.days)+' দিন বাকি')+'</span></div>':'')
      +'<div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">হিজরি ক্যালেন্ডার দেখো →</span><span>রমজান / ঈদ কবে?</span></div>';
    box.onclick=function(){ if(typeof setMode==='function') setMode('hijri'); };
    return box;
  }
  function renderHijri(){
    if(typeof showOther==='function') showOther('{{nights_stay}} হিজরি ক্যালেন্ডার');
    const appEl = document.getElementById('app');
    var h=hijriParts(new Date());
    if(!h){
      var unavailable=document.createElement('div'); unavailable.className='hijri-top';
      unavailable.textContent='এই ব্রাউজারে হিজরি ক্যালেন্ডার গণনা সমর্থিত নয়। আপডেটেড Chrome বা অন্য আধুনিক ব্রাউজারে চেষ্টা করুন।';
      appEl.appendChild(unavailable);
      return;
    }
    var top=document.createElement('div'); top.className='hijri-top';
    top.innerHTML='<small>আজ · '+fmtGreg(new Date())+'</small><div class="big">{{nights_stay}} '+hijriStr(new Date())+'</div>';
    appEl.appendChild(top);
    // Next event
    var ne=nextEvent();
    if(ne){
      var nx=document.createElement('div'); nx.className='hijri-event next hijri-upcoming';
      var C2=119.38, frac2=Math.min(ne.days,354)/354;
      var enNext = ne.date ? ne.date.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—';
      nx.innerHTML='<div class="he-side"><span class="he-ic">{{'+ne.ev.ic+'}}</span></div>'
        +'<div class="he-main"><b class="he-name">'+ne.ev.name+'</b><div class="trk-mini">'+ne.ev.desc+'</div><div class="he-date-en">'+enNext+'</div></div>'
        +'<div class="he-side"><div class="he-ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="he-track" cx="22" cy="22" r="19"/><circle class="he-arc" cx="22" cy="22" r="19" transform="translate(44,0) scale(-1,1) rotate(-90 22 22)" stroke-dasharray="'+C2+'" stroke-dashoffset="'+(C2*(1-frac2)).toFixed(2)+'"/></svg>'
        +'<span class="he-days">'+(ne.days===0?'আজই!':'<b>'+bnNum(ne.days)+'</b><small>দিন বাকি</small>')+'</span></div></div>';
      appEl.appendChild(nx);
    }
    // Month calendar
    var calHead=document.createElement('h3'); calHead.style.cssText='margin:14px 0 4px;color:var(--qx-main-color)'; calHead.textContent='{{calendar_month}} হিজরি মাস: '+MONTHS_BN[h.month-1]+' '+bnNum(h.year);
    appEl.appendChild(calHead);
    var cal=document.createElement('div'); cal.className='hijri-cal';
    var wd=['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি'];
    wd.forEach(function(w){ var d=document.createElement('div'); d.className='trk-mini'; d.style.textAlign='center'; d.textContent=w; cal.appendChild(d); });
    // Find start of Hijri month
    var start=new Date(); start.setHours(0,0,0,0);
    for (let i=0;i<35;i++){ var hh=hijriParts(start); if(hh && hh.day===1) break; start.setDate(start.getDate()-1); }
    // Offset for weekday
    var offset=start.getDay();
    for (let k=0;k<offset;k++){ cal.appendChild(document.createElement('div')); }
    // Days of month (until next month starts, max 30)
    var cur=new Date(start);
    for (let dnum=1; dnum<=30; dnum++){
      var hh2=hijriParts(cur); if(!hh2 || hh2.month!==h.month || hh2.year!==h.year) break;
      var cell=document.createElement('div'); cell.className='hijri-day'+(hh2.day===h.day?' today':'');
      var evToday=EVENTS.filter(function(ev){ return ev.m===hh2.month && ev.d===hh2.day; });
      if(evToday.length) cell.classList.add('event');
      cell.innerHTML='<div class="hnum">'+bnNum(hh2.day)+'</div><div style="margin-top:2px">'+cur.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+'</div>'+(evToday.length?'<div style="font-size:9px;color:var(--qx-event)">● '+evToday[0].name+'</div>':'');
      (function(evList, date){ if(evList.length){ cell.setAttribute('role','button'); cell.setAttribute('tabindex','0'); cell.setAttribute('aria-label',evList[0].name+' সম্পর্কে জানুন'); cell.onclick=function(){ openEventInfo(evList[0],date); }; cell.onkeydown=function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openEventInfo(evList[0],date); } }; } })(evToday, new Date(cur));
      cal.appendChild(cell);
      cur.setDate(cur.getDate()+1);
    }
    appEl.appendChild(cal);
    var note=document.createElement('div'); note.className='trk-mini'; note.style.textAlign='center'; note.textContent='আরবি মাসের তারিখ চাঁদ দেখার উপর নির্ভরশীল — রমজান / ঈদের চূড়ান্ত তারিখের জন্য স্থানীয় ঘোষণা দেখো।';
    appEl.appendChild(note);
    // All events sorted
    var evHead=document.createElement('h3'); evHead.style.cssText='margin:14px 0 4px;color:var(--qx-main-color)'; evHead.textContent='{{event}} গুরুত্বপূর্ণ আগামী দিনগুলো';
    appEl.appendChild(evHead);
    var sorted=EVENTS.map(function(ev){ var f=findNextHijri(ev.m, ev.d); return {ev:ev, date:f?f.date:null, days:f?f.days:999}; }).sort(function(a,b){ return a.days-b.days; });
    sorted.forEach(function(it){
      var row=document.createElement('div'); row.className='hijri-event hijri-upcoming'+(it.days===0?' next':'');
      var C=119.38, frac=Math.min(it.days,354)/354;
      var enDate = it.date ? it.date.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—';
      row.innerHTML='<div class="he-side"><span class="he-ic">{{'+it.ev.ic+'}}</span></div>'
        +'<div class="he-main"><b class="he-name">'+it.ev.name+'</b><div class="trk-mini">'+it.ev.desc+'</div><div class="he-date-en">'+enDate+'</div></div>'
        +'<div class="he-side"><div class="he-ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="he-track" cx="22" cy="22" r="19"/><circle class="he-arc" cx="22" cy="22" r="19" transform="translate(44,0) scale(-1,1) rotate(-90 22 22)" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-frac)).toFixed(2)+'"/></svg>'
        +'<span class="he-days">'+(it.days===0?'আজই!':'<b>'+bnNum(it.days)+'</b><small>দিন বাকি</small>')+'</span></div></div>';
      row.setAttribute('role','button'); row.setAttribute('tabindex','0'); row.setAttribute('aria-label',it.ev.name+' সম্পর্কে জানুন');
      row.onclick=function(){ openEventInfo(it.ev,it.date); };
      row.onkeydown=function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openEventInfo(it.ev,it.date); } };
      appEl.appendChild(row);
    });
    const mini = document.getElementById('gHijriMini'); if(mini) mini.textContent=h?hijriStr(new Date()).slice(0,12)+' ›':'›';
  }
  window.renderHijri=renderHijri; window.buildHijriCard=buildHijriCard; window.quranixHijri={hijriStr:hijriStr, nextEvent:nextEvent};
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


/* ===== PWA: install + service worker ===== */
(function(){
  var deferred = null;
  var installButton = document.getElementById('pwaInstallBtn');
  var bannerClose = document.getElementById('pwaBannerClose');
  var mini = document.getElementById('gPwaMini');
  var updateNoticeShown = false;

  window.quranixInstallAvailable = false;

  function isInstalled(){
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }

  function isBannerDismissed(){
    try { return localStorage.getItem('quranix_pwa_dismiss') === '1'; }
    catch(e) { return false; }
  }

  function showBanner(){
    var banner = document.getElementById('pwaBanner');
    if (banner && !isInstalled() && !isBannerDismissed()) {
      banner.style.display = '';
      banner.classList.add('show');
    }
  }

  function hideBanner(){
    var banner = document.getElementById('pwaBanner');
    if (banner) banner.classList.remove('show');
  }

  function setInstallAvailability(value){
    window.quranixInstallAvailable = !!value;
  }

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferred = event;
    setInstallAvailability(true);
    showBanner();
  });

  window.addEventListener('appinstalled', function(){
    deferred = null;
    setInstallAvailability(false);
    hideBanner();
    if (typeof showToast === 'function') showToast('Quranix ইনস্টল হয়েছে');
  });

  if (installButton) installButton.onclick = function(){ doInstall(); };
  if (bannerClose) bannerClose.onclick = function(){
    hideBanner();
    try { localStorage.setItem('quranix_pwa_dismiss', '1'); } catch(e) {}
  };

  async function doInstall(){
    if (isInstalled()) {
      if (typeof showToast === 'function') showToast('Quranix ইতিমধ্যে ইনস্টল করা আছে');
      return;
    }

    if (deferred) {
      var promptEvent = deferred;
      deferred = null;
      setInstallAvailability(false);
      try {
        await promptEvent.prompt();
        var choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          hideBanner();
        } else if (typeof showToast === 'function') {
          showToast('ইনস্টল বাতিল করা হয়েছে');
        }
      } catch(error) {
        if (typeof showToast === 'function') showToast('ইনস্টল প্রম্পট খোলা যায়নি; ব্রাউজার মেনু ব্যবহার করুন');
      }
      return;
    }

    var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var isAndroid = /Android/i.test(navigator.userAgent);
    if (isIOS) {
      alert('iPhone বা iPad-এ Safari খুলে Share → Add to Home Screen → Add নির্বাচন করুন।');
    } else if (isAndroid) {
      alert('Chrome-এর ⋮ মেনু → Install app / Add to Home screen নির্বাচন করুন।');
    } else {
      alert('PC-তে Chrome বা Edge-এর address bar-এর Install আইকন, অথবা মেনু → Install Quranix নির্বাচন করুন।');
    }
  }

  window.quranixInstall = doInstall;

  // Service workers require an eligible secure origin; file:// preview is intentionally skipped.
  if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(function(registration){
        console.log('Quranix service worker registered');

        if (registration && typeof registration.update === 'function') {
          registration.update().catch(function(error){
            console.warn('Quranix service worker update check failed', error);
          });
        }

        if (registration && registration.waiting && !updateNoticeShown) {
          updateNoticeShown = true;
          if (typeof showToast === 'function') showToast('Quranix-এর নতুন আপডেট প্রস্তুত। রিফ্রেশ করলে চালু হবে।');
        }

        registration.addEventListener('updatefound', function(){
          var installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function(){
            if (installing.state === 'installed' && navigator.serviceWorker.controller && !updateNoticeShown) {
              updateNoticeShown = true;
              if (typeof showToast === 'function') showToast('Quranix-এর নতুন আপডেট প্রস্তুত। রিফ্রেশ করলে চালু হবে।');
            }
          });
        });
      }).catch(function(error){
        console.warn('Quranix service worker registration failed', error);
      });
    });
  }

  if (mini) mini.textContent = isInstalled() ? 'ইনস্টল করা ›' : '›';
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


// PHASE 1 - Reliability Fixes (matching only)
(function(){
  // 1.1 Full Reset: remove Quranix-owned data only; leave unrelated origin data intact.
  window.qxFullReset = async function(){
    let complete = true;
    if(typeof window.qxCancelActivePackageJob === 'function') window.qxCancelActivePackageJob();
    if(typeof window.qxCloseOfflineAudioConnections === 'function') window.qxCloseOfflineAudioConnections();
    if(typeof window.qxCloseOfflineContentConnections === 'function') window.qxCloseOfflineContentConnections();

    const dbs = ['quranix-audio','quranix-content'];
    for(const name of dbs){
      try{
        if(window.indexedDB && indexedDB.deleteDatabase){
          await new Promise((resolve,reject) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error || new Error('IndexedDB delete failed'));
            request.onblocked = () => reject(new Error('IndexedDB delete blocked'));
          });
        }
      }catch(e){
        complete = false;
      }
    }

    // Quranix's named settings/progress keys plus its namespaced caches.
    const quranixKeys = new Set([
      'bm','saved','last','notes','goal','tasbih','loc','asr','calcMethod','tzMode','dstAdd',
      'prayerAlerts','edition','reciter','fs','theme','appPrefs','audioSpeedIdx',
      'autoPlayNext','tafsirId'
    ]);
    try{
      const keys = [];
      for(let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        if(key && (quranixKeys.has(key) || key.startsWith('quranix_') || key.startsWith('c:') || key.startsWith('ww:'))){
          keys.push(key);
        }
      }
      for(const key of keys) localStorage.removeItem(key);
    }catch(e){
      complete = false;
    }

    // No Quranix code uses sessionStorage today; remove only future/past namespaced entries.
    try{
      const keys = [];
      for(let i = 0; i < sessionStorage.length; i++){
        const key = sessionStorage.key(i);
        if(key && key.startsWith('quranix_')) keys.push(key);
      }
      for(const key of keys) sessionStorage.removeItem(key);
    }catch(e){
      complete = false;
    }

    // Preserve caches belonging to other apps on the same origin.
    if(window.caches){
      try{
        const keys = await caches.keys();
        for(const key of keys){
          if(!/^quranix(?:[-_]|$)/i.test(key)) continue;
          try{
            const deleted = await caches.delete(key);
            if(!deleted) complete = false;
          }catch(e){
            complete = false;
          }
        }
      }catch(e){
        complete = false;
      }
    }
    return complete;
  };

  // 1.2 PWA dismiss: read on load
  try{
    const dismissed = localStorage.getItem('quranix_pwa_dismiss');
    if (dismissed === '1'){
      const banner = document.getElementById('pwaBanner');
      if (banner) banner.style.display = 'none';
      // The PWA module already owns the close-button listener.
    }
  }catch(e){}


  // 1.5 Home search controls stay hidden; the header search button opens the search popup (grid popup script).
  try{
    const header = document.querySelector('header');
    const qEl = document.getElementById('q');
    const controls = document.getElementById('controls');
    if(header && controls && header.contains(controls)) header.parentNode.insertBefore(controls, header.nextSibling);
    if(header && qEl && header.contains(qEl) && controls) controls.prepend(qEl);
    if(controls) controls.style.display = 'none';
  }catch(e){}

  // 1.6 Asset fallback: use the browser font-loading API instead of measuring text width.
  try{
    if(document.fonts && typeof document.fonts.load === 'function'){
      document.fonts.load('20px "MSLocal"', 'search').then(function(fontList){
        const localAvailable = fontList.length > 0 && document.fonts.check('20px "MSLocal"', 'search');
        if(!localAvailable) document.body.classList.add('no-icon-font');
      }).catch(function(){ document.body.classList.add('no-icon-font'); });
    }
  }catch(e){}

})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


// PHASE 3 - Accessibility + Responsive
(function(){
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      const dd = document.getElementById('gridDropdown');
      if (dd) dd.style.display = 'none';
    }
  });
  try{
    const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const syncReducedMotion = function(){
      const userPreference = typeof appPrefs !== 'undefined' && !!appPrefs.reducedMotion;
      document.documentElement.toggleAttribute('data-reduced-motion', userPreference || !!(motionQuery && motionQuery.matches));
    };
    syncReducedMotion();
    if(motionQuery){
      if(typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', syncReducedMotion);
      else if(typeof motionQuery.addListener === 'function') motionQuery.addListener(syncReducedMotion);
    }
    window.qxSyncReducedMotion = syncReducedMotion;
  }catch(e){}
  document.querySelectorAll('.ar, .ar-name, .aotd-ar').forEach(function(el){
    if (!el.getAttribute('dir')) el.setAttribute('dir','rtl');
    if (!el.getAttribute('lang')) el.setAttribute('lang','ar');
  });
  const logo = document.querySelector('.app-logo');
  if (logo && !logo.getAttribute('alt')) logo.setAttribute('alt','Quranix লোগো');
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


(function(){
  var rp = document.getElementById("readerProgress");
  if(rp && rp.parentNode !== document.body) document.body.appendChild(rp);
  var homeBtn = document.getElementById("navHome");
  if(homeBtn) homeBtn.addEventListener("click", function(){
    if(typeof window.goHome === "function") window.goHome();
  });
})();


/* ===== MAIN.JS - Baki sob ekhane: namaz, tracker, khatam, hifz, grid, hijri, tajweed, etc ===== */


(function(){
  var K='quranix_readwide', b=document.body, btn=document.getElementById('widthToggle');
  if(!btn) return;
  function apply(w){ b.classList.toggle('read-wide', w); btn.setAttribute('aria-pressed', w?'true':'false'); }
  var w=false; try{ w = localStorage.getItem(K)==='1'; }catch(e){}
  apply(w);
  btn.onclick=function(){ w=!w; apply(w); try{ localStorage.setItem(K, w?'1':'0'); }catch(e){} };
})();
