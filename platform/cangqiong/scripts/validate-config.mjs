import assert from 'node:assert/strict';
import {
    aiCallLogs,
    companies,
    employmentDestinations,
    internshipApplications,
    internshipLogs,
    jobApplications,
    jobPostings,
    policyEntries,
    resumeRecords,
    studentProfile,
    tripartiteReviews
} from '../../kwc/fit-job-kwc/app/kwc/demoData.js';
import { modelCatalog } from '../src/modelCatalog.mjs';
import { permissionMatrix } from '../src/permissionMatrix.mjs';
import { getWorkflow, workflows } from '../src/workflows.mjs';
import {
    WorkflowError,
    initializeWorkflowRecord,
    oneClickApply,
    transitionWorkflow
} from '../src/workflowEngine.mjs';

const requiredModels = [
    'fit_student_profile',
    'fit_resume',
    'fit_company',
    'fit_job',
    'fit_job_application',
    'fit_internship_application',
    'fit_internship_log',
    'fit_tripartite_review',
    'fit_employment_destination',
    'fit_policy',
    'fit_ai_call_log'
];
const roles = ['STUDENT', 'COUNSELOR', 'COMPANY_HR', 'DEPARTMENT_ADMIN'];
const modelCodes = new Set(modelCatalog.models.map((model) => model.code));
const platformReferenceTargets = new Set(['platform_user', 'platform_organization']);

function assertUnique(values, label) {
    assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function assertNonEmpty(value, label) {
    assert.ok(value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0), `${label} is required`);
}

function assertSeedMatchesModel(modelCode, records) {
    const model = modelCatalog.models.find((item) => item.code === modelCode);
    assert.ok(model, `seed model ${modelCode} must exist`);
    for (const [index, record] of records.entries()) {
        for (const item of model.fields.filter((field) => field.required && field.code !== 'id')) {
            assertNonEmpty(record[item.code], `${modelCode}[${index}].${item.code}`);
        }
        for (const item of model.fields.filter((field) => field.enum && record[field.code] !== null && record[field.code] !== undefined)) {
            assert.ok(item.enum.includes(record[item.code]), `${modelCode}[${index}].${item.code} has invalid enum value ${record[item.code]}`);
        }
        for (const detail of model.detailTables) {
            const rows = record[detail.code] || [];
            assert.ok(rows.length >= (detail.minRows || 0), `${modelCode}[${index}].${detail.code} needs at least ${detail.minRows || 0} rows`);
            for (const [rowIndex, row] of rows.entries()) {
                detail.fields.filter((field) => field.required).forEach((item) => {
                    assertNonEmpty(row[item.code], `${modelCode}[${index}].${detail.code}[${rowIndex}].${item.code}`);
                });
                detail.fields.filter((field) => field.enum && row[field.code] !== null && row[field.code] !== undefined).forEach((item) => {
                    assert.ok(item.enum.includes(row[item.code]), `${modelCode}[${index}].${detail.code}[${rowIndex}].${item.code} has invalid enum value ${row[item.code]}`);
                });
            }
        }
    }
}

assert.deepEqual(modelCatalog.roles, roles, 'model role list must contain exactly four business roles');
assert.deepEqual(
    modelCatalog.models.map((model) => model.code),
    requiredModels,
    'form model catalog must cover issues 14-18'
);
assertUnique(modelCatalog.models.map((model) => model.code), 'model codes');

for (const model of modelCatalog.models) {
    assert.equal(model.kind, 'form', `${model.code} must be a form model`);
    assert.ok(model.ui.supportedModes.length > 0, `${model.code} must expose at least one form mode`);
    assert.ok(model.status?.field, `${model.code} must define a status field`);
    assert.ok(model.status.values.includes(model.status.initial), `${model.code} status initial value must be in enum`);
    assertUnique(model.fields.map((item) => item.code), `${model.code} field codes`);
    for (const item of model.fields) {
        assert.equal(typeof item.required, 'boolean', `${model.code}.${item.code} required flag missing`);
        assert.ok(modelCatalog.javaTypeMap[item.type], `${model.code}.${item.code} type has no Java mapping`);
        if (item.enum) {
            assert.ok(Array.isArray(item.enum) && item.enum.length > 0, `${model.code}.${item.code} enum cannot be empty`);
        }
        if (item.reference) {
            const targetModel = item.reference.split('.')[0];
            assert.ok(modelCodes.has(targetModel), `${model.code}.${item.code} references unknown model ${targetModel}`);
        }
    }
    const statusField = model.fields.find((item) => item.code === model.status.field);
    assert.ok(statusField, `${model.code} status field must be present in fields`);
    assert.deepEqual(statusField.enum, model.status.values, `${model.code} status metadata and field enum must agree`);
    assert.equal(statusField.readonly, true, `${model.code}.${statusField.code} lifecycle status must be operation-controlled`);
    for (const relation of model.relationships) {
        assert.ok(modelCodes.has(relation.target) || platformReferenceTargets.has(relation.target), `${model.code} relation target ${relation.target} is unknown`);
    }
    for (const index of model.indexes) {
        index.fields.forEach((fieldCode) => assert.ok(model.fields.some((item) => item.code === fieldCode), `${model.code} index references unknown field ${fieldCode}`));
    }
    model.fields.filter((item) => item.serverDerived || item.serverGenerated).forEach((item) => {
        assert.equal(item.readonly, true, `${model.code}.${item.code} server-derived fields must be readonly`);
    });
}
['fit_student_profile', 'fit_resume', 'fit_company', 'fit_job'].forEach((modelCode) => {
    const model = modelCatalog.models.find((item) => item.code === modelCode);
    assert.deepEqual(model.ui.supportedModes, ['CREATE', 'EDIT', 'VIEW'], `${modelCode} must support create/edit/view`);
});
assert.deepEqual(modelCatalog.models.find((item) => item.code === 'fit_ai_call_log').ui.supportedModes, ['VIEW'], 'AI call logs must be read-only in low-code UI');
assert.ok(modelCatalog.serviceBindings.some((binding) => binding.code === 'fit_resume_diagnose'), 'resume diagnosis binding is required');
assert.ok(modelCatalog.serviceBindings.some((binding) => binding.code === 'fit_job_match_service'), 'job matching binding is required');
assert.ok(modelCatalog.serviceBindings.some((binding) => binding.workflow === 'fit_job_application_flow'), 'job application workflow binding is required');

const workflowControlledModels = ['fit_company', 'fit_job', 'fit_job_application', 'fit_internship_application'];
workflowControlledModels.forEach((modelCode) => {
    const model = modelCatalog.models.find((item) => item.code === modelCode);
    const statusField = model.fields.find((item) => item.code === model.status.field);
    assert.equal(statusField.readonly, true, `${modelCode}.${statusField.code} must be workflow-only`);
    ['currentNode', 'currentHandlerRole', 'currentHandlerId', 'latestOpinion'].forEach((fieldCode) => {
        assert.ok(model.fields.some((item) => item.code === fieldCode), `${modelCode} must persist ${fieldCode}`);
    });
    assert.ok(model.detailTables.some((detail) => detail.code === 'approvalRecords'), `${modelCode} must persist approvalRecords`);
});
const jobApplicationModel = modelCatalog.models.find((item) => item.code === 'fit_job_application');
const applicationIdField = jobApplicationModel.fields.find((item) => item.code === 'applicationId');
const createCommandIdField = jobApplicationModel.fields.find((item) => item.code === 'createCommandId');
assert.ok(createCommandIdField?.unique && createCommandIdField.readonly, 'job application needs a unique createCommandId');
assert.ok(jobApplicationModel.fields.some((item) => item.code === 'activeApplicationKey' && item.unique && item.readonly), 'job application needs an atomic activeApplicationKey');
const generatedApplication = oneClickApply({
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: { role: 'STUDENT', id: studentProfile.studentUserId },
    now: '2026-07-19T14:00:00+08:00',
    commandId: 'CMD-TEST-GENERATED-ID-LENGTH'
});
assert.ok(
    generatedApplication.applicationId.length <= applicationIdField.length,
    `default applicationId length ${generatedApplication.applicationId.length} exceeds model length ${applicationIdField.length}`
);
assert.ok(createCommandIdField.length >= 108, 'createCommandId must hold the longest stable KWC job-apply command');
assert.throws(
    () => oneClickApply({
        student: studentProfile,
        job: jobPostings[0],
        company: companies[0],
        resume: resumeRecords[0],
        actor: { role: 'STUDENT', id: studentProfile.studentUserId },
        now: '2026-07-19T14:00:00+08:00',
        createCommandId: 'C'.repeat(createCommandIdField.length + 1),
        submitCommandId: 'CMD-LENGTH-GUARD'
    }),
    (error) => error instanceof WorkflowError && error.code === 'COMMAND_ID_TOO_LONG',
    'workflow entry must reject command ids that cannot fit the model'
);
workflowControlledModels.forEach((modelCode) => {
    const model = modelCatalog.models.find((item) => item.code === modelCode);
    const approvalRecords = model.detailTables.find((detail) => detail.code === 'approvalRecords');
    const approvalCommandId = approvalRecords.fields.find((item) => item.code === 'commandId');
    assert.ok(
        approvalCommandId.length >= createCommandIdField.length,
        `${modelCode}.approvalRecords.commandId must hold every accepted create/workflow command id`
    );
});

const selfOwnershipContracts = {
    fit_student_profile: {
        derivedFields: [
            'studentId',
            'studentUserId',
            'studentNo',
            'collegeCode',
            'collegeName',
            'majorName',
            'classCode',
            'counselorUserId',
            'graduationYear'
        ],
        parentFields: [],
        constraintCode: 'student_profile_identity_consistency'
    },
    fit_resume: {
        derivedFields: ['studentId', 'studentUserId'],
        parentFields: ['studentId'],
        constraintCode: 'resume_student_identity_consistency'
    },
    fit_job_application: {
        derivedFields: ['studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId'],
        parentFields: ['jobId', 'resumeId'],
        constraintCode: 'job_application_link_consistency'
    },
    fit_internship_application: {
        derivedFields: ['jobApplicationId', 'studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId'],
        parentFields: ['jobApplicationId'],
        constraintCode: 'internship_job_application_consistency'
    },
    fit_internship_log: {
        derivedFields: ['internshipApplicationId', 'studentId', 'studentUserId', 'companyId'],
        parentFields: ['internshipApplicationId'],
        constraintCode: 'internship_log_parent_consistency'
    },
    fit_tripartite_review: {
        derivedFields: ['internshipApplicationId', 'studentId', 'studentUserId', 'companyId'],
        parentFields: ['internshipApplicationId'],
        constraintCode: 'tripartite_review_parent_consistency'
    },
    fit_employment_destination: {
        derivedFields: ['studentId', 'studentUserId'],
        parentFields: [],
        constraintCode: 'employment_destination_student_identity_consistency'
    },
    fit_ai_call_log: {
        derivedFields: ['businessId', 'studentId', 'studentUserId'],
        parentFields: ['businessId'],
        constraintCode: 'ai_call_log_business_owner_consistency'
    }
};
const selfScopedModelCodes = requiredModels.filter((modelCode) => permissionMatrix.models[modelCode].STUDENT.dataScope === 'SELF');
assert.deepEqual(
    Object.keys(selfOwnershipContracts).sort(),
    selfScopedModelCodes.sort(),
    'every SELF-scoped student model must define an ownership contract'
);
for (const [modelCode, contract] of Object.entries(selfOwnershipContracts)) {
    const model = modelCatalog.models.find((item) => item.code === modelCode);
    const constraint = model.constraints.find((item) => item.code === contract.constraintCode);
    assert.ok(constraint, `${modelCode} must define ${contract.constraintCode}`);
    const matchedFields = new Set([
        ...Object.keys(constraint.fieldMatches || {}),
        ...(constraint.sources || []).flatMap((source) => Object.keys(source.fieldMatches || {}))
    ]);
    for (const fieldCode of contract.derivedFields) {
        const item = model.fields.find((field) => field.code === fieldCode);
        assert.ok(item, `${modelCode}.${fieldCode} ownership field is missing`);
        assert.equal(item.readonly, true, `${modelCode}.${fieldCode} must be readonly to protect SELF isolation`);
        assert.equal(item.immutableAfterCreate, true, `${modelCode}.${fieldCode} must be immutable after create`);
        assert.ok(item.serverDerived, `${modelCode}.${fieldCode} must be resolved by the service`);
        assert.ok(matchedFields.has(fieldCode), `${modelCode}.${fieldCode} must be covered by a machine-readable consistency constraint`);
    }
    for (const fieldCode of contract.parentFields) {
        const item = model.fields.find((field) => field.code === fieldCode);
        assert.ok(item.serverDerived && item.readonly && item.immutableAfterCreate, `${modelCode}.${fieldCode} parent link must be server-resolved and frozen`);
    }
}
const studentProfileModel = modelCatalog.models.find((item) => item.code === 'fit_student_profile');
['collegeCode', 'classCode', 'counselorUserId'].forEach((fieldCode) => {
    const item = studentProfileModel.fields.find((field) => field.code === fieldCode);
    assert.ok(
        item.readonly && item.immutableAfterCreate && item.serverDerived,
        `fit_student_profile.${fieldCode} scope-driving field must be server-derived and frozen`
    );
});

assert.deepEqual(Object.keys(permissionMatrix.roles), roles, 'permission matrix must define the same four roles');
for (const menu of permissionMatrix.menus) {
    assert.ok(menu.roles.length > 0, `${menu.code} needs at least one role`);
    menu.roles.forEach((role) => assert.ok(roles.includes(role), `${menu.code} has unknown role ${role}`));
}
assert.deepEqual(Object.keys(permissionMatrix.models).sort(), requiredModels.slice().sort(), 'permission matrix must cover every form model');
for (const modelCode of requiredModels) {
    const modelPermissions = permissionMatrix.models[modelCode];
    assert.deepEqual(Object.keys(modelPermissions).sort(), roles.slice().sort(), `${modelCode} must define all role decisions`);
    for (const role of roles) {
        const decision = modelPermissions[role];
        assert.ok(Array.isArray(decision.actions), `${modelCode}/${role} actions must be explicit`);
        assert.ok(decision.dataScope, `${modelCode}/${role} data scope must be explicit`);
        assert.ok(permissionMatrix.dataScopes[decision.dataScope], `${modelCode}/${role} uses an unknown data scope`);
        for (const [action, scope] of Object.entries(decision.actionScopes || {})) {
            assert.ok(decision.actions.includes(action), `${modelCode}/${role} actionScopes includes forbidden action ${action}`);
            assert.ok(permissionMatrix.dataScopes[scope], `${modelCode}/${role}/${action} uses unknown scope ${scope}`);
        }
        for (const action of Object.keys(decision.actionConditions || {})) {
            assert.ok(decision.actions.includes(action), `${modelCode}/${role} actionConditions includes forbidden action ${action}`);
        }
        const allScopes = new Set([decision.dataScope, ...Object.values(decision.actionScopes || {})]);
        const model = modelCatalog.models.find((item) => item.code === modelCode);
        const availableFields = new Set(model.fields.map((item) => item.code));
        for (const scope of allScopes) {
            const requirement = permissionMatrix.scopeRequirements[scope];
            assert.ok(requirement, `${scope} needs machine-readable scope requirements`);
            if (scope === 'NONE') continue;
            if (scope === 'PUBLIC') {
                assert.ok(permissionMatrix.publicPredicates[modelCode], `${modelCode} needs a public predicate`);
                continue;
            }
            const hasScopeField = requirement.anyFields.some((fieldCode) => availableFields.has(fieldCode));
            const hasPublicFallback = scope === 'DEPARTMENT_OR_PUBLIC' && permissionMatrix.publicPredicates[modelCode];
            assert.ok(hasScopeField || hasPublicFallback, `${modelCode}/${role} cannot resolve scope ${scope} from its fields or relations`);
        }
    }
}
for (const rule of permissionMatrix.fieldRules) {
    for (const modelCode of rule.models) {
        const model = modelCatalog.models.find((item) => item.code === modelCode);
        const availableCodes = new Set([
            ...model.fields.map((item) => item.code),
            ...model.detailTables.map((detail) => detail.code)
        ]);
        rule.fields.forEach((fieldCode) => assert.ok(availableCodes.has(fieldCode), `${modelCode} field rule references unknown field ${fieldCode}`));
    }
}
assert.ok(permissionMatrix.segregationAcceptanceCases.length >= 5, 'permission matrix needs segregation acceptance cases');

assertUnique(workflows.map((workflow) => workflow.code), 'workflow codes');
for (const workflow of workflows) {
    assert.ok(modelCodes.has(workflow.model), `${workflow.code} targets an unknown model`);
    const model = modelCatalog.models.find((item) => item.code === workflow.model);
    const modelFields = new Set(model.fields.map((item) => item.code));
    const modelPermissions = permissionMatrix.models[workflow.model];
    const statuses = new Set(Object.keys(workflow.nodes));
    const allowedRolesByButton = new Map();
    const allowedRolesByPermissionAction = new Map();
    const addAllowedRoles = (index, key, allowedRoles) => {
        const indexedRoles = index.get(key) || new Set();
        allowedRoles.forEach((role) => indexedRoles.add(role));
        index.set(key, indexedRoles);
    };
    assert.ok(statuses.has(workflow.initialStatus), `${workflow.code} initial node is missing`);
    for (const transition of workflow.transitions) {
        transition.from.forEach((status) => assert.ok(statuses.has(status), `${workflow.code} transition source ${status} is missing`));
        assert.ok(statuses.has(transition.to), `${workflow.code} transition target ${transition.to} is missing`);
        assert.ok(transition.permission?.action, `${workflow.code}/${transition.action} needs a permission action mapping`);
        assert.ok(transition.permission.buttons.length > 0, `${workflow.code}/${transition.action} needs at least one permission button`);
        Object.keys(transition.permission.actionByRole).forEach((role) => {
            assert.ok(transition.roles.includes(role), `${workflow.code}/${transition.action} has a permission action override for forbidden role ${role}`);
        });
        addAllowedRoles(allowedRolesByButton, transition.action, transition.roles);
        transition.permission.buttons.forEach((button) => addAllowedRoles(allowedRolesByButton, button, transition.roles));
        transition.roles.forEach((role) => assert.ok(roles.includes(role), `${workflow.code} uses unknown role ${role}`));
        transition.roles.forEach((role) => {
            const decision = modelPermissions[role];
            const permissionAction = transition.permission.actionByRole[role] || transition.permission.action;
            addAllowedRoles(allowedRolesByPermissionAction, permissionAction, [role]);
            assert.ok(
                decision.actions.includes(permissionAction),
                `${workflow.code}/${transition.action}/${role} needs permission action ${permissionAction}`
            );
            assert.ok(
                transition.permission.buttons.some((button) => decision.buttons?.includes(button)),
                `${workflow.code}/${transition.action}/${role} needs one of permission buttons ${transition.permission.buttons.join(', ')}`
            );
            if (decision.actionScopes) {
                assert.ok(
                    Object.prototype.hasOwnProperty.call(decision.actionScopes, permissionAction),
                    `${workflow.code}/${transition.action}/${role} needs actionScopes.${permissionAction}`
                );
            }
            if (decision.actionConditions) {
                assert.ok(
                    Object.prototype.hasOwnProperty.call(decision.actionConditions, permissionAction),
                    `${workflow.code}/${transition.action}/${role} needs actionConditions.${permissionAction}`
                );
            }
        });
        transition.handlerOverrideRoles.forEach((role) => {
            assert.ok(transition.roles.includes(role), `${workflow.code}/${transition.action} override role ${role} must also be an allowed role`);
        });
        if (transition.handlerOverrideActorField) {
            assert.ok(modelFields.has(transition.handlerOverrideActorField), `${workflow.code}/${transition.action} override actor field is unknown`);
        }
        [...transition.requiredFields, ...Object.keys(transition.requiredEquals)].forEach((fieldCode) => {
            assert.ok(modelFields.has(fieldCode), `${workflow.code}/${transition.action} validates unknown field ${fieldCode}`);
        });
        transition.sideEffects?.forEach((effect) => {
            const fieldCode = effect.split('=')[0];
            assert.ok(modelFields.has(fieldCode), `${workflow.code}/${transition.action} writes unknown field ${fieldCode}`);
        });
        transition.linkedRecordRequirements.forEach((requirement) => {
            Object.keys(requirement.fieldMatches).forEach((fieldCode) => {
                assert.ok(modelFields.has(fieldCode), `${workflow.code}/${transition.action} linked check uses unknown field ${fieldCode}`);
            });
        });
    }
    for (const [role, decision] of Object.entries(modelPermissions)) {
        for (const button of decision.buttons || []) {
            const allowedRoles = allowedRolesByButton.get(button);
            if (allowedRoles) {
                assert.ok(allowedRoles.has(role), `${workflow.code}/${button} button is not executable by ${role}`);
            }
        }
        const configuredWorkflowActions = new Set([
            ...decision.actions,
            ...Object.keys(decision.actionScopes || {}),
            ...Object.keys(decision.actionConditions || {})
        ]);
        for (const permissionAction of configuredWorkflowActions) {
            const allowedRoles = allowedRolesByPermissionAction.get(permissionAction);
            if (allowedRoles) {
                assert.ok(allowedRoles.has(role), `${workflow.code}/${permissionAction} permission action is not executable by ${role}`);
            }
        }
    }
    workflow.terminalStatuses.forEach((status) => {
        assert.ok(!workflow.transitions.some((transition) => transition.from.includes(status)), `${workflow.code} terminal status ${status} cannot have outgoing transitions`);
    });
}
const jobApplicationWorkflow = getWorkflow('fit_job_application_flow');
assert.equal(jobApplicationWorkflow.idempotency.commandField, 'createCommandId');
assert.equal(jobApplicationWorkflow.idempotency.createCommandField, 'createCommandId');
assert.equal(jobApplicationWorkflow.idempotency.transitionCommandField, 'approvalRecords.commandId');
assert.equal(jobApplicationWorkflow.idempotency.activeUniqueField, 'activeApplicationKey');
const internshipWorkflow = getWorkflow('fit_internship_approval');
assert.deepEqual(
    internshipWorkflow.transitions.slice(0, 4).map((item) => item.to),
    ['COUNSELOR_REVIEW', 'DEPARTMENT_REVIEW', 'COMPANY_CONFIRMATION', 'APPROVED'],
    'internship workflow must preserve student → counselor → department → company order'
);
assert.ok(
    internshipWorkflow.transitions.filter((item) => item.action === 'RETURN').every((item) => item.commentRequired),
    'every internship return action must require an opinion'
);

assertSeedMatchesModel('fit_student_profile', [studentProfile]);
assertSeedMatchesModel('fit_resume', resumeRecords);
assertSeedMatchesModel('fit_company', companies);
assertSeedMatchesModel('fit_job', jobPostings);
assertSeedMatchesModel('fit_job_application', jobApplications);
assertSeedMatchesModel('fit_internship_application', internshipApplications);
assertSeedMatchesModel('fit_internship_log', internshipLogs);
assertSeedMatchesModel('fit_tripartite_review', tripartiteReviews);
assertSeedMatchesModel('fit_employment_destination', employmentDestinations);
assertSeedMatchesModel('fit_policy', policyEntries);
assertSeedMatchesModel('fit_ai_call_log', aiCallLogs);

assertUnique(companies.map((company) => company.companyId), 'company ids');
assertUnique(jobPostings.map((job) => job.jobId), 'job ids');
assert.ok(jobPostings.every((job) => companies.some((company) => company.companyId === job.companyId)), 'every job must reference an existing company');
for (const job of jobPostings) {
    const company = companies.find((item) => item.companyId === job.companyId);
    ['title', 'jobType', 'city', 'salaryMin', 'salaryMax', 'salaryUnit', 'jd', 'skillRequirements', 'majorRequirements', 'applicationDeadline', 'headcount', 'publishStatus']
        .forEach((field) => assertNonEmpty(job[field], `job ${job.jobId}.${field}`));
    assert.ok(job.headcount > 0, `job ${job.jobId} headcount must be positive`);
    assert.ok(job.salaryMax >= job.salaryMin, `job ${job.jobId} salary range is invalid`);
    assert.equal(job.hrOwnerUserId, company.hrOwnerUserId, `job ${job.jobId} HR owner must be derived from its company`);
    assert.equal(job.reviewDepartmentCode, company.reviewDepartmentCode, `job ${job.jobId} review department must be derived from its company`);
}
assert.ok(studentProfile.educationBackground.length > 0, 'student profile must include education background');
assert.ok(studentProfile.certificates.length > 0, 'student profile must include certificates');
assert.ok(studentProfile.experiences.length > 0, 'student profile must include project/internship experience');
assert.ok(resumeRecords.every((resume) => resume.studentId === studentProfile.studentId), 'resume records must belong to the demo student');
assert.ok(resumeRecords.every((resume) => resume.targetJobId === null || jobPostings.some((job) => job.jobId === resume.targetJobId)), 'resume target jobs must exist');
assert.ok(jobApplications.every((application) => (
    application.studentId === studentProfile.studentId
    && jobPostings.some((job) => job.jobId === application.jobId)
    && companies.some((company) => company.companyId === application.companyId)
    && resumeRecords.some((resume) => resume.resumeId === application.resumeId)
)), 'job applications must have valid student, job, company and resume references');
assertUnique(jobApplications.map((application) => application.createCommandId), 'job application create command ids');
assertUnique(jobApplications.map((application) => application.activeApplicationKey).filter(Boolean), 'active application keys');
assert.ok(jobApplications.every((application) => !Object.prototype.hasOwnProperty.call(application, 'updatedAt')), 'job applications must use modifiedAt instead of updatedAt');
assert.ok(internshipApplications.every((application) => {
    const linked = jobApplications.find((jobApplication) => jobApplication.applicationId === application.jobApplicationId);
    return linked
        && linked.status === 'OFFERED'
        && ['studentId', 'studentUserId', 'jobId', 'companyId', 'resumeId'].every((field) => linked[field] === application[field]);
}), 'internship applications must reference an OFFERED job application with matching ownership');
assert.ok(internshipApplications.every((application) => !Object.prototype.hasOwnProperty.call(application, 'updatedAt')), 'internship applications must use modifiedAt instead of updatedAt');
assert.ok(internshipLogs.every((log) => (
    internshipApplications.some((application) => application.internshipApplicationId === log.internshipApplicationId && application.companyId === log.companyId)
    && log.studentId === studentProfile.studentId
)), 'internship logs must reference an internship application and student');
assert.ok(tripartiteReviews.every((review) => (
    internshipApplications.some((application) => (
        application.internshipApplicationId === review.internshipApplicationId
        && application.companyId === review.companyId
    ))
)), 'tripartite reviews must reference the same internship and company');
assert.ok(employmentDestinations.every((destination) => (
    destination.studentId === studentProfile.studentId
    && (destination.companyId === null || companies.some((company) => company.companyId === destination.companyId))
)), 'employment destinations must reference valid student/company records');
assert.ok(policyEntries.every((policy) => (
    policy.policyId.startsWith('MOCK-POLICY-')
    && policy.sourceUrl.startsWith('https://example.com/mock-policy/')
    && policy.ownerDepartmentCode === studentProfile.collegeCode
)), 'policy entries must be explicit mock records with mock sources');
assert.ok(aiCallLogs.every((log) => (
    log.studentId === studentProfile.studentId
    && log.studentUserId === studentProfile.studentUserId
    && resumeRecords.some((resume) => resume.resumeId === log.businessId)
    && log.requestHash.startsWith('MOCK-')
)), 'AI call logs must reference mock business records without raw prompts');

const context = {
    student: studentProfile,
    company: companies[0],
    departmentApproverByCollege: { [studentProfile.collegeCode]: 'USER-DEMO-DEPARTMENT-ADMIN-001' }
};
const actorStudent = { role: 'STUDENT', id: studentProfile.studentUserId };
const actorCounselor = { role: 'COUNSELOR', id: studentProfile.counselorUserId };
const actorDepartment = { role: 'DEPARTMENT_ADMIN', id: 'USER-DEMO-DEPARTMENT-ADMIN-001' };
const actorHr = { role: 'COMPANY_HR', id: companies[0].hrOwnerUserId };
const now = '2026-07-19T14:00:00+08:00';

const createdApplication = oneClickApply({
    applicationId: 'JOB-APP-TEST-001',
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: actorStudent,
    now,
    createCommandId: 'CMD-TEST-CREATE-001',
    submitCommandId: 'CMD-TEST-SUBMIT-001'
});
assert.equal(createdApplication.status, 'SUBMITTED', 'one-click apply must enter counselor review');
assert.equal(createdApplication.activeApplicationKey, `${studentProfile.studentId}:${jobPostings[0].jobId}`);
assert.equal(createdApplication.createCommandId, 'CMD-TEST-CREATE-001');
assert.equal(createdApplication.approvalRecords[0].commandId, 'CMD-TEST-SUBMIT-001', 'create and submit commands must be distinct');
const replayedCreation = oneClickApply({
    applicationId: 'JOB-APP-TEST-DIFFERENT-ID',
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: actorStudent,
    existingRecords: [createdApplication],
    now,
    createCommandId: 'CMD-TEST-CREATE-001',
    submitCommandId: 'CMD-TEST-SUBMIT-001'
});
assert.deepEqual(replayedCreation, createdApplication, 'replayed create command must return the existing application');
const existingDraftApplication = initializeWorkflowRecord('fit_job_application_flow', {
    applicationId: 'JOB-APP-TEST-DRAFT-001',
    createCommandId: 'CMD-TEST-DRAFT-CREATE-001',
    activeApplicationKey: `${studentProfile.studentId}:${jobPostings[0].jobId}`,
    studentId: studentProfile.studentId,
    studentUserId: studentProfile.studentUserId,
    jobId: jobPostings[0].jobId,
    companyId: companies[0].companyId,
    resumeId: resumeRecords[0].resumeId,
    status: 'DRAFT',
    currentNode: 'DRAFT',
    approvalRecords: []
}, { student: studentProfile });
const submittedExistingDraft = oneClickApply({
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: actorStudent,
    existingRecords: [existingDraftApplication],
    now,
    createCommandId: 'CMD-TEST-DRAFT-CREATE-RETRY',
    submitCommandId: 'CMD-TEST-DRAFT-SUBMIT-001'
});
assert.equal(submittedExistingDraft.applicationId, existingDraftApplication.applicationId, 'one-click apply must reuse an existing draft');
assert.equal(submittedExistingDraft.status, 'SUBMITTED');
assert.equal(submittedExistingDraft.createCommandId, existingDraftApplication.createCommandId, 'submitting a draft must preserve its create command');
assert.equal(submittedExistingDraft.approvalRecords.at(-1).commandId, 'CMD-TEST-DRAFT-SUBMIT-001');
const returnedApplication = transitionWorkflow({
    workflowCode: 'fit_job_application_flow',
    record: createdApplication,
    action: 'RETURN',
    actor: actorCounselor,
    opinion: 'Please update the application.',
    context,
    now,
    commandId: 'CMD-TEST-RETURN-001'
});
const staleSubmitReplay = oneClickApply({
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: actorStudent,
    existingRecords: [returnedApplication],
    now,
    createCommandId: 'CMD-TEST-CREATE-001',
    submitCommandId: 'CMD-TEST-SUBMIT-001'
});
assert.deepEqual(staleSubmitReplay, returnedApplication, 'replaying an old submit command must not resubmit a returned application');
const resubmittedApplication = oneClickApply({
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: actorStudent,
    existingRecords: [returnedApplication],
    now,
    createCommandId: 'CMD-TEST-CREATE-001',
    submitCommandId: 'CMD-TEST-RESUBMIT-001'
});
assert.equal(resubmittedApplication.status, 'SUBMITTED', 'a returned application must accept a new submit command');
assert.equal(resubmittedApplication.approvalRecords.at(-1).commandId, 'CMD-TEST-RESUBMIT-001');
assert.throws(
    () => oneClickApply({
        student: studentProfile,
        job: jobPostings[0],
        company: companies[0],
        resume: { ...resumeRecords[0], resumeId: 'RESUME-DEMO-OTHER-ACTIVE' },
        actor: actorStudent,
        existingRecords: [returnedApplication],
        now,
        createCommandId: 'CMD-TEST-CREATE-001',
        submitCommandId: 'CMD-TEST-RESUBMIT-DIFFERENT-RESUME'
    }),
    (error) => error instanceof WorkflowError && error.code === 'ACTIVE_APPLICATION_CONFLICT',
    'resubmission must not replace immutable application ownership links'
);
assert.deepEqual(oneClickApply({
    student: studentProfile,
    job: jobPostings[0],
    company: companies[0],
    resume: resumeRecords[0],
    actor: actorStudent,
    existingRecords: [resubmittedApplication],
    now,
    createCommandId: 'CMD-TEST-CREATE-001',
    submitCommandId: 'CMD-TEST-RESUBMIT-001'
}), resubmittedApplication, 'retrying the resubmit command must be idempotent');
assert.throws(
    () => oneClickApply({ student: studentProfile, job: { ...jobPostings[0], applicationDeadline: '2020-01-01' }, company: companies[0], resume: resumeRecords[0], actor: actorStudent, now, commandId: 'CMD-EXPIRED' }),
    (error) => error instanceof WorkflowError && error.code === 'JOB_EXPIRED'
);
assert.throws(
    () => oneClickApply({ student: studentProfile, job: { ...jobPostings[0], recommendationEnabled: false }, company: companies[0], resume: resumeRecords[0], actor: actorStudent, now, commandId: 'CMD-NOT-RECOMMENDED' }),
    (error) => error instanceof WorkflowError && error.code === 'JOB_NOT_RECOMMENDABLE'
);
assert.throws(
    () => oneClickApply({ student: studentProfile, job: jobPostings[0], company: { ...companies[0], reviewStatus: 'REJECTED' }, resume: resumeRecords[0], actor: actorStudent, now, commandId: 'CMD-COMPANY-REJECTED' }),
    (error) => error instanceof WorkflowError && error.code === 'COMPANY_NOT_APPROVED'
);
const idempotentApplication = transitionWorkflow({
    workflowCode: 'fit_job_application_flow',
    record: createdApplication,
    action: 'COUNSELOR_APPROVE',
    actor: actorCounselor,
    context,
    now,
    commandId: 'CMD-TEST-COUNSELOR-001'
});
assert.equal(idempotentApplication.status, 'COMPANY_REVIEW');
const duplicateCommand = transitionWorkflow({
    workflowCode: 'fit_job_application_flow',
    record: idempotentApplication,
    action: 'INVITE_INTERVIEW',
    actor: actorHr,
    context,
    now,
    commandId: 'CMD-TEST-INTERVIEW-001'
});
const duplicateCommandRetry = transitionWorkflow({
    workflowCode: 'fit_job_application_flow',
    record: duplicateCommand,
    action: 'INVITE_INTERVIEW',
    actor: actorHr,
    context,
    now,
    commandId: 'CMD-TEST-INTERVIEW-001'
});
assert.deepEqual(duplicateCommandRetry, duplicateCommand, 'replayed command must be idempotent');
const offeredApplication = transitionWorkflow({
    workflowCode: 'fit_job_application_flow',
    record: duplicateCommand,
    action: 'OFFER',
    actor: actorHr,
    opinion: '欢迎加入演示团队。',
    context,
    now,
    commandId: 'CMD-TEST-OFFER-001'
});
assert.equal(offeredApplication.status, 'OFFERED');

const assignedCompanyReview = initializeWorkflowRecord('fit_company_review', {
    ...companies[0],
    reviewStatus: 'PENDING_REVIEW',
    currentNode: 'PENDING_REVIEW',
    currentHandlerRole: 'COUNSELOR',
    currentHandlerId: actorCounselor.id,
    approvalRecords: []
});
assert.throws(
    () => transitionWorkflow({ workflowCode: 'fit_company_review', record: assignedCompanyReview, action: 'APPROVE', actor: actorDepartment, context, now, commandId: 'CMD-WRONG-REVIEWER' }),
    (error) => error instanceof WorkflowError && error.code === 'HANDLER_FORBIDDEN',
    'a multi-role review node must still enforce the assigned handler'
);
const approvedCompany = transitionWorkflow({
    workflowCode: 'fit_company_review',
    record: assignedCompanyReview,
    action: 'APPROVE',
    actor: actorCounselor,
    opinion: '企业信息核验通过。',
    context,
    now,
    commandId: 'CMD-COMPANY-APPROVE'
});
assert.equal(approvedCompany.reviewStatus, 'APPROVED');
assert.equal(approvedCompany.reviewOpinion, '企业信息核验通过。');
assert.equal(approvedCompany.reviewedBy, actorCounselor.id);
assert.equal(approvedCompany.approvalRecords.length, 1);

let internshipRecord = initializeWorkflowRecord('fit_internship_approval', {
    internshipApplicationId: 'INTERN-APP-TEST-001',
    jobApplicationId: offeredApplication.applicationId,
    studentId: studentProfile.studentId,
    studentUserId: studentProfile.studentUserId,
    jobId: jobPostings[0].jobId,
    companyId: companies[0].companyId,
    resumeId: resumeRecords[0].resumeId,
    internshipStartDate: '2026-09-01',
    internshipEndDate: '2027-01-31',
    weeklyAttendanceDays: 3,
    workCity: jobPostings[0].city,
    safetyCommitmentAccepted: true,
    status: 'DRAFT',
    currentNode: 'DRAFT',
    approvalRecords: []
}, context);
const internshipContext = { ...context, jobApplication: offeredApplication };
const unsafeInternship = { ...internshipRecord, safetyCommitmentAccepted: false };
assert.throws(
    () => transitionWorkflow({ workflowCode: 'fit_internship_approval', record: unsafeInternship, action: 'SUBMIT', actor: actorStudent, context: internshipContext, now, commandId: 'CMD-UNSAFE-INTERN' }),
    (error) => error instanceof WorkflowError && error.code === 'REQUIRED_VALUE_INVALID',
    'safety commitment must explicitly be true'
);
assert.throws(
    () => transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'SUBMIT', actor: actorStudent, context: { ...context, jobApplication: { ...offeredApplication, status: 'REJECTED' } }, now, commandId: 'CMD-INVALID-LINK' }),
    (error) => error instanceof WorkflowError && error.code === 'LINKED_RECORD_STATUS_INVALID',
    'internship submission must link an OFFERED job application'
);
internshipRecord = transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'SUBMIT', actor: actorStudent, context: internshipContext, now, commandId: 'CMD-TEST-INTERN-1' });
assert.throws(
    () => transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'CANCEL', actor: { role: 'STUDENT', id: 'USER-OTHER-STUDENT' }, opinion: '越权取消', context: internshipContext, now, commandId: 'CMD-OTHER-STUDENT' }),
    (error) => error instanceof WorkflowError && error.code === 'HANDLER_FORBIDDEN',
    'only the owning student can cancel an in-flight internship application'
);
assert.throws(
    () => transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'RETURN', actor: actorHr, opinion: '越权退回', context: internshipContext, now, commandId: 'CMD-TEST-INTERN-FORBIDDEN' }),
    (error) => error instanceof WorkflowError && error.code === 'ROLE_FORBIDDEN',
    'company HR cannot act on the counselor review node'
);
internshipRecord = transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'COUNSELOR_APPROVE', actor: actorCounselor, context: internshipContext, now, commandId: 'CMD-TEST-INTERN-2' });
internshipRecord = transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'DEPARTMENT_APPROVE', actor: actorDepartment, context: internshipContext, now, commandId: 'CMD-TEST-INTERN-3' });
internshipRecord = transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'COMPANY_CONFIRM', actor: actorHr, opinion: '企业确认实习安排。', context: internshipContext, now, commandId: 'CMD-TEST-INTERN-4' });
assert.equal(internshipRecord.status, 'APPROVED', 'internship approval must reach company-confirmed archive state');
assert.equal(internshipRecord.approvalRecords.length, 4, 'each internship node must leave an approval record');

assert.throws(
    () => transitionWorkflow({ workflowCode: 'fit_internship_approval', record: internshipRecord, action: 'RETURN', actor: actorHr, context, now }),
    (error) => error instanceof WorkflowError && error.code === 'INVALID_TRANSITION',
    'terminal internship records cannot be returned'
);
assert.throws(
    () => transitionWorkflow({
        workflowCode: 'fit_job_application_flow',
        record: createdApplication,
        action: 'RETURN',
        actor: actorCounselor,
        context,
        now
    }),
    (error) => error instanceof WorkflowError && error.code === 'COMMENT_REQUIRED',
    'returns must require an opinion'
);

const serialized = JSON.stringify({
    aiCallLogs,
    companies,
    employmentDestinations,
    internshipApplications,
    internshipLogs,
    jobApplications,
    jobPostings,
    policyEntries,
    resumeRecords,
    studentProfile,
    tripartiteReviews
});
assert.doesNotMatch(serialized, /1[3-9]\d{9}/, 'cangqiong seed data must not contain mobile numbers');
assert.doesNotMatch(serialized, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, 'cangqiong seed data must not contain email addresses');
assert.doesNotMatch(serialized, /\d{17}[\dXx]/, 'cangqiong seed data must not contain identity card numbers');

console.log(`Cangqiong blueprint validation passed: ${modelCatalog.models.length} models, ${workflows.length} workflows, ${permissionMatrix.menus.length} menus.`);
