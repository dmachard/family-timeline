
import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
    eslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'], 
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
    }
  }
]