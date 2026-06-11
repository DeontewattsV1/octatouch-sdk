import { createGestureEngine } from './octatouchRuntime';

let nativeModule = null;
try {
  const maybeModule = require('../../modules/octatouch-native/src/index.ts');
  nativeModule = maybeModule?.default ?? maybeModule;
} catch {
  nativeModule = null;
}

export function createOctaTouchEngineClient() {
  if (nativeModule) {
    return {
      mode: 'native-sync',
      capabilities: safeCapabilities(nativeModule),
      ingestFrame(frame, context) {
        const response = nativeModule.ingestFrame(frame, normalizeContext(context));
        return {
          result: response?.hasResult ? response.result : null,
          live: response?.live ?? idleLiveState(),
        };
      },
      reset() {
        nativeModule.reset();
      },
    };
  }

  const runtime = createGestureEngine();
  return {
    mode: 'js-parity',
    capabilities: {
      engineMode: 'js-parity',
      transport: 'javascript',
      platform: 'cross-platform',
      usesCppCore: false,
    },
    ingestFrame(frame, context) {
      return runtime.ingestFrame(frame, normalizeContext(context));
    },
    reset() {
      runtime.reset();
    },
  };
}

function safeCapabilities(module) {
  try {
    return module.getCapabilities();
  } catch {
    return {
      engineMode: 'native-sync',
      transport: 'expo-module',
      platform: 'ios',
      usesCppCore: true,
    };
  }
}

function normalizeContext(context) {
  return {
    vehicleState: context?.vehicleState ?? 'unknown',
    accessibility: {
      screenReaderActive: Boolean(context?.accessibility?.screenReaderActive),
      zoomActive: Boolean(context?.accessibility?.zoomActive),
      switchControlActive: Boolean(context?.accessibility?.switchControlActive),
    },
  };
}

function idleLiveState() {
  return {
    phase: 'idle',
    activeTouches: 0,
    candidateGesture: 'unknown',
    assignedFingers: [],
    centroid: { x: 0, y: 0 },
  };
}
