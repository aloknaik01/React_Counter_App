import React, { useState, useEffect } from "react";
import Counter from "./components/Counter";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="app" style={{ textAlign: "center", padding: "20px" }}>
      <header>
        <h1>Counter App</h1>
        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"} Mode
        </button>
      </header>

      <Counter />
    </div>
  );
}

export default App;
