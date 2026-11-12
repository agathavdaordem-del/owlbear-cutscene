import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";
import { CH_PLAY, CH_STOP, PRESETS_KEY, MAX_PRESETS, isHttpUrl } from "./shared.js";

const $ = (id) => document.getElementById(id);

let presets = [];
let statusTimer = null;

function say(message, isError = false) {
  const el = $("status");
  el.textContent = message;
  el.className = isError ? "err" : "";
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (el.textContent = ""), 3500);
}

function readForm() {
  return {
    url: $("url").value.trim(),
    caption: $("caption").value.trim(),
    duration: Math.max(0, Number($("duration").value) || 0),
    fit: $("fit").value,
    bg: $("bg").value,
    bars: $("bars").checked,
    lock: $("lock").checked,
  };
}

function fillForm(cfg) {
  $("url").value = cfg.url || "";
  $("caption").value = cfg.caption || "";
  $("duration").value = cfg.duration ?? 8;
  $("fit").value = cfg.fit || "contain";
  $("bg").value = cfg.bg || "black";
  $("bars").checked = !!cfg.bars;
  $("lock").checked = !!cfg.lock;
  updatePreview();
}

function updatePreview() {
  const box = $("preview");
  const url = $("url").value.trim();
  box.textContent = "Pré-visualização";
  if (!isHttpUrl(url)) return;
  const img = new Image();
  img.referrerPolicy = "no-referrer";
  img.onload = () => {
    box.textContent = "";
    box.appendChild(img);
  };
  img.onerror = () => (box.textContent = "Não consegui carregar esse link");
  img.src = url;
}

async function play(cfg) {
  if (!isHttpUrl(cfg.url)) {
    say("Cole um link http(s) direto para a imagem ou GIF.", true);
    return;
  }
  await OBR.broadcast.sendMessage(CH_PLAY, cfg, { destination: "ALL" });
  say("Cutscene enviada para a mesa.");
}

async function stop() {
  await OBR.broadcast.sendMessage(CH_STOP, { at: Date.now() }, { destination: "ALL" });
  say("Cutscene encerrada.");
}

function nameFor(cfg) {
  if (cfg.caption) return cfg.caption;
  try {
    const last = new URL(cfg.url).pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : new URL(cfg.url).hostname;
  } catch {
    return "Cutscene";
  }
}

async function savePresets(next) {
  presets = next;
  await OBR.room.setMetadata({ [PRESETS_KEY]: presets });
  renderPresets();
}

async function saveCurrent() {
  const cfg = readForm();
  if (!isHttpUrl(cfg.url)) {
    say("Cole um link válido antes de salvar.", true);
    return;
  }
  if (presets.length >= MAX_PRESETS) {
    say(`Limite de ${MAX_PRESETS} atalhos atingido.`, true);
    return;
  }
  const preset = { id: String(Date.now()), name: nameFor(cfg), ...cfg };
  try {
    await savePresets([...presets, preset]);
    say("Atalho salvo.");
  } catch {
    say("Não foi possível salvar (limite de dados da sala?).", true);
  }
}

function renderPresets() {
  const list = $("presets");
  list.textContent = "";
  if (!presets.length) {
    const empty = document.createElement("div");
    empty.id = "empty";
    empty.textContent = "Nenhum atalho ainda.";
    list.appendChild(empty);
    return;
  }
  for (const p of presets) {
    const row = document.createElement("div");
    row.className = "preset";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = p.name;
    name.title = p.url;

    const playBtn = document.createElement("button");
    playBtn.textContent = "▶";
    playBtn.title = "Reproduzir";
    playBtn.onclick = () => play(p);

    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.title = "Carregar no formulário";
    editBtn.onclick = () => fillForm(p);

    const delBtn = document.createElement("button");
    delBtn.className = "danger";
    delBtn.textContent = "✕";
    delBtn.title = "Excluir";
    delBtn.onclick = () => savePresets(presets.filter((x) => x.id !== p.id));

    row.append(name, playBtn, editBtn, delBtn);
    list.appendChild(row);
  }
}

function applyTheme(theme) {
  const root = document.documentElement.style;
  if (theme?.text?.primary) root.setProperty("--text", theme.text.primary);
  if (theme?.text?.secondary) root.setProperty("--muted", theme.text.secondary);
  if (theme?.primary?.main) root.setProperty("--accent", theme.primary.main);
  if (theme?.mode === "LIGHT") {
    root.setProperty("--line", "rgba(0,0,0,0.2)");
    root.setProperty("--field", "rgba(0,0,0,0.06)");
  }
}

OBR.onReady(async () => {
  OBR.theme.getTheme().then(applyTheme);
  OBR.theme.onChange(applyTheme);

  const role = await OBR.player.getRole();
  if (role !== "GM") {
    $("blocked").style.display = "block";
    return;
  }
  $("app").hidden = false;

  const meta = await OBR.room.getMetadata();
  presets = Array.isArray(meta[PRESETS_KEY]) ? meta[PRESETS_KEY] : [];
  renderPresets();
  OBR.room.onMetadataChange((m) => {
    presets = Array.isArray(m[PRESETS_KEY]) ? m[PRESETS_KEY] : [];
    renderPresets();
  });

  $("url").addEventListener("input", updatePreview);
  $("url").addEventListener("keydown", (e) => {
    if (e.key === "Enter") play(readForm());
  });
  $("play").onclick = () => play(readForm());
  $("stop").onclick = stop;
  $("save").onclick = saveCurrent;
});
