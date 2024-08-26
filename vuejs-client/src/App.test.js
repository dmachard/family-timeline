import { describe, test, expect, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(App, {
      propsData: {
        minYear: 1800,
        maxYear: 2050,
        startViewYear: 1800,
        stopViewYear: 2050,
      },
      global: {
        mocks: {
          $t: (msg) => msg, // Mock translation function
          $i18n: {
            locale: 'en'
          }
        }
      }
    })
  })

  test('availableYears should generate an array of years from minYear to maxYear in steps of 50 years', () => {
    const expectedYears = [1800, 1850, 1900, 1950, 2000, 2050]
    expect(wrapper.vm.availableYears).toEqual(expectedYears)
  })

  test('filteredEndYears should only include years greater than startViewYear', () => {
    wrapper.setData({ startViewYear: 1850 })
    const expectedFilteredYears = [1900, 1950, 2000, 2050]
    expect(wrapper.vm.filteredEndYears).toEqual(expectedFilteredYears)
  })

  test('filteredEndYears should be empty if startViewYear is maxYear', () => {
    wrapper.setData({ startViewYear: 2050 })
    expect(wrapper.vm.filteredEndYears).toEqual([])
  })

  test('startViewYear watcher should reset stopViewYear if it is less than new startViewYear', async () => {
    wrapper.setData({ stopViewYear: 1900 })
    wrapper.setData({ startViewYear: 1950 })
    await wrapper.vm.$nextTick() // Wait for DOM updates if needed
    expect(wrapper.vm.stopViewYear).toBe(2050)
  })

  test('setLanguage should change selectedLanguage and update $i18n locale', () => {
    wrapper.vm.setLanguage('fr')
    expect(wrapper.vm.selectedLanguage).toBe('fr')
    expect(wrapper.vm.$i18n.locale).toBe('fr')
  })
})
