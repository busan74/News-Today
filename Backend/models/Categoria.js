const mongoose = require('mongoose')
const { Schema, model } = mongoose

const categoriaSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    nombre: { type: String, required: true, trim: true },
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

module.exports = mongoose.models.Categoria || model('Categoria', categoriaSchema)
