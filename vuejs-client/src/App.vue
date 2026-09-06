<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div id="app">
    <!-- Header / Top bar -->
    <nav v-if="isAuthenticated" class="navbar navbar-light bg-white fixed-top border-bottom app-navbar shadow-sm py-0">
      <div class="container-fluid px-3 h-100 d-flex align-items-center gap-2 flex-nowrap">
        <!-- Brand Logo & Name -->
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2 text-dark m-0 flex-shrink-0" href="/">
          <img src="/favicon.png" width="28" height="28" class="d-inline-block align-top" alt="Logo">
          <span class="brand-title d-none d-xxl-inline">Family Timeline</span>
        </a>

        <!-- Mount point for Timeline Controls (Teleported from TimelineD3Chart) -->
        <div id="top-navbar-timeline-controls" class="d-flex align-items-center gap-2 overflow-x-auto py-1 min-w-0 flex-shrink-1" />

        <!-- Right Side Controls: Search + Language + User Profile -->
        <div class="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
          <!-- Mount point for Person Search (Teleported from TimelineD3Chart) -->
          <div id="top-navbar-search" class="position-relative flex-shrink-0" />

          <!-- Quick Language Selector -->
          <div class="dropdown">
            <button
              class="btn btn-sm lang-selector-btn d-flex align-items-center gap-1 py-1 px-2 border rounded-pill bg-white shadow-xs"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="Language"
            >
              <i class="bi bi-globe text-muted" style="font-size: 13px;" />
              <span class="fw-semibold text-uppercase" style="font-size: 11px; letter-spacing: 0.03em;">{{ selectedLanguage }}</span>
              <i class="bi bi-chevron-down text-muted" style="font-size: 9px;" />
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border rounded-3 p-1" style="min-width: 135px;">
              <li>
                <a
                  class="dropdown-item py-1 px-2 rounded-2 d-flex align-items-center justify-content-between"
                  :class="{ 'active fw-bold': selectedLanguage === 'fr' }"
                  href="#"
                  @click.prevent="setLanguage('fr')"
                >
                  <span class="d-flex align-items-center gap-2">
                    <span style="font-size: 14px;">🇫🇷</span>
                    <span>{{ $t('french') }}</span>
                  </span>
                  <i v-if="selectedLanguage === 'fr'" class="bi bi-check2 text-primary" />
                </a>
              </li>
              <li>
                <a
                  class="dropdown-item py-1 px-2 rounded-2 d-flex align-items-center justify-content-between"
                  :class="{ 'active fw-bold': selectedLanguage === 'en' }"
                  href="#"
                  @click.prevent="setLanguage('en')"
                >
                  <span class="d-flex align-items-center gap-2">
                    <span style="font-size: 14px;">🇬🇧</span>
                    <span>{{ $t('english') }}</span>
                  </span>
                  <i v-if="selectedLanguage === 'en'" class="bi bi-check2 text-primary" />
                </a>
              </li>
            </ul>
          </div>

          <!-- User Profile & Admin Menu Dropdown -->
          <div class="dropdown">
            <button
              id="userMenuDropdown"
              class="btn user-profile-btn d-flex align-items-center gap-2 py-1 ps-2 pe-3 border rounded-pill bg-white shadow-xs"
              type="button"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
            >
              <div class="user-avatar-circle">
                <i class="bi bi-person-fill text-primary" />
              </div>
              <div class="d-none d-sm-flex flex-column text-start lh-1">
                <span class="user-name-label fw-bold text-dark">{{ userName || 'Admin' }}</span>
                <span class="user-role-label text-muted">{{ $t('menu') }}</span>
              </div>
              <i class="bi bi-chevron-down text-muted small ms-1" style="font-size: 10px;" />
            </button>

            <div class="dropdown-menu dropdown-menu-end user-dropdown-panel shadow-lg border p-2 mt-2" aria-labelledby="userMenuDropdown">
              <!-- User Header Card -->
              <div class="user-dropdown-header px-3 py-2 border-bottom mb-2 d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <div class="user-avatar-circle">
                    <i class="bi bi-person-circle fs-5 text-primary" />
                  </div>
                  <div>
                    <div class="fw-bold text-dark lh-sm" style="font-size: 13px;">
                      {{ userName }}
                    </div>
                    <div class="text-muted" style="font-size: 11px;">
                      Connecté
                    </div>
                  </div>
                </div>
                <span class="badge bg-light text-muted border rounded-pill" style="font-size: 10px;">v{{ clientVersion }}</span>
              </div>

              <!-- Genealogy & Management Section -->
              <div class="dropdown-section-title px-3 pt-1 pb-1 text-uppercase text-muted fw-bold">
                {{ $t('genealogy') }}
              </div>
              <div class="d-flex flex-column gap-1">
                <a class="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 menu-entry" href="#" @click.prevent="openModal('persons')">
                  <div class="menu-icon-wrap bg-primary-subtle text-primary me-2">
                    <i class="bi bi-people-fill" />
                  </div>
                  <span class="fw-medium text-dark">{{ $t('persons') }}</span>
                </a>

                <a class="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 menu-entry" href="#" @click.prevent="openModal('relatives')">
                  <div class="menu-icon-wrap bg-info-subtle text-info me-2">
                    <i class="bi bi-diagram-3-fill" />
                  </div>
                  <span class="fw-medium text-dark">{{ $t('relatives') }}</span>
                </a>

                <a class="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 menu-entry" href="#" @click.prevent="openModal('events')">
                  <div class="menu-icon-wrap bg-success-subtle text-success me-2">
                    <i class="bi bi-calendar-check-fill" />
                  </div>
                  <span class="fw-medium text-dark">{{ $t('events') }}</span>
                </a>

                <a class="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 menu-entry" href="#" @click.prevent="openModal('activities')">
                  <div class="menu-icon-wrap bg-secondary-subtle text-secondary me-2">
                    <i class="bi bi-clock-history" />
                  </div>
                  <span class="fw-medium text-dark">{{ $t('activity-logs') }}</span>
                </a>
              </div>

              <!-- Timeline View Range Section -->
              <div class="dropdown-divider my-2" />
              <div class="dropdown-section-title px-3 pt-1 pb-1 text-uppercase text-muted fw-bold">
                {{ $t('timeline') }}
              </div>
              <div class="px-3 py-1">
                <div class="row g-2 align-items-center">
                  <div class="col-6">
                    <label for="startViewYear" class="form-label text-muted small fw-semibold mb-1" style="font-size: 11px;">
                      {{ $t('startYear') }}
                    </label>
                    <select id="startViewYear" v-model="startViewYear" class="form-select form-select-sm">
                      <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label for="stopViewYear" class="form-label text-muted small fw-semibold mb-1" style="font-size: 11px;">
                      {{ $t('endYear') }}
                    </label>
                    <select id="stopViewYear" v-model="stopViewYear" class="form-select form-select-sm">
                      <option v-for="year in filteredEndYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Logout Section -->
              <div class="dropdown-divider my-2" />
              <a class="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 text-danger logout-entry" href="#" @click.prevent="logout">
                <div class="menu-icon-wrap bg-danger-subtle text-danger me-2">
                  <i class="bi bi-box-arrow-right" />
                </div>
                <span class="fw-semibold">{{ $t('logout') }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading Modal -->
    <LoadingModal v-if="loading && isAuthenticated" />
        
    <!-- Main content area -->
    <router-view :min-year="minYear" :max-year="maxYear" :start-view-year="startViewYear" :stop-view-year="stopViewYear" @data-loaded="onDataLoaded" />

    <!-- Modals -->
    <ModalActivities v-if="isAuthenticated" ref="modalActivities" @data-loaded="onDataLoaded" />
    <ModalPersons v-if="isAuthenticated" ref="modalPersons" @data-loaded="onDataLoaded" />
    <ModalRelatives v-if="isAuthenticated" ref="modalRelatives" @data-loaded="onDataLoaded" />
    <ModalEvents v-if="isAuthenticated" ref="modalEvents" @data-loaded="onDataLoaded" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { Modal, Dropdown } from 'bootstrap';

import LoadingModal from './components/ModalLoading.vue';
import ModalActivities from './components/ModalActivities.vue'
import ModalPersons from './components/ModalPersons.vue'
import ModalRelatives from './components/ModalRelatives.vue'
import ModalEvents from './components/ModalEvents.vue'

import config from './config'

export default {
   components: {
    LoadingModal,
    ModalActivities,
    ModalPersons,
    ModalRelatives,
    ModalEvents
   },
  provide() {
    return {
      openModalWithContext: this.openModalWithContext
    }
  },
  data () {
    const activeLang = (typeof localStorage !== 'undefined' && localStorage.getItem('ft_language')) || config.language || 'en'
    return {
      loading: true,
      selectedLanguage: activeLang,
      startViewYear: config.startViewYear || 1800,
      stopViewYear: config.endViewYear || 2050,
      minYear: config.minYear || 1800,
      maxYear: config.maxYear || 2050,
      stepYear: config.stepYear || 25,
      clientVersion: import.meta.env.VITE_APP_VERSION,
      pendingContext: null
    }
  },
  created () {
    const activeLang = (typeof localStorage !== 'undefined' && localStorage.getItem('ft_language')) || config.language || this.$i18n?.locale || 'en'
    this.selectedLanguage = activeLang
    if (this.$i18n) {
      this.$i18n.locale = activeLang
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'userName']),

    // Generate an array of years from minYear to maxYear, in steps of stepYear
    availableYears() {
      const years = [];
      const step = this.stepYear || 25;
      for (let year = this.minYear; year <= this.maxYear; year += step) {
        years.push(year);
      }
      if (years.length > 0 && years[years.length - 1] < this.maxYear) {
        years.push(this.maxYear);
      }
      return years;
    },

    // Filter the availableYears to only include years greater than to startViewYear
    filteredEndYears() {
      return this.availableYears.filter(year => year > this.startViewYear);
    }
  },
  watch: {
    // Automatically adjust stopViewYear if it becomes invalid
    startViewYear(newStartYear) {
      if (this.stopViewYear < newStartYear) {
        this.stopViewYear = this.maxYear;
      }
    }
  },
  methods: {
    ...mapMutations(['removeToken']),
    setLanguage (language) {
      this.selectedLanguage = language
      if (this.$i18n) {
        this.$i18n.locale = language
      }
      try {
        localStorage.setItem('ft_language', language)
      } catch {
        // ignore
      }
    },
    async openModal(modalId) {
      this.closeMenu();
      this.loading = true;
      try {
        if (modalId === 'persons') {
          await this.$refs.modalPersons.fetchInitialData();
        }
        if (modalId === 'activities') {
          await this.$refs.modalActivities.fetchInitialData();
        }
        if (modalId === 'relatives') {
          await this.$refs.modalRelatives.fetchInitialData();
        }
        if (modalId === 'events') {
          await this.$refs.modalEvents.fetchInitialData();
        }
      } catch (err) {
        console.error('Failed to fetch data:', err.message);
        this.loading = false;
      } 
    },
    async openModalWithContext(modalId, options = {}) {
      this.closeMenu();
      this.pendingContext = { modalId, options };
      this.loading = true;
      try {
        if (modalId === 'persons') {
          await this.$refs.modalPersons.fetchInitialData();
        } else if (modalId === 'relatives') {
          await this.$refs.modalRelatives.fetchInitialData();
        } else if (modalId === 'events') {
          await this.$refs.modalEvents.fetchInitialData();
        } else if (modalId === 'activities') {
          await this.$refs.modalActivities.fetchInitialData();
        }
      } catch (err) {
        console.error('Failed to open modal with context:', err.message);
        this.pendingContext = null;
        this.loading = false;
      }
    },
    onDataLoaded(modalId, bounds) {
      this.loading = false;

      if (modalId === 'timeline') {
        if (bounds) {
          if (typeof bounds.minYear === 'number') this.minYear = bounds.minYear;
          if (typeof bounds.maxYear === 'number') this.maxYear = bounds.maxYear;
          if (typeof bounds.startViewYear === 'number') this.startViewYear = bounds.startViewYear;
          if (typeof bounds.stopViewYear === 'number') this.stopViewYear = bounds.stopViewYear;
        }
      } else {
        if (this.pendingContext && this.pendingContext.modalId === modalId) {
          const options = this.pendingContext.options || {};
          this.pendingContext = null;

          if (modalId === 'persons' && options.person) {
            this.$refs.modalPersons.startEditPersonById(options.person.id);
          } else if (modalId === 'events' && options.person) {
            this.$refs.modalEvents.selectPersonById(options.person.id);
            if (options.eventId) {
              this.$refs.modalEvents.startEditEventById(options.eventId);
            } else if (options.action === 'add') {
              this.$refs.modalEvents.startAddEvent();
            }
          } else if (modalId === 'relatives' && options.person) {
            if (options.action === 'add') {
              this.$refs.modalRelatives.startAddForPerson(options.person);
            } else {
              this.$refs.modalRelatives.filterForPerson(options.person);
            }
          }
        }

        const modalEl = document.getElementById(`${modalId}Modal`);
        if (modalEl) {
          const contentModal = Modal.getInstance(modalEl) || new Modal(modalEl);
          contentModal.show();
        }
      }
    },
    closeMenu(){
      const dropdownToggle = document.getElementById('userMenuDropdown');
      if (dropdownToggle) {
        const bsDropdown = Dropdown.getInstance(dropdownToggle);
        if (bsDropdown) {
          bsDropdown.hide();
        }
      }
    },
    async logout() {
      try {
        this.removeToken();
        localStorage.removeItem('refreshToken');

        // close menu
        this.closeMenu()

        // Redirect to login page
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --ft-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  font-family: var(--ft-font);
  color: #1e293b;
  background-color: #f8fafc;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--ft-font);
}

/* App Navbar */
.app-navbar {
  height: 56px;
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  z-index: 1030;
  flex-wrap: nowrap !important;
}

.app-navbar > .container-fluid {
  flex-wrap: nowrap !important;
}

.brand-title {
  font-size: 16px;
  letter-spacing: -0.02em;
  color: #0f172a;
}

#top-navbar-timeline-controls {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#top-navbar-timeline-controls::-webkit-scrollbar {
  display: none;
}

/* User Capsule & Controls */
.shadow-xs {
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.user-profile-btn {
  border-color: #e2e8f0 !important;
  transition: all 0.15s ease;
  height: 38px;
}

.user-profile-btn:hover {
  background-color: #f8fafc !important;
  border-color: #cbd5e1 !important;
}

.user-profile-btn:focus, .user-profile-btn:active, .user-profile-btn.show {
  border-color: #94a3b8 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
  background-color: #ffffff !important;
}

.user-avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.user-name-label {
  font-size: 13px;
  color: #0f172a;
}

.user-role-label {
  font-size: 10px;
}

/* User Dropdown Panel */
.user-dropdown-panel {
  width: 290px;
  border-radius: 14px !important;
  box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.16), 0 8px 16px -6px rgba(15, 23, 42, 0.08) !important;
  border: 1px solid #e2e8f0 !important;
}

.user-dropdown-header {
  background: #f8fafc;
  border-radius: 10px;
  border-color: #e2e8f0 !important;
}

.dropdown-section-title {
  font-size: 10px;
  letter-spacing: 0.05em;
  color: #94a3b8 !important;
}

.menu-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.bg-primary-subtle { background-color: #eff6ff !important; }
.bg-info-subtle { background-color: #f0fdfa !important; }
.bg-success-subtle { background-color: #f0fdf4 !important; }
.bg-secondary-subtle { background-color: #f8fafc !important; border: 1px solid #e2e8f0; }
.bg-danger-subtle { background-color: #fef2f2 !important; }

.menu-entry {
  transition: all 0.15s ease;
}

.menu-entry:hover {
  background-color: #f8fafc !important;
  transform: translateX(2px);
}

.logout-entry {
  transition: all 0.15s ease;
}

.logout-entry:hover {
  background-color: #fef2f2 !important;
}

.lang-selector-btn {
  height: 38px;
  border-color: #e2e8f0 !important;
  color: #475569;
  transition: all 0.15s ease;
}

.lang-selector-btn:hover {
  background-color: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a;
}

/* Global Modals Aesthetic */
.modal-content {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 10px 18px -6px rgba(15, 23, 42, 0.08) !important;
  overflow: hidden;
  background-color: #ffffff;
}

.modal-header {
  border-bottom: 1px solid #f1f5f9 !important;
  padding: 16px 24px !important;
  background-color: #ffffff;
}

.modal-header .btn-close {
  opacity: 0.6;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.modal-header .btn-close:hover {
  opacity: 1;
  transform: scale(1.08);
}

.modal-body {
  padding: 24px !important;
  color: #334155;
}

.modal-footer {
  border-top: 1px solid #f1f5f9 !important;
  padding: 14px 24px !important;
  background-color: #f8fafc;
}

/* Global Form Elements */
.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.35rem;
  letter-spacing: 0.02em;
}

.form-control, .form-select {
  border-radius: 9px;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 0.85rem;
  font-size: 0.9rem;
  color: #1e293b;
  background-color: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
  background-color: #ffffff !important;
}

.input-group-text {
  border-radius: 9px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 0.9rem;
}

/* Proper Input Group corner handling: no inner rounded borders */
.input-group > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(.valid-feedback):not(.invalid-tooltip):not(.invalid-feedback) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.input-group > :not(:last-child):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.input-group > :not(:first-child):not(:last-child) {
  border-radius: 0 !important;
}

/* Seamless search input groups across all modals */
.search-input-group {
  border-radius: 9px !important;
  overflow: hidden !important;
  border: 1px solid #cbd5e1 !important;
  background-color: #ffffff !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input-group:focus-within {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.search-input-group .input-group-text {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding-left: 0.85rem !important;
  padding-right: 0.35rem !important;
}

.search-input-group .form-control {
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  padding-left: 0.35rem !important;
}

/* Global Modern Tables */
.table {
  --bs-table-bg: transparent;
  vertical-align: middle;
  border-color: #f1f5f9;
}

.table thead th {
  background-color: #f8fafc !important;
  color: #64748b !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  padding: 11px 16px !important;
  border-bottom: 1px solid #e2e8f0 !important;
  white-space: nowrap;
}

.table tbody td {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #1e293b;
  font-size: 0.9rem;
}

.table tbody tr:hover td {
  background-color: #f8fafc !important;
}

/* Action Icon Buttons */
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-action-icon:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: translateY(-1px);
}

.btn-action-icon.text-primary:hover {
  background: #eff6ff !important;
  border-color: #bfdbfe !important;
  color: #2563eb !important;
}

.btn-action-icon.text-danger:hover {
  background: #fef2f2 !important;
  border-color: #fecaca !important;
  color: #dc2626 !important;
}

.btn-action-icon.text-info:hover {
  background: #f0fdfa !important;
  border-color: #99f6e4 !important;
  color: #0d9488 !important;
}

.btn-action-icon.text-warning:hover {
  background: #fffbeb !important;
  border-color: #fde68a !important;
  color: #d97706 !important;
}

/* Global Pagination */
.pagination {
  gap: 4px;
  margin-bottom: 0;
}

.pagination .page-item .page-link {
  border-radius: 8px !important;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 6px 12px;
  background-color: #ffffff;
  transition: all 0.15s ease;
}

.pagination .page-item:not(.disabled):hover .page-link {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.pagination .page-item.active .page-link {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.pagination .page-item.disabled .page-link {
  color: #cbd5e1;
  background-color: #f8fafc;
  border-color: #f1f5f9;
}

/* Global Dropdowns & Menus */
.dropdown-menu {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.05) !important;
  padding: 6px !important;
}

.dropdown-item {
  border-radius: 8px !important;
  padding: 7px 12px !important;
  font-size: 13px !important;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}

/* Global Buttons & Badges */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-primary {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.badge {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.badge.rounded-pill {
  padding-left: 0.65em;
  padding-right: 0.65em;
}

/* Global Alerts & Toasts */
.alert {
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid transparent;
}

.alert-danger {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fee2e2;
}

.alert-warning {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fef3c7;
}

.toast {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15) !important;
  background-color: #ffffff !important;
  overflow: hidden;
}
</style>
