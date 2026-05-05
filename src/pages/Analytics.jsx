import KpiCards from '../components/analytics/KpiCards'
import AccidentsOverTime from '../components/analytics/AccidentsOverTime'
import SeverityDistribution from '../components/analytics/SeverityDistribution'
import TopCounties from '../components/analytics/TopCounties'
import WeatherConditions from '../components/analytics/WeatherConditions'
import DayHourHeatmap from '../components/analytics/DayHourHeatmap'
import WeatherSeverityChart from '../components/analytics/WeatherSeverityChart'

export default function Analytics() {
  return (
    <div className="bg-gray-50 flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

      {/* Row 1: KPI cards */}
      <KpiCards />

      {/* Row 2: Monthly Trend (wider) + Severity Distribution (narrower) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3">
          <AccidentsOverTime />
        </div>
        <div className="lg:col-span-2">
          <SeverityDistribution />
        </div>
      </div>

      {/* Row 3: Top 10 Counties (left) + Weather & Heatmap stacked (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TopCounties />
        <div className="space-y-4 sm:space-y-6">
          <WeatherConditions />
          <DayHourHeatmap />
        </div>
      </div>

      {/* Row 4: Weather × Severity stacked bar */}
      <WeatherSeverityChart />
    </div>
  )
}
