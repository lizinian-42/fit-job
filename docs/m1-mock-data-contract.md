# M1 Mock 数据契约

第一阶段演示数据集中定义在 `platform/kwc/fit-job-kwc/app/kwc/demoData.js`。所有记录均为匿名、虚构数据，不连接真实学生、企业或政务系统。

## 数据集与后续映射

| 数据集 | 主要用途 | Java DTO 参考 | 苍穹模型参考 |
| --- | --- | --- | --- |
| `studentProfile` | 学生画像、求职准备度、任务与成长阶段 | `StudentProfileDTO` | 学生档案、成长任务 |
| `jobPostings` | 岗位池、六维匹配、短板与行动建议 | `JobPostingDTO` | 岗位库、岗位申请 |
| `resumeDiagnosis` | 关键词覆盖、结构诊断与改写建议 | `ResumeDiagnosisReportDTO` | 简历版本、诊断报告 |
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

校验脚本会检查路由覆盖、跨数据集引用、六维匹配结构、面试报告维度、政策来源和常见个人信息格式。
