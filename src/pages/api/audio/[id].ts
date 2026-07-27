import { createReadStream } from 'fs';
import { join } from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    console.log('\n=== AUDIO API REQUEST ===');
    console.log('Requested audio ID:', id);
    
    // The ID is now the full filename (e.g. "飲_m1_dc4707eeb1f9.ogg")
    const audioPath = join(process.cwd(), 'database', 'Japanese_Core_10k', id as string);
    console.log('Full audio path:', audioPath);
    
    try {
        console.log('Attempting to read file...');
        const stream = createReadStream(audioPath);
        console.log('File found, streaming...');
        
        // Set the correct content type for .ogg files
        res.setHeader('Content-Type', 'audio/ogg');
        stream.pipe(res);
        
        // Log when the stream ends
        stream.on('end', () => {
            console.log('Successfully streamed audio file');
        });
        
        // Log any stream errors
        stream.on('error', (err) => {
            console.error('Stream error:', err);
        });
    } catch (error) {
        console.error('Failed to serve audio file:', {
            error,
            requestedId: id,
            fullPath: audioPath,
            cwd: process.cwd()
        });
        res.status(404).json({ error: 'Audio file not found' });
    }
} 