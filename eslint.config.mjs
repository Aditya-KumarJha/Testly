import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: ["node_modules/**", "tsconfig.tsbuildinfo"],
  },
];

export default config;
