package com.soldesk.moa.common.storage.local;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public final class StorageKeyGenerator {

    private static final DateTimeFormatter DATE_PATH_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private StorageKeyGenerator() {
    }

    public static String generate(String resourceType, String domain, String fileName) {
        String safeResourceType = sanitizeResourceType(resourceType);
        String safeDomain = sanitizeDomain(domain);
        String extension = extractExtension(fileName);
        String datePath = LocalDate.now().format(DATE_PATH_FORMATTER);
        String uuid = UUID.randomUUID().toString().replace("-", "");

        return safeResourceType + "/" + safeDomain + "/" + datePath + "/" + uuid
                + (extension.isEmpty() ? "" : "." + extension);
    }

    private static String sanitizeResourceType(String resourceType) {
        if (resourceType == null || resourceType.isBlank()) {
            return "common";
        }
        return resourceType.replaceAll("[^a-zA-Z0-9_-]", "").toLowerCase();
    }

    private static String sanitizeDomain(String domain) {
        if (domain == null || domain.isBlank()) {
            return "common";
        }
        String normalized = domain.replace("\\", "/").replace("..", "");
        String[] parts = normalized.split("/");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append("/");
            }
            builder.append(part.replaceAll("[^a-zA-Z0-9_-]", "_"));
        }
        return builder.length() == 0 ? "common" : builder.toString();
    }

    private static String extractExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "";
        }
        String normalized = fileName.replace("\\", "/");
        int slashIndex = normalized.lastIndexOf('/');
        String plainName = slashIndex >= 0 ? normalized.substring(slashIndex + 1) : normalized;
        int dotIndex = plainName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == plainName.length() - 1) {
            return "";
        }
        return plainName.substring(dotIndex + 1).replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }
}
