# Frontend Integration Guide - Japanese Flashcard Quiz

## Database Structure

Each flashcard contains the following data structure:

```typescript
interface Flashcard {
    id: number;          // Unique identifier
    cardNumber: string;  // Core 4000 card number
    japanese: {
        word: string;    // Japanese word (kanji)
        reading: string; // Reading in hiragana
    };
    english: string;     // English translation
    partOfSpeech: string; // Grammatical category
    exampleSentence: {
        japanese: {
            text: string;   // Example sentence in Japanese
            reading: string; // Reading of the example sentence
        };
        english: string;    // English translation of example
    };
    audio: {
        word?: string;      // Path to word audio file
        sentence?: string;  // Path to sentence audio file
    };
    resources: {
        ojadUrl?: string;    // URL to OJAD pitch accent info
        pitchAccent?: string; // HTML table with pitch accent data
    };
}
```

## Project Structure

The Anki deck files are located in the `ankidecks/core4000` directory:
```
ankidecks/
  core4000/
    collection.anki2  # SQLite database
    media            # JSON mapping file for audio
    0               # Audio file
    1               # Audio file
    ...             # More audio files
```

## API Endpoints to Create

1. **Get Flashcard by ID**
   ```typescript
   GET /api/flashcard/:id
   ```
   Returns a single flashcard with all associated data.

2. **Get Flashcards by Page**
   ```typescript
   GET /api/flashcards?page=1&pageSize=10
   ```
   Returns paginated flashcards with total count.

3. **Get Audio File**
   ```typescript
   GET /api/audio/:fileId
   ```
   Streams the audio file for playback. The fileId will be the number from the media mapping.

## Frontend Implementation Guide

### 1. Audio Playback

Use the HTML5 Audio API to play the audio files:

```typescript
const playAudio = async (fileId: string) => {
    const audio = new Audio(`/api/audio/${fileId}`);
    await audio.play();
};
```

### 2. Quiz Component Example

```typescript
import { useState, useEffect } from 'react';

interface QuizProps {
    cardId: number;
}

export const QuizCard: React.FC<QuizProps> = ({ cardId }) => {
    const [card, setCard] = useState<Flashcard | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        const fetchCard = async () => {
            const response = await fetch(`/api/flashcard/${cardId}`);
            const data = await response.json();
            setCard(data);
        };
        fetchCard();
    }, [cardId]);

    const playWordAudio = () => {
        if (card?.audio?.word) {
            const fileId = card.audio.word.split('/').pop(); // Get the file number
            new Audio(`/api/audio/${fileId}`).play();
        }
    };

    const playSentenceAudio = () => {
        if (card?.audio?.sentence) {
            const fileId = card.audio.sentence.split('/').pop();
            new Audio(`/api/audio/${fileId}`).play();
        }
    };

    if (!card) return <div>Loading...</div>;

    return (
        <div className="quiz-card">
            <div className="japanese-word">
                <h2>{card.japanese.word}</h2>
                <button onClick={playWordAudio}>
                    Play Word Audio
                </button>
            </div>
            
            {showAnswer && (
                <>
                    <div className="reading">
                        Reading: {card.japanese.reading}
                    </div>
                    <div className="english">
                        Meaning: {card.english}
                    </div>
                    <div className="example">
                        <div>{card.exampleSentence.japanese.text}</div>
                        <div>{card.exampleSentence.japanese.reading}</div>
                        <div>{card.exampleSentence.english}</div>
                        <button onClick={playSentenceAudio}>
                            Play Sentence Audio
                        </button>
                    </div>
                    {card.resources.pitchAccent && (
                        <div 
                            className="pitch-accent"
                            dangerouslySetInnerHTML={{ 
                                __html: card.resources.pitchAccent 
                            }} 
                        />
                    )}
                </>
            )}
            
            <button onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
        </div>
    );
};
```

### 3. Required API Routes

Create the following Next.js API routes:

1. `pages/api/flashcard/[id].ts`:
```typescript
import { db } from '../../../utils/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    const card = db.getFlashcardById(Number(id));
    
    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }
    
    res.status(200).json(card);
}
```

2. `pages/api/audio/[id].ts`:
```typescript
import { createReadStream } from 'fs';
import { join } from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    const audioPath = join(process.cwd(), 'ankidecks', 'core4000', id as string);
    
    try {
        const stream = createReadStream(audioPath);
        res.setHeader('Content-Type', 'audio/mpeg');
        stream.pipe(res);
    } catch (error) {
        res.status(404).json({ error: 'Audio file not found' });
    }
}
```

## Database Service Implementation

Update your `utils/db.ts` to use the new file paths:

```typescript
class DatabaseService {
    private db: Database.Database;
    private mediaMap: MediaMap;

    constructor() {
        try {
            // Initialize database with new path
            const DB_PATH = path.join(process.cwd(), 'ankidecks', 'core4000', 'collection.anki2');
            this.db = new Database(DB_PATH, { readonly: true });
            
            // Load media mapping from new path
            const MEDIA_PATH = path.join(process.cwd(), 'ankidecks', 'core4000', 'media');
            const mediaContent = fs.readFileSync(MEDIA_PATH, 'utf-8');
            this.mediaMap = JSON.parse(mediaContent);
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private findMediaFile(filename: string | undefined): string | undefined {
        if (!filename) return undefined;
        
        // Find the file number that contains this audio file
        for (const [key, value] of Object.entries(this.mediaMap)) {
            if (value === filename) {
                // Return the path to the numbered file in the new location
                return path.join(process.cwd(), 'ankidecks', 'core4000', key);
            }
        }
        return undefined;
    }

    // ... rest of the database service implementation ...
}
```

## Important Notes

1. **Audio File Caching**: Consider implementing caching for audio files to improve performance.

2. **Error Handling**: Implement proper error boundaries and loading states.

3. **Security**: 
   - Validate all IDs before querying the database
   - Implement rate limiting on API routes
   - Sanitize pitch accent HTML before rendering

4. **Performance**:
   - Implement pagination for flashcard lists
   - Preload next card's data
   - Consider using SWR or React Query for data fetching

5. **Accessibility**:
   - Add proper ARIA labels for audio controls
   - Ensure keyboard navigation works
   - Add loading indicators for audio playback

## Getting Started

1. Install required dependencies:
```bash
npm install better-sqlite3 @types/better-sqlite3
```

2. Create the Anki deck directory structure:
```bash
mkdir -p ankidecks/core4000
```

3. Copy the database and media files to your project:
```bash
cp /path/to/collection.anki2 ankidecks/core4000/
cp /path/to/media ankidecks/core4000/
cp /path/to/audio/files/* ankidecks/core4000/
```

4. Initialize the database service as shown in the updated `db.ts` code above.

5. Start implementing the frontend components using the provided example code.

## Testing

Create test cases for:
- Audio playback
- Card data fetching
- Error states
- Loading states
- User interactions

Use Jest and React Testing Library for component testing. 