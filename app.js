/* Cada página tem seu próprio HTML. Este arquivo apenas preenche dados e trata ações. */
const page = document.body.dataset.page;
const signup = page === 'signup';
const modal = document.querySelector('#modal');
const params = new URLSearchParams(location.search);
let selectedDay = Number(params.get('dia') || 1);
if (!Number.isInteger(selectedDay) || selectedDay < 0 || selectedDay > 4) selectedDay = 1;
let query = '';
let courseFilter = params.get('curso') || '';
let shiftFilter = '';
let toastTimer;

const pageFiles = {
  login: 'index.html', signup: 'cadastro.html', profiles: 'perfis.html',
  home: 'inicio.html', schedule: 'horarios.html', courses: 'cursos.html',
  classes: 'turmas.html', people: 'colaboradores.html', rooms: 'salas.html',
  notices: 'avisos.html', settings: 'ajustes.html', ai: 'assistente.html', chat: 'chat.html'
};
const entityLabels = {
  courses: 'Curso', classes: 'Turma', people: 'Colaborador', rooms: 'Sala', lessons: 'Aula'
};

function navigate(target) {
  location.href = pageFiles[target] || 'inicio.html';
}

function text(selector, value, parent = document) {
  const element = parent.querySelector(selector);
  if (element) element.textContent = value;
}

// Copia um modelo escrito no HTML para preencher uma linha da lista.
function copyTemplate(name) {
  return document.querySelector('#' + name).content.cloneNode(true);
}

function applyRoleVisibility() {
  document.querySelectorAll('[data-manager-only]').forEach(element => {
    element.hidden = !isManager();
  });
  document.querySelectorAll('[data-reader-only]').forEach(element => {
    element.hidden = isManager();
  });
}

function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 4000);
}

function changed(message) {
  data().history.unshift({id: id(), text: message, date: new Date().toISOString()});
  data().history = data().history.slice(0, 100);
  const saved = persist();
  render();
  if (saved) toast('Alterações salvas neste navegador.');
}

function showModal(title, templateName = 'message-template') {
  if (modal.open) modal.close();
  text('#modal-title', title);
  const content = document.querySelector('#modal-content');
  content.replaceChildren(copyTemplate(templateName));
  modal.showModal();
  return content;
}

function showMessage(title, message) {
  const content = showModal(title);
  text('[data-message]', message, content);
}

function showEmpty(container, title, description) {
  const row = copyTemplate('empty-template');
  text('[data-empty-title]', title, row);
  text('[data-empty-description]', description, row);
  container.replaceChildren(row);
}

async function authenticate(form) {
  const values = Object.fromEntries(new FormData(form));
  const email = values.email.trim().toLowerCase();
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    let user = store.accounts.find(item => item.email === email);
    if (signup) {
      if (user) throw new Error('Este e-mail já tem uma conta neste navegador. Faça login.');
      if (!values.name.trim()) throw new Error('Digite seu nome.');
      const salt = id();
      user = {
        id: id(), name: values.name.trim(), email: email, salt: salt,
        hash: await passwordHash(values.password, salt), role: null,
        classId: 't4', data: seedData()
      };
      store.accounts.push(user);
    } else if (!user || !user.hash || await passwordHash(values.password, user.salt) !== user.hash) {
      throw new Error('E-mail ou senha incorretos. No primeiro acesso, crie uma conta.');
    }
    account = user;
    store.session = user.id;
    if (persist()) navigate(user.role ? 'home' : 'profiles');
  } catch (error) {
    text('#auth-error', error.message);
  } finally {
    button.disabled = false;
  }
}

function demo() {
  account = store.accounts.find(item => item.demo);
  if (!account) {
    account = {id: id(), name: 'João', email: '', demo: true, role: null, classId: 't4', data: seedData()};
    store.accounts.push(account);
  }
  store.session = account.id;
  if (persist()) navigate('profiles');
}

function lessonsForDay(day = selectedDay) {
  return data().lessons.filter(lesson => lesson.day === day && lesson.classId === account.classId)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function renderHome() {
  text('#page-title', 'Olá, ' + account.name.split(' ')[0] + '! 👋');
  text('.subtitle', isManager() ? 'Bem-vindo ao painel de gestão.' : 'Bem-vindo ao seu painel de horários.');
  document.querySelectorAll('[data-count]').forEach(element => {
    element.textContent = data()[element.dataset.count].length;
  });
  if (isManager()) return;
  const today = new Date();
  const weekday = today.getDay();
  const day = weekday >= 1 && weekday <= 5 ? weekday - 1 : 0;
  const list = lessonsForDay(day);
  const now = today.toTimeString().slice(0, 5);
  const next = list.find(lesson => weekday >= 1 && weekday <= 5 ? lesson.end > now : true);
  text('#today-date', today.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'}));
  text('#today-title', weekday === 0 || weekday === 6 ? 'Próxima segunda-feira' : 'Aulas de hoje');
  text('#today-count', list.length + ' aulas');
  text('#next-label', next ? '» Próxima aula' : '» Dia concluído');
  text('#next-subject', next ? next.subject : 'Tudo em dia!');
  document.querySelector('#next-details').hidden = !next;
  document.querySelector('#next-empty').hidden = Boolean(next);
  if (next) {
    text('#next-time', 'Horário: ' + next.time + ' – ' + next.end);
    text('#next-person', 'Professor: ' + nameOf('people', next.personId));
    text('#next-room', 'Sala: ' + nameOf('rooms', next.roomId));
  }
  const container = document.querySelector('#today-lessons');
  container.replaceChildren();
  for (const lesson of list) {
    const row = copyTemplate('lesson-row-template');
    text('[data-subject]', lesson.subject, row);
    text('[data-time]', lesson.time, row);
    container.append(row);
  }
  document.querySelector('#today-empty').hidden = list.length > 0;
}

function fillOptions(select, items, value, keepFirst = false) {
  if (!keepFirst) select.replaceChildren();
  for (const item of items) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  }
  select.value = value || '';
}

function classChoices() {
  return data().classes.map(item => ({id: item.id, name: item.name + ' · ' + item.code}));
}

function setActions(row, type, itemId) {
  const editButton = row.querySelector('[data-edit]');
  const deleteButton = row.querySelector('[data-delete]');
  editButton.dataset.edit = type;
  deleteButton.dataset.delete = type;
  editButton.dataset.id = itemId;
  deleteButton.dataset.id = itemId;
  editButton.setAttribute('aria-label', 'Editar ' + entityLabels[type].toLowerCase());
  deleteButton.setAttribute('aria-label', 'Excluir ' + entityLabels[type].toLowerCase());
}

function renderSchedule() {
  text('#page-title', isManager() ? 'Horários' : 'Meus Horários');
  fillOptions(document.querySelector('#schedule-class'), classChoices(), account.classId);
  const list = lessonsForDay();
  text('#schedule-summary', dayNames[selectedDay] + ' · ' + list.length + ' aulas');
  document.querySelectorAll('[data-day]').forEach(button => {
    const active = Number(button.dataset.day) === selectedDay;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const container = document.querySelector('#lesson-list');
  container.replaceChildren();
  for (const lesson of list) {
    const row = copyTemplate('lesson-template');
    const avatar = row.querySelector('[data-lesson-icon]');
    avatar.classList.toggle('green', lesson.subject === 'Inglês');
    avatar.innerHTML = icon(lesson.subject === 'Inglês' ? 'book' : 'monitor');
    text('[data-subject]', lesson.subject, row);
    text('[data-time]', lesson.time, row);
    text('[data-end]', 'Até ' + lesson.end, row);
    text('[data-room]', 'Sala: ' + nameOf('rooms', lesson.roomId), row);
    row.querySelector('[data-detail]').dataset.detail = lesson.id;
    setActions(row, 'lessons', lesson.id);
    container.append(row);
  }
  if (!list.length) showEmpty(container, 'Dia livre', 'Nenhuma aula cadastrada para esta turma.');
}

function renderEntities() {
  const container = document.querySelector('#entity-list');
  const items = data()[page].filter(item => {
    const name = (item.name + ' ' + (item.code || '')).toLowerCase();
    if (!name.includes(query.toLowerCase())) return false;
    if (courseFilter && item.courseId !== courseFilter) return false;
    if (shiftFilter && item.shift !== shiftFilter) return false;
    return true;
  });
  container.replaceChildren();
  for (const item of items) {
    const row = copyTemplate('entity-template');
    const course = page === 'classes' ? find('courses', item.courseId) : item;
    const avatar = row.querySelector('[data-entity-icon]');
    avatar.classList.add(course?.color || 'green');
    let image = course?.icon || 'book';
    if (page === 'people') image = 'user';
    if (page === 'rooms') image = 'room';
    avatar.innerHTML = icon(image);
    text('[data-name]', item.name, row);
    let description = '';
    if (page === 'courses') {
      const classes = data().classes.filter(turma => turma.courseId === item.id);
      const students = classes.reduce((total, turma) => total + Number(turma.students), 0);
      description = item.type + '\n' + classes.length + ' turmas · ' + students + ' alunos';
    }
    if (page === 'classes') description = item.code + ' | Participantes: ' + item.students + '\nTurno ' + item.shift + ' | Sala principal: ' + nameOf('rooms', item.roomId);
    if (page === 'people') description = item.subject + '\n' + data().lessons.filter(lesson => lesson.personId === item.id).length + ' aulas na semana';
    if (page === 'rooms') description = 'Capacidade: ' + item.capacity + ' pessoas\n' + data().lessons.filter(lesson => lesson.roomId === item.id).length + ' aulas na semana';
    text('[data-description]', description, row);
    const link = row.querySelector('[data-course-link]');
    link.hidden = page !== 'courses';
    link.href = 'turmas.html?curso=' + encodeURIComponent(item.id);
    link.setAttribute('aria-label', 'Ver turmas de ' + item.name);
    setActions(row, page, item.id);
    container.append(row);
  }
  if (!items.length) showEmpty(container, 'Nada por aqui', 'Tente outra busca ou adicione um cadastro.');
}

function renderNotices() {
  const issues = conflicts();
  text('#conflict-count', issues.length);
  const container = document.querySelector('#conflict-list');
  container.replaceChildren();
  for (const issue of issues) {
    const row = copyTemplate('conflict-template');
    text('[data-conflict-title]', 'Conflito · ' + days[issue.a.day] + ', ' + issue.a.time, row);
    text('[data-description]', nameOf('classes', issue.a.classId) + ' (' + find('classes', issue.a.classId)?.code + ') e ' + nameOf('classes', issue.b.classId) + ' (' + find('classes', issue.b.classId)?.code + ')\n' + issue.reasons.join(' e ') + '.', row);
    row.querySelector('[data-edit]').dataset.id = issue.b.id;
    container.append(row);
  }
  if (!issues.length) showEmpty(container, 'Tudo em ordem', 'Nenhum conflito de sala, professor ou turma.');
  const history = document.querySelector('#history-list');
  history.replaceChildren();
  for (const entry of data().history.slice(0, 20)) {
    const row = copyTemplate('history-template');
    text('[data-description]', entry.text, row);
    text('[data-date]', new Date(entry.date).toLocaleString('pt-BR'), row);
    history.append(row);
  }
  if (!data().history.length) showEmpty(history, 'Tudo atualizado', 'As próximas alterações aparecerão aqui.');
}

function renderChat() {
  text('#chat-name', account.name.split(' ')[0]);
  document.querySelector('#chat-intro').hidden = data().messages.length > 0;
  const container = document.querySelector('#messages');
  container.replaceChildren();
  for (const message of data().messages) {
    const row = copyTemplate('bubble-template');
    row.querySelector('.bubble').classList.add(message.role);
    text('[data-message]', message.text, row);
    const button = row.querySelector('[data-apply]');
    button.hidden = !message.proposal || message.applied;
    button.dataset.apply = message.id;
    row.querySelector('[data-applied]').hidden = !message.applied;
    container.append(row);
  }
}

function render() {
  switch (page) {
    case 'home': renderHome(); break;
    case 'schedule': renderSchedule(); break;
    case 'courses':
    case 'classes':
    case 'people':
    case 'rooms': renderEntities(); break;
    case 'notices': renderNotices(); break;
    case 'chat': renderChat(); break;
  }
  const count = conflicts().length;
  document.querySelectorAll('[data-alert-summary]').forEach(element => {
    element.textContent = count ? count + ' conflito(s) encontrado(s) nos horários.' : 'Tudo certo! Nenhum conflito nos horários.';
  });
  document.querySelectorAll('[data-notification]').forEach(element => element.hidden = count === 0);
  applyRoleVisibility();
}

function edit(type, itemId) {
  if (!isManager()) return;
  if (type === 'lessons' && page !== 'schedule') {
    location.href = 'horarios.html?editar=' + encodeURIComponent(itemId);
    return;
  }
  const item = itemId ? find(type, itemId) : {};
  if (!item) return;
  if (type === 'classes' && (!data().courses.length || !data().rooms.length)) {
    toast('Cadastre um curso e uma sala antes de criar uma turma.');
    return;
  }
  if (type === 'lessons' && (!data().classes.length || !data().people.length || !data().rooms.length)) {
    toast('Cadastre turma, colaborador e sala antes de adicionar aulas.');
    return;
  }
  const content = showModal((itemId ? 'Editar ' : 'Adicionar ') + entityLabels[type].toLowerCase(), 'edit-template');
  const form = content.querySelector('form');
  form.dataset.type = type;
  form.dataset.id = itemId || '';
  const choices = {courseId: data().courses, classId: classChoices(), roomId: data().rooms, personId: data().people};
  for (const name of Object.keys(choices)) {
    const select = form.elements.namedItem(name);
    if (select) fillOptions(select, choices[name], item[name]);
  }
  const values = {
    type: 'Curso Técnico', icon: 'monitor', color: 'purple', students: 30,
    shift: 'Manhã', year: '2026', capacity: 35, day: selectedDay,
    classId: account.classId, time: '07:30', end: '08:20',
    courseId: data().courses[0]?.id, roomId: data().rooms[0]?.id,
    personId: data().people[0]?.id, ...item
  };
  for (const input of form.elements) {
    if (input.name && values[input.name] !== undefined) input.value = values[input.name];
  }
}

function askDelete(type, itemId) {
  if (!isManager()) return;
  const item = find(type, itemId);
  if (!item) return;
  let blocked = false;
  if (type === 'courses') blocked = data().classes.some(turma => turma.courseId === itemId);
  if (type === 'people') blocked = data().lessons.some(lesson => lesson.personId === itemId);
  if (type === 'rooms') {
    blocked = data().lessons.some(lesson => lesson.roomId === itemId) || data().classes.some(turma => turma.roomId === itemId);
  }
  if (blocked) {
    showMessage('Cadastro em uso', 'Este cadastro está associado a turmas ou aulas. Edite essas associações antes de excluí-lo.');
    return;
  }
  const content = showModal('Excluir cadastro?', 'delete-template');
  text('[data-item-name]', item.name || item.subject, content);
  content.querySelector('[data-class-warning]').hidden = type !== 'classes';
  const button = content.querySelector('[data-confirm-delete]');
  button.dataset.confirmDelete = type;
  button.dataset.id = itemId;
}

function details(itemId) {
  const lesson = find('lessons', itemId);
  if (!lesson) return;
  const content = showModal(lesson.subject, 'details-template');
  text('[data-day-name]', dayNames[lesson.day], content);
  text('[data-hours]', lesson.time + ' – ' + lesson.end, content);
  text('[data-person]', nameOf('people', lesson.personId), content);
  text('[data-room]', nameOf('rooms', lesson.roomId), content);
  text('[data-class]', nameOf('classes', lesson.classId) + ' · ' + find('classes', lesson.classId)?.code, content);
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

function deleteEntity(type,itemId) {
  if(!isManager()) return;
  const item=find(type,itemId);data()[type]=data()[type].filter(v=>v.id!==itemId);
  if(type==='classes') {data().lessons=data().lessons.filter(l=>l.classId!==itemId);if(account.classId===itemId) account.classId=data().classes[0]?.id||'';}
  modal.close();changed(`Excluído: ${item.name||item.subject}.`);
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

document.addEventListener('click', event => {
  const button = event.target.closest('button, a[data-role]');
  if (!button) return;
  const d = button.dataset;
  if (d.role) {
    account.role = d.role;
    if (!persist()) event.preventDefault();
  }
  if (d.day !== undefined) {
    selectedDay = Number(d.day);
    render();
  }
  if (d.edit) edit(d.edit, d.id);
  if (d.delete) askDelete(d.delete, d.id);
  if (d.confirmDelete) deleteEntity(d.confirmDelete, d.id);
  if (d.detail) details(d.detail);
  if (d.example) sendMessage(d.example);
  if (d.apply) applyProposal(d.apply);
  if (d.action === 'close') modal.close();
  if (d.action === 'demo') demo();
  if (d.action === 'integration') {
    showMessage('Entrar com ' + d.name, 'O login com ' + d.name + ' ainda precisa de um serviço de autenticação e suas credenciais de configuração. Por enquanto, crie uma conta local com e-mail ou explore a demonstração.');
  }
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (!['auth-form', 'edit-form', 'chat-form'].includes(form.id)) return;
  event.preventDefault();
  if (form.id === 'auth-form') authenticate(form);
  if (form.id === 'edit-form') saveEntity(form);
  if (form.id === 'chat-form') {
    sendMessage(new FormData(form).get('message'));
    form.reset();
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'search') {
    query = event.target.value;
    render();
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'schedule-class') {
    account.classId = event.target.value;
    persist();
    render();
  }
  if (event.target.id === 'filter-course') {
    courseFilter = event.target.value;
    render();
  }
  if (event.target.id === 'filter-shift') {
    shiftFilter = event.target.value;
    render();
  }
});

modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const rect = modal.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
});

function startPage() {
  if (page === 'login' || page === 'signup') {
    if (account) location.replace(account.role ? 'inicio.html' : 'perfis.html');
    return;
  }
  if (!account) {
    location.replace('index.html');
    return;
  }
  if (page === 'profiles') return;
  if (!account.role) {
    location.replace('perfis.html');
    return;
  }
  if (['courses', 'classes', 'people', 'rooms', 'ai', 'chat'].includes(page) && !isManager()) {
    location.replace('inicio.html');
    return;
  }
  if (page === 'classes') {
    fillOptions(document.querySelector('#filter-course'), data().courses, courseFilter, true);
  }
  const editId = params.get('editar');
  if (page === 'schedule' && editId && isManager()) {
    const lesson = find('lessons', editId);
    if (lesson) {
      account.classId = lesson.classId;
      selectedDay = lesson.day;
      persist();
    }
  }
  render();
  if (page === 'schedule' && editId) edit('lessons', editId);
}

startPage();
