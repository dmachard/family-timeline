<template>
  <div id="personsModal" class="modal fade" tabindex="-1" aria-labelledby="personsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="personsModalLabel" class="modal-title">
            Manage Persons
            <span v-if="isEditing">
              - {{ personBeingEdited.id ? 'Edit' : 'Add' }}
            </span>
            <span v-if="personToDelete">
              - Delete
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
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name</label>
                  <input id="firstName" v-model="personBeingEdited.first_name" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input id="lastName" v-model="personBeingEdited.last_name" type="text" class="form-control" required>
                </div>
              </div>

              <div class="mb-3">
                <label for="middleNames" class="form-label">Middle Names</label>
                <input id="middleNames" v-model="personBeingEdited.middle_names_display" type="text" class="form-control" placeholder="Enter middle names separated by commas">
              </div>

              <div class="mb-3">
                <label for="notes" class="form-label">Notes</label>
                <textarea id="notes" v-model="personBeingEdited.notes" class="form-control" rows="3" />
              </div>

              <div class="mb-3">
                <label for="gender" class="form-label">Gender</label>
                <select id="gender" v-model="personBeingEdited.gender" class="form-select">
                  <option value="Female">
                    Female
                  </option>
                  <option value="Male">
                    Male
                  </option>
                  <option value="Undefined">
                    Undefined
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="picture" class="form-label">Picture</label>
                <input id="picture" type="file" class="form-control" @change="handleFileUpload">
                <div class="mt-2">
                  <img v-if="personBeingEdited.picture" :src="displayedPicture" alt="Profile Picture" class="img-thumbnail" style="max-width: 150px;">
                </div>
              </div>
            </form>
          </div>

          <!-- Delete confirmation -->
          <div v-else-if="personToDelete">
            <p>Are you sure you want to delete <strong>{{ personToDelete.first_name }} {{ personToDelete.last_name }}</strong>?</p>
          </div>

          <!-- Persons List -->
          <div v-else>
            <!-- Title and Add Button -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <!-- Title -->
              <p class="text-muted mb-0">
                Add, edit or delete your persons
              </p>
              <!-- Add Button -->
              <button class="btn btn-primary d-flex align-items-center" type="button" @click="startAddPerson">
                <span>Add</span>
              </button>
            </div>

            <!-- Persons Table -->
            <div class="table-responsive">
              <table class="table table-hover bg-white mb-4">
                <thead>
                  <tr>
                    <th scope="col">
                      #
                    </th>
                    <th style="cursor: pointer;" @click="sortByLastName">
                      Last Name <i :class="sortIcon" />
                    </th>
                    <th>First Name</th>
                    <th>Middle Names</th>
                    <th>Actions</th>
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
            <div class="d-flex justify-content-between align-items-center mb-3">
              <!-- Search Input -->
              <div class="d-flex align-items-center me-3">
                <div class="input-group me-2">
                  <span class="input-group-text"><i class="bi bi-search" /></span>
                  <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by name">
                </div>
              </div>

              <!-- Items Per Page -->
              <div class="d-flex align-items-center me-3">
                <label for="itemsPerPage" class="me-2 mb-0">Items per page:</label>
                <select id="itemsPerPage" v-model="itemsPerPage" class="form-select d-inline-block w-auto">
                  <option v-for="size in [5, 10, 15, 20]" :key="size" :value="size">
                    {{ size }}
                  </option>
                </select>
              </div>

              <!-- Pagination -->
              <nav aria-label="Page navigation">
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" aria-label="Previous" @click.prevent="previousPage">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" aria-label="Next" @click.prevent="nextPage">
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="isEditing || personToDelete" class="modal-footer">
          <template v-if="isEditing">
            <button type="submit" class="btn btn-primary" @click="savePerson">
              {{ personBeingEdited.id ? 'Save Changes' : 'Save Person' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">
              Cancel
            </button>
          </template>
          <template v-else-if="personToDelete">
            <button type="button" class="btn btn-secondary" @click="cancelDelete">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              Delete
            </button>
          </template>
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
      uploadedPicture: null
    };
  },
  computed: {
    filteredPersons() {
      return this.sortedPersons.filter(person => {
        const fullName = `${person.last_name} ${person.first_name}`.toLowerCase();
        return fullName.includes(this.searchQuery.toLowerCase());
      });
    },
    paginatedPersons() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPersons.slice(start, end);
    },
    // Total number of pages
    totalPages() {
      return Math.ceil(this.persons.length / this.itemsPerPage);
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
  mounted() {
    const modalElement = document.getElementById('personsModal');
    modalElement.addEventListener('hide.bs.modal', this.handleModalClose);
  },
  unmounted() {
    const modalElement = document.getElementById('personsModal');
    modalElement.removeEventListener('hide.bs.modal', this.handleModalClose);
  },
  methods: {
    ...mapActions(['triggerTimelineReload']),
    handleModalClose() {
      this.triggerTimelineReload();
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
        picture: null
       };
       this.uploadedPicture = null; 
      this.isEditing = true;
      this.error = null;
    },
    startEditPerson(person) {
      this.personBeingEdited = { 
        ...person, 
        middle_names_display: this.getMiddleNames(person.id).map(mn => mn.middle_name).join(', ')
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
