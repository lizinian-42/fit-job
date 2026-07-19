package com.fitjob.matching.client;

import com.fitjob.matching.dto.JobRankingResultDTO;
import com.fitjob.matching.dto.MatchRequestDTO;
import com.fitjob.matching.service.JobMatchingService;

import java.util.Objects;

public final class InProcessJobMatchingClient implements JobMatchingClient {
    private final JobMatchingService service;

    public InProcessJobMatchingClient(JobMatchingService service) {
        this.service = Objects.requireNonNull(service, "service");
    }

    @Override
    public JobRankingResultDTO rankJobs(MatchRequestDTO request) {
        return service.rank(request);
    }
}
