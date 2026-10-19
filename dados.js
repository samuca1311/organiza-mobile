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

function seedData() {
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
      {id:'t4',name:'2º Informática',code:'52-1',courseId:'c1',students:20,shift:'Manhã',year:'2026',roomId:'r4'}
    ],
    people:[{id:'p1',name:'Carlos Pereira',subject:'Programação'},{id:'p2',name:'Ana Souza',subject:'Inglês'},{id:'p3',name:'Marcos Lima',subject:'Química'}],
    rooms:[{id:'r1',name:'C305',capacity:35},{id:'r2',name:'B104',capacity:35},{id:'r3',name:'A101',capacity:30},{id:'r4',name:'C311',capacity:35},{id:'r5',name:'C201',capacity:35},{id:'r6',name:'C306',capacity:40}],
    lessons: lessons,
    history:[],messages:[]
  };
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
      if (a.personId === b.personId) {
        reasons.push('professor em duas aulas');
      }
      if (a.roomId === b.roomId) {
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
