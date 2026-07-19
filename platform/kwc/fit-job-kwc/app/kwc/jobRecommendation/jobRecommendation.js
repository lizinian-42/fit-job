import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { showForm } from '@kdcloudjs/kwc-shared-utils/sendBosPlatformEvent';

const JOBS = {
    one: {
        title: '前端开发实习生',
        company: '云途科技 · 杭州 · 180-220 元/天 · 每周 3 天',
        score: 91,
        dimensions: [94, 88, 92, 90, 86, 84],
        reason: 'React、TypeScript 与数据可视化经历命中 JD 的核心硬技能；项目交付经历可映射到经验胜任力，城市、节奏和成长方向均匹配。',
        gap: '单元测试、性能监控和 CI/CD 还缺少可验证证据，不能为了匹配 JD 直接塞关键词。',
        advice: '准备 2 个可量化 STAR 案例：一个讲首屏性能优化，一个讲复杂表格或图表交互，并补齐工程质量追问。',
        applied: false
    },
    two: {
        title: 'AI 产品实习生',
        company: '星环智能 · 上海 · 200-250 元/天 · 可转正',
        score: 87,
        dimensions: [82, 86, 92, 88, 94, 78],
        reason: 'AI 产品原型、需求分析和技术背景形成互补，文化价值观与探索型团队较贴合，工作驱动力分数高。',
        gap: '商业化指标和产品数据分析经验偏少，用户研究样本量尚未形成证据。',
        advice: '准备“用户反馈到原型迭代”的案例，说明如何衡量 AI 功能准确率、采纳率与留存。',
        applied: false
    },
    three: {
        title: '数据可视化实习生',
        company: '数澜科技 · 杭州 · 160-210 元/天 · 远程友好',
        score: 84,
        dimensions: [86, 84, 88, 82, 80, 84],
        reason: 'ECharts、就业驾驶舱和前端交互经历与岗位需求贴合，基础资质风险低，可较快承担看板组件开发。',
        gap: '数据建模、指标口径和大屏性能优化经历不够突出，需要补强数据侧沟通证据。',
        advice: '复盘就业驾驶舱指标设计，准备行业分布、薪资区间和就业率趋势三类图表的口径说明。',
        applied: false
    },
    four: {
        title: '低代码实施顾问实习生',
        company: '金石云服 · 南京 · 150-180 元/天 · 项目制',
        score: 82,
        dimensions: [78, 80, 86, 88, 84, 76],
        reason: '苍穹低代码项目经历与平台配置意识加分，适合参与表单、流程、权限模型和客户化页面落地。',
        gap: '企业实施、客户沟通和业务蓝图文档经验较少，跨城市现场交付为风险项。',
        advice: '准备“岗位申请表单 + 四角色权限矩阵”的设计说明，突出你如何把业务规则映射到平台能力。',
        applied: false
    },
    five: {
        title: 'Java 后端开发实习生',
        company: '辰海软件 · 苏州 · 170-220 元/天 · Java 17',
        score: 76,
        dimensions: [70, 74, 72, 82, 78, 62],
        reason: '具备 TypeScript 与部分 Java 基础，若聚焦 AI 网关或匹配服务方向，仍有成长空间。',
        gap: 'Spring Boot、JUnit、数据库事务和接口设计证据不足；若 JD 硬性要求后端生产经验，应触发谨慎或否决。',
        advice: '先补一个 Java 服务小项目，准备 DTO、Bean Validation、单元测试和异常处理四类基础问题。',
        applied: false
    }
};

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

    backToWorkbench() {
        if (this.isLocalPreview()) {
            this.navigateLocal('student');
            return;
        }

        this.openForm('studentWorkbenchPage');
    }

    openResumeDiagnosis() {
        if (this.isLocalPreview()) {
            this.navigateLocal('resume');
            return;
        }

        this.openForm('resumeDiagnosisPage');
    }

    openPolicyQa() {
        if (this.isLocalPreview()) {
            this.navigateLocal('policy');
            return;
        }

        this.openForm('policyQaPage');
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

    openForm(formId) {
        showForm(
            {
                formId,
                parentPageId: '',
                params: { openStyle: { showType: 10 } }
            },
            { version: 'v1', isv: '', app: 'fitjob' }
        );
    }

    isLocalPreview() {
        return ['localhost', '127.0.0.1'].includes(window.location.hostname);
    }

    navigateLocal(page) {
        window.dispatchEvent(new CustomEvent('fitjob:navigate', { detail: { page } }));
    }
}
