import {icon} from './icons.js';
import {pageHeader,esc,percent} from './ui.js';
import {daySchedule,lessonPlans,quickTools,birthdays} from './school-data.js';

export function renderDayStart(state){
 const open=state.tasks.filter(t=>t.status==='open').length;
 const online=state.students.filter(s=>s.status==='online').length;
 const help=state.students.filter(s=>s.help).length;
 return `${pageHeader('Dagstart','Begin de schooldag met planning, klasstatus en snelle acties.',`<button class="btn primary" data-action="start-class-mode">▶ Start lesmodus</button>`)}
 <div class="teacher-hero-grid">
  <section class="day-card accent"><span>Goedemorgen</span><h2>${esc(state.teacherName||'Levi Docent')}</h2><p>${online} leerlingen online · ${open} open taken · ${help} hulpvragen</p><div class="hero-actions"><button class="btn light" data-route="lesson-planner">Lesplanning</button><button class="btn light" data-route="class-tools">Klastools</button></div></section>
  <section class="metric-card"><small>Vandaag</small><b>${daySchedule.filter(x=>x.type!=='break').length}</b><span>lesblokken</span></section>
  <section class="metric-card"><small>Ingeleverd</small><b>${state.tasks.reduce((n,t)=>n+t.submitted,0)}</b><span>taakinzendingen</span></section>
  <section class="metric-card"><small>Verjaardagen</small><b>${birthdays.length}</b><span>deze maand</span></section>
 </div>
 <div class="teacher-grid two">
  <section class="card"><div class="card-header"><div><span class="eyebrow">Vandaag</span><h3>Dagplanning</h3></div><button class="btn sm" data-route="lesson-planner">Alles bekijken</button></div><div class="timeline">${daySchedule.map((x,i)=>`<div class="timeline-row ${x.type}"><time>${x.time}</time><span class="timeline-dot"></span><div><b>${esc(x.title)}</b><small>${esc(x.note)}</small></div>${i===0?'<span class="pill green">Nu</span>':''}</div>`).join('')}</div></section>
  <section class="card"><div class="card-header"><div><span class="eyebrow">Snel starten</span><h3>Klastools</h3></div></div><div class="quick-tools-grid">${quickTools.map(t=>`<button class="quick-tool" data-action="quick-tool" data-tool="${t.id}"><span>${t.icon}</span><b>${esc(t.name)}</b><small>${esc(t.description)}</small></button>`).join('')}</div></section>
 </div>`;
}

export function renderLessonPlanner(state){
 return `${pageHeader('Lesplanner','Bereid lesblokken voor en start ze direct vanuit de docentomgeving.',`<button class="btn primary" data-action="new-lesson">${icon('plus')} Nieuwe les</button>`)}
 <div class="planner-week"><div class="planner-heading"><button class="icon-button">‹</button><div><b>Deze schoolweek</b><small>7 t/m 11 september</small></div><button class="icon-button">›</button></div><div class="week-strip">${['Ma','Di','Wo','Do','Vr'].map((d,i)=>`<button class="day-pill ${i===4?'active':''}"><b>${d}</b><span>${7+i}</span></button>`).join('')}</div></div>
 <div class="lesson-list">${lessonPlans.map(l=>`<article class="lesson-card"><div class="lesson-subject">${esc(l.subject.slice(0,2).toUpperCase())}</div><div class="lesson-copy"><div class="lesson-title"><h3>${esc(l.title)}</h3><span class="pill ${l.status==='ready'?'green':'orange'}">${l.status==='ready'?'Klaar':'Concept'}</span></div><p>${esc(l.goal)}</p><div class="lesson-meta"><span>${l.duration} min</span><span>${l.materials.length} materialen</span><span>${l.steps.length} stappen</span></div></div><div class="lesson-actions"><button class="btn sm" data-action="preview-lesson" data-id="${l.id}">Bekijken</button><button class="btn sm primary" data-action="start-lesson" data-id="${l.id}">Starten</button></div></article>`).join('')}</div>`;
}

export function renderGroups(state){
 const students=state.students;
 const flex=state.flexGroups||[
  {id:'fg1',name:'Verlengde instructie rekenen',color:'blue',members:students.slice(0,6).map(s=>s.id)},
  {id:'fg2',name:'Plusgroep taal',color:'purple',members:students.slice(6,12).map(s=>s.id)},
  {id:'fg3',name:'Leesmaatjes',color:'green',members:students.slice(12,20).map(s=>s.id)}
 ];
 return `${pageHeader('Groepen','Maak flexibele instructiegroepen en tijdelijke werkteams.',`<button class="btn" data-action="auto-groups">🎲 Automatisch verdelen</button><button class="btn primary" data-action="new-flex-group">${icon('plus')} Nieuwe groep</button>`)}
 <div class="group-dashboard"><section class="card"><div class="card-header"><div><span class="eyebrow">Actieve klas</span><h3>${students.length} leerlingen</h3></div><span class="pill blue">${state.groupId}</span></div><div class="avatar-cloud">${students.map(s=>`<span class="student-chip"><span class="avatar">${esc(s.initials)}</span>${esc(s.name.split(' ')[0])}</span>`).join('')}</div></section>
 <section class="flex-group-list">${flex.map(g=>`<article class="flex-group-card ${g.color}"><div><span class="eyebrow">Flexibele groep</span><h3>${esc(g.name)}</h3><p>${g.members.length} leerlingen</p></div><div class="mini-avatar-stack">${g.members.slice(0,5).map(id=>{const s=students.find(x=>x.id===id);return s?`<span class="avatar">${esc(s.initials)}</span>`:''}).join('')}${g.members.length>5?`<span class="avatar more">+${g.members.length-5}</span>`:''}</div><div class="card-actions"><button class="btn sm" data-action="open-flex-group" data-id="${g.id}">Openen</button><button class="btn sm" data-action="manage-flex-group" data-id="${g.id}">Beheren</button></div></article>`).join('')}</section></div>`;
}

export function renderStudentOverview(state){
 const rows=state.students.map((s,i)=>({s,done:Math.max(0,state.tasks.filter(t=>t.status!=='future').length-(i%3)),total:state.tasks.filter(t=>t.status!=='future').length,signal:i%8===0?'Extra instructie':i%5===0?'Hulp gevraagd':'Op schema'}));
 return `${pageHeader('Leerlingoverzicht','Bekijk werkstatus, hulpvragen en taakvoortgang van de actieve groep.',`<button class="btn" data-action="random-student-view">👤 Bekijk als willekeurige leerling</button>`)}
 <div class="overview-stats"><div class="summary-card"><span class="summary-copy"><b>${state.students.length}</b><span>Leerlingen</span></span></div><div class="summary-card"><span class="summary-copy"><b>${state.students.filter(s=>s.status==='online').length}</b><span>Online</span></span></div><div class="summary-card"><span class="summary-copy"><b>${state.students.filter(s=>s.help).length}</b><span>Hulpvragen</span></span></div><div class="summary-card"><span class="summary-copy"><b>${Math.round(rows.reduce((n,r)=>n+percent(r.done,r.total),0)/rows.length)}%</b><span>Gemiddeld klaar</span></span></div></div>
 <section class="card student-overview-table"><div class="student-overview-head"><span>Leerling</span><span>Status</span><span>Voortgang</span><span>Signaal</span><span></span></div>${rows.map(r=>`<div class="student-overview-row"><span class="person"><span class="avatar">${esc(r.s.initials)}</span><b>${esc(r.s.name)}</b></span><span class="pill ${r.s.status==='online'?'green':r.s.status==='idle'?'orange':''}">${r.s.status}</span><span><div class="progress"><i style="width:${percent(r.done,r.total)}%"></i></div><small>${r.done}/${r.total} taken</small></span><span class="signal ${r.signal!=='Op schema'?'attention':''}">${esc(r.signal)}</span><span><button class="btn sm" data-action="student-details" data-id="${r.s.id}">Open</button><button class="btn sm soft" data-action="view-as-student" data-id="${r.s.id}">Als leerling</button></span></div>`).join('')}</section>`;
}

export function renderClassTools(){
 return `${pageHeader('Klastools','Handige hulpmiddelen voor instructie, samenwerken en klassenmanagement.','')}<div class="tool-board">${quickTools.map(t=>`<article class="tool-card"><div class="tool-icon">${t.icon}</div><h3>${esc(t.name)}</h3><p>${esc(t.description)}</p><button class="btn primary" data-action="quick-tool" data-tool="${t.id}">Open tool</button></article>`).join('')}</div>`;
}

export function renderTeacherExtra(state){switch(state.route){case'day-start':return renderDayStart(state);case'lesson-planner':return renderLessonPlanner(state);case'groups':return renderGroups(state);case'student-overview':return renderStudentOverview(state);case'class-tools':return renderClassTools(state);default:return null}}
