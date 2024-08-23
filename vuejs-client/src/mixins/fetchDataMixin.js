// src/mixins/fetchDataMixin.js
export default {
  data () {
    return {
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchData (fetchFunction) {
      this.loading = true
      this.error = null
      try {
        const result = await fetchFunction()
        return result
      } catch (err) {
        this.error = err.message || 'An error occurred while fetching data.'
        throw err // Re-throw the error to allow specific handling in the component
      } finally {
        this.loading = false
      }
    }
  }
}
