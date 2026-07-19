package com.fitjob.matching.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fitjob.matching.client.InProcessJobMatchingClient;
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
import com.fitjob.matching.dto.StudentProfileDTO;
import com.fitjob.matching.plugin.JobMatchingPlugin;
import com.fitjob.matching.validation.MatchValidationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RuleBasedJobMatchingServiceTest {
    private final RuleBasedJobMatchingService service = new RuleBasedJobMatchingService();

    @Test
    void ranksMockJobsAndAssignsStableRanks() {
        JobPostingDTO best = job("JOB-FE", "前端开发实习生", "杭州",
                List.of("React", "TypeScript"), List.of("项目", "前端"), List.of(), List.of());
        JobPostingDTO second = job("JOB-DATA", "数据分析实习生", "上海",
                List.of("Python", "SQL"), List.of("数据分析"), List.of(), List.of());

        JobRankingResultDTO result = service.rank(request(baseStudent(), List.of(second, best), null));

        assertEquals(List.of("JOB-FE", "JOB-DATA"), result.matches().stream().map(JobMatchResultDTO::jobId).toList());
        assertEquals(List.of(1, 2), result.matches().stream().map(JobMatchResultDTO::rank).toList());
        assertEquals(RuleBasedJobMatchingService.POLICY_VERSION, result.policyVersion());
    }

    @Test
    void givesFullSkillScoreWhenAllRequiredAndPreferredSkillsMatch() {
        JobMatchResultDTO result = service.match(baseStudent(), baseJob(), MatchWeightsDTO.defaults());

        assertEquals(100, dimension(result, MatchDimension.SKILL_MATCH).score());
        assertEquals(2, dimension(result, MatchDimension.SKILL_MATCH).rules().size());
    }

    @Test
    void matchesTagsCaseInsensitively() {
        JobPostingDTO job = job("JOB-CASE", "前端开发实习生", "杭州",
                List.of("react", "TYPESCRIPT"), List.of("项目"), List.of(), List.of());

        JobMatchResultDTO result = service.match(baseStudent(), job, MatchWeightsDTO.defaults());

        assertEquals(100, dimension(result, MatchDimension.SKILL_MATCH).rules().get(0).score());
    }

    @Test
    void reportsMissingRequiredSkillsAsWeaknesses() {
        JobPostingDTO job = job("JOB-JAVA", "Java 后端开发实习生", "杭州",
                List.of("Java 17", "Spring Boot"), List.of("后端"), List.of(), List.of());

        JobMatchResultDTO result = service.match(baseStudent(), job, MatchWeightsDTO.defaults());

        assertTrue(result.weaknesses().stream().anyMatch(item -> item.code().equals("MISSING_REQUIRED_SKILLS")));
        assertTrue(result.weaknesses().stream().anyMatch(item -> item.summary().contains("Spring Boot")));
    }

    @Test
    void customWeightsCanChangeRanking() {
        JobPostingDTO skillFit = job("JOB-SKILL", "后端开发实习生", "北京",
                List.of("React", "TypeScript"), List.of("项目"), List.of(), List.of());
        JobPostingDTO intentFit = job("JOB-INTENT", "前端开发实习生", "杭州",
                List.of("Java 17", "Spring Boot"), List.of("项目"), List.of(), List.of());

        JobRankingResultDTO skillRanking = service.rank(request(baseStudent(), List.of(intentFit, skillFit),
                onlyWeight(MatchDimension.SKILL_MATCH)));
        JobRankingResultDTO intentRanking = service.rank(request(baseStudent(), List.of(intentFit, skillFit),
                onlyWeight(MatchDimension.JOB_INTENT)));

        assertEquals("JOB-SKILL", skillRanking.matches().get(0).jobId());
        assertEquals("JOB-INTENT", intentRanking.matches().get(0).jobId());
    }

    @Test
    void dealBreakerBlocksRecommendation() {
        DealBreakerRuleDTO rule = new DealBreakerRuleDTO("must-java", DealBreakerType.REQUIRED_SKILL,
                List.of("Java 17"), "必须具备 Java 17");
        JobPostingDTO job = job("JOB-BLOCKED", "前端开发实习生", "杭州",
                List.of("React"), List.of("项目"), List.of(rule), List.of());

        JobMatchResultDTO result = service.match(baseStudent(), job, MatchWeightsDTO.defaults());

        assertEquals(HardConditionStatus.BLOCKED, result.hardConditionStatus());
        assertEquals(RecommendationLevel.NOT_RECOMMENDED, result.recommendationLevel());
        assertTrue(result.dealBreakers().get(0).broken());
    }

    @Test
    void passingJobRanksBeforeHigherScoringBlockedJob() {
        DealBreakerRuleDTO rule = new DealBreakerRuleDTO("must-docker", DealBreakerType.REQUIRED_SKILL,
                List.of("Docker"), "必须具备 Docker");
        JobPostingDTO blockedHighScore = job("JOB-HIGH-BLOCKED", "前端开发实习生", "杭州",
                List.of("React", "TypeScript"), List.of("项目", "前端"), List.of(rule), List.of());
        JobPostingDTO passingLowScore = job("JOB-LOW-PASS", "市场运营实习生", "北京",
                List.of("增长运营", "文案"), List.of("运营"), List.of(), List.of());

        JobRankingResultDTO result = service.rank(request(baseStudent(), List.of(blockedHighScore, passingLowScore), null));

        assertEquals("JOB-LOW-PASS", result.matches().get(0).jobId());
        assertTrue(result.matches().get(1).totalScore() > result.matches().get(0).totalScore());
    }

    @Test
    void riskRuleDeductsConfiguredPenalty() {
        StudentProfileDTO student = withRisks(baseStudent(), Set.of("LOW_ATTENDANCE"));
        RiskRuleDTO riskRule = new RiskRuleDTO("risk-attendance", "LOW_ATTENDANCE", 35, "出勤稳定性风险");
        JobPostingDTO job = job("JOB-RISK", "前端开发实习生", "杭州",
                List.of("React"), List.of("项目"), List.of(), List.of(riskRule));

        JobMatchResultDTO result = service.match(student, job, MatchWeightsDTO.defaults());

        assertEquals(65, dimension(result, MatchDimension.RISK_FACTORS).score());
        assertTrue(result.weaknesses().stream().anyMatch(item -> item.code().equals("RISK_RULE_TRIGGERED")));
    }

    @Test
    void highFitProducesStrongRecommendation() {
        JobMatchResultDTO result = service.match(baseStudent(), baseJob(), MatchWeightsDTO.defaults());

        assertTrue(result.totalScore() >= 85);
        assertEquals(RecommendationLevel.STRONGLY_RECOMMENDED, result.recommendationLevel());
        assertEquals(HardConditionStatus.PASS, result.hardConditionStatus());
    }

    @Test
    void salaryMismatchLowersIntentScore() {
        StudentProfileDTO expensiveStudent = withSalary(baseStudent(), new BigDecimal("500"), new BigDecimal("600"));

        int compatible = dimension(service.match(baseStudent(), baseJob(), MatchWeightsDTO.defaults()),
                MatchDimension.JOB_INTENT).score();
        int incompatible = dimension(service.match(expensiveStudent, baseJob(), MatchWeightsDTO.defaults()),
                MatchDimension.JOB_INTENT).score();

        assertTrue(incompatible < compatible);
    }

    @Test
    void rejectsMissingDimensionWeight() {
        MatchWeightsDTO invalid = new MatchWeightsDTO(Map.of(MatchDimension.SKILL_MATCH, BigDecimal.ONE));

        MatchValidationException exception = assertThrows(MatchValidationException.class,
                () -> service.rank(request(baseStudent(), List.of(baseJob()), invalid)));

        assertTrue(exception.getMessage().contains("missing weight"));
    }

    @Test
    void rejectsDuplicateJobIds() {
        JobPostingDTO first = baseJob();
        JobPostingDTO duplicate = job(first.jobId(), "另一个岗位", "上海",
                List.of("SQL"), List.of("数据"), List.of(), List.of());

        MatchValidationException exception = assertThrows(MatchValidationException.class,
                () -> service.rank(request(baseStudent(), List.of(first, duplicate), null)));

        assertTrue(exception.getMessage().contains("duplicate jobId"));
    }

    @Test
    void returnsEmptyRankingForEmptyCandidateJobs() {
        JobRankingResultDTO result = service.rank(request(baseStudent(), List.of(), null));

        assertTrue(result.matches().isEmpty());
    }

    @Test
    void outputCanBeSerializedForFrontendAndAgent() throws Exception {
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        JobRankingResultDTO result = service.rank(request(baseStudent(), List.of(baseJob()), null));

        String json = mapper.writeValueAsString(result);

        assertTrue(mapper.readTree(json).at("/matches/0/dimensionScores").isArray());
        assertTrue(mapper.readTree(json).at("/matches/0/weaknesses").isArray());
        assertEquals("STRONGLY_RECOMMENDED",
                mapper.readTree(json).at("/matches/0/recommendationLevel").asText());
    }

    @Test
    void pluginAndClientUseTheSameServiceContract() {
        MatchRequestDTO request = request(baseStudent(), List.of(baseJob()), null);
        JobMatchingPlugin plugin = new JobMatchingPlugin(service);
        InProcessJobMatchingClient client = new InProcessJobMatchingClient(service);

        assertEquals(plugin.execute(request), client.rankJobs(request));
    }

    @Test
    void rejectsReversedSalaryRange() {
        StudentProfileDTO invalid = withSalary(baseStudent(), new BigDecimal("300"), new BigDecimal("200"));

        assertThrows(MatchValidationException.class,
                () -> service.rank(request(invalid, List.of(baseJob()), null)));
    }

    @Test
    void rejectsBlankDealBreakerExpectedValue() {
        DealBreakerRuleDTO invalidRule = new DealBreakerRuleDTO("must-skill", DealBreakerType.REQUIRED_SKILL,
                List.of(" "), "必须具备指定技能");
        JobPostingDTO invalidJob = job("JOB-BLANK-RULE", "前端开发实习生", "杭州",
                List.of("React"), List.of("项目"), List.of(invalidRule), List.of());

        assertThrows(MatchValidationException.class,
                () -> service.rank(request(baseStudent(), List.of(invalidJob), null)));
    }

    @Test
    void rejectsDuplicateRiskRuleCodes() {
        RiskRuleDTO first = new RiskRuleDTO("risk-duplicate", "LOW_ATTENDANCE", 20, "出勤风险");
        RiskRuleDTO second = new RiskRuleDTO("risk-duplicate", "LOW_READINESS", 15, "准备度风险");
        JobPostingDTO invalidJob = job("JOB-DUPLICATE-RISK", "前端开发实习生", "杭州",
                List.of("React"), List.of("项目"), List.of(), List.of(first, second));

        MatchValidationException exception = assertThrows(MatchValidationException.class,
                () -> service.rank(request(baseStudent(), List.of(invalidJob), null)));
        assertTrue(exception.getMessage().contains("duplicate risk rule code"));
    }

    private MatchRequestDTO request(StudentProfileDTO student, List<JobPostingDTO> jobs, MatchWeightsDTO weights) {
        return new MatchRequestDTO(student, jobs, weights);
    }

    private StudentProfileDTO baseStudent() {
        return new StudentProfileDTO(
                "STU-DEMO-001",
                "软件工程",
                EducationLevel.BACHELOR,
                List.of("React", "TypeScript", "JUnit"),
                List.of("项目", "前端", "自动化测试"),
                List.of("前端开发实习生", "AI 产品实习生"),
                List.of("杭州", "上海"),
                new BigDecimal("180"),
                new BigDecimal("250"),
                LocalDate.of(2026, 9, 1),
                3,
                12,
                90,
                92,
                List.of("持续学习", "开源项目"),
                Set.of()
        );
    }

    private StudentProfileDTO withRisks(StudentProfileDTO source, Set<String> risks) {
        return new StudentProfileDTO(source.studentId(), source.majorName(), source.educationLevel(),
                source.skillTags(), source.experienceTags(), source.targetRoles(), source.preferredCities(),
                source.expectedSalaryMin(), source.expectedSalaryMax(), source.availableFrom(),
                source.weeklyAttendanceDays(), source.experienceMonths(), source.profileCompletion(),
                source.readinessScore(), source.growthSignals(), risks);
    }

    private StudentProfileDTO withSalary(StudentProfileDTO source, BigDecimal min, BigDecimal max) {
        return new StudentProfileDTO(source.studentId(), source.majorName(), source.educationLevel(),
                source.skillTags(), source.experienceTags(), source.targetRoles(), source.preferredCities(),
                min, max, source.availableFrom(), source.weeklyAttendanceDays(), source.experienceMonths(),
                source.profileCompletion(), source.readinessScore(), source.growthSignals(), source.riskFlags());
    }

    private JobPostingDTO baseJob() {
        return job("JOB-DEMO-FE-001", "前端开发实习生", "杭州",
                List.of("React", "TypeScript"), List.of("项目", "前端"), List.of(), List.of());
    }

    private JobPostingDTO job(String jobId, String title, String city, List<String> requiredSkills,
                              List<String> experienceTags, List<DealBreakerRuleDTO> dealBreakers,
                              List<RiskRuleDTO> riskRules) {
        return new JobPostingDTO(
                jobId,
                "COMPANY-DEMO-A",
                "示例科技 A",
                title,
                city,
                "ONSITE",
                new BigDecimal("180"),
                new BigDecimal("220"),
                requiredSkills,
                List.of("JUnit"),
                experienceTags,
                6,
                List.of("软件工程", "计算机科学与技术"),
                EducationLevel.BACHELOR,
                LocalDate.of(2026, 9, 15),
                3,
                List.of("开源项目"),
                riskRules,
                dealBreakers
        );
    }

    private MatchWeightsDTO onlyWeight(MatchDimension selected) {
        EnumMap<MatchDimension, BigDecimal> weights = new EnumMap<>(MatchDimension.class);
        for (MatchDimension dimension : MatchDimension.values()) {
            weights.put(dimension, dimension == selected ? BigDecimal.ONE : BigDecimal.ZERO);
        }
        return new MatchWeightsDTO(weights);
    }

    private DimensionScoreDTO dimension(JobMatchResultDTO result, MatchDimension dimension) {
        return result.dimensionScores().stream()
                .filter(score -> score.dimension() == dimension)
                .findFirst()
                .orElseThrow();
    }
}
