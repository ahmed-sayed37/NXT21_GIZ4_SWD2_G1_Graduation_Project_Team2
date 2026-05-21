import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2/",
  plugins: [react(), tailwindcss()],
});
