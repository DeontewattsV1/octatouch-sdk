export type ToolType = 'touch' | 'stylus' | 'mouse';

export interface RawTouchSample {
  x: number;
  y: number;
  pressure: number;
  contactArea: number;
  timestamp_us: number;
  nativeId: number;
}

export interface GestureInputFrame {
  timestamp_us: number;
  samples: RawTouchSample[];
  deviceId: string;
  toolType: ToolType;
  capabilities: {
    multiTouch: boolean;
    hover: boolean;
    pressure: boolean;
    stylus: boolean;
  };
}

export type FrameSink = (frame: GestureInputFrame) => void;

export class PointerEventAdapter {
  private readonly active = new Map<number, PointerEvent>();

  constructor(private readonly element: HTMLElement, private readonly sink: FrameSink) {}

  attach(): void {
    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointermove', this.handlePointerMove);
    this.element.addEventListener('pointerup', this.handlePointerUp);
    this.element.addEventListener('pointercancel', this.handlePointerUp);
  }

  detach(): void {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerUp);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.element.setPointerCapture(event.pointerId);
    this.active.set(event.pointerId, event);
    this.emit(event);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.active.has(event.pointerId)) return;
    this.active.set(event.pointerId, event);
    this.emit(event);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.active.delete(event.pointerId);
    this.emit(event);
  };

  private emit(event: PointerEvent): void {
    const rect = this.element.getBoundingClientRect();
    const samples: RawTouchSample[] = [...this.active.values()].map((pointer) => ({
      x: rect.width === 0 ? 0 : (pointer.clientX - rect.left) / rect.width,
      y: rect.height === 0 ? 0 : (pointer.clientY - rect.top) / rect.height,
      pressure: pointer.pressure ?? 0,
      contactArea: (pointer.width || 1) * (pointer.height || 1),
      timestamp_us: Math.round(event.timeStamp * 1000),
      nativeId: pointer.pointerId,
    }));

    this.sink({
      timestamp_us: Math.round(event.timeStamp * 1000),
      samples,
      deviceId: navigator.userAgent,
      toolType: this.normalizeToolType(event.pointerType),
      capabilities: {
        multiTouch: true,
        hover: true,
        pressure: true,
        stylus: true,
      },
    });
  }

  private normalizeToolType(pointerType: string): ToolType {
    if (pointerType === 'pen') return 'stylus';
    if (pointerType === 'mouse') return 'mouse';
    return 'touch';
  }
}
