const STORAGE_KEY = "laptopFund.v1";
const CIRCUMFERENCE = 2 * Math.PI * 88;

const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
  saved: 0,
  target: 14000000
};

const $ = (id) => document.getElementById(id);
const ring = $("ringProgress");
ring.style.strokeDasharray = CIRCUMFERENCE;

function rupiah(value, short = false) {
  value = Math.max(0, Math.round(value));
  if (short) {
    if (value >= 1000000) return "Rp" + (value / 1000000).toLocaleString("id-ID", {maximumFractionDigits: 1}) + " jt";
    if (value >= 1000) return "Rp" + Math.round(value / 1000).toLocaleString("id-ID") + " rb";
  }
  return "Rp" + value.toLocaleString("id-ID");
}

function numberFromInput(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  const target = Math.max(1, state.target);
  const saved = Math.min(Math.max(0, state.saved), target);
  const percent = Math.min(100, (saved / target) * 100);
  const remaining = Math.max(0, target - saved);

  $("percent").textContent = percent >= 100 ? "100%" : percent.toFixed(percent < 10 ? 1 : 0) + "%";
  $("percentSmall").textContent = Math.round(percent) + "%";
  $("savedText").textContent = rupiah(saved);
  $("targetText").textContent = rupiah(target);
  $("remainingText").textContent = remaining === 0 ? "Target tercapai 🎉" : rupiah(remaining) + " tersisa";
  $("savedStat").textContent = rupiah(saved, true);
  $("targetStat").textContent = rupiah(target, true);
  $("remainingStat").textContent = rupiah(remaining, true);

  const offset = CIRCUMFERENCE * (1 - percent / 100);
  ring.style.strokeDashoffset = offset;
  $("barFill").style.width = percent + "%";
  $("barGlow").style.background = `linear-gradient(90deg, transparent ${Math.max(0, percent - 8)}%, rgba(158,255,47,.65) ${percent}%, transparent ${Math.min(100, percent + 8)}%)`;

  if (percent >= 100) {
    $("statusText").textContent = "Target tercapai";
  } else if (percent >= 75) {
    $("statusText").textContent = "Hampir sampai";
  } else if (percent >= 25) {
    $("statusText").textContent = "Progress bagus";
  } else if (saved > 0) {
    $("statusText").textContent = "Terus jalan";
  } else {
    $("statusText").textContent = "Mulai nabung";
  }

  $("target").value = state.target;
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 1700);
}

$("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = numberFromInput($("amount").value);
  if (!amount) return toast("Masukkan nominal dulu");
  state.saved += amount;
  save();
  render();
  $("amount").value = "";
  toast("Tabungan ditambahkan");
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    state.saved += Number(button.dataset.add);
    save();
    render();
    toast("Tabungan ditambahkan");
  });
});

$("targetBtn").addEventListener("click", () => {
  const target = numberFromInput($("target").value);
  if (target < 1) return toast("Target tidak valid");
  state.target = target;
  save();
  render();
  toast("Target disimpan");
});

$("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset saldo dan target ke awal?")) return;
  state.saved = 0;
  state.target = 14000000;
  save();
  render();
  toast("Data direset");
});

render();
