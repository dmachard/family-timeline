import { createStore } from 'vuex';
import { jwtDecode } from "jwt-decode";

export default createStore({
  state() {
    return {
      token: localStorage.getItem('token') || null,
      userName: null,
      userId: 0,
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
      try {
        const decodedToken = jwtDecode(token);
        state.userName = decodedToken.username
        state.userId = decodedToken.userId
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    },
    removeToken(state) {
      state.token = null;
      state.userName = null
      state.userId = 0
      localStorage.removeItem('token');
    },
    setInitialState(state) {
        const token = localStorage.getItem('token');
        if (token) {
            state.token = token;
            try {
                const decodedToken = jwtDecode(token);
                state.userName = decodedToken.username;
                state.userId = decodedToken.userId
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    },
  },
  actions: {
    initializeStore({ commit }) {
      commit('setInitialState');
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    userName(state) {
      return state.userName;
    },
  },
});
