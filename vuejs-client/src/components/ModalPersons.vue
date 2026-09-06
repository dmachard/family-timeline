<template>
  <div id="personsModal" class="modal fade" tabindex="-1" aria-labelledby="personsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header d-flex align-items-center justify-content-between px-4 py-3">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="bi bi-people-fill fs-5" />
            </div>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <h5 id="personsModalLabel" class="modal-title mb-0 fw-bold text-dark">
                {{ $t('manage-persons') }}
              </h5>
              <span v-if="!isEditing && !personToDelete" class="badge bg-light text-secondary border rounded-pill fw-normal">
                {{ totalPersonsCount }} {{ $t('persons') }}
              </span>
              <span v-if="isEditing" class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill fw-semibold">
                {{ personBeingEdited.id ? $t('edit') : $t('add') }}
              </span>
              <span v-if="personToDelete" class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill fw-semibold">
                {{ $t('delete') }}
              </span>
            </div>
          </div>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <!-- Modal Body -->
        <div class="modal-body p-4">
          <!-- Add/Edit Person Form -->
          <div v-if="isEditing" class="container px-0">
            <form class="needs-validation was-validated" @submit.prevent="savePerson">
              <!-- First and Last Name -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">{{ $t('first-name') }}</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person-fill" /></span>
                    <input id="firstName" v-model="personBeingEdited.first_name" type="text" class="form-control" placeholder="John" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">{{ $t('last-name') }}</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person-fill" /></span>
                    <input id="lastName" v-model="personBeingEdited.last_name" type="text" class="form-control" placeholder="Doe" required>
                  </div>
                </div>
              </div>

              <!-- Gender -->
              <div class="mb-3">
                <label for="gender" class="form-label">{{ $t('gender') }}</label>
                <select id="gender" v-model="personBeingEdited.gender" class="form-select" required>
                  <option value="Female">
                    {{ $t('female') }}
                  </option>
                  <option value="Male">
                    {{ $t('male') }}
                  </option>
                  <option value="Undefined">
                    {{ $t('undefined') }}
                  </option>
                </select>
              </div>

              <!-- Middle Names -->
              <div class="mb-3">
                <label for="middleNames" class="form-label">{{ $t('middle-names') }}</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-person-badge-fill" /></span>
                  <input id="middleNames" v-model="personBeingEdited.middle_names_display" type="text" class="form-control" :placeholder="$t('middle-names-placeholder')">
                </div>
              </div>

              <!-- Date of Birth and Date of Death -->
              <div class="row mb-3" :hidden="personBeingEdited.id">
                <div class="col-md-6">
                  <label for="birthDate" class="form-label">{{ $t('birth') }}</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-calendar-event" /></span>
                    <input id="birthDate" v-model="personBeingEdited.birth_date" type="date" class="form-control" placeholder="YYYY-MM-DD">
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="deathDate" class="form-label">{{ $t('death') }}</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-calendar-event" /></span>
                    <input id="deathDate" v-model="personBeingEdited.death_date" type="date" class="form-control" placeholder="YYYY-MM-DD">
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="mb-3">
                <label for="notes" class="form-label">{{ $t('notes') }}</label>
                <textarea id="notes" v-model="personBeingEdited.notes" class="form-control" rows="3" />
              </div>

              <!-- Picture Upload -->
              <div class="mb-3">
                <label for="picture" class="form-label">{{ $t('picture') }}</label>
                <input id="picture" type="file" class="form-control" @change="handleFileUpload">
                <div v-if="personBeingEdited.picture" class="mt-3 p-3 bg-light rounded-3 border text-center">
                  <img :src="displayedPicture" alt="Profile Picture" class="img-thumbnail rounded-4 shadow-sm" style="max-width: 140px; max-height: 140px; object-fit: cover;">
                </div>
              </div>
            </form>
          </div>

          <!-- Delete confirmation -->
          <div v-else-if="personToDelete" class="text-center py-4">
            <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3" style="width: 56px; height: 56px;">
              <i class="bi bi-exclamation-triangle fs-3" />
            </div>
            <h5 class="fw-bold text-dark mb-2">
              {{ $t('delete') }}
            </h5>
            <p class="text-muted mb-0">
              {{ $t('delete-warning') }} <strong class="text-dark">{{ personToDelete.first_name }} {{ personToDelete.last_name }}</strong> ?
            </p>
          </div>

          <!-- Persons List -->
          <div v-else>
            <!-- Title and Add Button -->
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <p class="text-muted small mb-0">
                {{ $t('crud-warning') }}
              </p>
              <button class="btn btn-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-1 align-self-start align-self-sm-auto" type="button" @click="startAddPerson">
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

            <!-- Persons Table -->
            <div class="table-responsive border rounded-3 overflow-hidden shadow-xs mb-3">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col" style="width: 50px;">
                      #
                    </th>
                    <th style="cursor: pointer;" @click="sortByLastName">
                      {{ $t('last-name') }} <i :class="sortIcon" />
                    </th>
                    <th>{{ $t('first-name') }}</th>
                    <th>{{ $t('middle-names') }}</th>
                    <th class="text-end" style="width: 100px;">
                      {{ $t('actions') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Data Rows -->
                  <tr v-for="person in paginatedPersons" :key="person.id">
                    <td class="text-muted small">{{ person.id }}</td>
                    <td class="fw-semibold text-dark">{{ person.last_name }}</td>
                    <td>{{ person.first_name }}</td>
                    <td>
                      <span v-for="middleName in getMiddleNames(person.id)" :key="middleName.id" class="badge bg-light text-secondary border me-1">
                        {{ middleName.middle_name }}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <button class="btn btn-action-icon text-primary" type="button" :title="$t('edit')" @click.prevent="startEditPerson(person)">
                          <i class="bi bi-pencil-fill" />
                        </button>
                        <button class="btn btn-action-icon text-danger" type="button" :title="$t('delete')" @click.prevent="deletePerson(person)">
                          <i class="bi bi-trash-fill" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!paginatedPersons.length">
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

        <!-- Footer -->
        <div v-if="isEditing || personToDelete" class="modal-footer d-flex justify-content-end gap-2 px-4 py-3">
          <template v-if="isEditing">
            <button type="button" class="btn btn-light border rounded-pill px-3" @click="cancelEdit">
              {{ $t('cancel') }}
            </button>
            <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-xs" @click="handleSubmit">
              {{ personBeingEdited.id ? $t('save-changes') : $t('save') }}
            </button>
          </template>
          <template v-else-if="personToDelete">
            <button type="button" class="btn btn-light border rounded-pill px-3" @click="cancelDelete">
              {{ $t('cancel') }}
            </button>
            <button type="button" class="btn btn-danger rounded-pill px-4 shadow-xs" @click="confirmDelete">
              {{ $t('delete') }}
            </button>
          </template>
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
import fetchDataMixin from '@/mixins/fetchDataMixin'
import { fetchPersons, fetchMiddleNames, addPerson, deletePerson, editPerson } from '@/services/personsService.js'

export default {
  mixins: [fetchDataMixin],
  emits: ['data-loaded'],
  data() {
    return {
      persons: [],
      middleNames: [],
      currentPage: 1,
      itemsPerPage: 10,
      sortAsc: true,
      searchQuery: '',
      personToDelete: null,
      personBeingEdited: null,
      isEditing: false,
      uploadedPicture: null,
      notification: null,
    };
  },
  computed: {
    totalPersonsCount() {
      return this.persons.length;
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
    filteredPersons() {
      const search = this.searchQuery.trim().toLowerCase();

      return this.sortedPersons.filter(person => {
        const fullName1 = `${person.last_name} ${person.first_name}`.toLowerCase();
        const fullName2 = `${person.first_name} ${person.last_name}`.toLowerCase();

        // Split the search input to allow searching by multiple words (first + last name)
        const searchTerms = search.split(' ');

        // Check if each search term is in the full name or birth year
        return searchTerms.every(term => 
          fullName1.includes(term) || fullName2.includes(term)
        );
      });
    },
    paginatedPersons() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPersons.slice(start, end);
    },
    // Total number of pages
    totalPages() {
      return Math.ceil(this.filteredPersons.length / this.itemsPerPage);
    },
    sortedPersons() {
      return this.persons.slice().sort((a, b) => {
        let modifier = this.sortAsc ? 1 : -1;

        // Convert last names to lowercase for case-insensitive comparison
        let aLastName = a.last_name.toLowerCase();
        let bLastName = b.last_name.toLowerCase();

        // Compare last names
        if (aLastName < bLastName) return -1 * modifier;
        if (aLastName > bLastName) return 1 * modifier;

        // If last names are identical, compare first names
        let aFirstName = a.first_name.toLowerCase();
        let bFirstName = b.first_name.toLowerCase();
        if (aFirstName < bFirstName) return -1 * modifier;
        if (aFirstName > bFirstName) return 1 * modifier;

        return 0;
      });
    },
    sortIcon() {
      return this.sortAsc ? 'bi bi-arrow-down' : 'bi bi-arrow-up';
    },
    getDataUrl() {
      return import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_DATA_URL
        : '/data';
    },
    // Show the uploaded image preview if a new file is selected
    displayedPicture() {
      return this.uploadedPicture 
        ? URL.createObjectURL(this.uploadedPicture) 
        : (this.personBeingEdited.picture ? this.getDataUrl + '/' + this.personBeingEdited.picture : '');
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    itemsPerPage() {
      this.currentPage = 1;
    }
  },
  mounted() {
    const modalElement = document.getElementById('personsModal');
    modalElement.addEventListener('hide.bs.modal', this.handleModalClose);
  },
  unmounted() {
    const modalElement = document.getElementById('personsModal');
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
      this.notification = null;
      this.personToDelete = null;
      this.isEditing = false;
      this.uploadedPicture = null; 
    },
    handleFileUpload(event) {
      this.uploadedPicture = event.target.files[0];
    },
    async fetchInitialData() {
      try {
        // Use Promise.all to fetch data concurrently
        const [persons, middleNames] = await Promise.all([
          fetchPersons(),
          fetchMiddleNames()
        ]);
        
        this.persons = persons;
        this.middleNames = middleNames;
      } catch (err) {
        console.error('Failed to fetch data:', err.message);
        this.notification = 'Failed to load data';
      }
      this.$emit('data-loaded', 'persons'); 
    },
    getMiddleNames(personId) {
      return this.middleNames.filter(mn => mn.person_id === personId);
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
    sortByLastName() {
      this.sortAsc = !this.sortAsc;
    },
    startAddPerson() {
      this.personBeingEdited = { 
        first_name: '', 
        last_name: '', 
        middle_names: '',
        middle_names_display: '',
        notes: '',
        gender: '',
        picture: null,
        birth_date: '',
        death_date: ''
       };
       this.uploadedPicture = null; 
      this.isEditing = true;
    },
    startEditPerson(person) {
      this.personBeingEdited = { 
        ...person, 
        middle_names_display: this.getMiddleNames(person.id).map(mn => mn.middle_name).join(', '),
        birth_date: '',
        death_date: ''
      };
      this.uploadedPicture = null; 
      this.isEditing = true;
      this.notification = null;
    },
    startEditPersonById(personId) {
      this.resetState();
      const person = this.persons.find(p => p.id === personId);
      if (person) {
        this.startEditPerson(person);
      }
    },
    cancelEdit() {
      this.personBeingEdited = null;
      this.isEditing = false;
    },
    handleSubmit() {
      // Fetch the form and check for validity
      const form = this.$el.querySelector('form');
      if (!form.checkValidity()) {
        return; 
      }
      this.savePerson();
    },
    async savePerson() {
      // Create form data to handle file upload
      const formData = new FormData();
      formData.append('first_name', this.personBeingEdited.first_name);
      formData.append('last_name', this.personBeingEdited.last_name);
      formData.append('middle_names', this.personBeingEdited.middle_names_display.split(',').map(name => name.trim()));
      formData.append('notes', this.personBeingEdited.notes);
      formData.append('gender', this.personBeingEdited.gender);
      formData.append('birth_date', this.personBeingEdited.birth_date);
      formData.append('death_date', this.personBeingEdited.death_date);

      // Append picture if a new one was uploaded
      if (this.uploadedPicture) {
        formData.append('picture', this.uploadedPicture);
      }

      // created person returned by server
      let currentPerson;

      // Update/Add
      try {
        if (this.personBeingEdited.id) {
          // Update existing person
          currentPerson = await editPerson(this.personBeingEdited.id, formData);

          // Update the person in the local state
          const index = this.persons.findIndex(p => p.id === this.personBeingEdited.id);
          if (index !== -1) {
            this.persons.splice(index, 1, currentPerson);
          }

          // Update the middle names list
          // First, remove all existing middle names for the person
          this.middleNames = this.middleNames.filter(mn => mn.person_id !== currentPerson.id);
 
           // Then, add the updated middle names
           currentPerson.middle_names.forEach(item => {
            this.middleNames.push({
              id: item.id,
              person_id: currentPerson.id,
              middle_name: item.middle_name
            });
          });
          
        } else {
          // Add new person
          currentPerson = await addPerson(formData);
          this.persons.push(currentPerson);

          // update middle names list
          currentPerson.middle_names.forEach(item => {
            this.middleNames.push({
              id: item.id,
              person_id: currentPerson.id,
              middle_name: item.middle_name
            });
          });
        }
      } catch (err) {
        this.notification = err;
        console.error('Failed to fetch data:', err.message);
      }

      this.cancelEdit();
    },
    deletePerson(person) {
      this.personToDelete = person;
    },
    async confirmDelete() {
      try {
        // call api
        await deletePerson(this.personToDelete.id);

        // remove the person from lists
        this.persons = this.persons.filter(p => p.id !== this.personToDelete.id);
        this.middleNames = this.middleNames.filter(mn => mn.person_id !== this.personToDelete.id);

        // reset
        this.personToDelete = null;
      } catch (err) {
        this.notification = err;
        console.error('Failed to delete person:', err.message);
      }
    },
    cancelDelete() {
      this.personToDelete = null;
      this.notification = null;
    }
  }
};
</script>
