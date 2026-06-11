import { requireNativeModule } from 'expo-modules-core';

export type NativeTouchSample = {
  x: number;
  y: number;
  pressure: number;
  contactArea: number;
  timestamp_us: number;
  nativeId: number;
};

export type NativeFrame = {
  timestamp_us: number;
  samples: NativeTouchSample[];
  deviceId: string;
  toolType: 'touch' | 'stylus' | 'mouse';
  capabilities: {
    multiTouch: boolean;
    hover: boolean;
    pressure: boolean;
    stylus: boolean;
  };
};

export type NativeContext = {
  vehicleState: 'parked' | 'driving' | 'unknown';
  accessibility?: {
    screenReaderActive?: boolean;
    zoomActive?: boolean;
    switchControlActive?: boolean;
  };
};

export type NativeIngestResponse = {
  hasResult: boolean;
  result: null | {
    type: string;
    gestureName: string;
    intent: string;
    fallbackIntent: string;
    blocked: boolean;
    userMessage: string;
    confidence: number;
    activeFingers: string[];
    resolvedAt_us: number;
    diagnostics: {
      durationMs: number;
      travelX: number;
      travelY: number;
      peakTouches: number;
      startedAt_us: number;
      endedAt_us: number;
    };
  };
  live: {
    phase: string;
    activeTouches: number;
    candidateGesture: string;
    assignedFingers: string[];
    centroid: { x: number; y: number };
  };
};

export type OctaTouchNativeModuleType = {
  getCapabilities(): {
    engineMode: 'native-sync';
    transport: 'expo-module';
    platform: 'ios';
    usesCppCore: boolean;
  };
  ingestFrame(frame: NativeFrame, context: NativeContext): NativeIngestResponse;
  reset(): void;
};

const OctaTouchNative = requireNativeModule<OctaTouchNativeModuleType>('OctaTouchNative');

export default OctaTouchNative;
