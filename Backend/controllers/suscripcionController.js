const Suscripcion = require('../models/Suscripcion')
const { config } = require('../config/env')
const { enviarEmail } = require('../services/email')
const { getStripe, estaActivo } = require('../services/stripe')

const suscribir = async (req, res) => {
  const { email, plan = 'gratis' } = req.body

  let suscripcion = await Suscripcion.findOne({ email })
  if (!suscripcion) {
    suscripcion = await Suscripcion.create({ email, plan })
  }

  let checkoutUrl = null
  if (estaActivo() && plan !== 'gratis') {
    const stripe = getStripe()
    if (!suscripcion.stripeCustomerId) {
      const customer = await stripe.customers.create({ email })
      suscripcion.stripeCustomerId = customer.id
    }
    const sesion = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: suscripcion.stripeCustomerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL || `${config.CLIENT_URL}/suscripcion?estado=exito`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${config.CLIENT_URL}/suscripcion?estado=cancelado`,
    })
    suscripcion.estado = 'pendiente'
    await suscripcion.save()
    checkoutUrl = sesion.url
  }

  enviarEmail({
    to: email,
    subject: 'Bienvenido a News Today',
    text: `Hola, gracias por suscribirte a News Today. Recibirás las mejores noticias en tu correo. Plan: ${suscripcion.plan}.`,
    html: `<p>Hola, gracias por suscribirte a <strong>News Today</strong>.</p><p>Recibirás las mejores noticias en tu correo.</p><p>Plan: ${suscripcion.plan}.</p>`,
  }).catch((err) => console.error('[email] error al enviar bienvenida:', err.message))

  res.status(201).json({ success: true, data: suscripcion, checkoutUrl })
}

const listar = async (req, res) => {
  const suscripciones = await Suscripcion.find().sort({ createdAt: -1 })
  res.json({ success: true, data: suscripciones })
}

module.exports = { suscribir, listar }
