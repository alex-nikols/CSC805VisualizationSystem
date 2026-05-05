import { useJsonData } from '../../hooks/useJsonData'
import ChartCard from '../common/ChartCard'

const CATEGORIES = [
  { key: 'visibility', label: 'Visibility', color: '#14b8a6' },
  { key: 'windSpeed', label: 'Wind Speed', color: '#3b82f6' },
  { key: 'precipitation', label: 'Precipitation', color: '#1e3a5f' },
]

export default function WeatherConditions() {
  const { data, loading } = useJsonData('/data/by_weather.json')

  if (loading) return <WeatherSkeleton />
  if (!data) return null

  return (
    <ChartCard
      title="Weather Conditions"
      subtitle="Accident distribution by weather at time of incident"
    >
      <div className="space-y-5">
        {CATEGORIES.map((cat) => {
          const buckets = data[cat.key]
          if (!buckets) return null
          return <WeatherCategory key={cat.key} category={cat} buckets={buckets} />
        })}
      </div>
    </ChartCard>
  )
}

function WeatherCategory({ category, buckets }) {
  const maxCount = Math.max(...buckets.map((b) => b.count))

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{category.label}</h4>
      <div className="space-y-2">
        {buckets.map((bucket) => (
          <WeatherBar
            key={bucket.label}
            bucket={bucket}
            maxCount={maxCount}
            color={category.color}
          />
        ))}
      </div>
    </div>
  )
}

function WeatherBar({ bucket, maxCount, color }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 sm:w-28 text-xs text-gray-500 shrink-0 truncate">{bucket.label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 relative min-w-0">
        <div
          className="h-4 rounded-full"
          style={{
            width: `${(bucket.count / maxCount) * 100}%`,
            backgroundColor: color,
            minWidth: bucket.count > 0 ? '4px' : '0px',
          }}
        />
      </div>
      <span className="hidden sm:inline w-20 text-right text-xs text-gray-600 shrink-0">
        {bucket.count.toLocaleString()}
      </span>
      <span className="w-10 sm:w-12 text-right text-xs text-gray-400 shrink-0">
        {bucket.percentage}%
      </span>
    </div>
  )
}

function WeatherSkeleton() {
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
