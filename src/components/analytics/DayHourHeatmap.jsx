import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a'
  if (i < 12) return `${i}a`
  if (i === 12) return '12p'
  return `${i - 12}p`
})

export default function DayHourHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    fetch('/data/by_day_hour.json')
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
      const margin = { top: 10, right: 20, bottom: 40, left: 44 }
      const innerW = width - margin.left - margin.right
      const cellW = innerW / 24
      const cellH = Math.max(cellW * 0.8, 20)
      const innerH = cellH * 7
      const height = innerH + margin.top + margin.bottom

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', width).attr('height', height)

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Flatten data for color scale
      const allCounts = data.flatMap((d) => d.hours)
      const maxCount = d3.max(allCounts)
      const minCount = d3.min(allCounts)

      const colorScale = d3
        .scaleSequential()
        .domain([minCount, maxCount])
        .interpolator(d3.interpolateYlOrRd)

      // Draw cells
      data.forEach((dayData, dayIdx) => {
        dayData.hours.forEach((count, hourIdx) => {
          g.append('rect')
            .attr('x', hourIdx * cellW)
            .attr('y', dayIdx * cellH)
            .attr('width', cellW - 1)
            .attr('height', cellH - 1)
            .attr('fill', colorScale(count))
            .attr('rx', 2)
        })
      })

      // Y axis — day labels
      DAYS.forEach((day, i) => {
        g.append('text')
          .attr('x', -6)
          .attr('y', i * cellH + cellH / 2)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'text-[10px] fill-gray-500')
          .text(day)
      })

      // X axis — hour labels (show every other to avoid crowding)
      HOURS.forEach((label, i) => {
        if (i % 2 !== 0) return
        g.append('text')
          .attr('x', i * cellW + cellW / 2)
          .attr('y', innerH + 16)
          .attr('text-anchor', 'middle')
          .attr('class', 'text-[10px] fill-gray-500')
          .text(label)
      })

      // Color legend
      const legendW = Math.min(200, innerW * 0.4)
      const legendH = 8
      const legendX = (innerW - legendW) / 2
      const legendY = innerH + 28

      const defs = svg.append('defs')
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'heatmap-gradient')
      gradient.append('stop').attr('offset', '0%').attr('stop-color', colorScale(minCount))
      gradient.append('stop').attr('offset', '100%').attr('stop-color', colorScale(maxCount))

      g.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendW)
        .attr('height', legendH)
        .attr('rx', 4)
        .attr('fill', 'url(#heatmap-gradient)')

      g.append('text')
        .attr('x', legendX - 4)
        .attr('y', legendY + legendH / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-[10px] fill-gray-400')
        .text('Less')

      g.append('text')
        .attr('x', legendX + legendW + 4)
        .attr('y', legendY + legendH / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-[10px] fill-gray-400')
        .text('More')
    }

    drawChart()

    const observer = new ResizeObserver(drawChart)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [data])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="h-4 w-52 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 w-72 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Accident Heatmap by Day & Hour
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Intensity shows accident density — darker = more accidents
        </p>
      </div>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} />
      </div>
    </div>
  )
}
