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

          <div class="d-flex flex-wrap align-items-center gap-2 my-1">
            <!-- Mode switch: Dynamic Tree vs Full Tree -->
            <div class="btn-group btn-group-sm" role="group">
              <button
                type="button"
                class="btn d-flex align-items-center gap-1"
                :class="viewMode === 'dynamic' ? 'btn-primary' : 'btn-outline-secondary'"
                :title="$t('dynamic-tree-title')"
                @click="toggleViewMode('dynamic')"
              >
                <i class="bi bi-diagram-3-fill" />
                <span>{{ $t('dynamic-tree') }}</span>
              </button>
              <button
                type="button"
                class="btn d-flex align-items-center gap-1"
                :class="viewMode === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
                :title="$t('full-tree-title')"
                @click="toggleViewMode('all')"
              >
                <i class="bi bi-people-fill" />
                <span>{{ $t('full-tree') }}</span>
              </button>
            </div>

            <!-- In dynamic mode: root person badge & reset button -->
            <div v-if="viewMode === 'dynamic' && dynamicRootPerson" class="d-flex align-items-center gap-1">
              <span class="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2">
                <i class="bi bi-person-fill text-primary" />
                <span>{{ dynamicRootPerson.first_name }} {{ dynamicRootPerson.last_name }}</span>
              </span>
              <button
                class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2"
                type="button"
                :title="$t('reset-tree')"
                @click="resetDynamicTree"
              >
                <i class="bi bi-arrow-counterclockwise" />
                <span class="d-none d-md-inline">{{ $t('reset-tree') }}</span>
              </button>
            </div>

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

            <!-- Toggle Places / Locations Markers Button -->
            <button
              class="btn btn-sm d-flex align-items-center gap-1"
              :class="showPlaces ? 'btn-danger text-white' : 'btn-outline-secondary'"
              type="button"
              :title="showPlaces ? $t('hide-places') : $t('show-places')"
              @click="togglePlaces"
            >
              <i class="bi bi-geo-alt-fill" />
              <span>{{ $t('places') }}</span>
              <span class="badge ms-1" :class="showPlaces ? 'bg-white text-danger' : 'bg-secondary text-white'">
                {{ showPlaces ? 'ON' : 'OFF' }}
              </span>
            </button>

            <!-- Zoom & Fit Scale Controls Group -->
            <div class="btn-group btn-group-sm" role="group">
              <button
                class="btn btn-outline-secondary d-flex align-items-center justify-content-center px-2"
                type="button"
                :title="$t('zoom-in')"
                @click="zoomIn"
              >
                <i class="bi bi-zoom-in" />
              </button>
              <button
                class="btn btn-outline-secondary d-flex align-items-center justify-content-center px-2"
                type="button"
                :title="$t('zoom-out')"
                @click="zoomOut"
              >
                <i class="bi bi-zoom-out" />
              </button>
              <button
                class="btn btn-outline-secondary d-flex align-items-center gap-1"
                type="button"
                :title="$t('fit-scale-title')"
                @click="resetToAutoScale"
              >
                <i class="bi bi-arrows-angle-expand" />
                <span class="d-none d-lg-inline">{{ $t('fit-scale') }}</span>
              </button>
            </div>

            <!-- Expand / Collapse All Bars Button -->
            <button
              class="btn btn-sm d-flex align-items-center gap-1"
              :class="unfoldedPersonIds.size === 0 ? 'btn-outline-secondary' : 'btn-info'"
              type="button"
              :title="unfoldedPersonIds.size === 0 ? $t('expand-all-bars') : $t('collapse-all-bars')"
              @click="toggleAllBars"
            >
              <i :class="unfoldedPersonIds.size === 0 ? 'bi bi-layout-three-columns' : 'bi bi-dash-square'" />
              <span>{{ unfoldedPersonIds.size === 0 ? $t('expand-all-bars') : $t('collapse-all-bars') }}</span>
            </button>
          </div>
        </div>

        <!-- Container for the timeline header and graph with scroll and zoom -->
        <div id="timeline-wrapper" @wheel="onWheelZoom">
          <div id="timeline-header-container" @mousedown="onPointerStart($event, 'mouse')" @mousemove="onPointerMove($event, 'mouse')" @mouseup="onPointerEnd()" @mouseleave="onPointerEnd()" @touchstart="onPointerStart($event, 'touch')" @touchmove="onPointerMove($event, 'touch')" @touchend="onPointerEnd()" @touchcancel="onPointerEnd()">
            <svg id="timeline-header" />
          </div>
          <div id="timeline-graph-container">
            <svg id="timeline-graph" />
          </div>

          <!-- Floating Action Toolbar on Person Hover -->
          <div
            v-if="hoveredPerson && viewMode === 'dynamic'"
            class="person-floating-toolbar shadow border d-flex flex-column gap-1 p-2 bg-white rounded-3"
            :style="floatingToolbarStyle"
            @mouseenter="onToolbarMouseEnter"
            @mouseleave="onToolbarMouseLeave"
          >
            <!-- Nom de la personne, lieu de naissance et lieu de décès -->
            <div class="px-2 py-1 border-bottom text-center">
              <div class="fw-bold text-dark small text-truncate">
                {{ hoveredPerson.first_name }} {{ hoveredPerson.last_name }}
              </div>
              <div v-if="getPersonBirthInfo(hoveredPerson)" class="text-muted d-flex align-items-center justify-content-center gap-1 mt-1" style="font-size: 11px;">
                <i class="bi bi-geo-alt-fill text-danger" />
                <span class="text-truncate">{{ getPersonBirthInfo(hoveredPerson) }}</span>
              </div>
              <div v-if="getPersonDeathInfo(hoveredPerson)" class="text-muted d-flex align-items-center justify-content-center gap-1 mt-1" style="font-size: 11px;">
                <span class="text-secondary fw-bold" style="font-size: 10px;">✝</span>
                <span class="text-truncate">{{ getPersonDeathInfo(hoveredPerson) }}</span>
              </div>
            </div>

            <!-- Bouton Parents ▲ -->
            <button
              v-if="getPersonParents(hoveredPerson.id).length > 0"
              class="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center justify-content-between gap-2 rounded-2 text-start"
              :class="{ 'btn-primary text-white': expandedAscendantIds.has(hoveredPerson.id) }"
              type="button"
              @click="toggleAscendants(hoveredPerson.id)"
            >
              <span>▲ {{ expandedAscendantIds.has(hoveredPerson.id) ? $t('hide-parents') : $t('show-parents') }}</span>
              <span class="badge rounded-pill" :class="expandedAscendantIds.has(hoveredPerson.id) ? 'bg-white text-primary' : 'bg-primary text-white'">
                {{ getPersonParents(hoveredPerson.id).length }}
              </span>
            </button>

            <!-- Bouton Conjoints 💍 -->
            <button
              v-if="filterSpouses(hoveredPerson.id).length > 0"
              class="btn btn-sm btn-outline-warning text-dark py-1 px-2 d-flex align-items-center justify-content-between gap-2 rounded-2 text-start"
              :class="{ 'btn-warning': expandedSpouseIds.has(hoveredPerson.id) }"
              type="button"
              @click="toggleSpouses(hoveredPerson.id)"
            >
              <span>💍 {{ expandedSpouseIds.has(hoveredPerson.id) ? $t('hide-spouses') : $t('show-spouses') }}</span>
              <span class="badge rounded-pill" :class="expandedSpouseIds.has(hoveredPerson.id) ? 'bg-white text-dark' : 'bg-warning text-dark'">
                {{ filterSpouses(hoveredPerson.id).length }}
              </span>
            </button>

            <!-- Bouton Enfants ▼ -->
            <button
              v-if="getPersonChildren(hoveredPerson.id).length > 0"
              class="btn btn-sm btn-outline-success py-1 px-2 d-flex align-items-center justify-content-between gap-2 rounded-2 text-start"
              :class="{ 'btn-success text-white': expandedDescendantIds.has(hoveredPerson.id) }"
              type="button"
              @click="toggleDescendants(hoveredPerson.id)"
            >
              <span>▼ {{ expandedDescendantIds.has(hoveredPerson.id) ? $t('hide-children') : $t('show-children') }}</span>
              <span class="badge rounded-pill" :class="expandedDescendantIds.has(hoveredPerson.id) ? 'bg-white text-success' : 'bg-success text-white'">
                {{ getPersonChildren(hoveredPerson.id).length }}
              </span>
            </button>
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
      showPlaces: true,
      renderedPersons: new Map(),
      coupleBridges: new Map(),
      searchQuery: '',
      isSearchOpen: false,
      viewMode: 'dynamic', // 'dynamic' (arbre vivant par défaut) ou 'all' (vue complète)
      dynamicRootPersonId: null,
      expandedAscendantIds: new Set(),
      expandedDescendantIds: new Set(),
      expandedSpouseIds: new Set(),
      unfoldedPersonIds: new Set(),
      hoveredPerson: null,
      floatingToolbarStyle: {},
      isHoveringToolbar: false,
      hoverToolbarTimer: null,
    }
  },
  computed: {
    ...mapGetters(['shouldReloadTimeline']),
    dynamicRootPerson () {
      if (!this.dynamicRootPersonId) return null
      return this.dataPersons.find(p => p.id === this.dynamicRootPersonId) || null
    },
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
    this.dynamicRootPersonId = this.getDefaultDynamicRootPersonId()
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

    getPersonsForScale () {
      if (this.viewMode === 'dynamic') {
        const visibleIds = this.getDynamicVisiblePersonIds()
        const visiblePersons = this.dataPersons.filter(p => visibleIds.has(p.id))
        if (visiblePersons.length > 0) {
          return visiblePersons
        }
      }
      return this.dataPersons
    },

    applyScaleBounds () {
      if (config.autoScale !== false) {
        const bounds = this.calculateAutoBounds(this.getPersonsForScale());
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
      const bounds = this.calculateAutoBounds(this.getPersonsForScale());
      this.computedMinYear = bounds.minYear;
      this.computedMaxYear = bounds.maxYear;
      this.localStartViewYear = bounds.startViewYear;
      this.localStopViewYear = bounds.stopViewYear;
      this.$emit('data-loaded', 'timeline', bounds);
      this.drawTimeline();
    },

    zoomTimeline (factor, focusX = null) {
      const start = this.localStartViewYear;
      const end = this.localStopViewYear;
      const currentSpan = end - start;

      // Factor < 1 = Zoom In (span shrinks), Factor > 1 = Zoom Out (span grows)
      if (factor < 1 && currentSpan <= 5) return; // Limite minimum: 5 ans
      if (factor > 1 && currentSpan >= (this.computedMaxYear - this.computedMinYear + 30)) return;

      const newSpan = Math.max(5, currentSpan * factor);

      let ratio = 0.5; // Zoom centré par défaut
      if (focusX !== null && this.timelineWidth > 0) {
        ratio = Math.max(0, Math.min(1, focusX / this.timelineWidth));
      }

      const focusYear = start + ratio * currentSpan;
      let newStart = Math.round(focusYear - ratio * newSpan);
      let newEnd = Math.round(newStart + newSpan);

      const minBound = this.computedMinYear - 5;
      const maxBound = this.computedMaxYear + 5;
      if (newStart < minBound) {
        newStart = minBound;
        newEnd = Math.round(newStart + newSpan);
      }
      if (newEnd > maxBound) {
        newEnd = maxBound;
        newStart = Math.round(newEnd - newSpan);
      }

      this.localStartViewYear = newStart;
      this.localStopViewYear = newEnd;

      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      });
      this.drawTimeline();
    },

    zoomIn () {
      this.zoomTimeline(0.75);
    },

    zoomOut () {
      this.zoomTimeline(1.33);
    },

    onWheelZoom (event) {
      // Zoomer si la touche Ctrl / Meta est enfoncée, ou si la molette tourne sur le header
      const isHeader = event.target.closest('#timeline-header-container');
      if (event.ctrlKey || event.metaKey || isHeader) {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const factor = event.deltaY < 0 ? 0.82 : 1.22;
        this.zoomTimeline(factor, mouseX);
      }
    },

    getDefaultDynamicRootPersonId () {
      if (!this.dataPersons || this.dataPersons.length === 0) return null

      // Rechercher en priorité une personne ayant à la fois des parents et des enfants (ex: Charles Windsor)
      const personWithBoth = this.dataPersons.find(p => {
        const parents = this.getPersonParents(p.id)
        const children = this.getPersonChildren(p.id)
        return parents.length > 0 && children.length > 0
      })
      if (personWithBoth) return personWithBoth.id

      // Sinon, une personne ayant des conjoints
      const personWithSpouse = this.dataPersons.find(p => {
        const spouses = this.filterSpouses(p.id)
        return spouses.length > 0
      })
      if (personWithSpouse) return personWithSpouse.id

      return this.dataPersons[0].id
    },

    getPersonParents (personId) {
      const person = this.dataPersons.find(p => p.id === personId)
      if (!person || !Array.isArray(person.relatives)) return []
      const parentIds = person.relatives
        .filter(r => r.relation_type === 'father' || r.relation_type === 'mother')
        .map(r => r.id)
      return this.dataPersons.filter(p => parentIds.includes(p.id))
    },

    getPersonChildren (personId) {
      const person = this.dataPersons.find(p => p.id === personId)
      if (!person || !Array.isArray(person.relatives)) return []
      const childIds = person.relatives
        .filter(r => r.relation_type === 'child')
        .map(r => r.id)
      return this.dataPersons.filter(p => childIds.includes(p.id))
    },

    getDynamicVisiblePersonIds () {
      if (!this.dynamicRootPersonId) {
        this.dynamicRootPersonId = this.getDefaultDynamicRootPersonId()
      }
      const visible = new Set()
      if (!this.dynamicRootPersonId) return visible

      // La personne racine est toujours visible
      visible.add(this.dynamicRootPersonId)

      const checkAndAddSpouses = (pId) => {
        if (!this.expandedSpouseIds.has(pId)) return
        const spouses = this.filterSpouses(pId)
        spouses.forEach(s => {
          visible.add(s.id)
        })
      }

      const visitAscendants = (pId) => {
        if (!this.expandedAscendantIds.has(pId)) return
        const parents = this.getPersonParents(pId)
        parents.forEach(parent => {
          visible.add(parent.id)
        })
      }

      const visitDescendants = (pId) => {
        if (!this.expandedDescendantIds.has(pId)) return
        const children = this.getPersonChildren(pId)
        children.forEach(child => {
          visible.add(child.id)
        })
      }

      // Parcourir de manière itérative uniquement les branches connectées depuis les personnes actuellement visibles
      let prevSize = 0
      while (visible.size > prevSize) {
        prevSize = visible.size
        const currentIds = Array.from(visible)
        currentIds.forEach(id => {
          checkAndAddSpouses(id)
          visitAscendants(id)
          visitDescendants(id)
        })
      }

      return visible
    },

    toggleSpouses (personId) {
      if (this.expandedSpouseIds.has(personId)) {
        this.expandedSpouseIds.delete(personId)
      } else {
        this.expandedSpouseIds.add(personId)
      }
      this.applyScaleBounds()
      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      })
      this.drawTimeline()
    },

    toggleAscendants (personId) {
      if (this.expandedAscendantIds.has(personId)) {
        // Retirer récursivement les ascendants de cette branche
        const removeAscendants = (id) => {
          this.expandedAscendantIds.delete(id)
          this.expandedSpouseIds.delete(id)
          const parents = this.getPersonParents(id)
          parents.forEach(parent => {
            this.expandedAscendantIds.delete(parent.id)
            this.expandedSpouseIds.delete(parent.id)
            removeAscendants(parent.id)
          })
        }
        removeAscendants(personId)
      } else {
        this.expandedAscendantIds.add(personId)
        // Déplier automatiquement les parents pour que leurs barres de vie et pont d'union atteignent les années de naissance
        const parents = this.getPersonParents(personId)
        parents.forEach(p => this.unfoldedPersonIds.add(p.id))
      }
      this.applyScaleBounds()
      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      })
      this.drawTimeline()
    },

    toggleDescendants (personId) {
      if (this.expandedDescendantIds.has(personId)) {
        // Retirer récursivement personId et TOUS ses descendants de expandedDescendantIds et expandedSpouseIds
        const removeDescendants = (id) => {
          this.expandedDescendantIds.delete(id)
          this.expandedSpouseIds.delete(id)
          const children = this.getPersonChildren(id)
          children.forEach(child => {
            this.expandedDescendantIds.delete(child.id)
            this.expandedSpouseIds.delete(child.id)
            this.expandedAscendantIds.delete(child.id)
            removeDescendants(child.id)
          })
          const spouses = this.filterSpouses(id)
          spouses.forEach(s => {
            this.expandedDescendantIds.delete(s.id)
            this.expandedSpouseIds.delete(s.id)
          })
        }
        removeDescendants(personId)
      } else {
        this.expandedDescendantIds.add(personId)
        // Déplier automatiquement les parents pour que leurs barres de vie et pont d'union atteignent les années de naissance
        this.unfoldedPersonIds.add(personId)
        const spouses = this.filterSpouses(personId)
        spouses.forEach(s => this.unfoldedPersonIds.add(s.id))
      }
      this.applyScaleBounds()
      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      })
      this.drawTimeline()
    },

    toggleViewMode (mode) {
      this.viewMode = mode
      this.hoveredPerson = null
      this.applyScaleBounds()
      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      })
      this.drawTimeline()
    },

    resetDynamicTree () {
      this.expandedAscendantIds.clear()
      this.expandedDescendantIds.clear()
      this.expandedSpouseIds.clear()
      this.hoveredPerson = null
      this.applyScaleBounds()
      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      })
      this.drawTimeline()
    },

    setDynamicRootPerson (personId) {
      this.dynamicRootPersonId = personId
      this.expandedAscendantIds.clear()
      this.expandedDescendantIds.clear()
      this.expandedSpouseIds.clear()
      this.hoveredPerson = null
      this.applyScaleBounds()
      this.$emit('data-loaded', 'timeline', {
        minYear: this.computedMinYear,
        maxYear: this.computedMaxYear,
        startViewYear: this.localStartViewYear,
        stopViewYear: this.localStopViewYear
      })
      this.drawTimeline()
    },

    onPersonMouseEnter (person, event) {
      if (this.hoverToolbarTimer) {
        clearTimeout(this.hoverToolbarTimer)
        this.hoverToolbarTimer = null
      }
      this.hoveredPerson = person

      // Positionner la toolbar à droite de l'avatar (sur la ligne de vie)
      const wrapper = document.getElementById('timeline-wrapper')
      if (!wrapper) return
      const wrapperRect = wrapper.getBoundingClientRect()
      const avatarRect = event.currentTarget.getBoundingClientRect()

      // Top : aligné légèrement au-dessus de l'avatar pour un menu vertical
      const top = avatarRect.top - wrapperRect.top + wrapper.scrollTop - 6
      // Left : juste à droite de l'avatar (bord droit + 6px de marge)
      const left = avatarRect.right - wrapperRect.left + wrapper.scrollLeft + 6

      this.floatingToolbarStyle = {
        top: `${Math.max(8, top)}px`,
        left: `${Math.min(left, wrapperRect.width - 230)}px`
      }
    },

    onPersonMouseLeave () {
      this.hoverToolbarTimer = setTimeout(() => {
        if (!this.isHoveringToolbar) {
          this.hoveredPerson = null
        }
      }, 350)
    },

    onToolbarMouseEnter () {
      if (this.hoverToolbarTimer) {
        clearTimeout(this.hoverToolbarTimer)
        this.hoverToolbarTimer = null
      }
      this.isHoveringToolbar = true
    },

    onToolbarMouseLeave () {
      this.isHoveringToolbar = false
      this.hoverToolbarTimer = setTimeout(() => {
        this.hoveredPerson = null
      }, 300)
    },

    getPersonBirthInfo (person) {
      if (!person || !person.birth_date) return null
      const bEv = (person.events || []).find(e => (e.event_type || '').toLowerCase() === 'birth')
      const bDate = new Date(person.birth_date)
      const bYear = !isNaN(bDate.getTime()) ? bDate.getFullYear() : null
      if (bEv && bEv.event_place) {
        return bYear ? `${bEv.event_place} (${bYear})` : bEv.event_place
      } else if (bYear) {
        return `${bYear}`
      }
      return null
    },

    getPersonDeathInfo (person) {
      if (!person || !person.death_date) return null
      const dEv = (person.events || []).find(e => (e.event_type || '').toLowerCase() === 'death')
      const dDate = new Date(person.death_date)
      const dYear = !isNaN(dDate.getTime()) ? dDate.getFullYear() : null
      if (dEv && dEv.event_place) {
        return dYear ? `${dEv.event_place} (${dYear})` : dEv.event_place
      } else if (dYear) {
        return `${dYear}`
      }
      return null
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

        // Initialize the common dates and places to null
        let marriageDate = null
        let marriagePlace = null
        let divorceDate = null
        let divorcePlace = null
        let civilUnionDate = null
        let civilUnionPlace = null
        let civilSeparationDate = null

        const normalizeType = (t) => (t || '').toLowerCase().replace(/[\s_-]+/g, '_')

        // Rassembler tous les événements mutuels du couple (depuis person ET depuis spouseDetail)
        const pEvents = (person.events || [])
          .filter(e => (e.related_persons || []).some(rp => rp.id === spouse.id))
        const sEvents = (spouseDetail && spouseDetail.events ? spouseDetail.events : [])
          .filter(e => (e.related_persons || []).some(rp => rp.id === person.id))

        // Parcourir les événements des deux conjoints pour extraire dates et lieux
        ;[...pEvents, ...sEvents].forEach(event => {
          const nType = normalizeType(event.event_type)
          switch (nType) {
            case 'marriage':
              if (!marriageDate && event.event_date) marriageDate = event.event_date
              if (!marriagePlace && event.event_place) marriagePlace = event.event_place
              break
            case 'civil_union':
              if (!civilUnionDate && event.event_date) civilUnionDate = event.event_date
              if (!civilUnionPlace && event.event_place) civilUnionPlace = event.event_place
              break
            case 'divorce':
              if (!divorceDate && event.event_date) divorceDate = event.event_date
              if (!divorcePlace && event.event_place) divorcePlace = event.event_place
              break
            case 'civil_separation':
              if (!civilSeparationDate && event.event_date) civilSeparationDate = event.event_date
              break
          }
        })

        // Return the spouse detail with the added common dates and places
        return {
          ...spouseDetail,
          marriage_date: marriageDate,
          marriage_place: marriagePlace,
          divorce_date: divorceDate,
          divorce_place: divorcePlace,
          civil_union_date: civilUnionDate,
          civil_union_place: civilUnionPlace,
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
        const spouseDeathYear = spouse.death_date ? new Date(spouse.death_date).getFullYear() : null
        // Marriage period ends at: divorce, spouse's death, or person's own end year (whichever comes first)
        let divorceYear = endYear
        if (spouse.divorce_date) {
          divorceYear = new Date(spouse.divorce_date).getFullYear()
        } else if (spouseDeathYear && spouseDeathYear < endYear) {
          divorceYear = spouseDeathYear
        }
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
            // Derive a unique couple color that doesn't collide with either person's default color
            const ids = familyKey.split('-').map(v => parseInt(v, 10))
            const personDefaultColor = this.getFamilyColor(person.id)
            const spouseDefaultColor = this.getFamilyColor(spouse.id)
            // Try multiple hash seeds until we find a non-colliding color
            for (let attempt = 0; attempt < 12; attempt++) {
              const numKey = (ids[0] * 13 + ids[1] * 7 + attempt * 3) 
              spouseColor = this.getFamilyColor(numKey)
              // Check it doesn't match either person's lifeline color
              if (spouseColor !== personDefaultColor && spouseColor !== spouseDefaultColor) break
            }
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
            stillAlive: person.death_date === null,
            isRelationship: true,
            spouseName: `${spouse.first_name} ${spouse.last_name}`,
            relationshipType: marriageYear ? 'marriage' : (unionYear ? 'civil_union' : 'union'),
            marriageYear: marriageYear,
            divorceYear: spouse.divorce_date ? new Date(spouse.divorce_date).getFullYear() : null
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

      // Handle the period after the last divorce or spouse death until death or current year
      if (lastEventYear < endYear) {
        periods.push({
          start: lastEventYear,
          end: endYear,
          color: isChild ? familyColor : this.getDefaultColor(person.id),
          birthDateVerified,
          deathDateVerified,
          stillAlive: person.death_date === null
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
      const personCount = this.viewMode === 'dynamic'
        ? Math.max(this.getDynamicVisiblePersonIds().size, 4)
        : this.dataPersons.length
      this.totalHeight = Math.max((personCount + 3) * this.barHeight, window.innerHeight)

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
      this.coupleBridges.clear()
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

      // 5. Draw marriage & couple bridges (registers coupleBridges)
      this.drawMarriageBridges(d3.select('#timeline-graph'), this.xViewScale)

      // 6. Draw family links (filiation parent-child attached to couple/parent at birth date)
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

      if (this.viewMode === 'all') {
        this.rootPersons = this.filterRootPersons()
        for (const person of this.rootPersons) {
          if (!this.displayedPersons.has(person.id)) {
            const personPeriods = this.getPeriods(person, familyColor, isChild)
            yPosition = this.drawPerson(person, personPeriods, grahSvg, yPosition, xScale)
            yPosition++
          }
        }
      } else {
        // Mode dynamique : identifier les racines parmi les personnes visibles
        const visibleIds = this.getDynamicVisiblePersonIds()
        const visiblePersons = this.dataPersons.filter(p => visibleIds.has(p.id))

        // Une racine visible est une personne dont aucun parent n'est dans l'ensemble visible
        const visibleRoots = visiblePersons.filter(p => {
          const parents = this.getPersonParents(p.id)
          return !parents.some(parent => visibleIds.has(parent.id))
        }).sort((a, b) => {
          const birthA = this.getYearFromDate(a.birth_date) || 9999
          const birthB = this.getYearFromDate(b.birth_date) || 9999
          return birthA - birthB
        })

        for (const person of visibleRoots) {
          if (!this.displayedPersons.has(person.id)) {
            const personPeriods = this.getPeriods(person, familyColor, isChild)
            yPosition = this.drawPerson(person, personPeriods, grahSvg, yPosition, xScale)
            yPosition++
          }
        }

        // Sécurité mode dynamique : dessiner toute personne visible restante
        for (const person of visiblePersons) {
          if (!this.displayedPersons.has(person.id)) {
            const personPeriods = this.getPeriods(person, familyColor, isChild)
            yPosition = this.drawPerson(person, personPeriods, grahSvg, yPosition, xScale)
            yPosition++
          }
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
      const isUnfolded = this.isBarUnfolded(person.id)

      const personGroup = grahSvg.append('g')
        .attr('class', 'person')
        .attr('id', `person-bar-${person.id}`)
        .attr('transform', `translate(0, ${y})`)
        .datum(person)

      // URL de l'image : photo réelle si disponible, sinon générique selon le genre
      const dataUrl = import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_DATA_URL
        : '/data'
      const imageUrl = person.picture
        ? dataUrl + person.picture
        : (person.gender === 'Male' ? 'profile_men.png' : 'profile_women.png')

      const avatarCx = xScale(birthYear) + 20

      if (!isUnfolded) {
        // ── MODE COMPACT (par défaut) ─────────────────────────────────────────
        // Pastille arrondie de ~180px centrée sur la date de naissance
        const pillWidth = 170
        const pillX = xScale(birthYear)
        const pillRadius = height / 2

        // Ombre portée / fond de la pastille
        personGroup.append('rect')
          .attr('x', pillX)
          .attr('y', y)
          .attr('width', pillWidth)
          .attr('height', height)
          .attr('rx', pillRadius)
          .attr('ry', pillRadius)
          .attr('fill', periods.length > 0 ? periods[0].color : '#e2e8f0')
          .attr('stroke', 'rgba(15, 23, 42, 0.12)')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 2px 6px rgba(15,23,42,0.1))')
          .on('click', () => this.togglePersonBar(person.id))

        // Cercle blanc derrière l'avatar (zone de survol pour la toolbar)
        const avatarCircle = personGroup.append('circle')
          .attr('cx', avatarCx)
          .attr('cy', y + height / 2)
          .attr('r', 16)
          .attr('fill', '#ffffff')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))')
          .style('cursor', 'pointer')
          .on('click', () => this.togglePersonBar(person.id))

        // Avatar (image de profil)
        const avatarImage = personGroup.append('image')
          .attr('xlink:href', imageUrl)
          .attr('x', avatarCx - 15)
          .attr('y', y + height / 2 - 15)
          .attr('width', 30)
          .attr('height', 30)
          .attr('clip-path', 'circle(15px at 15px 15px)')
          .style('cursor', 'pointer')
          .on('click', () => this.togglePersonBar(person.id))

        // Toolbar sur survol de l'avatar uniquement
        if (this.viewMode === 'dynamic') {
          const attachAvatarHover = (el) => {
            el.on('mouseenter', (event) => this.onPersonMouseEnter(person, event))
              .on('mouseleave', () => this.onPersonMouseLeave())
          }
          attachAvatarHover(avatarCircle)
          attachAvatarHover(avatarImage)
        }

        // Prénom (texte tronqué)
        personGroup.append('text')
          .attr('x', avatarCx + 22)
          .attr('y', y + height / 2)
          .attr('dy', '.35em')
          .attr('text-anchor', 'start')
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('fill', '#1e293b')
          .style('user-select', 'none')
          .style('cursor', 'pointer')
          .text(`${person.first_name} ${person.last_name}`.substring(0, 13) + ((`${person.first_name} ${person.last_name}`).length > 13 ? '…' : ''))
          .on('click', () => this.togglePersonBar(person.id))

        // Icône chevron droit ▶ pour indiquer qu'on peut déplier
        personGroup.append('text')
          .attr('class', 'expand-toggle-icon')
          .attr('x', pillX + pillWidth - 14)
          .attr('y', y + height / 2)
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#64748b')
          .style('user-select', 'none')
          .style('cursor', 'pointer')
          .text('▶')
          .on('click', () => this.togglePersonBar(person.id))

      } else {
        // ── MODE DÉPLIÉ (barre de vie complète) ───────────────────────────────
        // Create a timeline group for all periods
        const periodsGroup = personGroup.append('g')

        // draw each period for this person
        periods.forEach(period => {
          const x = xScale(period.start)
          const width = xScale(period.end) - xScale(period.start)

          // Determine the filter to apply
          let filter = 'none'
          if (!period.birthDateVerified || !period.deathDateVerified) {
            filter = 'url(#blur-filter)'
          }

          const periodPath = periodsGroup.append('path')
            .attr('d', this.drawRoundedRect(x, y, width, height, 0, false, false))
            .attr('fill', period.color)
            .attr('stroke', 'rgba(15, 23, 42, 0.1)')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .style('filter', filter)
            .on('click', () => this.showPersonProfile(person))

          if (period.isRelationship) {
            const typeLabel = period.relationshipType === 'marriage' ? 'Mariage' : 'Union'
            const periodDates = period.divorceYear ? `(${period.start} - ${period.divorceYear})` : `(depuis ${period.start})`
            // Lieu de l'union s'il est renseigné dans les événements
            const unionEv = person.events ? person.events.find(e => ['marriage', 'civil union', 'civil_union'].includes((e.event_type || '').toLowerCase()) && e.event_place) : null
            const placeSuffix = (unionEv && unionEv.event_place) ? `\n📍 ${unionEv.event_place}` : ''
            const relTooltip = `💍 ${typeLabel} avec ${period.spouseName} ${periodDates}${placeSuffix}`
            periodPath.append('title').text(relTooltip)

            // Anneaux d'alliance dorés discrets au début de la tranche de mariage
            if (width >= 24) {
              const ringG = periodsGroup.append('g')
                .attr('class', 'marriage-bar-badge')
                .attr('transform', `translate(${x + 12}, ${y + height / 2})`)
                .style('cursor', 'pointer')
                .on('click', () => this.showPersonProfile(person))

              ringG.append('circle').attr('cx', -3).attr('cy', 0).attr('r', 4.5).attr('fill', 'none').attr('stroke', '#fbbf24').attr('stroke-width', 1.8)
              ringG.append('circle').attr('cx', 3).attr('cy', 0).attr('r', 4.5).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 1.8)
              ringG.append('title').text(relTooltip)
            }
          }
        })

        // Cercle de fond blanc pour détacher l'avatar (zone de survol pour la toolbar)
        const avatarCircleExp = personGroup.append('circle')
          .attr('cx', avatarCx)
          .attr('cy', y + height / 2)
          .attr('r', 16)
          .attr('fill', '#ffffff')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))')

        // Append the image inside the circle
        const avatarImageExp = personGroup.append('image')
          .attr('xlink:href', imageUrl)
          .attr('x', avatarCx - 15)
          .attr('y', y + height / 2 - 15)
          .attr('fill', 'none')
          .attr('width', 30)
          .attr('height', 30)
          .attr('clip-path', 'circle(15px at 15px 15px)')
          .style('cursor', 'pointer')
          .on('click', () => this.showPersonProfile(person))

        // Toolbar sur survol de l'avatar uniquement (mode déplié)
        if (this.viewMode === 'dynamic') {
          const attachAvatarHoverExp = (el) => {
            el.on('mouseenter', (event) => this.onPersonMouseEnter(person, event))
              .on('mouseleave', () => this.onPersonMouseLeave())
          }
          attachAvatarHoverExp(avatarCircleExp)
          attachAvatarHoverExp(avatarImageExp)
        }

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

        // ── Marqueurs de lieux géolocalisés sur la barre de vie ────────────────
        if (this.showPlaces && person.events && person.events.length > 0) {
          const placeEvents = person.events.filter(e => {
            if (!e.event_place || !e.event_place.trim() || !e.event_date) return false
            const type = (e.event_type || '').toLowerCase()
            // Naissance, décès (menu avatar), mariages et divorces (au milieu dans le pont), enfants (liens) : exclus de la barre
            if (['birth', 'death', 'marriage', 'civil union', 'civil_union', 'divorce', 'civil_separation', 'child'].includes(type)) {
              return false
            }
            return true
          })

          if (placeEvents.length > 0) {
            const eventsByYear = new Map()
            placeEvents.forEach(e => {
              const yr = this.getYearFromDate(e.event_date)
              if (!yr) return
              if (!eventsByYear.has(yr)) eventsByYear.set(yr, [])
              eventsByYear.get(yr).push(e)
            })

            const placesG = personGroup.append('g').attr('class', 'person-places-layer')

            eventsByYear.forEach((evList, yr) => {
              const px = xScale(yr)
              if (px < 0 || px > this.timelineWidth) return

              // Marqueur élégant sous forme de pin de carte géographique
              const markerG = placesG.append('g')
                .attr('class', 'place-marker')
                .attr('transform', `translate(${px}, ${y + height / 2 + 5})`)
                .style('cursor', 'pointer')
                .on('click', () => this.showPersonProfile(person))

              // Forme de pin de carte (goutte inversée pointant sur l'année)
              markerG.append('path')
                .attr('class', 'map-pin-body')
                .attr('d', 'M 0,0 C -2,-2.5 -6,-6 -6,-10 C -6,-13.5 -3.3,-16.5 0,-16.5 C 3.3,-16.5 6,-13.5 6,-10 C 6,-6 2,-2.5 0,0 Z')
                .attr('fill', '#e11d48')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.3)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))')

              // Point blanc au centre du pin
              markerG.append('circle')
                .attr('class', 'map-pin-dot')
                .attr('cx', 0)
                .attr('cy', -10)
                .attr('r', 2.2)
                .attr('fill', '#ffffff')

              // Tooltip soigné au survol
              const tooltipLines = evList.map(e => {
                const typeLabel = this.$t(e.event_type) || e.event_type
                const datePart = e.event_date ? ` (${e.event_date})` : ''
                const notePart = e.event_notes ? `\n   Note : ${e.event_notes}` : ''
                return `📍 ${e.event_place}\n   ${typeLabel}${datePart}${notePart}`
              }).join('\n\n')

              markerG.append('title').text(tooltipLines)
            })
          }
        }

        // Bouton de repli ◀ à l'extrémité droite de la barre
        const lastPeriod = periods[periods.length - 1]
        const collapseX = lastPeriod ? xScale(lastPeriod.end) + 6 : xScale(birthYear) + 180
        personGroup.append('circle')
          .attr('class', 'collapse-btn-bg')
          .attr('cx', collapseX + 10)
          .attr('cy', y + height / 2)
          .attr('r', 10)
          .attr('fill', '#f1f5f9')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('click', () => this.togglePersonBar(person.id))

        personGroup.append('text')
          .attr('class', 'collapse-toggle-icon')
          .attr('x', collapseX + 10)
          .attr('y', y + height / 2)
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#64748b')
          .style('user-select', 'none')
          .style('cursor', 'pointer')
          .text('◀')
          .on('click', () => this.togglePersonBar(person.id))
      }

      // set this person as displayed to avoid duplication
      this.displayedPersons.add(person.id)

      // Store rendered coordinates for family links and search focus
      const actualYTop = y * 2
      const actualYBottom = actualYTop + height
      // Note: chaque groupe SVG a transform(0, y) ET les éléments internes utilisent y dans leurs attributs,
      // donc la position absolue réelle = 2*y. actualYTop + height/2 est le vrai centre absolu SVG.
      const actualYCenter = actualYTop + height / 2
      // Points d'ancrage pour les liens de filiation :
      //   anchorXOut = point de départ (centre de l'avatar du parent)
      //   anchorXIn  = point d'arrivée (à gauche de l'avatar de l'enfant)
      const avatarCenterX = xScale(birthYear) + 20
      const avatarLeftX   = xScale(birthYear) + 4  // cx(20) - r(16)

      // Position X de fin de barre (en pixels) — pour le pont de mariage
      // Compact : fin du pill fixe ; Déplié : fin de la dernière période
      const barEndX = isUnfolded
        ? (() => { const lp = periods[periods.length - 1]; return lp?.end ? xScale(lp.end) : null })()
        : xScale(birthYear) + 170



      this.renderedPersons.set(person.id, {
        id: person.id,
        person: person,
        yPosition: yPosition,
        yTop: actualYTop,
        yCenter: actualYCenter,
        yBottom: actualYBottom,
        birthYear: birthYear,
        anchorXOut: avatarCenterX,
        anchorXIn:  avatarLeftX,
        deathYear: this.getYearFromDate(person.death_date),
        barEndYear: periods.length > 0 ? (periods[periods.length - 1].end ?? null) : null,
        barEndX: barEndX,
        isUnfolded: isUnfolded
      })

      // draw other associated persons
      const spouses = this.filterSpouses(person.id)
      const visibleIds = this.viewMode === 'dynamic' ? this.getDynamicVisiblePersonIds() : null

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
          const shouldDrawChild = this.viewMode === 'all' || this.expandedDescendantIds.has(person.id) || (visibleIds && visibleIds.has(child.id))
          if (shouldDrawChild && !this.displayedPersons.has(child.id)) {
            const childPeriods = this.getPeriods(child, familyNoSpouseColor, isChild)
            yPosition = this.drawPerson(child, childPeriods, grahSvg, yPosition + 1, xScale)
          }
        }
      }
      for (const spouse of spouses) {
        const familyColor = this.familyColorsMap.get(this.getFamilyKey(person.id, spouse.id))
        let isChild = false

        // draw oldest ancestor of spouse (only in 'all' mode, or if spouse's ancestors were expanded)
        if (this.viewMode === 'all' || (visibleIds && this.expandedAscendantIds.has(spouse.id))) {
          const oldestAncestor = this.filterOldestAncestor(spouse.id)
          if (oldestAncestor.id !== spouse.id) {
            const shouldDrawOldest = this.viewMode === 'all' || (visibleIds && visibleIds.has(oldestAncestor.id))
            if (shouldDrawOldest && !this.displayedPersons.has(oldestAncestor.id)) {
              const oldestAncestorPeriods = this.getPeriods(oldestAncestor, familyColor, isChild)
              yPosition = this.drawPerson(oldestAncestor, oldestAncestorPeriods, grahSvg, yPosition + 1, xScale)
            }
          }
        }

        // draw the spouse
        const shouldDrawSpouse = this.viewMode === 'all' || (visibleIds && visibleIds.has(spouse.id))
        if (shouldDrawSpouse && !this.displayedPersons.has(spouse.id)) {
          const spousePeriods = this.getPeriods(spouse, familyColor, isChild)
          yPosition = this.drawPerson(spouse, spousePeriods, grahSvg, yPosition + 1, xScale)
        }

        // draw children sorted chronologically by birth date
        const children = this.filterChildren(person.id, spouse.id)
        const hasVisibleChild = visibleIds ? children.some(c => visibleIds.has(c.id)) : false
        const shouldDrawChildren = this.viewMode === 'all' || this.expandedDescendantIds.has(person.id) || this.expandedDescendantIds.has(spouse.id) || hasVisibleChild
        if (shouldDrawChildren) {
          const sortedChildren = [...children].sort((a, b) => {
            const birthA = this.getYearFromDate(a.birth_date) || 9999
            const birthB = this.getYearFromDate(b.birth_date) || 9999
            return birthA - birthB
          })

          for (const child of sortedChildren) {
            const shouldDrawThisChild = this.viewMode === 'all' || this.expandedDescendantIds.has(person.id) || this.expandedDescendantIds.has(spouse.id) || (visibleIds && visibleIds.has(child.id))
            if (shouldDrawThisChild && !this.displayedPersons.has(child.id)) {
              isChild = true
              const childPeriods = this.getPeriods(child, familyColor, isChild)
              yPosition = this.drawPerson(child, childPeriods, grahSvg, yPosition + 1, xScale)
            }
          }
        }
      }
      return yPosition
    },

    showPersonProfile (person) {
      this.selectedPerson = person
      this.$refs.profileModal.show()
    },

    isBarUnfolded (personId) {
      return this.unfoldedPersonIds.has(personId)
    },

    togglePersonBar (personId) {
      const newSet = new Set(this.unfoldedPersonIds)
      if (newSet.has(personId)) {
        newSet.delete(personId)
      } else {
        newSet.add(personId)
      }
      this.unfoldedPersonIds = newSet
      this.drawTimeline()
    },

    toggleAllBars () {
      if (this.unfoldedPersonIds.size === 0) {
        // Tout déplier : ajouter toutes les personnes affichées
        this.unfoldedPersonIds = new Set(this.renderedPersons.keys())
      } else {
        // Tout replier
        this.unfoldedPersonIds = new Set()
      }
      this.drawTimeline()
    },

    refreshPersonProfile (person) {
      this.selectedPerson = person
    },

    toggleHistoryContext () {
      this.showHistoryContext = !this.showHistoryContext
      this.drawTimeline()
    },

    togglePlaces () {
      this.showPlaces = !this.showPlaces
      this.drawTimeline()
    },

    clearSearch () {
      this.searchQuery = ''
      this.isSearchOpen = false
    },

    focusPerson (person) {
      this.searchQuery = `${person.first_name} ${person.last_name}`
      this.isSearchOpen = false

      if (this.viewMode === 'dynamic') {
        this.setDynamicRootPerson(person.id)
        return
      }

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
            .style('cursor', 'default')

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
              .style('cursor', 'default')
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

    drawMarriageBridges (graphSvg, xScale) {
      // Couche dessinée derrière les barres de vie
      const firstPerson = graphSvg.select('.person')
      const bridgeLayer = firstPerson.node()
        ? graphSvg.insert('g', '.person').attr('class', 'marriage-bridge-layer')
        : graphSvg.append('g').attr('class', 'marriage-bridge-layer')

      const processed = new Set()
      this.coupleBridges.clear()

      this.renderedPersons.forEach((personData) => {
        const spouses = this.filterSpouses(personData.id)
        if (!spouses || spouses.length === 0) return

        spouses.forEach(spouse => {
          const spouseData = this.renderedPersons.get(spouse.id)
          if (!spouseData) return

          // Ne traiter chaque couple qu'une seule fois
          const pairKey = [personData.id, spouse.id].sort().join('-')
          if (processed.has(pairKey)) return
          processed.add(pairKey)

          // Date de début du pont :
          // 1. Mariage ou union civile (le plus ancien)
          const mDate = this.getYearFromDate(spouse.marriage_date)
          const uDate = this.getYearFromDate(spouse.civil_union_date)
          let marriageYear = mDate && uDate ? Math.min(mDate, uDate) : (mDate || uDate)

          // 2. Si pas de mariage ni union civile, débuter dès le 1er enfant commun (coparentalité / union libre)
          if (!marriageYear) {
            const commonChildren = this.filterChildren(personData.id, spouse.id)
            if (commonChildren && commonChildren.length > 0) {
              const sortedKids = [...commonChildren].sort((a, b) => {
                const bA = this.getYearFromDate(a.birth_date) || 9999
                const bB = this.getYearFromDate(b.birth_date) || 9999
                return bA - bB
              })
              marriageYear = this.getYearFromDate(sortedKids[0].birth_date)
            }
          }

          if (!marriageYear) return

          // Date de fin (divorce, séparation, ou décès du premier conjoint)
          const divorceYear = this.getYearFromDate(spouse.divorce_date || spouse.civil_separation_date)

          // Fin de la bande : position X en pixels de la fin de chaque barre
          const fallbackX = xScale(this.localStopViewYear)
          const xEndPerson = personData.barEndX ?? fallbackX
          const xEndSpouse = spouseData.barEndX ?? fallbackX

          let xEnd = Math.min(xEndPerson, xEndSpouse)
          if (divorceYear) {
            xEnd = Math.min(xEnd, xScale(divorceYear))
          }

          // Si un des conjoints est décédé, s'arrêter au premier décès
          const spouseDeathYear = spouseData.deathYear
          const personDeathYear = personData.deathYear
          if (spouseDeathYear && personDeathYear) {
            xEnd = Math.min(xEnd, xScale(Math.min(spouseDeathYear, personDeathYear)))
          } else if (spouseDeathYear) {
            xEnd = Math.min(xEnd, xScale(spouseDeathYear))
          } else if (personDeathYear) {
            xEnd = Math.min(xEnd, xScale(personDeathYear))
          }

          const xStart = xScale(marriageYear)
          if (xEnd <= xStart) return

          // Déterminer qui est en haut et qui est en bas
          const topData    = personData.yCenter <= spouseData.yCenter ? personData : spouseData
          const bottomData = personData.yCenter <= spouseData.yCenter ? spouseData : personData

          // Gap entre les deux barres
          const gapTop    = topData.yBottom     // bas de la barre du haut
          const gapBottom = bottomData.yTop      // haut de la barre du bas
          const gapHeight = gapBottom - gapTop
          const gapCenterY = (gapTop + gapBottom) / 2

          // Pas de gap visible → rien à dessiner
          if (gapHeight <= 0) return

          // Couleur de la bande : couleur du couple depuis familyColorsMap
          const familyKey = this.getFamilyKey(personData.id, spouse.id)
          const bandColor = this.familyColorsMap.get(familyKey) || '#e2e8f0'
          // Ajout d'une légère transparence pour rester discret
          const bandFill = bandColor.startsWith('#')
            ? bandColor + '99'  // hex + alpha 60%
            : bandColor.replace(/rgba?\(([^)]+)\)/, (_, g) => `rgba(${g.split(',').slice(0,3).join(',')}, 0.55)`)

          // Enregistrer les métadonnées du pont pour le tracé des liens d'enfants
          this.coupleBridges.set(pairKey, {
            parentA: personData,
            parentB: spouseData,
            topData,
            bottomData,
            gapTop,
            gapBottom,
            gapCenterY: (gapTop + gapBottom) / 2,
            yearStart: marriageYear,
            xStart,
            xEnd,
            bandColor
          })

          // Bande translucide dans le gap pendant l'union / parentalité
          bridgeLayer.append('rect')
            .attr('class', 'marriage-band')
            .attr('x', xStart)
            .attr('y', gapTop)
            .attr('width', xEnd - xStart)
            .attr('height', gapHeight)
            .attr('fill', bandFill)
            .attr('rx', 2)

          // Marqueurs de lieu de l'union (Union civile et/ou Mariage) au centre de la bande d'union (au premier plan)
          if (this.showPlaces) {
            try {
              let overlayLayer = graphSvg.select('.places-overlay-layer')
              if (!overlayLayer.node()) {
                overlayLayer = graphSvg.append('g').attr('class', 'places-overlay-layer')
              }

              const pName = (personData && personData.person && personData.person.first_name) || ''
              const sName = (spouse && spouse.first_name) || (spouseData && spouseData.person && spouseData.person.first_name) || ''

              const createUnionPin = (xPos, pinColor, titleText) => {
                const pinG = overlayLayer.append('g')
                  .attr('class', 'place-marker union-place-marker')
                  .attr('transform', `translate(${xPos}, ${gapCenterY})`)
                  .style('cursor', 'pointer')
                  .on('click', () => this.showPersonProfile(personData.person))

                pinG.append('path')
                  .attr('class', 'map-pin-body')
                  .attr('d', 'M 0,0 C -2,-2.5 -6,-6 -6,-10 C -6,-13.5 -3.3,-16.5 0,-16.5 C 3.3,-16.5 6,-13.5 6,-10 C 6,-6 2,-2.5 0,0 Z')
                  .attr('fill', pinColor)
                  .attr('stroke', '#ffffff')
                  .attr('stroke-width', 1.3)
                  .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))')

                pinG.append('circle')
                  .attr('class', 'map-pin-dot')
                  .attr('cx', 0)
                  .attr('cy', -10)
                  .attr('r', 2.2)
                  .attr('fill', '#ffffff')

                pinG.append('title').text(titleText)
              }

              // 1. Pastille Union civile (si existante avec lieu ou date)
              const cuPlace = spouse.civil_union_place
              if (uDate && (cuPlace || spouse.civil_union_date)) {
                const cuX = xScale(uDate) + 12
                const placeLabel = cuPlace ? `📍 ${cuPlace}\n` : ''
                const dateStr = spouse.civil_union_date ? ` (${spouse.civil_union_date})` : ''
                createUnionPin(cuX, '#e11d48', `${placeLabel}📜 Union civile de ${pName} & ${sName}${dateStr}`)
              }

              // 2. Pastille Mariage (si existant avec lieu ou date)
              const mPlace = spouse.marriage_place
              if (mDate && (mPlace || spouse.marriage_date)) {
                let mX = xScale(mDate) + 12
                // Si l'union civile et le mariage ont lieu la même année, décaler légèrement pour éviter la superposition
                if (uDate && uDate === mDate) {
                  mX += 16
                }
                const placeLabel = mPlace ? `📍 ${mPlace}\n` : ''
                const dateStr = spouse.marriage_date ? ` (${spouse.marriage_date})` : ''
                createUnionPin(mX, '#e11d48', `${placeLabel}💍 Mariage de ${pName} & ${sName}${dateStr}`)
              }

              // Marqueur de lieu de divorce à la fin de la bande d'union (si couple divorcé et lieu renseigné)
              let dPlace = spouse.divorce_place
              if (!dPlace && spouse.divorce_date) {
                const pEvents = (personData.person && personData.person.events) || []
                const sEvents = (spouseData.person && spouseData.person.events) || []
                const dEv = [...pEvents, ...sEvents].find(e =>
                  ['divorce', 'civil_separation'].includes((e.event_type || '').toLowerCase()) &&
                  e.event_place && e.event_place.trim()
                )
                if (dEv) dPlace = dEv.event_place
              }

              if (dPlace && dPlace.trim() && spouse.divorce_date) {
                const pName = (personData && personData.person && personData.person.first_name) || ''
                const sName = (spouse && spouse.first_name) || (spouseData && spouseData.person && spouseData.person.first_name) || ''
                const dDateStr = ` (${spouse.divorce_date})`

                let overlayLayer = graphSvg.select('.places-overlay-layer')
                if (!overlayLayer.node()) {
                  overlayLayer = graphSvg.append('g').attr('class', 'places-overlay-layer')
                }

                const divorcePinG = overlayLayer.append('g')
                  .attr('class', 'place-marker divorce-place-marker')
                  .attr('transform', `translate(${xEnd - 6}, ${gapCenterY})`)
                  .style('cursor', 'pointer')
                  .on('click', () => this.showPersonProfile(personData.person))

                divorcePinG.append('path')
                  .attr('class', 'map-pin-body')
                  .attr('d', 'M 0,0 C -2,-2.5 -6,-6 -6,-10 C -6,-13.5 -3.3,-16.5 0,-16.5 C 3.3,-16.5 6,-13.5 6,-10 C 6,-6 2,-2.5 0,0 Z')
                  .attr('fill', '#e11d48')
                  .attr('stroke', '#ffffff')
                  .attr('stroke-width', 1.3)
                  .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))')

                divorcePinG.append('circle')
                  .attr('class', 'map-pin-dot')
                  .attr('cx', 0)
                  .attr('cy', -10)
                  .attr('r', 2.2)
                  .attr('fill', '#ffffff')

                divorcePinG.append('title').text(`📍 ${dPlace}\n💔 Divorce de ${pName} & ${sName}${dDateStr}`)
              }
            } catch (err) {
              console.error('Error drawing union place marker:', err)
            }
          }
        })
      })
    },

    drawFamilyLinks (graphSvg, xScale) {
      // Insérer la couche des liens juste avant les personnes pour qu'elle se trouve EN-DESSOUS (derrière) les barres de vie
      const firstPerson = graphSvg.select('.person')
      const linksGroup = firstPerson.node()
        ? graphSvg.insert('g', '.person').attr('class', 'family-links-layer')
        : graphSvg.append('g').attr('class', 'family-links-layer')

      this.renderedPersons.forEach((childData) => {
        try {
          const child = childData.person
          if (!child || !child.relatives || child.relatives.length === 0) return

          // Trouver père et mère parmi les personnes affichées
          const parentRelatives = child.relatives.filter(r =>
            (r.relation_type === 'father' || r.relation_type === 'mother') &&
            this.renderedPersons.has(r.id)
          )

          if (parentRelatives.length === 0) return

          const birthYear = childData.birthYear
          if (!birthYear) return

          const xBirth = xScale(birthYear)
          const endX   = childData.anchorXIn != null ? childData.anchorXIn : (xBirth + 4)
          const endY   = childData.yCenter != null ? childData.yCenter : (childData.yTop + 20)

          const linkG = linksGroup.append('g')
            .attr('class', 'family-link')
            .attr('data-child-id', child.id)

          // Cas 1 : Deux parents affichés
          if (parentRelatives.length >= 2) {
            const p1 = this.renderedPersons.get(parentRelatives[0].id)
            const p2 = this.renderedPersons.get(parentRelatives[1].id)
            if (!p1 || !p2) return

            const topParent = p1.yCenter <= p2.yCenter ? p1 : p2
            const botParent = p1.yCenter <= p2.yCenter ? p2 : p1
            const pairKey   = [Number(p1.id), Number(p2.id)].sort((a, b) => a - b).join('-')
            const bridge    = this.coupleBridges.get(pairKey)

            const coupleColor = (bridge && bridge.bandColor) ? bridge.bandColor : '#475569'

            // Si les parents sont en mode compact (repliés), le départ part sous les avatars
            const isParentsCollapsed = !topParent.isUnfolded && !botParent.isUnfolded
            const startX = isParentsCollapsed
              ? Math.max(topParent.anchorXOut || 0, botParent.anchorXOut || 0)
              : xBirth

            // Départ : centre de la bande d'union des deux parents à l'année de naissance
            const startY = bridge ? bridge.gapCenterY : (topParent.yBottom + botParent.yTop) / 2

            // Calque d'overlay au premier plan pour les pastilles de lieux
            let overlayLayer = graphSvg.select('.places-overlay-layer')
            if (!overlayLayer.node()) {
              overlayLayer = graphSvg.append('g').attr('class', 'places-overlay-layer')
            }

            const birthEv = (child.events || []).find(e =>
              (e.event_type || '').toLowerCase() === 'birth' && e.event_place && e.event_place.trim()
            )

            if (this.showPlaces && birthEv && !isParentsCollapsed) {
              const birthPin = overlayLayer.append('g')
                .attr('class', 'place-marker child-birth-marker')
                .attr('transform', `translate(${startX}, ${startY})`)
                .style('cursor', 'pointer')
                .on('click', () => this.showPersonProfile(child))

              birthPin.append('path')
                .attr('class', 'map-pin-body')
                .attr('d', 'M 0,0 C -2,-2.5 -6,-6 -6,-10 C -6,-13.5 -3.3,-16.5 0,-16.5 C 3.3,-16.5 6,-13.5 6,-10 C 6,-6 2,-2.5 0,0 Z')
                .attr('fill', '#e11d48')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.3)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))')

              birthPin.append('circle')
                .attr('class', 'map-pin-dot')
                .attr('cx', 0)
                .attr('cy', -10)
                .attr('r', 2.2)
                .attr('fill', '#ffffff')

              birthPin.append('title').text(`📍 ${birthEv.event_place}\n👶 Naissance de ${child.first_name} ${child.last_name} (${childData.birthYear})`)
            } else {
              // Point neutre quand les lieux sont masqués ou parents repliés
              linkG.append('circle')
                .attr('class', 'anchor-couple')
                .attr('cx', startX)
                .attr('cy', startY)
                .attr('r', 3.5)
                .attr('fill', coupleColor)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.5)
            }

            // Trait descendant du pont (part de la pointe du pin si affiché, ou du centre de la bande)
            const deltaY = endY - startY
            const cp1x = startX
            const cp1y = startY + deltaY * 0.4
            const cp2x = endX - Math.max(8, (endX - startX) * 0.3)
            const cp2y = endY
            const pathD = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`

            linkG.append('path')
              .attr('class', 'link-line')
              .attr('d', pathD)
              .attr('fill', 'none')
              .attr('stroke', 'rgba(71, 85, 105, 0.65)')
              .attr('stroke-width', 1.8)
              .attr('stroke-linecap', 'round')

          } else {
            // Cas 2 : Un seul parent affiché
            const pData = this.renderedPersons.get(parentRelatives[0].id)
            if (!pData) return

            const isParentCollapsed = !pData.isUnfolded
            // Si le parent est replié, le lien part proprement sous son avatar
            const startX = isParentCollapsed ? (pData.anchorXOut ?? (xScale(pData.birthYear) + 20)) : xBirth
            const startY = pData.yBottom
            const deltaY = endY - startY
            const cp1x = startX
            const cp1y = startY + deltaY * 0.4
            const cp2x = endX - Math.max(8, (endX - startX) * 0.3)
            const cp2y = endY
            const pathD = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`

            let overlayLayer = graphSvg.select('.places-overlay-layer')
            if (!overlayLayer.node()) {
              overlayLayer = graphSvg.append('g').attr('class', 'places-overlay-layer')
            }

            const birthEv = (child.events || []).find(e =>
              (e.event_type || '').toLowerCase() === 'birth' && e.event_place && e.event_place.trim()
            )

            if (this.showPlaces && birthEv && !isParentCollapsed) {
              const birthPin = overlayLayer.append('g')
                .attr('class', 'place-marker child-birth-marker')
                .attr('transform', `translate(${startX}, ${startY})`)
                .style('cursor', 'pointer')
                .on('click', () => this.showPersonProfile(child))

              birthPin.append('path')
                .attr('class', 'map-pin-body')
                .attr('d', 'M 0,0 C -2,-2.5 -6,-6 -6,-10 C -6,-13.5 -3.3,-16.5 0,-16.5 C 3.3,-16.5 6,-13.5 6,-10 C 6,-6 2,-2.5 0,0 Z')
                .attr('fill', '#e11d48')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.3)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))')

              birthPin.append('circle')
                .attr('class', 'map-pin-dot')
                .attr('cx', 0)
                .attr('cy', -10)
                .attr('r', 2.2)
                .attr('fill', '#ffffff')

              birthPin.append('title').text(`📍 ${birthEv.event_place}\n👶 Naissance de ${child.first_name} ${child.last_name} (${childData.birthYear})`)
            } else {
              linkG.append('circle')
                .attr('class', 'anchor-parent')
                .attr('cx', startX)
                .attr('cy', startY)
                .attr('r', 3.5)
                .attr('fill', '#475569')
                .attr('stroke', '#ffffff')
            }

            linkG.append('path')
              .attr('class', 'link-line')
              .attr('d', pathD)
              .attr('fill', 'none')
              .attr('stroke', 'rgba(71, 85, 105, 0.65)')
              .attr('stroke-width', 1.8)
              .attr('stroke-linecap', 'round')
          }
        } catch (err) {
          console.error('Error drawing family link for child:', err)
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

/* Marriage Badges on bars */
.marriage-bar-badge circle {
  transition: stroke-width 0.2s ease, r 0.2s ease;
}

.marriage-bar-badge:hover circle {
  stroke-width: 2.5;
  stroke: #d97706;
}

/* Map Pin Place markers on life bars */
.place-marker {
  cursor: pointer;
}

.place-marker .map-pin-body {
  transition: fill 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease;
}

.place-marker:hover .map-pin-body {
  fill: #9f1239;
  stroke: #ffffff;
  stroke-width: 1.8;
  filter: drop-shadow(0 3px 8px rgba(159, 18, 57, 0.65));
}

.place-marker:hover .map-pin-dot {
  fill: #fef08a;
}

/* Floating Action Toolbar on Person Hover */
.person-floating-toolbar {
  position: absolute;
  z-index: 1000;
  pointer-events: auto;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  min-width: 200px;
  animation: fadeInToolbar 0.15s ease-out;
}

/* Zone invisible de transition vers l'avatar pour ne jamais perdre le survol */
.person-floating-toolbar::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -12px;
  width: 12px;
  pointer-events: auto;
}

@keyframes fadeInToolbar {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Compact pill mode */
.person .expand-toggle-icon,
.person .collapse-toggle-icon {
  transition: fill 0.15s ease, transform 0.15s ease;
}

.person:hover .expand-toggle-icon,
.person:hover .collapse-toggle-icon {
  fill: #2563eb;
}

.collapse-btn-bg {
  transition: fill 0.15s ease;
}

.person:hover .collapse-btn-bg {
  fill: #dbeafe;
  stroke: #2563eb;
}
</style>
