package com.fitjob.matching.dto;

import java.math.BigDecimal;
import java.util.List;

public record DimensionScoreDTO(
        MatchDimension dimension,
        String label,
        int score,
        BigDecimal weight,
        BigDecimal weightedScore,
        List<RuleScoreDTO> rules
) {
    public DimensionScoreDTO {
        rules = rules == null ? List.of() : List.copyOf(rules);
    }
}
