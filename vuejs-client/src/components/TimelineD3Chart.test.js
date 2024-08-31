import { describe, test, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TimelineD3Chart from './TimelineD3Chart.vue'

vi.mock('@/services/personsService', () => ({
  fetchEnrichedPersons: vi.fn().mockResolvedValue([
    // Root person, oldest
    {
      id: 1,
      birth_date: '1980-01-01',
      death_date: '2020-01-01',
      birth_date_verified: true,
      death_date_verified: true,
      relatives: [
        { id: 2, relation_type: 'spouse' },
        { id: 3, relation_type: 'child' }
      ],
      events: [
        {
          event_type: 'marriage',
          event_date: '2005-01-01',
          related_persons: [{ id: 2 }]
        },
        {
          event_type: 'divorce',
          event_date: '2010-01-01',
          related_persons: [{ id: 2 }]
        }
      ]
    },
    // Root person, middle
    {
      id: 2,
      birth_date: '1982-01-01',
      relatives: [
        { id: 1, relation_type: 'spouse' }
      ],
      events: []
    },
    {
      id: 3,
      birth_date: '2006-01-01',
      relatives: [
        { id: 1, relation_type: 'father' },
        { id: 2, relation_type: 'mother' }
      ],
      events: []
    },
    // Root person, youngest
    { id: 4, birthdate: '1990-01-01', relatives: [] }
  ])
}))

import store from '@/store/index.js'

describe('Timeline Methods', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = shallowMount(TimelineD3Chart, {
      props: {
        minYear: 1600,
        maxYear: 2020,
        startViewYear: 2000,
        stopViewYear: 2020
      },
      global: {
        plugins: [store]
      }
    })
    await wrapper.vm.$nextTick()
  })

  test('filterRootPersons should filter out persons with parents', () => {
    const rootPersons = wrapper.vm.filterRootPersons()
    expect(rootPersons.length).toBe(3)
    expect(rootPersons[0].id).toBe(1)
  })

  test('filterSpouses should return the correct spouse details', () => {
    const spouses = wrapper.vm.filterSpouses(1)
    expect(spouses.length).toBe(1)
    expect(spouses[0].id).toBe(2)
    expect(spouses[0].marriage_date).toBe('2005-01-01')
    expect(spouses[0].divorce_date).toBe('2010-01-01')
  })

  test('filterChildren should return the correct children', () => {
    const children = wrapper.vm.filterChildren(1, 2)
    expect(children.length).toBe(1)
    expect(children[0].id).toBe(3)
  })

  test('getYearFromDate should return the correct year', () => {
    const year = wrapper.vm.getYearFromDate('2000-01-01')
    expect(year).toBe(2000)
  })

  test('generatePeriods should return the correct periods', () => {
    const periods = wrapper.vm.getPeriods(wrapper.vm.dataPersons[0])
    expect(periods.length).toBeGreaterThan(0)
    expect(periods[0].start).toBe(1980)
    expect(periods[periods.length - 1].end).toBe(2020)
  })
})
