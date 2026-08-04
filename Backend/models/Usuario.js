const mongoose = require('mongoose')
const { Schema, model } = mongoose
const bcrypt = require('bcryptjs')

const usuarioSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.createdAt
        delete ret.updatedAt
        return ret
      },
    },
  }
)

usuarioSchema.pre('save', async function guardarPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

usuarioSchema.methods.compararPassword = function compararPassword(candidata) {
  return bcrypt.compare(candidata, this.password)
}

module.exports = mongoose.models.Usuario || model('Usuario', usuarioSchema)
