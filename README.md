# Cutscene — extensão para Owlbear Rodeo

O mestre cola o link de um GIF ou imagem, clica em **Reproduzir**, e a imagem aparece em tela cheia
para todos os jogadores da sala, com fade, barras de cinema e legenda opcionais.

## Como usar (mestre)

1. Abra o ícone de claquete 🎬 na barra de ferramentas.
2. Cole o **link direto** da imagem/GIF (termina em `.gif`, `.png`, `.webp`, `.jpg`…).
   Serve Giphy ("Copy Image Address"), Imgur (`i.imgur.com/...`), Discord CDN, seu próprio site etc.
3. Ajuste duração, legenda, ajuste da imagem, fundo e barras.
4. **▶ Reproduzir** para todos. **■ Parar** encerra com fade-out.
5. **★ Salvar como atalho** guarda a cutscene na sala para tocar depois com um clique.

Jogadores só veem a cutscene; o painel é exclusivo do mestre.

## Publicar (precisa de HTTPS)

Suba a pasta inteira em qualquer hospedagem estática na **raiz** do domínio:
Cloudflare Pages, Netlify, Vercel ou GitHub Pages (`usuario.github.io`).
O arquivo `_headers` já libera o CORS no Netlify e no Cloudflare Pages.

> GitHub Pages de projeto (`usuario.github.io/repo/`): troque os caminhos do `manifest.json`
> para `/repo/icon.svg`, `/repo/popover.html` e `/repo/background.html`.

## Instalar no Owlbear Rodeo

Perfil → **Extensions** → **Add Extension** → cole `https://SEU-SITE/manifest.json`.

**Todos os jogadores precisam ter a extensão instalada** para receber a cutscene
(é o *background* dela que abre a tela cheia em cada navegador).

## Testar localmente

```bash
cd owlbear-cutscene
python3 -m http.server 5173
```

Instale com `http://localhost:5173/manifest.json`.

## Observações

- O SDK é carregado de `esm.sh` (sem etapa de build). Se preferir empacotar, rode
  `npm i @owlbear-rodeo/sdk` e troque os `import` de `https://esm.sh/...` por `@owlbear-rodeo/sdk`.
- Arquivos locais não funcionam: o Owlbear não hospeda mídia para extensões, então use um link.
- GIFs muito pesados demoram a carregar em cada jogador; a cutscene mostra um indicador de carregamento.
- Atalhos ficam nos metadados da sala (limite de 40 aqui para não estourar o limite de dados do Owlbear).
