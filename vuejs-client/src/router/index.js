import { createRouter, createWebHistory } from 'vue-router'

import LoginForm from '@/components/LoginForm.vue';
import TimelineD3Chart from '@/components/TimelineD3Chart.vue'
import ModalActivity from '@/components/ModalActivity.vue'

const routes = [
  { path: '/', redirect: '/timeline' },
  { path: '/login', component: LoginForm },
  { path: '/timeline', component: TimelineD3Chart, meta: { requiresAuth: true } },
  { path: '/activity', component: ModalActivity, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router
