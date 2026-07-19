package com.fitjob.matching.dto;

import java.util.List;

public record DealBreakerRuleDTO(
        String code,
        DealBreakerType type,
        List<String> expectedValues,
        String description
) {
    public DealBreakerRuleDTO {
        expectedValues = expectedValues == null ? List.of() : List.copyOf(expectedValues);
    }
}
