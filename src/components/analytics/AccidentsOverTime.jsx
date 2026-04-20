import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

export default function AccidentsOverTime() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    fetch('/data/by_year.json')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return

    const drawChart = () => {
      const container = containerRef.current
      const width = container.clientWidth
      const height = 280
      const margin = { top: 20, right: 20, bottom: 40, left: 50 }
      const innerW = width - margin.left - margin.right
      const innerH = height - margin.top - margin.bottom

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', width).attr('height', height)

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.year.toString()))
        .range([0, innerW])
        .padding(0.3)

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.count) * 1.1])
        .nice()
        .range([innerH, 0])

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('class', 'text-xs fill-gray-500')

      // Y axis
      g.append('g')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat((d) => formatCount(d))
        )
        .selectAll('text')
        .attr('class', 'text-xs fill-gray-500')

      // Remove axis domain lines
      g.selectAll('.domain').remove()
      g.selectAll('.tick line').attr('stroke', '#e5e7eb')

      // Horizontal grid lines
      g.append('g')
        .selectAll('line')
        .data(y.ticks(5))
        .join('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', (d) => y(d))
        .attr('y2', (d) => y(d))
        .attr('stroke', '#f3f4f6')

      // Bars
      g.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d) => x(d.year.toString()))
        .attr('y', (d) => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerH - y(d.count))
        .attr('fill', '#4b7bec')
        .attr('rx', 4)
    }

    drawChart()

    const observer = new ResizeObserver(drawChart)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [data])

  // Growth badge calculation
  const growthPercent =
    data && data.length >= 2
      ? (
          ((data[data.length - 1].count - data[0].count) / data[0].count) *
          100
        ).toFixed(0)
      : null

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 w-56 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Accidents Over Time
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Yearly trend 2016-2023
          </p>
        </div>
        {growthPercent !== null && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              Number(growthPercent) >= 0
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-600'
            }`}
          >
            {Number(growthPercent) >= 0 ? '+' : ''}
            {growthPercent}%
          </span>
        )}
      </div>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} />
      </div>
    </div>
  )
}
