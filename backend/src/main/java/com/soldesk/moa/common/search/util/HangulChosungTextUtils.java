package com.soldesk.moa.common.search.util;

public final class HangulChosungTextUtils {

    private static final char HANGUL_BASE = 0xAC00;
    private static final char HANGUL_LAST = 0xD7A3;
    private static final int CHOSUNG_DIVISOR = 21 * 28;
    private static final char[] CHOSUNG = {
            'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
            'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    };

    private HangulChosungTextUtils() {
    }

    /**
     * hangul-util#getChoseong 과 같은 목적의 초성 추출 함수.
     */
    public static String getChoseong(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        StringBuilder builder = new StringBuilder(value.length() * 2);
        boolean hasTokenChar = false;
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (isHangulSyllable(c)) {
                int index = (c - HANGUL_BASE) / CHOSUNG_DIVISOR;
                builder.append(CHOSUNG[index]);
                hasTokenChar = true;
                continue;
            }
            if (isCompatibilityJamo(c) || Character.isLetterOrDigit(c)) {
                builder.append(Character.toLowerCase(c));
                hasTokenChar = true;
                continue;
            }
            appendSpaceIfNeeded(builder, hasTokenChar);
            hasTokenChar = false;
        }
        return builder.toString().trim();
    }

    /**
     * hangul-util#includesByCho 에 대응하는 초성 포함 검색 함수.
     */
    public static boolean includesByCho(String source, String choQuery) {
        if (source == null || source.isBlank() || choQuery == null || choQuery.isBlank()) {
            return false;
        }
        String sourceCho = getChoseong(source);
        String queryCho = getChoseong(choQuery);
        if (queryCho.isBlank()) {
            return false;
        }
        return sourceCho.contains(queryCho);
    }

    public static String extract(String value) {
        return getChoseong(value);
    }

    private static boolean isHangulSyllable(char c) {
        return c >= HANGUL_BASE && c <= HANGUL_LAST;
    }

    private static boolean isCompatibilityJamo(char c) {
        return c >= 0x3131 && c <= 0x314E;
    }

    private static void appendSpaceIfNeeded(StringBuilder builder, boolean hasTokenChar) {
        if (!hasTokenChar) {
            return;
        }
        int length = builder.length();
        if (length == 0 || builder.charAt(length - 1) == ' ') {
            return;
        }
        builder.append(' ');
    }
}

