const ROLES = ['STUDENT', 'COUNSELOR', 'COMPANY_HR', 'DEPARTMENT_ADMIN'];

function field(code, label, type, options = {}) {
    return {
        code,
        label,
        type,
        required: false,
        ...options
    };
}

function auditFields() {
    return [
        field('createdBy', '创建人', 'user', { readonly: true }),
        field('createdAt', '创建时间', 'datetime', { readonly: true }),
        field('modifiedBy', '最后修改人', 'user', { readonly: true }),
        field('modifiedAt', '最后修改时间', 'datetime', { readonly: true }),
        field('dataVersion', '数据版本', 'integer', { readonly: true, default: 1 })
    ];
}

function formModel({
    code,
    name,
    numberField,
    ownerField,
    status,
    fields,
    uiModes = ['CREATE', 'EDIT', 'VIEW'],
    detailTables = [],
    relationships = [],
    indexes = [],
    constraints = []
}) {
    return {
        code,
        name,
        kind: 'form',
        primaryKey: 'id',
        numberField,
        ownerField,
        permissionsRef: 'fitjob-role-permission-matrix',
        ui: {
            listPage: `${code}_list`,
            formPage: `${code}_form`,
            supportedModes: uiModes
        },
        status,
        fields: [
            field('id', '主键', 'long', { required: true, primaryKey: true, readonly: true }),
            ...fields,
            ...auditFields()
        ],
        detailTables,
        relationships,
        indexes,
        constraints
    };
}

function workflowTrackingFields() {
    return [
        field('currentNode', '当前节点', 'text', { readonly: true, required: true }),
        field('currentHandlerRole', '当前处理角色', 'enum', { readonly: true, enum: ROLES }),
        field('currentHandlerId', '当前处理人', 'user', { readonly: true }),
        field('latestOpinion', '最近审批意见', 'long_text', { readonly: true, maxLength: 2000 })
    ];
}

function approvalDetailTable() {
    return {
        code: 'approvalRecords',
        name: '审批记录',
        readonly: true,
        fields: [
            field('recordId', '记录编号', 'text', { required: true, uniqueWithinParent: true }),
            field('commandId', '幂等命令编号', 'text', { required: true, uniqueWithinParent: true, length: 128 }),
            field('nodeCode', '节点编码', 'text', { required: true }),
            field('actorRole', '处理角色', 'enum', { required: true, enum: ROLES }),
            field('actorId', '处理人', 'user', { required: true }),
            field('action', '处理动作', 'text', { required: true }),
            field('opinion', '审批意见', 'long_text', { maxLength: 2000 }),
            field('fromStatus', '原状态', 'text', { required: true }),
            field('toStatus', '新状态', 'text', { required: true }),
            field('operatedAt', '处理时间', 'datetime', { required: true })
        ]
    };
}

const studentProfile = formModel({
    code: 'fit_student_profile',
    name: '学生档案',
    numberField: 'studentId',
    ownerField: 'studentUserId',
    status: {
        field: 'profileStatus',
        initial: 'DRAFT',
        values: ['DRAFT', 'ACTIVE', 'ARCHIVED']
    },
    fields: [
        field('studentId', '学生档案编号', 'text', {
            required: true,
            unique: true,
            length: 32,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedStudentBinding.studentId'
        }),
        field('studentUserId', '关联学生用户', 'user', {
            required: true,
            unique: true,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedStudentBinding.studentUserId'
        }),
        field('displayName', '姓名', 'text', { required: true, length: 64 }),
        field('studentNo', '学号', 'text', {
            required: true,
            unique: true,
            length: 32,
            sensitivity: 'PERSONAL',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedStudentBinding.studentNo'
        }),
        field('gender', '性别', 'enum', { enum: ['UNSPECIFIED', 'FEMALE', 'MALE'], default: 'UNSPECIFIED' }),
        field('mobile', '手机号', 'phone', { sensitivity: 'SENSITIVE', masked: true }),
        field('email', '邮箱', 'email', { sensitivity: 'SENSITIVE', masked: true }),
        field('collegeCode', '院系', 'organization', { required: true, readonly: true, immutableAfterCreate: true, serverDerived: 'authorizedStudentBinding.collegeCode' }),
        field('collegeName', '院系名称', 'text', { required: true, length: 128, readonly: true, immutableAfterCreate: true, serverDerived: 'authorizedStudentBinding.collegeName' }),
        field('majorName', '专业', 'text', { required: true, length: 128, readonly: true, immutableAfterCreate: true, serverDerived: 'authorizedStudentBinding.majorName' }),
        field('classCode', '班级', 'text', { required: true, length: 64, readonly: true, immutableAfterCreate: true, serverDerived: 'authorizedStudentBinding.classCode' }),
        field('counselorUserId', '辅导员', 'user', { required: true, readonly: true, immutableAfterCreate: true, serverDerived: 'authorizedStudentBinding.counselorUserId' }),
        field('graduationYear', '毕业年份', 'integer', { required: true, min: 2020, max: 2100, readonly: true, immutableAfterCreate: true, serverDerived: 'authorizedStudentBinding.graduationYear' }),
        field('profileStatus', '档案状态', 'enum', { required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT', readonly: true }),
        field('employmentStatus', '就业状态', 'enum', {
            required: true,
            enum: ['NOT_STARTED', 'ACTIVE_SEARCH', 'INTERNSHIP', 'EMPLOYED', 'OTHER'],
            default: 'NOT_STARTED'
        }),
        field('targetRoles', '目标岗位', 'multi_text', { required: true, maxItems: 5 }),
        field('preferredCities', '意向城市', 'multi_text', { required: true, maxItems: 10 }),
        field('expectedSalaryMin', '期望薪资下限', 'decimal', { min: 0, precision: 2 }),
        field('expectedSalaryMax', '期望薪资上限', 'decimal', { min: 0, precision: 2 }),
        field('availableFrom', '可到岗日期', 'date'),
        field('weeklyAttendanceDays', '每周可实习天数', 'integer', { min: 1, max: 7 }),
        field('skillTags', '技能标签', 'multi_text', { maxItems: 30 }),
        field('profileCompletion', '档案完整度', 'integer', { readonly: true, min: 0, max: 100 }),
        field('readinessScore', '求职准备度', 'integer', { readonly: true, min: 0, max: 100 })
    ],
    detailTables: [
        {
            code: 'educationBackground',
            name: '教育背景',
            minRows: 1,
            fields: [
                field('educationId', '教育经历编号', 'text', { required: true, uniqueWithinParent: true }),
                field('schoolName', '学校', 'text', { required: true, length: 128 }),
                field('collegeName', '院系', 'text', { required: true, length: 128 }),
                field('majorName', '专业', 'text', { required: true, length: 128 }),
                field('degree', '学历', 'enum', { required: true, enum: ['ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTOR'] }),
                field('startDate', '开始日期', 'date', { required: true }),
                field('endDate', '结束日期', 'date', { required: true }),
                field('gpa', 'GPA', 'decimal', { min: 0, max: 5, precision: 2 }),
                field('rankPercent', '专业排名百分位', 'integer', { min: 1, max: 100 })
            ]
        },
        {
            code: 'certificates',
            name: '技能证书',
            fields: [
                field('certificateId', '证书编号', 'text', { required: true, uniqueWithinParent: true }),
                field('certificateName', '证书名称', 'text', { required: true, length: 128 }),
                field('issuer', '颁发机构', 'text', { required: true, length: 128 }),
                field('obtainedAt', '取得日期', 'date', { required: true }),
                field('credentialNo', '凭证编号', 'text', { length: 128, sensitivity: 'PERSONAL' }),
                field('attachment', '证明附件', 'attachment')
            ]
        },
        {
            code: 'experiences',
            name: '项目与实习经历',
            fields: [
                field('experienceId', '经历编号', 'text', { required: true, uniqueWithinParent: true }),
                field('type', '经历类型', 'enum', { required: true, enum: ['PROJECT', 'INTERNSHIP', 'COMPETITION', 'CAMPUS'] }),
                field('name', '经历名称', 'text', { required: true, length: 128 }),
                field('organizationName', '组织/企业', 'text', { required: true, length: 128 }),
                field('role', '担任角色', 'text', { required: true, length: 128 }),
                field('startDate', '开始日期', 'date', { required: true }),
                field('endDate', '结束日期', 'date'),
                field('description', '经历描述', 'long_text', { required: true, maxLength: 4000 }),
                field('achievements', '成果与量化证据', 'long_text', { maxLength: 4000 }),
                field('skillTags', '使用技能', 'multi_text', { maxItems: 20 })
            ]
        }
    ],
    relationships: [
        { field: 'studentUserId', target: 'platform_user', cardinality: 'many-to-one' },
        { field: 'collegeCode', target: 'platform_organization', cardinality: 'many-to-one' },
        { field: 'counselorUserId', target: 'platform_user', cardinality: 'many-to-one' }
    ],
    indexes: [
        { fields: ['studentId'], unique: true },
        { fields: ['studentUserId'], unique: true },
        { fields: ['collegeCode', 'classCode', 'graduationYear'] }
    ],
    constraints: [
        {
            code: 'student_profile_identity_consistency',
            type: 'service_invariant',
            source: 'authorizedStudentBinding',
            fieldMatches: {
                studentId: 'studentId',
                studentUserId: 'studentUserId',
                studentNo: 'studentNo',
                collegeCode: 'collegeCode',
                collegeName: 'collegeName',
                majorName: 'majorName',
                classCode: 'classCode',
                counselorUserId: 'counselorUserId',
                graduationYear: 'graduationYear'
            },
            rule: '学生身份、学籍、院系、班级和辅导员必须由服务端根据获授权的学生组织绑定写入，学生自建时必须绑定 currentUser.id，禁止客户端覆盖或改变数据范围与审批路由'
        }
    ]
});

const resume = formModel({
    code: 'fit_resume',
    name: '简历档案',
    numberField: 'resumeId',
    ownerField: 'studentUserId',
    status: {
        field: 'status',
        initial: 'DRAFT',
        values: ['DRAFT', 'ACTIVE', 'ARCHIVED']
    },
    fields: [
        field('resumeId', '简历编号', 'text', { required: true, unique: true, length: 32 }),
        field('studentId', '学生档案', 'reference', {
            required: true,
            reference: 'fit_student_profile.studentId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'currentUser.studentProfile.studentId'
        }),
        field('studentUserId', '学生用户', 'user', {
            required: true,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'currentUser.id'
        }),
        field('versionNo', '版本号', 'integer', { required: true, min: 1 }),
        field('versionName', '版本名称', 'text', { required: true, length: 128 }),
        field('targetJobId', '目标岗位', 'reference', { reference: 'fit_job.jobId' }),
        field('sourceFile', '原始简历', 'attachment'),
        field('summary', '个人摘要', 'long_text', { maxLength: 2000 }),
        field('contentText', '简历全文', 'long_text', { maxLength: 30000, sensitivity: 'PERSONAL' }),
        field('structuredContent', '结构化简历', 'json', { sensitivity: 'PERSONAL' }),
        field('skillTags', '技能标签', 'multi_text', { maxItems: 30 }),
        field('isDefault', '默认简历', 'boolean', { required: true, default: false }),
        field('status', '版本状态', 'enum', { required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT', readonly: true }),
        field('diagnosisStatus', '诊断状态', 'enum', {
            required: true,
            enum: ['NOT_RUN', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED'],
            default: 'NOT_RUN',
            readonly: true
        }),
        field('diagnosisReportId', '诊断报告编号', 'text', { readonly: true, length: 64 }),
        field('diagnosisScore', '诊断分数', 'integer', { readonly: true, min: 0, max: 100 })
    ],
    relationships: [
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'targetJobId', target: 'fit_job', targetField: 'jobId', cardinality: 'many-to-one', onDelete: 'set-null' }
    ],
    indexes: [
        { fields: ['resumeId'], unique: true },
        { fields: ['studentId', 'versionNo'], unique: true },
        { fields: ['studentId', 'isDefault'] }
    ],
    constraints: [
        {
            code: 'resume_student_identity_consistency',
            type: 'service_invariant',
            source: 'fit_student_profile',
            fieldMatches: {
                studentId: 'studentId',
                studentUserId: 'studentUserId'
            },
            rule: 'studentId/studentUserId 必须由服务端从当前登录学生的档案派生且同时匹配同一 fit_student_profile，禁止客户端跨学生引用'
        }
    ]
});

const company = formModel({
    code: 'fit_company',
    name: '企业信息',
    numberField: 'companyId',
    ownerField: 'hrOwnerUserId',
    status: {
        field: 'reviewStatus',
        initial: 'DRAFT',
        values: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DISABLED']
    },
    fields: [
        field('companyId', '企业编号', 'text', { required: true, unique: true, length: 32, readonly: true, serverGenerated: true }),
        field('companyCode', '企业统一编码', 'text', { required: true, unique: true, length: 64 }),
        field('companyName', '企业名称', 'text', { required: true, length: 256 }),
        field('industry', '所属行业', 'text', { required: true, length: 128 }),
        field('companyScale', '企业规模', 'enum', {
            required: true,
            enum: ['LT_50', '50_99', '100_499', '500_999', 'GE_1000']
        }),
        field('companyNature', '企业性质', 'enum', { enum: ['PRIVATE', 'STATE_OWNED', 'FOREIGN', 'JOINT_VENTURE', 'OTHER'] }),
        field('city', '所在城市', 'text', { required: true, length: 64 }),
        field('reviewDepartmentCode', '归口审核院系', 'organization', { required: true, readonly: true, serverDerived: 'currentUser.departmentCode' }),
        field('address', '详细地址', 'text', { length: 256 }),
        field('website', '企业网站', 'url'),
        field('description', '企业简介', 'long_text', { required: true, maxLength: 5000 }),
        field('hrOwnerUserId', '企业 HR 负责人', 'user', { required: true, readonly: true, serverDerived: 'currentUser.id' }),
        field('contactName', '联系人', 'text', { length: 64, sensitivity: 'BUSINESS_CONTACT' }),
        field('contactPhone', '联系电话', 'phone', { sensitivity: 'BUSINESS_CONTACT', masked: true }),
        field('contactEmail', '联系邮箱', 'email', { sensitivity: 'BUSINESS_CONTACT', masked: true }),
        field('reviewStatus', '审核状态', 'enum', {
            required: true,
            enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DISABLED'],
            default: 'DRAFT',
            readonly: true
        }),
        ...workflowTrackingFields(),
        field('reviewOpinion', '审核意见', 'long_text', { readonly: true, maxLength: 2000 }),
        field('reviewedBy', '审核人', 'user', { readonly: true }),
        field('reviewedAt', '审核时间', 'datetime', { readonly: true })
    ],
    detailTables: [approvalDetailTable()],
    relationships: [
        { field: 'hrOwnerUserId', target: 'platform_user', cardinality: 'many-to-one' },
        { field: 'reviewDepartmentCode', target: 'platform_organization', cardinality: 'many-to-one' }
    ],
    indexes: [
        { fields: ['companyId'], unique: true },
        { fields: ['companyCode'], unique: true },
        { fields: ['hrOwnerUserId'] }
    ]
});

const job = formModel({
    code: 'fit_job',
    name: '岗位信息',
    numberField: 'jobId',
    ownerField: 'hrOwnerUserId',
    status: {
        field: 'publishStatus',
        initial: 'DRAFT',
        values: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'CLOSED']
    },
    fields: [
        field('jobId', '岗位编号', 'text', { required: true, unique: true, length: 32 }),
        field('companyId', '所属企业', 'reference', { required: true, reference: 'fit_company.companyId', readonly: true, serverDerived: 'currentUser.companyId' }),
        field('hrOwnerUserId', '企业 HR 负责人', 'user', { required: true, readonly: true, serverDerived: 'fit_company.hrOwnerUserId' }),
        field('reviewDepartmentCode', '归口审核院系', 'organization', { required: true, readonly: true, serverDerived: 'fit_company.reviewDepartmentCode' }),
        field('title', '岗位名称', 'text', { required: true, length: 128 }),
        field('jobType', '岗位类型', 'enum', { required: true, enum: ['INTERNSHIP', 'GRADUATE', 'PART_TIME'] }),
        field('city', '工作城市', 'text', { required: true, length: 64 }),
        field('workMode', '工作方式', 'enum', { required: true, enum: ['ONSITE', 'HYBRID', 'REMOTE'], default: 'ONSITE' }),
        field('salaryMin', '薪资下限', 'decimal', { required: true, min: 0, precision: 2 }),
        field('salaryMax', '薪资上限', 'decimal', { required: true, min: 0, precision: 2 }),
        field('salaryUnit', '薪资单位', 'enum', { required: true, enum: ['DAY', 'MONTH', 'YEAR'] }),
        field('jd', '岗位职责 JD', 'long_text', { required: true, maxLength: 10000 }),
        field('skillRequirements', '技能要求', 'multi_text', { required: true, minItems: 1, maxItems: 30 }),
        field('majorRequirements', '专业要求', 'multi_text', { required: true, minItems: 1, maxItems: 20 }),
        field('educationRequirement', '学历要求', 'enum', { enum: ['NONE', 'ASSOCIATE', 'BACHELOR', 'MASTER'] }),
        field('applicationDeadline', '申请截止日期', 'date', { required: true }),
        field('headcount', '招聘人数', 'integer', { required: true, min: 1, max: 10000 }),
        field('weeklyAttendanceDays', '每周到岗天数', 'integer', { min: 1, max: 7 }),
        field('internshipMonths', '最短实习月数', 'integer', { min: 1, max: 24 }),
        field('publishStatus', '发布状态', 'enum', {
            required: true,
            enum: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'CLOSED'],
            default: 'DRAFT',
            readonly: true
        }),
        ...workflowTrackingFields(),
        field('recommendationEnabled', '进入推荐池', 'boolean', { readonly: true, default: false }),
        field('reviewOpinion', '审核意见', 'long_text', { readonly: true, maxLength: 2000 }),
        field('reviewedBy', '审核人', 'user', { readonly: true }),
        field('reviewedAt', '审核时间', 'datetime', { readonly: true }),
        field('publishedAt', '发布时间', 'datetime', { readonly: true })
    ],
    detailTables: [approvalDetailTable()],
    relationships: [
        { field: 'companyId', target: 'fit_company', targetField: 'companyId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'hrOwnerUserId', target: 'platform_user', cardinality: 'many-to-one' },
        { field: 'reviewDepartmentCode', target: 'platform_organization', cardinality: 'many-to-one' }
    ],
    indexes: [
        { fields: ['jobId'], unique: true },
        { fields: ['companyId', 'publishStatus'] },
        { fields: ['publishStatus', 'applicationDeadline'] }
    ]
});

const jobApplication = formModel({
    code: 'fit_job_application',
    name: '岗位申请',
    numberField: 'applicationId',
    ownerField: 'studentUserId',
    status: {
        field: 'status',
        initial: 'DRAFT',
        values: ['DRAFT', 'SUBMITTED', 'COMPANY_REVIEW', 'INTERVIEW', 'OFFERED', 'REJECTED', 'RETURNED', 'WITHDRAWN']
    },
    fields: [
        field('applicationId', '岗位申请编号', 'text', { required: true, unique: true, length: 64, readonly: true, serverGenerated: true }),
        field('createCommandId', '创建幂等命令编号', 'text', { required: true, unique: true, readonly: true, length: 128 }),
        field('activeApplicationKey', '活动申请唯一键', 'text', { unique: true, readonly: true, length: 160 }),
        field('studentId', '学生档案', 'reference', { required: true, reference: 'fit_student_profile.studentId', readonly: true, immutableAfterCreate: true, serverDerived: 'currentUser.studentId' }),
        field('studentUserId', '学生用户', 'user', { required: true, readonly: true, immutableAfterCreate: true, serverDerived: 'fit_student_profile.studentUserId' }),
        field('jobId', '申请岗位', 'reference', {
            required: true,
            reference: 'fit_job.jobId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedJob.jobId'
        }),
        field('companyId', '岗位企业', 'reference', { required: true, reference: 'fit_company.companyId', readonly: true, immutableAfterCreate: true, serverDerived: 'fit_job.companyId' }),
        field('resumeId', '投递简历', 'reference', {
            required: true,
            reference: 'fit_resume.resumeId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedResume.resumeId'
        }),
        field('source', '申请来源', 'enum', { required: true, enum: ['RECOMMENDATION', 'MANUAL'], default: 'MANUAL' }),
        field('matchRecordId', '匹配记录编号', 'text', { length: 64 }),
        field('status', '申请状态', 'enum', {
            required: true,
            enum: ['DRAFT', 'SUBMITTED', 'COMPANY_REVIEW', 'INTERVIEW', 'OFFERED', 'REJECTED', 'RETURNED', 'WITHDRAWN'],
            default: 'DRAFT',
            readonly: true
        }),
        field('currentNode', '当前节点', 'text', { readonly: true, required: true }),
        field('currentHandlerRole', '当前处理角色', 'enum', { readonly: true, enum: ROLES }),
        field('currentHandlerId', '当前处理人', 'user', { readonly: true }),
        field('latestOpinion', '最近审批意见', 'long_text', { readonly: true, maxLength: 2000 }),
        field('submittedAt', '提交时间', 'datetime', { readonly: true }),
        field('completedAt', '完成时间', 'datetime', { readonly: true })
    ],
    detailTables: [approvalDetailTable()],
    relationships: [
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'jobId', target: 'fit_job', targetField: 'jobId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'companyId', target: 'fit_company', targetField: 'companyId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'resumeId', target: 'fit_resume', targetField: 'resumeId', cardinality: 'many-to-one', onDelete: 'restrict' }
    ],
    indexes: [
        { fields: ['applicationId'], unique: true },
        { fields: ['createCommandId'], unique: true },
        { fields: ['activeApplicationKey'], unique: true, nullsDistinct: true },
        { fields: ['studentId', 'jobId', 'status'] },
        { fields: ['companyId', 'status'] }
    ],
    constraints: [
        {
            code: 'job_application_active_unique',
            type: 'unique_business_key',
            rule: 'activeApplicationKey 在 DRAFT/SUBMITTED/COMPANY_REVIEW/INTERVIEW/RETURNED/OFFERED 状态保持 studentId:jobId，REJECTED/WITHDRAWN 清空；平台唯一约束原子阻止并发重复申请'
        },
        {
            code: 'job_application_link_consistency',
            type: 'service_invariant',
            sources: [
                {
                    source: 'fit_student_profile',
                    fieldMatches: { studentId: 'studentId', studentUserId: 'studentUserId' }
                },
                {
                    source: 'fit_job',
                    fieldMatches: { jobId: 'jobId', companyId: 'companyId' }
                },
                {
                    source: 'fit_resume',
                    fieldMatches: { resumeId: 'resumeId', studentId: 'studentId' }
                }
            ],
            rule: 'studentId/studentUserId/jobId/companyId/resumeId 必须与关联档案和岗位一致'
        }
    ]
});

const internshipApplication = formModel({
    code: 'fit_internship_application',
    name: '实习申请',
    numberField: 'internshipApplicationId',
    ownerField: 'studentUserId',
    status: {
        field: 'status',
        initial: 'DRAFT',
        values: ['DRAFT', 'COUNSELOR_REVIEW', 'DEPARTMENT_REVIEW', 'COMPANY_CONFIRMATION', 'APPROVED', 'RETURNED', 'REJECTED', 'CANCELLED']
    },
    fields: [
        field('internshipApplicationId', '实习申请编号', 'text', { required: true, unique: true, length: 40, readonly: true, serverGenerated: true }),
        field('jobApplicationId', '岗位申请', 'reference', {
            required: true,
            reference: 'fit_job_application.applicationId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedOfferedJobApplication.applicationId'
        }),
        field('studentId', '学生档案', 'reference', { required: true, reference: 'fit_student_profile.studentId', readonly: true, immutableAfterCreate: true, serverDerived: 'fit_job_application.studentId' }),
        field('studentUserId', '学生用户', 'user', { required: true, readonly: true, immutableAfterCreate: true, serverDerived: 'fit_job_application.studentUserId' }),
        field('jobId', '实习岗位', 'reference', { required: true, reference: 'fit_job.jobId', readonly: true, immutableAfterCreate: true, serverDerived: 'fit_job_application.jobId' }),
        field('companyId', '实习企业', 'reference', { required: true, reference: 'fit_company.companyId', readonly: true, immutableAfterCreate: true, serverDerived: 'fit_job_application.companyId' }),
        field('resumeId', '关联简历', 'reference', { required: true, reference: 'fit_resume.resumeId', readonly: true, immutableAfterCreate: true, serverDerived: 'fit_job_application.resumeId' }),
        field('internshipStartDate', '实习开始日期', 'date', { required: true }),
        field('internshipEndDate', '实习结束日期', 'date', { required: true }),
        field('weeklyAttendanceDays', '每周到岗天数', 'integer', { required: true, min: 1, max: 7 }),
        field('workCity', '工作城市', 'text', { required: true, length: 64 }),
        field('workAddress', '工作地址', 'text', { length: 256 }),
        field('companySupervisorName', '企业导师', 'text', { length: 64 }),
        field('companySupervisorContact', '企业导师联系方式', 'text', { sensitivity: 'BUSINESS_CONTACT', masked: true }),
        field('agreementAttachment', '实习协议', 'attachment'),
        field('safetyCommitmentAccepted', '安全承诺确认', 'boolean', { required: true, default: false }),
        field('status', '审批状态', 'enum', {
            required: true,
            enum: ['DRAFT', 'COUNSELOR_REVIEW', 'DEPARTMENT_REVIEW', 'COMPANY_CONFIRMATION', 'APPROVED', 'RETURNED', 'REJECTED', 'CANCELLED'],
            default: 'DRAFT',
            readonly: true
        }),
        field('currentNode', '当前节点', 'text', { readonly: true, required: true }),
        field('currentHandlerRole', '当前处理角色', 'enum', { readonly: true, enum: ROLES }),
        field('currentHandlerId', '当前处理人', 'user', { readonly: true }),
        field('latestOpinion', '最近审批意见', 'long_text', { readonly: true, maxLength: 2000 }),
        field('returnedFromNode', '退回来源节点', 'text', { readonly: true }),
        field('submittedAt', '提交时间', 'datetime', { readonly: true }),
        field('approvedAt', '通过时间', 'datetime', { readonly: true })
    ],
    detailTables: [approvalDetailTable()],
    relationships: [
        { field: 'jobApplicationId', target: 'fit_job_application', targetField: 'applicationId', cardinality: 'one-to-one', onDelete: 'restrict' },
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'jobId', target: 'fit_job', targetField: 'jobId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'companyId', target: 'fit_company', targetField: 'companyId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'resumeId', target: 'fit_resume', targetField: 'resumeId', cardinality: 'many-to-one', onDelete: 'restrict' }
    ],
    indexes: [
        { fields: ['internshipApplicationId'], unique: true },
        { fields: ['jobApplicationId'], unique: true },
        { fields: ['studentId', 'status'] },
        { fields: ['companyId', 'status'] }
    ],
    constraints: [
        {
            code: 'internship_job_application_consistency',
            type: 'service_invariant',
            source: 'fit_job_application',
            requiredSourceStatus: { field: 'status', value: 'OFFERED' },
            fieldMatches: {
                jobApplicationId: 'applicationId',
                studentId: 'studentId',
                studentUserId: 'studentUserId',
                jobId: 'jobId',
                companyId: 'companyId',
                resumeId: 'resumeId'
            },
            rule: '提交前必须存在同一学生、岗位、企业、简历且 status == OFFERED 的岗位申请'
        }
    ]
});

const internshipLog = formModel({
    code: 'fit_internship_log',
    name: '实习日志',
    numberField: 'logId',
    ownerField: 'studentUserId',
    status: {
        field: 'status',
        initial: 'DRAFT',
        values: ['DRAFT', 'SUBMITTED', 'REVIEWED', 'RETURNED']
    },
    fields: [
        field('logId', '日志编号', 'text', { required: true, unique: true, length: 40 }),
        field('internshipApplicationId', '实习申请', 'reference', {
            required: true,
            reference: 'fit_internship_application.internshipApplicationId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedInternshipApplication.internshipApplicationId'
        }),
        field('studentId', '学生档案', 'reference', {
            required: true,
            reference: 'fit_student_profile.studentId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'fit_internship_application.studentId'
        }),
        field('studentUserId', '学生用户', 'user', {
            required: true,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'fit_internship_application.studentUserId'
        }),
        field('companyId', '实习企业', 'reference', { required: true, reference: 'fit_company.companyId', readonly: true, immutableAfterCreate: true, serverDerived: 'fit_internship_application.companyId' }),
        field('logDate', '日志日期', 'date', { required: true }),
        field('hours', '实习工时', 'decimal', { required: true, min: 0, max: 24, precision: 1 }),
        field('workContent', '工作内容', 'long_text', { required: true, maxLength: 5000 }),
        field('learningSummary', '学习总结', 'long_text', { required: true, maxLength: 3000 }),
        field('problems', '问题与支持需求', 'long_text', { maxLength: 3000 }),
        field('riskLevel', '风险等级', 'enum', { required: true, enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH'], default: 'NONE' }),
        field('attachments', '日志附件', 'multi_attachment'),
        field('status', '日志状态', 'enum', { required: true, enum: ['DRAFT', 'SUBMITTED', 'REVIEWED', 'RETURNED'], default: 'DRAFT', readonly: true }),
        field('counselorComment', '辅导员意见', 'long_text', { readonly: true, maxLength: 2000 })
    ],
    relationships: [
        { field: 'internshipApplicationId', target: 'fit_internship_application', targetField: 'internshipApplicationId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'companyId', target: 'fit_company', targetField: 'companyId', cardinality: 'many-to-one', onDelete: 'restrict' }
    ],
    indexes: [
        { fields: ['logId'], unique: true },
        { fields: ['internshipApplicationId', 'logDate'], unique: true }
    ],
    constraints: [
        {
            code: 'internship_log_parent_consistency',
            type: 'service_invariant',
            source: 'fit_internship_application',
            fieldMatches: {
                internshipApplicationId: 'internshipApplicationId',
                studentId: 'studentId',
                studentUserId: 'studentUserId',
                companyId: 'companyId'
            },
            rule: '父实习申请必须属于当前学生；internshipApplicationId/studentId/studentUserId/companyId 全部由服务端加载父单据后写入并保持一致'
        }
    ]
});

const tripartiteReview = formModel({
    code: 'fit_tripartite_review',
    name: '三方评价',
    numberField: 'reviewId',
    ownerField: 'studentUserId',
    status: {
        field: 'status',
        initial: 'DRAFT',
        values: ['DRAFT', 'COLLECTING', 'COMPLETED', 'ARCHIVED']
    },
    fields: [
        field('reviewId', '评价编号', 'text', { required: true, unique: true, length: 40 }),
        field('internshipApplicationId', '实习申请', 'reference', {
            required: true,
            reference: 'fit_internship_application.internshipApplicationId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'authorizedInternshipApplication.internshipApplicationId'
        }),
        field('studentId', '学生档案', 'reference', {
            required: true,
            reference: 'fit_student_profile.studentId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'fit_internship_application.studentId'
        }),
        field('studentUserId', '学生用户', 'user', {
            required: true,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'fit_internship_application.studentUserId'
        }),
        field('companyId', '实习企业', 'reference', {
            required: true,
            reference: 'fit_company.companyId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'fit_internship_application.companyId'
        }),
        field('reviewPeriod', '评价周期', 'text', { required: true, length: 64 }),
        field('studentSelfScore', '学生自评分', 'integer', { min: 0, max: 100 }),
        field('studentComment', '学生总结', 'long_text', { maxLength: 3000 }),
        field('companyScore', '企业评分', 'integer', { min: 0, max: 100 }),
        field('companyComment', '企业评价', 'long_text', { maxLength: 3000 }),
        field('companyEvaluatorId', '企业评价人', 'user'),
        field('counselorScore', '辅导员评分', 'integer', { min: 0, max: 100 }),
        field('counselorComment', '辅导员评价', 'long_text', { maxLength: 3000 }),
        field('counselorEvaluatorId', '辅导员评价人', 'user'),
        field('finalScore', '综合评分', 'decimal', { readonly: true, min: 0, max: 100, precision: 1 }),
        field('conclusion', '评价结论', 'enum', { enum: ['EXCELLENT', 'QUALIFIED', 'NEEDS_IMPROVEMENT', 'UNQUALIFIED'] }),
        field('status', '评价状态', 'enum', { required: true, enum: ['DRAFT', 'COLLECTING', 'COMPLETED', 'ARCHIVED'], default: 'DRAFT', readonly: true })
    ],
    relationships: [
        { field: 'internshipApplicationId', target: 'fit_internship_application', targetField: 'internshipApplicationId', cardinality: 'one-to-one', onDelete: 'restrict' },
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'many-to-one', onDelete: 'restrict' },
        { field: 'companyId', target: 'fit_company', targetField: 'companyId', cardinality: 'many-to-one', onDelete: 'restrict' }
    ],
    indexes: [
        { fields: ['reviewId'], unique: true },
        { fields: ['internshipApplicationId'], unique: true }
    ],
    constraints: [
        {
            code: 'tripartite_review_parent_consistency',
            type: 'service_invariant',
            source: 'fit_internship_application',
            fieldMatches: {
                internshipApplicationId: 'internshipApplicationId',
                studentId: 'studentId',
                studentUserId: 'studentUserId',
                companyId: 'companyId'
            },
            rule: '父实习申请必须属于当前学生；internshipApplicationId/studentId/studentUserId/companyId 全部由服务端加载父单据后写入并保持一致'
        }
    ]
});

const employmentDestination = formModel({
    code: 'fit_employment_destination',
    name: '就业去向',
    numberField: 'destinationId',
    ownerField: 'studentUserId',
    status: {
        field: 'verificationStatus',
        initial: 'DRAFT',
        values: ['DRAFT', 'PENDING', 'VERIFIED', 'RETURNED']
    },
    fields: [
        field('destinationId', '去向编号', 'text', { required: true, unique: true, length: 40 }),
        field('studentId', '学生档案', 'reference', {
            required: true,
            reference: 'fit_student_profile.studentId',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'currentUser.studentProfile.studentId'
        }),
        field('studentUserId', '学生用户', 'user', {
            required: true,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'currentUser.id'
        }),
        field('destinationType', '去向类型', 'enum', {
            required: true,
            enum: ['EMPLOYMENT', 'FURTHER_STUDY', 'ENTREPRENEURSHIP', 'FLEXIBLE', 'UNEMPLOYED', 'OTHER']
        }),
        field('companyId', '就业企业', 'reference', { reference: 'fit_company.companyId' }),
        field('companyName', '单位名称', 'text', { length: 256 }),
        field('jobTitle', '岗位名称', 'text', { length: 128 }),
        field('industry', '所属行业', 'text', { length: 128 }),
        field('city', '就业城市', 'text', { length: 64 }),
        field('salaryRange', '薪资区间', 'enum', { enum: ['LT_3K', '3K_5K', '5K_8K', '8K_12K', 'GE_12K', 'NOT_APPLICABLE'] }),
        field('contractType', '签约类型', 'enum', { enum: ['TRIPARTITE', 'LABOR_CONTRACT', 'OFFER', 'OTHER'] }),
        field('startDate', '入职/入学日期', 'date'),
        field('proofAttachment', '证明材料', 'attachment', { sensitivity: 'PERSONAL' }),
        field('verificationStatus', '核验状态', 'enum', { required: true, enum: ['DRAFT', 'PENDING', 'VERIFIED', 'RETURNED'], default: 'DRAFT', readonly: true }),
        field('verifierId', '核验人', 'user', { readonly: true }),
        field('verificationOpinion', '核验意见', 'long_text', { readonly: true, maxLength: 2000 })
    ],
    relationships: [
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'one-to-one', onDelete: 'restrict' },
        { field: 'companyId', target: 'fit_company', targetField: 'companyId', cardinality: 'many-to-one', onDelete: 'set-null' }
    ],
    indexes: [
        { fields: ['destinationId'], unique: true },
        { fields: ['studentId'], unique: true },
        { fields: ['verificationStatus', 'destinationType'] }
    ],
    constraints: [
        {
            code: 'employment_destination_student_identity_consistency',
            type: 'service_invariant',
            source: 'fit_student_profile',
            fieldMatches: {
                studentId: 'studentId',
                studentUserId: 'studentUserId'
            },
            rule: 'studentId/studentUserId 必须由服务端从当前登录学生档案派生并匹配同一学生，禁止客户端覆盖'
        }
    ]
});

const policy = formModel({
    code: 'fit_policy',
    name: '政策条目',
    numberField: 'policyId',
    ownerField: 'createdBy',
    status: {
        field: 'status',
        initial: 'DRAFT',
        values: ['DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED']
    },
    fields: [
        field('policyId', '政策编号', 'text', { required: true, unique: true, length: 40 }),
        field('ownerDepartmentCode', '维护院系', 'organization', { required: true }),
        field('title', '政策标题', 'text', { required: true, length: 256 }),
        field('regionCode', '地区编码', 'text', { required: true, length: 64 }),
        field('regionName', '适用地区', 'text', { required: true, length: 128 }),
        field('audienceTags', '适用人群', 'multi_text', { required: true, minItems: 1, maxItems: 20 }),
        field('keywords', '关键词', 'multi_text', { required: true, minItems: 1, maxItems: 30 }),
        field('summary', '政策摘要', 'long_text', { required: true, maxLength: 3000 }),
        field('content', '政策正文', 'rich_text', { required: true }),
        field('sourceUrl', '来源地址', 'url', { required: true }),
        field('issuer', '发布机构', 'text', { required: true, length: 256 }),
        field('publishedAt', '发布日期', 'date', { required: true }),
        field('effectiveFrom', '生效日期', 'date'),
        field('effectiveTo', '失效日期', 'date'),
        field('status', '发布状态', 'enum', { required: true, enum: ['DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED'], default: 'DRAFT', readonly: true }),
        field('knowledgeBaseId', '知识库编号', 'text', { length: 64 }),
        field('vectorSyncStatus', '向量同步状态', 'enum', { enum: ['NOT_SYNCED', 'QUEUED', 'SYNCED', 'FAILED'], default: 'NOT_SYNCED' })
    ],
    relationships: [
        { field: 'ownerDepartmentCode', target: 'platform_organization', cardinality: 'many-to-one' }
    ],
    indexes: [
        { fields: ['policyId'], unique: true },
        { fields: ['regionCode', 'status'] },
        { fields: ['effectiveFrom', 'effectiveTo'] }
    ]
});

const aiCallLog = formModel({
    code: 'fit_ai_call_log',
    name: 'AI 调用日志',
    numberField: 'callId',
    ownerField: 'operatorUserId',
    uiModes: ['VIEW'],
    status: {
        field: 'status',
        initial: 'QUEUED',
        values: ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED']
    },
    fields: [
        field('callId', '调用编号', 'text', { required: true, unique: true, length: 64 }),
        field('studentId', '关联学生', 'reference', {
            reference: 'fit_student_profile.studentId',
            sensitivity: 'PERSONAL',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'sourceBusinessRecord.studentId'
        }),
        field('studentUserId', '关联学生用户', 'user', {
            sensitivity: 'PERSONAL',
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'sourceBusinessRecord.studentUserId'
        }),
        field('businessType', '业务类型', 'enum', { required: true, enum: ['RESUME_DIAGNOSIS', 'JOB_MATCH_EXPLANATION', 'INTERVIEW', 'POLICY_QA', 'EMPLOYMENT_ANALYSIS'] }),
        field('businessId', '业务单据编号', 'text', {
            required: true,
            length: 64,
            readonly: true,
            immutableAfterCreate: true,
            serverDerived: 'sourceBusinessRecord.businessId'
        }),
        field('agentCode', 'Agent 编码', 'text', { required: true, length: 64 }),
        field('modelCode', '模型编码', 'text', { required: true, length: 128 }),
        field('requestHash', '请求摘要哈希', 'text', { required: true, length: 128 }),
        field('inputSummary', '输入摘要（脱敏）', 'long_text', { required: true, maxLength: 5000 }),
        field('outputSummary', '输出摘要（脱敏）', 'long_text', { maxLength: 10000 }),
        field('resultJson', '结构化结果', 'json', { sensitivity: 'PERSONAL' }),
        field('status', '调用状态', 'enum', { required: true, enum: ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'], default: 'QUEUED', readonly: true }),
        field('latencyMs', '耗时毫秒', 'long', { min: 0 }),
        field('inputTokens', '输入 Token', 'integer', { min: 0 }),
        field('outputTokens', '输出 Token', 'integer', { min: 0 }),
        field('errorCode', '错误码', 'text', { length: 128 }),
        field('errorMessage', '错误摘要', 'long_text', { maxLength: 3000 }),
        field('traceId', '链路追踪编号', 'text', { required: true, length: 128 }),
        field('operatorUserId', '调用用户', 'user', { required: true }),
        field('calledAt', '调用时间', 'datetime', { required: true }),
        field('verifiedBy', '复核人', 'user'),
        field('verifiedAt', '复核时间', 'datetime')
    ],
    relationships: [
        { field: 'studentId', target: 'fit_student_profile', targetField: 'studentId', cardinality: 'many-to-one', onDelete: 'set-null' }
    ],
    indexes: [
        { fields: ['callId'], unique: true },
        { fields: ['businessType', 'businessId'] },
        { fields: ['traceId'] },
        { fields: ['status', 'calledAt'] }
    ],
    constraints: [
        {
            code: 'ai_call_log_business_owner_consistency',
            type: 'service_invariant',
            source: 'sourceBusinessRecord',
            fieldMatches: {
                businessId: 'businessId',
                studentId: 'studentId',
                studentUserId: 'studentUserId'
            },
            rule: 'businessId/studentId/studentUserId 必须由服务端从本次 AI 调用的授权业务单据派生，学生只能读取归属自己的结果摘要'
        }
    ]
});

export const modelCatalog = {
    schemaVersion: '2.0.0',
    appCode: 'fitjob',
    platform: 'Kingdee AI Cangqiong low-code blueprint',
    roles: ROLES,
    javaTypeMap: {
        long: 'Long',
        integer: 'Integer',
        decimal: 'BigDecimal',
        boolean: 'Boolean',
        text: 'String',
        long_text: 'String',
        rich_text: 'String',
        multi_text: 'List<String>',
        json: 'JsonNode',
        date: 'LocalDate',
        datetime: 'OffsetDateTime',
        user: 'String',
        organization: 'String',
        reference: 'String',
        enum: 'String',
        phone: 'String',
        email: 'String',
        url: 'String',
        attachment: 'String',
        multi_attachment: 'List<String>'
    },
    serviceBindings: [
        {
            code: 'fit_resume_diagnose',
            label: '简历诊断',
            inputs: ['fit_student_profile.studentId', 'fit_resume.resumeId', 'fit_job.jobId'],
            writes: ['fit_resume.diagnosisStatus', 'fit_resume.diagnosisReportId', 'fit_resume.diagnosisScore', 'fit_ai_call_log.callId']
        },
        {
            code: 'fit_job_match_service',
            label: '岗位匹配与推荐',
            inputs: ['fit_student_profile.studentId', 'fit_resume.resumeId', 'fit_job.jobId'],
            filter: 'fit_job.publishStatus == PUBLISHED && fit_job.recommendationEnabled == true',
            writes: ['fit_ai_call_log.callId']
        },
        {
            code: 'fit_job_apply',
            label: '一键申请',
            inputs: ['fit_student_profile.studentId', 'fit_resume.resumeId', 'fit_job.jobId'],
            workflow: 'fit_job_application_flow',
            creates: 'fit_job_application'
        }
    ],
    models: [
        studentProfile,
        resume,
        company,
        job,
        jobApplication,
        internshipApplication,
        internshipLog,
        tripartiteReview,
        employmentDestination,
        policy,
        aiCallLog
    ]
};

export function getModel(modelCode) {
    return modelCatalog.models.find((model) => model.code === modelCode);
}
