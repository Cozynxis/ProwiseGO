import {icon} from './icons.js';
import {esc,formatDate,percent} from './ui.js';
import {daySchedule,studentMessages} from './school-data.js';

const statusLabel={open:'Open',future:'Later',done:'Klaar'};

function studentHeader(state,student,title,subtitle=''){
 return `<div class="student-page-head"><div><span class="student-eyebrow">${esc(student.name)} · ${esc(state.groupId)}</span><h1>${esc(title)}</h1>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><div class="student-head-actions"><button class="btn" data-action="switch-random-student">🎲 Andere leerling</button><button class="btn primary" data-action="return-teacher">Terug naar docent</button></div></div>`;
}

function studentAppTile(app){return `<button class="student-app-tile" data-action="open-app" data-id="${app.id}"><span class="app-logo ${app.color||'logo-blue'}">${esc(app.initials||app.name[0])}</span><b>${esc(app.name)}</b><small>${esc(app.subtitle||'Applicatie')}</small></button>`}

export function renderStudentHome(state){
 const student=state.students.find(s=>s.id===state.activeStudentId)||state.students[0];
 const apps=state.apps.filter(a=>a.group).slice(0,8);
 const openTasks=state.tasks.filter(t=>t.status==='open');
 return `${studentHeader(state,student,'Mijn start','Alles wat je vandaag nodig hebt staat hier klaar.')}
 <div class="student-welcome"><div><span>Hoi ${esc(student.name.split(' ')[0])} 👋</span><h2>Welkom bij je klas</h2><p>Je hebt ${openTasks.length} open taken. Begin bij de eerstvolgende opdracht of open een app.</p></div><div class="student-mascot">GO</div></div>
 <div class="student-summary-grid"><div class="student-summary"><span>📚</span><div><b>${apps.length}</b><small>Apps voor jou</small></div></div><div class="student-summary"><span>✅</span><div><b>${openTasks.length}</b><small>Open taken</small></div></div><div class="student-summary"><span>🕘</span><div><b>${daySchedule.filter(x=>x.type!=='break').length}</b><small>Blokken vandaag</small></div></div><div class="student-summary"><span>💬</span><div><b>${studentMessages.length}</b><small>Berichten</small></div></div></div>
 <section class="student-section"><div class="student-section-head"><div><span>Voor jou</span><h2>Applicaties</h2></div><button class="text-button" data-student-route="student-apps">Alle apps →</button></div><div class="student-app-grid">${apps.map(studentAppTile).join('')}</div></section>
 <div class="student-two-col"><section class="student-section"><div class="student-section-head"><div><span>Te doen</span><h2>Open taken</h2></div><button class="text-button" data-student-route="student-tasks">Alle taken →</button></div><div class="student-task-stack">${openTasks.slice(0,3).map(t=>studentTask(t,student)).join('')}</div></section><section class="student-section"><div class="student-section-head"><div><span>Vandaag</span><h2>Planning</h2></div></div><div class="student-mini-schedule">${daySchedule.slice(0,6).map((x,i)=>`<div class="student-schedule-row ${i===0?'current':''}"><time>${x.time}</time><div><b>${esc(x.title)}</b><small>${esc(x.subject)}</small></div>${i===0?'<span>Nu</span>':''}</div>`).join('')}</div></section></div>`;
}

function studentTask(t,student){
 const pseudoDone=((Number(student.id.replace('s',''))+t.id.length)%4)===0;
 return `<article class="student-task-card ${pseudoDone?'finished':''}"><div class="student-task-icon">${pseudoDone?'✓':'→'}</div><div><div class="student-task-title"><b>${esc(t.title)}</b><span class="pill ${pseudoDone?'green':'blue'}">${pseudoDone?'Klaar':statusLabel[t.status]}</span></div><p>${esc(t.summary)}</p><small>Deadline ${formatDate(t.deadline)}</small></div><button class="btn sm ${pseudoDone?'':'primary'}" data-action="student-task-open" data-id="${t.id}">${pseudoDone?'Bekijken':'Start'}</button></article>`;
}

export function renderStudentApps(state){const student=state.students.find(s=>s.id===state.activeStudentId)||state.students[0];const apps=state.apps.filter(a=>a.group);return `${studentHeader(state,student,'Mijn apps','Apps die jouw leerkracht voor de klas heeft klaargezet.')}<div class="student-app-grid large">${apps.map(studentAppTile).join('')}</div>`}

export function renderStudentTasks(state){
 const student=state.students.find(s=>s.id===state.activeStudentId)||state.students[0];
 const tasks=state.tasks.filter(t=>t.status!=='future');
 const completed=tasks.filter(t=>((Number(student.id.replace('s',''))+t.id.length)%4)===0).length;
 return `${studentHeader(state,student,'Mijn taken','Bekijk wat je nog moet doen en wat je al hebt afgerond.')}<div class="student-progress-card"><div><span>Deze periode</span><h2>${completed} van ${tasks.length} klaar</h2><p>Werk rustig verder. Je voortgang wordt automatisch bijgehouden in deze demo.</p></div><div class="student-progress-ring"><b>${percent(completed,tasks.length)}%</b></div></div><div class="student-task-stack roomy">${tasks.map(t=>studentTask(t,student)).join('')}</div>`;
}

export function renderStudentDay(state){const student=state.students.find(s=>s.id===state.activeStudentId)||state.students[0];return `${studentHeader(state,student,'Vandaag','Je schooldag in één overzicht.')}<section class="student-section"><div class="student-day-timeline">${daySchedule.map((x,i)=>`<article class="student-day-row ${x.type} ${i===0?'current':''}"><time><b>${x.time}</b><small>${x.end}</small></time><span class="student-day-dot"></span><div><h3>${esc(x.title)}</h3><p>${esc(x.note)}</p><span>${esc(x.subject)}</span></div>${i===0?'<b class="now-badge">Nu bezig</b>':''}</article>`).join('')}</div></section>`}

export function renderStudentMessages(state){const student=state.students.find(s=>s.id===state.activeStudentId)||state.students[0];return `${studentHeader(state,student,'Berichten','Mededelingen van je leerkracht.')}<div class="student-message-list">${studentMessages.map(m=>`<article class="student-message"><span class="student-message-avatar">LD</span><div><small>${esc(m.teacher)} · ${esc(m.time)}</small><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div></article>`).join('')}</div>`}

export function renderStudentHelp(state){const student=state.students.find(s=>s.id===state.activeStudentId)||state.students[0];return `${studentHeader(state,student,'Hulp nodig?','Kies wat je nodig hebt.')}<div class="student-help-grid"><button class="student-help-card" data-action="student-help-request"><span>🙋</span><h3>Ik heb hulp nodig</h3><p>Stuur een hulpsignaal naar je leerkracht.</p></button><button class="student-help-card" data-student-route="student-tasks"><span>✅</span><h3>Waar zijn mijn taken?</h3><p>Ga direct naar je opdrachten.</p></button><button class="student-help-card" data-student-route="student-apps"><span>📚</span><h3>Waar zijn mijn apps?</h3><p>Bekijk de apps van je klas.</p></button></div>`}

export function renderStudentPage(state){switch(state.route){case'student-apps':return renderStudentApps(state);case'student-tasks':return renderStudentTasks(state);case'student-day':return renderStudentDay(state);case'student-messages':return renderStudentMessages(state);case'student-help':return renderStudentHelp(state);default:return renderStudentHome(state)}}
