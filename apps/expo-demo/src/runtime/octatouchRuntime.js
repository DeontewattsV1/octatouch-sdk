import {
  kTapMaxDurationMs,
  kDoubleTapGapMs,
  kLongPressMs,
  kTapMoveThreshold,
  kSwipeMoveThreshold,
  kPinchDeltaThreshold,
  kDoubleTapProximity,
  kBaseConfidence,
  kAccessibilityBlockConfidence,
  kDrivingModeBlockConfidence,
} from './octatouchConstants.js';

// ── Public type vocabularies ──────────────────────────────────────────────────
// These string values must match to_string() in Types.cpp.

export const GestureType = {
  TAP: 'tap',
  DOUBLE_TAP: 'double_tap',
  TRIPLE_TAP: 'triple_tap',
  LONG_PRESS: 'long_press',
  LONG_PRESS_DRAG: 'long_press_drag',
  SWIPE_LEFT: 'swipe_left',
  SWIPE_RIGHT: 'swipe_right',
  SWIPE_UP: 'swipe_up',
  SWIPE_DOWN: 'swipe_down',
  TWO_FINGER_TAP: 'two_finger_tap',
  THREE_FINGER_TAP: 'three_finger_tap',
  THREE_FINGER_PINCH_IN: 'three_finger_pinch_in',
  THREE_FINGER_PINCH_OUT: 'three_finger_pinch_out',
  THREE_FINGER_SWIPE_LEFT: 'three_finger_swipe_left',
  THREE_FINGER_SWIPE_RIGHT: 'three_finger_swipe_right',
  EIGHT_FINGER_SPREAD: 'eight_finger_spread',
  EIGHT_FINGER_SWEEP: 'eight_finger_sweep',
  UNKNOWN: 'unknown',
};

export const GestureIntent = {
  SELECT: 'select',
  SELECT_WORD: 'select_word',
  SELECT_PARAGRAPH: 'select_paragraph',
  SELECT_BLOCK: 'select_block',
  TRACK_CHANGE: 'track_change',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  UNDO: 'undo',
  REDO: 'redo',
  SAVE_HIGHLIGHT: 'save_highlight',
  OPEN_CLIPBOARD: 'open_clipboard',
  ZOOM_TOGGLE: 'zoom_toggle',
  SCREEN_CURTAIN_TOGGLE: 'screen_curtain_toggle',
  BLOCKED_DRIVING_MODE: 'blocked_driving_mode',
  BLOCKED_ACCESSIBILITY_CONFLICT: 'blocked_accessibility_conflict',
  UNKNOWN: 'unknown',
};

// ── Finger channel assignment ─────────────────────────────────────────────────

const LEFT_IDS  = ['L1', 'L2', 'L3', 'L4'];
const RIGHT_IDS = ['R1', 'R2', 'R3', 'R4'];

/**
 * Maps finger channel IDs to per-finger long-press recognition labels.
 * Channels L1–L4 become fingers 1–4; R1–R4 become fingers 5–8.
 * This matches the C++ longPressLabel() function in Types.cpp.
 */
const FINGER_LONG_PRESS_LABELS = {
  L1: 'finger_1_long_press',
  L2: 'finger_2_long_press',
  L3: 'finger_3_long_press',
  L4: 'finger_4_long_press',
  R1: 'finger_5_long_press',
  R2: 'finger_6_long_press',
  R3: 'finger_7_long_press',
  R4: 'finger_8_long_press',
};

function centroid(samples) {
  if (!samples.length) return { x: 0, y: 0 };
  const total = samples.reduce(
    (acc, s) => ({ x: acc.x + s.x, y: acc.y + s.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / samples.length, y: total.y / samples.length };
}

function averageDistanceFromCentroid(samples) {
  if (!samples.length) return 0;
  const center = centroid(samples);
  const total = samples.reduce(
    (acc, s) => acc + Math.hypot(s.x - center.x, s.y - center.y),
    0
  );
  return total / samples.length;
}

function assignFingerIdentities(samples) {
  const left  = samples.filter((s) => s.x < 0.5).sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  const right = samples.filter((s) => s.x >= 0.5).sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  const output = [];
  left.slice(0, LEFT_IDS.length).forEach((s, i) =>
    output.push({ fingerId: LEFT_IDS[i], nativeId: s.nativeId })
  );
  right.slice(0, RIGHT_IDS.length).forEach((s, i) =>
    output.push({ fingerId: RIGHT_IDS[i], nativeId: s.nativeId })
  );
  return output;
}

// ── Policy helpers ────────────────────────────────────────────────────────────

function isAccessibilityConflict(type, context) {
  const access = context?.accessibility ?? {};
  if (!(access.screenReaderActive || access.zoomActive || access.switchControlActive)) {
    return false;
  }
  return [
    GestureType.THREE_FINGER_TAP,
    GestureType.THREE_FINGER_PINCH_IN,
    GestureType.THREE_FINGER_PINCH_OUT,
  ].includes(type);
}

function accessibilityFallback(type, context) {
  const access = context?.accessibility ?? {};
  if (type === GestureType.THREE_FINGER_TAP && (access.screenReaderActive || access.zoomActive)) {
    return GestureIntent.SCREEN_CURTAIN_TOGGLE;
  }
  return GestureIntent.UNKNOWN;
}

function isStationaryOnly(type) {
  return [
    GestureType.TWO_FINGER_TAP,
    GestureType.THREE_FINGER_TAP,
    GestureType.THREE_FINGER_PINCH_IN,
    GestureType.THREE_FINGER_PINCH_OUT,
    GestureType.THREE_FINGER_SWIPE_LEFT,
    GestureType.THREE_FINGER_SWIPE_RIGHT,
    GestureType.TRIPLE_TAP,
    GestureType.LONG_PRESS_DRAG,
    GestureType.EIGHT_FINGER_SPREAD,
    GestureType.EIGHT_FINGER_SWEEP,
  ].includes(type);
}

function mapIntent(type) {
  switch (type) {
    case GestureType.TAP:
      return GestureIntent.SELECT;
    case GestureType.DOUBLE_TAP:
      return GestureIntent.SELECT_WORD;
    case GestureType.TRIPLE_TAP:
      return GestureIntent.SELECT_PARAGRAPH;
    case GestureType.LONG_PRESS_DRAG:
      return GestureIntent.SELECT_BLOCK;
    case GestureType.LONG_PRESS:
      // Long press resolves to select — per-finger detail is in recognitionLabel.
      return GestureIntent.SELECT;
    case GestureType.SWIPE_LEFT:
    case GestureType.SWIPE_RIGHT:
    case GestureType.SWIPE_UP:
    case GestureType.SWIPE_DOWN:
      return GestureIntent.TRACK_CHANGE;
    case GestureType.TWO_FINGER_TAP:
      return GestureIntent.SAVE_HIGHLIGHT;
    case GestureType.THREE_FINGER_PINCH_IN:
      return GestureIntent.COPY;
    case GestureType.THREE_FINGER_PINCH_OUT:
      return GestureIntent.PASTE;
    case GestureType.THREE_FINGER_SWIPE_LEFT:
      return GestureIntent.UNDO;
    case GestureType.THREE_FINGER_SWIPE_RIGHT:
      return GestureIntent.REDO;
    case GestureType.THREE_FINGER_TAP:
      return GestureIntent.OPEN_CLIPBOARD;
    case GestureType.EIGHT_FINGER_SPREAD:
      return GestureIntent.ZOOM_TOGGLE;
    default:
      return GestureIntent.UNKNOWN;
  }
}

// ── Recognition label ─────────────────────────────────────────────────────────

/**
 * Returns a per-finger long-press label ("finger_N_long_press") when the
 * gesture is a long press performed by a single identified finger channel.
 * Returns an empty string for all other gesture types.
 *
 * This mirrors the C++ longPressLabel() function in Types.cpp.
 */
function buildRecognitionLabel(type, assignedFingers) {
  if (type !== GestureType.LONG_PRESS) return '';
  if (!assignedFingers || assignedFingers.length !== 1) return '';
  return FINGER_LONG_PRESS_LABELS[assignedFingers[0]] ?? '';
}

// ── Result assembly ───────────────────────────────────────────────────────────

function resolveResult(type, session, context) {
  const assignedFingers = assignFingerIdentities(session.peakSamples).map((e) => e.fingerId);
  const activeFingers   = assignedFingers;

  let intent     = mapIntent(type);
  let confidence = type === GestureType.UNKNOWN ? 0 : kBaseConfidence;
  let fallbackIntent  = GestureIntent.UNKNOWN;
  let blocked    = false;
  let userMessage     = '';

  if (isAccessibilityConflict(type, context)) {
    intent         = GestureIntent.BLOCKED_ACCESSIBILITY_CONFLICT;
    fallbackIntent = accessibilityFallback(type, context);
    confidence     = kAccessibilityBlockConfidence;
    blocked        = true;
    userMessage    =
      fallbackIntent === GestureIntent.SCREEN_CURTAIN_TOGGLE
        ? 'Accessibility is active. Three-finger tap is reserved for screen curtain or zoom.'
        : 'Accessibility is active. Conflicting multi-finger gestures are deferred.';
  } else if (context?.vehicleState === 'driving' && isStationaryOnly(type)) {
    intent      = GestureIntent.BLOCKED_DRIVING_MODE;
    confidence  = kDrivingModeBlockConfidence;
    blocked     = true;
    userMessage = 'Complex gestures are limited while driving.';
  }

  return {
    type,
    gestureName: type,
    intent,
    fallbackIntent,
    blocked,
    userMessage,
    confidence,
    activeFingers,
    // recognitionLabel: mirrors GestureResult.recognitionLabel in the C++ struct.
    recognitionLabel: buildRecognitionLabel(type, assignedFingers),
    resolvedAt_us: session.endedAt_us,
    diagnostics: {
      durationMs:  Math.round((session.endedAt_us - session.startedAt_us) / 1000),
      travelX:     Number(session.travel.x.toFixed(3)),
      travelY:     Number(session.travel.y.toFixed(3)),
      peakTouches: session.maxTouches,
      startedAt_us: session.startedAt_us,
      endedAt_us:   session.endedAt_us,
    },
  };
}

// ── Single-finger classification ──────────────────────────────────────────────

function classifySingleFinger(session, tapMemory) {
  const durationMs    = (session.endedAt_us - session.startedAt_us) / 1000;
  const moveMagnitude = Math.hypot(session.travel.x, session.travel.y);

  if (durationMs >= kLongPressMs && moveMagnitude <= kTapMoveThreshold) {
    return GestureType.LONG_PRESS;
  }
  if (durationMs >= kLongPressMs && moveMagnitude > kTapMoveThreshold) {
    return GestureType.LONG_PRESS_DRAG;
  }
  if (
    Math.abs(session.travel.x) >= kSwipeMoveThreshold ||
    Math.abs(session.travel.y) >= kSwipeMoveThreshold
  ) {
    if (Math.abs(session.travel.x) > Math.abs(session.travel.y)) {
      return session.travel.x > 0 ? GestureType.SWIPE_RIGHT : GestureType.SWIPE_LEFT;
    }
    return session.travel.y > 0 ? GestureType.SWIPE_DOWN : GestureType.SWIPE_UP;
  }
  if (durationMs <= kTapMaxDurationMs && moveMagnitude <= kTapMoveThreshold) {
    const withinTapWindow =
      tapMemory.lastTapAt_us > 0 &&
      (session.endedAt_us - tapMemory.lastTapAt_us) / 1000 <= kDoubleTapGapMs;
    const currentCentroid = centroid(session.finalSamples);
    const closeToLastTap  = tapMemory.lastTapCentroid
      ? Math.hypot(
          currentCentroid.x - tapMemory.lastTapCentroid.x,
          currentCentroid.y - tapMemory.lastTapCentroid.y
        ) <= kDoubleTapProximity
      : false;

    if (withinTapWindow && closeToLastTap) {
      if (tapMemory.tapCount === 2) return GestureType.TRIPLE_TAP;
      return GestureType.DOUBLE_TAP;
    }
    return GestureType.TAP;
  }
  return GestureType.UNKNOWN;
}

// ── Multi-finger classification ───────────────────────────────────────────────

function classifyMultiFinger(session) {
  const durationMs    = (session.endedAt_us - session.startedAt_us) / 1000;
  const moveMagnitude = Math.hypot(session.travel.x, session.travel.y);

  if (session.maxTouches === 2) {
    if (durationMs <= kTapMaxDurationMs && moveMagnitude <= kTapMoveThreshold) {
      return GestureType.TWO_FINGER_TAP;
    }
    return GestureType.UNKNOWN;
  }

  if (session.maxTouches === 3) {
    const startSpread = averageDistanceFromCentroid(session.startSamples);
    const endSpread   = averageDistanceFromCentroid(session.finalSamples);
    const spreadDelta = endSpread - startSpread;

    if (spreadDelta <= -kPinchDeltaThreshold) return GestureType.THREE_FINGER_PINCH_IN;
    if (spreadDelta >= kPinchDeltaThreshold)  return GestureType.THREE_FINGER_PINCH_OUT;

    if (
      Math.abs(session.travel.x) >= kSwipeMoveThreshold &&
      Math.abs(session.travel.x) > Math.abs(session.travel.y)
    ) {
      return session.travel.x > 0
        ? GestureType.THREE_FINGER_SWIPE_RIGHT
        : GestureType.THREE_FINGER_SWIPE_LEFT;
    }
    if (durationMs <= kTapMaxDurationMs && moveMagnitude <= kTapMoveThreshold) {
      return GestureType.THREE_FINGER_TAP;
    }
    return GestureType.UNKNOWN;
  }

  if (session.maxTouches >= 8) {
    return moveMagnitude >= kSwipeMoveThreshold
      ? GestureType.EIGHT_FINGER_SWEEP
      : GestureType.EIGHT_FINGER_SPREAD;
  }

  return GestureType.UNKNOWN;
}

function candidateFromActiveSamples(samples) {
  if (!samples.length)   return GestureType.UNKNOWN;
  if (samples.length === 1) return GestureType.TAP;
  if (samples.length === 2) return GestureType.TWO_FINGER_TAP;
  if (samples.length === 3) return GestureType.THREE_FINGER_TAP;
  if (samples.length >= 8)  return GestureType.EIGHT_FINGER_SPREAD;
  return GestureType.UNKNOWN;
}

function createEmptyTapMemory() {
  return { lastTapAt_us: 0, lastTapCentroid: null, tapCount: 0 };
}

// ── Public engine factory ─────────────────────────────────────────────────────

export function createGestureEngine() {
  let session   = null;
  let tapMemory = createEmptyTapMemory();

  function beginSession(frame) {
    session = {
      startedAt_us:  frame.timestamp_us,
      lastFrameAt_us: frame.timestamp_us,
      endedAt_us:    frame.timestamp_us,
      startSamples:  frame.samples.map((s) => ({ ...s })),
      finalSamples:  frame.samples.map((s) => ({ ...s })),
      peakSamples:   frame.samples.map((s) => ({ ...s })),
      maxTouches:    frame.samples.length,
      startCentroid: centroid(frame.samples),
      currentCentroid: centroid(frame.samples),
      travel:        { x: 0, y: 0 },
      toolType:      frame.toolType,
      deviceId:      frame.deviceId,
    };
  }

  function updateSession(frame) {
    if (!session) { beginSession(frame); return; }
    session.lastFrameAt_us  = frame.timestamp_us;
    session.finalSamples    = frame.samples.map((s) => ({ ...s }));
    session.currentCentroid = centroid(frame.samples);
    session.travel = {
      x: session.currentCentroid.x - session.startCentroid.x,
      y: session.currentCentroid.y - session.startCentroid.y,
    };
    if (frame.samples.length >= session.maxTouches) {
      session.maxTouches  = frame.samples.length;
      session.peakSamples = frame.samples.map((s) => ({ ...s }));
    }
  }

  function finalizeSession(frame, context) {
    if (!session) return null;
    session.endedAt_us = frame.timestamp_us || session.lastFrameAt_us;

    const type   = session.maxTouches <= 1
      ? classifySingleFinger(session, tapMemory)
      : classifyMultiFinger(session);
    const result = resolveResult(type, session, context);

    if ([GestureType.TAP, GestureType.DOUBLE_TAP, GestureType.TRIPLE_TAP].includes(type)) {
      const sameWindow =
        tapMemory.lastTapAt_us > 0 &&
        (session.endedAt_us - tapMemory.lastTapAt_us) / 1000 <= kDoubleTapGapMs;
      tapMemory = {
        lastTapAt_us:   session.endedAt_us,
        lastTapCentroid: centroid(session.finalSamples),
        tapCount:        sameWindow ? Math.min(3, tapMemory.tapCount + 1) : 1,
      };
    } else {
      tapMemory = createEmptyTapMemory();
    }

    session = null;
    return result;
  }

  return {
    ingestFrame(frame, context) {
      if (frame.samples.length > 0) {
        if (!session) beginSession(frame);
        else updateSession(frame);

        return {
          result: null,
          live: {
            phase:           'tracking',
            activeTouches:   frame.samples.length,
            candidateGesture: candidateFromActiveSamples(frame.samples),
            assignedFingers: assignFingerIdentities(frame.samples).map((e) => e.fingerId),
            centroid:        centroid(frame.samples),
          },
        };
      }

      const result = finalizeSession(frame, context);
      return {
        result,
        live: {
          phase:           'idle',
          activeTouches:   0,
          candidateGesture: GestureType.UNKNOWN,
          assignedFingers: [],
          centroid:        { x: 0, y: 0 },
        },
      };
    },

    reset() {
      session   = null;
      tapMemory = createEmptyTapMemory();
    },
  };
}

// ── Frame factory ─────────────────────────────────────────────────────────────

export function createFrame({ timestamp_us, samples, deviceId = 'demo-device', toolType = 'touch' }) {
  return {
    timestamp_us,
    samples,
    deviceId,
    toolType,
    capabilities: { multiTouch: true, hover: false, pressure: true, stylus: false },
  };
}
