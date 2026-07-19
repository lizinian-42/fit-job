# M2 苍穹与 AI 能力对接指南

本文档定义 M2 的接口、模型边界和验收顺序。正式字段基线以 `platform/cangqiong/src/modelCatalog.mjs` 为准，`demoData.js` 只提供与其一致的匿名演示记录。

Issues #14–#18 的仓库侧蓝图已完成：

- [11 个表单模型与 Java DTO 映射](./cangqiong-form-models.md)
- [四类角色权限矩阵](./cangqiong-permission-matrix.md)
- [岗位申请与实习审批流程](./cangqiong-application-workflows.md)
- [苍穹蓝图运行与平台落地说明](../platform/cangqiong/README.md)

## 苍穹页面与模型

| 页面 | formId | 建议模型 |
| --- | --- | --- |
| 演示首页 | `fitJobDemoHomePage` | 无业务表，聚合导航 |
| 学生工作台 | `studentWorkbenchPage` | `fit_student_profile`、成长任务、活动记录 |
| 简历诊断 | `resumeDiagnosisPage` | `fit_resume`、诊断报告、优化建议 |
| 岗位推荐 | `jobRecommendationPage` | `fit_company`、`fit_job`、`fit_job_application` |
| AI 面试 | `interviewTrainingPage` | 面试场次、逐题回答、面试报告 |
| 政策问答 | `policyQaPage` | 政策知识条目、问答记录、来源引用 |
| 就业驾驶舱 | `employmentDashboardPage` | 指标快照、风险学生、跟进记录 |

## 建议服务契约

| 能力 | 建议接口 | 输入 | 输出 |
| --- | --- | --- | --- |
| 学生画像 | `GET /api/v1/students/{id}/profile` | 学生 ID | `StudentProfileDTO` |
| 简历诊断 | `POST /api/v1/resumes/diagnose` | 学生、简历版本、目标岗位 | `ResumeDiagnosisReportDTO` |
| 岗位排序 | `POST /api/v1/jobs/rank` | 学生画像、岗位 ID 列表 | `JobMatchResultDTO[]` |
| 面试开场 | `POST /api/v1/interviews` | 学生、岗位、面试类型 | `InterviewSessionDTO` |
| 面试提交 | `POST /api/v1/interviews/{id}/answers` | 问题 ID、回答文本 | 下一题与逐题反馈 |
| 面试报告 | `POST /api/v1/interviews/{id}/report` | 场次 ID | `InterviewReportDTO` |
| 政策问答 | `POST /api/v1/policies/qa` | 学生画像、地区、问题 | `PolicyAnswerDTO` 与 `referenceInfos` |
| 驾驶舱 | `GET /api/v1/dashboard/employment` | 院系、毕业届别 | `EmploymentDashboardDTO` |

## Java 与 Agent 边界

- Java 服务负责身份校验、DTO 校验、确定性评分、风险规则、数据聚合和调用审计。
- Agent 负责简历解释、岗位推荐说明、面试追问与反馈、政策答案组织。
- RAG 服务负责政策召回；答案必须保留来源 ID、标题、地区、适用对象和链接。
- KWC 页面只消费结构化结果，不在浏览器内保存真实密钥或执行核心评分规则。

## 对接顺序

1. 按模型蓝图在苍穹创建 11 个表单模型及关联。
2. 配置四角色菜单、表单、按钮、字段和数据权限。
3. 配置企业/岗位审核、岗位申请和实习申请流程。
4. 将 KWC `formId` 与一键申请动作绑定到平台模型和流程操作。
5. 再接入 Java 服务、简历诊断、岗位匹配和面试 Agent。
6. 建立政策知识库与 Source Verifier，最后接入院系聚合数据。

## 环境与验收

- 明确目标苍穹版本、租户、应用标识、ISV 标识和 KWC 发布路径。
- 为学生、辅导员、企业 HR、院系管理员建立最小权限矩阵。
- 所有接口返回统一 `requestId`、错误码和时间戳。
- AI 输出必须可追溯到输入版本、模型版本和来源引用。
- 测试环境继续使用匿名数据，真实数据接入前完成脱敏、授权和审计方案。
- 按 `platform/cangqiong/evidence/README.md` 保存真实角色登录、表单 CRUD、权限隔离和审批流程截图。
