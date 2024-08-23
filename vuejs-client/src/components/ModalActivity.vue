<template>
  <div
    id="activityModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="activityModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5
            id="activityModalLabel"
            class="modal-title"
          >
            {{ $t('activity') }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <div class="modal-body">
          <p>Contenu de l'activité...</p>
        </div>
      </div>
    </div>
  </div>
</template>
