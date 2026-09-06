<template>
  <div id="activitiesModal" class="modal fade" tabindex="-1" aria-labelledby="activitiesModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header d-flex align-items-center justify-content-between px-4 py-3">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="bi bi-clock-history fs-5" />
            </div>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <h5 id="activitiesModalLabel" class="modal-title mb-0 fw-bold text-dark">
                {{ $t('activity-logs') }}
              </h5>
              <span v-if="activities && activities.length" class="badge bg-light text-secondary border rounded-pill fw-normal">
                {{ activities.length }}
              </span>
            </div>
          </div>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <div class="modal-body p-4">
          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger mb-4" role="alert">
            <i class="bi bi-exclamation-circle me-2" />{{ error }}
          </div>
          
          <!-- Activities Table -->
          <div class="table-responsive border rounded-3 overflow-hidden shadow-xs mb-3">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col" style="width: 50px;">
                    #
                  </th>
                  <th>{{ $t('user') }}</th>
                  <th>{{ $t('timestamp') }}</th>
                  <th>{{ $t('who') }}</th>
                  <th>{{ $t('what') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(activity, index) in paginatedActivities" :key="activity.id">
                  <td class="text-muted small">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>
                    <span class="badge bg-light text-dark border px-2 py-1">
                      <i class="bi bi-person me-1 text-muted" />{{ activity.username }}
                    </span>
                  </td>
                  <td class="text-muted small" style="white-space: nowrap;">
                    <i class="bi bi-clock me-1 text-muted" />{{ new Date(activity.timestamp).toLocaleString() }}
                  </td>
                  <td class="fw-semibold text-dark">{{ formatWho(activity.person_id) }}</td>
                  <td>
                    <span class="text-secondary small">{{ formatWhat(activity) }}</span>
                  </td>
                </tr>
                <tr v-if="!paginatedActivities.length">
                  <td colspan="5" class="text-center py-4 text-muted">
                    {{ $t('no-result') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination and Controls -->
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mb-2 pt-1">
            <!-- Pagination -->
            <nav aria-label="Page navigation">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" aria-label="Previous" @click.prevent="previousPage">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li
                  v-for="(page, index) in visiblePages" :key="index" class="page-item" 
                  :class="{ active: currentPage === page, disabled: page === '...' }"
                >
                  <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(page)">
                    {{ page }}
                  </a>
                  <span v-else class="page-link">...</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" aria-label="Next" @click.prevent="nextPage">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Items Per Page -->
            <div class="d-flex align-items-center">
              <label for="itemsPerPage" class="me-2 mb-0 small text-muted">{{ $t('items-per-page') }}</label>
              <select id="itemsPerPage" v-model="itemsPerPage" class="form-select form-select-sm d-inline-block w-auto">
                <option v-for="size in [5, 10, 15, 20]" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fetchDataMixin from '@/mixins/fetchDataMixin'
import { fetchActivities } from '@/services/activitiesService.js'
import { fetchPersons } from '@/services/personsService.js'

export default {
  mixins: [fetchDataMixin],
  emits: ['data-loaded'],
  data() {
    return {
      activities: [],
      persons: [],
      currentPage: 1,
      itemsPerPage: 10,
      error: null,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.activities.length / this.itemsPerPage);
    },
    visiblePages() {
      const maxVisiblePages = 5;
      const pages = [];

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(2, this.currentPage - 1);
        const end = Math.min(this.totalPages - 1, this.currentPage + 1);

        pages.push(1);
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        if (end < this.totalPages - 1) pages.push('...');
        pages.push(this.totalPages);
      }

      return pages;
    },
    paginatedActivities() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.activities.slice(start, end);
    }
  },
  methods: {
    async fetchInitialData() {
      try {
        // Use Promise.all to fetch data concurrently
        const [activities, persons] = await Promise.all([
          fetchActivities(),
          fetchPersons(),
        ]);
        
        this.activities = activities;
        this.persons = persons;
      } catch (err) {
        console.error('Failed to fetch data:', err.message);
        this.error = 'Failed to load initial data';
      }
      this.$emit('data-loaded', 'activities'); 
    },
    changePage(page) {
      this.currentPage = page;
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    formatWhat(activity) {
      return `${this.$t("activity-"+activity.action_type)} ${this.$t("activity-"+activity.entity_type)}`;
    },
    formatWho(personId) {
      return this.getPersonName(personId);
    },
    getPersonName(personId) {
      const person = this.persons.find(p => p.id === personId);
      return person ? `${person.first_name} ${person.last_name}` : '';
    },
  }
}
</script>