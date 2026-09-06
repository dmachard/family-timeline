<template>
  <div id="profileModal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="profileLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <!-- Modal Header -->
        <div class="modal-header d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center shadow-xs" style="width: 38px; height: 38px;">
              <i class="bi bi-person-vcard fs-5" />
            </div>
            <div>
              <h5 id="profileLabel" class="modal-title mb-0 fw-bold text-dark" style="letter-spacing: -0.01em;">
                {{ $t('profile') }}
              </h5>
              <div class="text-muted small" style="font-size: 12px;">
                {{ person?.first_name }} {{ person?.last_name }}
              </div>
            </div>
          </div>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close" />
        </div>

        <div class="modal-body p-3 p-sm-4 bg-light-subtle">
          <!-- ── HERO PROFILE CARD ───────────────────────────────────────────── -->
          <div class="profile-hero-card p-3 p-sm-4 rounded-4 mb-4 border shadow-sm">
            <div class="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3 gap-sm-4">
              <!-- Avatar with gender jewel badge -->
              <div class="position-relative flex-shrink-0">
                <img :src="profileImage" class="profile-hero-avatar rounded-4" alt="Photo de profil">
                <span
                  v-if="person?.gender"
                  class="position-absolute bottom-0 end-0 badge rounded-pill px-2 py-1 shadow-sm border border-2 border-white d-flex align-items-center gap-1"
                  :class="person.gender === 'Female' ? 'bg-danger text-white' : 'bg-primary text-white'"
                  style="font-size: 10px; transform: translate(4px, 4px);"
                >
                  <i :class="person.gender === 'Female' ? 'bi bi-gender-female' : 'bi bi-gender-male'" />
                  <span>{{ person.gender === 'Female' ? $t('female') : $t('male') }}</span>
                </span>
              </div>

              <!-- Name & Quick Actions -->
              <div class="flex-grow-1 text-center text-sm-start w-100">
                <div class="d-flex flex-column flex-sm-row align-items-center align-items-sm-start justify-content-between gap-2 mb-2">
                  <div>
                    <h3 class="fw-bolder text-dark mb-1 profile-hero-title">
                      {{ person?.first_name + " " + person?.last_name }}
                    </h3>
                    <p v-if="person?.middle_names && person.middle_names.length" class="text-muted small mb-0 fst-italic">
                      {{ person?.middle_names?.map(m => m.middle_name).join(', ') }}
                    </p>
                  </div>
                  <button
                    class="btn btn-primary btn-sm rounded-pill px-3 shadow-xs d-flex align-items-center gap-1 hover-lift"
                    type="button"
                    :title="$t('edit')"
                    @click="editPerson"
                  >
                    <i class="bi bi-pencil-square" />
                    <span>{{ $t('edit') }}</span>
                  </button>
                </div>

                <!-- Vital facts strip -->
                <div class="row g-2 mt-2">
                  <!-- Naissance -->
                  <div v-if="person?.birth_date" class="col-12 col-sm-auto">
                    <div class="vital-fact-chip d-flex align-items-center gap-2 px-2 py-1 rounded-3 bg-white border shadow-xs">
                      <div class="vital-fact-icon bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-sun-fill" />
                      </div>
                      <div class="text-start">
                        <div class="vital-fact-label">{{ $t('birth') }}</div>
                        <div class="vital-fact-value text-dark fw-bold">
                          {{ formatDate(person.birth_date) }}
                        </div>
                        <div v-if="birthPlace" class="vital-fact-place text-muted small text-truncate" style="max-width: 140px;">
                          📍 {{ birthPlace }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Décès -->
                  <div v-if="person?.death_date" class="col-12 col-sm-auto">
                    <div class="vital-fact-chip d-flex align-items-center gap-2 px-2 py-1 rounded-3 bg-white border shadow-xs">
                      <div class="vital-fact-icon bg-secondary-subtle text-secondary rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-clock-history" />
                      </div>
                      <div class="text-start">
                        <div class="vital-fact-label">{{ $t('death') }}</div>
                        <div class="vital-fact-value text-dark fw-bold">
                          {{ formatDate(person.death_date) }}
                        </div>
                        <div v-if="deathPlace" class="vital-fact-place text-muted small text-truncate" style="max-width: 140px;">
                          📍 {{ deathPlace }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Statut en vie -->
                  <div v-else-if="person?.birth_date && person?.death_date === null" class="col-12 col-sm-auto">
                    <div class="vital-fact-chip d-flex align-items-center gap-2 px-2 py-1 rounded-3 bg-emerald-light border border-success-subtle shadow-xs">
                      <span class="status-pulse-dot" />
                      <div class="text-start">
                        <div class="vital-fact-label text-success">Statut</div>
                        <div class="vital-fact-value text-success fw-bold">En vie</div>
                      </div>
                    </div>
                  </div>

                  <!-- Longévité / Âge -->
                  <div v-if="age" class="col-12 col-sm-auto">
                    <div class="vital-fact-chip d-flex align-items-center gap-2 px-2 py-1 rounded-3 bg-primary-subtle border border-primary-subtle shadow-xs">
                      <div class="vital-fact-icon bg-white text-primary rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-hourglass-split" />
                      </div>
                      <div class="text-start">
                        <div class="vital-fact-label text-primary">{{ person?.death_date ? $t('ageAtDeath') : $t('age') }}</div>
                        <div class="vital-fact-value text-primary fw-bold">
                          {{ age }} {{ age > 1 ? $t('yearsOld') : $t('yearOld') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── SEGMENTED NAVIGATION TABS ───────────────────────────────────── -->
          <div class="profile-tabs-wrapper mb-3">
            <div class="d-flex p-1 bg-white rounded-pill border shadow-xs">
              <button
                class="profile-tab-pill flex-fill"
                :class="{ active: activeTab === 'family' }"
                type="button"
                @click="selectTab('family')"
              >
                <i class="bi bi-diagram-3-fill me-1" />
                <span>{{ $t('relatives') }}</span>
                <span class="badge rounded-pill ms-1" :class="activeTab === 'family' ? 'bg-primary text-white' : 'bg-light text-muted border'">
                  {{ totalRelativesCount }}
                </span>
              </button>

              <button
                class="profile-tab-pill flex-fill"
                :class="{ active: activeTab === 'events' }"
                type="button"
                @click="selectTab('events')"
              >
                <i class="bi bi-calendar3 me-1" />
                <span>{{ $t('events') }}</span>
                <span class="badge rounded-pill ms-1" :class="activeTab === 'events' ? 'bg-success text-white' : 'bg-light text-muted border'">
                  {{ person?.events?.length || 0 }}
                </span>
              </button>

              <button
                class="profile-tab-pill flex-fill"
                :class="{ active: activeTab === 'map' }"
                type="button"
                @click="selectTab('map')"
              >
                <i class="bi bi-geo-alt-fill me-1 text-danger" />
                <span>Carte</span>
                <span class="badge rounded-pill ms-1" :class="activeTab === 'map' ? 'bg-danger text-white' : 'bg-light text-muted border'">
                  {{ totalPlacesCount }}
                </span>
              </button>

              <button
                v-if="allAttachments.length"
                class="profile-tab-pill flex-fill"
                :class="{ active: activeTab === 'gallery' }"
                type="button"
                @click="selectTab('gallery')"
              >
                <i class="bi bi-images me-1" />
                <span>Documents</span>
                <span class="badge rounded-pill ms-1" :class="activeTab === 'gallery' ? 'bg-indigo text-white' : 'bg-light text-muted border'">
                  {{ allAttachments.length }}
                </span>
              </button>
            </div>
          </div>

          <!-- ── TAB 1: RELATIVES & FAMILY TREE ──────────────────────────────── -->
          <div v-show="activeTab === 'family'" class="tab-pane-fade">
            <!-- Header bar with manage action -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="text-muted small fw-semibold">
                {{ totalRelativesCount }} relation{{ totalRelativesCount > 1 ? 's' : '' }} répertoriée{{ totalRelativesCount > 1 ? 's' : '' }}
              </div>
              <button
                class="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
                type="button"
                :title="$t('manage-relatives')"
                @click="manageRelatives"
              >
                <i class="bi bi-gear" />
                <span>{{ $t('manage') }}</span>
              </button>
            </div>

            <!-- Empty State if no relatives -->
            <div v-if="totalRelativesCount === 0" class="card border rounded-4 p-4 text-center bg-white shadow-xs">
              <div class="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mx-auto mb-2" style="width: 48px; height: 48px;">
                <i class="bi bi-people fs-4" />
              </div>
              <h6 class="fw-bold text-dark mb-1">Aucun lien de parenté enregistré</h6>
              <p class="text-muted small mb-3">Ajoutez des parents, conjoints ou enfants pour construire l'arbre généalogique.</p>
              <div>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" type="button" @click="manageRelatives">
                  <i class="bi bi-plus-lg me-1" />Ajouter des liens de parenté
                </button>
              </div>
            </div>

            <div v-else class="d-flex flex-column gap-3">
              <!-- 1. Foyer & Descendance (Conjoints & Enfants) -->
              <div v-if="spouses.length || children.length" class="family-group-card bg-white border rounded-4 p-3 shadow-xs">
                <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <i class="bi bi-house-heart-fill text-danger fs-5" />
                  <h6 class="fw-bold text-dark mb-0 fs-6">Foyer direct & Descendance</h6>
                </div>

                <!-- Conjoints -->
                <div v-if="spouses.length" class="mb-3">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    💍 {{ $t('spouses') }} ({{ spouses.length }})
                  </div>
                  <div class="row g-2">
                    <div v-for="item in spouses" :key="item.id" class="col-12 col-sm-6">
                      <div class="relative-card d-flex align-items-center gap-2 p-2 rounded-3 border bg-light-subtle hover-card" @click="refreshProfile(item.id)">
                        <img :src="getRelativeAvatar(item.id)" class="relative-card-avatar rounded-3" alt="Conjoint">
                        <div class="flex-grow-1 min-w-0">
                          <div class="fw-bold text-dark text-truncate relative-card-name">
                            {{ getRelativePerson(item.id)?.first_name }} {{ getRelativePerson(item.id)?.last_name }}
                          </div>
                          <div class="text-muted small font-monospace" style="font-size: 11px;">
                            {{ getRelativeLifespan(item.id) }}
                          </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted opacity-50 pe-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Enfants -->
                <div v-if="children.length">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    👶 {{ $t('children') }} ({{ children.length }})
                  </div>
                  <div class="row g-2">
                    <div v-for="item in children" :key="item.id" class="col-12 col-sm-6">
                      <div class="relative-card d-flex align-items-center gap-2 p-2 rounded-3 border bg-light-subtle hover-card" @click="refreshProfile(item.id)">
                        <img :src="getRelativeAvatar(item.id)" class="relative-card-avatar rounded-3" alt="Enfant">
                        <div class="flex-grow-1 min-w-0">
                          <div class="fw-bold text-dark text-truncate relative-card-name">
                            {{ getRelativePerson(item.id)?.first_name }} {{ getRelativePerson(item.id)?.last_name }}
                          </div>
                          <div class="text-muted small font-monospace" style="font-size: 11px;">
                            {{ getRelativeLifespan(item.id) }}
                          </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted opacity-50 pe-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Parents & Ascendance (Parents & Grands-parents) -->
              <div v-if="parents.length || hasGrandparents" class="family-group-card bg-white border rounded-4 p-3 shadow-xs">
                <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <i class="bi bi-diagram-2-fill text-primary fs-5" />
                  <h6 class="fw-bold text-dark mb-0 fs-6">Ascendance directe</h6>
                </div>

                <!-- Parents -->
                <div v-if="parents.length" class="mb-3">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    👑 {{ $t('parents') }} ({{ parents.length }})
                  </div>
                  <div class="row g-2">
                    <div v-for="item in parents" :key="item.id" class="col-12 col-sm-6">
                      <div class="relative-card d-flex align-items-center gap-2 p-2 rounded-3 border bg-light-subtle hover-card" @click="refreshProfile(item.id)">
                        <img :src="getRelativeAvatar(item.id)" class="relative-card-avatar rounded-3" alt="Parent">
                        <div class="flex-grow-1 min-w-0">
                          <div class="fw-bold text-dark text-truncate relative-card-name">
                            {{ getRelativePerson(item.id)?.first_name }} {{ getRelativePerson(item.id)?.last_name }}
                          </div>
                          <div class="text-muted small font-monospace" style="font-size: 11px;">
                            {{ getRelativeLifespan(item.id) }}
                          </div>
                        </div>
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-1" style="font-size: 10px;">
                          {{ item.relation_type === 'mother' ? 'Mère' : 'Père' }}
                        </span>
                        <i class="bi bi-chevron-right text-muted opacity-50 pe-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Grands-parents paternels -->
                <div v-if="paternalGrandparents.length" class="mb-3">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    📜 {{ $t('grandparents-paternal') }}
                  </div>
                  <div class="row g-2">
                    <div v-for="item in paternalGrandparents" :key="item.id" class="col-12 col-sm-6">
                      <div class="relative-card d-flex align-items-center gap-2 p-2 rounded-3 border bg-light-subtle hover-card" @click="refreshProfile(item.id)">
                        <img :src="getRelativeAvatar(item.id)" class="relative-card-avatar rounded-3" alt="Grand-parent">
                        <div class="flex-grow-1 min-w-0">
                          <div class="fw-bold text-dark text-truncate relative-card-name">
                            {{ item.first_name }} {{ item.last_name }}
                          </div>
                          <div class="text-muted small font-monospace" style="font-size: 11px;">
                            {{ getRelativeLifespan(item.id) }}
                          </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted opacity-50 pe-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Grands-parents maternels -->
                <div v-if="maternalGrandparents.length">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    📜 {{ $t('grandparents-maternal') }}
                  </div>
                  <div class="row g-2">
                    <div v-for="item in maternalGrandparents" :key="item.id" class="col-12 col-sm-6">
                      <div class="relative-card d-flex align-items-center gap-2 p-2 rounded-3 border bg-light-subtle hover-card" @click="refreshProfile(item.id)">
                        <img :src="getRelativeAvatar(item.id)" class="relative-card-avatar rounded-3" alt="Grand-parent">
                        <div class="flex-grow-1 min-w-0">
                          <div class="fw-bold text-dark text-truncate relative-card-name">
                            {{ item.first_name }} {{ item.last_name }}
                          </div>
                          <div class="text-muted small font-monospace" style="font-size: 11px;">
                            {{ getRelativeLifespan(item.id) }}
                          </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted opacity-50 pe-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Fratrie (Frères & Sœurs) -->
              <div v-if="siblings.length" class="family-group-card bg-white border rounded-4 p-3 shadow-xs">
                <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <i class="bi bi-people-fill text-warning fs-5" />
                  <h6 class="fw-bold text-dark mb-0 fs-6">{{ $t('siblings') }} ({{ siblings.length }})</h6>
                </div>
                <div class="row g-2">
                  <div v-for="item in siblings" :key="item.id" class="col-12 col-sm-6">
                    <div class="relative-card d-flex align-items-center gap-2 p-2 rounded-3 border bg-light-subtle hover-card" @click="refreshProfile(item.id)">
                      <img :src="getRelativeAvatar(item.id)" class="relative-card-avatar rounded-3" alt="Fratrie">
                      <div class="flex-grow-1 min-w-0">
                        <div class="fw-bold text-dark text-truncate relative-card-name">
                          {{ getRelativePerson(item.id)?.first_name }} {{ getRelativePerson(item.id)?.last_name }}
                        </div>
                        <div class="text-muted small font-monospace" style="font-size: 11px;">
                          {{ getRelativeLifespan(item.id) }}
                        </div>
                      </div>
                      <i class="bi bi-chevron-right text-muted opacity-50 pe-1" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Famille élargie (Oncles, Tantes, Cousins) -->
              <div v-if="hasExtendedFamily" class="family-group-card bg-white border rounded-4 p-3 shadow-xs">
                <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <i class="bi bi-tree-fill text-success fs-5" />
                  <h6 class="fw-bold text-dark mb-0 fs-6">Famille élargie</h6>
                </div>

                <!-- Oncles & Tantes -->
                <div v-if="unclesAndAuntsList.length" class="mb-3">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    {{ $t('uncles-aunts') }} ({{ unclesAndAuntsList.length }})
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="item in unclesAndAuntsList"
                      :key="item.id"
                      type="button"
                      class="btn btn-light btn-sm border rounded-pill d-flex align-items-center gap-2 py-1 px-2 shadow-xs hover-card"
                      @click="refreshProfile(item.id)"
                    >
                      <img :src="getRelativeAvatar(item.id)" class="rounded-circle" style="width: 22px; height: 22px; object-fit: cover;" alt="Avatar">
                      <span class="fw-semibold text-dark">{{ getPersonName(item.id) }}</span>
                    </button>
                  </div>
                </div>

                <!-- Cousins -->
                <div v-if="cousinsList.length">
                  <div class="section-micro-label text-muted small fw-bold text-uppercase mb-2">
                    {{ $t('cousins') }} ({{ cousinsList.length }})
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="item in cousinsList"
                      :key="item.id"
                      type="button"
                      class="btn btn-light btn-sm border rounded-pill d-flex align-items-center gap-2 py-1 px-2 shadow-xs hover-card"
                      @click="refreshProfile(item.id)"
                    >
                      <img :src="getRelativeAvatar(item.id)" class="rounded-circle" style="width: 22px; height: 22px; object-fit: cover;" alt="Avatar">
                      <span class="fw-semibold text-dark">{{ getPersonName(item.id) }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── TAB 2: EVENTS & TIMELINE ────────────────────────────────────── -->
          <div v-show="activeTab === 'events'" class="tab-pane-fade">
            <!-- Header bar with event actions -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="text-muted small fw-semibold">
                {{ person?.events?.length || 0 }} événement{{ (person?.events?.length || 0) > 1 ? 's' : '' }} chronologique{{ (person?.events?.length || 0) > 1 ? 's' : '' }}
              </div>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
                  type="button"
                  :title="$t('add')"
                  @click="addEvent"
                >
                  <i class="bi bi-plus-lg" />
                  <span>{{ $t('add') }}</span>
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
                  type="button"
                  :title="$t('manage-events')"
                  @click="manageEvents"
                >
                  <i class="bi bi-gear" />
                  <span>{{ $t('manage') }}</span>
                </button>
              </div>
            </div>

            <!-- Empty events state -->
            <div v-if="!person?.events || person.events.length === 0" class="card border rounded-4 p-4 text-center bg-white shadow-xs">
              <div class="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mx-auto mb-2" style="width: 48px; height: 48px;">
                <i class="bi bi-calendar-x fs-4" />
              </div>
              <h6 class="fw-bold text-dark mb-1">Aucun événement enregistré</h6>
              <p class="text-muted small mb-3">Enregistrez les mariages, naissances, diplômes, lieux de vie ou distinctions.</p>
              <div>
                <button class="btn btn-sm btn-outline-success rounded-pill px-3" type="button" @click="addEvent">
                  <i class="bi bi-plus-lg me-1" />Ajouter le premier événement
                </button>
              </div>
            </div>

            <!-- Chronological Timeline -->
            <div v-else class="card border rounded-4 bg-white p-3 p-sm-4 shadow-xs">
              <div class="timeline-container ps-3 ms-2">
                <div v-for="event in sortedEvents" :key="event.id" class="timeline-event-item position-relative pb-4 ps-4">
                  <!-- Category Dot -->
                  <div class="timeline-dot" :class="'dot-' + (event.event_type || '').toLowerCase()" />

                  <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-1">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                      <!-- Year pill -->
                      <span class="badge fw-bold px-2 py-1 rounded-pill" :class="getEventBadgeClass(event.event_type)">
                        {{ new Date(event.event_date).getFullYear() }}
                      </span>

                      <!-- Event Title / Category -->
                      <span class="badge bg-light text-dark border px-2 py-1 fw-semibold d-flex align-items-center gap-1">
                        <span v-if="event.event_type === 'birth' || event.event_type === 'death'">{{ $t(event.event_type) }}</span>
                        <span v-else-if="event.event_type === 'marriage'">
                          {{ $t('marriedTo') }} <span v-for="related in event.related_persons" :key="related.id">
                            <a href="#" class="text-primary text-decoration-none fw-bold" @click.prevent="refreshProfile(related.id)">{{ getPersonName(related.id) }}</a>
                          </span>
                        </span>
                        <span v-else-if="event.event_type === 'child'">
                          {{ $t('hasAChild') }} <span v-for="related in event.related_persons" :key="related.id">
                            <a href="#" class="text-primary text-decoration-none fw-bold" @click.prevent="refreshProfile(related.id)">{{ getPersonName(related.id) }}</a>
                          </span>
                        </span>
                        <span v-else-if="event.event_type === 'divorce'">
                          {{ $t('divorcedFrom') }} <span v-for="related in event.related_persons" :key="related.id">
                            <a href="#" class="text-primary text-decoration-none fw-bold" @click.prevent="refreshProfile(related.id)">{{ getPersonName(related.id) }}</a>
                          </span>
                        </span>
                        <span v-else>{{ $t(event.event_type) || event.event_type }}</span>
                      </span>

                      <!-- Age at event -->
                      <span v-if="calculateAgeAtEvent(person.birth_date, event.event_date) > 0" class="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1" style="font-size: 11px;">
                        ~{{ calculateAgeAtEvent(person.birth_date, event.event_date) }} {{ $t('yearsOld') }}
                      </span>
                    </div>

                    <button class="btn btn-sm btn-link text-muted p-1 hover-primary shadow-none" type="button" :title="$t('edit')" @click="editEvent(event.id)">
                      <i class="bi bi-pencil" />
                    </button>
                  </div>

                  <!-- Date & Place -->
                  <div class="text-muted small d-flex flex-wrap gap-3 mt-1">
                    <span v-if="event.event_date">
                      <i class="bi bi-calendar-event me-1 text-primary" />{{ event.event_date }}
                    </span>
                    <span v-if="event.event_place">
                      <i class="bi bi-geo-alt-fill text-danger me-1" />{{ event.event_place }}
                    </span>
                  </div>

                  <!-- Notes -->
                  <p v-if="event.event_notes" class="text-dark small bg-light p-2 px-3 rounded-3 border-start border-3 border-primary mt-2 mb-0">
                    {{ event.event_notes }}
                  </p>

                  <!-- Attachments preview -->
                  <div v-if="event.related_attachments && event.related_attachments.length" class="mt-2 d-flex flex-wrap gap-2">
                    <div v-for="attachment in event.related_attachments" :key="attachment.id" class="attachment-thumb-wrap">
                      <img :src="getAttachmentPath(attachment.filepath)" alt="Pièce jointe" class="img-thumbnail rounded-3 shadow-xs" @click="openAttachmentModal(attachment.filepath)">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── TAB 3: GALLERY & DOCUMENTS ──────────────────────────────────── -->
          <div v-show="activeTab === 'gallery'" class="tab-pane-fade">
            <div class="card border rounded-4 bg-white p-3 p-sm-4 shadow-xs">
              <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <i class="bi bi-images text-indigo fs-5" />
                <h6 class="fw-bold text-dark mb-0 fs-6">Galerie des documents & photos</h6>
              </div>
              <div class="row g-3">
                <div v-for="(att, idx) in allAttachments" :key="idx" class="col-6 col-sm-4 col-md-3">
                  <div class="gallery-item-card border rounded-3 p-1 bg-light shadow-xs hover-card" @click="openAttachmentModal(att.filepath)">
                    <img :src="getAttachmentPath(att.filepath)" alt="Document" class="w-100 rounded-2 gallery-img">
                    <div v-if="att.event_date || att.event_type" class="p-1 text-center">
                      <div class="text-dark small fw-bold text-truncate">{{ $t(att.event_type) || att.event_type }}</div>
                      <div class="text-muted font-monospace" style="font-size: 10px;">{{ att.event_date }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── TAB 4: MAP & PLACES ─────────────────────────────────────────── -->
          <div v-show="activeTab === 'map'" class="tab-pane-fade">
            <ProfilePlacesMap ref="placesMap" :person="person" @add-event="addEvent" />
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
import ProfilePlacesMap from './ProfilePlacesMap.vue'

export default {
  components: {
    AttachmentViewModal,
    ProfilePlacesMap
  },
  inject: {
    openModalWithContext: {
      default: null
    }
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
      currentAttachment: '',
      activeTab: 'family' // 'family' | 'events' | 'map' | 'gallery'
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
    birthPlace () {
      const bEv = (this.person?.events || []).find(e => (e.event_type || '').toLowerCase() === 'birth' && e.event_place)
      return bEv?.event_place || ''
    },
    deathPlace () {
      const dEv = (this.person?.events || []).find(e => (e.event_type || '').toLowerCase() === 'death' && e.event_place)
      return dEv?.event_place || ''
    },
    totalPlacesCount () {
      if (!this.person?.events) return 0
      const places = new Set()
      this.person.events.forEach(ev => {
        if (ev.event_place && ev.event_place.trim()) {
          places.add(ev.event_place.trim())
        }
      })
      return places.size
    },
    sortedEvents () {
      if (!this.person?.events) return []
      return [...this.person.events].sort((a, b) => {
        const dA = new Date(a.event_date || '9999-12-31')
        const dB = new Date(b.event_date || '9999-12-31')
        return dA - dB
      })
    },
    allAttachments () {
      const list = []
      if (!this.person?.events) return list
      this.person.events.forEach(ev => {
        if (ev.related_attachments && ev.related_attachments.length) {
          ev.related_attachments.forEach(att => {
            list.push({
              ...att,
              event_date: ev.event_date,
              event_type: ev.event_type,
              event_place: ev.event_place
            })
          })
        }
      })
      return list
    },
    relativeSections () {
      return [
        { label: this.$t('grandparents-paternal'), items: this.getGrandparents('father') },
        { label: this.$t('grandparents-maternal'), items: this.getGrandparents('mother') },
        { label: this.$t('parents'), items: this.parents },
        { label: this.$t('spouses'), items: this.spouses },
        { label: this.$t('children'), items: this.children },
        { label: this.$t('siblings'), items: this.siblings },
        { label: this.$t('uncles-aunts'), items: this.getUnclesAndAunts() },
        { label: this.$t('cousins'), items: this.getCousins() }
      ]
    },
    paternalGrandparents () {
      return this.getGrandparents('father')
    },
    maternalGrandparents () {
      return this.getGrandparents('mother')
    },
    hasGrandparents () {
      return this.paternalGrandparents.length > 0 || this.maternalGrandparents.length > 0
    },
    unclesAndAuntsList () {
      return this.getUnclesAndAunts()
    },
    cousinsList () {
      return this.getCousins()
    },
    hasExtendedFamily () {
      return this.unclesAndAuntsList.length > 0 || this.cousinsList.length > 0
    },
    totalRelativesCount () {
      return (
        this.parents.length +
        this.spouses.length +
        this.children.length +
        this.siblings.length +
        this.paternalGrandparents.length +
        this.maternalGrandparents.length +
        this.unclesAndAuntsList.length +
        this.cousinsList.length
      )
    },
    parents () {
      return this.filteredRelatives('mother').concat(this.filteredRelatives('father')).sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id)
        const childB = this.dataPersons.find(person => person.id === b.id)
        const birthDateA = new Date(childA?.birth_date || '9999-12-31')
        const birthDateB = new Date(childB?.birth_date || '9999-12-31')
        return birthDateA - birthDateB
      })
    },
    spouses () {
      return this.filteredRelatives('spouse').sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id)
        const childB = this.dataPersons.find(person => person.id === b.id)
        const birthDateA = new Date(childA?.birth_date || '9999-12-31')
        const birthDateB = new Date(childB?.birth_date || '9999-12-31')
        return birthDateA - birthDateB
      })
    },
    children () {
      return this.filteredRelatives('child').sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id)
        const childB = this.dataPersons.find(person => person.id === b.id)
        const birthDateA = new Date(childA?.birth_date || '9999-12-31')
        const birthDateB = new Date(childB?.birth_date || '9999-12-31')
        return birthDateA - birthDateB
      })
    },
    siblings () {
      return this.filteredRelatives('brother').concat(this.filteredRelatives('sister')).sort((a, b) => {
        const childA = this.dataPersons.find(person => person.id === a.id)
        const childB = this.dataPersons.find(person => person.id === b.id)
        const birthDateA = new Date(childA?.birth_date || '9999-12-31')
        const birthDateB = new Date(childB?.birth_date || '9999-12-31')
        return birthDateA - birthDateB
      })
    },
    age () {
      if (this.person?.birth_date) {
        const birthDate = new Date(this.person.birth_date)
        const endDate = this.person.death_date ? new Date(this.person.death_date) : new Date()
        let age = endDate.getFullYear() - birthDate.getFullYear()
        const monthDiff = endDate.getMonth() - birthDate.getMonth()
        const dayDiff = endDate.getDate() - birthDate.getDate()

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--
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
    selectTab (tab) {
      this.activeTab = tab
      if (tab === 'map') {
        this.$nextTick(() => {
          this.$refs.placesMap?.invalidateSize()
        })
      }
    },
    formatDate (dateStr) {
      if (!dateStr) return ''
      try {
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          const d = new Date(dateStr)
          if (!isNaN(d.getTime())) {
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          }
        }
        return dateStr
      } catch (e) {
        return dateStr
      }
    },
    getRelativePerson (id) {
      return this.dataPersons.find(p => p.id === id) || null
    },
    getRelativeAvatar (id) {
      const p = this.getRelativePerson(id)
      if (!p) return '/profile_men.png'
      if (p.picture) return this.getDataUrl() + p.picture
      return p.gender === 'Female' ? '/profile_women.png' : '/profile_men.png'
    },
    getRelativeLifespan (id) {
      const p = this.getRelativePerson(id)
      if (!p) return ''
      const bYear = p.birth_date ? new Date(p.birth_date).getFullYear() : '?'
      const dYear = p.death_date ? new Date(p.death_date).getFullYear() : (p.death_date === null ? 'présent' : '')
      if (dYear === 'présent') return `${bYear} – présent`
      if (dYear) return `${bYear} – ${dYear}`
      return `${bYear}`
    },
    getEventBadgeClass (type) {
      const t = (type || '').toLowerCase()
      if (t === 'birth') return 'bg-success text-white'
      if (t === 'death') return 'bg-secondary text-white'
      if (t === 'marriage') return 'bg-warning text-dark'
      if (t === 'child') return 'bg-primary text-white'
      if (t === 'divorce') return 'bg-danger text-white'
      return 'bg-info text-dark'
    },
    getCousins () {
      const unclesAndAunts = this.getUnclesAndAunts()
      let cousins = []
      unclesAndAunts.forEach(uncleOrAunt => {
        const relative = this.dataPersons.find(p => p.id === uncleOrAunt.id)
        if (relative && relative.relatives) {
          const children = relative.relatives.filter(r => r.relation_type === 'child')
          cousins = cousins.concat(children)
        }
      })
      return cousins
    },
    getUnclesAndAunts () {
      if (!this.person || !this.person.relatives) return []
      const parentIds = this.person.relatives
        .filter(r => r.relation_type === 'father' || r.relation_type === 'mother')
        .map(p => p.id)
      if (parentIds.length === 0) return []
      const unclesAndAunts = []
      parentIds.forEach(parentId => {
        const parent = this.dataPersons.find(p => p.id === parentId)
        if (parent && parent.relatives) {
          parent.relatives
            .filter(r => r.relation_type === 'brother' || r.relation_type === 'sister')
            .forEach(r => unclesAndAunts.push(r))
        }
      })
      return unclesAndAunts
    },
    getGrandparents (relationType) {
      if (!this.person || !this.person.relatives) return []
      const parentIds = this.person.relatives
        .filter(r => r.relation_type === relationType)
        .map(p => p.id)
      if (parentIds.length === 0) return []
      const grandparentIds = new Set()
      parentIds.forEach(parentId => {
        const parent = this.dataPersons.find(p => p.id === parentId)
        if (parent && parent.relatives) {
          parent.relatives
            .filter(r => r.relation_type === 'father' || r.relation_type === 'mother')
            .forEach(r => grandparentIds.add(r.id))
        }
      })
      return Array.from(grandparentIds)
        .map(id => this.dataPersons.find(person => person.id === id))
        .filter(grandparent => grandparent)
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
      const person = this.dataPersons.find(p => p.id === id)
      if (person) {
        const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : 'Unknown'
        return `${person.first_name} ${person.last_name} (${birthYear})`
      }
      return 'Unknown'
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
    editPerson () {
      this.openContextModal('persons', { person: this.person })
    },
    manageRelatives () {
      this.openContextModal('relatives', { person: this.person })
    },
    manageEvents () {
      this.openContextModal('events', { person: this.person })
    },
    addEvent () {
      this.openContextModal('events', { person: this.person, action: 'add' })
    },
    editEvent (eventId) {
      this.openContextModal('events', { person: this.person, eventId })
    },
    openContextModal (modalId, options = {}) {
      if (!this.openModalWithContext) {
        return
      }
      const modalElement = document.getElementById('profileModal')
      const bsModal = modalElement ? Modal.getInstance(modalElement) : null
      const proceed = () => {
        this.openModalWithContext(modalId, options)
      }
      if (bsModal && modalElement && modalElement.classList.contains('show')) {
        const onHidden = () => {
          modalElement.removeEventListener('hidden.bs.modal', onHidden)
          proceed()
        }
        modalElement.addEventListener('hidden.bs.modal', onHidden)
        bsModal.hide()
      } else {
        proceed()
      }
    },
    show () {
      const modalElement = document.getElementById('profileModal')
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement)
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
.profile-hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%);
  border-color: #e2e8f0 !important;
}

.profile-hero-avatar {
  width: 104px;
  height: 104px;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.16);
}

.profile-hero-title {
  font-size: 24px;
  letter-spacing: -0.02em;
}

.vital-fact-chip {
  min-height: 48px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.vital-fact-icon {
  width: 32px;
  height: 32px;
  font-size: 14px;
  flex-shrink: 0;
}

.vital-fact-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  line-height: 1.1;
}

.vital-fact-value {
  font-size: 13px;
  line-height: 1.2;
}

.vital-fact-place {
  font-size: 11px;
  line-height: 1.1;
}

.bg-emerald-light {
  background-color: #ecfdf5;
}

.status-pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  animation: pulseEmerald 2s infinite ease-in-out;
  margin: 0 4px;
}

@keyframes pulseEmerald {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Tabs */
.profile-tabs-wrapper {
  user-select: none;
}

.profile-tab-pill {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-tab-pill:hover {
  color: #0f172a;
}

.profile-tab-pill.active {
  background-color: #0f172a;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

/* Relative cards */
.relative-card {
  cursor: pointer;
  transition: all 0.15s ease;
}

.relative-card:hover {
  background-color: #eff6ff !important;
  border-color: #bfdbfe !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important;
}

.relative-card-avatar {
  width: 44px;
  height: 44px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid #ffffff;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
}

.relative-card-name {
  font-size: 13px;
  line-height: 1.2;
}

.section-micro-label {
  font-size: 11px;
  letter-spacing: 0.03em;
}

.hover-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.hover-lift:hover {
  transform: translateY(-1px);
}

/* Timeline */
.timeline-container {
  border-left: 2px solid #e2e8f0;
}

.timeline-event-item:last-child {
  padding-bottom: 0 !important;
}

.timeline-dot {
  position: absolute;
  left: -22px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #3b82f6;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 2px #93c5fd;
}

.timeline-dot.dot-birth {
  background-color: #10b981;
  box-shadow: 0 0 0 2px #a7f3d0;
}

.timeline-dot.dot-death {
  background-color: #64748b;
  box-shadow: 0 0 0 2px #cbd5e1;
}

.timeline-dot.dot-marriage {
  background-color: #f59e0b;
  box-shadow: 0 0 0 2px #fde68a;
}

.timeline-dot.dot-child {
  background-color: #6366f1;
  box-shadow: 0 0 0 2px #c7d2fe;
}

.timeline-dot.dot-divorce {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px #fecaca;
}

.attachment-thumb-wrap img {
  width: 58px;
  height: 58px;
  object-fit: cover;
  cursor: pointer;
  border-color: #e2e8f0;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.attachment-thumb-wrap img:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  border-color: #3b82f6;
}

.gallery-img {
  height: 120px;
  object-fit: cover;
  cursor: pointer;
}

.gallery-item-card {
  cursor: pointer;
}

.hover-primary:hover {
  color: #2563eb !important;
}

.bg-indigo {
  background-color: #6366f1;
}

.tab-pane-fade {
  animation: fadeInTab 0.2s ease-out;
}

@keyframes fadeInTab {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
