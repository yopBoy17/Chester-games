const films = [
  ['iron-man', 'Железный человек', '2008', '#a23e44'], ['incredible-hulk', 'Невероятный Халк', '2008', '#3c8a5d'], ['iron-man-2', 'Железный человек 2', '2010', '#c15d31'], ['thor', 'Тор', '2011', '#5777a4'], ['captain-america', 'Первый мститель', '2011', '#355d91'], ['avengers', 'Мстители', '2012', '#6750a1'], ['iron-man-3', 'Железный человек 3', '2013', '#b54733'], ['thor-dark-world', 'Царство тьмы', '2013', '#384b76'], ['winter-soldier', 'Другая война', '2014', '#435d8b'], ['guardians', 'Стражи Галактики', '2014', '#7b488e'], ['age-of-ultron', 'Эра Альтрона', '2015', '#9d424a'], ['ant-man', 'Человек-муравей', '2015', '#ab4b56'], ['civil-war', 'Противостояние', '2016', '#5a6892'], ['doctor-strange', 'Доктор Стрэндж', '2016', '#9c4a3a'], ['homecoming', 'Возвращение домой', '2017', '#b94345'], ['ragnarok', 'Рагнарёк', '2017', '#4489a1'], ['black-panther', 'Чёрная Пантера', '2018', '#5e4276'], ['infinity-war', 'Война бесконечности', '2018', '#735597'], ['captain-marvel', 'Капитан Марвел', '2019', '#ba6647'], ['endgame', 'Финал', '2019', '#3f5d9f'],
].map(([id, title, year, color]) => ({ id, title, year, color }));

const startScreen = document.querySelector('#startScreen');
const roomScreen = document.querySelector('#roomScreen');
const gameScreen = document.querySelector('#gameScreen');
const createRoomButton = document.querySelector('#createRoom');
const joinRoomButton = document.querySelector('#joinRoom');
const roomCodeInput = document.querySelector('#roomCode');
const notice = document.querySelector('#notice');
const roomTitle = document.querySelector('#roomTitle');
const roomStatus = document.querySelector('#roomStatus');
const startGameButton = document.querySelector('#startGame');
const gameTitle = document.querySelector('#gameTitle');
const gameHint = document.querySelector('#gameHint');
const turnNote = document.querySelector('#turnNote');
const cards = document.querySelector('#cards');

let socket;
let playerIndex = null;
let room = null;
let secretCardId = null;
let closedCards = new Set();

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
  roomStatus.textContent = room.players < 2 ? 'Ждём второго игрока…' : 'Оба игрока подключены.';
  startGameButton.classList.toggle('is-hidden', !(playerIndex === 0 && room.players === 2));
}

function renderCards() {
  cards.innerHTML = films.map((film) => `<button class="card${secretCardId === film.id ? ' is-secret' : ''}${closedCards.has(film.id) ? ' is-closed' : ''}" type="button" data-card-id="${film.id}" style="background:${film.color}"><span class="year">${film.year}</span><strong>${film.title}</strong></button>`).join('');
}

function renderSelection() {
  show(gameScreen);
  gameTitle.textContent = 'Выбери тайную карточку';
  turnNote.textContent = room.selections[playerIndex] ? 'Выбор подтверждён. Ждём соперника.' : '';
  gameHint.textContent = 'Нажми на фильм, который ты загадываешь. Соперник его не увидит.';
  renderCards();
}

function renderGame() {
  show(gameScreen);
  gameTitle.textContent = 'Игра началась';
  turnNote.textContent = 'Вопросы обсуждайте очно';
  gameHint.textContent = 'Нажимай на неподходящие фильмы, чтобы закрыть или вернуть карточку.';
  renderCards();
}

function handleMessage(message) {
  if (message.type === 'error') return showNotice(message.message);
  if (message.type === 'room_joined') playerIndex = message.playerIndex;
  if (message.type !== 'room_joined' && message.type !== 'room_state') return;
  room = message;
  if (room.phase === 'lobby') renderRoom();
  else if (room.phase === 'selection') renderSelection();
  else if (room.phase === 'playing') renderGame();
}

createRoomButton.addEventListener('click', () => { connect(); const timer = setInterval(() => { if (socket?.readyState === WebSocket.OPEN) { clearInterval(timer); send({ type: 'create_room' }); } }, 50); });
joinRoomButton.addEventListener('click', () => { const code = roomCodeInput.value.trim(); if (code.length !== 4) return showNotice('Введи четырёхзначный код комнаты.'); connect(); const timer = setInterval(() => { if (socket?.readyState === WebSocket.OPEN) { clearInterval(timer); send({ type: 'join_room', code }); } }, 50); });
startGameButton.addEventListener('click', () => send({ type: 'start_game' }));
cards.addEventListener('click', (event) => {
  const card = event.target.closest('[data-card-id]');
  if (!card || !room) return;
  const cardId = card.dataset.cardId;
  if (room.phase === 'selection' && !secretCardId) { secretCardId = cardId; send({ type: 'select_card', cardId }); renderSelection(); }
  if (room.phase === 'playing') { closedCards.has(cardId) ? closedCards.delete(cardId) : closedCards.add(cardId); renderCards(); }
});
