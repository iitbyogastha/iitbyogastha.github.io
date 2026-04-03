import glob
from bs4 import BeautifulSoup
import re

for file in glob.glob("**/*.html", recursive=True):
    with open(file, "r", encoding='utf-8') as f:
        content = f.read()

    # Rename button id and onclick function
    content = content.replace('id="darkModeToggle"', 'id="themeToggle"')
    content = content.replace('onclick="toggleDarkMode()"', 'onclick="toggleTheme()"')
    
    # We will regex replace the old toggleDarkMode script block.
    # The old block looks like:
    # function toggleDarkMode() { ... }
    # // load saved theme ... if (localStorage... === "dark") { ... }
    
    script_regex = re.compile(
        r'function toggleDarkMode\(\)\s*\{[\s\S]*?localStorage\.getItem\("theme"\)\s*===\s*"dark"\)[\s\S]*?\}',
        re.MULTILINE
    )
    
    new_script = """function toggleTheme() {
  let theme = localStorage.getItem("theme") || "light";
  let nextTheme = "light";
  if (theme === "light") nextTheme = "dark";
  else if (theme === "dark") nextTheme = "saffron";
  else nextTheme = "light";
  setTheme(nextTheme);
}

function setTheme(theme) {
  document.body.classList.remove("dark", "saffron");
  if (theme !== "light") {
    document.body.classList.add(theme);
  }
  localStorage.setItem("theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    // Icon represents the NEXT mode you can click into
    if (theme === "light") btn.innerHTML = "&#x1F319;"; // Moon (click for Dark)
    else if (theme === "dark") btn.innerHTML = "&#x1F549;&#xFE0F;"; // Om (click for Saffron)
    else btn.innerHTML = "&#x2600;&#xFE0F;"; // Sun (click for Light)
  }
}

// load saved theme
let savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);"""

    content = script_regex.sub(new_script, content)

    with open(file, "w", encoding='utf-8') as f:
        f.write(content)

print("Updated JS and button triggers")
