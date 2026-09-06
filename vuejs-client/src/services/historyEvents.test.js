/* global global */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { historicalPeriods, loadHistoricalPeriods } from './historyEvents.js'

describe('historyEvents service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('default historicalPeriods has expected fields and chronological order', () => {
    expect(Array.isArray(historicalPeriods)).toBe(true)
    expect(historicalPeriods.length).toBeGreaterThan(5)

    historicalPeriods.forEach((period) => {
      expect(period).toHaveProperty('id')
      expect(period).toHaveProperty('nameFr')
      expect(period).toHaveProperty('startYear')
      expect(period).toHaveProperty('endYear')
      expect(period.startYear).toBeLessThan(period.endYear)
    })
  })

  test('loadHistoricalPeriods returns external periods when fetch succeeds', async () => {
    const customPeriods = [
      { id: 'custom-1', nameFr: 'Époque Personnalisée', startYear: 1800, endYear: 1900 }
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => customPeriods
    })

    const result = await loadHistoricalPeriods('/test.json')
    expect(result).toEqual(customPeriods)
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/test.json'))
  })

  test('loadHistoricalPeriods falls back to defaults when fetch returns non-ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    })

    const result = await loadHistoricalPeriods('/missing.json')
    expect(result).toEqual(historicalPeriods)
  })

  test('loadHistoricalPeriods falls back to defaults when fetch throws an error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await loadHistoricalPeriods('/error.json')
    expect(result).toEqual(historicalPeriods)
  })
})
