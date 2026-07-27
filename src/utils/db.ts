import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Flashcard {
    id: number;
    cardNumber: string;
    japanese: {
        word: string;
        reading: string;
    };
    english: string;
    partOfSpeech: string;
    exampleSentence: {
        japanese: {
            text: string;
            reading: string;
        };
        english: string;
    };
    audio: {
        word?: string;
        sentence?: string;
    };
    resources: {
        ojadUrl?: string;
        pitchAccent?: string;
    };
}

interface MediaMap {
    [key: string]: string;
}

interface CountResult {
    count: number;
}

interface MaxWordIdResult {
    maxId: number;
}

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

            // Log database structure for debugging
            this.logDatabaseStructure();
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private logDatabaseStructure() {
        const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log('Available tables:', tables);

        // Log schema of notes table
        const notesSchema = this.db.prepare('PRAGMA table_info(notes)').all();
        console.log('Notes table schema:', notesSchema);

        // Get a sample note
        const sampleNote = this.db.prepare('SELECT * FROM notes LIMIT 1').get();
        console.log('Sample note:', sampleNote);
    }

    getFlashcardById(id: number): Flashcard | null {
        const note = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
        if (!note) return null;
        
        return this.convertNoteToFlashcard(note);
    }

    getFlashcardsByPage(page: number = 1, pageSize: number = 10): Flashcard[] {
        const offset = (page - 1) * pageSize;
        const notes = this.db.prepare('SELECT * FROM notes LIMIT ? OFFSET ?').all(pageSize, offset);
        
        return notes.map(note => this.convertNoteToFlashcard(note));
    }

    private convertNoteToFlashcard(note: any): Flashcard {
        // Split fields
        const fields = note.flds.split('\x1f');
        
        // Extract audio filenames from [sound:filename] format
        const wordAudioMatch = fields[8]?.match(/\[sound:(.*?)\]/);
        const sentenceAudioMatch = fields[9]?.match(/\[sound:(.*?)\]/);
        
        const wordAudioFile = wordAudioMatch ? wordAudioMatch[1] : undefined;
        const sentenceAudioFile = sentenceAudioMatch ? sentenceAudioMatch[1] : undefined;

        // Get media files from the media map
        const wordAudio = this.findMediaFile(wordAudioFile);
        const sentenceAudio = this.findMediaFile(sentenceAudioFile);

        return {
            id: note.id,
            cardNumber: fields[0] || '',
            japanese: {
                word: fields[1] || '',
                reading: fields[2] || ''
            },
            english: fields[3] || '',
            partOfSpeech: fields[4] || '',
            exampleSentence: {
                japanese: {
                    text: fields[5] || '',
                    reading: fields[6] || ''
                },
                english: fields[7] || ''
            },
            audio: {
                word: wordAudio,
                sentence: sentenceAudio
            },
            resources: {
                ojadUrl: fields[10] || undefined,
                pitchAccent: fields[11] || undefined
            }
        };
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

    getTotalFlashcards(): number {
        const result = this.db.prepare('SELECT COUNT(*) as count FROM notes').get() as CountResult;
        return result.count;
    }

    getNextWord(afterId: number): Flashcard | null {
        const nextNote = this.db.prepare('SELECT * FROM notes WHERE id > ? ORDER BY id ASC LIMIT 1').get(afterId);
        if (!nextNote) return null;
        return this.convertNoteToFlashcard(nextNote);
    }

    getWordsByIdRange(startId: number, count: number): Flashcard[] {
        const notes = this.db.prepare('SELECT * FROM notes WHERE id >= ? ORDER BY id ASC LIMIT ?').all(startId, count);
        return notes.map(note => this.convertNoteToFlashcard(note));
    }

    getMaxWordId(): number {
        const result = this.db.prepare('SELECT MAX(id) as maxId FROM notes').get() as MaxWordIdResult;
        return result.maxId;
    }
}

// Create and export a single instance
export const db = new DatabaseService();
