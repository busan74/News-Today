import { esVideo, rutaCompleta } from '../utils/format'
import VideoConRespaldo from './VideoConRespaldo'

const PreviaMultimedia = ({ src, alt = '' }) => {
    if (!src) return null

    const srcCompleto = rutaCompleta(src)

    return esVideo(src) ? (
        <VideoConRespaldo
            className="imagen-vista-previa"
            src={srcCompleto}
            controls
            muted
            playsInline
        />
    ) : (
        <img className="imagen-vista-previa" src={srcCompleto} alt={alt} />
    )
}

export default PreviaMultimedia
