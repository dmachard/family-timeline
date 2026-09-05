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

  test('getPersonChildren should bidirectionally find children even if parent relatives list is empty', () => {
    // Person 2 (mother) has relatives: [{ id: 1, relation_type: 'spouse' }]
    // Person 3 has relatives: [{ id: 1, relation_type: 'father' }, { id: 2, relation_type: 'mother' }]
    // Even though Person 2 has no 'child' relation in relatives, getPersonChildren(2) should find Person 3
    const childrenOfMother = wrapper.vm.getPersonChildren(2)
    expect(childrenOfMother.some(c => c.id === 3)).toBe(true)
  })

  test('getPersonsForScale should include persons present in renderedPersons', () => {
    wrapper.vm.viewMode = 'dynamic'
    wrapper.vm.renderedPersons.clear()
    wrapper.vm.renderedPersons.set(4, { id: 4 })
    const persons = wrapper.vm.getPersonsForScale()
    expect(persons.some(p => p.id === 4)).toBe(true)
  })

  test('getGlobalMinYear and getGlobalMaxYear should cover full dataset span', () => {
    const min = wrapper.vm.getGlobalMinYear()
    const max = wrapper.vm.getGlobalMaxYear()
    expect(min).toBeLessThanOrEqual(1980)
    expect(max).toBeGreaterThanOrEqual(new Date().getFullYear())
  })

  test('getPersonSiblings, getPersonUnclesAunts, and getPersonCousins should compute family tree relationships correctly', () => {
    // Structure:
    // Grandfather (100) -> Parent (10), Uncle (20)
    // Parent (10) -> Person (1), Sibling (2)
    // Uncle (20) -> Cousin (30)
    wrapper.vm.dataPersons = [
      {
        id: 100,
        first_name: 'Grand',
        last_name: 'Parent',
        relatives: [
          { id: 10, relation_type: 'child' },
          { id: 20, relation_type: 'child' }
        ]
      },
      {
        id: 10,
        first_name: 'Father',
        last_name: 'Test',
        relatives: [
          { id: 100, relation_type: 'father' },
          { id: 1, relation_type: 'child' },
          { id: 2, relation_type: 'child' }
        ]
      },
      {
        id: 20,
        first_name: 'Uncle',
        last_name: 'Test',
        relatives: [
          { id: 100, relation_type: 'father' },
          { id: 30, relation_type: 'child' }
        ]
      },
      {
        id: 1,
        first_name: 'Me',
        last_name: 'Test',
        relatives: [
          { id: 10, relation_type: 'father' }
        ]
      },
      {
        id: 2,
        first_name: 'Sister',
        last_name: 'Test',
        relatives: [
          { id: 10, relation_type: 'father' }
        ]
      },
      {
        id: 30,
        first_name: 'Cousin',
        last_name: 'Test',
        relatives: [
          { id: 20, relation_type: 'father' }
        ]
      }
    ]

    // 1. Siblings of Person 1 should be Person 2
    const siblings = wrapper.vm.getPersonSiblings(1)
    expect(siblings.map(s => s.id)).toEqual([2])

    // 2. Uncles/Aunts of Person 1 should be Person 20 (Uncle)
    const uncles = wrapper.vm.getPersonUnclesAunts(1)
    expect(uncles.map(u => u.id)).toEqual([20])

    // 3. Cousins of Person 1 should be Person 30 (Cousin)
    const cousins = wrapper.vm.getPersonCousins(1)
    expect(cousins.map(c => c.id)).toEqual([30])
  })

  test('toggleSiblings, toggleUnclesAunts, toggleCousins should toggle dynamic sets', () => {
    wrapper.vm.drawTimeline = vi.fn()
    const testId = 1

    expect(wrapper.vm.expandedSiblingIds.has(testId)).toBe(false)
    wrapper.vm.toggleSiblings(testId)
    expect(wrapper.vm.expandedSiblingIds.has(testId)).toBe(true)
    wrapper.vm.toggleSiblings(testId)
    expect(wrapper.vm.expandedSiblingIds.has(testId)).toBe(false)

    expect(wrapper.vm.expandedUncleAuntIds.has(testId)).toBe(false)
    wrapper.vm.toggleUnclesAunts(testId)
    expect(wrapper.vm.expandedUncleAuntIds.has(testId)).toBe(true)
    wrapper.vm.toggleUnclesAunts(testId)
    expect(wrapper.vm.expandedUncleAuntIds.has(testId)).toBe(false)

    expect(wrapper.vm.expandedCousinIds.has(testId)).toBe(false)
    wrapper.vm.toggleCousins(testId)
    expect(wrapper.vm.expandedCousinIds.has(testId)).toBe(true)
    wrapper.vm.toggleCousins(testId)
    expect(wrapper.vm.expandedCousinIds.has(testId)).toBe(false)
  })

  test('toggleSiblings should hide siblings while keeping clicked person visible', () => {
    wrapper.vm.drawTimeline = vi.fn()
    // Setup siblings 1, 2, 3 under parent 10
    wrapper.vm.dataPersons = [
      { id: 10, relatives: [{ id: 1, relation_type: 'child' }, { id: 2, relation_type: 'child' }, { id: 3, relation_type: 'child' }] },
      { id: 1, relatives: [{ id: 10, relation_type: 'father' }] },
      { id: 2, relatives: [{ id: 10, relation_type: 'father' }] },
      { id: 3, relatives: [{ id: 10, relation_type: 'father' }] }
    ]
    wrapper.vm.dynamicRootPersonId = 1

    // 1. Expand from Person 1 (root)
    wrapper.vm.toggleSiblings(1)
    expect(wrapper.vm.areSiblingsVisible(1)).toBe(true)
    expect(wrapper.vm.areSiblingsVisible(2)).toBe(true)
    const visible1 = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible1.has(1)).toBe(true)
    expect(visible1.has(2)).toBe(true)
    expect(visible1.has(3)).toBe(true)

    // 2. Hide from Person 2 (the sibling clicked)
    wrapper.vm.toggleSiblings(2)
    // The clicked person 2 MUST remain visible
    expect(wrapper.vm.pinnedPersonIds.has(2)).toBe(true)
    const visible2 = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible2.has(2)).toBe(true)
    // Sibling 3 must be hidden
    expect(visible2.has(3)).toBe(false)
    expect(wrapper.vm.areSiblingsVisible(2)).toBe(false)
  })

  test('openContextMenu, closeContextMenu, and handleKeyDown should manage context menu state', () => {
    const person = { id: 1, first_name: 'John', last_name: 'Doe' }
    const fakeEvent = {
      clientX: 150,
      clientY: 250,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    }

    wrapper.vm.openContextMenu(person, fakeEvent)
    expect(wrapper.vm.contextMenuPerson).toEqual(person)
    expect(wrapper.vm.contextMenuStyle.position).toBeDefined()

    wrapper.vm.handleKeyDown({ key: 'Escape' })
    expect(wrapper.vm.contextMenuPerson).toBeNull()

    wrapper.vm.openContextMenu(person, fakeEvent)
    expect(wrapper.vm.contextMenuPerson).toEqual(person)
    wrapper.vm.closeContextMenu()
    expect(wrapper.vm.contextMenuPerson).toBeNull()
  })

  test('onContextMenuAction should execute corresponding action and close context menu', () => {
    const person = { id: 1, first_name: 'John', last_name: 'Doe' }
    wrapper.vm.contextMenuPerson = person
    wrapper.vm.toggleSiblings = vi.fn()

    wrapper.vm.onContextMenuAction('toggle-siblings')
    expect(wrapper.vm.toggleSiblings).toHaveBeenCalledWith(1)
    expect(wrapper.vm.contextMenuPerson).toBeNull()
  })

  test('toggleDescendants and areDescendantsVisible should reliably expand and hide children even if pinned or expanded via siblings', () => {
    wrapper.vm.drawTimeline = vi.fn()
    // Setup Father (1) + Mother (2) with children Child 1 (3), Child 2 (4), and grandchild (5) under Child 1
    wrapper.vm.dataPersons = [
      { id: 1, relatives: [{ id: 2, relation_type: 'spouse' }, { id: 3, relation_type: 'child' }, { id: 4, relation_type: 'child' }] },
      { id: 2, relatives: [{ id: 1, relation_type: 'spouse' }, { id: 3, relation_type: 'child' }, { id: 4, relation_type: 'child' }] },
      { id: 3, relatives: [{ id: 1, relation_type: 'father' }, { id: 2, relation_type: 'mother' }, { id: 5, relation_type: 'child' }] },
      { id: 4, relatives: [{ id: 1, relation_type: 'father' }, { id: 2, relation_type: 'mother' }] },
      { id: 5, relatives: [{ id: 3, relation_type: 'father' }] }
    ]
    wrapper.vm.dynamicRootPersonId = 1

    // Initial state: root is visible, children not visible
    expect(wrapper.vm.areDescendantsVisible(1)).toBe(false)
    expect(wrapper.vm.areDescendantsVisible(2)).toBe(false)

    // 1. Expand children from Father (1)
    wrapper.vm.toggleDescendants(1)
    expect(wrapper.vm.areDescendantsVisible(1)).toBe(true)
    expect(wrapper.vm.areDescendantsVisible(2)).toBe(true)
    let visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(1)).toBe(true)
    expect(visible.has(3)).toBe(true)
    expect(visible.has(4)).toBe(true)
    expect(visible.has(5)).toBe(false)

    // 2. Expand grandchildren from Child 1 (3)
    wrapper.vm.toggleDescendants(3)
    expect(wrapper.vm.areDescendantsVisible(3)).toBe(true)
    visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(5)).toBe(true)

    // 3. Pin Child 2 (4) via siblings toggle
    wrapper.vm.toggleSiblings(4)
    expect(wrapper.vm.pinnedPersonIds.has(4)).toBe(true)

    // 4. Hide descendants from Father (1): all children, grandchildren, and pinned child IDs MUST be hidden
    wrapper.vm.toggleDescendants(1)
    expect(wrapper.vm.areDescendantsVisible(1)).toBe(false)
    expect(wrapper.vm.areDescendantsVisible(2)).toBe(false)
    visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(1)).toBe(true)
    expect(visible.has(3)).toBe(false)
    expect(visible.has(4)).toBe(false)
    expect(visible.has(5)).toBe(false)
    expect(wrapper.vm.pinnedPersonIds.has(4)).toBe(false)

    // 5. Expand from Mother (2) and hide from Father (1) - cross-spouse synchronization
    wrapper.vm.toggleDescendants(2)
    expect(wrapper.vm.areDescendantsVisible(1)).toBe(true)
    expect(wrapper.vm.areDescendantsVisible(2)).toBe(true)
    visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(3)).toBe(true)
    expect(visible.has(4)).toBe(true)

    wrapper.vm.toggleDescendants(1)
    expect(wrapper.vm.areDescendantsVisible(1)).toBe(false)
    expect(wrapper.vm.areDescendantsVisible(2)).toBe(false)
    visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(3)).toBe(false)
    expect(visible.has(4)).toBe(false)
  })

  test('toggleUnclesAunts and areUnclesAuntsVisible should hide and show uncles/aunts while preserving child and parent', () => {
    wrapper.vm.drawTimeline = vi.fn()
    // Grandparent (100) -> Parent (10), Uncle (20)
    // Parent (10) -> Child (1)
    wrapper.vm.dataPersons = [
      { id: 100, relatives: [{ id: 10, relation_type: 'child' }, { id: 20, relation_type: 'child' }] },
      { id: 10, relatives: [{ id: 100, relation_type: 'father' }, { id: 1, relation_type: 'child' }] },
      { id: 20, relatives: [{ id: 100, relation_type: 'father' }] },
      { id: 1, relatives: [{ id: 10, relation_type: 'father' }] }
    ]
    wrapper.vm.dynamicRootPersonId = 100

    // 1. Initially expand all from root Grandparent (100) and Parent (10)
    wrapper.vm.toggleDescendants(100)
    wrapper.vm.toggleDescendants(10)
    expect(wrapper.vm.areUnclesAuntsVisible(1)).toBe(true)
    let visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(100)).toBe(true)
    expect(visible.has(10)).toBe(true)
    expect(visible.has(20)).toBe(true)
    expect(visible.has(1)).toBe(true)

    // 2. Hide uncles/aunts from Child (1)
    wrapper.vm.toggleUnclesAunts(1)
    expect(wrapper.vm.areUnclesAuntsVisible(1)).toBe(false)
    visible = wrapper.vm.getDynamicVisiblePersonIds()
    // Uncle (20) must be hidden
    expect(visible.has(20)).toBe(false)
    // Grandparent (100), Parent (10), and Child (1) must remain visible
    expect(visible.has(100)).toBe(true)
    expect(visible.has(10)).toBe(true)
    expect(visible.has(1)).toBe(true)

    // 3. Re-expand uncles/aunts from Child (1)
    wrapper.vm.toggleUnclesAunts(1)
    expect(wrapper.vm.areUnclesAuntsVisible(1)).toBe(true)
    visible = wrapper.vm.getDynamicVisiblePersonIds()
    expect(visible.has(20)).toBe(true)
    expect(visible.has(100)).toBe(true)
    expect(visible.has(10)).toBe(true)
    expect(visible.has(1)).toBe(true)
  })
})
