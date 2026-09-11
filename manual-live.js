import {store} from './modules/store.js';
import {$,esc,toast,openModal,closeModal} from './modules/ui.js';

const sessions=new Map();
const rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};

function activeStudent(){return store.activeStudent?.()||store.get().students.find(s=>s.id===store.get().activeStudentId)||store.get().students[0]}
function uid(){return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}
function encode(desc){return btoa(unescape(encodeURIComponent(JSON.stringify(desc))))}
function decode(value){return JSON.parse(decodeURIComponent(escape(atob(String(value||'').trim()))))}
function waitIce(pc){if(pc.iceGatheringState==='complete')return Promise.resolve();return new Promise(resolve=>{const done=()=>{if(pc.iceGatheringState==='complete'){pc.removeEventListener('icegatheringstatechange',done);resolve()}};pc.addEventListener('icegatheringstatechange',done);setTimeout(resolve,7000)})}
function copyFrom(id){const el=$(id);if(!el?.value)return;navigator.clipboard?.writeText(el.value).then(()=>toast('Code gekopieerd','','success')).catch(()=>{})}
function closeSession(id){const s=sessions.get(id);if(s){s.stream?.getTracks().forEach(t=>t.stop());s.pc?.close();sessions.delete(id)}}

async function openStudentShare(){
 const student=activeStudent();if(!student)return;
 try{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:16,max:24}},audio:false});
  const id=uid();const pc=new RTCPeerConnection(rtcConfig);sessions.set(id,{pc,stream,role:'student'});
  stream.getTracks().forEach(t=>pc.addTrack(t,stream));
  stream.getVideoTracks()[0]?.addEventListener('ended',()=>{closeSession(id);toast('Schermdeling gestopt','','warning')});
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);await waitIce(pc);
  const studentCode=encode(pc.localDescription);
  openModal({title:'Scherm delen met docent',eyebrow:`${esc(student.name)} · live sessie`,html:`
   <div class="v4-share-consent"><h3>Leerlingcode</h3><p>Stuur deze code naar de docent. Daarna krijg je van de docent een antwoordcode terug.</p></div>
   <div class="field"><label>Leerlingcode</label><textarea id="manualStudentCode" class="textarea" style="min-height:120px;font-family:monospace" readonly>${studentCode}</textarea></div>
   <div class="modal-actions"><button class="btn" id="copyStudentCode">Kopieer leerlingcode</button></div>
   <div class="field" style="margin-top:18px"><label>Antwoordcode van docent</label><textarea id="manualAnswerIn" class="textarea" style="min-height:120px;font-family:monospace" placeholder="Plak hier de antwoordcode"></textarea></div>
   <div class="modal-actions"><button class="btn" data-close-modal>Sluiten</button><button class="btn primary" id="applyTeacherAnswer">Verbinden</button></div>`});
  $('#copyStudentCode')?.addEventListener('click',()=>copyFrom('#manualStudentCode'));
  $('#applyTeacherAnswer')?.addEventListener('click',async()=>{
   try{const value=$('#manualAnswerIn')?.value?.trim();if(!value)return toast('Plak eerst de antwoordcode','','warning');await pc.setRemoteDescription(decode(value));toast('Live verbinding actief','De docent kan nu het gekozen scherm zien.','success');closeModal()}catch(e){console.error(e);toast('Ongeldige antwoordcode','Controleer of je de volledige code hebt geplakt.','warning')}
  });
 }catch(e){console.error(e);toast('Schermdelen niet gestart','Je moet zelf een tabblad, venster of scherm kiezen.','warning')}
}

function openTeacherViewer(studentId){
 const student=store.get().students.find(s=>s.id===studentId);if(!student)return;
 const id=uid();const pc=new RTCPeerConnection(rtcConfig);sessions.set(id,{pc,role:'teacher'});
 pc.ontrack=event=>{const video=$('#manualTeacherVideo');if(video){video.srcObject=event.streams[0];$('#manualVideoWrap').hidden=false;$('#manualWaiting').hidden=true}};
 pc.onconnectionstatechange=()=>{if(pc.connectionState==='connected')toast('Live verbonden',`${student.name} deelt een scherm.`,'success')};
 openModal({title:`Live scherm · ${esc(student.name)}`,eyebrow:'Handmatige cross-device koppeling',html:`
   <div id="manualWaiting"><h3>1. Plak de leerlingcode</h3><p>Laat ${esc(student.name)} in de leerlingomgeving op <b>Deel scherm met docent</b> klikken. Daar verschijnt de leerlingcode.</p></div>
   <div class="field"><label>Leerlingcode</label><textarea id="manualOfferIn" class="textarea" style="min-height:120px;font-family:monospace" placeholder="Plak hier de leerlingcode"></textarea></div>
   <div class="modal-actions"><button class="btn primary" id="makeTeacherAnswer">Maak antwoordcode</button></div>
   <div class="field" style="margin-top:18px"><label>Antwoordcode voor leerling</label><textarea id="manualAnswerOut" class="textarea" style="min-height:120px;font-family:monospace" readonly placeholder="Verschijnt nadat de leerlingcode is verwerkt"></textarea></div>
   <div class="modal-actions"><button class="btn" id="copyTeacherAnswer">Kopieer antwoordcode</button></div>
   <div id="manualVideoWrap" class="v4-live-video" hidden style="margin-top:18px"><video id="manualTeacherVideo" autoplay playsinline style="width:100%;background:#111;border-radius:12px"></video><div class="v4-live-badge">LIVE</div></div>
   <div class="modal-actions"><button class="btn danger" id="stopManualLive">Stop sessie</button></div>`});
 $('#makeTeacherAnswer')?.addEventListener('click',async()=>{
  try{const value=$('#manualOfferIn')?.value?.trim();if(!value)return toast('Plak eerst de leerlingcode','','warning');await pc.setRemoteDescription(decode(value));const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await waitIce(pc);$('#manualAnswerOut').value=encode(pc.localDescription);toast('Antwoordcode klaar','Stuur deze terug naar de leerling.','success')}catch(e){console.error(e);toast('Ongeldige leerlingcode','Controleer of de volledige code is geplakt.','warning')}
 });
 $('#copyTeacherAnswer')?.addEventListener('click',()=>copyFrom('#manualAnswerOut'));
 $('#stopManualLive')?.addEventListener('click',()=>{closeSession(id);closeModal()});
}

document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-v4="student-share-now"],[data-v4="request-share"]');if(!button)return;
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 if(button.dataset.v4==='student-share-now')openStudentShare();else openTeacherViewer(button.dataset.studentId);
},true);
