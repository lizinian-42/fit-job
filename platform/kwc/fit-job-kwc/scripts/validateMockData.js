import assert from 'node:assert/strict';
import {
    dashboardSnapshot,
    demoRoutes,
    demoStory,
    interviewSession,
    jobPostings,
    mockDataContract,
    policyQaCases,
    resumeDiagnosis,
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
    dashboardSnapshot,
    interviewSession,
    jobPostings,
    policyQaCases,
    resumeDiagnosis,
    studentProfile
});
assert.doesNotMatch(serializedData, /1[3-9]\d{9}/, 'mock data must not contain mobile numbers');
assert.doesNotMatch(serializedData, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, 'mock data must not contain email addresses');
assert.doesNotMatch(serializedData, /\d{17}[\dXx]/, 'mock data must not contain identity card numbers');

assert.equal(resumeDiagnosis.studentId, studentProfile.studentId, 'resume report must reference the demo student');
assert.ok(jobPostings.some((job) => job.jobId === resumeDiagnosis.targetJobId), 'resume report target job must exist');
assertUnique(jobPostings.map((job) => job.jobId), 'job ids');
assert.ok(jobPostings.every((job) => job.dimensions.length === 6), 'each job must expose six match dimensions');

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

console.log('Mock data validation passed: 7 routes, 6 business datasets, anonymous demo records only.');
