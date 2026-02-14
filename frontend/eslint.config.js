import js from "@eslint/js";

const eslintConfig = [
    js.configs.recommended,
    {
        ignores: [".next/*", "node_modules/*"],
    },
    {
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    }
];

export default eslintConfig;
