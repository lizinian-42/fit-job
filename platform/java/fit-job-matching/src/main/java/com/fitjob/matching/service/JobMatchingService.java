package com.fitjob.matching.service;

import com.fitjob.matching.dto.JobMatchResultDTO;
import com.fitjob.matching.dto.JobPostingDTO;
import com.fitjob.matching.dto.JobRankingResultDTO;
import com.fitjob.matching.dto.MatchRequestDTO;
import com.fitjob.matching.dto.MatchWeightsDTO;
import com.fitjob.matching.dto.StudentProfileDTO;

public interface JobMatchingService {
    JobRankingResultDTO rank(MatchRequestDTO request);

    JobMatchResultDTO match(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights);
}
