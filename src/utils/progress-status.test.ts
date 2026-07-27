import assert from 'node:assert/strict';
import {
    effectiveProgressStatus,
    isMarkableProgressContent,
    isProgressStatus,
    PROGRESS_TARGETS,
} from './progress-status';

assert.equal(effectiveProgressStatus({ progress_status: 'learning', marked_as: 'mastered' }), 'mastered');
assert.equal(effectiveProgressStatus({ progress_status: 'learning', marked_as: null }), 'learning');
assert.equal(effectiveProgressStatus({ progress_status: null, marked_as: null }), 'new');
assert.equal(effectiveProgressStatus({ progress_status: 'invalid', marked_as: 'invalid' }), 'new');

assert.equal(isProgressStatus('to_review'), true);
assert.equal(isProgressStatus('automatic'), false);
assert.equal(isMarkableProgressContent('kanji_freq'), true);
assert.equal(isMarkableProgressContent('kanji'), false);

assert.equal(PROGRESS_TARGETS.words.table, 'user_progress');
assert.equal(PROGRESS_TARGETS.words_tubelex.table, 'words_tubelex_progress');
assert.equal(PROGRESS_TARGETS.kanji_freq.idColumn, 'item_id');

console.log('progress-status tests passed');
