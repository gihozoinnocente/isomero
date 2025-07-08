module.exports = {
    env: {
      browser: false,
      es2021: true,
      node: true,
      jest: true
    },
    extends: [
      'standard'
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      // Enforce semicolons
      'semi': ['error', 'always'],
      
      // Allow console.log in development
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      
      // Enforce consistent spacing
      'space-before-function-paren': ['error', 'never'],
      
      // Allow unused variables that start with underscore
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      
      // Enforce consistent quotes
      'quotes': ['error', 'single'],
      
      // Enforce consistent indentation
      'indent': ['error', 2],
      
      // Enforce consistent spacing around operators
      'space-infix-ops': 'error',
      
      // Enforce consistent spacing before blocks
      'space-before-blocks': 'error',
      
      // Enforce consistent spacing around keywords
      'keyword-spacing': 'error',
      
      // Enforce consistent spacing around commas
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      
      // Enforce consistent object curly spacing
      'object-curly-spacing': ['error', 'always'],
      
      // Enforce consistent array bracket spacing
      'array-bracket-spacing': ['error', 'never'],
      
      // Enforce consistent trailing commas
      'comma-dangle': ['error', 'never'],
      
      // Disallow multiple empty lines
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
      
      // Enforce consistent line endings
      'eol-last': ['error', 'always'],
      
      // Disallow trailing whitespace
      'no-trailing-spaces': 'error',
      
      // Enforce consistent spacing around arrow functions
      'arrow-spacing': 'error',
      
      // Prefer const for variables that are never reassigned
      'prefer-const': 'error',
      
      // Disallow var declarations
      'no-var': 'error',
      
      // Enforce consistent use of template literals
      'prefer-template': 'error',
      
      // Enforce consistent use of object shorthand
      'object-shorthand': 'error',
      
      // Disallow unnecessary return await
      'no-return-await': 'error',
      
      // Enforce consistent async/await usage
      'require-await': 'error',
      
      // Disallow console statements in production
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      
      // Enforce consistent naming conventions
      'camelcase': ['error', { 'properties': 'never', 'ignoreDestructuring': true }],
      
      // Enforce consistent brace style
      'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
      
      // Enforce consistent curly brace usage
      'curly': ['error', 'multi-line'],
      
      // Enforce consistent dot notation
      'dot-notation': 'error',
      
      // Disallow unnecessary function binding
      'no-extra-bind': 'error',
      
      // Disallow unnecessary labels
      'no-extra-label': 'error',
      
      // Disallow unnecessary semicolons
      'no-extra-semi': 'error',
      
      // Disallow irregular whitespace
      'no-irregular-whitespace': 'error',
      
      // Disallow unreachable code
      'no-unreachable': 'error',
      
      // Enforce consistent return statements
      'consistent-return': 'error'
    },
    overrides: [
      {
        files: ['**/__tests__/**/*', '**/*.test.js', '**/*.spec.js'],
        env: {
          jest: true
        },
        rules: {
          // Allow console in tests
          'no-console': 'off'
        }
      }
    ]
  };