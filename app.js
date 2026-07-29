import { MOVIE_SETS } from "./movies.js";
import { OMDB_API_KEY, ABLY_API_KEY, CHAT_ROOM } from "./config.js";

// -------- GAME --------

const roundEl = document.getElementById("round");
const hitsEl = document.getElementById("score-hits");
const totalEl = document.getElementById("score-total");
const nextBtn = document.getElementById("btn-next");

let hits = 0;
let total = 0;
let currentSet = null;
let currentVersions = [];

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

function pickRandomSet() {
  // Filtrar sets ya jugados en esta sesión sería lindo, pero por ahora random puro.
  return MOVIE_SETS[Math.floor(Math.random() * MOVIE_SETS.length)];
}

async function loadRound() {
  roundEl.innerHTML = `<p class="loading">Cargando películas…</p>`;
  nextBtn.hidden = true;

  // Elegir un set, si falla alguna versión buscar otro.
  for (let attempt = 0; attempt < 5; attempt++) {
    const set = pickRandomSet();
    const results = await Promise.all(
      set.versions.map(v => fetchOmdb(v.title, v.year))
    );
    if (results.every(r => r !== null)) {
      currentSet = set;
      currentVersions = shuffle(results);
      renderRound();
      return;
    }
  }
  roundEl.innerHTML = `<p class="error">No pude cargar películas. ¿Anda OMDb?</p>`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderRound() {
  roundEl.innerHTML = "";
  currentVersions.forEach((movie, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="poster">
        ${movie.poster
          ? `<img src="${movie.poster}" alt="${movie.title}" />`
          : `<span class="no-poster">Sin póster</span>`}
      </div>
      <div class="info">
        <span class="title">${movie.title}</span>
        <span class="year">${movie.year}</span>
        <span class="rating">⭐ ${movie.rating.toFixed(1)}</span>
      </div>
    `;
    card.addEventListener("click", () => handlePick(idx));
    roundEl.appendChild(card);
  });
}

function handlePick(pickedIdx) {
  const cards = roundEl.querySelectorAll(".card");
  if (cards[0].classList.contains("revealed")) return;

  const maxRating = Math.max(...currentVersions.map(v => v.rating));
  const winners = currentVersions
    .map((v, i) => v.rating === maxRating ? i : -1)
    .filter(i => i >= 0);
  const correct = winners.includes(pickedIdx);

  cards.forEach((card, i) => {
    card.classList.add("revealed");
    if (winners.includes(i)) card.classList.add("winner");
    else card.classList.add("loser");
  });

  total++;
  if (correct) hits++;
  hitsEl.textContent = hits;
  totalEl.textContent = total;
  nextBtn.hidden = false;
}

nextBtn.addEventListener("click", loadRound);
loadRound();

// -------- CHAT (Supabase Realtime broadcast) --------

const chatMessages = document.getElementById("chat-messages");
const chatStatus = document.getElementById("chat-status");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatName = document.getElementById("chat-name");

chatName.value = localStorage.getItem("chat-name") || "";
chatName.addEventListener("change", () => {
  localStorage.setItem("chat-name", chatName.value.trim());
});

function appendMessage(who, text) {
  chatStatus?.remove();
  const el = document.createElement("div");
  el.className = "msg";
  el.innerHTML = `<span class="who"></span><span class="text"></span>`;
  el.querySelector(".who").textContent = who + ":";
  el.querySelector(".text").textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setChatStatus(text) {
  if (chatStatus) chatStatus.textContent = text;
}

let channel = null;

async function initChat() {
  if (!ABLY_API_KEY) {
    setChatStatus("Configurá ABLY_API_KEY en config.js");
    chatForm.querySelector("button").disabled = true;
    return;
  }

  const AblyModule = await import("https://cdn.jsdelivr.net/npm/ably@2/+esm");
  const Realtime = AblyModule.Realtime || AblyModule.default?.Realtime;
  if (!Realtime) {
    setChatStatus("No se pudo cargar el SDK de Ably.");
    console.error("Ably module keys:", Object.keys(AblyModule));
    return;
  }
  const client = new Realtime(ABLY_API_KEY);

  client.connection.on("connected", () => {
    setChatStatus("Conectado. Escribí algo.");
  });
  client.connection.on("failed", () => {
    setChatStatus("Error de conexión.");
  });
  client.connection.on("disconnected", () => {
    setChatStatus("Desconectado, reintentando…");
  });

  channel = client.channels.get(CHAT_ROOM);
  await channel.subscribe("msg", (message) => {
    const { who, text } = message.data;
    appendMessage(who, text);
  });
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  const who = chatName.value.trim() || "anon";
  if (!text || !channel) return;
  await channel.publish("msg", { who, text });
  chatInput.value = "";
});

initChat();
