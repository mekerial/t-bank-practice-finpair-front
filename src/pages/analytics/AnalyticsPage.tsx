import Card from '../../shared/ui/Card'
import axios from 'axios'
import {
  formatMoneyPlain,
  type CategorySlice,
  type HouseholdCurrency,
  type PartnerComparePoint
} from '../../shared/lib/financeView'
import { isValidHouseholdId } from '../../shared/lib/householdId'
import {
  fetchAnalyticsPageData,
  type AnalyticsPageData
} from '../../shared/api/analyticsApi'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import { useCompactCharts } from '../../shared/hooks/useCompactCharts'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import { fetchCoupleRequest } from '../../shared/api/settingsApi'
import type { CoupleDetails } from '../../shared/api/settingsApi'
import './analytics.css'
import '../../app/styles/mobile-pages.css'

function chartYMax(values: number[]): number {
  const finite = values.filter((v) => Number.isFinite(v))
  const raw = finite.length > 0 ? Math.max(...finite, 0) : 0
  return Number.isFinite(raw) ? raw : 0
}

type ChartPadding = { top: number; right: number; bottom: number; left: number }

function chartPadding(compact: boolean): ChartPadding {
  return compact
    ? { top: 36, right: 20, bottom: 40, left: 20 }
    : { top: 20, right: 16, bottom: 30, left: 50 }
}

function formatMonthTick(monthKey: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(monthKey.trim())
  if (!m) return monthKey
  const labels = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек'
  ]
  const mi = Number(m[2]) - 1
  if (mi < 0 || mi > 11) return monthKey
  const year = m[1]
  return `${labels[mi]}\u00A0${year}`
}

function DoubleLineChart({
  data,
  partnerALabel,
  partnerBLabel,
  compact = false
}: {
  data: PartnerComparePoint[]
  partnerALabel: string
  partnerBLabel: string
  compact?: boolean
}) {
  if (data.length === 0) {
    return <p>Нет данных для графика</p>
  }

  const width = 800
  const height = 260
  const padding = chartPadding(compact)
  const max = chartYMax(data.flatMap((d) => [d.a, d.b]))
  const min = 0
  const denominator = Math.max(max - min, 1)
  const xStep =
    (width - padding.left - padding.right) / Math.max(1, data.length - 1)
  const yRange = height - padding.top - padding.bottom

  const pointsA = data.map((d, i) => {
    const x = padding.left + i * xStep
    const y = padding.top + yRange - ((d.a - min) / denominator) * yRange
    return { x, y, month: d.month, value: d.a }
  })

  const pointsB = data.map((d, i) => {
    const x = padding.left + i * xStep
    const y = padding.top + yRange - ((d.b - min) / denominator) * yRange
    return { x, y, month: d.month, value: d.b }
  })

  const pathA = pointsA.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  const pathB = pointsB.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')

  const formatYValue = (val: number) => {
    if (val >= 1000) return `${Math.round(val / 1000)}k`
    return `${Math.round(val)}`
  }

  const gridLevels = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="chart-block">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="260" className="chart">
        {compact && max > 0 ? (
          <text
            x={width / 2}
            y={18}
            fontSize="11"
            textAnchor="middle"
            fill="var(--color-chart-tick)"
          >
            {formatYValue(0)} — {formatYValue(max)}
          </text>
        ) : null}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--color-chart-axis)"
          strokeWidth="1.5"
        />

        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--color-chart-axis)"
          strokeWidth="1.5"
        />

        {gridLevels.map((t, i) => {
          const y = padding.top + yRange * (1 - t)
          const valueAtLine = min + (max - min) * t
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--color-chart-grid)"
                strokeWidth="1"
              />
              {!compact ? (
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize="11"
                  textAnchor="end"
                  fill="var(--color-chart-tick)"
                >
                  {formatYValue(valueAtLine)}
                </text>
              ) : null}
            </g>
          )
        })}

        <path d={pathA} fill="none" stroke="var(--color-chart-a)" strokeWidth="2.5" />
        <path d={pathB} fill="none" stroke="var(--color-chart-b)" strokeWidth="2.5" />

        {pointsA.map((p, i) => (
          <circle key={`a-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-chart-a)" stroke="#fff" strokeWidth="1.5" />
        ))}

        {pointsB.map((p, i) => (
          <circle key={`b-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-chart-b)" stroke="#fff" strokeWidth="1.5" />
        ))}

        {pointsA.map((p, i) => (
          <text
            key={`x-${i}`}
            x={p.x}
            y={height - padding.bottom + 15}
            fontSize="11"
            textAnchor="middle"
            fill="var(--color-chart-tick)"
          >
            {formatMonthTick(p.month)}
          </text>
        ))}
      </svg>
      
      <div className="bar-legend">
        <span>
          <span className="bar-legend__dot" style={{ background: 'var(--color-chart-a)' }} />{' '}
          {partnerALabel}
        </span>
        <span>
          <span className="bar-legend__dot" style={{ background: 'var(--color-chart-b)' }} />{' '}
          {partnerBLabel}
        </span>
      </div>
    </div>
  )
}

function PieChart({ data }: { data: CategorySlice[] }) {
  const size = 200
  const r = 80
  const cx = size / 2
  const cy = size / 2
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total <= 0) {
    return <p>Нет данных по категориям</p>
  }

  if (data.length === 1) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="chart">
        <circle cx={cx} cy={cy} r={r} fill={data[0].color} />
      </svg>
    )
  }

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
    <svg viewBox={`0 0 ${size} ${size}`} className="chart">
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} />
      ))}
    </svg>
  )
}

function BarChart({
  data,
  compact = false
}: {
  data: PartnerComparePoint[]
  compact?: boolean
}) {
  if (data.length === 0) {
    return <p>Нет данных для сравнения</p>
  }

  const chartData = data.filter((d) => d.a > 0 || d.b > 0)
  const source = chartData.length > 0 ? chartData : data

  const width = 500
  const height = 260
  const padding = chartPadding(compact)
  const max = chartYMax(source.flatMap((d) => [d.a, d.b]))
  const min = 0
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom
  const safeMax = Math.max(max, 1)
  const groupW = plotW / source.length
  const barW = groupW / 3

  const formatYValue = (val: number) => {
    if (val >= 1000) return `${Math.round(val / 1000)}k`
    return `${Math.round(val)}`
  }

  const gridLevels = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="chart-block">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="260"
        className="chart"
      >
        {compact && max > 0 ? (
          <text
            x={width / 2}
            y={18}
            fontSize="11"
            textAnchor="middle"
            fill="var(--color-chart-tick)"
          >
            {formatYValue(0)} — {formatYValue(max)}
          </text>
        ) : null}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--color-chart-axis)"
          strokeWidth="1.5"
        />

        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--color-chart-axis)"
          strokeWidth="1.5"
        />

        {gridLevels.map((t, i) => {
          const y = padding.top + plotH * (1 - t)
          const valueAtLine = min + (max - min) * t
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--color-chart-grid)"
                strokeWidth="1"
              />
              {!compact ? (
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize="11"
                  textAnchor="end"
                  fill="var(--color-chart-tick)"
                >
                  {formatYValue(valueAtLine)}
                </text>
              ) : null}
            </g>
          )
        })}

      {source.map((d, i) => {
        const baseX = padding.left + i * groupW + groupW / 2 - barW
        const hA = (d.a / safeMax) * plotH
        const hB = (d.b / safeMax) * plotH
        return (
          <g key={d.month}>
            <rect
              x={baseX}
              y={padding.top + plotH - hA}
              width={barW}
              height={hA}
              fill="var(--color-chart-a)"
              rx="3"
            />
            <rect
              x={baseX + barW}
              y={padding.top + plotH - hB}
              width={barW}
              height={hB}
              fill="var(--color-chart-b)"
              rx="3"
            />
          </g>
        )
      })}

      {source.map((d, i) => {
        const baseX = padding.left + i * groupW + groupW / 2
        return (
          <text
            key={`x-${i}`}
            x={baseX}
            y={height - padding.bottom + 15}
            fontSize="11"
            textAnchor="middle"
            fill="var(--color-chart-tick)"
          >
            {formatMonthTick(d.month)}
          </text>
        )
      })}
      </svg>
    </div>
  )
}

function AnalyticsPageContent({
  data,
  partnerALabel,
  partnerBLabel,
  currency
}: {
  data: AnalyticsPageData
  partnerALabel: string
  partnerBLabel: string
  currency: HouseholdCurrency
}) {
  const { kpi, categories, partnerCompare, insights } = data
  const compactCharts = useCompactCharts()

  return (
    <>
      <div className="kpi-grid">
        {kpi.map((k) => (
          <div key={k.id} className="kpi">
            <div className="kpi__label">{k.label}</div>
            <div className="kpi__value">{k.value}</div>
            <div className="kpi__hint">{k.hint}</div>
          </div>
        ))}
      </div>

      <Card title="Динамика расходов по месяцам">
        <DoubleLineChart
          data={partnerCompare}
          partnerALabel={partnerALabel}
          partnerBLabel={partnerBLabel}
          compact={compactCharts}
        />
      </Card>

      <div className="analytics__grid-2">
        <Card title="Распределение по категориям">
          <div className="pie-wrap">
            <PieChart data={categories} />
            <div className="pie-legend">
              {categories.map((c, i) => (
                <div key={`${c.name}-${i}`} className="pie-legend__item">
                  <span
                    className="pie-legend__dot"
                    style={{ background: c.color }}
                  />
                  <span className="pie-legend__name">{c.name}</span>
                  <span className="pie-legend__value">
                    {formatMoneyPlain(c.value, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Сравнение трат партнёров">
          <BarChart data={partnerCompare} compact={compactCharts} />
          <div className="bar-legend">
            <span>
              <span
                className="bar-legend__dot"
                style={{ background: 'var(--color-chart-a)' }}
              />{' '}
              {partnerALabel}
            </span>
            <span>
              <span
                className="bar-legend__dot"
                style={{ background: 'var(--color-chart-b)' }}
              />{' '}
              {partnerBLabel}
            </span>
          </div>
        </Card>
      </div>

      <Card title="💡 Инсайты и рекомендации">
        <div className="insights">
          {insights.map((item, index) => (
            <div key={item.id} className="insight">
              <span className="insight__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="insight__content">
                <div className="insight__title">{item.title}</div>
                <div className="insight__text">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export default function AnalyticsPage() {
  const emptyCouple: CoupleDetails = {
    id: '',
    inviteCode: '',
    currency: 'RUB',
    splitType: 'equal',
    notifications: {},
    members: [],
    users: []
  }
  const emptyAnalytics: AnalyticsPageData = {
    kpi: [],
    categories: [],
    partnerCompare: [],
    insights: []
  }
  const { data: coupleData } = useAsyncData(
    'analytics-couple',
    async () => {
      try {
        return await fetchCoupleRequest()
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) return emptyCouple
        throw e
      }
    }
  )
  const analyticsHouseholdKey = coupleData?.id
  const currency: HouseholdCurrency = coupleData?.currency ?? 'RUB'
  const { data, status, error, refetch } = useAsyncData(
    `analytics-${isValidHouseholdId(analyticsHouseholdKey) ? analyticsHouseholdKey : 'no-couple'}-${currency}`,
    () =>
      isValidHouseholdId(analyticsHouseholdKey)
        ? fetchAnalyticsPageData(currency)
        : Promise.resolve(emptyAnalytics)
  )
  const members = coupleData?.members ?? coupleData?.users ?? []
  const membersSorted = [...members].sort((a, b) => a.userId.localeCompare(b.userId))
  const partnerALabel = membersSorted[0]?.name ?? 'Партнёр A'
  const partnerBLabel = membersSorted[1]?.name ?? 'Партнёр B'
  return (
    <div className="analytics">
      <h1 className="analytics__title">Аналитика</h1>

      <AsyncDataView
        status={status}
        error={error}
        onRetry={refetch}
        loadingLabel="Загружаем аналитику…"
      >
        {data ? (
          <AnalyticsPageContent
            data={data}
            partnerALabel={partnerALabel}
            partnerBLabel={partnerBLabel}
            currency={currency}
          />
        ) : null}
      </AsyncDataView>
    </div>
  )
}