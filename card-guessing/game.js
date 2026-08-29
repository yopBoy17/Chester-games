const colors = ['#a23e44', '#3c8a5d', '#c15d31', '#5777a4', '#6750a1', '#8b4e7d', '#468899', '#9b6841', '#5a6892', '#7c5899'];
const deck = (prefix, cards) => cards.map(([title, meta], index) => ({ id: `${prefix}-${index}`, title, meta, color: colors[index % colors.length] }));
const topics = {
  'marvel-films': { name: 'Фильмы Marvel', cards: deck('film', [['Железный человек', '2008'], ['Невероятный Халк', '2008'], ['Железный человек 2', '2010'], ['Тор', '2011'], ['Первый мститель', '2011'], ['Мстители', '2012'], ['Железный человек 3', '2013'], ['Царство тьмы', '2013'], ['Другая война', '2014'], ['Стражи Галактики', '2014'], ['Эра Альтрона', '2015'], ['Человек-муравей', '2015'], ['Противостояние', '2016'], ['Доктор Стрэндж', '2016'], ['Возвращение домой', '2017'], ['Рагнарёк', '2017'], ['Чёрная Пантера', '2018'], ['Война бесконечности', '2018'], ['Капитан Марвел', '2019'], ['Финал', '2019']]) },
  animals: { name: 'Животные', cards: deck('animal', [['Лев', 'Хищник'], ['Тигр', 'Хищник'], ['Слон', 'Травоядное'], ['Жираф', 'Травоядное'], ['Зебра', 'Травоядное'], ['Панда', 'Млекопитающее'], ['Волк', 'Хищник'], ['Лиса', 'Хищник'], ['Медведь', 'Всеядное'], ['Крокодил', 'Рептилия'], ['Черепаха', 'Рептилия'], ['Дельфин', 'Млекопитающее'], ['Кит', 'Млекопитающее'], ['Пингвин', 'Птица'], ['Орёл', 'Птица'], ['Попугай', 'Птица'], ['Лошадь', 'Травоядное'], ['Кенгуру', 'Млекопитающее'], ['Обезьяна', 'Всеядное'], ['Ёж', 'Всеядное']]) },
  food: { name: 'Еда', cards: deck('food', [['Пицца', 'Италия'], ['Суши', 'Япония'], ['Борщ', 'Суп'], ['Бургер', 'Америка'], ['Паста', 'Италия'], ['Тако', 'Мексика'], ['Пельмени', 'Тесто'], ['Рамен', 'Суп'], ['Стейк', 'Мясо'], ['Салат', 'Овощи'], ['Омлет', 'Яйца'], ['Сырники', 'Сладкое'], ['Круассан', 'Франция'], ['Шаурма', 'Ближний Восток'], ['Плов', 'Рис'], ['Карри', 'Индия'], ['Блины', 'Тесто'], ['Мороженое', 'Десерт'], ['Шоколад', 'Десерт'], ['Тирамису', 'Италия']]) },
  countries: { name: 'Страны', cards: deck('country', [['Россия', 'Европа и Азия'], ['Франция', 'Европа'], ['Италия', 'Европа'], ['Германия', 'Европа'], ['Испания', 'Европа'], ['Япония', 'Азия'], ['Китай', 'Азия'], ['Индия', 'Азия'], ['Южная Корея', 'Азия'], ['Бразилия', 'Южная Америка'], ['Аргентина', 'Южная Америка'], ['США', 'Северная Америка'], ['Канада', 'Северная Америка'], ['Мексика', 'Северная Америка'], ['Австралия', 'Океания'], ['Египет', 'Африка'], ['ЮАР', 'Африка'], ['Турция', 'Европа и Азия'], ['Норвегия', 'Европа'], ['Греция', 'Европа']]) },
  'marvel-characters': { name: 'Персонажи Marvel', cards: deck('hero', [['Железный человек', 'Мститель'], ['Капитан Америка', 'Мститель'], ['Тор', 'Мститель'], ['Халк', 'Мститель'], ['Чёрная вдова', 'Мститель'], ['Соколиный глаз', 'Мститель'], ['Человек-паук', 'Герой'], ['Доктор Стрэндж', 'Герой'], ['Чёрная пантера', 'Герой'], ['Капитан Марвел', 'Герой'], ['Человек-муравей', 'Герой'], ['Оса', 'Герой'], ['Росомаха', 'Люди Икс'], ['Дэдпул', 'Антигерой'], ['Локи', 'Асгард'], ['Танос', 'Злодей'], ['Зелёный гоблин', 'Злодей'], ['Веном', 'Симбиот'], ['Алая ведьма', 'Мститель'], ['Звёздный лорд', 'Страж Галактики']]) },
  'disney-pixar': { name: 'Disney / Pixar', cards: deck('cartoon', [['Король Лев', 'Disney'], ['Холодное сердце', 'Disney'], ['Моана', 'Disney'], ['Рапунцель', 'Disney'], ['Зверополис', 'Disney'], ['Энканто', 'Disney'], ['Русалочка', 'Disney'], ['Аладдин', 'Disney'], ['Мулан', 'Disney'], ['Лило и Стич', 'Disney'], ['История игрушек', 'Pixar'], ['Тачки', 'Pixar'], ['В поисках Немо', 'Pixar'], ['Корпорация монстров', 'Pixar'], ['Суперсемейка', 'Pixar'], ['Вверх', 'Pixar'], ['Головоломка', 'Pixar'], ['Тайна Коко', 'Pixar'], ['Душа', 'Pixar'], ['ВАЛЛ·И', 'Pixar']]) },
};

const startScreen = document.querySelector('#startScreen');
const roomScreen = document.querySelector('#roomScreen');
const gameScreen = document.querySelector('#gameScreen');
const createRoomButton = document.querySelector('#createRoom');
const joinRoomButton = document.querySelector('#joinRoom');
const topicSelect = document.querySelector('#topicSelect');
const roomCodeInput = document.querySelector('#roomCode');
const notice = document.querySelector('#notice');
const roomTitle = document.querySelector('#roomTitle');
const roomStatus = document.querySelector('#roomStatus');
const topicName = document.querySelector('#topicName');
const startGameButton = document.querySelector('#startGame');
const gameTitle = document.querySelector('#gameTitle');
const gameTopic = document.querySelector('#gameTopic');
const gameHint = document.querySelector('#gameHint');
const turnNote = document.querySelector('#turnNote');
const cards = document.querySelector('#cards');
const resultModal = document.querySelector('#resultModal');
const resultText = document.querySelector('#resultText');
const rematchButton = document.querySelector('#rematchButton');
const leaveButton = document.querySelector('#leaveButton');

let socket;
let playerIndex = null;
let room = null;
let secretCardId = null;
let closedCards = new Set();
let lastPhase = null;

function connect() {
  if (socket?.readyState === WebSocket.OPEN) return;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//${window.location.host}${window.location.pathname}`);
  socket.addEventListener('message', ({ data }) => handleMessage(JSON.parse(data)));
  socket.addEventListener('close', () => showNotice('Соединение с комнатой закрыто.'));
}

function send(message) { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); }
function showNotice(message) { notice.textContent = message; }
function show(screen) { [startScreen, roomScreen, gameScreen].forEach((item) => item.classList.toggle('is-hidden', item !== screen)); }

function renderRoom() {
  show(roomScreen);
  roomTitle.textContent = `Код: ${room.code}`;
  topicName.textContent = topics[room.topic]?.name ?? 'Неизвестная тема';
  roomStatus.textContent = room.players < 2 ? 'Ждём второго игрока…' : 'Оба игрока подключены.';
  startGameButton.classList.toggle('is-hidden', !(playerIndex === 0 && room.players === 2));
}

function renderCards() {
  const topic = topics[room.topic] ?? topics['marvel-films'];
  cards.innerHTML = topic.cards.map((card) => `<button class="card${secretCardId === card.id ? ' is-secret' : ''}${closedCards.has(card.id) ? ' is-closed' : ''}" type="button" data-card-id="${card.id}" style="background:${card.color}"><span class="year">${card.meta}</span><strong>${card.title}</strong></button>`).join('');
}

function showResult(waiting = false) {
  resultText.textContent = waiting
    ? 'Ты готов к реваншу. Ждём подтверждения второго игрока.'
    : 'Осталась одна карточка — ты отгадал ответ.';
  rematchButton.disabled = waiting;
  resultModal.classList.remove('is-hidden');
}

function hideResult() { resultModal.classList.add('is-hidden'); }

function renderSelection() {
  show(gameScreen);
  gameTopic.textContent = topics[room.topic]?.name ?? '';
  gameTitle.textContent = 'Выбери тайную карточку';
  turnNote.textContent = room.selections[playerIndex] ? 'Выбор подтверждён. Ждём соперника.' : '';
  gameHint.textContent = 'Нажми на карточку, которую ты загадываешь. Соперник её не увидит.';
  renderCards();
}

function renderGame() {
  show(gameScreen);
  gameTopic.textContent = topics[room.topic]?.name ?? '';
  gameTitle.textContent = 'Игра началась';
  turnNote.textContent = 'Вопросы обсуждайте очно';
  gameHint.textContent = 'Нажимай на неподходящие карточки, чтобы закрыть или вернуть их.';
  renderCards();
  const topic = topics[room.topic] ?? topics['marvel-films'];
  if (topic.cards.length - closedCards.size === 1) showResult(room.rematchReady?.includes(playerIndex));
}

function handleMessage(message) {
  if (message.type === 'error') return showNotice(message.message);
  if (message.type === 'left_room') {
    room = null;
    playerIndex = null;
    secretCardId = null;
    closedCards = new Set();
    lastPhase = null;
    hideResult();
    show(startScreen);
    return;
  }
  if (message.type === 'room_joined') playerIndex = message.playerIndex;
  if (message.type !== 'room_joined' && message.type !== 'room_state') return;
  room = message;
  if (room.phase === 'selection' && lastPhase !== 'selection') {
    secretCardId = null;
    closedCards = new Set();
    hideResult();
  }
  lastPhase = room.phase;
  if (room.phase === 'lobby') renderRoom();
  else if (room.phase === 'selection') renderSelection();
  else if (room.phase === 'playing') renderGame();
}

createRoomButton.addEventListener('click', () => { connect(); const timer = setInterval(() => { if (socket?.readyState === WebSocket.OPEN) { clearInterval(timer); send({ type: 'create_room', topic: topicSelect.value }); } }, 50); });
joinRoomButton.addEventListener('click', () => { const code = roomCodeInput.value.trim(); if (code.length !== 4) return showNotice('Введи четырёхзначный код комнаты.'); connect(); const timer = setInterval(() => { if (socket?.readyState === WebSocket.OPEN) { clearInterval(timer); send({ type: 'join_room', code }); } }, 50); });
startGameButton.addEventListener('click', () => send({ type: 'start_game' }));
cards.addEventListener('click', (event) => {
  const card = event.target.closest('[data-card-id]');
  if (!card || !room) return;
  const cardId = card.dataset.cardId;
  if (room.phase === 'selection' && !secretCardId) { secretCardId = cardId; send({ type: 'select_card', cardId }); renderSelection(); }
  if (room.phase === 'playing') {
    closedCards.has(cardId) ? closedCards.delete(cardId) : closedCards.add(cardId);
    renderGame();
  }
});

rematchButton.addEventListener('click', () => {
  send({ type: 'request_rematch' });
  showResult(true);
});

leaveButton.addEventListener('click', () => send({ type: 'leave_room' }));
