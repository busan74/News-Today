const Stripe = require('stripe')

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const estaActivo = () => Boolean(process.env.STRIPE_SECRET_KEY)

module.exports = { getStripe, estaActivo }
