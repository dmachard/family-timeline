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
            <form class="needs-validation was-validated" @submit.prevent="confirmAdd">
              <div class="row">
                <div class="col-md-6">
                  <!-- Autocomplete for Related Person -->
                  <div class="mb-3 position-relative">
                    <input
                      id="relatedPersonInput"
                      v-model="relatedPersonInput"
                      class="form-control"
                      autocomplete="off"
                      required
                      @input="filterRelativePersons"
                    >
                    <div class="invalid-feedback">
                      {{ $t('select-related-person') }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3 position-relative">
                    <div class="list-group list-group-flush scrollable-list">
                      <a v-if="filteredPersons.length === 0" class="list-group-item" hred="#">
                        {{ $t('no-result') }}
                      </a>
                      <a
                        v-for="person in filteredPersons"
                        :key="person.id"
                        href="#"
                        class="list-group-item list-group-item-action"
                        @mousedown="selectRelatedPerson(person)"
                      >
                        {{ getPersonName(person.id) }} - {{ formatDate(person.birth_date) }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Relation Type Selection -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
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
              </div>

              <!-- Autocomplete for Primary Person -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3 position-relative">
                    <input
                      id="primaryPersonInput"
                      v-model="primaryPersonInput"
                      class="form-control"
                      autocomplete="off"
                      required
                      @input="filterPrimaryPersons"
                    >
                    <div class="invalid-feedback">
                      {{ $t('select-primary-person') }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3 position-relative">
                    <!-- Dropdown list -->
                    <div class="list-group list-group-flush scrollable-list">
                      <a v-if="filteredPrimaryPersons.length === 0" class="list-group-item" hred="#">
                        {{ $t('no-result') }}
                      </a>
                      <a
                        v-for="person in filteredPrimaryPersons"
                        :key="person.id"
                        class="list-group-item list-group-item-action"
                        href="#"
                        @mousedown="selectPrimaryPerson(person)"
                      >
                        {{ getPersonName(person.id) }} - {{ formatDate(person.birth_date) }}
                      </a>
                    </div>
                  </div>
                </div>
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

        <!-- Footer -->
        <div v-if="relativeToDelete || isAddingRelative" class="modal-footer">
          <button v-if="relativeToDelete" type="button" class="btn btn-danger" @click="confirmDelete">
            {{ $t('delete') }}
          </button>
          <button v-if="isAddingRelative" type="submit" class="btn btn-primary" @click="handleSubmit">
            {{ $t('add') }}
          </button>
          <button type="button" class="btn btn-secondary" @click="resetState">
            {{ $t('cancel') }}
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
        const personName = this.getPersonName(relative.related_person_id);
        if (personName === null) {
          return '';
        }

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
      this.resetState();
      this.triggerTimelineReload();
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
  max-height: 150px;
  overflow-y: auto;
  overflow-x: hidden; 
}
</style>
