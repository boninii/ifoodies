# Ícones do app

Fonte vetorial: `ifoodies-app-icon.svg` (512×512) — squircle verde-folha
`#8BD264` com o monograma "iF" e folhas nos cantos.

Os PNG em `mobile/public/icons/` são gerados a partir dela:

| Arquivo | Tamanho | Regra |
|---|---|---|
| `icon-192.png` | 192 | A arte como é, com cantos transparentes |
| `icon-512.png` | 512 | Idem — é ela que gera a splash |
| `icon-maskable.png` | 512 | Fundo sangrando até a borda, arte a 80% (410px) |
| `apple-touch-icon.png` | 180 | **Opaco** — o iOS põe preto atrás de transparência |

**A regra do maskable:** o Android recorta o ícone em formas diferentes e só
garante os 80% centrais. Por isso a versão maskable tem o fundo preenchido
até a borda e a arte encolhida — as folhas dos cantos podem ser cortadas, e
tudo bem, elas são decoração; o "iF" nunca é.

**O favicon é outro recorte.** A arte inteira vira mancha a 32px: as folhas
escuras dos cantos brigam com o monograma, que tem a mesma cor. O favicon
(`assets/images/favicon.png`) usa um recorte fechado só no "iF", medido pela
caixa real do monograma.
