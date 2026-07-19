# 苍穹平台验收证据清单

本目录只保存目标苍穹租户的真实截图或平台允许导出的配置。不得使用本地 HTML、设计稿或生成图片冒充平台证据；截图前应隐藏租户标识、Token、真实姓名、手机号、邮箱和浏览器敏感信息。

## Issue #15：四角色权限

建议文件名：

- `issue-15-student-menu-and-self-data.png`
- `issue-15-counselor-class-scope.png`
- `issue-15-company-hr-company-scope.png`
- `issue-15-department-admin-department-scope.png`
- `issue-15-cross-scope-access-denied.png`

每张截图需同时记录：测试账号角色、页面/模型编码、可见菜单、查询条件或数据范围、预期结果、实际结果和测试日期。

## Issues #16–#17：表单

建议文件名：

- `issue-16-student-profile-list-create-edit-view.png`
- `issue-16-resume-version-create-edit-view.png`
- `issue-16-resume-job-diagnosis-references.png`
- `issue-17-company-form-hr-maintenance.png`
- `issue-17-job-form-required-fields.png`
- `issue-17-job-review-and-publish.png`
- `issue-17-published-job-in-recommendation.png`

## Issue #18：申请流程

建议文件名：

- `issue-18-job-one-click-application.png`
- `issue-18-job-application-status-history.png`
- `issue-18-internship-workflow-model.png`
- `issue-18-counselor-approval.png`
- `issue-18-department-approval.png`
- `issue-18-company-confirmation.png`
- `issue-18-return-with-required-opinion.png`
- `issue-18-approved-audit-trail.png`

## 完成定义

- [ ] 四个角色分别登录并验证菜单差异。
- [ ] 学生只能读取本人数据。
- [ ] 辅导员只能读取负责班级/学生。
- [ ] 企业 HR 只能维护本企业及相关候选人。
- [ ] 院系管理员只能读取授权院系。
- [ ] 学生档案、简历、企业和岗位支持新增、编辑、查看。
- [ ] 已发布岗位进入推荐与申请服务，草稿/退回/关闭岗位不会进入。
- [ ] 实习申请按学生、辅导员、院系、企业顺序走通。
- [ ] 每个节点记录明确处理人、状态、时间和意见。
- [ ] 退回和拒绝未填写意见时平台阻止提交。
- [ ] 截图和导出物不包含真实个人信息或凭据。

当前仓库状态：本地蓝图与自动化校验可完成；真实租户截图和角色登录验证待获得平台访问后补充。
