"""Add loading=lazy to gallery/team/article images missing it."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATTERN = re.compile(
    r"<img(?![^>]*loading=)([^>]*class=\"[^\"]*(?:gallery|team-modern|article-img|activity-mini)[^\"]*\"[^>]*)>",
    re.I,
)


def main():
    for path in ROOT.glob("*.html"):
        if path.name.startswith("_"):
            continue
        html = path.read_text(encoding="utf-8")
        new = PATTERN.sub(r'<img loading="lazy"\1>', html)
        if new != html:
            path.write_text(new, encoding="utf-8")
            print("lazy", path.name)


if __name__ == "__main__":
    main()
