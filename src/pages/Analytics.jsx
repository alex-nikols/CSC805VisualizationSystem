import KpiCards from '../components/analytics/KpiCards'
import AccidentsOverTime from '../components/analytics/AccidentsOverTime'

export default function Analytics() {
  return (
    <div className="bg-gray-50 flex-1 p-6 space-y-6">
      <KpiCards />
      <AccidentsOverTime />
    </div>
  )
}
