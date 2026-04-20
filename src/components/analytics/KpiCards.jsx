import { useState, useEffect } from 'react'

const icons = {
  totalAccidents: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  avgDangerScore: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  mostDangerousCounty: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  peakHour: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function formatHour(h) {
  if (h === 0) return '12:00 AM'
  if (h === 12) return '12:00 PM'
  return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`
}

export default function KpiCards() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/summary.json')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
            <div className="h-6 w-6 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const cards = [
    {
      key: 'totalAccidents',
      label: 'Total Accidents',
      value: formatNumber(data.totalAccidents),
      subtitle: 'Recorded incidents (2016-2023)',
    },
    {
      key: 'avgDangerScore',
      label: 'Avg Danger Score',
      value: data.avgDangerScore.toFixed(2),
      subtitle: 'Weighted severity index',
    },
    {
      key: 'mostDangerousCounty',
      label: 'Most Dangerous County',
      value: data.mostDangerousCounty.name,
      subtitle: `Danger score: ${data.mostDangerousCounty.score.toFixed(2)}`,
    },
    {
      key: 'peakHour',
      label: 'Peak Hour',
      value: formatHour(data.peakHour),
      subtitle: 'Most accidents occur at this hour',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
        >
          <div className="mb-3">{icons[card.key]}</div>
          <p className="text-sm text-gray-500 mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
          <p className="text-xs text-gray-400">{card.subtitle}</p>
        </div>
      ))}
    </div>
  )
}
