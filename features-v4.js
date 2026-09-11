import {store} from './modules/store.js';
import {$,$$,esc,toast,openModal,closeModal} from './modules/ui.js';

const KEY='go_features_v4';
const channel=('BroadcastChannel' in window)?new BroadcastChannel('go-live-classroom-v4'):null;
const peers=new Map();
let renderTimer=null;

function loadExtra(){
 try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}
}
function saveExtra(patch){
 const next={attendance:{},completed:{},checkins:{},announcements:[],polls:[],...loadExtra(),...patch};
 localStorage.setItem(KEY,JSON.stringify(next));
 return next;
}
function extra(){return {attendance:{},completed:{},checkins:{},announcements:[],polls:[],...loadExtra()}}
function activeStudent(){return store.activeStudent?.()||store.get().students.find(s=>s.id===store.get().activeStudentId)||store.get().students[0]}
function uid(){return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}

function injectTeacherTools(){
 const state=store.get();
 if(state.portalMode!=='teacher')return;
 const page=$('#page'); if(!page)return;
 if(!page.querySelector('.v4-teacher-commandbar')){
  const head=page.querySelector('.page-head');
  if(head){
   const bar=document.createElement('div');bar.className='v4-teacher-commandbar';bar.innerHTML=`
    <button class="btn" data-v4="attendance">✓ Aanwezigheid</button>
    <button class="btn" data-v4="announcement">💬 Bericht sturen</button>
    <button class="btn" data-v4="poll">📊 Snelle poll</button>
    <button class="btn" data-v4="help-queue">🙋 Hulpvragen <span class="v4-count">${state.students.filter(s=>s.help).length}</span></button>`;
   head.insertAdjacentElement('afterend',bar);
  }
 }
 $$('.student-card',page).forEach(card=>{
  if(card.querySelector('[data-v4="request-share"]'))return;
  const id=card.dataset.studentId;const actions=card.querySelector('.student-card-actions');if(!id||!actions)return;
  const b=document.createElement('button');b.className='btn sm soft';b.dataset.v4='request-share';b.dataset.studentId=id;b.textContent='Live scherm';actions.append(b);
 });
 $$('.student-overview-row',page).forEach(row=>{
  if(row.querySelector('[data-v4="request-share"]'))return;
  const open=row.querySelector('[data-action="student-details"]');if(!open)return;
  const id=open.dataset.id;const cell=open.parentElement;
  const share=document.createElement('button');share.className='btn sm soft';share.dataset.v4='request-share';share.dataset.studentId=id;share.textContent='Live scherm';cell.append(share);
  const msg=document.createElement('button');msg.className='btn sm';msg.dataset.v4='message-student';msg.dataset.studentId=id;msg.textContent='Bericht';cell.append(msg);
 });
 if(state.route==='day-start'&&!page.querySelector('.v4-class-pulse')){
  const e=extra();const present=state.students.filter(s=>e.attendance[s.id]!=='absent').length;
  const pulse=document.createElement('section');pulse.className='card v4-class-pulse';pulse.innerHTML=`<div class="card-header"><div><span class="eyebrow">Klas vandaag</span><h3>Snelle klasstatus</h3></div><button class="btn sm" data-v4="attendance">Open aanwezigheid</button></div><div class="v4-metrics"><div><b>${present}/${state.students.length}</b><span>aanwezig</span></div><div><b>${state.students.filter(s=>s.help).length}</b><span>hulpvragen</span></div><div><b>${Object.keys(e.checkins).length}</b><span>check-ins</span></div><div><b>${e.announcements.length}</b><span>berichten</span></div></div>`;
  const grid=page.querySelector('.teacher-hero-grid');grid?.insertAdjacentElement('afterend',pulse);
 }
}

function injectStudentTools(){
 const state=store.get();if(state.portalMode!=='student')return;const page=$('#page');if(!page)return;const s=activeStudent();if(!s)return;
 if(!page.querySelector('.v4-student-actions')){
  const head=page.querySelector('.student-page-head');if(head){const row=document.createElement('div');row.className='v4-student-actions';row.innerHTML=`<button class="btn" data-v4="student-checkin">🙂 Hoe gaat het?</button><button class="btn primary" data-v4="student-share-now">🖥 Deel scherm met docent</button>`;head.insertAdjacentElement('afterend',row)}
 }
 if(state.route==='student-tasks'){
  $$('.student-task-card',page).forEach(card=>{
   const open=card.querySelector('[data-action="student-task-open"]');if(!open||card.querySelector('[data-v4="complete-task"]'))return;
   const id=open.dataset.id;const key=`${s.id}:${id}`;const done=!!extra().completed[key];
   const b=document.createElement('button');b.className=`btn sm ${done?'':'soft'}`;b.dataset.v4='complete-task';b.dataset.taskId=id;b.textContent=done?'✓ Zelf afgemeld':'Markeer klaar';open.insertAdjacentElement('beforebegin',b);
  });
 }
 if(state.route==='student-messages'&&!page.querySelector('.v4-announcements')){
  const items=extra().announcements.filter(a=>!a.studentId||a.studentId===s.id).slice().reverse();
  if(items.length){const wrap=document.createElement('section');wrap.className='student-message-list v4-announcements';wrap.innerHTML=items.map(a=>`<article class="student-message"><span class="student-message-avatar">LD</span><div><small>Docent · ${esc(a.time)}</small><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div></article>`).join('');page.append(wrap)}
 }
}
function enhance(){clearTimeout(renderTimer);renderTimer=setTimeout(()=>{injectTeacherTools();injectStudentTools()},30)}
new MutationObserver(enhance).observe($('#page'),{childList:true,subtree:true});enhance();

function attendanceModal(){
 const state=store.get(),e=extra();
 openModal({title:'Aanwezigheid',eyebrow:'Klas vandaag',html:`<div class="v4-attendance">${state.students.map(s=>`<div class="v4-att-row"><span class="person"><span class="avatar">${esc(s.initials)}</span><b>${esc(s.name)}</b></span><div class="segmented"><button data-v4-att="present" data-id="${s.id}" class="${e.attendance[s.id]!=='absent'?'active':''}">Aanwezig</button><button data-v4-att="absent" data-id="${s.id}" class="${e.attendance[s.id]==='absent'?'active':''}">Afwezig</button></div></div>`).join('')}</div><div class="modal-actions"><button class="btn primary" data-close-modal>Gereed</button></div>`});
}
function announcementModal(studentId=''){
 const name=studentId?store.get().students.find(s=>s.id===studentId)?.name:'hele klas';
 openModal({title:'Bericht sturen',eyebrow:studentId?'Persoonlijk bericht':'Klasbericht',html:`<form id="v4Announcement"><div class="field"><label>Ontvanger</label><input class="input" value="${esc(name||'hele klas')}" disabled></div><div class="field"><label>Titel</label><input class="input" name="title" required maxlength="60" value="Bericht van de leerkracht"></div><div class="field"><label>Bericht</label><textarea class="textarea" name="text" required maxlength="400" placeholder="Schrijf een korte mededeling..."></textarea></div><div class="modal-actions"><button type="button" class="btn" data-close-modal>Annuleren</button><button class="btn primary">Versturen</button></div></form>`});
 $('#v4Announcement').addEventListener('submit',ev=>{ev.preventDefault();const fd=new FormData(ev.currentTarget),e=extra();e.announcements.push({id:uid(),studentId,title:fd.get('title').trim(),text:fd.get('text').trim(),time:new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})});saveExtra(e);closeModal();toast('Bericht verstuurd',studentId?'Naar leerling':'Naar hele klas','success')});
}
function pollModal(){
 openModal({title:'Snelle poll',eyebrow:'Interactie',html:`<form id="v4Poll"><div class="field"><label>Vraag</label><input class="input" name="question" required value="Snap je de uitleg tot nu toe?"></div><div class="field"><label>Antwoorden</label><input class="input" name="answers" value="Ja,Een beetje,Nog niet"></div><div class="modal-actions"><button type="button" class="btn" data-close-modal>Annuleren</button><button class="btn primary">Start poll</button></div></form>`});
 $('#v4Poll').addEventListener('submit',ev=>{ev.preventDefault();const fd=new FormData(ev.currentTarget),e=extra();e.polls.push({id:uid(),question:fd.get('question').trim(),answers:fd.get('answers').split(',').map(x=>x.trim()).filter(Boolean),active:true,responses:{}});saveExtra(e);closeModal();toast('Poll gestart','Leerlingen kunnen nu antwoorden.','success')});
}
function helpQueue(){const list=store.get().students.filter(s=>s.help);openModal({title:'Hulpvragen',eyebrow:'Actieve wachtrij',html:list.length?`<div class="v4-help-list">${list.map(s=>`<div class="v4-help-row"><span class="person"><span class="avatar">${esc(s.initials)}</span><b>${esc(s.name)}</b></span><button class="btn sm" data-v4="resolve-help" data-student-id="${s.id}">Afhandelen</button></div>`).join('')}</div>`:`<div class="empty"><div><h3>Geen hulpvragen</h3><p>Iedereen kan zelfstandig verder.</p></div></div>`})}
function checkinModal(){const s=activeStudent();openModal({title:'Hoe gaat het?',eyebrow:'Korte check-in',html:`<div class="v4-checkins"><button data-v4-checkin="great">😄<span>Goed</span></button><button data-v4-checkin="ok">🙂<span>Gaat wel</span></button><button data-v4-checkin="hard">😕<span>Lastig</span></button><button data-v4-checkin="help">🙋<span>Ik wil hulp</span></button></div>`});$$('[data-v4-checkin]',$('#modalBody')).forEach(b=>b.addEventListener('click',()=>{const e=extra();e.checkins[s.id]={value:b.dataset.v4Checkin,time:Date.now()};saveExtra(e);if(b.dataset.v4Checkin==='help')store.patchStudent(s.id,{help:true});closeModal();toast('Check-in opgeslagen','Je leerkracht kan je status zien.','success')}))}

function shareRequest(studentId){
 if(!channel){toast('Live delen niet beschikbaar','Deze browser ondersteunt BroadcastChannel niet.','warning');return}
 const student=store.get().students.find(s=>s.id===studentId);if(!student)return;
 const requestId=uid();sessionStorage.setItem('go-live-teacher-request',requestId);
 channel.postMessage({type:'share-request',requestId,studentId,studentName:student.name});
 openModal({title:`Live scherm · ${student.name}`,eyebrow:'Wachten op leerling',html:`<div class="v4-live-wait"><div class="v4-pulse"></div><h3>Schermdeelverzoek verstuurd</h3><p>${esc(student.name)} moet in de leerlingomgeving zelf op <b>Delen starten</b> klikken en vervolgens in de browser kiezen wat gedeeld wordt.</p><small>Voor deze GitHub Pages-versie werkt de echte liveverbinding tussen twee geopende GO-tabs in dezelfde browser/origin.</small></div><div id="v4LiveVideoWrap" class="v4-live-video" hidden><video id="v4TeacherVideo" autoplay playsinline></video><div class="v4-live-badge">LIVE</div></div><div class="modal-actions"><button class="btn danger" data-v4="stop-live" data-request-id="${requestId}">Stop sessie</button></div>`});
 createTeacherPeer(requestId,studentId);
}
function createTeacherPeer(requestId,studentId){
 const pc=new RTCPeerConnection();peers.set(requestId,{pc,role:'teacher',studentId});
 pc.ontrack=e=>{const video=$('#v4TeacherVideo');if(video){video.srcObject=e.streams[0];$('#v4LiveVideoWrap').hidden=false;$('.v4-live-wait')?.remove()}};
 pc.onicecandidate=e=>{if(e.candidate)channel?.postMessage({type:'ice',requestId,target:'student',candidate:e.candidate})};
}
async function startStudentShare(requestId){
 const s=activeStudent();
 try{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:12,max:20}},audio:false});
  const pc=new RTCPeerConnection();peers.set(requestId,{pc,role:'student',stream,studentId:s.id});
  stream.getTracks().forEach(t=>pc.addTrack(t,stream));
  pc.onicecandidate=e=>{if(e.candidate)channel?.postMessage({type:'ice',requestId,target:'teacher',candidate:e.candidate})};
  stream.getVideoTracks()[0]?.addEventListener('ended',()=>stopLive(requestId,true));
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);channel?.postMessage({type:'offer',requestId,studentId:s.id,sdp:offer});
  closeModal();toast('Scherm wordt gedeeld','Je kunt delen stoppen via de browser of de GO-knop.','success');
 }catch(err){toast('Schermdelen niet gestart','Je hebt geen scherm gekozen of toestemming is geweigerd.','warning')}
}
async function directStudentShare(){
 if(!channel){toast('Niet beschikbaar','Open GO in een browser met BroadcastChannel.','warning');return}
 const requestId=uid(),s=activeStudent();channel.postMessage({type:'student-offer-ready',requestId,studentId:s.id});
 openModal({title:'Scherm delen',eyebrow:'Zichtbare schermdeling',html:`<div class="v4-live-wait"><h3>Deel alleen wat je wilt laten zien</h3><p>De browser laat je kiezen tussen een tabblad, venster of scherm. Delen start pas nadat jij die keuze bevestigt.</p></div><div class="modal-actions"><button class="btn" data-close-modal>Annuleren</button><button class="btn primary" data-v4="accept-share" data-request-id="${requestId}">Delen starten</button></div>`});
}
function stopLive(requestId,notify=false){const p=peers.get(requestId);if(p){p.stream?.getTracks().forEach(t=>t.stop());p.pc?.close();peers.delete(requestId)}if(notify)channel?.postMessage({type:'stop',requestId});closeModal()}

if(channel)channel.onmessage=async ev=>{
 const m=ev.data||{};const state=store.get();const s=activeStudent();
 if(m.type==='share-request'&&state.portalMode==='student'&&s?.id===m.studentId){
  openModal({title:'Docent vraagt schermdeling',eyebrow:'Jij beslist',html:`<div class="v4-share-consent"><h3>Wil je je scherm delen?</h3><p>Je docent vraagt om live mee te kijken. De browser vraagt hierna nog apart welk tabblad, venster of scherm je wilt delen.</p><p><b>Delen is zichtbaar en je kunt het altijd stoppen.</b></p></div><div class="modal-actions"><button class="btn" data-close-modal>Niet delen</button><button class="btn primary" data-v4="accept-share" data-request-id="${m.requestId}">Delen starten</button></div>`});
 }
 if(m.type==='offer'){
  const p=peers.get(m.requestId);if(p?.role==='teacher'){await p.pc.setRemoteDescription(m.sdp);const answer=await p.pc.createAnswer();await p.pc.setLocalDescription(answer);channel.postMessage({type:'answer',requestId:m.requestId,sdp:answer})}
 }
 if(m.type==='answer'){
  const p=peers.get(m.requestId);if(p?.role==='student')await p.pc.setRemoteDescription(m.sdp);
 }
 if(m.type==='ice'){
  const p=peers.get(m.requestId);if(!p)return;if((m.target==='teacher'&&p.role==='teacher')||(m.target==='student'&&p.role==='student'))try{await p.pc.addIceCandidate(m.candidate)}catch{}
 }
 if(m.type==='stop')stopLive(m.requestId,false);
};

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-v4]');if(!b)return;const a=b.dataset.v4;
 if(a==='attendance')attendanceModal();
 if(a==='announcement')announcementModal();
 if(a==='poll')pollModal();
 if(a==='help-queue')helpQueue();
 if(a==='message-student')announcementModal(b.dataset.studentId);
 if(a==='resolve-help'){store.patchStudent(b.dataset.studentId,{help:false});b.closest('.v4-help-row')?.remove();toast('Hulpvraag afgehandeld','','success')}
 if(a==='student-checkin')checkinModal();
 if(a==='student-share-now')directStudentShare();
 if(a==='request-share')shareRequest(b.dataset.studentId);
 if(a==='accept-share')startStudentShare(b.dataset.requestId);
 if(a==='stop-live')stopLive(b.dataset.requestId,true);
 if(a==='complete-task'){const s=activeStudent(),e2=extra(),key=`${s.id}:${b.dataset.taskId}`;e2.completed[key]=!e2.completed[key];saveExtra(e2);b.textContent=e2.completed[key]?'✓ Zelf afgemeld':'Markeer klaar';b.classList.toggle('soft',!e2.completed[key]);toast(e2.completed[key]?'Taak afgemeld':'Taak weer geopend','','success')}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-v4-att]');if(!b)return;const e2=extra();e2.attendance[b.dataset.id]=b.dataset.v4Att;saveExtra(e2);b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b))});

window.addEventListener('beforeunload',()=>{for(const [id] of peers)stopLive(id,true);channel?.close()});

import './manual-live.js';
