package com.sapsoft.forma;

/** Retain button state when Samsung contact events omit the barrel bits. */
final class StylusButtonState {
    private static final int MASK = 2 | 32 | 64;
    private boolean held;
    boolean update(int action, int buttons, int changedButton) {
        if (action == 3) reset();
        else if (action == 12 && (changedButton & MASK) != 0) held = (buttons & MASK & ~changedButton) != 0;
        else if (action == 11 && (changedButton & MASK) != 0) held = true;
        else if (action == 7 || action == 9) held = (buttons & MASK) != 0;
        else if ((buttons & MASK) != 0) held = true;
        // Missing contact bits are not a release. Hover or an explicit release
        // is authoritative, including recovery from a dropped release event.
        return held;
    }
    void reset() { held = false; }
}
