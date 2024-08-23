function loadConfig () {
  return window.config || {}
}

// Load the environment variables
const cfg = loadConfig()

export default cfg
