function transition({
    action,
    label,
    from,
    to,
    roles,
    permissionAction = action.toLowerCase(),
    permissionActionByRole = {},
    permissionButtons = [action],
    ...options
}) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return {
        action,
        label,
        from: Array.isArray(from) ? from : [from],
        to,
        roles: allowedRoles,
        permission: {
            action: permissionAction,
            actionByRole: permissionActionByRole,
            buttons: Array.isArray(permissionButtons) ? permissionButtons : [permissionButtons]
        },
        commentRequired: false,
        requiredFields: [],
        requiredEquals: {},
        linkedRecordRequirements: [],
        handlerOverrideRoles: [],
        handlerOverrideActorField: null,
        ...options
    };
}

export const workflows = [
    {
        code: 'fit_company_review',
        name: '企业信息审核',
        model: 'fit_company',
        statusField: 'reviewStatus',
        initialStatus: 'DRAFT',
        terminalStatuses: ['DISABLED'],
        nodes: {
            DRAFT: { label: '企业编辑', handlerRole: 'COMPANY_HR', handlerResolver: 'record.hrOwnerUserId' },
            PENDING_REVIEW: { label: '辅导员/院系审核', handlerRole: ['COUNSELOR', 'DEPARTMENT_ADMIN'], handlerResolver: 'department.companyReviewer' },
            APPROVED: { label: '已通过', handlerRole: null, handlerResolver: null },
            REJECTED: { label: '退回企业修改', handlerRole: 'COMPANY_HR', handlerResolver: 'record.hrOwnerUserId' },
            DISABLED: { label: '已停用', handlerRole: null, handlerResolver: null }
        },
        transitions: [
            transition({ action: 'SUBMIT_REVIEW', label: '提交审核', from: ['DRAFT', 'REJECTED'], to: 'PENDING_REVIEW', roles: 'COMPANY_HR', permissionAction: 'submit', requiredFields: ['companyName', 'industry', 'city', 'description'] }),
            transition({ action: 'APPROVE', label: '审核通过', from: 'PENDING_REVIEW', to: 'APPROVED', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'], permissionAction: 'review', sideEffects: ['reviewOpinion=opinion', 'reviewedBy=actorId', 'reviewedAt=now'] }),
            transition({ action: 'RETURN', label: '退回修改', from: 'PENDING_REVIEW', to: 'REJECTED', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'], commentRequired: true, sideEffects: ['reviewOpinion=opinion', 'reviewedBy=actorId', 'reviewedAt=now'] }),
            transition({ action: 'DISABLE', label: '停用企业', from: 'APPROVED', to: 'DISABLED', roles: 'DEPARTMENT_ADMIN', commentRequired: true, sideEffects: ['reviewOpinion=opinion', 'reviewedBy=actorId', 'reviewedAt=now'] })
        ]
    },
    {
        code: 'fit_job_publish_review',
        name: '岗位发布审核',
        model: 'fit_job',
        statusField: 'publishStatus',
        initialStatus: 'DRAFT',
        terminalStatuses: ['CLOSED'],
        nodes: {
            DRAFT: { label: '企业编辑', handlerRole: 'COMPANY_HR', handlerResolver: 'record.hrOwnerUserId' },
            PENDING_REVIEW: { label: '岗位审核', handlerRole: ['COUNSELOR', 'DEPARTMENT_ADMIN'], handlerResolver: 'department.jobReviewer' },
            PUBLISHED: { label: '已发布', handlerRole: 'COMPANY_HR', handlerResolver: 'record.hrOwnerUserId' },
            REJECTED: { label: '退回企业修改', handlerRole: 'COMPANY_HR', handlerResolver: 'record.hrOwnerUserId' },
            CLOSED: { label: '已关闭', handlerRole: null, handlerResolver: null }
        },
        transitions: [
            transition({
                action: 'SUBMIT_REVIEW',
                label: '提交发布审核',
                from: ['DRAFT', 'REJECTED'],
                to: 'PENDING_REVIEW',
                roles: 'COMPANY_HR',
                permissionAction: 'submit',
                requiredFields: ['companyId', 'title', 'jobType', 'city', 'salaryMin', 'salaryMax', 'salaryUnit', 'jd', 'skillRequirements', 'majorRequirements', 'applicationDeadline', 'headcount']
            }),
            transition({ action: 'APPROVE_PUBLISH', label: '审核并发布', from: 'PENDING_REVIEW', to: 'PUBLISHED', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'], permissionAction: 'publish', sideEffects: ['recommendationEnabled=true', 'publishedAt=now', 'reviewOpinion=opinion', 'reviewedBy=actorId', 'reviewedAt=now'] }),
            transition({ action: 'RETURN', label: '退回修改', from: 'PENDING_REVIEW', to: 'REJECTED', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'], commentRequired: true, sideEffects: ['reviewOpinion=opinion', 'reviewedBy=actorId', 'reviewedAt=now'] }),
            transition({ action: 'CLOSE', label: '关闭岗位', from: 'PUBLISHED', to: 'CLOSED', roles: ['COMPANY_HR', 'DEPARTMENT_ADMIN'], handlerOverrideRoles: ['DEPARTMENT_ADMIN'], commentRequired: true, sideEffects: ['recommendationEnabled=false', 'reviewOpinion=opinion', 'reviewedBy=actorId', 'reviewedAt=now'] })
        ]
    },
    {
        code: 'fit_job_application_flow',
        name: '岗位申请流程',
        model: 'fit_job_application',
        statusField: 'status',
        initialStatus: 'DRAFT',
        terminalStatuses: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
        idempotency: {
            commandField: 'createCommandId',
            createCommandField: 'createCommandId',
            transitionCommandField: 'approvalRecords.commandId',
            activeUniqueField: 'activeApplicationKey',
            activeUniqueSource: ['studentId', 'jobId'],
            nonReapplyableStatuses: ['DRAFT', 'SUBMITTED', 'COMPANY_REVIEW', 'INTERVIEW', 'RETURNED', 'OFFERED']
        },
        nodes: {
            DRAFT: { label: '申请草稿', handlerRole: 'STUDENT', handlerResolver: 'record.studentUserId' },
            SUBMITTED: { label: '辅导员审核', handlerRole: 'COUNSELOR', handlerResolver: 'student.counselorUserId' },
            COMPANY_REVIEW: { label: '企业筛选', handlerRole: 'COMPANY_HR', handlerResolver: 'company.hrOwnerUserId' },
            INTERVIEW: { label: '企业面试', handlerRole: 'COMPANY_HR', handlerResolver: 'company.hrOwnerUserId' },
            OFFERED: { label: '已录用', handlerRole: null, handlerResolver: null },
            REJECTED: { label: '未通过', handlerRole: null, handlerResolver: null },
            RETURNED: { label: '退回学生修改', handlerRole: 'STUDENT', handlerResolver: 'record.studentUserId' },
            WITHDRAWN: { label: '学生已撤回', handlerRole: null, handlerResolver: null }
        },
        transitions: [
            transition({
                action: 'SUBMIT',
                label: '一键申请',
                from: ['DRAFT', 'RETURNED'],
                to: 'SUBMITTED',
                roles: 'STUDENT',
                permissionButtons: ['SUBMIT', 'RESUBMIT'],
                requiredFields: ['createCommandId', 'studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId'],
                sideEffects: ['submittedAt=now', 'activeApplicationKey=applicationKey']
            }),
            transition({ action: 'COUNSELOR_APPROVE', label: '辅导员通过', from: 'SUBMITTED', to: 'COMPANY_REVIEW', roles: 'COUNSELOR', permissionAction: 'approve' }),
            transition({ action: 'RETURN', label: '退回学生', from: 'SUBMITTED', to: 'RETURNED', roles: ['COUNSELOR', 'DEPARTMENT_ADMIN'], permissionActionByRole: { DEPARTMENT_ADMIN: 'override_return' }, handlerOverrideRoles: ['DEPARTMENT_ADMIN'], commentRequired: true }),
            transition({ action: 'INVITE_INTERVIEW', label: '邀请面试', from: 'COMPANY_REVIEW', to: 'INTERVIEW', roles: 'COMPANY_HR' }),
            transition({ action: 'OFFER', label: '发放录用', from: ['COMPANY_REVIEW', 'INTERVIEW'], to: 'OFFERED', roles: 'COMPANY_HR', commentRequired: true, sideEffects: ['completedAt=now'] }),
            transition({ action: 'REJECT', label: '不通过', from: ['COMPANY_REVIEW', 'INTERVIEW'], to: 'REJECTED', roles: 'COMPANY_HR', commentRequired: true, sideEffects: ['completedAt=now', 'activeApplicationKey=null'] }),
            transition({ action: 'WITHDRAW', label: '撤回申请', from: ['DRAFT', 'SUBMITTED', 'RETURNED', 'COMPANY_REVIEW', 'INTERVIEW'], to: 'WITHDRAWN', roles: 'STUDENT', handlerOverrideRoles: ['STUDENT'], handlerOverrideActorField: 'studentUserId', sideEffects: ['completedAt=now', 'activeApplicationKey=null'] })
        ]
    },
    {
        code: 'fit_internship_approval',
        name: '实习申请审批',
        model: 'fit_internship_application',
        statusField: 'status',
        initialStatus: 'DRAFT',
        terminalStatuses: ['APPROVED', 'REJECTED', 'CANCELLED'],
        nodes: {
            DRAFT: { label: '学生填写', handlerRole: 'STUDENT', handlerResolver: 'record.studentUserId' },
            COUNSELOR_REVIEW: { label: '辅导员审核', handlerRole: 'COUNSELOR', handlerResolver: 'student.counselorUserId' },
            DEPARTMENT_REVIEW: { label: '院系审核', handlerRole: 'DEPARTMENT_ADMIN', handlerResolver: 'student.collegeCode.departmentApprover' },
            COMPANY_CONFIRMATION: { label: '企业确认', handlerRole: 'COMPANY_HR', handlerResolver: 'company.hrOwnerUserId' },
            APPROVED: { label: '审批完成', handlerRole: null, handlerResolver: null },
            RETURNED: { label: '退回学生修改', handlerRole: 'STUDENT', handlerResolver: 'record.studentUserId' },
            REJECTED: { label: '审批拒绝', handlerRole: null, handlerResolver: null },
            CANCELLED: { label: '学生取消', handlerRole: null, handlerResolver: null }
        },
        transitions: [
            transition({
                action: 'SUBMIT',
                label: '学生提交',
                from: ['DRAFT', 'RETURNED'],
                to: 'COUNSELOR_REVIEW',
                roles: 'STUDENT',
                permissionButtons: ['SUBMIT', 'RESUBMIT'],
                requiredFields: ['jobApplicationId', 'studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId', 'internshipStartDate', 'internshipEndDate', 'weeklyAttendanceDays', 'workCity', 'safetyCommitmentAccepted'],
                requiredEquals: { safetyCommitmentAccepted: true },
                linkedRecordRequirements: [
                    {
                        contextKey: 'jobApplication',
                        statusField: 'status',
                        requiredStatus: 'OFFERED',
                        fieldMatches: {
                            jobApplicationId: 'applicationId',
                            studentId: 'studentId',
                            studentUserId: 'studentUserId',
                            jobId: 'jobId',
                            companyId: 'companyId',
                            resumeId: 'resumeId'
                        }
                    }
                ],
                sideEffects: ['submittedAt=now']
            }),
            transition({ action: 'COUNSELOR_APPROVE', label: '辅导员通过', from: 'COUNSELOR_REVIEW', to: 'DEPARTMENT_REVIEW', roles: 'COUNSELOR', permissionAction: 'approve', permissionButtons: 'APPROVE' }),
            transition({ action: 'DEPARTMENT_APPROVE', label: '院系通过', from: 'DEPARTMENT_REVIEW', to: 'COMPANY_CONFIRMATION', roles: 'DEPARTMENT_ADMIN', permissionAction: 'approve', permissionButtons: 'APPROVE' }),
            transition({ action: 'COMPANY_CONFIRM', label: '企业确认', from: 'COMPANY_CONFIRMATION', to: 'APPROVED', roles: 'COMPANY_HR', permissionAction: 'confirm', permissionButtons: 'CONFIRM', commentRequired: true, sideEffects: ['approvedAt=now'] }),
            transition({ action: 'RETURN', label: '辅导员退回学生修改', from: 'COUNSELOR_REVIEW', to: 'RETURNED', roles: 'COUNSELOR', commentRequired: true, sideEffects: ['returnedFromNode=fromStatus'] }),
            transition({ action: 'RETURN', label: '院系退回学生修改', from: 'DEPARTMENT_REVIEW', to: 'RETURNED', roles: 'DEPARTMENT_ADMIN', commentRequired: true, sideEffects: ['returnedFromNode=fromStatus'] }),
            transition({ action: 'RETURN', label: '企业退回学生修改', from: 'COMPANY_CONFIRMATION', to: 'RETURNED', roles: 'COMPANY_HR', commentRequired: true, sideEffects: ['returnedFromNode=fromStatus'] }),
            transition({ action: 'REJECT', label: '辅导员拒绝申请', from: 'COUNSELOR_REVIEW', to: 'REJECTED', roles: 'COUNSELOR', commentRequired: true }),
            transition({ action: 'REJECT', label: '院系拒绝申请', from: 'DEPARTMENT_REVIEW', to: 'REJECTED', roles: 'DEPARTMENT_ADMIN', commentRequired: true }),
            transition({ action: 'REJECT', label: '企业拒绝申请', from: 'COMPANY_CONFIRMATION', to: 'REJECTED', roles: 'COMPANY_HR', commentRequired: true }),
            transition({ action: 'CANCEL', label: '取消申请', from: ['DRAFT', 'COUNSELOR_REVIEW', 'DEPARTMENT_REVIEW', 'COMPANY_CONFIRMATION', 'RETURNED'], to: 'CANCELLED', roles: 'STUDENT', handlerOverrideRoles: ['STUDENT'], handlerOverrideActorField: 'studentUserId', commentRequired: true })
        ]
    }
];

export function getWorkflow(workflowCode) {
    return workflows.find((workflow) => workflow.code === workflowCode);
}
