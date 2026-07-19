package com.fitjob.matching.dto;

public enum MatchDimension {
    SKILL_MATCH("技能匹配"),
    EXPERIENCE_COMPETENCY("经历胜任力"),
    JOB_INTENT("求职意向"),
    BASIC_CONDITIONS("基础条件"),
    GROWTH_POTENTIAL("成长潜力"),
    RISK_FACTORS("风险因素");

    private final String label;

    MatchDimension(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
