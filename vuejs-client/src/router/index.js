import { createRouter, createWebHistory } from 'vue-router'
import TimelineD3Chart from '@/components/TimelineD3Chart.vue'

const routes = [
  { path: '/', component: TimelineD3Chart }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
