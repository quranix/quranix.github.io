/* js/apps.js
   WHAT IT IS: tools and settings. Prayer times, qibla, tasbih, dua, settings, hifz, khatam,
   image card, tracker, tajweed, word by word, hijri calendar, and install (PWA).
   LOADS LAST: it runs after js/quran.js and uses names from that file.

   EDIT RULES
   1. Keep the code formatted and readable. Do not minify.
   2. Change a function where it is. Do not keep the old one and add a new one with the same name.
   3. Some blocks run as soon as the file loads. Keep their order. Do not move blocks up or down.
   4. Do not change the script order in index.html. This file must stay last.
   5. After any change, raise the CACHE number in sw.js (example: quranix-v23 to quranix-v24).

   LOAD ORDER: quran-data.js, data/topics.js, data/dictionary.js, data/district.js, js/quran.js, js/apps.js
*/

// SECTION INDEX (search: "[NAME] start"). Blocks keep their original order (EDIT RULES #3).
//   [NAV: setMode / nav highlight / showOther]
//   [DATA: Ramadan, Kalima, QX_SECTIONS + qxRow]
//   [PAGE-TOOLS: grid/list + card show/hide sheet]
//   [PAGE: More]
//   [PAGE: Section (generic list pages)]
//   [PAGE: Saved (+ sheet/confirm helpers)]
//   [PRAYER-CALC: methods, cities, times, adhan, alerts]
//   [PAGE: Qibla]
//   [PAGE: Prayer Alerts]
//   [DATA: Namaz-e-Nabvi chapters]
//   [PAGE: Prayer Learn (Namaz Shikkha)]
//   [PRAYER-FLIP-CLOCK + tick sound]
//   [PAGE: Prayer]
//   [PAGE: Tasbih (+ duaTabs)]
//   [PAGE: Dua (+ DUAS data)]
//   [APP-PREFS: header wiring, font size, theme toggle, applyAppPrefs, online/offline toasts]
//   [BACK-NAVIGATION: back button, popstate, qxNav, openSurah/openJuz wrappers]
//   [GESTURES: swipe, pull-to-refresh, long-press]
//   [ANDROID-BACK (Capacitor)]
//   [UTILS: escape, clean data, timezone, ISO date]
//   [BACKUP-RESTORE: export, import, reset]
//   [MODAL: Help]
//   [MODAL: Settings]
//   [PRAYER-ALERT-CHECK (+ 5s timer)]
//   [APP-INIT (restore view/nav)]
//   [MORE-MENU + POPUPS: grid menu, search, filters, settings popups, home hero]
//   [BARS-AUTO-HIDE on scroll]
//   [HIFZ-MODE]
//   [KHATAM-PLANNER]
//   [AYAH-IMAGE-CARD]
//   [TRACKER]
//   [TAJWEED]
//   [WORD-BY-WORD]
//   [HIJRI-CALENDAR]
//   [PWA: install + service worker]
//   [FULL-RESET (qxFullReset)]
//   [KEYBOARD: Escape closes overlays]
//   [READER-PROGRESS bar placement]
//   [READ-WIDTH toggle (widthToggle)]
//   [QUICK-ACTIONS-BN: Bengali names + DOMContentLoaded apply]

// [NAV: setMode / nav highlight / showOther] start
/* ===== নামাজের সময়, তাসবিহ, দোয়া ===== */
function qxNavHighlight(m){
  const isHome = m === "quran" && tab === "home";
  const homeButton = document.getElementById("navHome");
  if (homeButton) {
    homeButton.classList.toggle("on", isHome);
    if (isHome) homeButton.setAttribute("aria-current", "page");
    else homeButton.removeAttribute("aria-current");
  }
  document.querySelectorAll("#nav button[data-m]").forEach(b => b.classList.toggle("on", !isHome && (b.dataset.m === m || (m === "tasbih" && b.dataset.m === "dua") || ((m === "tracker" || m === "saved" || m === "dict" || m === "hadith" || m === "asma") && b.dataset.m === "more"))));
}
function setMode(m){
  mode = m; qEl.value = "";
  qxNavHighlight(m);
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
    return qxIco(name, filled);
  });
  backBtn.style.display = "none";
  controls.style.display = "none";
  qEl.style.display = "none";
  navEl.style.display = "flex";
  updateAudioBarPos();
  app.innerHTML = "";
  window.scrollTo(0,0);
}
// [NAV: setMode / nav highlight / showOther] end

// [DATA: Ramadan, Kalima, QX_SECTIONS + qxRow] start
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
  ramadan: { icon: "i_ramadan", title: "রমজান", sub: "রোজা ও রমজানের আমল" },
  kalima: { icon: "i_kalima", title: "কালিমা", sub: "ঈমানের ঘোষণা" },
  hajj: { icon: "i_hajj", title: "হজ্জ", sub: "হজ্জের পরিচিতি" },
  zakat: { icon: "i_zakat", title: "যাকাত", sub: "যাকাতের পরিচিতি" },
  books: { icon: "edit_note", title: "বই ও অনুচ্ছেদ", sub: "বই ও লেখা" }
};
function qxRow(icon, title, sub, onclick){
  const b = mk("button", "qx-row");
  b.type = "button";
  b.innerHTML = '<span class="qx-row-ic">{{' + icon + '}}</span><span class="qx-row-tx"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="qx-row-go">{{chevron_right}}</span>';
  b.onclick = onclick;
  return b;
}
// [DATA: Ramadan, Kalima, QX_SECTIONS + qxRow] end
// [PAGE-TOOLS: grid/list + card show/hide sheet] start
/* ===== পেজ টুলবার (হোম ও "আরও" পেজ): গ্রিড/লিস্ট + কার্ড দেখানো/লুকানো + কার্ড সাজানো =====
   পছন্দ localStorage-এ সেভ থাকে, রিফ্রেশ দিলেও থাকে। প্রতিটা পেজের নিজস্ব সেভ:
     ভিউ:   quranix_view_home / quranix_view_more   ("grid" = ডিফল্ট, "list")
     কার্ড: quranix_cards_home / quranix_cards_more  ({ order: [id...], hidden: [id...] })
   qxPageTools(page, groups, onChange) টুলবার বানায়; groups = [{ title, items: [{ id, title, icon }] }] (ডিফল্ট ক্রমে; icon ঐচ্ছিক) */
const QX_VIEW_KEY = { home: "quranix_view_home", more: "quranix_view_more" };
const QX_CARDS_KEY = { home: "quranix_cards_home", more: "quranix_cards_more" };
const QX_DASH_EDIT_PATH = "M11,11V4H22v7H11ZM2,20V13H12v7H2Zm0-9V4H9v7H2ZM13,9h7V6H13V9ZM4,18h6V15H4v3ZM4,9H7V6H4V9Zm9,0Zm-3,6ZM7,9Zm7,13V18.93l5.53-5.5q0.22-0.22 0.5-0.32T20.58,13q0.3,0 0.57,0.11q0.27,0.11 0.5,0.34l0.93,0.93q0.22,0.22 0.32,0.5T23,15.43t-0.1,0.56T22.58,16.5L17.08,22H14Zm7.5-6.58L20.58,14.5l0.92,0.92Zm-6,5.08h0.95l3.03-3.05l-0.45-0.47l-0.48-0.45L15.5,19.55V20.5Zm3.53-3.52l-0.48-0.45l0.93,0.93l-0.45-0.47Z";
function qxPageView(page){
  try{ return localStorage.getItem(QX_VIEW_KEY[page]) === "list" ? "list" : "grid"; }catch(e){ return "grid"; }
}
function qxPageCfg(page){
  try{
    const c = JSON.parse(localStorage.getItem(QX_CARDS_KEY[page]) || "{}") || {};
    return { order: Array.isArray(c.order) ? c.order : [], hidden: Array.isArray(c.hidden) ? c.hidden : [] };
  }catch(e){ return { order: [], hidden: [] }; }
}
function qxPageCfgSave(page, cfg){
  try{ localStorage.setItem(QX_CARDS_KEY[page], JSON.stringify(cfg)); }catch(e){}
}
/* items = [{id,...}] ডিফল্ট ক্রমে → { all: সাজানো (লুকানোসহ), visible: সাজানো (লুকানো বাদে) } */
function qxPageArrange(page, items){
  const c = qxPageCfg(page);
  const pos = (id) => { const i = c.order.indexOf(id); return i < 0 ? 1e6 + items.findIndex(x => x.id === id) : i; };
  const all = items.slice().sort((a, b) => pos(a.id) - pos(b.id));
  return { all: all, visible: all.filter(x => c.hidden.indexOf(x.id) < 0) };
}
function qxOpenCardSheet(page, groups, onChange){
  if (document.querySelector(".qx-de-ov")) return;
  const pn = ({ home: "হোম", more: "আরও" })[page] || "";
  const bnNum = (n) => (typeof toBn === "function" ? toBn(n) : String(n));
  const ov = document.createElement("div"); ov.className = "ac-ov qx-de-ov"; ov.style.zIndex = "130";
  const box = document.createElement("div"); box.className = "ac-box qx-de-box";
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "ড্যাশবোর্ড সাজান");
  ov.appendChild(box); document.body.appendChild(ov);
  const onKey = (e) => {
    if (!ov.isConnected) { document.removeEventListener("keydown", onKey); return; }
    if (e.key === "Escape") { e.preventDefault(); close(); }
  };
  const close = () => { document.removeEventListener("keydown", onKey); ov.remove(); };
  document.addEventListener("keydown", onKey);
  ov.onclick = (e) => { if (e.target === ov) close(); };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const icoHtml = (it) => (it.icon ? qxIco(it.icon) : "");
  const changed = (focusId) => { try{ onChange(); }catch(e){} draw(focusId); };

  /* একটা গ্রুপের দেখানো আইটেমের নতুন ক্রম সেভ: বাকিগুলো লুকানো তালিকায় যায় */
  function applyGroup(gi, shownIds, focusId){
    const all = groups[gi].items.map(x => x.id);
    const hid = all.filter(id => shownIds.indexOf(id) < 0);
    const c = qxPageCfg(page);
    c.order = c.order.filter(id => all.indexOf(id) < 0).concat(shownIds, hid);
    c.hidden = c.hidden.filter(id => all.indexOf(id) < 0).concat(hid);
    qxPageCfgSave(page, c); changed(focusId);
  }
  const shownOf = (gi) => qxPageArrange(page, groups[gi].items).visible.map(x => x.id);

  function startDrag(e, row, list, gi){
    if (e.button != null && e.button > 0) return;
    e.preventDefault();
    const grip = e.currentTarget;
    try{ grip.setPointerCapture(e.pointerId); }catch(_){}
    row.classList.add("dragging");
    const move = (ev) => {
      const y = ev.clientY, br = box.getBoundingClientRect();
      if (y < br.top + 50) box.scrollTop -= 12; else if (y > br.bottom - 50) box.scrollTop += 12;
      let before = null;
      const sibs = list.querySelectorAll(".qx-de-row:not(.dragging)");
      for (let i = 0; i < sibs.length; i++) {
        const r = sibs[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) { before = sibs[i]; break; }
      }
      if (before) { if (row.nextElementSibling !== before) list.insertBefore(row, before); }
      else if (list.lastElementChild !== row) list.appendChild(row);
    };
    const up = () => {
      grip.removeEventListener("pointermove", move); grip.removeEventListener("pointerup", up); grip.removeEventListener("pointercancel", up);
      row.classList.remove("dragging");
      applyGroup(gi, Array.prototype.map.call(list.querySelectorAll(".qx-de-row"), r => r.dataset.id));
    };
    grip.addEventListener("pointermove", move); grip.addEventListener("pointerup", up); grip.addEventListener("pointercancel", up);
  }

  function draw(focusId){
    const top = box.scrollTop; box.innerHTML = "";
    const head = el("div", "qx-de-head");
    const ttlWrap = el("div", "qx-de-ttl");
    ttlWrap.appendChild(el("h3", null, "ড্যাশবোর্ড সাজান"));
    ttlWrap.appendChild(el("p", null, (pn ? pn + " পেজে" : "পেজে") + " যা দেখতে চান বেছে নিন"));
    const reset = el("button", "qx-de-reset"); reset.type = "button"; reset.innerHTML = qxIco("refresh") + "<span>ডিফল্ট</span>";
    reset.onclick = () => { qxPageCfgSave(page, { order: [], hidden: [] }); changed(); };
    head.append(ttlWrap, reset); box.appendChild(head);

    const arranged = groups.map((g, gi) => qxPageArrange(page, g.items));
    const totalShown = arranged.reduce((n, a) => n + a.visible.length, 0);
    const hiddenAll = [];
    arranged.forEach((a, gi) => a.all.forEach(it => { if (a.visible.indexOf(it) < 0) hiddenAll.push({ gi: gi, it: it }); }));

    const sec1 = el("div", "qx-de-sec");
    sec1.append(el("span", null, (page === "home" ? "হোমে" : (pn ? pn + " পেজে" : "পেজে")) + " দেখাচ্ছে"), el("span", null, bnNum(totalShown) + "টি"));
    box.appendChild(sec1);
    const card = el("div", "qx-de-card");
    if (!totalShown) card.appendChild(el("div", "qx-de-empty", "কিছুই দেখানো হচ্ছে না। নিচ থেকে যোগ করুন।"));
    arranged.forEach((a, gi) => {
      if (!a.visible.length) return;
      if (groups.length > 1) card.appendChild(el("div", "qx-de-gt", groups[gi].title));
      const list = el("div", "qx-de-list");
      a.visible.forEach((it, i) => {
        const row = el("div", "qx-de-row"); row.dataset.id = it.id;
        const grip = el("button", "qx-de-grip"); grip.type = "button";
        grip.setAttribute("aria-label", it.title + " — সরাতে টেনে ধরুন, কিবোর্ডে ওপর-নিচ তীর চাপুন");
        grip.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>";
        grip.addEventListener("pointerdown", (e) => startDrag(e, row, list, gi));
        grip.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const ids = shownOf(gi), idx = ids.indexOf(it.id), j = idx + (e.key === "ArrowUp" ? -1 : 1);
          if (j < 0 || j >= ids.length) return;
          const tmp = ids[idx]; ids[idx] = ids[j]; ids[j] = tmp;
          applyGroup(gi, ids, it.id);
        });
        const num = el("span", "qx-de-num", bnNum(i + 1));
        const ic = el("span", "qx-de-ic"); ic.innerHTML = icoHtml(it);
        const name = el("span", "qx-de-name", it.title);
        const rm = el("button", "qx-de-rm"); rm.type = "button"; rm.setAttribute("aria-label", it.title + " সরান"); rm.innerHTML = qxIco("close");
        rm.onclick = () => applyGroup(gi, shownOf(gi).filter(id => id !== it.id));
        row.append(grip, num, ic, name, rm); list.appendChild(row);
      });
      card.appendChild(list);
    });
    box.appendChild(card);

    const sec2 = el("div", "qx-de-sec");
    sec2.append(el("span", null, "যোগ করতে পারেন"), el("span", null, bnNum(hiddenAll.length) + "টি"));
    box.appendChild(sec2);
    const addGrid = el("div", "qx-de-add");
    if (!hiddenAll.length) addGrid.appendChild(el("div", "qx-de-empty", "সবকিছুই যোগ করা আছে।"));
    hiddenAll.forEach(h => {
      const b = el("button", "qx-de-addcard"); b.type = "button"; b.setAttribute("aria-label", h.it.title + " যোগ করুন");
      const ic = el("span", "qx-de-ic"); ic.innerHTML = icoHtml(h.it);
      const plus = el("span", "qx-de-plus"); plus.innerHTML = qxIco("add");
      b.append(ic, el("span", "qx-de-name", h.it.title), plus);
      b.onclick = () => applyGroup(h.gi, shownOf(h.gi).concat([h.it.id]));
      addGrid.appendChild(b);
    });
    box.appendChild(addGrid);

    const foot = el("div", "ac-row");
    const done = el("button", "ac-btn"); done.type = "button"; done.textContent = "সম্পন্ন"; done.onclick = close;
    foot.appendChild(done); box.appendChild(foot);

    box.scrollTop = top;
    if (focusId) { const g = box.querySelector('.qx-de-row[data-id="' + String(focusId).replace(/"/g, '\\"') + '"] .qx-de-grip'); if (g) g.focus(); }
  }
  draw();
}
function qxPageTools(page, groups, onChange){
  const bar = document.createElement("div"); bar.className = "qx-page-tools"; bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", "কার্ড ভিউ ও কাস্টমাইজ");
  const mkBtn = (html, label, fn) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "qx-tool-btn";
    b.setAttribute("aria-label", label); b.title = label; b.innerHTML = html; b.onclick = fn;
    return b;
  };
  const view = qxPageView(page);
  const next = view === "grid" ? "list" : "grid";
  /* গ্রিড দেখালে লিস্ট আইকন, লিস্ট দেখালে গ্রিড আইকন (পরের ভিউয়ের আইকন) */
  bar.appendChild(mkBtn(qxIco(next === "grid" ? "grid_view" : "view_list"), next === "grid" ? "গ্রিড ভিউ" : "লিস্ট ভিউ", () => {
    try{ localStorage.setItem(QX_VIEW_KEY[page], next); }catch(e){}
    onChange();
  }));
  window.qxPageEditCtx = { page: page, groups: groups, onChange: onChange };   // লং প্রেসে ড্যাশবোর্ড সাজান খুলতে
  bar.appendChild(mkBtn('<svg class="ms-svg-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="' + QX_DASH_EDIT_PATH + '"/></svg>', "ড্যাশবোর্ড সাজান — কার্ড সাজান, যোগ ও সরান", () => qxOpenCardSheet(page, groups, onChange)));
  return bar;
}
// [PAGE-TOOLS: grid/list + card show/hide sheet] end
// [PAGE: More] start
function renderMore(){
  showOther("{{more_horiz}} আরও");
  const defs = [
    ["hajj", "i_hajj", "হজ্জ", "হজ্জের পরিচিতি", function(){ setMode("hajj"); }],
    ["zakat", "i_zakat", "যাকাত", "যাকাতের পরিচিতি", function(){ setMode("zakat"); }],
    ["books", "menu_book", "বই ও অনুচ্ছেদ", "বই ও লেখা", function(){ setMode("books"); }],
    ["saved", "star", "সংরক্ষিত", "বুকমার্ক ও ফেভারিট", function(){ setMode("saved"); }],
    ["tracker", "bar_chart", "ট্র্যাকার", "প্রতিদিনের হিসাব", function(){ setMode("tracker"); }],
    ["dict", "abc", "শব্দার্থ", "কুরআনের ১৫০টি জরুরি শব্দ", function(){ setMode("dict"); }],
    ["khatam", "calendar_month", "খতম প্ল্যান", "পড়ার পরিকল্পনা", function(){ if(typeof window.renderKhatamPopup === "function") window.renderKhatamPopup(); }],
    ["asma", "auto_awesome", "৯৯ নাম", "আসমাউল হুসনা", function(){ setMode("asma"); }]
  ];
  const draw = () => {
    app.innerHTML = "";
    app.appendChild(qxPageTools("more", [{ title: "আরও", items: defs.map(d => ({ id: d[0], title: d[2], icon: d[1] })) }], draw));
    const box = mk("div", "qx-list qx-list-spaced qx-vw-" + qxPageView("more"));
    qxPageArrange("more", defs.map(d => ({ id: d[0], d: d }))).visible.forEach(o => {
      const d = o.d; box.appendChild(qxRow(d[1], d[2], d[3], d[4]));
    });
    app.appendChild(box);
  };
  draw();
}
// [PAGE: More] end
// [PAGE: Section (generic list pages)] start
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
      const arrow = mk("span", "qx-tri-badge", "{{expand_more}}");
      h.appendChild(arrow);
      h.onclick = function(){
        const isOpen = card.classList.toggle("open");
        arrow.textContent = isOpen ? "{{expand_less}}" : "{{expand_more}}";
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
// [PAGE: Section (generic list pages)] end

// [PAGE: Saved (+ sheet/confirm helpers)] start
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
// [PAGE: Saved (+ sheet/confirm helpers)] end

// [PRAYER-CALC: methods, cities, times, adhan, alerts] start
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
alertCfg = alertCfg && typeof alertCfg === "object" ? alertCfg : {};
alertCfg.enabled = alertCfg.enabled === true;
alertCfg.sound = ["adhan", "beep", "silent"].includes(alertCfg.sound) ? alertCfg.sound : "adhan";
alertCfg.prayers = Object.assign(
  { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  alertCfg.prayers && typeof alertCfg.prayers === "object" ? alertCfg.prayers : {}
);
Object.keys(alertCfg.prayers).forEach(k => { alertCfg.prayers[k] = alertCfg.prayers[k] !== false; });
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

/* BD_DISTRICTS, BD_THANAS (বিভাগ → জেলা → থানা/উপজেলা) এখন data/district.js-এ আছে */


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
// Phase 4 v2.0.31 — Flip clock: HH MM SS আলাদা ঘরে
function fmtCdFlip(ms){
  const s = Math.max(0, Math.floor(ms/1000));
  const hh = String(Math.floor(s/3600)).padStart(2,"0");
  const mm = String(Math.floor(s%3600/60)).padStart(2,"0");
  const ss = String(s%60).padStart(2,"0");
  return { hh: toBn(hh), mm: toBn(mm), ss: toBn(ss), raw: hh+":"+mm+":"+ss };
}
function qxRenderFlipClock(el, ms){
  if(!el) return;
  const t = fmtCdFlip(ms);
  const boxes = el.querySelectorAll('.flip-box b');
  if(boxes.length >= 3){
    if(boxes[0].textContent !== t.hh){ boxes[0].textContent = t.hh; boxes[0].parentElement.classList.remove('flip'); void boxes[0].offsetWidth; boxes[0].parentElement.classList.add('flip'); }
    if(boxes[1].textContent !== t.mm){ boxes[1].textContent = t.mm; boxes[1].parentElement.classList.remove('flip'); void boxes[1].offsetWidth; boxes[1].parentElement.classList.add('flip'); }
    if(boxes[2].textContent !== t.ss){ boxes[2].textContent = t.ss; boxes[2].parentElement.classList.remove('flip'); void boxes[2].offsetWidth; boxes[2].parentElement.classList.add('flip'); }
  } else {
    el.innerHTML = '<div class="flip-box"><b>'+t.hh+'</b><small>ঘণ্টা</small></div><div class="flip-box"><b>'+t.mm+'</b><small>মিনিট</small></div><div class="flip-box"><b>'+t.ss+'</b><small>সেকেন্ড</small></div>';
  }
}
function nextPrayer(now){
  const t = calcDay(now, loc.lat, loc.lng, asrF);
  for (const [k,l] of PRAYERS) { if (k !== "sunrise" && t[k] && t[k] > now) return { k, l, at:t[k], today:true }; }
  const t2 = calcDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()+1), loc.lat, loc.lng, asrF);
  return { k:"fajr", l:"ফজর", at:t2.fajr, today:false };
}
function addOpt(sel, v, text){ const o = document.createElement("option"); o.value = String(v); o.textContent = text; sel.appendChild(o); }
/* GPS অবস্থান থেকে সবচেয়ে কাছের বিভাগীয় শহর / জেলা সদর / থানা-উপজেলা খুঁজে বের করে।
   ১৫০ কিমির মধ্যে কিছু না পেলে (বাংলাদেশের বাইরে) null ফেরত দেয়। */
function gpsNearestPlace(lat, lng){
  const R = 6371, rad = Math.PI / 180;
  const km = (la, ln) => {
    const a = Math.sin((la - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(la * rad) * Math.sin((ln - lng) * rad / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };
  let best = null;
  const take = (d, o) => { if (!best || d < best.km) best = Object.assign({ km: d }, o); };
  for (const dn in BD_DISTRICTS) {
    const dc = CITIES.find(c => c[0] === dn);
    if (dc) take(km(dc[1], dc[2]), { div: dn });
    BD_DISTRICTS[dn].forEach(d => {
      take(km(d[1], d[2]), { div: dn, dist: d[0] });
      (BD_THANAS[d[0]] || []).forEach(t => take(km(t[1], t[2]), { div: dn, dist: d[0], thana: t[0] }));
    });
  }
  return (best && best.km <= 150) ? best : null;
}
function useGps(status){
  if (!navigator.geolocation) { if (status) status.textContent = "এই ডিভাইসে লোকেশন সাপোর্ট নেই। তালিকা থেকে শহর বেছে নিন।"; return; }
  if (status) status.textContent = "লোকেশন খোঁজা হচ্ছে…";
  navigator.geolocation.getCurrentPosition(p => {
    const lat = Number(p.coords.latitude.toFixed(4)), lng = Number(p.coords.longitude.toFixed(4));
    loc = { n:"আপনার অবস্থান (GPS)", lat:lat, lng:lng, gps:true };
    // বাংলাদেশে হলে বিভাগ, জেলা ও থানা/উপজেলা ফর্মে নিজে থেকে বসে যাবে; সময়ের হিসাব আসল GPS অবস্থান দিয়েই হয়
    const place = gpsNearestPlace(lat, lng);
    if (place) {
      loc.div = place.div;
      if (place.dist) loc.dist = place.dist;
      if (place.thana) loc.thana = place.thana;
      loc.n = (place.thana || place.dist || place.div) + " (GPS)";
    }
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
// [PRAYER-CALC: methods, cities, times, adhan, alerts] end

// [PAGE: Qibla] start
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
  const badge = mk("div", "kaaba-badge", "{{i_hajj}}");
  badge.setAttribute("aria-label", "কিবলা"); badge.setAttribute("role", "img");
  const needle = mk("div", "kaaba-needle");
  pointer.appendChild(badge);
  pointer.appendChild(needle);
  ring.appendChild(pointer);

  const center = mk("div", "compass-center");
  dial.appendChild(ring);
  dial.appendChild(center);
  card.appendChild(dial);

  const sensorStatus = mk("div", "note", "ফোনটি সমতল রাখুন। সেন্সর চালু করতে নিচের বোতামে চাপ দিন; সেন্সর না থাকলে উপরের নির্ণীত ডিগ্রি অনুসরণ করুন।");
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
      if (typeof e.webkitCompassHeading === "number" && Number.isFinite(e.webkitCompassHeading)) heading = e.webkitCompassHeading;
      else if (e.absolute === true && typeof e.alpha === "number" && Number.isFinite(e.alpha)) heading = 360 - e.alpha; // relative (non-absolute) ইভেন্ট বাদ
      if (heading !== null && !isNaN(heading)) {
        ring.style.transform = `rotate(${-heading}deg)`;
        const diff = Math.abs(((heading - qInfo.deg + 540) % 360) - 180);
        dial.classList.toggle("qibla-aligned", diff <= 6);
        sensorStatus.textContent = diff <= 6
          ? `{{check_circle:f}} আপনি কিবলার দিকে আছেন (${toBn(Math.round(heading))}°)`
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
          sensorBtn.textContent = "{{check_circle:f}} সেন্সর সক্রিয়";
          showToast("কম্পাস সেন্সর চালু হয়েছে");
        } else {
          sensorStatus.textContent = "কম্পাস সেন্সর অনুমতি দেওয়া হয়নি। ডায়ালে দেখানো ডিগ্রি অনুসরণ করুন।";
        }
      } catch(e) {
        sensorStatus.textContent = "সেন্সর চালু করা যায়নি।";
      }
    } else {
      if (typeof DeviceOrientationEvent === "undefined") {
        sensorStatus.textContent = "এই ব্রাউজারে কম্পাস সেন্সর সাপোর্ট নেই। উপরে দেখানো কিবলা ডিগ্রি অনুসরণ করুন।";
        return;
      }
      attachOrientation();
      sensorBtn.textContent = "{{check_circle:f}} সেন্সর সক্রিয়";
      sensorStatus.textContent = "সেন্সর চালু হয়েছে। ফোনটি ধীরে ঘোরান এবং কম্পাস স্থিতিশীল হওয়া পর্যন্ত অপেক্ষা করুন।";
      showToast("কম্পাস সেন্সর সক্রিয়");
    }
  };

  btnRow.appendChild(sensorBtn);
  btnRow.appendChild(gpsBtn);
  card.appendChild(btnRow);
  app.appendChild(card);
}
// [PAGE: Qibla] end

// [PAGE: Prayer Alerts] start
function renderAlertsView(){
  // বোতাম নতুন করে আঁকলে স্ক্রল ওপরে লাফায়; তাই শুধু টিক বোতাম বদলানো হয়
  function azTick(on, label){
    const b = mk("button", "trk-tick az-tick" + (on ? " on" : ""), on ? "{{check_circle:f}}" : "{{radio_button_unchecked}}");
    b.type = "button";
    b.setAttribute("aria-pressed", String(!!on));
    b.setAttribute("aria-label", label);
    return b;
  }
  function azRow(label, sub, getOn, onToggle){
    const row = mk("div", "trk-row");
    const l = document.createElement("div");
    l.innerHTML = "<b>" + label + "</b>" + (sub ? '<div class="trk-mini">' + sub + "</div>" : "");
    let btn = azTick(getOn(), label);
    const bind = (el) => { el.onclick = async () => { await onToggle(); const nb = azTick(getOn(), label); bind(nb); el.replaceWith(nb); btn = nb; }; };
    bind(btn);
    row.appendChild(l); row.appendChild(btn);
    return row;
  }

  // ১. ওপরের ব্যানার (নামাজের সময় ট্যাবের hero / ট্র্যাকারের trk-head এর মতো)
  const head = mk("div", "trk-head");
  head.appendChild(mk("small", null, "নামাজের ওয়াক্ত"));
  head.appendChild(mk("div", "big", "আজান অ্যালার্ট"));
  const stat = mk("div", null, alertCfg.enabled ? "চালু আছে" : "বন্ধ");
  head.appendChild(stat);
  app.appendChild(head);

  // ২. প্রধান কার্ড
  const card = mk("div", "trk-cat");
  card.appendChild(mk("h3", null, "{{alarm}} আজান ও নামাজের অ্যালার্ট"));
  card.appendChild(mk("div", "sub", "ওয়াক্ত হলে শব্দ ও নোটিফিকেশন পাবেন"));

  card.appendChild(azRow("অ্যালার্ট চালু রাখুন", "", () => !!alertCfg.enabled, async () => {
    const nextEnabled = !alertCfg.enabled;
    let permissionDenied = false;
    if (nextEnabled && "Notification" in window && Notification.permission === "default") {
      try { permissionDenied = (await Notification.requestPermission()) === "denied"; } catch(e) { permissionDenied = true; }
    } else if (nextEnabled && "Notification" in window && Notification.permission === "denied") {
      permissionDenied = true;
    }
    alertCfg.enabled = nextEnabled;
    lsSet("prayerAlerts", alertCfg);
    stat.textContent = nextEnabled ? "চালু আছে" : "বন্ধ";
    showToast(nextEnabled ? (permissionDenied ? "অ্যালার্ট চালু; তবে নোটিফিকেশন অনুমতি বন্ধ। অ্যাপ খোলা থাকলে শব্দ/বার্তা আসবে।" : "নামাজের অ্যালার্ট চালু হয়েছে") : "নামাজের অ্যালার্ট বন্ধ হয়েছে");
  }));

  // অ্যালার্টের ধরন + টেস্ট (নামাজের সময় ট্যাবের row2 ধাঁচে)
  const ctl = mk("div", "row2");
  const sSel = document.createElement("select");
  sSel.setAttribute("aria-label", "অ্যালার্টের ধরন");
  addOpt(sSel, "adhan", "আজান সুর (মেলেডি)");
  addOpt(sSel, "beep", "সাধারণ অ্যালার্ট টোন");
  addOpt(sSel, "silent", "নিঃশব্দ নোটিফিকেশন");
  sSel.value = alertCfg.sound;
  sSel.onchange = () => {
    alertCfg.sound = sSel.value;
    lsSet("prayerAlerts", alertCfg);
    playAdhanTone(alertCfg.sound);
  };
  const testBtn = mk("button", "dl-btn", "{{play_arrow}} টেস্ট অ্যালার্ট");
  testBtn.type = "button";
  testBtn.onclick = () => {
    playAdhanTone(alertCfg.sound === "silent" ? "adhan" : alertCfg.sound);
    showToast("টেস্ট অ্যালার্ট: নামাজের ওয়াক্ত হয়েছে!");
  };
  ctl.appendChild(sSel); ctl.appendChild(testBtn);
  card.appendChild(ctl);

  card.appendChild(mk("div", "note-box", "অ্যাপ খোলা ও স্ক্রিন চালু থাকলে যেকোনো পাতায় শব্দ দেবে। ব্যাকগ্রাউন্ডে বা স্ক্রিন বন্ধে কাজ করবে না।"));
  app.appendChild(card);

  // ৩. ওয়াক্তভিত্তিক তালিকা
  const listCard = mk("div", "trk-cat");
  listCard.appendChild(mk("h3", null, "{{i_mosque}} ওয়াক্তভিত্তিক অ্যালার্ট"));
  listCard.appendChild(mk("div", "sub", "কোন ওয়াক্তে অ্যালার্ট চান, টিক দিন"));
  [["fajr","ফজর"],["dhuhr","যোহর"],["asr","আসর"],["maghrib","মাগরিব"],["isha","এশা"]].forEach(([k, l]) => {
    listCard.appendChild(azRow("{{i_mosque}} " + l, "", () => !!alertCfg.prayers[k], () => {
      alertCfg.prayers[k] = !alertCfg.prayers[k];
      lsSet("prayerAlerts", alertCfg);
    }));
  });
  app.appendChild(listCard);
}
// [PAGE: Prayer Alerts] end


// [DATA: Namaz-e-Nabvi chapters] start
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
// [DATA: Namaz-e-Nabvi chapters] end

// [PAGE: Prayer Learn (Namaz Shikkha)] start
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
function qxPrayerShowOther(title){
  const keep = app.querySelector(".p3-tabs");
  showOther(title);
  if (keep) app.insertBefore(keep, app.firstChild);
}
function renderPrayerLearnView(){
  const currentChapterId = window.qxNamazChapter || null;

  if(currentChapterId){
    const ch = NAMAZ_NABVI_DATA.find(c=>c.id===currentChapterId);
    if(ch){
      qxPrayerShowOther('{{i_learn}} ' + ch.title);
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
  qxPrayerShowOther('{{i_learn}} নামাজ শিক্ষা - নববী পদ্ধতি');
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

container.appendChild(qxListHeading(toBn(NAMAZ_NABVI_DATA.length) + "টি অধ্যায়"));
  const nmGrid = qxListGrid();
  NAMAZ_NABVI_DATA.forEach(ch=>{
    const card = item(toBn(ch.no), ch.title, ch.subtitle, "", ()=>{ window.qxNamazChapter=ch.id; renderPrayerLearnView(); window.scrollTo(0,0); });
    card.classList.add("surah-item");
    nmGrid.appendChild(card);
  });
  container.appendChild(nmGrid);


  app.appendChild(container);
}
// [PAGE: Prayer Learn (Namaz Shikkha)] end


// [PRAYER-FLIP-CLOCK + tick sound] start
/* --- নামাজের সময়: ফ্লিপ ক্লক (বাংলা সংখ্যা) + সেকেন্ডের টিক শব্দ --- */
let qxTickCtx = null, qxTickOn = true, qxTickPhase = 0, qxCdTok = 0;
try{ qxTickOn = localStorage.getItem("qxTick") !== "0"; }catch(e){}
function qxTickUnlock(){
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!qxTickCtx) qxTickCtx = new AC();
    if (qxTickCtx.state === "suspended") qxTickCtx.resume();
  }catch(e){}
}
/* ব্রাউজার নিয়মে শব্দ চালাতে প্রথম টাচ/ক্লিক লাগে; তাই প্রথম ইন্টারঅ্যাকশনেই অডিও চালু হয় */
["pointerdown","keydown","touchstart"].forEach(ev => document.addEventListener(ev, qxTickUnlock, { once:true, passive:true }));
function qxTick(){
  if (!qxTickOn || document.hidden || !qxTickCtx || qxTickCtx.state !== "running") return;
  try{
    const ctx = qxTickCtx, t0 = ctx.currentTime, dur = 0.045;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.2;
    bp.frequency.value = (qxTickPhase++ % 2) ? 1900 : 2600;   // টিক-টক
    const g = ctx.createGain(); g.gain.value = 0.9;
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t0);
  }catch(e){}
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && typeof window.qxCdResync === "function") window.qxCdResync(); });
function qxFlipBuild(){
  const el = mk("div", "qx-flip"); el.setAttribute("role", "timer");
  [["ঘণ্টা"], ["মিনিট"], ["সেকেন্ড"]].forEach(([lb], i) => {
    if (i) el.appendChild(mk("div", "qx-flip-colon", ":"));
    const grp = mk("div", "qx-flip-grp"), digs = mk("div", "qx-flip-digs");
    for (let k = 0; k < 2; k++){ const fd = mk("span", "qx-fd"); fd.appendChild(mk("b", null, "০")); digs.appendChild(fd); }
    grp.appendChild(digs); grp.appendChild(mk("small", null, lb));
    el.appendChild(grp);
  });
  return el;
}
function qxFlipSet(el, ms, noAnim){
  const s = Math.max(0, Math.floor(ms / 1000));
  const str = [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(v => String(v).padStart(2, "0")).join("");
  const boxes = el.querySelectorAll(".qx-fd");
  for (let i = 0; i < boxes.length && i < str.length; i++){
    const b = boxes[i].firstChild, v = toBn(str[i]);
    if (b.textContent !== v){
      b.textContent = v;
      if (!noAnim){ boxes[i].classList.remove("flip"); void boxes[i].offsetWidth; boxes[i].classList.add("flip"); }
    }
  }
  el.setAttribute("aria-label", "আর " + fmtCd(ms) + " বাকি");
}
// [PRAYER-FLIP-CLOCK + tick sound] end

// [PAGE: Prayer] start
function renderPrayer(){
  window.qxCdResync = null;
  stopCompass();
  showOther("নামাজ ও কিবলা");

  // Sub-navigation tabs for Prayer Times, Qibla Compass, and Adhan Alerts
  const subTabs = mk("div", "p3-tabs");
  [["learn","{{i_learn}} নামাজ শিক্ষা"],["times","{{i_mosque}} নামাজের সময়"],["qibla","{{i_qibla}} কিবলা কম্পাস"],["alerts","{{alarm}} আজান অ্যালার্ট"]].forEach(([k, label]) => {
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
  const cd = qxFlipBuild();
  if (nx.at) qxFlipSet(cd, (Math.floor(nx.at.getTime() / 1000) - Math.floor(now.getTime() / 1000)) * 1000, true); else cd.style.display = "none";
  hero.appendChild(cd);
  const chip = mk("div", "hero-date hero-date-ic qx-cal-transparent"); chip.title = ds; chip.setAttribute("aria-label", ds);
  const _todayNum = (function(){ try{ return toBn(String(new Date().getDate())); }catch(e){ return ""; } })();
  chip.innerHTML = '<span class="qx-cal-wrap"><span class="ms" aria-hidden="true">calendar_month</span><small class="qx-cal-date">' + _todayNum + '</small></span>';
  hero.appendChild(chip);
  const snd = mk("button", "hero-snd" + (qxTickOn ? "" : " off")); snd.type = "button";
  snd.innerHTML = '<span class="ms" aria-hidden="true">volume_up</span>';
  const sndLbl = () => { snd.setAttribute("aria-label", qxTickOn ? "টিক শব্দ বন্ধ করুন" : "টিক শব্দ চালু করুন"); snd.title = snd.getAttribute("aria-label"); snd.setAttribute("aria-pressed", qxTickOn ? "true" : "false"); };
  sndLbl();
  snd.onclick = () => {
    qxTickUnlock(); qxTickOn = !qxTickOn;
    try{ localStorage.setItem("qxTick", qxTickOn ? "1" : "0"); }catch(e){}
    snd.classList.toggle("off", !qxTickOn); sndLbl(); if (qxTickOn) qxTick();
  };
  hero.appendChild(snd);
  app.appendChild(hero);

  // Location & Asr method row
  const row = mk("div","row2");
  const sel = document.createElement("select"); prayerSel = sel;
  sel.setAttribute("aria-label", "নামাজের সময়ের জন্য অবস্থান নির্বাচন");
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
  as.setAttribute("aria-label", "আসরের হিসাব পদ্ধতি নির্বাচন");
  addOpt(as, 2, "আসর: হানাফি"); addOpt(as, 1, "আসর: শাফেয়ি");
  as.value = String(asrF);
  as.onchange = () => { asrF = +as.value; lsSet("asr", asrF); renderPrayer(); };
  row.appendChild(sel); row.appendChild(as);
  app.appendChild(row);

  // District & Thana/Upazila (Bangladesh): বিভাগীয় শহর, কুমিল্লা, GPS ও ম্যানুয়াল — সব ক্ষেত্রেই দেখাবে
  let pDiv = (loc.div && BD_DISTRICTS[loc.div]) ? loc.div : null, pDist = loc.dist || null;
  if (!pDiv && !loc.gps && !loc.manual) {
    for (const dn in BD_DISTRICTS) {
      if (BD_DISTRICTS[dn].some(d => d[0] === loc.n)) { pDiv = dn; if (dn !== loc.n) pDist = loc.n; break; }
    }
  }
  if (pDiv || loc.gps || loc.manual) {
    const dists = pDiv ? BD_DISTRICTS[pDiv] : [];
    const divC = pDiv ? CITIES.find(c => c[0] === pDiv) : null;
    const row3 = mk("div", "row2");
    const divSel = document.createElement("select");
    divSel.setAttribute("aria-label", "বিভাগ নির্বাচন");
    if (!pDiv) addOpt(divSel, "", "বিভাগ: বাছুন");
    Object.keys(BD_DISTRICTS).forEach(function(dn){ addOpt(divSel, dn, "বিভাগ: "+dn); });
    divSel.value = pDiv || "";
    divSel.onchange = () => {
      const dn = divSel.value;
      if (!dn) return;
      const cc = CITIES.find(c => c[0] === dn);
      if (cc) { loc = { n: cc[0], lat: cc[1], lng: cc[2], div: dn }; lsSet("loc", loc); renderPrayer(); }
    };
    row3.appendChild(divSel);
    const dSel = document.createElement("select");
    dSel.setAttribute("aria-label", "জেলা নির্বাচন");
    const tSel = document.createElement("select");
    tSel.setAttribute("aria-label", "থানা বা উপজেলা নির্বাচন");
    if (pDiv) {
      addOpt(dSel, "", "জেলা: বিভাগীয় সদর");
      dists.forEach((d, i) => addOpt(dSel, i, d[0]));
      dSel.value = pDist ? String(dists.findIndex(d => d[0] === pDist)) : "";
      dSel.onchange = () => {
        if (dSel.value === "") loc = { n: divC[0], lat: divC[1], lng: divC[2], div: pDiv };
        else { const d = dists[+dSel.value]; loc = { n: d[0], lat: d[1], lng: d[2], div: pDiv, dist: d[0] }; }
        lsSet("loc", loc); renderPrayer();
      };
    } else {
      addOpt(dSel, "", "জেলা: আগে বিভাগ বাছুন");
      dSel.disabled = true;
    }
    const ths = pDist ? BD_THANAS[pDist] : null;
    if (ths) {
      addOpt(tSel, "", "থানা/উপজেলা: জেলা সদর");
      ths.forEach((t, i) => addOpt(tSel, i, t[0]));
      tSel.value = loc.thana ? String(ths.findIndex(t => t[0] === loc.thana)) : "";
      tSel.onchange = () => {
        const dd0 = dists.find(d => d[0] === pDist);
        if (tSel.value === "") loc = { n: dd0[0], lat: dd0[1], lng: dd0[2], div: pDiv, dist: pDist };
        else { const t = ths[+tSel.value]; loc = { n: t[0], lat: t[1], lng: t[2], div: pDiv, dist: pDist, thana: t[0] }; }
        lsSet("loc", loc); renderPrayer();
      };
    } else {
      addOpt(tSel, "", pDist ? "থানা/উপজেলা: তথ্য নেই" : "থানা/উপজেলা: আগে জেলা বাছুন");
      tSel.disabled = true;
    }
    row3.appendChild(dSel); row3.appendChild(tSel);
    app.appendChild(row3);
  }
  // আলাদা GPS অপশন: ওপরের ড্রপডাউন থেকে স্বাধীন; চাপলে লোকেশন নিয়ে বিভাগ, জেলা ও থানা/উপজেলা নিজে ভরে দেয়
  const gpsBtn = mk("button", "dl-btn ghost", "{{location_on}} GPS দিয়ে লোকেশন সেট করুন");
  gpsBtn.type = "button";
  gpsBtn.style.cssText = "width:100%;margin:0 0 10px;";
  const gpsNote = mk("div", "note");
  gpsBtn.onclick = () => { if (!gpsNote.parentNode) gpsBtn.insertAdjacentElement("afterend", gpsNote); useGps(gpsNote); };
  app.appendChild(gpsBtn);
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

  app.appendChild(mk("h3", "prayer-list-title", "আজকের নামাজের সময়"));
  PRAYERS.forEach(([k,l]) => {
    const isNext = nx.today && nx.k === k;
    const r = mk("div","prow" + (isNext ? " on" : ""));
    r.setAttribute("aria-label", l + " : " + fmtTime(t[k]));
    if (isNext) r.setAttribute("aria-current", "time");
    r.appendChild(mk("b", null, l)); r.appendChild(mk("span", null, fmtTime(t[k])));
    app.appendChild(r);
  });
  app.appendChild(status);
  const activeMethod = CALC_METHODS[calcMethodKey] || CALC_METHODS.karachi;
  app.appendChild(mk("div","note",`গণনা: ${activeMethod.name}, ইন্টারনেট ছাড়াই ডিভাইসে হিসাব হয়। স্থানীয় মসজিদের সময়সূচির সাথে কয়েক মিনিটের পার্থক্য হতে পারে; জামাতের সময় মসজিদের সূচিই অনুসরণ করুন।`));

  /* কাউন্টডাউন ডিভাইসের ঘড়ির সেকেন্ডের সাথে মেলানো: প্রতিটি টিক ঠিক সেকেন্ড বদলের মুহূর্তে চলে, দেরি জমে না;
     অ্যাপ ব্যাকগ্রাউন্ড থেকে ফিরলে সাথে সাথে ঘড়ির সময়ে ফিরে আসে */
  if (nx.at) {
    const tok = ++qxCdTok;
    const secLeft = () => Math.floor(nx.at.getTime() / 1000) - Math.floor(Date.now() / 1000);
    const step = () => {
      if (tok !== qxCdTok) return;
      if (new Date() >= nx.at) { renderPrayer(); return; }
      qxFlipSet(cd, secLeft() * 1000);
      qxTick();
    };
    const arm = () => {
      tmr = setTimeout(() => { step(); if (tok === qxCdTok && cd.isConnected) arm(); }, 1000 - (Date.now() % 1000) + 5);
    };
    window.qxCdResync = () => {
      if (tok !== qxCdTok || !cd.isConnected) return;
      clearTimeout(tmr);
      if (new Date() >= nx.at) { renderPrayer(); return; }
      qxFlipSet(cd, secLeft() * 1000, true);
      arm();
    };
    arm();
  }
}
// [PAGE: Prayer] end

// [PAGE: Tasbih (+ duaTabs)] start
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
  const page = mk("div", "qx-sec-page qx-tsb");
  const cur = DHIKR.find(d => d[0] === ts.k) || DHIKR[0];

  // জিকির বাছাই: প্রতিটা কার্ডে নাম ও এ পর্যন্ত গণনা
  const sel = mk("div", "qx-tsb-sel");
  DHIKR.forEach(d => {
    const b = mk("button", "qx-tsb-chip" + (d[0] === ts.k ? " on" : ""));
    b.type = "button";
    b.setAttribute("aria-pressed", d[0] === ts.k ? "true" : "false");
    b.appendChild(mk("b", "", d[1]));
    b.appendChild(mk("small", "", toBn(ts.c[d[0]] || 0)));
    b.onclick = () => { ts.k = d[0]; lsSet("tasbih", ts); renderTasbih(); };
    sel.appendChild(b);
  });
  page.appendChild(sel);

  if (cur[2]) {
    const ph = mk("div", "ayah qx-sec-card qx-tsb-phrase");
    const ar = mk("div", "ar", cur[2]);
    ar.dir = "rtl"; ar.lang = "ar";
    ph.appendChild(ar);
    ph.appendChild(mk("div", "bn", cur[1]));
    page.appendChild(ph);
  }

  // গোল কাউন্টার: চারপাশে অগ্রগতির রিং
  const wrap = mk("div", "qx-tsb-wrap");
  const C = 2 * Math.PI * 88;
  const btn = mk("button", "qx-tsb-btn");
  btn.type = "button";
  btn.setAttribute("aria-label", cur[1] + " — গণনা করতে চাপুন");
  btn.innerHTML = '<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="qx-tsb-track" cx="100" cy="100" r="88"/><circle class="qx-tsb-arc" cx="100" cy="100" r="88" transform="rotate(-90 100 100)"/></svg>';
  const arc = btn.querySelector(".qx-tsb-arc");
  arc.style.strokeDasharray = C.toFixed(2);
  const inner = mk("span", "qx-tsb-in"), cnt = mk("span", "qx-tsb-count"), sub = mk("small");
  inner.appendChild(cnt); inner.appendChild(sub); btn.appendChild(inner);
  let prevFrac = null;
  const upd = () => {
    const c = ts.c[ts.k] || 0, t = ts.t;
    cnt.textContent = toBn(c);
    const frac = t ? (c === 0 ? 0 : ((c - 1) % t + 1) / t) : (c ? 1 : 0);
    // When a cycle restarts the ring would sweep backwards; jump it instead so it stays smooth.
    if (prevFrac !== null && frac < prevFrac) {
      arc.style.transition = "none";
      arc.style.strokeDashoffset = (C * (1 - frac)).toFixed(2);
      void arc.getBoundingClientRect();
      arc.style.transition = "";
    } else {
      arc.style.strokeDashoffset = (C * (1 - frac)).toFixed(2);
    }
    arc.classList.toggle("empty", frac === 0);
    prevFrac = frac;
    sub.textContent = t ? "চক্র " + toBn(Math.floor(c / t)) + " · লক্ষ্য " + toBn(t) : "অসীম গণনা";
  };
  btn.onclick = () => {
    const c = (ts.c[ts.k] || 0) + 1; ts.c[ts.k] = c; lsSet("tasbih", ts); upd();
    cnt.classList.remove("tap"); void cnt.offsetWidth; cnt.classList.add("tap");
    btn.classList.remove("ripple"); void btn.offsetWidth; btn.classList.add("ripple");
    if (ts.t && c % ts.t === 0) { btn.classList.remove("cycle-done"); void btn.offsetWidth; btn.classList.add("cycle-done"); }
    try { if (navigator.vibrate) navigator.vibrate(ts.t && c % ts.t === 0 ? [120, 60, 120] : 12); } catch(e){}
  };
  upd();
  wrap.appendChild(btn);
  page.appendChild(wrap);

  // লক্ষ্য ও রিসেট
  const ctl = mk("div", "qx-tsb-ctl");
  [33, 99, 100, 0].forEach(n => {
    const b = mk("button", "qx-tsb-opt" + (ts.t === n ? " on" : ""), n ? toBn(n) : "∞");
    b.type = "button";
    b.setAttribute("aria-pressed", ts.t === n ? "true" : "false");
    b.onclick = () => { ts.t = n; lsSet("tasbih", ts); renderTasbih(); };
    ctl.appendChild(b);
  });
  const rs = mk("button", "qx-tsb-opt danger", "{{refresh}} রিসেট");
  rs.type = "button";
  rs.onclick = () => { if (!confirm("এই জিকিরের গণনা শূন্য করবেন?")) return; ts.c[ts.k] = 0; lsSet("tasbih", ts); renderTasbih(); };
  ctl.appendChild(rs);
  page.appendChild(ctl);
  app.appendChild(page);
}
// [PAGE: Tasbih (+ duaTabs)] end

// [PAGE: Dua (+ DUAS data)] start
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
/* দোয়ার কলাপসিবল কার্ড: মাথায় নম্বর + নাম + ▽, ট্যাপ করলে আরবি, অনুবাদ, সূত্র ও বাটন খোলে।
   opts.quranKey দিলে সংরক্ষণ কুরআনের আয়াত হিসেবে (আয়াতুল কুরসী), নইলে দোয়া হিসেবে। */
function qxDuaCard(d, n, opts){
  opts = opts || {};
  const card = mk("div", "ayah qx-sec-card");
  const head = mk("div", "no qx-sec-head");
  head.setAttribute("role", "button"); head.tabIndex = 0; head.setAttribute("aria-expanded", "false");
  const left = mk("div", "qx-sec-left");
  left.appendChild(mk("span", "qx-num-badge", toBn(n)));
  left.appendChild(mk("span", "ayah-number qx-sec-title", d[0]));
  head.appendChild(left);
  const arrow = mk("span", "qx-tri-badge", "{{expand_more}}");
  head.appendChild(arrow);
  const toggle = function(){
    const o = card.classList.toggle("open");
    arrow.textContent = o ? "{{expand_less}}" : "{{expand_more}}";
    head.setAttribute("aria-expanded", o ? "true" : "false");
  };
  head.onclick = toggle;
  head.onkeydown = function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
  card.appendChild(head);

  const body = mk("div", "qx-sec-body");
  const ar = mk("div", "ar"); ar.dir = "rtl"; ar.lang = "ar"; ar.dataset.raw = d[1];
  if (window.renderAyahArabic) ar.innerHTML = window.renderAyahArabic(d[1], 0, 0); else ar.textContent = d[1];
  body.appendChild(ar);
  body.appendChild(mk("div", "bn", d[2]));

  const act = mk("div", "qx-dua-act");
  const text = "[" + d[0] + "]\n" + d[1] + "\n\n" + d[2] + (d[3] ? "\nসূত্র: " + d[3] : "") + "\n— Quranix";
  const copy = mk("button", "icon-btn", "{{content_copy}}"); copy.type = "button"; copy.title = "কপি করুন"; copy.setAttribute("aria-label", "কপি করুন");
  copy.onclick = () => copyText(text, "কপি হয়েছে!");
  const share = mk("button", "icon-btn", "{{share}}"); share.type = "button"; share.title = "শেয়ার করুন"; share.setAttribute("aria-label", "শেয়ার করুন");
  share.onclick = () => shareTextOrCopy(text, d[0], "শেয়ার করা যায়নি, টেক্সট কপি করা হয়েছে!");
  const cat = opts.quranKey ? "quran" : "dua", key = opts.quranKey || d[0];
  const star = mk("button", "icon-btn", savedHas(cat, key) ? "{{star:f}}" : "{{star}}"); star.type = "button"; star.title = "সংরক্ষণ করুন"; star.setAttribute("aria-label", "সংরক্ষণ করুন");
  star.onclick = () => {
    const on = opts.quranKey ? savedToggle("quran", key) : savedToggle("dua", key, { title: d[0], ar: d[1], bn: d[2], src: d[3] });
    star.textContent = on ? "{{star:f}}" : "{{star}}";
    showToast(on ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ সরানো হয়েছে");
  };
  act.appendChild(copy); act.appendChild(share); act.appendChild(star);
  // Source (left) and quick buttons (right) share one row; source wraps above on very narrow screens.
  const foot = mk("div", "qx-dua-foot");
  if (d[3]) foot.appendChild(qxNmSource(d[3]));
  foot.appendChild(act);
  body.appendChild(foot);
  card.appendChild(body);
  return card;
}
function renderDua(){
  showOther("দোয়া ও তাসবিহ");
  app.appendChild(duaTabs("dua"));
  const page = mk("div", "qx-sec-page");
  DUAS.forEach(([g, items]) => {
    page.appendChild(mk("div", "qx-gh", g + " · " + toBn(items.length)));
    items.forEach((d, i) => page.appendChild(qxDuaCard(d, i + 1)));
  });
  page.appendChild(mk("div", "qx-gh", "কুরআনের সূরা ও আয়াত"));
  const holder = mk("div");
  page.appendChild(holder);
  loadSurahAyahs(2).then(l => {
    const a = l[254];
    if (a && holder.isConnected) holder.replaceWith(qxDuaCard(["আয়াতুল কুরসী", cleanText(a), a.bn, "সূরা বাকারা ২:২৫৫"], 1, { quranKey: "2:255" }));
  }).catch(() => {});
  [[112,"ইখলাস",4],[113,"ফালাক",5],[114,"নাস",6]].forEach(([n,nm,c]) => {
    const rowEl = item(n, "সূরা " + nm, "আয়াত " + toBn(c), "", () => openSurah(n));
    const sv2 = mk("button", "star qx-star"); sv2.type = "button"; sv2.setAttribute("aria-label", "সংরক্ষণ করুন");
    const skey = "surah:" + n;
    sv2.textContent = savedHas("dua", skey) ? "{{star:f}}" : "{{star}}";
    sv2.onclick = (e) => { e.stopPropagation(); const on = savedToggle("dua", skey, { title: "সূরা " + nm, ar: "", bn: "আয়াত " + toBn(c), src: "সূরা " + nm }); sv2.textContent = on ? "{{star:f}}" : "{{star}}"; showToast(on ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ সরানো হয়েছে"); };
    rowEl.appendChild(sv2);
    page.appendChild(rowEl);
  });
  app.appendChild(page);
}
// [PAGE: Dua (+ DUAS data)] end

// [APP-PREFS: header wiring, font size, theme toggle, applyAppPrefs, online/offline toasts] start
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
  uiSize: "small",
  onboarded: false,
  highContrast: false,
  reducedMotion: false
});

/* নির্বাচিত বাংলা ফন্টের পরে বাকি বাংলা ফন্ট ফলব্যাক হিসেবে জুড়ে দেয় (ফাইল না এলেও বাংলা ঠিক দেখাবে) */
function qxFontStack(v){
  v=String(v||'');
  var m=v.match(/,\s*(sans-serif|serif)\s*$/), g=m?m[1]:'sans-serif';
  v=v.replace(/,\s*(sans-serif|serif)\s*$/,'');
  ['"Hind Siliguri"','"Noto Serif Bengali"','"Kalpurush"','"Noto Sans Bengali"'].forEach(function(f){ if(v.indexOf(f)<0) v+=','+f; });
  return v+','+g;
}

function applyAppPrefs(){
  document.documentElement.style.setProperty("--qx-font-arabic", AR_FONTS.some(function(f){ return f[0] === appPrefs.arFont; }) ? appPrefs.arFont : AR_FONTS[0][0]);
  document.documentElement.style.setProperty("--qx-font", qxFontStack(appPrefs.bnFont || BN_FONTS[0][0]));
  document.documentElement.style.setProperty("--qx-fs-bn", (appPrefs.bnFs || 16) + "px");
  document.documentElement.toggleAttribute("data-hc", !!appPrefs.highContrast);
  var uiSizeNow = (appPrefs.uiSize === "medium" || appPrefs.uiSize === "lite") ? appPrefs.uiSize : "small";
  if (document.documentElement.getAttribute("data-size") !== uiSizeNow) {
    document.documentElement.setAttribute("data-size", uiSizeNow);
    try { window.dispatchEvent(new Event("resize")); } catch(e) {}
  }
  const systemReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.toggleAttribute("data-reduced-motion", !!appPrefs.reducedMotion || !!systemReducedMotion);
}
applyAppPrefs();

// Friendly Global Error Handler & Offline Network Status
window.addEventListener("offline", () => showToast("অফলাইন মোড: সংরক্ষিত কুরআন ও ফিচার চালু আছে"));
window.addEventListener("online", () => showToast("ইন্টারনেট সংযোগ পুনরায় স্থাপিত হয়েছে"));
// [APP-PREFS: header wiring, font size, theme toggle, applyAppPrefs, online/offline toasts] end

// Android WebView / Browser Back Button Navigation Handling
// [BACK-NAVIGATION: back button, popstate, qxNav, openSurah/openJuz wrappers] start
function handleBackNavigation(){
  if (window.qxFullAudioPageOpen) {
    window.qxFullAudioPageOpen = false;
    renderHome();
    return true;
  }
  if (qxNav.closeTopOverlay()) return true;
  if (document.querySelector(".qx-dict-detail")) {
    renderHome();
    if (mode !== "quran") qxNav.pushMode();
    return true;
  }
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
// [BACK-NAVIGATION: back button, popstate, qxNav, openSurah/openJuz wrappers] end

// [GESTURES: swipe, pull-to-refresh, long-press] start
/* ===== জেসচার সিস্টেম =====
   নতুন জেসচার যোগ করতে: ১) QX_GESTURES তালিকায় একটা এন্ট্রি দিন, ২) নিচে তার হ্যান্ডলার লিখুন, শুরুতে qxGestureOn("id") দিয়ে চেক করুন।
   কাস্টমাইজেশন মেনুর "জেসচার" অংশে অন/অফ সুইচ নিজে থেকেই চলে আসবে। */
/* জেসচার অংশের আইকন: Material Symbols (Rounded, FILL0) SVG পাথ; animation = তিনটা overlapping বৃত্ত (থিমের রঙে)।
   এখানে নেই এমন নাম হলে আইকন ফন্ট (material-symbols-rounded.woff2) থেকে আসে। */
const QX_ICON_PATHS = {
  swipe_right: '<path d="M11.83,22q-0.6,0-1.15-0.23T9.7,21.13L4.6,16l0.75-0.78q0.4-0.4 0.94-0.54T7.35,14.7L9,15.18V7Q9,6.57 9.29,6.29Q9.58,6 10,6t0.71,0.29T11,7V17.83L8.58,17.15l2.55,2.55q0.13,0.13 0.31,0.21T11.83,20H16q0.82,0 1.41-0.59T18,18V14q0-0.43 0.29-0.71T19,13t0.71,0.29T20,14v4q0,1.65-1.18,2.82T16,22H11.83ZM12,15V11q0-0.43 0.29-0.71T13,10t0.71,0.29T14,11v4H12Zm3,0V12q0-0.43 0.29-0.71T16,11q0.43,0 0.71,0.29T17,12v3H15ZM2,7Q2.75,4.35 5.55,2.67T12,1q2.35,0 4.53,0.77T20.5,4.02V2H22V7H17V5.5h2.9q-1.65-1.45-3.68-2.23T12,2.5q-2.95,0-5.21,1.2T3.58,7H2ZM14.5,17Z"/>',
  swap_horiz: '<path d="M7,20L2,15l5-5l1.4,1.42L5.83,14H13v2H5.83L8.4,18.58L7,20Zm10-6l-1.4-1.43L18.18,10H11V8h7.18L15.6,5.43L17,4l5,5l-5,5Z"/>',
  ads_click: '<path d="M11.7,18q-2.4-0.13-4.05-1.85Q6,14.43 6,12Q6,9.5 7.75,7.75T12,6q2.43,0 4.15,1.65T18,11.7l-2.1-0.63q-0.32-1.35-1.4-2.21T12,8Q10.35,8 9.18,9.17T8,12q0,1.42 0.86,2.5t2.21,1.4L11.7,18Zm1.2,3.95Q12.68,22 12.45,22T12,22q-2.07,0-3.9-0.79q-1.82-0.79-3.17-2.14Q3.58,17.73 2.79,15.9T2,12Q2,9.92 2.79,8.1Q3.58,6.27 4.93,4.93Q6.28,3.57 8.1,2.79Q9.93,2 12,2t3.9,0.79t3.17,2.14q1.35,1.35 2.14,3.17Q22,9.92 22,12q0,0.22 0,0.45T21.95,12.9L20,12.3V12q0-3.35-2.32-5.68T12,4T6.33,6.32T4,12t2.33,5.68T12,20q0.08,0 0.15,0t0.15,0l0.6,1.95Zm7.63,0.55l-4.28-4.27L15,22L12,12l10,3l-3.77,1.25l4.27,4.27L20.53,22.5Z"/>',
  touch_long: '<path d="M10.48,22q-0.7,0-1.31-0.3T8.13,20.85L2.68,13.93l0.48-0.5q0.5-0.53 1.2-0.63t1.3,0.28L7.5,14.2V6q0-0.43 0.29-0.71T8.5,5Q8.93,5 9.23,5.29Q9.53,5.57 9.53,6V17.8L7.1,16.3l2.6,3.32q0.15,0.18 0.35,0.27T10.48,20H16q0.82,0 1.41-0.59T18,18V14q0-0.43-0.29-0.71T17,13H11.53V11H17q1.25,0 2.13,0.88T20,14v4q0,1.65-1.18,2.82T16,22H10.48Zm2.07-6.5ZM8.48,0q2.5,0 4.25,1.75T14.48,6q0,0.82-0.21,1.59T13.65,9.02l-1.3-0.75q0.3-0.5 0.46-1.07T12.98,6q0-1.88-1.31-3.19T8.48,1.5T5.29,2.81T3.98,6q0,0.63 0.15,1.2T4.58,8.27L3.28,9q-0.4-0.65-0.6-1.41T2.48,6q0-2.5 1.75-4.25T8.48,0Zm0,2.5q1.45,0 2.48,1.02T11.98,6q0,0.5-0.13,0.94T11.48,7.77l-1.3-0.75q0.13-0.22 0.2-0.49T10.45,6q0-0.82-0.59-1.41T8.45,4Q7.6,4 7.03,4.59Q6.45,5.18 6.45,6q0,0.27 0.08,0.54t0.2,0.49L5.43,7.77Q5.2,7.38 5.09,6.94T4.98,6q0-1.45 1.01-2.48T8.48,2.5Z"/>',
  animation: '<circle cx="6" cy="12" r="6" fill-opacity=".3"/><circle cx="12" cy="12" r="6" fill-opacity=".6"/><circle cx="18" cy="12" r="6"/>'
};
function qxSetIco(name){
  const el = mk("span", "set-ico"); el.setAttribute("aria-hidden", "true");
  if (QX_ICON_PATHS[name]) el.innerHTML = '<svg class="ms-svg-fill" viewBox="0 0 24 24" aria-hidden="true">' + QX_ICON_PATHS[name] + '</svg>';
  else el.textContent = "{{" + name + "}}";
  return el;
}
const QX_GESTURES = [
  { id: "swipe",    icon: "swap_horiz", label: "সোয়াইপ বাঁ/ডান",   hint: "পৃষ্ঠা বা স্ক্রিন বাঁ-ডানে সোয়াইপ করে নেভিগেট করুন" },
  { id: "dbl",      icon: "ads_click",  label: "ডাবল ট্যাপ",        hint: "ডাবল ট্যাপ করে দ্রুত কাজ সম্পন্ন করুন" },
  { id: "long",     icon: "touch_long", label: "লং প্রেস",           hint: "দীর্ঘক্ষণ চেপে ধরে অতিরিক্ত অপশন দেখুন" },
  { id: "ptr",      icon: "refresh",    label: "টেনে রিফ্রেশ",       hint: "স্ক্রিন নিচে টেনে রিফ্রেশ করুন" },
  { id: "homeEdit", icon: "home",       label: "হোমে লং প্রেস",      hint: "হোম বাটন লং প্রেস করে দ্রুত অ্যাকশন চালু করুন" }
];
function qxGestureCfg(){
  try{ return JSON.parse(localStorage.getItem("qxGestures") || "{}") || {}; }catch(e){ return {}; }
}
function qxGestureOn(id){ return qxGestureCfg()[id] !== false; }
function qxGestureApply(){ document.body.classList.toggle("qx-g-ptr", qxGestureOn("ptr")); }
function qxGestureSet(id, on){
  const c = qxGestureCfg(); c[id] = !!on;
  try{ localStorage.setItem("qxGestures", JSON.stringify(c)); }catch(e){}
  qxGestureApply();
}
qxGestureApply();

/* বর্তমান পেজ রিফ্রেশ: নামাজের সময় হলে নতুন করে হিসাব, নইলে বর্তমান পেজ আবার আঁকা */
function qxRefreshNow(){
  if (mode === "prayer" && typeof renderPrayer === "function") renderPrayer();
  else renderHome();
  if (typeof showToast === "function") showToast(mode === "prayer" ? "নামাজের সময় রিফ্রেশ হয়েছে" : "রিফ্রেশ হয়েছে");
}

/* কুরআন পড়ার পেজে পরের/আগের সূরা বা পারা খোলে। dir: +1 পরের, −1 আগের */
function qxReaderStep(dir){
  if (window.qxTopicOpen) return false;
  const r = (typeof reading !== "undefined" && reading) ? reading : {};
  let t = r.t || r.type || null;
  let n = Number(r.n != null ? r.n : (r.number != null ? r.number : r.id));
  if (!t || !isFinite(n)) {
    const set = new Set(Array.from(document.querySelectorAll(".ayah .ar[data-surah]")).map(el => el.dataset.surah));
    if (set.size === 1) { t = "s"; n = Number(Array.from(set)[0]); }
  }
  if (!isFinite(n) || n < 1) return false;
  if (t && ["s", "surah", "j", "juz"].indexOf(t) < 0) return false;
  const juz = t === "j" || t === "juz";
  const m = n + dir, max = juz ? 30 : 114;
  if (m < 1 || m > max) {
    if (typeof showToast === "function") showToast(dir > 0 ? (juz ? "এটাই শেষ পারা" : "এটাই শেষ সূরা") : (juz ? "এটাই প্রথম পারা" : "এটাই প্রথম সূরা"));
    return true;
  }
  try{ if (typeof saveScroll === "function") saveScroll(); }catch(e){}
  window.scrollTo(0, 0);
  if (juz) openJuz(m, 0); else openSurah(m, 0);
  return true;
}

/* সোয়াইপ: ১) কুরআন পড়ার পেজে পরের/আগের সূরা ২) শীর্ষ স্তরের পেজে নিচের ট্যাব বদল।
   অন্য ভিতরের পেজে আগের মতোই পিছনে যাওয়া (শুধু ইনস্টল করা অ্যাপে)। ইনপুট, স্লাইডার ও পাশে-স্ক্রল হয় এমন জায়গায় চলবে না। */
(function(){
  const standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true || !!window.Capacitor;
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
  function swipeNav(dx){
    if (!qxGestureOn("swipe")) return false;
    if (qxNav.ovPushed > 0 || document.querySelector(qxNav.overlaySelector)) return false;
    const dir = dx < 0 ? 1 : -1;               // বামে সোয়াইপ = পরের, ডানে = আগের
    const inReader = document.body.classList.contains("reader-active") && typeof reading !== "undefined" && reading;
    if (inReader) return qxReaderStep(dir);
    if ((typeof reading !== "undefined" && reading) || window.qxTopicOpen || window.qxNamazChapter || document.querySelector(".qx-dict-detail")) return false;
    const btns = Array.prototype.filter.call(document.querySelectorAll("#nav button"), b => b.offsetParent !== null);
    const cur = btns.findIndex(b => b.classList.contains("on"));
    if (cur < 0) return false;
    const isRoot = btns[cur].id === "navHome" ? (mode === "quran" && tab === "home") : btns[cur].dataset.m === mode;
    if (!isRoot) return false;
    const nb = btns[cur + dir];
    if (nb) nb.click();
    return true;                                // প্রথম/শেষ ট্যাবে কিছু হয় না, পিছনেও যায় না
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
    if (swipeNav(dx)) return;
    if (standalone) qxNav.swipeBack();
  }, { passive: true });
})();

/* টেনে রিফ্রেশ: পেজের একদম উপরে থাকলে নিচে টেনে ছাড়লে বর্তমান পেজ রিফ্রেশ হয় (কুরআন পড়ার পেজ ও পপআপে নয়) */
(function(){
  const TRIGGER = 60, MAXPULL = 100;
  let sy = 0, sx = 0, pulling = false, dist = 0, busy = false, ind = null;
  function indicator(){
    if (ind) return ind;
    ind = document.createElement("div"); ind.className = "qx-ptr"; ind.setAttribute("aria-hidden", "true");
    ind.innerHTML = '<span class="ms">refresh</span>';
    document.body.appendChild(ind);
    return ind;
  }
  function eligible(e){
    if (!qxGestureOn("ptr") || busy || e.touches.length !== 1) return false;
    if ((window.scrollY || document.documentElement.scrollTop) > 0) return false;
    if (document.body.classList.contains("reader-active") || (typeof reading !== "undefined" && reading)) return false;
    if (qxNav.ovPushed > 0 || document.querySelector(qxNav.overlaySelector)) return false;
    const dd = document.getElementById("gridDropdown"); if (dd && dd.classList.contains("open")) return false;
    for (let el = e.target; el && el !== document.body; el = el.parentElement) {
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "AUDIO") return false;
      if (el.hasAttribute && el.hasAttribute("data-no-swipe")) return false;
      if (el.scrollHeight > el.clientHeight + 4 && el.scrollTop > 0 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return false;
    }
    return true;
  }
  function reset(){
    pulling = false; dist = 0;
    if (ind) { ind.classList.add("snap"); ind.style.opacity = "0"; ind.style.transform = ""; }
  }
  document.addEventListener("touchstart", function(e){
    pulling = eligible(e);
    if (!pulling) return;
    sy = e.touches[0].clientY; sx = e.touches[0].clientX; dist = 0;
    if (ind) ind.classList.remove("snap");
  }, { passive: true });
  document.addEventListener("touchmove", function(e){
    if (!pulling) return;
    const t = e.touches[0], dy = t.clientY - sy, dx = t.clientX - sx;
    if (dy <= 0 || Math.abs(dx) > dy || (window.scrollY || 0) > 0) { if (dist > 0) reset(); else pulling = false; return; }
    if (e.cancelable) e.preventDefault();
    dist = Math.min(MAXPULL, dy * 0.6);
    const el = indicator();
    el.classList.remove("snap", "spin");
    el.style.opacity = String(Math.min(1, dist / 40));
    el.style.transform = "translateY(" + (-60 + dist * 1.3) + "px)";
    el.firstChild.style.transform = "rotate(" + Math.min(180, dist / TRIGGER * 180) + "deg)";
  }, { passive: false });
  function end(){
    if (!pulling) return;
    const fire = dist >= TRIGGER;
    pulling = false;
    if (!fire) { reset(); return; }
    busy = true;
    const el = indicator();
    el.classList.add("snap", "spin"); el.style.transform = "translateY(18px)"; el.style.opacity = "1";
    try{ if (navigator.vibrate) navigator.vibrate(12); }catch(e){}
    setTimeout(function(){
      try{ qxRefreshNow(); }catch(e){}
      setTimeout(function(){ el.classList.remove("spin"); el.firstChild.style.transform = ""; reset(); busy = false; }, 500);
    }, 150);
  }
  document.addEventListener("touchend", end, { passive: true });
  document.addEventListener("touchcancel", function(){ if (pulling) reset(); }, { passive: true });
})();

/* ডাবল ট্যাপ (আয়াত সংরক্ষণ), লং প্রেস (আয়াতের ⋯ মেনু) এবং হোম/আরও পেজে লং প্রেস (ড্যাশবোর্ড সাজান) */
(function(){
  const LONG_MS = 550, EDIT_MS = 650, TOL = 10, DBL_MS = 320;
  let timer = null, px = 0, py = 0, fired = 0;
  let lastClick = { t: 0, x: 0, y: 0, card: null };
  const SKIP = "button, a, input, textarea, select, audio, label, .ww-word, .ayah-menu, [data-no-gesture]";
  function cancel(){ if (timer) { clearTimeout(timer); timer = null; } }
  function clearSel(){ try{ const sel = window.getSelection && window.getSelection(); if (sel && sel.removeAllRanges) sel.removeAllRanges(); }catch(e){} }
  function buzz(){ try{ if (navigator.vibrate) navigator.vibrate(15); }catch(e){} }

  document.addEventListener("pointerdown", function(e){
    cancel();
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const t = e.target; if (!t || !t.closest) return;
    px = e.clientX; py = e.clientY;
    const card = t.closest(".ayah");
    if (card) {
      if (!qxGestureOn("long") || t.closest(SKIP)) return;
      timer = setTimeout(function(){
        timer = null;
        const more = card.querySelector(".ayah-actions > .more-btn");
        if (!more) return;
        fired = Date.now(); buzz(); clearSel(); more.click();
      }, LONG_MS);
      return;
    }
    const appEl = document.getElementById("app");
    if (!appEl || !appEl.contains(t) || !qxGestureOn("homeEdit")) return;
    if (t.closest("input, textarea, select, audio, [data-no-gesture]")) return;
    const ctx = window.qxPageEditCtx;
    if (!ctx || !appEl.querySelector(".qx-page-tools")) return;
    if (qxNav.ovPushed > 0 || document.querySelector(qxNav.overlaySelector)) return;
    timer = setTimeout(function(){
      timer = null; fired = Date.now(); buzz(); clearSel();
      qxOpenCardSheet(ctx.page, ctx.groups, ctx.onChange);
    }, EDIT_MS);
  }, true);
  document.addEventListener("pointermove", function(e){
    if (timer && (Math.abs(e.clientX - px) > TOL || Math.abs(e.clientY - py) > TOL)) cancel();
  }, true);
  ["pointerup", "pointercancel", "scroll"].forEach(function(ev){ document.addEventListener(ev, cancel, true); });

  /* লং প্রেসের পরের ক্লিক আর কনটেক্সট মেনু আটকানো */
  document.addEventListener("click", function(e){
    if (fired && Date.now() - fired < 500) { e.preventDefault(); e.stopPropagation(); fired = 0; lastClick.t = 0; }
  }, true);
  document.addEventListener("contextmenu", function(e){
    if (fired && Date.now() - fired < 1200) e.preventDefault();
  }, true);

  /* ডাবল ট্যাপ: মাউসের ডাবল ক্লিক আর টাচের দুবার ট্যাপ দুটোই এখানে ধরা পড়ে */
  document.addEventListener("click", function(e){
    if (!qxGestureOn("dbl")) return;
    const t = e.target; if (!t || !t.closest || t.closest(SKIP)) return;
    const card = t.closest(".ayah"); if (!card) { lastClick.t = 0; return; }
    const now = Date.now();
    const same = lastClick.card === card && now - lastClick.t < DBL_MS && Math.abs(e.clientX - lastClick.x) < 30 && Math.abs(e.clientY - lastClick.y) < 30;
    if (!same) { lastClick = { t: now, x: e.clientX, y: e.clientY, card: card }; return; }
    lastClick.t = 0;
    const star = card.querySelector(".ayah-actions > .star");
    if (!star) return;
    clearSel(); star.click();
    card.classList.remove("qx-dbl-pulse"); void card.offsetWidth; card.classList.add("qx-dbl-pulse");
  });
})();
// [GESTURES: swipe, pull-to-refresh, long-press] end

// [ANDROID-BACK (Capacitor)] start
// Capacitor (Android) হার্ডওয়্যার back বাটন
try {
  const CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (CapApp && CapApp.addListener) {
    CapApp.addListener("backButton", () => { if (!handleBackNavigation() && CapApp.exitApp) CapApp.exitApp(); });
  }
} catch(e){}
// [ANDROID-BACK (Capacitor)] end

// Backup & Restore Utilities
// [UTILS: escape, clean data, timezone, ISO date] start
function qxEscapeHtml(str){
  const d=document.createElement('div'); d.textContent=String(str??''); return d.innerHTML;
}
function safeHtmlAllowIcons(str){
  const tmp=String(str??'').replace(/\{\{([a-z_0-9]+)(:f)?\}\}/g, (_,n,f)=>'%%QXICO_'+n+(f||'')+'%%');
  const esc=qxEscapeHtml(tmp);
  return esc.replace(/%%QXICO_([a-z_0-9]+)(:f)?%%/g, (_,n,f)=>{ try{ return qxIco(n,f); }catch(e){ return ''; } });
}

/* P9 v2.0.32 — F-01/F-02: ব্যাকআপ যাচাই ও পরিষ্কার */
const QX_BACKUP_MAX_BYTES = 5 * 1024 * 1024;
/* tzMode: "auto" বা -12..14 সংখ্যা। select-এর মতো string-এ রাখা হয় ("6", "5.5") */
function qxNormTz(v){
  if (v === "auto") return "auto";
  if (typeof v !== "string" && typeof v !== "number") return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < -12 || n > 14) return null;
  return String(n);
}
/* নোট: কী "সূরা:আয়াত", মান string। ভুল এন্ট্রি বাদ যায়, বাকি থাকে */
function qxCleanNotes(n){
  if (!n || typeof n !== "object" || Array.isArray(n)) return undefined;
  const out = {};
  let c = 0;
  for (const k of Object.keys(n)) {
    if (!/^\d{1,3}:\d{1,3}$/.test(k)) continue;
    if (typeof n[k] !== "string") continue;
    const t = n[k].trim().slice(0, 50000);
    if (!t) continue;
    out[k] = t;
    if (++c >= 7000) break;
  }
  return out;
}
/* লক্ষ্য: readKeys string-এর array না হলে পুরো goal বাদ (আগের মতো) */
function qxCleanGoal(g){
  if (!g || typeof g !== "object" || Array.isArray(g) || !Array.isArray(g.readKeys)) return undefined;
  const seen = new Set();
  const keys = [];
  for (const k of g.readKeys) {
    if (typeof k !== "string" || k.length > 20 || seen.has(k)) continue;
    seen.add(k);
    keys.push(k);
    if (keys.length >= 7000) break;
  }
  const target = Number.isFinite(g.target) && g.target >= 1 && g.target <= 1000 ? Math.floor(g.target) : 10;
  const date = typeof g.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(g.date) ? g.date : todayStr();
  return { target: target, date: date, readKeys: keys };
}
/* আজান অ্যালার্ট: অ্যাপ চালুর সময়কার normalize-এর মতোই */
function qxCleanAlerts(x){
  if (!x || typeof x !== "object" || Array.isArray(x)) return undefined;
  if (!x.prayers || typeof x.prayers !== "object" || Array.isArray(x.prayers)) return undefined;
  const p = {};
  ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach(k => { p[k] = x.prayers[k] !== false; });
  return {
    enabled: x.enabled === true,
    sound: ["adhan", "beep", "silent"].includes(x.sound) ? x.sound : "adhan",
    prayers: p
  };
}

function getLocalISO(){
  const d = new Date();
  const tzOffset = -d.getTimezoneOffset();
  const sign = tzOffset >= 0 ? '+' : '-';
  const pad = n => String(Math.floor(Math.abs(n))).padStart(2,'0');
  const hh = pad(tzOffset/60), mm = pad(tzOffset%60);
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())+sign+hh+':'+mm;
}
// [UTILS: escape, clean data, timezone, ISO date] end

// [BACKUP-RESTORE: export, import, reset] start
async function exportUserBackup(){
  const backup = {
    app: "Quranix",
    version: 4,
    exportedAt: getLocalISO(),
    exportedAtUTC: new Date().toISOString(),
    tz: (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : ''),
    tzOffsetMinutes: -new Date().getTimezoneOffset(),
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
      tracker: lsGet("quranix_tracker", null),
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
    if(d.tzMode !== undefined){ const tzN = qxNormTz(d.tzMode); if(tzN === null) return null; d.tzMode = tzN; }
    if(d.dstAdd !== undefined && !Number.isFinite(d.dstAdd)) return null;
    if(d.fs !== undefined && (!Number.isFinite(d.fs) || d.fs < 20 || d.fs > 48)) return null;
    if(d.theme !== undefined && d.theme !== null && d.theme !== "dark" && d.theme !== "light") return null;
    if(d.appPrefs !== undefined && (!d.appPrefs || typeof d.appPrefs !== "object" || Array.isArray(d.appPrefs))) return null;
    if(d.notes !== undefined) d.notes = qxCleanNotes(d.notes);
    if(d.goal !== undefined) d.goal = qxCleanGoal(d.goal);
    if(d.prayerAlerts !== undefined) d.prayerAlerts = qxCleanAlerts(d.prayerAlerts);
    return parsed;
  }catch(e){
    return null;
  }
}
window.qxSafeParseBackup = qxSafeParseBackup;

function importUserBackup(file, onDone){
  if(!file) return;
  if(file.size > QX_BACKUP_MAX_BYTES){
    showToast("ব্যাকআপ ফাইল অনেক বড় (সর্বোচ্চ ৫ MB)। সঠিক Quranix ব্যাকআপ দিন।");
    return;
  }
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
    if(typeof d.tzMode === "string") add("tzMode", d.tzMode);
    if(Number.isFinite(d.dstAdd)) add("dstAdd", d.dstAdd);
    if(d.prayerAlerts && d.prayerAlerts.prayers && typeof d.prayerAlerts.prayers === "object") add("prayerAlerts", d.prayerAlerts);
    if(d.tracker && typeof d.tracker === "object" && !Array.isArray(d.tracker)) {
      const trackerSafe = {
        namaz: d.tracker.namaz && typeof d.tracker.namaz === "object" && !Array.isArray(d.tracker.namaz) ? d.tracker.namaz : {},
        roza: d.tracker.roza && typeof d.tracker.roza === "object" && !Array.isArray(d.tracker.roza) ? d.tracker.roza : {},
        dhikr: d.tracker.dhikr && typeof d.tracker.dhikr === "object" && !Array.isArray(d.tracker.dhikr) ? d.tracker.dhikr : {},
        habits: Array.isArray(d.tracker.habits) ? d.tracker.habits.filter(h => h && typeof h === "object" && typeof h.name === "string").slice(0,100) : []
      };
      add("quranix_tracker", trackerSafe);
    }
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
    if(typeof d.tzMode === "string") tzMode = d.tzMode;
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
// [BACKUP-RESTORE: export, import, reset] end

// Onboarding / User Guide Modal
// [MODAL: Help] start
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
    ["{{i_quran}} অফলাইন কুরআন", "আরবি পাঠ ও মুহিউদ্দীন খানের অনুবাদসহ ১১৪টি সূরা ও ৩০ পারা ইন্টারনেট ছাড়াই পড়ুন (তাফসির, অডিও ও ড. যাকারিয়ার অনুবাদে ইন্টারনেট লাগবে)। আয়াতের পাশের বোতাম থেকে কপি, শেয়ার, বুকমার্ক ({{star}}), ব্যক্তিগত নোট ({{edit}}) ও তাফসির ({{menu_book}}) পাবেন।"],
    ["{{volume_up}} অডিও তেলাওয়াত ও স্পিড", "যেকোনো আয়াতের {{volume_up}} চাপলে তেলাওয়াত শুরু হবে। নিচের প্লেয়ার বার থেকে ক্বারী, প্লেব্যাক স্পিড (1x–1.5x) ও অটো-প্লে নিয়ন্ত্রণ করা যায়।"],
    ["{{i_mosque}} নামাজ, কিবলা ও আজান অ্যালার্ট", "নিচের 'নামাজ' ট্যাবে গিয়ে GPS বা ম্যানুয়াল লোকেশন, হিসাব পদ্ধতি (করাচি/MWL/ইসনা), কিবলা কম্পাস এবং ওয়াক্তের অ্যালার্ট সেট করতে পারবেন।"],
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
// [MODAL: Help] end

// Comprehensive Settings Modal (Phase 4)
// [MODAL: Settings] start
function openSettingsModal() {
  const dd = document.getElementById("gridDropdown"), gm = document.getElementById("gridMenu");
  if (!dd) return;
  dd.querySelectorAll(".g-settings-panel").forEach(function(el){ el.remove(); });
  if (!dd.classList.contains("open") && gm) gm.click();
  const content = document.createElement("div"); content.className = "g-settings-panel"; content.setAttribute("role", "group"); content.setAttribute("aria-label", "কাস্টমাইজেশন");

  const header = document.createElement("div"); header.className = "settings-modal-header";
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

  // Collapsible section: <details> + <summary>, three parts (font, translation/tafsir/audio, gesture/animation)
  function accSection(title, ico) {
    const sec = document.createElement("details"); sec.className = "set-sec";
    const sum = mk("summary", "set-title");
    if (ico) { sum.appendChild(qxSetIco(ico)); sum.appendChild(document.createTextNode(title)); }
    else sum.textContent = title;
    sec.appendChild(sum);
    return sec;
  }

  // 1. Font: app size, text size, font change
  const accSec = accSection("{{text_fields}} ফন্ট কাস্টমাইজেশন");

  accSec.appendChild(fontField("অ্যাপের সাইজ", [
    ["lite", "Lite (সবচেয়ে বড়)"],
    ["medium", "Medium"],
    ["small", "Small (এখনকার সাইজ)"]
  ], (val) => (appPrefs.uiSize || "small") === val, (val) => {
    appPrefs.uiSize = val; lsSet("appPrefs", appPrefs); applyAppPrefs();
  }));

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

  body.appendChild(accSec);

  // 2. Translation, tafsir, audio
  const transSec = accSection("{{translate}} অনুবাদ, তাফসির ও অডিও");
  transSec.appendChild(fontField("অনুবাদ", [
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
  transSec.appendChild(fontField("তাফসির", (typeof TAFSIRS !== 'undefined' ? TAFSIRS : []),
    (id) => id === (typeof tafsirId !== 'undefined' ? tafsirId : 381),
    (val) => {
      if (typeof tafsirId !== 'undefined') {
        tafsirId = parseInt(val, 10);
        lsSet('tafsirId', tafsirId);
        if (typeof refreshMinis === 'function') refreshMinis();
        showToast("তাফসির পরিবর্তন করা হয়েছে");
      }
    }));
  transSec.appendChild(fontField("তেলাওয়াতকারী (অডিও)", (typeof RECITERS !== 'undefined' ? RECITERS : []),
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
  body.appendChild(transSec);

  // 3. Gesture and animation (small switches at the right; gesture rows come from the QX_GESTURES list)
  const gesSec = accSection("জেসচার ও অ্যানিমেশন", "swipe_right");
  QX_GESTURES.forEach(g => {
    const row = mk("label", "set-row");
    const lab = mk("span", "set-label", g.label);
    lab.appendChild(mk("small", "qx-g-hint", g.hint));
    const sw = document.createElement("input");
    sw.type = "checkbox"; sw.className = "set-switch"; sw.checked = qxGestureOn(g.id);
    sw.setAttribute("aria-label", g.label);
    sw.onchange = () => qxGestureSet(g.id, sw.checked);
    row.appendChild(qxSetIco(g.icon)); row.appendChild(lab); row.appendChild(sw);
    gesSec.appendChild(row);
  });
  const motionRow = mk("label", "set-row");
  const motionLab = mk("span", "set-label", "অ্যানিমেশন কম");
  motionLab.appendChild(mk("small", "qx-g-hint", "অ্যানিমেশন কমিয়ে কর্মক্ষমতা ও ব্যাটারি সাশ্রয় করুন"));
  motionRow.appendChild(qxSetIco("animation"));
  motionRow.appendChild(motionLab);
  const motionToggle = document.createElement("input");
  motionToggle.type = "checkbox"; motionToggle.className = "set-switch"; motionToggle.checked = !!appPrefs.reducedMotion;
  motionToggle.setAttribute("aria-label", "অ্যানিমেশন কম");
  motionToggle.onchange = () => { appPrefs.reducedMotion = motionToggle.checked; lsSet("appPrefs", appPrefs); applyAppPrefs(); };
  motionRow.appendChild(motionToggle);
  gesSec.appendChild(motionRow);
  body.appendChild(gesSec);

  content.appendChild(body);
  dd.classList.add("g-settings-view");
  dd.appendChild(content);
  dd.scrollTop = 0;
  document.addEventListener("keydown", onSettingsKeydown);
}
// [MODAL: Settings] end

// [PRAYER-ALERT-CHECK (+ 5s timer)] start
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
// [PRAYER-ALERT-CHECK (+ 5s timer)] end

// [APP-INIT (restore view/nav)] start
(async function init(){
  qxRestoreView();
  qxRestoreNav();
  qxNavHighlight(mode);
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
// [APP-INIT (restore view/nav)] end




// [MORE-MENU + POPUPS: grid menu, search, filters, settings popups, home hero] start
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
    else if(type==='fullaudio'){ closePopup(); if(typeof window.qxOpenFullSurahAudioPage==='function') window.qxOpenFullSurahAudioPage(); }
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
    if(window.isInApp && window.isInApp()){ overlay.classList.remove('open'); return; }
    var installed=!!(window.quranixIsInstalled && window.quranixIsInstalled());
    var ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    var android=/Android/i.test(navigator.userAgent);
    var mobile=ios||android;
    var title='{{smartphone}} Quranix অ্যাপ';
    var mobileSteps=ios
      ? '<div class="pp-mini">Safari-তে Share <b>{{share}}</b> → Add to Home Screen → Add চাপুন। iPhone-এ ব্রাউজারের নিজস্ব নিয়মে ইনস্টল করতে হয়।</div>'
      : '<div class="pp-mini">Install বাটনে চাপুন। প্রম্পট না এলে Chrome-এর ⋮ মেনু → Add to Home screen নির্বাচন করুন।</div>';
    var pcSteps='<div class="pp-mini">Install বাটনে চাপুন অথবা Chrome, Firefox বা Edge-এ URL bar → Install app বাটনে চাপুন।</div>';
    var content=installed
      ? '<div class="pp-mini" style="text-align:center;padding:12px 4px">Quranix ইতিমধ্যে এই ডিভাইসে ইনস্টল করা আছে। নিচের বাটনে চাপ দিয়ে অ্যাপ খুলুন।</div>'
      : '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:10px 0 12px">'
        +'<div style="border:1px solid var(--qx-border);border-radius:var(--qx-radius-lg);padding:12px 9px;background:var(--qx-card-bg)"><div style="font-size:25px;text-align:center;color:var(--qx-main-color);margin-bottom:5px">{{smartphone}}</div><b style="display:block;text-align:center;font-size:var(--qx-fs-md);margin-bottom:6px">মোবাইল</b>'+mobileSteps+'</div>'
        +'<div style="border:1px solid var(--qx-border);border-radius:var(--qx-radius-lg);padding:12px 9px;background:var(--qx-card-bg)"><div style="font-size:25px;text-align:center;color:var(--qx-main-color);margin-bottom:5px"><svg class="ms-svg" viewBox="0 0 24 24" style="font-size:1em" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg></div><b style="display:block;text-align:center;font-size:var(--qx-fs-md);margin-bottom:6px">ল্যাপটপ</b>'+pcSteps+'</div>'
        +'</div><p class="pp-mini" style="margin:0 0 10px">*ইনস্টল বাটন কাজ করতে ব্রাউজারে PWA install সমর্থিত হতে হবে।</p>';
    box.innerHTML=head(title)+'<div style="text-align:center;padding:8px 0 4px"><div style="width:54px;height:54px;margin:0 auto 9px;border-radius:var(--qx-radius-lg);background:var(--qx-main-color);color:var(--qx-on-main);display:grid;place-items:center;font-size:26px">{{download}}</div><b>অফলাইনে পড়ুন</b><p class="pp-mini">মোবাইল বা ডেস্কটপে Quranix ইনস্টল করে অ্যাপের মতো ব্যবহার করুন।</p></div>'+content+(!installed?'<button class="pp-btn" id="quranixPopupInstall">{{download}} ইনস্টল করুন</button>':'<button class="pp-btn" id="quranixPopupOpen">{{smartphone}} অ্যাপ খুলুন</button>');
    var openButton=box.querySelector('#quranixPopupOpen');
    if(openButton) openButton.onclick=function(){ if(window.quranixOpenApp) window.quranixOpenApp(); };
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
    var labels={all:'সব সূরা',Meccan:'মাক্কী',Medinan:'মাদানী',juz:'পারা',topic:'বিষয়ভিত্তিক আয়াত',dict:'শব্দার্থ',bm:'সংরক্ষিত'};
    var html=head('{{filter_list}} সূরা ফিল্টার');
    ['all','topic','dict','juz','Meccan','Medinan','bm'].forEach(function(k){
      html+='<button type="button" class="pp-opt'+(tab===k?' on':'')+'" data-tab="'+k+'" aria-pressed="'+(tab===k?'true':'false')+'">'+labels[k]+'<span aria-hidden="true">'+(tab===k?'{{check}}':'')+'</span></button>';
    });
    box.innerHTML=html;
    box.querySelectorAll('[data-tab]').forEach(function(el){ el.onclick=function(){ tab=el.dataset.tab; if(qEl) qEl.value=''; if(typeof renderTabs==='function') renderTabs(); if(typeof renderHome==='function') renderHome(); refreshMinis(); closePopup(); }; });
    var selectedOption=box.querySelector('[data-tab="'+tab+'"]');
    if(selectedOption) selectedOption.focus();
  }
  function refreshMinis(){
    var labels={all:'সব সূরা',Meccan:'মাক্কী',Medinan:'মাদানী',juz:'পারা',topic:'বিষয়ভিত্তিক আয়াত',dict:'শব্দার্থ',bm:'সংরক্ষিত'};
    const activeTab=(typeof mode!=='undefined'&&mode==='saved')?'bm':tab;
    const f = document.getElementById('gFilterMini'); if(f) f.textContent=(labels[activeTab]||'সব সূরা')+' {{chevron_right}}';
    var v=transOrig?transOrig.value:'bn.bengali'; const t = document.getElementById('gTransMini'); if(t) t.textContent=(v==='bn.zakaria'?'ড. আবু বকর যাকারিয়া':'মুহিউদ্দীন খান')+' {{chevron_right}}';
    var tf=TAFSIRS.find(function(x){return x[0]===tafsirId}); const tm = document.getElementById('gTafsirMini'); if(tm) tm.textContent=(tf?tf[1]:'')+' {{chevron_right}}';
    var cur=(typeof currentReciter!=='undefined')?currentReciter:'Saood_ash-Shuraym_128kbps'; try{cur=JSON.parse(cur);}catch(e){} var rn=(typeof getReciterName==='function')?getReciterName(cur):cur; const r = document.getElementById('gReciterMini'); if(r) r.textContent=rn+' {{chevron_right}}';
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
    function getFs(){ try{ return parseInt(localStorage.getItem('fs'))||30; }catch(e){ return 30; } }
  function renderFontPopup(){
    var arFs=getFs(); var bnFs=(typeof appPrefs!=='undefined'&&appPrefs.bnFs)?appPrefs.bnFs:16;
    var uiPct=(appPrefs.uiSize==='lite'?125:(appPrefs.uiSize==='medium'?112:100));
    var curArName=(function(){ try{ var f=AR_FONTS.find(function(x){return x[0]===appPrefs.arFont;}); return f?f[1]:'Amiri Quran'; }catch(e){ return 'Amiri Quran'; } })();
    var curBnName=(function(){ try{ var f=BN_FONTS.find(function(x){return x[0]===appPrefs.bnFont;}); return f?f[1]:'Hind Siliguri'; }catch(e){ return 'Hind Siliguri'; } })();
    box.innerHTML=head('{{text_fields}} ফন্ট সেটিংস') +
      '<div class="qx-ios-sec">SIZE</div>' +
      '<div class="qx-ios-card">' +
        '<div class="qx-ios-row"><b>App Size</b><div class="qx-ios-ctrl"><button class="qx-ios-btn" id="ppAppMinus">−</button><span>'+uiPct+'%</span><button class="qx-ios-btn" id="ppAppPlus">+</button></div></div>' +
        '<div class="qx-ios-row"><b>Arabic Size</b><div class="qx-ios-ctrl"><span>'+arFs+'px</span><button class="qx-ios-btn" id="ppArMinus">A-</button><button class="qx-ios-btn" id="ppArPlus">A+</button></div></div>' +
        '<div class="qx-ios-row"><b>Bengali Size</b><div class="qx-ios-ctrl"><span>'+bnFs+'px</span><button class="qx-ios-btn" id="ppBnMinus">অ-</button><button class="qx-ios-btn" id="ppBnPlus">অ+</button></div></div>' +
      '</div>' +
      '<div class="qx-ios-sec">FONT</div>' +
      '<div class="qx-ios-card">' +
        '<button class="qx-ios-row" id="ppArFontRow" style="width:100%;border:0;text-align:left;cursor:pointer"><b>Arabic Font</b><span class="qx-ios-link"><small>'+curArName+'</small><span class="ms qx-ios-chev">chevron_right</span></span></button>' +
        '<button class="qx-ios-row" id="ppBnFontRow" style="width:100%;border:0;text-align:left;cursor:pointer"><b>Bengali Font</b><span class="qx-ios-link"><small>'+curBnName+'</small><span class="ms qx-ios-chev">chevron_right</span></span></button>' +
      '</div>';
    document.getElementById('ppAppMinus').onclick=function(){
      var order=['small','medium','lite']; var idx=order.indexOf(appPrefs.uiSize||'small'); if(idx>0){ appPrefs.uiSize=order[idx-1]; lsSet('appPrefs',appPrefs); applyAppPrefs(); renderFontPopup(); }
    };
    document.getElementById('ppAppPlus').onclick=function(){
      var order=['small','medium','lite']; var idx=order.indexOf(appPrefs.uiSize||'small'); if(idx<order.length-1){ appPrefs.uiSize=order[idx+1]; lsSet('appPrefs',appPrefs); applyAppPrefs(); renderFontPopup(); }
    };
    document.getElementById('ppArMinus').onclick=function(){ var v=Math.max(20,getFs()-2); localStorage.setItem('fs', String(v)); document.documentElement.style.setProperty('--qx-fs-ar', v+'px'); renderFontPopup(); };
    document.getElementById('ppArPlus').onclick=function(){ var v=Math.min(48,getFs()+2); localStorage.setItem('fs', String(v)); document.documentElement.style.setProperty('--qx-fs-ar', v+'px'); renderFontPopup(); };
    document.getElementById('ppBnMinus').onclick=function(){ if(typeof appPrefs==='undefined') return; appPrefs.bnFs=Math.max(13,(appPrefs.bnFs||16)-1); lsSet('appPrefs',appPrefs); applyAppPrefs(); renderFontPopup(); };
    document.getElementById('ppBnPlus').onclick=function(){ if(typeof appPrefs==='undefined') return; appPrefs.bnFs=Math.min(24,(appPrefs.bnFs||16)+1); lsSet('appPrefs',appPrefs); applyAppPrefs(); renderFontPopup(); };
    document.getElementById('ppArFontRow').onclick=function(){ renderFontListPopup('ar'); };
    document.getElementById('ppBnFontRow').onclick=function(){ renderFontListPopup('bn'); };
  }
  function renderFontListPopup(kind){
    var list=(kind==='ar'?AR_FONTS:BN_FONTS); var cur=(kind==='ar'?appPrefs.arFont:appPrefs.bnFont);
    var title=(kind==='ar'?'Arabic Font':'Bengali Font');
    var html=head('{{font_download}} '+title) + '<div class="qx-ios-card">';
    list.forEach(function(f){
      var on=(f[0]===cur);
      html+='<button class="qx-ios-row" data-v="'+f[0].replace(/"/g,'&quot;')+'" style="width:100%;border:0;text-align:left;cursor:pointer;'+(on?'background:#f0fdfa':'')+'"><b>'+f[1]+'</b><span class="qx-ios-link">'+(on?'<span class="ms" style="color:#0F766E">check</span>':'')+'<span class="ms qx-ios-chev">chevron_right</span></span></button>';
    });
    html+='</div><div style="height:12px"></div><button class="pp-btn" id="ppFontBack" style="background:#fff;color:#000;border:1px solid var(--qx-border)">পেছনে</button>';
    box.innerHTML=html;
    box.querySelectorAll('.qx-ios-row[data-v]').forEach(function(btn){
      btn.onclick=function(){
        var v=this.getAttribute('data-v');
        if(kind==='ar') appPrefs.arFont=v; else appPrefs.bnFont=v;
        lsSet('appPrefs',appPrefs); applyAppPrefs(); renderFontPopup();
      };
    });
    document.getElementById('ppFontBack').onclick=function(){ renderFontPopup(); };
  }

  // ---- BACKUP / SOURCE ----
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
    appEl.querySelectorAll('.home-tiles,.home-browse-nav,.home-browse-heading,.home-section-title,.home-quick-actions,.qx-page-tools').forEach(function(el){el.remove();});
    var browse=document.createElement('section'); browse.className='home-browse-nav'+(tab==='home'?'':' is-sticky'); browse.setAttribute('role','group'); browse.setAttribute('aria-label','কুরআন ব্রাউজ করুন');
    var browseItems=[['all','সব সূরা'],['topic','বিষয়ভিত্তিক আয়াত'],['dict','শব্দার্থ'],['juz','পারা'],['Meccan','মাক্কী'],['Medinan','মাদানী']];
    browseItems.forEach(function(pair){
      var b=document.createElement('button'); b.type='button'; b.textContent=pair[1]; b.setAttribute('aria-pressed',tab===pair[0]?'true':'false');
      if(tab===pair[0]){b.className='on';b.setAttribute('aria-current','page');}
      b.onclick=function(){tab=pair[0];if(qEl)qEl.value='';if(typeof renderTabs==='function')renderTabs();if(typeof renderHome==='function')renderHome();window.scrollTo(0,0);};
      browse.appendChild(b);
    });
    if(tab!=='home'){ appEl.prepend(browse); return; }

    var lastNm='আল-ফাতিহা'; var lastMeta='এখনই কুরআন পড়া শুরু করুন'; var lastAction=function(){ openSurah(1); };
    try{
      if(typeof last!=='undefined' && last){
        var sn=(typeof surahs!=='undefined')?surahs.find(function(x){return x.number===last.n}):null;
        if(last.t==='s'){
          lastNm=sn?sn.englishName:'সূরা '+toBn(last.n);
          lastMeta=(sn&&sn.name?sn.name+' · ':'')+(last.y>0?'আগের সংরক্ষিত অবস্থান থেকে চালিয়ে যান':'এই সূরার শুরু থেকে পড়ুন');
          lastAction=function(){ openSurah(last.n, last.y); };
        } else { lastNm='পারা '+toBn(last.n); lastMeta=last.y>0?'আগের সংরক্ষিত অবস্থান থেকে চালিয়ে যান':'এই পারার শুরু থেকে পড়ুন'; lastAction=function(){ openJuz(last.n, last.y); }; }
      }
    }catch(e){}
    var cnt=0, tgt=10; try{ if(typeof goalData!=='undefined'){ if(goalData.date===todayStr()) cnt=goalData.readKeys?goalData.readKeys.length:0; tgt=goalData.target||10; } }catch(e){}

    var qTitle=document.createElement('div'); qTitle.className='home-section-title'; qTitle.textContent='শর্টকাট';
    var quick=document.createElement('div'); quick.className='home-quick-actions';
    var defs=[
      ['history','শেষ পড়া',lastNm,lastAction],
      ['today','আজকের পড়া',toBn(cnt)+'/'+toBn(tgt)+' আয়াত',function(){ openTodaySheet(); }],
      ['bookmark','সংরক্ষিত','বুকমার্ক ও ফেভারিট',function(){ setMode('saved'); }],
      ['tracker','ট্র্যাকার','দৈনিক অগ্রগতি',function(){ setMode('tracker'); }]
    ];
    var icons={history:'history',today:'event',bookmark:'bookmark',tracker:'bar_chart'};
    var homeView=qxPageView('home');
    quick.className+=' qx-vw-'+homeView;
    var qVis=qxPageArrange('home',defs.map(function(d){return {id:d[0],d:d};})).visible;
    qVis.forEach(function(o){ var d=o.d;
      var b=document.createElement('button'); b.type='button'; b.className='home-quick-btn';
      b.innerHTML=''+qxIco(icons[d[0]])+'<span class="home-quick-copy"><b>'+d[1]+'</b><small>'+d[2]+'</small></span><span class="ms home-quick-go" aria-hidden="true">chevron_right</span>';
      b.setAttribute('aria-label',d[1]+': '+d[2]); b.onclick=d[3]; quick.appendChild(b);
    });

    var cTitle=document.createElement('div'); cTitle.className='home-section-title'; cTitle.textContent='বিষয়ভিত্তিক বিভাগ';
    var row=document.createElement('div'); row.className='home-tiles home-category-grid';
    var navGo=function(m){ return function(){ if(m==='quran'){tab='all';if(typeof renderTabs==='function')renderTabs();setMode('quran');}else setMode(m); }; };
    var cats=[
      ['i_quran','কুরআন','সূরা ও পারা',navGo('quran')],
      ['i_hadith','হাদিস','হাদিস সংকলন',navGo('hadith')],
      ['i_mosque','নামাজ','সময় ও শিক্ষা',navGo('prayer')],
      ['i_ramadan','রমজান','রোজা ও আমল',function(){ setMode('ramadan'); }],
      ['i_kalima','কালিমা','ঈমানের ঘোষণা',function(){ setMode('kalima'); }],
      ['i_dua','দোয়া ও তাসবিহ','দোয়া ও যিকির',navGo('dua')]
    ];
    row.className+=' qx-vw-'+homeView;
    var cVis=qxPageArrange('home',cats.map(function(d){return {id:d[0],d:d};})).visible;
    cVis.forEach(function(o){ var d=o.d;
      var t=document.createElement('button'); t.type='button'; t.className='home-tile';
      t.setAttribute('aria-label',d[1]+': '+d[2]);
      t.innerHTML='<span class="t-ic">'+qxIco(d[0])+'</span><span class="tile-copy"><strong>'+d[1]+'</strong><small>'+d[2]+'</small></span>';
      t.onclick=d[3]; row.appendChild(t);
    });
    var tools=qxPageTools('home',[
      {title:'শর্টকাট',items:defs.map(function(d){return {id:d[0],title:d[1],icon:icons[d[0]]};})},
      {title:'বিষয়ভিত্তিক বিভাগ',items:cats.map(function(d){return {id:d[0],title:d[1],icon:d[0]};})}
    ],function(){ buildHero(); });
    var nodes=[tools];
    if(qVis.length){ nodes.push(qTitle,quick); }
    if(cVis.length){ nodes.push(cTitle,row); }
    for(var ni=nodes.length-1;ni>=0;ni--) appEl.prepend(nodes[ni]);
  }
  if(origRenderQuranHome){ window.renderQuranHome=function(){ origRenderQuranHome(); buildHero(); }; setTimeout(function(){ if(typeof renderHome==='function') renderHome(); }, 100); }
})();
// [MORE-MENU + POPUPS: grid menu, search, filters, settings popups, home hero] end




// [BARS-AUTO-HIDE on scroll] start
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
// [BARS-AUTO-HIDE on scroll] end




// [HIFZ-MODE] start
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
  function clearOv(){ document.querySelectorAll('.ayah[data-hifz-bn]').forEach(function(x){ delete x.dataset.hifzBn; }); }
  function applyToCard(card){
    var ar=card.querySelector('.ar'), bn=card.querySelector('.bn'), key=card.dataset.key||'';
    if(ar) ar.classList.toggle('hifz-hide', MODE==='ar'||MODE==='both');
    if(bn){
      // কার্ডের নিজের পছন্দ (⋯ মেনু থেকে) থাকলে সেটা, নইলে হিফজ মোডের সেটিং
      var ov=card.dataset.hifzBn;
      bn.classList.toggle('hifz-hide', ov ? ov==='hide' : (MODE==='bn'||MODE==='both'));
    }
    card.classList.toggle('hifz-memorized', !!(key && MEM[key]));
    // আরবি ব্লার হলে ট্যাপ করে দেখা যাবে (বাংলা পুরো হাইড, তাই ট্যাপ নেই — ⋯ মেনু থেকে দেখানো যায়)
    if(ar && !ar.dataset.hifzBound){ ar.dataset.hifzBound='1';
      ar.addEventListener('click', function(e){ if(!ar.classList.contains('hifz-hide')) return; e.stopPropagation(); ar.classList.toggle('revealed'); });
    }
  }
  // আয়াত কার্ডের ⋯ মেনুতে হিফজের দুটো অপশন যোগ করে (ayahCard এটা ডাকে)
  window.qxHifzMenuItems=function(card, items){
    var key=card.dataset.key||''; if(!key) return;
    items.push([function(){ return MEM[key] ? '{{check_circle:f}} মুখস্থ চিহ্ন সরান' : '{{psychology}} মুখস্থ চিহ্নিত করুন'; }, function(){
      if(MEM[key]) delete MEM[key]; else MEM[key]=1;
      save(); applyToCard(card); updateProgress();
      if(typeof showToast==='function') showToast(MEM[key] ? 'মুখস্থ হিসেবে চিহ্নিত' : 'মুখস্থ চিহ্ন সরানো হয়েছে');
    }]);
    items.push([function(){ var b=card.querySelector('.bn'); return (b && b.classList.contains('hifz-hide')) ? '{{visibility}} অনুবাদ দেখান' : '{{visibility}} অনুবাদ লুকান'; }, function(){
      var b=card.querySelector('.bn'); if(!b) return;
      card.dataset.hifzBn = b.classList.contains('hifz-hide') ? 'show' : 'hide';
      applyToCard(card);
    }]);
  };
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
    b.onclick=function(){ MODE = (MODE==='off' ? 'bn' : 'off'); clearOv(); save(); applyMode();
      if(typeof showToast==='function') showToast(MODE==='off' ? 'হিফজ মোড বন্ধ' : 'হিফজ মোড চালু — বাংলা লুকানো আছে'); };
    tools.insertBefore(b, tools.firstChild);
  }
  document.querySelectorAll('#hifzBar .hifz-chip').forEach(function(c){
    c.onclick=function(){ MODE=c.dataset.hifz; clearOv(); save(); applyMode(); };
  });
  // Watch for new ayah cards (Surah / Juz load)
  var obs=new MutationObserver(function(){ applyMode(); });
  obs.observe(document.getElementById('app')||document.body, {childList:true, subtree:true});
  // Also re-apply after any click that opens a surah (delayed render)
  document.addEventListener('click', function(){ setTimeout(applyMode, 350); });
  addToggle(); setTimeout(addToggle, 500); applyMode();
  window.quranixHifz = { getMode:function(){return MODE;}, setMode:function(m){MODE=m;save();applyMode();} };
})();
// [HIFZ-MODE] end




// [KHATAM-PLANNER] start
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

  /* সূরার তথ্য SURAH_META থেকে — বাংলা নাম ও আয়াতসংখ্যা */
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
    if(!p.ticks || typeof p.ticks!=='object') p.ticks={};   // দিন নম্বর -> {n: যোগ হওয়া আয়াত, runs: [[from,to)...]}
    return p;
  }
  function countOnes(bits,a,b){ var n=0; for(var i=a;i<b;i++) if(bits.charCodeAt(i)===49) n++; return n; }
  function firstZero(bits){ var i=bits.indexOf('0'); return i<0?TOTAL:i; }
  function getPlan(){ var p=load(); return p?ensure(p):null; }
  function addLog(p,delta){ var t=todayStr2(); p.log[t]=Math.max(0,(p.log[t]||0)+delta); }

  /* n আয়াত k দিনে সমান ভাগ (বাড়তি আয়াত প্রথম দিনগুলোতে ১টা করে) */
  function split(n,k){
    var o=[]; if(k<=0) return o;
    var b=Math.floor(n/k), x=n%k;
    for(var i=0;i<k;i++) o.push(b+(i<x?1:0));
    return o;
  }
  /* মূল পরিকল্পনা: ৬২৩৬ আয়াত p.days দিনে সমান ভাগ — i = ১-ভিত্তিক দিন নম্বর */
  function origSize(p,i){ var d=p.days||30, b=Math.floor(TOTAL/d), x=TOTAL%d; return b+((i-1)<x?1:0); }
  function origCum(p,n){ var d=p.days||30, b=Math.floor(TOTAL/d), x=TOTAL%d; n=Math.max(0,Math.min(d,n)); return b*n+Math.min(n,x); }
  /* গত দিন পূর্ণ কি না: টিক দেওয়া, অথবা ওই দিন মূল লক্ষ্যের সমান/বেশি পড়া */
  function dayDone(p,i){
    if(p.ticks[i]) return true;
    return (p.log[addDays(p.start,i-1)]||0) >= origSize(p,i);
  }

  function planStats(p){
    ensure(p);
    var today=todayStr2(), days=p.days||30;
    var elapsed=daysBetween(p.start,today);
    var notStarted=elapsed<0, over=elapsed>=days;
    var dayNo=Math.max(1,Math.min(days,elapsed+1));
    var done=countOnes(p.bits,0,TOTAL), next=firstZero(p.bits);
    var endDate=addDays(p.start,days-1);
    var remain=Math.max(0,daysBetween(today,endDate)+1);
    var readToday=notStarted?0:(p.log[today]||0);
    var remainNow=TOTAL-done;
    /* আজ সকালে যত আয়াত বাকি ছিল (আজকের পড়া যোগ করে) — এতে দিনের মধ্যে আজকের লক্ষ্য স্থির থাকে */
    var remainBase=Math.min(TOTAL,remainNow+readToday);
    var remDays=notStarted?days:(over?0:days-dayNo+1);          // আজসহ বাকি দিন
    var ticked=!notStarted && !!p.ticks[dayNo];
    var target, needToday, todayDone, perDay;
    if(notStarted){
      target=split(TOTAL,days)[0]; needToday=0; todayDone=false; perDay=target;
    } else if(over){
      target=remainNow; needToday=remainNow; todayDone=(remainNow===0); perDay=0;
    } else {
      target=split(remainBase,remDays)[0]||0;
      needToday=Math.max(0,target-readToday);
      todayDone=(ticked || needToday===0);
      if(todayDone) needToday=0;
      perDay = todayDone ? (remDays>1 ? (split(remainNow,remDays-1)[0]||0) : 0) : target;
    }
    var behind=(notStarted||over)?0:Math.max(0,origCum(p,dayNo-1)-(done-readToday));
    var missed=0;
    if(!notStarted){ var lim=over?days:dayNo-1; for(var i=1;i<=lim;i++){ if(!dayDone(p,i)) missed++; } }
    var state = notStarted?'future' : (done>=TOTAL?'finished' : (over?'over' : (todayDone?'ok' : (behind>0?'behind' : (readToday>0?'part':'todo')))));
    return {total:TOTAL,done:done,next:next,perDay:perDay,target:target,dayNo:dayNo,
            endDate:endDate,remain:remain,remDays:remDays,remainNow:remainNow,pct:Math.round(done/TOTAL*100),
            needToday:needToday,todayDone:todayDone,behind:behind,missed:missed,
            readToday:readToday,state:state,notStarted:notStarted,over:over,days:days};
  }

  /* বাম থেকে ডানে প্রথম না-পড়া আয়াতগুলো n টি পড়া ধরে; কোন কোন রেঞ্জ বদলাল তা ফেরত দেয় */
  function fillForward(p,n){
    var arr=p.bits.split(''), runs=[], moved=0, i=firstZero(p.bits), run=null;
    while(moved<n && i<TOTAL){
      if(arr[i]!=='1'){
        arr[i]='1'; moved++;
        if(run && run[1]===i) run[1]=i+1; else { run=[i,i+1]; runs.push(run); }
      }
      i++;
    }
    p.bits=arr.join('');
    return {moved:moved,runs:runs};
  }

  /* দিনের ঘরে টিক: ওই দিনের লক্ষ্য পূর্ণ করে; আবার চাপলে শুধু টিকের যোগ-করা আয়াত বাদ যায় */
  function tickDay(p,i){
    ensure(p);
    var ds=addDays(p.start,i-1), st=planStats(p), r;
    if(p.ticks[i]){
      var t=p.ticks[i], moved=0, arr=p.bits.split('');
      (t.runs||[]).forEach(function(rg){ for(var j=rg[0];j<rg[1];j++){ if(arr[j]==='1'){ arr[j]='0'; moved++; } } });
      p.bits=arr.join('');
      p.log[ds]=Math.max(0,(p.log[ds]||0)-moved);
      delete p.ticks[i];
      return {ticked:false,moved:moved};
    }
    var need;
    if(!st.notStarted && !st.over && i===st.dayNo) need=st.needToday;               // আজ: আজকের বাকিটুকু
    else need=Math.max(0,origSize(p,i)-(p.log[ds]||0));                              // গত দিন: ওই দিনের মূল ভাগ
    need=Math.min(need,st.remainNow);
    r=fillForward(p,need);
    p.log[ds]=(p.log[ds]||0)+r.moved;
    p.ticks[i]={n:r.moved,runs:r.runs};
    return {ticked:true,moved:r.moved};
  }

  function targetRow(st){
    var s='<div class="khatam-row"><span>আজকের লক্ষ্য</span><b>'+(st.over?'বাকি সব ':'')+bn(st.target)+' আয়াত'
         +(st.needToday>0?' · বাকি '+bn(st.needToday):' · পূর্ণ')+'</b></div>';
    if(st.missed>0 && !st.over) s+='<div class="khatam-row"><span>মিস হওয়া দিন</span><b>'+bn(st.missed)+'টি · বাকি দিনে ভাগ হয়েছে</b></div>';
    return s;
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
    if(st.notStarted || st.state==='finished') return [];
    var to = st.over ? TOTAL : Math.min(TOTAL, st.next+st.needToday);
    return (st.needToday>0 && st.next<to) ? segments(st.next,to) : [];
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
    } else {
      h+=targetRow(st);
      if(segs.length) h+='<div class="khatam-row"><span>আজকের পড়া</span><b style="text-align:right">'+segLines(segs).join('<br>')+'</b></div>';
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
      var h;
      if(diff<0){
        var gone=-diff, rem=d-gone;
        if(rem>0){
          h='আজ প্ল্যানের <b>'+bn(gone+1)+' নম্বর দিন</b> (শুরুর তারিখ '+bn(gone)+' দিন আগের)<br>'
           +'আজ থেকে প্রতিদিন প্রায় <b>'+bn(Math.ceil(TOTAL/rem))+' আয়াত</b> · শেষ হবে <b>'+fmtDate(end)+'</b>'
           +'<br><span style="opacity:.85">মূল ভাগ ছিল প্রতিদিন '+bn(per)+' আয়াত। আগের দিনগুলোতে পড়া থাকলে প্ল্যান বানিয়ে সেই দিনের ঘরে টিক দিন, বাকি দিনের সংখ্যা কমে যাবে।</span>';
        } else {
          h='এই তারিখ থেকে শুরু করলে প্ল্যানের মেয়াদ ('+bn(d)+' দিন) আগেই শেষ হয়ে যায়';
        }
      } else {
        h='প্রতিদিন প্রায় <b>'+bn(per)+' আয়াত</b> · শেষ হবে <b>'+fmtDate(end)+'</b>';
        if(diff>0) h+='<br>শুরু হবে '+bn(diff)+' দিন পরে';
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
      var gd=daysBetween(startEl.value||todayStr2(),todayStr2()), rd=(gd>0)?Math.max(1,d-gd):d;
      toast('খতম প্ল্যান শুরু! প্রতিদিন প্রায় '+bn(Math.ceil(TOTAL/rd))+' আয়াত');
      refreshHome();
    };
  }

  function renderPlan(box,overlay,p){
    var st=planStats(p), segs=resumeSegs(st);
    var dots='';
    for(var i=1;i<=p.days;i++){
      var ds=addDays(p.start,i-1), cls='khatam-dot', tit='';
      var tk=!!p.ticks[i], lg=p.log[ds]||0, sz=origSize(p,i);
      var isToday=(!st.notStarted && !st.over && i===st.dayNo);
      var isFuture=(st.notStarted || (!st.over && i>st.dayNo));
      if(tk){ cls+=' done ticked'; tit='টিক দেওয়া'; }
      else if(isFuture){ tit='আসছে'; }
      else if(isToday){
        if(st.todayDone){ cls+=' done'; tit='আজকের লক্ষ্য পূর্ণ'; }
        else if(st.readToday>0){ cls+=' part'; tit='আংশিক'; }
        else tit='আজ বাকি';
      } else {
        if(lg>=sz){ cls+=' done'; tit='পূর্ণ'; }
        else if(lg>0){ cls+=' part miss'; tit='আংশিক পড়া'; }
        else { cls+=' miss'; tit='মিস'; }
      }
      if(isToday) cls+=' today';
      dots+='<span class="'+cls+'" role="button" tabindex="0" data-i="'+i+'" title="'+fmtDate(ds)+' · '+tit+'">'+bn(i)+'</span>';
    }
    var h='<div class="pp-header"><h3>{{calendar_month}} খতম প্ল্যান</h3>'+closeBtn()+'</div>'
      +'<div class="khatam-row"><b>দিন '+bn(st.dayNo)+' / '+bn(st.days)+'</b><span>'+statusHtml(st)+'</span></div>';
    if(st.state==='future') h+='<div class="khatam-row"><span>শুরু হবে</span><b>'+fmtDate(p.start)+'</b></div>';
    else if(st.state!=='finished') h+=targetRow(st);
    if(segs.length) h+='<div class="khatam-row"><span>আজকের পড়া</span><b style="text-align:right">'+segLines(segs).join('<br>')+'</b></div>';
    if(st.perDay>0 && st.state!=='finished' && !st.over) h+='<div class="khatam-row"><span>'+(st.todayDone?'কাল থেকে প্রতিদিন':'দৈনিক লক্ষ্য')+'</span><b>প্রায় '+bn(st.perDay)+' আয়াত</b></div>';
    if(st.state!=='future') h+='<div class="khatam-row"><span>আজ পড়া হয়েছে</span><b>'+bn(st.readToday)+' আয়াত</b></div>';
    if(st.behind>0 && st.state!=='over') h+='<div class="pp-mini">মূল পরিকল্পনার চেয়ে '+bn(st.behind)+' আয়াত পিছিয়ে। না-পড়া আয়াত বাকি '+bn(st.remDays)+' দিনে সমানভাবে ভাগ হয়েছে।</div>';
    if(st.over && st.state!=='finished') h+='<div class="pp-mini">মেয়াদ শেষ, তবে '+bn(st.remainNow)+' আয়াত বাকি আছে।</div>';
    h+='<div class="goal-track" style="margin:8px 0"><div class="goal-fill" style="width:'+st.pct+'%"></div></div>'
      +'<div class="khatam-row"><span>মোট</span><b>'+bn(st.done)+' / ৬,২৩৬ ('+bn(st.pct)+'%)</b></div>'
      +'<div class="khatam-row"><span>শেষ হবে</span><b>'+fmtDate(st.endDate)+'</b></div>'
      +'<div class="pp-mini">দিনের ঘরে ট্যাপ করলে ওই দিনের লক্ষ্য পূর্ণ ধরে টিক পড়বে (আয়াত নিজে থেকে যোগ হবে), আবার ট্যাপ করলে টিক উঠে যাবে। লাল = মিস, আধা রং = আংশিক, বর্ডার = আজ</div><div class="khatam-dots" id="khDots">'+dots+'</div>'
      +'<div class="pp-mini" style="margin-top:6px">আজ কত আয়াত পড়লেন? সংখ্যা লিখে যোগ করুন (ভুল হলে মাইনাস লিখে কমান, যেমন −৫)</div>'
      +'<div style="display:flex;gap:8px;margin:6px 0 10px"><input type="number" inputmode="numeric" class="pp-input" id="khAddN" style="margin:0;flex:1" placeholder="যেমন: ৫">'
      +'<button class="pp-btn" id="khAdd" style="width:auto;flex:0 0 38%">যোগ করুন</button></div>'
      +(st.state==='finished'?'':'<button class="pp-btn" id="khGo">{{play_arrow}} আজকের পড়া শুরু করুন</button><div style="height:8px"></div>')
      +(st.needToday>0 && !st.over?'<button class="pp-btn" id="khDone" style="background:var(--qx-card-bg);color:var(--qx-text-color);border:1px solid var(--qx-border)">{{check_circle:f}} আজকের বাকি পড়া শেষ করেছি</button><div style="height:8px"></div>':'')
      +'<button class="pp-btn" id="khReset" style="background:none;color:var(--qx-danger);border:1px solid var(--qx-danger)">{{delete}} প্ল্যান মুছে ফেলুন</button>';
    box.innerHTML=h;
    var mini=document.getElementById('gKhatamMini'); if(mini) mini.textContent=bn(st.pct)+'% {{chevron_right}}';

    function rerender(){
      var sb=box.scrollTop, so=overlay.scrollTop;
      save(p); renderPlan(box,overlay,p); refreshHome();
      box.scrollTop=sb; overlay.scrollTop=so;
    }
    function onDot(i){
      var s2=planStats(p);
      if(s2.notStarted || (!s2.over && i>s2.dayNo)){ toast('আগামী দিনে টিক দেওয়া যায় না'); return; }
      var r=tickDay(p,i);
      if(r.ticked) toast(r.moved>0 ? 'দিন '+bn(i)+' টিক · '+bn(r.moved)+' আয়াত যোগ হয়েছে' : 'দিন '+bn(i)+' টিক দেওয়া হলো');
      else toast('দিন '+bn(i)+'-এর টিক তুলে নেওয়া হলো'+(r.moved>0?' · '+bn(r.moved)+' আয়াত কমেছে':''));
      rerender();
    }
    var dotsEl=document.getElementById('khDots');
    if(dotsEl){
      dotsEl.onclick=function(e){ var t=e.target.closest ? e.target.closest('.khatam-dot') : null; if(t) onDot(parseInt(t.dataset.i,10)); };
      dotsEl.onkeydown=function(e){
        if(e.key==='Enter' || e.key===' '){ var t=e.target.closest ? e.target.closest('.khatam-dot') : null; if(t){ e.preventDefault(); onDot(parseInt(t.dataset.i,10)); } }
      };
    }

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
      rerender();
    };
    var done=document.getElementById('khDone');
    if(done) done.onclick=function(){
      var r=tickDay(p,st.dayNo);
      toast(r.moved>0 ? 'আজকের পড়া সম্পন্ন · '+bn(r.moved)+' আয়াত যোগ হয়েছে' : 'আজকের পড়া সম্পন্ন');
      rerender();
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
// [KHATAM-PLANNER] end




// [AYAH-IMAGE-CARD] start
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
// [AYAH-IMAGE-CARD] end




// [TRACKER] start
/* ===== STEP 5: TRACKER WINDOW - MULTI CATEGORY ===== */
function trkToday(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function trkLoad(){
  var empty={namaz:{},roza:{},dhikr:{},habits:[]};
  try{
    var d=JSON.parse(localStorage.getItem('quranix_tracker')||'null');
    if(!d || typeof d!=='object' || Array.isArray(d)) return empty;
    return {
      namaz:d.namaz && typeof d.namaz==='object' && !Array.isArray(d.namaz) ? d.namaz : {},
      roza:d.roza && typeof d.roza==='object' && !Array.isArray(d.roza) ? d.roza : {},
      dhikr:d.dhikr && typeof d.dhikr==='object' && !Array.isArray(d.dhikr) ? d.dhikr : {},
      habits:Array.isArray(d.habits) ? d.habits.filter(function(h){return h && typeof h==='object' && typeof h.name==='string';}).slice(0,100) : []
    };
  }catch(e){ return empty; }
}
function trkSave(d){
  try{ localStorage.setItem('quranix_tracker', JSON.stringify(d)); return true; }
  catch(e){ if(typeof showToast==='function') showToast('ডিভাইসের স্টোরেজ পূর্ণ — ট্র্যাকার সংরক্ষণ হয়নি'); return false; }
}
function trkEscapeHtml(value){ return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];}); }
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
    +'<div class="khatam-row"><span>{{i_mosque}} নামাজ '+trkBn(nDone)+'/৫</span><span>{{i_ramadan}} রমজান '+(d.roza[td]?'{{check_circle:f}}':'{{hourglass_top}}')+'</span><span>{{i_tasbih}} জিকির '+trkBn(dhDone)+'/৪</span></div>'
    +'<div class="goal-track" style="margin:8px 0"><div class="goal-fill" style="width:'+score+'%"></div></div>'
    +'<div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">ট্র্যাকার খোলো →</span><span>সব ক্যাটাগরি এক জায়গায়</span></div>';
  box.onclick=function(){ if(typeof setMode==='function') setMode('tracker'); };
  return box;
}
function renderTracker(){
  var _prevScroll = window.scrollY;
  if(typeof showOther==='function') showOther('{{bar_chart}} ট্র্যাকার');
  var d=trkLoad(); var td=trkToday();
  const appEl = document.getElementById('app');
  // overall
  var nm=d.namaz[td]||{}, nDone=Object.keys(nm).filter(function(k){return nm[k]}).length;
  var dh=d.dhikr[td]||{}, dhDone=Object.keys(dh).filter(function(k){return dh[k]}).length;
  var habitDone=d.habits.filter(function(h){ return h.days && h.days[td]; }).length;
  var head=document.createElement('div'); head.className='trk-head';
  var dateStr=new Date().toLocaleDateString('bn-BD',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  head.innerHTML='<small>'+dateStr+'</small><div class="big">আজকের আমল</div><div>{{i_mosque}} '+trkBn(nDone)+'/৫ নামাজ &nbsp;·&nbsp; {{i_ramadan}} '+(d.roza[td]?'রমজান {{check_circle:f}}':'রমজান {{hourglass_top}}')+' &nbsp;·&nbsp; {{i_tasbih}} '+trkBn(dhDone)+'/৪ জিকির</div>';
  appEl.appendChild(head);

  // 1. NAMAZ
  var c1=document.createElement('div'); c1.className='trk-cat';
  c1.innerHTML='<h3>{{i_mosque}} নামাজ ট্র্যাকার</h3><div class="sub">আজ কোন ওয়াক্ত পড়লা, টিক দাও</div>';
  c1.appendChild(trkDots(function(ds){ var x=d.namaz[ds]||{}; return Object.keys(x).filter(function(k){return x[k]}).length>=5; }));
  var prayers=[['fajr','ফজর'],['dhuhr','যোহর'],['asr','আসর'],['maghrib','মাগরিব'],['isha','এশা']];
  prayers.forEach(function(p){
    c1.appendChild(trkRow('{{i_mosque}} '+p[1], '', !!(d.namaz[td]||{})[p[0]], function(v){
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
  c2.innerHTML='<h3>{{i_quran}} কুরআন ট্র্যাকার</h3><div class="sub">আজ '+trkBn(todayRead)+' আয়াত পড়া হয়েছে'+(kh?' · খতম প্ল্যান চলছে ('+trkBn(kh.days)+' দিনের)':'')+'</div>';
  var goBtn=document.createElement('button'); goBtn.className='dl-btn'; goBtn.style.marginTop='6px'; goBtn.textContent='{{i_quran}} কুরআন পড়তে যাও';
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
  c4.innerHTML='<h3>{{i_ramadan}} রমজান ট্র্যাকার</h3><div class="sub">নফল রমজান / কাজা রমজান — আজ রাখলে টিক দাও</div>';
  c4.appendChild(trkDots(function(ds){ return !!d.roza[ds]; }));
  var thisMonth=0; Object.keys(d.roza).forEach(function(ds){ if(ds.slice(0,7)===td.slice(0,7)) thisMonth++; });
  c4.appendChild(trkRow('{{i_ramadan}} আজ রমজান রেখেছি', 'এই মাসে '+trkBn(thisMonth)+'টি রমজান', !!d.roza[td], function(v){ if(v) d.roza[td]=1; else delete d.roza[td]; trkSave(d); renderTracker(); }));
  appEl.appendChild(c4);

  // 5. DHIKR / AZKAR
  var c5=document.createElement('div'); c5.className='trk-cat';
  c5.innerHTML='<h3>{{i_tasbih}} জিকির ট্র্যাকার</h3><div class="sub">দৈনিক জিকির — সকাল / সন্ধ্যা / ঘুমের আগে</div>';
  c5.appendChild(trkDots(function(ds){ var x=d.dhikr[ds]||{}; return Object.keys(x).filter(function(k){return x[k]}).length>=4; }));
  var dz=[['morning','{{wb_sunny}} সকালের জিকির'],['evening','{{wb_twilight}} সন্ধ্যার জিকির'],['sleep','{{bedtime}} ঘুমের আগের দোয়া'],['durud','{{i_hadith}} দুরুদ ১০০ বার']];
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
    var row=trkRow((h.icon ? trkEscapeHtml(h.icon) : '{{star:f}}')+' '+trkEscapeHtml(h.name), 'স্ট্রিক: '+trkBn(streak)+' দিন', !!(h.days&&h.days[td]), function(v){ h.days=h.days||{}; if(v) h.days[td]=1; else delete h.days[td]; trkSave(d); renderTracker(); });
    // delete button
    var del=document.createElement('button'); del.textContent='{{delete}}'; del.style.cssText='border:0;background:none;font-size:var(--qx-fs-lg);cursor:pointer'; del.onclick=function(){ if(confirm('“'+h.name+'” হ্যাবিটটা মুছে ফেলবা?')){ d.habits=d.habits.filter(function(x){return x.id!==h.id}); trkSave(d); renderTracker(); } };
    row.appendChild(del); c6.appendChild(row);
  });
  var add=document.createElement('button'); add.className='dl-btn ghost'; add.style.marginTop='8px'; add.textContent='+ নিজের হ্যাবিট যোগ করো';
  add.onclick=function(){
    var name=prompt('হ্যাবিটের নাম কী? (যেমন: ব্যায়াম, ৮ গ্লাস পানি, রাগ কন্ট্রোল)');
    if(!name) return;
    name=name.trim();
    if(!name) return;
    if(name.length>40){ showToast('হ্যাবিটের নাম সর্বোচ্চ ৪০ অক্ষরের হতে পারবে'); return; }
    if(d.habits.length>=100){ showToast('সর্বোচ্চ ১০০টি হ্যাবিট যোগ করা যাবে'); return; }
    var icon=prompt('একটা ইমোজি দাও (ঐচ্ছিক)', '')||'{{star:f}}';
    icon=icon.trim().slice(0,8);
    d.habits.push({id:Date.now(), name:name, icon:icon, days:{}}); trkSave(d); renderTracker();
    if(typeof showToast==='function') showToast('হ্যাবিট যোগ হয়েছে');
  };
  c6.appendChild(add); appEl.appendChild(c6);

  var note=document.createElement('div'); note.className='note'; note.style.textAlign='center';
  note.textContent='ট্র্যাকার ডিভাইসে স্বয়ংক্রিয়ভাবে সেভ হয় এবং Quranix JSON ব্যাকআপের সাথেও সংরক্ষিত থাকে।';
  appEl.appendChild(note);
  if(_prevScroll>0){ setTimeout(function(){ window.scrollTo(0,_prevScroll); }, 0); }
}
window.renderTracker=renderTracker; window.buildTrackerCard=buildTrackerCard;
// [TRACKER] end




// [TAJWEED] start
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
    const mini = document.getElementById('gTajweedMini'); if(mini) mini.textContent=ON?'চালু {{chevron_right}}':'বন্ধ {{chevron_right}}';
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
// [TAJWEED] end




// [WORD-BY-WORD] start
/* ===== WORD-BY-WORD TRANSLATION ===== */
(function(){
  var ON = localStorage.getItem('quranix_ww')==='1';
  window.wwOn = ON;
  // Common words fallback dictionary (word without diacritics -> meaning)
  var DICT = {
    'الله':'আল্লাহ','الرحمن':'পরম করুণাময়','الرحيم':'অতি দয়ালু','رب':'প্রতিপালক','العالمين':'সব জগতের','مالك':'মালিক','يوم':'দিন','الدين':'বিচার / প্রতিদান','إياك':'শুধু তোমারই','نعبد':'আমরা ইবাদত করি','نستعين':'আমরা সাহায্য চাই','اهدنا':'আমাদের পথ দেখাও','الصراط':'পথ','المستقيم':'সোজা, সরল','الذين':'যারা','أنعمت':'তুমি অনুগ্রহ করেছ','عليهم':'তাদের উপর','المغضوب':'ক্রোধপ্রাপ্ত','الضالين':'পথভ্রষ্ট','قل':'বলো','هو':'তিনি','أحد':'এক, অদ্বিতীয়','الصمد':'অমুখাপেক্ষী','لم':'না, কখনো না','يلد':'জন্ ্ম দেন','يولد':'জন্ম নেন','كفوا':'সমকক্ষ','من':'থেকে / যে','شر':'অনিষ্ট','ما':'যা','خلق':'সৃষ্টি করেছেন','الناس':'মানুষ','الفلق':'ভোর / ফেটে ওঠা','الناس':'মানুষ','ملك':'বাদশাহ','إله':'ইলাহ, উপাস্য','الوسواس':'কুমন্ত্রণাদাতা','الخناس':'আত্মগোপনকারী','صدور':'বুকসমূহ','الجنة':'জিন','الحمد':'সব প্রশংসা','لله':'আল্লাহর জন্য','الذي':'যিনি','كان':'ছিলেন','ما':'যা / না','في':'মধ্যে','إلى':'দিকে','على':'উপর','إن':'নিশ্চয়ই','أن':'যে','لا':'না','قد':'নিশ্চয়ই','كل':'সব','هذا':'এই','ذلك':'ওই','كان':'ছিল','قال':'বললেন','آمنوا':'ঈমান এনেছে','كفروا':'কুফরি করেছে','الذين':'যারা','رسول':'রাসূল','كتاب':'কিতাব','آية':'আয়াত / নিদর্শন','سماء':'আসমান','أرض':'জমিন','نار':'আগুন','جنة':'জান্নাত','ماء':'পানি','نور':'আলো','ظلمات':'অন্ধকার','حق':'সত্য','باطل':'মিথ্যা','صبر':'ধৈর্য','صلاة':'নামাজ','زكاة':'যাকাত','صوم':'রমজান','حج':'হজ','مؤمن':'মুমিন','كافر':'কাফের','ظالم':'জালিম','متقون':'মুত্তাকি','رحمة':'রহমত, দয়া','عذاب':'শাস্তি','مغفرة':'ক্ষমা','توبة':'তওবা','دعاء':'দোয়া','شكر':'কৃতজ্ঞতা','خير':'কল্যাণ','شر':'অকল্যাণ','حياة':'জীবন','موت':'মৃত্যু','آخرة':'আখিরাত','دنيا':'দুনিয়া','قلب':'অন্তর','علم':'জ্ঞান','عمل':'আমল','نفس':'আত্মা','روح':'রূহ'
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
    const mini = document.getElementById('gWwMini'); if(mini) mini.textContent=ON?'চালু {{chevron_right}}':'বন্ধ {{chevron_right}}';
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
// [WORD-BY-WORD] end





// [HIJRI-CALENDAR] start
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
    {m:1,d:1,ic:'i_hijri',name:'হিজরি নববর্ষ',desc:'নতুন হিজরি বছরের শুরু'},
    {m:1,d:10,ic:'wb_twilight',name:'আশুরা',desc:'মুহাররমের ১০ তারিখ — রোজা রাখা সুন্নত'},
    {m:3,d:12,ic:'auto_awesome',name:'ঈদে মিলাদুন্নবী ﷺ',desc:'নবী ﷺ-এর জন্মস্মরণ — জন্মতারিখ নিয়ে ঐতিহাসিক মতভেদ আছে'},
    {m:7,d:27,ic:'nights_stay',name:'লাইলাতুল মেরাজ',desc:'ইসরা ও মেরাজের স্মরণ — ২৭ রজব তারিখটি প্রমাণিত নয়'},
    {m:8,d:15,ic:'bedtime',name:'লাইলাতুল বরাত',desc:'১৫ শাবানের রাত — এর বিশেষ ফজিলত ও আমল নিয়ে আলেমদের মতভেদ আছে'},
    {m:9,d:1,ic:'i_ramadan',name:'রমজান শুরু',desc:'রহমত, মাগফিরাত, নাজাতের মাস'},
    {m:9,d:27,ic:'stars',name:'লাইলাতুল কদর',desc:'শেষ দশকের বেজোড় রাতগুলোতে খুঁজুন — ২৭ তারিখ নিশ্চিত নয়'},
    {m:10,d:1,ic:'star',name:'ঈদুল ফিতর',desc:'রমজান শেষে ঈদ'},
    {m:12,d:9,ic:'wb_sunny',name:'আরাফার দিন',desc:'হজের মূল দিন — হিজরি ৯ জিলহজ'},
    {m:12,d:10,ic:'i_qurbani',name:'ঈদুল আজহা',desc:'কুরবানির ঈদ'},
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
    box.innerHTML='<div class="khatam-row"><b>{{i_hijri}} হিজরি ক্যালেন্ডার</b><span>আজ</span></div>'
      +'<div style="text-align:center;font-size:var(--qx-fs-xl);font-weight:700;color:var(--qx-main-color)">'+(h?hijriStr(new Date()):'—')+'</div>'
      +(ne?'<div class="khatam-row"><span>{{hourglass_top}} পরের ইভেন্ট: <b>'+ne.ev.name+'</b></span><span>'+(ne.days===0?'আজই!':bnNum(ne.days)+' দিন বাকি')+'</span></div>':'')
      +'<div class="khatam-row"><span style="color:var(--qx-main-color);font-weight:700">হিজরি ক্যালেন্ডার দেখো →</span><span>রমজান / ঈদ কবে?</span></div>';
    box.onclick=function(){ if(typeof setMode==='function') setMode('hijri'); };
    return box;
  }
  function renderHijri(){
    if(typeof showOther==='function') showOther('{{i_hijri}} হিজরি ক্যালেন্ডার');
    const appEl = document.getElementById('app');
    var h=hijriParts(new Date());
    if(!h){
      var unavailable=document.createElement('div'); unavailable.className='hijri-top';
      unavailable.textContent='এই ব্রাউজারে হিজরি ক্যালেন্ডার গণনা সমর্থিত নয়। আপডেটেড Chrome বা অন্য আধুনিক ব্রাউজারে চেষ্টা করুন।';
      appEl.appendChild(unavailable);
      return;
    }
    var top=document.createElement('div'); top.className='hijri-top';
    top.innerHTML='<small>আজ · '+fmtGreg(new Date())+'</small><div class="big">{{i_hijri}} '+hijriStr(new Date())+'</div>';
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
    var calHead=document.createElement('h3'); calHead.style.cssText='margin:14px 0 4px;color:var(--qx-main-color)'; calHead.textContent='{{i_hijri}} হিজরি মাস: '+MONTHS_BN[h.month-1]+' '+bnNum(h.year);
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
    var note=document.createElement('div'); note.className='note'; note.style.textAlign='center'; note.textContent='আরবি মাসের তারিখ চাঁদ দেখার উপর নির্ভরশীল — রমজান / ঈদের চূড়ান্ত তারিখের জন্য স্থানীয় ঘোষণা দেখো।';
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
    const mini = document.getElementById('gHijriMini'); if(mini) mini.textContent=h?hijriStr(new Date()).slice(0,12)+' {{chevron_right}}':'{{chevron_right}}';
  }
  window.renderHijri=renderHijri; window.buildHijriCard=buildHijriCard; window.quranixHijri={hijriStr:hijriStr, nextEvent:nextEvent};
})();
// [HIJRI-CALENDAR] end




// [PWA: install + service worker] start
/* ===== PWA: install + service worker ===== */
(function(){
  var deferred = null;
  var installButton = document.getElementById('pwaInstallBtn');
  var bannerClose = document.getElementById('pwaBannerClose');
  var mini = document.getElementById('gPwaMini');
  var updateNoticeShown = false;

  window.quranixInstallAvailable = false;

  var INSTALLED_KEY = 'quranix_installed';

  function inApp(){
    return typeof window.isInApp === 'function'
      ? window.isInApp()
      : ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true);
  }

  function getInstalledFlag(){
    try { return localStorage.getItem(INSTALLED_KEY) === '1'; }
    catch(e) { return false; }
  }

  function setInstalledFlag(value){
    try {
      if (value) localStorage.setItem(INSTALLED_KEY, '1');
      else localStorage.removeItem(INSTALLED_KEY);
    } catch(e) {}
  }

  // অ্যাপের ভিতরে বা (ব্রাউজারে থাকলেও) ডিভাইসে ইনস্টল করা থাকলে true
  function isInstalled(){
    return inApp() || getInstalledFlag();
  }

  function updateMini(){
    if (mini) mini.textContent = inApp() ? '{{chevron_right}}' : (isInstalled() ? 'অ্যাপ খুলুন {{chevron_right}}' : 'ইনস্টল করুন {{chevron_right}}');
  }

  // ব্রাউজার ট্যাব থেকে ইনস্টল করা অ্যাপ খোলার চেষ্টা (লিংক ক্যাপচার কাজ করলে অ্যাপে খুলবে)
  function openInstalledApp(){
    if (inApp()) return;
    try { window.open(new URL('./', location.href).href, '_blank'); } catch(e) {}
    setTimeout(function(){
      if (document.visibilityState === 'visible' && typeof showToast === 'function') {
        showToast('অ্যাপ না খুললে হোম স্ক্রিন বা অ্যাপ তালিকা থেকে Quranix খুলুন');
      }
    }, 1500);
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
    // প্রম্পট আসা মানে অ্যাপ এখন ইনস্টল করা নেই (আনইনস্টল হলে পুরনো ফ্ল্যাগ মুছে যাবে)
    setInstalledFlag(false);
    setInstallAvailability(true);
    updateMini();
    showBanner();
  });

  window.addEventListener('appinstalled', function(){
    deferred = null;
    setInstalledFlag(true);
    setInstallAvailability(false);
    hideBanner();
    updateMini();
    if (typeof showToast === 'function') showToast('Quranix ইনস্টল হয়েছে');
  });

  if (installButton) installButton.onclick = function(){ doInstall(); };
  if (bannerClose) bannerClose.onclick = function(){
    hideBanner();
    try { localStorage.setItem('quranix_pwa_dismiss', '1'); } catch(e) {}
  };

  async function doInstall(){
    if (inApp()) return; // অ্যাপের ভিতরে কিছুই দেখানো/করা হবে না
    if (isInstalled()) { openInstalledApp(); return; }

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
  window.quranixIsInstalled = isInstalled;
  window.quranixOpenApp = openInstalledApp;

  // ব্রাউজারে থাকলেও ইনস্টল আছে কি না যাচাই (Chrome Android; manifest-এ related_applications লাগে)
  if (!inApp() && navigator.getInstalledRelatedApps) {
    navigator.getInstalledRelatedApps().then(function(apps){
      if (apps && apps.length) { setInstalledFlag(true); hideBanner(); updateMini(); }
    }).catch(function(){});
  }

  // Service workers require an eligible secure origin; file:// preview is intentionally skipped.
  if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(function(registration){

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

  updateMini();
})();
// [PWA: install + service worker] end




// PHASE 1 - Reliability Fixes (matching only)
// [FULL-RESET (qxFullReset)] start
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

  // 1.6 আইকন ফন্ট: লোড হলে আইকন দেখাও; না হলে .ms লেখার বদলে ইউনিকোড চিহ্ন দেখাও (কাঁচা শব্দ নয়)
  try{
    var QX_IC_FB={abc:'Ab',arrow_back:'\u2190',arrow_forward:'\u2192',auto_awesome:'\u2728',auto_stories:'\uD83D\uDCD6',bar_chart:'\uD83D\uDCCA',bedtime:'\uD83C\uDF19',
      bubble_chart:'\u25CC',calendar_month:'\uD83D\uDCC5',calendar_today:'\uD83D\uDCC5',event:'\uD83D\uDCC5',check:'\u2713',done:'\u2713',done_all:'\u2713',check_circle:'\u2714',
      close:'\u2715',cancel:'\u2715',content_copy:'\u29C9',crop_portrait:'\u25AF',crop_square:'\u25A2',dark_mode:'\uD83C\uDF19',nightlight:'\uD83C\uDF19',nights_stay:'\uD83C\uDF19',
      delete:'\uD83D\uDDD1',download:'\u2B07',edit:'\u270E',edit_note:'\uD83D\uDCDD',explore:'\uD83E\uDDED',filter_list:'\u2261',folder_open:'\uD83D\uDCC2',
      front_hand:'\uD83E\uDD32',grid_view:'\u25A6',list_alt:'\u2630',headphones:'\uD83C\uDFA7',history:'\u27F2',history_edu:'\uD83D\uDCDC',home:'\uD83C\uDFE0',hourglass_top:'\u23F3',
      image:'\uD83D\uDDBC',info:'\u2139',light_mode:'\u2600',wb_sunny:'\u2600',lightbulb:'\uD83D\uDCA1',location_on:'\uD83D\uDCCD',menu_book:'\uD83D\uDCD6',
      more_horiz:'\u22EF',mosque:'\uD83D\uDD4C',no_meals:'\u26D4',notifications:'\uD83D\uDD14',palette:'\uD83C\uDFA8',pause:'\u23F8',play_arrow:'\u25B6',
      psychology:'\uD83E\uDDE0',push_pin:'\uD83D\uDCCC',radio_button_unchecked:'\u25CB',refresh:'\u27F3',sync:'\u27F3',save:'\uD83D\uDCBE',search:'\uD83D\uDD0D',
      share:'\u21EA',smartphone:'\uD83D\uDCF1',star:'\u2605',stars:'\u2605',target:'\u25CE',text_fields:'T',toll:'\u25C9',topic:'\uD83D\uDCD1',translate:'\u6587',
      view_in_ar:'\u25C8',view_list:'\u2630',menu:'\u2630',visibility:'\uD83D\uDC41',volume_up:'\uD83D\uDD0A',warning:'\u26A0',wb_twilight:'\uD83C\uDF06',
      add:'+',remove:'\u2212',chevron_right:'\u203A',chevron_left:'\u2039',expand_more:'\u25BE',expand_less:'\u25B4',favorite:'\u2665',bookmark:'\uD83D\uDD16',
      bookmarks:'\uD83D\uDD16',settings:'\u2699',tune:'\u2699',schedule:'\uD83D\uDD52',help:'?',lock:'\uD83D\uDD12',skip_next:'\u23ED',skip_previous:'\u23EE',
      repeat:'\u27F3',format_size:'Aa',vibration:'\uD83D\uDCF3'};
    function qxFbFix(el){
      var n=(el.textContent||'').trim();
      if(el.getAttribute('data-n')===n) return;
      el.setAttribute('data-n',n);
      el.setAttribute('data-g',QX_IC_FB[n]||'\u2022');
    }
    function qxFbScan(r){
      if(r.nodeType===3){ var p=r.parentNode; if(p && p.classList && p.classList.contains('ms')) qxFbFix(p); return; }
      if(r.nodeType!==1) return;
      if(r.classList.contains('ms')) qxFbFix(r);
      if(r.querySelectorAll) r.querySelectorAll('.ms').forEach(qxFbFix);
    }
    var qxFbOn=false;
    window.qxIconFallbackOn=function(){
      if(qxFbOn) return; qxFbOn=true;
      document.body.classList.add('no-icon-font');
      qxFbScan(document.body);
      new MutationObserver(function(ms){
        ms.forEach(function(m){
          if(m.type==='characterData'){ qxFbScan(m.target); return; }
          m.addedNodes.forEach(qxFbScan);
          if(m.target && m.target.classList && m.target.classList.contains('ms')) qxFbFix(m.target);
        });
      }).observe(document.body,{childList:true,subtree:true,characterData:true});
    };
    var qxIconsReady=function(){ document.documentElement.classList.remove('icons-pending'); };
    var qxIconsFail=function(){ window.qxIconFallbackOn(); qxIconsReady(); };
    if(document.fonts && typeof document.fonts.load === 'function'){
      document.fonts.load('200 20px "MSLocal"', 'search').then(function(fontList){
        if(fontList.length>0 && document.fonts.check('200 20px "MSLocal"', 'search')) qxIconsReady(); else qxIconsFail();
      }).catch(qxIconsFail);
    } else { qxIconsReady(); }
  }catch(e){ document.documentElement.classList.remove('icons-pending'); }

})();
// [FULL-RESET (qxFullReset)] end




// PHASE 3 - Accessibility + Responsive
// [KEYBOARD: Escape closes overlays] start
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
// [KEYBOARD: Escape closes overlays] end




// [READER-PROGRESS bar placement] start
(function(){
  var rp = document.getElementById("readerProgress");
  if(rp && rp.parentNode !== document.body) document.body.appendChild(rp);
  var homeBtn = document.getElementById("navHome");
  if(homeBtn) homeBtn.addEventListener("click", function(){
    if(typeof window.goHome === "function") window.goHome();
  });
})();
// [READER-PROGRESS bar placement] end




// [READ-WIDTH toggle (widthToggle)] start
(function(){
  var K='quranix_readwide', b=document.body, btn=document.getElementById('widthToggle');
  if(!btn) return;
  function apply(w){ b.classList.toggle('read-wide', w); btn.setAttribute('aria-pressed', w?'true':'false'); }
  var w=false; try{ w = localStorage.getItem(K)==='1'; }catch(e){}
  apply(w);
  btn.onclick=function(){ w=!w; apply(w); try{ localStorage.setItem(K, w?'1':'0'); }catch(e){} };
})();
// [READ-WIDTH toggle (widthToggle)] end

// [QUICK-ACTIONS-BN: Bengali names + DOMContentLoaded apply] start
// Quick Actions বাংলা নাম (গ্রিড/লিস্ট, হোম কাস্টমাইজ ও ড্যাশবোর্ড এডিট এখন হোম ও "আরও" পেজের টুলবারে: qxPageTools)
window.QX_QUICK_ACTIONS_BN = {
  "hijri": "হিজরি ক্যালেন্ডার",
  "downloads": "ডাউনলোড",
  "source": "উৎস ও তথ্যসূত্র",
  "backup": "ব্যাকআপ ও রিস্টোর",
  "pwa": "Quranix অ্যাপ",
  "settings": "কাস্টমাইজেশন",
  "prayer": "নামাজের সময়",
  "qibla": "কিবলা",
  "tasbih": "তাসবিহ",
  "tracker": "ট্র্যাকার",
  "khatm": "খতম"
};
function qxApplyQuickActionsBN(){
  try{
    document.querySelectorAll('.g-quick-btn').forEach(btn => {
      const key = btn.dataset.popup || btn.dataset.type || btn.textContent.trim().toLowerCase();
      const bn = window.QX_QUICK_ACTIONS_BN[key];
      if(bn){
        const label = btn.querySelector('.g-quick-label') || btn.querySelector('span:last-child');
        if(label) label.textContent = bn;
      }
    });
    document.querySelectorAll('.g-menu-item').forEach(item => {
      const key = item.dataset.popup;
      const bn = window.QX_QUICK_ACTIONS_BN[key];
      if(bn){
        // Keep existing Bengali text - already Bengali in HTML, ensure no English remains
      }
    });
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', () => {
  try{ qxApplyQuickActionsBN(); }catch(e){}
});
setTimeout(() => { try{ qxApplyQuickActionsBN(); }catch(e){} }, 800);
// [QUICK-ACTIONS-BN: Bengali names + DOMContentLoaded apply] end

// [FULL-SURAH-AUDIO-PAGE] start
(function(){
  "use strict";
  let activeFilter = "";

  function bnNumber(value){
    return String(value).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  }
  function getSurahList(){
    if (typeof surahs !== "undefined" && Array.isArray(surahs)) return surahs;
    return Array.isArray(window.surahs) ? window.surahs : [];
  }
  function getSurah(number){
    return getSurahList().find(item => Number(item.number) === Number(number));
  }
  function formatTime(seconds){
    if (!Number.isFinite(seconds) || seconds < 0) return "০:০০";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return bnNumber(mins + ":" + secs);
  }
  function renderPage(){
    window.qxFullAudioPageOpen = true;
    if (typeof qxNav !== "undefined" && qxNav.pushMode) qxNav.pushMode();
    showOther("Full Audio Quran");

    const page = document.createElement("section");
    page.className = "qx-full-audio-page";
    page.innerHTML = `
      <div class="qx-fa-heading">
        <div><h2>Full Audio Quran</h2><p>সূরার বাংলা নাম ও আয়াতের তথ্যসহ</p></div>
        <button type="button" class="qx-fa-back" aria-label="ফিরে যান" title="ফিরে যান"><span class="ms">arrow_back</span></button>
      </div>
      <section class="qx-fa-player" aria-label="অডিও প্লেয়ার">
        <div class="qx-fa-now-label">এখন চলছে</div>
        <div class="qx-fa-now-title" id="qxFaNowTitle">কোনো সূরা নির্বাচন করা হয়নি</div>
        <div class="qx-fa-now-sub" id="qxFaNowSub">শুনতে সূরার তালিকা থেকে Play চাপুন</div>
        <div class="qx-fa-progress"><input id="qxFaSeek" type="range" min="0" max="1000" value="0" aria-label="অডিওর অবস্থান"><span id="qxFaProgressFill"></span></div>
        <div class="qx-fa-time"><span id="qxFaCurrentTime">০:০০</span><span id="qxFaDuration">০:০০</span></div>
        <div class="qx-fa-controls">
          <button type="button" id="qxFaPrev" aria-label="আগের সূরা" title="আগের সূরা"><span class="ms">skip_previous</span></button>
          <button type="button" id="qxFaPlay" class="qx-fa-main-play" aria-label="Play/Pause" title="Play/Pause"><span class="ms">play_arrow</span></button>
          <button type="button" id="qxFaRead" aria-label="কুরআন পড়ুন" title="এই সূরাটি পড়ুন"><span class="ms">menu_book</span></button>
          <button type="button" id="qxFaNext" aria-label="পরের সূরা" title="পরের সূরা"><span class="ms">skip_next</span></button>
        </div>
      </section>
      <div class="qx-fa-list-head"><h3>সূরার তালিকা <span id="qxFaCount">১১৪টি</span></h3><label class="qx-fa-search"><span class="ms">search</span><input id="qxFaSearch" type="search" placeholder="সূরা খুঁজুন…" autocomplete="off"></label></div>
      <div class="qx-fa-list" id="qxFaList"></div>`;
    app.appendChild(page);

    const list = page.querySelector("#qxFaList");
    const search = page.querySelector("#qxFaSearch");
    const renderList = () => {
      const query = search.value.trim().toLowerCase();
      list.innerHTML = "";
      const rows = getSurahList().filter(s => !query || String(s.number) === query || (s.englishName || "").toLowerCase().includes(query) || (s.englishNameTranslation || "").toLowerCase().includes(query) || (s.name || "").includes(query));
      page.querySelector("#qxFaCount").textContent = bnNumber(rows.length) + "টি";
      rows.forEach(s => {
        const row = document.createElement("div");
        row.className = "qx-fa-row";
        row.dataset.surah = String(s.number);
        const info = document.createElement("div"); info.className = "qx-fa-row-info";
        const num = document.createElement("span"); num.className = "qx-fa-num"; num.textContent = bnNumber(s.number);
        const names = document.createElement("span"); names.className = "qx-fa-names";
        const primary = document.createElement("strong"); primary.textContent = s.name || ("সূরা " + bnNumber(s.number));
        const secondary = document.createElement("small"); secondary.textContent = (s.englishNameTranslation || s.englishName || "") + " · " + bnNumber(s.numberOfAyahs || 0) + " আয়াত";
        names.append(primary, secondary); info.append(num, names);
        const play = document.createElement("button"); play.type = "button"; play.className = "qx-surah-audio-btn qx-fa-row-play"; play.dataset.surah = String(s.number); play.textContent = "{{play_arrow}}"; play.title = "সম্পূর্ণ সূরা শুনুন"; play.setAttribute("aria-label", "সূরা " + bnNumber(s.number) + " চালান");
        play.addEventListener("click", () => window.qxToggleFullSurahAudio && window.qxToggleFullSurahAudio(s.number));
        row.append(info, play); list.appendChild(row);
      });
      if (!rows.length) { const empty = document.createElement("p"); empty.className = "qx-fa-empty"; empty.textContent = "কোনো সূরা পাওয়া যায়নি।"; list.appendChild(empty); }
      if (window.qxSyncFullSurahAudioButtons) window.qxSyncFullSurahAudioButtons();
    };
    search.addEventListener("input", renderList);
    page.querySelector(".qx-fa-back").addEventListener("click", () => {
      if (window.qxFullAudioPageOpen && history.state && history.state.qx === "mode") history.back();
      else handleBackNavigation();
    });
    page.querySelector("#qxFaPrev").addEventListener("click", () => { const n = window.qxGetFullSurahAudioState ? window.qxGetFullSurahAudioState().number : 0; if (n > 1) window.qxToggleFullSurahAudio(n - 1); });
    page.querySelector("#qxFaNext").addEventListener("click", () => { const n = window.qxGetFullSurahAudioState ? window.qxGetFullSurahAudioState().number : 0; if (n > 0 && n < 114) window.qxToggleFullSurahAudio(n + 1); });
    page.querySelector("#qxFaPlay").addEventListener("click", () => { const state = window.qxGetFullSurahAudioState ? window.qxGetFullSurahAudioState() : null; if (state && state.number) window.qxToggleFullSurahAudio(state.number); else window.qxToggleFullSurahAudio(1); });
    page.querySelector("#qxFaRead").addEventListener("click", () => {
      const state = window.qxGetFullSurahAudioState ? window.qxGetFullSurahAudioState() : null;
      const number = state && state.number ? state.number : 0;
      if (!number) { if (typeof showToast === "function") showToast("আগে একটি সূরা চালু করুন।"); return; }
      window.qxFullAudioPageOpen = false;
      if (typeof openSurah === "function") openSurah(number);
    });
    const seek = page.querySelector("#qxFaSeek");
    seek.addEventListener("input", () => { if (window.qxSeekFullSurahAudio) window.qxSeekFullSurahAudio(Number(seek.value) / 1000); });
    renderList();
    updatePlayer();
  }
  function updatePlayer(){
    const page = document.querySelector(".qx-full-audio-page");
    if (!page || !window.qxGetFullSurahAudioState) return;
    const state = window.qxGetFullSurahAudioState();
    const s = state.number ? getSurah(state.number) : null;
    page.querySelector("#qxFaNowTitle").textContent = s ? (s.name || "সূরা " + bnNumber(s.number)) : "কোনো সূরা নির্বাচন করা হয়নি";
    page.querySelector("#qxFaNowSub").textContent = s ? ((s.englishNameTranslation || s.englishName || "") + " · " + bnNumber(s.numberOfAyahs || 0) + " আয়াত") : "শুনতে সূরার তালিকা থেকে Play চাপুন";
    page.querySelector("#qxFaPlay .ms").textContent = state.playing ? "pause" : "play_arrow";
    page.querySelector("#qxFaSeek").value = state.duration ? Math.round(state.currentTime / state.duration * 1000) : 0;
    page.querySelector("#qxFaProgressFill").style.width = (state.duration ? state.currentTime / state.duration * 100 : 0) + "%";
    page.querySelector("#qxFaCurrentTime").textContent = formatTime(state.currentTime);
    page.querySelector("#qxFaDuration").textContent = formatTime(state.duration);
    page.querySelector("#qxFaRead").disabled = !state.number;
    page.querySelectorAll(".qx-fa-row").forEach(row => row.classList.toggle("current", Number(row.dataset.surah) === state.number));
  }
  window.qxUpdateFullSurahAudioPage = updatePlayer;
  window.qxOpenFullSurahAudioPage = renderPage;
})();
// [FULL-SURAH-AUDIO-PAGE] end

// [FULL-SURAH-AUDIO-PLAYER] start
(function(){
  "use strict";

  const CACHE_NAME = "quranix-full-surah-audio-v1";
  const MANIFEST_URL = "audio/surah-audio-manifest.json";
  const audio = new Audio();
  audio.preload = "none";
  let manifestPromise = null;
  let manifestRows = [];
  let currentSurah = 0;
  let objectUrl = null;
  let requestToken = 0;
  let cacheFallbackTried = false;

  function audioUrl(file){
    return new URL("audio/" + encodeURIComponent(file), document.baseURI).href;
  }

  function releaseObjectUrl(){
    if (objectUrl) {
      try { URL.revokeObjectURL(objectUrl); } catch(e) {}
      objectUrl = null;
    }
  }

  function syncButtons(){
    const isPlaying = !audio.paused && !audio.ended;
    document.querySelectorAll(".qx-surah-audio-btn").forEach(button => {
      const isCurrent = Number(button.dataset.surah) === currentSurah;
      const showPause = isCurrent && isPlaying;
      button.textContent = showPause ? "{{pause}}" : "{{play_arrow}}";
      button.classList.toggle("on", isCurrent && (isPlaying || !!audio.src));
      button.title = showPause ? "পূর্ণ সূরা বিরতি দিন" : "সম্পূর্ণ সূরা শুনুন";
      button.setAttribute("aria-label", button.title);
    });
    if (typeof window.qxUpdateFullSurahAudioPage === "function") window.qxUpdateFullSurahAudioPage();
  }

  function loadManifest(){
    if (manifestPromise) return manifestPromise;
    manifestPromise = fetch(MANIFEST_URL, { cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("Manifest HTTP " + response.status);
        return response.json();
      })
      .then(rows => {
        if (!Array.isArray(rows) || rows.length !== 114) {
          throw new Error("Manifest must contain 114 surahs");
        }
        manifestRows = rows
          .map(item => ({ number: Number(item.number), file: String(item.file || "") }))
          .filter(item => item.number >= 1 && item.number <= 114 && item.file)
          .sort((a,b) => a.number - b.number);
        if (manifestRows.length !== 114) throw new Error("Manifest entries are incomplete");
        try { localStorage.setItem("qx_full_surah_audio_manifest", JSON.stringify(manifestRows)); } catch(e) {}
        return manifestRows;
      })
      .catch(error => {
        try {
          const saved = JSON.parse(localStorage.getItem("qx_full_surah_audio_manifest") || "null");
          if (Array.isArray(saved) && saved.length === 114) {
            manifestRows = saved;
            return manifestRows;
          }
        } catch(e) {}
        manifestPromise = null;
        throw error;
      });
    return manifestPromise;
  }

  async function playFromCache(url, token){
    if (!window.caches || token !== requestToken) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      if (!response || token !== requestToken) return false;
      const blob = await response.blob();
      if (token !== requestToken) return false;
      releaseObjectUrl();
      objectUrl = URL.createObjectURL(blob);
      audio.src = objectUrl;
      audio.load();
      await audio.play();
      return true;
    } catch(e) {
      return false;
    }
  }

  async function fallbackToCachedAudio(number, token){
    if (cacheFallbackTried || token !== requestToken) return false;
    cacheFallbackTried = true;
    try {
      const rows = await loadManifest();
      if (token !== requestToken) return false;
      const item = rows.find(row => row.number === number);
      if (item && await playFromCache(audioUrl(item.file), token)) return true;
    } catch(e) {}
    if (token === requestToken) {
      currentSurah = 0;
      syncButtons();
      if (typeof showToast === "function") {
        showToast("অডিও ফাইল লোড হয়নি। ইন্টারনেট সংযোগ ও ফাইলের নাম পরীক্ষা করুন।");
      }
    }
    return false;
  }

  async function startSurah(number){
    const token = ++requestToken;
    currentSurah = number;
    cacheFallbackTried = false;
    syncButtons();

    try {
      const rows = await loadManifest();
      if (token !== requestToken) return;
      const item = rows.find(row => row.number === number);
      if (!item) throw new Error("Surah audio not found in manifest");

      audio.pause();
      releaseObjectUrl();
      audio.removeAttribute("src");
      audio.load();
      const url = audioUrl(item.file);
      audio.src = url;
      audio.load();

      const playRequest = audio.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(error => {
          if (token !== requestToken) return;
          if (error && error.name === "NotAllowedError") {
            if (typeof showToast === "function") showToast("অডিও চালাতে আবার সূরার Play বাটনে চাপুন।");
            syncButtons();
            return;
          }
          fallbackToCachedAudio(number, token);
        });
      }
      syncButtons();
    } catch(error) {
      if (token !== requestToken) return;
      currentSurah = 0;
      syncButtons();
      if (typeof showToast === "function") {
        showToast(navigator.onLine
          ? "সূরার অডিও চালু করা যায়নি। ফাইলের নাম ও নেটওয়ার্ক পরীক্ষা করুন।"
          : "অফলাইনে চালাতে আগে সূরাটি ডাউনলোড করে রাখতে হবে।");
      }
    }
  }

  window.qxToggleFullSurahAudio = async function(number){
    number = Number(number);
    if (!Number.isInteger(number) || number < 1 || number > 114) return;

    if (currentSurah === number && audio.src) {
      if (audio.paused) {
        try { await audio.play(); } catch(e) {
          const rows = await loadManifest().catch(() => []);
          const item = rows.find(row => row.number === number);
          if (item) await playFromCache(audioUrl(item.file), requestToken);
        }
      } else {
        audio.pause();
      }
      syncButtons();
      return;
    }

    // একই সময়ে আয়াতের অডিও ও পূর্ণ সূরার অডিও যেন একসঙ্গে না বাজে।
    if (typeof window.stopAudio === "function") window.stopAudio();
    await startSurah(number);
  };

  window.qxStopFullSurahAudio = function(){
    ++requestToken;
    currentSurah = 0;
    try { audio.pause(); } catch(e) {}
    audio.removeAttribute("src");
    audio.load();
    releaseObjectUrl();
    syncButtons();
  };

  window.qxSyncFullSurahAudioButtons = syncButtons;
  window.qxGetFullSurahAudioState = function(){ return { number: currentSurah, playing: !audio.paused && !audio.ended, currentTime: Number(audio.currentTime) || 0, duration: Number(audio.duration) || 0 }; };
  window.qxSeekFullSurahAudio = function(ratio){ if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Math.max(0, Math.min(1, Number(ratio) || 0)) * audio.duration; };

  audio.addEventListener("timeupdate", syncButtons);
  audio.addEventListener("durationchange", syncButtons);
  audio.addEventListener("play", syncButtons);
  audio.addEventListener("pause", syncButtons);
  audio.addEventListener("ended", function(){
    if (currentSurah >= 1 && currentSurah < 114) {
      startSurah(currentSurah + 1);
    } else {
      currentSurah = 0;
      syncButtons();
    }
  });
  audio.addEventListener("error", function(){
    if (!currentSurah || cacheFallbackTried) return;
    fallbackToCachedAudio(currentSurah, requestToken);
  });

  // পেজ খোলার আগেই manifest প্রস্তুত রাখি, যাতে বাটনে চাপলে দ্রুত প্লে শুরু হয়।
  loadManifest().catch(() => {});
})();
// [FULL-SURAH-AUDIO-PLAYER] end


// [QURANIX: ONLINE BACKGROUND SYNC]
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('online', function () {
    navigator.serviceWorker.ready
      .then(function (registration) {

        if (registration.active) {
          registration.active.postMessage({
            type: 'QX_SYNC_ASSETS'
          });
        }

        if (typeof registration.update === 'function') {
          registration.update().catch(function () {});
        }

      })
      .catch(function () {});
  });
})();
