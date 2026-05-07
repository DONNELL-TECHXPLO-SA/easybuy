export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      ".next/**",
    ],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
