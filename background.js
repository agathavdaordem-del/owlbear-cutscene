import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";
import { CH_PLAY, CH_STOP, MODAL_ID, isHttpUrl } from "./shared.js";

// Roda em segundo plano para TODOS os jogadores da sala.
// Quando o mestre manda "play", abre a cutscene em tela cheia.
OBR.onReady(() => {
  OBR.broadcast.onMessage(CH_PLAY, async (event) => {
    const cfg = event.data;
    if (!cfg || !isHttpUrl(cfg.url)) return;

    // Se já houver uma cutscene aberta, fecha antes de abrir a nova.
    try {
      await OBR.modal.close(MODAL_ID);
    } catch {
      /* nada aberto */
    }

    const params = new URLSearchParams({
      url: cfg.url,
      caption: String(cfg.caption ?? "").slice(0, 200),
      duration: String(Number(cfg.duration) || 0),
      fit: cfg.fit === "cover" ? "cover" : "contain",
      bg: cfg.bg === "dim" ? "dim" : "black",
      bars: cfg.bars ? "1" : "0",
      lock: cfg.lock ? "1" : "0",
    });

    await OBR.modal.open({
      id: MODAL_ID,
      url: new URL(`cutscene.html?${params}`, import.meta.url).href,
      fullScreen: true,
      hidePaper: true,
      hideBackdrop: true,
    });
  });

  // A própria cutscene faz fade-out ao receber "stop".
  // Este fechamento é só uma garantia caso ela não responda.
  OBR.broadcast.onMessage(CH_STOP, () => {
    setTimeout(() => OBR.modal.close(MODAL_ID).catch(() => {}), 1500);
  });
});
