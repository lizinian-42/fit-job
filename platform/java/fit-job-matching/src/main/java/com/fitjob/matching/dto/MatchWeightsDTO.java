package com.fitjob.matching.dto;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;

public record MatchWeightsDTO(Map<MatchDimension, BigDecimal> weights) {
    public MatchWeightsDTO {
        EnumMap<MatchDimension, BigDecimal> copy = new EnumMap<>(MatchDimension.class);
        if (weights != null) {
            copy.putAll(weights);
        }
        weights = Collections.unmodifiableMap(copy);
    }

    public static MatchWeightsDTO defaults() {
        return new MatchWeightsDTO(Map.of(
                MatchDimension.SKILL_MATCH, new BigDecimal("0.28"),
                MatchDimension.EXPERIENCE_COMPETENCY, new BigDecimal("0.20"),
                MatchDimension.JOB_INTENT, new BigDecimal("0.17"),
                MatchDimension.BASIC_CONDITIONS, new BigDecimal("0.15"),
                MatchDimension.GROWTH_POTENTIAL, new BigDecimal("0.12"),
                MatchDimension.RISK_FACTORS, new BigDecimal("0.08")
        ));
    }
}
