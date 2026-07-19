package com.fitjob.matching.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record JobPostingDTO(
        String jobId,
        String companyId,
        String companyName,
        String title,
        String city,
        String workMode,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        List<String> requiredSkills,
        List<String> preferredSkills,
        List<String> requiredExperienceTags,
        Integer minExperienceMonths,
        List<String> acceptedMajors,
        EducationLevel minimumEducation,
        LocalDate latestStartDate,
        Integer requiredAttendanceDays,
        List<String> desiredGrowthSignals,
        List<RiskRuleDTO> riskRules,
        List<DealBreakerRuleDTO> dealBreakers
) {
    public JobPostingDTO {
        requiredSkills = immutableList(requiredSkills);
        preferredSkills = immutableList(preferredSkills);
        requiredExperienceTags = immutableList(requiredExperienceTags);
        acceptedMajors = immutableList(acceptedMajors);
        desiredGrowthSignals = immutableList(desiredGrowthSignals);
        riskRules = immutableList(riskRules);
        dealBreakers = immutableList(dealBreakers);
    }

    private static <T> List<T> immutableList(List<T> source) {
        return source == null ? List.of() : List.copyOf(source);
    }
}
