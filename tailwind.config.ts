// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",          // escanea todo en app/
    "./components/**/*.{js,ts,jsx,tsx,mdx}",   // si tienes carpeta components
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",     // si usas sections
    // Agrega más carpetas si tienes clases Tailwind en otros lugares
  ],
  theme: {
    extend: {
      // Aquí puedes personalizar colores, espaciados, etc. más adelante
    },
  },
  plugins: [],
  // Opcional: controla el dark mode (útil para evitar problemas de colores lavados)
  darkMode: "class",  // o "media" si quieres que siga la preferencia del sistema
};

export default config;