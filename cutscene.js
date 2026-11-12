import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";
import { CH_STOP, MODAL_ID, isHttpUrl } from "./shared.js";

const q = new URLSearchParams(location.search);
const url = q.get("url") || "";
const caption = q.get("caption") || "";
const duration = Math.max(0, Number(q.get("duration")) || 0);
const fit = q.get("fit") === "cover" ? "cover" : "contain";
const bg = q.get("bg") === "dim" ? "dim" : "black";
const bars = q.get("bars") === "1";
const lock = q.get("lock") === "1";

const stage = document.getElementById("stage");
const img = document.getElementById("img");
const loader = document.getElementById("loader");
const hint = document.getElementById("hint");

let closing = false;
let timer = null;
let canClose = true;

function close() {
  if (closing) return;
  closing = true;
  clearTimeout(timer);
  stage.classList.remove("on");
  setTimeout(() => OBR.modal.close(MODAL_ID).catch(() => {}), 650);
}

function fail(message) {
  loader.textContent = message;
  setTimeout(close, 2500);
  stage.classList.add("on");
}

OBR.onReady(async () => {
  const role = await OBR.player.getRole();
  // O mestre sempre pode fechar. Jogadores só se o mestre permitiu.
  canClose = role === "GM" || !lock;
  if (canClose) hint.style.display = "block";

  OBR.broadcast.onMessage(CH_STOP, close);

  if (canClose) {
    stage.addEventListener("click", close);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  if (!isHttpUrl(url)) {
    fail("Link inválido.");
    return;
  }

  stage.classList.toggle("dim", bg === "dim");
  stage.classList.toggle("cover", fit === "cover");

  if (caption) {
    document.getElementById("caption").textContent = caption;
    if (!bars) document.getElementById("captionFloat").textContent = caption;
  }

  img.onload = () => {
    loader.style.display = "none";
    img.style.display = "block";
    // Dois frames para a transição de opacidade disparar de verdade.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        stage.classList.add("on");
        stage.classList.toggle("bars", bars);
      })
    );
    if (duration > 0) timer = setTimeout(close, duration * 1000);
  };
  img.onerror = () => fail("Não consegui carregar a imagem.");
  img.referrerPolicy = "no-referrer";
  img.src = url;

  stage.classList.add("on");
});
