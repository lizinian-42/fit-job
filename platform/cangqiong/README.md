# Fit Job 苍穹低代码 M2 蓝图

本目录承载 Issues #14–#18 的仓库侧交付物：11 个表单模型、四角色权限矩阵、企业/岗位审核流程、岗位申请流程、实习四节点审批流程，以及可执行的本地一致性校验。

## 已复用的现有工作

- 保留 KWC 学生工作台、简历诊断、岗位推荐和“一键申请”入口，不重复开发展示页。
- 复用 `demoData.js` 的匿名学生、岗位、诊断数据，并补充结构化教育、证书、经历、简历版本、企业和申请记录。
- 复用早期 `platform/model-inventory.md` 的模型命名基线，新增缺失的 `fit_company`、`fit_job_application` 和 `fit_ai_call_log`。
- 岗位推荐组件不再维护第二套岗位常量，统一读取 `demoData.js` 的 `jobPostings`。

## 目录结构

```text
platform/cangqiong/
├─ src/
│  ├─ modelCatalog.mjs       # 11 个表单模型、字段、状态、关系与 Java 类型映射
│  ├─ permissionMatrix.mjs   # 菜单、表单、按钮、字段与数据范围权限
│  ├─ workflows.mjs          # 企业/岗位审核、岗位申请、实习审批配置
│  └─ workflowEngine.mjs     # 状态、角色、处理人、意见与幂等规则参考实现
├─ scripts/
│  ├─ generate-docs.mjs      # 从唯一配置源生成三份验收文档
│  └─ validate-config.mjs    # 跨模型、权限、Mock 和流程全链路校验
├─ exports/
│  └─ fitjob-cangqiong-blueprint.json # 稳定、可机读的整包配置蓝图
├─ evidence/README.md        # 真实苍穹租户截图与登录验证清单
├─ app-manifest.example.json # 平台应用和模型编码映射模板
└─ package.json
```

## 本地验证

```powershell
cd platform/cangqiong
npm run check
```

`check` 会重新生成以下文档，并执行模型、权限、关联关系、匿名数据与完整审批链测试：

- `docs/cangqiong-form-models.md`
- `docs/cangqiong-permission-matrix.md`
- `docs/cangqiong-application-workflows.md`
- `platform/cangqiong/exports/fitjob-cangqiong-blueprint.json`

## 苍穹平台落地顺序

1. 在目标租户创建 Fit Job 应用和四类角色。
2. 按 `modelCatalog.mjs` 创建 11 个表单模型、主子表、索引和关联。
3. 按 `permissionMatrix.mjs` 配置菜单、表单、按钮、字段和数据权限；服务模型必须重复校验数据范围。
4. 先配置企业与岗位发布审核，再配置岗位申请和实习申请流程。
5. 把 KWC 岗位推荐页的“一键申请”操作绑定到 `fit_job_application_flow.SUBMIT`，传入当前学生、已发布岗位和活动简历。
6. 分别用学生、辅导员、企业 HR、院系管理员账号走通新增、编辑、查看、审核、退回和确认。
7. 按 `evidence/README.md` 归档平台截图和流程记录，填写 `app-manifest.local.json`（不要提交凭据）。

## 边界说明

仓库中的配置是可执行、可审查的苍穹蓝图，但无法在没有目标租户、平台版本和账号权限的情况下代替在线模型创建与真实角色登录。`evidence` 目录明确区分“本地验证通过”和“平台证据待补”，避免把本地预览冒充苍穹截图。

KWC 对接边界位于 `app/kwc/applicationGateway.js`。苍穹宿主应注入 `window.fitJobPlatform.submitJobApplication(payload)` 并返回 `applicationId` 与 `status`；请求会分别携带创建幂等键 `createCommandId` 和本次提交键 `submitCommandId`，兼容字段 `commandId` 等于创建键。宿主在一次网络重试链中必须复用同一组键，学生主动重提时则生成新的提交键。只有显式独立预览才允许匿名内存实现，正式组件缺少平台 API 时会失败关闭，禁止显示“伪提交成功”。

平台服务必须原子写入 `createCommandId` 与唯一 `activeApplicationKey`，并在创建实习申请时加载关联岗位申请，确认其状态为 `OFFERED` 且学生、岗位、企业、简历全部一致；这些规则不能只依赖客户端预查。
