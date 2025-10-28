module.exports = {
    root: true,
    env: {
        es2021: true,
        node: true,
        browser: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        'prettier/prettier': ['error', { tabWidth: 4, useTabs: true }],
        '@typescript-eslint/no-unused-vars': ['warn'],
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
    ignorePatterns: ['node_modules', 'dist', 'coverage', 'prisma'],
};
