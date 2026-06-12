/**
 * Registro do service worker — registra apenas em produção e em contexto seguro
 * (HTTPS ou localhost). Inclui detecção de update disponível e suporte a callback
 * para o app exibir UI de "nova versão disponível, recarregar".
 */

const isLocalhost = Boolean(
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(/^127(?:\.\d+){3}$/))
);

export function register(config = {}) {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const publicUrl = new URL(process.env.PUBLIC_URL || "/", window.location.href);
  if (publicUrl.origin !== window.location.origin) {
    // PUBLIC_URL aponta para outra origem — service workers só funcionam same-origin.
    return;
  }

  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL || ""}/service-worker.js`;

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
    } else {
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // Update disponível
              if (typeof config.onUpdate === "function") config.onUpdate(registration);
            } else {
              // Primeira instalação
              if (typeof config.onSuccess === "function") config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((err) => {
      console.error("[SW] erro ao registrar:", err);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type") || "";
      if (response.status === 404 || !contentType.includes("javascript")) {
        // SW não encontrado — limpa registro antigo se houver
        navigator.serviceWorker.ready.then((reg) => {
          reg.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.warn("[SW] sem conexão durante registro — pulando.");
    });
}

export function unregister() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => reg.unregister())
    .catch((err) => console.error("[SW] erro ao desregistrar:", err));
}
