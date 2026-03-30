package com.soldesk.moa.common.search.util;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class ChosungSearchSettingsUtils {

    private static final String CHOSUNG_SUFFIX = "Chosung";

    private ChosungSearchSettingsUtils() {
    }

    public static String toChosungField(String fieldName) {
        if (fieldName == null || fieldName.isBlank()) {
            return "";
        }
        return fieldName + CHOSUNG_SUFFIX;
    }

    public static List<String> withChosungFields(List<String> baseSearchableFields) {
        if (baseSearchableFields == null || baseSearchableFields.isEmpty()) {
            return List.of();
        }

        Set<String> merged = new LinkedHashSet<>(baseSearchableFields);
        for (String field : baseSearchableFields) {
            if (field == null || field.isBlank()) {
                continue;
            }
            merged.add(toChosungField(field));
        }
        return List.copyOf(merged);
    }

    public static Map<String, Object> typoToleranceForChosung(List<String> baseFields) {
        if (baseFields == null || baseFields.isEmpty()) {
            return Map.of();
        }

        List<String> chosungFields = new ArrayList<>();
        for (String field : baseFields) {
            if (field == null || field.isBlank()) {
                continue;
            }
            chosungFields.add(toChosungField(field));
        }

        if (chosungFields.isEmpty()) {
            return Map.of();
        }

        return Map.of("disableOnAttributes", List.copyOf(chosungFields));
    }
}

