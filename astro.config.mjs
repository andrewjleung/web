// @ts-check

import cloudflare from "@astrojs/cloudflare";
import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },

    integrations: [markdoc(), react()],

    redirects: {
        "/resume":
            "https://andrewjleung.github.io/resumes/AndrewLeung_Resume.pdf",
        "/github": "https://github.com/andrewjleung",
        "/linkedin": "https://linkedin.com/in/andrewjleung-",
    },

    adapter: cloudflare(),

    fonts: [
        {
            provider: fontProviders.fontshare(),
            name: "Switzer",
            cssVariable: "--font-switzer",
            styles: ["normal"],
            weights: ["100 900"],
        },
    ],
});
