import json
import sys
from pathlib import Path

# Make sure app package is importable
sys.path.insert(0, str(Path(__file__).parent))

VAULT_PATH = "/Users/francescocavina/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Books"
OUTPUT_FILE = Path(__file__).parent / "data" / "notes.json"
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

from app.services.obsidian_parser import ObsidianParser

parser = ObsidianParser(VAULT_PATH)
notes = parser.parse_all_notes()

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump([n.model_dump() for n in notes], f, indent=2, ensure_ascii=False, default=str)

print(f"✅ Exported {len(notes)} notes to {OUTPUT_FILE}")