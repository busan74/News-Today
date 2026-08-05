// Configuración de pueblos (multi-tenant)
// El pueblo se detecta por subdominio (ej: lebrija.actualidadlocal.es -> lebrija)

const PUEBLOS = {
  lascabezas: {
    slug: 'lascabezas',
    nombre: 'Actualidad Las Cabezas',
    logo: 'LC',
    color: '#b3062e',
    colorDark: '#8f0424',
    dominio: 'lascabezas.actualidadlocal.es',
    descripcion: 'Noticias de Las Cabezas de San Juan',
  },
  lebrija: {
    slug: 'lebrija',
    nombre: 'Actualidad Lebrija',
    logo: 'LB',
    color: '#0f766e',
    colorDark: '#115e59',
    dominio: 'lebrija.actualidadlocal.es',
    descripcion: 'Noticias de Lebrija',
  },
  elcuervo: {
    slug: 'elcuervo',
    nombre: 'Actualidad El Cuervo',
    logo: 'EC',
    color: '#4338ca',
    colorDark: '#3730a3',
    dominio: 'elcuervo.actualidadlocal.es',
    descripcion: 'Noticias de El Cuervo de Sevilla',
  },
}

// Mapeo hostname -> slug de pueblo. Acepta subdominios y dominios completos.
const HOSTNAMES = {
  'lascabezas.actualidadlocal.es': 'lascabezas',
  'www.lascabezas.actualidadlocal.es': 'lascabezas',
  'lebrija.actualidadlocal.es': 'lebrija',
  'www.lebrija.actualidadlocal.es': 'lebrija',
  'elcuervo.actualidadlocal.es': 'elcuervo',
  'www.elcuervo.actualidadlocal.es': 'elcuervo',
  'localhost': 'lascabezas',
  '127.0.0.1': 'lascabezas',
  'actualidadlocal.es': 'lascabezas',
  'www.actualidadlocal.es': 'lascabezas',
}

const detectarPueblo = (req) => {
  const host = String(req.hostname || '').toLowerCase().replace(/:\d+$/, '')
  if (HOSTNAMES[host]) return HOSTNAMES[host]

  // Fallback: primer segmento si termina en actualidadlocal.es
  if (host.endsWith('actualidadlocal.es')) {
    const slug = host.split('.')[0]
    if (PUEBLOS[slug]) return slug
  }
  return 'lascabezas'
}

const obtenerConfig = (slug) => {
  return PUEBLOS[slug] || PUEBLOS.lascabezas
}

const obtenerTodos = () => Object.values(PUEBLOS)

module.exports = { PUEBLOS, HOSTNAMES, detectarPueblo, obtenerConfig, obtenerTodos }
