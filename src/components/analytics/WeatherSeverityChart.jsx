import { useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

import ChartCard from '../common/ChartCard'
import SkeletonCard from '../common/SkeletonCard'
import { useJsonData } from '../../hooks/useJsonData'
import { useChartResize } from '../../hooks/useChartResize'
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../lib/constants'
import { formatCount } from '../../lib/format'

const DIMENSIONS = [
  { key: 'precipitation', label: 'Precipitation' },
  { key: 'visibility', label: 'Visibility' },
  { key: 'windSpeed', label: 'Wind Speed' },
]

const SEVERITY_KEYS = ['s1', 's2', 's3', 's4']

export default function WeatherSeverityChart() {
  const { data, loading } = useJsonData('/data/by_weather_severity.json')
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [activeDim, setActiveDim] = useState('precipitation')
  const [activeSeverities, setActiveSeverities] = useState(new Set([3, 4]))
  const [showPercent, setShowPercent] = useState(true)

  const toggleSeverity = useCallback((sev) => {
    setActiveSeverities((prev) => {
      if (prev.has(sev) && prev.size === 1) return prev
      const next = new Set(prev)
      if (next.has(sev)) next.delete(sev)
      else next.add(sev)
      return next
    })
  }, [])

  useChartResize(containerRef, () => {
    if (!data || !svgRef.current) return
    drawChart(svgRef.current, containerRef.current, data[activeDim], activeSeverities, showPercent, activeDim)
  }, [data, activeDim, activeSeverities, showPercent])

  if (loading) return <SkeletonCard />
  if (!data) return null

  return (
    <ChartCard
      title="Severity Distribution by Weather Condition"
      subtitle="What proportion of accidents are serious under different weather conditions?"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Dimension tabs + % / # toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1">
            {DIMENSIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveDim(d.key)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeDim === d.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* % / # toggle */}
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
            <button
              onClick={() => setShowPercent(true)}
              className={`px-2.5 py-1 transition-colors ${
                showPercent ? 'bg-gray-700 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              %
            </button>
            <button
              onClick={() => setShowPercent(false)}
              className={`px-2.5 py-1 transition-colors border-l border-gray-200 ${
                !showPercent ? 'bg-gray-700 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              #
            </button>
          </div>
        </div>

        {/* Severity checkboxes */}
        <div className="flex gap-3 sm:gap-4 flex-wrap">
          {SEVERITY_KEYS.map((k, i) => {
            const sev = i + 1
            const active = activeSeverities.has(sev)
            return (
              <button
                key={k}
                onClick={() => toggleSeverity(sev)}
                className="flex items-center gap-1.5 cursor-pointer select-none"
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors shrink-0"
                  style={active
                    ? { background: SEVERITY_COLORS[sev], borderColor: SEVERITY_COLORS[sev] }
                    : { background: '#fff', borderColor: '#d1d5db' }
                  }
                >
                  {active && (
                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={`text-xs ${active ? 'text-gray-700' : 'text-gray-400'}`}>
                  {SEVERITY_LABELS[sev]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div ref={containerRef} className="w-full relative">
        <svg ref={svgRef} />
      </div>
    </ChartCard>
  )
}

function drawChart(svgEl, containerEl, rows, activeSeverities, showPercent, dim) {
  const width = containerEl.clientWidth
  const height = 280
  const margin = { top: 10, right: 20, bottom: 36, left: showPercent ? 52 : 60 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const svg = d3.select(svgEl)
  svg.selectAll('*').remove()
  svg.attr('width', width).attr('height', height)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const activeKeys = SEVERITY_KEYS.filter((_, i) => activeSeverities.has(i + 1))

  // visibility: reverse so left→right = best→worst (severity increases)
  const orderedRows = dim === 'visibility' ? [...rows].reverse() : rows

  // Build data rows — keep _raw for tooltip access
  const plotRows = orderedRows.map((row) => {
    const entry = { label: row.label, _raw: row }
    SEVERITY_KEYS.forEach((k) => {
      entry[k] = showPercent
        ? (row.total > 0 ? row[k] / row.total : 0)
        : row[k]
    })
    return entry
  })

  const yMax = d3.max(plotRows, (row) =>
    activeKeys.reduce((sum, k) => sum + row[k], 0)
  ) || (showPercent ? 0.01 : 1)

  const stacked = d3.stack().keys(activeKeys)(plotRows)

  const x = d3.scaleBand()
    .domain(plotRows.map((d) => d.label))
    .range([0, innerW])
    .padding(0.3)

  const MAX_BAR_WIDTH = 72
  const barW = Math.min(x.bandwidth(), MAX_BAR_WIDTH)
  const barOffset = (x.bandwidth() - barW) / 2

  const yDomainMax = showPercent ? Math.min(yMax * 1.12, 1.0) : yMax * 1.12
  const y = d3.scaleLinear()
    .domain([0, yDomainMax])
    .range([innerH, 0])
    .nice()

  // Gridlines
  g.append('g')
    .selectAll('line')
    .data(y.ticks(5))
    .join('line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', (d) => y(d)).attr('y2', (d) => y(d))
    .attr('stroke', '#f3f4f6')

  // Tooltip div — reuse across redraws, lives in containerEl
  const containerSel = d3.select(containerEl)
  let tip = containerSel.select('.ws-tooltip')
  if (tip.empty()) {
    tip = containerSel.append('div').attr('class', 'ws-tooltip')
  }
  tip.style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('background', '#fff')
    .style('border', '1px solid #e5e7eb')
    .style('border-radius', '8px')
    .style('padding', '8px 12px')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.08)')
    .style('font-size', '12px')
    .style('line-height', '1.6')
    .style('white-space', 'nowrap')
    .style('z-index', '20')
    .style('transition', 'opacity 0.1s')

  // Stacked bars
  stacked.forEach((layer, layerIdx) => {
    const sevIdx = SEVERITY_KEYS.indexOf(activeKeys[layerIdx])
    const sevNum = sevIdx + 1
    const isTop = layerIdx === activeKeys.length - 1
    g.selectAll(null)
      .data(layer)
      .join('rect')
      .attr('x', (d) => x(d.data.label) + barOffset)
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => Math.max(0, y(d[0]) - y(d[1])))
      .attr('width', barW)
      .attr('fill', SEVERITY_COLORS[sevNum])
      .attr('rx', 0)
      .attr('ry', 0)
      .style('cursor', 'pointer')
      .on('mousemove', function (event, d) {
        const raw = d.data._raw
        const count = raw[activeKeys[layerIdx]]
        const pct = raw.total > 0 ? (count / raw.total * 100) : 0
        const decimals = pct < 1 ? 1 : 0
        tip.style('opacity', '1').html(
          `<div style="font-weight:600;color:#111;margin-bottom:2px">${raw.label}</div>` +
          `<div style="display:flex;align-items:center;gap:6px">` +
          `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${SEVERITY_COLORS[sevNum]}"></span>` +
          `<span style="color:#374151">${SEVERITY_LABELS[sevNum]}</span>` +
          `</div>` +
          `<div style="color:#6b7280;margin-top:2px">` +
          `Count: <strong style="color:#111">${count.toLocaleString()}</strong></div>` +
          `<div style="color:#6b7280">` +
          `Share: <strong style="color:#111">${pct.toFixed(decimals)}%</strong></div>`
        )
        const [mx, my] = d3.pointer(event, containerEl)
        const tipW = 160
        const left = mx + 14 + tipW > containerEl.clientWidth ? mx - tipW - 8 : mx + 14
        tip.style('left', `${left}px`).style('top', `${my - 10}px`)
      })
      .on('mouseleave', () => tip.style('opacity', '0'))
  })

  // Y axis
  const yTickFormat = showPercent
    ? (d) => {
        const decimals = yMax < 0.1 ? 1 : 0
        return `${(d * 100).toFixed(decimals)}%`
      }
    : (d) => formatCount(d)

  const seen = new Set()
  const uniqueTicks = y.ticks(5).filter((t) => {
    const label = yTickFormat(t)
    if (seen.has(label)) return false
    seen.add(label)
    return true
  })

  g.append('g')
    .call(d3.axisLeft(y).tickValues(uniqueTicks).tickFormat(yTickFormat))
    .call((ax) => ax.select('.domain').remove())
    .call((ax) => ax.selectAll('.tick line').attr('stroke', '#e5e7eb'))
    .selectAll('text')
    .attr('class', 'text-xs fill-gray-500')

  // X axis — strip parenthetical detail so labels stay horizontal
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(
      d3.axisBottom(x)
        .tickSize(0)
        .tickFormat((d) => d.replace(/\s*\(.*?\)/, '').trim())
    )
    .call((ax) => ax.select('.domain').remove())
    .selectAll('text')
    .attr('dy', '1.2em')
    .attr('class', 'text-xs fill-gray-500')
}
