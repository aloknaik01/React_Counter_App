import React, { useState, useEffect } from "react";
import Counter from "./components/Counter";
import { motion } from "framer-motion";
import "./styles/index.css";
import { Moon, Sun, TableProperties } from "lucide-react";

function App() {
  const [theme, setTheme] = useState("light");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="app-container">
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="header">
          <h1 className="title"><div className="flex"><TableProperties /> Counter App</div></h1>
          <button className="toggle-btn" onClick={toggleTheme}>
            {theme === "light" ? (
              <div className="dark-btn">
                <Moon /> <span>Dark</span>
              </div>
            ) : (
              <div className="light-btn">
                <Sun /> <span>Light</span>
              </div>
            )}
          </button>
        </header>

        <Counter />
      </motion.div>
    </div>
  );
}

export default App;
