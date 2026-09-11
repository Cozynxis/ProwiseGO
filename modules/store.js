import {groups,locations,initialApps,initialTasks,initialStudents,notifications} from './data.js';
const KEY='go_teacher_portal_v3';
const clone=value=>JSON.parse(JSON.stringify(value));
const defaultFlexGroups=[
 {id:'fg1',name:'Verlengde instructie rekenen',color:'blue',members:['s1','s2','s3','s4','s5','s6']},
 {id:'fg2',name:'Plusgroep taal',color:'purple',members:['s7','s8','s9','s10','s11','s12']},
 {id:'fg3',name:'Leesmaatjes',color:'green',members:['s13','s14','s15','s16','s17','s18','s19','s20']}
];
const defaults={
 route:'day-start',portalMode:'teacher',activeStudentId:null,teacherName:'Levi Docent',groupId:'8A',locationId:'horizon',
 apps:clone(initialApps),tasks:clone(initialTasks),students:clone(initialStudents),folders:[],notifications:clone(notifications),flexGroups:clone(defaultFlexGroups),
 classMode:{active:false,traffic:'green',timerMinutes:15,timerRunning:false,scoreA:0,scoreB:0},
 settings:{compactTiles:false,showSubtitles:true,classLayout:'grid',animations:true},
 ui:{taskTab:'open',appSort:'custom',appQuery:'',taskQuery:'',libraryQuery:''}
};
function normalize(saved){
 const merged={...clone(defaults),...saved,settings:{...defaults.settings,...saved?.settings},ui:{...defaults.ui,...saved?.ui},classMode:{...defaults.classMode,...saved?.classMode}};
 if(!Array.isArray(merged.students)||!merged.students.length)merged.students=clone(initialStudents);
 if(!Array.isArray(merged.flexGroups)||!merged.flexGroups.length)merged.flexGroups=clone(defaultFlexGroups);
 if(merged.portalMode==='student'&&!merged.activeStudentId)merged.activeStudentId=merged.students[0]?.id||null;
 return merged;
}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return clone(defaults);return normalize(JSON.parse(raw))}catch{return clone(defaults)}}
let state=load();
const listeners=new Set();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const emit=()=>listeners.forEach(fn=>fn(state));
const commit=()=>{save();emit()};
export const store={
 get:()=>state,
 subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
 set(patch){state={...state,...patch};commit()},
 update(fn){state=normalize(fn(clone(state)));commit()},
 route(route){state.route=route;commit()},
 reset(){state=clone(defaults);commit()},
 group(){return groups.find(g=>g.id===state.groupId)||groups[0]},
 location(){return locations.find(l=>l.id===state.locationId)||locations[0]},
 activeStudent(){return state.students.find(s=>s.id===state.activeStudentId)||state.students[0]||null},
 setGroup(id){const group=groups.find(g=>g.id===id);if(!group)return;state.groupId=id;state.students=clone(initialStudents).slice(0,group.count);state.tasks=state.tasks.map(t=>({...t,group:id,total:group.count,submitted:Math.min(t.submitted,group.count)}));if(state.portalMode==='student')state.activeStudentId=state.students[0]?.id||null;commit()},
 setLocation(id){if(!locations.some(x=>x.id===id))return;state.locationId=id;commit()},
 enterStudent(id){const student=state.students.find(s=>s.id===id)||state.students[0];if(!student)return;state.portalMode='student';state.activeStudentId=student.id;state.route='student-home';state.students=state.students.map(s=>({...s,selected:false}));commit()},
 enterRandomStudent(){const pool=state.students.filter(s=>s.status!=='offline');const list=pool.length?pool:state.students;if(!list.length)return;const student=list[Math.floor(Math.random()*list.length)];state.portalMode='student';state.activeStudentId=student.id;state.route='student-home';state.students=state.students.map(s=>({...s,selected:false}));commit()},
 exitStudent(){state.portalMode='teacher';state.activeStudentId=null;state.route='classroom';commit()},
 addApp(app){state.apps.push(app);commit()},
 patchApp(id,patch){state.apps=state.apps.map(a=>a.id===id?{...a,...patch}:a);commit()},
 removeApp(id){state.apps=state.apps.filter(a=>a.id!==id);commit()},
 addTask(task){state.tasks.unshift(task);commit()},
 patchTask(id,patch){state.tasks=state.tasks.map(t=>t.id===id?{...t,...patch}:t);commit()},
 removeTask(id){state.tasks=state.tasks.filter(t=>t.id!==id);commit()},
 patchStudent(id,patch){state.students=state.students.map(s=>s.id===id?{...s,...patch}:s);commit()},
 patchSelected(patch){state.students=state.students.map(s=>s.selected?{...s,...patch}:s);commit()},
 selectAll(value=true){state.students=state.students.map(s=>s.status==='offline'?s:{...s,selected:value});commit()},
 clearSelection(){state.students=state.students.map(s=>({...s,selected:false}));commit()},
 classMode(patch){state.classMode={...state.classMode,...patch};commit()},
 setting(key,value){state.settings[key]=value;commit()},
 ui(key,value){state.ui[key]=value;commit()}
};
export const makeId=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;