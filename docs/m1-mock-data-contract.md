# M1/M2 Mock 数据契约

第一阶段演示数据集中定义在 `platform/kwc/fit-job-kwc/app/kwc/demoData.js`。所有记录均为匿名、虚构数据，不连接真实学生、企业或政务系统。

## 数据集与后续映射

| 数据集 | 主要用途 | Java DTO 参考 | 苍穹模型参考 |
| --- | --- | --- | --- |
| `studentProfile` | 学生画像、求职准备度、教育、证书、经历与求职意向 | `StudentProfileDTO` | `fit_student_profile` |
| `companies` | 匿名企业主体、行业、规模与审核状态 | `CompanyDTO` | `fit_company` |
| `jobPostings` | 岗位字段、六维匹配、短板与行动建议 | `JobPostingDTO` | `fit_job` |
| `resumeRecords` | 简历版本、目标岗位、默认版本与诊断状态 | `ResumeDTO` | `fit_resume` |
| `resumeDiagnosis` | 关键词覆盖、结构诊断与改写建议 | `ResumeDiagnosisReportDTO` | 简历版本、诊断报告 |
| `jobApplications` | 岗位投递、当前节点与审批轨迹 | `JobApplicationDTO` | `fit_job_application` |
| `internshipApplications` | 实习周期、安全承诺与四节点审批流程 | `InternshipApplicationDTO` | `fit_internship_application` |
| `internshipLogs` | 日志工时、内容、总结与风险标记 | `InternshipLogDTO` | `fit_internship_log` |
| `tripartiteReviews` | 学生、企业、辅导员三方评价 | `TripartiteReviewDTO` | `fit_tripartite_review` |
| `employmentDestinations` | 就业去向、行业、城市与核验状态 | `EmploymentDestinationDTO` | `fit_employment_destination` |
| `policyEntries` | 可追溯的模拟政策正文与有效期 | `PolicyDTO` | `fit_policy` |
| `aiCallLogs` | 脱敏请求摘要、结果、耗时与审计链路 | `AiCallLogDTO` | `fit_ai_call_log` |
| `interviewSession` | 面试类型、多轮问题、示例回答与四维报告 | `InterviewSessionDTO`、`InterviewReportDTO` | 面试场次、面试报告 |
| `dashboardSnapshot` | 就业指标、趋势、行业、薪资与风险学生 | `EmploymentDashboardDTO` | 指标快照、风险跟进 |
| `policyQaCases` | RAG 问答、答案与 `referenceInfos` | `PolicyAnswerDTO` | 政策知识条目、问答记录 |

## 匿名化规则

- 学生仅使用 `学生 A`、`学生 B` 等演示名称与 `STU-DEMO-*` 编号。
- 企业统一使用 `示例科技 A` 等虚构名称。
- 政策来源使用 `MOCK-POLICY-*` 编号和 `example.com/mock-policy/*` 地址。
- 数据不得包含手机号、邮箱、身份证号或真实业务凭据。

## 演示路由

首页使用 hash 路由串联以下顺序：

1. 学生工作台
2. 简历诊断
3. 岗位推荐
4. AI 面试
5. 政策问答
6. 就业驾驶舱

每个页面均提供上一步、下一步和全局导航入口；本地预览通过 `fitjob:navigate` 事件切换，苍穹环境通过页面元数据中的 `formId` 打开对应表单。

## 校验

```bash
cd platform/kwc/fit-job-kwc
npm run test
```

校验脚本会检查路由覆盖、企业/岗位/简历/申请之间的引用关系、六维匹配结构、面试报告维度、政策来源和常见个人信息格式。

M2 苍穹模型、权限与流程还需执行：

```bash
cd platform/cangqiong
npm run check
```

该命令会校验 11 个表单模型、四角色权限、岗位字段完整性、一键申请幂等性、处理人分配、退回意见以及“学生 → 辅导员 → 院系 → 企业”的实习审批主链。
