const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        map: "url(/map.svg)",
        "battle-one": "url(/test-bg.png)",
      },
      fontSize: {
        xxs: ".625rem",
      },
      cursor: {
        fancy: "url(/cursor.png), pointer",
        pointer: "url(/cursor.png), pointer",
        grab: "url(/grab.png), grab",
        crosshair: "url(/cursor-cross.png), crosshair",
        wait: "url(/images/eternum-logo_animated.png), wait",
      },
      strokeWidth: {
        8: "8px",
      },
      colors: {
        gold: "#F3C99F",
        crimson: "#582C4D",
        brilliance: "#7DFFBA",
        orange: "#FE993C",
        yellow: "#FAFF00",
        red: "#F24236",
        blueish: "#6B7FD7",
        "anger-light": "#CD8290",
        "gray-gold": "#776756",
        "light-pink": "#CAB1A6",
        gray: "#1B1B1B",
        brown: "#24130A",
        "light-red": "#EF5858",
        dark: "#48413C",
        "dark-brown": "#54433A",
        danger: "#C84444",
        "dark-green": "#064105",
        "dark-green-accent": "#3A3D23",
        green: "#06D6A0",
        lightest: "#FFF5EA",
        order: {
          power: "#F4B547",
          giants: "#EB544D",
          titans: "#EC68A8",
          skill: "#706DFF",
          perfection: "#8E35FF",
          twins: "#0020C6",
          reflection: "#00A2AA",
          detection: "#139757",
          fox: "#D47230",
          vitriol: "#59A509",
          brilliance: "#7DFFBA",
          enlightenment: "#1380FF",
          protection: "#00C3A1",
          fury: "#82005E",
          rage: "#C74800",
          anger: "#89192D",
          gods: "#94a3b8",
        },
        biome: {
          deep_ocean: "#3a5f65",
          ocean: "#62a68f",
          beach: "#ffe079",
          scorched: "#8B4513",
          bare: "#A8A8A8",
          tundra: "#B4C7D9",
          snow: "#FFFFFF",
          temperate_desert: "#f3c959",
          shrubland: "#b3ab3e",
          taiga: "#615b27",
          grassland: "#6b8228",
          temperate_deciduous_forest: "#57641f",
          temperate_rain_forest: "#5a6322",
          subtropical_desert: "#b2ac3a",
          tropical_seasonal_forest: "#596823",
          tropical_rain_forest: "#4f6123",
        },
      },
    },
  },
  safelist: [
    "bg-order-power",
    "bg-order-giants",
    "bg-order-titans",
    "bg-order-brilliance",
    "bg-order-skill",
    "bg-order-perfection",
    "bg-order-twins",
    "bg-order-reflection",
    "bg-order-detection",
    "bg-order-fox",
    "bg-order-vitriol",
    "bg-order-enlightenment",
    "bg-order-protection",
    "bg-order-fury",
    "bg-order-rage",
    "bg-order-anger",
    "bg-order-gods",
    "fill-order-power",
    "fill-order-giants",
    "fill-order-titans",
    "fill-order-brilliance",
    "fill-order-skill",
    "fill-order-perfection",
    "fill-order-twins",
    "fill-order-reflection",
    "fill-order-detection",
    "fill-order-fox",
    "fill-order-vitriol",
    "fill-order-enlightenment",
    "fill-order-protection",
    "fill-order-fury",
    "fill-order-rage",
    "fill-order-anger",
    "fill-order-gods",
    "stroke-order-power",
    "stroke-order-giants",
    "stroke-order-titans",
    "stroke-order-brilliance",
    "stroke-order-skill",
    "stroke-order-perfection",
    "stroke-order-twins",
    "stroke-order-reflection",
    "stroke-order-detection",
    "stroke-order-fox",
    "stroke-order-vitriol",
    "stroke-order-enlightenment",
    "stroke-order-protection",
    "stroke-order-fury",
    "stroke-order-rage",
    "stroke-order-anger",
    "stroke-order-gods",
    "text-order-power",
    "text-order-giants",
    "text-order-titans",
    "text-order-brilliance",
    "text-order-skill",
    "text-order-perfection",
    "text-order-twins",
    "text-order-reflection",
    "text-order-detection",
    "text-order-fox",
    "text-order-vitriol",
    "text-order-enlightenment",
    "text-order-protection",
    "text-order-fury",
    "text-order-rage",
    "text-order-anger",
    "text-order-gods",
    "text-biome-deep_ocean",
    "text-biome-ocean",
    "text-biome-beach",
    "text-biome-scorched",
    "text-biome-bare",
    "text-biome-tundra",
    "text-biome-snow",
    "text-biome-temperate_desert",
    "text-biome-shrubland",
    "text-biome-taiga",
    "text-biome-grassland",
    "text-biome-temperate_deciduous_forest",
    "text-biome-temperate_rain_forest",
    "text-biome-subtropical_desert",
    "text-biome-tropical_seasonal_forest",
    "text-biome-tropical_rain_forest",
  ],
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".border-gradient": {
          borderImage: "linear-gradient(to right, transparent, #F3C99F, transparent) 1",
        },
        ".clip-squared": {
          clipPath: "polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    }),
  ],
};
