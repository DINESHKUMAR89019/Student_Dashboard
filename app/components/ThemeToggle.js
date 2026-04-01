"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = saved ? saved === "dark" : prefersDark;
    
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
  }, []);

  function applyTheme(isDarkMode) {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  }

  function toggleTheme() {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  }

  if (!mounted) return null;

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <span className={`theme-toggle-icon ${isDark ? "active" : ""}`}>🌙</span>
      <span className={`theme-toggle-icon ${!isDark ? "active" : ""}`}>☀️</span>
    </button>
  );
}
