package com.fitjob.matching.dto;

import java.util.List;

public record JobRankingResultDTO(
        String studentId,
        String policyVersion,
        List<JobMatchResultDTO> matches
) {
    public JobRankingResultDTO {
        matches = matches == null ? List.of() : List.copyOf(matches);
    }
}
