package com.soldesk.moa.common.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ProfanityFilterService {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern HTML_NBSP_PATTERN = Pattern.compile("&nbsp;", Pattern.CASE_INSENSITIVE);
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

    private final List<Pattern> patterns;

    public ProfanityFilterService(ObjectMapper objectMapper) {
        this.patterns = loadBadWordPatterns(objectMapper);
    }

    public boolean containsProfanity(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String compact = compact(value);
        for (Pattern pattern : patterns) {
            if (pattern.matcher(value).find() || pattern.matcher(compact).find()) {
                return true;
            }
        }
        return false;
    }

    public boolean containsProfanityInHtml(String html) {
        if (html == null || html.isBlank()) {
            return false;
        }
        return containsProfanity(stripHtmlToText(html));
    }

    public void validateNoProfanity(String value, String message) {
        if (containsProfanity(value)) {
            throw new IllegalArgumentException(message);
        }
    }

    public void validateNoProfanityInHtml(String html, String message) {
        if (containsProfanityInHtml(html)) {
            throw new IllegalArgumentException(message);
        }
    }

    private String stripHtmlToText(String html) {
        String noTag = HTML_TAG_PATTERN.matcher(html).replaceAll(" ");
        String noNbsp = HTML_NBSP_PATTERN.matcher(noTag).replaceAll(" ");
        return WHITESPACE_PATTERN.matcher(noNbsp).replaceAll(" ").trim();
    }

    private String compact(String value) {
        return WHITESPACE_PATTERN.matcher(value).replaceAll("");
    }

    private List<Pattern> loadBadWordPatterns(ObjectMapper objectMapper) {
        ClassPathResource resource = new ClassPathResource("profanity/badwords-ko.json");
        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode badWordsNode = root.path("badWords");
            if (!badWordsNode.isArray()) {
                throw new IllegalStateException("[#PROFANITY] badWords 목록 형식이 올바르지 않습니다.");
            }

            List<Pattern> loadedPatterns = new ArrayList<>();
            for (JsonNode node : badWordsNode) {
                String word = node.asText("").trim();
                if (word.isEmpty()) {
                    continue;
                }
                try {
                    loadedPatterns.add(Pattern.compile(word));
                } catch (PatternSyntaxException ignored) {
                    // 프론트 라이브러리 호환을 위해 불완전 패턴은 건너뜀
                }
            }
            if (loadedPatterns.isEmpty()) {
                throw new IllegalStateException("[#PROFANITY] 로드된 비속어 패턴이 없습니다.");
            }
            return List.copyOf(loadedPatterns);
        } catch (IOException e) {
            throw new IllegalStateException("[#PROFANITY] 비속어 목록 파일을 불러올 수 없습니다.", e);
        }
    }
}
