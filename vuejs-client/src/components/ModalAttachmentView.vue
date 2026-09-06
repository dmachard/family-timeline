<template>
  <div id="attachmentModal" class="modal fade" tabindex="-1" aria-labelledby="attachmentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content border-0">
        <div class="modal-header d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="bi bi-card-image fs-5" />
            </div>
            <h5 id="attachmentModalLabel" class="modal-title mb-0 fw-bold text-dark">
              {{ $t('attachmentView') }}
            </h5>
          </div>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close" />
        </div>

        <div class="modal-body p-0 d-flex justify-content-center align-items-center viewer-body">
          <div id="image-container" class="w-100 h-100 position-relative overflow-hidden">
            <img
              id="zoomable-image"
              :src="attachmentPath"
              class="img-fluid"
              alt="Attachment image"
              :style="{ transform: `scale(${scale})`, left: `${posX}px`, top: `${posY}px` }"
              @mousedown="startDragging"
              @mousemove="dragImage"
              @mouseup="stopDragging"
              @mouseleave="stopDragging"
              @dragstart.prevent
            >
          </div>
        </div>

        <div class="modal-footer d-flex justify-content-center gap-2 py-3 bg-white border-top">
          <button class="btn btn-light border rounded-pill px-3 shadow-xs d-flex align-items-center gap-1" type="button" title="Zoom Out" @click="zoomOut">
            <i class="bi bi-zoom-out" />
          </button>
          <button class="btn btn-light border rounded-pill px-3 shadow-xs d-flex align-items-center gap-1" type="button" title="Reset Zoom" @click="resetZoom">
            <i class="bi bi-arrow-counterclockwise me-1" />
            <span class="small fw-semibold">{{ Math.round(scale * 100) }}%</span>
          </button>
          <button class="btn btn-light border rounded-pill px-3 shadow-xs d-flex align-items-center gap-1" type="button" title="Zoom In" @click="zoomIn">
            <i class="bi bi-zoom-in" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'

export default {
  props: {
    attachmentPath: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      scale: 1,
      posX: 0,
      posY: 0,
      isDragging: false,
      startX: 0,
      startY: 0
    }
  },
  mounted () {
    const container = document.getElementById('image-container')
    if (container) {
      container.addEventListener('wheel', this.handleWheel)
    }
  },
  methods: {
    show () {
      this.resetZoom()
      const modalElement = document.getElementById('attachmentModal')
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement)
      modal.show()
    },
    hide () {
      const modalElement = document.getElementById('attachmentModal')
      const modal = Modal.getInstance(modalElement)
      if (modal) {
        modal.hide()
      }
    },
    zoomIn () {
      this.scale = Math.min(this.scale + 0.15, 3.5)
    },
    zoomOut () {
      if (this.scale > 0.25) {
        this.scale = Math.max(this.scale - 0.15, 0.25)
      }
    },
    resetZoom () {
      this.scale = 1
      this.posX = 0
      this.posY = 0
    },
    startDragging (e) {
      this.isDragging = true
      this.startX = e.clientX - this.posX
      this.startY = e.clientY - this.posY
      e.target.style.cursor = 'grabbing'
    },
    dragImage (e) {
      if (this.isDragging) {
        this.posX = e.clientX - this.startX
        this.posY = e.clientY - this.startY
      }
    },
    stopDragging (event) {
      if (this.isDragging) {
        this.isDragging = false
        if (event && event.target) {
          event.target.style.cursor = 'grab'
        }
      }
    },
    handleWheel (event) {
      event.preventDefault()
      if (event.deltaY < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    }
  }
}
</script>

<style scoped>
.viewer-body {
  background-color: #0b0f19;
}

#image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

#zoomable-image {
  max-width: 90%;
  max-height: 90%;
  position: absolute;
  object-fit: contain;
  transform-origin: center center;
  transition: transform 0.15s ease-out;
  cursor: grab;
  user-select: none;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
</style>
