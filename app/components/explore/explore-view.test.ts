import { describe, expect, it } from 'vitest'
import { stats } from '../../lib/data'
import type { CsvRow } from '../../lib/types'
import {
  chartConfig,
  classOptions,
  cleanRows,
  deriveView,
  ERROR_STATUS,
  LOADING_STATUS,
  rowKpis,
  staticCards,
  staticKpis,
} from './explore-view'

function row(over: Partial<CsvRow>): CsvRow {
  return {
    'Model year': 2020,
    Make: 'Acura',
    Model: 'Model',
    'Vehicle class': 'SUV: Small',
    'Engine size (L)': 2,
    Cylinders: 4,
    Transmission: 'A6',
    'Fuel type': 'X',
    'City (L/100 km)': null,
    'Highway (L/100 km)': null,
    'Combined (L/100 km)': 8,
    'Combined (mpg)': null,
    'CO2 emissions (g/km)': 190,
    'CO2 rating': null,
    'Smog rating': null,
    ...over,
  }
}

const rows = cleanRows([
  row({}),
  row({ Make: 'BMW', 'Engine size (L)': 3, Cylinders: 6, 'Fuel type': 'Z', 'Combined (L/100 km)': 10, 'CO2 emissions (g/km)': 230 }),
  row({ 'Model year': 2021, Make: 'Ford', 'Vehicle class': 'Pickup truck: Standard', 'Engine size (L)': 5, Cylinders: 8, 'Combined (L/100 km)': 14, 'CO2 emissions (g/km)': 320 }),
  row({ 'Model year': 2021, Make: 'Ford', 'Vehicle class': 'Pickup truck: Standard', 'Engine size (L)': 3.5, Cylinders: 6, 'Fuel type': 'D', 'Combined (L/100 km)': 11, 'CO2 emissions (g/km)': 290 }),
  row({ 'Fuel type': '' }), // dropped like the mockup: no fuel type
])

const all = { fuel: 'all', vehicleClass: 'all' }

describe('cleanRows / classOptions', () => {
  it('drops rows without a fuel type or class and lists sorted classes', () => {
    expect(rows).toHaveLength(4)
    expect(classOptions(rows)).toEqual(['Pickup truck: Standard', 'SUV: Small'])
  })
})

describe('KPIs', () => {
  it('prerenders from stats like CarVet.pages.explore', () => {
    expect(staticKpis(stats)).toEqual({
      records: '29,215',
      years: '1995–26',
      makes: '56',
      classes: '17',
      co2: '274.2',
      co2Range: 'range 94–633',
      fuel: '12.04',
      fuelRange: 'range 4.0–27.5',
    })
  })

  it('derives from rows like updateKpis', () => {
    expect(rowKpis(rows)).toEqual({
      records: '4',
      years: '2',
      makes: '3',
      classes: '2',
      co2: '257.5',
      co2Range: '190–320 g/km · n=4',
      fuel: '10.8',
      fuelRange: '8–14 L/100 km · n=4',
    })
    expect(rowKpis([])).toMatchObject({ co2: '—', co2Range: 'No valid CO₂ values', fuelRange: 'No valid fuel values' })
  })
})

describe('staticCards', () => {
  it('uses the overview titles and the stats.json summaries', () => {
    const c = staticCards(stats)
    expect(c.co2Hist).toMatchObject({ eyebrow: 'Primary target', stats: 'mean 274.2 · median 267 · SD 66', chart: null })
    expect(c.fuelHist.stats).toBe('mean 12.04 · median 11.6 · SD 3.17')
    expect(c.trend).toMatchObject({ title: 'Mean CO₂ emissions and engine size by model year', note: '' })
    expect(c.scatter.r).toBe('')
  })
})

describe('deriveView', () => {
  it('overview: all six charts with the overview titles', () => {
    const v = deriveView(rows, all)
    expect(v.visible).toEqual(['co2Hist', 'fuelHist', 'trend', 'class', 'fuel', 'scatter'])
    expect(v.resultsSummary).toBe('Showing 4 matching vehicles')
    expect(v.activeFilterSummary).toBe('Fuel: All fuel types · Class: All classes')
    expect(v.status).toBe('')
    expect(v.cards.co2Hist).toMatchObject({ eyebrow: 'Primary target', title: 'CO₂ emissions distribution', stats: 'Mean 257.5 g/km · 4 valid records' })
    expect(v.cards.fuelHist).toMatchObject({ eyebrow: 'Secondary target', title: 'Fuel consumption distribution', stats: 'Mean 10.75 L/100 km · 4 valid records' })
    expect(v.cards.trend).toMatchObject({
      eyebrow: 'Trend over time',
      title: 'Mean CO₂ emissions and engine size by model year',
      note: 'Yearly means are calculated from the currently included records. Valid CO₂ values: 4; valid engine-size values: 4.',
    })
    expect(v.cards.class).toMatchObject({ eyebrow: 'By vehicle class', title: 'Mean CO₂ emissions by vehicle class' })
    expect(v.cards.fuel).toMatchObject({ eyebrow: 'By fuel type', title: 'Record count and mean CO₂ by fuel' })
    expect(v.cards.scatter).toMatchObject({ eyebrow: 'Engine size vs. emissions', title: 'Engine size vs. CO₂ emissions' })
    expect(v.cards.scatter?.r).toMatch(/^r = 0\.\d\d$/)
  })

  it('overview chart data matches the mockup builders', () => {
    const v = deriveView(rows, all)
    const cls = v.cards.class!.chart!
    expect(cls.type).toBe('bar')
    expect(cls.data.labels).toEqual(['Pickup truck: Standard', 'SUV: Small'])
    expect(cls.data.datasets[0].data).toEqual([305, 210])
    const fuel = v.cards.fuel!.chart!
    // sorted by label: Diesel, Premium Gasoline, Regular Gasoline
    expect(fuel.data.labels).toEqual(['D – Diesel', 'Z – Premium Gasoline', 'X – Regular Gasoline'])
    expect(fuel.data.datasets.map((d) => d.data)).toEqual([[1, 1, 2], [290, 230, 255]])
    const trend = v.cards.trend!.chart!
    expect(trend.type).toBe('line')
    expect(trend.data.labels).toEqual([2020, 2021])
    expect(trend.data.datasets).toHaveLength(2)
    expect(v.cards.co2Hist!.chart!.data.datasets[0].data).toHaveLength(12)
  })

  it('fuel only: trend + fuel-use scatter', () => {
    const v = deriveView(rows, { fuel: 'X', vehicleClass: 'all' })
    expect(v.visible).toEqual(['trend', 'fuel'])
    expect(v.resultsSummary).toBe('Showing 2 matching vehicles')
    expect(v.activeFilterSummary).toBe('Fuel: X – Regular Gasoline · Class: All classes')
    expect(v.cards.trend).toMatchObject({
      eyebrow: 'Trend over time',
      title: 'CO₂ emissions by model year',
      note: 'Filtered to 2 matching vehicles; 2 have valid CO₂ values.',
    })
    expect(v.cards.trend!.chart!.data.datasets).toHaveLength(1)
    expect(v.cards.fuel).toMatchObject({ eyebrow: 'Fuel use relationship', title: 'Fuel consumption vs. CO₂ emissions' })
    expect(v.cards.fuel!.chart!.type).toBe('scatter')
    expect(v.cards.fuel!.chart!.data.datasets[0].data).toEqual([{ x: 8, y: 190 }, { x: 14, y: 320 }])
  })

  it('class only: trend + engine-size scatter without the r chip', () => {
    const v = deriveView(rows, { fuel: 'all', vehicleClass: 'SUV: Small' })
    expect(v.visible).toEqual(['trend', 'scatter'])
    expect(v.activeFilterSummary).toBe('Fuel: All fuel types · Class: SUV: Small')
    expect(v.cards.scatter).toMatchObject({ eyebrow: 'Engine size relationship', title: 'Engine size vs. CO₂ emissions', r: null })
    expect(v.cards.scatter!.chart!.data.datasets[0].data).toEqual([{ x: 2, y: 190 }, { x: 3, y: 230 }])
  })

  it('fuel and class: trend + engine-size scatter', () => {
    const v = deriveView(rows, { fuel: 'X', vehicleClass: 'Pickup truck: Standard' })
    expect(v.visible).toEqual(['trend', 'scatter'])
    expect(v.resultsSummary).toBe('Showing 1 matching vehicle')
    expect(v.status).toBe('Only one matching record is available; trend lines and averages may be limited.')
    expect(v.cards.scatter).toMatchObject({ eyebrow: 'Engine size relationship', r: null })
  })

  it('empty combination: no charts, empty-state status', () => {
    const v = deriveView(rows, { fuel: 'D', vehicleClass: 'SUV: Small' })
    expect(v.visible).toEqual([])
    expect(v.resultsSummary).toBe('Showing 0 matching vehicles')
    expect(v.activeFilterSummary).toBe('Fuel: D – Diesel · Class: SUV: Small')
    expect(v.status).toBe('No records match the selected combination.')
    expect(v.kpis).toMatchObject({ records: '0', co2: '—' })
  })
})

describe('chartConfig (mockup chart() defaults)', () => {
  it('category charts get bottom legend, beginAtZero y and autoskip x unless overridden', () => {
    const c = chartConfig({ type: 'bar', data: { labels: [], datasets: [] }, options: { plugins: { legend: { display: false } } } })
    expect(c.options).toMatchObject({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: { title: { display: false, text: '' }, ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, title: { display: false, text: '' } },
      },
    })
  })

  it('scatter charts get linear x and axis titles', () => {
    const c = chartConfig({ type: 'scatter', data: { datasets: [] }, xTitle: 'Engine size (L)', yTitle: 'CO₂ emissions (g/km)' })
    expect(c.options.scales).toEqual({
      x: { type: 'linear', title: { display: true, text: 'Engine size (L)' } },
      y: { title: { display: true, text: 'CO₂ emissions (g/km)' } },
    })
    expect(c.options.plugins).toEqual({ legend: { display: true, position: 'bottom' }, tooltip: { enabled: true } })
  })
})

describe('status copy', () => {
  it('matches the brief', () => {
    expect(LOADING_STATUS).toBe('Loading the attached CSV dataset…')
    expect(ERROR_STATUS).toBe('The vehicle dataset could not be loaded. Check your connection and try again.')
  })
})
