const API = window.BACKEND_URL || "http://localhost:5000";

async function checkHealth() {
  const el = document.getElementById("status");
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    el.textContent = `Backend v${data.version} — OK`;
    el.className = "ok";
  } catch {
    el.textContent = "Backend unreachable";
    el.className = "err";
  }
}

async function loadItems() {
  const list = document.getElementById("item-list");
  try {
    const res = await fetch(`${API}/api/items`);
    const items = await res.json();
    if (!items.length) {
      list.innerHTML = "<li><span>No items yet.</span></li>";
      return;
    }
    list.innerHTML = items.map(item => `
      <li data-id="${item.id}">
        <span class="${item.done ? "done" : ""}">${item.name}</span>
        <button class="btn-toggle" onclick="toggleItem('${item.id}')">${item.done ? "Undo" : "Done"}</button>
        <button class="btn-del" onclick="deleteItem('${item.id}')">Delete</button>
      </li>
    `).join("");
  } catch {
    list.innerHTML = "<li><span>Failed to load items.</span></li>";
  }
}

async function toggleItem(id) {
  await fetch(`${API}/api/items/${id}`, { method: "PATCH" });
  loadItems();
}

async function deleteItem(id) {
  await fetch(`${API}/api/items/${id}`, { method: "DELETE" });
  loadItems();
}

document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("item-input");
  const errEl = document.getElementById("error");
  errEl.textContent = "";
  try {
    const res = await fetch(`${API}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: input.value }),
    });
    if (!res.ok) {
      const data = await res.json();
      errEl.textContent = data.error || "Failed to add item";
      return;
    }
    input.value = "";
    loadItems();
  } catch {
    errEl.textContent = "Request failed";
  }
});

checkHealth();
loadItems();
setInterval(checkHealth, 30000);
