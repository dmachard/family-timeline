import { createStore } from 'vuex';
import { jwtDecode } from "jwt-decode";

export default createStore({
  state() {
    return {
      token: localStorage.getItem('token') || null,
      userName: null,
      userId: 0,
      shouldReloadTimeline: false
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
    reloadTimeline(state) {
      state.shouldReloadTimeline = true;
    },
    resetTimelineReload(state) {
      state.shouldReloadTimeline = false;
    }
  },
  actions: {
    initializeStore({ commit }) {
      commit('setInitialState');
    },
    triggerTimelineReload({ commit }) {
      commit('reloadTimeline');
    },
    resetTimelineReload({ commit }) {
      commit('resetTimelineReload');
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    userName(state) {
      return state.userName;
    },
    shouldReloadTimeline(state) {
      return state.shouldReloadTimeline;
    },
  },
});
