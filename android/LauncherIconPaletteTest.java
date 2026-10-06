package com.sapsoft.forma;

public final class LauncherIconPaletteTest {
    private static void equal(String expected, String actual) {
        if (!expected.equals(actual)) throw new AssertionError(expected + " != " + actual);
    }
    public static void main(String[] args) {
        String[] colors = {"#8578a0", "#6c8c77", "#6888ae", "#aa8658", "#a87588", "#737b86"};
        for (int i = 0; i < colors.length; i++) {
            equal(LauncherIconPalette.KEYS[i], LauncherIconPalette.select(LauncherIconPalette.KEYS[i], null));
            equal(LauncherIconPalette.KEYS[i], LauncherIconPalette.select("custom", colors[i]));
            equal(LauncherIconPalette.ALIASES[i], LauncherIconPalette.alias(LauncherIconPalette.KEYS[i]));
        }
        equal("lavender", LauncherIconPalette.select("custom", "#8679A1"));
        for (String value : new String[]{null, "", "#FFF", "#gggggg", "#abcdef00", "../launcher"})
            equal("lavender", LauncherIconPalette.select("custom", value));
        equal("lavender", LauncherIconPalette.select("unknown", "#ff0000"));
        equal("LauncherLavender", LauncherIconPalette.alias(null));
        System.out.println("PASS: fixed/custom icon palette, case handling, nearest color, invalid-input fallback.");
    }
}
