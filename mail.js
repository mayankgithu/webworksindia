// Email through Brevo (free 300/day, works on Render free). Env: BREVO_API_KEY, MAIL_FROM, MAIL_FROM_NAME
async function sendMail({ to, toName, subject, html, text }) {
  const key = process.env.BREVO_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from) return false;
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { email: from, name: process.env.MAIL_FROM_NAME || 'Web Works India' }, to: [{ email: to, name: toName || to }], subject, htmlContent: html, textContent: text }),
    });
    if (!r.ok) { console.error('Brevo error', r.status, await r.text()); return false; }
    return true;
  } catch (e) { console.error('Email failed:', e.message); return false; }
}
module.exports = { sendMail };
