(() => {
  'use strict';
  const cfg = window.ACFA_CONFIG || {};
  const $ = (id) => document.getElementById(id);

  function updateClock(){
    const now = new Date();
    $('clock').textContent = now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    $('dateLabel').textContent = now.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'});
  }
  updateClock(); setInterval(updateClock, 1000);

  const goal = Math.max(1, Number(cfg.memberGoal || 100));
  const board = $('memberBoard');

  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function updateMemberProgress(count){
    const safeCount = Math.max(0, Number(count || 0));
    const pct = Math.min(100, Math.round(safeCount / goal * 100));
    $('memberCountTop').textContent = safeCount;
    $('memberCountText').textContent = `${safeCount} members`;
    $('progressBadge').textContent = `${pct}%`;
    $('progressText').textContent = `${pct}%`;
    $('progressFill').style.width = `${pct}%`;
    $('remainingText').textContent = `${Math.max(0, goal-safeCount)} remaining`;
    document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(pct));
  }

  function renderMembers(members){
    board.innerHTML = '';
    members.forEach(member => {
      const username = typeof member === 'string' ? member : member.username;
      const profileUrl = `https://www.chess.com/member/${encodeURIComponent(username)}`;
      const row = document.createElement('a');
      row.className = 'member-row';
      row.href = profileUrl;
      row.target = '_blank';
      row.rel = 'noopener noreferrer';
      row.innerHTML = `<span class="member-icon">♟</span><b>@${escapeHtml(username)}</b><span class="member-arrow">↗</span>`;
      board.appendChild(row);
    });
  }

  async function loadClubMembers(){
    const fallbackCount = Math.max(0, Number(cfg.memberCountFallback || 16));
    const fallbackMembers = cfg.newestMembersFallback || [];
    const clubSlug = cfg.clubSlug || 'and-chess-for-all-sidebar-academy';
    const limit = Math.max(1, Number(cfg.newestMemberLimit || 5));
    updateMemberProgress(fallbackCount);
    board.innerHTML = '<div class="member-row loading-row"><span class="member-icon">⌛</span><b>Loading newest members…</b></div>';

    try {
      const response = await fetch(`https://api.chess.com/pub/club/${encodeURIComponent(clubSlug)}/members`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Chess.com API returned ${response.status}`);
      const data = await response.json();
      const allMembers = [...(data.weekly || []), ...(data.monthly || []), ...(data.all_time || [])];
      const unique = [...new Map(allMembers.map(member => [member.username.toLowerCase(), member])).values()];
      unique.sort((a,b) => Number(b.joined || 0) - Number(a.joined || 0));
      updateMemberProgress(unique.length);
      renderMembers(unique.slice(0, limit));
      if (!unique.length) throw new Error('No members returned');
    } catch (error) {
      console.warn('Could not load Chess.com club members:', error);
      updateMemberProgress(fallbackCount);
      renderMembers(fallbackMembers.slice(0, limit));
      const note = document.createElement('div');
      note.className = 'api-note';
      note.textContent = 'Live member data is temporarily unavailable. Showing saved fallback data.';
      board.appendChild(note);
    }
  }
  loadClubMembers();

  let shown = new Date(); shown.setDate(1);
  const events = cfg.events || [];
  const eventMap = new Map(events.map(e => [e.date,e]));
  const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  function iso(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}
  function renderCalendar(){
    const y=shown.getFullYear(), m=shown.getMonth();
    $('calendarTitle').textContent = shown.toLocaleDateString([], {month:'long',year:'numeric'});
    const cal=$('calendar'); cal.innerHTML='';
    dayNames.forEach(n=>{const el=document.createElement('div');el.className='day-name';el.textContent=n;cal.appendChild(el)});
    const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();
    for(let i=0;i<42;i++){
      let d=i-first+1, cy=y, cm=m, muted=false;
      if(d<1){d=prevDays+d;cm=m-1;muted=true;if(cm<0){cm=11;cy--}}
      else if(d>days){d-=days;cm=m+1;muted=true;if(cm>11){cm=0;cy++}}
      const key=iso(cy,cm,d), ev=eventMap.get(key), now=new Date();
      const cell=document.createElement('div');cell.className='day'+(muted?' muted-day':'')+(key===iso(now.getFullYear(),now.getMonth(),now.getDate())?' today':'');
      cell.innerHTML=`<span>${d}</span>${ev?`<i class="event-dot ${escapeHtml(ev.type||'')}"></i>`:''}`;
      if(ev) cell.title=ev.title;
      cal.appendChild(cell);
    }
    const list=$('eventList'); list.innerHTML='';
    const monthEvents=events.filter(e=>e.date.startsWith(`${y}-${String(m+1).padStart(2,'0')}`));
    if(!monthEvents.length){list.innerHTML='<div class="event-item">No events scheduled for this month.</div>';return;}
    monthEvents.forEach(e=>{const dt=new Date(`${e.date}T12:00:00`);const el=document.createElement('div');el.className='event-item';el.innerHTML=`<strong>${dt.toLocaleDateString([], {month:'short',day:'numeric'})}</strong> — ${escapeHtml(e.title)}`;list.appendChild(el)});
  }
  $('prevMonth').onclick=()=>{shown.setMonth(shown.getMonth()-1);renderCalendar()};
  $('nextMonth').onclick=()=>{shown.setMonth(shown.getMonth()+1);renderCalendar()};
  $('todayMonth').onclick=()=>{shown=new Date();shown.setDate(1);renderCalendar()};
  renderCalendar();

  const audio=$('audio'), play=$('playPause'), select=$('playlistSelect'), eq=$('equalizer');
  let tracks=[], trackIndex=0;
  function prettyName(path){return decodeURIComponent(path.split('/').pop().replace(/\.mp3$/i,'').replace(/[-_]+/g,' ')).replace(/\b\w/g,c=>c.toUpperCase())}
  async function loadTracks(){
    try{const r=await fetch('music/tracks.json',{cache:'no-store'});if(!r.ok)throw new Error('playlist unavailable');tracks=await r.json();}
    catch{tracks=[]}
    select.innerHTML='';
    if(!tracks.length){select.innerHTML='<option>No MP3 files detected</option>';play.disabled=true;return;}
    tracks.forEach((t,i)=>{const o=document.createElement('option');o.value=i;o.textContent=prettyName(t);select.appendChild(o)});loadTrack(0);
  }
  function loadTrack(i){trackIndex=(i+tracks.length)%tracks.length;audio.src=tracks[trackIndex];select.value=trackIndex;$('trackTitle').textContent=prettyName(tracks[trackIndex]);$('seek').value=0;}
  async function toggle(){if(!tracks.length)return;if(audio.paused){try{await audio.play()}catch{} }else audio.pause();}
  play.onclick=toggle;$('prevTrack').onclick=()=>{loadTrack(trackIndex-1);audio.play().catch(()=>{})};$('nextTrack').onclick=()=>{loadTrack(trackIndex+1);audio.play().catch(()=>{})};
  select.onchange=()=>{loadTrack(Number(select.value));audio.play().catch(()=>{})};
  audio.onplay=()=>{play.textContent='❚❚';eq.classList.remove('paused')};audio.onpause=()=>{play.textContent='▶';eq.classList.add('paused')};audio.onended=()=>{$('nextTrack').click()};
  audio.ontimeupdate=()=>{if(audio.duration){$('seek').value=audio.currentTime/audio.duration*100;$('currentTime').textContent=formatTime(audio.currentTime);$('duration').textContent=formatTime(audio.duration)}};
  $('seek').oninput=()=>{if(audio.duration)audio.currentTime=Number($('seek').value)/100*audio.duration};
  function formatTime(s){if(!Number.isFinite(s))return'0:00';return`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`}
  eq.classList.add('paused');loadTracks();


  const tips = Array.isArray(cfg.codeTips) ? cfg.codeTips : [];
  let tipIndex = 0;
  function renderTip(){
    if(!tips.length){$('tipLabel').textContent='TIP';$('tipCode').textContent='Add tips inside config.js';$('tipExplanation').textContent='';return;}
    const tip=tips[tipIndex % tips.length];
    $('tipLabel').textContent=tip.label || 'TIP';
    $('tipCode').textContent=tip.code || '';
    $('tipExplanation').textContent=tip.explanation || '';
  }
  $('nextTip').onclick=()=>{tipIndex=(tipIndex+1)%Math.max(1,tips.length);renderTip()};
  renderTip();

  const themeButtons=[...document.querySelectorAll('[data-theme]')];
  const savedTheme=localStorage.getItem('acfaTheme') || 'default';
  function applyTheme(theme){
    document.body.dataset.theme=theme;
    themeButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.theme===theme));
    localStorage.setItem('acfaTheme',theme);
  }
  themeButtons.forEach(btn=>btn.addEventListener('click',()=>applyTheme(btn.dataset.theme)));
  applyTheme(savedTheme);

  const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const rain=$('codeRain'), symbols=['01','{}','</>','ACFA','♟','const','HTML','CSS'];
  for(let i=0;i<18;i++){const col=document.createElement('div');col.className='code-column';col.style.left=`${Math.random()*100}%`;col.style.animationDuration=`${10+Math.random()*15}s`;col.style.animationDelay=`-${Math.random()*15}s`;col.textContent=Array.from({length:25},()=>symbols[Math.floor(Math.random()*symbols.length)]).join('\n');rain.appendChild(col)}
})();
