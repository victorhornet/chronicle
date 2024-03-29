export default {
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: ['@/features/*/*'],
            },
        ],

        // ...rest of the configuration
    },

    extends: ['plugin:storybook/recommended']
};
