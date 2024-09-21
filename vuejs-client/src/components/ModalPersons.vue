<template>
  <div id="personsModal" class="modal fade" tabindex="-1" aria-labelledby="personsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="personsModalLabel" class="modal-title">
            {{ $t('manage-persons') }}
            <span v-if="!isEditing && !personToDelete">
              - {{ totalPersonsCount }} {{ $t('persons') }}
            </span>
            <span v-if="isEditing">
              - {{ personBeingEdited.id ? 'Edit' : 'Add' }}
            </span>
            <span v-if="personToDelete">
              - {{ $t('delete') }}
            </span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
        
          <!-- Add/Edit Person Form -->
          <div v-if="isEditing" class="container">
            <form @submit.prevent="savePerson">
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

              <!-- Gender -->
              <div class="mb-3">
                <label for="gender" class="form-label">{{ $t('gender') }}</label>
                <select id="gender" v-model="personBeingEdited.gender" class="form-select">
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

              <!-- Picture Upload -->
              <div class="mb-3">
                <label for="picture" class="form-label">{{ $t('picture') }}</label>
                <input id="picture" type="file" class="form-control" @change="handleFileUpload">
                <div class="mt-2 text-center">
                  <img v-if="personBeingEdited.picture" :src="displayedPicture" alt="Profile Picture" class="img-thumbnail" style="max-width: 150px;">
                </div>
              </div>
            </form>
          </div>

          <!-- Delete confirmation -->
          <div v-else-if="personToDelete">
            <p>{{ $t('delete-warning') }} <strong>{{ personToDelete.first_name }} {{ personToDelete.last_name }}</strong> ?</p>
          </div>

          <!-- Persons List -->
          <div v-else>
            <!-- Title and Add Button -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <!-- Title -->
              <p class="text-muted mb-0">
                {{ $t('crud-warning') }}
              </p>
              <!-- Add Button -->
              <button class="btn btn-primary d-flex align-items-center" type="button" @click="startAddPerson">
                <span>{{ $t('add') }}</span>
              </button>
            </div>

            <!-- Persons Table -->
            <div class="table-responsive">
              <!-- Search Input -->
              <div class="d-flex align-items-center mb-2">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-search" /></span>
                  <input v-model="searchQuery" type="text" class="form-control" :placeholder="$t('search-by-name')">
                </div>
              </div>
              <table class="table table-hover bg-white mb-4">
                <thead>
                  <tr>
                    <th scope="col">
                      #
                    </th>
                    <th style="cursor: pointer;" @click="sortByLastName">
                      {{ $t('last-name') }} <i :class="sortIcon" />
                    </th>
                    <th>{{ $t('first-name') }}</th>
                    <th>{{ $t('middle-names') }}</th>
                    <th>{{ $t('actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Data Rows -->
                  <tr v-for="person in paginatedPersons" :key="person.id">
                    <td>{{ person.id }}</td>
                    <td>{{ person.last_name }}</td>
                    <td>{{ person.first_name }}</td>
                    <td>
                      <table class="mb-0">
                        <tbody>
                          <tr v-for="middleName in getMiddleNames(person.id)" :key="middleName.id">
                            <td>{{ middleName.middle_name }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td>
                      <a href="#" class="text-dark me-2" @click.prevent="startEditPerson(person)"><i class="bi bi-pencil-fill" /></a>
                      <a href="#" class="text-dark" @click.prevent="deletePerson(person)"><i class="bi bi-trash-fill" /></a>
                    </td>
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

        <!-- Footer -->
        <div v-if="isEditing || personToDelete" class="modal-footer">
          <template v-if="isEditing">
            <button type="submit" class="btn btn-primary" @click="savePerson">
              {{ personBeingEdited.id ? $t('save-changes') : $t('save') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">
              {{ $t('cancel') }}
            </button>
          </template>
          <template v-else-if="personToDelete">
            <button type="button" class="btn btn-secondary" @click="cancelDelete">
              {{ $t('cancel') }}
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
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
        this.error = 'Failed to load data';
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
        gender: 'Undefined',
        picture: null,
        birth_date: '',
        death_date: ''
       };
       this.uploadedPicture = null; 
      this.isEditing = true;
      this.error = null;
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
      this.error = null;
    },
    cancelEdit() {
      this.personBeingEdited = null;
      this.isEditing = false;
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
        this.error = err;
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
        this.error = err;
        console.error('Failed to delete person:', err.message);
      }
    },
    cancelDelete() {
      this.personToDelete = null;
      this.error = null;
    }
  }
};
</script>
