import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ArticleCard from './ArticleCard'

const noticia = {
    id: 5,
    categoria: 'deportes',
    titulo: 'Final del campeonato definida',
    texto: 'Los dos mejores equipos se enfrentarán el domingo.',
    fecha: '2026-08-04T11:00:00.000Z',
}

const renderConRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ArticleCard', () => {
    it('renderiza título y fecha', () => {
        renderConRouter(<ArticleCard noticia={noticia} />)

        expect(
            screen.getByRole('heading', { name: 'Final del campeonato definida' })
        ).toBeInTheDocument()
        expect(screen.getByText('4 de agosto de 2026')).toBeInTheDocument()
    })

    it('oculta el texto de la noticia en la tarjeta', () => {
        renderConRouter(<ArticleCard noticia={noticia} />)

        expect(
            screen.queryByText('Los dos mejores equipos se enfrentarán el domingo.')
        ).not.toBeInTheDocument()
    })

    it('enlaza a la vista de detalle', () => {
        renderConRouter(<ArticleCard noticia={noticia} />)

        const link = screen.getByRole('link', { name: 'Leer más' })
        expect(link).toHaveAttribute('href', '/noticia/5')
    })
})
