import re

with open("assets/css/style.css", "r", encoding="utf-8") as f:
    css = f.read()

# Make the header
css = css.replace("/* ===== DARK MODE OVERRIDES ===== */", "/* ===== THEME MODE OVERRIDES (DARK & SAFFRON) ===== */")

# We want to find CSS rules and duplicate body.dark selectors inside them.
# A CSS rule: selectors { rules }
def process_css_block(match):
    selectors_str = match.group(1)
    body_str = match.group(2)
    
    if "body.dark" not in selectors_str:
        return match.group(0)
    
    selectors = [s.strip() for s in selectors_str.split(',')]
    new_selectors = []
    
    for s in selectors:
        new_selectors.append(s)
        if s.startswith("body.dark"):
            saff_s = s.replace("body.dark", "body.saffron")
            new_selectors.append(saff_s)
            
    return ",\n".join(new_selectors) + " {" + body_str + "}"

# Match any CSS block
css = re.sub(r'([^}{]*?)\s*\{([^}]*)\}', process_css_block, css)

with open("assets/css/style.css", "w", encoding="utf-8") as f:
    f.write(css)

print("Safely updated css with AST-like processing")
