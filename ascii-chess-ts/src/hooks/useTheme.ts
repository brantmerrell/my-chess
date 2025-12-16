import { useState, useEffect } from "react";
import type { BootswatchTheme } from "../components/controls/ThemeSelector";

export const useTheme = (initialTheme: BootswatchTheme = "solar") => {
  const [theme, setTheme] = useState<BootswatchTheme>(() => {
    const savedTheme = localStorage.getItem("chess-theme");
    return (savedTheme as BootswatchTheme) || initialTheme;
  });

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const previousThemeLink = document.getElementById("bootstrap-theme");
        if (previousThemeLink) {
          previousThemeLink.remove();
        }

        const link = document.createElement("link");
        link.id = "bootstrap-theme";
        link.rel = "stylesheet";
        link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${theme}/bootstrap.min.css`;
        document.head.appendChild(link);

        localStorage.setItem("chess-theme", theme);
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    loadTheme();
  }, [theme]);

  return { theme, setTheme };
};
