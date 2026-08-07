# Haptic Feedback & Mobile Touch Support for Lit Web Components

Research compiled 2026-04-05.

---

## 1. Vibration API (`navigator.vibrate()`)

### Browser Support (as of April 2026)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome (Android) | Yes (30+) | Full pattern support |
| Samsung Internet | Yes (4+) | Full pattern support |
| Safari (iOS) | **No** | Not supported in any version through 26.x |
| Safari (macOS) | **No** | Not applicable (no vibration hardware) |
| Firefox (Android) | **No** (removed 129+) | Was supported 11-128, then removed |
| Edge | Yes (79+) | Chromium-based, matches Chrome |
| Opera Mobile | Yes (80+) | Chromium-based |

**Global coverage:** ~79% of users (primarily Android Chromium browsers).

### API Usage

```typescript
// Single vibration (milliseconds)
navigator.vibrate(200);

// Pattern: [vibrate, pause, vibrate, pause, ...]
navigator.vibrate([100, 50, 100]);

// Cancel any ongoing vibration
navigator.vibrate(0);
```

**Security requirement:** Requires sticky user activation (user must have interacted with the page first).

### Recommended Haptic Patterns for UI Components

| Interaction | Pattern | Duration | Rationale |
|-------------|---------|----------|-----------|
| Checkbox toggle | `vibrate(10)` | 10ms | Short, crisp tap. Mimics physical switch click. |
| Button press | `vibrate(20)` | 20ms | Slightly longer for deliberate action confirmation. |
| Color picker tap | `vibrate(8)` | 8ms | Very light, non-intrusive selection feedback. |
| Slider drag (continuous) | `vibrate([5, 15])` repeated via `setInterval` | 5ms on / 15ms off | Light pulsing during drag; cancel on pointerup. |
| Slider tick/snap | `vibrate(6)` | 6ms | Brief pulse at each value increment. |
| Success confirmation | `vibrate([15, 30, 15])` | ~60ms total | Double-tap pattern. |
| Error / rejection | `vibrate([20, 40, 20, 40, 20])` | ~140ms total | Triple pulse with wider gaps. |
| Panel drag start | `vibrate(12)` | 12ms | Feedback that drag has engaged. |
| Panel drop | `vibrate([10, 20, 15])` | ~45ms | Confirmation of placement. |

**Guidelines:**
- Keep individual pulses under 30ms for responsive feel.
- Gaps < 15ms blend into continuous vibration; gaps > 200ms feel like separate events.
- Use `setInterval` + `clearInterval` for continuous vibration during drag (the API does not natively loop).

---

## 2. iOS Safari Workaround: `<input type="checkbox" switch>`

Since Safari does not support `navigator.vibrate()`, the only way to trigger haptic feedback on iOS is via the native switch control introduced in Safari 17.4 / iOS 18.

### How It Works

Safari 18+ provides built-in haptic feedback when toggling `<input type="checkbox" switch>`. Libraries exploit this by:

1. Creating a hidden `<input type="checkbox" switch>` element
2. Programmatically toggling it via `.click()` on its associated `<label>`
3. The OS fires haptic feedback
4. Removing the element

### Library: `ios-haptics`

```bash
bun add ios-haptics
```

```typescript
import { haptic } from 'ios-haptics';

haptic();           // single tap
haptic.confirm();   // two rapid taps
haptic.error();     // three rapid taps
```

On Android, it falls back to `navigator.vibrate()` automatically.

### Cross-Platform Wrapper for Lit

```typescript
import { haptic } from 'ios-haptics';

// Unified haptic helper
function triggerHaptic(pattern: 'tap' | 'confirm' | 'error' | 'light' | number | number[]) {
  // ios-haptics handles platform detection internally
  if (pattern === 'tap') {
    haptic();
  } else if (pattern === 'confirm') {
    haptic.confirm();
  } else if (pattern === 'error') {
    haptic.error();
  } else if (typeof pattern === 'number' || Array.isArray(pattern)) {
    // Android/Chrome only - fine-grained control
    navigator.vibrate?.(pattern);
  }
}
```

**Limitation:** iOS only supports three fixed haptic intensities (tap, confirm, error) via this workaround. No custom duration or pattern control on iOS.

---

## 3. Touch Events & Draggable Panels in Lit

### Recommended Approach: Pointer Events (not Touch Events)

**Use Pointer Events**, which unify mouse, touch, and pen input into a single API. This is the modern standard and is Baseline across all browsers.

| Event | Mouse Equivalent | Touch Equivalent |
|-------|-----------------|------------------|
| `pointerdown` | `mousedown` | `touchstart` |
| `pointermove` | `mousemove` | `touchmove` |
| `pointerup` | `mouseup` | `touchend` |
| `pointercancel` | - | `touchcancel` |

### Lit Draggable Panel Pattern

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('draggable-panel')
export class DraggablePanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      touch-action: none;  /* CRITICAL: prevents browser from hijacking touch */
    }
    .panel {
      position: absolute;
      min-width: 44px;
      min-height: 44px;
      cursor: grab;
    }
    .panel.dragging {
      cursor: grabbing;
    }
  `;

  @state() private _x = 0;
  @state() private _y = 0;
  @state() private _dragging = false;

  private _startX = 0;
  private _startY = 0;
  private _pointerId: number | null = null;

  render() {
    return html`
      <div
        class="panel ${this._dragging ? 'dragging' : ''}"
        style="transform: translate(${this._x}px, ${this._y}px)"
        @pointerdown=${this._onPointerDown}
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerUp}
      >
        <slot></slot>
      </div>
    `;
  }

  private _onPointerDown(e: PointerEvent) {
    // Capture the pointer so events continue even if finger drifts off element
    (e.target as Element).setPointerCapture(e.pointerId);
    this._pointerId = e.pointerId;
    this._dragging = true;
    this._startX = e.clientX - this._x;
    this._startY = e.clientY - this._y;

    // Haptic feedback on drag start
    triggerHaptic('tap');
  }

  private _onPointerMove(e: PointerEvent) {
    if (!this._dragging || e.pointerId !== this._pointerId) return;
    this._x = e.clientX - this._startX;
    this._y = e.clientY - this._startY;
  }

  private _onPointerUp(e: PointerEvent) {
    if (e.pointerId !== this._pointerId) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    this._dragging = false;
    this._pointerId = null;

    // Haptic feedback on drop
    triggerHaptic('confirm');
  }
}
```

### Key Pointer Events Concepts

- **`setPointerCapture(pointerId)`** - Essential. Ensures `pointermove` events keep firing even when the finger/cursor drifts off the element. Without this, drag breaks when the touch moves fast.
- **`releasePointerCapture(pointerId)`** - Clean up on `pointerup` / `pointercancel`.
- **`pointerId`** - Track which pointer is doing the drag (supports multi-touch).
- **Never use HTML Drag and Drop API** (`@dragstart`) for mobile panels. It does not work with touch at all. Use pointer events.

### Converting Existing Mouse-Based Drag

| Old (mouse-only) | New (pointer, touch-compatible) |
|---|---|
| `@mousedown` | `@pointerdown` |
| `@mousemove` on `document` | `@pointermove` on element (with pointer capture) |
| `@mouseup` on `document` | `@pointerup` on element (with pointer capture) |
| `document.addEventListener('mousemove', ...)` | `element.setPointerCapture(e.pointerId)` + `@pointermove` on element |

---

## 4. Touch-Friendly CSS

### Minimum Tap Target Size

Per WCAG 2.2 (Level AAA) and platform guidelines:

| Standard | Minimum Size |
|----------|-------------|
| WCAG 2.2 Target Size | 44 x 44 CSS pixels |
| Apple HIG | 44 x 44 points |
| Material Design | 48 x 48 dp |
| Recommended for web | **44px minimum**, 48px preferred |

```css
/* Apply to all interactive elements */
button, input, select, [role="button"], [role="slider"] {
  min-width: 44px;
  min-height: 44px;
}

/* For smaller visual elements, expand the tap target with padding */
.color-swatch {
  width: 24px;
  height: 24px;
  padding: 10px;               /* visual 24px + 20px padding = 44px touch target */
  box-sizing: content-box;
}
```

### `touch-action` CSS Property

**Baseline supported across all browsers since September 2019.**

| Value | Use Case |
|-------|----------|
| `touch-action: none` | Draggable panels, canvases, custom gesture areas. Disables ALL browser gestures. |
| `touch-action: manipulation` | Buttons, checkboxes, interactive controls. Allows pan/zoom but removes 300ms click delay. |
| `touch-action: pan-x` | Horizontal sliders. Allows vertical scroll, prevents horizontal browser panning. |
| `touch-action: pan-y` | Vertical sliders. Allows horizontal scroll, prevents vertical browser panning. |
| `touch-action: pinch-zoom` | Areas where zoom is allowed but panning is custom. |

```css
/* Draggable panel - disable all browser touch handling */
.draggable-panel {
  touch-action: none;
}

/* Horizontal slider - allow vertical scroll, capture horizontal */
.horizontal-slider {
  touch-action: pan-y;  /* allow vertical scroll, prevent horizontal browser panning */
}

/* Button / checkbox - remove 300ms delay, keep scroll */
.interactive-control {
  touch-action: manipulation;
}
```

**Critical rule:** `touch-action` must be set BEFORE a gesture starts. Changing it mid-gesture has no effect. Set it in your component's static CSS, not dynamically.

### Additional Mobile CSS

```css
/* Prevent text selection during drag */
.dragging {
  user-select: none;
  -webkit-user-select: none;
}

/* Prevent iOS callout / context menu on long press */
.interactive-control {
  -webkit-touch-callout: none;
}

/* Prevent pull-to-refresh in draggable areas */
.drag-container {
  overscroll-behavior: contain;
}

/* Smooth momentum for scrollable areas within components */
.scroll-area {
  -webkit-overflow-scrolling: touch;
}
```

---

## 5. Integration Approach for Lit Components

### Architecture: `HapticController` (Reactive Controller Pattern)

```typescript
import { ReactiveController, ReactiveControllerHost } from 'lit';

export type HapticType = 'tap' | 'confirm' | 'error' | 'light';

export class HapticController implements ReactiveController {
  private host: ReactiveControllerHost;
  private sliderInterval: ReturnType<typeof setInterval> | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {}
  hostDisconnected() {
    this.stopSliderFeedback();
  }

  /** Single haptic pulse */
  trigger(type: HapticType = 'tap') {
    if (this._isIOS()) {
      this._iosHaptic(type);
    } else {
      this._vibrateHaptic(type);
    }
  }

  /** Start continuous light feedback for slider drag */
  startSliderFeedback() {
    this.stopSliderFeedback();
    this.sliderInterval = setInterval(() => {
      navigator.vibrate?.([5, 15]);
    }, 20);
  }

  /** Stop continuous slider feedback */
  stopSliderFeedback() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
      this.sliderInterval = null;
      navigator.vibrate?.(0);
    }
  }

  private _isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private async _iosHaptic(type: HapticType) {
    // Dynamic import to avoid bundling on non-iOS
    try {
      const { haptic } = await import('ios-haptics');
      switch (type) {
        case 'tap':
        case 'light':
          haptic(); break;
        case 'confirm':
          haptic.confirm(); break;
        case 'error':
          haptic.error(); break;
      }
    } catch {
      // Silently fail - haptics are progressive enhancement
    }
  }

  private _vibrateHaptic(type: HapticType) {
    if (!navigator.vibrate) return;
    switch (type) {
      case 'tap':     navigator.vibrate(10); break;
      case 'light':   navigator.vibrate(6); break;
      case 'confirm': navigator.vibrate([15, 30, 15]); break;
      case 'error':   navigator.vibrate([20, 40, 20, 40, 20]); break;
    }
  }
}
```

### Usage in Components

```typescript
@customElement('my-checkbox')
export class MyCheckbox extends LitElement {
  private haptic = new HapticController(this);

  private _onToggle() {
    this.checked = !this.checked;
    this.haptic.trigger('tap');
  }
}

@customElement('my-slider')
export class MySlider extends LitElement {
  private haptic = new HapticController(this);

  private _onPointerDown(e: PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    this.haptic.startSliderFeedback();
  }

  private _onPointerUp(e: PointerEvent) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    this.haptic.stopSliderFeedback();
  }
}
```

---

## 6. Summary of Limitations & Recommendations

### Platform Matrix

| Feature | Android Chrome | iOS Safari | Firefox | Desktop |
|---------|---------------|------------|---------|---------|
| `navigator.vibrate()` | Yes | **No** | **No** (removed) | No (no hardware) |
| `<input switch>` haptic | No | Yes (18+) | No | No |
| Pointer Events | Yes | Yes | Yes | Yes |
| `touch-action` CSS | Yes | Yes | Yes | Yes |
| 44px tap targets | Recommended | Required (HIG) | Recommended | N/A |

### Key Recommendations

1. **Use `ios-haptics` or equivalent** as a cross-platform abstraction. It handles the iOS checkbox-switch workaround and falls back to `navigator.vibrate()` on Android.

2. **Use Pointer Events, not Touch Events or HTML Drag/Drop.** Pointer Events are the unified standard that works for mouse, touch, and pen. Always use `setPointerCapture()`.

3. **Set `touch-action: none`** on any draggable element. Set it in static CSS, not dynamically.

4. **Treat haptics as progressive enhancement.** Always wrap in feature detection. Never make haptic feedback the sole indicator of state change.

5. **Keep vibrations short.** Under 30ms for routine interactions. Users should barely notice them consciously.

6. **Use a Lit ReactiveController** to encapsulate haptic logic, making it reusable across all components with a clean lifecycle.

---

## Sources

- [MDN: Navigator.vibrate()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)
- [MDN: Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [MDN: Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [MDN: touch-action CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- [Can I Use: Vibration API](https://caniuse.com/vibration)
- [ios-haptics library](https://github.com/tijnjh/ios-haptics)
- [Draggable DOM with Lit](https://rodydavis.com/posts/lit-draggable-dom)
- [Smashing Magazine: Retro Draggable Web Component with Lit](https://www.smashingmagazine.com/2022/09/building-retro-draggable-web-component-using-lit/)
- [Android Haptics Design Principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles)
- [2025 Guide to Haptics (Medium)](https://saropa-contacts.medium.com/2025-guide-to-haptics-enhancing-mobile-ux-with-tactile-feedback-676dd5937774)
- [iOS Safari Haptic Feedback (Medium, Mar 2026)](https://medium.com/@posaune0423/i-open-sourced-an-oss-library-for-arbitrary-haptic-feedback-in-ios-safari-5b8ca74a5f05)
- [W3C Pointer Events Level 3 (Nov 2025)](https://www.w3.org/TR/2025/CR-pointerevents3-20251106/)
