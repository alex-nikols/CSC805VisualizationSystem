import { useJsonData } from '../../hooks/useJsonData'
import { formatNumber, formatHour } from '../../lib/format'
import { KPI_ICONS } from './kpiIcons'

export default function KpiCards() {
  const { data, loading } = useJsonData('/data/summary.json')

  if (loading) return <KpiSkeleton />
  if (!data) return null

  const cards = buildCards(data)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <KpiCard key={card.key} {...card} />
      ))}
    </div>
  )
}

function KpiCard({ iconKey, label, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="mb-3">{KPI_ICONS[iconKey]}</div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

function buildCards(data) {
  return [
    {
      key: 'totalAccidents',
      iconKey: 'totalAccidents',
      label: 'Total Accidents',
      value: formatNumber(data.totalAccidents),
      subtitle: 'Recorded incidents (2016-2023)',
    },
    {
      key: 'avgDangerScore',
      iconKey: 'avgDangerScore',
      label: 'Avg Danger Score',
      value: data.avgDangerScore.toFixed(2),
      subtitle: 'Weighted severity index',
    },
    {
      key: 'mostDangerousCounty',
      iconKey: 'mostDangerousCounty',
      label: 'Most Dangerous County',
      value: data.mostDangerousCounty.name,
      subtitle: `Danger score: ${data.mostDangerousCounty.score.toFixed(2)}`,
    },
    {
      key: 'peakHour',
      iconKey: 'peakHour',
      label: 'Peak Hour',
      value: formatHour(data.peakHour),
      subtitle: 'Most accidents occur at this hour',
    },
  ]
}
