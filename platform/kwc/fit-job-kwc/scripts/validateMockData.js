import assert from 'node:assert/strict';
import {
    companies,
    dashboardSnapshot,
    demoRoutes,
    demoStory,
    internshipApplications,
    interviewSession,
    jobApplications,
    jobPostings,
    mockDataContract,
    policyQaCases,
    resumeDiagnosis,
    resumeRecords,
    studentProfile
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
    companies,
    dashboardSnapshot,
    internshipApplications,
    interviewSession,
    jobApplications,
    jobPostings,
    policyQaCases,
    resumeDiagnosis,
    resumeRecords,
    studentProfile
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

assert.deepEqual(demoStory.map((step) => step.order), [1, 2, 3, 4, 5, 6], 'demo story order must be continuous');
assert.ok(demoStory.every((step) => demoRoutes.some((route) => route.key === step.routeKey)), 'demo story routes must exist');
assert.equal(mockDataContract.privacyLevel, 'ANONYMOUS_DEMO_ONLY');

console.log('Mock data validation passed: 7 routes, 10 business datasets, anonymous demo records only.');
