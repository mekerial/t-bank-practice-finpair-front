import Card from '../../shared/ui/Card'
import {
  mockAnalyticsKpi,
  mockMonthlyTrend,
  mockCategories,
  mockPartnerCompare,
  mockInsights,
  formatMoneyPlain,
  type MonthlyPoint,
  type CategorySlice,
  type PartnerComparePoint
} from '../../shared/lib/mocks'
import './analytics.css'

function LineChart({ data }: { data: MonthlyPoint[] }) {
  const width = 800
  const height = 260
  const padding = { top: 20, right: 16, bottom: 30, left: 50 }
  const max = Math.max(...data.map((d) => d.value))
  const min = 0
  const xStep =
    (width - padding.left - padding.right) / Math.max(1, data.length - 1)
  const yRange = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep
    const y =
      padding.top + yRange - ((d.value - min) / (max - min)) * yRange
    return { x, y, ...d }
  })

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="260"
      className="chart"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + yRange * t}
          y2={padding.top + yRange * t}
          stroke="#eef0f4"
        />
      ))}
      <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" />
      {points.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="3.5" fill="#6366f1" />
      ))}
      {points.map((p, i) => (
        <text
          key={`t-${i}`}
          x={p.x}
          y={height - 10}
          fontSize="11"
          textAnchor="middle"
          fill="#64748b"
        >
          {p.month}
        </text>
      ))}
      {[0, 0.5, 1].map((t, i) => (
        <text
          key={`y-${i}`}
          x={10}
          y={padding.top + yRange * (1 - t) + 4}
          fontSize="11"
          fill="#64748b"
        >
          {Math.round((max * t) / 1000)}k
        </text>
      ))}
    </svg>
  )
}

function PieChart({ data }: { data: CategorySlice[] }) {
  const size = 200
  const r = 80
  const cx = size / 2
  const cy = size / 2
  const total = data.reduce((s, d) => s + d.value, 0)
  let cursor = 0

  const arcs = data.map((d) => {
    const start = (cursor / total) * Math.PI * 2
    cursor += d.value
    const end = (cursor / total) * Math.PI * 2
    const large = end - start > Math.PI ? 1 : 0
    const x1 = cx + r * Math.sin(start)
    const y1 = cy - r * Math.cos(start)
    const x2 = cx + r * Math.sin(end)
    const y2 = cy - r * Math.cos(end)
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: d.color,
      name: d.name
    }
  })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} />
      ))}
    </svg>
  )
}

function BarChart({ data }: { data: PartnerComparePoint[] }) {
  const width = 500
  const height = 260
  const padding = { top: 20, right: 16, bottom: 30, left: 50 }
  const max = Math.max(...data.flatMap((d) => [d.a, d.b]))
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom
  const groupW = plotW / data.length
  const barW = groupW / 3

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="260"
      className="chart"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotH * t}
          y2={padding.top + plotH * t}
          stroke="#eef0f4"
        />
      ))}
      {data.map((d, i) => {
        const baseX = padding.left + i * groupW + groupW / 2 - barW
        const hA = (d.a / max) * plotH
        const hB = (d.b / max) * plotH
        return (
          <g key={d.month}>
            <rect
              x={baseX}
              y={padding.top + plotH - hA}
              width={barW}
              height={hA}
              fill="#6366f1"
              rx="3"
            />
            <rect
              x={baseX + barW}
              y={padding.top + plotH - hB}
              width={barW}
              height={hB}
              fill="#a78bfa"
              rx="3"
            />
            <text
              x={baseX + barW}
              y={height - 10}
              fontSize="11"
              textAnchor="middle"
              fill="#64748b"
            >
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="analytics">
      <h1 className="analytics__title">Аналитика</h1>

      <div className="kpi-grid">
        {mockAnalyticsKpi.map((k) => (
          <div key={k.id} className="kpi">
            <div className="kpi__label">{k.label}</div>
            <div className="kpi__value">{k.value}</div>
            <div className="kpi__hint">{k.hint}</div>
          </div>
        ))}
      </div>

      <Card title="Динамика расходов по месяцам">
        <LineChart data={mockMonthlyTrend} />
      </Card>

      <div className="analytics__grid-2">
        <Card title="Распределение по категориям">
          <div className="pie-wrap">
            <PieChart data={mockCategories} />
            <div className="pie-legend">
              {mockCategories.map((c) => (
                <div key={c.name} className="pie-legend__item">
                  <span
                    className="pie-legend__dot"
                    style={{ background: c.color }}
                  />
                  <span className="pie-legend__name">{c.name}</span>
                  <span className="pie-legend__value">
                    {formatMoneyPlain(c.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Сравнение трат партнёров">
          <BarChart data={mockPartnerCompare} />
          <div className="bar-legend">
            <span>
              <span
                className="bar-legend__dot"
                style={{ background: '#6366f1' }}
              />{' '}
              Партнёр А
            </span>
            <span>
              <span
                className="bar-legend__dot"
                style={{ background: '#a78bfa' }}
              />{' '}
              Партнёр Б
            </span>
          </div>
        </Card>
      </div>

      <Card title="💡 Инсайты и рекомендации">
        <div className="insights">
          {mockInsights.map((i) => (
            <div key={i.id} className="insight">
              <div className="insight__title">{i.title}</div>
              <div className="insight__text">{i.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
