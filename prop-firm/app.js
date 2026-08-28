const STORAGE_KEY = "prop-firm-usd-ledger-v1";

const state = {
  entries: [],
  type: "cost",
};

const el = {
  status: document.getElementById("status"),
  total: document.getElementById("total"),
  payoutTotal: document.getElementById("payoutTotal"),
  costTotal: document.getElementById("costTotal"),
  entryCount: document.getElementById("entryCount"),
  entryForm: document.getElementById("entryForm"),
  amount: document.getElementById("amount"),
  records: document.getElementById("records"),
  clearAll: document.getElementById("clearAll"),
  typeButtons: Array.from(document.querySelectorAll("[data-type]")),
};

function parseAmount(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

function normalizeAmount(type, amount) {
  const absolute = Math.abs(amount);
  return type === "cost" ? -absolute : absolute;
}

function formatUsd(value) {
  const sign = value < 0 ? "-" : "";
  const number = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${sign}USD ${number}`;
}

function loadEntries() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    state.entries = Array.isArray(stored) ? stored : [];
  } catch {
    state.entries = [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
}

function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addEntry(type, rawAmount) {
  const parsed = parseAmount(rawAmount);
  if (parsed === null) {
    setStatus("请输入有效金额");
    return false;
  }

  state.entries.unshift({
    id: makeId(),
    type,
    amount: normalizeAmount(type, parsed),
    createdAt: new Date().toISOString(),
  });
  saveEntries();
  render();
  setStatus(type === "cost" ? "已记录买号成本" : "已记录出金");
  return true;
}

function setStatus(text) {
  el.status.textContent = text;
}

function setType(type) {
  state.type = type;
  el.typeButtons.forEach((button) => {
    const active = button.dataset.type === type;
    button.classList.toggle("active", active);
    button.classList.toggle("danger", active && type === "cost");
  });
}

function render() {
  const total = state.entries.reduce((sum, entry) => sum + entry.amount, 0);
  const payouts = state.entries
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const costs = state.entries
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  el.total.textContent = formatUsd(total);
  el.total.classList.toggle("positive", total >= 0);
  el.total.classList.toggle("negative", total < 0);
  el.payoutTotal.textContent = formatUsd(payouts);
  el.costTotal.textContent = formatUsd(costs);
  el.entryCount.textContent = String(state.entries.length);

  if (!state.entries.length) {
    el.records.innerHTML = '<p class="empty">还没有记录</p>';
    el.clearAll.hidden = true;
    return;
  }

  el.clearAll.hidden = false;
  el.records.replaceChildren(
    ...state.entries.map((entry) => {
      const row = document.createElement("div");
      row.className = "record";

      const main = document.createElement("div");
      const title = document.createElement("p");
      title.className = "record-title";
      title.textContent = entry.type === "cost" ? "买号成本" : "出金记录";
      const time = document.createElement("p");
      time.className = "record-time";
      time.textContent = new Date(entry.createdAt).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      main.append(title, time);

      const side = document.createElement("div");
      side.className = "record-side";
      const amount = document.createElement("p");
      amount.className = `record-amount ${entry.amount >= 0 ? "positive" : "negative"}`;
      amount.textContent = `${entry.amount > 0 ? "+" : ""}${formatUsd(entry.amount)}`;
      const button = document.createElement("button");
      button.className = "delete-button";
      button.type = "button";
      button.textContent = "删除";
      button.addEventListener("click", () => {
        state.entries = state.entries.filter((item) => item.id !== entry.id);
        saveEntries();
        render();
        setStatus("已删除一笔");
      });
      side.append(amount, button);
      row.append(main, side);
      return row;
    }),
  );
}

function handleQueryAdd() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("add") !== "1") return;

  const type = params.get("type") === "payout" ? "payout" : "cost";
  const amount = params.get("amount");
  addEntry(type, amount);
  window.history.replaceState({}, "", window.location.pathname);
}

el.typeButtons.forEach((button) => {
  button.addEventListener("click", () => setType(button.dataset.type));
});

el.entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (addEntry(state.type, el.amount.value)) {
    el.amount.value = "";
  }
});

el.clearAll.addEventListener("click", () => {
  if (!confirm("确定清空全部记录？")) return;
  state.entries = [];
  saveEntries();
  render();
  setStatus("记录已清空");
});

loadEntries();
render();
handleQueryAdd();
