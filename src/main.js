import './protect.js';

const $ = id => document.getElementById(id);
const wa = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
const waUrl = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Olá! Gostaria de mais informações.');

// Redes sociais do rodapé = as do contacto
const fs = document.querySelector('footer .social');
const cs = document.querySelector('.contact .social');
if (fs && cs) fs.innerHTML = cs.innerHTML;
// WhatsApp (botão flutuante + ícones sociais)
document.querySelectorAll('[data-wa]').forEach(a => { a.href = waUrl; });

// Formulário
const form = $('cf'), msg = $('fmsg'), t0 = Date.now();
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true; msg.textContent = 'A enviar…';
  try {
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n: form.n.value, e: form.e.value, m: form.m.value, site: form.site.value, t: Date.now() - t0 })
    });
    if (!r.ok) throw new Error();
    form.reset(); msg.textContent = 'Mensagem enviada. Obrigado!';
  } catch (_) {
    msg.textContent = 'Não foi possível enviar. Tente novamente ou fale connosco pelo WhatsApp.';
  }
  btn.disabled = false;
});

// Animações de entrada
(function () {
  if (!document.documentElement.classList.contains('js')) return;
  const sel = '.head,.stat,.about>div,.gal figure,.card,.shop,.contact>div,.brands span';
  const els = document.querySelectorAll(sel);
  els.forEach(el => {
    const i = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.setProperty('--d', Math.min(i, 5) * 0.08 + 's');
  });
  function count(b) {
    const m = b.textContent.trim().match(/^(\d+)(\+?)$/);
    if (!m || m[1].length > 3) return;
    const n = +m[1]; let t0 = null;
    const f = t => {
      if (t0 === null) t0 = t;
      const k = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - k, 3);
      b.textContent = Math.round(n * e) + m[2];
      if (k < 1) requestAnimationFrame(f);
    };
    b.textContent = '0' + m[2];
    requestAnimationFrame(f);
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const b = e.target.matches('.stat') && e.target.querySelector('b');
      if (b) count(b);
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();
