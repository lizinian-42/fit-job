import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { interviewSession, jobPostings, studentProfile } from '../demoData.js';
import { navigateTo } from '../demoNavigation.js';

export default class InterviewTraining extends KingdeeElement {
    @track selectedTypeKey = interviewSession.defaultType;
    @track currentQuestionIndex = 0;
    @track currentAnswer = '';
    @track answers = {};
    @track reportReady = false;
    @track notice = '';

    get selectedType() {
        return interviewSession.types.find((type) => type.key === this.selectedTypeKey);
    }

    get questions() {
        return interviewSession.questions[this.selectedTypeKey];
    }

    get currentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    get questionNumber() {
        return this.currentQuestionIndex + 1;
    }

    get questionCount() {
        return this.questions.length;
    }

    get targetRole() {
        return jobPostings[0].title;
    }

    get studentName() {
        return studentProfile.displayName;
    }

    get typeDescription() {
        return this.selectedType.description;
    }

    get currentQuestionText() {
        return this.currentQuestion.question;
    }

    get currentQuestionFocus() {
        return this.currentQuestion.focus;
    }

    get currentDimension() {
        return this.currentQuestion.dimension;
    }

    get hrClass() {
        return this.getTypeClass('HR');
    }

    get technicalClass() {
        return this.getTypeClass('TECHNICAL');
    }

    get comprehensiveClass() {
        return this.getTypeClass('COMPREHENSIVE');
    }

    get answeredCount() {
        const savedQuestionIds = new Set(
            Object.entries(this.answers)
                .filter(([, answer]) => answer.trim())
                .map(([questionId]) => questionId)
        );

        if (this.currentAnswer.trim()) {
            savedQuestionIds.add(this.currentQuestion.questionId);
        }

        return savedQuestionIds.size;
    }

    get progressText() {
        return `${this.answeredCount} / ${this.questionCount}`;
    }

    get liveScore() {
        const answer = this.currentAnswer.trim();
        const lengthScore = Math.min(30, Math.round(answer.length / 7));
        const evidenceScore = /\d|%|指标|数据|效率|用户/.test(answer) ? 18 : 8;
        const structureScore = /背景|任务|行动|结果|复盘|先|再|最后/.test(answer) ? 20 : 10;
        return Math.min(94, 34 + lengthScore + evidenceScore + structureScore);
    }

    get scoreBarClass() {
        if (this.liveScore >= 80) {
            return 'score-bar score-bar--high';
        }
        if (this.liveScore >= 65) {
            return 'score-bar score-bar--medium';
        }
        return 'score-bar score-bar--base';
    }

    get previousDisabled() {
        return this.currentQuestionIndex === 0;
    }

    get submitButtonText() {
        return this.currentQuestionIndex === this.questionCount - 1 ? '生成面试报告' : '保存并进入下一题';
    }

    get noticeClass() {
        return this.notice ? 'notice notice--visible' : 'notice';
    }

    get reportClass() {
        return this.reportReady ? 'report-card report-card--ready' : 'report-card';
    }

    get reportStatus() {
        return this.reportReady ? '报告已生成' : '完成三题后生成';
    }

    get reportScore() {
        return this.reportReady ? interviewSession.report.overallScore : '--';
    }

    get reportLevel() {
        return this.reportReady ? interviewSession.report.level : '等待训练完成';
    }

    get logicScore() {
        return interviewSession.report.dimensions[0].score;
    }

    get completenessScore() {
        return interviewSession.report.dimensions[1].score;
    }

    get expressionScore() {
        return interviewSession.report.dimensions[2].score;
    }

    get roleFitScore() {
        return interviewSession.report.dimensions[3].score;
    }

    selectHr() {
        this.selectType('HR');
    }

    selectTechnical() {
        this.selectType('TECHNICAL');
    }

    selectComprehensive() {
        this.selectType('COMPREHENSIVE');
    }

    handleAnswerInput(event) {
        this.currentAnswer = event.target.value;
    }

    fillSampleAnswer() {
        this.currentAnswer = this.currentQuestion.sampleAnswer;
        this.notice = '已填入匿名 Mock 示例答案，可继续修改后提交。';
    }

    previousQuestion() {
        if (this.previousDisabled) {
            return;
        }

        this.saveCurrentAnswer();
        this.currentQuestionIndex -= 1;
        this.loadCurrentAnswer();
        this.reportReady = false;
    }

    submitAnswer() {
        if (!this.currentAnswer.trim()) {
            this.notice = '请先输入回答，或使用“填入示例答案”。';
            return;
        }

        this.saveCurrentAnswer();

        if (this.currentQuestionIndex < this.questionCount - 1) {
            this.currentQuestionIndex += 1;
            this.loadCurrentAnswer();
            this.notice = `已保存第 ${this.currentQuestionIndex} 题，进入下一题。`;
            return;
        }

        this.reportReady = true;
        this.notice = '面试报告已生成：包含四维评分、改进建议和下一轮训练方向。';
    }

    resetSession() {
        this.currentQuestionIndex = 0;
        this.currentAnswer = '';
        this.answers = {};
        this.reportReady = false;
        this.notice = '本轮 Mock 面试已重置。';
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

    selectType(typeKey) {
        this.selectedTypeKey = typeKey;
        this.currentQuestionIndex = 0;
        this.currentAnswer = '';
        this.answers = {};
        this.reportReady = false;
        this.notice = `已切换为${this.selectedType.label}。`;
    }

    getTypeClass(typeKey) {
        return this.selectedTypeKey === typeKey ? 'type-button type-button--active' : 'type-button';
    }

    saveCurrentAnswer() {
        this.answers = {
            ...this.answers,
            [this.currentQuestion.questionId]: this.currentAnswer
        };
    }

    loadCurrentAnswer() {
        this.currentAnswer = this.answers[this.currentQuestion.questionId] || '';
    }
}
