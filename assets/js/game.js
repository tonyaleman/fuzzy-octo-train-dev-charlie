const professorPictures = [
  "../assets/images/professor1.jpg",
  "../assets/images/professor2.jpg",
  "../assets/images/professor3.jpg",
  "../assets/images/professor4.jpg",
];
const area = document.getElementById("gameArea"),
  target = document.getElementById("target"),
  special = document.getElementById("special"),
  scoreEl = document.getElementById("score"),
  levelEl = document.getElementById("level"),
  comboEl = document.getElementById("combo"),
  livesEl = document.getElementById("lives"),
  progressEl = document.getElementById("progress"),
  statusEl = document.getElementById("status"),
  intro = document.getElementById("intro"),
  result = document.getElementById("result"),
  banner = document.getElementById("levelBanner");
const player = localStorage.getItem("dpPlayer") || "Player",
  mode = localStorage.getItem("dpDifficulty") || "normal";
document.getElementById("player").textContent = player;
const levelNames = ["Freshman", "Sophomore", "Junior", "Senior", "FINALS"];
let score = 0,
  lives = 3,
  level = 1,
  hits = 0,
  streak = 0,
  bestCombo = 1,
  shots = 0,
  success = 0,
  active = false,
  timer = null,
  spawnTimer = null,
  slowUntil = 0;
const modeFactor = { normal: 1, hard: 0.82, chaos: 0.68 }[mode];
function multiplier() {
  return streak >= 15
    ? 5
    : streak >= 10
      ? 4
      : streak >= 6
        ? 3
        : streak >= 3
          ? 2
          : 1;
}
function update() {
  scoreEl.textContent = score.toLocaleString();
  levelEl.textContent = level;
  comboEl.textContent = "×" + multiplier();
  livesEl.textContent = "❤️".repeat(Math.max(lives, 0)) || "—";
  progressEl.style.width = (hits / 10) * 100 + "%";
  statusEl.textContent = `${levelNames[level - 1]} • ${mode[0].toUpperCase() + mode.slice(1)} • ${hits}/10 hits`;
}
function duration() {
  const base = [1000, 850, 720, 610, 520][level - 1];
  return Math.max(300, base * modeFactor * (Date.now() < slowUntil ? 1.6 : 1));
}
function gap() {
  return Math.max(500, [1250, 1100, 980, 850, 730][level - 1] * modeFactor);
}
function size() {
  return [112, 105, 96, 88, 80][level - 1];
}
function place(el, w) {
  el.style.left =
    8 + Math.random() * Math.max(10, area.clientWidth - w - 16) + "px";
  el.style.top =
    8 + Math.random() * Math.max(10, area.clientHeight - w - 16) + "px";
}
function flash(text, x, y) {
  const d = document.createElement("div");
  d.className = "flash";
  d.textContent = text;
  d.style.left = x + "px";
  d.style.top = y + "px";
  area.appendChild(d);
  setTimeout(() => d.remove(), 650);
}
function hide() {
  target.style.display = "none";
  special.style.display = "none";
}
function schedule() {
  clearTimeout(spawnTimer);
  if (active) spawnTimer = setTimeout(spawn, gap());
}
function miss() {
  if (!active) return;
  hide();
  lives--;
  streak = 0;
  shots++;
  update();
  if (lives <= 0) return finish(false);
  schedule();
}
function spawn() {
  if (!active) return;
  hide();
  const trapChance = level >= 3 ? (mode === "chaos" ? 0.22 : 0.12) : 0;
  const powerChance = level >= 2 ? 0.12 : 0;
  if (Math.random() < trapChance) {
    special.textContent = "💀";
    special.dataset.type = "trap";
    special.className = "power trap";
    special.style.display = "grid";
    place(special, 82);
    timer = setTimeout(() => {
      special.style.display = "none";
      schedule();
    }, duration());
  } else if (Math.random() < powerChance) {
    const types = ["life", "slow", "bonus"],
      type = types[Math.floor(Math.random() * types.length)];
    special.dataset.type = type;
    special.textContent =
      type === "life" ? "❤️" : type === "slow" ? "⏱️" : "⭐";
    special.className = "power";
    special.style.display = "grid";
    place(special, 82);
    timer = setTimeout(() => {
      special.style.display = "none";
      schedule();
    }, duration());
  } else {
    const s = size();
    target.style.width = s + "px";
    target.style.height = s + "px";
    target.src =
      professorPictures[Math.floor(Math.random() * professorPictures.length)];
    target.style.display = "block";
    place(target, s);
    timer = setTimeout(miss, duration());
  }
}
target.onclick = (e) => {
  if (!active || target.style.display === "none") return;
  clearTimeout(timer);
  target.style.display = "none";
  shots++;
  success++;
  hits++;
  streak++;
  const mult = multiplier();
  bestCombo = Math.max(bestCombo, mult);
  const pts = 100 * mult;
  score += pts;
  flash("+" + pts, e.offsetX + target.offsetLeft, e.offsetY + target.offsetTop);
  update();
  if (hits >= 10) {
    if (level >= 5) return finish(true);
    return nextLevel();
  }
  schedule();
};
special.onclick = (e) => {
  if (!active) return;
  clearTimeout(timer);
  const type = special.dataset.type;
  special.style.display = "none";
  if (type === "trap") {
    lives--;
    streak = 0;
    flash("-1 LIFE", special.offsetLeft, special.offsetTop);
    if (lives <= 0) {
      update();
      return finish(false);
    }
  } else if (type === "life") {
    lives = Math.min(5, lives + 1);
    flash("+1 LIFE", special.offsetLeft, special.offsetTop);
  } else if (type === "slow") {
    slowUntil = Date.now() + 7000;
    flash("SLOW MODE", special.offsetLeft, special.offsetTop);
  } else {
    score += 750;
    flash("+750", special.offsetLeft, special.offsetTop);
  }
  update();
  schedule();
};
function nextLevel() {
  active = false;
  hide();
  clearTimeout(timer);
  clearTimeout(spawnTimer);
  level++;
  hits = 0;
  banner.textContent = `LEVEL ${level} • ${levelNames[level - 1]}`;
  banner.classList.remove("show");
  void banner.offsetWidth;
  banner.classList.add("show");
  update();
  setTimeout(() => {
    active = true;
    spawn();
  }, 1100);
}
function finish(won) {
  active = false;
  hide();
  clearTimeout(timer);
  clearTimeout(spawnTimer);
  const accuracy = shots ? Math.round((success / shots) * 100) : 0;
  document.getElementById("resultTitle").textContent = won
    ? "🎓 YOU GRADUATED!"
    : "YOU FAILED THE SEMESTER";
  document.getElementById("resultText").innerHTML =
    `Final Score: <strong>${score.toLocaleString()}</strong><br>Level: ${levelNames[level - 1]}<br>Best Combo: ×${bestCombo}<br>Accuracy: ${accuracy}%`;
  result.classList.remove("hidden");
  const saved = JSON.parse(localStorage.getItem("dpScores") || "[]");
  saved.push({
    name: player,
    score,
    mode: mode[0].toUpperCase() + mode.slice(1),
    date: new Date().toISOString(),
  });
  localStorage.setItem("dpScores", JSON.stringify(saved.slice(-30)));
}
function startGame() {
  score = 0;
  lives = 3;
  level = 1;
  hits = 0;
  streak = 0;
  bestCombo = 1;
  shots = 0;
  success = 0;
  slowUntil = 0;
  result.classList.add("hidden");
  intro.classList.add("hidden");
  active = true;
  update();
  spawn();
}
document.getElementById("begin").onclick = startGame;
document.getElementById("again").onclick = startGame;
update();
