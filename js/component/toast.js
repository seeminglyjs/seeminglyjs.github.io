// toast.js
(function(){
  const DEFAULT_DURATION = 4000;
  const containerMap = new Map();
  const POSITIONS = ['top-right','top-left','bottom-right','bottom-left','top-center','bottom-center'];

  function getContainer(position = 'top-right') {
    if (!POSITIONS.includes(position)) position = 'top-right';
    if (containerMap.has(position)) return containerMap.get(position);

    const c = document.createElement('div');
    c.className = 'toast-container ' + position;
    document.body.appendChild(c);
    containerMap.set(position, c);
    return c;
  }

  window.showToast = function(message, opts = {}) {
    const type = opts.type || 'info';
    const duration = Number.isFinite(opts.duration) ? opts.duration : DEFAULT_DURATION;
    const position = opts.position || 'top-right';
    const title = opts.title || (type === 'success' ? '완료' : type === 'error' ? '오류' : type === 'warning' ? '경고' : '알림');
    const container = getContainer(position);

    const toast = document.createElement('div');
    toast.className = `toast toast--${type} toast-enter`;
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.innerText = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i';

    const content = document.createElement('div');
    content.className = 'content';
    const t = document.createElement('div'); t.className = 'title'; t.innerText = title;
    const m = document.createElement('div'); m.className = 'message'; m.innerText = message;
    content.appendChild(t); content.appendChild(m);

    const close = document.createElement('button');
    close.className = 'close-btn'; close.innerHTML = '×';
    close.onclick = () => removeToast(toast);

    const progressWrap = document.createElement('div');
    progressWrap.className = 'progress';
    const progressBar = document.createElement('i');
    progressWrap.appendChild(progressBar);

    toast.appendChild(icon); toast.appendChild(content); toast.appendChild(close); toast.appendChild(progressWrap);

    const isTop = position.startsWith('top');
    if (isTop) container.prepend(toast); else container.appendChild(toast);

    let startTime = Date.now(), remaining = duration, timerId = null, isRemoved = false;

    if (duration > 0) {
      progressBar.style.transition = `transform ${duration}ms linear`;
      requestAnimationFrame(() => { progressBar.style.transform = 'scaleX(0)'; });
    } else { progressBar.style.display = 'none'; }

    function startTimer() {
      if (duration <= 0) return;
      startTime = Date.now();
      timerId = setTimeout(() => removeToast(toast), remaining);
    }
    function pauseTimer() {
      if (timerId) {
        clearTimeout(timerId); timerId = null;
        remaining -= (Date.now() - startTime);
        const elapsed = Math.max(0, duration - remaining);
        progressBar.style.transition = '';
        const ratio = Math.max(0, 1 - elapsed / duration);
        progressBar.style.transform = `scaleX(${ratio})`;
      }
    }

    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', () => {
      if (duration > 0 && remaining > 0) {
        void progressBar.offsetWidth;
        progressBar.style.transition = `transform ${remaining}ms linear`;
        progressBar.style.transform = 'scaleX(0)';
      }
      startTimer();
    });

    startTimer();

    function removeToast(node) {
      if (isRemoved) return; isRemoved = true;
      if (timerId) clearTimeout(timerId);
      node.classList.remove('toast-enter'); node.classList.add('toast-leave');
      node.addEventListener('animationend', () => node.remove(), { once: true });
    }

    return { toast, remove: () => removeToast(toast) };
  };

  window.toastSuccess = (msg, opts) => showToast(msg, {...opts, type:'success'});
  window.toastError   = (msg, opts) => showToast(msg, {...opts, type:'error'});
  window.toastInfo    = (msg, opts) => showToast(msg, {...opts, type:'info'});
  window.toastWarn    = (msg, opts) => showToast(msg, {...opts, type:'warning'});
})();
