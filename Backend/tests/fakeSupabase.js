const { randomUUID } = require('crypto')

const CLAVE = '__newsTodayFakeSupabase__'

const obtenerEstado = () => {
  if (!globalThis[CLAVE]) {
    globalThis[CLAVE] = {
      tablas: {
        categorias: { unicos: ['slug'], filas: [] },
        noticias: { unicos: [], filas: [] },
        profiles: { unicos: ['username', 'email'], filas: [] },
        anuncios: { unicos: [], filas: [] },
      },
      authUsers: [],
    }
  }
  return globalThis[CLAVE]
}

const escaparRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const convertirILike = (valor) => {
  const patron = '^' + valor.split('%').map(escaparRegExp).join('.*') + '$'
  return new RegExp(patron, 'i')
}

const parsearOr = (filtro) =>
  filtro
    .split(',')
    .map((parte) => {
      const m = parte.match(/^([\w]+)\.([\w]+)\.(.*)$/)
      return m ? { campo: m[1], op: m[2], valor: m[3] } : null
    })
    .filter(Boolean)

const coincide = (fila, { op, campo, valor, condiciones }) => {
  if (op === 'or') return condiciones.some((c) => coincide(fila, c))
  const v = fila[campo]
  switch (op) {
    case 'eq':
      return String(v ?? '') === String(valor)
    case 'neq':
      return String(v ?? '') !== String(valor)
    case 'ilike':
      return convertirILike(valor).test(String(v ?? ''))
    default:
      return true
  }
}

const aplicarFiltros = (filas, filtros) =>
  filas.filter((fila) => filtros.every((f) => coincide(fila, f)))

const DEFAULTS = {
  noticias: { imagen: '', fecha: null },
  categorias: {},
  profiles: { role: 'editor' },
  anuncios: { tipo: 'imagen', enlace: '', activo: false, fecha_inicio: null, fecha_fin: null, stripe_customer_id: '', stripe_subscription_id: '' },
}

class Builder {
  constructor(tabla) {
    this.tabla = tabla
    this.filtros = []
    this.orden = null
    this.limite = null
    this.head = false
    this.modo = null
    this.tipo = 'select'
    this.objetos = null
  }

  select(_columnas, opts = {}) {
    this.head = Boolean(opts.head)
    return this
  }

  eq(campo, valor) {
    this.filtros.push({ campo, op: 'eq', valor })
    return this
  }

  neq(campo, valor) {
    this.filtros.push({ campo, op: 'neq', valor })
    return this
  }

  ilike(campo, valor) {
    this.filtros.push({ campo, op: 'ilike', valor })
    return this
  }

  or(filtro) {
    const condiciones = parsearOr(filtro)
    if (condiciones.length) this.filtros.push({ op: 'or', condiciones })
    return this
  }

  order(campo, { ascending = true } = {}) {
    this.orden = { campo, ascending }
    return this
  }

  limit(n) {
    this.limite = n
    return this
  }

  single() {
    this.modo = 'single'
    return this
  }

  maybeSingle() {
    this.modo = 'maybeSingle'
    return this
  }

  insert(objetos) {
    this.tipo = 'insert'
    this.objetos = [].concat(objetos)
    return this
  }

  update(objetos) {
    this.tipo = 'update'
    this.objetos = objetos
    return this
  }

  delete() {
    this.tipo = 'delete'
    return this
  }

  then(resolve, reject) {
    Promise.resolve().then(() => {
      try {
        resolve(this.ejecutar())
      } catch (err) {
        reject(err)
      }
    })
  }

  ejecutar() {
    if (this.tipo === 'select') return this.ejecutarSelect()
    if (this.tipo === 'insert') return this.ejecutarInsert()
    if (this.tipo === 'update') return this.ejecutarUpdate()
    if (this.tipo === 'delete') return this.ejecutarDelete()
    return { data: null, error: null }
  }

  ejecutarSelect() {
    const { filas } = obtenerEstado().tablas[this.tabla]
    let resultado = aplicarFiltros(filas, this.filtros)

    if (this.orden) {
      const { campo, ascending } = this.orden
      resultado = [...resultado].sort((a, b) => {
        const cmp = a[campo] < b[campo] ? -1 : a[campo] > b[campo] ? 1 : 0
        return ascending ? cmp : -cmp
      })
    }

    if (this.head) return { data: [], count: resultado.length, error: null }
    if (this.limite) resultado = resultado.slice(0, this.limite)

    if (this.modo === 'single') {
      if (resultado.length !== 1) {
        return { data: null, error: { code: 'PGRST116', message: 'No se pudo devolver una sola fila' } }
      }
      return { data: resultado[0], error: null }
    }
    if (this.modo === 'maybeSingle') {
      return { data: resultado[0] || null, error: null }
    }
    return { data: resultado, error: null }
  }

  ejecutarInsert() {
    const def = obtenerEstado().tablas[this.tabla]
    for (const obj of this.objetos) {
      for (const u of def.unicos) {
        if (obj[u] !== undefined && def.filas.some((f) => String(f[u]) === String(obj[u]))) {
          return { data: null, error: { code: '23505', message: 'Clave duplicada' } }
        }
      }
    }

    const insertadas = this.objetos.map((obj) => {
      const fila = { ...DEFAULTS[this.tabla], ...obj }
      if (!fila.id) fila.id = randomUUID()
      if (!fila.created_at) fila.created_at = new Date().toISOString()
      if (this.tabla === 'noticias' && !fila.fecha) fila.fecha = new Date().toISOString()
      def.filas.push(fila)
      return fila
    })

    let data = insertadas
    if (this.modo === 'single' || this.modo === 'maybeSingle') data = insertadas[0] || null
    return { data, error: null }
  }

  ejecutarUpdate() {
    const def = obtenerEstado().tablas[this.tabla]
    const afectadas = aplicarFiltros(def.filas, this.filtros)
    const actualizadas = afectadas.map((fila) => Object.assign(fila, this.objetos))

    let data = actualizadas
    if (this.modo === 'single' || this.modo === 'maybeSingle') data = actualizadas[0] || null
    return { data, error: null }
  }

  ejecutarDelete() {
    const def = obtenerEstado().tablas[this.tabla]
    const afectadas = aplicarFiltros(def.filas, this.filtros)
    def.filas = def.filas.filter((fila) => !afectadas.includes(fila))

    let data = afectadas
    if (this.modo === 'single' || this.modo === 'maybeSingle') data = afectadas[0] || null
    return { data, error: null }
  }
}

const crearAuthUser = ({ email, password, email_confirm, user_metadata }) => {
  const estado = obtenerEstado()
  if (estado.authUsers.some((u) => u.email === email)) {
    return { data: { user: null }, error: { message: 'El usuario ya está registrado' } }
  }
  const usuario = {
    id: randomUUID(),
    email,
    password: `$fake$:${password}`,
    email_confirm,
    user_metadata: user_metadata || {},
  }
  estado.authUsers.push(usuario)
  return {
    data: { user: { id: usuario.id, email: usuario.email, user_metadata: usuario.user_metadata } },
    error: null,
  }
}

const iniciarSesion = ({ email, password }) => {
  const estado = obtenerEstado()
  const usuario = estado.authUsers.find((u) => u.email === email)
  if (!usuario || usuario.password !== `$fake$:${password}`) {
    return { data: { user: null, session: null }, error: { message: 'Credenciales inválidas' } }
  }
  const payload = { sub: usuario.id, email: usuario.email, user_metadata: usuario.user_metadata }
  const access_token = Buffer.from(JSON.stringify(payload)).toString('base64')
  return {
    data: {
      user: { id: usuario.id, email: usuario.email, user_metadata: usuario.user_metadata },
      session: { access_token },
    },
    error: null,
  }
}

const auth = {
  admin: {
    createUser: async (opts) => crearAuthUser(opts),
    deleteUser: async (id) => {
      obtenerEstado().authUsers = obtenerEstado().authUsers.filter((u) => u.id !== id)
      return { data: { user: {} }, error: null }
    },
    listUsers: async () => ({
      data: {
        users: obtenerEstado().authUsers.map((u) => ({
          id: u.id,
          email: u.email,
          user_metadata: u.user_metadata,
        })),
      },
      error: null,
    }),
  },
  signInWithPassword: async (opts) => iniciarSesion(opts),
}

const cliente = {
  from: (tabla) => new Builder(tabla),
  auth,
}

const restablecer = () => {
  const estado = obtenerEstado()
  for (const def of Object.values(estado.tablas)) def.filas = []
  estado.authUsers = []
}

const crearFakeSupabase = () => {
  restablecer()
  return { cliente }
}

const obtenerAuthUsers = () => obtenerEstado().authUsers
const obtenerFilas = (tabla) => obtenerEstado().tablas[tabla].filas

module.exports = { crearFakeSupabase, restablecer, obtenerAuthUsers, obtenerFilas }
