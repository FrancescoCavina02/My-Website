import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

VAULT_PATH = "/Users/francescocavina/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Books"
OUTPUT_FILE = Path(__file__).parent / "data" / "notes.json"
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

# Titles to exclude from the exported notes
EXCLUDED_TITLES = {
    "Where do you get your dopamine",
    "Notes - Making Love",
}

from app.services.obsidian_parser import ObsidianParser

parser = ObsidianParser(VAULT_PATH)
notes = parser.parse_all_notes()

# Filter out excluded titles
filtered_notes = [n for n in notes if n.title not in EXCLUDED_TITLES]

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump([n.model_dump() for n in filtered_notes], f, indent=2, ensure_ascii=False, default=str)

print(f"✅ Exported {len(filtered_notes)} notes to {OUTPUT_FILE} ({len(notes) - len(filtered_notes)} excluded)")