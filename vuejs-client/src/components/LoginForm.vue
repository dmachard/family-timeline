<template>
  <div class="login-container">
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
        > {{ $t('username') }}</label>
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
        > {{ $t('password') }}</label>
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
        class="btn btn-primary"
      >
        {{ $t('login') }}
      </button>
    </form>
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
  
<style>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
}
</style>
