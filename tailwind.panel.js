const defaultConfig = require("./tailwind.config")

module.exports = {
  ...defaultConfig,
  corePlugins: {
    preflight: false,
  }
}