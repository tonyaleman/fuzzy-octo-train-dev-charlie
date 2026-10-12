const board = document.getElementById("board");
const defaults = [
  { name: "Lion", score: 14200, mode: "Normal" },
  { name: "Johnny", score: 11750, mode: "Normal" },
];
function render() {
  const saved = JSON.parse(localStorage.getItem("dpScores") || "[]");
  const all = [...defaults, ...saved]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  board.innerHTML = all
    .map(
      (p, i) =>
        `<div class="row"><strong>${i + 1}. ${escapeHTML(p.name)}</strong><span>${Number(p.score).toLocaleString()} • ${escapeHTML(p.mode || "Normal")}</span></div>`,
    )
    .join("");
}
function escapeHTML(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
document.getElementById("clear").onclick = () => {
  localStorage.removeItem("dpScores");
  render();
};
render();
