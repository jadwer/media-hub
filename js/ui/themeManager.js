/**
 * @fileoverview Theme management system for Media Hub.
 * Handles switching between light, dark, and metal themes with localStorage persistence.
 */

/** @type {Object<string, string>} Map of theme names to their CSS file paths */
const themes = {
  light: "styles/themes/light.css",
  dark: "styles/themes/dark.css",
  metal: "styles/themes/metal.css",
};

/**
 * Switches to a specific theme
 * Plays guitar riff if switching to metal theme
 * @param {string} theme - Theme name (light|dark|metal)
 */
export function switchTheme(theme) {
  const link = document.getElementById("themeStylesheet");
  if (themes[theme]) {
    link.href = themes[theme];
    localStorage.setItem("theme", theme);
    document.body.className = `${theme}-mode`;
    if (theme === "metal") {
      const riff = document.getElementById("riffPlayer");
      riff?.play().catch(() => {
        // silenciosamente ignora el error si autoplay está bloqueado
      });
    }
  } else {
    console.warn(`Tema "${theme}" no reconocido`);
  }
}

/**
 * Toggles through available themes in sequence (metal → dark → light → metal)
 */
export function toggleTheme() {
  const current = localStorage.getItem("theme") || "metal";
  const next =
    current === "metal" ? "dark" : current === "dark" ? "light" : "metal";
  switchTheme(next);
}

/**
 * Loads the saved theme from localStorage or defaults to metal
 */
export function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "metal";
  switchTheme(savedTheme);
}
