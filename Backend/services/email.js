const nodemailer = require('nodemailer')

const transporteReal = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null

const enviarEmail = async ({ to, subject, text, html }) => {
  if (transporteReal) {
    await transporteReal.sendMail({
      from: process.env.SMTP_FROM || 'News Today <no-reply@news-today.example>',
      to,
      subject,
      text,
      html,
    })
    return { enviado: true, transport: 'smtp' }
  }

  console.log(`[email][dev] A ${to} · ${subject}\n${text}`)
  return { enviado: true, transport: 'log' }
}

module.exports = { enviarEmail }
