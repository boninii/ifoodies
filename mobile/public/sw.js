/**
 * Service worker do iFoodies.
 *
 * Deliberadamente pequeno. O app depende da API para tudo — cardápio, pedidos,
 * status —, então não existe "usar offline": o que o cache entrega é o app
 * ABRIR sem rede e dizer que precisa de conexão, em vez de uma tela de erro
 * do navegador.
 *
 * Duas decisões que evitam as armadilhas clássicas de PWA:
 *
 * 1. Navegação é NETWORK-FIRST. Cache-first congelaria o app numa versão
 *    velha até alguém lembrar de trocar o nome do cache — o problema que
 *    obriga todo mundo a virar "v2", "v3"...
 *
 * 2. O cache do shell é montado item a item, não com addAll(). O addAll é
 *    atômico: um único 404 na lista derruba a instalação inteira, calada.
 */
const CACHE = 'ifoodies-shell-v1'

/** Só o mínimo para a tela abrir. Nada de bundle aqui. */
const SHELL = ['/', '/manifest.json', '/favicon.ico']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Um item que falha não pode levar os outros junto.
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => null))),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // A API vive em outro domínio e não é assunto do cache. Interceptar chamada
  // de pedido ou de pagamento seria a pior coisa que este arquivo poderia fazer.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Os bundles do Expo têm hash no nome: quando o conteúdo muda, a URL muda.
  // Por isso cache-first aqui é seguro — e nunca serve conteúdo velho.
  if (url.pathname.startsWith('/_expo/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cacheado) =>
          cacheado ||
          fetch(request).then((resposta) => {
            if (resposta.ok) {
              const copia = resposta.clone()
              caches.open(CACHE).then((cache) => cache.put(request, copia))
            }
            return resposta
          }),
      ),
    )
    return
  }

  // Navegação: rede primeiro, cache só quando ela falha.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone()
            caches.open(CACHE).then((cache) => cache.put('/', copia))
          }
          return resposta
        })
        .catch(() => caches.match('/').then((r) => r || Response.error())),
    )
  }
})
