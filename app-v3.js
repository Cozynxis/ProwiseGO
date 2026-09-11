import {store,makeId} from './modules/store.js';
import {groups,locations,libraryApps} from './modules/data.js';
import {lessonPlans,quickTools} from './modules/school-data.js';
import {hydrateIcons,icon} from './modules/icons.js';
import {renderPage} from './modules/router.js';
import {$,$$,esc,toast,openModal,closeModal,openDrawer,closeDrawer,contextMenu,initials,formatDate} from './modules/ui.js';

const page=$('#page');
const teacherTitles={
 'day-start':'Dagstart','my-apps':'Mijn applicaties','group-apps':'Groepsapplicaties','tasks':'Taken','lesson-planner':'Lesplanner','classroom':'Klassenmanagement','groups':'Groepen','student-overview':'Leerlingoverzicht','class-tools':'Klastools','library':'Bibliotheek','notifications':'Meldingen','settings':'Instellingen','help':'Help & informatie'
};
const studentTitles={'student-home':'Start','student-apps':'Mijn apps','student-tasks':'Mijn taken','student-day':'Vandaag','student-messages':'Berichten','student-help':'Hulp'};

function syncShell(state){
 const app=$('#app');
 const studentMode=state.portalMode==='student';
 app.classList.toggle('student-mode',studentMode);
 const group=store.group(),location=store.location(),student=store.activeStudent();
 if($('#groupLabel'))$('#groupLabel').textContent=group.name;
 if($('#groupMeta'))$('#groupMeta').textContent=`${group.count} leerlingen`;
 $$('.group-avatar').forEach(x=>x.textContent=group.short);
 if($('#locationLabel'))$('#locationLabel').textContent=location.name;
 if($('#taskCount'))$('#taskCount').textContent=state.tasks.filter(t=>t.status==='open').length;
 if($('#notificationCount'))$('#notificationCount').textContent=state.notifications.filter(n=>!n.read).length;
 const title=(studentMode?studentTitles:teacherTitles)[state.route]||(studentMode?'Start':'Dagstart');
 $$('.nav-item[data-route]').forEach(b=>b.classList.toggle('active',!studentMode&&b.dataset.route===state.route));
 $$('.nav-item[data-student-route]').forEach(b=>b.classList.toggle('active',studentMode&&b.dataset.studentRoute===state.route));
 if($('#breadcrumbs'))$('#breadcrumbs').innerHTML=`<span>GO</span><span>/</span><b>${esc(title)}</b>`;
 if(studentMode&&student){
  $('#modeLabel').textContent='Leerlingomgeving';
  $('#profileName').textContent=student.name;
  $('#profileRole').textContent='Leerling';
  $('#sidebarAvatar').textContent=student.initials;
  $('#topAvatar').textContent=student.initials;
  $('#studentSimName').textContent=student.name;
 }else{
  $('#modeLabel').textContent='Docentomgeving';
  $('#profileName').textContent=state.teacherName||'Levi Docent';
  $('#profileRole').textContent='Leerkracht';
  $('#sidebarAvatar').textContent='LD';$('#topAvatar').textContent='LD';
 }
 document.title=`${title} · GO ${studentMode?'Leerling':'Docent'}`;
}
function render(){const state=store.get();syncShell(state);page.innerHTML=renderPage(state);hydrateIcons(document)}
store.subscribe(render);render();

function go(route){store.route(route);$('#app').classList.remove('mobile-nav-open');$('#main')?.focus()}

document.addEventListener('click',async e=>{
 const teacherRoute=e.target.closest('[data-route]');if(teacherRoute){go(teacherRoute.dataset.route);return}
 const studentRoute=e.target.closest('[data-student-route]');if(studentRoute){go(studentRoute.dataset.studentRoute);return}
 if(e.target.closest('[data-close-modal]')){closeModal();return}
 if(e.target.closest('[data-close-drawer]')){closeDrawer();return}
 const target=e.target.closest('[data-action]');if(!target)return;
 const action=target.dataset.action,id=target.dataset.id;
 switch(action){
  case'home':go(store.get().portalMode==='student'?'student-home':'day-start');break;
  case'random-student-view':store.enterRandomStudent();toast('Leerlingomgeving geopend',`Je bekijkt nu ${store.activeStudent()?.name||'een leerling'}.`,'success');break;
  case'view-as-student':store.enterStudent(id);toast('Leerlingomgeving geopend',store.activeStudent()?.name||'','success');break;
  case'switch-random-student':store.enterRandomStudent();toast('Andere leerling gekozen',store.activeStudent()?.name||'','success');break;
  case'return-teacher':store.exitStudent();toast('Terug in docentomgeving','','success');break;
  case'new-app':showAppForm();break;
  case'favorite-app':{const app=store.get().apps.find(a=>a.id===id);if(app)store.patchApp(id,{favorite:!app.favorite});break}
  case'open-app':openApp(id);break;
  case'app-menu':await showAppMenu(target,id);break;
  case'add-library-app':addLibraryApp(target.dataset.libraryId);break;
  case'new-task':showTaskForm();break;
  case'open-task':showTaskDetails(id);break;
  case'task-menu':await showTaskMenu(target,id);break;
  case'task-library':showTaskLibrary();break;
  case'toggle-student':store.patchStudent(id,{selected:target.checked});break;
  case'select-all':store.selectAll(true);break;
  case'clear-selection':store.clearSelection();break;
  case'toggle-pause':togglePause(id);break;
  case'pause-selected':toggleSelectedPause();break;
  case'lock-selected':toggleSelectedLock();break;
  case'send-link':showSendLink();break;
  case'broadcast':showBroadcast();break;
  case'student-details':showStudentDetails(id);break;
  case'refresh-class':toast('Klassenmanagement vernieuwd','Statussen zijn opnieuw geladen.','success');render();break;
  case'mark-read':store.update(s=>({...s,notifications:s.notifications.map(n=>({...n,read:true}))}));break;
  case'reset-demo':if(confirm('Alle lokale demo-aanpassingen wissen?'))store.reset();break;
  case'quick-tool':openQuickTool(target.dataset.tool);break;
  case'start-class-mode':store.classMode({active:true});toast('Lesmodus gestart','Klastools staan klaar voor de actieve groep.','success');break;
  case'new-lesson':showLessonForm();break;
  case'preview-lesson':showLesson(target.dataset.id,false);break;
  case'start-lesson':showLesson(target.dataset.id,true);break;
  case'auto-groups':makeAutomaticGroups();break;
  case'new-flex-group':showFlexGroupForm();break;
  case'open-flex-group':toast('Flexibele groep geopend','Je kunt deze groep later ook aan Klassenmanagement koppelen.','success');break;
  case'manage-flex-group':showFlexGroupForm(target.dataset.id);break;
  case'student-help-request':{const s=store.activeStudent();if(s){store.patchStudent(s.id,{help:true});toast('Hulpvraag verstuurd','Je leerkracht ziet nu dat je hulp nodig hebt.','success')}}break;
  case'student-task-open':showStudentTask(id);break;
 }
});

document.addEventListener('input',e=>{
 if(e.target.id==='appsSearch')store.ui('appQuery',e.target.value);
 if(e.target.id==='librarySearch')store.ui('libraryQuery',e.target.value);
});
document.addEventListener('change',e=>{if(e.target.matches('[data-setting]'))store.setting(e.target.dataset.setting,e.target.type==='checkbox'?e.target.checked:e.target.value)});
document.addEventListener('click',e=>{
 const sort=e.target.closest('[data-app-sort]');if(sort)store.ui('appSort',sort.dataset.appSort);
 const tab=e.target.closest('[data-task-tab]');if(tab)store.ui('taskTab',tab.dataset.taskTab);
 const layout=e.target.closest('[data-class-layout]');if(layout)store.setting('classLayout',layout.dataset.classLayout);
});

$('#collapseSidebar')?.addEventListener('click',()=>$('#app').classList.toggle('sidebar-collapsed'));
$('#mobileMenu')?.addEventListener('click',()=>$('#app').classList.toggle('mobile-nav-open'));
$('#quickCreate')?.addEventListener('click',openQuickCreate);
$('#notificationButton')?.addEventListener('click',()=>go('notifications'));
$('#locationSwitcher')?.addEventListener('click',showLocationPicker);
$('#groupSwitcher')?.addEventListener('click',showGroupPicker);
$('#profileButton')?.addEventListener('click',showProfile);
$('#topProfile')?.addEventListener('click',showProfile);
$('#globalSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.value.trim()){const q=e.target.value.toLowerCase();const match=Object.entries(teacherTitles).find(([,v])=>v.toLowerCase().includes(q));if(match)go(match[0]);else toast('Geen pagina gevonden',e.target.value,'warning')}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeDrawer()}if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)&&store.get().portalMode==='teacher'){e.preventDefault();$('#globalSearch')?.focus()}});

function showLocationPicker(){openDrawer({title:'Locatie kiezen',eyebrow:'GO',html:`<div class="dropdown-list">${locations.map(l=>`<button class="dropdown-option ${store.get().locationId===l.id?'active':''}" data-location-id="${l.id}"><span class="empty-icon" style="width:38px;height:38px;margin:0">${icon('school')}</span><span class="copy"><b>${esc(l.name)}</b><small>${esc(l.sub)}</small></span></button>`).join('')}</div>`});$$('[data-location-id]',$('#drawerBody')).forEach(b=>b.addEventListener('click',()=>{store.setLocation(b.dataset.locationId);closeDrawer();toast('Locatie gewijzigd','','success')}))}
function showGroupPicker(){openDrawer({title:'Groep kiezen',eyebrow:'Klassen',html:`<div class="dropdown-list">${groups.map(g=>`<button class="dropdown-option ${store.get().groupId===g.id?'active':''}" data-group-id="${g.id}"><span class="group-avatar">${g.short}</span><span class="copy"><b>${esc(g.name)}</b><small>${g.count} leerlingen</small></span></button>`).join('')}</div>`});$$('[data-group-id]',$('#drawerBody')).forEach(b=>b.addEventListener('click',()=>{store.setGroup(b.dataset.groupId);closeDrawer();toast('Groep geopend',store.group().name,'success')}))}
function showProfile(){const state=store.get(),student=store.activeStudent();openDrawer({title:state.portalMode==='student'?(student?.name||'Leerling'):(state.teacherName||'Levi Docent'),eyebrow:'Profiel',html:state.portalMode==='student'?`<div style="text-align:center;padding:10px"><span class="avatar" style="width:72px;height:72px;font-size:20px;margin:auto">${esc(student?.initials||'LL')}</span><h3>${esc(student?.name||'Leerling')}</h3><span class="pill blue">Leerling · ${esc(store.group().name)}</span><p class="muted">Dit is een gesimuleerde leerlingweergave vanuit de docentdemo.</p><button class="btn primary" data-action="return-teacher">Terug naar docent</button></div>`:`<div style="text-align:center;padding:10px"><span class="avatar" style="width:72px;height:72px;font-size:20px;margin:auto">LD</span><h3>${esc(state.teacherName)}</h3><span class="pill blue">Leerkracht</span><p class="muted">${esc(store.location().name)} · ${esc(store.group().name)}</p><button class="btn" data-action="random-student-view">Bekijk als willekeurige leerling</button></div>`})}
function openQuickCreate(){openModal({title:'Nieuw maken',eyebrow:'Snelmenu',html:`<div class="library-grid"><button class="card" data-quick="app" style="padding:18px;text-align:left;border:1px solid var(--line)"><b>Applicatie</b><p class="muted">Nieuwe tegel toevoegen.</p></button><button class="card" data-quick="task" style="padding:18px;text-align:left;border:1px solid var(--line)"><b>Taak</b><p class="muted">Nieuwe opdracht klaarzetten.</p></button><button class="card" data-quick="lesson" style="padding:18px;text-align:left;border:1px solid var(--line)"><b>Les</b><p class="muted">Lesblok voorbereiden.</p></button><button class="card" data-quick="student" style="padding:18px;text-align:left;border:1px solid var(--line)"><b>Leerlingweergave</b><p class="muted">Bekijk de portal als leerling.</p></button></div>`});$$('[data-quick]',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.quick;closeModal();if(type==='app')showAppForm();if(type==='task')showTaskForm();if(type==='lesson')showLessonForm();if(type==='student')store.enterRandomStudent()}))}

function showAppForm(existing=null){const app=existing||{name:'',subtitle:'',url:'',initials:'',color:'logo-blue',group:false,favorite:false};openModal({title:existing?'Applicatie bewerken':'Applicatie toevoegen',eyebrow:'Applicaties',html:`<form id="appForm"><div class="form-grid"><div class="field full"><label>Naam</label><input class="input" name="name" required maxlength="40" value="${esc(app.name)}"></div><div class="field full"><label>URL</label><input class="input" name="url" value="${esc(app.url||'')}" placeholder="https://..."></div><div class="field"><label>Ondertitel</label><input class="input" name="subtitle" value="${esc(app.subtitle||'')}"></div><div class="field"><label>Letters</label><input class="input" name="initials" maxlength="3" value="${esc(app.initials||'')}"></div><div class="field"><label>Kleur</label><select class="select" name="color">${['logo-blue','logo-green','logo-purple','logo-orange','logo-red','logo-cyan','logo-dark','logo-yellow'].map(c=>`<option ${app.color===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="field"><label>Zichtbaar voor</label><select class="select" name="scope"><option value="mine" ${!app.group?'selected':''}>Alleen docent</option><option value="group" ${app.group?'selected':''}>Groep / leerlingen</option></select></div></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>Annuleren</button><button class="btn primary" type="submit">Opslaan</button></div></form>`});$('#appForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),name=fd.get('name').trim();const patch={name,url:fd.get('url').trim()||'#',subtitle:fd.get('subtitle').trim()||'Webapplicatie',initials:fd.get('initials').trim()||initials(name).slice(0,2),color:fd.get('color'),group:fd.get('scope')==='group'};existing?store.patchApp(existing.id,patch):store.addApp({id:makeId('app'),favorite:false,...patch});closeModal();toast('Applicatie opgeslagen',name,'success')})}
function openApp(id){const app=store.get().apps.find(a=>a.id===id);if(!app)return;if(app.url&&app.url!=='#'&&/^https?:\/\//i.test(app.url))window.open(app.url,'_blank','noopener');else toast(app.name,'Demo-app geopend.','success')}
async function showAppMenu(button,id){const app=store.get().apps.find(a=>a.id===id);if(!app)return;const r=button.getBoundingClientRect();const result=await contextMenu(r.right,r.bottom,[{action:'edit',label:'Bewerken',icon:'edit'},{action:'favorite',label:app.favorite?'Favoriet verwijderen':'Favoriet maken',icon:'star'},{action:'remove',label:'Verwijderen',icon:'trash',danger:true}]);if(result==='edit')showAppForm(app);if(result==='favorite')store.patchApp(id,{favorite:!app.favorite});if(result==='remove'&&confirm(`${app.name} verwijderen?`))store.removeApp(id)}
function addLibraryApp(id){const source=libraryApps.find(a=>a.id===id);if(!source)return;if(store.get().apps.some(a=>a.id===id))return toast('Staat al op je dashboard',source.name,'warning');store.addApp({...source,group:false,favorite:false,url:source.url||'#'});toast('Applicatie toegevoegd',source.name,'success')}

function showTaskForm(existing=null){const g=store.group(),t=existing||{title:'',summary:'',description:'',start:new Date().toISOString().slice(0,10),deadline:'',feedback:false};openModal({title:existing?'Taak bewerken':'Nieuwe taak',eyebrow:'Taken',html:`<form id="taskForm"><div class="form-grid"><div class="field full"><label>Titel</label><input class="input" name="title" required value="${esc(t.title)}"></div><div class="field full"><label>Samenvatting</label><input class="input" name="summary" value="${esc(t.summary||'')}"></div><div class="field full"><label>Beschrijving</label><textarea class="textarea" name="description">${esc(t.description||'')}</textarea></div><div class="field"><label>Start</label><input class="input" type="date" name="start" value="${esc(t.start)}"></div><div class="field"><label>Deadline</label><input class="input" type="date" name="deadline" required value="${esc(t.deadline||'')}"></div><label class="checkbox-line full"><input type="checkbox" name="feedback" ${t.feedback?'checked':''}><span><b>Feedback vragen</b></span></label></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>Annuleren</button><button class="btn primary">Opslaan</button></div></form>`});$('#taskForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),start=fd.get('start'),deadline=fd.get('deadline'),patch={title:fd.get('title').trim(),summary:fd.get('summary').trim(),description:fd.get('description').trim(),start,deadline,archive:'',feedback:fd.get('feedback')==='on',notes:'',group:g.id,total:g.count,managers:[store.get().teacherName],status:start>new Date().toISOString().slice(0,10)?'future':'open'};existing?store.patchTask(existing.id,patch):store.addTask({id:makeId('task'),submitted:0,...patch});closeModal();toast('Taak opgeslagen',patch.title,'success')})}
function showTaskDetails(id){const t=store.get().tasks.find(x=>x.id===id);if(!t)return;openDrawer({title:t.title,eyebrow:'Taak',html:`<p>${esc(t.description||t.summary)}</p><div class="card"><div class="card-body"><b>Deadline</b><p>${formatDate(t.deadline)}</p><b>Ingeleverd</b><p>${t.submitted}/${t.total}</p></div></div><button class="btn primary" id="editCurrentTask">Bewerken</button>`});$('#editCurrentTask')?.addEventListener('click',()=>{closeDrawer();showTaskForm(t)})}
async function showTaskMenu(button,id){const t=store.get().tasks.find(x=>x.id===id);if(!t)return;const r=button.getBoundingClientRect();const result=await contextMenu(r.right,r.bottom,[{action:'open',label:'Openen',icon:'external'},{action:'edit',label:'Bewerken',icon:'edit'},{action:'done',label:'Markeer afgerond',icon:'check'},{action:'remove',label:'Verwijderen',icon:'trash',danger:true}]);if(result==='open')showTaskDetails(id);if(result==='edit')showTaskForm(t);if(result==='done')store.patchTask(id,{status:'done',submitted:t.total});if(result==='remove'&&confirm('Taak verwijderen?'))store.removeTask(id)}
function showTaskLibrary(){openModal({title:'Takenbibliotheek',eyebrow:'Taken',html:`<div class="library-grid">${['Rekensprint','Leeslogboek','Weektaak','Spelling oefenen'].map((x,i)=>`<button class="card" data-template-task="${i}" style="padding:18px;text-align:left;border:1px solid var(--line)"><b>${x}</b><p class="muted">Voorbeeldtaak voor de basisschool.</p></button>`).join('')}</div>`});$$('[data-template-task]',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{closeModal();showTaskForm()}))}

function togglePause(id){const s=store.get().students.find(x=>x.id===id);if(s)store.patchStudent(id,{paused:!s.paused})}
function toggleSelectedPause(){const selected=store.get().students.filter(s=>s.selected);if(!selected.length)return toast('Selecteer eerst leerlingen','','warning');const pause=!selected.every(s=>s.paused);store.patchSelected({paused:pause});toast(pause?'Devices gepauzeerd':'Devices hervat',`${selected.length} leerlingen`,'success')}
function toggleSelectedLock(){const selected=store.get().students.filter(s=>s.selected);if(!selected.length)return toast('Selecteer eerst leerlingen','','warning');const locked=!selected.every(s=>s.locked);store.patchSelected({locked});toast(locked?'Tabbladen vastgezet':'Tabbladen vrijgegeven',`${selected.length} leerlingen`,'success')}
function showSendLink(){const selected=store.get().students.filter(s=>s.selected);openModal({title:'Weblink sturen',eyebrow:'Klassenmanagement',html:`<form id="linkForm"><div class="field"><label>Webadres</label><input class="input" name="url" required placeholder="https://..."></div><label class="checkbox-line"><input type="checkbox" name="lock"><span><b>Direct vastzetten</b></span></label><p class="muted">Ontvangers: ${selected.length?selected.length+' geselecteerde leerlingen':'alle online leerlingen'}.</p><div class="modal-actions"><button class="btn" type="button" data-close-modal>Annuleren</button><button class="btn primary">Sturen</button></div></form>`});$('#linkForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),url=fd.get('url').trim(),lock=fd.get('lock')==='on';store.update(s=>({...s,students:s.students.map(st=>(selected.length?st.selected:st.status==='online')?{...st,tab:url.replace(/^https?:\/\//,''),locked:lock}:st)}));closeModal();toast('Weblink gestuurd',url,'success')})}
function showBroadcast(){toast('Schermdeling gestart','Visuele simulatie voor geselecteerde/online leerlingen.','success')}
function showStudentDetails(id){const s=store.get().students.find(x=>x.id===id);if(!s)return;openDrawer({title:s.name,eyebrow:'Leerling',html:`<div style="display:grid;gap:12px"><span class="avatar" style="width:64px;height:64px;font-size:18px">${esc(s.initials)}</span><span class="pill ${s.status==='online'?'green':'orange'}">${esc(s.status)}</span><div class="card"><div class="card-body"><b>Actief tabblad</b><p>${esc(s.tab)}</p><b>Batterij</b><p>${s.battery}%</p><b>Hulpvraag</b><p>${s.help?'Ja':'Nee'}</p></div></div><button class="btn primary" data-action="view-as-student" data-id="${s.id}">Bekijk GO als ${esc(s.name.split(' ')[0])}</button></div>`})}

function openQuickTool(toolId){const tool=quickTools.find(t=>t.id===toolId);if(!tool)return;const students=store.get().students.filter(s=>s.status!=='offline');if(toolId==='random'){const s=students[Math.floor(Math.random()*students.length)];return openModal({title:'Naamkiezer',eyebrow:'Klastool',html:`<div style="text-align:center;padding:28px"><div class="student-mascot" style="margin:auto">${esc(s?.initials||'?')}</div><h2>${esc(s?.name||'Geen leerling')}</h2><button class="btn primary" data-action="quick-tool" data-tool="random">Nog een naam</button></div>`})}if(toolId==='groups')return makeAutomaticGroups();if(toolId==='timer')return openTimer();if(toolId==='traffic')return openTrafficLight();if(toolId==='score')return openScoreboard();if(toolId==='birthday')return openModal({title:'Verjaardagen',eyebrow:'Klastool',html:`<p class="muted">Deze maand zijn er meerdere verjaardagen in de klas. De verjaardagslijst staat ook op Dagstart.</p>`});openModal({title:tool.name,eyebrow:'Klastool',html:`<p>${esc(tool.description)}</p>`})}
function openTimer(){const m=store.get().classMode.timerMinutes;openModal({title:'Timer',eyebrow:'Klastool',html:`<div style="text-align:center;padding:24px"><div style="font-size:64px;font-weight:900;color:#246fa8">${m}:00</div><p class="muted">Visuele klastimer</p><div class="modal-actions" style="justify-content:center"><button class="btn" id="timerMinus">- 5 min</button><button class="btn primary" id="timerStart">Start</button><button class="btn" id="timerPlus">+ 5 min</button></div></div>`});$('#timerMinus').onclick=()=>{store.classMode({timerMinutes:Math.max(5,store.get().classMode.timerMinutes-5)});closeModal();openTimer()};$('#timerPlus').onclick=()=>{store.classMode({timerMinutes:Math.min(60,store.get().classMode.timerMinutes+5)});closeModal();openTimer()};$('#timerStart').onclick=()=>{store.classMode({timerRunning:true});closeModal();toast('Timer gestart',`${store.get().classMode.timerMinutes} minuten`,'success')}}
function openTrafficLight(){openModal({title:'Geluidslicht',eyebrow:'Klastool',html:`<div style="display:flex;gap:14px;justify-content:center;padding:20px">${[['red','Stil'],['orange','Fluisteren'],['green','Overleggen']].map(([c,l])=>`<button class="btn" data-traffic="${c}" style="min-width:110px">● ${l}</button>`).join('')}</div>`});$$('[data-traffic]',$('#modalBody')).forEach(b=>b.onclick=()=>{store.classMode({traffic:b.dataset.traffic});closeModal();toast('Klasafspraak aangepast',b.textContent.trim(),'success')})}
function openScoreboard(){const c=store.get().classMode;openModal({title:'Scorebord',eyebrow:'Klastool',html:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:center"><div class="card"><div class="card-body"><h3>Team A</h3><div style="font-size:48px;font-weight:900">${c.scoreA}</div><button class="btn primary" data-score="A">+1</button></div></div><div class="card"><div class="card-body"><h3>Team B</h3><div style="font-size:48px;font-weight:900">${c.scoreB}</div><button class="btn primary" data-score="B">+1</button></div></div></div>`});$$('[data-score]',$('#modalBody')).forEach(b=>b.onclick=()=>{const key=b.dataset.score==='A'?'scoreA':'scoreB';store.classMode({[key]:store.get().classMode[key]+1});closeModal();openScoreboard()})}
function makeAutomaticGroups(){const shuffled=[...store.get().students].sort(()=>Math.random()-.5),size=4,groups=[];for(let i=0;i<shuffled.length;i+=size)groups.push(shuffled.slice(i,i+size));openModal({title:'Automatische groepjes',eyebrow:'Groepenmaker',html:`<div class="library-grid">${groups.map((g,i)=>`<article class="card"><div class="card-body"><h3>Groep ${i+1}</h3>${g.map(s=>`<p style="margin:5px 0">${esc(s.name)}</p>`).join('')}</div></article>`).join('')}</div><div class="modal-actions"><button class="btn" data-close-modal>Sluiten</button><button class="btn primary" id="saveGroups">Bewaar als flexgroepen</button></div>`});$('#saveGroups').onclick=()=>{store.update(s=>({...s,flexGroups:groups.map((g,i)=>({id:makeId('fg'),name:`Werkteam ${i+1}`,color:['blue','green','purple'][i%3],members:g.map(x=>x.id)}))}));closeModal();toast('Groepjes opgeslagen','','success')}}
function showFlexGroupForm(existingId=null){const existing=(store.get().flexGroups||[]).find(g=>g.id===existingId);openModal({title:existing?'Groep bewerken':'Nieuwe flexibele groep',eyebrow:'Groepen',html:`<form id="flexForm"><div class="field"><label>Naam</label><input class="input" name="name" required value="${esc(existing?.name||'')}"></div><p class="muted">Selecteer leerlingen in de volgende stap. Voor deze demo worden automatisch zes leerlingen toegevoegd.</p><div class="modal-actions"><button class="btn" type="button" data-close-modal>Annuleren</button><button class="btn primary">Opslaan</button></div></form>`});$('#flexForm').onsubmit=e=>{e.preventDefault();const name=new FormData(e.currentTarget).get('name').trim();store.update(s=>({...s,flexGroups:existing?s.flexGroups.map(g=>g.id===existing.id?{...g,name}:g):[...(s.flexGroups||[]),{id:makeId('fg'),name,color:'blue',members:s.students.slice(0,6).map(x=>x.id)}]}));closeModal();toast('Flexibele groep opgeslagen',name,'success')}}
function showLesson(id,start){const lesson=lessonPlans.find(l=>l.id===id);if(!lesson)return;openDrawer({title:lesson.title,eyebrow:start?'Les gestart':'Lesvoorbereiding',html:`<p><b>Lesdoel</b><br>${esc(lesson.goal)}</p><div class="card"><div class="card-body"><h3>Lesstappen</h3>${lesson.steps.map((s,i)=>`<p><b>${i+1}.</b> ${esc(s)}</p>`).join('')}</div></div><div class="card"><div class="card-body"><h3>Materialen</h3>${lesson.materials.map(x=>`<span class="pill blue" style="margin:3px">${esc(x)}</span>`).join('')}</div></div>${start?'<button class="btn primary" data-route="classroom">Open Klassenmanagement</button>':''}`})}
function showLessonForm(){openModal({title:'Nieuwe les',eyebrow:'Lesplanner',html:`<form id="lessonForm"><div class="form-grid"><div class="field full"><label>Lesnaam</label><input class="input" required name="title"></div><div class="field"><label>Vak</label><select class="select" name="subject"><option>Rekenen</option><option>Taal</option><option>Lezen</option><option>Engels</option><option>Wereldoriëntatie</option></select></div><div class="field"><label>Duur</label><select class="select" name="duration"><option>30</option><option selected>45</option><option>60</option></select></div><div class="field full"><label>Lesdoel</label><textarea class="textarea" name="goal"></textarea></div></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>Annuleren</button><button class="btn primary">Les opslaan</button></div></form>`});$('#lessonForm').onsubmit=e=>{e.preventDefault();closeModal();toast('Les opgeslagen','De les staat als concept in de planner.','success')}}
function showStudentTask(id){const task=store.get().tasks.find(t=>t.id===id);if(!task)return;openDrawer({title:task.title,eyebrow:'Mijn taak',html:`<p>${esc(task.description||task.summary)}</p><div class="card"><div class="card-body"><b>Deadline</b><p>${formatDate(task.deadline)}</p><p class="muted">In deze demo kun je de opdracht openen, maar er is nog geen echte inleverbackend.</p></div></div><button class="btn primary" data-close-drawer>Begrepen</button>`})}
