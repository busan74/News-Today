const Suscripcion = require('../models/Suscripcion')
const { getStripe, estaActivo } = require('../services/stripe')

const webhook = async (req, res) => {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(501).json({ success: false, error: 'Stripe no configurado' })
  }

  const evento = req.body
  if (evento?.type === 'checkout.session.completed') {
    const sesion = evento.data?.object
    await Suscripcion.updateOne(
      { stripeCustomerId: sesion.customer },
      { estado: 'activa', stripeSubscriptionId: sesion.subscription || '' }
    )
  }

  res.json({ received: true })
}

module.exports = { webhook }
