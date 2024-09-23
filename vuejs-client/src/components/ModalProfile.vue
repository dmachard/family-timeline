<template>
  <div id="profileModal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="profileLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header">
          <h1 id="profileLabel" class="modal-title fs-5">
            {{ $t('profile') }}
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <div class="modal-body">
          <!-- Resume display -->
          <div class="card border-0 mb-3" style="max-width: 540px;">
            <div class="row g-0">
              <div class="col-4 d-flex align-items-center justify-content-center">
                <img :src="profileImage" class="img-fluid rounded-start" alt="Profile image">
              </div>
              <div class="col-8">
                <div class="card-body">
                  <h5 class="card-title mb-0">
                    {{ person?.first_name + " " + person?.last_name }}
                  </h5>
                  <p class="card-text text-muted">
                    {{ person?.middle_names?.map(m => m.middle_name).join(', ') }}
                  </p>

                  <p class="card-text mb-0 text-muted">
                    {{ $t('birth') }} : {{ person?.birth_date }}
                  </p>
                  <p v-if="person?.death_date" class="card-text mb-0 text-muted">
                    {{ $t('death') }} : {{ person?.death_date }}
                  </p>
                  <p v-if="age" class="card-text text-muted">
                    {{ ageText }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Relatives display -->
          <div class="card border-0">
            <div class="card-body mb-0">
              <h5 class="card-title">
                {{ $t('relatives') }}
              </h5>
              <hr>
              <div v-for="section in relativeSections" :key="section.label" class="row mb-3">
                <div class="col-4">
                  <p class="h6">
                    {{ section.label }}
                  </p>
                </div>
                <div class="col-8">
                  <div v-if="section.items.length">
                    <p v-for="item in section.items" :key="item.id" class="mb-0">
                      <a href="#" @click.prevent="refreshProfile(item.id)">
                        {{ getPersonName(item.id) }}
                      </a>
                    </p>
                  </div>
                  <p v-else>
                    -
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Events display -->
          <div class="card border-0 mb-4">
            <div class="card-body">
              <h5 class="card-title">
                {{ $t('events') }}
              </h5>
              <hr>
              <div v-for="event in person?.events" :key="event.id" class="row mb-3">
                <div class="col-3">
                  <p class="text-start h6">
                    {{ new Date(event.event_date).getFullYear() }}
                  </p>
                  <p v-if="calculateAgeAtEvent(person.birth_date, event.event_date) > 0" class="text-start text-muted mb-0">
                    ~{{ calculateAgeAtEvent(person.birth_date, event.event_date) }} {{ $t('yearsOld') }}
                  </p>
                </div>
                <div class="col-9 text-muted ">
                  <p class="text-start mb-0">
                    <span v-if="event.event_type === 'birth' || event.event_type === 'death'">{{ $t(event.event_type) }}</span>
                    <span v-if="event.event_type === 'marriage'">
                      {{ $t('marriedTo') }} <span v-for="related in event.related_persons" :key="related.id">
                        <a href="#" @click.prevent="refreshProfile(related.id)">{{ getPersonName(related.id) }}</a>
                      </span>
                    </span>
                    <span v-if="event.event_type === 'child'">
                      {{ $t('hasAChild') }} <span v-for="related in event.related_persons" :key="related.id">
                        <a href="#" @click.prevent="refreshProfile(related.id)">{{ getPersonName(related.id) }}</a>
                      </span>
                    </span>
                    <span v-if="event.event_type === 'divorce'">
                      {{ $t('divorcedFrom') }} <span v-for="related in event.related_persons" :key="related.id">
                        <a href="#" @click.prevent="refreshProfile(related.id)">{{ getPersonName(related.id) }}</a>
                      </span>
                    </span>
                  </p>
                  <p class="card-text mb-0">
                    {{ event.event_date }}
                  </p>
                  <p v-if="event.event_place" class="card-text mb-0">
                    <i class="bi bi-geo-alt-fill" />
                    {{ event.event_place }}
                  </p>
                  <p v-if="event.event_notes" class="card-text mb-0">
                    {{ event.event_notes }}
                  </p>

                  <!-- Display attachment previews -->
                  <div v-if="event.related_attachments && event.related_attachments.length" class="mt-2">
                    <div class="d-flex flex-wrap">
                      <div v-for="attachment in event.related_attachments" :key="attachment.id" class="me-2 mb-2">
                        <img :src="getAttachmentPath(attachment.filepath)" alt="Attachment preview" class="img-thumbnail" @click="openAttachmentModal(attachment.filepath)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attachment Modal Component -->
    <AttachmentViewModal ref="attachmentModal" :attachment-path="currentAttachment" />
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import AttachmentViewModal from './ModalAttachmentView.vue'

export default {
  components: {
    AttachmentViewModal
  },
  props: {
    person: {
      type: Object,
      default: () => ({})
    },
    dataPersons: {
      type: Array,
      required: true
    }
  },
  emits: ['refresh-profile'],
  data () {
    return {
      currentAttachment: ''
    }
  },
  computed: {
    profileImage () {
      if (this.person?.picture) {
        return this.getDataUrl() + this.person?.picture
      } else {
        return this.person?.gender === 'Female' ? '/profile_women.png' : '/profile_men.png'
      }
    },
    relativeSections () {
      return [
        { label: this.$t('grandparents-paternal'), items: this.getGrandparents('father') },
        { label: this.$t('grandparents-maternal'), items: this.getGrandparents('mother') },
        { label: this.$t('parents'), items: this.parents },
        { label: this.$t('spouses'), items: this.spouses },
        { label: this.$t('children'), items: this.children },
        { label: this.$t('siblings'), items: this.siblings }
      ]
    },
    parents () {
      return this.filteredRelatives('mother').concat(this.filteredRelatives('father')).sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id);
        const childB = this.dataPersons.find(person => person.id === b.id);
        
        const birthDateA = new Date(childA?.birth_date || '9999-12-31');
        const birthDateB = new Date(childB?.birth_date || '9999-12-31');

        return birthDateA - birthDateB;
      });
    },
    spouses () {
      return this.filteredRelatives('spouse').sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id);
        const childB = this.dataPersons.find(person => person.id === b.id);
        
        const birthDateA = new Date(childA?.birth_date || '9999-12-31');
        const birthDateB = new Date(childB?.birth_date || '9999-12-31');

        return birthDateA - birthDateB;
      });
    },
    children () {
      return this.filteredRelatives('child').sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id);
        const childB = this.dataPersons.find(person => person.id === b.id);
        
        const birthDateA = new Date(childA?.birth_date || '9999-12-31');
        const birthDateB = new Date(childB?.birth_date || '9999-12-31');

        return birthDateA - birthDateB;
      });
    },
    siblings () {
      return this.filteredRelatives('brother').concat(this.filteredRelatives('sister')).sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id);
        const childB = this.dataPersons.find(person => person.id === b.id);
        
        const birthDateA = new Date(childA?.birth_date || '9999-12-31');
        const birthDateB = new Date(childB?.birth_date || '9999-12-31');

        return birthDateA - birthDateB;
      });
    },
    age () {
      if (this.person?.birth_date) {
        const birthDate = new Date(this.person.birth_date)
        const endDate = this.person.death_date ? new Date(this.person.death_date) : new Date()
        const age = endDate.getFullYear() - birthDate.getFullYear()
        const monthDiff = endDate.getMonth() - birthDate.getMonth()
        const dayDiff = endDate.getDate() - birthDate.getDate()

        // Adjust age if the birthday has not occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          return age - 1
        }
        return age
      }
      return null
    },
    ageText () {
      if (this.age !== null && this.age > 0) {
        return this.person?.death_date
          ? `${this.$t('ageAtDeath')}: ${this.age} ${this.age > 1 ? this.$t('yearsOld') : this.$t('yearOld')}`
          : `${this.$t('age')}: ${this.age} ${this.age > 1 ? this.$t('yearsOld') : this.$t('yearOld')}`
      }
      return ''
    }
  },
  methods: {
    getGrandparents(relationType) {
      if (!this.person || !this.person.relatives) return []

      // Get the IDs of the parents
      const parentIds = this.person.relatives
        .filter(r => r.relation_type === relationType)
        .map(p => p.id)
      
      if (parentIds.length === 0) return [];

      const grandparentIds = new Set();
          
      parentIds.forEach(parentId => {
        // Find the parent person
        const parent = this.dataPersons.find(p => p.id === parentId);
        if (parent && parent.relatives) {
          // Add each relative's ID to the grandparentIds set
            parent.relatives
            .filter(r => r.relation_type === 'father' || r.relation_type === 'mother')
            .forEach(r => grandparentIds.add(r.id));
        }
      });

    // Map unique grandparent IDs to actual person objects
    const uniqueGrandparents = Array.from(grandparentIds)
      .map(id => this.dataPersons.find(person => person.id === id))
      .filter(grandparent => grandparent); // Remove undefined values

    return uniqueGrandparents;
    },
    getDataUrl () {
      return import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_DATA_URL
        : '/data'
    },
    filteredRelatives (relationType) {
      if (!this.person || !this.person.relatives) return []
      return this.person.relatives.filter(r => r.relation_type === relationType)
    },
    getAttachmentPath (filepath) {
      return this.getDataUrl() + filepath
    },
    getPersonName (id) {
      const person = this.dataPersons.find(p => p.id === id);
      if (person) {
        const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : 'Unknown';
        return `${person.first_name} ${person.last_name} (${birthYear})`;
      }
      return 'Unknown';
    },
    calculateAgeAtEvent (birthDate, eventDate) {
      const birth = new Date(birthDate)
      const event = new Date(eventDate)
      let age = event.getFullYear() - birth.getFullYear()
      const monthDiff = event.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && event.getDate() < birth.getDate())) {
        age--
      }
      return age
    },
    refreshProfile (id) {
      const person = this.dataPersons.find(p => p.id === id)
      if (person) {
        this.$emit('refresh-profile', person)
      }
    },
    show () {
      const modalElement = document.getElementById('profileModal')
      const modal = new Modal(modalElement)
      modal.show()
    },
    hide () {
      const modalElement = document.getElementById('profileModal')
      const modal = Modal.getInstance(modalElement)
      if (modal) {
        modal.hide()
      }
    },
    openAttachmentModal (filepath) {
      this.currentAttachment = this.getAttachmentPath(filepath)
      this.$refs.attachmentModal.show()
    }
  }
}
</script>

<style scoped>
.img-thumbnail {
  cursor: pointer;
}
</style>
