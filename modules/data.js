export const groups=[
{id:'8A',name:'Groep 8A',short:'8A',count:24,location:'horizon'},
{id:'7B',name:'Groep 7B',short:'7B',count:22,location:'horizon'},
{id:'plus',name:'Plusgroep',short:'P+',count:12,location:'horizon'},
{id:'6A',name:'Groep 6A',short:'6A',count:25,location:'centrum'}
];
export const locations=[{id:'horizon',name:'De Horizon',sub:'Hoofdlocatie'},{id:'centrum',name:'Locatie Centrum',sub:'Dependance'},{id:'noord',name:'Locatie Noord',sub:'Dependance'}];
export const initialApps=[
{id:'presenter',name:'Prowise Presenter',subtitle:'Presenteren & whiteboard',initials:'P',color:'logo-blue',group:false,favorite:true,url:'#'},
{id:'learn',name:'Prowise Learn',subtitle:'Rekenen, taal & Engels',initials:'L',color:'logo-green',group:false,favorite:true,url:'#'},
{id:'drive',name:'Google Drive',subtitle:'Google Workspace',initials:'D',color:'logo-yellow',group:false,favorite:false,url:'https://drive.google.com'},
{id:'classroom',name:'Google Classroom',subtitle:'Google Workspace',initials:'C',color:'logo-green',group:false,favorite:false,url:'https://classroom.google.com'},
{id:'teams',name:'Microsoft Teams',subtitle:'Microsoft 365',initials:'T',color:'logo-purple',group:false,favorite:true,url:'https://teams.microsoft.com'},
{id:'word',name:'Word',subtitle:'Microsoft 365',initials:'W',color:'logo-blue',group:false,favorite:false,url:'https://www.office.com'},
{id:'youtube',name:'YouTube',subtitle:'Video',initials:'▶',color:'logo-red',group:false,favorite:false,url:'https://youtube.com'},
{id:'basispoort',name:'Basispoort',subtitle:'Leermiddelen',initials:'B',color:'logo-cyan',group:false,favorite:false,url:'#'},
{id:'rekenen',name:'Rekentuin',subtitle:'Oefenen',initials:'R',color:'logo-orange',group:true,favorite:false,url:'#'},
{id:'taal',name:'Taalzee',subtitle:'Oefenen',initials:'T',color:'logo-cyan',group:true,favorite:false,url:'#'},
{id:'nieuwsbegrip',name:'Nieuwsbegrip',subtitle:'Begrijpend lezen',initials:'N',color:'logo-blue',group:true,favorite:false,url:'#'},
{id:'squla',name:'Squla',subtitle:'Oefenplatform',initials:'S',color:'logo-purple',group:true,favorite:false,url:'#'}
];
export const libraryApps=[...initialApps,
{id:'canva',name:'Canva for Education',subtitle:'Ontwerpen',initials:'C',color:'logo-cyan',category:'Creatief'},
{id:'quizlet',name:'Quizlet',subtitle:'Leren & flashcards',initials:'Q',color:'logo-blue',category:'Oefenen'},
{id:'kahoot',name:'Kahoot!',subtitle:'Quizzen',initials:'K',color:'logo-purple',category:'Interactief'},
{id:'wikipedia',name:'Wikipedia',subtitle:'Naslagwerk',initials:'W',color:'logo-dark',category:'Informatie'},
{id:'maps',name:'Google Maps',subtitle:'Kaarten',initials:'M',color:'logo-green',category:'Informatie'},
{id:'forms',name:'Microsoft Forms',subtitle:'Formulieren',initials:'F',color:'logo-green',category:'Microsoft'},
{id:'sheets',name:'Google Spreadsheets',subtitle:'Spreadsheets',initials:'S',color:'logo-green',category:'Google'},
{id:'slides',name:'Google Presentaties',subtitle:'Presentaties',initials:'S',color:'logo-yellow',category:'Google'}
];
export const initialTasks=[
{id:'t1',title:'Werkblad breuken',summary:'Maak opdracht 1 t/m 12 en lever je antwoorden in.',description:'Oefen met gelijknamige en ongelijknamige breuken. Gebruik je schrift voor de tussenstappen.',status:'open',group:'8A',start:'2026-09-10',deadline:'2026-09-14',archive:'2026-10-01',submitted:15,total:24,feedback:true,notes:'Bespreek opdracht 8 klassikaal.',managers:['Levi Docent']},
{id:'t2',title:'Nieuwsbegrip week 37',summary:'Lees de tekst en beantwoord alle vragen.',description:'Werk zelfstandig. Kijk bij moeilijke woorden eerst in de woordenlijst.',status:'open',group:'8A',start:'2026-09-11',deadline:'2026-09-16',archive:'2026-10-03',submitted:7,total:24,feedback:false,notes:'',managers:['Levi Docent']},
{id:'t3',title:'Engels - vocabulary unit 2',summary:'Leer de woorden en maak de oefentoets.',description:'Gebruik Quizlet en noteer woorden die nog lastig zijn.',status:'future',group:'8A',start:'2026-09-17',deadline:'2026-09-22',archive:'2026-10-10',submitted:0,total:24,feedback:true,notes:'',managers:['Levi Docent']},
{id:'t4',title:'Rekensprint hoofdstuk 1',summary:'Afrondende opdracht hoofdstuk 1.',description:'Maak de rekensprint en klik op Klaar wanneer je alles hebt gecontroleerd.',status:'done',group:'8A',start:'2026-09-01',deadline:'2026-09-08',archive:'2026-09-20',submitted:24,total:24,feedback:true,notes:'Goede resultaten.',managers:['Levi Docent']}
];
const names=['Noah Jansen','Emma de Vries','Lucas Smit','Sophie Bakker','Daan Visser','Mila Meijer','Sem de Boer','Lotte Mulder','Finn Bos','Tess Vos','Bram Kuiper','Sara Dekker','Mees van Dijk','Nora Peters','Luuk Hendriks','Yara Jacobs','Jesse Vermeer','Fleur Willems','Sam Hoek','Evi Timmer','Max Martens','Lynn van Leeuwen','Thijs Scholten','Isa van den Berg'];
const sites=['Rekentuin - Oefenen','Nieuwsbegrip - Week 37','Google Classroom','Prowise Presenter','Taalzee - Werkwoorden','Google Drive'];
export const initialStudents=names.map((name,i)=>({id:`s${i+1}`,name,initials:name.split(' ').slice(0,2).map(x=>x[0]).join(''),status:i>20?'offline':i%7===0?'idle':'online',battery:Math.max(22,96-i*3),tab:sites[i%sites.length],url:['rekentuin.nl','nieuwsbegrip.nl','classroom.google.com','presenter.prowise.com','taalzee.nl','drive.google.com'][i%6],paused:false,locked:i%9===0,selected:false,lastSeen:i>20?'12 min geleden':'Nu'}));
export const notifications=[
{id:1,title:'Taak ingeleverd',text:'Noah Jansen heeft “Werkblad breuken” ingeleverd.',time:'2 min geleden',read:false},
{id:2,title:'Leerling vraagt hulp',text:'Mila Meijer vraagt aandacht in Klassenmanagement.',time:'6 min geleden',read:false},
{id:3,title:'Taak ingeleverd',text:'Bram Kuiper heeft “Nieuwsbegrip week 37” ingeleverd.',time:'14 min geleden',read:false},
{id:4,title:'Groepsapplicaties gewijzigd',text:'De applicaties van Groep 8A zijn bijgewerkt.',time:'Gisteren',read:true}
];
export const helpItems=[
{title:'Werken met applicatietegels',text:'Voeg tegels toe, wijzig de volgorde en groepeer applicaties in mappen.'},
{title:'Taken aanmaken',text:'Plan een taak, selecteer leerlingen, stel deadlines in en bekijk de voortgang.'},
{title:'Klassenmanagement',text:'Selecteer online leerlingen en simuleer pauzeren, weblinks, locken en live delen.'},
{title:'Groepen wisselen',text:'Gebruik links in de navigatie de groepswisselaar om een andere klas te openen.'}
];
