#!/usr/bin/env python3
"""Build the CS109 course outline the app reads, from the reader snapshot in data/cs109/source.

Each numbered part of the reader becomes one deck, the way each book chapter is one deck in the
Bertsekas course. A part's chapters and its worked applications are listed in reader order; lessons
are added to a part when that part is implemented. The Reference part and the Drafts part are not
decks: the first is lookup material and the second is unpublished work in progress.
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/cs109/source/manifest.json'
OUT = ROOT / 'src/data/cs109-course.json'
NOT_DECKS = {'notation': 'reference', 'drafts': 'drafts'}


def title_text(html):
    """Outline titles carry inline HTML for emphasis, e.g. 'Probability of <b>or</b>'."""
    return re.sub(r'<b>(.*?)</b>', r'“\1”', html).strip()


def build():
    source = json.loads(SOURCE.read_text())
    titles, available = source['titles'], set(source['chapters'])
    entry = lambda chapter_id: {'id': chapter_id, 'title': title_text(titles[chapter_id]), 'available': chapter_id in available}
    parts, reference = [], None
    for part in source['outline']:
        chapters = [entry(c) for c in part.get('sections', [])]
        applications = [entry(c) for c in part.get('examples', [])]
        if part['key'] in NOT_DECKS:
            if NOT_DECKS[part['key']] == 'reference': reference = {'title': part['title'], 'chapters': chapters}
            continue
        number, name = re.match(r'Part (\d+): (.+)', part['title']).groups()
        parts.append({'deckId': f'cs109-part-{number}', 'number': int(number), 'key': part['key'], 'title': name,
                      'chapters': chapters, 'applications': applications})
    course = {
        'courseId': 'cs109',
        'title': 'Probability for Computer Scientists',
        'subtitle': 'Stanford CS109 course reader',
        'source': {'url': source['source'], 'book': source['book'], 'fetchedAt': source['fetchedAt']},
        'parts': parts,
        'reference': reference,
    }
    OUT.write_text(json.dumps(course, ensure_ascii=False, indent=2) + '\n')
    counts = ', '.join(f"Part {p['number']}: {len(p['chapters'])} chapters + {len(p['applications'])} applications" for p in parts)
    print(f'Built {len(parts)} parts. {counts}.')


if __name__ == '__main__':
    build()
