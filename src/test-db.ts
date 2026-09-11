import { db } from './utils/db';
import fs from 'fs';
import path from 'path';

try {
    // Get a specific flashcard (ID from the sample we saw earlier)
    const card = db.getFlashcardById(1621392101710);
    
    if (!card) {
        console.error('Card not found');
        process.exit(1);
    }

    console.log('Flashcard Details:');
    console.log('=================\n');
    console.log(`Card Number: ${card.cardNumber}`);
    console.log(`Japanese: ${card.japanese.word} (${card.japanese.reading})`);
    console.log(`English: ${card.english}`);
    console.log(`Part of Speech: ${card.partOfSpeech}`);
    
    console.log('\nExample Sentence:');
    console.log(`Japanese: ${card.exampleSentence.japanese.text}`);
    console.log(`Reading: ${card.exampleSentence.japanese.reading}`);
    console.log(`English: ${card.exampleSentence.english}`);
    
    console.log('\nAudio Files:');
    if (card.audio.word) {
        console.log(`Word Audio File Reference: ${card.audio.word}`);
        const stats = fs.statSync(card.audio.word);
        console.log(`File exists: ${fs.existsSync(card.audio.word)}`);
        console.log(`File size: ${stats.size} bytes`);
    }
    
    if (card.audio.sentence) {
        console.log(`\nSentence Audio File Reference: ${card.audio.sentence}`);
        const stats = fs.statSync(card.audio.sentence);
        console.log(`File exists: ${fs.existsSync(card.audio.sentence)}`);
        console.log(`File size: ${stats.size} bytes`);
    }
    
    console.log('\nResources:');
    if (card.resources.ojadUrl) {
        console.log(`OJAD URL: ${card.resources.ojadUrl}`);
    }
    if (card.resources.pitchAccent) {
        console.log('Pitch Accent Data:', card.resources.pitchAccent.substring(0, 100) + '...');
    }
} catch (error) {
    console.error('Error:', error);
}
