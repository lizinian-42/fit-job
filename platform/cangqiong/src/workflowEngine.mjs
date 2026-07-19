import { randomUUID } from 'node:crypto';
import { getWorkflow } from './workflows.mjs';

export class WorkflowError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = 'WorkflowError';
        this.code = code;
        this.details = details;
    }
}

const clone = (value) => JSON.parse(JSON.stringify(value));
const MAX_APPLICATION_ID_LENGTH = 64;
const MAX_COMMAND_ID_LENGTH = 128;

function assertCommandId(commandId, fieldName = 'commandId') {
    if (typeof commandId !== 'string' || !commandId.trim()) {
        throw new WorkflowError('COMMAND_ID_REQUIRED', `A non-empty ${fieldName} is required`);
    }
    if (commandId.length > MAX_COMMAND_ID_LENGTH) {
        throw new WorkflowError(
            'COMMAND_ID_TOO_LONG',
            `${fieldName} cannot exceed ${MAX_COMMAND_ID_LENGTH} characters`,
            { fieldName, maxLength: MAX_COMMAND_ID_LENGTH }
        );
    }
}

function requireWorkflow(workflowCode) {
    const workflow = getWorkflow(workflowCode);
    if (!workflow) {
        throw new WorkflowError('WORKFLOW_NOT_FOUND', `Unknown workflow: ${workflowCode}`);
    }
    return workflow;
}

function getPath(source, path) {
    return path.split('.').reduce((value, segment) => value?.[segment], source);
}

function resolveHandler(node, record, context = {}) {
    if (!node || !node.handlerRole) {
        return { role: null, id: null };
    }

    const role = Array.isArray(node.handlerRole)
        ? (context.preferredHandlerRole || node.handlerRole[0])
        : node.handlerRole;
    if (Array.isArray(node.handlerRole) && !node.handlerRole.includes(role)) {
        throw new WorkflowError('HANDLER_ROLE_INVALID', `${role} cannot handle this node`);
    }
    const resolver = node.handlerResolver;
    let id = null;

    if (resolver?.startsWith('record.')) {
        id = getPath(record, resolver.slice('record.'.length));
    } else if (resolver === 'student.counselorUserId') {
        id = context.student?.counselorUserId;
    } else if (resolver === 'student.collegeCode.departmentApprover') {
        id = context.departmentApproverByCollege?.[context.student?.collegeCode];
    } else if (resolver === 'company.hrOwnerUserId') {
        id = context.company?.hrOwnerUserId;
    } else if (resolver === 'department.companyReviewer') {
        id = context.companyReviewerId;
    } else if (resolver === 'department.jobReviewer') {
        id = context.jobReviewerId;
    }

    return { role, id: id || null };
}

function assertWorkflowState(workflow, record) {
    const status = record[workflow.statusField];
    if (!workflow.nodes[status]) {
        throw new WorkflowError('STATUS_INVALID', `${status} is not a node in ${workflow.code}`);
    }
    if (record.currentNode && record.currentNode !== status) {
        throw new WorkflowError(
            'STATE_NODE_MISMATCH',
            `${workflow.statusField}=${status} does not match currentNode=${record.currentNode}`
        );
    }
}

function assertHandlerResolved(node, handler, status) {
    if (node?.handlerRole && (!handler.role || !handler.id)) {
        throw new WorkflowError(
            'HANDLER_UNRESOLVED',
            `No concrete handler was resolved for ${status}`,
            { handlerRole: handler.role, handlerResolver: node.handlerResolver }
        );
    }
}

function assertHandlerAssignment(node, record, status) {
    if (!node?.handlerRole) {
        return;
    }
    const allowedRoles = Array.isArray(node.handlerRole) ? node.handlerRole : [node.handlerRole];
    if (!allowedRoles.includes(record.currentHandlerRole) || !record.currentHandlerId) {
        throw new WorkflowError(
            'HANDLER_UNRESOLVED',
            `No valid assigned handler exists for ${status}`,
            { currentHandlerRole: record.currentHandlerRole, currentHandlerId: record.currentHandlerId }
        );
    }
}

function canActorHandle(record, actor, transition) {
    if (!record.currentHandlerRole) {
        return true;
    }
    if (record.currentHandlerRole === actor.role) {
        return record.currentHandlerId === actor.id;
    }
    if (!transition.handlerOverrideRoles.includes(actor.role)) {
        return false;
    }
    return !transition.handlerOverrideActorField
        || record[transition.handlerOverrideActorField] === actor.id;
}

function hasValue(value) {
    if (value === undefined || value === null || value === '') {
        return false;
    }
    return !Array.isArray(value) || value.length > 0;
}

function applySideEffects(record, sideEffects = [], fromStatus, now, actor, opinion) {
    sideEffects.forEach((effect) => {
        const [field, rawValue] = effect.split('=');
        if (rawValue === 'now') {
            record[field] = now;
        } else if (rawValue === 'true') {
            record[field] = true;
        } else if (rawValue === 'false') {
            record[field] = false;
        } else if (rawValue === 'fromStatus') {
            record[field] = fromStatus;
        } else if (rawValue === 'opinion') {
            record[field] = opinion.trim();
        } else if (rawValue === 'actorId') {
            record[field] = actor.id;
        } else if (rawValue === 'applicationKey') {
            record[field] = `${record.studentId}:${record.jobId}`;
        } else if (rawValue === 'null') {
            record[field] = null;
        } else {
            record[field] = rawValue;
        }
    });
}

export function initializeWorkflowRecord(workflowCode, data, context = {}) {
    const workflow = requireWorkflow(workflowCode);
    const record = clone(data);
    record[workflow.statusField] ??= workflow.initialStatus;
    record.currentNode ??= record[workflow.statusField];
    record.approvalRecords ??= [];
    record.dataVersion ??= 1;

    assertWorkflowState(workflow, record);
    const node = workflow.nodes[record.currentNode];
    if (node.handlerRole && (!record.currentHandlerRole || !record.currentHandlerId)) {
        const handler = resolveHandler(node, record, context);
        assertHandlerResolved(node, handler, record.currentNode);
        record.currentHandlerRole = handler.role;
        record.currentHandlerId = handler.id;
    }
    assertHandlerAssignment(node, record, record.currentNode);
    return record;
}

export function getAvailableActions(workflowCode, record, actor) {
    const workflow = requireWorkflow(workflowCode);
    assertWorkflowState(workflow, record);
    assertHandlerAssignment(workflow.nodes[record.currentNode], record, record.currentNode);
    const status = record[workflow.statusField];
    return workflow.transitions.filter((candidate) => (
        candidate.from.includes(status) && candidate.roles.includes(actor.role)
    )).filter((candidate) => canActorHandle(record, actor, candidate));
}

export function transitionWorkflow({
    workflowCode,
    record,
    action,
    actor,
    opinion = '',
    context = {},
    commandId = randomUUID(),
    now = new Date().toISOString()
}) {
    const workflow = requireWorkflow(workflowCode);
    const result = clone(record);
    const history = result.approvalRecords || [];

    assertCommandId(commandId);

    assertWorkflowState(workflow, result);
    assertHandlerAssignment(workflow.nodes[result.currentNode], result, result.currentNode);

    if (history.some((item) => item.commandId === commandId)) {
        return result;
    }

    const fromStatus = result[workflow.statusField];
    const candidate = workflow.transitions.find((item) => (
        item.action === action && item.from.includes(fromStatus)
    ));

    if (!candidate) {
        throw new WorkflowError(
            'INVALID_TRANSITION',
            `${action} is not allowed from ${fromStatus}`,
            { workflowCode, action, fromStatus }
        );
    }

    if (!candidate.roles.includes(actor.role)) {
        throw new WorkflowError(
            'ROLE_FORBIDDEN',
            `${actor.role} cannot execute ${action}`,
            { allowedRoles: candidate.roles }
        );
    }

    if (!canActorHandle(result, actor, candidate)) {
        throw new WorkflowError(
            'HANDLER_FORBIDDEN',
            `Current node is assigned to ${result.currentHandlerRole}/${result.currentHandlerId}`,
            { currentHandlerRole: result.currentHandlerRole, currentHandlerId: result.currentHandlerId }
        );
    }

    if (candidate.commentRequired && !opinion.trim()) {
        throw new WorkflowError('COMMENT_REQUIRED', `${action} requires an approval opinion`);
    }

    const missingFields = candidate.requiredFields.filter((field) => !hasValue(result[field]));
    if (missingFields.length > 0) {
        throw new WorkflowError(
            'REQUIRED_FIELDS_MISSING',
            `Missing required fields: ${missingFields.join(', ')}`,
            { missingFields }
        );
    }

    const invalidRequiredValues = Object.entries(candidate.requiredEquals)
        .filter(([field, expected]) => result[field] !== expected)
        .map(([field]) => field);
    if (invalidRequiredValues.length > 0) {
        throw new WorkflowError(
            'REQUIRED_VALUE_INVALID',
            `Required values are invalid: ${invalidRequiredValues.join(', ')}`,
            { invalidRequiredValues }
        );
    }

    for (const requirement of candidate.linkedRecordRequirements) {
        const linkedRecord = context[requirement.contextKey];
        if (!linkedRecord) {
            throw new WorkflowError('LINKED_RECORD_MISSING', `Missing linked record: ${requirement.contextKey}`);
        }
        if (linkedRecord[requirement.statusField] !== requirement.requiredStatus) {
            throw new WorkflowError(
                'LINKED_RECORD_STATUS_INVALID',
                `${requirement.contextKey}.${requirement.statusField} must be ${requirement.requiredStatus}`
            );
        }
        const mismatches = Object.entries(requirement.fieldMatches)
            .filter(([recordField, linkedField]) => result[recordField] !== linkedRecord[linkedField]);
        if (mismatches.length > 0) {
            throw new WorkflowError(
                'LINKED_RECORD_MISMATCH',
                `${requirement.contextKey} does not match the internship application`,
                { fields: mismatches.map(([recordField]) => recordField) }
            );
        }
    }

    result[workflow.statusField] = candidate.to;
    result.currentNode = candidate.to;
    result.latestOpinion = opinion.trim();
    result.modifiedAt = now;
    result.dataVersion = (result.dataVersion || 0) + 1;
    applySideEffects(result, candidate.sideEffects, fromStatus, now, actor, opinion);

    const nextHandler = resolveHandler(workflow.nodes[candidate.to], result, context);
    assertHandlerResolved(workflow.nodes[candidate.to], nextHandler, candidate.to);
    result.currentHandlerRole = nextHandler.role;
    result.currentHandlerId = nextHandler.id;
    result.approvalRecords = [
        ...history,
        {
            recordId: `FLOW-${randomUUID()}`,
            commandId,
            nodeCode: fromStatus,
            actorRole: actor.role,
            actorId: actor.id,
            action,
            opinion: opinion.trim(),
            fromStatus,
            toStatus: candidate.to,
            operatedAt: now
        }
    ];
    return result;
}

const ACTIVE_JOB_APPLICATION_STATUSES = new Set([
    'DRAFT',
    'SUBMITTED',
    'COMPANY_REVIEW',
    'INTERVIEW',
    'RETURNED',
    'OFFERED'
]);

export function assertNoActiveJobApplication(existingRecords, studentId, jobId) {
    const duplicate = existingRecords.find((record) => (
        record.studentId === studentId
        && record.jobId === jobId
        && ACTIVE_JOB_APPLICATION_STATUSES.has(record.status)
    ));
    if (duplicate) {
        throw new WorkflowError(
            'DUPLICATE_ACTIVE_APPLICATION',
            `An active application already exists for ${studentId}/${jobId}`,
            { applicationId: duplicate.applicationId }
        );
    }
}

export function oneClickApply({
    applicationId = `JOB-APP-${randomUUID()}`,
    student,
    job,
    company,
    resume,
    actor,
    existingRecords = [],
    commandId,
    createCommandId,
    submitCommandId,
    now = new Date().toISOString()
}) {
    if (typeof applicationId !== 'string' || !applicationId.trim()) {
        throw new WorkflowError('APPLICATION_ID_REQUIRED', 'A non-empty applicationId is required');
    }
    if (applicationId.length > MAX_APPLICATION_ID_LENGTH) {
        throw new WorkflowError(
            'APPLICATION_ID_TOO_LONG',
            `applicationId cannot exceed ${MAX_APPLICATION_ID_LENGTH} characters`,
            { maxLength: MAX_APPLICATION_ID_LENGTH }
        );
    }
    if (commandId !== undefined) {
        assertCommandId(commandId);
    }
    const resolvedCreateCommandId = createCommandId ?? commandId ?? randomUUID();
    const resolvedSubmitCommandId = submitCommandId
        ?? (commandId === undefined ? randomUUID() : `${commandId}:SUBMIT`);
    assertCommandId(resolvedCreateCommandId, 'createCommandId');
    assertCommandId(resolvedSubmitCommandId, 'submitCommandId');
    if (resolvedCreateCommandId === resolvedSubmitCommandId) {
        throw new WorkflowError(
            'COMMAND_ID_CONFLICT',
            'createCommandId and submitCommandId must identify different operations'
        );
    }
    if (actor.role !== 'STUDENT' || actor.id !== student.studentUserId) {
        throw new WorkflowError('ROLE_FORBIDDEN', 'Only the owning student can apply for a job');
    }
    if (job.publishStatus !== 'PUBLISHED') {
        throw new WorkflowError('JOB_NOT_PUBLISHED', 'Only published jobs can be applied for');
    }
    if (job.recommendationEnabled !== true) {
        throw new WorkflowError('JOB_NOT_RECOMMENDABLE', 'The job is not enabled for recommendation and application');
    }
    if (!job.applicationDeadline || job.applicationDeadline < String(now).slice(0, 10)) {
        throw new WorkflowError('JOB_EXPIRED', 'The job application deadline has passed');
    }
    if (!company || company.companyId !== job.companyId || company.reviewStatus !== 'APPROVED') {
        throw new WorkflowError('COMPANY_NOT_APPROVED', 'The job company must be approved');
    }
    if (resume.studentId !== student.studentId || resume.status !== 'ACTIVE') {
        throw new WorkflowError('RESUME_NOT_AVAILABLE', 'The resume must be an active version owned by the student');
    }
    const replayed = existingRecords.find((record) => record.createCommandId === resolvedCreateCommandId);
    if (replayed) {
        const replayMatches = replayed.studentId === student.studentId
            && replayed.studentUserId === student.studentUserId
            && replayed.jobId === job.jobId
            && replayed.companyId === company.companyId;
        if (!replayMatches) {
            throw new WorkflowError('COMMAND_ID_CONFLICT', 'The create commandId is already bound to another application');
        }
    }

    const activeApplication = replayed || existingRecords.find((record) => (
        record.studentId === student.studentId
        && record.jobId === job.jobId
        && ACTIVE_JOB_APPLICATION_STATUSES.has(record.status)
    ));
    if (activeApplication) {
        if (activeApplication.studentUserId !== student.studentUserId
            || activeApplication.companyId !== company.companyId
            || activeApplication.resumeId !== resume.resumeId) {
            throw new WorkflowError(
                'ACTIVE_APPLICATION_CONFLICT',
                'The active application does not match the requested student, company and resume',
                { applicationId: activeApplication.applicationId }
            );
        }
        if (!['DRAFT', 'RETURNED'].includes(activeApplication.status)) {
            return clone(activeApplication);
        }
        if ((activeApplication.approvalRecords || []).some((item) => (
            item.commandId === resolvedSubmitCommandId
        ))) {
            return clone(activeApplication);
        }

        const editableApplication = initializeWorkflowRecord(
            'fit_job_application_flow',
            {
                ...activeApplication,
                createCommandId: activeApplication.createCommandId || resolvedCreateCommandId
            },
            { student }
        );
        return transitionWorkflow({
            workflowCode: 'fit_job_application_flow',
            record: editableApplication,
            action: 'SUBMIT',
            actor,
            opinion: '从岗位推荐一键申请。',
            context: { student },
            commandId: resolvedSubmitCommandId,
            now
        });
    }

    assertNoActiveJobApplication(existingRecords, student.studentId, job.jobId);

    const draft = initializeWorkflowRecord('fit_job_application_flow', {
        applicationId,
        createCommandId: resolvedCreateCommandId,
        activeApplicationKey: `${student.studentId}:${job.jobId}`,
        studentId: student.studentId,
        studentUserId: student.studentUserId,
        jobId: job.jobId,
        companyId: job.companyId,
        resumeId: resume.resumeId,
        source: 'RECOMMENDATION',
        status: 'DRAFT',
        currentNode: 'DRAFT',
        createdAt: now,
        modifiedAt: now,
        approvalRecords: []
    }, { student });

    return transitionWorkflow({
        workflowCode: 'fit_job_application_flow',
        record: draft,
        action: 'SUBMIT',
        actor,
        opinion: '从岗位推荐一键申请。',
        context: { student },
        commandId: resolvedSubmitCommandId,
        now
    });
}
