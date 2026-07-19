package com.fitjob.matching.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record StudentProfileDTO(
        String studentId,
        String majorName,
        EducationLevel educationLevel,
        List<String> skillTags,
        List<String> experienceTags,
        List<String> targetRoles,
        List<String> preferredCities,
        BigDecimal expectedSalaryMin,
        BigDecimal expectedSalaryMax,
        LocalDate availableFrom,
        Integer weeklyAttendanceDays,
        Integer experienceMonths,
        Integer profileCompletion,
        Integer readinessScore,
        List<String> growthSignals,
        Set<String> riskFlags
) {
    public StudentProfileDTO {
        skillTags = immutableList(skillTags);
        experienceTags = immutableList(experienceTags);
        targetRoles = immutableList(targetRoles);
        preferredCities = immutableList(preferredCities);
        growthSignals = immutableList(growthSignals);
        riskFlags = riskFlags == null ? Set.of() : Set.copyOf(riskFlags);
    }

    private static <T> List<T> immutableList(List<T> source) {
        return source == null ? List.of() : List.copyOf(source);
    }
}
