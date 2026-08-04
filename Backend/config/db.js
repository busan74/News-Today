require('./env')

const mongoose = require('mongoose')
const { arrancarMongoEnMemoria } = require('./memoria')

let memoria = null

const conectarBD = async () => {
  const uri = process.env.MONGO_URI
  if (uri) {
    await mongoose.connect(uri)
    return { uri, persistente: true }
  }

  memoria = await arrancarMongoEnMemoria()
  await mongoose.connect(memoria.uri)
  return { uri: memoria.uri, persistente: false }
}

const cerrarBD = async () => {
  await mongoose.disconnect()
  if (memoria) {
    await memoria.detener()
    memoria = null
  }
}

module.exports = { conectarBD, cerrarBD }
