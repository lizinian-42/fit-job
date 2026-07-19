package com.fitjob.matching.dto;

import java.util.List;

public record MatchRequestDTO(
        StudentProfileDTO student,
        List<JobPostingDTO> jobs,
        MatchWeightsDTO weights
) {
    public MatchRequestDTO {
        jobs = jobs == null ? List.of() : List.copyOf(jobs);
    }
}
