package com.fitjob.matching.dto;

import java.util.List;

public record JobMatchResultDTO(
        int rank,
        String studentId,
        String jobId,
        String companyId,
        String companyName,
        String jobTitle,
        int totalScore,
        RecommendationLevel recommendationLevel,
        HardConditionStatus hardConditionStatus,
        List<DimensionScoreDTO> dimensionScores,
        List<DealBreakerResultDTO> dealBreakers,
        List<WeaknessDTO> weaknesses,
        List<String> highlights
) {
    public JobMatchResultDTO {
        dimensionScores = immutableList(dimensionScores);
        dealBreakers = immutableList(dealBreakers);
        weaknesses = immutableList(weaknesses);
        highlights = immutableList(highlights);
    }

    public JobMatchResultDTO withRank(int newRank) {
        return new JobMatchResultDTO(newRank, studentId, jobId, companyId, companyName, jobTitle,
                totalScore, recommendationLevel, hardConditionStatus, dimensionScores,
                dealBreakers, weaknesses, highlights);
    }

    private static <T> List<T> immutableList(List<T> source) {
        return source == null ? List.of() : List.copyOf(source);
    }
}
