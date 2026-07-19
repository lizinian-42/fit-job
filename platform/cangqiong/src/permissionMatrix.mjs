const allow = (actions, dataScope, options = {}) => ({
    actions,
    dataScope,
    ...options
});

const deny = () => allow([], 'NONE');

export const permissionMatrix = {
    code: 'fitjob-role-permission-matrix',
    version: '2.0.0',
    principle: 'least-privilege',
    roles: {
        STUDENT: {
            label: '学生',
            assignment: '平台用户与 fit_student_profile.studentUserId 一一绑定',
            defaultScope: 'SELF'
        },
        COUNSELOR: {
            label: '辅导员',
            assignment: '平台用户绑定负责班级，或等于学生档案 counselorUserId',
            defaultScope: 'RESPONSIBLE_STUDENTS'
        },
        COMPANY_HR: {
            label: '企业 HR',
            assignment: '平台用户等于企业 hrOwnerUserId，或属于企业 HR 用户组',
            defaultScope: 'OWN_COMPANY'
        },
        DEPARTMENT_ADMIN: {
            label: '院系管理员',
            assignment: '平台用户绑定一个或多个院系组织',
            defaultScope: 'DEPARTMENT'
        }
    },
    dataScopes: {
        NONE: '始终为 false',
        PUBLIC: '仅发布且未失效的数据',
        SELF: 'record.studentUserId == currentUser.id',
        RESPONSIBLE_STUDENTS: 'record.counselorUserId == currentUser.id 或 record.classCode 属于 currentUser.managedClassCodes',
        RELATED_STUDENT_RECORDS: '业务单据的 studentId 属于 RESPONSIBLE_STUDENTS',
        OWN_COMPANY: 'record.companyId 属于 currentUser.companyIds；companyId 必须由服务端从企业成员关系解析，禁止信任客户端 hrOwnerUserId',
        RELATED_CANDIDATES: '学生已向 currentUser.companyIds 的岗位提交申请，只暴露候选人摘要字段',
        DEPARTMENT: 'record.collegeCode 或 record.reviewDepartmentCode 属于 currentUser.departmentCodes；关联单据沿 studentId/companyId 继承院系范围',
        DEPARTMENT_OR_PUBLIC: '读取时允许 DEPARTMENT 或 PUBLIC；写操作必须使用 actionScopes 中的 DEPARTMENT'
    },
    scopeRequirements: {
        NONE: { anyFields: [] },
        PUBLIC: { publicPredicateRequired: true },
        SELF: { anyFields: ['studentUserId'] },
        RESPONSIBLE_STUDENTS: { anyFields: ['counselorUserId', 'classCode'] },
        RELATED_STUDENT_RECORDS: { anyFields: ['studentId'] },
        OWN_COMPANY: { anyFields: ['companyId'] },
        RELATED_CANDIDATES: { anyFields: ['studentId'] },
        DEPARTMENT: { anyFields: ['collegeCode', 'reviewDepartmentCode', 'ownerDepartmentCode', 'studentId', 'companyId'] },
        DEPARTMENT_OR_PUBLIC: { anyFields: ['collegeCode', 'reviewDepartmentCode', 'ownerDepartmentCode', 'studentId', 'companyId'], publicPredicateOptional: true }
    },
    publicPredicates: {
        fit_company: 'reviewStatus == APPROVED',
        fit_job: 'publishStatus == PUBLISHED && recommendationEnabled == true && applicationDeadline >= today',
        fit_policy: 'status == PUBLISHED && effectiveFrom <= today && (effectiveTo == null || effectiveTo >= today)'
    },
    menus: [
        { code: 'fit_student_center', label: '我的档案', roles: ['STUDENT'] },
        { code: 'fit_resume_center', label: '我的简历', roles: ['STUDENT'] },
        { code: 'fit_job_market', label: '岗位中心', roles: ['STUDENT', 'COUNSELOR', 'COMPANY_HR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_my_applications', label: '我的申请', roles: ['STUDENT'] },
        { code: 'fit_student_management', label: '学生管理', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_company_management', label: '企业与岗位管理', roles: ['COUNSELOR', 'COMPANY_HR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_approval_center', label: '实习审批中心', roles: ['COUNSELOR', 'COMPANY_HR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_internship_management', label: '实习过程管理', roles: ['STUDENT', 'COUNSELOR', 'COMPANY_HR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_policy_center', label: '就业政策', roles: ['STUDENT', 'COUNSELOR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_employment_dashboard', label: '就业驾驶舱', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'] },
        { code: 'fit_ai_audit', label: 'AI 调用审计', roles: ['DEPARTMENT_ADMIN'] },
        { code: 'fit_permission_admin', label: '权限与基础配置', roles: ['DEPARTMENT_ADMIN'] }
    ],
    models: {
        fit_student_profile: {
            STUDENT: allow(['create', 'read', 'update', 'activate', 'archive'], 'SELF', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'ACTIVATE', 'ARCHIVE']
            }),
            COUNSELOR: allow(['read', 'update', 'assist_complete'], 'RESPONSIBLE_STUDENTS', {
                buttons: ['VIEW', 'EDIT', 'SAVE', 'ASSIST_COMPLETE']
            }),
            COMPANY_HR: allow(['read_summary'], 'RELATED_CANDIDATES', {
                buttons: ['VIEW_CANDIDATE_SUMMARY'],
                fields: ['studentId', 'displayName', 'collegeName', 'majorName', 'graduationYear', 'skillTags', 'targetRoles']
            }),
            DEPARTMENT_ADMIN: allow(['create', 'read', 'update', 'archive', 'export'], 'DEPARTMENT', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'ARCHIVE', 'EXPORT']
            })
        },
        fit_resume: {
            STUDENT: allow(['create', 'read', 'update', 'archive', 'set_default', 'diagnose'], 'SELF', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'ARCHIVE', 'SET_DEFAULT', 'RUN_DIAGNOSIS']
            }),
            COUNSELOR: allow(['read', 'comment'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW', 'ADD_GUIDANCE']
            }),
            COMPANY_HR: allow(['read_candidate_resume'], 'RELATED_CANDIDATES', {
                buttons: ['VIEW_APPLICATION_RESUME'],
                fields: ['resumeId', 'versionName', 'summary', 'skillTags', 'sourceFile']
            }),
            DEPARTMENT_ADMIN: allow(['read', 'export_metadata'], 'DEPARTMENT', {
                buttons: ['VIEW', 'EXPORT_METADATA']
            })
        },
        fit_company: {
            STUDENT: allow(['read'], 'PUBLIC', { buttons: ['VIEW'] }),
            COUNSELOR: allow(['read', 'update', 'review', 'return'], 'DEPARTMENT_OR_PUBLIC', {
                buttons: ['VIEW', 'EDIT', 'APPROVE', 'RETURN'],
                actionScopes: { read: 'DEPARTMENT_OR_PUBLIC', update: 'DEPARTMENT', review: 'DEPARTMENT', return: 'DEPARTMENT' },
                actionConditions: { update: 'reviewStatus IN (DRAFT, REJECTED)', review: 'reviewStatus == PENDING_REVIEW', return: 'reviewStatus == PENDING_REVIEW' }
            }),
            COMPANY_HR: allow(['create', 'read', 'update', 'submit'], 'OWN_COMPANY', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'SUBMIT_REVIEW'],
                actionConditions: { update: 'reviewStatus IN (DRAFT, REJECTED)', submit: 'reviewStatus IN (DRAFT, REJECTED)' }
            }),
            DEPARTMENT_ADMIN: allow(['create', 'read', 'update', 'review', 'return', 'disable', 'export'], 'DEPARTMENT_OR_PUBLIC', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'APPROVE', 'RETURN', 'DISABLE', 'EXPORT'],
                actionScopes: { create: 'DEPARTMENT', read: 'DEPARTMENT_OR_PUBLIC', update: 'DEPARTMENT', review: 'DEPARTMENT', return: 'DEPARTMENT', disable: 'DEPARTMENT', export: 'DEPARTMENT' },
                actionConditions: { update: 'reviewStatus IN (DRAFT, REJECTED)', review: 'reviewStatus == PENDING_REVIEW', return: 'reviewStatus == PENDING_REVIEW', disable: 'reviewStatus == APPROVED' }
            })
        },
        fit_job: {
            STUDENT: allow(['read', 'apply'], 'PUBLIC', { buttons: ['VIEW', 'APPLY'] }),
            COUNSELOR: allow(['read', 'update', 'review', 'publish', 'return'], 'DEPARTMENT_OR_PUBLIC', {
                buttons: ['VIEW', 'EDIT', 'APPROVE_PUBLISH', 'RETURN'],
                actionScopes: { read: 'DEPARTMENT_OR_PUBLIC', update: 'DEPARTMENT', review: 'DEPARTMENT', publish: 'DEPARTMENT', return: 'DEPARTMENT' },
                actionConditions: { update: 'publishStatus IN (DRAFT, REJECTED)', review: 'publishStatus == PENDING_REVIEW', publish: 'publishStatus == PENDING_REVIEW', return: 'publishStatus == PENDING_REVIEW' }
            }),
            COMPANY_HR: allow(['create', 'read', 'update', 'submit', 'close'], 'OWN_COMPANY', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'SUBMIT_REVIEW', 'CLOSE'],
                actionConditions: { update: 'publishStatus IN (DRAFT, REJECTED)', submit: 'publishStatus IN (DRAFT, REJECTED)', close: 'publishStatus == PUBLISHED' }
            }),
            DEPARTMENT_ADMIN: allow(['create', 'read', 'update', 'review', 'publish', 'return', 'close', 'export'], 'DEPARTMENT_OR_PUBLIC', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'VIEW', 'APPROVE_PUBLISH', 'RETURN', 'CLOSE', 'EXPORT'],
                actionScopes: { create: 'DEPARTMENT', read: 'DEPARTMENT_OR_PUBLIC', update: 'DEPARTMENT', review: 'DEPARTMENT', publish: 'DEPARTMENT', return: 'DEPARTMENT', close: 'DEPARTMENT', export: 'DEPARTMENT' },
                actionConditions: { update: 'publishStatus IN (DRAFT, REJECTED)', review: 'publishStatus == PENDING_REVIEW', publish: 'publishStatus == PENDING_REVIEW', return: 'publishStatus == PENDING_REVIEW', close: 'publishStatus == PUBLISHED' }
            })
        },
        fit_job_application: {
            STUDENT: allow(['create', 'read', 'update_draft', 'submit', 'resubmit', 'withdraw'], 'SELF', {
                buttons: ['APPLY', 'EDIT_DRAFT', 'SUBMIT', 'RESUBMIT', 'WITHDRAW', 'VIEW']
            }),
            COUNSELOR: allow(['read', 'approve', 'return'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW', 'COUNSELOR_APPROVE', 'RETURN']
            }),
            COMPANY_HR: allow(['read', 'invite_interview', 'offer', 'reject'], 'OWN_COMPANY', {
                buttons: ['VIEW', 'INVITE_INTERVIEW', 'OFFER', 'REJECT']
            }),
            DEPARTMENT_ADMIN: allow(['read', 'override_return', 'export'], 'DEPARTMENT', {
                buttons: ['VIEW', 'RETURN', 'EXPORT']
            })
        },
        fit_internship_application: {
            STUDENT: allow(['create', 'read', 'update_draft', 'submit', 'resubmit', 'cancel'], 'SELF', {
                buttons: ['ADD', 'EDIT_DRAFT', 'SUBMIT', 'RESUBMIT', 'CANCEL', 'VIEW']
            }),
            COUNSELOR: allow(['read', 'approve', 'return', 'reject'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW', 'APPROVE', 'RETURN', 'REJECT']
            }),
            COMPANY_HR: allow(['read', 'confirm', 'return', 'reject'], 'OWN_COMPANY', {
                buttons: ['VIEW', 'CONFIRM', 'RETURN', 'REJECT']
            }),
            DEPARTMENT_ADMIN: allow(['read', 'approve', 'return', 'reject', 'export'], 'DEPARTMENT', {
                buttons: ['VIEW', 'APPROVE', 'RETURN', 'REJECT', 'EXPORT']
            })
        },
        fit_internship_log: {
            STUDENT: allow(['create', 'read', 'update_draft', 'submit', 'resubmit'], 'SELF', {
                buttons: ['ADD', 'EDIT_DRAFT', 'SUBMIT', 'RESUBMIT', 'VIEW']
            }),
            COUNSELOR: allow(['read', 'review', 'return'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW', 'REVIEW', 'RETURN']
            }),
            COMPANY_HR: allow(['read'], 'OWN_COMPANY', { buttons: ['VIEW'] }),
            DEPARTMENT_ADMIN: allow(['read', 'export'], 'DEPARTMENT', { buttons: ['VIEW', 'EXPORT'] })
        },
        fit_tripartite_review: {
            STUDENT: allow(['create', 'read', 'update_student_section', 'submit_student_section'], 'SELF', {
                buttons: ['ADD', 'EDIT_SELF_REVIEW', 'SUBMIT_SELF_REVIEW', 'VIEW']
            }),
            COUNSELOR: allow(['read', 'update_counselor_section', 'complete'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW', 'EDIT_COUNSELOR_REVIEW', 'COMPLETE_REVIEW']
            }),
            COMPANY_HR: allow(['read', 'update_company_section', 'submit_company_section'], 'OWN_COMPANY', {
                buttons: ['VIEW', 'EDIT_COMPANY_REVIEW', 'SUBMIT_COMPANY_REVIEW']
            }),
            DEPARTMENT_ADMIN: allow(['read', 'archive', 'export'], 'DEPARTMENT', {
                buttons: ['VIEW', 'ARCHIVE', 'EXPORT']
            })
        },
        fit_employment_destination: {
            STUDENT: allow(['create', 'read', 'update_draft', 'submit'], 'SELF', {
                buttons: ['ADD', 'EDIT_DRAFT', 'SUBMIT', 'VIEW']
            }),
            COUNSELOR: allow(['read', 'verify', 'return'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW', 'VERIFY', 'RETURN']
            }),
            COMPANY_HR: deny(),
            DEPARTMENT_ADMIN: allow(['read', 'verify', 'return', 'export'], 'DEPARTMENT', {
                buttons: ['VIEW', 'VERIFY', 'RETURN', 'EXPORT']
            })
        },
        fit_policy: {
            STUDENT: allow(['read'], 'PUBLIC', { buttons: ['VIEW'] }),
            COUNSELOR: allow(['read'], 'PUBLIC', { buttons: ['VIEW'] }),
            COMPANY_HR: deny(),
            DEPARTMENT_ADMIN: allow(['create', 'read', 'update', 'publish', 'expire', 'archive'], 'DEPARTMENT_OR_PUBLIC', {
                buttons: ['ADD', 'EDIT', 'SAVE', 'PUBLISH', 'EXPIRE', 'ARCHIVE', 'VIEW'],
                actionScopes: { create: 'DEPARTMENT', read: 'DEPARTMENT_OR_PUBLIC', update: 'DEPARTMENT', publish: 'DEPARTMENT', expire: 'DEPARTMENT', archive: 'DEPARTMENT' },
                actionConditions: { update: 'status == DRAFT', publish: 'status == DRAFT', expire: 'status == PUBLISHED', archive: 'status IN (DRAFT, EXPIRED)' }
            })
        },
        fit_ai_call_log: {
            STUDENT: allow(['read_summary'], 'SELF', {
                buttons: ['VIEW_RESULT_SUMMARY'],
                fields: ['callId', 'businessType', 'businessId', 'status', 'outputSummary', 'calledAt']
            }),
            COUNSELOR: allow(['read_summary'], 'RELATED_STUDENT_RECORDS', {
                buttons: ['VIEW_RESULT_SUMMARY'],
                fields: ['callId', 'studentId', 'businessType', 'businessId', 'status', 'outputSummary', 'calledAt']
            }),
            COMPANY_HR: deny(),
            DEPARTMENT_ADMIN: allow(['read', 'verify', 'export'], 'DEPARTMENT', {
                buttons: ['VIEW', 'VERIFY', 'EXPORT']
            })
        }
    },
    fieldRules: [
        {
            models: ['fit_student_profile'],
            fields: ['mobile', 'email', 'studentNo'],
            rule: '学生本人可查看原值；辅导员和院系管理员按职责查看；企业 HR 永不返回；列表默认脱敏。'
        },
        {
            models: ['fit_student_profile'],
            fields: ['studentId', 'studentUserId', 'studentNo', 'collegeCode', 'collegeName', 'majorName', 'classCode', 'counselorUserId', 'graduationYear'],
            rule: '全部由服务端从获授权的学生与组织绑定派生并冻结；学生不得修改决定辅导员、院系数据范围或流程处理人的字段。'
        },
        {
            models: ['fit_resume'],
            fields: ['contentText', 'structuredContent', 'sourceFile'],
            rule: '仅学生本人、负责辅导员、院系管理员和相关岗位的企业 HR 可读；企业 HR 只在申请有效期内读取。'
        },
        {
            models: ['fit_company'],
            fields: ['contactName', 'contactPhone', 'contactEmail'],
            rule: '仅本企业 HR、审核辅导员和院系管理员可读；学生端不显示联系人隐私字段。'
        },
        {
            models: ['fit_ai_call_log'],
            fields: ['inputSummary', 'outputSummary', 'resultJson', 'errorMessage'],
            rule: '日志列表默认展示脱敏摘要；完整结果仅院系管理员审计时按需查看。'
        },
        {
            models: ['fit_job_application', 'fit_internship_application'],
            fields: ['status', 'currentNode', 'currentHandlerRole', 'currentHandlerId', 'approvalRecords'],
            rule: '全部只读，只允许流程动作写入，禁止表单直接编辑状态和审批历史。'
        },
        {
            models: ['fit_company'],
            fields: ['reviewStatus', 'currentNode', 'currentHandlerRole', 'currentHandlerId', 'latestOpinion', 'approvalRecords'],
            rule: '审核状态和审计字段全部只读，仅允许流程动作写入。'
        },
        {
            models: ['fit_job'],
            fields: ['publishStatus', 'currentNode', 'currentHandlerRole', 'currentHandlerId', 'latestOpinion', 'approvalRecords'],
            rule: '审核状态和审计字段全部只读，仅允许流程动作写入。'
        },
        {
            models: ['fit_job'],
            fields: ['companyId', 'hrOwnerUserId', 'reviewDepartmentCode'],
            rule: '由服务端根据当前企业成员关系派生并冻结，禁止企业 HR 通过伪造负责人维护其他企业岗位。'
        },
        {
            models: ['fit_company'],
            fields: ['companyId', 'hrOwnerUserId', 'reviewDepartmentCode'],
            rule: '由服务端根据当前登录用户的企业与院系成员关系生成，客户端不得指定归属。'
        },
        {
            models: ['fit_internship_application'],
            fields: ['studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId'],
            rule: '全部从已录用岗位申请派生并冻结，提交时再次校验整组关联字段一致。'
        },
        {
            models: ['fit_policy'],
            fields: ['status'],
            rule: '状态只允许发布、失效和归档服务操作写入，表单编辑不得直接修改。'
        }
    ],
    segregationAcceptanceCases: [
        '学生 A 无法读取或修改学生 B 的档案、简历和申请。',
        '辅导员只能看到负责班级或 counselorUserId 指向自己的学生数据。',
        '企业 HR A 无法读取企业 B 的岗位、候选人和实习申请。',
        '院系管理员 A 无法读取院系 B 的学生明细，只能读取获授权院系数据。',
        '未发布岗位和已失效政策不会进入学生菜单或推荐服务。',
        '所有无权限请求在服务端再次校验，不能只依赖菜单隐藏。'
    ]
};
