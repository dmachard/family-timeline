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
        plugins: [store],
        mocks: {
          $t: (msg) => msg,
          $i18n: {
            locale: 'en'
          }
        }
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

  test('calculateAutoBounds should adjust bounds to 1735-2026 for 1738 ancestor and living persons', () => {
    const persons = [
      { id: 1, birth_date: '1738-06-15', death_date: '1802-04-10' },
      { id: 2, birth_date: '1995-01-01', death_date: null } // living person
    ]
    const bounds = wrapper.vm.calculateAutoBounds(persons)
    expect(bounds.minYear).toBe(1735)
    expect(bounds.startViewYear).toBe(1735)
    expect(bounds.maxYear).toBe(new Date().getFullYear())
    expect(bounds.stopViewYear).toBe(new Date().getFullYear())
  })

  test('calculateAutoBounds should adjust bounds correctly for deceased persons range', () => {
    const persons = [
      { id: 1, birth_date: '1824-03-12', death_date: '1892-11-05' }
    ]
    const bounds = wrapper.vm.calculateAutoBounds(persons)
    expect(bounds.minYear).toBe(1820)
    expect(bounds.maxYear).toBe(1892)
  })

  test('calculateAutoBounds should return fallback bounds when list is empty', () => {
    const bounds = wrapper.vm.calculateAutoBounds([])
    expect(bounds.minYear).toBeDefined()
    expect(bounds.maxYear).toBeGreaterThan(bounds.minYear)
  })

  test('dynamic mode should initialize with default viewMode and root person', () => {
    expect(wrapper.vm.viewMode).toBe('dynamic')
    expect(wrapper.vm.dynamicRootPersonId).toBeDefined()
  })

  test('toggleViewMode should switch between dynamic and all', () => {
    wrapper.vm.toggleViewMode('all')
    expect(wrapper.vm.viewMode).toBe('all')
    wrapper.vm.toggleViewMode('dynamic')
    expect(wrapper.vm.viewMode).toBe('dynamic')
  })

  test('toggleAscendants and toggleDescendants should add and remove IDs in dynamic sets', () => {
    const testId = 4
    expect(wrapper.vm.expandedAscendantIds.has(testId)).toBe(false)
    wrapper.vm.toggleAscendants(testId)
    expect(wrapper.vm.expandedAscendantIds.has(testId)).toBe(true)
    wrapper.vm.toggleAscendants(testId)
    expect(wrapper.vm.expandedAscendantIds.has(testId)).toBe(false)

    expect(wrapper.vm.expandedDescendantIds.has(testId)).toBe(false)
    wrapper.vm.toggleDescendants(testId)
    expect(wrapper.vm.expandedDescendantIds.has(testId)).toBe(true)
    wrapper.vm.toggleDescendants(testId)
    expect(wrapper.vm.expandedDescendantIds.has(testId)).toBe(false)

    expect(wrapper.vm.expandedSpouseIds.has(testId)).toBe(false)
    wrapper.vm.toggleSpouses(testId)
    expect(wrapper.vm.expandedSpouseIds.has(testId)).toBe(true)
    wrapper.vm.toggleSpouses(testId)
    expect(wrapper.vm.expandedSpouseIds.has(testId)).toBe(false)
  })

  test('unfoldedPersonIds should be empty by default (compact mode)', () => {
    expect(wrapper.vm.unfoldedPersonIds.size).toBe(0)
  })

  test('isBarUnfolded should return false for unknown person id by default', () => {
    expect(wrapper.vm.isBarUnfolded(999)).toBe(false)
  })

  test('togglePersonBar should add then remove a person id', () => {
    const personId = 1

    // Initially not unfolded
    expect(wrapper.vm.isBarUnfolded(personId)).toBe(false)

    // Mock drawTimeline to avoid D3 side effects in test
    wrapper.vm.drawTimeline = vi.fn()

    // Toggle once → should be unfolded
    wrapper.vm.togglePersonBar(personId)
    expect(wrapper.vm.isBarUnfolded(personId)).toBe(true)

    // Toggle again → should be folded back
    wrapper.vm.togglePersonBar(personId)
    expect(wrapper.vm.isBarUnfolded(personId)).toBe(false)
  })

  test('toggleAllBars should expand all rendered persons, then collapse all', () => {
    // Pre-populate renderedPersons to simulate drawn persons
    wrapper.vm.renderedPersons.set(1, { id: 1 })
    wrapper.vm.renderedPersons.set(2, { id: 2 })

    // Mock drawTimeline to avoid D3 side effects in test
    wrapper.vm.drawTimeline = vi.fn()

    // All collapsed → expand all
    wrapper.vm.toggleAllBars()
    expect(wrapper.vm.unfoldedPersonIds.has(1)).toBe(true)
    expect(wrapper.vm.unfoldedPersonIds.has(2)).toBe(true)

    // Some expanded → collapse all
    wrapper.vm.toggleAllBars()
    expect(wrapper.vm.unfoldedPersonIds.size).toBe(0)
  })
})
