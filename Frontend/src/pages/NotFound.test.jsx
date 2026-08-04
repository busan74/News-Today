import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

describe('NotFound', () => {
    it('muestra el código 404, el título y el enlace de volver', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        )

        expect(screen.getByText('404')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'Página no encontrada' })
        ).toBeInTheDocument()
        expect(
            screen.getByText('La página que buscas no existe o fue movida.')
        ).toBeInTheDocument()

        const link = screen.getByRole('link', { name: 'Volver al inicio' })
        expect(link).toHaveAttribute('href', '/')
    })
})
