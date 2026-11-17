/* Organiza — JavaScript puro, sem dependências.
   Dados e sessão são locais. Não substitui autenticação em um servidor. */
const STORAGE_KEY = 'organiza-v1';
const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const paths = {
  settings:'m9 3 1-2h4l1 2 3 2 2 1 2 4-2 2v3l1 2-3 3-3-1-3 2-2-1-3-2-2 1-2-3 1-3-1-3 2-3Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  monitor:'M4 3h16a1 1 0 0 1 1 1v12H3V4a1 1 0 0 1 1-1M12 16v5m-5 0h10',
  book:'M4 3h14v18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 14h14',
  flask:'M9 2h6m-5 0v7L3 21h18L14 9V2M7 14h10',
  bolt:'m14 2-11 12h8l-1 8L22 9h-9Z',
  room:'m3 4 6-2 6 3 6-2v17l-6 2-6-3-6 2Zm6-2v17m6-14v17',
};
function icon(name) {
  const path = paths[name] || paths.book;
  return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}

function id() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
let storageAvailable = true;
let store;
try { store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { accounts:[], session:null }; }
catch { store = { accounts:[], session:null }; storageAvailable = false; }
if (!Array.isArray(store.accounts)) store = { accounts:[], session:null };
let account = store.accounts.find(a => a.id === store.session) || null;

function seedExamples() {
  // Cada dia recebe as mesmas aulas de exemplo.
  const lessons = [];
  const morningTimes = ['07:30', '08:20', '09:10', '10:10', '11:00'];
  const morningEnds = ['08:20', '09:10', '10:00', '11:00', '11:50'];

  for (let day = 0; day < days.length; day++) {
    for (let index = 0; index < morningTimes.length; index++) {
      let subject = 'Programação';
      let personId = 'p1';
      let roomId = 'r4';

      if (index >= 3) {
        subject = 'Inglês';
        personId = 'p2';
        roomId = 'r5';
      }

      lessons.push({
        id: id(), day: day, time: morningTimes[index], end: morningEnds[index],
        subject: subject, classId: 't4', personId: personId, roomId: roomId
      });
    }

    lessons.push({
      id: id(), day: day, time: '13:00', end: '13:50',
      subject: 'Programação', classId: 't1', personId: 'p1', roomId: 'r1'
    });

    // Na terça-feira, a sala compartilhada demonstra o alerta de conflito.
    let chemistryRoom = 'r2';
    if (day === 1) {
      chemistryRoom = 'r4';
    }
    lessons.push({
      id: id(), day: day, time: '07:30', end: '08:20',
      subject: 'Química', classId: 't2', personId: 'p3', roomId: chemistryRoom
    });
  }

  return {
    courses:[
      {id:'c1',name:'Informática',type:'Curso Técnico',icon:'monitor',color:'purple'},
      {id:'c2',name:'Química',type:'Curso Técnico',icon:'flask',color:'green'},
      {id:'c3',name:'Eletrotécnica',type:'Curso Técnico',icon:'bolt',color:'purple'},
      {id:'c4',name:'Mecânica',type:'Curso Técnico',icon:'settings',color:'brown'}
    ],
    classes:[
      {id:'t1',name:'2º Informática',code:'62-2',courseId:'c1',students:32,shift:'Tarde',year:'2026',roomId:'r1'},
      {id:'t2',name:'2º Química',code:'71-2',courseId:'c2',students:30,shift:'Manhã',year:'2026',roomId:'r2'},
      {id:'t3',name:'3º Eletrotécnica',code:'23-1',courseId:'c3',students:25,shift:'Manhã',year:'2026',roomId:'r3'},
      {id:'t4',name:'2º Informática',code:'62-1',courseId:'c1',students:20,shift:'Manhã',year:'2026',roomId:'r4'}
    ],
    people:[{id:'p1',name:'Carlos Pereira',subject:'Programação'},{id:'p2',name:'Ana Souza',subject:'Inglês'},{id:'p3',name:'Marcos Lima',subject:'Química'}],
    rooms:[{id:'r1',name:'C305',capacity:35},{id:'r2',name:'B104',capacity:35},{id:'r3',name:'A101',capacity:30},{id:'r4',name:'C311',capacity:35},{id:'r5',name:'C201',capacity:35},{id:'r6',name:'C306',capacity:40}],
    lessons: lessons,
    history:[],messages:[]
  };
}
// CIMOL 2026, grade de 26/10/2026. Cada linha corresponde a um dia (seg–sex).
// Cada posição é um período; null indica um período sem aula.
const informaticaSchedule = {
  '61-1': [
    ["Sistemas Operacionais|Prof. Informática","Sistemas Operacionais|Prof. Informática","Matemática|Clara","Química|Jeferson Marcelo","L.Estr. Inglês|Kassandra","Arquit. Org. Computadores|Helder","Arquit. Org. Computadores|Helder","Arquit. Org. Computadores|Helder","Biologia|Nubia","Biologia|Nubia"],
    ["Geografia|Rosiere","Literatura|Jeane","Escrita Criativa|Simone Reis","Matemática|Clara","Matemática|Clara","Programação para WEB I|Thomaz","Programação para WEB I|Thomaz","Língua Portuguesa|Jenifer","L.Estr. Espanhol|Gislaine","Sociologia|Fabiani"],
    ["Artes Integradas|Vagner","Filosofia|Rosiere","Física|Susana","Física|Susana","Educação Financeira|Douglas",null,null,null,null,null],
    ["Lógica de Programação|Cândido","Lógica de Programação|Cândido","Educação Física|Vivian","História|Camila Martins","História|Camila Martins",null,null,null,null,null],
    ["Projetos de Pesquisa|Jeferson W.","Projetos de Pesquisa|Jeferson W.","Química|Jeferson Marcelo","Língua Portuguesa|Jenifer","Língua Portuguesa|Jenifer",null,null,null,null,null],
  ],
  '61-2': [
    [null,null,null,null,null,"História|Camila Martins","História|Camila Martins","Literatura|Jeane","Matemática|Clara","Educação Financeira|Douglas"],
    ["Arquit. Org. Computadores|Helder","Arquit. Org. Computadores|Helder","Arquit. Org. Computadores|Helder","Lógica de Programação|Cândido","Lógica de Programação|Cândido","L.Estr. Espanhol|Gislaine","Geografia|Rosiere","Artes Integradas|Vagner","Sistemas Operacionais|Thomaz","Sistemas Operacionais|Thomaz"],
    [null,null,null,null,null,"Química|Jeferson Marcelo","Química|Jeferson Marcelo","Educação Física|Vivian","Biologia|Nubia","Biologia|Nubia"],
    [null,null,null,null,null,"Sociologia|Nicolas","Língua Portuguesa|Jenifer","Língua Portuguesa|Jenifer","Matemática|Clara","Matemática|Clara"],
    ["Física|Susana","Física|Susana","Projetos de Pesquisa|Jeferson W.","Projetos de Pesquisa|Jeferson W.","Filosofia|Rosiere","Escrita Criativa|Jenifer","Língua Portuguesa|Jenifer","Programação para WEB I|Thomaz","Programação para WEB I|Thomaz","L.Estr. Inglês|Kassandra"],
  ],
  '61-3': [
    ["Matemática|Clara","Matemática|Clara","Lógica de Programação|Cândido","Lógica de Programação|Cândido","L.Estr. Espanhol|Gislaine",null,null,null,null,null],
    ["Química|Gerson","Escrita Criativa|Simone Reis","Projetos de Pesquisa|Jeferson W.","Projetos de Pesquisa|Jeferson W.","Língua Portuguesa|Simone Reis",null,null,null,null,null],
    ["Arquit. Org. Computadores|Helder","Arquit. Org. Computadores|Helder","Arquit. Org. Computadores|Helder","Língua Portuguesa|Simone Reis","Língua Portuguesa|Simone Reis","Educação Física|Vivian","Biologia|Nubia","Biologia|Nubia","Geografia|Rosiere","Artes Integradas|Vagner"],
    ["L.Estr. Inglês|Kassandra","Educação Financeira|Douglas","Física|Susana","Matemática|Clara","Literatura|Jeane",null,null,null,null,null],
    ["Sociologia|Camila Martins","Filosofia|Rosiere","História|Camila Martins","História|Camila Martins","Física|Susana","Programação para WEB I|Thomaz","Programação para WEB I|Thomaz","Química|Gerson","Sistemas Operacionais|Prof. Informática","Sistemas Operacionais|Prof. Informática"],
  ],
  '62-1': [
    ["Língua Portuguesa|Sandro","Geografia|Rosiere","Sistemas Operacionais|Prof. Informática","Sistemas Operacionais|Prof. Informática","Sistemas Operacionais|Prof. Informática",null,null,null,null,null],
    ["Língua Portuguesa|Sandro","Língua Portuguesa|Sandro","Literatura|Jeane","Língua Espanhola|Gislaine","Matemática|Douglas",null,null,null,null,null],
    ["Projetos de Pesquisa|Jeferson W.","Projetos de Pesquisa|Jeferson W.","Educação Física|Vivian","Língua Inglesa|Simone Cristina","Língua Inglesa|Simone Cristina","Programação|Thomaz","Programação|Thomaz","Programação|Thomaz","Programação|Thomaz","Língua Portuguesa|Sandro"],
    ["Design Gráfico|Diego Candido","Design Gráfico|Diego Candido","Biologia|Nubia","Química|Jeferson Marcelo","Química|Jeferson Marcelo","Matemática|Douglas","Matemática|Douglas","Sociologia|Claudecir","Literatura|Jeane","Biologia|Nubia"],
    ["Criação de Sites|Helder","Criação de Sites|Helder","Criação de Sites|Helder","Manut. Microcomputadores|Helder","Manut. Microcomputadores|Helder","Ética|Luis Evaldo","Filosofia|Maria Augusta","Matemática|Douglas","Física|Luiz Fernando","Física|Luiz Fernando"],
  ],
  '62-2': [
    ["Projetos de Pesquisa|Jeferson W.","Projetos de Pesquisa|Jeferson W.","Geografia|Rosiere","Língua Portuguesa|Sandro","Língua Portuguesa|Sandro","Ética|Luis Evaldo","Filosofia|Maria Augusta","Biologia|Nubia","Química|Jeferson Marcelo","Química|Jeferson Marcelo"],
    ["Língua Espanhola|Gislaine","Matemática|Clara","Matemática|Clara","Língua Inglesa|Simone Cristina","Língua Portuguesa|Sandro",null,null,null,null,null],
    ["Programação|Prof. Informática","Programação|Prof. Informática","Programação|Prof. Informática","Programação|Prof. Informática","Matemática|Clara","Manut. Microcomputadores|Helder","Manut. Microcomputadores|Helder","Criação de Sites|Helder","Criação de Sites|Helder","Criação de Sites|Helder"],
    [null,null,null,null,null,"Matemática|Clara","Biologia|Nubia","Educação Física|Vivian","Física|Luiz Fernando","Física|Luiz Fernando"],
    ["Design Gráfico|Diego Candido","Design Gráfico|Diego Candido","Sociologia|Claudecir","Língua Inglesa|Simone Cristina","Língua Portuguesa|Sandro","Sistemas Operacionais|Prof. Informática","Sistemas Operacionais|Prof. Informática","Sistemas Operacionais|Prof. Informática","Literatura|Jenifer","Literatura|Jenifer"],
  ],
  '63-1': [
    ["Projetos de Pesquisa|Cândido","Projetos de Pesquisa|Cândido","Química|Jeferson Marcelo","Filosofia|Luis Evaldo","Língua Inglesa|Simone Cristina","Redes de Computadores|Eraí","Redes de Computadores|Eraí","Língua Inglesa|Simone Cristina","Língua Portuguesa|Carla","Língua Portuguesa|Carla"],
    [null,null,null,null,null,"Matemática|Leisle","História|Paulo","História|Paulo","Literatura|Simone Reis","Literatura|Simone Reis"],
    ["Programação|Rodrigo","Programação|Rodrigo","Programação|Rodrigo","Programação|Rodrigo","Química|Jeferson Marcelo","Modelagem Proj. B. Dados|Prof. Informática","Modelagem Proj. B. Dados|Prof. Informática","Modelagem Proj. B. Dados|Prof. Informática","Modelagem Proj. B. Dados|Prof. Informática","Educação Física|Vivian"],
    ["Matemática|Leisle","Matemática|Leisle","Criação de Sites|Cândido","Criação de Sites|Cândido","Criação de Sites|Cândido",null,null,null,null,null],
    ["Língua Portuguesa|Carla","Sociologia|Claudecir","Design Gráfico|Diego Candido","Design Gráfico|Diego Candido","Design Gráfico|Diego Candido","Empreendedorismo|Diego Candido","Biologia|Alberto","Biologia|Alberto","Física|Daniela","Física|Daniela"],
  ],
  '63-2': [
    ["Filosofia|Luis Evaldo","Programação|Rodrigo","Programação|Rodrigo","Programação|Rodrigo","Programação|Rodrigo","História|Paulo","Química|Jeferson Marcelo","Química|Jeferson Marcelo","Redes de Computadores|Eraí","Redes de Computadores|Eraí"],
    ["Criação de Sites|Cândido","Criação de Sites|Cândido","Criação de Sites|Cândido","Literatura|Jeane","Língua Inglesa|Simone Cristina","Projetos de Pesquisa|Cândido","Projetos de Pesquisa|Cândido","Sociologia|Claudecir","Matemática|Leisle","Matemática|Leisle"],
    ["Língua Inglesa|Simone Cristina","Física|Daniela","Língua Portuguesa|Carla","Língua Portuguesa|Carla","Língua Portuguesa|Carla",null,null,null,null,null],
    ["Literatura|Jeane","Educação Física|Vivian","Matemática|Leisle","Biologia|Alberto","Biologia|Alberto","História|Paulo","Modelagem Proj. B. Dados|Cândido","Modelagem Proj. B. Dados|Cândido","Modelagem Proj. B. Dados|Cândido","Modelagem Proj. B. Dados|Cândido"],
    [null,null,null,null,null,"Física|Daniela","Empreendedorismo|Diego Candido","Design Gráfico|Diego Candido","Design Gráfico|Diego Candido","Design Gráfico|Diego Candido"],
  ],
};
const informaticaPeriods = [
  ['07:30', '08:20'], ['08:20', '09:10'], ['09:10', '10:00'],
  ['10:10', '11:00'], ['11:00', '11:50'], ['13:00', '13:50'],
  ['13:50', '14:40'], ['14:40', '15:30'], ['15:40', '16:30'], ['16:30', '17:20']
];

function applyInformaticaSchedule(data, baseline = seedExamples()) {
  if (data.informaticaScheduleVersion === 1) return false;
  const course = data.courses.find(item => item.name.trim().toLowerCase() === 'informática');
  if (!course) return false;

  const legacyClasses = baseline.classes.filter(item => item.courseId === 'c1');
  const legacySlots = ['classId', 'day', 'time', 'end', 'subject', 'personId', 'roomId'];
  const sampleLessons = baseline.lessons.filter(lesson => legacyClasses.some(item => item.id === lesson.classId));
  data.lessons = data.lessons.filter(lesson => !sampleLessons.some(sample =>
    legacySlots.every(key => lesson[key] === sample[key])
  ));

  const teachers = new Map();
  for (const [code, week] of Object.entries(informaticaSchedule)) {
    const legacy = legacyClasses.find(item => item.code === code);
    let turma = data.classes.find(item => item.courseId === course.id && item.code === code);
    if (!turma && legacy) {
      turma = data.classes.find(item => item.id === legacy.id && item.courseId === course.id &&
        item.code === '52-1' && item.name === legacy.name && code === '62-1');
    }
    if (!turma) {
      if (data.classes.some(item => item.code === code)) continue;
      turma = {id: 'info-' + code, name: code[1] + 'º Informática', code, courseId: course.id,
        students: null, shift: 'Manhã e tarde', year: '2026', roomId: ''};
      data.classes.push(turma);
    } else if (legacy && turma.id === legacy.id) {
      turma.code = code;
      if (turma.shift === legacy.shift) turma.shift = 'Manhã e tarde';
      if (turma.roomId === legacy.roomId) turma.roomId = '';
      if (turma.students === legacy.students) turma.students = null;
    }

    const occupied = new Set(data.lessons.filter(lesson => lesson.classId === turma.id)
      .map(lesson => lesson.day + ':' + lesson.time));
    week.forEach((periods, day) => periods.forEach((entry, period) => {
      if (!entry) return;
      const [time, end] = informaticaPeriods[period];
      if (occupied.has(day + ':' + time)) return;
      const [subject, teacher] = entry.split('|');
      const personId = 'info-docente-' + teacher;
      if (!teachers.has(personId)) teachers.set(personId, {name: teacher, subjects: new Set()});
      teachers.get(personId).subjects.add(subject);
      data.lessons.push({id: `info-${code}-${day}-${period}`, classId: turma.id, day, time, end,
        subject, personId, roomId: ''});
    }));
  }

  for (const [id, teacher] of teachers) {
    data.people.push({id, name: teacher.name, subject: [...teacher.subjects].join(', ')});
  }
  data.informaticaScheduleVersion = 1;
  return true;
}

function seedData() {
  const data = seedExamples();
  applyInformaticaSchedule(data, data);
  return data;
}

function data() {
  return account.data;
}

function isManager() {
  return account?.role === 'Gestor';
}

function find(type, value) {
  return data()[type].find(function (item) {
    return item.id === value;
  });
}

function nameOf(type, value) {
  const item = find(type, value);
  if (item && item.name) {
    return item.name;
  }
  return 'Não definido';
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(store)); storageAvailable = true; return true; }
  catch { storageAvailable = false; toast('Não foi possível salvar. Verifique o espaço e as permissões do navegador.'); return false; }
}

function conflicts() {
  const found = [];
  const lessons = data().lessons;

  // Compara cada par de aulas uma única vez.
  for (let index = 0; index < lessons.length; index++) {
    const a = lessons[index];
    for (let nextIndex = index + 1; nextIndex < lessons.length; nextIndex++) {
      const b = lessons[nextIndex];
      if (a.day !== b.day || a.time >= b.end || b.time >= a.end) {
        continue;
      }

      const reasons = [];
      if (a.classId === b.classId) {
        reasons.push('turma em duas aulas');
      }
      if (a.personId && a.personId !== 'info-docente-Prof. Informática' && a.personId === b.personId) {
        reasons.push('professor em duas aulas');
      }
      if (a.roomId && a.roomId === b.roomId) {
        reasons.push('sala compartilhada');
      }
      if (reasons.length > 0) {
        found.push({a: a, b: b, reasons: reasons});
      }
    }
  }
  return found;
}

async function passwordHash(password,salt) {
  const bytes = new TextEncoder().encode(salt+password);
  const digest = await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
