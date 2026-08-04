const mongoose = require('mongoose')
const { Schema, model } = mongoose

const suscripcionSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    estado: {
      type: String,
      enum: ['pendiente', 'activa', 'cancelada'],
      default: 'activa',
    },
    plan: { type: String, default: 'gratis' },
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.createdAt
        delete ret.updatedAt
        return ret
      },
    },
  }
)

module.exports = mongoose.models.Suscripcion || model('Suscripcion', suscripcionSchema)
