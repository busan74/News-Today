import { useState } from 'react'

const VideoConRespaldo = ({ src, className, controls = false, autoPlay = false, ...rest }) => {
    const [fallo, setFallo] = useState(false)

    if (fallo) {
        return (
            <div
                className={`video-fallback${className ? ` ${className}` : ''}`}
                role="img"
                aria-label="Vídeo no disponible"
            >
                <span>El vídeo no se puede reproducir en este navegador (códec no compatible).</span>
            </div>
        )
    }

    return (
        <video
            className={className}
            src={src}
            controls={controls}
            autoPlay={autoPlay}
            preload="metadata"
            onError={() => setFallo(true)}
            {...rest}
        />
    )
}

export default VideoConRespaldo
