// Constantes compartilhadas entre background, popover e cutscene.
export const SDK_URL = "https://esm.sh/@owlbear-rodeo/sdk@3";

export const NS = "com.mesa.cutscene";
export const CH_PLAY = `${NS}/play`;
export const CH_STOP = `${NS}/stop`;
export const MODAL_ID = `${NS}/modal`;
export const PRESETS_KEY = `${NS}/presets`;

export const MAX_PRESETS = 40;

export function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
