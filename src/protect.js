// Dissuasão: dificulta cópia casual. Não impede quem tenha conhecimentos técnicos.
const isField = t => t && t.closest && t.closest('input,textarea');
const stop = e => { if (!isField(e.target)) e.preventDefault(); };

['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach(ev =>
  document.addEventListener(ev, stop, { capture: true }));

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  const mod = e.ctrlKey || e.metaKey;
  const bad =
    k === 'f12' ||
    (mod && ['u', 's', 'p'].includes(k)) ||
    (mod && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||
    (mod && e.altKey && ['i', 'j', 'c', 'u'].includes(k)) ||
    (mod && ['c', 'x', 'a'].includes(k) && !isField(e.target));
  if (bad) { e.preventDefault(); e.stopPropagation(); }
}, true);

document.addEventListener('keyup', e => {
  if (e.key === 'PrintScreen') {
    document.body.classList.add('shield');
    try { navigator.clipboard.writeText(''); } catch (_) {}
    setTimeout(() => document.body.classList.remove('shield'), 1500);
  }
});

// Esconde o conteúdo quando a janela perde o foco (ferramentas de captura)
const hide = () => document.body.classList.add('shield');
const show = () => document.body.classList.remove('shield');
window.addEventListener('blur', hide);
window.addEventListener('focus', show);
document.addEventListener('visibilitychange', () => document.hidden ? hide() : show());

document.querySelectorAll('img').forEach(i => { i.draggable = false; });
