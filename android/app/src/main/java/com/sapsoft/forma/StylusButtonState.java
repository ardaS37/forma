package com.sapsoft.forma;

/** Retain button state when Samsung contact events omit the barrel bits. */
final class StylusButtonState {
    private static final int MASK = 2 | 32 | 64;
    private boolean held, explicitPress, contactReported;
    boolean update(int action, int buttons, int changedButton) {
        if (action == 3) reset();
        else if (action == 12 && (changedButton & MASK) != 0) { held = false; explicitPress = false; }
        else if (action == 11 && (changedButton & MASK) != 0) { held = true; explicitPress = true; }
        else if ((buttons & MASK) != 0) { held = true; if (action == 0 || action == 2) contactReported = true; }
        else if (action == 2 && contactReported && !explicitPress) held = false;
        else if (action == 7 && !explicitPress) held = false;
        if (action == 1 || action == 9) contactReported = false;
        return held;
    }
    void reset() { held = false; explicitPress = false; contactReported = false; }
}
