import assert from 'node:assert/strict';
import { createGestureEngine, createFrame, GestureIntent } from '../../apps/expo-demo/src/runtime/octatouchRuntime.js';

function touch(x, y, nativeId) {
  return { x, y, pressure: 0.6, contactArea: 16, timestamp_us: 0, nativeId };
}

function runSequence(engine, frames, context) {
  let last = null;
  for (const frame of frames) {
    const response = engine.ingestFrame(frame, context);
    if (response.result) last = response.result;
  }
  return last;
}

const engine = createGestureEngine();
const accessibilityResult = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.4, 0.4, 1), touch(0.5, 0.5, 2), touch(0.6, 0.6, 3)] }),
  createFrame({ timestamp_us: 140_000, samples: [] }),
], { vehicleState: 'parked', accessibility: { screenReaderActive: true } });

assert.equal(accessibilityResult.intent, GestureIntent.BLOCKED_ACCESSIBILITY_CONFLICT);
assert.equal(accessibilityResult.fallbackIntent, GestureIntent.SCREEN_CURTAIN_TOGGLE);
assert.equal(accessibilityResult.blocked, true);

engine.reset();
const drivingResult = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.2, 0.5, 1), touch(0.5, 0.5, 2), touch(0.8, 0.5, 3)] }),
  createFrame({ timestamp_us: 100_000, samples: [touch(0.38, 0.5, 1), touch(0.5, 0.5, 2), touch(0.62, 0.5, 3)] }),
  createFrame({ timestamp_us: 140_000, samples: [] }),
], { vehicleState: 'driving', accessibility: {} });

assert.equal(drivingResult.intent, GestureIntent.BLOCKED_DRIVING_MODE);
assert.equal(drivingResult.userMessage, 'Complex gestures are limited while driving.');
console.log('expo policy runtime smoke tests passed');
