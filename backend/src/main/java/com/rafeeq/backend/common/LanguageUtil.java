package com.rafeeq.backend.common;

import java.util.Locale;

public final class LanguageUtil {

    private LanguageUtil() {
    }

    public static boolean isArabic(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return false;
        }
        return acceptLanguage.toLowerCase(Locale.ROOT).startsWith("ar");
    }

    public static String pick(String acceptLanguage, String arabicValue, String englishValue) {
        if (isArabic(acceptLanguage)) {
            return firstNonBlank(arabicValue, englishValue);
        }
        return firstNonBlank(englishValue, arabicValue);
    }

    public static String firstNonBlank(String primaryValue, String fallbackValue) {
        if (primaryValue != null && !primaryValue.isBlank()) {
            return primaryValue;
        }
        return fallbackValue;
    }
}
