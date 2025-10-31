module.exports = {
    extends: ['../../.eslintrc.cjs', 'plugin:vue/vue3-recommended'],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: ['vue'],
    rules: {
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
    },
};
