const mongoose = require('mongoose')
const { Schema, model } = mongoose

const noticiaSchema = new Schema(
  {
    categoria: { type: String, required: true, index: true },
    titulo: { type: String, required: true, trim: true },
    texto: { type: String, required: true },
    imagen: { type: String, default: '' },
    fecha: { type: Date, default: Date.now },
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

module.exports = mongoose.models.Noticia || model('Noticia', noticiaSchema)
