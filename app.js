/* Organiza — JavaScript puro, sem dependências.
   Dados e sessão são locais. Não substitui autenticação em um servidor. */
const STORAGE_KEY = 'organiza-v1';
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const paths = {
  calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M7 14h3m4 0h3m-10 4h3',
  home:'m3 10 9-7 9 7v11h-7v-8h-4v8H3Z',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  list:'M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1',
  settings:'m9 3 1-2h4l1 2 3 2 2 1 2 4-2 2v3l1 2-3 3-3-1-3 2-2-1-3-2-2 1-2-3 1-3-1-3 2-3Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M2 21v-3a6 6 0 0 1 12 0v3m3-17a4 4 0 0 1 0 7m1 4a5 5 0 0 1 4 5v1',
  user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  monitor:'M4 3h16a1 1 0 0 1 1 1v12H3V4a1 1 0 0 1 1-1M12 16v5m-5 0h10',
  book:'M4 3h14v18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 14h14',
  flask:'M9 2h6m-5 0v7L3 21h18L14 9V2M7 14h10',
  bolt:'m14 2-11 12h8l-1 8L22 9h-9Z',
  clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 3',
  room:'m3 4 6-2 6 3 6-2v17l-6 2-6-3-6 2Zm6-2v17m6-14v17',
  eye:'M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  ai:'M12 3v3m-2-3h4M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2M8 13h.01M16 13h.01m-8 4h8',
  spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  edit:'m15 3 6 6M3 21l5-1L21 7l-5-5L3 15Z',
  trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  plus:'M12 4v16M4 12h16',
  close:'m6 6 12 12M6 18 18 6',
  arrow:'M4 12h16m-6-6 6 6-6 6',
  search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-2 4 7 7',
  phone:'M5 2 2 5c0 9 8 17 17 17l3-3-6-4-3 3-7-7 3-3Z',
  check:'m5 12 4 4L19 6',
  logout:'M9 3H3v18h6m5-15 6 6-6 6M7 12h13',
  download:'M12 2v13m-5-5 5 5 5-5M3 17v5h18v-5',
  shield:'m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6Zm-5 10 3 3 7-7'
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${paths[name] || paths.book}"/></svg>`;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let storageAvailable = true;
let store;
try { store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { accounts:[], session:null }; }
catch { store = { accounts:[], session:null }; storageAvailable = false; }
if (!Array.isArray(store.accounts)) store = { accounts:[], session:null };
let account = store.accounts.find(a => a.id === store.session) || null;
let page = account?.role ? 'home' : account ? 'profiles' : 'login';
let selectedDay = 1;
let signup = false;
let query = '';
let courseFilter = '';
let shiftFilter = '';
let toastTimer;

function seedData() {
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
    lessons:days.flatMap((_,day) => [
      ...['07:30','08:20','09:10'].map(time=>({id:id(),day,time,end:time==='07:30'?'08:20':time==='08:20'?'09:10':'10:00',subject:'Programação',classId:'t4',personId:'p1',roomId:'r4'})),
      ...['10:10','11:00'].map(time=>({id:id(),day,time,end:time==='10:10'?'11:00':'11:50',subject:'Inglês',classId:'t4',personId:'p2',roomId:'r5'})),
      {id:id(),day,time:'13:00',end:'13:50',subject:'Programação',classId:'t1',personId:'p1',roomId:'r1'},
      {id:id(),day,time:'07:30',end:'08:20',subject:'Química',classId:'t2',personId:'p3',roomId:day===1?'r4':'r2'}
    ]),
    history:[],messages:[]
  };
}
const data = () => account.data;
const isManager = () => account?.role === 'Gestor';
const find = (type, value) => data()[type].find(item => item.id === value);
const nameOf = (type,value) => find(type,value)?.name || 'Não definido';

function persist() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(store)); storageAvailable = true; return true; }
  catch { storageAvailable = false; toast('Não foi possível salvar. Verifique o espaço e as permissões do navegador.'); return false; }
}
function changed(message) {
  data().history.unshift({id:id(),text:message,date:new Date().toISOString()});
  data().history = data().history.slice(0,100);
  const saved = persist();
  render();
  if(saved) toast('Alterações salvas neste navegador.');
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove('visible'),4000);
}
function brand() {
  // Para usar sua logo, coloque o arquivo em assets e altere LOGO_URL abaixo.
  const LOGO_URL = ''; // Ex.: 'assets/logo.png'
  return `<div class="brand">${LOGO_URL ? `<img class="brand-image" src="${LOGO_URL}" alt="Organiza">` : `<span class="brand-mark">${icon('calendar')}</span><span>Organiza</span>`}</div>`;
}
function shell(title,subtitle,body,extra='') {
  const links = isManager() ? [['home','home','Início'],['courses','list','Cursos'],['schedule','calendar','Horários'],['ai','ai','Assistente'],['settings','settings','Ajustes']] : [['home','home','Início'],['schedule','calendar','Horários'],['notices','list','Avisos'],['settings','settings','Ajustes']];
  app.innerHTML = `<header class="topbar"><div class="brand-row">${brand()}<button class="icon-button" data-page="notices" aria-label="Ver notificações">${icon('bell')}${conflicts().length?'<span class="notification-dot"></span>':''}</button></div><h1>${escapeHTML(title)}</h1><p class="subtitle">${escapeHTML(subtitle)}</p></header><main class="content ${extra}">${body}</main><nav class="bottom-nav" aria-label="Navegação principal">${links.map(([target,img,label])=>`<button class="nav-item ${(page===target || target==='courses'&&['classes','people','rooms'].includes(page))?'active':''}" data-page="${target}" ${page===target?'aria-current="page"':''}>${icon(img)}<span>${label}</span></button>`).join('')}</nav>`;
}
function render() {
  if(!account) { renderLogin(); return; }
  if(page==='profiles' || !account.role) { renderProfiles(); return; }
  const pages = {home:renderHome,schedule:renderSchedule,courses:()=>renderEntities('courses'),classes:()=>renderEntities('classes'),people:()=>renderEntities('people'),rooms:()=>renderEntities('rooms'),settings:renderSettings,notices:renderNotices,ai:renderAI,chat:renderChat};
  (pages[page] || renderHome)();
}
function navigate(target) { page=target;query='';courseFilter='';shiftFilter='';render();window.scrollTo(0,0); }
function renderLogin() {
  app.innerHTML = `<main class="auth">${brand()}<section class="auth-card"><h1>${signup?'Criar conta':'Login'}</h1><p class="muted">${signup?'Comece a organizar sua rotina.':'Sua rotina, no horário certo.'}</p><form id="auth-form">${signup?'<label>Nome<input name="name" autocomplete="name" placeholder="Como podemos te chamar?" maxlength="60" required></label>':''}<label>E-mail<input type="email" name="email" autocomplete="username" placeholder="voce@exemplo.com" maxlength="120" required></label><label>Senha<input type="password" name="password" autocomplete="${signup?'new-password':'current-password'}" placeholder="${signup?'Pelo menos 6 caracteres':'Digite sua senha'}" minlength="6" maxlength="128" required></label><p id="auth-error" class="form-error" role="alert"></p><button class="primary full" type="submit">${signup?'Criar minha conta':'Entrar'}</button></form><button class="auth-switch" data-action="toggle-auth">${signup?'Já tenho uma conta':'Primeiro acesso? Criar conta'}</button><div class="divider">ou</div><button class="social" data-action="integration" data-name="Google"><span class="social-placeholder" id="google-icon">G</span>Entrar com Google</button><button class="social" data-action="integration" data-name="telefone">${icon('phone')}Entrar com telefone</button><button class="auth-switch" data-action="demo">Explorar demonstração</button></section><p class="auth-foot">Protótipo local • seus dados ficam neste navegador.<br>Use uma senha de teste, sem dados sensíveis.</p></main>`;
}
function renderProfiles() {
  app.innerHTML = `<main class="profile-screen"><header class="profile-header">${brand()}</header><section class="profile-panel"><h1>Selecione seu Perfil</h1><p class="muted">Um espaço para cada parte da sua rotina.</p>${[['Participante','users','Visualize suas aulas e acompanhe os avisos.'],['Gestor','users','Gerencie horários, cursos e turmas.'],['Colaborador','user','Consulte horários e informações das aulas.']].map(([role,img,description])=>`<article class="card profile-choice"><div class="row"><div class="avatar">${icon(img)}</div><div><h2>${role}</h2><p>${description}</p></div></div><button class="primary" data-role="${role}">Entrar como ${role.toLowerCase()} ${icon('arrow')}</button></article>`).join('')}<p class="profile-footer">Você pode trocar seu perfil nos ajustes.</p></section></main>`;
}
async function passwordHash(password,salt) {
  const bytes = new TextEncoder().encode(salt+password);
  const digest = await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
async function authenticate(form) {
  const values = Object.fromEntries(new FormData(form));
  const email = values.email.trim().toLowerCase();
  const error = document.querySelector('#auth-error');
  const button = form.querySelector('button'); button.disabled=true;
  try {
    let user = store.accounts.find(a=>a.email===email);
    if(signup) {
      if(user) throw new Error('Este e-mail já tem uma conta neste navegador. Faça login.');
      if(!values.name.trim()) throw new Error('Digite seu nome.');
      const salt=id();
      user={id:id(),name:values.name.trim(),email,salt,hash:await passwordHash(values.password,salt),role:null,classId:'t4',data:seedData()};
      store.accounts.push(user);
    } else if(!user || !user.hash || await passwordHash(values.password,user.salt)!==user.hash) {
      throw new Error('E-mail ou senha incorretos. No primeiro acesso, crie uma conta.');
    }
    account=user;store.session=user.id;persist();page=user.role?'home':'profiles';render();
  } catch(err) { error.textContent = err.message; button.disabled=false; }
}
function demo() {
  account=store.accounts.find(a=>a.demo);
  if(!account) { account={id:id(),name:'João',email:'',demo:true,role:null,classId:'t4',data:seedData()};store.accounts.push(account); }
  store.session=account.id;persist();page='profiles';render();
}
function lessonsForDay(day=selectedDay) {
  return data().lessons.filter(l=>l.day===day && l.classId===account.classId).sort((a,b)=>a.time.localeCompare(b.time));
}
function assistantCard() {return `<section class="card assistant-card"><h3>Gerar automaticamente ✧</h3><button class="prompt-link" data-page="chat"><span>O que deseja alterar?</span>${icon('arrow')}</button></section>`;}
function alertCard() {const count=conflicts().length;return `<section class="card notice"><h3>Alertas <span style="color:#a87600">⚠</span></h3><p>${count?`<span class="alert-count">${count}</span> ${count===1?'conflito encontrado':'conflitos encontrados'} nos horários.`:'Tudo certo! Nenhum conflito nos horários.'}</p><button class="link-button" data-page="notices">Conferir avisos →</button></section>`;}
function renderHome() {
  if(isManager()) {
    const metrics=[['courses','book','green','Cursos',data().courses.length,'cadastrados'],['classes','users','pink','Turmas',data().classes.length,'ativas'],['people','user','yellow','Colaboradores',data().people.length,'cadastrados'],['rooms','room','brown','Salas',data().rooms.length,'disponíveis'],['schedule','clock','blue','Horários',data().lessons.length,'aulas'],['notices','eye','lime','Alterações',data().history.length,'atualizações']];
    shell(`Olá, ${account.name.split(' ')[0]}! 👋`,'Bem-vindo ao painel de gestão.',`<div class="section-title"><h2>Resumo geral</h2><span class="badge">Gestor</span></div><div class="metrics">${metrics.map(([target,img,color,label,count,unit])=>`<button class="metric ${color}" data-page="${target}">${icon(img)}<span>${label}</span><small><b>${count}</b> ${unit}</small></button>`).join('')}</div>${assistantCard()}${alertCard()}<p class="save-note">${icon('check').replace('<svg','<svg style="width:12px;height:12px;vertical-align:middle"')} Salvamento automático neste navegador</p>`);
  } else {
    const today = new Date(); const weekday=today.getDay(); const day=weekday>=1&&weekday<=5?weekday-1:0;
    const list=lessonsForDay(day);const now=today.toTimeString().slice(0,5);const next=list.find(l=>weekday>=1&&weekday<=5?l.end>now:true);
    const title=weekday===0||weekday===6?'Próxima segunda-feira':'Aulas de hoje';
    shell(`Olá, ${account.name.split(' ')[0]}! 👋`,'Bem-vindo ao seu painel de horários.',`<p class="date-line">${escapeHTML(today.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}))}</p><section class="card next-card"><p class="eyebrow">» ${next?'Próxima aula':'Dia concluído'}</p><h2>${escapeHTML(next?.subject || 'Tudo em dia!')}</h2>${next?`<div class="detail-bar">${icon('clock')} Horário: ${next.time} – ${next.end}</div><div class="detail-bar">${icon('user')} Professor: ${escapeHTML(nameOf('people',next.personId))}</div><div class="detail-bar">${icon('room')} Sala: ${escapeHTML(nameOf('rooms',next.roomId))}</div>`:'<p class="muted">Confira as próximas aulas em Meus Horários.</p>'}</section><div class="section-title"><h2>${title}</h2><span class="badge">${list.length} aulas</span></div><section class="card">${list.length?list.map(l=>`<div class="lesson-row"><span>${icon('clock')}${escapeHTML(l.subject)}</span><b>${l.time}</b></div>`).join(''):'<p class="muted">Nenhuma aula cadastrada para esta turma.</p>'}<button class="link-button" data-page="schedule">Conferir completo →</button></section><div class="section-title"><h2>Avisos</h2></div>${alertCard()}`);
  }
}
function classOptions(value) { return data().classes.map(c=>`<option value="${c.id}" ${c.id===value?'selected':''}>${escapeHTML(c.name)} · ${escapeHTML(c.code)}</option>`).join(''); }
function renderSchedule() {
  const list=lessonsForDay();
  shell(isManager()?'Horários':'Meus Horários','Uma rotina organizada começa aqui.',`<label style="margin-bottom:18px">Turma<select id="schedule-class">${classOptions(account.classId)}</select></label><div class="weekdays" role="group" aria-label="Dia da semana">${days.map((day,index)=>`<button class="day ${index===selectedDay?'active':''}" data-day="${index}" aria-pressed="${index===selectedDay}">${day}</button>`).join('')}</div><div class="list-heading"><span>${dayNames[selectedDay]} · ${list.length} aulas</span>${isManager()?'<button class="secondary" data-edit="lessons">+ Nova aula</button>':''}</div><div class="stack">${list.length?list.map(l=>`<article class="card lesson-card"><div class="row"><div class="avatar ${l.subject==='Inglês'?'green':''}">${icon(l.subject==='Inglês'?'book':'monitor')}</div><div class="grow"><h3>${escapeHTML(l.subject)}</h3><p class="lesson-time">${l.time}</p></div><button class="text-action" data-detail="${l.id}">Ver mais →</button></div><div class="lesson-meta"><span>Até ${l.end}</span><span>Sala: ${escapeHTML(nameOf('rooms',l.roomId))}</span></div>${isManager()?entityActions('lessons',l.id):''}</article>`).join(''):empty('Dia livre','Nenhuma aula cadastrada para esta turma.')}</div>`);
}
const entityLabels={courses:['Cursos','Conheça os cursos cadastrados.','Curso'],classes:['Turmas','Gerencie todas as turmas cadastradas.','Turma'],people:['Colaboradores','Quem faz parte da sua rotina.','Colaborador'],rooms:['Salas','Espaços prontos para aprender.','Sala']};
function empty(title,description) {return `<div class="empty">${icon('calendar')}<strong>${title}</strong>${description}</div>`;}
function entityActions(type,itemId) { return `<div class="entity-actions"><button class="edit-button" data-edit="${type}" data-id="${itemId}" aria-label="Editar ${entityLabels[type]?.[2]?.toLowerCase() || 'aula'}">${icon('edit')}</button><button class="edit-button delete" data-delete="${type}" data-id="${itemId}" aria-label="Excluir ${entityLabels[type]?.[2]?.toLowerCase() || 'aula'}">${icon('trash')}</button></div>`; }
function entityList(type) {
  const items=data()[type].filter(item=>(`${item.name} ${item.code||''}`.toLowerCase().includes(query.toLowerCase()))&&(!courseFilter||item.courseId===courseFilter)&&(!shiftFilter||item.shift===shiftFilter));
  if(!items.length) return empty('Nada por aqui','Tente outra busca ou adicione um cadastro.');
  return items.map(item=>{
    const course = type==='classes'?find('courses',item.courseId):item;
    let details='';
    if(type==='courses') { const classes=data().classes.filter(t=>t.courseId===item.id);details=`${escapeHTML(item.type)}<br>${classes.length} turmas · ${classes.reduce((sum,t)=>sum+Number(t.students),0)} alunos`; }
    if(type==='classes') details=`${escapeHTML(item.code)} | Participantes: <b>${item.students}</b><br>Turno ${escapeHTML(item.shift)} | Sala principal: ${escapeHTML(nameOf('rooms',item.roomId))}`;
    if(type==='people') details=`${escapeHTML(item.subject)}<br>${data().lessons.filter(l=>l.personId===item.id).length} aulas na semana`;
    if(type==='rooms') details=`Capacidade: ${item.capacity} pessoas<br>${data().lessons.filter(l=>l.roomId===item.id).length} aulas na semana`;
    return `<article class="card entity-card"><div class="row"><div class="avatar ${course?.color || 'green'}">${icon(type==='people'?'user':type==='rooms'?'room':course?.icon||'book')}</div><div class="grow"><h3>${escapeHTML(item.name)}</h3><p class="entity-meta">${details}</p></div>${type==='courses'?`<button class="icon-button" data-course="${item.id}" aria-label="Ver turmas de ${escapeHTML(item.name)}">${icon('arrow')}</button>`:''}</div>${entityActions(type,item.id)}</article>`;
  }).join('');
}
function renderEntities(type) {
  if(!isManager()) {page='home';renderHome();return;}
  const [title,subtitle,singular]=entityLabels[type];
  shell(title,subtitle,`<div class="toolbar"><div class="search">${icon('search')}<input id="search" data-type="${type}" type="search" aria-label="Procurar ${title.toLowerCase()}" placeholder="Procurar ${title.toLowerCase()}…" value="${escapeHTML(query)}"></div><button class="secondary" data-edit="${type}">+ ${['Turma','Sala'].includes(singular)?'Nova':'Novo'} ${singular}</button></div>${type==='classes'?`<div class="filters"><select id="filter-course" aria-label="Filtrar por curso"><option value="">Todos os cursos</option>${data().courses.map(c=>`<option value="${c.id}" ${c.id===courseFilter?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select><select id="filter-shift" aria-label="Filtrar por turno"><option value="">Todos os turnos</option>${['Manhã','Tarde','Noite'].map(s=>`<option ${s===shiftFilter?'selected':''}>${s}</option>`).join('')}</select></div>`:''}<div id="entity-list" class="stack">${entityList(type)}</div>`);
}
function conflicts() {
  const found=[]; const lessons=data().lessons;
  lessons.forEach((a,index)=>lessons.slice(index+1).forEach(b=>{
    if(a.day!==b.day || a.time>=b.end || b.time>=a.end) return;
    const reasons=[];
    if(a.classId===b.classId) reasons.push('turma em duas aulas');
    if(a.personId===b.personId) reasons.push('professor em duas aulas');
    if(a.roomId===b.roomId) reasons.push('sala compartilhada');
    if(reasons.length) found.push({a,b,reasons});
  })); return found;
}
function renderNotices() {
  const items=conflicts();
  shell('Avisos e alterações','Acompanhe o que mudou na sua rotina.',`<div class="section-title"><h2>Alertas de horários</h2><span class="badge">${items.length}</span></div><div class="stack">${items.length?items.map(({a,b,reasons})=>`<article class="card alert-card"><h3>Conflito · ${days[a.day]}, ${a.time}</h3><p>${escapeHTML(nameOf('classes',a.classId))} (${escapeHTML(find('classes',a.classId)?.code)}) e ${escapeHTML(nameOf('classes',b.classId))} (${escapeHTML(find('classes',b.classId)?.code)})<br><b>${escapeHTML(reasons.join(' e '))}</b>.</p>${isManager()?`<button class="secondary full" data-edit="lessons" data-id="${b.id}">Revisar aula</button>`:''}</article>`).join(''):empty('Tudo em ordem','Nenhum conflito de sala, professor ou turma.')}</div><div class="section-title"><h2>Últimas alterações</h2></div><div class="stack">${data().history.length?data().history.slice(0,20).map(h=>`<article class="card"><p style="font-size:13px;line-height:1.6">${escapeHTML(h.text)}</p><p class="tiny muted" style="margin-top:7px">${new Date(h.date).toLocaleString('pt-BR')}</p></article>`).join(''):empty('Tudo atualizado','As próximas alterações aparecerão aqui.')}</div>`);
}
function renderSettings() {
  shell('Configurações','Deixe o Organiza do seu jeito.',`<section class="card"><div class="row" style="margin-bottom:22px"><div class="avatar">${icon('user')}</div><div><h2>${escapeHTML(account.name)}</h2><span class="badge" style="margin-top:7px">${escapeHTML(account.role)}</span></div></div><form id="settings-form" class="settings-form"><label>Seu nome<input name="name" value="${escapeHTML(account.name)}" maxlength="60" required></label><label>E-mail<input value="${escapeHTML(account.email||'Conta de demonstração')}" disabled></label><label>Turma para acompanhar<select name="classId">${classOptions(account.classId)}</select></label><button class="primary" type="submit">Salvar perfil ${icon('check')}</button></form></section><div class="settings-group"><button class="setting-button" data-page="profiles">${icon('users')}Trocar perfil</button><button class="setting-button" data-action="export">${icon('download')}Exportar meus dados (JSON)</button><button class="setting-button" data-action="about">${icon('shield')}Sobre o salvamento</button><button class="setting-button" data-action="logout">${icon('logout')}Sair da conta</button></div><p class="save-note">${storageAvailable?'Seus dados estão salvos neste navegador.':'O armazenamento local está indisponível.'}</p><p class="tiny muted" style="text-align:center;margin-top:17px">Organiza • versão 1.0<br>Feito para uma rotina mais leve.</p>`);
}
function showModal(title,content) {
  modal.innerHTML=`<div class="modal-head"><h2 id="modal-title">${escapeHTML(title)}</h2><button class="icon-button" data-action="close" aria-label="Fechar">${icon('close')}</button></div>${content}`;
  modal.showModal();
}
function field(label,name,value='',type='text',attrs='') {return `<label>${label}<input name="${name}" type="${type}" value="${escapeHTML(value)}" required ${attrs}></label>`;}
function selectField(label,name,items,value) { return `<label>${label}<select name="${name}" required>${items.map(item=>`<option value="${escapeHTML(item.id)}" ${String(item.id)===String(value)?'selected':''}>${escapeHTML(item.name)}</option>`).join('')}</select></label>`; }
function edit(type,itemId) {
  if(!isManager()) return;
  const item=itemId?find(type,itemId):{};
  if(!item) return;
  let fields='';
  if(type==='courses') fields=field('Nome do curso','name',item.name,'text','maxlength="60"')+field('Modalidade','type',item.type||'Curso Técnico','text','maxlength="60"')+selectField('Ícone','icon',[{id:'monitor',name:'Computador'},{id:'flask',name:'Química'},{id:'bolt',name:'Eletricidade'},{id:'settings',name:'Mecânica'},{id:'book',name:'Livro'}],item.icon)+selectField('Cor','color',['purple','green','brown','yellow','pink'].map((c,i)=>({id:c,name:['Roxo','Verde','Marrom','Amarelo','Rosa'][i]})),item.color);
  if(type==='classes') {
    if(!data().courses.length || !data().rooms.length) {toast('Cadastre um curso e uma sala antes de criar uma turma.');return;}
    fields=field('Nome da turma','name',item.name,'text','maxlength="60"')+field('Código','code',item.code,'text','maxlength="20"')+selectField('Curso','courseId',data().courses,item.courseId)+field('Participantes','students',item.students??30,'number','min="1" max="300"')+selectField('Turno','shift',['Manhã','Tarde','Noite'].map(s=>({id:s,name:s})),item.shift)+field('Ano','year',item.year||'2026','number','min="2020" max="2100"')+selectField('Sala principal','roomId',data().rooms,item.roomId);
  }
  if(type==='people') fields=field('Nome','name',item.name,'text','maxlength="60"')+field('Área ou disciplina','subject',item.subject,'text','maxlength="60"');
  if(type==='rooms') fields=field('Nome da sala','name',item.name,'text','maxlength="40"')+field('Capacidade','capacity',item.capacity??35,'number','min="1" max="500"');
  if(type==='lessons') {
    if(!data().classes.length || !data().people.length || !data().rooms.length) {toast('Cadastre turma, colaborador e sala antes de adicionar aulas.');return;}
    fields=field('Disciplina','subject',item.subject,'text','maxlength="60"')+selectField('Turma','classId',data().classes.map(c=>({...c,name:`${c.name} · ${c.code}`})),item.classId||account.classId)+selectField('Dia da semana','day',dayNames.map((name,i)=>({id:i,name})),item.day??selectedDay)+field('Início','time',item.time||'07:30','time')+field('Término','end',item.end||'08:20','time')+selectField('Professor','personId',data().people,item.personId)+selectField('Sala','roomId',data().rooms,item.roomId);
  }
  showModal(`${itemId?'Editar':'Adicionar'} ${entityLabels[type]?.[2]?.toLowerCase()||'aula'}`,`<form id="edit-form" data-type="${type}" data-id="${itemId||''}">${fields}<p id="edit-error" class="form-error" role="alert"></p><div class="modal-actions"><button type="button" class="secondary" data-action="close">Cancelar</button><button class="primary" type="submit">Salvar</button></div></form>`);
}
function saveEntity(form) {
  if(!isManager()) return;
  const {type,id:itemId}=form.dataset;const values=Object.fromEntries(new FormData(form));
  Object.keys(values).forEach(key=>values[key]=values[key].trim());
  const error=document.querySelector('#edit-error');
  if(Object.values(values).some(v=>v==='')) {error.textContent='Preencha todos os campos.';return;}
  if(type==='lessons' && values.end<=values.time) {error.textContent='O término precisa ser depois do início.';return;}
  if(type==='classes' && data().classes.some(c=>c.code.toLowerCase()===values.code.toLowerCase()&&c.id!==itemId)) {error.textContent='Já existe uma turma com este código.';return;}
  if(type==='rooms' && data().rooms.some(r=>r.name.toLowerCase()===values.name.toLowerCase()&&r.id!==itemId)) {error.textContent='Já existe uma sala com este nome.';return;}
  ['day','students','capacity'].forEach(key=>{if(key in values) values[key]=Number(values[key]);});
  if(itemId) Object.assign(find(type,itemId),values); else data()[type].push({id:id(),...values});
  if(type==='lessons') {account.classId=values.classId;selectedDay=values.day;}
  if(!account.classId && type==='classes') account.classId=data().classes[0].id;
  modal.close();changed(`${itemId?'Atualizado':'Adicionado'}: ${values.name||values.subject}.`);
}
function askDelete(type,itemId) {
  if(!isManager()) return;
  const item=find(type,itemId);if(!item) return;
  const blocked = type==='courses'?data().classes.some(t=>t.courseId===itemId):type==='people'?data().lessons.some(l=>l.personId===itemId):type==='rooms'?data().lessons.some(l=>l.roomId===itemId)||data().classes.some(t=>t.roomId===itemId):false;
  if(blocked) {showModal('Cadastro em uso','<p>Este cadastro está associado a turmas ou aulas. Edite essas associações antes de excluí-lo.</p><button class="primary full" style="margin-top:20px" data-action="close">Entendi</button>');return;}
  showModal('Excluir cadastro?',`<p>Excluir <b>${escapeHTML(item.name||item.subject)}</b>? ${type==='classes'?'As aulas desta turma também serão excluídas. ':''}Esta ação não pode ser desfeita.</p><div class="modal-actions"><button class="secondary" data-action="close">Cancelar</button><button class="danger" data-confirm-delete="${type}" data-id="${itemId}">Excluir</button></div>`);
}
function deleteEntity(type,itemId) {
  if(!isManager()) return;
  const item=find(type,itemId);data()[type]=data()[type].filter(v=>v.id!==itemId);
  if(type==='classes') {data().lessons=data().lessons.filter(l=>l.classId!==itemId);if(account.classId===itemId) account.classId=data().classes[0]?.id||'';}
  modal.close();changed(`Excluído: ${item.name||item.subject}.`);
}
function details(itemId) {
  const l=find('lessons',itemId);if(!l) return;
  showModal(l.subject,`<dl><dt>Dia</dt><dd>${dayNames[l.day]}</dd><dt>Horário</dt><dd>${l.time} – ${l.end}</dd><dt>Professor</dt><dd>${escapeHTML(nameOf('people',l.personId))}</dd><dt>Sala</dt><dd>${escapeHTML(nameOf('rooms',l.roomId))}</dd><dt>Turma</dt><dd>${escapeHTML(nameOf('classes',l.classId))} · ${escapeHTML(find('classes',l.classId)?.code)}</dd></dl><button class="primary full" style="margin-top:20px" data-action="close">Entendi</button>`);
}
function renderAI() {
  shell('Organiza IA','Mais tempo para o que importa.',`<section class="ai-intro"><h2>Gerar grandes horários com IA</h2><p>Uma prévia de como organizar sua rotina com a ajuda de um assistente.</p></section><article class="card ai-hero"><div class="row"><div class="avatar">${icon('ai')}</div><div><h3>Assistente de horários</h3><p>Troque a sala de uma turma e consulte conflitos usando comandos simples.</p><span class="badge green">${icon('check')}Modo local disponível</span></div></div></article>${assistantCard()}${alertCard()}<p class="tiny muted" style="margin-top:20px;text-align:center">Esta versão usa regras locais. A conexão com uma IA externa pode ser adicionada depois.</p>`);
}
function renderChat() {
  shell('Organiza IA','Assistente local de horários.',`<p class="chat-tag">Comandos locais • sem conexão com IA externa</p>${!data().messages.length?`<div class="bubble assistant">Olá, ${escapeHTML(account.name.split(' ')[0])}! Posso trocar a sala das aulas de uma turma ou conferir os conflitos. Experimente um dos comandos abaixo.</div><div class="examples"><button class="example" data-example="Trocar a sala da turma 62-2 para C306">Trocar a sala da turma 62-2 para C306 →</button><button class="example" data-example="Verificar conflitos">Verificar conflitos →</button></div>`:''}<div id="messages">${data().messages.map(m=>`<div class="bubble ${m.role}">${escapeHTML(m.text)}${m.proposal&&!m.applied?`<button class="primary full" data-apply="${m.id}">Confirmar alteração</button>`:m.applied?'<p class="tiny" style="margin-top:8px">✓ Alteração aplicada</p>':''}</div>`).join('')}</div><form id="chat-form" class="chat-form"><input name="message" aria-label="Mensagem para o assistente" placeholder="O que deseja alterar?" maxlength="500" required autocomplete="off"><button class="primary" aria-label="Enviar mensagem" type="submit">${icon('arrow')}</button></form>`,'chat-content');
}
function sendMessage(text) {
  if(!isManager()) return;
  text=text.trim();if(!text) return;
  data().messages.push({id:id(),role:'user',text});
  const normalized=text.toLowerCase();let reply,proposal;
  if(/conflit|alerta|diverg/.test(normalized)) {const issues=conflicts();reply=issues.length?`Encontrei ${issues.length} conflito(s):\n${issues.slice(0,5).map(({a,reasons})=>`${days[a.day]}, ${a.time}: ${reasons.join(' e ')}.`).join('\n')}\nVocê pode revisar cada aula na tela Avisos.`:'Tudo certo! Nenhum conflito de sala, professor ou turma foi encontrado.';}
  else {
    const turma=data().classes.find(c=>normalized.includes(c.code.toLowerCase()));
    const room=data().rooms.find(r=>new RegExp(`\\b${r.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i').test(text));
    if(turma && room && /sala|trocar|alterar|mudar/.test(normalized)) {
      const count=data().lessons.filter(l=>l.classId===turma.id).length;
      reply=`Trocar a sala principal da turma ${turma.code} para ${room.name} e atualizar suas ${count} aula(s) da semana? Professores e horários serão mantidos. Confirme abaixo para salvar.`;
      proposal={classId:turma.id,roomId:room.id};
    } else reply='Posso conferir conflitos ou trocar a sala de uma turma. Use o código da turma e uma sala cadastrada. Exemplo: “Trocar a sala da turma 62-2 para C306”. Para mudar professores e horários, use a edição de aulas em Horários.';
  }
  data().messages.push({id:id(),role:'assistant',text:reply,proposal});
  data().messages=data().messages.slice(-40);persist();renderChat();window.scrollTo(0,document.body.scrollHeight);
}
function applyProposal(messageId) {
  if(!isManager()) return;
  const message=data().messages.find(m=>m.id===messageId);if(!message?.proposal||message.applied) return;
  const turma=find('classes',message.proposal.classId),room=find('rooms',message.proposal.roomId);
  if(!turma||!room) {toast('A turma ou sala foi excluída. Envie um novo comando.');return;}
  turma.roomId=room.id;data().lessons.filter(l=>l.classId===turma.id).forEach(l=>l.roomId=room.id);message.applied=true;
  const count=conflicts().length;
  data().messages.push({id:id(),role:'assistant',text:`Sala atualizada para ${room.name}! ${count?`Existem ${count} conflito(s) na grade. Confira os avisos antes de usar os horários.`:'Nenhum conflito encontrado na grade.'}`});
  changed(`Sala da turma ${turma.code} alterada para ${room.name}.`);window.scrollTo(0,document.body.scrollHeight);
}

document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button) return;
  const d=button.dataset;
  if(d.page) navigate(d.page);
  if(d.role) {account.role=d.role;persist();navigate('home');}
  if(d.day!==undefined) {selectedDay=Number(d.day);renderSchedule();}
  if(d.edit) {if(modal.open) modal.close();edit(d.edit,d.id);}
  if(d.delete) askDelete(d.delete,d.id);
  if(d.confirmDelete) deleteEntity(d.confirmDelete,d.id);
  if(d.detail) details(d.detail);
  if(d.course) {page='classes';query='';courseFilter=d.course;shiftFilter='';renderEntities('classes');window.scrollTo(0,0);}
  if(d.example) sendMessage(d.example);
  if(d.apply) applyProposal(d.apply);
  if(d.action==='close') modal.close();
  if(d.action==='toggle-auth') {signup=!signup;renderLogin();}
  if(d.action==='demo') demo();
  if(d.action==='integration') showModal(`Entrar com ${d.name}`,`<p>O espaço para esta integração já está preparado. O login com ${d.name} ainda precisa de um serviço de autenticação e suas credenciais de configuração.</p><p style="margin-top:12px">Por enquanto, crie uma conta local com e-mail ou explore a demonstração.</p><button class="primary full" data-action="close" style="margin-top:20px">Entendi</button>`);
  if(d.action==='about') showModal('Seu salvamento',`<p>Seu perfil, sessão, cursos, turmas e horários são salvos automaticamente no armazenamento deste navegador (localStorage).</p><p style="margin-top:12px">Ao sair, os dados continuam salvos. Limpar os dados do navegador apaga as contas e os cadastros. Eles não sincronizam entre aparelhos.</p><p style="margin-top:12px">Este é um protótipo: a senha local e a seleção de perfis não oferecem a segurança de um login com servidor. Use dados de teste.</p><button class="primary full" data-action="close" style="margin-top:20px">Entendi</button>`);
  if(d.action==='logout') {store.session=null;persist();account=null;signup=false;navigate('login');}
  if(d.action==='export') {
    const blob=new Blob([JSON.stringify({name:account.name,role:account.role,data:data()},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='organiza-dados.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Exportação preparada.');
  }
});
document.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target;
  if(form.id==='auth-form') authenticate(form);
  if(form.id==='edit-form') saveEntity(form);
  if(form.id==='settings-form') {const values=Object.fromEntries(new FormData(form));if(!values.name.trim()) {toast('Digite seu nome.');return;} account.name=values.name.trim();account.classId=values.classId||'';if(persist()) toast('Perfil salvo.');renderSettings();}
  if(form.id==='chat-form') sendMessage(new FormData(form).get('message'));
});
document.addEventListener('input',event=>{
  if(event.target.id==='search') {query=event.target.value;document.querySelector('#entity-list').innerHTML=entityList(event.target.dataset.type);}
});
document.addEventListener('change',event=>{
  if(event.target.id==='schedule-class') {account.classId=event.target.value;persist();renderSchedule();}
  if(event.target.id==='filter-course') {courseFilter=event.target.value;document.querySelector('#entity-list').innerHTML=entityList('classes');}
  if(event.target.id==='filter-shift') {shiftFilter=event.target.value;document.querySelector('#entity-list').innerHTML=entityList('classes');}
});
modal.addEventListener('click',event=>{if(event.target===modal) {const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) modal.close();}});
render();
