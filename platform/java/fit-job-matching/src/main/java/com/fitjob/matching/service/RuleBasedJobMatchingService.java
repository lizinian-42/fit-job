package com.fitjob.matching.service;

import com.fitjob.matching.dto.DealBreakerResultDTO;
import com.fitjob.matching.dto.DealBreakerRuleDTO;
import com.fitjob.matching.dto.DealBreakerType;
import com.fitjob.matching.dto.DimensionScoreDTO;
import com.fitjob.matching.dto.EducationLevel;
import com.fitjob.matching.dto.HardConditionStatus;
import com.fitjob.matching.dto.JobMatchResultDTO;
import com.fitjob.matching.dto.JobPostingDTO;
import com.fitjob.matching.dto.JobRankingResultDTO;
import com.fitjob.matching.dto.MatchDimension;
import com.fitjob.matching.dto.MatchRequestDTO;
import com.fitjob.matching.dto.MatchWeightsDTO;
import com.fitjob.matching.dto.RecommendationLevel;
import com.fitjob.matching.dto.RiskRuleDTO;
import com.fitjob.matching.dto.RuleScoreDTO;
import com.fitjob.matching.dto.StudentProfileDTO;
import com.fitjob.matching.dto.WeaknessDTO;
import com.fitjob.matching.validation.MatchRequestValidator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class RuleBasedJobMatchingService implements JobMatchingService {
    public static final String POLICY_VERSION = "six-dimension-rule-v1.0";

    private final MatchRequestValidator validator;

    public RuleBasedJobMatchingService() {
        this(new MatchRequestValidator());
    }

    public RuleBasedJobMatchingService(MatchRequestValidator validator) {
        this.validator = validator;
    }

    @Override
    public JobRankingResultDTO rank(MatchRequestDTO request) {
        validator.validate(request);
        MatchWeightsDTO weights = normalizedWeights(
                request.weights() == null ? MatchWeightsDTO.defaults() : request.weights());

        Comparator<JobMatchResultDTO> comparator = Comparator
                .comparing((JobMatchResultDTO result) -> result.hardConditionStatus() == HardConditionStatus.BLOCKED)
                .thenComparing(Comparator.comparingInt(JobMatchResultDTO::totalScore).reversed())
                .thenComparing(JobMatchResultDTO::jobId);

        List<JobMatchResultDTO> sorted = request.jobs().stream()
                .map(job -> match(request.student(), job, weights))
                .sorted(comparator)
                .toList();

        List<JobMatchResultDTO> ranked = new ArrayList<>(sorted.size());
        for (int index = 0; index < sorted.size(); index++) {
            ranked.add(sorted.get(index).withRank(index + 1));
        }
        return new JobRankingResultDTO(request.student().studentId(), POLICY_VERSION, ranked);
    }

    @Override
    public JobMatchResultDTO match(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights) {
        MatchRequestDTO single = new MatchRequestDTO(student, List.of(job), weights);
        validator.validate(single);
        MatchWeightsDTO effectiveWeights = normalizedWeights(
                weights == null ? MatchWeightsDTO.defaults() : weights);

        EnumMap<MatchDimension, DimensionScoreDTO> dimensions = new EnumMap<>(MatchDimension.class);
        dimensions.put(MatchDimension.SKILL_MATCH, scoreSkills(student, job, effectiveWeights));
        dimensions.put(MatchDimension.EXPERIENCE_COMPETENCY, scoreExperience(student, job, effectiveWeights));
        dimensions.put(MatchDimension.JOB_INTENT, scoreIntent(student, job, effectiveWeights));
        dimensions.put(MatchDimension.BASIC_CONDITIONS, scoreBasicConditions(student, job, effectiveWeights));
        dimensions.put(MatchDimension.GROWTH_POTENTIAL, scoreGrowth(student, job, effectiveWeights));
        dimensions.put(MatchDimension.RISK_FACTORS, scoreRisk(student, job, effectiveWeights));

        List<DimensionScoreDTO> dimensionScores = List.of(
                dimensions.get(MatchDimension.SKILL_MATCH),
                dimensions.get(MatchDimension.EXPERIENCE_COMPETENCY),
                dimensions.get(MatchDimension.JOB_INTENT),
                dimensions.get(MatchDimension.BASIC_CONDITIONS),
                dimensions.get(MatchDimension.GROWTH_POTENTIAL),
                dimensions.get(MatchDimension.RISK_FACTORS)
        );
        int totalScore = overallScore(dimensionScores);
        List<DealBreakerResultDTO> dealBreakers = evaluateDealBreakers(student, job);
        boolean blocked = dealBreakers.stream().anyMatch(DealBreakerResultDTO::broken);
        HardConditionStatus hardConditionStatus = blocked ? HardConditionStatus.BLOCKED : HardConditionStatus.PASS;
        RecommendationLevel recommendationLevel = recommendation(totalScore, blocked);

        return new JobMatchResultDTO(
                0,
                student.studentId(),
                job.jobId(),
                job.companyId(),
                job.companyName(),
                job.title(),
                totalScore,
                recommendationLevel,
                hardConditionStatus,
                dimensionScores,
                dealBreakers,
                weaknesses(student, job, dimensions, dealBreakers),
                highlights(student, job, dimensions, blocked)
        );
    }

    private DimensionScoreDTO scoreSkills(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights) {
        List<RuleScoreDTO> rules = new ArrayList<>();
        boolean hasRequired = !job.requiredSkills().isEmpty();
        boolean hasPreferred = !job.preferredSkills().isEmpty();
        BigDecimal requiredWeight = hasRequired && hasPreferred ? decimal("0.80") : BigDecimal.ONE;
        BigDecimal preferredWeight = hasRequired && hasPreferred ? decimal("0.20") : BigDecimal.ONE;

        if (hasRequired) {
            rules.add(coverageRule("required-skills", "必需技能覆盖", student.skillTags(),
                    job.requiredSkills(), requiredWeight));
        }
        if (hasPreferred) {
            rules.add(coverageRule("preferred-skills", "加分技能覆盖", student.skillTags(),
                    job.preferredSkills(), preferredWeight));
        }
        if (rules.isEmpty()) {
            rules.add(rule("skill-neutral", "岗位未配置技能要求", 100, BigDecimal.ONE, "按中性满分处理"));
        }
        return dimension(MatchDimension.SKILL_MATCH, rules, weights, null);
    }

    private DimensionScoreDTO scoreExperience(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights) {
        List<RuleScoreDTO> rules = new ArrayList<>();
        boolean hasTags = !job.requiredExperienceTags().isEmpty();
        boolean hasMonths = job.minExperienceMonths() != null && job.minExperienceMonths() > 0;
        BigDecimal tagWeight = hasTags && hasMonths ? decimal("0.60") : BigDecimal.ONE;
        BigDecimal monthsWeight = hasTags && hasMonths ? decimal("0.40") : BigDecimal.ONE;

        if (hasTags) {
            rules.add(coverageRule("experience-tags", "经历标签覆盖", student.experienceTags(),
                    job.requiredExperienceTags(), tagWeight));
        }
        if (hasMonths) {
            int actual = defaultInt(student.experienceMonths(), 0);
            int score = percent(Math.min(actual, job.minExperienceMonths()), job.minExperienceMonths());
            rules.add(rule("experience-months", "经历时长", score, monthsWeight,
                    actual + " 个月 / 要求 " + job.minExperienceMonths() + " 个月"));
        }
        if (rules.isEmpty()) {
            rules.add(rule("experience-neutral", "岗位未配置经历要求", 100, BigDecimal.ONE, "按中性满分处理"));
        }
        return dimension(MatchDimension.EXPERIENCE_COMPETENCY, rules, weights, null);
    }

    private DimensionScoreDTO scoreIntent(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights) {
        int roleScore = student.targetRoles().isEmpty() ? 50
                : student.targetRoles().stream().anyMatch(role -> textMatches(role, job.title())) ? 100 : 20;
        int cityScore = student.preferredCities().isEmpty() ? 50
                : containsIgnoreCase(student.preferredCities(), job.city()) ? 100 : 20;
        int salaryScore = salaryCompatibility(student, job);

        List<RuleScoreDTO> rules = List.of(
                rule("target-role", "目标岗位一致性", roleScore, decimal("0.40"),
                        "学生目标=" + student.targetRoles() + "，岗位=" + job.title()),
                rule("preferred-city", "意向城市一致性", cityScore, decimal("0.30"),
                        "学生意向=" + student.preferredCities() + "，岗位城市=" + safe(job.city())),
                rule("salary-overlap", "薪资区间兼容", salaryScore, decimal("0.30"), salaryEvidence(student, job))
        );
        return dimension(MatchDimension.JOB_INTENT, rules, weights, null);
    }

    private DimensionScoreDTO scoreBasicConditions(StudentProfileDTO student, JobPostingDTO job,
                                                    MatchWeightsDTO weights) {
        int majorScore = job.acceptedMajors().isEmpty() ? 100
                : containsIgnoreCase(job.acceptedMajors(), student.majorName()) ? 100 : 20;
        int educationScore = job.minimumEducation() == null ? 100
                : student.educationLevel() == null ? 40
                : student.educationLevel().ordinal() >= job.minimumEducation().ordinal() ? 100 : 0;
        int startScore = job.latestStartDate() == null ? 100
                : student.availableFrom() == null ? 50
                : !student.availableFrom().isAfter(job.latestStartDate()) ? 100 : 0;
        int attendanceScore = job.requiredAttendanceDays() == null ? 100
                : student.weeklyAttendanceDays() == null ? 50
                : student.weeklyAttendanceDays() >= job.requiredAttendanceDays() ? 100
                : percent(student.weeklyAttendanceDays(), job.requiredAttendanceDays());

        List<RuleScoreDTO> rules = List.of(
                rule("accepted-major", "专业要求", majorScore, decimal("0.35"),
                        "学生专业=" + safe(student.majorName()) + "，接受专业=" + job.acceptedMajors()),
                rule("minimum-education", "学历要求", educationScore, decimal("0.25"),
                        "学生学历=" + student.educationLevel() + "，最低学历=" + job.minimumEducation()),
                rule("start-date", "到岗日期", startScore, decimal("0.20"),
                        "可到岗=" + student.availableFrom() + "，最晚到岗=" + job.latestStartDate()),
                rule("attendance-days", "每周出勤", attendanceScore, decimal("0.20"),
                        "可出勤=" + student.weeklyAttendanceDays() + "，要求=" + job.requiredAttendanceDays())
        );
        return dimension(MatchDimension.BASIC_CONDITIONS, rules, weights, null);
    }

    private DimensionScoreDTO scoreGrowth(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights) {
        int readiness = defaultInt(student.readinessScore(), 50);
        int completion = defaultInt(student.profileCompletion(), 50);
        int growthCoverage = job.desiredGrowthSignals().isEmpty()
                ? (student.growthSignals().isEmpty() ? 50 : 80)
                : coverage(student.growthSignals(), job.desiredGrowthSignals());
        List<RuleScoreDTO> rules = List.of(
                rule("readiness", "求职准备度", readiness, decimal("0.50"), "准备度=" + readiness),
                rule("profile-completion", "画像完整度", completion, decimal("0.25"), "完整度=" + completion),
                rule("growth-signals", "成长信号", growthCoverage, decimal("0.25"),
                        "学生信号=" + student.growthSignals() + "，岗位关注=" + job.desiredGrowthSignals())
        );
        return dimension(MatchDimension.GROWTH_POTENTIAL, rules, weights, null);
    }

    private DimensionScoreDTO scoreRisk(StudentProfileDTO student, JobPostingDTO job, MatchWeightsDTO weights) {
        List<RuleScoreDTO> rules = new ArrayList<>();
        int totalPenalty = 0;
        for (RiskRuleDTO riskRule : job.riskRules()) {
            boolean triggered = containsIgnoreCase(student.riskFlags(), riskRule.riskFlag());
            if (triggered) {
                totalPenalty += riskRule.penalty();
            }
            rules.add(rule(riskRule.code(), riskRule.description(),
                    triggered ? Math.max(0, 100 - riskRule.penalty()) : 100,
                    BigDecimal.valueOf(Math.max(1, riskRule.penalty())),
                    triggered ? "已触发风险标记：" + riskRule.riskFlag() : "未触发：" + riskRule.riskFlag()));
        }
        if (rules.isEmpty()) {
            rules.add(rule("risk-neutral", "岗位未配置风险扣分", 100, BigDecimal.ONE, "无风险规则"));
        }
        int score = Math.max(0, 100 - totalPenalty);
        return dimension(MatchDimension.RISK_FACTORS, rules, weights, score);
    }

    private DimensionScoreDTO dimension(MatchDimension dimension, List<RuleScoreDTO> rules,
                                        MatchWeightsDTO weights, Integer explicitScore) {
        int score = explicitScore == null ? weightedAverage(rules) : explicitScore;
        BigDecimal weight = weights.weights().get(dimension);
        BigDecimal weighted = BigDecimal.valueOf(score).multiply(weight).setScale(2, RoundingMode.HALF_UP);
        return new DimensionScoreDTO(dimension, dimension.label(), score, weight, weighted, rules);
    }

    private int overallScore(List<DimensionScoreDTO> dimensions) {
        BigDecimal weighted = BigDecimal.ZERO;
        BigDecimal weightSum = BigDecimal.ZERO;
        for (DimensionScoreDTO dimension : dimensions) {
            weighted = weighted.add(BigDecimal.valueOf(dimension.score()).multiply(dimension.weight()));
            weightSum = weightSum.add(dimension.weight());
        }
        return weighted.divide(weightSum, 0, RoundingMode.HALF_UP).intValueExact();
    }

    private MatchWeightsDTO normalizedWeights(MatchWeightsDTO weights) {
        BigDecimal sum = weights.weights().values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        EnumMap<MatchDimension, BigDecimal> normalized = new EnumMap<>(MatchDimension.class);
        for (MatchDimension dimension : MatchDimension.values()) {
            normalized.put(dimension, weights.weights().get(dimension)
                    .divide(sum, 8, RoundingMode.HALF_UP));
        }
        return new MatchWeightsDTO(normalized);
    }

    private int weightedAverage(List<RuleScoreDTO> rules) {
        BigDecimal weighted = BigDecimal.ZERO;
        BigDecimal weightSum = BigDecimal.ZERO;
        for (RuleScoreDTO rule : rules) {
            weighted = weighted.add(BigDecimal.valueOf(rule.score()).multiply(rule.ruleWeight()));
            weightSum = weightSum.add(rule.ruleWeight());
        }
        return weighted.divide(weightSum, 0, RoundingMode.HALF_UP).intValueExact();
    }

    private List<DealBreakerResultDTO> evaluateDealBreakers(StudentProfileDTO student, JobPostingDTO job) {
        return job.dealBreakers().stream()
                .map(rule -> evaluateDealBreaker(student, rule))
                .toList();
    }

    private DealBreakerResultDTO evaluateDealBreaker(StudentProfileDTO student, DealBreakerRuleDTO rule) {
        boolean broken;
        String actual;
        switch (rule.type()) {
            case REQUIRED_SKILL -> {
                List<String> missing = missing(student.skillTags(), rule.expectedValues());
                broken = !missing.isEmpty();
                actual = broken ? "缺少 " + missing : "全部满足";
            }
            case ALLOWED_MAJOR -> {
                broken = !containsIgnoreCase(rule.expectedValues(), student.majorName());
                actual = safe(student.majorName());
            }
            case MIN_EDUCATION -> {
                EducationLevel required = EducationLevel.valueOf(rule.expectedValues().get(0));
                broken = student.educationLevel() == null || student.educationLevel().ordinal() < required.ordinal();
                actual = String.valueOf(student.educationLevel());
            }
            case LATEST_START_DATE -> {
                LocalDate latest = LocalDate.parse(rule.expectedValues().get(0));
                broken = student.availableFrom() == null || student.availableFrom().isAfter(latest);
                actual = String.valueOf(student.availableFrom());
            }
            case MIN_ATTENDANCE_DAYS -> {
                int required = Integer.parseInt(rule.expectedValues().get(0));
                broken = student.weeklyAttendanceDays() == null || student.weeklyAttendanceDays() < required;
                actual = String.valueOf(student.weeklyAttendanceDays());
            }
            case MAX_EXPECTED_SALARY -> {
                BigDecimal maximum = new BigDecimal(rule.expectedValues().get(0));
                broken = student.expectedSalaryMin() != null && student.expectedSalaryMin().compareTo(maximum) > 0;
                actual = String.valueOf(student.expectedSalaryMin());
            }
            case FORBIDDEN_RISK_FLAG -> {
                List<String> triggered = intersection(student.riskFlags(), rule.expectedValues());
                broken = !triggered.isEmpty();
                actual = broken ? "触发 " + triggered : "未触发";
            }
            default -> throw new IllegalStateException("unsupported deal-breaker type: " + rule.type());
        }
        return new DealBreakerResultDTO(rule.code(), rule.type(), broken, rule.description(),
                rule.expectedValues(), actual);
    }

    private List<WeaknessDTO> weaknesses(StudentProfileDTO student, JobPostingDTO job,
                                         Map<MatchDimension, DimensionScoreDTO> dimensions,
                                         List<DealBreakerResultDTO> dealBreakers) {
        List<WeaknessDTO> result = new ArrayList<>();
        List<String> missingSkills = missing(student.skillTags(), job.requiredSkills());
        if (!missingSkills.isEmpty()) {
            result.add(new WeaknessDTO(MatchDimension.SKILL_MATCH, "MISSING_REQUIRED_SKILLS",
                    "缺少岗位必需技能：" + String.join("、", missingSkills),
                    List.of("用项目或测试证据补齐技能，不只堆叠简历关键词")));
        }
        List<String> missingExperience = missing(student.experienceTags(), job.requiredExperienceTags());
        if (!missingExperience.isEmpty()) {
            result.add(new WeaknessDTO(MatchDimension.EXPERIENCE_COMPETENCY, "MISSING_EXPERIENCE_EVIDENCE",
                    "经历证据不足：" + String.join("、", missingExperience),
                    List.of("准备量化 STAR 案例并说明个人贡献")));
        }
        if (dimensions.get(MatchDimension.JOB_INTENT).score() < 70) {
            result.add(new WeaknessDTO(MatchDimension.JOB_INTENT, "INTENT_MISMATCH",
                    "目标岗位、城市或薪资区间与岗位存在偏差",
                    List.of("确认可接受城市、岗位方向与薪资边界")));
        }
        if (dimensions.get(MatchDimension.BASIC_CONDITIONS).score() < 70) {
            result.add(new WeaknessDTO(MatchDimension.BASIC_CONDITIONS, "BASIC_CONDITION_GAP",
                    "专业、学历、到岗时间或出勤天数未完全满足",
                    List.of("投递前与企业确认可协商的硬性条件")));
        }
        if (dimensions.get(MatchDimension.GROWTH_POTENTIAL).score() < 70) {
            result.add(new WeaknessDTO(MatchDimension.GROWTH_POTENTIAL, "GROWTH_EVIDENCE_GAP",
                    "求职准备度、画像完整度或成长信号不足",
                    List.of("补充学习成果、竞赛、证书或持续迭代记录")));
        }
        List<String> triggeredRisks = job.riskRules().stream()
                .filter(rule -> containsIgnoreCase(student.riskFlags(), rule.riskFlag()))
                .map(RiskRuleDTO::description)
                .toList();
        if (!triggeredRisks.isEmpty()) {
            result.add(new WeaknessDTO(MatchDimension.RISK_FACTORS, "RISK_RULE_TRIGGERED",
                    "触发风险规则：" + String.join("、", triggeredRisks),
                    List.of("在推荐解释中保留风险提示并提供人工复核入口")));
        }
        for (DealBreakerResultDTO dealBreaker : dealBreakers) {
            if (dealBreaker.broken()) {
                result.add(new WeaknessDTO(dimensionFor(dealBreaker.type()), "DEAL_BREAKER_" + dealBreaker.ruleCode(),
                        "硬性条件不通过：" + dealBreaker.description(),
                        List.of("解除硬性条件前不进入正常推荐队列")));
            }
        }
        return result;
    }

    private List<String> highlights(StudentProfileDTO student, JobPostingDTO job,
                                    Map<MatchDimension, DimensionScoreDTO> dimensions, boolean blocked) {
        DimensionScoreDTO strongest = dimensions.values().stream()
                .max(Comparator.comparingInt(DimensionScoreDTO::score))
                .orElseThrow();
        List<String> matchedSkills = intersection(student.skillTags(), job.requiredSkills());
        List<String> highlights = new ArrayList<>();
        highlights.add("优势维度：" + strongest.label() + " " + strongest.score() + " 分");
        if (!matchedSkills.isEmpty()) {
            highlights.add("命中必需技能：" + String.join("、", matchedSkills));
        }
        highlights.add(blocked ? "存在 deal-breaker，需人工复核" : "已通过全部硬性条件");
        return highlights;
    }

    private MatchDimension dimensionFor(DealBreakerType type) {
        return switch (type) {
            case REQUIRED_SKILL -> MatchDimension.SKILL_MATCH;
            case ALLOWED_MAJOR, MIN_EDUCATION, LATEST_START_DATE, MIN_ATTENDANCE_DAYS ->
                    MatchDimension.BASIC_CONDITIONS;
            case MAX_EXPECTED_SALARY -> MatchDimension.JOB_INTENT;
            case FORBIDDEN_RISK_FLAG -> MatchDimension.RISK_FACTORS;
        };
    }

    private RecommendationLevel recommendation(int totalScore, boolean blocked) {
        if (blocked) {
            return RecommendationLevel.NOT_RECOMMENDED;
        }
        if (totalScore >= 85) {
            return RecommendationLevel.STRONGLY_RECOMMENDED;
        }
        if (totalScore >= 75) {
            return RecommendationLevel.RECOMMENDED;
        }
        if (totalScore >= 60) {
            return RecommendationLevel.CONSIDER;
        }
        return RecommendationLevel.NOT_RECOMMENDED;
    }

    private RuleScoreDTO coverageRule(String code, String label, Iterable<String> actual,
                                      List<String> expected, BigDecimal weight) {
        List<String> matched = intersection(actual, expected);
        List<String> missing = missing(actual, expected);
        return rule(code, label, coverage(actual, expected), weight,
                "命中=" + matched + "，缺少=" + missing);
    }

    private RuleScoreDTO rule(String code, String label, int score, BigDecimal weight, String evidence) {
        return new RuleScoreDTO(code, label, clamp(score), weight, List.of(evidence));
    }

    private int coverage(Iterable<String> actual, List<String> expected) {
        if (expected.isEmpty()) {
            return 100;
        }
        return percent(intersection(actual, expected).size(), expected.size());
    }

    private List<String> intersection(Iterable<String> actual, List<String> expected) {
        Set<String> normalizedActual = normalize(actual);
        return expected.stream()
                .filter(value -> normalizedActual.contains(normalize(value)))
                .distinct()
                .toList();
    }

    private List<String> missing(Iterable<String> actual, List<String> expected) {
        Set<String> normalizedActual = normalize(actual);
        return expected.stream()
                .filter(value -> !normalizedActual.contains(normalize(value)))
                .distinct()
                .toList();
    }

    private Set<String> normalize(Iterable<String> values) {
        LinkedHashSet<String> result = new LinkedHashSet<>();
        if (values != null) {
            for (String value : values) {
                String normalized = normalize(value);
                if (!normalized.isEmpty()) {
                    result.add(normalized);
                }
            }
        }
        return result;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private boolean containsIgnoreCase(Iterable<String> values, String expected) {
        return normalize(values).contains(normalize(expected));
    }

    private boolean textMatches(String left, String right) {
        String normalizedLeft = normalize(left);
        String normalizedRight = normalize(right);
        return normalizedLeft.equals(normalizedRight)
                || normalizedLeft.contains(normalizedRight)
                || normalizedRight.contains(normalizedLeft);
    }

    private int salaryCompatibility(StudentProfileDTO student, JobPostingDTO job) {
        if (student.expectedSalaryMin() == null || student.expectedSalaryMax() == null
                || job.salaryMin() == null || job.salaryMax() == null) {
            return 70;
        }
        boolean overlaps = student.expectedSalaryMin().compareTo(job.salaryMax()) <= 0
                && student.expectedSalaryMax().compareTo(job.salaryMin()) >= 0;
        return overlaps ? 100 : 20;
    }

    private String salaryEvidence(StudentProfileDTO student, JobPostingDTO job) {
        return "学生期望=" + student.expectedSalaryMin() + "-" + student.expectedSalaryMax()
                + "，岗位区间=" + job.salaryMin() + "-" + job.salaryMax();
    }

    private int percent(int numerator, int denominator) {
        if (denominator <= 0) {
            return 100;
        }
        return clamp(BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 0, RoundingMode.HALF_UP)
                .intValue());
    }

    private int defaultInt(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private BigDecimal decimal(String value) {
        return new BigDecimal(value);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
