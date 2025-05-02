// js/ui/themeManager.js

const themes = {
  light: "styles/themes/light.css",
  dark: "styles/themes/dark.css",
  metal: "styles/themes/metal.css",
};

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

export function toggleTheme() {
  const current = localStorage.getItem("theme") || "metal";
  const next =
    current === "metal" ? "dark" : current === "dark" ? "light" : "metal";
  switchTheme(next);
}

export function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "metal";
  switchTheme(savedTheme);
}
