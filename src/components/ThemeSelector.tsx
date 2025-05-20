
import React, { useEffect, useState } from "react";
import { Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

// Palette definition
const ACCENT_COLORS = [
  { name: "Azul", color: "#206594" },
  { name: "Morado", color: "#8B5CF6" },
  { name: "Rosa", color: "#D946EF" },
  { name: "Naranja", color: "#F97316" },
  { name: "Verde", color: "#86efac" },
  { name: "Amarillo", color: "#fde047" },
];

type Theme = "light" | "dark" | "system";

function getSystemTheme(): Theme {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export default function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>(
    () => localStorage.getItem("theme") as Theme || "system"
  );
  const [accent, setAccent] = useState<string>(() => localStorage.getItem("accent") || "#206594");

  // Apply theme (html.class for tailwind)
  useEffect(() => {
    let t = theme;
    if (theme === "system") {
      t = getSystemTheme();
    }
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply accent color by setting --primary, --primary-foreground
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", `${accent}`);
    // set a contrasting foreground color
    const y = getLuma(accent) > 180 ? "#222222" : "#fff";
    document.documentElement.style.setProperty("--primary-foreground", y);
    localStorage.setItem("accent", accent);
  }, [accent]);

  function getLuma(hex: string) {
    const c = hex.replace("#", "");
    const rgb = [
      parseInt(c.substring(0,2),16),
      parseInt(c.substring(2,4),16),
      parseInt(c.substring(4,6),16),
    ];
    // Perceived luminance formula
    return 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
  }

  return (
    <div className="fixed top-6 right-8 z-40 flex flex-col items-end gap-3">
      <div className="flex gap-2 bg-card p-2 rounded-lg border border-border shadow">
        <Button
          size="icon"
          variant={theme === "light" ? "default" : "ghost"}
          aria-label="Tema claro"
          onClick={() => setTheme("light")}
        >
          <Sun className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          variant={theme === "dark" ? "default" : "ghost"}
          aria-label="Tema oscuro"
          onClick={() => setTheme("dark")}
        >
          <Moon className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          variant={theme === "system" ? "default" : "ghost"}
          aria-label="Sistema"
          onClick={() => setTheme("system")}
        >
          <Palette className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex gap-2 bg-card p-2 rounded-lg border border-border shadow">
        {ACCENT_COLORS.map(item => (
          <button
            key={item.color}
            aria-label={item.name}
            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110`}
            style={{
              backgroundColor: item.color,
              borderColor: accent === item.color ? "#000" : item.color,
              boxShadow: accent === item.color ? "0 0 0 2px #222, 0 4px 40px " + item.color : undefined,
            }}
            onClick={() => setAccent(item.color)}
          />
        ))}
      </div>
    </div>
  );
}
