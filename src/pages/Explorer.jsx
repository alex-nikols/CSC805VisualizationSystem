import { useState, useEffect, useRef, useCallback } from 'react'
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

const SEVERITY_LABELS = {
  1: 'Minor',
  2: 'Moderate',
  3: 'Serious',
  4: 'Fatal',
}

const WEATHER_OPTIONS = ['Clear', 'Fair', 'Cloudy', 'Rain', 'Fog', 'Snow', 'Haze', 'Thunderstorm']

function createCircleIcon(severity) {
  const color = SEVERITY_COLORS[severity] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

function parseDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

function FilterSidebar({ filters, onFilterChange, collapsed, onToggle }) {
  return (
    <div
      className="absolute top-0 left-0 z-[1000] h-full flex"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="bg-white shadow-lg flex flex-col transition-all duration-300 overflow-hidden"
        style={{
          width: collapsed ? '0px' : '280px',
          pointerEvents: 'auto',
        }}
      >
        {!collapsed && (
          <div className="flex flex-col h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                title="Collapse filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Date Range */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Severity */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Severity</h3>
              <div className="space-y-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.severity.includes(level)}
                      onChange={() => {
                        const next = filters.severity.includes(level)
                          ? filters.severity.filter((s) => s !== level)
                          : [...filters.severity, level]
                        onFilterChange({ ...filters, severity: next })
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: SEVERITY_COLORS[level] }}
                    />
                    <span className="text-sm text-gray-700">
                      {level} - {SEVERITY_LABELS[level]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weather Condition */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Weather Condition</h3>
              <div className="space-y-1.5">
                {WEATHER_OPTIONS.map((w) => (
                  <label key={w} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.weather.includes(w)}
                      onChange={() => {
                        const next = filters.weather.includes(w)
                          ? filters.weather.filter((x) => x !== w)
                          : [...filters.weather, w]
                        onFilterChange({ ...filters, weather: next })
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{w}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() =>
                onFilterChange({
                  startDate: '',
                  endDate: '',
                  severity: [1, 2, 3, 4],
                  weather: [],
                })
              }
              className="mt-auto text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="bg-white shadow-lg rounded-r-lg px-2 py-3 hover:bg-gray-50 self-start mt-4"
          style={{ pointerEvents: 'auto' }}
          title="Expand filters"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

function matchesFilters(data, filters) {
  // Severity filter
  if (!filters.severity.includes(data.severity)) return false

  // Date filter
  if (filters.startDate || filters.endDate) {
    const d = parseDate(data.startTime)
    if (d) {
      if (filters.startDate && d < new Date(filters.startDate)) return false
      if (filters.endDate) {
        const end = new Date(filters.endDate)
        end.setHours(23, 59, 59, 999)
        if (d > end) return false
      }
    }
  }

  // Weather filter (empty = all)
  if (filters.weather.length > 0) {
    const wc = (data.weatherCondition || '').toLowerCase()
    const match = filters.weather.some((w) => wc.includes(w.toLowerCase()))
    if (!match) return false
  }

  return true
}

export default function Explorer() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const clusterGroupRef = useRef(null)
  const allMarkersRef = useRef([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    severity: [1, 2, 3, 4],
    weather: [],
  })

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

        allMarkersRef.current = [...allMarkersRef.current, ...markers]
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

  const applyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters)
      const cg = clusterGroupRef.current
      if (!cg) return

      cg.clearLayers()
      const visible = allMarkersRef.current.filter((m) =>
        matchesFilters(m.accidentData, newFilters)
      )
      cg.addLayers(visible)
    },
    []
  )

  const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0

  return (
    <div className="flex-1 relative" style={{ height: 'calc(100vh - 65px)' }}>
      <div ref={mapRef} className="absolute inset-0 z-0" />

      <FilterSidebar
        filters={filters}
        onFilterChange={applyFilters}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

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
