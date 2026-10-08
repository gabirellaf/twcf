from pathlib import Path

MASTER_FILE = Path("where-kits-go.html")

START = '<nav class="site-nav">'
END = '</nav>'

master_text = MASTER_FILE.read_text(encoding="utf-8")

master_start = master_text.find(START)
master_end = master_text.find(END, master_start)

if master_start == -1 or master_end == -1:
    raise SystemExit("Could not find the navbar in where-kits-go.html.")

master_end += len(END)
master_nav = master_text[master_start:master_end]

updated = []
skipped = []

for path in Path(".").glob("*.html"):

    if path.name == MASTER_FILE.name:
        continue

    text = path.read_text(encoding="utf-8")

    start = text.find(START)
    end = text.find(END, start)

    if start == -1 or end == -1:
        skipped.append(path.name)
        continue

    end += len(END)

    new_text = text[:start] + master_nav + text[end:]
    path.write_text(new_text, encoding="utf-8")
    updated.append(path.name)

print("Updated:")
for name in updated:
    print(" -", name)

print(f"\nTotal updated: {len(updated)}")

if skipped:
    print("\nSkipped:")
    for name in skipped:
        print(" -", name)
