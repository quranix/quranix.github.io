
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
  function currentReciter(){ return (typeof currentReciter!=='undefined'?currentReciter:localStorage.getItem('reciter')) || 'Saood_ash-Shuraym_128kbps'; }
  // NOTE: currentReciter is a let in main script; accessing it here via window may fail - read from ls instead
  function reciterNow(){ try{ var v=localStorage.getItem('reciter'); return v?JSON.parse(v):'Saood_ash-Shuraym_128kbps'; }catch(e){ return 'Saood_ash-Shuraym_128kbps'; } }
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
    if(m[k]){ // delete
      if(!confirm('এই সূরার ডাউনলোড মুছে ফেলবা?')) return;
      var count=Number(cur.count||0);
      // Reader list may be unavailable after navigation; use canonical surah metadata as fallback.
      if(!count && window.surahs){var sm=window.surahs.find(function(x){return Number(x.number)===Number(cur.n);});count=sm?Number(sm.numberOfAyahs||0):0;}
      if(cur.list && cur.list.length){for (let i=0;i<cur.list.length;i++){try{await del(keyFor(rec,cur.list[i].s.number,cur.list[i].no));}catch(e){}}}
      else {for (let ai=1;ai<=count;ai++){try{await del(keyFor(rec,cur.n,ai));}catch(e){}}}
      delete m[k]; saveMeta(m); if(typeof showToast==='function') showToast('ডাউনলোড মুছে ফেলা হয়েছে'); refreshDlBar(); return;
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
    }catch(e){ if(typeof showToast==='function') showToast('ডাউনলোড হয়নি, আবার চেষ্টা করো'); }
    downloading=false; refreshDlBar();
  }
  document.getElementById('dlBtn').onclick=downloadCurrent;
  document.getElementById('dlManageBtn').onclick=function(){ if(window.openGridPopup) window.openGridPopup('downloads'); };
  setInterval(refreshDlBar, 800);
  document.addEventListener('click', function(){ setTimeout(refreshDlBar, 400); });

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
          audioObj.playbackRate = SPEEDS[audioSpeedIdx] || 1;
          audioTitle.textContent = item.s.englishName + ' · আয়াত ' + toBn(item.no);
          audioReciterLabel.textContent = reciterName(rec) + ' · অফলাইন';
          audioBar.style.display = 'block';
          updateAudioBarPos();
          audioAuto.classList.toggle('on', autoPlayNext);
          highlightPlayingCard(item.s.number, item.no);
          await audioObj.play();
          audioPlayPause.textContent = '{{pause}}';
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
  var HADITH_CDN='https://cdn.jsdelivr.net/gh/kafelanetwork/hadith-api@main/';
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
    const p = document.getElementById('qxPackageProgress');
    const t = document.getElementById('qxPackageStatus');
    const action = document.getElementById('qxPackageAction');
    if(p) p.value=job.total?Math.min(100,Math.round(job.done/job.total*100)):0;
    if(t) t.textContent=job.message+' · '+job.done+'/'+job.total;
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
    if(packageJob && !packageJob.finished){ showToast('আগের ডাউনলোডটি আগে শেষ বা বাতিল করো'); return; }
    if(!navigator.onLine){ showToast('ডাউনলোডের জন্য ইন্টারনেট সংযোগ প্রয়োজন'); return; }
    if(type==='audio' && !confirm('সম্পূর্ণ কুরআনের ৬,২৩৬টি অডিও ফাইল ডাউনলোড হবে। এতে অনেক স্টোরেজ ও ডেটা লাগতে পারে। চালিয়ে যাবে?')) return;
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
            var url=TAFSIR_CDN+tafsirSlug+'/'+ts+'.json';
            var response=await fetch(url,{signal:job.controller.signal});
            if(!response.ok) response=await fetch(TAFSIR_CDN_MAIN+tafsirSlug+'/'+ts+'.json',{signal:job.controller.signal});
            if(!response.ok) throw new Error('তাফসির API HTTP '+response.status+' (সূরা '+ts+')');
            var payload=await response.json();
            if(!payload || !Array.isArray(payload.ayahs)) throw new Error('তাফসিরের ডেটা কাঠামো সঠিক নয়: সূরা '+ts);
            tafData=payload.ayahs.map(function(row){var n=Number(row.ayah||row.verse_number||0);return {verse_number:n,verse_key:ts+':'+n,text:String(row.text||'').trim()};}).filter(function(row){return row.verse_number>0 && row.text;});
            if(!validTafsirRows(tafData)) throw new Error('তাফসিরের সূরা '+ts+'-এর ডেটা খালি, অসম্পূর্ণ বা পুনরাবৃত্ত আয়াতযুক্ত');
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
      job.finished=true; job.message='ডাউনলোড সম্পন্ন'; job.done=job.total; updatePackageProgress(job);
      metaMap=packageMeta(); metaMap[key]={type:type,id:String(id),label:label,status:'complete',done:job.total,bytes:job.bytes,total:job.total,updated:new Date().toISOString()}; savePackageMeta(metaMap);
      showToast(label+' সম্পূর্ণ ডাউনলোড হয়েছে');
    }catch(error){
      job.finished=true;
      var cancelled=job.cancelled || error.name==='AbortError' || error.message==='cancelled';
      job.message=cancelled?'ডাউনলোড বাতিল':'ডাউনলোডে সমস্যা: '+error.message;
      metaMap=packageMeta();
      if(metaMap[key]){metaMap[key].status=cancelled?'paused':'incomplete';metaMap[key].done=job.done;metaMap[key].bytes=job.bytes;metaMap[key].updated=new Date().toISOString();savePackageMeta(metaMap);}
      showToast(cancelled?'ডাউনলোড থামানো হয়েছে':'ডাউনলোড সম্পূর্ণ হয়নি: '+error.message);
    }
    packageJob=null;
    renderDownloadsPopup();
  }

  async function deletePackage(type,id){
    var key=packageKey(type,id), m=packageMeta();
    if(!m[key]) return;
    if(!confirm('“'+(m[key].label||'প্যাকেজ')+'” ডাউনলোড মুছে ফেলবে?')) return;
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
      const gm = document.getElementById('gDlMini'); if(gm) gm.textContent=cnt+' প্যাকেজ ›';
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
    Object.keys(packages).forEach(function(k){
      if(packages[k].status==='downloading' && (!packageJob || packageJob.finished)) packages[k].status='incomplete';
    });
    savePackageMeta(packages);
    var html='<div class="pp-header"><h3>{{download}} ডাউনলোড</h3><button type="button" class="pp-close" aria-label="বন্ধ করুন" onclick="document.getElementById(\'gridPopupOverlay\').classList.remove(\'open\')">{{close}}</button></div>'+ 
      '<span id="qxDlMarker" hidden></span>'
      +'<div style="margin:8px 0 6px"><input id="qxDlSearch" class="pp-input" placeholder="অনুবাদ, তাফসির, কারি, হাদিস বা সূরা খুঁজুন..." autocomplete="off" style="margin-bottom:0"></div>'
      +'<div id="qxDlSearchInfo" class="pp-mini" style="display:none;margin-bottom:8px"></div>';
    var isDone=function(k){return packages[k]&&packages[k].status==='complete';};
    var card=function(btnId,title,note,btnText){return '<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms">{{folder_open}}</span><b>'+title+'</b></div><small style="display:block;margin:4px 0 8px">'+note+'</small><button class="pp-btn" id="'+btnId+'">{{download}} '+btnText+'</button></div>';};
    if(!isDone(packageKey('translation','bn.zakaria'))) html+=card('qxDownloadTranslation','অনুবাদ · ড. আবু বকর মুহাম্মাদ যাকারিয়া','সম্পূর্ণ ১১৪ সূরার বাংলা অনুবাদ','সম্পূর্ণ অনুবাদ ডাউনলোড');
    var pendingTafsir=TAFSIRS.filter(function(t){return !isDone(packageKey('tafsir',t[0]));});
    if(pendingTafsir.length){
      html+='<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms">{{menu_book}}</span><b>তাফসির</b></div><small style="display:block;margin:4px 0 8px">সম্পূর্ণ কুরআনের তাফসির অফলাইনে সংরক্ষণ করুন</small><div class="dl-grid cols-2">';
      pendingTafsir.forEach(function(t){html+='<button class="pp-btn" data-tafsir-dl="'+t[0]+'">{{download}} '+t[1]+'</button>';});
      html+='</div></div>';
    }
    var pendingAudio=RECITERS.filter(function(r){return !isDone(packageKey('audio',r[0]));});
    if(pendingAudio.length){
      html+='<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms">{{volume_up}}</span><b>অডিও তিলাওয়াত</b></div><small style="display:block;margin:4px 0 8px">কারি অনুযায়ী সম্পূর্ণ কুরআন ডাউনলোড করুন</small><div class="dl-grid cols-2">';
      pendingAudio.forEach(function(r){html+='<button class="pp-btn" data-audio-dl="'+r[0]+'">{{download}} '+r[1]+'</button>';});
      html+='</div></div>';
    }
    var pendingHadith=HADITH_CORPUS.filter(function(c){return !isDone(packageKey('hadith',c.id));});
    if(pendingHadith.length){
      html+='<div class="dl-item" style="display:block"><div class="set-title" style="margin-bottom:6px"><span class="ms" style="display:grid;place-items:center;width:28px;height:28px;border-radius:var(--qx-radius);background:var(--qx-main-soft);color:var(--qx-main-color);font-size:var(--qx-fs-xl)">{{history_edu}}</span><b>হাদিসের কিতাব</b></div><small style="display:block;margin:4px 0 8px">বাংলা ও আরবি ডেটা অধ্যায়ভিত্তিক সংরক্ষণ</small><div class="dl-grid cols-2">';
      pendingHadith.forEach(function(c){html+='<button class="pp-btn" data-hadith-dl="'+c.id+'"><span class="ms" style="font-size:var(--qx-fs-xl);margin-right:4px">{{download}}</span>'+c.name+'</button>';});
      html+='</div></div>';
    }
    var m=meta(), ks=Object.keys(m);
    var hasSurahAudio = ks.length>0;
    if(ks.length){
      html+='<h4 style="margin:16px 0 8px;display:flex;align-items:center;gap:8px"><span class="ms" style="display:grid;place-items:center;width:28px;height:28px;border-radius:var(--qx-radius);background:var(--qx-main-soft);color:var(--qx-main-color);font-size:var(--qx-fs-xl)">{{headphones}}</span> সূরা-ভিত্তিক অডিও ডাউনলোড</h4>';
      ks.forEach(function(k){var info=m[k],parts=k.split('|'),sn=parseInt(parts[0],10); html+='<div class="dl-item"><div><b>'+(info.name||('সূরা '+sn))+'</b><br><small>'+getReciterName(info.reciter)+' · '+info.count+' আয়াত</small></div><button class="dl-btn ghost" data-del="'+k+'">{{delete}}</button></div>';});
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
    var hasPackages = entries.length>0;
    if(entries.length){ html+='<h4 style="margin:16px 0 8px;display:flex;align-items:center;gap:8px"><span class="ms" style="display:grid;place-items:center;width:28px;height:28px;border-radius:var(--qx-radius);background:var(--qx-main-soft);color:var(--qx-main-color);font-size:var(--qx-fs-xl)">{{folder_open}}</span> ডাউনলোড করা প্যাকেজ</h4>';
    if(entries.length){
      entries.forEach(function(k){
        var item=packages[k];
        var state=item.status==='complete'?'সম্পূর্ণ':item.status==='paused'?'থামানো':'অসম্পূর্ণ';
        var total=Number(item.total||0), done=Number(item.done||0);
        var pct=total>0?Math.min(100, Math.round((done/total)*100)): (item.status==='complete'?100:0);
        var showProg=item.status!=='complete';
        html+='<div class="dl-item" data-search="'+String(item.label||'প্যাকেজ').toLowerCase()+' '+state+'" style="display:flex;flex-direction:column;align-items:stretch;gap:6px">'
          +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;width:100%"><div style="min-width:0;flex:1"><b>'+String(item.label||'প্যাকেজ')+'</b><br><small>'+state+' · '+done+'/'+total+' · '+formatBytes(item.bytes||0)+'</small></div>'
          +'<div style="display:flex;gap:6px;flex-shrink:0">'
          +(item.status==='complete'?'':'<button class="dl-btn" data-pkgretry="'+k+'">আবার চেষ্টা</button>')
          +'<button class="dl-btn ghost" data-pkgdel="'+k+'">{{delete}} মুছুন</button></div></div>'
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
    box.querySelectorAll('[data-tafsir-dl]').forEach(function(b){b.onclick=function(){var tid=parseInt(b.dataset.tafsirDl,10);runPackage('tafsir',tid,'তাফসির · '+tafsirLabel(tid));};});
    box.querySelectorAll('[data-audio-dl]').forEach(function(b){b.onclick=function(){var rid=b.dataset.audioDl;runPackage('audio',rid,'অডিও · '+getReciterName(rid));};});
    box.querySelectorAll('[data-hadith-dl]').forEach(function(b){b.onclick=function(){var c=HADITH_CORPUS.find(function(x){return x.id===b.dataset.hadithDl;});if(c)runPackage('hadith',c.id,c.name);};});
    bind('qxPackageAction',function(){if(!packageJob)return;packageJob.paused=!packageJob.paused;updatePackageProgress(packageJob);});
    bind('qxPackageCancel',function(){if(!packageJob)return;packageJob.cancelled=true;if(packageJob.controller)packageJob.controller.abort();});
    box.querySelectorAll('[data-pkgretry]').forEach(function(b){b.onclick=function(){var bits=b.dataset.pkgretry.split('|'),type=bits.shift(),id=bits.join('|'),item=packages[b.dataset.pkgretry];runPackage(type,id,item.label||'প্যাকেজ');};});
    box.querySelectorAll('[data-pkgdel]').forEach(function(b){b.onclick=function(){var bits=b.dataset.pkgdel.split('|');deletePackage(bits[0],bits.slice(1).join('|'));};});
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
        if(!confirm('এই সূরার অডিও ডাউনলোড মুছে ফেলবে?')) return;
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
    const mini = document.getElementById('gDlMini'); if(mini) mini.textContent=entries.length+' প্যাকেজ ›';
  }
  window.quranixHadithCollections=HADITH_CORPUS;
  window.quranixPackageStore={
    getHadithChapter:async function(id,chapter){return contentGet(hadithChapterKey(id,chapter));},
    getHadithMeta:async function(id){return contentGet(hadithMetaKey(id));},
    getTranslation:async function(edition,surah){return contentGet('translation|'+edition+'|'+surah);},
    getTafsir:async function(id,surah,ayah){var rows=await contentGet('tafsir|'+id+'|'+surah);if(!Array.isArray(rows))return null;var row=rows.find(function(x){return Number(x.verse_number)===Number(ayah)||x.verse_key===surah+':'+ayah;});return row?(row.text||'এই আয়াতের জন্য এই তাফসিরে আলাদা ব্যাখ্যা পাওয়া যায়নি।'):'এই আয়াতের জন্য এই তাফসিরে আলাদা ব্যাখ্যা পাওয়া যায়নি।';}
  };
  window.renderDownloadsPopup=renderDownloadsPopup;
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
      if(consent !== 'yes'){
        var ok = confirm('তাফসির অফলাইনে রাখতে ডাউনলোড করবো?\nআনুমানিক সাইজ: 2-5 MB\nমোবাইল ডাটা ব্যবহার হতে পারে।\n\nOK দিলে ডাউনলোড হবে, Cancel দিলে হবে না।');
        try{ localStorage.setItem('quranix_auto_dl_consent', ok ? 'yes' : 'no'); }catch(storageError){}
        if(!ok) return;
      }
      runPackage('tafsir',defId,'তাফসির · '+tafsirLabel(defId));
    }catch(e){}
  }
  window.addEventListener('load',function(){ setTimeout(autoInstallDefaults,5000); });
})();
