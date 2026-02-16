const input = document.getElementById("locationInput");
const result = document.getElementById("result");
const addPanel = document.getElementById("addPanel");
const newCode = document.getElementById("newCode");
const metricsEl = document.getElementById("metrics");

// Manage screen elements
const screenMain = document.getElementById("screenMain");
const screenManage = document.getElementById("screenManage");
const manageBtn = document.getElementById("manageBtn");
const backBtn = document.getElementById("backBtn");
const manageMetricsEl = document.getElementById("manageMetrics");
const listEl = document.getElementById("list");
const filterInput = document.getElementById("filterInput");
const bulkInput = document.getElementById("bulkInput");
const importBtn = document.getElementById("importBtn");
const sampleBtn = document.getElementById("sampleBtn");
const lastImportEl = document.getElementById("lastImport");
const importResult = document.getElementById("importResult");
const exportBtn = document.getElementById("exportBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// File import controls
const importFileBtn = document.getElementById("importFileBtn");
const importFile = document.getElementById("importFile");

function handleFileText(text) {
  if (!text) return;
  bulkInput.value = text;
  importBtn.click();
}

importFileBtn.onclick = () => importFile.click();

importFile.onchange = () => {
  const file = importFile.files && importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    handleFileText(String(reader.result || ""));
    importFile.value = "";
  };
  reader.readAsText(file);
};

// Storage keys
const KEY_STORE = "yard_store";
const KEY_SEARCHES = "yard_searches";
const KEY_LAST_IMPORT = "yard_last_import";

// Store format:
//  - legacy: { "LOC": "CODE" }
//  - current: { "LOC": { code: "CODE", updated: "ISO" } }
let store = JSON.parse(localStorage.getItem(KEY_STORE) || "{}");
let searches = Number(localStorage.getItem(KEY_SEARCHES) || 0);

function nowIso() {
  return new Date().toISOString();
}

function normalizeEntry(value) {
  if (value && typeof value === "object" && typeof value.code === "string") return value;
  if (typeof value === "string") return { code: value, updated: null };
  return null;
}

function getCodeFor(loc) {
  if (!loc) return null;

  const key = loc.toLowerCase();

  for (const existing in store) {
    if (existing.toLowerCase() === key) {
      return store[existing]?.code || null;
    }
  }

  return null;
}

function setEntry(loc, code) {
  store[loc] = { code, updated: nowIso() };
}

function persistStore() {
  localStorage.setItem(KEY_STORE, JSON.stringify(store));
}

function countLocations() {
  return Object.keys(store).length;
}

function updateMetrics() {
  const text = `Gate Locations: ${countLocations()} • Searches: ${searches}`;
  metricsEl.textContent = text;
  manageMetricsEl.textContent = text;
}

function showResult(kind, text) {
  result.classList.remove("hidden", "success", "missing");
  result.classList.add(kind);
  result.textContent = text;
}

function hideResult() {
  result.classList.add("hidden");
  result.classList.remove("success", "missing");
  result.textContent = "";
}

function showImportResult(kind, text) {
  importResult.classList.remove("hidden", "success", "missing");
  importResult.classList.add(kind);
  importResult.textContent = text;
}

function hideImportResult() {
  importResult.classList.add("hidden");
  importResult.classList.remove("success", "missing");
  importResult.textContent = "";
}

function formatLastImport() {
  const iso = localStorage.getItem(KEY_LAST_IMPORT);
  if (!iso) return "Last import: —";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Last import: —";
    return "Last import: " + d.toLocaleString();
  } catch {
    return "Last import: —";
  }
}

function syncLastImportUI() {
  lastImportEl.textContent = formatLastImport();
}

function switchToManage() {
  screenMain.classList.add("hidden");
  screenManage.classList.remove("hidden");
  hideImportResult();
  syncLastImportUI();
  renderList();
  filterInput.value = "";
  filterInput.focus();
}

function switchToMain() {
  screenManage.classList.add("hidden");
  screenMain.classList.remove("hidden");
  hideImportResult();
  input.focus();
}

function safeTrim(s) {
  return (s || "").toString().trim();
}

function parseBulkLines(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const pairs = [];

  for (const line of lines) {
    // allow comments
    if (line.startsWith("#") || line.startsWith("//")) continue;

    let loc = "";
    let code = "";

    if (line.includes(",")) {
      const parts = line.split(",");
      loc = safeTrim(parts[0]);
      code = safeTrim(parts.slice(1).join(","));
    } else if (line.includes("=")) {
      const parts = line.split("=");
      loc = safeTrim(parts[0]);
      code = safeTrim(parts.slice(1).join("="));
    } else if (line.includes("\t")) {
      const parts = line.split("\t");
      loc = safeTrim(parts[0]);
      code = safeTrim(parts.slice(1).join("\t"));
    } else {
      // single token lines are ignored (needs delimiter)
      continue;
    }

    if (!loc || !code) continue;
    pairs.push([loc, code]);
  }

  return pairs;
}

function exportAll() {
  const rows = Object.keys(store)
    .sort((a,b) => a.localeCompare(b))
    .map(loc => {
      const entry = normalizeEntry(store[loc]);
      const code = entry ? entry.code : "";
      return `${loc}, ${code}`;
    });

  const text = rows.join("\n");
  // Clipboard first (best UX)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showImportResult("success", "Export copied to clipboard.");
    }).catch(() => {
      fallbackDownload(text);
    });
  } else {
    fallbackDownload(text);
  }
}

function fallbackDownload(text) {
  try {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yard_gate_locations_export.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showImportResult("success", "Export downloaded.");
  } catch {
    showImportResult("missing", "Export failed on this device.");
  }
}

function renderList() {
  const filter = safeTrim(filterInput.value).toLowerCase();
  const keys = Object.keys(store).sort((a,b) => a.localeCompare(b));

  const filtered = filter
    ? keys.filter(k => k.toLowerCase().includes(filter))
    : keys;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="muted">No saved gate locations found.</div>`;
    return;
  }

  listEl.innerHTML = "";
  for (const loc of filtered) {
    const entry = normalizeEntry(store[loc]);
    const code = entry ? entry.code : "";

    const row = document.createElement("div");
    row.className = "item";

    const left = document.createElement("div");
    left.className = "itemLeft";

    const locEl = document.createElement("div");
    locEl.className = "loc";
    locEl.textContent = loc;

    const codeEl = document.createElement("div");
    codeEl.className = "code";
    codeEl.textContent = "Gate Code: " + code;

    left.appendChild(locEl);
    left.appendChild(codeEl);

    const actions = document.createElement("div");
    actions.className = "itemActions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn smallBtn";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const next = prompt(`Edit gate code for: ${loc}`, code);
      const newVal = safeTrim(next);
      if (!newVal) return;
      setEntry(loc, newVal);
      persistStore();
      updateMetrics();
      renderList();
      showImportResult("success", `Updated: ${loc}`);
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn smallBtn smallBtnDanger";
    delBtn.type = "button";
    delBtn.textContent = "Del";
    delBtn.onclick = () => {
      const ok = confirm(`Delete gate location: ${loc}?`);
      if (!ok) return;
      delete store[loc];
      persistStore();
      updateMetrics();
      renderList();
      showImportResult("success", `Deleted: ${loc}`);
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    row.appendChild(left);
    row.appendChild(actions);

    listEl.appendChild(row);
  }
}


// CLEAR CURRENT RESULT BUTTON
const clearBtn=document.createElement("button");
clearBtn.textContent="Clear";
clearBtn.className="btn btnGhost";
clearBtn.onclick=()=>{
  input.value="";
  hideResult();
  addPanel.classList.add("hidden");
};
const _sb = document.getElementById("searchBtn");
  _sb.parentNode.insertBefore(clearBtn, _sb.nextSibling);

// MAIN SEARCH
document.getElementById("searchBtn").onclick = () => {
  const loc = safeTrim(input.value);
  if (!loc) return;

  searches++;
  localStorage.setItem(KEY_SEARCHES, searches);

  const code = getCodeFor(loc);

  if (code) {
    showResult("success", "Gate Code: " + code);
    addPanel.classList.add("hidden");
  } else {
    showResult("missing", "No code saved for this gate location. Add one below.");
    addPanel.classList.remove("hidden");
    newCode.value = "";
    newCode.focus();
  }

  updateMetrics();
};

// SAVE SINGLE
document.getElementById("saveBtn").onclick = () => {
  const loc = safeTrim(input.value);
  const code = safeTrim(newCode.value);
  if (!loc || !code) return;

  // enforce unique gate locations (no duplicates allowed)
if (getCodeFor(loc)) {
  showResult("missing", "Gate location already exists. Use Manage → Edit to change the code.");
  return;
}

  setEntry(loc, code);
  persistStore();

  showResult("success", "Saved. Gate Code: " + code);
  addPanel.classList.add("hidden");
  updateMetrics();
};

// CANCEL ADD
document.getElementById("cancelBtn").onclick = () => {
  addPanel.classList.add("hidden");
  hideResult();
};

// NAV
manageBtn.onclick = switchToManage;
backBtn.onclick = switchToMain;

filterInput.addEventListener("input", () => {
  renderList();
});

// BULK IMPORT
sampleBtn.onclick = () => {
  const ok = confirm("Reset search count to 0?");
  if (!ok) return;
  searches = 0;
  localStorage.setItem(KEY_SEARCHES, searches);
  updateMetrics();
  showImportResult("success", "Search count reset.");
};

importBtn.onclick = () => {
  const raw = bulkInput.value || "";
  const pairs = parseBulkLines(raw);

  if (pairs.length === 0) {
    showImportResult("missing", "No valid lines found. Use: LOCATION, CODE (one per line).");
    return;
  }

  let added = 0;
  let updated = 0;

  const seen = new Set();

for (const [loc, code] of pairs) {
  const key = loc.toLowerCase();

  // ignore duplicates (first entry wins, case-insensitive)
  if (seen.has(key) || getCodeFor(loc)) continue;

  seen.add(key);
  setEntry(loc, code);
  added++;
}

  persistStore();
  localStorage.setItem(KEY_LAST_IMPORT, nowIso());
  syncLastImportUI();

  updateMetrics();
  renderList();
  // Auto-scroll to updated list (Option B)
  try { listEl.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* ignore */ }
  bulkInput.value = "";
  showImportResult("success", `Import complete. Added: ${added} • Updated: ${updated}`);
};

// EXPORT
exportBtn.onclick = exportAll;

// CLEAR ALL
clearAllBtn.onclick = () => {
  const ok = confirm("Clear ALL saved gate locations on this device? This cannot be undone.");
  if (!ok) return;
  store = {};
  searches = 0;
  localStorage.removeItem(KEY_STORE);
  localStorage.removeItem(KEY_SEARCHES);
  localStorage.removeItem(KEY_LAST_IMPORT);
  updateMetrics();
  renderList();
  syncLastImportUI();
  showImportResult("success", "All local data cleared.");
};

// Initial UI boot
updateMetrics();
syncLastImportUI();
