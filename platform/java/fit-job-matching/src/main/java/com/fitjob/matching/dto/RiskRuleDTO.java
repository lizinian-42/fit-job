package com.fitjob.matching.dto;

public record RiskRuleDTO(
        String code,
        String riskFlag,
        int penalty,
        String description
) {
}
