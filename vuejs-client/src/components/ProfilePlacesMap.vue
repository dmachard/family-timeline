<template>
  <div class="profile-places-map-container">
    <!-- Header with place counter and trajectory info -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-geo-alt-fill text-danger fs-5" />
        <div>
          <h6 class="fw-bold text-dark mb-0 fs-6">
            Déplacements & Lieux de vie
          </h6>
          <div v-if="itinerarySteps.length > 1" class="text-muted small" style="font-size: 11px;">
            Itinéraire chronologique de vie ({{ itinerarySteps.length }} étapes)
          </div>
        </div>
        <span v-if="placesWithEvents.length" class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle ms-1">
          {{ placesWithEvents.length }} lieu{{ placesWithEvents.length > 1 ? 'x' : '' }}
        </span>
      </div>
      <div v-if="loadingGeocodes" class="d-flex align-items-center gap-1 text-muted small">
        <span class="spinner-border spinner-border-sm text-primary" role="status" />
        <span style="font-size: 11px;">Localisation...</span>
      </div>
    </div>

    <!-- Empty state if no events with place -->
    <div v-if="placesWithEvents.length === 0" class="card border rounded-4 p-4 text-center bg-white shadow-xs">
      <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mx-auto mb-2" style="width: 48px; height: 48px;">
        <i class="bi bi-geo-alt fs-4" />
      </div>
      <h6 class="fw-bold text-dark mb-1">Aucun lieu renseigné</h6>
      <p class="text-muted small mb-3">
        Renseignez les lieux de naissance, mariage, résidence ou décès dans les événements pour visualiser le parcours et les déplacements sur la carte.
      </p>
      <div>
        <button class="btn btn-sm btn-outline-primary rounded-pill px-3" type="button" @click="$emit('add-event')">
          <i class="bi bi-plus-lg me-1" />Ajouter un événement avec un lieu
        </button>
      </div>
    </div>

    <!-- Map & Itinerary Display -->
    <div v-else class="d-flex flex-column gap-3">
      <!-- Leaflet Map Container -->
      <div class="card border rounded-4 overflow-hidden shadow-xs position-relative">
        <div ref="mapContainer" class="map-render-area" />

        <!-- Floating map controller overlay (re-center button) -->
        <div class="position-absolute top-0 end-0 m-2 z-3">
          <button
            class="btn btn-sm btn-white bg-white border shadow-sm rounded-pill px-2 py-1 d-flex align-items-center gap-1 text-dark hover-card"
            style="font-size: 11px; font-weight: 600;"
            type="button"
            title="Recadrer la carte sur l'ensemble de l'itinéraire"
            @click="fitMapToBounds"
          >
            <i class="bi bi-arrows-fullscreen text-primary" />
            <span>Vue d'ensemble</span>
          </button>
        </div>
      </div>

      <!-- Chronological Journey Steps (Trajectory Pills) -->
      <div class="card border rounded-4 p-3 bg-white shadow-xs">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1" style="font-size: 11px; letter-spacing: 0.04em;">
            <i class="bi bi-compass text-primary fs-6" />
            <span>Parcours chronologique (cliquer pour suivre le déplacement)</span>
          </div>
          <span v-if="itinerarySteps.length > 1" class="badge rounded-pill bg-light text-muted border" style="font-size: 10px;">
            Relié par le tracé bleu
          </span>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <template v-for="(step, idx) in itinerarySteps" :key="idx">
            <div
              class="itinerary-pill-chip d-flex align-items-center gap-2 px-2 py-1 rounded-pill border bg-light shadow-xs"
              :class="{ active: activePlaceName === step.placeName }"
              @click="focusStep(step)"
            >
              <span class="step-badge-number rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                {{ idx + 1 }}
              </span>
              <span class="place-pill-dot" :class="getEventDotClass(step.event?.event_type)" />
              <div class="text-start">
                <span class="fw-bold text-dark place-pill-title">{{ step.placeName }}</span>
                <span v-if="step.year" class="text-muted small ms-1 font-monospace" style="font-size: 11px;">({{ step.year }})</span>
              </div>
            </div>

            <!-- Trajectory Arrow between steps -->
            <i v-if="idx < itinerarySteps.length - 1" class="bi bi-arrow-right text-primary opacity-75 fs-6" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Pre-seeded coordinates for instant offline / rate-limit-free resolution of famous genealogical locations
const KNOWN_COORDS = {
  'london': { lat: 51.5074, lon: -0.1278 },
  'londres': { lat: 51.5074, lon: -0.1278 },
  'mayfair': { lat: 51.5100, lon: -0.1490 },
  'mayfair, london': { lat: 51.5100, lon: -0.1490 },
  'mayfair, london, england': { lat: 51.5100, lon: -0.1490 },
  '17 bruton street, mayfair, london': { lat: 51.5100, lon: -0.1490 },
  '17 bruton street, mayfair, london, england': { lat: 51.5100, lon: -0.1490 },
  'sandringham': { lat: 52.8290, lon: 0.5139 },
  'sandringham house': { lat: 52.8290, lon: 0.5139 },
  'sandringham house, norfolk': { lat: 52.8290, lon: 0.5139 },
  'sandringham house, norfolk, england': { lat: 52.8290, lon: 0.5139 },
  'windsor': { lat: 51.4839, lon: -0.6044 },
  'windsor castle': { lat: 51.4839, lon: -0.6044 },
  'château de windsor': { lat: 51.4839, lon: -0.6044 },
  'st george\'s chapel, windsor': { lat: 51.4838, lon: -0.6066 },
  'balmoral': { lat: 57.0397, lon: -3.2290 },
  'balmoral castle': { lat: 57.0397, lon: -3.2290 },
  'château de balmoral': { lat: 57.0397, lon: -3.2290 },
  'balmoral castle, aberdeenshire, scotland': { lat: 57.0397, lon: -3.2290 },
  'westminster': { lat: 51.4994, lon: -0.1274 },
  'westminster abbey': { lat: 51.4994, lon: -0.1274 },
  'westminster abbey, london': { lat: 51.4994, lon: -0.1274 },
  'westminster abbey, london, england': { lat: 51.4994, lon: -0.1274 },
  'buckingham palace': { lat: 51.5014, lon: -0.1419 },
  'buckingham palace, london': { lat: 51.5014, lon: -0.1419 },
  'buckingham palace, london, england': { lat: 51.5014, lon: -0.1419 },
  'clarence house': { lat: 51.5036, lon: -0.1384 },
  'clarence house, london': { lat: 51.5036, lon: -0.1384 },
  'clarence house, london, england': { lat: 51.5036, lon: -0.1384 },
  'edinburgh': { lat: 55.9533, lon: -3.1883 },
  'edimbourg': { lat: 55.9533, lon: -3.1883 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'hospital': { lat: 51.5074, lon: -0.1278 }
}

export default {
  name: 'ProfilePlacesMap',
  props: {
    person: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['add-event'],
  data () {
    return {
      map: null,
      markerGroup: null,
      polylineLayer: null,
      glowPolylineLayer: null,
      loadingGeocodes: false,
      activePlaceName: null,
      markersByPlace: new Map(),
      cachedCoordinates: new Map(),
      itinerarySteps: []
    }
  },
  computed: {
    placesWithEvents () {
      if (!this.person || !this.person.events) return []

      const mapByPlace = new Map()

      this.person.events.forEach(ev => {
        const place = (ev.event_place || '').trim()
        if (!place) return

        if (!mapByPlace.has(place)) {
          mapByPlace.set(place, {
            placeName: place,
            events: []
          })
        }
        mapByPlace.get(place).events.push(ev)
      })

      const list = []
      mapByPlace.forEach(entry => {
        entry.events.sort((a, b) => new Date(a.event_date || '9999') - new Date(b.event_date || '9999'))
        entry.primaryEvent = entry.events[0]
        const years = entry.events
          .map(e => e.event_date ? new Date(e.event_date).getFullYear() : '')
          .filter(Boolean)
        entry.yearsSummary = years.length ? Array.from(new Set(years)).join(', ') : ''
        list.push(entry)
      })

      return list
    }
  },
  watch: {
    person: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          this.initOrUpdateMap()
        })
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initOrUpdateMap()
    })
  },
  beforeUnmount () {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },
  methods: {
    initOrUpdateMap () {
      if (this.placesWithEvents.length === 0) return

      if (!this.$refs.mapContainer) return

      if (!this.map) {
        // Initialiser Leaflet
        this.map = L.map(this.$refs.mapContainer, {
          zoomControl: true,
          attributionControl: false
        }).setView([51.505, -0.09], 5)

        // Fond de carte propre (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(this.map)

        this.markerGroup = L.featureGroup().addTo(this.map)
      }

      this.geocodeAndRenderPlaces()
    },

    async geocodeAndRenderPlaces () {
      if (!this.map || !this.markerGroup) return

      this.markerGroup.clearLayers()
      this.markersByPlace.clear()
      this.loadingGeocodes = true

      // 1. Extraire tous les événements avec lieu triés chronologiquement pour former l'itinéraire
      const sortedEvents = (this.person.events || [])
        .filter(e => e.event_place && e.event_place.trim())
        .sort((a, b) => new Date(a.event_date || '9999') - new Date(b.event_date || '9999'))

      const resolvedSteps = []
      const bounds = []

      for (let i = 0; i < sortedEvents.length; i++) {
        const ev = sortedEvents[i]
        const placeName = ev.event_place.trim()
        const coords = await this.resolveCoordinates(placeName)

        if (coords) {
          const year = ev.event_date ? new Date(ev.event_date).getFullYear() : ''
          resolvedSteps.push({
            stepIndex: i + 1,
            event: ev,
            placeName,
            coords,
            year
          })
          bounds.push([coords.lat, coords.lon])
        }
      }

      this.itinerarySteps = resolvedSteps

      // 2. Tracer le trait reliant tous les lieux dans l'ordre chronologique (déplacement de vie)
      if (resolvedSteps.length >= 2) {
        // Filtrer les coordonnées consécutives strictement identiques pour un tracé propre
        const pathCoords = []
        resolvedSteps.forEach(s => {
          const pt = [s.coords.lat, s.coords.lon]
          if (pathCoords.length === 0) {
            pathCoords.push(pt)
          } else {
            const last = pathCoords[pathCoords.length - 1]
            if (last[0] !== pt[0] || last[1] !== pt[1]) {
              pathCoords.push(pt)
            }
          }
        })

        if (pathCoords.length >= 2) {
          // Ligne de lueur douce en arrière-plan
          L.polyline(pathCoords, {
            color: '#93c5fd',
            weight: 7,
            opacity: 0.5,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(this.markerGroup)

          // Ligne de déplacement animée principale en bleu roi
          L.polyline(pathCoords, {
            color: '#2563eb',
            weight: 3.5,
            opacity: 0.9,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round',
            className: 'itinerary-flow-line'
          }).addTo(this.markerGroup)
        }
      }

      // 3. Placer les pastilles markers pour chaque lieu
      // Pour chaque lieu unique, récupérer ses étapes associées
      this.placesWithEvents.forEach(placeEntry => {
        const matchingSteps = resolvedSteps.filter(s => s.placeName === placeEntry.placeName)
        if (matchingSteps.length > 0) {
          const coords = matchingSteps[0].coords
          const marker = this.createPillMarker(coords, placeEntry, matchingSteps)
          this.markerGroup.addLayer(marker)
          this.markersByPlace.set(placeEntry.placeName, marker)
        }
      })

      this.loadingGeocodes = false

      if (bounds.length > 0) {
        if (bounds.length === 1) {
          this.map.setView(bounds[0], 11)
        } else {
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
        }
      }

      setTimeout(() => {
        if (this.map) this.map.invalidateSize()
      }, 150)
    },

    createPillMarker (coords, placeEntry, steps) {
      const primaryType = (placeEntry.primaryEvent?.event_type || '').toLowerCase()
      const dotColorClass = this.getEventDotClass(primaryType)
      const primaryYear = placeEntry.primaryEvent?.event_date
        ? new Date(placeEntry.primaryEvent.event_date).getFullYear()
        : ''

      // Étiquettes d'étapes (ex: 1 ou 1, 3)
      const stepLabel = steps.map(s => s.stepIndex).join(', ')

      // Pastille flottante sobre, élégante et sans émojis inappropriés
      const htmlContent = `
        <div class="map-pill-badge shadow-sm">
          <span class="pill-step-number">${stepLabel}</span>
          <span class="pill-dot ${dotColorClass}"></span>
          <span class="pill-text">${primaryYear ? primaryYear + ' • ' : ''}${this.escapeHtml(placeEntry.placeName)}</span>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-map-pill-icon',
        html: htmlContent,
        iconSize: [null, 30],
        iconAnchor: [20, 15]
      })

      const marker = L.marker([coords.lat, coords.lon], { icon: customIcon })

      // Popup détaillé au clic
      const popupHtml = `
        <div class="map-popup-content p-1">
          <div class="fw-bold text-dark mb-1 fs-6 d-flex align-items-center gap-1">
            <i class="bi bi-geo-alt-fill text-danger"></i> <span>${this.escapeHtml(placeEntry.placeName)}</span>
          </div>
          <div class="events-popup-list d-flex flex-column gap-2 mt-2">
            ${placeEntry.events.map(ev => `
              <div class="p-2 rounded bg-light border" style="font-size: 12px;">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge ${this.getBadgeClass(ev.event_type)} rounded-pill">${ev.event_date || 'Date inconnue'}</span>
                  <strong class="text-dark">${this.getEventLabel(ev.event_type)}</strong>
                </div>
                ${ev.event_notes ? `<div class="text-muted small mt-1">${this.escapeHtml(ev.event_notes)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, { maxWidth: 280 })
      return marker
    },

    focusStep (step) {
      this.activePlaceName = step.placeName
      const marker = this.markersByPlace.get(step.placeName)
      if (marker && this.map) {
        this.map.flyTo(marker.getLatLng(), 13, { duration: 0.8 })
        marker.openPopup()
      }
    },

    fitMapToBounds () {
      if (!this.map || !this.markerGroup) return
      const layers = this.markerGroup.getLayers()
      if (layers.length === 0) return
      if (layers.length === 1) {
        this.map.setView(layers[0].getLatLng(), 11)
      } else {
        this.map.fitBounds(this.markerGroup.getBounds(), { padding: [50, 50], maxZoom: 14 })
      }
    },

    invalidateSize () {
      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize()
          this.fitMapToBounds()
        }, 100)
      }
    },

    async resolveCoordinates (placeName) {
      if (!placeName) return null
      const cleanKey = placeName.toLowerCase().trim()

      // 1. Coordonnées prédéfinies
      if (KNOWN_COORDS[cleanKey]) {
        return KNOWN_COORDS[cleanKey]
      }
      for (const [k, coords] of Object.entries(KNOWN_COORDS)) {
        if (cleanKey.includes(k) || k.includes(cleanKey)) {
          return coords
        }
      }

      // 2. Cache mémoire
      if (this.cachedCoordinates.has(cleanKey)) {
        return this.cachedCoordinates.get(cleanKey)
      }

      // 3. Cache localStorage
      try {
        const stored = localStorage.getItem('ft_geo_' + encodeURIComponent(cleanKey))
        if (stored) {
          const parsed = JSON.parse(stored)
          this.cachedCoordinates.set(cleanKey, parsed)
          return parsed
        }
      } catch (e) {
        // Ignorer
      }

      // 4. Appel Nominatim OpenStreetMap avec repli progressif
      const queries = [
        placeName,
        placeName.split(',').slice(-2).join(','),
        placeName.split(',').pop()
      ].filter(Boolean)

      for (const q of queries) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q.trim())}`
          const res = await fetch(url, { headers: { 'User-Agent': 'FamilyTimelineApp/1.0' } })
          if (res.ok) {
            const data = await res.json()
            if (data && data.length > 0) {
              const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
              this.cachedCoordinates.set(cleanKey, coords)
              try {
                localStorage.setItem('ft_geo_' + encodeURIComponent(cleanKey), JSON.stringify(coords))
              } catch (e) {
                // Ignore storage limits
              }
              return coords
            }
          }
        } catch (e) {
          // Continuer au candidat suivant
        }
      }

      return null
    },

    getEventDotClass (type) {
      const t = (type || '').toLowerCase()
      if (t === 'birth') return 'dot-birth'
      if (t === 'death') return 'dot-death'
      if (t === 'marriage') return 'dot-marriage'
      if (t === 'child') return 'dot-child'
      if (t === 'divorce') return 'dot-divorce'
      return 'dot-event'
    },

    getEventLabel (type) {
      const t = (type || '').toLowerCase()
      if (t === 'birth') return 'Naissance'
      if (t === 'death') return 'Décès'
      if (t === 'marriage') return 'Mariage'
      if (t === 'child') return 'Enfant'
      if (t === 'divorce') return 'Divorce'
      return type || 'Événement'
    },

    getBadgeClass (type) {
      const t = (type || '').toLowerCase()
      if (t === 'birth') return 'bg-success text-white'
      if (t === 'death') return 'bg-secondary text-white'
      if (t === 'marriage') return 'bg-warning text-dark'
      if (t === 'child') return 'bg-primary text-white'
      if (t === 'divorce') return 'bg-danger text-white'
      return 'bg-info text-dark'
    },

    escapeHtml (str) {
      if (!str) return ''
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }
  }
}
</script>

<style>
/* Leaflet marker & polyline global rules */
.custom-map-pill-icon {
  background: transparent;
  border: none;
}

.map-pill-badge {
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  padding: 3px 9px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.map-pill-badge:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.22);
  border-color: #2563eb;
}

.pill-step-number {
  background-color: #2563eb;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pill-dot.dot-birth { background-color: #10b981; }
.pill-dot.dot-death { background-color: #64748b; }
.pill-dot.dot-marriage { background-color: #f59e0b; }
.pill-dot.dot-child { background-color: #6366f1; }
.pill-dot.dot-divorce { background-color: #ef4444; }
.pill-dot.dot-event { background-color: #3b82f6; }

.pill-text {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Animated flow dash for trajectory connecting line */
@keyframes itineraryDash {
  to {
    stroke-dashoffset: -32;
  }
}

.itinerary-flow-line {
  animation: itineraryDash 2s linear infinite;
}
</style>

<style scoped>
.map-render-area {
  width: 100%;
  height: 380px;
  background-color: #f8fafc;
  z-index: 1;
}

.itinerary-pill-chip {
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.itinerary-pill-chip:hover {
  background-color: #eff6ff !important;
  border-color: #bfdbfe !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important;
}

.itinerary-pill-chip.active {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
}

.itinerary-pill-chip.active .place-pill-title {
  color: #ffffff !important;
}

.itinerary-pill-chip.active .font-monospace {
  color: #cbd5e1 !important;
}

.step-badge-number {
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.place-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.place-pill-dot.dot-birth { background-color: #10b981; }
.place-pill-dot.dot-death { background-color: #64748b; }
.place-pill-dot.dot-marriage { background-color: #f59e0b; }
.place-pill-dot.dot-child { background-color: #6366f1; }
.place-pill-dot.dot-divorce { background-color: #ef4444; }
.place-pill-dot.dot-event { background-color: #3b82f6; }

.place-pill-title {
  font-size: 12px;
}

.hover-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.hover-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1) !important;
}
</style>
