const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

const state = {
  view: 'apps',
  taskFilter: 'open',
  selectedStudents: new Set(),
  group: localStorage.getItem('go-group') || '8A',
  location: localStorage.getItem('go-location') || 'Basisschool De Horizon',
  apps: JSON.parse(localStorage.getItem('go-apps') || 'null') || [
    {id:'presenter',name:'Presenter',tag:'Presenteren',color:'#ef8a35',letters:'P'},
    {id:'learn',name:'Prowise Learn',tag:'Oefenen',color:'#4aa873',letters:'L'},
    {id:'drive',name:'Google Drive',tag:'Bestanden',color:'#488bcf',letters:'D'},
    {id:'classroom',name:'Classroom',tag:'Leren',color:'#34a56f',letters:'C'},
    {id:'office',name:'Microsoft 365',tag:'Productiviteit',color:'#e66a38',letters:'M'},
    {id:'youtube',name:'YouTube',tag:'Video',color:'#df4a45',letters:'▶'},
    {id:'wiki',name:'Wikipedia',tag:'Informatie',color:'#575f68',letters:'W'},
    {id:'maps',name:'Maps',tag:'Aardrijkskunde',color:'#5d9e5a',letters:'M'}
  ],
  groupApps: JSON.parse(localStorage.getItem('go-group-apps') || 'null') || ['presenter','learn','classroom','drive'],
  tasks: JSON.parse(localStorage.getItem('go-tasks') || 'null') || [
    {id:1,title:'Rekenen – breuken oefenen',description:'Maak opdracht 1 t/m 12.',group:'Groep 8A',due:'2026-09-11',status:'open',done:12,total:24},
    {id:2,title:'Taal – werkwoorden',description:'Rond de digitale les af.',group:'Groep 8A',due:'2026-09-12',status:'open',done:8,total:24},
    {id:3,title:'Topografie Nederland',description:'Oefen provincies en hoofdsteden.',group:'Groep 8A',due:'2026-09-15',status:'future',done:0,total:24},
    {id:4,title:'Leesopdracht hoofdstuk 3',description:'Lees en beantwoord de vragen.',group:'Groep 8A',due:'2026-09-09',status:'done',done:24,total:24}
  ],
  students: [
    ['Daan Jansen','Google Docs – Werkstuk','online',86],['Sophie de Wit','Rekentuin – Breuken','online',72],['Milan Bakker','YouTube – instructievideo','online',54],['Noa Visser','Prowise Learn','online',91],['Sem Smit','Nieuw tabblad','idle',38],['Lotte Meijer','Google Classroom','online',64],['Finn de Boer','Taalzee – Oefenen','online',79],['Sara Vos','Wikipedia – Romeinen','online',47],['Lucas Mulder','Presenter','online',88],['Emma Bos','Google Docs – Verslag','idle',31],['Bram Dekker','Prowise Learn','online',69],['Julia Kuiper','Classroom – Opdracht','offline',0]
  ].map((x,i)=>({id:i+1,name:x[0],tab:x[1],status:x[2],battery:x[3],paused:false,locked:false})),
};

const titles = {
  apps:['Mijn applicaties','Persoonlijk dashboard'],
  'group-apps':['Groepsapplicaties',`Leeromgeving ${labelGroup(state.group)}`],
  tasks:['Taken','Opdrachten beheren'],
  classroom:['Klassenmanagement',`Live overzicht ${labelGroup(state.group)}`],
  settings:['Instellingen','Persoonlijke voorkeuren'],
  help:['Help','GO docentomgeving']
};

function labelGroup(g){ return g==='plus' ? 'Plusgroep' : `Groep ${g}`; }
function persist(){
  localStorage.setItem('go-apps',JSON.stringify(state.apps));
  localStorage.setItem('go-group-apps',JSON.stringify(state.groupApps));
  localStorage.setItem('go-tasks',JSON.stringify(state.tasks));
  localStorage.setItem('go-group',state.group);
  localStorage.setItem('go-location',state.location);
}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function toast(msg,type=''){ const el=document.createElement('div'); el.className=`toast ${type}`; el.textContent=msg; $('#toastRegion').appendChild(el); setTimeout(()=>el.remove(),2800); }
function openModal(title, eyebrow, html){ $('#modalTitle').textContent=title; $('#modalEyebrow').textContent=eyebrow; $('#modalBody').innerHTML=html; $('#modalBackdrop').classList.remove('hidden'); $('#modalBackdrop').setAttribute('aria-hidden','false'); }
function closeModal(){ $('#modalBackdrop').classList.add('hidden'); $('#modalBackdrop').setAttribute('aria-hidden','true'); }

function render(){
  const [title,context]=titles[state.view];
  $('#pageTitle').textContent=title;
  $('#contextLabel').textContent=context.includes('undefined')? 'Docentomgeving':context;
  $$('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
  const root=$('#viewRoot');
  if(state.view==='apps') renderApps(root,false);
  if(state.view==='group-apps') renderApps(root,true);
  if(state.view==='tasks') renderTasks(root);
  if(state.view==='classroom') renderClassroom(root);
  if(state.view==='settings') renderSettings(root);
  if(state.view==='help') renderHelp(root);
  updateTaskBadge();
}

function tileHTML(app, groupMode=false){
  return `<article class="app-tile" data-app-id="${app.id}">
    <div class="tile-actions"><button class="mini-menu" data-app-menu="${app.id}" type="button">•••</button></div>
    <button class="tile-open plain-reset" data-open-app="${app.id}" type="button" style="all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;width:100%">
      <div class="app-icon" style="background:${app.color}">${esc(app.letters)}</div>
      <strong>${esc(app.name)}</strong><span>${esc(app.tag)}</span>
    </button>
  </article>`;
}

function renderApps(root,groupMode){
  const query=$('#globalSearch').value.trim().toLowerCase();
  const source=groupMode? state.apps.filter(a=>state.groupApps.includes(a.id)) : state.apps;
  const filtered=source.filter(a=>(a.name+' '+a.tag).toLowerCase().includes(query));
  root.innerHTML=`
    <div class="section-head">
      <div><h2>${groupMode?labelGroup(state.group):'Mijn startpagina'}</h2><p>${groupMode?'Bepaal welke applicaties jouw leerlingen zien.':'Open je favoriete applicaties of pas je dashboard aan.'}</p></div>
      <div class="toolbar">
        <button class="btn" id="openLibrary" type="button">Bibliotheek</button>
        <button class="btn primary" id="addApp" type="button">＋ Applicatie toevoegen</button>
      </div>
    </div>
    <div class="apps-grid">
      ${filtered.map(a=>tileHTML(a,groupMode)).join('')}
      <button class="app-tile add-tile" id="addTile" type="button"><div class="plus-circle">＋</div><strong>Applicatie toevoegen</strong><span>Uit de bibliotheek</span></button>
    </div>`;
  $('#addApp').addEventListener('click',()=>openAppEditor(groupMode));
  $('#addTile').addEventListener('click',()=>openAppEditor(groupMode));
  $('#openLibrary').addEventListener('click',()=>openLibrary(groupMode));
  $$('[data-open-app]',root).forEach(b=>b.addEventListener('click',()=>toast(`${state.apps.find(a=>a.id===b.dataset.openApp).name} geopend (demo).`,'success')));
  $$('[data-app-menu]',root).forEach(b=>b.addEventListener('click',()=>openAppMenu(b.dataset.appMenu,groupMode)));
}

function openAppEditor(groupMode=false){
  openModal('Applicatie toevoegen','Applicatiebibliotheek',`
    <form id="appForm" class="form-grid">
      <div class="field full"><label>Naam</label><input name="name" required maxlength="40" placeholder="Bijvoorbeeld Nieuwsbegrip"></div>
      <div class="field full"><label>URL</label><input name="url" type="url" placeholder="https://voorbeeld.nl"></div>
      <div class="field"><label>Categorie</label><select name="tag"><option>Leren</option><option>Oefenen</option><option>Productiviteit</option><option>Video</option><option>Informatie</option></select></div>
      <div class="field"><label>Kleur</label><input name="color" type="color" value="#216fae"></div>
      <div class="field full"><label><input name="group" type="checkbox" ${groupMode?'checked':''}> Ook tonen bij groepsapplicaties</label></div>
      <div class="modal-actions field full"><button class="btn" data-cancel type="button">Annuleren</button><button class="btn primary" type="submit">Toevoegen</button></div>
    </form>`);
  $('[data-cancel]').addEventListener('click',closeModal);
  $('#appForm').addEventListener('submit',e=>{
    e.preventDefault(); const fd=new FormData(e.currentTarget); const name=fd.get('name').trim();
    const id='custom-'+Date.now(); state.apps.push({id,name,tag:fd.get('tag'),color:fd.get('color'),letters:name.slice(0,1).toUpperCase()});
    if(fd.get('group')) state.groupApps.push(id); persist(); closeModal(); render(); toast('Applicatie toegevoegd.','success');
  });
}

function openLibrary(groupMode){
  const rows=state.apps.map(a=>`<button class="choice" data-library-app="${a.id}" type="button"><strong>${esc(a.name)}</strong><div style="font-size:12px;color:#718096;margin-top:4px">${esc(a.tag)} ${groupMode?(state.groupApps.includes(a.id)?'• zichtbaar':'• niet zichtbaar'):''}</div></button>`).join('');
  openModal('Applicatiebibliotheek','Bibliotheek',`<div class="choice-grid">${rows}</div>`);
  $$('[data-library-app]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.libraryApp;
    if(groupMode){ state.groupApps.includes(id)?state.groupApps=state.groupApps.filter(x=>x!==id):state.groupApps.push(id); persist(); closeModal(); render(); toast('Groepsapplicaties bijgewerkt.','success'); }
    else toast(`${state.apps.find(a=>a.id===id).name} geselecteerd.`);
  }));
}

function openAppMenu(id,groupMode){
  const app=state.apps.find(a=>a.id===id); if(!app)return;
  openModal(app.name,'Applicatie',`
    <div class="choice-grid">
      <button class="choice" id="openDemoApp" type="button"><strong>Openen</strong><div>Start deze applicatie</div></button>
      ${groupMode?`<button class="choice" id="toggleGroupApp" type="button"><strong>Verwijderen uit groep</strong><div>Niet langer zichtbaar voor leerlingen</div></button>`:''}
      <button class="choice" id="renameApp" type="button"><strong>Naam aanpassen</strong><div>Wijzig de tegelnaam</div></button>
      <button class="choice" id="deleteApp" type="button"><strong>Verwijderen</strong><div>Verwijder deze tegel</div></button>
    </div>`);
  $('#openDemoApp').addEventListener('click',()=>{closeModal();toast(`${app.name} geopend (demo).`,'success')});
  if($('#toggleGroupApp')) $('#toggleGroupApp').addEventListener('click',()=>{state.groupApps=state.groupApps.filter(x=>x!==id);persist();closeModal();render();toast('Uit groepsapplicaties verwijderd.')});
  $('#renameApp').addEventListener('click',()=>{ const n=prompt('Nieuwe naam',app.name); if(n&&n.trim()){app.name=n.trim();persist();closeModal();render();} });
  $('#deleteApp').addEventListener('click',()=>{state.apps=state.apps.filter(a=>a.id!==id);state.groupApps=state.groupApps.filter(x=>x!==id);persist();closeModal();render();toast('Applicatie verwijderd.','warn')});
}

function renderTasks(root){
  const query=$('#globalSearch').value.trim().toLowerCase();
  let tasks=state.tasks.filter(t=>t.status===state.taskFilter && t.title.toLowerCase().includes(query));
  root.innerHTML=`
    <div class="section-head"><div><h2>Taken</h2><p>Plan opdrachten en houd de voortgang van leerlingen bij.</p></div><button class="btn primary" id="newTask" type="button">＋ Nieuwe taak</button></div>
    <div class="task-tabs">
      <button class="task-tab ${state.taskFilter==='open'?'active':''}" data-task-filter="open">Openstaand</button>
      <button class="task-tab ${state.taskFilter==='future'?'active':''}" data-task-filter="future">Toekomstig</button>
      <button class="task-tab ${state.taskFilter==='done'?'active':''}" data-task-filter="done">Afgerond</button>
    </div>
    <div class="task-list">${tasks.length?tasks.map(taskCard).join(''):`<div class="empty-state">Geen taken in deze categorie.</div>`}</div>`;
  $('#newTask').addEventListener('click',openTaskEditor);
  $$('[data-task-filter]',root).forEach(b=>b.addEventListener('click',()=>{state.taskFilter=b.dataset.taskFilter;render()}));
  $$('[data-task-open]',root).forEach(b=>b.addEventListener('click',()=>openTaskDetails(Number(b.dataset.taskOpen))));
}
function taskCard(t){ const pct=t.total?Math.round(t.done/t.total*100):0; return `<article class="task-card"><div><h3>${esc(t.title)}</h3><div class="task-meta"><span class="pill blue">${esc(t.group)}</span><span>Deadline ${formatDate(t.due)}</span><span>${esc(t.description)}</span></div></div><div><div class="progress-wrap"><div class="progress"><span style="width:${pct}%"></span></div><span class="progress-label">${t.done}/${t.total}</span></div><div style="text-align:right;margin-top:8px"><button class="btn small" data-task-open="${t.id}" type="button">Bekijken</button></div></div></article>`; }
function formatDate(v){ if(!v)return'—'; const [y,m,d]=v.split('-'); return `${d}-${m}-${y}`; }
function openTaskEditor(){
  openModal('Nieuwe taak','Takenmodule',`<form id="taskForm" class="form-grid">
    <div class="field full"><label>Titel</label><input name="title" required maxlength="70"></div>
    <div class="field full"><label>Beschrijving</label><textarea name="description"></textarea></div>
    <div class="field"><label>Groep</label><select name="group"><option>Groep 8A</option><option>Groep 7B</option><option>Plusgroep</option></select></div>
    <div class="field"><label>Deadline</label><input name="due" type="date" required></div>
    <div class="field full"><label>Privénotitie docent</label><textarea name="private" placeholder="Alleen zichtbaar voor docenten"></textarea></div>
    <div class="modal-actions field full"><button class="btn" data-cancel type="button">Annuleren</button><button class="btn primary" type="submit">Taak aanmaken</button></div></form>`);
  $('[data-cancel]').addEventListener('click',closeModal);
  $('#taskForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);state.tasks.push({id:Date.now(),title:fd.get('title'),description:fd.get('description'),group:fd.get('group'),due:fd.get('due'),status:'open',done:0,total:24});persist();closeModal();state.taskFilter='open';render();toast('Taak aangemaakt.','success')});
}
function openTaskDetails(id){ const t=state.tasks.find(x=>x.id===id); if(!t)return; openModal(t.title,'Taakdetails',`<p>${esc(t.description)}</p><div class="settings-grid"><div class="setting-card"><h3>Voortgang</h3><p>${t.done} van ${t.total} leerlingen gereed.</p></div><div class="setting-card"><h3>Deadline</h3><p>${formatDate(t.due)}</p></div></div><div class="modal-actions"><button class="btn" id="markDoneTask">Markeer afgerond</button><button class="btn danger" id="deleteTask">Verwijderen</button></div>`); $('#markDoneTask').addEventListener('click',()=>{t.status='done';t.done=t.total;persist();closeModal();render();toast('Taak afgerond.','success')}); $('#deleteTask').addEventListener('click',()=>{state.tasks=state.tasks.filter(x=>x.id!==id);persist();closeModal();render();toast('Taak verwijderd.','warn')}); }

function renderClassroom(root){
  const online=state.students.filter(s=>s.status!=='offline').length;
  const selected=state.selectedStudents.size;
  root.innerHTML=`
    <div class="section-head"><div><h2>${labelGroup(state.group)}</h2><p>Visuele simulatie van live klassenmanagement.</p></div><div class="toolbar"><button class="btn" id="selectAllStudents" type="button">${selected===online?'Selectie wissen':'Alle online leerlingen'}</button><button class="btn primary" id="sendLink" type="button">Link sturen</button></div></div>
    <div class="class-toolbar">
      <div class="class-stats"><span class="pill green">● ${online} online</span><span class="pill orange">${state.students.filter(s=>s.status==='idle').length} inactief</span><span class="pill">${selected} geselecteerd</span></div>
      <div class="toolbar"><button class="btn small" id="pauseSelected" type="button">⏸ Pauzeren</button><button class="btn small" id="focusSelected" type="button">◉ Focusmodus</button><button class="btn small" id="shareScreen" type="button">▣ Scherm delen</button></div>
    </div>
    <div class="student-grid">${state.students.map(studentCard).join('')}</div>`;
  $$('[data-student-check]',root).forEach(c=>c.addEventListener('change',()=>{const id=Number(c.dataset.studentCheck);c.checked?state.selectedStudents.add(id):state.selectedStudents.delete(id);renderClassroom(root)}));
  $$('[data-student-open]',root).forEach(b=>b.addEventListener('click',()=>openStudent(Number(b.dataset.studentOpen))));
  $('#selectAllStudents').addEventListener('click',()=>{ if(state.selectedStudents.size===online) state.selectedStudents.clear(); else state.students.filter(s=>s.status!=='offline').forEach(s=>state.selectedStudents.add(s.id)); renderClassroom(root); });
  $('#pauseSelected').addEventListener('click',()=>bulkStudentAction('pause'));
  $('#focusSelected').addEventListener('click',()=>bulkStudentAction('focus'));
  $('#shareScreen').addEventListener('click',()=>bulkStudentAction('share'));
  $('#sendLink').addEventListener('click',openSendLink);
}
function studentCard(s){ const selected=state.selectedStudents.has(s.id); return `<article class="student-card ${selected?'selected':''}"><div class="student-preview"><input class="student-check" data-student-check="${s.id}" type="checkbox" ${selected?'checked':''} ${s.status==='offline'?'disabled':''}><span class="student-status pill ${s.status==='online'?'green':s.status==='idle'?'orange':''}">${s.status}</span><div class="browser-mock"><div class="browser-bar"><i></i><i></i><i></i></div><div class="browser-content"><strong>${esc(s.tab.split(' – ')[0])}</strong><br>Live schermvoorbeeld</div></div>${s.paused?'<div class="screen-paused">Device gepauzeerd</div>':''}</div><div class="student-info"><div class="student-title"><strong>${esc(s.name)}</strong><span>${s.status==='offline'?'—':s.battery+'%'}</span></div><div class="student-sub">Chromebook ${s.id.toString().padStart(2,'0')}</div><div class="tab-line">${s.locked?'🔒 ':''}${esc(s.tab)}</div></div><div class="student-actions"><button data-student-open="${s.id}" type="button">Beheren</button></div></article>`; }
function ensureSelection(){ if(!state.selectedStudents.size){toast('Selecteer eerst één of meer leerlingen.','warn');return false} return true; }
function bulkStudentAction(action){ if(!ensureSelection())return; const list=state.students.filter(s=>state.selectedStudents.has(s.id)); if(action==='pause'){const shouldPause=!list.every(s=>s.paused);list.forEach(s=>s.paused=shouldPause);render();toast(shouldPause?'Geselecteerde devices gepauzeerd.':'Devices hervat.','success')} if(action==='focus') toast('Focusmodus gestart voor geselecteerde leerlingen (simulatie).','success'); if(action==='share') toast('Schermdelen gestart (simulatie).','success'); }
function openSendLink(){ openModal('Weblink sturen','Klassenmanagement',`<form id="sendLinkForm" class="form-grid"><div class="field full"><label>Webadres</label><input name="url" type="url" value="https://" required></div><div class="field full"><label><input name="lock" type="checkbox"> Tabblad direct vastzetten</label></div><div class="field full"><label><input name="focus" type="checkbox"> Openen in focusmodus</label></div><div class="modal-actions field full"><button class="btn" data-cancel type="button">Annuleren</button><button class="btn primary" type="submit">Versturen</button></div></form>`); $('[data-cancel]').addEventListener('click',closeModal); $('#sendLinkForm').addEventListener('submit',e=>{e.preventDefault();if(!state.selectedStudents.size){toast('Selecteer eerst leerlingen.','warn');return} const fd=new FormData(e.currentTarget); state.students.filter(s=>state.selectedStudents.has(s.id)).forEach(s=>{s.tab=fd.get('url');s.locked=!!fd.get('lock')}); closeModal();render();toast('Weblink naar leerlingen gestuurd (simulatie).','success')}); }
function openStudent(id){ const s=state.students.find(x=>x.id===id); if(!s)return; openModal(s.name,'Leerlingdevice',`<div class="settings-grid"><div class="setting-card"><h3>Huidig tabblad</h3><p>${esc(s.tab)}</p></div><div class="setting-card"><h3>Status</h3><p>${esc(s.status)} • batterij ${s.battery}%</p></div></div><div class="choice-grid" style="margin-top:14px"><button class="choice" id="studentPause" type="button"><strong>${s.paused?'Hervatten':'Pauzeren'}</strong><div>Device tijdelijk blokkeren</div></button><button class="choice" id="studentLock" type="button"><strong>${s.locked?'Ontgrendelen':'Tabblad vastzetten'}</strong><div>Leerling op huidige pagina houden</div></button><button class="choice" id="studentLive" type="button"><strong>Live bekijken</strong><div>Open live schermweergave (simulatie)</div></button><button class="choice" id="studentCloseTab" type="button"><strong>Tabblad sluiten</strong><div>Sluit actief tabblad</div></button></div>`); $('#studentPause').addEventListener('click',()=>{s.paused=!s.paused;closeModal();render();toast(s.paused?'Device gepauzeerd.':'Device hervat.','success')}); $('#studentLock').addEventListener('click',()=>{s.locked=!s.locked;closeModal();render();toast(s.locked?'Tabblad vastgezet.':'Tabblad ontgrendeld.','success')}); $('#studentLive').addEventListener('click',()=>toast('Live meekijken geopend (simulatie).','success')); $('#studentCloseTab').addEventListener('click',()=>{s.tab='Nieuw tabblad';s.locked=false;closeModal();render();toast('Tabblad gesloten.','success')}); }

function renderSettings(root){ root.innerHTML=`<div class="section-head"><div><h2>Instellingen</h2><p>Pas de docentomgeving aan.</p></div></div><div class="settings-grid"><div class="setting-card"><h3>Dashboard</h3><p>Stel voorkeuren voor jouw startomgeving in.</p><div class="switch-line"><span>Compacte tegels</span><label class="switch"><input id="compactTiles" type="checkbox"><span></span></label></div><div class="switch-line"><span>Animaties</span><label class="switch"><input type="checkbox" checked><span></span></label></div></div><div class="setting-card"><h3>Klassenmanagement</h3><p>Voorkeuren voor live klassenoverzicht.</p><div class="switch-line"><span>Offline leerlingen tonen</span><label class="switch"><input type="checkbox" checked><span></span></label></div><div class="switch-line"><span>Batterijpercentage tonen</span><label class="switch"><input type="checkbox" checked><span></span></label></div></div><div class="setting-card"><h3>Meldingen</h3><p>Bepaal welke meldingen jij tijdens de les ontvangt.</p><div class="switch-line"><span>Taak ingeleverd</span><label class="switch"><input type="checkbox" checked><span></span></label></div><div class="switch-line"><span>Leerling vraagt hulp</span><label class="switch"><input type="checkbox" checked><span></span></label></div></div></div>`; }
function renderHelp(root){ root.innerHTML=`<div class="section-head"><div><h2>Help</h2><p>Snelle uitleg van deze docentdemo.</p></div></div><div class="settings-grid"><div class="setting-card"><h3>Mijn applicaties</h3><p>Beheer je persoonlijke starttegels, zoek apps en voeg eigen applicaties toe.</p></div><div class="setting-card"><h3>Groepsapplicaties</h3><p>Kies welke apps zichtbaar zijn voor de geselecteerde groep.</p></div><div class="setting-card"><h3>Taken</h3><p>Maak opdrachten aan, plan deadlines en bekijk de voortgang.</p></div><div class="setting-card"><h3>Klassenmanagement</h3><p>Selecteer leerlingen, pauzeer devices, stuur links en simuleer focusmodus of live meekijken.</p></div></div>`; }

function updateTaskBadge(){ const n=state.tasks.filter(t=>t.status==='open').length; $('#taskBadge').textContent=n; }

$$('.nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;$('#globalSearch').value='';render()}));
$('#collapseSidebar').addEventListener('click',()=>{$('#sidebar').classList.toggle('collapsed');$('#collapseSidebar').textContent=$('#sidebar').classList.contains('collapsed')?'›':'‹'});
$('#closeModal').addEventListener('click',closeModal);
$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$('#globalSearch').addEventListener('input',()=>{if(['apps','group-apps','tasks'].includes(state.view))render()});
$('#groupSelect').value=state.group;
$('#locationSelect').value=state.location;
$('#groupSelect').addEventListener('change',e=>{state.group=e.target.value;persist();titles['group-apps'][1]=`Leeromgeving ${labelGroup(state.group)}`;titles.classroom[1]=`Live overzicht ${labelGroup(state.group)}`;render();toast(`Gewisseld naar ${labelGroup(state.group)}.`)});
$('#locationSelect').addEventListener('change',e=>{state.location=e.target.value;persist();toast(`Locatie gewijzigd naar ${state.location}.`)});
$('#profileBtn').addEventListener('click',()=>openModal('Levi Docent','Profiel',`<div class="settings-grid"><div class="setting-card"><h3>Leerkracht</h3><p>${esc(state.location)}<br>${labelGroup(state.group)}</p></div></div>`));
$('#notificationsBtn').addEventListener('click',()=>openModal('Meldingen','Vandaag',`<div class="task-list"><div class="setting-card"><strong>3 taken wachten op controle</strong><p style="margin-bottom:0">Groep 8A heeft nieuwe voortgang.</p></div><div class="setting-card"><strong>Klassenmanagement beschikbaar</strong><p style="margin-bottom:0">11 devices zijn momenteel bereikbaar.</p></div></div>`));
$('#quickAddBtn').addEventListener('click',()=>{ if(state.view==='tasks')openTaskEditor(); else openAppEditor(state.view==='group-apps'); });

render();
