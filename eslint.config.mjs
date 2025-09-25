import { defineConfig } from "eslint/config";

export default defineConfig([
	// ...other config
	{
		// Note: there should be no other properties in this object
		ignores: ["node_modules/**"],
	},
]);
