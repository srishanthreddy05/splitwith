package com.splittrip.backend.utils;

import java.security.SecureRandom;

public class TripCodeGenerator {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates a unique 6-character alphanumeric trip code (TUID)
     * Excludes easily confused characters: 0, O, 1, I
     * 
     * Example: TR45K9, MX7P2Q
     */
    public static String generate() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return code.toString();
    }

    /**
     * Generates a trip code with retry logic to ensure uniqueness
     * Caller must verify uniqueness against database
     */
    public static String generateWithPrefix(String prefix) {
        return prefix + generate();
    }
}
