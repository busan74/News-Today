import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PuebloProvider } from '../context/PuebloProvider'
import { usePageMeta } from './usePageMeta'

const PaginaMeta = (props) => {
    usePageMeta(props)
    return null
}

const metaDe = (atributo, nombre) => {
    const el = document.head.querySelector(`meta[${atributo}="${nombre}"]`)
    return el ? el.getAttribute('content') : null
}

const renderMeta = (props) =>
    render(
        <MemoryRouter>
            <PuebloProvider>
                <PaginaMeta {...props} />
            </PuebloProvider>
        </MemoryRouter>
    )

describe('usePageMeta', () => {
    beforeEach(() => {
        document.title = ''
        document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
    })

    it('establece title, canonical y etiquetas Open Graph básicas', () => {
        renderMeta({ title: 'Noticia', description: 'Una descripción.' })

        expect(document.title).toBe('Noticia · Actualidad Las Cabezas')
        expect(document.querySelector('link[rel="canonical"]')).not.toBeNull()
        expect(metaDe('name', 'description')).toBe('Una descripción.')
        expect(metaDe('property', 'og:title')).toBe('Noticia · Actualidad Las Cabezas')
        expect(metaDe('property', 'og:type')).toBe('website')
        expect(metaDe('property', 'og:site_name')).toBe('Actualidad Las Cabezas')
        expect(metaDe('name', 'twitter:card')).toBe('summary')
    })

    it('convierte las imágenes relativas en absolutas', () => {
        renderMeta({
            title: 'Titular',
            description: 'Texto.',
            image: '/uploads/images/x.jpg',
            type: 'article',
            publishedTime: '2026-08-15T10:00:00Z',
            section: 'Deportes',
        })

        expect(metaDe('property', 'og:type')).toBe('article')
        expect(metaDe('property', 'article:published_time')).toBe('2026-08-15T10:00:00Z')
        expect(metaDe('property', 'article:section')).toBe('Deportes')
        expect(metaDe('property', 'og:image')).toBe(`${window.location.origin}/uploads/images/x.jpg`)
        expect(metaDe('name', 'twitter:card')).toBe('summary_large_image')
    })

    it('aplica noindex cuando se indica', () => {
        renderMeta({ title: 'Iniciar sesión', noindex: true })

        expect(metaDe('name', 'robots')).toBe('noindex, nofollow')
    })

    it('no deja etiquetas obsoletas al cambiar de página', () => {
        const { rerender } = renderMeta({ title: 'Página A' })

        rerender(
            <MemoryRouter>
                <PuebloProvider>
                    <PaginaMeta title="Página B" />
                </PuebloProvider>
            </MemoryRouter>
        )

        const ogTitles = document.head.querySelectorAll('meta[property="og:title"]')
        expect(ogTitles).toHaveLength(1)
        expect(ogTitles[0].getAttribute('content')).toBe('Página B · Actualidad Las Cabezas')
    })
})
