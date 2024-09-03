<template>
  <div id="relativesModal" class="modal fade" tabindex="-1" aria-labelledby="relativesModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="relativesModalLabel" class="modal-title">
            {{ $t('manage-relatives') }}
            <span v-if="relativeToDelete">
              - {{ $t('delete') }}
            </span>
            <span v-if="isAddingRelative">
              - {{ $t('add') }}
            </span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>

        <div class="modal-body">
          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <!-- Delete confirmation -->
          <div v-if="relativeToDelete">
            <p>{{ $t('delete-warning-relative') }} <strong>{{ getPersonName(relativeToDelete.related_person_id) }}</strong> {{ $t("relative-"+relativeToDelete.relation_type) }} <strong>{{ getPersonName(relativeToDelete.person_id) }}</strong> ?</p>
          </div>

          <!-- Add Relative Form -->
          <div v-else-if="isAddingRelative">
            <form @submit.prevent="confirmAdd">
              <div class="mb-3">
                <label for="relatedPersonId" class="form-label">{{ $t('select-related-person') }}</label>
                <select id="relatedPersonId" v-model="newRelative.related_person_id" class="form-select" required>
                  <option v-for="person in persons" :key="person.id" :value="person.id">
                    {{ getPersonName(person.id) }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="relationType" class="form-label">{{ $t('select-type-relation') }}</label>
                <select id="relationType" v-model="newRelative.relation_type" class="form-select" required>
                  <option value="father">
                    {{ $t("relative-"+'father') }}
                  </option>
                  <option value="mother">
                    {{ $t("relative-"+'mother') }}
                  </option>
                  <option value="child">
                    {{ $t("relative-"+'child') }}
                  </option>
                  <option value="sister">
                    {{ $t("relative-"+'sister') }}
                  </option>
                  <option value="brother">
                    {{ $t("relative-"+'brother') }}
                  </option>
                  <option value="spouse">
                    {{ $t("relative-"+'spouse') }}
                  </option>
                  <option value="ex-spouse">
                    {{ $t("relative-"+'ex-spouse') }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="personId" class="form-label">{{ $t('select-primary-person') }}</label>
                <select id="personId" v-model="newRelative.person_id" class="form-select" required>
                  <option v-for="person in persons" :key="person.id" :value="person.id">
                    {{ getPersonName(person.id) }}
                  </option>
                </select>
              </div>
            </form>
          </div>

          <!-- Relatives List -->
          <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <p class="text-muted mb-0">
                {{ $t('crud-warning') }}
              </p>
              <button class="btn btn-primary d-flex align-items-center" type="button" @click="startAddRelative">
                <span>{{ $t('add') }}</span>
              </button>
            </div>

            <div class="table-responsive">
              <div class="d-flex align-items-center mb-2">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-search" /></span>
                  <input v-model="searchQuery" type="text" class="form-control" :placeholder="$t('search-by-name')">
                </div>
              </div>
              <table class="table table-hover bg-white mb-4">
                <tbody>
                  <tr v-for="relative in paginatedRelatives" :key="relative.id">
                    <td>{{ relative.id }}</td>
                    <td>{{ getPersonName(relative.related_person_id) }}</td>
                    <td>{{ $t("relative-"+relative.relation_type) }}</td>
                    <td>{{ getPersonName(relative.person_id) }}</td>
                    <td>
                      <a href="#" class="text-dark" @click.prevent="deleteRelative(relative)">
                        <i class="bi bi-trash-fill" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
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

        <div v-if="relativeToDelete || isAddingRelative" class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelAction">
            {{ $t('cancel') }}
          </button>
          <button v-if="relativeToDelete" type="button" class="btn btn-danger" @click="confirmDelete">
            {{ $t('delete') }}
          </button>
          <button v-if="isAddingRelative" type="submit" class="btn btn-primary" @click="confirmAdd">
            {{ $t('add') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import fetchDataMixin from '@/mixins/fetchDataMixin';
import { fetchRelatives, deleteRelative, addRelative } from '@/services/relativesService.js';
import { fetchPersons } from '@/services/personsService.js'; 

export default {
  mixins: [fetchDataMixin],
  emits: ['data-loaded'],
  data() {
    return {
      relatives: [],
      persons: [],
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: '',
      relativeToDelete: null,
      isAddingRelative: false,
      newRelative: {
        person_id: null,
        related_person_id: null,
        relation_type: ''
      },
      error: null
    };
  },
  computed: {
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
    filteredRelatives() {
      return this.relatives.filter(relative => {
        const personName = this.getPersonName(relative.related_person_id);

        const searchQueryLower = this.searchQuery.toLowerCase();
        return personName.toLowerCase().includes(searchQueryLower);
      });
    },
    paginatedRelatives() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRelatives.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRelatives.length / this.itemsPerPage);
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1; 
    }
  },
  mounted() {
    const modalElement = document.getElementById('relativesModal');
    modalElement.addEventListener('hide.bs.modal', this.handleModalClose);
  },
  unmounted() {
    const modalElement = document.getElementById('relativesModal');
    if (modalElement) {
      modalElement.removeEventListener('hide.bs.modal', this.handleModalClose);
    }
  },
  methods: {
    ...mapActions(['triggerTimelineReload']),
    handleModalClose() {
      this.triggerTimelineReload();
    },
    async fetchInitialData(emitSignal=true) {
      try {
        const [relatives, persons] = await Promise.all([
          fetchRelatives(),
          fetchPersons() 
        ]);
        this.relatives = relatives;
        this.persons = persons; 
      } catch (err) {
        console.error('Failed to fetch data:', err.message);
        this.error = 'Failed to load data';
      }
      if (emitSignal) {
        this.$emit('data-loaded', 'relatives'); 
      }
    },
    async deleteRelative(relative) {
      this.relativeToDelete = relative;
    },
    async confirmDelete() {
      try {
        await deleteRelative(this.relativeToDelete.id);
        await this.fetchInitialData(false);
        this.cancelAction();
      } catch (error) {
        this.error = error.message || 'An error occurred';
      }
    },
    startAddRelative() {
      this.isAddingRelative = true;
      this.newRelative = {
        person_id: null,
        related_person_id: null,
        relation_type: ''
      };
    },
    async confirmAdd() {
      try {
        await addRelative(this.newRelative);
        await this.fetchInitialData(false);
        this.cancelAction()
      } catch (error) {
        this.error = error.message || 'An error occurred';
      }
    },
    cancelAction() {
      this.isAddingRelative = false;
      this.relativeToDelete = null;
      this.error = null;
      this.newRelative = { person_id: null, related_person_id: null, relation_type: '' };
    },
    getPersonName(personId) {
      const person = this.persons.find(p => p.id === personId);
      return person ? `${person.first_name} ${person.last_name}` : personId; // Combine first_name et last_name
    },
    changePage(page) {
      this.currentPage = page;
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    }
  },
};
</script>
