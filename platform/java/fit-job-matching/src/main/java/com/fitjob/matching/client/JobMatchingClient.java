package com.fitjob.matching.client;

import com.fitjob.matching.dto.JobRankingResultDTO;
import com.fitjob.matching.dto.MatchRequestDTO;

public interface JobMatchingClient {
    JobRankingResultDTO rankJobs(MatchRequestDTO request);
}
