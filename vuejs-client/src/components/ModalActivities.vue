<template>
  <div id="activitiesModal" class="modal fade" tabindex="-1" aria-labelledby="activitiesModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="activitiesModalLabel" class="modal-title">
            {{ $t('activity-logs') }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <div class="modal-body">
          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          
          <!-- Activities Table -->
          <div class="table-responsive">
            <table class="table table-hover bg-white mb-4">
              <thead>
                <tr>
                  <th scope="col">
                    #
                  </th>
                  <th>{{ $t('user') }}</th>
                  <th>{{ $t('timestamp') }}</th>
                  <th>{{ $t('details') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(activity, index) in paginatedActivities" :key="activity.id">
                  <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>{{ activity.username }}</td>
                  <td>{{ new Date(activity.timestamp).toLocaleString() }}</td>
                  <td>{{ formatDetails(activity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination and Controls -->
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
            <!-- Pagination -->
            <nav aria-label="Page navigation">
              <ul class="pagination mb-3 mb-sm-0">
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
            <div class="d-flex align-items-center mt-3 mt-sm-0">
              <label for="itemsPerPage" class="me-2 mb-0">{{ $t('items-per-page') }}</label>
              <select id="itemsPerPage" v-model="itemsPerPage" class="form-select d-inline-block w-auto">
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
import { fetchActivities } from '@/services/activtiesService.js'

export default {
  mixins: [fetchDataMixin],
  emits: ['data-loaded'],
  data() {
    return {
      activities: [],
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
        const [activities] = await Promise.all([
          fetchActivities(),
        ]);
        
        this.activities = activities;
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
    formatDetails(activity) {
      return `${this.$t("activity-"+activity.action_type)} ${this.$t("activity-"+activity.entity_type)}: ${activity.details}`;
    }
  }
}
</script>