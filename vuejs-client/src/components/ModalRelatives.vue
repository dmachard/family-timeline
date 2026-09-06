<template>
  <div id="relativesModal" class="modal fade" tabindex="-1" aria-labelledby="relativesModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header d-flex align-items-center justify-content-between px-4 py-3">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="bi bi-diagram-3-fill fs-5" />
            </div>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <h5 id="relativesModalLabel" class="modal-title mb-0 fw-bold text-dark">
                {{ $t('manage-relatives') }}
              </h5>
              <span v-if="relativeToDelete" class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill fw-semibold">
                {{ $t('delete') }}
              </span>
              <span v-if="isAddingRelative" class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill fw-semibold">
                {{ $t('add') }}
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

          <!-- Delete confirmation -->
          <div v-if="relativeToDelete" class="text-center py-4">
            <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3" style="width: 56px; height: 56px;">
              <i class="bi bi-exclamation-triangle fs-3" />
            </div>
            <h5 class="fw-bold text-dark mb-2">
              {{ $t('delete') }}
            </h5>
            <p class="text-muted mb-0">
              {{ $t('delete-warning-relative') }} <strong class="text-dark">{{ getPersonName(relativeToDelete.related_person_id) }}</strong> {{ $t("relative-"+relativeToDelete.relation_type) }} <strong class="text-dark">{{ getPersonName(relativeToDelete.person_id) }}</strong> ?
            </p>
          </div>

          <!-- Add Relative Form -->
          <div v-else-if="isAddingRelative">
            <form class="needs-validation was-validated" @submit.prevent="confirmAdd">
              <!-- Related Person Selection -->
              <div class="mb-3">
                <label for="relatedPersonInput" class="form-label">{{ $t('select-related-person') }}</label>
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person-fill" /></span>
                      <input
                        id="relatedPersonInput"
                        v-model="relatedPersonInput"
                        class="form-control"
                        autocomplete="off"
                        required
                        :placeholder="$t('search-by-name')"
                        @input="filterRelativePersons"
                      >
                    </div>
                    <div class="invalid-feedback">
                      {{ $t('select-related-person') }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="list-group list-group-flush scrollable-list border rounded-3 shadow-xs">
                      <div v-if="filteredPersons.length === 0" class="list-group-item text-muted small py-2">
                        {{ $t('no-result') }}
                      </div>
                      <a
                        v-for="person in filteredPersons"
                        :key="person.id"
                        href="#"
                        class="list-group-item list-group-item-action py-2 small"
                        @mousedown="selectRelatedPerson(person)"
                      >
                        <i class="bi bi-person me-1 text-primary" /><strong>{{ getPersonName(person.id) }}</strong>
                        <span class="text-muted ms-1">({{ formatDate(person.birth_date) }})</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Relation Type Selection -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="relationType" class="form-label">{{ $t('relation-type') || 'Relation' }}</label>
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
                  <div class="invalid-feedback">
                    {{ $t('select-type-relation') }}
                  </div>
                </div>
              </div>

              <!-- Autocomplete for Primary Person -->
              <div class="mb-3">
                <label for="primaryPersonInput" class="form-label">{{ $t('select-primary-person') }}</label>
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person-check-fill" /></span>
                      <input
                        id="primaryPersonInput"
                        v-model="primaryPersonInput"
                        class="form-control"
                        autocomplete="off"
                        required
                        :placeholder="$t('search-by-name')"
                        @input="filterPrimaryPersons"
                      >
                    </div>
                    <div class="invalid-feedback">
                      {{ $t('select-primary-person') }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="list-group list-group-flush scrollable-list border rounded-3 shadow-xs">
                      <div v-if="filteredPrimaryPersons.length === 0" class="list-group-item text-muted small py-2">
                        {{ $t('no-result') }}
                      </div>
                      <a
                        v-for="person in filteredPrimaryPersons"
                        :key="person.id"
                        class="list-group-item list-group-item-action py-2 small"
                        href="#"
                        @mousedown="selectPrimaryPerson(person)"
                      >
                        <i class="bi bi-person me-1 text-primary" /><strong>{{ getPersonName(person.id) }}</strong>
                        <span class="text-muted ms-1">({{ formatDate(person.birth_date) }})</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Relatives List -->
          <div v-else>
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <p class="text-muted small mb-0">
                {{ $t('crud-warning') }}
              </p>
              <button class="btn btn-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-1 align-self-start align-self-sm-auto" type="button" @click="startAddRelative">
                <i class="bi bi-plus-lg" />
                <span>{{ $t('add') }}</span>
              </button>
            </div>

            <!-- Search Input -->
            <div class="mb-3">
              <div class="input-group search-input-group">
                <span class="input-group-text"><i class="bi bi-search text-muted" /></span>
                <input v-model="searchQuery" type="text" class="form-control" :placeholder="$t('search-by-name')">
              </div>
            </div>

            <div class="table-responsive border rounded-3 overflow-hidden shadow-xs mb-3">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col" style="width: 50px;">#</th>
                    <th>{{ $t('person') || 'Person' }}</th>
                    <th>{{ $t('relation-type') || 'Relation' }}</th>
                    <th>{{ $t('related-person') || 'Related' }}</th>
                    <th class="text-end" style="width: 70px;">{{ $t('actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="relative in paginatedRelatives" :key="relative.id">
                    <td class="text-muted small">{{ relative.id }}</td>
                    <td class="fw-semibold text-dark">{{ getPersonName(relative.related_person_id) }}</td>
                    <td>
                      <span class="badge bg-light text-primary border px-2 py-1">
                        {{ $t("relative-"+relative.relation_type) }}
                      </span>
                    </td>
                    <td class="fw-semibold text-dark">{{ getPersonName(relative.person_id) }}</td>
                    <td class="text-end">
                      <button class="btn btn-action-icon text-danger" type="button" :title="$t('delete')" @click.prevent="deleteRelative(relative)">
                        <i class="bi bi-trash-fill" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!paginatedRelatives.length">
                    <td colspan="5" class="text-center py-4 text-muted">
                      {{ $t('no-result') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mb-2 pt-1">
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

        <!-- Footer -->
        <div v-if="relativeToDelete || isAddingRelative" class="modal-footer d-flex justify-content-end gap-2 px-4 py-3">
          <button type="button" class="btn btn-light border rounded-pill px-3" @click="resetState">
            {{ $t('cancel') }}
          </button>
          <button v-if="relativeToDelete" type="button" class="btn btn-danger rounded-pill px-4 shadow-xs" @click="confirmDelete">
            {{ $t('delete') }}
          </button>
          <button v-if="isAddingRelative" type="submit" class="btn btn-primary rounded-pill px-4 shadow-xs" @click="handleSubmit">
            {{ $t('add') }}
          </button>
        </div>

        <!-- Notification Toast -->
        <div v-if="notification" class="toast-container position-fixed bottom-0 end-0 p-3">
          <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <strong class="me-auto">{{ $t('notification') }}</strong>
              <button type="button" class="btn-close" @click="notification = null" />
            </div>
            <div class="toast-body">
              {{ notification }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import fetchDataMixin from '@/mixins/fetchDataMixin';
import { fetchRelatives, deleteRelative, addRelative } from '@/services/relativesService.js';
import { fetchAssociations } from '@/services/associationsService.js';
import { fetchPersons } from '@/services/personsService.js'; 
import { fetchEvents } from '@/services/eventsService.js';

export default {
  mixins: [fetchDataMixin],
  emits: ['data-loaded'],
  data() {
    return {
      relatives: [],
      persons: [],
      events: [],
      associations: [],
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
      notification: null,
      relatedPersonInput: '',
      primaryPersonInput: '',
      filteredPersons: [],
      filteredPrimaryPersons: [],
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
        const personName1 = this.getPersonName(relative.related_person_id);
        const personName2 = this.getPersonName(relative.person_id);
        const name1 = personName1 !== null ? String(personName1).toLowerCase() : '';
        const name2 = personName2 !== null ? String(personName2).toLowerCase() : '';

        const searchQueryLower = this.searchQuery.toLowerCase();
        return name1.includes(searchQueryLower) || name2.includes(searchQueryLower);
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
      this.resetState();
      this.triggerTimelineReload();
    },
    filterForPerson(person) {
      this.resetState();
      this.searchQuery = `${person.first_name} ${person.last_name}`.trim();
      this.currentPage = 1;
    },
    startAddForPerson(person) {
      this.resetState();
      this.startAddRelative();
      const personObj = this.persons.find(p => p.id === person.id) || person;
      this.selectPrimaryPerson(personObj);
    },
    resetState() {
      this.isAddingRelative = false;
      this.relativeToDelete = null;
      this.notification = null;
      this.relatedPersonInput = '';
      this.primaryPersonInput = '';
      this.filterRelativePersons();
      this.filterPrimaryPersons();
      this.newRelative = { person_id: null, related_person_id: null, relation_type: '' };
    },
    async fetchInitialData(emitSignal=true) {
      try {
        const [relatives, persons, events, associations] = await Promise.all([
          fetchRelatives(),
          fetchPersons(),
          fetchEvents(),
          fetchAssociations(),
        ]);
        this.relatives = relatives;
        this.persons = persons;
        this.events = events; 
        this.associations = associations;

        // Create a mapping of event_id to event data
        const eventMap = this.events.reduce((map, event) => {
          map[event.id] = event;
          return map;
        }, {});

        // Enrich each person with birth_date based on associations and events
        this.persons = this.persons.map(person => {
          // Find all associations for the person
          const personAssociations = this.associations.filter(association => association.person_id === person.id);
          // Find all events for these associations
          const personEvents = personAssociations.map(association => eventMap[association.event_id]);
          // Find the birth event for the person
          const birthEvent = personEvents.find(event => event.event_type === 'birth');

          return {
            ...person,
            birth_date: birthEvent ? birthEvent.event_date : null // Add birth_date or set as null if not found
          };
        });

        // load list
        this.filterRelativePersons()
        this.filterPrimaryPersons()

      } catch (err) {
        console.error('Failed to fetch data:', err.message);
        this.notification = 'Failed to load data';
      }
      if (emitSignal) {
        this.$emit('data-loaded', 'relatives'); 
      }
    },
    filterRelativePersons() {
      const search = this.relatedPersonInput.trim().toLowerCase();
      this.filteredPersons = this.persons.filter(person => {
        const fullName1 = `${person.last_name} ${person.first_name}`.toLowerCase();
        const fullName2 = `${person.first_name} ${person.last_name}`.toLowerCase();
        const birthYear = this.formatDate(person.birth_date).toString();

        // Split the search input to allow searching by multiple words (first + last name)
        const searchTerms = search.split(' ');

        // Check if each search term is in the full name or birth year
        return searchTerms.every(term => 
          fullName1.includes(term) || fullName2.includes(term) || birthYear.includes(term)
        );
      });
    },
    
    filterPrimaryPersons() {
      const search = this.primaryPersonInput.trim().toLowerCase();
      this.filteredPrimaryPersons = this.persons.filter(person => {
        const fullName1 = `${person.last_name} ${person.first_name}`.toLowerCase();
        const fullName2 = `${person.first_name} ${person.last_name}`.toLowerCase();
        const birthYear = this.formatDate(person.birth_date).toString();

        const searchTerms = search.split(' ');

        return searchTerms.every(term =>
          fullName1.includes(term) || fullName2.includes(term) || birthYear.includes(term)
        );
      });
    },
    selectRelatedPerson(person) {
      this.newRelative.related_person_id = person.id;
      this.relatedPersonInput = `${this.getPersonName(person.id)} - ${this.formatDate(person.birth_date)}`;
      this.showRelatedPersonList = false;
    },
    selectPrimaryPerson(person) {
      this.newRelative.person_id = person.id;
      this.primaryPersonInput = `${this.getPersonName(person.id)} - ${this.formatDate(person.birth_date)}`;
      this.showPrimaryPersonList = false;
    },
    getPersonName(personId) {
      const person = this.persons.find(p => p.id === personId);
      return person ? `${person.first_name} ${person.last_name}` : personId; // Combine first_name et last_name
    },
    formatDate(date) {
      if (!date) return 'N/A';
      const year = new Date(date).getFullYear();
      return year;
    },
    async deleteRelative(relative) {
      this.relativeToDelete = relative;
    },
    async confirmDelete() {
      try {
        await deleteRelative(this.relativeToDelete.id);
        await this.fetchInitialData(false);
        this.resetState();
      } catch (error) {
        this.notification = error.message || 'An error occurred';
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
    handleSubmit() {
      // Fetch the form and check for validity
      const form = this.$el.querySelector('form');
      if (!form.checkValidity()) {
        return; 
      }
      this.submitConfirm();
    },
    async submitConfirm() {
      try {
        await addRelative(this.newRelative);
        await this.fetchInitialData(false);
        this.resetState()
      } catch (error) {
        this.notification = error.message || 'An error occurred';
      }
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

<style scoped>
.scrollable-list {
  max-height: 160px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
}

.scrollable-list .list-group-item-action:hover {
  background-color: #f0f7ff;
}
</style>
