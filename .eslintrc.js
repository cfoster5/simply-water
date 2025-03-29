// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "warn",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  ignorePatterns: ["/dist/*"],
};
