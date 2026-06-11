import assert from 'node:assert/strict';
import { createGestureEngine, createFrame, GestureIntent, GestureType } from '../../apps/expo-demo/src/runtime/octatouchRuntime.js';

function touch(x, y, nativeId, pressure = 0.6) {
  return { x, y, pressure, contactArea: 16, timestamp_us: 0, nativeId };
}

function runSequence(engine, frames, context = { vehicleState: 'parked', accessibility: {} }) {
  let last = null;
  for (const frame of frames) {
    const response = engine.ingestFrame(frame, context);
    if (response.result) {
      last = response.result;
    }
  }
  return last;
}

const engine = createGestureEngine();

const tapResult = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.4, 0.4, 1)] }),
  createFrame({ timestamp_us: 120_000, samples: [] }),
]);
assert.equal(tapResult.type, GestureType.TAP);
assert.equal(tapResult.intent, GestureIntent.SELECT);

engine.reset();
const pinchIn = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.2, 0.5, 1), touch(0.5, 0.5, 2), touch(0.8, 0.5, 3)] }),
  createFrame({ timestamp_us: 100_000, samples: [touch(0.38, 0.5, 1), touch(0.5, 0.5, 2), touch(0.62, 0.5, 3)] }),
  createFrame({ timestamp_us: 140_000, samples: [] }),
]);
assert.equal(pinchIn.type, GestureType.THREE_FINGER_PINCH_IN);
assert.equal(pinchIn.intent, GestureIntent.COPY);

engine.reset();
const swipeLeft = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.55, 0.4, 1), touch(0.65, 0.5, 2), touch(0.75, 0.6, 3)] }),
  createFrame({ timestamp_us: 100_000, samples: [touch(0.25, 0.4, 1), touch(0.35, 0.5, 2), touch(0.45, 0.6, 3)] }),
  createFrame({ timestamp_us: 160_000, samples: [] }),
]);
assert.equal(swipeLeft.type, GestureType.THREE_FINGER_SWIPE_LEFT);
assert.equal(swipeLeft.intent, GestureIntent.UNDO);

engine.reset();
const blockedDriving = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.2, 0.5, 1), touch(0.5, 0.5, 2), touch(0.8, 0.5, 3)] }),
  createFrame({ timestamp_us: 100_000, samples: [touch(0.38, 0.5, 1), touch(0.5, 0.5, 2), touch(0.62, 0.5, 3)] }),
  createFrame({ timestamp_us: 140_000, samples: [] }),
], { vehicleState: 'driving', accessibility: {} });
assert.equal(blockedDriving.intent, GestureIntent.BLOCKED_DRIVING_MODE);
assert.equal(blockedDriving.blocked, true);

engine.reset();
const blockedAccessibility = runSequence(engine, [
  createFrame({ timestamp_us: 0, samples: [touch(0.4, 0.4, 1), touch(0.5, 0.5, 2), touch(0.6, 0.6, 3)] }),
  createFrame({ timestamp_us: 140_000, samples: [] }),
], { vehicleState: 'parked', accessibility: { screenReaderActive: true } });
assert.equal(blockedAccessibility.type, GestureType.THREE_FINGER_TAP);
assert.equal(blockedAccessibility.intent, GestureIntent.BLOCKED_ACCESSIBILITY_CONFLICT);
assert.equal(blockedAccessibility.fallbackIntent, GestureIntent.SCREEN_CURTAIN_TOGGLE);

console.log('expo runtime smoke tests passed');
