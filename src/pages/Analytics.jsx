import KpiCards from '../components/analytics/KpiCards'
import AccidentsOverTime from '../components/analytics/AccidentsOverTime'
import SeverityDistribution from '../components/analytics/SeverityDistribution'
import TopCounties from '../components/analytics/TopCounties'
import WeatherConditions from '../components/analytics/WeatherConditions'

export default function Analytics() {
  return (
    <div className="bg-gray-50 flex-1 p-6 space-y-6">
      <KpiCards />
      <AccidentsOverTime />
      <SeverityDistribution />
      <TopCounties />
      <WeatherConditions />
    </div>
  )
}
