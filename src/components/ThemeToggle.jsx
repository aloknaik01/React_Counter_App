import { useEffect, useState } from "react";

const THEME_KEY = "counter-pro:theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const on = theme === "light";

  return (
    <button
      className="btn btn--ghost row"
      onClick={() => setTheme(on ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <div className={`switch ${on ? "switch--on" : ""}`} aria-hidden>
        <motion.div layout className="switch__dot" />
      </div>
      <span className="small muted">{on ? "Light" : "Dark"} mode</span>
    </button>
  );
}
