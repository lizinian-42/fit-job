package com.fitjob.matching.dto;

import java.math.BigDecimal;
import java.util.List;

public record RuleScoreDTO(
        String ruleCode,
        String label,
        int score,
        BigDecimal ruleWeight,
        List<String> evidence
) {
    public RuleScoreDTO {
        evidence = evidence == null ? List.of() : List.copyOf(evidence);
    }
}
