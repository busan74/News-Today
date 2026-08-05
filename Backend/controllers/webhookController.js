const { getSupabase } = require('../config/supabase')
const { getStripe } = require('../services/stripe')

const webhook = async (req, res) => {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(501).json({ success: false, error: 'Stripe no configurado' })
  }

  const evento = req.body
  if (evento?.type === 'checkout.session.completed') {
    const sesion = evento.data?.object
    const supabase = getSupabase()
    const { error } = await supabase
      .from('suscripciones')
      .update({
        estado: 'activa',
        stripe_subscription_id: sesion.subscription || '',
      })
      .eq('stripe_customer_id', sesion.customer)
    if (error) {
      console.error('[webhook] error al actualizar suscripción:', error.message)
    }
  }

  res.json({ received: true })
}

module.exports = { webhook }
