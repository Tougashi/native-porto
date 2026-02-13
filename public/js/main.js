const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
}

// Theme: light / dark (system preference until user clicks toggle; choice is saved)
const THEME_KEY = "porto-theme";
const root = document.documentElement;

function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
}

function setTheme(value, save) {
    root.setAttribute("data-theme", value);
    if (save) localStorage.setItem(THEME_KEY, value);
}

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initTheme() {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
        setTheme(stored, false);
    } else {
        setTheme(getSystemTheme(), false);
    }
}

function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next, true);
}

initTheme();

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!getStoredTheme()) setTheme(getSystemTheme(), false);
});
