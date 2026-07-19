package com.fitjob.matching.dto;

import java.util.List;

public record WeaknessDTO(
        MatchDimension dimension,
        String code,
        String summary,
        List<String> suggestions
) {
    public WeaknessDTO {
        suggestions = suggestions == null ? List.of() : List.copyOf(suggestions);
    }
}
