package com.fitjob.matching.validation;

import com.fitjob.matching.dto.DealBreakerRuleDTO;
import com.fitjob.matching.dto.DealBreakerType;
import com.fitjob.matching.dto.JobPostingDTO;
import com.fitjob.matching.dto.MatchDimension;
import com.fitjob.matching.dto.MatchRequestDTO;
import com.fitjob.matching.dto.MatchWeightsDTO;
import com.fitjob.matching.dto.RiskRuleDTO;
import com.fitjob.matching.dto.StudentProfileDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.Set;

public final class MatchRequestValidator {

    public void validate(MatchRequestDTO request) {
        if (request == null) {
            fail("match request must not be null");
        }
        validateStudent(request.student());
        validateWeights(request.weights() == null ? MatchWeightsDTO.defaults() : request.weights());

        Set<String> jobIds = new HashSet<>();
        for (JobPostingDTO job : request.jobs()) {
            validateJob(job);
            if (!jobIds.add(job.jobId())) {
                fail("duplicate jobId: " + job.jobId());
            }
        }
    }

    private void validateStudent(StudentProfileDTO student) {
        if (student == null) {
            fail("student must not be null");
        }
        requireText(student.studentId(), "student.studentId");
        range(student.weeklyAttendanceDays(), 1, 7, "student.weeklyAttendanceDays");
        range(student.experienceMonths(), 0, 600, "student.experienceMonths");
        range(student.profileCompletion(), 0, 100, "student.profileCompletion");
        range(student.readinessScore(), 0, 100, "student.readinessScore");
        validateSalaryRange(student.expectedSalaryMin(), student.expectedSalaryMax(), "student expected salary");
    }

    private void validateJob(JobPostingDTO job) {
        if (job == null) {
            fail("job must not be null");
        }
        requireText(job.jobId(), "job.jobId");
        requireText(job.title(), "job.title");
        validateSalaryRange(job.salaryMin(), job.salaryMax(), "job salary for " + job.jobId());
        range(job.minExperienceMonths(), 0, 600, "job.minExperienceMonths");
        range(job.requiredAttendanceDays(), 1, 7, "job.requiredAttendanceDays");

        Set<String> riskRuleCodes = new HashSet<>();
        for (RiskRuleDTO riskRule : job.riskRules()) {
            requireText(riskRule.code(), "riskRule.code");
            requireText(riskRule.riskFlag(), "riskRule.riskFlag");
            if (!riskRuleCodes.add(riskRule.code())) {
                fail("duplicate risk rule code: " + riskRule.code());
            }
            if (riskRule.penalty() < 0 || riskRule.penalty() > 100) {
                fail("risk penalty must be between 0 and 100: " + riskRule.code());
            }
        }
        Set<String> dealBreakerCodes = new HashSet<>();
        for (DealBreakerRuleDTO rule : job.dealBreakers()) {
            requireText(rule.code(), "dealBreaker.code");
            if (!dealBreakerCodes.add(rule.code())) {
                fail("duplicate deal-breaker code: " + rule.code());
            }
            if (rule.type() == null) {
                fail("dealBreaker.type must not be null: " + rule.code());
            }
            if (rule.expectedValues().isEmpty()) {
                fail("dealBreaker.expectedValues must not be empty: " + rule.code());
            }
            for (String expectedValue : rule.expectedValues()) {
                requireText(expectedValue, "dealBreaker.expectedValues for " + rule.code());
            }
            validateDealBreakerValue(rule);
        }
    }

    private void validateDealBreakerValue(DealBreakerRuleDTO rule) {
        try {
            if (rule.type() == DealBreakerType.MIN_EDUCATION) {
                Enum.valueOf(com.fitjob.matching.dto.EducationLevel.class, rule.expectedValues().get(0));
            } else if (rule.type() == DealBreakerType.LATEST_START_DATE) {
                LocalDate.parse(rule.expectedValues().get(0));
            } else if (rule.type() == DealBreakerType.MIN_ATTENDANCE_DAYS) {
                int value = Integer.parseInt(rule.expectedValues().get(0));
                if (value < 1 || value > 7) {
                    fail("deal-breaker attendance must be between 1 and 7: " + rule.code());
                }
            } else if (rule.type() == DealBreakerType.MAX_EXPECTED_SALARY) {
                if (new BigDecimal(rule.expectedValues().get(0)).signum() < 0) {
                    fail("deal-breaker salary must not be negative: " + rule.code());
                }
            }
        } catch (DateTimeParseException | IllegalArgumentException exception) {
            fail("invalid deal-breaker value for " + rule.code() + ": " + exception.getMessage());
        }
    }

    private void validateWeights(MatchWeightsDTO weights) {
        BigDecimal sum = BigDecimal.ZERO;
        for (MatchDimension dimension : MatchDimension.values()) {
            BigDecimal value = weights.weights().get(dimension);
            if (value == null) {
                fail("missing weight for dimension: " + dimension);
            }
            if (value.signum() < 0) {
                fail("weight must not be negative: " + dimension);
            }
            sum = sum.add(value);
        }
        if (sum.signum() <= 0) {
            fail("the sum of match weights must be greater than zero");
        }
    }

    private void validateSalaryRange(BigDecimal min, BigDecimal max, String label) {
        if (min != null && min.signum() < 0 || max != null && max.signum() < 0) {
            fail(label + " must not be negative");
        }
        if (min != null && max != null && min.compareTo(max) > 0) {
            fail(label + " minimum must not exceed maximum");
        }
    }

    private void requireText(String value, String label) {
        if (value == null || value.isBlank()) {
            fail(label + " must not be blank");
        }
    }

    private void range(Integer value, int min, int max, String label) {
        if (value != null && (value < min || value > max)) {
            fail(label + " must be between " + min + " and " + max);
        }
    }

    private void fail(String message) {
        throw new MatchValidationException(message);
    }
}
