import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const SEVERITY_COLORS = {
  1: '#22c55e', // green
  2: '#eab308', // yellow
  3: '#f97316', // orange
  4: '#ef4444', // red
}

function createCircleIcon(severity) {
  const color = SEVERITY_COLORS[severity] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export default function Explorer() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const clusterGroupRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [37.77, -122.42],
      zoom: 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 16,
    })
    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup

    loadChunks(clusterGroup)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  async function loadChunks(clusterGroup) {
    try {
      const res = await fetch('/data/map/manifest.json')
      const manifest = await res.json()
      const { chunks, totalRecords } = manifest

      setProgress({ loaded: 0, total: totalRecords })

      let loadedCount = 0

      for (const chunkFile of chunks) {
        const chunkRes = await fetch(`/data/map/${chunkFile}`)
        const records = await chunkRes.json()

        const markers = records.map((r) => {
          const marker = L.marker([r.lat, r.lng], {
            icon: createCircleIcon(r.severity),
          })
          marker.accidentData = r
          marker.bindPopup(
            `<div style="min-width:200px">
              <strong>${r.street || 'Unknown'}, ${r.city}, ${r.state}</strong><br/>
              <span style="color:${SEVERITY_COLORS[r.severity]}; font-weight:600;">Severity ${r.severity}</span><br/>
              <span style="font-size:12px; color:#666;">${r.startTime}</span><br/>
              <span style="font-size:12px;">${r.description || ''}</span>
            </div>`
          )
          return marker
        })

        clusterGroup.addLayers(markers)
        loadedCount += records.length
        setProgress({ loaded: loadedCount, total: totalRecords })
      }

      setLoading(false)
    } catch (err) {
      console.error('Failed to load map data:', err)
      setLoading(false)
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0

  return (
    <div className="flex-1 relative" style={{ height: 'calc(100vh - 65px)' }}>
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg px-6 py-3 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">Loading accidents...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-1">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {progress.loaded.toLocaleString()} / {progress.total.toLocaleString()} ({pct}%)
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow px-3 py-2 flex items-center gap-2 text-xs text-gray-600">
        {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
          <span key={sev} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
            S{sev}
          </span>
        ))}
      </div>
    </div>
  )
}
