<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div id="app">
    <!-- Header / Top bar -->
    <nav v-if="isAuthenticated" class="navbar navbar-dark bg-dark fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="/">
          <img src="/favicon.png" width="30" height="30" class="d-inline-block align-top" alt="">
          Family Timeline
        </a>

        <button v-if="isAuthenticated" class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar">
          <span class="navbar-toggler-icon" />
        </button>
        <div v-if="isAuthenticated" id="offcanvasDarkNavbar" class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" aria-labelledby="offcanvasDarkNavbarLabel">
          <div class="offcanvas-header">
            <h5 id="offcanvasDarkNavbarLabel" class="offcanvas-title">
              {{ $t('menu') }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close" />
          </div>
          <div class="offcanvas-body">
            <div v-if="userName" class="text-light mb-3">
              <strong>{{ userName }}</strong>
            </div>
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <!-- Activity -->
              <li class="nav-item">
                <a class="nav-link" href="#" @click.prevent="openModal('activity')">
                  <i class="bi bi-calendar-event-fill me-2" /> {{ $t('activity') }}
                </a>
              </li>

              <!-- Genealogy -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-gear-fill me-2" /> {{ $t('genealogy') }}
                </a>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="openModal('persons')">
                      <i class="bi bi-people-fill me-2" /> {{ $t('persons') }}
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="openModal('relatives')">
                      <i class="bi bi-people me-2" /> {{ $t('relatives') }}
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="openModal('events')">
                      <i class="bi bi-calendar3 me-2" /> {{ $t('events') }}
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="openModal('attachments')">
                      <i class="bi bi-paperclip me-2" /> {{ $t('attachments') }}
                    </a>
                  </li>
                </ul>
              </li>

              <!-- Timeline -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-clock-history me-2" /> {{ $t('timeline') }}
                </a>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li>
                    <label for="startViewYear" class="dropdown-item text-light">
                      {{ $t('startYear') }}
                      <select id="startViewYear" v-model="startViewYear" class="form-select mt-1">
                        <option v-for="year in availableYears" :key="year" :value="year">
                          {{ year }}
                        </option>
                      </select>
                    </label>
                  </li>
                  <li>
                    <label for="stopViewYear" class="dropdown-item text-light mt-2">
                      {{ $t('endYear') }}
                      <select id="stopViewYear" v-model="stopViewYear" class="form-select mt-1">
                        <option v-for="year in filteredEndYears" :key="year" :value="year">
                          {{ year }}
                        </option>
                      </select>
                    </label>
                  </li>
                </ul>
              </li>

              <!-- Language -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-globe me-2" /> {{ $t('language') }}
                </a>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="setLanguage('en')">
                      {{ $t('english') }}
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="setLanguage('fr')">
                      {{ $t('french') }}
                    </a>
                  </li>
                </ul>
              </li>

              <!-- Logout -->
              <li class="nav-item">
                <a class="nav-link" href="#" @click="logout">
                  <i class="bi bi-box-arrow-right me-2" /> {{ $t('logout') }}
                </a>
              </li>
            </ul>

            <!-- Adding the client version -->
            <div class="mt-4 text-end">
              <span class="text-ligth">v{{ clientVersion }}</span>
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
    <ModalActivity v-if="isAuthenticated" ref="modalActivity" @data-loaded="onDataLoaded" />
    <ModalPersons v-if="isAuthenticated" ref="modalPersons" @data-loaded="onDataLoaded" />
    <ModalRelatives v-if="isAuthenticated" ref="modalRelatives" @data-loaded="onDataLoaded" />
    <ModalEvents v-if="isAuthenticated" ref="modalEvents" @data-loaded="onDataLoaded" />
    <ModalAttachments v-if="isAuthenticated" ref="modalAttachments" @data-loaded="onDataLoaded" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { Offcanvas, Modal } from 'bootstrap'

import LoadingModal from './components/ModalLoading.vue';
import ModalActivity from './components/ModalActivity.vue'
import ModalPersons from './components/ModalPersons.vue'
import ModalRelatives from './components/ModalRelatives.vue'
import ModalEvents from './components/ModalEvents.vue'
import ModalAttachments from './components/ModalAttachments.vue'

import config from './config'

export default {
   components: {
    LoadingModal,
    ModalActivity,
    ModalPersons,
    ModalRelatives,
    ModalEvents,
    ModalAttachments
   },
  data () {
    return {
      loading: true,
      selectedLanguage: 'en',
      startViewYear: config.startViewYear || 1800,
      stopViewYear: config.endViewYear || 2050,
      minYear: config.minYear || 1800,
      maxYear: config.maxYear || 2050,
      clientVersion: import.meta.env.VITE_APP_VERSION
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'userName']),

    // Generate an array of years from minYear to maxYear, in steps of 50 years
    availableYears() {
      const years = [];
      for (let year = this.minYear; year <= this.maxYear; year += 50) {
        years.push(year);
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
      this.$i18n.locale = this.selectedLanguage
    },
    async openModal(modalId) {
      this.closeMenu();
      this.loading = true;
      try {
        if (modalId === 'persons') {
          await this.$refs.modalPersons.fetchInitialData();
        }
      } catch (err) {
        console.error('Failed to fetch data:', err.message);
        this.loading = false;
      } 
    },
    onDataLoaded(modalId) {
      this.loading = false;

      if (modalId !== 'timeline') {
        const contentModal = new Modal(document.getElementById(`${modalId}Modal`));
        contentModal.show();
      }
    },
    closeMenu(){
      // close menu
      const offcanvasElement = document.getElementById('offcanvasDarkNavbar')
      const bsOffcanvas = Offcanvas.getInstance(offcanvasElement)
      if (bsOffcanvas) {
        bsOffcanvas.hide()
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
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
