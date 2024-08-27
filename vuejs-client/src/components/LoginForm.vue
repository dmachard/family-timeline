<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card shadow p-5">
      <div class="card-body text-center">
        <img
          src="/favicon.png"
          alt="Family Timeline Logo"
          class="mb-3"
          style="max-width: 110px;"
        >
        <h2 class="mb-5">
          Family Timeline
        </h2>
        
        <!-- Error message -->
        <div
          v-if="errorMessage"
          class="alert alert-danger"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="login">
          <div class="mb-3">
            <label
              for="username"
              class="form-label"
            >{{ $t('username') }}</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-control"
              required
            >
          </div>
          <div class="mb-3">
            <label
              for="password"
              class="form-label"
            >{{ $t('password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              required
            >
          </div>
          <button
            type="submit"
            class="btn btn-primary w-100 mt-4"
          >
            {{ $t('login') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import apiClient from '../services/axiosInstance'

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '' 
    };
  },
  methods: {
    ...mapMutations(['setToken']),
    async login() {
      try {
        const response = await apiClient.post('/auth/login', {
          username: this.username,
          password: this.password
        });

        // Save the new tokens
        this.setToken(response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        // Redirect to dashboard or another page after successful login
        this.$router.push('/timeline');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
        this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    }
  } 
}
</script>
  
<style scoped>

</style>
