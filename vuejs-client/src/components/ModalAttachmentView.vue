<template>
  <div id="attachmentModal" class="modal" tabindex="-1" aria-labelledby="attachmentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="attachmentModalLabel" class="modal-title">
            {{ $t('attachmentView') }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>

        <div class="modal-body d-flex justify-content-center align-items-center">
          <div id="image-container" class="w-100 h-100 position-relative overflow-hidden">
            <img id="zoomable-image" :src="attachmentPath" class="img-fluid" alt="Profile image" style="transform: scale(1);" @mousedown="startDragging" @mousemove="dragImage" @mouseup="stopDragging" @mouseleave="stopDragging" @dragstart.prevent>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-center">
          <button class="btn btn-primary" @click="zoomIn">
            +
          </button>
          <button class="btn btn-secondary" @click="zoomOut">
            -
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
    container.addEventListener('wheel', this.handleWheel)
  },
  methods: {
    show () {
      const modalElement = document.getElementById('attachmentModal')
      const modal = new Modal(modalElement)
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
      this.scale += 0.1
      this.applyTransform()
    },
    zoomOut () {
      if (this.scale > 0.2) {
        this.scale -= 0.1
        this.applyTransform()
      }
    },
    applyTransform () {
      const img = document.getElementById('zoomable-image')
      img.style.transform = `scale(${this.scale})`
    },
    startDragging (e) {
      this.isDragging = true
      const modalImage = e.target
      this.startX = e.clientX - modalImage.offsetLeft
      this.startY = e.clientY - modalImage.offsetTop
      modalImage.style.cursor = 'grabbing'
    },
    dragImage (e) {
      if (this.isDragging) {
        const modalImage = e.target
        const x = e.clientX - this.startX
        const y = e.clientY - this.startY
        modalImage.style.left = `${x}px`
        modalImage.style.top = `${y}px`
      }
    },
    stopDragging (event) {
      if (this.isDragging) {
        this.isDragging = false
        event.target.style.cursor = 'grab'
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
    max-width: 100%;
    max-height: 100%;
    position: absolute;
    object-fit: contain; /* Ensures the image scales correctly */
    transform-origin: center center; /* Ensures the zoom is centered */
    transition: transform 0.2s ease-in-out;
}

</style>
