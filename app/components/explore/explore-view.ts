// Pure port of the mockup's explore-filters.js render logic (render, renderOverview,
// renderFiltered, updateKpis, chart()) and CarVet.pages.explore. The page derives
// everything from (rows, filters); React components only render the result.
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import { fmt } from '../../lib/carvet'
import { averageFor, by, correlation, histogram, linearLine, mean, sortedNumericKeys } from '../../lib/explore-stats'
import type { CsvRow, Stats } from '../../lib/types'

export const LOADING_STATUS = 'Loading the attached CSV dataset…'
export const ERROR_STATUS = 'The vehicle dataset could not be loaded. Check your connection and try again.'

// explore-filters.js has its own capitalisation, which differs from lib/vehicle-labels.ts.
export const EXPLORE_FUEL_LABELS: Record<string, string> = {
  X: 'Regular Gasoline',
  Z: 'Premium Gasoline',
  E: 'Ethanol (E85)',
  D: 'Diesel',
  N: 'Natural Gas',
}

// Chart series colours, verbatim from explore-filters.js.
export const COLORS = {
  blue: '#2563eb',
  teal: '#0f766e',
  orange: '#2e7d32',
  purple: '#1654da',
  slate: '#64748b',
  red: '#dc2626',
}

export type ChartKey = 'co2Hist' | 'fuelHist' | 'trend' | 'class' | 'fuel' | 'scatter'
// The mockup's chartIds also lists "cyl", but explore.html has no cyl card/canvas, so it never rendered.
export const CHART_KEYS: ChartKey[] = ['co2Hist', 'fuelHist', 'trend', 'class', 'fuel', 'scatter']

export interface Filters {
  fuel: string
  vehicleClass: string
}

export interface Kpis {
  records: string
  years: string
  makes: string
  classes: string
  co2: string
  co2Range: string
  fuel: string
  fuelRange: string
}

type XY = { x: number; y: number }
type AnyChartType = 'bar' | 'line' | 'scatter'

export interface ChartSpec {
  type: AnyChartType
  data: ChartData<AnyChartType, (number | null | XY)[], unknown>
  options: ChartOptions<AnyChartType>
}

export interface CardView {
  eyebrow: string
  title: string
  /** co2Stats / fuelStats line (histogram cards). */
  stats?: string
  /** trendNote (trend card). */
  note?: string
  /** scatterR chip text; null when the mockup's textContent write removed the chip. */
  r?: string | null
  chart: ChartSpec | null
}

export interface ExploreView {
  kpis: Kpis
  resultsSummary: string
  activeFilterSummary: string
  status: string
  visible: ChartKey[]
  cards: Partial<Record<ChartKey, CardView>>
}

const CO2 = 'CO2 emissions (g/km)'
const FUEL = 'Combined (L/100 km)'
const ENGINE = 'Engine size (L)'

// explore-filters.js fmt / toLocaleString: maximumFractionDigits only (en-CA per global constraints).
const fmtMax = (v: number | null, digits = 1) =>
  v === null || !Number.isFinite(v) ? '—' : v.toLocaleString('en-CA', { maximumFractionDigits: digits })
const count = (n: number) => n.toLocaleString('en-CA')
const fuelName = (code: string) => EXPLORE_FUEL_LABELS[code] || code
const validCount = (rows: CsvRow[], key: keyof CsvRow) => rows.filter((r) => r[key] !== null).length

// --- data loading ---------------------------------------------------------

export function cleanRows(rows: CsvRow[]): CsvRow[] {
  return rows.filter((row) => row['Fuel type'] && row['Vehicle class'])
}

export function classOptions(rows: CsvRow[]): string[] {
  return [...new Set(rows.map((r) => r['Vehicle class']).filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

export function filterRows(rows: CsvRow[], { fuel, vehicleClass }: Filters): CsvRow[] {
  return rows.filter(
    (r) => (fuel === 'all' || r['Fuel type'] === fuel) && (vehicleClass === 'all' || r['Vehicle class'] === vehicleClass),
  )
}

// --- KPIs -----------------------------------------------------------------

export function staticKpis(stats: Stats): Kpis {
  const k = stats.kpis
  return {
    records: fmt(k.records),
    years: `${k.years.min}–${String(k.years.max).slice(2)}`,
    makes: fmt(k.makes),
    classes: fmt(k.classes),
    co2: fmt(k.co2.mean, 1),
    co2Range: `range ${k.co2.min}–${k.co2.max}`,
    fuel: fmt(k.fuel.mean, 2),
    fuelRange: `range ${k.fuel.min.toFixed(1)}–${k.fuel.max.toFixed(1)}`,
  }
}

export function rowKpis(rows: CsvRow[]): Kpis {
  const unique = (key: keyof CsvRow) => new Set(rows.map((r) => r[key]).filter((v) => v !== null && v !== '')).size
  const co2 = rows.map((r) => r[CO2]).filter((v): v is number => v !== null)
  const fuel = rows.map((r) => r[FUEL]).filter((v): v is number => v !== null)
  const min = (vs: number[]) => vs.reduce((a, b) => Math.min(a, b))
  const max = (vs: number[]) => vs.reduce((a, b) => Math.max(a, b))
  return {
    records: count(rows.length),
    years: count(unique('Model year')),
    makes: count(unique('Make')),
    classes: count(unique('Vehicle class')),
    co2: fmtMax(mean(co2), 1),
    co2Range: co2.length
      ? `${fmtMax(min(co2), 0)}–${fmtMax(max(co2), 0)} g/km · n=${count(co2.length)}`
      : 'No valid CO₂ values',
    fuel: fmtMax(mean(fuel), 1),
    fuelRange: fuel.length
      ? `${fmtMax(min(fuel), 1)}–${fmtMax(max(fuel), 1)} L/100 km · n=${count(fuel.length)}`
      : 'No valid fuel values',
  }
}

// --- chart() defaults -----------------------------------------------------

interface ChartInput {
  type: AnyChartType
  data: ChartSpec['data']
  // Loosely typed like the mockup: it is merged into Chart.js options below.
  options?: Record<string, any>
  xTitle?: string
  yTitle?: string
}

/** Port of explore-filters.js chart(): merges the mockup's default options into a config. */
export function chartConfig(config: ChartInput): ChartSpec {
  const userOptions = config.options || {}
  const isXY = config.type === 'scatter' || userOptions.scales?.x?.type === 'linear'
  const xTitle = { display: !!config.xTitle, text: config.xTitle || '' }
  const yTitle = { display: !!config.yTitle, text: config.yTitle || '' }
  const baseScales = isXY
    ? {
        x: { type: 'linear', title: xTitle, ...(userOptions.scales?.x || {}) },
        y: { title: yTitle, ...(userOptions.scales?.y || {}) },
      }
    : {
        x: { title: xTitle, ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 }, ...(userOptions.scales?.x || {}) },
        y: { beginAtZero: true, title: yTitle, ...(userOptions.scales?.y || {}) },
      }
  return {
    type: config.type,
    data: config.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      ...userOptions,
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: { enabled: true },
        ...(userOptions.plugins || {}),
      },
      scales: { ...baseScales, ...(userOptions.scales || {}) },
    } as ChartOptions<AnyChartType>,
  }
}

// --- chart builders -------------------------------------------------------

function sample(points: XY[]): XY[] {
  const step = Math.max(1, Math.ceil(points.length / 800))
  return points.filter((_, i) => i % step === 0).slice(0, 800)
}

function points(rows: CsvRow[], xKey: keyof CsvRow): XY[] {
  return rows
    .filter((r) => r[xKey] !== null && r[CO2] !== null)
    .map((r) => ({ x: r[xKey] as number, y: r[CO2] as number }))
}

function scatterChart(sampled: XY[], color: string, xTitle: string): ChartSpec {
  return chartConfig({
    type: 'scatter',
    data: {
      datasets: [
        { label: 'Vehicle records', data: sampled, backgroundColor: color, pointRadius: 2 },
        {
          label: 'Linear trend',
          data: linearLine(sampled),
          type: 'line',
          showLine: true,
          pointRadius: 0,
          borderColor: COLORS.orange,
          borderWidth: 2,
        },
      ],
    },
    xTitle,
    yTitle: 'CO₂ emissions (g/km)',
  })
}

// The mockup passed xTitle/yTitle inside `options` for the histograms, where chart() never
// read them, so those axes render without titles. They are omitted here to the same effect.
function histChart(values: (number | null)[], color: string): ChartSpec {
  const h = histogram(values)
  return chartConfig({
    type: 'bar',
    data: { labels: h.labels, datasets: [{ label: 'Vehicles', data: h.counts, backgroundColor: color }] },
    options: { plugins: { legend: { display: false } } },
  })
}

function renderOverview(rows: CsvRow[]): Partial<Record<ChartKey, CardView>> {
  const years = by(rows, 'Model year')
  const yearKeys = sortedNumericKeys(years)
  const trend = chartConfig({
    type: 'line',
    data: {
      labels: yearKeys,
      datasets: [
        {
          label: 'Mean CO₂ (g/km)',
          data: yearKeys.map((y) => averageFor(years.get(y)!, CO2)),
          borderColor: COLORS.blue,
          backgroundColor: COLORS.blue,
          yAxisID: 'y',
          tension: 0.2,
          spanGaps: true,
        },
        {
          label: 'Mean engine size (L)',
          data: yearKeys.map((y) => averageFor(years.get(y)!, ENGINE)),
          borderColor: COLORS.orange,
          backgroundColor: COLORS.orange,
          borderDash: [6, 4],
          yAxisID: 'y1',
          tension: 0.2,
          spanGaps: true,
        },
      ],
    },
    options: {
      scales: {
        y: { position: 'left', title: { display: true, text: 'Mean CO₂ (g/km)' } },
        y1: { position: 'right', title: { display: true, text: 'Mean engine size (L)' }, grid: { drawOnChartArea: false } },
      },
    },
  })

  const classPairs = [...by(rows, 'Vehicle class').entries()]
    .map(([name, group]) => ({ name: name as string, value: averageFor(group, CO2), n: validCount(group, CO2) }))
    .filter((x): x is { name: string; value: number; n: number } => x.value !== null)
    .sort((a, b) => b.value - a.value)
  const classChart = chartConfig({
    type: 'bar',
    data: {
      labels: classPairs.map((x) => x.name),
      datasets: [{ label: 'Mean CO₂ (g/km)', data: classPairs.map((x) => x.value), backgroundColor: COLORS.blue }],
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { afterLabel: (ctx: TooltipItem<'bar'>) => `Valid records: ${classPairs[ctx.dataIndex].n}` },
        },
      },
      scales: { x: { title: { display: true, text: 'Mean CO₂ (g/km)' } } },
    },
  })

  const fuels = by(rows, 'Fuel type') as Map<string, CsvRow[]>
  const fuelKeys = [...fuels.keys()].sort((a, b) => fuelName(a).localeCompare(fuelName(b)))
  const fuelChart = chartConfig({
    type: 'bar',
    data: {
      labels: fuelKeys.map((f) => `${f} – ${fuelName(f)}`),
      datasets: [
        { label: 'Record count', data: fuelKeys.map((f) => fuels.get(f)!.length), backgroundColor: COLORS.slate, yAxisID: 'y' },
        {
          label: 'Mean CO₂ (g/km)',
          data: fuelKeys.map((f) => averageFor(fuels.get(f)!, CO2)),
          backgroundColor: COLORS.orange,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      scales: {
        y: { position: 'left', title: { display: true, text: 'Record count' } },
        y1: { position: 'right', title: { display: true, text: 'Mean CO₂ (g/km)' }, grid: { drawOnChartArea: false } },
      },
    },
  })

  const r = correlation(rows, ENGINE, CO2)
  const validCo2 = count(validCount(rows, CO2))
  return {
    co2Hist: {
      eyebrow: 'Primary target',
      title: 'CO₂ emissions distribution',
      stats: `Mean ${fmtMax(averageFor(rows, CO2), 1)} g/km · ${validCo2} valid records`,
      chart: histChart(rows.map((row) => row[CO2]), COLORS.blue),
    },
    fuelHist: {
      eyebrow: 'Secondary target',
      title: 'Fuel consumption distribution',
      stats: `Mean ${fmtMax(averageFor(rows, FUEL), 2)} L/100 km · ${count(validCount(rows, FUEL))} valid records`,
      chart: histChart(rows.map((row) => row[FUEL]), COLORS.teal),
    },
    trend: {
      eyebrow: 'Trend over time',
      title: 'Mean CO₂ emissions and engine size by model year',
      note: `Yearly means are calculated from the currently included records. Valid CO₂ values: ${validCo2}; valid engine-size values: ${count(validCount(rows, ENGINE))}.`,
      chart: trend,
    },
    class: { eyebrow: 'By vehicle class', title: 'Mean CO₂ emissions by vehicle class', chart: classChart },
    fuel: { eyebrow: 'By fuel type', title: 'Record count and mean CO₂ by fuel', chart: fuelChart },
    scatter: {
      eyebrow: 'Engine size vs. emissions',
      title: 'Engine size vs. CO₂ emissions',
      r: r === null ? 'Correlation unavailable' : `r = ${r.toFixed(2)}`,
      chart: scatterChart(sample(points(rows, ENGINE)), 'rgba(37,99,235,.48)', 'Engine size (L)'),
    },
  }
}

function renderFiltered(rows: CsvRow[], isFuelOnly: boolean): Partial<Record<ChartKey, CardView>> {
  const years = by(rows, 'Model year')
  const yearKeys = sortedNumericKeys(years)
  const trend: CardView = {
    eyebrow: 'Trend over time',
    title: 'CO₂ emissions by model year',
    note: `Filtered to ${count(rows.length)} matching vehicles; ${count(validCount(rows, CO2))} have valid CO₂ values.`,
    chart: chartConfig({
      type: 'line',
      data: {
        labels: yearKeys,
        datasets: [
          {
            label: 'Mean CO₂ (g/km)',
            data: yearKeys.map((y) => averageFor(years.get(y)!, CO2)),
            borderColor: COLORS.blue,
            backgroundColor: COLORS.blue,
            tension: 0.2,
            spanGaps: true,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (ctx: TooltipItem<'line'>) => `Vehicles in year: ${years.get(yearKeys[ctx.dataIndex])!.length}`,
            },
          },
        },
        scales: {
          y: { title: { display: true, text: 'Mean CO₂ (g/km)' } },
          x: { title: { display: true, text: 'Model year' } },
        },
      },
    }),
  }
  if (isFuelOnly) {
    return {
      trend,
      fuel: {
        eyebrow: 'Fuel use relationship',
        title: 'Fuel consumption vs. CO₂ emissions',
        chart: scatterChart(sample(points(rows, FUEL)), 'rgba(15,118,110,.48)', 'Combined fuel consumption (L/100 km)'),
      },
    }
  }
  return {
    trend,
    scatter: {
      eyebrow: 'Engine size relationship',
      title: 'Engine size vs. CO₂ emissions',
      r: null,
      chart: scatterChart(sample(points(rows, ENGINE)), 'rgba(37,99,235,.48)', 'Engine size (L)'),
    },
  }
}

// --- views ----------------------------------------------------------------

/** Card text before the CSV loads (and after a load error): the HTML defaults + CarVet.pages.explore. */
export function staticCards(stats: Stats): Record<ChartKey, CardView> {
  const k = stats.kpis
  return {
    co2Hist: {
      eyebrow: 'Primary target',
      title: 'CO₂ emissions distribution',
      stats: `mean ${k.co2.mean} · median ${k.co2.median} · SD ${k.co2.sd}`,
      chart: null,
    },
    fuelHist: {
      eyebrow: 'Secondary target',
      title: 'Fuel consumption distribution',
      stats: `mean ${k.fuel.mean} · median ${k.fuel.median} · SD ${k.fuel.sd}`,
      chart: null,
    },
    trend: { eyebrow: 'Trend over time', title: 'Mean CO₂ emissions and engine size by model year', note: '', chart: null },
    class: { eyebrow: 'By vehicle class', title: 'Mean CO₂ emissions by vehicle class', chart: null },
    fuel: { eyebrow: 'By fuel type', title: 'Record count and mean CO₂ by fuel', chart: null },
    scatter: { eyebrow: 'Engine size vs. emissions', title: 'Engine size vs. CO₂ emissions', r: '', chart: null },
  }
}

/** Port of render(): everything the page shows once the CSV rows are loaded. */
export function deriveView(allRows: CsvRow[], filters: Filters): ExploreView {
  const { fuel, vehicleClass } = filters
  const rows = filterRows(allRows, filters)
  const base = {
    kpis: rowKpis(rows),
    resultsSummary: `Showing ${count(rows.length)} matching vehicle${rows.length === 1 ? '' : 's'}`,
    activeFilterSummary: `Fuel: ${fuel === 'all' ? 'All fuel types' : `${fuel} – ${fuelName(fuel)}`} · Class: ${vehicleClass === 'all' ? 'All classes' : vehicleClass}`,
  }
  if (!rows.length) {
    return { ...base, status: 'No records match the selected combination.', visible: [], cards: {} }
  }
  const isOverview = fuel === 'all' && vehicleClass === 'all'
  const isFuelOnly = fuel !== 'all' && vehicleClass === 'all'
  const cards = isOverview ? renderOverview(rows) : renderFiltered(rows, isFuelOnly)
  return {
    ...base,
    status: rows.length < 2 ? 'Only one matching record is available; trend lines and averages may be limited.' : '',
    visible: CHART_KEYS.filter((key) => key in cards),
    cards,
  }
}
