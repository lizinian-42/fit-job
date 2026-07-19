package com.fitjob.matching.dto;

import java.util.List;

public record DealBreakerResultDTO(
        String ruleCode,
        DealBreakerType type,
        boolean broken,
        String description,
        List<String> expected,
        String actual
) {
    public DealBreakerResultDTO {
        expected = expected == null ? List.of() : List.copyOf(expected);
    }
}
