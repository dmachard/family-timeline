<template>
  <div id="app">
    <!-- Header / Top bar -->
    <nav class="navbar navbar-dark bg-dark fixed-top">
      <div class="container-fluid">
        <a
          class="navbar-brand fw-bold"
          href="/"
        >
          <img
            src="/favicon.png"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt=""
          >
          Family Timeline
        </a>

        <button
          v-if="isAuthenticated"
          class="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasDarkNavbar"
          aria-controls="offcanvasDarkNavbar"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div
          v-if="isAuthenticated"
          id="offcanvasDarkNavbar"
          class="offcanvas offcanvas-end text-bg-dark"
          tabindex="-1"
          aria-labelledby="offcanvasDarkNavbarLabel"
        >
          <div class="offcanvas-header">
            <h5
              id="offcanvasDarkNavbarLabel"
              class="offcanvas-title"
            >
              {{ $t('menu') }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
          <div class="offcanvas-body">
            <div
              v-if="userName"
              class="text-light mb-3"
            >
              <strong>{{ userName }}</strong>
            </div>
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li class="nav-item">
                <a
                  class="nav-link"
                  href="#"
                  @click="openModal('activity')"
                >{{ $t('activity') }}</a>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >{{ $t('manage') }}</a>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openModal('persons')"
                    >{{ $t('persons') }}</a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openModal('relatives')"
                    >{{ $t('relatives') }}</a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openModal('events')"
                    >{{ $t('events') }}</a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openModal('attachments')"
                    >{{ $t('attachments') }}</a>
                  </li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >{{ $t('language') }}</a>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="setLanguage('en')"
                    >{{ $t('english') }}</a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="setLanguage('fr')"
                    >{{ $t('french') }}</a>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  href="#"
                  @click="logout"
                >
                  {{ $t('logout') }}
                </a>
              </li>
            </ul>

            <!-- Dropdowns for years -->
            <div class="mt-3">
              <label
                for="startViewYear"
                class="form-label text-ligth"
              >
                {{ $t('startYear') }}
              </label>
              <select
                id="startViewYear"
                v-model="startViewYear"
                class="form-select"
              >
                <option
                  v-for="year in availableYears"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </option>
              </select>

              <label
                for="stopViewYear"
                class="form-label text-light mt-3"
              >
                {{ $t('endYear') }}
              </label>
              <select
                id="stopViewYear"
                v-model="stopViewYear"
                class="form-select"
              >
                <option
                  v-for="year in filteredEndYears"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </option>
              </select>
            </div>


            <!-- Adding the client version -->
            <div class="mt-4 text-end">
              <span class="text-ligth">v{{ clientVersion }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content area -->
    <router-view 
      :min-year="minYear"
      :max-year="maxYear"
      :start-view-year="startViewYear"
      :stop-view-year="stopViewYear"
    />
    
    <!-- Main content area
    <TimelineD3Chart 
      v-if="isAuthenticated"
      :min-year="minYear"
      :max-year="maxYear"
      :start-view-year="startViewYear"
      :stop-view-year="stopViewYear"
    />
     -->

    <!-- Modals 
    <ModalActivity 
      v-if="isAuthenticated"
    />
    <ModalPersons 
      v-if="isAuthenticated"
    />
    <ModalRelatives 
      v-if="isAuthenticated"
    />
    <ModalEvents 
      v-if="isAuthenticated"
    />
    <ModalAttachments
      v-if="isAuthenticated"
    />
    -->
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { Offcanvas, Modal } from 'bootstrap'

// import ModalActivity from './components/ModalActivity.vue'
// import ModalPersons from './components/ModalPersons.vue'
// import ModalRelatives from './components/ModalRelatives.vue'
// import ModalEvents from './components/ModalEvents.vue'
// import ModalAttachments from './components/ModalAttachments.vue'

// import TimelineD3Chart from './components/TimelineD3Chart.vue'

import config from './config'

export default {
  // components: {
  //   TimelineD3Chart,
  //   ModalActivity,
  //   ModalPersons,
  //   ModalRelatives,
  //   ModalEvents,
  //   ModalAttachments
  // },
  data () {
    return {
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
    openModal (modalId) {
      const modal = new Modal(document.getElementById(`${modalId}Modal`))
      modal.show()

      // close menu
      this.closeMenu()
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
