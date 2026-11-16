import nodemailer from 'nodemailer';

const hits = new Map(); // limitação simples por IP (best-effort em serverless)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  // Só aceita pedidos do próprio site
  const origin = req.headers.origin || '';
  const allowed = (process.env.SITE_URL || '').replace(/\/$/, '');
  if (allowed && origin !== allowed) return res.status(403).json({ ok: false });

  // Rate limit: 5 pedidos / 10 min por IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 600000);
  if (list.length >= 5) return res.status(429).json({ ok: false });
  list.push(now); hits.set(ip, list);

  const b = typeof req.body === 'object' && req.body ? req.body : {};
  // Honeypot e tempo mínimo (bots): responde "ok" sem enviar
  if (b.site || Number(b.t) < 2500) return res.status(200).json({ ok: true });

  const n = String(b.n || '').trim().slice(0, 100);
  const e = String(b.e || '').trim().slice(0, 150);
  const m = String(b.m || '').trim().slice(0, 3000);
  if (!n || !m || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(e)) return res.status(400).json({ ok: false });

  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const tr = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await tr.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      replyTo: e,
      subject: 'Contacto pelo site – ' + n.replace(/[\r\n]+/g, ' '),
      text: `${m}\n\n${n}\n${e}`,
      html: `<p>${esc(m).replace(/\n/g, '<br>')}</p><hr><p><b>${esc(n)}</b><br>${esc(e)}</p>`
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}
