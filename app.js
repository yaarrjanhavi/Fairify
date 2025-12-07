// Tabs
const tabs = document.querySelectorAll(".tab");
const walletTab = document.getElementById("tab-wallet");
const groupsTab = document.getElementById("tab-groups");

// Wallet elements
const form = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const noteInput = document.getElementById("note");
const categorySelect = document.getElementById("category");
const list = document.getElementById("expense-list");
const totalSpan = document.getElementById("total-amount");
const clearBtn = document.getElementById("clear-history");
const summaryBox = document.getElementById("category-summary");

// Month controls
const walletMonthLabel = document.getElementById("wallet-month-label");
const monthPrevBtn = document.getElementById("month-prev");
const monthNextBtn = document.getElementById("month-next");

// Overview stats + pie
const statCount = document.getElementById("stat-count");
const statAverage = document.getElementById("stat-average");
const pieSvg = document.getElementById("category-pie");

// Groups elements
const groupForm = document.getElementById("group-form");
const groupNameInput = document.getElementById("group-name");
const groupList = document.getElementById("group-list");

// Data
let expenses = [];
let total = 0;
let groups = [];

// Month state (viewed month, used for filtering and label)
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

let viewMonth = currentMonth;
let viewYear = currentYear;

/* ---------- Tab switching ---------- */

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.tab;
    if (target === "wallet") {
      walletTab.style.display = "block";
      groupsTab.style.display = "none";
    } else {
      walletTab.style.display = "none";
      groupsTab.style.display = "block";
    }
  });
});

/* ---------- Month label helpers ---------- */

function updateMonthLabel() {
  if (!walletMonthLabel) return;
  const temp = new Date(viewYear, viewMonth, 1);
  walletMonthLabel.textContent = temp.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

updateMonthLabel();

/* ---------- Load data on start ---------- */

loadExpensesFromStorage();
loadGroupsFromStorage();

/* ---------- Wallet logic ---------- */

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = Number(amountInput.value);
  const note = noteInput.value.trim();
  const category = categorySelect.value;

  if (!amount || !note) return;

  const expense = {
    id: Date.now(),
    amount,
    note,
    category,
    date: new Date().toISOString(), // used for month filtering
  };

  expenses.push(expense);
  renderExpense(expense);
  updateTotal();
  saveExpensesToStorage();

  amountInput.value = "";
  noteInput.value = "";
  categorySelect.value = "Food";
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all expenses?")) return;

  expenses = [];
  list.innerHTML = "";
  updateTotal();
  saveExpensesToStorage();
});

function renderExpense(expense) {
  const li = document.createElement("li");
  li.dataset.id = expense.id;

  const main = document.createElement("div");
  main.className = "expense-main";

  const left = document.createElement("div");
  left.className = "expense-left";

  const noteSpan = document.createElement("span");
  noteSpan.className = "expense-note";
  noteSpan.textContent = expense.note;

  const amountSpan = document.createElement("span");
  amountSpan.className = "expense-amount";
  amountSpan.textContent = `₹${expense.amount}`;

  left.appendChild(noteSpan);
  left.appendChild(amountSpan);

  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = expense.category;

  const delBtn = document.createElement("button");
  delBtn.className = "expense-delete";
  delBtn.type = "button";
  delBtn.textContent = "×";
  delBtn.addEventListener("click", () => {
    deleteExpense(expense.id);
  });

  main.appendChild(left);
  main.appendChild(badge);
  main.appendChild(delBtn);

  li.appendChild(main);
  list.appendChild(li);
}

function deleteExpense(id) {
  expenses = expenses.filter((exp) => exp.id !== id);
  const li = list.querySelector(`li[data-id="${id}"]`);
  if (li) li.remove();
  updateTotal();
  saveExpensesToStorage();
}

function updateTotal() {
  // filter to viewed month; ignore items without valid date
  const filtered = expenses.filter((exp) => {
    if (!exp.date) return false;
    const d = new Date(exp.date);
    if (isNaN(d)) return false;
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
  totalSpan.textContent = `₹${total}`;
  updateCategorySummary(filtered);
}

function updateCategorySummary(listForPeriod) {
  const map = {};

  listForPeriod.forEach((exp) => {
    map[exp.category] = (map[exp.category] || 0) + exp.amount;
  });

  summaryBox.innerHTML = "";

  const title = document.createElement("div");
  title.className = "category-summary-title";
  title.textContent = "Summary";
  summaryBox.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "category-summary-grid";
  summaryBox.appendChild(grid);

  const categories = ["Food", "Rent", "Travel", "Other"];

  categories.forEach((cat) => {
    const amount = map[cat] || 0;

    const card = document.createElement("div");
    card.className = `category-card ${cat.toLowerCase()}`;

    const nameEl = document.createElement("div");
    nameEl.className = "category-card-name";
    nameEl.textContent = cat.toLowerCase();

    const amountEl = document.createElement("div");
    amountEl.className = "category-card-amount";
    amountEl.textContent = `₹${amount}`;

    card.appendChild(nameEl);
    card.appendChild(amountEl);
    grid.appendChild(card);
  });

  updateOverviewStats(listForPeriod, map);
}

function updateOverviewStats(listForPeriod, categoryMap) {
  if (!statCount || !statAverage) return;

  const count = listForPeriod.length;
  const totalLocal = listForPeriod.reduce((sum, exp) => sum + exp.amount, 0);
  const avg = count === 0 ? 0 : Math.round(totalLocal / count);

  statCount.textContent = count;
  statAverage.textContent = `₹${avg}`;

  drawCategoryPie(categoryMap);
}

function drawCategoryPie(categoryMap) {
  if (!pieSvg) return;

  pieSvg.innerHTML = "";

  const data = [
    { key: "Food", color: "rgba(217, 138, 107, 1)" },
    { key: "Rent", color: "rgba(185, 162, 146, 1)" },
    { key: "Travel", color: "rgba(146, 166, 107, 1)" },
    { key: "Other", color: "rgba(201, 186, 163, 1)" },
  ];

  const values = data.map((d) => categoryMap[d.key] || 0);
  const totalValue = values.reduce((s, v) => s + v, 0);

  if (totalValue === 0) {
    return; // nothing to draw
  }

  let cumulative = 0;
  const cx = 50;
  const cy = 50;
  const r = 40;

  data.forEach((d, i) => {
    const value = values[i];
    if (value <= 0) return;

    const startAngle = (cumulative / totalValue) * 2 * Math.PI;
    const endAngle = ((cumulative + value) / totalValue) * 2 * Math.PI;
    cumulative += value;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path.setAttribute("d", pathData);
    path.setAttribute("fill", d.color);

    pieSvg.appendChild(path);
  });
}

function saveExpensesToStorage() {
  localStorage.setItem("fairify_expenses", JSON.stringify(expenses));
}

function loadExpensesFromStorage() {
  const data = localStorage.getItem("fairify_expenses");
  if (!data) {
    // still show empty summary/overview
    updateCategorySummary([]);
    return;
  }

  expenses = JSON.parse(data);
  expenses.forEach(renderExpense);
  updateTotal();
}

/* ---------- Month arrows ---------- */

if (monthPrevBtn && monthNextBtn) {
  monthPrevBtn.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    updateMonthLabel();
    updateTotal();
  });

  monthNextBtn.addEventListener("click", () => {
    const nextMonth = viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;

    if (
      nextYear > currentYear ||
      (nextYear === currentYear && nextMonth > currentMonth)
    ) {
      return;
    }

    viewMonth = nextMonth;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }

    updateMonthLabel();
    updateTotal();
  });
}

/* ---------- Groups logic (simple list for now) ---------- */

groupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = groupNameInput.value.trim();
  if (!name) return;

  const group = {
    id: Date.now(),
    name,
    createdAt: new Date().toISOString(),
  };

  groups.push(group);
  renderGroup(group);
  saveGroupsToStorage();

  groupNameInput.value = "";
});

function renderGroup(group) {
  const li = document.createElement("li");
  li.className = "group-item";
  li.dataset.id = group.id;

  const nameSpan = document.createElement("span");
  nameSpan.className = "group-name";
  nameSpan.textContent = group.name;

  const meta = document.createElement("span");
  meta.className = "group-meta";
  meta.textContent = "0 expenses";

  li.appendChild(nameSpan);
  li.appendChild(meta);
  groupList.appendChild(li);
}

function saveGroupsToStorage() {
  localStorage.setItem("fairify_groups", JSON.stringify(groups));
}

function loadGroupsFromStorage() {
  const data = localStorage.getItem("fairify_groups");
  if (!data) return;

  groups = JSON.parse(data);
  groups.forEach(renderGroup);
}
