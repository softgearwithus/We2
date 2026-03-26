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
    },
    {
        files: ["**/*.cjs"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                __dirname: "readonly",
                console: "readonly",
                process: "readonly",
                require: "readonly",
                module: "readonly",
            },
        },
    },
    {
        files: ["next.config.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                process: "readonly",
            },
        },
    },
];

export default eslintConfig;
