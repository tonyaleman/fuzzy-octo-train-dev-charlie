const nameInput = document.getElementById("username"),
  difficulty = document.getElementById("difficulty"),
  start = document.getElementById("start"),
  best = document.getElementById("best");
nameInput.value = localStorage.getItem("dpPlayer") || "";
const scores = JSON.parse(localStorage.getItem("dpScores") || "[]");
best.textContent = scores.length
  ? `Personal best: ${Math.max(...scores.map((x) => x.score)).toLocaleString()} points`
  : "No scores yet — be the first to graduate.";
start.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert("Enter a username first.");
    return;
  }
  localStorage.setItem("dpPlayer", name);
  localStorage.setItem("dpDifficulty", difficulty.value);
  location.href = "pages/game.html";
});
