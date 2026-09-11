export const daySchedule=[
{id:'d1',time:'08:30',end:'08:45',title:'Dagstart & inloop',subject:'Start',type:'start',note:'Chromebooks openen en planning bekijken.'},
{id:'d2',time:'08:45',end:'09:30',title:'Rekenen',subject:'Rekenen',type:'lesson',note:'Breuken - instructie en zelfstandig werken.'},
{id:'d3',time:'09:30',end:'10:15',title:'Taal',subject:'Taal',type:'lesson',note:'Werkwoordspelling en verlengde instructie.'},
{id:'d4',time:'10:15',end:'10:30',title:'Pauze',subject:'Pauze',type:'break',note:'Buitenpauze.'},
{id:'d5',time:'10:30',end:'11:15',title:'Nieuwsbegrip',subject:'Lezen',type:'lesson',note:'Weektekst gezamenlijk starten.'},
{id:'d6',time:'11:15',end:'12:00',title:'Wereldoriëntatie',subject:'WO',type:'lesson',note:'Topografie Nederland.'},
{id:'d7',time:'12:00',end:'13:00',title:'Lunch & buitenspelen',subject:'Pauze',type:'break',note:'Lunch in de klas, daarna buiten.'},
{id:'d8',time:'13:00',end:'13:45',title:'Engels',subject:'Engels',type:'lesson',note:'Vocabulary unit 2.'},
{id:'d9',time:'13:45',end:'14:15',title:'Zelfstandig werken',subject:'Werkblok',type:'work',note:'Open taken afronden.'}
];

export const lessonPlans=[
{id:'l1',title:'Breuken vergelijken',subject:'Rekenen',duration:45,group:'8A',status:'ready',goal:'Ik kan breuken met verschillende noemers vergelijken.',materials:['Presenter les','Werkblad breuken','Rekentuin'],steps:['Voorkennis activeren','Korte instructie','Samen oefenen','Zelfstandig verwerken','Exit-vraag']},
{id:'l2',title:'Persoonsvorm en onderwerp',subject:'Taal',duration:45,group:'8A',status:'draft',goal:'Ik herken de persoonsvorm en het onderwerp in een zin.',materials:['Digibord','Taalzee'],steps:['Startopdracht','Modelen','Duo-opdracht','Zelfstandig oefenen']},
{id:'l3',title:'Nieuwsbegrip week 37',subject:'Lezen',duration:45,group:'8A',status:'ready',goal:'Ik kan hoofd- en bijzaken uit een tekst halen.',materials:['Nieuwsbegrip','Markeerstiften'],steps:['Voorspellen','Tekst lezen','Vragen maken','Nabespreken']}
];

export const quickTools=[
{id:'timer',name:'Timer',description:'Start een klas-timer voor zelfstandig werk.',icon:'⏱'},
{id:'traffic',name:'Geluidslicht',description:'Zet de klasstatus op stil, fluisteren of overleggen.',icon:'🚦'},
{id:'random',name:'Naamkiezer',description:'Kies willekeurig een leerling uit de actieve groep.',icon:'🎲'},
{id:'groups',name:'Groepjesmaker',description:'Verdeel leerlingen automatisch in groepjes.',icon:'👥'},
{id:'score',name:'Scorebord',description:'Houd teamscores bij tijdens een quiz of spel.',icon:'🏆'},
{id:'birthday',name:'Verjaardagen',description:'Bekijk verjaardagen van deze maand.',icon:'🎂'}
];

export const studentMessages=[
{id:'m1',title:'Welkom in groep 8A',text:'Vandaag starten we met rekenen. Kijk daarna bij je open taken.',time:'08:20',teacher:'Levi Docent'},
{id:'m2',title:'Gymspullen',text:'Denk morgen aan je gymschoenen.',time:'Gisteren',teacher:'Levi Docent'}
];

export const birthdays=[
{name:'Tess Vos',date:'14 september'},
{name:'Jesse Vermeer',date:'21 september'},
{name:'Nora Peters',date:'29 september'}
];

export const learningSignals=['Zelfstandig aan het werk','Vraagt extra instructie','Taak ingeleverd','Hulpvraag actief','Vandaag afwezig'];