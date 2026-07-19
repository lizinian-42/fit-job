import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { jobPostings, studentProfile } from '../demoData.js';
import { navigateTo } from '../demoNavigation.js';

const JOBS = Object.fromEntries(jobPostings.map((job) => [
    job.key,
    {
        ...job,
        company: `${job.companyName} · ${job.city} · ${job.compensation} · ${job.attendance}`,
        score: job.matchScore
    }
]));

export default class JobRecommendation extends KingdeeElement {
    @track selectedJobId = 'one';
    @track notice = '';
    @track rankedAt = '2026-07-18 22:56';
    @track appliedOne = false;
    @track appliedTwo = false;
    @track appliedThree = false;
    @track appliedFour = false;
    @track appliedFive = false;

    get selectedJob() {
        return JOBS[this.selectedJobId];
    }

    get selectedTitle() {
        return this.selectedJob.title;
    }

    get selectedCompany() {
        return this.selectedJob.company;
    }

    get selectedScore() {
        return this.selectedJob.score;
    }

    get selectedReason() {
        return this.selectedJob.reason;
    }

    get selectedGap() {
        return this.selectedJob.gap;
    }

    get selectedAdvice() {
        return this.selectedJob.advice;
    }

    get skillScore() {
        return this.selectedJob.dimensions[0];
    }

    get experienceScore() {
        return this.selectedJob.dimensions[1];
    }

    get cultureScore() {
        return this.selectedJob.dimensions[2];
    }

    get potentialScore() {
        return this.selectedJob.dimensions[3];
    }

    get motivationScore() {
        return this.selectedJob.dimensions[4];
    }

    get riskScore() {
        return this.selectedJob.dimensions[5];
    }

    get skillBarClass() {
        return this.getBarClass(this.skillScore);
    }

    get experienceBarClass() {
        return this.getBarClass(this.experienceScore);
    }

    get intentBarClass() {
        return this.getBarClass(this.cultureScore);
    }

    get conditionBarClass() {
        return this.getBarClass(this.potentialScore);
    }

    get growthBarClass() {
        return this.getBarClass(this.motivationScore);
    }

    get riskBarClass() {
        return this.getBarClass(this.riskScore);
    }

    get jobOneClass() {
        return this.getJobClass('one');
    }

    get jobTwoClass() {
        return this.getJobClass('two');
    }

    get jobThreeClass() {
        return this.getJobClass('three');
    }

    get jobFourClass() {
        return this.getJobClass('four');
    }

    get jobFiveClass() {
        return this.getJobClass('five');
    }

    get noticeClass() {
        return this.notice ? 'notice notice--visible' : 'notice';
    }

    get applyButtonText() {
        return this.isSelectedApplied() ? '已生成申请单' : '一键申请';
    }

    get applyButtonClass() {
        return this.isSelectedApplied() ? 'button-done' : 'button-primary';
    }

    get applySummary() {
        return this.isSelectedApplied() ? '申请状态：已提交，等待辅导员审核' : '申请状态：草稿，可从推荐岗位一键发起';
    }

    get studentName() {
        return studentProfile.displayName;
    }

    get studentAvatar() {
        return studentProfile.avatarText;
    }

    get studentMeta() {
        return `${studentProfile.majorName} · ${studentProfile.graduationYear} 届`;
    }

    selectJobOne() {
        this.selectedJobId = 'one';
    }

    selectJobTwo() {
        this.selectedJobId = 'two';
    }

    selectJobThree() {
        this.selectedJobId = 'three';
    }

    selectJobFour() {
        this.selectedJobId = 'four';
    }

    selectJobFive() {
        this.selectedJobId = 'five';
    }

    refreshRanking() {
        this.rankedAt = new Date().toLocaleString('zh-CN', {
            hour12: false,
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.notice = '已基于最新学生画像重新排序，当前推荐列表保持稳定。';
    }

    applySelectedJob() {
        if (this.isSelectedApplied()) {
            this.notice = `「${this.selectedTitle}」申请单已提交，请等待辅导员审核。`;
            return;
        }

        this.setApplied(this.selectedJobId);
        this.notice = `已生成「${this.selectedTitle}」岗位申请单，状态：已提交。`;
    }

    closeNotice() {
        this.notice = '';
    }

    openHome() {
        navigateTo('home');
    }

    openStudentWorkbench() {
        navigateTo('student');
    }

    backToWorkbench() {
        navigateTo('student');
    }

    openResumeDiagnosis() {
        navigateTo('resume');
    }

    openJobRecommendation() {
        navigateTo('jobs');
    }

    openInterviewTraining() {
        navigateTo('interview');
    }

    openPolicyQa() {
        navigateTo('policy');
    }

    openEmploymentDashboard() {
        navigateTo('dashboard');
    }

    getJobClass(jobId) {
        return this.selectedJobId === jobId ? 'job-row job-row--active' : 'job-row';
    }

    getBarClass(score) {
        const roundedScore = Math.round(score / 2) * 2;
        return `bar bar--${roundedScore}`;
    }

    isSelectedApplied() {
        const appliedMap = {
            one: this.appliedOne,
            two: this.appliedTwo,
            three: this.appliedThree,
            four: this.appliedFour,
            five: this.appliedFive
        };
        return appliedMap[this.selectedJobId];
    }

    setApplied(jobId) {
        if (jobId === 'one') {
            this.appliedOne = true;
        } else if (jobId === 'two') {
            this.appliedTwo = true;
        } else if (jobId === 'three') {
            this.appliedThree = true;
        } else if (jobId === 'four') {
            this.appliedFour = true;
        } else {
            this.appliedFive = true;
        }
    }

}
