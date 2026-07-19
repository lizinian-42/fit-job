package com.fitjob.matching.plugin;

import com.fitjob.matching.dto.JobRankingResultDTO;
import com.fitjob.matching.dto.MatchRequestDTO;
import com.fitjob.matching.service.JobMatchingService;
import com.fitjob.matching.service.RuleBasedJobMatchingService;

import java.util.Objects;

/**
 * Thin entry point that can be bound to a Cangqiong operation/service plugin.
 */
public final class JobMatchingPlugin {
    private final JobMatchingService service;

    public JobMatchingPlugin() {
        this(new RuleBasedJobMatchingService());
    }

    public JobMatchingPlugin(JobMatchingService service) {
        this.service = Objects.requireNonNull(service, "service");
    }

    public JobRankingResultDTO execute(MatchRequestDTO request) {
        return service.rank(request);
    }
}
