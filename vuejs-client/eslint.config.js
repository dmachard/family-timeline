
import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  eslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'], 
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
    }
  }
]