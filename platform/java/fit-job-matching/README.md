# Fit Job Java 六维岗位匹配服务

本模块是 Fit Job 的 Java 17+ 确定性业务能力层，对应 GitHub Issues #19、#20。它负责岗位六维规则评分、权重计算、硬性条件拦截、风险提示和岗位排序；AI Agent 只消费结构化结果并生成解释，不在模型侧重算核心分数。

## 与现有实现的关系

仓库原有 KWC Mock 数据已经提供学生画像、岗位字段、六维展示顺序和示例分数。本模块复用这些字段语义，不复制 KWC 页面或苍穹模型配置，并补上此前缺失的可执行 Java 规则、校验和测试。

六个维度按现有页面顺序输出：

1. 技能匹配 `SKILL_MATCH`
2. 经历胜任力 `EXPERIENCE_COMPETENCY`
3. 求职意向 `JOB_INTENT`
4. 基础条件 `BASIC_CONDITIONS`
5. 成长潜力 `GROWTH_POTENTIAL`
6. 风险因素 `RISK_FACTORS`

## 工程结构

```text
src/main/java/com/fitjob/matching
├── plugin       # 苍穹操作/服务插件入口适配层
├── service      # 六维评分与排序核心服务
├── client       # 供应用层或后续远程客户端调用的接口
├── dto          # 前端、苍穹和 Agent 可序列化的数据契约
└── validation   # 请求、权重、规则配置和业务字段校验
```

项目使用 Maven、Java 17 release、JUnit 5 和 Jackson。核心代码不依赖 Spring，便于嵌入苍穹插件；后续若部署为独立服务，可在外层增加 Spring Boot Controller，而不改评分内核。

## 默认评分策略

| 维度 | 默认权重 | 主要规则 |
| --- | ---: | --- |
| 技能匹配 | 28% | 必需技能覆盖、加分技能覆盖 |
| 经历胜任力 | 20% | 经历标签、经历月数 |
| 求职意向 | 17% | 目标岗位、城市、薪资区间 |
| 基础条件 | 15% | 专业、学历、到岗时间、出勤天数 |
| 成长潜力 | 12% | 求职准备度、画像完整度、成长信号 |
| 风险因素 | 8% | 命中岗位风险规则后扣分 |

自定义权重不要求总和等于 1，服务会按权重总和归一化。每个维度同时返回内部 `rules`，前端和 Agent 可以展示规则分与证据。

`dealBreakers` 支持必需技能、允许专业、最低学历、最晚到岗、最低出勤、最高期望薪资和禁止风险标记。命中任一硬性条件时：

- `hardConditionStatus = BLOCKED`
- `recommendationLevel = NOT_RECOMMENDED`
- 排序时位于所有通过硬性条件的岗位之后
- 保留原始六维总分，便于人工复核时区分“能力匹配但硬条件不符”和“整体不匹配”

## 构建与测试

```bash
cd platform/java/fit-job-matching
mvn test
mvn package
```

测试覆盖模拟学生与多个模拟岗位的排序、六维规则分、自定义权重、deal-breaker、风险扣分、短板、输入校验、插件/客户端入口和 JSON 序列化。

## 调用入口

```java
JobMatchingService service = new RuleBasedJobMatchingService();
JobRankingResultDTO result = service.rank(
    new MatchRequestDTO(student, jobs, MatchWeightsDTO.defaults())
);
```

结构化结果包含：

- `rank`、`studentId`、`jobId`、企业和岗位名称
- `totalScore`、`recommendationLevel`、`hardConditionStatus`
- 六个 `dimensionScores` 及其规则分与证据
- `dealBreakers`、`weaknesses`、`highlights`

这些字段可直接由 Jackson 序列化，供 KWC 前端、苍穹服务动作和岗位匹配 Agent 使用。
