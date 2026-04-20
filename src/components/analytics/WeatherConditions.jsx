import { useState, useEffect } from 'react'

const CATEGORIES = [
  { key: 'visibility', label: 'Visibility', color: '#14b8a6' },
  { key: 'windSpeed', label: 'Wind Speed', color: '#3b82f6' },
  { key: 'precipitation', label: 'Precipitation', color: '#1e3a5f' },
]

export default function WeatherConditions() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/by_weather.json')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Weather Conditions
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Accident distribution by weather at time of incident
        </p>
      </div>
      <div className="space-y-5">
        {CATEGORIES.map(({ key, label, color }) => {
          const buckets = data[key]
          if (!buckets) return null
          const maxCount = Math.max(...buckets.map((b) => b.count))
          return (
            <div key={key}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{label}</h4>
              <div className="space-y-2">
                {buckets.map((bucket) => (
                  <div key={bucket.label} className="flex items-center gap-3 text-sm">
                    <span className="w-28 text-xs text-gray-500 shrink-0 truncate">
                      {bucket.label}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                      <div
                        className="h-4 rounded-full"
                        style={{
                          width: `${(bucket.count / maxCount) * 100}%`,
                          backgroundColor: color,
                          minWidth: bucket.count > 0 ? '4px' : '0px',
                        }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs text-gray-600 shrink-0">
                      {bucket.count.toLocaleString()}
                    </span>
                    <span className="w-12 text-right text-xs text-gray-400 shrink-0">
                      {bucket.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
