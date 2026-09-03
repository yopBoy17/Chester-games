(() => {
  const CLIENT_VERSION = '2026.09.03.10';
  const CHECK_INTERVAL_MS = 60_000;
  let updateAvailable = false;
  let reloading = false;

  const style = document.createElement('style');
  style.textContent = `
    .app-update-button {
      position: fixed;
      right: max(16px, env(safe-area-inset-right));
      bottom: max(16px, env(safe-area-inset-bottom));
      z-index: 10000;
      display: none;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      border: 0;
      border-radius: 14px;
      background: #35ad70;
      color: #fff;
      font: 700 16px/1 system-ui, sans-serif;
      box-shadow: 0 6px 20px rgba(20, 75, 48, .28);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .app-update-button.is-visible { display: inline-flex; }
    .app-update-button:disabled { opacity: .7; cursor: default; }
  `;
  document.head.append(style);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'app-update-button';
  button.textContent = '↻ Обновить';
  button.setAttribute('aria-label', 'Обновить игру до новой версии');
  document.body.append(button);

  function showUpdate() {
    updateAvailable = true;
    button.classList.add('is-visible');
  }

  async function checkVersion() {
    try {
      const response = await fetch(`./version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) return;

      const { version } = await response.json();
      if (version && version !== CLIENT_VERSION) showUpdate();
    } catch {
      // Проверка повторится после восстановления соединения.
    }
  }

  async function activateUpdate() {
    if (reloading) return;
    reloading = true;
    button.disabled = true;
    button.textContent = 'Обновление…';

    window.dispatchEvent(new CustomEvent('factory:before-update'));

    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      await registration?.update();

      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        return;
      }

      if (registration?.installing) {
        registration.installing.addEventListener('statechange', (event) => {
          if (event.target.state === 'installed') {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }
        });
        return;
      }
    } catch {
      // Перезагрузка всё равно запросит актуальные файлы.
    }

    window.location.reload();
  }

  button.addEventListener('click', activateUpdate);

  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (!reloading) return;
    window.location.reload();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !updateAvailable) checkVersion();
  });

  checkVersion();
  window.setInterval(checkVersion, CHECK_INTERVAL_MS);
})();
