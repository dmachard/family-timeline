<template>
  <!-- Bootstrap modal structure -->
  <div class="modal d-block" tabindex="-1" role="dialog" aria-labelledby="loadingModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-body text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">
            Loading data, please wait...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure modal takes full viewport height for proper vertical centering */
.modal-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Hide the default modal backdrop */
.modal-backdrop {
  display: none !important; /* Ensure backdrop is not displayed */
}

/* Ensure modal-content is fully transparent and has no border */
.modal-content {
  border: none;
  background-color: transparent;
}

/* Ensure the spinner is centered and on top */
.modal-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1050; /* Ensure spinner is above other content */
}

/* Optionally, ensure the spinner is large and centered */
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
