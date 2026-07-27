import assert from 'node:assert/strict';
import { calculateStepProgressFromRecords } from './step-progress';

function runTests() {
    const mixed = calculateStepProgressFromRecords(
        4,
        [{ progress: 100 }, { progress: 50 }, { progress: 25 }],
        1
    );
    assert.equal(mixed.progress, 44, 'average progress should include missing words as 0');
    assert.equal(mixed.masteredCount, 1);

    const empty = calculateStepProgressFromRecords(0, [], 0);
    assert.deepEqual(empty, { progress: 0, masteredCount: 0 });

    const clamped = calculateStepProgressFromRecords(
        3,
        [{ progress: -20 }, { progress: 120 }, { progress: null }],
        0
    );
    assert.equal(clamped.progress, 33, 'progress values should be clamped to 0..100');
}

runTests();
console.log('step-progress tests passed');
