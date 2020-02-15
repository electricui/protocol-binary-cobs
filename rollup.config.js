const config = require('@electricui/build-rollup-config/rollup.config.js')

export default async () => {
  // Import our default rollup config.
  const configOptions = {}

  return config(__dirname, configOptions)
}
