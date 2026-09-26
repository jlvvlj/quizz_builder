#!/usr/bin/env python3
"""Snapshot the published CS109 course reader (Probability for Computer Science, spring 2026).

The reader at https://probabilitycoders.stanford.edu/spr26/probability is a single-page app that
reads its outline and chapters from a public Firestore database. This script stores the same
documents the site renders, as plain JSON, so the course is built from a fixed snapshot rather
than from whatever the live site says on the day of a build.

Interactive demos are embedded in the source as whole React programs. Those are the site's own
code, not course content, and this app builds its own interactive figures, so each demo is kept
only as a placeholder with a hash of its source and the position it occupies in the chapter.
"""
import argparse, hashlib, json, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT, BOOK = 'probabilityforcs', 'cs109-spr26'
# The site's public web key, the one its own pages use to read published chapters.
KEY = 'AIzaSyBLMsP3hB-ndlRC2_d1POsKyO8tkPyFYmk'
BASE = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents/book/{BOOK}/published'


def plain(value):
    """Firestore's typed JSON to ordinary JSON."""
    if 'stringValue' in value: return value['stringValue']
    if 'arrayValue' in value: return [plain(v) for v in value['arrayValue'].get('values', [])]
    if 'mapValue' in value: return {k: plain(v) for k, v in value['mapValue'].get('fields', {}).items()}
    for kind in ('integerValue', 'doubleValue', 'booleanValue', 'timestampValue'):
        if kind in value: return value[kind]
    if 'nullValue' in value: return None
    raise ValueError(f'Unhandled Firestore value {list(value)}')


def fetch(path, fields):
    """Only the named fields: chapters also carry the editor's binary collaboration state."""
    with urllib.request.urlopen(f'{BASE}/{path}?key={KEY}', timeout=60) as response:
        found = json.load(response)['fields']
    return {k: plain(found[k]) for k in fields if k in found}


def strip_demos(node):
    if isinstance(node, dict):
        if node.get('type') == 'interactive-demo':
            source = (node.get('attrs') or {}).get('files', '')
            # Older demos store their files as a map, newer ones as a serialized string.
            if not isinstance(source, str): source = json.dumps(source, sort_keys=True)
            return {'type': 'interactive-demo', 'attrs': {'sourceSha256': hashlib.sha256(source.encode()).hexdigest(), 'sourceBytes': len(source)}}
        return {k: strip_demos(v) for k, v in node.items()}
    if isinstance(node, list): return [strip_demos(v) for v in node]
    return node


def main(dest):
    outline = fetch('outline', ('outline', 'titles'))
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'chapters').mkdir(exist_ok=True)
    chapters, unavailable = {}, []
    for part in outline['outline']:
        for chapter_id in part.get('sections', []) + part.get('examples', []):
            try:
                document = fetch(f'chapters/{chapter_id}/doc', ('staticContent', 'publishedFromScriptAt'))
            except urllib.error.HTTPError as error:
                if error.code != 404: raise
                unavailable.append(chapter_id)
                continue
            content = strip_demos(document['staticContent'])
            text = json.dumps(content, ensure_ascii=False, indent=1, sort_keys=True) + '\n'
            (dest / 'chapters' / f'{chapter_id}.json').write_text(text)
            chapters[chapter_id] = {'sha256': hashlib.sha256(text.encode()).hexdigest(), 'publishedAt': document.get('publishedFromScriptAt')}
    manifest = {
        'source': f'https://probabilitycoders.stanford.edu/spr26/probability',
        'title': 'Probability for Computer Science',
        'book': BOOK,
        'fetchedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'outline': outline['outline'],
        'titles': outline['titles'],
        'chapters': chapters,
        # Listed in the outline but not published as a chapter document (the site renders them specially or not at all).
        'unavailable': unavailable,
    }
    (dest / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
    print(f'Saved {len(chapters)} chapters; unavailable: {", ".join(unavailable) or "none"}.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dest', type=Path, default=ROOT / 'data/cs109/source')
    main(parser.parse_args().dest)
