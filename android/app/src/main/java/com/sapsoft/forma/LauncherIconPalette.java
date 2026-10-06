package com.sapsoft.forma;

/** Fixed launcher resources; custom accents select the nearest available RGB tone. */
final class LauncherIconPalette {
    static final String[] KEYS = {"lavender", "green", "blue", "amber", "rose", "none"};
    static final String[] ALIASES = {"LauncherLavender", "LauncherGreen", "LauncherBlue",
            "LauncherAmber", "LauncherRose", "LauncherGray"};
    private static final int[] COLORS = {0x8578a0, 0x6c8c77, 0x6888ae, 0xaa8658, 0xa87588, 0x737b86};

    static String select(String accent, String customColor) {
        for (String key : KEYS) if (key.equals(accent)) return key;
        if (!"custom".equals(accent) || customColor == null
                || !customColor.matches("#[0-9a-fA-F]{6}")) return "lavender";
        int color = Integer.parseInt(customColor.substring(1), 16), best = 0;
        long minimum = Long.MAX_VALUE;
        for (int i = 0; i < COLORS.length; i++) {
            long distance = 0;
            for (int shift : new int[]{16, 8, 0}) {
                int delta = ((color >> shift) & 255) - ((COLORS[i] >> shift) & 255);
                distance += delta * delta;
            }
            if (distance < minimum) { minimum = distance; best = i; }
        }
        return KEYS[best];
    }

    static String alias(String key) {
        for (int i = 0; i < KEYS.length; i++) if (KEYS[i].equals(key)) return ALIASES[i];
        return ALIASES[0];
    }
}
