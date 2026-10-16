(function(){
  var KEY = 'bogbon-v2';
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var money = function(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var WD = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan'];
  var WDL = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
  var STAGES = ['Gullash','Meva tugish','Pishish','Terim'];

  // ---------- sample data ----------
  var weather = [
    {hi:14,lo:3,ic:'sun',tx:'Quyoshli'},{hi:9,lo:-2,ic:'snow',tx:'Sovuq tong'},{hi:12,lo:1,ic:'cloud',tx:'Bulutli'},
    {hi:15,lo:4,ic:'sun',tx:'Quyoshli'},{hi:17,lo:6,ic:'sun',tx:'Quyoshli'},{hi:13,lo:7,ic:'rain',tx:'Yomg‘ir'},{hi:11,lo:5,ic:'cloud',tx:'Bulutli'}
  ];
  var market = [
    {n:'Olma',p:6500,d:300,h:[6000,6100,6200,6150,6300,6200,6500]},
    {n:'Uzum',p:12000,d:-500,h:[12800,12600,12500,12400,12600,12500,12000]},
    {n:'Shaftoli',p:9000,d:200,h:[8600,8700,8800,8700,8900,8800,9000]},
    {n:'O‘rik',p:15000,d:600,h:[14000,14200,14300,14400,14300,14400,15000]},
    {n:'Anor',p:11000,d:-300,h:[11600,11500,11400,11500,11300,11300,11000]}
  ];
  var kb = [
    {n:'Shira (bit)', k:'shira bit', a:'Barglar buralib qoladi. Sovunli suv bilan yuving, kuchli bo‘lsa biologik preparat sepiladi.'},
    {n:'Un shudring', k:'un shudring oq dog', a:'Barglarda oq g‘ubor. Zararlangan novdalarni kesing, oltingugurt asosidagi vosita purkang.'},
    {n:'Qipiq (parsha)', k:'qipiq parsha dog', a:'Barg va mevada qora dog. Bahorda gullashdan oldin mis kuporosi bilan purkang.'},
    {n:'Olma qurti', k:'olma qurt kuya meva', a:'Mevaga qurt tushadi. Feromon tuzoq osing, tushgan mevalarni yig‘ib yo‘q qiling.'},
    {n:'Sovuqdan himoya', k:'sovuq izg‘irin muzlash gul', a:'Kechqurun bog‘ni sug‘oring, tutun hosil qiling yoki gullagan novdalarni yoping.'},
    {n:'Sug‘orish', k:'sug‘orish suv tomchi', a:'Tong yoki kechqurun sug‘oring. Issiq kunda barglarga suv tegmasin.'}
  ];

  // ---------- state ----------
  var uid = 100;
  var state = {
    tasks:[
      {id:1,day:0,t:'06:00',n:'Olma bog‘ini sug‘orish',d:'Qator 1–4, tomchilatib',done:true},
      {id:2,day:0,t:'10:00',n:'Zararkunandaga qarshi purkash',d:'Shamol kuchsiz bo‘lganda',done:false},
      {id:3,day:0,t:'16:00',n:'O‘g‘it berish',d:'Shaftoli daraxtlari',done:false},
      {id:4,day:1,t:'17:00',n:'Gullagan daraxtlarni yopish',d:'Sovuqdan himoya',done:false},
      {id:5,day:2,t:'08:00',n:'Daraxt tagini yumshatish',d:'Uzumzor',done:false}
    ],
    gardens:[
      {id:1,n:'Olma bog‘i',a:1.2,p:80,c:'#3F8F4E',s:1,nx:'Hosilga 3 hafta qoldi. Mevalarni siyraklashtiring.'},
      {id:2,n:'Uzumzor',a:0.5,p:45,c:'#E8833A',s:1,nx:'Novdalarni simga bog‘lash kerak.'},
      {id:3,n:'Shaftoli',a:0.3,p:15,c:'#F2C14E',s:0,nx:'Gullash tugadi. O‘g‘it berish vaqti.'}
    ],
    listings:[], big:false, remind:false, sel:0
  };
  try { var raw = localStorage.getItem(KEY); if (raw) { var s = JSON.parse(raw); for (var k in s) state[k] = s[k]; } } catch(e){}
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
  state.tasks.forEach(function(t){ if (t.id >= uid) uid = t.id + 1; });
  state.gardens.forEach(function(g){ if (g.id >= uid) uid = g.id + 1; });

  var now = new Date();
  function dayInfo(off){ var d = new Date(now.getTime() + off*864e5); return {wd:WD[d.getDay()], wdl:WDL[d.getDay()], n:d.getDate()}; }
  function dayName(off){ return off === 0 ? 'Bugun' : off === 1 ? 'Ertaga' : dayInfo(off).wdl; }

  // ---------- toast ----------
  var tt;
  function toast(m){ var t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function(){ t.classList.remove('show'); }, 2300); }

  // ---------- hero trees ----------
  (function(){
    var h = '', rows = [[60,224,26],[150,214,28],[240,226,26],[330,216,28],[420,222,26],[500,214,22]], fr = [[-8,-6],[7,-2],[-2,8],[6,10]];
    rows.forEach(function(r,i){
      h += '<rect x="'+(r[0]-3)+'" y="'+r[1]+'" width="6" height="30" fill="#5b3a1e"/><circle cx="'+r[0]+'" cy="'+r[1]+'" r="'+r[2]+'" fill="#'+(i%2?'4fa85d':'3F8F4E')+'"/>';
      fr.forEach(function(f){ h += '<circle cx="'+(r[0]+f[0]*r[2]/26)+'" cy="'+(r[1]+f[1]*r[2]/26)+'" r="4.5" fill="#E8833A"/>'; });
    });
    $('trees').innerHTML = h;
  })();

  // ---------- tasks ----------
  function taskItem(t, withDel){
    return '<li class="task"><label><input type="checkbox" data-id="'+t.id+'"'+(t.done?' checked':'')+'>' +
      '<span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span class="time">'+esc(t.t)+'</span><span class="task-text"><b>'+esc(t.n)+'</b>'+(t.d?'<small>'+esc(t.d)+'</small>':'')+'</span></label>' +
      (withDel ? '<button class="del" type="button" data-del="'+t.id+'" aria-label="O‘chirish: '+esc(t.n)+'"><svg class="i"><use href="#i-trash"/></svg></button>' : '') + '</li>';
  }
  function sorted(day){ return state.tasks.filter(function(t){ return t.day === day; }).sort(function(a,b){ return a.t < b.t ? -1 : 1; }); }
  function renderTasks(){
    var today = sorted(0), done = today.filter(function(t){ return t.done; }).length, left = today.length - done;
    $('homeTasks').innerHTML = today.length ? today.map(function(t){ return taskItem(t,false); }).join('') : '<li class="empty">Bugun ish yo‘q. “Ish qo‘shish” tugmasi bilan reja tuzing.</li>';
    $('count').textContent = done + ' / ' + today.length + ' bajarildi';
    var w = alertInfo();
    $('sub').innerHTML = (today.length === 0 ? 'Bugun ish rejalashtirilmagan' : left ? 'Bugun ' + left + ' ta ish qoldi' : 'Bugungi barcha ishlar bajarildi') +
      (w ? ' va 1 ta ogohlantirish bor. <a href="#alert" id="toAlert">Ko‘rish</a>' : '.');
    // day page
    var off = state.sel, list = sorted(off);
    $('dayTitle').textContent = dayName(off) + ' uchun ishlar';
    $('dayCount').textContent = list.filter(function(t){return t.done;}).length + ' / ' + list.length + ' bajarildi';
    $('dayTasks').innerHTML = list.length ? list.map(function(t){ return taskItem(t,true); }).join('') :
      '<li class="empty">Bu kunga ish yo‘q. Yuqoridagi maydondan ish qo‘shing.</li>';
    renderWeek();
  }
  function renderWeek(){
    var h = '';
    for (var i = 0; i < 7; i++){
      var d = dayInfo(i), has = state.tasks.some(function(t){ return t.day === i && !t.done; });
      h += '<button class="wd" type="button" data-day="'+i+'" aria-pressed="'+(state.sel===i)+'" aria-label="'+dayName(i)+', '+d.n+'"><small>'+d.wd+'</small>'+d.n+(has?'<span class="dotmark"></span>':'')+'</button>';
    }
    $('week').innerHTML = h;
  }
  function onTaskChange(e){
    var id = e.target.getAttribute('data-id'); if (id === null) return;
    state.tasks.forEach(function(t){ if (String(t.id) === id){ t.done = e.target.checked; } });
    save(); renderTasks(); toast(e.target.checked ? 'Bajarildi deb belgilandi' : 'Ish qayta ochildi');
  }
  $('homeTasks').addEventListener('change', onTaskChange);
  $('dayTasks').addEventListener('change', onTaskChange);
  $('dayTasks').addEventListener('click', function(e){
    var b = e.target.closest('[data-del]'); if (!b) return;
    var id = b.getAttribute('data-del');
    state.tasks = state.tasks.filter(function(t){ return String(t.id) !== id; });
    save(); renderTasks(); toast('Ish o‘chirildi');
  });
  $('week').addEventListener('click', function(e){
    var b = e.target.closest('[data-day]'); if (!b) return;
    state.sel = +b.getAttribute('data-day'); renderTasks();
  });
  $('taskForm').addEventListener('submit', function(e){
    e.preventDefault();
    var n = $('taskName').value.trim(); if (!n) return;
    state.tasks.push({id:uid++, day:state.sel, t:$('taskTime').value || '08:00', n:n, d:'', done:false});
    $('taskName').value = ''; save(); renderTasks(); toast('Ish qo‘shildi: ' + dayName(state.sel));
  });

  // ---------- gardens ----------
  function renderGardens(){
    $('homeGardens').innerHTML = state.gardens.slice(0,3).map(function(g){
      return '<div class="garden"><div class="garden-top">'+esc(g.n)+'<span>'+g.a+' gektar</span></div>' +
        '<div class="bar" role="progressbar" aria-valuenow="'+g.p+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+esc(g.n)+' hosil tayyorligi"><i data-w="'+g.p+'" style="background:'+g.c+'"></i></div>' +
        '<div class="stage">'+g.p+'% — '+STAGES[g.s]+'</div></div>';
    }).join('');
    $('gcards').innerHTML = state.gardens.map(function(g){
      var steps = STAGES.map(function(s,i){ return '<li class="'+(i<g.s?'done':i===g.s?'cur':'')+'">'+s+'</li>'; }).join('');
      return '<article class="gcard"><h3>'+esc(g.n)+'<span>'+g.a+' gektar</span></h3>' +
        '<ol class="steps" aria-label="Bosqichlar">'+steps+'</ol>' +
        '<div><div class="bar" role="progressbar" aria-valuenow="'+g.p+'" aria-valuemin="0" aria-valuemax="100" aria-label="Tayyorlik"><i data-w="'+g.p+'" style="background:'+g.c+'"></i></div><div class="stage">Tayyorlik: '+g.p+'%</div></div>' +
        '<p class="next"><b>Keyingi qadam:</b> '+esc(g.nx)+'</p>' +
        '<button class="btn sm line" type="button" data-adv="'+g.id+'"'+(g.s>=3?' disabled':'')+'>Keyingi bosqichga o‘tkazish</button></article>';
    }).join('');
    var total = state.gardens.reduce(function(a,g){ return a + g.a; }, 0);
    $('gSummary').textContent = state.gardens.length + ' ta bog‘ · ' + (Math.round(total*10)/10) + ' gektar';
    setTimeout(function(){ document.querySelectorAll('.bar i').forEach(function(b){ b.style.width = b.getAttribute('data-w') + '%'; }); }, 120);
  }
  $('gcards').addEventListener('click', function(e){
    var b = e.target.closest('[data-adv]'); if (!b) return;
    var id = b.getAttribute('data-adv');
    state.gardens.forEach(function(g){ if (String(g.id) === id && g.s < 3){ g.s++; g.p = Math.min(100, Math.max(g.p, [10,40,80,100][g.s])); g.nx = ['Gullashni kuzating.','Meva tugishda siyraklashtiring.','Hosilga tayyorlaning.','Terimni boshlang.'][g.s]; toast(g.n + ': ' + STAGES[g.s] + ' bosqichi'); } });
    save(); renderGardens();
  });
  $('gardenForm').addEventListener('submit', function(e){
    e.preventDefault();
    var n = $('gName').value.trim(); if (!n) return;
    state.gardens.push({id:uid++, n:n, a:+$('gArea').value || 0.5, p:5, c:'#3F8F4E', s:0, nx:'Gullash boshlanishini kuzating.'});
    $('gName').value = ''; save(); renderGardens(); toast('Bog‘ qo‘shildi: ' + n);
  });

  // ---------- weather & alert ----------
  function renderWeather(){
    $('days').innerHTML = weather.slice(0,5).map(function(w,i){
      var fr = w.lo <= 0;
      return '<div class="day'+(fr?' frost':'')+'"><b>'+(i===0?'Bugun':i===1?'Ertaga':dayInfo(i).wd)+'</b><svg class="i"><use href="#i-'+w.ic+'"/></svg><span>'+w.hi+'°</span><small>'+(w.lo<0?'−'+Math.abs(w.lo):w.lo)+'°</small>'+(fr?'<em>Sovuq</em>':'')+'</div>';
    }).join('');
  }
  function alertInfo(){ for (var i = 0; i < weather.length; i++) if (weather[i].lo <= 0) return {off:i, lo:weather[i].lo}; return null; }
  function renderAlert(){
    var a = alertInfo(), box = $('alert');
    if (a){
      box.classList.remove('ok');
      $('alertTitle').textContent = dayName(a.off) + ' tongda sovuq: −' + Math.abs(a.lo) + '°C';
      $('alertBody').textContent = 'Gullagan daraxtlarni kechqurun yoping yoki tutun hosil qiling.';
      $('remind').hidden = false;
      $('remind').textContent = state.remind ? 'Eslatma qo‘yildi' : 'Eslatma qo‘yish';
      $('remind').disabled = state.remind;
    } else {
      box.classList.add('ok');
      $('alertTitle').textContent = 'Ogohlantirish yo‘q';
      $('alertBody').textContent = 'Keyingi kunlarda xavfli ob-havo kutilmaydi.';
      $('remind').hidden = true;
    }
  }
  $('remind').addEventListener('click', function(){
    var a = alertInfo(); if (!a) return;
    state.remind = true;
    var exists = state.tasks.some(function(t){ return t.n === 'Gullagan daraxtlarni yopish' && t.day === a.off; });
    if (!exists) state.tasks.push({id:uid++, day:a.off, t:'17:00', n:'Gullagan daraxtlarni yopish', d:'Sovuqdan himoya', done:false});
    save(); renderAlert(); renderTasks(); toast('Eslatma qo‘yildi: ' + dayName(a.off).toLowerCase() + ' 17:00');
  });

  // ---------- market ----------
  function spark(h, up){
    var mn = Math.min.apply(null,h), mx = Math.max.apply(null,h), r = (mx-mn)||1;
    var pts = h.map(function(v,i){ return (i*100/(h.length-1)).toFixed(1)+','+(26-(v-mn)/r*22).toFixed(1); }).join(' ');
    return '<svg class="sp" viewBox="0 0 100 30" preserveAspectRatio="none" role="img" aria-label="7 kunlik narx grafigi"><polyline points="'+pts+'" fill="none" stroke="'+(up?'#3F8F4E':'#E8833A')+'" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var filter = 'all';
  function renderMarket(){
    $('homePrices').innerHTML = market.slice(0,3).map(function(m){
      return '<div class="price">'+m.n+'<b>'+money(m.p)+' so‘m/kg</b><span class="'+(m.d>0?'up':'down')+'">'+(m.d>0?'▲':'▼')+' '+Math.abs(m.d)+' bugun</span></div>';
    }).join('');
    var list = market.filter(function(m){ return filter === 'all' || (filter === 'up' ? m.d > 0 : m.d < 0); });
    $('mlist').innerHTML = list.map(function(m){
      return '<li class="mrow"><b>'+m.n+'</b>'+spark(m.h, m.d>0)+'<span class="pr">'+money(m.p)+' so‘m<small class="'+(m.d>0?'up':'down')+'">'+(m.d>0?'▲ +':'▼ −')+Math.abs(m.d)+'</small></span><span class="muted">kg uchun</span></li>';
    }).join('') || '<li class="empty">Bu toifada mahsulot yo‘q.</li>';
    $('sItem').innerHTML = market.map(function(m){ return '<option>'+m.n+'</option>'; }).join('');
    if (!$('sPrice').value) $('sPrice').value = market[0].p;
    renderMine();
  }
  $('filters').addEventListener('click', function(e){
    var b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.getAttribute('data-f');
    document.querySelectorAll('#filters .fbtn').forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
    renderMarket();
  });
  $('sItem').addEventListener('change', function(){
    var m = market.filter(function(x){ return x.n === $('sItem').value; })[0]; if (m) $('sPrice').value = m.p;
  });
  function renderMine(){
    $('mine').innerHTML = state.listings.map(function(l){
      return '<li><span><b>'+esc(l.n)+'</b> · '+money(l.kg)+' kg · '+money(l.pr)+' so‘m/kg</span><button class="del" type="button" data-rm="'+l.id+'" aria-label="E’lonni o‘chirish"><svg class="i"><use href="#i-trash"/></svg></button></li>';
    }).join('');
  }
  $('mine').addEventListener('click', function(e){
    var b = e.target.closest('[data-rm]'); if (!b) return;
    state.listings = state.listings.filter(function(l){ return String(l.id) !== b.getAttribute('data-rm'); });
    save(); renderMine(); toast('E’lon o‘chirildi');
  });
  $('sellForm').addEventListener('submit', function(e){
    e.preventDefault();
    state.listings.unshift({id:uid++, n:$('sItem').value, kg:+$('sKg').value, pr:+$('sPrice').value});
    save(); renderMine(); toast('E’lon joylandi');
  });

  // ---------- search / knowledge ----------
  function norm(s){ return s.toLowerCase().replace(/[‘’ʻʼ'`]/g,'').trim(); }
  function find(text){
    var v = norm(text); if (!v) return [];
    return kb.filter(function(x){ return (norm(x.n)+' '+norm(x.k)).indexOf(v) > -1 || norm(x.k).split(' ').some(function(w){ return w.length > 2 && v.indexOf(w) > -1; }); });
  }
  function search(){
    var v = $('q').value, res = $('results');
    if (!norm(v)){ res.hidden = true; return; }
    var hit = find(v); res.hidden = false;
    $('resTitle').textContent = hit.length ? '“' + v.trim() + '” bo‘yicha ' + hit.length + ' ta natija' : 'Hech narsa topilmadi';
    $('resList').innerHTML = hit.length ? hit.map(function(x){ return '<li><b>'+esc(x.n)+'</b><span>'+esc(x.a)+'</span></li>'; }).join('')
      : '<li>Boshqa so‘z bilan qidiring, masalan: shira, sovuq, sug‘orish. Yoki <a href="#/maslahat">agronomga yozing</a>.</li>';
  }
  $('searchForm').addEventListener('submit', function(e){ e.preventDefault(); search(); });
  $('q').addEventListener('input', search);
  $('clear').addEventListener('click', function(){ $('q').value=''; $('results').hidden = true; $('q').focus(); });

  // ---------- consult: diagnosis ----------
  var fileSize = 0;
  $('photo').addEventListener('change', function(){
    var f = this.files && this.files[0]; if (!f) return;
    fileSize = f.size;
    var img = $('preview'); img.src = URL.createObjectURL(f); img.hidden = false; $('dropHint').hidden = true;
    $('diagBtn').disabled = false; $('diagOut').innerHTML = '';
  });
  $('diagBtn').addEventListener('click', function(){
    var out = $('diagOut'), btn = this;
    btn.disabled = true; out.innerHTML = '<div class="spin"><i></i>Surat tekshirilmoqda...</div>';
    setTimeout(function(){
      var d = kb[fileSize % 4];
      out.innerHTML = '<div class="diag"><span class="muted">Taxminiy natija</span><br><b>'+esc(d.n)+'</b><p style="margin-top:.4rem">'+esc(d.a)+'</p></div>';
      btn.disabled = false;
    }, 1400);
  });

  // ---------- consult: chat ----------
  var msgs = $('msgs');
  function say(txt, me){ var d = document.createElement('div'); d.className = 'm' + (me ? ' me' : ''); d.textContent = txt; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; }
  say('Assalomu alaykum! Bog‘ haqida savolingizni yozing.');
  function ask(txt){
    txt = txt.trim(); if (!txt) return;
    say(txt, true);
    setTimeout(function(){
      var h = find(txt);
      say(h.length ? h[0].n + ': ' + h[0].a : 'Savolingiz agronomga yuborildi. Javob kelganda shu yerda ko‘rasiz.');
    }, 700);
  }
  $('chatForm').addEventListener('submit', function(e){ e.preventDefault(); ask($('chatIn').value); $('chatIn').value = ''; });
  $('qr').addEventListener('click', function(e){ if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });

  // ---------- network + zoom ----------
  var net = $('netChip');
  function setNet(on){ net.classList.toggle('off', !on); $('netText').textContent = on ? 'Onlayn' : 'Oflayn: ma’lumot saqlanadi'; }
  net.addEventListener('click', function(){ var off = !net.classList.contains('off'); setNet(!off); toast(off ? 'Oflayn rejim: o‘zgarishlar telefonda saqlanadi' : 'Onlayn: ma’lumotlar yangilandi'); });
  window.addEventListener('offline', function(){ setNet(false); });
  window.addEventListener('online', function(){ setNet(true); });
  function applyZoom(){ document.documentElement.classList.toggle('big', !!state.big); $('zoom').setAttribute('aria-pressed', !!state.big); }
  $('zoom').addEventListener('click', function(){ state.big = !state.big; applyZoom(); save(); toast(state.big ? 'Katta shrift yoqildi' : 'Oddiy shrift'); });

  // ---------- router ----------
  var TITLES = {home:'Bosh sahifa', ishlar:'Ishlar', bogim:'Bog‘im', bozor:'Bozor', maslahat:'Maslahat'};
  var pendingFocus = null;
  function route(){
    var m = (location.hash.match(/^#\/(\w+)/) || [])[1];
    if (!TITLES[m]) { if (location.hash === '#alert') return; m = 'home'; }
    document.querySelectorAll('.view').forEach(function(v){ v.classList.toggle('on', v.getAttribute('data-view') === m); });
    document.querySelectorAll('[data-nav]').forEach(function(a){ if (a.getAttribute('data-nav') === m) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    document.title = 'Bog‘Bon — ' + TITLES[m];
    window.scrollTo(0,0);
    if (pendingFocus){ var el = $(pendingFocus); pendingFocus = null; if (el) setTimeout(function(){ el.focus(); }, 50); }
    if (m === 'bogim' || m === 'home') renderGardens();
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a'); if (!a) return;
    if (a.getAttribute('data-focus')) pendingFocus = a.getAttribute('data-focus');
    if (a.getAttribute('href') === '#alert'){ e.preventDefault(); $('alert').scrollIntoView({behavior:'smooth', block:'center'}); }
  });
  window.addEventListener('hashchange', route);

  // ---------- init ----------
  applyZoom(); renderTasks(); renderGardens(); renderWeather(); renderAlert(); renderMarket(); route();
})();
