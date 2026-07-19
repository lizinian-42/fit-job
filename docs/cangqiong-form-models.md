# Fit Job 苍穹低代码表单模型设计

> 由 `platform/cangqiong/src/modelCatalog.mjs` 生成。字段编码是平台配置与后续 Java DTO 的统一基线；目标租户首次创建后，如平台实际编码发生变化，应同步修改源码并重新生成本文档。

- 蓝图版本：`2.0.0`
- 应用编码：`fitjob`
- 表单模型：11 个
- 登录角色：`STUDENT`、`COUNSELOR`、`COMPANY_HR`、`DEPARTMENT_ADMIN`

## 模型总览

| 编码 | 名称 | 单据编号字段 | 状态字段 | 初始状态 |
| --- | --- | --- | --- | --- |
| `fit_student_profile` | 学生档案 | `studentId` | `profileStatus` | `DRAFT` |
| `fit_resume` | 简历档案 | `resumeId` | `status` | `DRAFT` |
| `fit_company` | 企业信息 | `companyId` | `reviewStatus` | `DRAFT` |
| `fit_job` | 岗位信息 | `jobId` | `publishStatus` | `DRAFT` |
| `fit_job_application` | 岗位申请 | `applicationId` | `status` | `DRAFT` |
| `fit_internship_application` | 实习申请 | `internshipApplicationId` | `status` | `DRAFT` |
| `fit_internship_log` | 实习日志 | `logId` | `status` | `DRAFT` |
| `fit_tripartite_review` | 三方评价 | `reviewId` | `status` | `DRAFT` |
| `fit_employment_destination` | 就业去向 | `destinationId` | `verificationStatus` | `DRAFT` |
| `fit_policy` | 政策条目 | `policyId` | `status` | `DRAFT` |
| `fit_ai_call_log` | AI 调用日志 | `callId` | `status` | `QUEUED` |

## 学生档案（`fit_student_profile`）

页面：列表 `fit_student_profile_list`，表单 `fit_student_profile_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`ACTIVE`、`ARCHIVED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `studentId` | 学生档案编号 | `text` | `String` | 是 | 唯一；只读；服务端派生：authorizedStudentBinding.studentId；创建后不可变；长度 32 |
| `studentUserId` | 关联学生用户 | `user` | `String` | 是 | 唯一；只读；服务端派生：authorizedStudentBinding.studentUserId；创建后不可变 |
| `displayName` | 姓名 | `text` | `String` | 是 | 长度 64 |
| `studentNo` | 学号 | `text` | `String` | 是 | 唯一；只读；服务端派生：authorizedStudentBinding.studentNo；创建后不可变；长度 32；敏感级别 PERSONAL |
| `gender` | 性别 | `enum` | `String` | 否 | 枚举：UNSPECIFIED / FEMALE / MALE；默认 UNSPECIFIED |
| `mobile` | 手机号 | `phone` | `String` | 否 | 列表脱敏；敏感级别 SENSITIVE |
| `email` | 邮箱 | `email` | `String` | 否 | 列表脱敏；敏感级别 SENSITIVE |
| `collegeCode` | 院系 | `organization` | `String` | 是 | 只读；服务端派生：authorizedStudentBinding.collegeCode；创建后不可变 |
| `collegeName` | 院系名称 | `text` | `String` | 是 | 只读；服务端派生：authorizedStudentBinding.collegeName；创建后不可变；长度 128 |
| `majorName` | 专业 | `text` | `String` | 是 | 只读；服务端派生：authorizedStudentBinding.majorName；创建后不可变；长度 128 |
| `classCode` | 班级 | `text` | `String` | 是 | 只读；服务端派生：authorizedStudentBinding.classCode；创建后不可变；长度 64 |
| `counselorUserId` | 辅导员 | `user` | `String` | 是 | 只读；服务端派生：authorizedStudentBinding.counselorUserId；创建后不可变 |
| `graduationYear` | 毕业年份 | `integer` | `Integer` | 是 | 只读；服务端派生：authorizedStudentBinding.graduationYear；创建后不可变；最小 2020；最大 2100 |
| `profileStatus` | 档案状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / ACTIVE / ARCHIVED；默认 DRAFT |
| `employmentStatus` | 就业状态 | `enum` | `String` | 是 | 枚举：NOT_STARTED / ACTIVE_SEARCH / INTERNSHIP / EMPLOYED / OTHER；默认 NOT_STARTED |
| `targetRoles` | 目标岗位 | `multi_text` | `List<String>` | 是 | 最多 5 项 |
| `preferredCities` | 意向城市 | `multi_text` | `List<String>` | 是 | 最多 10 项 |
| `expectedSalaryMin` | 期望薪资下限 | `decimal` | `BigDecimal` | 否 | 最小 0；精度 2 |
| `expectedSalaryMax` | 期望薪资上限 | `decimal` | `BigDecimal` | 否 | 最小 0；精度 2 |
| `availableFrom` | 可到岗日期 | `date` | `LocalDate` | 否 | — |
| `weeklyAttendanceDays` | 每周可实习天数 | `integer` | `Integer` | 否 | 最小 1；最大 7 |
| `skillTags` | 技能标签 | `multi_text` | `List<String>` | 否 | 最多 30 项 |
| `profileCompletion` | 档案完整度 | `integer` | `Integer` | 否 | 只读；最小 0；最大 100 |
| `readinessScore` | 求职准备度 | `integer` | `Integer` | 否 | 只读；最小 0；最大 100 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 子表：教育背景（`educationBackground`）

至少 1 行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `educationId` | 教育经历编号 | `text` | `String` | 是 | 父单据内唯一 |
| `schoolName` | 学校 | `text` | `String` | 是 | 长度 128 |
| `collegeName` | 院系 | `text` | `String` | 是 | 长度 128 |
| `majorName` | 专业 | `text` | `String` | 是 | 长度 128 |
| `degree` | 学历 | `enum` | `String` | 是 | 枚举：ASSOCIATE / BACHELOR / MASTER / DOCTOR |
| `startDate` | 开始日期 | `date` | `LocalDate` | 是 | — |
| `endDate` | 结束日期 | `date` | `LocalDate` | 是 | — |
| `gpa` | GPA | `decimal` | `BigDecimal` | 否 | 最小 0；最大 5；精度 2 |
| `rankPercent` | 专业排名百分位 | `integer` | `Integer` | 否 | 最小 1；最大 100 |

### 子表：技能证书（`certificates`）

允许零到多行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `certificateId` | 证书编号 | `text` | `String` | 是 | 父单据内唯一 |
| `certificateName` | 证书名称 | `text` | `String` | 是 | 长度 128 |
| `issuer` | 颁发机构 | `text` | `String` | 是 | 长度 128 |
| `obtainedAt` | 取得日期 | `date` | `LocalDate` | 是 | — |
| `credentialNo` | 凭证编号 | `text` | `String` | 否 | 长度 128；敏感级别 PERSONAL |
| `attachment` | 证明附件 | `attachment` | `String` | 否 | — |

### 子表：项目与实习经历（`experiences`）

允许零到多行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `experienceId` | 经历编号 | `text` | `String` | 是 | 父单据内唯一 |
| `type` | 经历类型 | `enum` | `String` | 是 | 枚举：PROJECT / INTERNSHIP / COMPETITION / CAMPUS |
| `name` | 经历名称 | `text` | `String` | 是 | 长度 128 |
| `organizationName` | 组织/企业 | `text` | `String` | 是 | 长度 128 |
| `role` | 担任角色 | `text` | `String` | 是 | 长度 128 |
| `startDate` | 开始日期 | `date` | `LocalDate` | 是 | — |
| `endDate` | 结束日期 | `date` | `LocalDate` | 否 | — |
| `description` | 经历描述 | `long_text` | `String` | 是 | 最长 4000 |
| `achievements` | 成果与量化证据 | `long_text` | `String` | 否 | 最长 4000 |
| `skillTags` | 使用技能 | `multi_text` | `List<String>` | 否 | 最多 20 项 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `studentUserId` | `platform_user` | `id` | `many-to-one` | `平台默认` |
| `collegeCode` | `platform_organization` | `id` | `many-to-one` | `平台默认` |
| `counselorUserId` | `platform_user` | `id` | `many-to-one` | `平台默认` |

### 业务约束

- `student_profile_identity_consistency`（`service_invariant`）：学生身份、学籍、院系、班级和辅导员必须由服务端根据获授权的学生组织绑定写入，学生自建时必须绑定 currentUser.id，禁止客户端覆盖或改变数据范围与审批路由

## 简历档案（`fit_resume`）

页面：列表 `fit_resume_list`，表单 `fit_resume_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`ACTIVE`、`ARCHIVED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `resumeId` | 简历编号 | `text` | `String` | 是 | 唯一；长度 32 |
| `studentId` | 学生档案 | `reference` | `String` | 是 | 只读；服务端派生：currentUser.studentProfile.studentId；创建后不可变；关联 fit_student_profile.studentId |
| `studentUserId` | 学生用户 | `user` | `String` | 是 | 只读；服务端派生：currentUser.id；创建后不可变 |
| `versionNo` | 版本号 | `integer` | `Integer` | 是 | 最小 1 |
| `versionName` | 版本名称 | `text` | `String` | 是 | 长度 128 |
| `targetJobId` | 目标岗位 | `reference` | `String` | 否 | 关联 fit_job.jobId |
| `sourceFile` | 原始简历 | `attachment` | `String` | 否 | — |
| `summary` | 个人摘要 | `long_text` | `String` | 否 | 最长 2000 |
| `contentText` | 简历全文 | `long_text` | `String` | 否 | 最长 30000；敏感级别 PERSONAL |
| `structuredContent` | 结构化简历 | `json` | `JsonNode` | 否 | 敏感级别 PERSONAL |
| `skillTags` | 技能标签 | `multi_text` | `List<String>` | 否 | 最多 30 项 |
| `isDefault` | 默认简历 | `boolean` | `Boolean` | 是 | 默认 false |
| `status` | 版本状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / ACTIVE / ARCHIVED；默认 DRAFT |
| `diagnosisStatus` | 诊断状态 | `enum` | `String` | 是 | 只读；枚举：NOT_RUN / QUEUED / RUNNING / SUCCEEDED / FAILED；默认 NOT_RUN |
| `diagnosisReportId` | 诊断报告编号 | `text` | `String` | 否 | 只读；长度 64 |
| `diagnosisScore` | 诊断分数 | `integer` | `Integer` | 否 | 只读；最小 0；最大 100 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `studentId` | `fit_student_profile` | `studentId` | `many-to-one` | `restrict` |
| `targetJobId` | `fit_job` | `jobId` | `many-to-one` | `set-null` |

### 业务约束

- `resume_student_identity_consistency`（`service_invariant`）：studentId/studentUserId 必须由服务端从当前登录学生的档案派生且同时匹配同一 fit_student_profile，禁止客户端跨学生引用

## 企业信息（`fit_company`）

页面：列表 `fit_company_list`，表单 `fit_company_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`PENDING_REVIEW`、`APPROVED`、`REJECTED`、`DISABLED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `companyId` | 企业编号 | `text` | `String` | 是 | 唯一；只读；服务端生成；长度 32 |
| `companyCode` | 企业统一编码 | `text` | `String` | 是 | 唯一；长度 64 |
| `companyName` | 企业名称 | `text` | `String` | 是 | 长度 256 |
| `industry` | 所属行业 | `text` | `String` | 是 | 长度 128 |
| `companyScale` | 企业规模 | `enum` | `String` | 是 | 枚举：LT_50 / 50_99 / 100_499 / 500_999 / GE_1000 |
| `companyNature` | 企业性质 | `enum` | `String` | 否 | 枚举：PRIVATE / STATE_OWNED / FOREIGN / JOINT_VENTURE / OTHER |
| `city` | 所在城市 | `text` | `String` | 是 | 长度 64 |
| `reviewDepartmentCode` | 归口审核院系 | `organization` | `String` | 是 | 只读；服务端派生：currentUser.departmentCode |
| `address` | 详细地址 | `text` | `String` | 否 | 长度 256 |
| `website` | 企业网站 | `url` | `String` | 否 | — |
| `description` | 企业简介 | `long_text` | `String` | 是 | 最长 5000 |
| `hrOwnerUserId` | 企业 HR 负责人 | `user` | `String` | 是 | 只读；服务端派生：currentUser.id |
| `contactName` | 联系人 | `text` | `String` | 否 | 长度 64；敏感级别 BUSINESS_CONTACT |
| `contactPhone` | 联系电话 | `phone` | `String` | 否 | 列表脱敏；敏感级别 BUSINESS_CONTACT |
| `contactEmail` | 联系邮箱 | `email` | `String` | 否 | 列表脱敏；敏感级别 BUSINESS_CONTACT |
| `reviewStatus` | 审核状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / PENDING_REVIEW / APPROVED / REJECTED / DISABLED；默认 DRAFT |
| `currentNode` | 当前节点 | `text` | `String` | 是 | 只读 |
| `currentHandlerRole` | 当前处理角色 | `enum` | `String` | 否 | 只读；枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `currentHandlerId` | 当前处理人 | `user` | `String` | 否 | 只读 |
| `latestOpinion` | 最近审批意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `reviewOpinion` | 审核意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `reviewedBy` | 审核人 | `user` | `String` | 否 | 只读 |
| `reviewedAt` | 审核时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 子表：审批记录（`approvalRecords`）

允许零到多行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `recordId` | 记录编号 | `text` | `String` | 是 | 父单据内唯一 |
| `commandId` | 幂等命令编号 | `text` | `String` | 是 | 父单据内唯一；长度 128 |
| `nodeCode` | 节点编码 | `text` | `String` | 是 | — |
| `actorRole` | 处理角色 | `enum` | `String` | 是 | 枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `actorId` | 处理人 | `user` | `String` | 是 | — |
| `action` | 处理动作 | `text` | `String` | 是 | — |
| `opinion` | 审批意见 | `long_text` | `String` | 否 | 最长 2000 |
| `fromStatus` | 原状态 | `text` | `String` | 是 | — |
| `toStatus` | 新状态 | `text` | `String` | 是 | — |
| `operatedAt` | 处理时间 | `datetime` | `OffsetDateTime` | 是 | — |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `hrOwnerUserId` | `platform_user` | `id` | `many-to-one` | `平台默认` |
| `reviewDepartmentCode` | `platform_organization` | `id` | `many-to-one` | `平台默认` |

## 岗位信息（`fit_job`）

页面：列表 `fit_job_list`，表单 `fit_job_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`PENDING_REVIEW`、`PUBLISHED`、`REJECTED`、`CLOSED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `jobId` | 岗位编号 | `text` | `String` | 是 | 唯一；长度 32 |
| `companyId` | 所属企业 | `reference` | `String` | 是 | 只读；服务端派生：currentUser.companyId；关联 fit_company.companyId |
| `hrOwnerUserId` | 企业 HR 负责人 | `user` | `String` | 是 | 只读；服务端派生：fit_company.hrOwnerUserId |
| `reviewDepartmentCode` | 归口审核院系 | `organization` | `String` | 是 | 只读；服务端派生：fit_company.reviewDepartmentCode |
| `title` | 岗位名称 | `text` | `String` | 是 | 长度 128 |
| `jobType` | 岗位类型 | `enum` | `String` | 是 | 枚举：INTERNSHIP / GRADUATE / PART_TIME |
| `city` | 工作城市 | `text` | `String` | 是 | 长度 64 |
| `workMode` | 工作方式 | `enum` | `String` | 是 | 枚举：ONSITE / HYBRID / REMOTE；默认 ONSITE |
| `salaryMin` | 薪资下限 | `decimal` | `BigDecimal` | 是 | 最小 0；精度 2 |
| `salaryMax` | 薪资上限 | `decimal` | `BigDecimal` | 是 | 最小 0；精度 2 |
| `salaryUnit` | 薪资单位 | `enum` | `String` | 是 | 枚举：DAY / MONTH / YEAR |
| `jd` | 岗位职责 JD | `long_text` | `String` | 是 | 最长 10000 |
| `skillRequirements` | 技能要求 | `multi_text` | `List<String>` | 是 | 至少 1 项；最多 30 项 |
| `majorRequirements` | 专业要求 | `multi_text` | `List<String>` | 是 | 至少 1 项；最多 20 项 |
| `educationRequirement` | 学历要求 | `enum` | `String` | 否 | 枚举：NONE / ASSOCIATE / BACHELOR / MASTER |
| `applicationDeadline` | 申请截止日期 | `date` | `LocalDate` | 是 | — |
| `headcount` | 招聘人数 | `integer` | `Integer` | 是 | 最小 1；最大 10000 |
| `weeklyAttendanceDays` | 每周到岗天数 | `integer` | `Integer` | 否 | 最小 1；最大 7 |
| `internshipMonths` | 最短实习月数 | `integer` | `Integer` | 否 | 最小 1；最大 24 |
| `publishStatus` | 发布状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / PENDING_REVIEW / PUBLISHED / REJECTED / CLOSED；默认 DRAFT |
| `currentNode` | 当前节点 | `text` | `String` | 是 | 只读 |
| `currentHandlerRole` | 当前处理角色 | `enum` | `String` | 否 | 只读；枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `currentHandlerId` | 当前处理人 | `user` | `String` | 否 | 只读 |
| `latestOpinion` | 最近审批意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `recommendationEnabled` | 进入推荐池 | `boolean` | `Boolean` | 否 | 只读；默认 false |
| `reviewOpinion` | 审核意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `reviewedBy` | 审核人 | `user` | `String` | 否 | 只读 |
| `reviewedAt` | 审核时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `publishedAt` | 发布时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 子表：审批记录（`approvalRecords`）

允许零到多行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `recordId` | 记录编号 | `text` | `String` | 是 | 父单据内唯一 |
| `commandId` | 幂等命令编号 | `text` | `String` | 是 | 父单据内唯一；长度 128 |
| `nodeCode` | 节点编码 | `text` | `String` | 是 | — |
| `actorRole` | 处理角色 | `enum` | `String` | 是 | 枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `actorId` | 处理人 | `user` | `String` | 是 | — |
| `action` | 处理动作 | `text` | `String` | 是 | — |
| `opinion` | 审批意见 | `long_text` | `String` | 否 | 最长 2000 |
| `fromStatus` | 原状态 | `text` | `String` | 是 | — |
| `toStatus` | 新状态 | `text` | `String` | 是 | — |
| `operatedAt` | 处理时间 | `datetime` | `OffsetDateTime` | 是 | — |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `companyId` | `fit_company` | `companyId` | `many-to-one` | `restrict` |
| `hrOwnerUserId` | `platform_user` | `id` | `many-to-one` | `平台默认` |
| `reviewDepartmentCode` | `platform_organization` | `id` | `many-to-one` | `平台默认` |

## 岗位申请（`fit_job_application`）

页面：列表 `fit_job_application_list`，表单 `fit_job_application_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`SUBMITTED`、`COMPANY_REVIEW`、`INTERVIEW`、`OFFERED`、`REJECTED`、`RETURNED`、`WITHDRAWN`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `applicationId` | 岗位申请编号 | `text` | `String` | 是 | 唯一；只读；服务端生成；长度 64 |
| `createCommandId` | 创建幂等命令编号 | `text` | `String` | 是 | 唯一；只读；长度 128 |
| `activeApplicationKey` | 活动申请唯一键 | `text` | `String` | 否 | 唯一；只读；长度 160 |
| `studentId` | 学生档案 | `reference` | `String` | 是 | 只读；服务端派生：currentUser.studentId；创建后不可变；关联 fit_student_profile.studentId |
| `studentUserId` | 学生用户 | `user` | `String` | 是 | 只读；服务端派生：fit_student_profile.studentUserId；创建后不可变 |
| `jobId` | 申请岗位 | `reference` | `String` | 是 | 只读；服务端派生：authorizedJob.jobId；创建后不可变；关联 fit_job.jobId |
| `companyId` | 岗位企业 | `reference` | `String` | 是 | 只读；服务端派生：fit_job.companyId；创建后不可变；关联 fit_company.companyId |
| `resumeId` | 投递简历 | `reference` | `String` | 是 | 只读；服务端派生：authorizedResume.resumeId；创建后不可变；关联 fit_resume.resumeId |
| `source` | 申请来源 | `enum` | `String` | 是 | 枚举：RECOMMENDATION / MANUAL；默认 MANUAL |
| `matchRecordId` | 匹配记录编号 | `text` | `String` | 否 | 长度 64 |
| `status` | 申请状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / SUBMITTED / COMPANY_REVIEW / INTERVIEW / OFFERED / REJECTED / RETURNED / WITHDRAWN；默认 DRAFT |
| `currentNode` | 当前节点 | `text` | `String` | 是 | 只读 |
| `currentHandlerRole` | 当前处理角色 | `enum` | `String` | 否 | 只读；枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `currentHandlerId` | 当前处理人 | `user` | `String` | 否 | 只读 |
| `latestOpinion` | 最近审批意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `submittedAt` | 提交时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `completedAt` | 完成时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 子表：审批记录（`approvalRecords`）

允许零到多行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `recordId` | 记录编号 | `text` | `String` | 是 | 父单据内唯一 |
| `commandId` | 幂等命令编号 | `text` | `String` | 是 | 父单据内唯一；长度 128 |
| `nodeCode` | 节点编码 | `text` | `String` | 是 | — |
| `actorRole` | 处理角色 | `enum` | `String` | 是 | 枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `actorId` | 处理人 | `user` | `String` | 是 | — |
| `action` | 处理动作 | `text` | `String` | 是 | — |
| `opinion` | 审批意见 | `long_text` | `String` | 否 | 最长 2000 |
| `fromStatus` | 原状态 | `text` | `String` | 是 | — |
| `toStatus` | 新状态 | `text` | `String` | 是 | — |
| `operatedAt` | 处理时间 | `datetime` | `OffsetDateTime` | 是 | — |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `studentId` | `fit_student_profile` | `studentId` | `many-to-one` | `restrict` |
| `jobId` | `fit_job` | `jobId` | `many-to-one` | `restrict` |
| `companyId` | `fit_company` | `companyId` | `many-to-one` | `restrict` |
| `resumeId` | `fit_resume` | `resumeId` | `many-to-one` | `restrict` |

### 业务约束

- `job_application_active_unique`（`unique_business_key`）：activeApplicationKey 在 DRAFT/SUBMITTED/COMPANY_REVIEW/INTERVIEW/RETURNED/OFFERED 状态保持 studentId:jobId，REJECTED/WITHDRAWN 清空；平台唯一约束原子阻止并发重复申请
- `job_application_link_consistency`（`service_invariant`）：studentId/studentUserId/jobId/companyId/resumeId 必须与关联档案和岗位一致

## 实习申请（`fit_internship_application`）

页面：列表 `fit_internship_application_list`，表单 `fit_internship_application_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`COUNSELOR_REVIEW`、`DEPARTMENT_REVIEW`、`COMPANY_CONFIRMATION`、`APPROVED`、`RETURNED`、`REJECTED`、`CANCELLED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `internshipApplicationId` | 实习申请编号 | `text` | `String` | 是 | 唯一；只读；服务端生成；长度 40 |
| `jobApplicationId` | 岗位申请 | `reference` | `String` | 是 | 只读；服务端派生：authorizedOfferedJobApplication.applicationId；创建后不可变；关联 fit_job_application.applicationId |
| `studentId` | 学生档案 | `reference` | `String` | 是 | 只读；服务端派生：fit_job_application.studentId；创建后不可变；关联 fit_student_profile.studentId |
| `studentUserId` | 学生用户 | `user` | `String` | 是 | 只读；服务端派生：fit_job_application.studentUserId；创建后不可变 |
| `jobId` | 实习岗位 | `reference` | `String` | 是 | 只读；服务端派生：fit_job_application.jobId；创建后不可变；关联 fit_job.jobId |
| `companyId` | 实习企业 | `reference` | `String` | 是 | 只读；服务端派生：fit_job_application.companyId；创建后不可变；关联 fit_company.companyId |
| `resumeId` | 关联简历 | `reference` | `String` | 是 | 只读；服务端派生：fit_job_application.resumeId；创建后不可变；关联 fit_resume.resumeId |
| `internshipStartDate` | 实习开始日期 | `date` | `LocalDate` | 是 | — |
| `internshipEndDate` | 实习结束日期 | `date` | `LocalDate` | 是 | — |
| `weeklyAttendanceDays` | 每周到岗天数 | `integer` | `Integer` | 是 | 最小 1；最大 7 |
| `workCity` | 工作城市 | `text` | `String` | 是 | 长度 64 |
| `workAddress` | 工作地址 | `text` | `String` | 否 | 长度 256 |
| `companySupervisorName` | 企业导师 | `text` | `String` | 否 | 长度 64 |
| `companySupervisorContact` | 企业导师联系方式 | `text` | `String` | 否 | 列表脱敏；敏感级别 BUSINESS_CONTACT |
| `agreementAttachment` | 实习协议 | `attachment` | `String` | 否 | — |
| `safetyCommitmentAccepted` | 安全承诺确认 | `boolean` | `Boolean` | 是 | 默认 false |
| `status` | 审批状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / COUNSELOR_REVIEW / DEPARTMENT_REVIEW / COMPANY_CONFIRMATION / APPROVED / RETURNED / REJECTED / CANCELLED；默认 DRAFT |
| `currentNode` | 当前节点 | `text` | `String` | 是 | 只读 |
| `currentHandlerRole` | 当前处理角色 | `enum` | `String` | 否 | 只读；枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `currentHandlerId` | 当前处理人 | `user` | `String` | 否 | 只读 |
| `latestOpinion` | 最近审批意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `returnedFromNode` | 退回来源节点 | `text` | `String` | 否 | 只读 |
| `submittedAt` | 提交时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `approvedAt` | 通过时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 子表：审批记录（`approvalRecords`）

允许零到多行。

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `recordId` | 记录编号 | `text` | `String` | 是 | 父单据内唯一 |
| `commandId` | 幂等命令编号 | `text` | `String` | 是 | 父单据内唯一；长度 128 |
| `nodeCode` | 节点编码 | `text` | `String` | 是 | — |
| `actorRole` | 处理角色 | `enum` | `String` | 是 | 枚举：STUDENT / COUNSELOR / COMPANY_HR / DEPARTMENT_ADMIN |
| `actorId` | 处理人 | `user` | `String` | 是 | — |
| `action` | 处理动作 | `text` | `String` | 是 | — |
| `opinion` | 审批意见 | `long_text` | `String` | 否 | 最长 2000 |
| `fromStatus` | 原状态 | `text` | `String` | 是 | — |
| `toStatus` | 新状态 | `text` | `String` | 是 | — |
| `operatedAt` | 处理时间 | `datetime` | `OffsetDateTime` | 是 | — |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `jobApplicationId` | `fit_job_application` | `applicationId` | `one-to-one` | `restrict` |
| `studentId` | `fit_student_profile` | `studentId` | `many-to-one` | `restrict` |
| `jobId` | `fit_job` | `jobId` | `many-to-one` | `restrict` |
| `companyId` | `fit_company` | `companyId` | `many-to-one` | `restrict` |
| `resumeId` | `fit_resume` | `resumeId` | `many-to-one` | `restrict` |

### 业务约束

- `internship_job_application_consistency`（`service_invariant`）：提交前必须存在同一学生、岗位、企业、简历且 status == OFFERED 的岗位申请

## 实习日志（`fit_internship_log`）

页面：列表 `fit_internship_log_list`，表单 `fit_internship_log_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`SUBMITTED`、`REVIEWED`、`RETURNED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `logId` | 日志编号 | `text` | `String` | 是 | 唯一；长度 40 |
| `internshipApplicationId` | 实习申请 | `reference` | `String` | 是 | 只读；服务端派生：authorizedInternshipApplication.internshipApplicationId；创建后不可变；关联 fit_internship_application.internshipApplicationId |
| `studentId` | 学生档案 | `reference` | `String` | 是 | 只读；服务端派生：fit_internship_application.studentId；创建后不可变；关联 fit_student_profile.studentId |
| `studentUserId` | 学生用户 | `user` | `String` | 是 | 只读；服务端派生：fit_internship_application.studentUserId；创建后不可变 |
| `companyId` | 实习企业 | `reference` | `String` | 是 | 只读；服务端派生：fit_internship_application.companyId；创建后不可变；关联 fit_company.companyId |
| `logDate` | 日志日期 | `date` | `LocalDate` | 是 | — |
| `hours` | 实习工时 | `decimal` | `BigDecimal` | 是 | 最小 0；最大 24；精度 1 |
| `workContent` | 工作内容 | `long_text` | `String` | 是 | 最长 5000 |
| `learningSummary` | 学习总结 | `long_text` | `String` | 是 | 最长 3000 |
| `problems` | 问题与支持需求 | `long_text` | `String` | 否 | 最长 3000 |
| `riskLevel` | 风险等级 | `enum` | `String` | 是 | 枚举：NONE / LOW / MEDIUM / HIGH；默认 NONE |
| `attachments` | 日志附件 | `multi_attachment` | `List<String>` | 否 | — |
| `status` | 日志状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / SUBMITTED / REVIEWED / RETURNED；默认 DRAFT |
| `counselorComment` | 辅导员意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `internshipApplicationId` | `fit_internship_application` | `internshipApplicationId` | `many-to-one` | `restrict` |
| `studentId` | `fit_student_profile` | `studentId` | `many-to-one` | `restrict` |
| `companyId` | `fit_company` | `companyId` | `many-to-one` | `restrict` |

### 业务约束

- `internship_log_parent_consistency`（`service_invariant`）：父实习申请必须属于当前学生；internshipApplicationId/studentId/studentUserId/companyId 全部由服务端加载父单据后写入并保持一致

## 三方评价（`fit_tripartite_review`）

页面：列表 `fit_tripartite_review_list`，表单 `fit_tripartite_review_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`COLLECTING`、`COMPLETED`、`ARCHIVED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `reviewId` | 评价编号 | `text` | `String` | 是 | 唯一；长度 40 |
| `internshipApplicationId` | 实习申请 | `reference` | `String` | 是 | 只读；服务端派生：authorizedInternshipApplication.internshipApplicationId；创建后不可变；关联 fit_internship_application.internshipApplicationId |
| `studentId` | 学生档案 | `reference` | `String` | 是 | 只读；服务端派生：fit_internship_application.studentId；创建后不可变；关联 fit_student_profile.studentId |
| `studentUserId` | 学生用户 | `user` | `String` | 是 | 只读；服务端派生：fit_internship_application.studentUserId；创建后不可变 |
| `companyId` | 实习企业 | `reference` | `String` | 是 | 只读；服务端派生：fit_internship_application.companyId；创建后不可变；关联 fit_company.companyId |
| `reviewPeriod` | 评价周期 | `text` | `String` | 是 | 长度 64 |
| `studentSelfScore` | 学生自评分 | `integer` | `Integer` | 否 | 最小 0；最大 100 |
| `studentComment` | 学生总结 | `long_text` | `String` | 否 | 最长 3000 |
| `companyScore` | 企业评分 | `integer` | `Integer` | 否 | 最小 0；最大 100 |
| `companyComment` | 企业评价 | `long_text` | `String` | 否 | 最长 3000 |
| `companyEvaluatorId` | 企业评价人 | `user` | `String` | 否 | — |
| `counselorScore` | 辅导员评分 | `integer` | `Integer` | 否 | 最小 0；最大 100 |
| `counselorComment` | 辅导员评价 | `long_text` | `String` | 否 | 最长 3000 |
| `counselorEvaluatorId` | 辅导员评价人 | `user` | `String` | 否 | — |
| `finalScore` | 综合评分 | `decimal` | `BigDecimal` | 否 | 只读；最小 0；最大 100；精度 1 |
| `conclusion` | 评价结论 | `enum` | `String` | 否 | 枚举：EXCELLENT / QUALIFIED / NEEDS_IMPROVEMENT / UNQUALIFIED |
| `status` | 评价状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / COLLECTING / COMPLETED / ARCHIVED；默认 DRAFT |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `internshipApplicationId` | `fit_internship_application` | `internshipApplicationId` | `one-to-one` | `restrict` |
| `studentId` | `fit_student_profile` | `studentId` | `many-to-one` | `restrict` |
| `companyId` | `fit_company` | `companyId` | `many-to-one` | `restrict` |

### 业务约束

- `tripartite_review_parent_consistency`（`service_invariant`）：父实习申请必须属于当前学生；internshipApplicationId/studentId/studentUserId/companyId 全部由服务端加载父单据后写入并保持一致

## 就业去向（`fit_employment_destination`）

页面：列表 `fit_employment_destination_list`，表单 `fit_employment_destination_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`PENDING`、`VERIFIED`、`RETURNED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `destinationId` | 去向编号 | `text` | `String` | 是 | 唯一；长度 40 |
| `studentId` | 学生档案 | `reference` | `String` | 是 | 只读；服务端派生：currentUser.studentProfile.studentId；创建后不可变；关联 fit_student_profile.studentId |
| `studentUserId` | 学生用户 | `user` | `String` | 是 | 只读；服务端派生：currentUser.id；创建后不可变 |
| `destinationType` | 去向类型 | `enum` | `String` | 是 | 枚举：EMPLOYMENT / FURTHER_STUDY / ENTREPRENEURSHIP / FLEXIBLE / UNEMPLOYED / OTHER |
| `companyId` | 就业企业 | `reference` | `String` | 否 | 关联 fit_company.companyId |
| `companyName` | 单位名称 | `text` | `String` | 否 | 长度 256 |
| `jobTitle` | 岗位名称 | `text` | `String` | 否 | 长度 128 |
| `industry` | 所属行业 | `text` | `String` | 否 | 长度 128 |
| `city` | 就业城市 | `text` | `String` | 否 | 长度 64 |
| `salaryRange` | 薪资区间 | `enum` | `String` | 否 | 枚举：LT_3K / 3K_5K / 5K_8K / 8K_12K / GE_12K / NOT_APPLICABLE |
| `contractType` | 签约类型 | `enum` | `String` | 否 | 枚举：TRIPARTITE / LABOR_CONTRACT / OFFER / OTHER |
| `startDate` | 入职/入学日期 | `date` | `LocalDate` | 否 | — |
| `proofAttachment` | 证明材料 | `attachment` | `String` | 否 | 敏感级别 PERSONAL |
| `verificationStatus` | 核验状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / PENDING / VERIFIED / RETURNED；默认 DRAFT |
| `verifierId` | 核验人 | `user` | `String` | 否 | 只读 |
| `verificationOpinion` | 核验意见 | `long_text` | `String` | 否 | 只读；最长 2000 |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `studentId` | `fit_student_profile` | `studentId` | `one-to-one` | `restrict` |
| `companyId` | `fit_company` | `companyId` | `many-to-one` | `set-null` |

### 业务约束

- `employment_destination_student_identity_consistency`（`service_invariant`）：studentId/studentUserId 必须由服务端从当前登录学生档案派生并匹配同一学生，禁止客户端覆盖

## 政策条目（`fit_policy`）

页面：列表 `fit_policy_list`，表单 `fit_policy_form`；模式：`CREATE`、`EDIT`、`VIEW`。

状态枚举：`DRAFT`、`PUBLISHED`、`EXPIRED`、`ARCHIVED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `policyId` | 政策编号 | `text` | `String` | 是 | 唯一；长度 40 |
| `ownerDepartmentCode` | 维护院系 | `organization` | `String` | 是 | — |
| `title` | 政策标题 | `text` | `String` | 是 | 长度 256 |
| `regionCode` | 地区编码 | `text` | `String` | 是 | 长度 64 |
| `regionName` | 适用地区 | `text` | `String` | 是 | 长度 128 |
| `audienceTags` | 适用人群 | `multi_text` | `List<String>` | 是 | 至少 1 项；最多 20 项 |
| `keywords` | 关键词 | `multi_text` | `List<String>` | 是 | 至少 1 项；最多 30 项 |
| `summary` | 政策摘要 | `long_text` | `String` | 是 | 最长 3000 |
| `content` | 政策正文 | `rich_text` | `String` | 是 | — |
| `sourceUrl` | 来源地址 | `url` | `String` | 是 | — |
| `issuer` | 发布机构 | `text` | `String` | 是 | 长度 256 |
| `publishedAt` | 发布日期 | `date` | `LocalDate` | 是 | — |
| `effectiveFrom` | 生效日期 | `date` | `LocalDate` | 否 | — |
| `effectiveTo` | 失效日期 | `date` | `LocalDate` | 否 | — |
| `status` | 发布状态 | `enum` | `String` | 是 | 只读；枚举：DRAFT / PUBLISHED / EXPIRED / ARCHIVED；默认 DRAFT |
| `knowledgeBaseId` | 知识库编号 | `text` | `String` | 否 | 长度 64 |
| `vectorSyncStatus` | 向量同步状态 | `enum` | `String` | 否 | 枚举：NOT_SYNCED / QUEUED / SYNCED / FAILED；默认 NOT_SYNCED |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `ownerDepartmentCode` | `platform_organization` | `id` | `many-to-one` | `平台默认` |

## AI 调用日志（`fit_ai_call_log`）

页面：列表 `fit_ai_call_log_list`，表单 `fit_ai_call_log_form`；模式：`VIEW`。

状态枚举：`QUEUED`、`RUNNING`、`SUCCEEDED`、`FAILED`、`CANCELLED`

| 字段编码 | 名称 | 苍穹类型 | Java DTO 类型 | 必填 | 约束/关联 |
| --- | --- | --- | --- | --- | --- |
| `id` | 主键 | `long` | `Long` | 是 | 主键；只读 |
| `callId` | 调用编号 | `text` | `String` | 是 | 唯一；长度 64 |
| `studentId` | 关联学生 | `reference` | `String` | 否 | 只读；服务端派生：sourceBusinessRecord.studentId；创建后不可变；关联 fit_student_profile.studentId；敏感级别 PERSONAL |
| `studentUserId` | 关联学生用户 | `user` | `String` | 否 | 只读；服务端派生：sourceBusinessRecord.studentUserId；创建后不可变；敏感级别 PERSONAL |
| `businessType` | 业务类型 | `enum` | `String` | 是 | 枚举：RESUME_DIAGNOSIS / JOB_MATCH_EXPLANATION / INTERVIEW / POLICY_QA / EMPLOYMENT_ANALYSIS |
| `businessId` | 业务单据编号 | `text` | `String` | 是 | 只读；服务端派生：sourceBusinessRecord.businessId；创建后不可变；长度 64 |
| `agentCode` | Agent 编码 | `text` | `String` | 是 | 长度 64 |
| `modelCode` | 模型编码 | `text` | `String` | 是 | 长度 128 |
| `requestHash` | 请求摘要哈希 | `text` | `String` | 是 | 长度 128 |
| `inputSummary` | 输入摘要（脱敏） | `long_text` | `String` | 是 | 最长 5000 |
| `outputSummary` | 输出摘要（脱敏） | `long_text` | `String` | 否 | 最长 10000 |
| `resultJson` | 结构化结果 | `json` | `JsonNode` | 否 | 敏感级别 PERSONAL |
| `status` | 调用状态 | `enum` | `String` | 是 | 只读；枚举：QUEUED / RUNNING / SUCCEEDED / FAILED / CANCELLED；默认 QUEUED |
| `latencyMs` | 耗时毫秒 | `long` | `Long` | 否 | 最小 0 |
| `inputTokens` | 输入 Token | `integer` | `Integer` | 否 | 最小 0 |
| `outputTokens` | 输出 Token | `integer` | `Integer` | 否 | 最小 0 |
| `errorCode` | 错误码 | `text` | `String` | 否 | 长度 128 |
| `errorMessage` | 错误摘要 | `long_text` | `String` | 否 | 最长 3000 |
| `traceId` | 链路追踪编号 | `text` | `String` | 是 | 长度 128 |
| `operatorUserId` | 调用用户 | `user` | `String` | 是 | — |
| `calledAt` | 调用时间 | `datetime` | `OffsetDateTime` | 是 | — |
| `verifiedBy` | 复核人 | `user` | `String` | 否 | — |
| `verifiedAt` | 复核时间 | `datetime` | `OffsetDateTime` | 否 | — |
| `createdBy` | 创建人 | `user` | `String` | 否 | 只读 |
| `createdAt` | 创建时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `modifiedBy` | 最后修改人 | `user` | `String` | 否 | 只读 |
| `modifiedAt` | 最后修改时间 | `datetime` | `OffsetDateTime` | 否 | 只读 |
| `dataVersion` | 数据版本 | `integer` | `Integer` | 否 | 只读；默认 1 |

### 关联关系

| 本表字段 | 目标模型 | 目标字段 | 基数 | 删除策略 |
| --- | --- | --- | --- | --- |
| `studentId` | `fit_student_profile` | `studentId` | `many-to-one` | `set-null` |

### 业务约束

- `ai_call_log_business_owner_consistency`（`service_invariant`）：businessId/studentId/studentUserId 必须由服务端从本次 AI 调用的授权业务单据派生，学生只能读取归属自己的结果摘要

## 服务与流程关联

| 编码 | 能力 | 输入 | 写入/创建 |
| --- | --- | --- | --- |
| `fit_resume_diagnose` | 简历诊断 | `fit_student_profile.studentId`、`fit_resume.resumeId`、`fit_job.jobId` | `fit_resume.diagnosisStatus`、`fit_resume.diagnosisReportId`、`fit_resume.diagnosisScore`、`fit_ai_call_log.callId` |
| `fit_job_match_service` | 岗位匹配与推荐 | `fit_student_profile.studentId`、`fit_resume.resumeId`、`fit_job.jobId` | `fit_ai_call_log.callId` |
| `fit_job_apply` | 一键申请 | `fit_student_profile.studentId`、`fit_resume.resumeId`、`fit_job.jobId` | 创建 `fit_job_application`，启动 `fit_job_application_flow` |

岗位推荐过滤：`fit_job.publishStatus == PUBLISHED && fit_job.recommendationEnabled == true`。

## Java DTO 约定

- 表单字段以 camelCase 编码直接映射 Java 属性。
- 枚举字段在第一版 DTO 中使用 `String`，Java 服务稳定后可提升为显式枚举并保留未知值兼容。
- 主子表映射为 `List<DetailDTO>`；引用字段先使用业务编号 `String`，避免把苍穹内部主键泄漏到服务边界。
- 日期分别使用 `LocalDate` 和 `OffsetDateTime`；金额与评分小数使用 `BigDecimal`。
- `structuredContent`、`resultJson` 使用 `JsonNode`，并在 Java 服务入口执行结构校验。
- 审批状态、当前处理人和审批记录只能由流程操作写入，DTO 更新接口不得接受客户端直接覆盖。
