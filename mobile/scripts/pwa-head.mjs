/**
 * Injeta as tags de PWA no index.html gerado pelo `expo export -p web`.
 *
 * Por que um script e não o `app/+html.tsx`: aquele arquivo só é usado quando
 * `web.output` é "static". Este projeto usa "single" (SPA), e nesse modo o
 * Expo monta o HTML a partir de um template fixo, ignorando o +html.tsx.
 *
 * Trocar para "static" resolveria, mas mudaria como o app inteiro é gerado e
 * hidratado — risco desproporcional para adicionar quatro tags num app que já
 * funciona.
 *
 * Idempotente: rodar duas vezes não duplica nada.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const arquivo = join(process.cwd(), 'dist', 'index.html')

if (!existsSync(arquivo)) {
  console.error('[pwa] dist/index.html não existe — rode o export antes.')
  process.exit(1)
}

let html = readFileSync(arquivo, 'utf8')

if (html.includes('rel="manifest"')) {
  console.log('[pwa] tags já presentes, nada a fazer.')
  process.exit(0)
}

const tags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#2B7E23" />
    <meta name="description" content="Peça pelo celular e retire no balcão sem pegar fila." />
    <!-- O iOS ignora o manifest: nome, ícone e tela cheia vêm daqui. -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="iFoodies" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <script>
      // Depois do load para não disputar banda com o bundle na primeira
      // visita, que é justamente a que precisa ser rápida.
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
      }
    </script>
  `

// O idioma do template vem "en" e este app é inteiro em português.
html = html.replace('<html lang="en">', '<html lang="pt-BR">')
html = html.replace('<title>ifoodies-app</title>', '<title>iFoodies — Cantina</title>')
html = html.replace('</head>', `${tags}</head>`)

writeFileSync(arquivo, html)
console.log('[pwa] manifest, tema, metas do iOS e service worker injetados.')
