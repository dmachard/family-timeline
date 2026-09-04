import { createStore } from 'vuex';
import { jwtDecode } from "jwt-decode";

const getStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
  return null;
};

const setStorageItem = (key, val) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, val);
    }
  } catch {
    // Ignore storage access errors
  }
};

const removeStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
};

export default createStore({
  state() {
    return {
      token: getStorageItem('token') || null,
      userName: null,
      userId: 0,
      shouldReloadTimeline: false
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      setStorageItem('token', token);
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
      removeStorageItem('token');
    },
    setInitialState(state) {
        const token = getStorageItem('token');
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
