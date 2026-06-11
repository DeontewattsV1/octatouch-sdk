const state = {
  drivingMode: false,
  respectAccessibility: true,
  limitedHardware: false,
  showHints: true,
};

const els = {
  drivingMode: document.getElementById('drivingMode'),
  respectAccessibility: document.getElementById('respectAccessibility'),
  limitedHardware: document.getElementById('limitedHardware'),
  showHints: document.getElementById('showHints'),
  modePill: document.getElementById('modePill'),
  accessibilityPill: document.getElementById('accessibilityPill'),
  banner: document.getElementById('banner'),
  resultJson: document.getElementById('resultJson'),
  recognitionPrint: document.getElementById('recognitionPrint'),
  eventLog: document.getElementById('eventLog'),
  touchSurface: document.getElementById('touchSurface'),
  hintList: document.getElementById('hintList'),
};

const activePointers = new Map();
const MAX_CHANNELS = 8;
let tapCount = 0;
let lastTapAt = 0;
let surfaceRect = null;
let recognitionLines = ['Ready'];

function setBanner(message, level = 'ok') {
  els.banner.textContent = message;
  els.banner.className = 'banner';
  if (level === 'warning') els.banner.classList.add('warning');
  if (level === 'danger') els.banner.classList.add('danger');
}

function logEvent(message) {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  els.eventLog.prepend(item);
  while (els.eventLog.children.length > 12) {
    els.eventLog.removeChild(els.eventLog.lastChild);
  }
}

function pushRecognitionLine(line) {
  recognitionLines.unshift(`${new Date().toLocaleTimeString()}  ${line}`);
  recognitionLines = recognitionLines.slice(0, 12);
  els.recognitionPrint.textContent = recognitionLines.join('\n');
}

function updatePills() {
  els.modePill.textContent = state.drivingMode ? 'Driving mode' : 'Parked';
  els.accessibilityPill.textContent = state.respectAccessibility ? 'A11y respect on' : 'A11y respect off';
}

function renderResult(result) {
  els.resultJson.textContent = JSON.stringify(result, null, 2);
  const level = result.blocked ? 'danger' : result.fallbackIntent ? 'warning' : 'ok';
  setBanner(result.userMessage || 'Ready.', level);
  const printLabel = result.recognitionLabel || result.type || 'idle';
  const channelText = result.recognizedChannels?.length ? ` channels=${result.recognizedChannels.join(',')}` : '';
  pushRecognitionLine(`${printLabel}${channelText} -> ${result.intent || 'none'}${result.blocked ? ' [blocked]' : ''}`);
  logEvent(`${result.type || 'idle'} → ${result.intent || 'none'}${result.blocked ? ' [blocked]' : ''}${result.fallbackIntent ? ` [fallback: ${result.fallbackIntent}]` : ''}`);
}

function resolveIntent(type, fingers, meta = {}) {
  const recognizedChannels = Array.isArray(meta.channels) ? meta.channels : [];
  const base = {
    type,
    fingers,
    intent: null,
    fallbackIntent: null,
    blocked: false,
    confidence: 0.94,
    recognizedChannels,
    recognitionLabel: meta.recognitionLabel || null,
    userMessage: 'Gesture recognized.',
  };

  const map = {
    single_tap: 'select_or_confirm',
    double_tap: 'select_word',
    triple_tap: 'select_paragraph',
    long_press: 'press_and_hold_context',
    long_press_drag: 'select_custom_block',
    swipe_left: 'change_track_or_page',
    swipe_right: 'change_track_or_page',
    two_finger_tap: 'save_highlight',
    three_finger_pinch_in: 'copy',
    three_finger_pinch_out: 'paste',
    three_finger_swipe_left: 'undo',
    three_finger_swipe_right: 'redo',
    three_finger_tap: 'open_clipboard_menu',
  };

  base.intent = map[type] || null;

  if (type === 'long_press' && recognizedChannels.length === 1) {
    const finger = recognizedChannels[0];
    base.intent = 'finger_specific_hold';
    base.recognitionLabel = base.recognitionLabel || `finger_${finger}_long_press`;
    base.userMessage = `Finger ${finger} long press recognized.`;
  }

  if (state.limitedHardware && fingers > 1) {
    base.blocked = false;
    base.fallbackIntent = 'tap_based_controls';
    base.userMessage = 'Limited touch support detected. Falling back to tap-based actions.';
    return base;
  }

  if (state.drivingMode) {
    const allowed = new Set(['single_tap', 'swipe_left', 'swipe_right']);
    if (!allowed.has(type)) {
      base.blocked = true;
      base.userMessage = 'Complex gestures are limited while driving.';
      return base;
    }
  }

  if (state.respectAccessibility && type === 'three_finger_tap') {
    base.fallbackIntent = 'accessibility_options';
    base.intent = 'open_accessibility_options';
    base.userMessage = 'Accessibility gesture respected. Redirected to accessibility options.';
  }

  if (state.respectAccessibility && type === 'three_finger_pinch_out') {
    base.fallbackIntent = 'screen_reader_safe_notice';
    base.userMessage = 'Paste recognized. Accessibility-safe behavior preserved.';
  }

  return base;
}

function simulate(simType) {
  const fingerMatch = simType.match(/^finger_(\d+)_long_press$/);
  if (fingerMatch) {
    const channel = Number(fingerMatch[1]);
    renderResult(resolveIntent('long_press', 1, {
      channels: [channel],
      recognitionLabel: `finger_${channel}_long_press`,
    }));
    return;
  }

  const fingersMap = {
    single_tap: 1,
    double_tap: 1,
    triple_tap: 1,
    long_press: 1,
    long_press_drag: 1,
    swipe_left: 1,
    swipe_right: 1,
    two_finger_tap: 2,
    three_finger_pinch_in: 3,
    three_finger_pinch_out: 3,
    three_finger_swipe_left: 3,
    three_finger_swipe_right: 3,
    three_finger_tap: 3,
  };
  renderResult(resolveIntent(simType, fingersMap[simType] || 1));
}

function nextFreeChannel() {
  const used = new Set(Array.from(activePointers.values()).map((pointer) => pointer.channel));
  for (let channel = 1; channel <= MAX_CHANNELS; channel += 1) {
    if (!used.has(channel)) return channel;
  }
  return 1;
}

function createPoint(pointerId, x, y, channel) {
  const node = document.createElement('div');
  node.className = 'touchPoint';
  node.dataset.pointerId = String(pointerId);
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.textContent = String(channel);
  els.touchSurface.appendChild(node);
  return node;
}

function updatePoint(pointerId, x, y) {
  const node = els.touchSurface.querySelector(`[data-pointer-id="${pointerId}"]`);
  if (!node) return;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
}

function removePoint(pointerId) {
  const node = els.touchSurface.querySelector(`[data-pointer-id="${pointerId}"]`);
  if (node) node.remove();
}

function pointerPosition(ev) {
  if (!surfaceRect) surfaceRect = els.touchSurface.getBoundingClientRect();
  return { x: ev.clientX - surfaceRect.left, y: ev.clientY - surfaceRect.top };
}

function inferPointerGesture(pointer) {
  const dx = pointer.lastX - pointer.startX;
  const dy = pointer.lastY - pointer.startY;
  const distance = Math.hypot(dx, dy);
  const duration = performance.now() - pointer.startTime;

  if (pointer.longPressTriggered && distance > 14) return 'long_press_drag';
  if (distance > 70) return dx < 0 ? 'swipe_left' : 'swipe_right';

  if (duration < 250 && distance < 18) {
    const now = performance.now();
    if (now - lastTapAt < 400) {
      tapCount += 1;
    } else {
      tapCount = 1;
    }
    lastTapAt = now;
    if (tapCount === 3) {
      tapCount = 0;
      return 'triple_tap';
    }
    if (tapCount === 2) return 'double_tap';
    return 'single_tap';
  }

  if (duration >= 450 && distance < 18) return 'long_press';
  return 'single_tap';
}

els.touchSurface.addEventListener('pointerdown', (ev) => {
  surfaceRect = els.touchSurface.getBoundingClientRect();
  els.touchSurface.setPointerCapture(ev.pointerId);
  const pos = pointerPosition(ev);
  const channel = nextFreeChannel();
  const pointer = {
    channel,
    startX: pos.x,
    startY: pos.y,
    lastX: pos.x,
    lastY: pos.y,
    startTime: performance.now(),
    longPressTriggered: false,
    longPressTimer: null,
  };
  pointer.longPressTimer = setTimeout(() => {
    pointer.longPressTriggered = true;
    setBanner(`Long press armed on finger ${pointer.channel}. Drag to complete selection.`, 'warning');
  }, 420);
  activePointers.set(ev.pointerId, pointer);
  createPoint(ev.pointerId, pos.x, pos.y, channel);
});

els.touchSurface.addEventListener('pointermove', (ev) => {
  const pointer = activePointers.get(ev.pointerId);
  if (!pointer) return;
  const pos = pointerPosition(ev);
  pointer.lastX = pos.x;
  pointer.lastY = pos.y;
  updatePoint(ev.pointerId, pos.x, pos.y);
});

function handlePointerEnd(ev) {
  const pointer = activePointers.get(ev.pointerId);
  if (!pointer) return;
  clearTimeout(pointer.longPressTimer);
  const gesture = inferPointerGesture(pointer);
  activePointers.delete(ev.pointerId);
  removePoint(ev.pointerId);
  renderResult(resolveIntent(gesture, 1, {
    channels: [pointer.channel],
    recognitionLabel: gesture === 'long_press' ? `finger_${pointer.channel}_long_press` : null,
  }));
}

els.touchSurface.addEventListener('pointerup', handlePointerEnd);
els.touchSurface.addEventListener('pointercancel', handlePointerEnd);

for (const input of [els.drivingMode, els.respectAccessibility, els.limitedHardware, els.showHints]) {
  input.addEventListener('change', () => {
    state.drivingMode = els.drivingMode.checked;
    state.respectAccessibility = els.respectAccessibility.checked;
    state.limitedHardware = els.limitedHardware.checked;
    state.showHints = els.showHints.checked;
    els.hintList.style.display = state.showHints ? 'block' : 'none';
    updatePills();
    setBanner('State updated.');
  });
}

document.querySelectorAll('[data-sim]').forEach((button) => {
  button.addEventListener('click', () => simulate(button.dataset.sim));
});

updatePills();
renderResult({
  type: null,
  fingers: 0,
  intent: null,
  fallbackIntent: null,
  blocked: false,
  confidence: 0,
  recognizedChannels: [],
  recognitionLabel: null,
  userMessage: 'Ready',
});
