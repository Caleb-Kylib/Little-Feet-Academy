"""Remove duplicate CSS rule blocks from style.css (keeps first occurrence)."""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS_PATH = ROOT / "style.css"
BACKUP = ROOT / "style.css.bak"


def split_css(css: str) -> list[str]:
    """Split into chunks: comments, @-rules, rule blocks."""
    chunks = []
    i = 0
    n = len(css)
    while i < n:
        if css[i : i + 2] == "/*":
            end = css.find("*/", i + 2)
            end = end + 2 if end != -1 else n
            chunks.append(css[i:end])
            i = end
            continue
        if css[i] == "@":
            # @media, @keyframes — balance braces
            depth = 0
            started = False
            j = i
            while j < n:
                if css[j] == "{":
                    depth += 1
                    started = True
                elif css[j] == "}":
                    depth -= 1
                    if started and depth == 0:
                        j += 1
                        break
                j += 1
            chunks.append(css[i:j])
            i = j
            continue
        if css[i] == "}":
            i += 1
            continue
        # rule block
        brace = css.find("{", i)
        if brace == -1:
            chunks.append(css[i:])
            break
        depth = 0
        j = brace
        while j < n:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            j += 1
        chunks.append(css[i:j])
        i = j
    return chunks


def fingerprint(chunk: str) -> str | None:
    chunk = chunk.strip()
    if not chunk or chunk.startswith("/*"):
        return None
    normalized = re.sub(r"\s+", " ", chunk)
    return hashlib.md5(normalized.encode()).hexdigest()


def main():
    css = CSS_PATH.read_text(encoding="utf-8")
    if not BACKUP.exists():
        BACKUP.write_text(css, encoding="utf-8")

    chunks = split_css(css)
    seen = set()
    out = []
    removed = 0
    for ch in chunks:
        fp = fingerprint(ch)
        if fp and fp in seen:
            removed += 1
            continue
        if fp:
            seen.add(fp)
        out.append(ch)

    result = "".join(out)
    # Trim excessive blank lines
    result = re.sub(r"\n{4,}", "\n\n\n", result)
    CSS_PATH.write_text(result, encoding="utf-8")
    print(f"deduped: removed {removed} blocks, {len(result)//1024} KB")


if __name__ == "__main__":
    main()
