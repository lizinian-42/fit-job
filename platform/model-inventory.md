# Fit Job 苍穹模型清单

本清单复用 `codex/issue-2-cangqiong-design-system` 中的模型基线，并按 Issues #14–#18 补齐企业、岗位申请、AI 调用日志、完整字段、权限和流程定义。

| 编码 | 名称 | 类型 | 状态 |
| --- | --- | --- | --- |
| `fit_student_profile` | 学生档案 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_resume` | 简历档案 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_company` | 企业信息 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_job` | 岗位信息 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_job_application` | 岗位申请 | 表单 + 流程 | 蓝图与状态机完成，待目标租户配置 |
| `fit_internship_application` | 实习申请 | 表单 + 流程 | 蓝图与状态机完成，待目标租户配置 |
| `fit_internship_log` | 实习日志 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_tripartite_review` | 三方评价 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_employment_destination` | 就业去向 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_policy` | 政策条目 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_ai_call_log` | AI 调用日志 | 表单模型 | 蓝图完成，待目标租户配置 |
| `fit_company_review` | 企业信息审核 | 流程模型 | 蓝图完成，待目标租户配置 |
| `fit_job_publish_review` | 岗位发布审核 | 流程模型 | 蓝图完成，待目标租户配置 |
| `fit_job_application_flow` | 岗位申请流程 | 流程模型 | 可执行参考完成，待目标租户配置 |
| `fit_internship_approval` | 实习申请审批 | 流程模型 | 可执行参考完成，待目标租户配置 |
| `fitjob-role-permission-matrix` | 四角色权限 | 权限模型 | 完整矩阵完成，待目标租户配置与登录验证 |

完整字段、Java DTO 映射、权限和流程见：

- [苍穹表单模型设计](../docs/cangqiong-form-models.md)
- [四类角色权限矩阵](../docs/cangqiong-permission-matrix.md)
- [申请与审核流程设计](../docs/cangqiong-application-workflows.md)
- [可执行蓝图源码](cangqiong/README.md)
