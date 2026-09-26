"""Shared helpers for building CS109 reader chapters into this app's lesson format."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/cs109/source'

# The reader's KaTeX macros, as its own renderer defines them, except that \P and \p expand to a
# plain P: the Bertsekas chapters write probabilities as P(...), and the notation layer recognises
# that form to explain a whole probability call rather than its letters one by one.
MACROS = {
    'P': 'P', 'p': 'P', 'E': 'E',
    'or': r'\text{ or }', 'and': r'\text{ and }', 'count': r'\text{count}',
    'Var': r'\text{Var}', 'c': 'C', 'N': r'\mathcal{N}',
    'Ber': r'\text{Bern}', 'Bin': r'\text{Bin}', 'Poi': r'\text{Poi}', 'Geo': r'\text{Geo}',
    'NegBin': r'\text{NegBin}', 'Exp': r'\text{Exp}', 'Beta': r'\text{Beta}', 'Uni': r'\text{Uni}',
}
# A control word ends at the first non-letter, so \p never matches the start of \pi or \partial.
_MACRO = re.compile(r'\\(' + '|'.join(sorted(MACROS, key=len, reverse=True)) + r')(?![A-Za-z])')


def expand_macros(tex: str) -> str:
    def replace(match):
        expansion = MACROS[match.group(1)]
        # After a control word (\log\P) a bare letter would fuse into it (\logP), so keep them apart.
        # Nothing is needed after the expansion: a control word always ends at a non-letter.
        joined = match.start() > 0 and tex[match.start() - 1].isalpha() and expansion[0].isalpha()
        return (' ' if joined else '') + expansion
    return _MACRO.sub(replace, tex)


def chapter(chapter_id: str) -> dict:
    return json.loads((SOURCE / 'chapters' / f'{chapter_id}.json').read_text())


def expressions(node):
    """Every inline and display TeX expression in a chapter document, in reading order."""
    if isinstance(node, dict):
        attrs = node.get('attrs') or {}
        if node.get('type') == 'math_inline': yield attrs.get('value', '')
        if node.get('type') == 'block-tex': yield attrs.get('rawTex', '')
        for child in node.get('content') or []: yield from expressions(child)
