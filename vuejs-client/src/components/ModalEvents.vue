<template>
  <div id="eventsModal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="profileLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 id="eventsModalLabel" class="modal-title">
            {{ $t('manage-events') }}
            <span v-if="isDeleting">
              - {{ $t('delete') }}
            </span>
            <span v-if="isAttachmentsEditing">
              - {{ $t('attachments') }}
            </span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="handleModalClose" />
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Events Table -->
          <div v-if="!isEditing && !isDeleting && !isAttachmentsEditing && !isAssociatingPeople">
            <!-- Person Selector -->
            <div class="row">
              <!-- Autocomplete for select Person -->
              <div class="mb-3 position-relative">
                <label for="personSelect" class="form-label">{{ $t('selected-person') }}</label>
                <input
                  id="personInput"
                  v-model="personInput"
                  class="form-control"
                  autocomplete="off"
                  required
                  :placeholder="$t('select-related-person')"
                  @input="filterPersons"
                >
              </div>
              <div class="mb-3 position-relative mb-4">
                <div class="list-group list-group-flush scrollable-list">
                  <a
                    v-for="person in filteredPersons"
                    :key="person.id"
                    href="#"
                    class="list-group-item list-group-item-action"
                    @mousedown="selectPersonFromList(person)"
                  >
                    {{ getPersonName(person.id) }} - {{ formatDate(person.birth_date) }}
                  </a>
                </div>
              </div>
            </div>
            
            <div class="table-responsive">
              <label class="form-label">{{ $t('events') }}</label>
              <table class="table table-hover bg-white mb-4">
                <tbody>
                  <tr v-for="event in filteredEvents" :key="event.id">
                    <td>{{ $t(event.event_type) }}</td>
                    <td>{{ event.event_date }}</td>
                    <td>
                      <a href="#" class="text-dark me-2" @click.prevent="startEditEvent(event)">
                        <i class="bi bi-pencil-fill" />
                      </a>
                      <a href="#" class="text-dark me-2" @click.prevent="manageAttachments(event)">
                        <i class="bi bi-paperclip" />
                      </a>
                      <a v-if="event.event_type !== 'birth' && event.event_type !== 'death'" href="#" class="text-dark me-2" @click.prevent="manageAssociations(event)">
                        <i class="bi bi-person-plus-fill" />
                      </a>
                      <a href="#" class="text-dark me-2" @click.prevent="deleteEvent(event)">
                        <i class="bi bi-trash-fill" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Event Form (Add/Edit) - Visible only during editing/adding -->
          <div v-if="isEditing">
            <!-- Person Selector -->
            <div class="mb-3">
              <label for="personSelect" class="form-label">{{ $t('selected-person') }}</label>
              <select id="personSelect" v-model="selectedPersonId" :disabled="isEditing" class="form-select" @change="onPersonSelected">
                <option v-for="person in persons" :key="person.id" :value="person.id">
                  {{ person.first_name }} {{ person.last_name }} - {{ formatDate(person.birth_date) }}
                </option>
              </select>
            </div>
            <!-- Event Type and Date on the same line -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="eventType" class="form-label">{{ $t('event-type') }}</label>
                <select id="eventType" v-model="eventBeingEdited.event_type" class="form-select" :disabled="eventBeingEdited.id !== 0">
                  <option value="birth">
                    {{ $t('birth') }}
                  </option>
                  <option value="death">
                    {{ $t('death') }}
                  </option>
                  <option value="marriage">
                    {{ $t('marriage') }}
                  </option>
                  <option value="divorce">
                    {{ $t('divorce') }}
                  </option>
                  <option value="civil union">
                    {{ $t('civil-union') }}
                  </option>
                  <option value="civil separation">
                    {{ $t('civil-separation') }}
                  </option>
                  <option value="other">
                    {{ $t('other') }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="eventDate" class="form-label">{{ $t('event-date') }}</label>
                <input id="eventDate" v-model="eventBeingEdited.event_date" type="date" class="form-control">
              </div>
            </div>

            <!-- Event Place and Verified Checkbox on the same line -->
            <div class="row mb-3 align-items-center">
              <div class="col-md-6">
                <label for="eventPlace" class="form-label">{{ $t('event-place') }}</label>
                <input id="eventPlace" v-model="eventBeingEdited.event_place" type="text" class="form-control">
              </div>

              <div class="col-md-6 d-flex align-items-center">
                <div class="form-check">
                  <input id="eventVerified" v-model="eventBeingEdited.event_verified" class="form-check-input" type="checkbox">
                  <label class="form-check-label ms-2" for="eventVerified">
                    {{ $t('event-verified') }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Event Notes -->
            <div class="mb-3">
              <label for="eventNotes" class="form-label">{{ $t('event-notes') }}</label>
              <textarea id="eventNotes" v-model="eventBeingEdited.event_notes" class="form-control" />
            </div>
          </div>

          <!-- Deletion Confirmation - Visible only when an event is selected for deletion -->
          <div v-if="isDeleting">
            <div class="alert alert-warning" role="alert">
              {{ $t('delete-event-confirmation-message') }} "{{ $t(selectedEvent.event_type) }}" {{ $t('for') }} {{ getPersonName(selectedPersonId) }}?
            </div>
          </div>

          <!-- Attachments Table -->
          <div v-if="isAttachmentsEditing">
            <div class="row mb-3">
              <div class="col-md-6">
                <!-- Person Selector -->
                <div class="mb-3">
                  <label for="personSelect" class="form-label">{{ $t('selected-person') }}</label>
                  <select id="personSelect" v-model="selectedPersonId" :disabled="isAttachmentsEditing" class="form-select" @change="onPersonSelected">
                    <option v-for="person in persons" :key="person.id" :value="person.id">
                      {{ person.first_name }} {{ person.last_name }} - {{ formatDate(person.birth_date) }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <label for="eventType" class="form-label">{{ $t('event-type') }}</label>
                <select id="eventType" v-model="selectedEvent.event_type" class="form-select" disabled>
                  <option value="birth">
                    {{ $t('birth') }}
                  </option>
                  <option value="death">
                    {{ $t('death') }}
                  </option>
                  <option value="marriage">
                    {{ $t('marriage') }}
                  </option>
                  <option value="divorce">
                    {{ $t('divorce') }}
                  </option>
                  <option value="civil union">
                    {{ $t('civil-union') }}
                  </option>
                  <option value="civil separation">
                    {{ $t('civil-separation') }}
                  </option>
                  <option value="other">
                    {{ $t('other') }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Upload Progress Indicator -->
            <div v-if="uploadInProgress" class="progress mt-3">
              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :style="{ width: uploadProgress + '%' }">
                {{ uploadProgress }}%
              </div>
            </div>

            <!-- Drag & Drop Area for Adding Attachments -->
            <div class="drop-zone mb-3" @drop.prevent="handleDrop($event)" @dragover.prevent>
              <p>{{ $t('drag-drop-files-here') }}</p>
            </div>

            <!-- Grid of Attachments -->
            <div class="d-flex flex-wrap">
              <div v-for="attachment in filteredAttachments" :key="attachment.id" class="position-relative m-2">
                <!-- Thumbnail Image -->
                <img :src="getDataUrl + attachment.file_path" class="img-thumbnail" width="100" height="100">

                <!-- Delete Icon (appears on hover) -->
                <div class="delete-icon" @click.prevent="deleteAttachment(attachment)">
                  <i class="bi bi-trash-fill text-danger" />
                </div>
              </div>
            </div>
          </div>

          <!-- Associated People -->
          <div v-if="isAssociatingPeople">
            <div class="row mb-3">
              <div class="col-md-6">
                <!-- Person Selector -->
                <div class="mb-3">
                  <label for="personSelect" class="form-label">{{ $t('selected-person') }}</label>
                  <select id="personSelect" v-model="selectedPersonId" :disabled="isAssociatingPeople" class="form-select" @change="onPersonSelected">
                    <option v-for="person in persons" :key="person.id" :value="person.id">
                      {{ person.first_name }} {{ person.last_name }} - {{ formatDate(person.birth_date) }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <label for="eventType" class="form-label">{{ $t('event-type') }}</label>
                <select id="eventType" v-model="selectedEvent.event_type" class="form-select" disabled>
                  <option value="birth">
                    {{ $t('birth') }}
                  </option>
                  <option value="death">
                    {{ $t('death') }}
                  </option>
                  <option value="marriage">
                    {{ $t('marriage') }}
                  </option>
                  <option value="divorce">
                    {{ $t('divorce') }}
                  </option>
                  <option value="civil union">
                    {{ $t('civil-union') }}
                  </option>
                  <option value="civil separation">
                    {{ $t('civil-separation') }}
                  </option>
                  <option value="other">
                    {{ $t('other') }}
                  </option>
                </select>
              </div>
            </div>
            <!-- add -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="personSelect" class="form-label">{{ $t('select-person-to-add') }}</label>
                <select id="personSelect" v-model="selectedPersonToAssociate" class="form-select">
                  <option v-for="person in persons" :key="person.id" :value="person.id">
                    {{ person.first_name }} {{ person.last_name }} - {{ formatDate(person.birth_date) }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Grid of Associations -->
            <div class="d-flex flex-wrap">
              <div v-for="person in associatedPersons" :key="person.id" class="position-relative text-center m-2">
                <!-- Logo or Placeholder Image -->
                <img :src="person.gender === 'Male' ? '/profile_men.png' : '/profile_women.png'" class="img-thumbnail mb-2" width="100" height="100" alt="Person Logo">

                <!-- Person's Name -->
                <div>{{ person.first_name }} {{ person.last_name }} - {{ formatDate(person.birth_date) }}</div>

                <!-- Delete Icon -->
                <div class="delete-icon position-absolute top-0 end-0" @click.prevent="removeAssociatedPerson(person.associationId)">
                  <i class="bi bi-trash-fill text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <template v-if="isEditing">
            <button type="submit" class="btn btn-primary" @click="saveEvent">
              {{ eventBeingEdited.id ? $t('save-changes') : $t('save') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">
              {{ $t('cancel') }}
            </button>
          </template>

          <template v-else-if="isDeleting">
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              {{ $t('delete') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelDelete">
              {{ $t('cancel') }}
            </button>
          </template>

          <template v-else-if="isAttachmentsEditing">
            <button type="submit" class="btn btn-secondary" @click="cancelEditAttachment">
              {{ $t('terminate') }}
            </button>
          </template>

          <template v-else-if="isAssociatingPeople">
            <button type="button" class="btn btn-primary" :disabled="!selectedPersonToAssociate" @click="associatePerson">
              {{ $t('add') }}
            </button>
            <button type="submit" class="btn btn-secondary" @click="cancelEditAssociate">
              {{ $t('terminate') }}
            </button>
          </template>

          <template v-else>
            <button class="btn btn-primary d-flex" type="button" :disabled="!selectedPersonId" @click="startAddEvent">
              <span>{{ $t('add') }}</span>
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
import fetchDataMixin from '@/mixins/fetchDataMixin';
import { fetchEvents, editEvent, deleteEvent, addAssociation } from '@/services/eventsService.js';
import { fetchAssociations, deleteAssociation } from '@/services/associationsService.js';
import { fetchAttachments, deleteAttachment, createAttachment } from '@/services/attachmentsService.js';
import { fetchPersons, addEvent } from '@/services/personsService.js';

export default {
  mixins: [fetchDataMixin],
  emits: ['data-loaded'],
  data() {
    return {
      persons: [],
      events: [],
      associations: [],
      attachments: [],
      selectedPersonId: null, // Selected person's ID
      selectedEvent: null,
      selectedPersonToAssociate: null,
      filteredEvents: [],    // Events filtered by selected person
      filteredAttachments: [], // Attachments filtered by selected events
      eventBeingEdited: null, // Event currently being edited
      isEditing: false,
      isAttachmentsEditing: false,
      isAssociatingPeople: false,
      isDeleting: false,
      uploadInProgress: false,
      uploadProgress: 0,
      notification: null,
      associatedPersons: [],
      personInput: '',
      filteredPersons: [],
    };
  },
  computed: {
    getDataUrl() {
      return import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_DATA_URL
        : '/data';
    },
  },
  methods: {
    ...mapActions(['triggerTimelineReload']),
    async fetchInitialData() {
      try {
        // Fetch all data in parallel
        const [persons, events, associations, attachments] = await Promise.all([
          fetchPersons(),
          fetchEvents(),
          fetchAssociations(),
          fetchAttachments(),
        ]);

        // Store the fetched data in the component's state
        this.persons = persons;
        this.events = events;
        this.associations = associations;
        this.attachments = attachments;

        // Convert event_verified to a boolean (true/false)
        this.events = events.map(event => {
          return {
            ...event,
            event_verified: event.event_verified === 1
          };
        });

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
        
        // Set the default selected person (e.g., the first person in the list)
        if (this.persons.length > 0) {
          this.selectedPersonId = this.persons[0].id;
          this.onPersonSelected();
        }

        // load list
        this.filterPersons()

      } catch (err) {
        this.notification = 'Failed to load initial data';
        console.error(err.message);
      }
      this.$emit('data-loaded', 'events');
    },

    filterPersons() {
      const search = this.personInput.trim().toLowerCase();
      this.filteredPersons = this.persons.filter(person => {
        const fullName1 = `${person.last_name} ${person.first_name}`.toLowerCase();
        const fullName2 = `${person.first_name} ${person.last_name}`.toLowerCase();
        const birthYear = this.formatDate(person.birth_date).toString();

        const searchTerms = search.split(' ');

        return searchTerms.every(term =>
          fullName1.includes(term) || fullName2.includes(term) || birthYear.includes(term)
        );
      });
    },

    selectPersonFromList(person) {
      this.selectedPersonId = person.id;
      this.personInput = `${this.getPersonName(person.id)} - ${this.formatDate(person.birth_date)}`;

      this.filteredPersons = [];
      this.onPersonSelected();
    },

    formatDate(date) {
      if (!date) return 'N/A';
      const year = new Date(date).getFullYear();
      return year;
    },
      
    onPersonSelected() {
      this.filteredEvents = this.associations
        .filter(association => association.person_id === this.selectedPersonId)
        .map(association => {
          return this.events.find(event => event.id === association.event_id);
        })
        .filter(event => event !== undefined)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

      // Optionally, filter attachments related to the filtered events
      this.filteredAttachments = this.attachments.filter(attachment =>
        this.filteredEvents.some(event => event.id === attachment.event_id)
      );
    },

    // Start the process to add a new event
    startAddEvent() {
      this.eventBeingEdited = { id: 0, event_type: 'birth', event_date: '', event_place: '', event_verified: false, event_notes: '' };
      this.isEditing = true;
    },

    // Start the process to edit an existing event
    startEditEvent(event) {
      this.eventBeingEdited = { ...event };
      this.isEditing = true;
    },

    // Cancel the editing process
    cancelEdit() {
      this.eventBeingEdited = null;
      this.isEditing = false;
    },

    // Save (add/edit) an event
    async saveEvent() {
      let currentEvent;

      const postData = {
        'event_type':  this.eventBeingEdited.event_type,
        'event_date': this.eventBeingEdited.event_date,
        'event_place': this.eventBeingEdited.event_place,
        'event_verified': this.eventBeingEdited.event_verified,
        'event_notes': this.eventBeingEdited.event_notes
      }

      try {
        if (this.eventBeingEdited.id) {
          // Edit existing event
          currentEvent = await editEvent(this.eventBeingEdited.id, postData, this.selectedPersonId);

          currentEvent.event_verified = currentEvent.event_verified === 1;
          const index = this.events.findIndex(e => e.id === this.eventBeingEdited.id);
          if (index !== -1) {
            this.events.splice(index, 1, currentEvent);
          }
        } else {
          // Add new event
          currentEvent = await addEvent(this.selectedPersonId, postData);

          // Convert event_verified to boolean
          currentEvent.event_verified = currentEvent.event_verified === 1;
          this.events.push(currentEvent);

          // refresh associations and selected person data
          this.associations = await fetchAssociations();
          this.onPersonSelected();
        }
      } catch (err) {
        this.notification = 'Failed to save/add event';
        console.error(err.message);
        return;
      }

      this.cancelEdit();
      this.onPersonSelected(); // Refresh filtered events after save
    },

    deleteEvent(event) {
      this.isDeleting = true;
      this.selectedEvent = event;
    },

    async confirmDelete() {
      try {
        await deleteEvent(this.selectedEvent.id, this.selectedPersonId);

        // refresh list
        this.events = this.events.filter(e => e.id !== this.selectedEvent.id);

        // Refresh filtered events after deletion
        this.cancelDelete();
        this.onPersonSelected();
      } catch (err) {
        this.notification = 'Failed to delete event';
        console.error(err.message);
      }
    },

    cancelDelete() {
      this.isDeleting = false;
      this.selectedEvent = null;
    },

    handleModalClose() {
      this.resetState();
      this.triggerTimelineReload();
    },

    resetState() {
      this.eventBeingEdited = null;
      this.selectedEvent = null
      this.isEditing = false;
      this.isAttachmentsEditing = false;
      this.isAssociatingPeople = false;
      this.selectedPersonId = null;
      this.selectedPersonToAssociate = null;
      this.notification = null;
      this.filterPersons();
    },

    getPersonName(personId) {
      const person = this.persons.find(p => p.id === personId);
      return person ? `${person.first_name} ${person.last_name}` : '';
    },

    async manageAttachments(event) {
      this.selectedEvent = event;
      this.isAttachmentsEditing = true;
      this.filteredAttachments = this.attachments.filter(attachment => attachment.event_id === event.id);
    },

    cancelEditAttachment() {
      this.selectedEvent = null;
      this.isAttachmentsEditing = false;
    },

    async deleteAttachment(attachment) {
      try {
        await deleteAttachment(attachment.id, this.selectedPersonId);

        // remove from lists
        this.attachments = this.attachments.filter(p => p.id !== attachment.id);
        this.filteredAttachments = this.filteredAttachments.filter(att => att.id !== attachment.id);

        this.notification = 'Attachment deleted successfully';
      } catch (err) {
        this.notification = 'Failed to delete attachment';
        console.error(err.message);
      }
    },

    handleDrop(event) {
      const files = event.dataTransfer.files;
      this.uploadFiles(files);
    },

    async uploadFiles(files) {
      try {
        this.uploadInProgress = true;
        this.uploadProgress = 0;

        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();
          formData.append('event_id', this.selectedEvent.id);
          formData.append('description', "");
          formData.append('attachment', files[i]);

          // Add new attachment
          const newAttachment = await createAttachment(formData, this.selectedPersonId);
          this.attachments.push(newAttachment);
        }
        // Filter attachments related to the selected event
        this.filteredAttachments = this.attachments.filter(attachment => 
          attachment.event_id === this.selectedEvent.id
        );
        console.log(this.filteredAttachments);

        this.uploadInProgress = false;
        this.notification = 'Attachment uploaded successfully';
      } catch (err) {
        this.uploadInProgress = false;
        this.notification = 'Failed to updload attachment';
        console.error(err.message);
      }
    },

    refreshAssociatedPersons() {
      // Get the IDs of persons associated with the selected event
      const associatedAssociations = this.associations
          .filter(association => association.event_id === this.selectedEvent.id);

        // Filter the persons associated with the event, and map to include associationId
      this.associatedPersons = this.persons
          .filter(person => associatedAssociations.some(association => association.person_id === person.id && person.id !== this.selectedPersonId))
          .map(person => {
            const association = associatedAssociations.find(association => association.person_id === person.id);
            return {
              ...person,
              associationId: association ? association.id : null // Include the association ID
            };
          });
    },

    manageAssociations(event) {
      this.selectedEvent = event;
      this.isAssociatingPeople = true;

      this.refreshAssociatedPersons()
    },

    cancelEditAssociate() {
      this.selectedEvent = null;
      this.isAssociatingPeople = false;
    },

    async removeAssociatedPerson(associationId) {
      try {
        await deleteAssociation(associationId, this.selectedPersonId);

        // remove from lists
        this.associations = this.associations.filter(p => p.id !== associationId);

        this.notification = 'Association deleted successfully';
        this.refreshAssociatedPersons()
      } catch (err) {
        this.notification = 'Failed to delete association';
        console.error(err.message);
      }
    },

    async associatePerson(){
      try {
        const postData = {
          'person_id':  this.selectedPersonToAssociate
        }

        const newAssociation = await addAssociation(this.selectedEvent.id, postData, this.selectedPersonId);
        this.associations.push(newAssociation);

        this.notification = 'Association added successfully';
        this.refreshAssociatedPersons()
        this.selectedPersonToAssociate = null;
      } catch (err) {
        this.notification = 'Failed to add association';
        console.error(err.message);
      }
    }
  }
};
</script>


<style scoped>
.toast {
  background-color: rgba(255, 255, 255); 
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.drop-zone input[type='file'] {
  display: none;
}

.drop-zone:hover {
  background-color: #e8e8e8;
}

.img-thumbnail {
  max-width: 100px;
  max-height: 100px;
}

.delete-icon {
  cursor: pointer;
}

.scrollable-list {
  max-height: 150px;
  overflow-y: auto;
  overflow-x: hidden; 
}
</style>
