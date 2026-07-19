import { jobApplications, studentProfile } from './demoData.js';

const NON_REAPPLYABLE_STATUSES = new Set(['DRAFT', 'SUBMITTED', 'COMPANY_REVIEW', 'INTERVIEW', 'RETURNED', 'OFFERED']);
const MAX_COMMAND_ID_LENGTH = 128;
const demoApplications = new Map();
let commandSequence = 0;

function applicationKey(application) {
    return `${application.studentId}:${application.jobId}`;
}

function seedDemoApplications(records = jobApplications) {
    records.filter((record) => NON_REAPPLYABLE_STATUSES.has(record.status)).forEach((record) => {
        demoApplications.set(applicationKey(record), { ...record, mode: 'STANDALONE_DEMO' });
    });
}

function nextDemoApplicationId() {
    const usedIds = new Set([
        ...jobApplications.map((record) => record.applicationId),
        ...[...demoApplications.values()].map((record) => record.applicationId)
    ]);
    let sequence = 1;
    while (usedIds.has(`JOB-APP-DEMO-${String(sequence).padStart(3, '0')}`)) {
        sequence += 1;
    }
    return `JOB-APP-DEMO-${String(sequence).padStart(3, '0')}`;
}

function nextCommandToken() {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }
    commandSequence += 1;
    return `${Date.now().toString(36)}-${commandSequence.toString(36)}`;
}

function resolveCommandIds(payload) {
    ['commandId', 'createCommandId', 'submitCommandId'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field)
            && (typeof payload[field] !== 'string' || !payload[field].trim())) {
            throw new Error(`${field} must be a non-empty string`);
        }
        if (typeof payload[field] === 'string' && payload[field].length > MAX_COMMAND_ID_LENGTH) {
            throw new Error(`${field} cannot exceed ${MAX_COMMAND_ID_LENGTH} characters`);
        }
    });
    const operationToken = nextCommandToken();
    const createCommandId = payload.createCommandId
        || payload.commandId
        || `JOB_CREATE:${operationToken}`;
    const submitCommandId = payload.submitCommandId
        || (payload.commandId ? `${payload.commandId}:SUBMIT` : `JOB_SUBMIT:${operationToken}`);
    if (createCommandId.length > MAX_COMMAND_ID_LENGTH || submitCommandId.length > MAX_COMMAND_ID_LENGTH) {
        throw new Error(`createCommandId and submitCommandId cannot exceed ${MAX_COMMAND_ID_LENGTH} characters`);
    }
    if (createCommandId === submitCommandId) {
        throw new Error('createCommandId and submitCommandId must identify different operations');
    }
    return { createCommandId, submitCommandId };
}

function demoApprovalRecord(payload, fromStatus, submitCommandId, operatedAt) {
    return {
        recordId: `FLOW-DEMO-${nextCommandToken()}`,
        commandId: submitCommandId,
        nodeCode: fromStatus,
        actorRole: 'STUDENT',
        actorId: payload.studentUserId,
        action: 'SUBMIT',
        opinion: '从岗位推荐一键申请。',
        fromStatus,
        toStatus: 'SUBMITTED',
        operatedAt
    };
}

function assertApplicationResponse(response) {
    if (!response?.applicationId || !response?.status) {
        throw new Error('岗位申请服务未返回 applicationId/status');
    }
    return response;
}

function notifyHost(record) {
    if (typeof globalThis.dispatchEvent !== 'function' || typeof globalThis.CustomEvent !== 'function') {
        return;
    }
    globalThis.dispatchEvent(new globalThis.CustomEvent('fitjob:job-application-submitted', {
        detail: record
    }));
}

export async function submitJobApplication(payload, options = {}) {
    ['studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId'].forEach((field) => {
        if (!payload[field]) {
            throw new Error(`岗位申请缺少必填字段：${field}`);
        }
    });

    const hasPlatformOverride = Object.prototype.hasOwnProperty.call(options, 'platformApi');
    const platformApi = hasPlatformOverride
        ? options.platformApi
        : globalThis.fitJobPlatform;
    const { createCommandId, submitCommandId } = resolveCommandIds(payload);
    const request = {
        ...payload,
        commandId: createCommandId,
        createCommandId,
        submitCommandId
    };
    if (typeof platformApi?.submitJobApplication === 'function') {
        const response = assertApplicationResponse(await platformApi.submitJobApplication(request));
        notifyHost(response);
        return response;
    }

    const allowDemoFallback = Object.prototype.hasOwnProperty.call(options, 'allowDemoFallback')
        ? options.allowDemoFallback
        : globalThis.__FIT_JOB_STANDALONE__ === true;
    if (!allowDemoFallback) {
        throw new Error('苍穹岗位申请服务未就绪，已阻止本地伪提交');
    }

    const idempotencyKey = applicationKey(payload);
    const existing = demoApplications.get(idempotencyKey);
    if (existing) {
        if (existing.studentUserId !== payload.studentUserId
            || existing.companyId !== payload.companyId
            || existing.resumeId !== payload.resumeId) {
            throw new Error('现有岗位申请与当前学生、企业或简历不一致');
        }
        const approvalRecords = existing.approvalRecords || [];
        if (approvalRecords.some((record) => record.commandId === submitCommandId)) {
            return { ...existing, replayed: true };
        }
        if (existing.status === 'DRAFT' || existing.status === 'RETURNED') {
            const submittedAt = new Date().toISOString();
            const submitted = {
                ...existing,
                createCommandId: existing.createCommandId || createCommandId,
                status: 'SUBMITTED',
                currentNode: 'SUBMITTED',
                currentHandlerRole: 'COUNSELOR',
                currentHandlerId: payload.studentId === studentProfile.studentId
                    ? studentProfile.counselorUserId
                    : null,
                activeApplicationKey: idempotencyKey,
                latestOpinion: '从岗位推荐一键申请。',
                submittedAt,
                modifiedAt: submittedAt,
                dataVersion: (existing.dataVersion || 1) + 1,
                approvalRecords: [
                    ...approvalRecords,
                    demoApprovalRecord(payload, existing.status, submitCommandId, submittedAt)
                ],
                replayed: false
            };
            demoApplications.set(idempotencyKey, submitted);
            notifyHost(submitted);
            return submitted;
        }
        return { ...existing, replayed: true };
    }

    const submittedAt = new Date().toISOString();
    const record = {
        applicationId: nextDemoApplicationId(),
        createCommandId,
        activeApplicationKey: idempotencyKey,
        studentId: payload.studentId,
        studentUserId: payload.studentUserId,
        jobId: payload.jobId,
        companyId: payload.companyId,
        resumeId: payload.resumeId,
        source: 'RECOMMENDATION',
        status: 'SUBMITTED',
        currentNode: 'SUBMITTED',
        currentHandlerRole: 'COUNSELOR',
        currentHandlerId: payload.studentId === studentProfile.studentId
            ? studentProfile.counselorUserId
            : null,
        latestOpinion: '从岗位推荐一键申请。',
        submittedAt,
        createdAt: submittedAt,
        modifiedAt: submittedAt,
        dataVersion: 2,
        approvalRecords: [demoApprovalRecord(payload, 'DRAFT', submitCommandId, submittedAt)],
        mode: 'STANDALONE_DEMO'
    };
    demoApplications.set(idempotencyKey, record);
    notifyHost(record);
    return record;
}

export function resetDemoApplications(records = jobApplications) {
    demoApplications.clear();
    seedDemoApplications(records);
}

seedDemoApplications();
