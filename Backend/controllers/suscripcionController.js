const { getSupabase } = require('../config/supabase')
const { config } = require('../config/env')
const { enviarEmail } = require('../services/email')
const { getStripe, estaActivo } = require('../services/stripe')

const serializarSuscripcion = (s) => ({
  id: s.id,
  email: s.email,
  estado: s.estado,
  plan: s.plan,
  stripeCustomerId: s.stripe_customer_id,
  stripeSubscriptionId: s.stripe_subscription_id,
})

const obtenerPorEmail = async (supabase, email) => {
  const { data, error } = await supabase
    .from('suscripciones')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

const suscribir = async (req, res) => {
  const { email, plan = 'gratis' } = req.body
  const correo = String(email || '').trim().toLowerCase()

  const supabase = getSupabase()

  let suscripcion = await obtenerPorEmail(supabase, correo)
  if (!suscripcion) {
    const { data, error } = await supabase
      .from('suscripciones')
      .insert({ email: correo, plan })
      .select()
      .single()
    if (error) throw error
    suscripcion = data
  }

  let checkoutUrl = null
  if (estaActivo() && plan !== 'gratis') {
    const stripe = getStripe()
    let stripeCustomerId = suscripcion.stripe_customer_id || ''
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: correo })
      stripeCustomerId = customer.id
    }
    const sesion = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL || `${config.CLIENT_URL}/suscripcion?estado=exito`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${config.CLIENT_URL}/suscripcion?estado=cancelado`,
    })

    const { error } = await supabase
      .from('suscripciones')
      .update({ estado: 'pendiente', stripe_customer_id: stripeCustomerId })
      .eq('id', suscripcion.id)
    if (error) throw error

    suscripcion = { ...suscripcion, estado: 'pendiente', stripe_customer_id: stripeCustomerId }
    checkoutUrl = sesion.url
  }

  enviarEmail({
    to: correo,
    subject: 'Bienvenido a News Today',
    text: `Hola, gracias por suscribirte a News Today. Recibirás las mejores noticias en tu correo. Plan: ${suscripcion.plan}.`,
    html: `<p>Hola, gracias por suscribirte a <strong>News Today</strong>.</p><p>Recibirás las mejores noticias en tu correo.</p><p>Plan: ${suscripcion.plan}.</p>`,
  }).catch((err) => console.error('[email] error al enviar bienvenida:', err.message))

  res.status(201).json({ success: true, data: serializarSuscripcion(suscripcion), checkoutUrl })
}

const listar = async (req, res) => {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('suscripciones')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error

  res.json({ success: true, data: (data || []).map(serializarSuscripcion) })
}

module.exports = { suscribir, listar }
