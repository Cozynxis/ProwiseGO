import {store} from './modules/store.js';
import {$,esc,toast,openModal,closeModal} from './modules/ui.js';

const CHANNEL_NAME='go-live-icons-v5';
const channel=('BroadcastChannel' in window)?new BroadcastChannel(CHANNEL_NAME):null;
const sessions=new Map();
const rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};
const ICONS=['🦋','✏️','🎈','⭐','🌈','🐢','🍎','⚽','🎨','🚀','🌻','🐝','🍀','🎵','📚','🧩','🦊','🐳','🌙','☀️','🎯','🪁','🍉','🛝','🧸','🚲','🎮','💡'];
let pendingTeacherRequest=null;
let pendingStudentRequest=null;

function activeStudent(){return store.activeStudent?.()||store.get().students.find(s=>s.id===store.get().activeStudentId)||store.get().students[0]}
function uid(){return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}
function pickIcons(){const pool=[...ICONS],out=[];for(let i=0;i<4;i++){const n=Math.floor(Math.random()*pool.length);out.push(pool.splice(n,1)[0])}return out}
function stopSession(id){const s=sessions.get(id);if(!s)return;s.stream?.getTracks().forEach(t=>t.stop());s.pc?.close();sessions.delete(id)}
function codeHtml(code){return `<div class="go-icon-code">${code.map((x,i)=>`<span class="go-icon-chip" data-pos="${i}">${x}</span>`).join('')}</div>`}
function injectStyles(){if($('#goLiveIconStyles'))return;const s=document.createElement('style');s.id='goLiveIconStyles';s.textContent=`
.go-icon-code{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}.go-icon-chip{display:grid;place-items:center;width:68px;height:68px;border-radius:18px;background:linear-gradient(145deg,#f7fbff,#e8f3ff);border:2px solid #cfe6fb;font-size:34px;box-shadow:0 8px 22px rgba(20,80,130,.10)}
.go-icon-picker{display:grid;grid-template-columns:repeat(7,minmax(42px,1fr));gap:9px;margin-top:12px}.go-icon-pick{min-height:50px;border:1px solid #dce7f2;background:#fff;border-radius:13px;font-size:24px;cursor:pointer}.go-icon-pick:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(20,80,130,.12)}.go-picked-row{display:flex;gap:10px;align-items:center;margin:12px 0}.go-picked-slot{display:grid;place-items:center;width:56px;height:56px;border-radius:14px;background:#f1f6fa;border:1px dashed #a8bfd3;font-size:28px}.go-live-controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
@media(max-width:700px){.go-icon-picker{grid-template-columns:repeat(4,1fr)}}`;
document.head.append(s)}
injectStyles();

function teacherRequest(studentId){
 const student=store.get().students.find(s=>s.id===studentId);if(!student)return;
 if(!channel){toast('Live koppeling niet beschikbaar','Deze browser ondersteunt de benodigde kanaalverbinding niet.','warning');return}
 const requestId=uid();pendingTeacherRequest={requestId,studentId,studentName:student.name};
 channel.postMessage({type:'teacher-request',requestId,studentId,studentName:student.name});
 openTeacherCodeModal(pendingTeacherRequest);
}

function openTeacherCodeModal(req){
 const selected=[];
 openModal({title:`Live scherm · ${esc(req.studentName)}`,eyebrow:'Koppel met 4 pictogrammen',html:`
  <div class="v4-share-consent"><h3>Voer de 4 pictogrammen van de leerling in</h3><p>Bij ${esc(req.studentName)} verschijnt nu een zichtbare GO-popup met vier pictogrammen. Klik ze hieronder in dezelfde volgorde aan.</p></div>
  <div class="go-picked-row" id="goPickedSlots">${[0,1,2,3].map(()=>'<span class="go-picked-slot">•</span>').join('')}</div>
  <div class="go-icon-picker">${ICONS.map((i,n)=>`<button class="go-icon-pick" type="button" data-icon-index="${n}">${i}</button>`).join('')}</div>
  <div class="modal-actions"><button class="btn" id="goClearIcons">Wis</button><button class="btn primary" id="goSubmitIcons">Koppelen</button></div>
  <div id="goTeacherLiveWrap" class="v4-live-video" hidden style="margin-top:18px"><video id="goTeacherLiveVideo" autoplay playsinline style="width:100%;background:#111;border-radius:12px"></video><div class="v4-live-badge">LIVE</div></div>
  <div class="go-live-controls" id="goTeacherControls" hidden>
   <button class="btn" id="goPauseViewer">⏸ Pauzeer beeld</button>
   <button class="btn" id="goFullscreenViewer">⛶ Volledig scherm</button>
   <button class="btn danger" id="goStopViewer">■ Stop sessie</button>
  </div>`});
 const redraw=()=>{$('#goPickedSlots').innerHTML=[0,1,2,3].map((_,i)=>`<span class="go-picked-slot">${selected[i]||'•'}</span>`).join('')};
 document.querySelectorAll('.go-icon-pick').forEach(b=>b.addEventListener('click',()=>{if(selected.length>=4)return;selected.push(ICONS[Number(b.dataset.iconIndex)]);redraw()}));
 $('#goClearIcons')?.addEventListener('click',()=>{selected.length=0;redraw()});
 $('#goSubmitIcons')?.addEventListener('click',()=>{if(selected.length!==4)return toast('Kies precies 4 pictogrammen','','warning');channel.postMessage({type:'pair-attempt',requestId:req.requestId,studentId:req.studentId,icons:selected});toast('Code verstuurd','Wachten op bevestiging van de leerling.','success')});
 $('#goPauseViewer')?.addEventListener('click',()=>{const v=$('#goTeacherLiveVideo');if(!v)return;if(v.paused){v.play();$('#goPauseViewer').textContent='⏸ Pauzeer beeld'}else{v.pause();$('#goPauseViewer').textContent='▶ Hervat beeld'}});
 $('#goFullscreenViewer')?.addEventListener('click',()=>$('#goTeacherLiveVideo')?.requestFullscreen?.());
 $('#goStopViewer')?.addEventListener('click',()=>{channel.postMessage({type:'stop-session',requestId:req.requestId,studentId:req.studentId});stopSession(req.requestId);closeModal()});
}

function showStudentRequest(msg){
 const student=activeStudent();if(!student||student.id!==msg.studentId)return;
 const icons=pickIcons();pendingStudentRequest={...msg,icons};
 openModal({title:'Docent vraagt live scherm',eyebrow:'GO veilige koppeling',html:`
  <div class="v4-share-consent"><h3>Je docent wil live meekijken</h3><p>Geef deze 4 pictogrammen door aan de docent. Er wordt <b>nog niets gedeeld</b>. Pas na de juiste code kun jij zelf kiezen welk scherm, venster of tabblad je deelt.</p></div>
  ${codeHtml(icons)}
  <div class="modal-actions"><button class="btn" data-close-modal>Weigeren</button><button class="btn primary" id="goKeepRequestOpen">Ik geef de code door</button></div>`});
 $('#goKeepRequestOpen')?.addEventListener('click',()=>toast('Code blijft actief','Wacht tot de docent de vier pictogrammen invoert.','success'));
}

async function beginStudentCapture(req){
 openModal({title:'Code klopt',eyebrow:'Laatste stap',html:`<div class="v4-share-consent"><h3>Wil je nu je scherm delen?</h3><p>Chrome laat je zelf kiezen tussen een tabblad, venster of volledig scherm. De docent ziet alleen wat jij hier kiest en je kunt delen altijd stoppen.</p></div><div class="modal-actions"><button class="btn" data-close-modal>Niet delen</button><button class="btn primary" id="goStartCapture">Kies scherm en start</button></div>`});
 $('#goStartCapture')?.addEventListener('click',async()=>{
  try{
   const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:16,max:24}},audio:false});
   const pc=new RTCPeerConnection(rtcConfig);sessions.set(req.requestId,{pc,stream,role:'student',studentId:req.studentId});
   stream.getTracks().forEach(t=>pc.addTrack(t,stream));
   pc.onicecandidate=e=>{if(e.candidate)channel?.postMessage({type:'ice',requestId:req.requestId,target:'teacher',candidate:e.candidate})};
   stream.getVideoTracks()[0]?.addEventListener('ended',()=>{channel?.postMessage({type:'student-stop',requestId:req.requestId});stopSession(req.requestId);toast('Schermdeling gestopt','','warning')});
   const offer=await pc.createOffer();await pc.setLocalDescription(offer);channel.postMessage({type:'offer',requestId:req.requestId,studentId:req.studentId,sdp:offer});
   closeModal();toast('Schermdeling gestart','Je ziet in Chrome dat delen actief is.','success');
  }catch(e){console.error(e);toast('Schermdelen niet gestart','Je hebt geen scherm gekozen of toestemming geweigerd.','warning')}
 });
}

async function onChannelMessage(m){
 const state=store.get();const student=activeStudent();
 if(m.type==='teacher-request'&&state.portalMode==='student'&&student?.id===m.studentId){showStudentRequest(m);return}
 if(m.type==='pair-attempt'&&state.portalMode==='student'&&pendingStudentRequest?.requestId===m.requestId){
  const ok=JSON.stringify(m.icons)===JSON.stringify(pendingStudentRequest.icons);channel.postMessage({type:'pair-result',requestId:m.requestId,studentId:m.studentId,ok});
  if(ok)beginStudentCapture(pendingStudentRequest);else toast('Code klopt niet','De docent moet dezelfde vier pictogrammen kiezen.','warning');return;
 }
 if(m.type==='pair-result'&&state.portalMode==='teacher'&&pendingTeacherRequest?.requestId===m.requestId){if(!m.ok)return toast('Verkeerde pictogramcode','Probeer de vier pictogrammen opnieuw.','warning');toast('Code klopt','De leerling kiest nu zelf wat gedeeld wordt.','success');return}
 if(m.type==='offer'&&state.portalMode==='teacher'&&pendingTeacherRequest?.requestId===m.requestId){
  let s=sessions.get(m.requestId);if(!s){const pc=new RTCPeerConnection(rtcConfig);s={pc,role:'teacher',studentId:m.studentId};sessions.set(m.requestId,s);pc.ontrack=e=>{const v=$('#goTeacherLiveVideo');if(v){v.srcObject=e.streams[0];$('#goTeacherLiveWrap').hidden=false;$('#goTeacherControls').hidden=false}};pc.onicecandidate=e=>{if(e.candidate)channel.postMessage({type:'ice',requestId:m.requestId,target:'student',candidate:e.candidate})};}
  await s.pc.setRemoteDescription(m.sdp);const answer=await s.pc.createAnswer();await s.pc.setLocalDescription(answer);channel.postMessage({type:'answer',requestId:m.requestId,sdp:answer});return;
 }
 if(m.type==='answer'){const s=sessions.get(m.requestId);if(s?.role==='student')await s.pc.setRemoteDescription(m.sdp);return}
 if(m.type==='ice'){const s=sessions.get(m.requestId);if(!s)return;if((m.target==='teacher'&&s.role==='teacher')||(m.target==='student'&&s.role==='student'))try{await s.pc.addIceCandidate(m.candidate)}catch{}return}
 if(m.type==='student-stop'){stopSession(m.requestId);toast('Leerling heeft schermdeling gestopt','','warning');return}
 if(m.type==='stop-session'&&state.portalMode==='student'&&student?.id===m.studentId){stopSession(m.requestId);toast('De sessie is beëindigd','','warning')}
}
if(channel)channel.onmessage=e=>onChannelMessage(e.data||{}).catch(console.error);

document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-v4="student-share-now"],[data-v4="request-share"]');if(!button)return;
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 if(button.dataset.v4==='request-share')teacherRequest(button.dataset.studentId);
 else{
  const s=activeStudent();if(!s)return;const requestId=uid();const icons=pickIcons();pendingStudentRequest={type:'teacher-request',requestId,studentId:s.id,studentName:s.name,icons};
  openModal({title:'Scherm delen met docent',eyebrow:'Start zelf een sessie',html:`<div class="v4-share-consent"><h3>Jouw 4 pictogrammen</h3><p>Geef deze code aan de docent. Er wordt nog niets gedeeld.</p></div>${codeHtml(icons)}<div class="modal-actions"><button class="btn" data-close-modal>Annuleren</button><button class="btn primary" id="goStudentStartWithoutRequest">Verder</button></div>`});
  $('#goStudentStartWithoutRequest')?.addEventListener('click',()=>beginStudentCapture(pendingStudentRequest));
 }
},true);

window.addEventListener('beforeunload',()=>{for(const [id] of sessions)stopSession(id);channel?.close()});
