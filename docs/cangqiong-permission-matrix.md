# Fit Job 四类角色权限矩阵

> 由 `platform/cangqiong/src/permissionMatrix.mjs` 生成。菜单隐藏不是权限边界；表单、操作和服务模型必须重复执行数据范围校验。

## 角色与数据范围

| 角色编码 | 角色 | 绑定方式 | 默认范围 |
| --- | --- | --- | --- |
| `STUDENT` | 学生 | 平台用户与 fit_student_profile.studentUserId 一一绑定 | `SELF` |
| `COUNSELOR` | 辅导员 | 平台用户绑定负责班级，或等于学生档案 counselorUserId | `RESPONSIBLE_STUDENTS` |
| `COMPANY_HR` | 企业 HR | 平台用户等于企业 hrOwnerUserId，或属于企业 HR 用户组 | `OWN_COMPANY` |
| `DEPARTMENT_ADMIN` | 院系管理员 | 平台用户绑定一个或多个院系组织 | `DEPARTMENT` |

## 菜单权限

| 菜单 | 学生 | 辅导员 | 企业 HR | 院系管理员 |
| --- | --- | --- | --- | --- |
| 我的档案<br>`fit_student_center` | ✓ | — | — | — |
| 我的简历<br>`fit_resume_center` | ✓ | — | — | — |
| 岗位中心<br>`fit_job_market` | ✓ | ✓ | ✓ | ✓ |
| 我的申请<br>`fit_my_applications` | ✓ | — | — | — |
| 学生管理<br>`fit_student_management` | — | ✓ | — | ✓ |
| 企业与岗位管理<br>`fit_company_management` | — | ✓ | ✓ | ✓ |
| 实习审批中心<br>`fit_approval_center` | — | ✓ | ✓ | ✓ |
| 实习过程管理<br>`fit_internship_management` | ✓ | ✓ | ✓ | ✓ |
| 就业政策<br>`fit_policy_center` | ✓ | ✓ | — | ✓ |
| 就业驾驶舱<br>`fit_employment_dashboard` | — | ✓ | — | ✓ |
| AI 调用审计<br>`fit_ai_audit` | — | — | — | ✓ |
| 权限与基础配置<br>`fit_permission_admin` | — | — | — | ✓ |

## 表单、操作、按钮与数据范围

| 表单模型 | 角色 | 允许操作 | 按钮 | 默认数据范围 | 操作范围覆盖 | 状态条件 |
| --- | --- | --- | --- | --- | --- | --- |
| `fit_student_profile` | 学生 | `create`、`read`、`update`、`activate`、`archive` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`ACTIVATE`、`ARCHIVE` | `SELF` | — | — |
| `fit_student_profile` | 辅导员 | `read`、`update`、`assist_complete` | `VIEW`、`EDIT`、`SAVE`、`ASSIST_COMPLETE` | `RESPONSIBLE_STUDENTS` | — | — |
| `fit_student_profile` | 企业 HR | `read_summary` | `VIEW_CANDIDATE_SUMMARY` | `RELATED_CANDIDATES` | — | — |
| `fit_student_profile` | 院系管理员 | `create`、`read`、`update`、`archive`、`export` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`ARCHIVE`、`EXPORT` | `DEPARTMENT` | — | — |
| `fit_resume` | 学生 | `create`、`read`、`update`、`archive`、`set_default`、`diagnose` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`ARCHIVE`、`SET_DEFAULT`、`RUN_DIAGNOSIS` | `SELF` | — | — |
| `fit_resume` | 辅导员 | `read`、`comment` | `VIEW`、`ADD_GUIDANCE` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_resume` | 企业 HR | `read_candidate_resume` | `VIEW_APPLICATION_RESUME` | `RELATED_CANDIDATES` | — | — |
| `fit_resume` | 院系管理员 | `read`、`export_metadata` | `VIEW`、`EXPORT_METADATA` | `DEPARTMENT` | — | — |
| `fit_company` | 学生 | `read` | `VIEW` | `PUBLIC` | — | — |
| `fit_company` | 辅导员 | `read`、`update`、`review`、`return` | `VIEW`、`EDIT`、`APPROVE`、`RETURN` | `DEPARTMENT_OR_PUBLIC` | `read`→`DEPARTMENT_OR_PUBLIC`、`update`→`DEPARTMENT`、`review`→`DEPARTMENT`、`return`→`DEPARTMENT` | `update`：reviewStatus IN (DRAFT, REJECTED)<br>`review`：reviewStatus == PENDING_REVIEW<br>`return`：reviewStatus == PENDING_REVIEW |
| `fit_company` | 企业 HR | `create`、`read`、`update`、`submit` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`SUBMIT_REVIEW` | `OWN_COMPANY` | — | `update`：reviewStatus IN (DRAFT, REJECTED)<br>`submit`：reviewStatus IN (DRAFT, REJECTED) |
| `fit_company` | 院系管理员 | `create`、`read`、`update`、`review`、`return`、`disable`、`export` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`APPROVE`、`RETURN`、`DISABLE`、`EXPORT` | `DEPARTMENT_OR_PUBLIC` | `create`→`DEPARTMENT`、`read`→`DEPARTMENT_OR_PUBLIC`、`update`→`DEPARTMENT`、`review`→`DEPARTMENT`、`return`→`DEPARTMENT`、`disable`→`DEPARTMENT`、`export`→`DEPARTMENT` | `update`：reviewStatus IN (DRAFT, REJECTED)<br>`review`：reviewStatus == PENDING_REVIEW<br>`return`：reviewStatus == PENDING_REVIEW<br>`disable`：reviewStatus == APPROVED |
| `fit_job` | 学生 | `read`、`apply` | `VIEW`、`APPLY` | `PUBLIC` | — | — |
| `fit_job` | 辅导员 | `read`、`update`、`review`、`publish`、`return` | `VIEW`、`EDIT`、`APPROVE_PUBLISH`、`RETURN` | `DEPARTMENT_OR_PUBLIC` | `read`→`DEPARTMENT_OR_PUBLIC`、`update`→`DEPARTMENT`、`review`→`DEPARTMENT`、`publish`→`DEPARTMENT`、`return`→`DEPARTMENT` | `update`：publishStatus IN (DRAFT, REJECTED)<br>`review`：publishStatus == PENDING_REVIEW<br>`publish`：publishStatus == PENDING_REVIEW<br>`return`：publishStatus == PENDING_REVIEW |
| `fit_job` | 企业 HR | `create`、`read`、`update`、`submit`、`close` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`SUBMIT_REVIEW`、`CLOSE` | `OWN_COMPANY` | — | `update`：publishStatus IN (DRAFT, REJECTED)<br>`submit`：publishStatus IN (DRAFT, REJECTED)<br>`close`：publishStatus == PUBLISHED |
| `fit_job` | 院系管理员 | `create`、`read`、`update`、`review`、`publish`、`return`、`close`、`export` | `ADD`、`EDIT`、`SAVE`、`VIEW`、`APPROVE_PUBLISH`、`RETURN`、`CLOSE`、`EXPORT` | `DEPARTMENT_OR_PUBLIC` | `create`→`DEPARTMENT`、`read`→`DEPARTMENT_OR_PUBLIC`、`update`→`DEPARTMENT`、`review`→`DEPARTMENT`、`publish`→`DEPARTMENT`、`return`→`DEPARTMENT`、`close`→`DEPARTMENT`、`export`→`DEPARTMENT` | `update`：publishStatus IN (DRAFT, REJECTED)<br>`review`：publishStatus == PENDING_REVIEW<br>`publish`：publishStatus == PENDING_REVIEW<br>`return`：publishStatus == PENDING_REVIEW<br>`close`：publishStatus == PUBLISHED |
| `fit_job_application` | 学生 | `create`、`read`、`update_draft`、`submit`、`resubmit`、`withdraw` | `APPLY`、`EDIT_DRAFT`、`SUBMIT`、`RESUBMIT`、`WITHDRAW`、`VIEW` | `SELF` | — | — |
| `fit_job_application` | 辅导员 | `read`、`approve`、`return` | `VIEW`、`COUNSELOR_APPROVE`、`RETURN` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_job_application` | 企业 HR | `read`、`invite_interview`、`offer`、`reject` | `VIEW`、`INVITE_INTERVIEW`、`OFFER`、`REJECT` | `OWN_COMPANY` | — | — |
| `fit_job_application` | 院系管理员 | `read`、`override_return`、`export` | `VIEW`、`RETURN`、`EXPORT` | `DEPARTMENT` | — | — |
| `fit_internship_application` | 学生 | `create`、`read`、`update_draft`、`submit`、`resubmit`、`cancel` | `ADD`、`EDIT_DRAFT`、`SUBMIT`、`RESUBMIT`、`CANCEL`、`VIEW` | `SELF` | — | — |
| `fit_internship_application` | 辅导员 | `read`、`approve`、`return`、`reject` | `VIEW`、`APPROVE`、`RETURN`、`REJECT` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_internship_application` | 企业 HR | `read`、`confirm`、`return`、`reject` | `VIEW`、`CONFIRM`、`RETURN`、`REJECT` | `OWN_COMPANY` | — | — |
| `fit_internship_application` | 院系管理员 | `read`、`approve`、`return`、`reject`、`export` | `VIEW`、`APPROVE`、`RETURN`、`REJECT`、`EXPORT` | `DEPARTMENT` | — | — |
| `fit_internship_log` | 学生 | `create`、`read`、`update_draft`、`submit`、`resubmit` | `ADD`、`EDIT_DRAFT`、`SUBMIT`、`RESUBMIT`、`VIEW` | `SELF` | — | — |
| `fit_internship_log` | 辅导员 | `read`、`review`、`return` | `VIEW`、`REVIEW`、`RETURN` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_internship_log` | 企业 HR | `read` | `VIEW` | `OWN_COMPANY` | — | — |
| `fit_internship_log` | 院系管理员 | `read`、`export` | `VIEW`、`EXPORT` | `DEPARTMENT` | — | — |
| `fit_tripartite_review` | 学生 | `create`、`read`、`update_student_section`、`submit_student_section` | `ADD`、`EDIT_SELF_REVIEW`、`SUBMIT_SELF_REVIEW`、`VIEW` | `SELF` | — | — |
| `fit_tripartite_review` | 辅导员 | `read`、`update_counselor_section`、`complete` | `VIEW`、`EDIT_COUNSELOR_REVIEW`、`COMPLETE_REVIEW` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_tripartite_review` | 企业 HR | `read`、`update_company_section`、`submit_company_section` | `VIEW`、`EDIT_COMPANY_REVIEW`、`SUBMIT_COMPANY_REVIEW` | `OWN_COMPANY` | — | — |
| `fit_tripartite_review` | 院系管理员 | `read`、`archive`、`export` | `VIEW`、`ARCHIVE`、`EXPORT` | `DEPARTMENT` | — | — |
| `fit_employment_destination` | 学生 | `create`、`read`、`update_draft`、`submit` | `ADD`、`EDIT_DRAFT`、`SUBMIT`、`VIEW` | `SELF` | — | — |
| `fit_employment_destination` | 辅导员 | `read`、`verify`、`return` | `VIEW`、`VERIFY`、`RETURN` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_employment_destination` | 企业 HR | 禁止 | — | `NONE` | — | — |
| `fit_employment_destination` | 院系管理员 | `read`、`verify`、`return`、`export` | `VIEW`、`VERIFY`、`RETURN`、`EXPORT` | `DEPARTMENT` | — | — |
| `fit_policy` | 学生 | `read` | `VIEW` | `PUBLIC` | — | — |
| `fit_policy` | 辅导员 | `read` | `VIEW` | `PUBLIC` | — | — |
| `fit_policy` | 企业 HR | 禁止 | — | `NONE` | — | — |
| `fit_policy` | 院系管理员 | `create`、`read`、`update`、`publish`、`expire`、`archive` | `ADD`、`EDIT`、`SAVE`、`PUBLISH`、`EXPIRE`、`ARCHIVE`、`VIEW` | `DEPARTMENT_OR_PUBLIC` | `create`→`DEPARTMENT`、`read`→`DEPARTMENT_OR_PUBLIC`、`update`→`DEPARTMENT`、`publish`→`DEPARTMENT`、`expire`→`DEPARTMENT`、`archive`→`DEPARTMENT` | `update`：status == DRAFT<br>`publish`：status == DRAFT<br>`expire`：status == PUBLISHED<br>`archive`：status IN (DRAFT, EXPIRED) |
| `fit_ai_call_log` | 学生 | `read_summary` | `VIEW_RESULT_SUMMARY` | `SELF` | — | — |
| `fit_ai_call_log` | 辅导员 | `read_summary` | `VIEW_RESULT_SUMMARY` | `RELATED_STUDENT_RECORDS` | — | — |
| `fit_ai_call_log` | 企业 HR | 禁止 | — | `NONE` | — | — |
| `fit_ai_call_log` | 院系管理员 | `read`、`verify`、`export` | `VIEW`、`VERIFY`、`EXPORT` | `DEPARTMENT` | — | — |

## 数据过滤表达式

| 范围编码 | 配置语义 |
| --- | --- |
| `NONE` | 始终为 false |
| `PUBLIC` | 仅发布且未失效的数据 |
| `SELF` | record.studentUserId == currentUser.id |
| `RESPONSIBLE_STUDENTS` | record.counselorUserId == currentUser.id 或 record.classCode 属于 currentUser.managedClassCodes |
| `RELATED_STUDENT_RECORDS` | 业务单据的 studentId 属于 RESPONSIBLE_STUDENTS |
| `OWN_COMPANY` | record.companyId 属于 currentUser.companyIds；companyId 必须由服务端从企业成员关系解析，禁止信任客户端 hrOwnerUserId |
| `RELATED_CANDIDATES` | 学生已向 currentUser.companyIds 的岗位提交申请，只暴露候选人摘要字段 |
| `DEPARTMENT` | record.collegeCode 或 record.reviewDepartmentCode 属于 currentUser.departmentCodes；关联单据沿 studentId/companyId 继承院系范围 |
| `DEPARTMENT_OR_PUBLIC` | 读取时允许 DEPARTMENT 或 PUBLIC；写操作必须使用 actionScopes 中的 DEPARTMENT |

## 字段级权限

- `fit_student_profile` 的 `mobile`、`email`、`studentNo`：学生本人可查看原值；辅导员和院系管理员按职责查看；企业 HR 永不返回；列表默认脱敏。
- `fit_student_profile` 的 `studentId`、`studentUserId`、`studentNo`、`collegeCode`、`collegeName`、`majorName`、`classCode`、`counselorUserId`、`graduationYear`：全部由服务端从获授权的学生与组织绑定派生并冻结；学生不得修改决定辅导员、院系数据范围或流程处理人的字段。
- `fit_resume` 的 `contentText`、`structuredContent`、`sourceFile`：仅学生本人、负责辅导员、院系管理员和相关岗位的企业 HR 可读；企业 HR 只在申请有效期内读取。
- `fit_company` 的 `contactName`、`contactPhone`、`contactEmail`：仅本企业 HR、审核辅导员和院系管理员可读；学生端不显示联系人隐私字段。
- `fit_ai_call_log` 的 `inputSummary`、`outputSummary`、`resultJson`、`errorMessage`：日志列表默认展示脱敏摘要；完整结果仅院系管理员审计时按需查看。
- `fit_job_application`、`fit_internship_application` 的 `status`、`currentNode`、`currentHandlerRole`、`currentHandlerId`、`approvalRecords`：全部只读，只允许流程动作写入，禁止表单直接编辑状态和审批历史。
- `fit_company` 的 `reviewStatus`、`currentNode`、`currentHandlerRole`、`currentHandlerId`、`latestOpinion`、`approvalRecords`：审核状态和审计字段全部只读，仅允许流程动作写入。
- `fit_job` 的 `publishStatus`、`currentNode`、`currentHandlerRole`、`currentHandlerId`、`latestOpinion`、`approvalRecords`：审核状态和审计字段全部只读，仅允许流程动作写入。
- `fit_job` 的 `companyId`、`hrOwnerUserId`、`reviewDepartmentCode`：由服务端根据当前企业成员关系派生并冻结，禁止企业 HR 通过伪造负责人维护其他企业岗位。
- `fit_company` 的 `companyId`、`hrOwnerUserId`、`reviewDepartmentCode`：由服务端根据当前登录用户的企业与院系成员关系生成，客户端不得指定归属。
- `fit_internship_application` 的 `studentId`、`studentUserId`、`jobId`、`companyId`、`resumeId`：全部从已录用岗位申请派生并冻结，提交时再次校验整组关联字段一致。
- `fit_policy` 的 `status`：状态只允许发布、失效和归档服务操作写入，表单编辑不得直接修改。

## 隔离验收用例

- [ ] 学生 A 无法读取或修改学生 B 的档案、简历和申请。
- [ ] 辅导员只能看到负责班级或 counselorUserId 指向自己的学生数据。
- [ ] 企业 HR A 无法读取企业 B 的岗位、候选人和实习申请。
- [ ] 院系管理员 A 无法读取院系 B 的学生明细，只能读取获授权院系数据。
- [ ] 未发布岗位和已失效政策不会进入学生菜单或推荐服务。
- [ ] 所有无权限请求在服务端再次校验，不能只依赖菜单隐藏。

> 平台角色登录截图清单见 `platform/cangqiong/evidence/README.md`；本地蓝图不能替代真实租户登录验证。
