import Database from 'better-sqlite3';
import path from 'path';

export interface UserProgress {
    userId: string;
    cardId: number;
    progress: number;
    timeToAnswer: number;
    totalMisses: number;
    correctAnswers: number;
    lastReviewed: string;
    createdAt: string;
    updatedAt: string;
}

interface CurrentSessionRow {
    currentSession: number;
}

interface LastWordIdRow {
    lastWordId: number | null;
}

class UserProgressDatabase {
    private db: Database.Database;

    constructor() {
        try {
            const DB_PATH = path.join(process.cwd(), 'data', 'user_progress.db');
            console.log('Initializing database at:', DB_PATH);
            this.db = new Database(DB_PATH);
            this.initializeDatabase();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private initializeDatabase() {
        try {
            // Create users table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create progress table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS progress (
                    userId TEXT,
                    cardId INTEGER,
                    progress INTEGER DEFAULT 0,
                    timeToAnswer REAL DEFAULT 0,
                    totalMisses INTEGER DEFAULT 0,
                    correctAnswers INTEGER DEFAULT 0,
                    lastReviewed TEXT DEFAULT CURRENT_TIMESTAMP,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (userId, cardId),
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // Create settings table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS settings (
                    userId TEXT PRIMARY KEY,
                    sessionSize INTEGER,
                    autoAdvance BOOLEAN DEFAULT 1,
                    audioAutoPlay BOOLEAN DEFAULT 1,
                    showPhrase BOOLEAN DEFAULT 0,
                    darkMode BOOLEAN DEFAULT 0,
                    largeText BOOLEAN DEFAULT 0,
                    dailyReminders BOOLEAN DEFAULT 1,
                    weeklyProgress BOOLEAN DEFAULT 1,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // Create session table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS sessions (
                    userId TEXT PRIMARY KEY,
                    currentSession INTEGER DEFAULT 1,
                    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // Create indexes
            this.db.exec(`
                CREATE INDEX IF NOT EXISTS idx_progress_userId ON progress(userId);
                CREATE INDEX IF NOT EXISTS idx_progress_cardId ON progress(cardId);
            `);
            console.log('Database tables and indexes created successfully');
        } catch (error) {
            console.error('Failed to initialize database tables:', error);
            throw error;
        }
    }

    // User management
    createUser(userId: string, email?: string) {
        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)');
            return stmt.run(userId, email);
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    // Progress management
    getProgress(userId: string, cardId: number): UserProgress | null {
        try {
            const stmt = this.db.prepare('SELECT * FROM progress WHERE userId = ? AND cardId = ?');
            return stmt.get(userId, cardId) as UserProgress | null;
        } catch (error) {
            console.error('Failed to get progress:', error);
            throw error;
        }
    }

    getAllUserProgress(userId: string): UserProgress[] {
        try {
            const stmt = this.db.prepare('SELECT * FROM progress WHERE userId = ?');
            return stmt.all(userId) as UserProgress[];
        } catch (error) {
            console.error('Failed to get all user progress:', error);
            throw error;
        }
    }

    upsertProgress(progress: Partial<UserProgress> & { userId: string; cardId: number }) {
        try {
            // First ensure user exists
            this.createUser(progress.userId);

            const stmt = this.db.prepare(`
                INSERT INTO progress (
                    userId, cardId, progress, timeToAnswer, totalMisses, 
                    correctAnswers, lastReviewed, updatedAt
                ) 
                VALUES (
                    @userId, @cardId, @progress, @timeToAnswer, @totalMisses,
                    @correctAnswers, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
                ON CONFLICT(userId, cardId) DO UPDATE SET
                    progress = COALESCE(@progress, progress),
                    timeToAnswer = COALESCE(@timeToAnswer, timeToAnswer),
                    totalMisses = COALESCE(@totalMisses, totalMisses),
                    correctAnswers = COALESCE(@correctAnswers, correctAnswers),
                    lastReviewed = CURRENT_TIMESTAMP,
                    updatedAt = CURRENT_TIMESTAMP
            `);

            console.log('Upserting progress:', progress);
            const result = stmt.run(progress);
            console.log('Upsert result:', result);
            return result;
        } catch (error) {
            console.error('Failed to upsert progress:', error);
            throw error;
        }
    }

    // Analytics
    getUserStats(userId: string) {
        try {
            console.log('Getting stats for user:', userId);
            const stmt = this.db.prepare(`
                SELECT 
                    COUNT(*) as totalCards,
                    AVG(progress) as averageProgress,
                    AVG(timeToAnswer) as averageTimeToAnswer,
                    SUM(totalMisses) as totalMisses,
                    SUM(correctAnswers) as totalCorrectAnswers
                FROM progress 
                WHERE userId = ?
            `);
            const stats = stmt.get(userId);
            console.log('User stats:', stats);
            return stats;
        } catch (error) {
            console.error('Failed to get user stats:', error);
            throw error;
        }
    }

    getCardStats(cardId: number) {
        try {
            const stmt = this.db.prepare(`
                SELECT 
                    COUNT(*) as totalUsers,
                    AVG(progress) as averageProgress,
                    AVG(timeToAnswer) as averageTimeToAnswer,
                    SUM(totalMisses) as totalMisses,
                    SUM(correctAnswers) as totalCorrectAnswers
                FROM progress 
                WHERE cardId = ?
            `);
            return stmt.get(cardId);
        } catch (error) {
            console.error('Failed to get card stats:', error);
            throw error;
        }
    }

    getAllUsers() {
        try {
            const stmt = this.db.prepare('SELECT * FROM users');
            return stmt.all();
        } catch (error) {
            console.error('Failed to get all users:', error);
            throw error;
        }
    }

    // Settings management
    getUserSettings(userId: string) {
        try {
            // First ensure user exists and has settings
            this.createUser(userId);
            
            const stmt = this.db.prepare(`
                INSERT OR IGNORE INTO settings (userId)
                VALUES (?)
            `);
            stmt.run(userId);

            const getStmt = this.db.prepare('SELECT * FROM settings WHERE userId = ?');
            return getStmt.get(userId);
        } catch (error) {
            console.error('Failed to get user settings:', error);
            throw error;
        }
    }

    updateUserSettings(userId: string, settings: Partial<{
        sessionSize: number;
        autoAdvance: boolean;
        audioAutoPlay: boolean;
        showPhrase: boolean;
        darkMode: boolean;
        largeText: boolean;
        dailyReminders: boolean;
        weeklyProgress: boolean;
    }>) {
        try {
            // First ensure user exists
            this.createUser(userId);

            const updateFields = Object.keys(settings)
                .map(key => `${key} = @${key}`)
                .join(', ');

            const stmt = this.db.prepare(`
                INSERT INTO settings (
                    userId,
                    ${Object.keys(settings).join(', ')}
                ) 
                VALUES (
                    @userId,
                    ${Object.keys(settings).map(k => `@${k}`).join(', ')}
                )
                ON CONFLICT(userId) DO UPDATE SET
                    ${updateFields},
                    updatedAt = CURRENT_TIMESTAMP
            `);

            console.log('Updating settings:', { userId, ...settings });
            const result = stmt.run({ userId, ...settings });
            console.log('Update result:', result);
            return result;
        } catch (error) {
            console.error('Failed to update user settings:', error);
            throw error;
        }
    }

    // Cleanup
    close() {
        try {
            this.db.close();
        } catch (error) {
            console.error('Failed to close database:', error);
            throw error;
        }
    }

    // Session management
    getCurrentSession(userId: string): number {
        try {
            const stmt = this.db.prepare('SELECT currentSession FROM sessions WHERE userId = ?');
            const result = stmt.get(userId) as CurrentSessionRow | undefined;
            return result ? result.currentSession : 1;
        } catch (error) {
            console.error('Failed to get current session:', error);
            return 1;
        }
    }

    setCurrentSession(userId: string, session: number) {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO sessions (userId, currentSession, updatedAt)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(userId) DO UPDATE SET
                    currentSession = ?,
                    updatedAt = CURRENT_TIMESTAMP
            `);
            return stmt.run(userId, session, session);
        } catch (error) {
            console.error('Failed to set current session:', error);
            throw error;
        }
    }

    getLastWordId(userId: string): number {
        try {
            const stmt = this.db.prepare('SELECT MAX(cardId) as lastWordId FROM progress WHERE userId = ?');
            const result = stmt.get(userId) as LastWordIdRow | undefined;
            return result?.lastWordId || 0;
        } catch (error) {
            console.error('Failed to get last word ID:', error);
            return 0;
        }
    }
}

// Create and export a single instance
export const userProgressDb = new UserProgressDatabase(); 
