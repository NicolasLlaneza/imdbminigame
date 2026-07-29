import { MOVIE_SETS } from "./movies.js";
import { OMDB_API_KEY, ABLY_API_KEY, CHAT_ROOM } from "./config.js";

// -------- STATE --------

const MIN_PLAYERS = 3;
const ROUND_MS = 10000;

const state = {
  clientId: getOrCreateClientId(),
  name: localStorage.getItem("player-name") || "",
  ready: false,
  players: new Map(), // clientId -> { name, score, ready, picked }
  round: {
    status: "idle", // idle | loading | playing | revealed
    movies: null,
    correctIndices: [],
    startTime: 0,
    timerId: null,
    picks: new Map(), // clientId -> { pickedIdx, timeMs, score }
    starterId: null,
  },
  ably: null,
  channel: null,
};

function getOrCreateClientId() {
  let id = localStorage.getItem("client-id");
  if (!id) {
    id = "c_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("client-id", id);
  }
  return id;
}

// -------- DOM --------

const roundEl = document.getElementById("round");
const hintEl = document.getElementById("hint");
const nameInput = document.getElementById("player-name");
const startBtn = document.getElementById("btn-start");
const playersListEl = document.getElementById("players-list");
const timerWrap = document.getElementById("timer-wrap");
const timerBar = document.getElementById("timer-bar");
const timerText = document.getElementById("timer-text");

const chatMessages = document.getElementById("chat-messages");
const chatStatus = document.getElementById("chat-status");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

nameInput.value = state.name;

nameInput.addEventListener("change", async () => {
  state.name = nameInput.value.trim();
  localStorage.setItem("player-name", state.name);
  await updateMyPresence();
});

startBtn.addEventListener("click", () => {
  const isReadyToggle = startBtn.dataset.action === "ready";
  if (isReadyToggle) toggleReady();
  else startNewRound();
});

// -------- OMDB --------

async function fetchOmdb(title, year) {
  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}&type=movie`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.Response === "False") return null;
  const rating = parseFloat(data.imdbRating);
  if (isNaN(rating)) return null;
  return {
    title: data.Title,
    year: data.Year,
    poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
    rating,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function pickAndLoadSet() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const set = MOVIE_SETS[Math.floor(Math.random() * MOVIE_SETS.length)];
    const results = await Promise.all(
      set.versions.map(v => fetchOmdb(v.title, v.year))
    );
    if (results.every(r => r !== null)) return shuffle(results);
  }
  return null;
}

// -------- ROUND FLOW --------

async function startNewRound() {
  if (!canStart()) return;
  state.round.status = "loading";
  updateStartButton();
  const movies = await pickAndLoadSet();
  if (!movies) {
    state.round.status = "idle";
    roundEl.innerHTML = `<p class="error">No pude cargar películas. Reintentá.</p>`;
    updateStartButton();
    return;
  }
  const correctIndices = computeCorrectIndices(movies);
  state.channel.publish("start-round", {
    starterId: state.clientId,
    movies,
    correctIndices,
    startedAt: Date.now(),
  });
}

function computeCorrectIndices(movies) {
  const maxRating = Math.max(...movies.map(v => v.rating));
  return movies
    .map((v, i) => v.rating === maxRating ? i : -1)
    .filter(i => i >= 0);
}

function beginRound(payload) {
  state.round.status = "playing";
  state.round.movies = payload.movies;
  state.round.correctIndices = payload.correctIndices;
  state.round.starterId = payload.starterId;
  state.round.startTime = Date.now();
  state.round.picks = new Map();
  // Reset "picked" flag for present players
  state.players.forEach(p => { p.picked = false; });
  renderRound();
  renderPlayers();
  startTimer();
  updateStartButton();
  hintEl.textContent = "Tocá la versión con mejor rating de IMDb.";
}

function startTimer() {
  timerWrap.hidden = false;
  clearInterval(state.round.timerId);
  state.round.timerId = setInterval(() => {
    const elapsed = Date.now() - state.round.startTime;
    const remaining = Math.max(0, ROUND_MS - elapsed);
    const pct = (remaining / ROUND_MS) * 100;
    timerBar.style.width = pct + "%";
    timerText.textContent = (remaining / 1000).toFixed(1) + "s";
    if (remaining <= 0) {
      clearInterval(state.round.timerId);
      revealRound();
    } else if (allPresentPicked()) {
      clearInterval(state.round.timerId);
      revealRound();
    }
  }, 100);
}

function allPresentPicked() {
  const presentIds = [...state.players.keys()];
  return presentIds.length > 0 && presentIds.every(id => state.round.picks.has(id));
}

function revealRound() {
  if (state.round.status !== "playing") return;
  state.round.status = "revealed";
  timerWrap.hidden = true;
  renderRound();
  renderPlayers();
  updateStartButton();
  hintEl.textContent = "Ronda terminada. Toqué 'Nueva ronda' cuando quieras seguir.";
  // Reset ready for everyone
  state.ready = false;
  updateMyPresence();
}

function calcScore(pickedIdx, timeMs) {
  const correct = state.round.correctIndices.includes(pickedIdx);
  if (!correct) return 0;
  const clamped = Math.min(ROUND_MS, Math.max(0, timeMs));
  return Math.round(100 * (1 - clamped / ROUND_MS));
}

function handleMyPick(idx) {
  if (state.round.status !== "playing") return;
  if (state.round.picks.has(state.clientId)) return;
  const timeMs = Date.now() - state.round.startTime;
  const score = calcScore(idx, timeMs);
  state.channel.publish("pick", {
    clientId: state.clientId,
    pickedIdx: idx,
    timeMs,
    score,
  });
}

function applyPick(payload) {
  if (state.round.picks.has(payload.clientId)) return;
  state.round.picks.set(payload.clientId, {
    pickedIdx: payload.pickedIdx,
    timeMs: payload.timeMs,
    score: payload.score,
  });
  const player = state.players.get(payload.clientId);
  if (player) {
    player.score = (player.score || 0) + payload.score;
    player.picked = true;
  }
  renderPlayers();
  // Mark my card
  if (payload.clientId === state.clientId) renderRound();
  // Check if round ends
  if (state.round.status === "playing" && allPresentPicked()) {
    clearInterval(state.round.timerId);
    revealRound();
  }
}

// -------- RENDER --------

function renderRound() {
  const { status, movies } = state.round;

  if (status === "idle") {
    roundEl.innerHTML = `<p class="loading">Poné tu nombre, marcá "Listo" y esperá a los demás. Cuando los ${MIN_PLAYERS} estén listos, cualquiera puede iniciar la ronda.</p>`;
    return;
  }
  if (status === "loading") {
    roundEl.innerHTML = `<p class="loading">Cargando películas…</p>`;
    return;
  }
  if (!movies) return;

  const myPick = state.round.picks.get(state.clientId);
  const revealed = status === "revealed";

  roundEl.innerHTML = "";
  movies.forEach((movie, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    const isWinner = state.round.correctIndices.includes(idx);
    if (revealed) card.classList.add("revealed", isWinner ? "winner" : "loser");
    if (myPick && myPick.pickedIdx === idx) card.classList.add("my-pick");

    // Picks by others (small badges)
    const others = [...state.round.picks.entries()]
      .filter(([cid, p]) => cid !== state.clientId && p.pickedIdx === idx)
      .map(([cid]) => state.players.get(cid)?.name || "?");

    card.innerHTML = `
      <div class="poster">
        ${movie.poster
          ? `<img src="${movie.poster}" alt="${movie.title}" />`
          : `<span class="no-poster">Sin póster</span>`}
      </div>
      <div class="info">
        <span class="title">${escapeHtml(movie.title)}</span>
        <span class="year">${escapeHtml(movie.year)}</span>
        ${revealed ? `<span class="rating">⭐ ${movie.rating.toFixed(1)}</span>` : ""}
        ${others.length ? `<span class="picks-badge">${others.map(escapeHtml).join(", ")}</span>` : ""}
      </div>
    `;
    if (!revealed) card.addEventListener("click", () => handleMyPick(idx));
    roundEl.appendChild(card);
  });
}

function renderPlayers() {
  const arr = [...state.players.entries()]
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  if (arr.length === 0) {
    playersListEl.innerHTML = `<li class="empty">Esperando jugadores…</li>`;
    return;
  }

  playersListEl.innerHTML = "";
  arr.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "player-row";
    if (p.id === state.clientId) li.classList.add("me");
    const roundPick = state.round.picks.get(p.id);
    li.innerHTML = `
      <span class="rank">${i + 1}</span>
      <span class="player-name">${escapeHtml(p.name || "anon")}</span>
      <span class="player-status">${
        state.round.status === "playing"
          ? (roundPick ? "✓" : "…")
          : (p.ready ? "listo" : "")
      }</span>
      <span class="player-score">${p.score || 0}</span>
    `;
    playersListEl.appendChild(li);
  });
}

function updateStartButton() {
  const status = state.round.status;
  const numPlayers = state.players.size;
  const numReady = [...state.players.values()].filter(p => p.ready).length;
  const allReady = numPlayers >= MIN_PLAYERS && numReady === numPlayers;

  if (status === "playing") {
    startBtn.disabled = true;
    startBtn.textContent = "Ronda en curso…";
    startBtn.dataset.action = "start";
    return;
  }
  if (status === "loading") {
    startBtn.disabled = true;
    startBtn.textContent = "Cargando…";
    startBtn.dataset.action = "start";
    return;
  }

  if (allReady) {
    startBtn.disabled = false;
    startBtn.textContent = "Nueva ronda";
    startBtn.dataset.action = "start";
  } else {
    startBtn.disabled = false;
    startBtn.dataset.action = "ready";
    if (state.ready) startBtn.textContent = "Cancelar listo";
    else {
      const missing = MIN_PLAYERS - numPlayers;
      if (missing > 0) startBtn.textContent = `Estoy listo (faltan ${missing})`;
      else startBtn.textContent = `Estoy listo (${numReady}/${numPlayers})`;
    }
  }
}

function canStart() {
  const numPlayers = state.players.size;
  const numReady = [...state.players.values()].filter(p => p.ready).length;
  return state.round.status === "idle"
    && numPlayers >= MIN_PLAYERS
    && numReady === numPlayers;
}

async function toggleReady() {
  state.ready = !state.ready;
  await updateMyPresence();
  updateStartButton();
}

async function updateMyPresence() {
  if (!state.channel) return;
  await state.channel.presence.update({
    name: state.name || "anon",
    ready: state.ready,
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}

// -------- CHAT --------

function appendMessage(who, text) {
  chatStatus?.remove();
  const el = document.createElement("div");
  el.className = "msg";
  el.innerHTML = `<span class="who"></span><span class="text"></span>`;
  el.querySelector(".who").textContent = who + ":";
  el.querySelector(".text").textContent = " " + text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setChatStatus(text) {
  if (chatStatus) chatStatus.textContent = text;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !state.channel) return;
  await state.channel.publish("msg", {
    who: state.name || "anon",
    text,
  });
  chatInput.value = "";
});

// -------- ABLY INIT --------

async function initAbly() {
  if (!ABLY_API_KEY) {
    setChatStatus("Configurá ABLY_API_KEY en config.js");
    chatForm.querySelector("button").disabled = true;
    return;
  }

  const AblyModule = await import("https://cdn.jsdelivr.net/npm/ably@2/+esm");
  const Realtime = AblyModule.Realtime || AblyModule.default?.Realtime;
  if (!Realtime) {
    setChatStatus("No se pudo cargar el SDK de Ably.");
    return;
  }

  const client = new Realtime({
    key: ABLY_API_KEY,
    clientId: state.clientId,
  });

  client.connection.on("connected", () => setChatStatus("Conectado."));
  client.connection.on("disconnected", () => setChatStatus("Desconectado, reintentando…"));
  client.connection.on("failed", () => setChatStatus("Error de conexión."));

  const channel = client.channels.get(CHAT_ROOM);
  state.ably = client;
  state.channel = channel;

  // Chat
  channel.subscribe("msg", (m) => appendMessage(m.data.who, m.data.text));

  // Round events
  channel.subscribe("start-round", (m) => beginRound(m.data));
  channel.subscribe("pick", (m) => applyPick(m.data));

  // Presence
  await channel.presence.subscribe("enter", (m) => {
    upsertPlayer(m.clientId, m.data);
    renderPlayers();
    updateStartButton();
  });
  await channel.presence.subscribe("update", (m) => {
    upsertPlayer(m.clientId, m.data);
    renderPlayers();
    updateStartButton();
  });
  await channel.presence.subscribe("leave", (m) => {
    state.players.delete(m.clientId);
    renderPlayers();
    updateStartButton();
  });

  await channel.presence.enter({ name: state.name || "anon", ready: false });

  // Seed with current members
  const members = await channel.presence.get();
  members.forEach(m => upsertPlayer(m.clientId, m.data));
  renderPlayers();
  updateStartButton();
}

function upsertPlayer(clientId, data) {
  const existing = state.players.get(clientId) || { score: 0, picked: false };
  state.players.set(clientId, {
    ...existing,
    name: data?.name || "anon",
    ready: !!data?.ready,
  });
}

// -------- BOOT --------

renderRound();
renderPlayers();
updateStartButton();
initAbly();
