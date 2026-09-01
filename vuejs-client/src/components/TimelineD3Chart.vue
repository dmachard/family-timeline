<template>
  <div class="container-fluid">
    <div class="row">
      <div id="timeline-content">
        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger" role="alert">
          <p>Error: {{ error }}</p>
        </div>

        <!-- Timeline Interactive Toolbar -->
        <div class="timeline-toolbar d-flex flex-wrap align-items-center justify-content-between px-3 py-2 border-bottom bg-white">
          <!-- Quick Person Search with Autocomplete -->
          <div class="search-box-wrapper position-relative me-3 my-1">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted" />
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control form-control-sm border-start-0 ps-0"
                :placeholder="$t('search-person-placeholder')"
                autocomplete="off"
                @focus="isSearchOpen = true"
                @input="isSearchOpen = true"
              >
              <button
                v-if="searchQuery"
                class="btn btn-outline-secondary btn-sm border-start-0"
                type="button"
                @click="clearSearch"
              >
                <i class="bi bi-x" />
              </button>
            </div>

            <!-- Autocomplete suggestions dropdown -->
            <ul
              v-if="isSearchOpen && filteredPersons.length > 0"
              class="dropdown-menu show shadow mt-1 py-1 w-100 search-dropdown"
            >
              <li
                v-for="person in filteredPersons"
                :key="person.id"
              >
                <a
                  class="dropdown-item d-flex align-items-center py-2 px-3 search-result-item"
                  href="#"
                  @click.prevent="focusPerson(person)"
                >
                  <img
                    :src="person.gender === 'Male' ? 'profile_men.png' : 'profile_women.png'"
                    width="24"
                    height="24"
                    class="rounded-circle me-2 border"
                    alt=""
                  >
                  <div class="lh-sm">
                    <div class="fw-semibold text-dark">{{ person.first_name }} {{ person.last_name }}</div>
                    <small class="text-muted">
                      {{ getYearFromDate(person.birth_date) || '?' }} &mdash; {{ getYearFromDate(person.death_date) || (person.death_date_verified ? '?' : 'vivant(e)') }}
                    </small>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div class="d-flex align-items-center gap-2 my-1">
            <!-- History Context Layer Toggle Button -->
            <button
              class="btn btn-sm d-flex align-items-center gap-1"
              :class="showHistoryContext ? 'btn-primary' : 'btn-outline-secondary'"
              type="button"
              :title="$t('toggle-history')"
              @click="toggleHistoryContext"
            >
              <i class="bi bi-hourglass-split" />
              <span>{{ $t('history-context') }}</span>
              <span class="badge ms-1" :class="showHistoryContext ? 'bg-white text-primary' : 'bg-secondary text-white'">
                {{ showHistoryContext ? 'ON' : 'OFF' }}
              </span>
            </button>

            <!-- Auto Fit Scale Button -->
            <button
              class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              type="button"
              :title="$t('fit-scale-title')"
              @click="resetToAutoScale"
            >
              <i class="bi bi-arrows-angle-expand" />
              <span>{{ $t('fit-scale') }}</span>
            </button>
          </div>
        </div>

        <!-- Container for the timeline header and graph with scroll -->
        <div id="timeline-wrapper">
          <div id="timeline-header-container" @mousedown="onPointerStart($event, 'mouse')" @mousemove="onPointerMove($event, 'mouse')" @mouseup="onPointerEnd()" @mouseleave="onPointerEnd()" @touchstart="onPointerStart($event, 'touch')" @touchmove="onPointerMove($event, 'touch')" @touchend="onPointerEnd()" @touchcancel="onPointerEnd()">
            <svg id="timeline-header" />
          </div>
          <div id="timeline-graph-container">
            <svg id="timeline-graph" />
          </div>
        </div>
      </div>

      <ModalProfile ref="profileModal" class="px-0" :person="selectedPerson" :data-persons="dataPersons" @refresh-profile="refreshPersonProfile" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import * as d3 from 'd3'
import debounce from 'lodash/debounce'

import config from '@/config'
import fetchDataMixin from '@/mixins/fetchDataMixin'
import { fetchEnrichedPersons } from '@/services/personsService.js'
import { historicalPeriods } from '@/services/historyEvents.js'

import ModalProfile from './ModalProfile.vue'

export default {
  components: {
    ModalProfile
  },
  mixins: [fetchDataMixin],
  props: {
    minYear: {
      type: Number,
      required: false,
      default: 1800
    },
    maxYear: {
      type: Number,
      required: false,
      default: () => new Date().getFullYear()
    },
    startViewYear: {
      type: Number,
      required: false,
      default: 1800
    },
    stopViewYear: {
      type: Number,
      required: false,
      default: () => new Date().getFullYear()
    }
  },
  emits: ['data-loaded'],
  data () {
    return {
      graphMargin: { top: 20, right: 20, left: 20 },
      selectedPerson: null,
      dataPersons: [],
      rootPersons: [],
      isDataLoaded: false,
      isMounted: false,
      previousWidth: null,
      previousHeight: null,
      barHeight: 60,
      computedMinYear: this.minYear,
      computedMaxYear: this.maxYear,
      localStartViewYear: this.startViewYear,
      localStopViewYear: this.stopViewYear,
      defaultColor: '#f1f5f9', // Slate 100 lumineux et net
      familyColorsMap: new Map(),
      paleColor: (color) => color, // Conserver la pureté et le contraste des couleurs choisies
      colorScale: d3.scaleOrdinal([
        '#dbeafe', // Bleu ciel royal
        '#dcfce7', // Vert sauge émeraude
        '#fef3c7', // Ambre miel
        '#f3e8ff', // Lavande améthyste
        '#ffedd5', // Pêche abricot
        '#ccfbf1', // Turquoise givré
        '#ffe4e6', // Rose poudré chic
        '#e0e7ff', // Indigo doux
        '#fae8ff', // Orchidée
        '#fef9c3', // Jaune soleil pastel
      ]),
      displayedPersons: new Set(),
      initialPointerX: 0,
      initialTranslateX: 0,
      newTranslateX: 0,
      initialDomain: 0,
      xViewScale: null,
      timelineWidth: 0,
      totalHeight: 0,
      moveGraphStarted: false,
      showHistoryContext: true,
      renderedPersons: new Map(),
      searchQuery: '',
      isSearchOpen: false,
    }
  },
  computed: {
    ...mapGetters(['shouldReloadTimeline']),
    filteredPersons () {
      if (!this.searchQuery || this.searchQuery.trim().length < 2) return []
      const q = this.searchQuery.toLowerCase().trim()
      return this.dataPersons.filter(p => {
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
        const birthYear = p.birth_date ? p.birth_date.substring(0, 4) : ''
        return fullName.includes(q) || birthYear.includes(q)
      }).slice(0, 8)
    },
  },
  watch: {
    startViewYear(newValue) {
      this.localStartViewYear = newValue;
      this.drawTimeline();
    },
    stopViewYear(newValue) {
      this.localStopViewYear = newValue;
      this.drawTimeline();
    },
    minYear(newValue) {
      this.computedMinYear = newValue;
      this.drawTimeline();
    },
    maxYear(newValue) {
      this.computedMaxYear = newValue;
      this.drawTimeline();
    },
    async shouldReloadTimeline(newValue) {
      if (newValue) {      
        // get refreshed data
        await this.fetchInitialData();
        
        // redraw timeline
        this.drawTimeline()

        this.$store.dispatch('resetTimelineReload');
      }
    },
  },
  async created () {
    this.dataPersons = await this.fetchData(fetchEnrichedPersons)
    const bounds = this.applyScaleBounds()
    this.isDataLoaded = true
    this.$emit('data-loaded', 'timeline', bounds); 
  },
  mounted () {
    this.isMounted = true;
    window.addEventListener('resize', this.handleResize);
    if (this.isDataLoaded) {
      this.drawTimeline();
    } else {
      const unwatch = this.$watch('isDataLoaded', (newValue) => {
        if (newValue) {
          this.drawTimeline();
          unwatch();
        }
      });
    }
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async fetchInitialData() {
      let bounds = null;
      try {
        // Use Promise.all to fetch data concurrently
        const [persons] = await Promise.all([
          fetchEnrichedPersons(),
        ]);
        
        this.dataPersons = persons;
        bounds = this.applyScaleBounds();
      } catch (err) {
        console.error('Failed to fetch enriched persons', err.message);
        this.error = 'Failed to load enriched persons';
      }
      this.$emit('data-loaded', 'timeline', bounds); 
    },

    calculateAutoBounds (persons) {
      const currentYear = new Date().getFullYear();

      if (!persons || !Array.isArray(persons) || persons.length === 0) {
        const defMin = config.minYear || 1800;
        const defMax = config.maxYear || (currentYear + 5);
        return {
          minYear: defMin,
          maxYear: defMax,
          startViewYear: defMin,
          stopViewYear: defMax
        };
      }

      let earliestYear = Infinity;
      let latestYear = -Infinity;
      let hasLivingPerson = false;

      const extractYear = (dateStr) => {
        if (!dateStr) return null;
        if (typeof dateStr === 'number' && dateStr > 1000 && dateStr < 3000) return dateStr;
        const str = String(dateStr).trim();
        const match = str.match(/^(\d{4})/);
        if (match) {
          const y = parseInt(match[1], 10);
          if (!isNaN(y) && y > 0) return y;
        }
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.getFullYear();
        }
        return null;
      };

      persons.forEach(person => {
        // Birth date
        const bYear = extractYear(person.birth_date);
        if (bYear !== null) {
          earliestYear = Math.min(earliestYear, bYear);
        }

        // Death date
        if (person.death_date) {
          const dYear = extractYear(person.death_date);
          if (dYear !== null) {
            latestYear = Math.max(latestYear, dYear);
          }
        } else {
          // No death date recorded -> still alive (lifespan ongoing up to current year)
          hasLivingPerson = true;
        }

        // Related events (marriage, divorce, etc.)
        if (Array.isArray(person.events)) {
          person.events.forEach(evt => {
            const eYear = extractYear(evt.event_date);
            if (eYear !== null) {
              earliestYear = Math.min(earliestYear, eYear);
              latestYear = Math.max(latestYear, eYear);
            }
          });
        }
      });

      if (hasLivingPerson) {
        latestYear = Math.max(latestYear, currentYear);
      }

      if (earliestYear === Infinity) {
        earliestYear = config.minYear || 1800;
      }
      if (latestYear === -Infinity) {
        latestYear = config.maxYear || currentYear;
      }

      if (earliestYear > latestYear) {
        earliestYear = latestYear - 50;
      }

      // Auto bounds:
      // Début : petite marge (arrondi au multiple de 5 inférieur) pour ne pas coller l'avatar/barre au bord gauche
      // Ex: 1738 -> 1735 (3 ans de respiration pour détacher le début du bord)
      const minYear = Math.max(0, Math.floor((earliestYear - 1) / 5) * 5);

      // Fin : calé exactement sur l'année la plus récente (ex: 2026) pour que la barre rejoigne le bord droit
      let maxYear = latestYear;

      if (maxYear - minYear < 1) {
        maxYear = minYear + 10;
      }

      return {
        minYear,
        maxYear,
        startViewYear: minYear,
        stopViewYear: maxYear
      };
    },

    applyScaleBounds () {
      if (config.autoScale !== false) {
        const bounds = this.calculateAutoBounds(this.dataPersons);
        this.computedMinYear = bounds.minYear;
        this.computedMaxYear = bounds.maxYear;
        this.localStartViewYear = bounds.startViewYear;
        this.localStopViewYear = bounds.stopViewYear;
        return bounds;
      } else {
        this.computedMinYear = this.minYear;
        this.computedMaxYear = this.maxYear;
        this.localStartViewYear = this.startViewYear;
        this.localStopViewYear = this.stopViewYear;
        return {
          minYear: this.minYear,
          maxYear: this.maxYear,
          startViewYear: this.startViewYear,
          stopViewYear: this.stopViewYear
        };
      }
    },

    resetToAutoScale () {
      const bounds = this.calculateAutoBounds(this.dataPersons);
      this.computedMinYear = bounds.minYear;
      this.computedMaxYear = bounds.maxYear;
      this.localStartViewYear = bounds.startViewYear;
      this.localStopViewYear = bounds.stopViewYear;
      this.$emit('data-loaded', 'timeline', bounds);
      this.drawTimeline();
    },

    filterRootPersons () {
      return this.dataPersons.filter(person => {
        return !person.relatives.some(relative =>
          relative.relation_type === 'father' || relative.relation_type === 'mother'
        )
      })
      .sort((a, b) => new Date(a.birth_date) - new Date(b.birth_date));
    },

    filterSpouses (personId) {
      // Find the person with the given personId
      const person = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return an empty array
      if (!person) {
        return []
      }

      // Extract the list of relatives
      const relatives = person.relatives || []

      // Filter the relatives to get only those with relation_type 'spouse'
      const spouses = relatives.filter(relative => relative.relation_type === 'spouse')

      // Get the full details of the spouses from the data list
      const spouseDetails = spouses.map(spouse => {
        // Find the full details of each spouse from the data
        const spouseDetail = this.dataPersons.find(p => p.id === spouse.id)

        // Initialize the common dates to null
        let marriageDate = null
        let divorceDate = null
        let civilUnionDate = null
        let civilSeparationDate = null

        // Find the events that match marriage, civil union, or divorce
        const commonEvents = person.events.filter(event => {
          return ['marriage', 'divorce', 'civil_union', 'civil_separation'].includes(event.event_type) &&
                event.related_persons.some(rp => rp.id === spouse.id)
        })

        // Extract the relevant dates from the common events
        commonEvents.forEach(event => {
          switch (event.event_type) {
            case 'marriage':
              marriageDate = event.event_date
              break
            case 'divorce':
              divorceDate = event.event_date
              break
            case 'civil_union':
              civilUnionDate = event.event_date
              break
            case 'civil_separation':
              civilSeparationDate = event.event_date
              break
          }
        })

        // Return the spouse detail with the added common dates
        return {
          ...spouseDetail,
          marriage_date: marriageDate,
          divorce_date: divorceDate,
          civil_union_date: civilUnionDate,
          civil_separation_date: civilSeparationDate
        }
      })

      // Return the list of spouse details
      return spouseDetails
    },

    filterChildrenNoSpouse (personId) {
      // Find the person with the given personId
      const person = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return an empty array
      if (!person) {
        return []
      }

      // Extract the list of relatives (children)
      const relatives = person.relatives || []

      // Filter the relatives to get only those with relation_type 'child'
      const children = relatives.filter(relative => relative.relation_type === 'child')

      // Get the full details of the children from the data list and filter by absence of spouse
      const childrenWithoutSpouse = children.map(child => {
        // Find the full details of each child from the data
        const childDetail = this.dataPersons.find(p => p.id === child.id)

        // Check if the child does not have another parent (spouse) in their relatives
        const hasNoSpouse = !childDetail.relatives.some(relative =>
          (relative.relation_type === 'father' && relative.id !== personId) ||
          (relative.relation_type === 'mother' && relative.id !== personId)
        )

        // Return the child detail if no other spouse/parent is found
        return hasNoSpouse ? childDetail : null
      }).filter(child => child !== null)

      // Return the list of children without spouse details
      return childrenWithoutSpouse
    },

    filterChildren (personId, spouseId) {
      // Find the person with the given personId
      const person = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return an empty array
      if (!person) {
        return []
      }

      // Extract the list of relatives (children)
      const relatives = person.relatives || []

      // Filter the relatives to get only those with relation_type 'child'
      const children = relatives.filter(relative => relative.relation_type === 'child')

      // Get the full details of the children from the data list and filter by spouse
      const childrenDetails = children.map(child => {
        // Find the full details of each child from the data
        const childDetail = this.dataPersons.find(p => p.id === child.id)

        // Check if the child has both parents (personId and spouseId)
        const hasBothParents = childDetail.relatives.some(relative =>
          (relative.relation_type === 'father' && (relative.id === personId || relative.id === spouseId)) ||
          (relative.relation_type === 'mother' && (relative.id === personId || relative.id === spouseId))
        )

        // Return the child detail if both parents are found
        return hasBothParents ? childDetail : null
      }).filter(child => child !== null)

      // Return the list of children details
      return childrenDetails
    },

    filterOldestAncestor (personId) {
      // Find the person with the given ID
      const currentPerson = this.dataPersons.find(p => p.id === personId)

      // If the person is not found, return null
      if (!currentPerson) {
        return null
      }

      // Recursive function to find the oldest ancestor
      const findAncestor = (person) => {
        // Find the father and mother from the relatives
        const father = person.relatives.find(relative => relative.relation_type === 'father')
        const mother = person.relatives.find(relative => relative.relation_type === 'mother')

        // If both parents are missing, the current person is the oldest ancestor
        if (!father && !mother) {
          return person
        }

        // Prioritize the father if available, otherwise use the mother
        const parent = this.dataPersons.find(p => p.id === (father ? father.id : mother.id))

        // Continue climbing up the ancestor chain with the selected parent
        return findAncestor(parent)
      }

      // Find and return the oldest ancestor
      return findAncestor(currentPerson)
    },

    getYearFromDate (date) {
      return date ? new Date(date).getFullYear() : new Date().getFullYear()
    },

    getFamilyColor (id) {
      const vibrantPalette = [
        '#2563eb', // Bleu royal vif
        '#059669', // Vert émeraude éclatant
        '#ea580c', // Orange mandarine chaleureux
        '#7c3aed', // Violet améthyste lumineux
        '#e11d48', // Framboise / Corail pimpant
        '#0891b2', // Bleu lagon
        '#d97706', // Ambre doré
        '#4f46e5', // Indigo vibrant
        '#16a34a', // Vert prairie vif
        '#c026d3', // Fuchsia éclatant
        '#0284c7', // Bleu azur
        '#b45309', // Caramel chaud
      ]
      const numId = typeof id === 'number' ? id : (parseInt(id, 10) || 1)
      const idx = Math.abs(numId * 7 + 3) % vibrantPalette.length
      return vibrantPalette[idx]
    },

    getDefaultColor (personId = null) {
      if (personId) {
        const fullColor = this.getFamilyColor(personId)
        return d3.interpolateRgb(fullColor, '#ffffff')(0.3)
      }
      return '#94a3b8'
    },

    getPeriods (person, familyColor = null, isChild = false) {
      // Extract birth and death years from the person object
      const birthYear = this.getYearFromDate(person.birth_date)
      const endYear = this.getYearFromDate(person.death_date)
     
      // Default verification status for birth and death dates
      const birthDateVerified = person.birth_date_verified !== null ? person.birth_date_verified : true
      let deathDateVerified = person.death_date_verified !== null ? person.death_date_verified : true
      // set as verified is death is not defined
      if (person.death_date === null && deathDateVerified === false) { deathDateVerified = true }

      // Get spouses
      const spouses = this.filterSpouses(person.id)

      // Initialize the periods array and the starting year
      const periods = []
      let lastEventYear = birthYear

      // Handle case where there are no spouses
      if (!spouses.length) {
        let color = familyColor !== null ? familyColor : this.getDefaultColor(person.id)

        // Check if the person has children (without spouse)
        const children = this.filterChildrenNoSpouse(person.id)

        // If no children, create a single period from birth to death
        if (children.length === 0) {
          // this period is too small, no background color for this case
          if (birthYear === endYear) {
            color = "none"
          }

          periods.push({
            start: birthYear,
            end: endYear,
            color: color,
            birthDateVerified,
            deathDateVerified,
            stillAlive: person.death_date === null
          })
          return periods
        }

        // If the person has children, create two periods:
        // 1. Before the first child is born
        // 2. After the first child is born
        const firstChildBirthYear = new Date(children[0].birth_date).getFullYear()

        // Period before the first child
        if (birthYear < firstChildBirthYear) {
          periods.push({
            start: birthYear,
            end: firstChildBirthYear,
            color: this.getDefaultColor(person.id),
            birthDateVerified,
            deathDateVerified,
            stillAlive: person.death_date === null
          })
        }

        // Generate a unique family key by sorting the IDs and joining them
        const familyNoSpouseKey = this.getFamilyKey(person.id, 0)
        const familyNoSpouseColor = this.getFamilyColor(person.id)
        this.familyColorsMap.set(familyNoSpouseKey, familyNoSpouseColor)

        // Period after the first child
        periods.push({
          start: firstChildBirthYear,
          end: endYear,
          color: familyColor !== null ? familyColor : familyNoSpouseColor,
          birthDateVerified,
          deathDateVerified,
          stillAlive: person.death_date === null
        })
        return periods
      }

      // Handle case where spouses exist
      for (const spouse of spouses) {
        let relationshipStartYear = null

        // Extract years for marriage, civil union, divorce, and separation
        const marriageYear = spouse.marriage_date ? new Date(spouse.marriage_date).getFullYear() : null
        const divorceYear = spouse.divorce_date ? new Date(spouse.divorce_date).getFullYear() : endYear
        const unionYear = spouse.civil_union_date ? new Date(spouse.civil_union_date).getFullYear() : null

        // Determine relationshipStartYear based on marriage, union, and children
        if (!marriageYear && !unionYear) {
          const children = this.filterChildren(person.id, spouse.id)
          if (children.length > 0) {
            relationshipStartYear = new Date(children[0].birth_date).getFullYear()
          }
        }

        // If relationshipStartYear is still null but unionYear or marriageYear exists
        relationshipStartYear = relationshipStartYear ?? unionYear
        relationshipStartYear = relationshipStartYear ?? marriageYear

        // If both relationshipStartYear and unionYear exist, choose the earliest year
        if (relationshipStartYear && unionYear) {
          relationshipStartYear = Math.min(relationshipStartYear, unionYear)
        }

        if (relationshipStartYear) {
          // Generate a unique family key by sorting the IDs and joining them
          const familyKey = this.getFamilyKey(person.id, spouse.id)

          // Retrieve or generate a color for this spouse
          let spouseColor = this.familyColorsMap.get(familyKey)
          if (!spouseColor) {
            spouseColor = this.getFamilyColor(spouse.id)
            this.familyColorsMap.set(familyKey, spouseColor)
          }

          // Add the period before the relationship started
          if (lastEventYear < relationshipStartYear) {
            periods.push({
              start: lastEventYear,
              end: relationshipStartYear,
              color: isChild ? familyColor : this.getDefaultColor(person.id),
              birthDateVerified,
              deathDateVerified,
              stillAlive: person.death_date === null
            })
          }

          // Add the period during the relationship
          periods.push({
            start: relationshipStartYear,
            end: divorceYear,
            color: spouseColor,
            birthDateVerified,
            deathDateVerified,
            stillAlive: person.death_date === null
          })

          // Update the last event year to the end of this relationship
          lastEventYear = divorceYear
        } else {
          // If no relationship start year is available, continue with the default color
          periods.push({
            start: lastEventYear,
            end: endYear,
            color: this.getDefaultColor(person.id),
            birthDateVerified,
            deathDateVerified,
            stillAlive: person.death_date === null
          })
        }
      }

      // Handle the period after the last divorce until death or the current year
      if (lastEventYear < endYear) {
        periods.push({
          start: lastEventYear,
          end: endYear,
          color: this.defaultColor,
          birthDateVerified,
          deathDateVerified
        })
      }
      return periods
    },

    getFamilyKey (personId, spouseId) {
      // Generate a unique family key by sorting the IDs and joining them
      return [personId, spouseId].sort().join('-')
    },

    handleResize: debounce(function () {
      const { innerWidth: width, innerHeight: height } = window;

      if (width !== this.previousWidth || height !== this.previousHeight) {
        this.previousWidth = width
        this.previousHeight = height

        // redraw the graph
        this.drawTimeline()
      }
    }, 300),

    setupGraphSvg () {
      // Get the width of the 'timeline-content' element
      const timelineContent = document.getElementById('timeline-content')
      const timelineContentWidth = timelineContent
         ? parseFloat(window.getComputedStyle(timelineContent).width)
         : window.innerWidth

      // Calculate the available width for the timeline chart
      this.timelineWidth = timelineContentWidth - this.graphMargin.right - this.graphMargin.left

      // Calculate the total height of the chart
      this.totalHeight = Math.max((this.dataPersons.length + 3) * this.barHeight, window.innerHeight)

      this.xViewScale = d3.scaleLinear()
        .domain([this.localStartViewYear, this.localStopViewYear])
        .range([0, this.timelineWidth]);

      const svg = d3.select('#timeline-graph')
        .attr('width', this.timelineWidth)
        .attr('height', this.totalHeight)
        .append('g')
        .attr('transform', `translate(${this.graphMargin.left},0)`)

      // add blur filter
      const defs = svg.append('defs')
      const filterBlur = defs.append('filter')
        .attr('id', 'blur-filter')
        .attr('x', '-50%') // Extend the filter area to the left
        .attr('y', '0')
        .attr('width', '200%') // Ensure the blur affects enough area
        .attr('height', '100%')
      filterBlur.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '6') // Adjust the blur amount

      return { svg }
    },

    onPointerEnd() {
      this.drawTimeline();
      this.moveGraphStarted = false;
    },

    onPointerStart(event, type) {
      event.preventDefault();
      
      const isTouchEvent = type === 'touch';
      this.moveGraphStarted = true

      // Get the current transform attribute
      const svg = d3.select('#timeline-graph');
      const transformAttr = svg.attr('transform') || 'translate(0,0)';

      // Extract the current x translation from the transform attribute
      this.initialTranslateX = parseFloat(transformAttr.split('translate(')[1].split(',')[0]) || 0;

      // Store the initial pointer x-coordinate and domain
      if (!isTouchEvent) {
        this.initialPointerX = d3.pointer(event)[0];
      } else {
        this.initialPointerX = event.touches[0].clientX;
      }
      this.initialDomain = this.xViewScale.domain();

    },

    onPointerMove(event, type) {
      if (!this.moveGraphStarted){
        return
      }

      const isTouchEvent = type === 'touch';

      let currentPointerX = 0;
      if (!isTouchEvent) {
        currentPointerX = d3.pointer(event)[0];
      } else {
        currentPointerX = event.touches[0].clientX;
      }

      // Calculate the change in x position
      const dx = currentPointerX - this.initialPointerX;

      // Calculate the corresponding shift in years
      const domainShift = dx * (this.initialDomain[1] - this.initialDomain[0]) / this.timelineWidth;

      // Calculate the new domain based on the shift
      let newDomainStart = this.initialDomain[0] - domainShift;
      let newDomainEnd = this.initialDomain[1] - domainShift;

      if (newDomainStart < this.computedMinYear-5 || newDomainEnd > this.computedMaxYear+5) {
        return
      }

      // Move the svg group accordingly
      this.newTranslateX = this.initialTranslateX + dx;

      // Update the xViewScale domain
      this.xViewScale.domain([newDomainStart, newDomainEnd]);

      // Update the header with the new domain
      this.updateTimelineHeader([newDomainStart, newDomainEnd]);

      // Update initial values for the next drag event
      this.initialPointerX = currentPointerX;
      this.initialTranslateX = this.newTranslateX;
      this.initialDomain = [newDomainStart, newDomainEnd];
      this.localStartViewYear = newDomainStart;
      this.localStopViewYear = newDomainEnd;
    },

    updateTimelineHeader(newDomain) {
      const width = parseFloat(d3.select('#timeline-header').attr('width'));

      // Clear existing header content
      d3.select('#timeline-header').html('');
      
      // Create new header with updated domain
      this.drawTimelineHeader(width, this.graphMargin, newDomain[0], newDomain[1]);
    },

    clearTimeline () {
      // Clear existing content
      d3.select('#timeline-header').html('')
      d3.select('#timeline-graph').html('')

      // Clear some variables
      this.displayedPersons.clear()
      this.familyColorsMap.clear()
      this.renderedPersons.clear()
    },

    drawTimeline () {
      if (!this.isMounted || !this.isDataLoaded) {
        return;
      }

      // Clear existing content
      this.clearTimeline()

      // Set up SVG dimensions and scales
      this.setupGraphSvg()

      // 1. Draw historical context background (if enabled)
      if (this.showHistoryContext) {
        this.drawHistoricalContext(this.xViewScale, this.totalHeight)
      }

      // 2. Draw header
      this.drawTimelineHeader(this.timelineWidth, this.graphMargin, this.localStartViewYear, this.localStopViewYear)

      // 3. Draw grid background
      this.drawTimelineBackground(this.xViewScale, this.computedMinYear, this.computedMaxYear, this.totalHeight, this.graphMargin)

      // 4. Draw persons and their periods
      this.drawPersons(this.xViewScale)

      // 5. Draw family links (filiation parent-child)
      this.drawFamilyLinks(d3.select('#timeline-graph'), this.xViewScale)
    },

    drawTimelineHeader (width, margin, yearStart, yearStop) {
      const timelineHeader = d3.select('#timeline-header')
        .attr('width', width)
        .attr('height', 60)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top+15})`)

      const xScale = d3.scaleLinear()
        .domain([yearStart, yearStop])
        .range([0, width])

      const xAxis = d3.axisTop(xScale).tickFormat(d3.format('d'))

      timelineHeader.append('g')
        .attr('class', 'x axis')
        .call(xAxis)
        .attr('transform', 'translate(0, 0)')
    },

    drawTimelineBackground (xScale, yearStart, yearStop, height, margin) {
      // Create a scale for vertical lines every xx years
      let intervalYears = 5;
      if (window.innerWidth < 768) {
        intervalYears = 10;
      }

      const xAxisTicks = d3.axisTop(xScale)
        .tickFormat('')
        .tickSize(-(height + margin.top))
        .tickValues(d3.range(yearStart-intervalYears*5, yearStop+intervalYears*5, intervalYears))

      // Add a group for the vertical lines
      const grahSvg = d3.select('#timeline-graph');
      const xAxisTicksGroup = grahSvg.append('g')
        .call(xAxisTicks)

      // remove border
      xAxisTicksGroup.select('path').remove();

      // Modify the style of the vertical lines
      xAxisTicksGroup.selectAll('line')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '1,1');

    },

    drawRoundedRect (x, y, width, height, radius, roundLeft, roundRight) {
      let path = `M${x + (roundLeft ? radius : 0)},${y}`

      if (roundRight) {
        path += `H${x + width - radius}`
        path += `A${radius},${radius} 0 0 1 ${x + width},${y + radius}`
      } else {
        path += `H${x + width}`
      }

      path += `V${y + height - (roundRight ? radius : 0)}`

      if (roundRight) {
        path += `A${radius},${radius} 0 0 1 ${x + width - radius},${y + height}`
      }
      path += `H${x + (roundLeft ? radius : 0)}`

      if (roundLeft) {
        path += `A${radius},${radius} 0 0 1 ${x},${y + height - radius}`
      }
      path += `V${y + (roundLeft ? radius : 0)}`

      if (roundLeft) {
        path += `A${radius},${radius} 0 0 1 ${x + radius},${y}`
      }

      path += 'Z'

      return path
    },

    drawPersons (xScale) {
      const grahSvg = d3.select('#timeline-graph');
      let yPosition = 0
      const familyColor = null
      const isChild = false

      this.rootPersons = this.filterRootPersons()
      for (const person of this.rootPersons) {
        if (!this.displayedPersons.has(person.id)) {
          const personPeriods = this.getPeriods(person, familyColor, isChild)
          yPosition = this.drawPerson(person, personPeriods, grahSvg, yPosition, xScale)
          yPosition++
        }
      }
    },

    drawPerson (person, periods, grahSvg, yPosition, xScale) {
      if (this.displayedPersons.has(person.id)) { return yPosition }

      // Extract birth and death years from the person object
      const birthYear = this.getYearFromDate(person.birth_date)

      // Draw each period as a segment of the timeline
      const topOffset = this.showHistoryContext ? 52 : 15
      const y = yPosition * this.barHeight / 2 + topOffset
      const height = 40
      const personGroup = grahSvg.append('g')
        .attr('class', 'person')
        .attr('id', `person-bar-${person.id}`)
        .attr('transform', `translate(0, ${y})`)
        .datum(person)

      // Create a timeline group for all periods
      const periodsGroup = personGroup.append('g')

      // draw each period for this person
      periods.forEach((period, index) => {
        const x = xScale(period.start)
        const width = xScale(period.end) - xScale(period.start)
        const roundLeft = index === 0
        const roundRight = (index === periods.length - 1) && !period.stillAlive

        // Determine the filter to apply
        let filter = 'none'
        if (!period.birthDateVerified || !period.deathDateVerified) {
          filter = 'url(#blur-filter)'
        }

        periodsGroup.append('path')
          .attr('d', this.drawRoundedRect(x, y, width, height, 10, roundLeft, roundRight))
          .attr('fill', period.color)
          .attr('stroke', 'rgba(15, 23, 42, 0.1)')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .style('filter', filter)
          .on('click', () => this.showPersonProfile(person))
      })

      // Determine the image URL based on gender
      const imageUrl = person.gender === 'Male'
        ? 'profile_men.png'
        : 'profile_women.png'

      // Cercle de fond blanc pour détacher l'avatar
      personGroup.append('circle')
        .attr('cx', xScale(birthYear) + 20)
        .attr('cy', y + height / 2)
        .attr('r', 16)
        .attr('fill', '#ffffff')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))')

      // Append the image inside the circle
      personGroup.append('image')
        .attr('xlink:href', imageUrl)
        .attr('x', xScale(birthYear) + 5)
        .attr('y', y + height / 2 - 15)
        .attr('fill', 'none')
        .attr('width', 30)
        .attr('height', 30)
        .attr('clip-path', 'circle(15px at 15px 15px)')
        .style('cursor', 'pointer')
        .on('click', () => this.showPersonProfile(person))

      // Add the person's name on the bar (texte blanc net)
      personGroup.append('text')
        .attr('x', xScale(birthYear) + 44)
        .attr('y', y + height / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .attr('fill', '#ffffff')
        .style('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.4)')
        .text(`${person.first_name} ${person.last_name}`)
        .style('cursor', 'pointer')
        .style('user-select', 'none')
        .on('click', () => this.showPersonProfile(person))

      // set this person as displayed to avoid duplication
      this.displayedPersons.add(person.id)

      // Store rendered coordinates for family links and search focus
      // y est cumulé par le groupe transform translate(0, y) ET les coordonnées internes y
      const actualYTop = y * 2
      const actualYBottom = actualYTop + height
      this.renderedPersons.set(person.id, {
        id: person.id,
        person: person,
        yPosition: yPosition,
        yTop: actualYTop,
        yBottom: actualYBottom,
        birthYear: birthYear,
        deathYear: this.getYearFromDate(person.death_date)
      })

      // draw other associated persons
      const spouses = this.filterSpouses(person.id)
      if (spouses.length === 0 ) {
        const familyNoSpouseColor = this.familyColorsMap.get(this.getFamilyKey(person.id, 0))
        const isChild = true
        const children = this.filterChildrenNoSpouse(person.id)
        const sortedNoSpouse = [...children].sort((a, b) => {
          const birthA = this.getYearFromDate(a.birth_date) || 9999
          const birthB = this.getYearFromDate(b.birth_date) || 9999
          return birthA - birthB
        })
        for (const child of sortedNoSpouse) {
          if (!this.displayedPersons.has(child.id)) {
            const childPeriods = this.getPeriods(child, familyNoSpouseColor, isChild)
            yPosition = this.drawPerson(child, childPeriods, grahSvg, yPosition + 1, xScale)
          }
        }
      }
      for (const spouse of spouses) {
        const familyColor = this.familyColorsMap.get(this.getFamilyKey(person.id, spouse.id))
        let isChild = false

        // draw oldest anceter
        const oldestAncestor = this.filterOldestAncestor(spouse.id)
        if (oldestAncestor.id !== spouse.id) {
          if (!this.displayedPersons.has(oldestAncestor.id)) {
            const oldestAncestorPeriods = this.getPeriods(oldestAncestor, familyColor, isChild)
            yPosition = this.drawPerson(oldestAncestor, oldestAncestorPeriods, grahSvg, yPosition + 1, xScale)
          }
        }

        // draw the spouse
        if (!this.displayedPersons.has(spouse.id)) {
          const spousePeriods = this.getPeriods(spouse, familyColor, isChild)
          yPosition = this.drawPerson(spouse, spousePeriods, grahSvg, yPosition + 1, xScale)
        }

        // draw children sorted chronologically by birth date
        const children = this.filterChildren(person.id, spouse.id)
        const sortedChildren = [...children].sort((a, b) => {
          const birthA = this.getYearFromDate(a.birth_date) || 9999
          const birthB = this.getYearFromDate(b.birth_date) || 9999
          return birthA - birthB
        })

        for (const child of sortedChildren) {
          if (!this.displayedPersons.has(child.id)) {
            isChild = true
            const childPeriods = this.getPeriods(child, familyColor, isChild)
            yPosition = this.drawPerson(child, childPeriods, grahSvg, yPosition + 1, xScale)
          }
        }
      }
      return yPosition
    },

    showPersonProfile (person) {
      this.selectedPerson = person
      this.$refs.profileModal.show()
    },

    refreshPersonProfile (person) {
      this.selectedPerson = person
    },

    toggleHistoryContext () {
      this.showHistoryContext = !this.showHistoryContext
      this.drawTimeline()
    },

    clearSearch () {
      this.searchQuery = ''
      this.isSearchOpen = false
    },

    focusPerson (person) {
      this.searchQuery = `${person.first_name} ${person.last_name}`
      this.isSearchOpen = false

      const birthYear = this.getYearFromDate(person.birth_date)
      const deathYear = this.getYearFromDate(person.death_date) || (birthYear ? birthYear + 70 : 2000)

      // 1. Adapter le domaine temporel si la personne est hors champ
      let needRedraw = false
      if (birthYear && (birthYear < this.localStartViewYear || birthYear > this.localStopViewYear)) {
        const margin = 25
        this.localStartViewYear = Math.max(this.computedMinYear, Math.floor((birthYear - margin) / 10) * 10)
        this.localStopViewYear = Math.min(this.computedMaxYear, Math.ceil((deathYear + margin) / 10) * 10)
        needRedraw = true
      }

      if (needRedraw) {
        this.drawTimeline()
      }

      // 2. Scroll vertical jusqu'à la personne et mise en lumière
      this.$nextTick(() => {
        const pData = this.renderedPersons.get(person.id)
        if (pData) {
          const container = document.getElementById('timeline-graph-container')
          if (container) {
            container.scrollTo({
              top: Math.max(0, pData.yTop - 120),
              behavior: 'smooth'
            })
          }

          // Effet de halo / pulsation
          const el = document.getElementById(`person-bar-${person.id}`)
          if (el) {
            el.classList.remove('person-highlighted')
            void el.offsetWidth // forcer reflow
            el.classList.add('person-highlighted')
            setTimeout(() => {
              el.classList.remove('person-highlighted')
            }, 4000)
          }
        }
      })
    },

    drawHistoricalContext (xScale, height) {
      const graphSvg = d3.select('#timeline-graph')
      const historyGroup = graphSvg.append('g').attr('class', 'history-context-layer')

      const isEn = this.$i18n && this.$i18n.locale === 'en'

      historicalPeriods.forEach((period, index) => {
        const xStart = xScale(period.startYear)
        const xEnd = xScale(period.endYear)
        const width = xEnd - xStart

        if (xEnd > 0 && xStart < this.timelineWidth && width > 0) {
          const clampedX = Math.max(0, xStart)
          const clampedWidth = Math.min(this.timelineWidth - clampedX, width - (clampedX - xStart))

          const fullName = isEn ? period.nameEn : period.nameFr
          const shortName = isEn ? (period.shortNameEn || period.nameEn) : (period.shortNameFr || period.nameFr)
          const fullLabelWithDates = `${fullName} (${period.startYear}-${period.endYear})`

          // Bande de fond de l'époque sur toute la hauteur
          const band = historyGroup.append('rect')
            .attr('class', 'history-band')
            .attr('x', clampedX)
            .attr('y', 0)
            .attr('width', clampedWidth)
            .attr('height', height)
            .attr('fill', period.color)
            .style('cursor', 'help')

          // Infobulle native SVG au survol
          band.append('title').text(fullLabelWithDates)

          // Ligne séparatrice au début de la période
          if (xStart >= 0 && xStart <= this.timelineWidth) {
            historyGroup.append('line')
              .attr('x1', xStart)
              .attr('y1', 0)
              .attr('x2', xStart)
              .attr('y2', height)
              .attr('stroke', period.borderColor)
              .attr('stroke-width', 1.5)
              .attr('stroke-dasharray', '4,4')
          }

          // Label textuel étagé sur 2 niveaux pour éviter toute superposition
          if (clampedWidth >= 30 && xStart < this.timelineWidth) {
            const yLevel = (index % 2 === 0) ? 18 : 34

            // Choisir le texte le plus approprié selon la largeur réelle de la colonne
            let displayText = ''
            if (clampedWidth >= 220) {
              displayText = fullLabelWithDates
            } else if (clampedWidth >= 110) {
              displayText = `${shortName} (${period.startYear}-${period.endYear})`
            } else if (clampedWidth >= 50) {
              displayText = shortName
            } else {
              displayText = `${period.startYear}`
            }

            const textEl = historyGroup.append('text')
              .attr('class', 'history-label')
              .attr('x', clampedX + 6)
              .attr('y', yLevel)
              .attr('font-size', '12px')
              .attr('font-weight', '700')
              .attr('fill', '#0f172a')
              .style('user-select', 'none')
              .style('cursor', 'help')
              .text(displayText)

            textEl.append('title').text(fullLabelWithDates)
          }
        }
      })

      // Ligne séparatrice horizontale discrète sous le bandeau d'en-tête historique
      historyGroup.append('line')
        .attr('class', 'history-header-border')
        .attr('x1', 0)
        .attr('y1', 46)
        .attr('x2', this.timelineWidth)
        .attr('y2', 46)
        .attr('stroke', 'rgba(148, 163, 184, 0.35)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
    },

    drawFamilyLinks (graphSvg, xScale) {
      // Insérer la couche des liens juste avant les personnes pour qu'elle se trouve en-dessous (derrière)
      const firstPerson = graphSvg.select('.person')
      const linksGroup = firstPerson.node()
        ? graphSvg.insert('g', '.person').attr('class', 'family-links-layer')
        : graphSvg.append('g').attr('class', 'family-links-layer')

      // Générateur de courbes cubiques de Bézier verticales douces
      const bezierCurve = d3.linkVertical()
        .x(d => d[0])
        .y(d => d[1])

      this.renderedPersons.forEach((childData) => {
        const child = childData.person
        if (!child.relatives || child.relatives.length === 0) return

        // Trouver père ou mère parmi les personnes affichées
        const parentRelatives = child.relatives.filter(r =>
          (r.relation_type === 'father' || r.relation_type === 'mother') &&
          this.renderedPersons.has(r.id)
        )

        if (parentRelatives.length === 0) return

        const birthYear = childData.birthYear
        if (!birthYear) return

        const xBirth = xScale(birthYear)

        // Chercher le parent au-dessus de l'enfant
        let targetParent = null
        let maxParentYBottom = -1

        parentRelatives.forEach(pr => {
          const pData = this.renderedPersons.get(pr.id)
          if (pData && pData.yBottom <= childData.yTop) {
            if (pData.yBottom > maxParentYBottom) {
              maxParentYBottom = pData.yBottom
              targetParent = pData
            }
          }
        })

        if (!targetParent) return

        const yStart = targetParent.yBottom
        const yEnd = childData.yTop

        if (yEnd > yStart) {
          // Ancrage naturel : part sous la barre du parent et ondule doucement vers l'avatar de l'enfant
          const startX = xBirth + 6
          const endX = xBirth + 20
          const targetY = yEnd + 15

          const linkG = linksGroup.append('g')
            .attr('class', 'family-link')
            .attr('data-child-id', child.id)
            .attr('data-parent-id', targetParent.id)

          // Point d'ancrage sous le parent
          linkG.append('circle')
            .attr('class', 'anchor-parent')
            .attr('cx', startX)
            .attr('cy', yStart)
            .attr('r', 3)
            .attr('fill', '#64748b')

          // Tracé de la courbe fluide de Bézier reliant directement le parent à l'enfant
          const pathD = bezierCurve({
            source: [startX, yStart],
            target: [endX, targetY]
          })

          linkG.append('path')
            .attr('class', 'link-line')
            .attr('d', pathD)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(100, 116, 139, 0.45)')
            .attr('stroke-width', 1.8)
            .attr('stroke-linecap', 'round')

          // Point d'ancrage discret derrière l'avatar de l'enfant
          linkG.append('circle')
            .attr('class', 'anchor-child')
            .attr('cx', endX)
            .attr('cy', targetY)
            .attr('r', 2.5)
            .attr('fill', '#3b82f6')
        }
      })
    }

  }
}
</script>

<style>

#timeline-content {
  margin-top: 56px;
  padding: 0;
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
}

/* Toolbar */
.timeline-toolbar {
  z-index: 10;
}

.search-box-wrapper {
  min-width: 250px;
  max-width: 380px;
  flex: 1;
}

.search-dropdown {
  max-height: 280px;
  overflow-y: auto;
}

.search-result-item:hover {
  background-color: #f1f5f9;
}

#timeline-wrapper {
  height: 100%;
  overflow: auto;
  position: relative;
}

#timeline-header-container {
  position: sticky;
  top: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; 
  height: 60px;
}

#timeline-header-container:hover {
  cursor: grab;
}

#timeline-header {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
}

#timeline-graph-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

#timeline-graph {
  width: 100%;
}

.vertical-bar-group .vertical-bar {
  stroke: #cbd5e1;
}

.vertical-bar-group:hover .vertical-bar {
  stroke: #3b82f6;
}

.person {
  cursor: pointer;
}

.person path {
  transition: filter 0.2s ease, opacity 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.07));
}

.person:hover path {
  filter: drop-shadow(0 6px 14px rgba(15, 23, 42, 0.16));
}

.person text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  fill: #ffffff;
  letter-spacing: -0.01em;
}

/* Family Links */
.family-link .link-line {
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
}

.family-link:hover .link-line {
  stroke: #2563eb;
  stroke-width: 3;
}

.family-link:hover circle {
  fill: #2563eb;
}

/* Highlight pulse on search focus */
@keyframes personPulse {
  0% {
    filter: drop-shadow(0 0 0 rgba(37, 99, 235, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(37, 99, 235, 0.9));
  }
  100% {
    filter: drop-shadow(0 0 0 rgba(37, 99, 235, 0));
  }
}

.person-highlighted {
  animation: personPulse 1.2s ease-in-out 3;
}

</style>
