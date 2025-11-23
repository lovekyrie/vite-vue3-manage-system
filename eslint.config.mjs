// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'vue/custom-event-name-casing': 'off',
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
})
