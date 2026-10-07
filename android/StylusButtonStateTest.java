package com.sapsoft.forma;

/** Device event sequences, including Samsung contact samples with missing button bits. */
public final class StylusButtonStateTest {
    private static int checks;
    private static void expect(StylusButtonState state, int action, int buttons, int changed, boolean held) {
        if (state.update(action, buttons, changed) != held)
            throw new AssertionError("action=" + action + ", buttons=" + buttons + ", expected=" + held);
        checks++;
    }
    public static void main(String[] args) {
        for (int mask : new int[]{2, 32, 64}) {
            StylusButtonState state = new StylusButtonState();
            expect(state, 7, mask, 0, true); // Hover with held barrel button.
            expect(state, 0, mask, 0, true);
            expect(state, 2, 0, 0, true); // Contact omitted button bits.
            expect(state, 2, 0, 0, true);
            expect(state, 1, 0, 0, true);
            expect(state, 0, 0, 0, true); // Repeated erasing contact while held.
            expect(state, 2, 0, 0, true);
            expect(state, 12, 0, mask, false); // Explicit release during contact.
            expect(state, 2, 0, 0, false);
            expect(state, 11, mask, mask, true);
            expect(state, 7, 0, 0, false); // Recover if release notification was lost.
            expect(state, 0, 0, 0, false);
            expect(state, 11, mask, mask, true);
            expect(state, 3, mask, 0, false); // Cancel wins even with stale bits.
            expect(state, 0, 0, 0, false);
            state.reset();
        }
        System.out.println("PASS stylus button sequences: " + checks);
    }
}
