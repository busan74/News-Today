import { useEffect } from 'react'
import { usePueblo } from './usePueblo'

const MARCA = 'data-seo'
const MAX_DESC = 300

const absoluta = (url) => {
    if (!url) return url
    if (/^https?:\/\//i.test(String(url))) return url
    const base = window.location.origin
    return String(url).startsWith('/') ? `${base}${url}` : `${base}/${url}`
}

const recortar = (texto) => {
    const limpio = String(texto || '').replace(/\s+/g, ' ').trim()
    if (limpio.length <= MAX_DESC) return limpio
    return `${limpio.slice(0, MAX_DESC - 1)}…`
}

const limpiarSeo = () => {
    document
        .querySelectorAll(`meta[${MARCA}], link[rel="canonical"][${MARCA}]`)
        .forEach((el) => el.remove())
}

const meta = (atributo, nombre, contenido) => {
    if (!contenido) return
    const el = document.createElement('meta')
    el.setAttribute(atributo, nombre)
    el.setAttribute('content', contenido)
    el.setAttribute(MARCA, '')
    document.head.appendChild(el)
}

export const usePageMeta = ({
    title,
    description,
    image,
    type = 'website',
    noindex = false,
    publishedTime,
    section,
} = {}) => {
    const { config } = usePueblo()
    const nombre = config.nombre

    useEffect(() => {
        const titulo = title ? `${title} · ${nombre}` : nombre
        document.title = titulo

        const url = new URL(window.location.href)
        url.hash = ''
        const canonical = url.href

        const img = image ? absoluta(image) : ''
        const desc = recortar(description || config.descripcion)

        limpiarSeo()

        const canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        canonicalEl.setAttribute('href', canonical)
        canonicalEl.setAttribute(MARCA, '')
        document.head.appendChild(canonicalEl)

        meta('name', 'description', desc)
        meta('property', 'og:title', titulo)
        meta('property', 'og:description', desc)
        meta('property', 'og:type', type)
        meta('property', 'og:url', canonical)
        meta('property', 'og:site_name', nombre)
        meta('property', 'og:locale', 'es_ES')
        meta('property', 'og:image', img)
        meta('property', 'og:image:alt', title)

        if (type === 'article') {
            meta('property', 'article:published_time', publishedTime)
            meta('property', 'article:section', section)
        }

        meta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
        meta('name', 'twitter:title', titulo)
        meta('name', 'twitter:description', desc)
        meta('name', 'twitter:image', img)

        if (noindex) meta('name', 'robots', 'noindex, nofollow')
    }, [title, description, image, type, noindex, publishedTime, section, nombre, config.descripcion])
}
