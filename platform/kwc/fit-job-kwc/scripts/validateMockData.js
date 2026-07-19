import assert from 'node:assert/strict';
import { resetDemoApplications, submitJobApplication } from '../app/kwc/applicationGateway.js';
import {
    aiCallLogs,
    companies,
    dashboardSnapshot,
    demoRoutes,
    demoStory,
    employmentDestinations,
    internshipApplications,
    internshipLogs,
    interviewSession,
    jobApplications,
    jobPostings,
    mockDataContract,
    policyEntries,
    policyQaCases,
    resumeDiagnosis,
    resumeRecords,
    studentProfile,
    tripartiteReviews
} from '../app/kwc/demoData.js';

function assertUnique(values, label) {
    assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

assert.deepEqual(
    demoRoutes.map((route) => route.key),
    ['home', 'student', 'resume', 'jobs', 'interview', 'policy', 'dashboard'],
    'demo routes must cover the full milestone story'
);
assertUnique(demoRoutes.map((route) => route.path), 'route paths');
assertUnique(demoRoutes.map((route) => route.formId), 'form ids');

assert.match(studentProfile.displayName, /^学生 [A-Z]$/, 'student profile must use an anonymous display name');
dashboardSnapshot.riskStudents.forEach((student) => {
    assert.match(student.displayName, /^学生 [A-Z]$/, 'risk students must use anonymous display names');
});

const serializedData = JSON.stringify({
    aiCallLogs,
    companies,
    dashboardSnapshot,
    employmentDestinations,
    internshipApplications,
    internshipLogs,
    interviewSession,
    jobApplications,
    jobPostings,
    policyEntries,
    policyQaCases,
    resumeDiagnosis,
    resumeRecords,
    studentProfile,
    tripartiteReviews
});
assert.doesNotMatch(serializedData, /1[3-9]\d{9}/, 'mock data must not contain mobile numbers');
assert.doesNotMatch(serializedData, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, 'mock data must not contain email addresses');
assert.doesNotMatch(serializedData, /\d{17}[\dXx]/, 'mock data must not contain identity card numbers');

assert.equal(resumeDiagnosis.studentId, studentProfile.studentId, 'resume report must reference the demo student');
assert.ok(jobPostings.some((job) => job.jobId === resumeDiagnosis.targetJobId), 'resume report target job must exist');
assertUnique(companies.map((company) => company.companyId), 'company ids');
assertUnique(jobPostings.map((job) => job.jobId), 'job ids');
assert.ok(jobPostings.every((job) => job.dimensions.length === 6), 'each job must expose six match dimensions');
jobPostings.forEach((job) => {
    const company = companies.find((item) => item.companyId === job.companyId);
    assert.ok(company, `job ${job.jobId} must reference a company`);
    assert.equal(job.companyName, company.companyName, `job ${job.jobId} company name must match its company record`);
});

assertUnique(resumeRecords.map((resume) => resume.resumeId), 'resume ids');
assert.equal(resumeRecords.filter((resume) => resume.isDefault).length, 1, 'exactly one resume must be the default');
resumeRecords.forEach((resume) => {
    assert.equal(resume.studentId, studentProfile.studentId, `resume ${resume.resumeId} must reference the demo student`);
    assert.ok(
        resume.targetJobId === null || jobPostings.some((job) => job.jobId === resume.targetJobId),
        `resume ${resume.resumeId} target job must exist`
    );
});

assertUnique(jobApplications.map((application) => application.applicationId), 'job application ids');
jobApplications.forEach((application) => {
    const job = jobPostings.find((item) => item.jobId === application.jobId);
    assert.ok(job, `job application ${application.applicationId} must reference a job`);
    assert.equal(application.studentId, studentProfile.studentId, `job application ${application.applicationId} must reference the demo student`);
    assert.equal(application.companyId, job.companyId, `job application ${application.applicationId} company must match its job`);
    assert.ok(resumeRecords.some((resume) => resume.resumeId === application.resumeId), `job application ${application.applicationId} must reference a resume`);
});

assertUnique(internshipApplications.map((application) => application.internshipApplicationId), 'internship application ids');
internshipApplications.forEach((application) => {
    const jobApplication = jobApplications.find((item) => item.applicationId === application.jobApplicationId);
    assert.ok(jobApplication, `internship application ${application.internshipApplicationId} must reference a job application`);
    assert.equal(application.studentId, jobApplication.studentId, `internship application ${application.internshipApplicationId} student must match its job application`);
    assert.equal(application.jobId, jobApplication.jobId, `internship application ${application.internshipApplicationId} job must match its job application`);
    assert.equal(application.companyId, jobApplication.companyId, `internship application ${application.internshipApplicationId} company must match its job application`);
    assert.equal(application.resumeId, jobApplication.resumeId, `internship application ${application.internshipApplicationId} resume must match its job application`);
});

internshipLogs.forEach((log) => {
    const application = internshipApplications.find((item) => item.internshipApplicationId === log.internshipApplicationId);
    assert.ok(application, `internship log ${log.logId} must reference an internship application`);
    assert.equal(log.studentId, application.studentId, `internship log ${log.logId} student must match its application`);
});
tripartiteReviews.forEach((review) => {
    const application = internshipApplications.find((item) => item.internshipApplicationId === review.internshipApplicationId);
    assert.ok(application, `review ${review.reviewId} must reference an internship application`);
    assert.equal(review.companyId, application.companyId, `review ${review.reviewId} company must match its application`);
});
employmentDestinations.forEach((destination) => {
    assert.equal(destination.studentId, studentProfile.studentId, `destination ${destination.destinationId} must reference the demo student`);
    assert.ok(destination.companyId === null || companies.some((company) => company.companyId === destination.companyId), `destination ${destination.destinationId} company must exist`);
});
aiCallLogs.forEach((log) => {
    assert.equal(log.studentId, studentProfile.studentId, `AI call ${log.callId} must reference the demo student`);
    assert.ok(log.requestHash.startsWith('MOCK-'), `AI call ${log.callId} must use a mock request hash`);
});

Object.values(interviewSession.questions).forEach((questions) => {
    assert.equal(questions.length, 3, 'each interview type must contain three mock questions');
});
assert.deepEqual(
    interviewSession.report.dimensions.map((dimension) => dimension.label),
    ['逻辑性', '完整性', '表达力', '岗位相关性'],
    'interview report dimensions must satisfy the front-end contract'
);

assert.ok(policyQaCases.every((item) => item.referenceInfos.length > 0), 'policy answers must include references');
assert.ok(policyQaCases.flatMap((item) => item.referenceInfos).every((source) => source.sourceId.startsWith('MOCK-')), 'policy sources must be marked as mock');
assert.ok(
    policyQaCases.flatMap((item) => item.referenceInfos).every((source) => policyEntries.some((policy) => policy.policyId === source.sourceId)),
    'policy answer references must point to policy entries'
);

assert.deepEqual(demoStory.map((step) => step.order), [1, 2, 3, 4, 5, 6], 'demo story order must be continuous');
assert.ok(demoStory.every((step) => demoRoutes.some((route) => route.key === step.routeKey)), 'demo story routes must exist');
assert.equal(mockDataContract.privacyLevel, 'ANONYMOUS_DEMO_ONLY');

resetDemoApplications([]);
const demoApplicationPayload = {
    studentId: studentProfile.studentId,
    studentUserId: studentProfile.studentUserId,
    jobId: jobPostings[2].jobId,
    companyId: jobPostings[2].companyId,
    resumeId: resumeRecords[0].resumeId
};
const firstDemoApplication = await submitJobApplication(demoApplicationPayload, { platformApi: null, allowDemoFallback: true });
const replayedDemoApplication = await submitJobApplication(demoApplicationPayload, { platformApi: null, allowDemoFallback: true });
assert.equal(firstDemoApplication.status, 'SUBMITTED', 'KWC one-click apply must create a submitted application');
assert.equal(firstDemoApplication.applicationId, replayedDemoApplication.applicationId, 'KWC one-click apply must be idempotent');
assert.equal(replayedDemoApplication.replayed, true, 'replayed KWC application must be marked');
assert.notEqual(firstDemoApplication.createCommandId, firstDemoApplication.approvalRecords[0].commandId, 'Demo create and submit commands must be distinct');

resetDemoApplications();
const existingDemoApplication = await submitJobApplication({
    ...demoApplicationPayload,
    jobId: jobPostings[0].jobId,
    companyId: jobPostings[0].companyId
}, { platformApi: null, allowDemoFallback: true });
assert.equal(existingDemoApplication.applicationId, jobApplications[0].applicationId, 'standalone gateway must reuse an existing active application');
assert.equal(existingDemoApplication.replayed, true, 'existing active application must be returned as an idempotent replay');

resetDemoApplications([{
    ...demoApplicationPayload,
    applicationId: 'JOB-APP-DEMO-DRAFT-001',
    status: 'DRAFT',
    currentNode: 'DRAFT'
}]);
const submittedDraftApplication = await submitJobApplication({
    ...demoApplicationPayload,
    createCommandId: 'CMD-DEMO-DRAFT-CREATE-REQUEST',
    submitCommandId: 'CMD-DEMO-DRAFT-SUBMIT-001'
}, { platformApi: null, allowDemoFallback: true });
assert.equal(submittedDraftApplication.applicationId, 'JOB-APP-DEMO-DRAFT-001', 'one-click apply must submit the existing draft instead of creating a duplicate');
assert.equal(submittedDraftApplication.status, 'SUBMITTED', 'existing draft must enter counselor review');
assert.equal(submittedDraftApplication.approvalRecords.at(-1).commandId, 'CMD-DEMO-DRAFT-SUBMIT-001');

resetDemoApplications([{
    ...demoApplicationPayload,
    applicationId: 'JOB-APP-DEMO-RETURNED-001',
    createCommandId: 'CMD-DEMO-RETURNED-CREATE-001',
    status: 'RETURNED',
    currentNode: 'RETURNED',
    approvalRecords: [{ commandId: 'CMD-DEMO-RETURNED-SUBMIT-OLD' }]
}]);
const staleReturnedReplay = await submitJobApplication({
    ...demoApplicationPayload,
    createCommandId: 'CMD-DEMO-RETURNED-CREATE-001',
    submitCommandId: 'CMD-DEMO-RETURNED-SUBMIT-OLD'
}, { platformApi: null, allowDemoFallback: true });
assert.equal(staleReturnedReplay.status, 'RETURNED', 'an old submit command must remain an idempotent replay');
const resubmittedDemoApplication = await submitJobApplication({
    ...demoApplicationPayload,
    createCommandId: 'CMD-DEMO-RETURNED-CREATE-001',
    submitCommandId: 'CMD-DEMO-RETURNED-SUBMIT-NEW'
}, { platformApi: null, allowDemoFallback: true });
assert.equal(resubmittedDemoApplication.status, 'SUBMITTED', 'a returned Demo application must accept a new submit command');
resetDemoApplications([{
    ...demoApplicationPayload,
    applicationId: 'JOB-APP-DEMO-RETURNED-IMMUTABLE-001',
    createCommandId: 'CMD-DEMO-RETURNED-IMMUTABLE-CREATE',
    status: 'RETURNED',
    currentNode: 'RETURNED',
    approvalRecords: []
}]);
await assert.rejects(
    submitJobApplication({
        ...demoApplicationPayload,
        resumeId: 'RESUME-DEMO-OTHER-ACTIVE',
        createCommandId: 'CMD-DEMO-RETURNED-IMMUTABLE-CREATE',
        submitCommandId: 'CMD-DEMO-RETURNED-IMMUTABLE-SUBMIT'
    }, { platformApi: null, allowDemoFallback: true }),
    /现有岗位申请与当前学生、企业或简历不一致/,
    'Demo resubmission must not replace immutable application ownership links'
);
resetDemoApplications([resubmittedDemoApplication]);
const replayedResubmission = await submitJobApplication({
    ...demoApplicationPayload,
    createCommandId: 'CMD-DEMO-RETURNED-CREATE-001',
    submitCommandId: 'CMD-DEMO-RETURNED-SUBMIT-NEW'
}, { platformApi: null, allowDemoFallback: true });
assert.equal(replayedResubmission.replayed, true, 'repeating a Demo resubmit command must be idempotent');

let platformRequest;
const platformApplication = await submitJobApplication(demoApplicationPayload, {
    platformApi: {
        async submitJobApplication(request) {
            platformRequest = request;
            return { applicationId: 'JOB-APP-PLATFORM-001', status: 'SUBMITTED' };
        }
    }
});
assert.equal(platformApplication.applicationId, 'JOB-APP-PLATFORM-001', 'gateway must use the injected platform API');
assert.match(platformRequest.createCommandId, /^JOB_CREATE:/, 'platform request must include a create idempotency command');
assert.match(platformRequest.submitCommandId, /^JOB_SUBMIT:/, 'platform request must include a distinct submit command');
assert.notEqual(platformRequest.createCommandId, platformRequest.submitCommandId);
assert.equal(platformRequest.commandId, platformRequest.createCommandId, 'legacy commandId must remain compatible with the create command');

await assert.rejects(
    submitJobApplication({
        ...demoApplicationPayload,
        createCommandId: 'C'.repeat(129),
        submitCommandId: 'CMD-KWC-LENGTH-GUARD'
    }, { platformApi: null, allowDemoFallback: true }),
    /cannot exceed 128 characters/,
    'KWC gateway must reject command ids that cannot fit the platform model'
);

await assert.rejects(
    submitJobApplication(demoApplicationPayload, { platformApi: null, allowDemoFallback: false }),
    /苍穹岗位申请服务未就绪/,
    'production mode must not silently fall back to an in-memory application'
);

console.log('Mock data validation passed: 7 routes, 15 business datasets, anonymous demo records only.');
