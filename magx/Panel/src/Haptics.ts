// Haptic feedback utility for magx panel components
// Dual-platform: Android (navigator.vibrate) + iOS (hidden checkbox switch trick)

export class MagxHaptics {
    private static _iosCheckbox: HTMLInputElement | null = null;
    private static _iosLabel: HTMLLabelElement | null = null;
    private static _isIOS: boolean | null = null;
    private static _initialized = false;

    static get isIOS(): boolean {
        if (this._isIOS === null) {
            this._isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        }
        return this._isIOS;
    }

    static get canVibrate(): boolean {
        return 'vibrate' in navigator;
    }

    private static _initIOS(): void {
        if (this._initialized) return;
        this._initialized = true;
        if (!this.isIOS) return;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';

        this._iosLabel = document.createElement('label');
        this._iosCheckbox = document.createElement('input');
        this._iosCheckbox.type = 'checkbox';
        this._iosCheckbox.setAttribute('switch', '');
        this._iosCheckbox.id = '_magx_haptic_ios';
        this._iosLabel.htmlFor = '_magx_haptic_ios';

        wrapper.appendChild(this._iosLabel);
        wrapper.appendChild(this._iosCheckbox);
        document.body.appendChild(wrapper);
    }

    static trigger(preset: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light'): void {
        this._initIOS();

        if (this.isIOS && this._iosLabel) {
            this._iosLabel.click();
            return;
        }

        if (this.canVibrate) {
            switch (preset) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(40);
                    break;
                case 'success':
                    navigator.vibrate([10, 30, 20]);
                    break;
                case 'error':
                    navigator.vibrate([30, 20, 30, 20, 30]);
                    break;
            }
        }
    }
}
