# Kavita Uchila — plano de web audiovisual

## Direção escolhida

**Movimento:** editorial brutalista audiovisual, reinterpretado para uma marca própria e não para copiar a referência.

**Princípios:** 1) contraste radical entre preto e amarelo-lima; 2) tipografia como imagem; 3) vídeo tratado como matéria viva da interface; 4) interação simples, com feedback imediato.

**Filosofia de cor:** o preto cria palco e silêncio; o amarelo-lima é a assinatura energética da marca e deve ocupar áreas grandes, não apenas funcionar como detalhe.

**Paradigma de layout:** composição assimétrica em camadas, com uma coluna tipográfica dominante e cartões de vídeo que entram no campo como janelas editoriais. A grelha aparece como sistema invisível, mas a composição deve evitar um dashboard centralizado.

**Elementos assinatura:** wordmark KAVITA UCHILA com marca circular/sorriso desenhada em CSS; rabiscos amarelo-lima gigantes no fundo; cursor com retícula/etiqueta e cartões de vídeo que respondem à posição do rato.

**Interação:** no desktop, mover o rato sobre itens de trabalho revela vídeo e informação; clicar navega suavemente para a secção. No toque, cada cartão funciona como toggle explícito e apenas um vídeo pode tocar em simultâneo.

**Animação:** entrada por clip-path e deslocação curta; títulos com tracking apertado; hover com expansão e deslocação; cortes secos entre vídeos; glitch curto apenas em mudanças de secção; inversão preto/amarelo na secção Contact; respeito por `prefers-reduced-motion`.

**Tipografia:** usar uma sans-serif grotesca de sistema/Google Fonts como `Space Grotesk` para títulos e `DM Mono` para microdados, com fallback local. Títulos em uppercase, peso 700–800 e `clamp()` agressivo; metadados em mono, pequenos e espaçados.

**Essência da marca:** Kavita Uchila transforma pessoas, música e movimento em imagens com atitude editorial. Personalidade: elétrica, humana, autoral.

**Voz:** frases curtas, seguras e sensoriais. Exemplos: “IMAGE WITH A PULSE.” e “MAKE THE FRAME MOVE.”

**Wordmark:** KAVITA UCHILA em sans pesada, com o “O”/marcador de navegação substituído por um círculo sorridente simples; não usar o logótipo proprietário da referência.

**Cor proprietária:** amarelo-lima fluorescente `#E9FF2F`, aplicado contra `#080808` e com preto `#080808` sobre o amarelo.

## Escopo

- Single-page responsiva com Home, Work, About e Contact.
- Endpoint de servidor `/api/videos` que consulta Pixabay usando o segredo `PIXABAY_API_KEY`; a chave nunca chega ao cliente.
- Fallback local de URLs públicas de vídeo caso a API esteja indisponível.
- Seis cartões de trabalho, poucos vídeos e apenas uma reprodução ativa.
- Hover/mouse no desktop; toque no telemóvel; vídeos muted, playsInline e com poster/gradiente.
- Navegação por âncoras, CTA de contacto, email e telefone clicáveis.
- Manifeste de rotas em `client/public/manus-routes.json`.

## Estrutura

- `client/src/pages/Home.tsx`: composição e interação principal.
- `client/src/index.css`: tokens, tipografia, layouts, transições, estados hover e media queries.
- `server/_core/index.ts`: rota `/api/videos` e health endpoint.
- `client/public/manus-routes.json`: rotas públicas conhecidas.
- `app.config.ts`: metadados de logo do projeto quando houver asset durável.

## Performance

- Consultar a API no servidor e limitar os resultados.
- Usar apenas um `<video>` ativo por vez.
- `preload="metadata"` e `loading="lazy"`/IntersectionObserver quando aplicável.
- Em hover, iniciar apenas após intenção curta; pausar e resetar o vídeo anterior.
- Manter fundos gráficos em CSS, não em vídeos adicionais.
- Fornecer fallback visual mesmo sem rede.
