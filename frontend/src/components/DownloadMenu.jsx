import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { api } from '../api'

export default function DownloadMenu({ mediaItemId, label = 'Download Favourites' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (mediaItemId) {
    // Single item download
    return (
      <a
        className="btn btn-secondary btn-sm"
        href={api.downloadUrl.item(mediaItemId)}
        download
      >
        <Download size={13} />
        Download Favourites
      </a>
    )
  }

  // Global download menu
  return (
    <div className="dropdown" ref={ref}>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(o => !o)}>
        <Download size={13} />
        {label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="dropdown-menu">
          <a
            className="dropdown-item"
            href={api.downloadUrl.all}
            download="fanart_library.zip"
            onClick={() => setOpen(false)}
          >
            <Download size={14} />
            Entire Library
          </a>
          <div className="dropdown-sep" />
          <a
            className="dropdown-item"
            href={api.downloadUrl.shows}
            download="tv_shows_fanart.zip"
            onClick={() => setOpen(false)}
          >
            <Download size={14} />
            TV Shows Only
          </a>
          <a
            className="dropdown-item"
            href={api.downloadUrl.movies}
            download="movies_fanart.zip"
            onClick={() => setOpen(false)}
          >
            <Download size={14} />
            Movies Only
          </a>
        </div>
      )}
    </div>
  )
}
