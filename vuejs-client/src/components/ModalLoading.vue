<template>
  <!-- Bootstrap modal structure -->
  <div class="modal d-block" tabindex="-1" role="dialog" aria-labelledby="loadingModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content loading-glass-card shadow-lg p-4">
        <div class="modal-body text-center p-0">
          <div class="spinner-border text-primary mb-3" role="status" style="width: 2.75rem; height: 2.75rem; border-width: 3px;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h6 class="fw-bold text-dark mb-1">
            {{ $t('loading') || 'Loading data...' }}
          </h6>
          <p class="text-muted small mb-0">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.modal-backdrop {
  display: none !important;
}

.loading-glass-card {
  max-width: 280px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15) !important;
}

.modal-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
