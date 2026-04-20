import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TopCounties() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/data/by_county_danger.json')
      .then((res) => res.json())
      .then((d) => {
        setData(d.slice(0, 10))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const maxScore = data[0]?.score ?? 1

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Top 10 Counties by Danger Score
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Click to view on map
        </p>
      </div>
      <div className="space-y-2.5">
        {data.map((item, index) => (
          <div key={`${item.county}-${item.state}`} className="flex items-center gap-3 text-sm">
            <span className="w-5 text-right text-gray-400 font-medium text-xs shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-gray-700 font-medium truncate">
                  {item.county}, {item.state}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-gray-600 font-semibold text-xs">
                    {item.score.toFixed(2)}
                  </span>
                  <button
                    onClick={() => navigate(`/explorer?county=${encodeURIComponent(item.county)}&state=${encodeURIComponent(item.state)}`)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title={`View ${item.county}, ${item.state} on map`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(item.score / maxScore) * 100}%`,
                    backgroundColor: '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
