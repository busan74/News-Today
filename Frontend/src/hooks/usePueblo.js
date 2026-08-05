import { useContext } from 'react'
import { PuebloContext } from '../context/PuebloProvider'

export const usePueblo = () => useContext(PuebloContext)
