import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { policyQaCases, studentProfile } from '../demoData.js';
import { navigateTo } from '../demoNavigation.js';

export default class PolicyQa extends KingdeeElement {
    @track activeCategory = 'subsidy';
    @track draftQuestion = policyQaCases[0].question;
    @track notice = '';

    get activeCategoryText() {
        const categoryTextMap = {
            subsidy: '当前分类：就业补贴',
            startup: '当前分类：创业扶持',
            trainee: '当前分类：见习项目',
            grassroots: '当前分类：基层就业'
        };
        return categoryTextMap[this.activeCategory];
    }

    get subsidyClass() {
        return this.getCategoryClass('subsidy');
    }

    get startupClass() {
        return this.getCategoryClass('startup');
    }

    get traineeClass() {
        return this.getCategoryClass('trainee');
    }

    get grassrootsClass() {
        return this.getCategoryClass('grassroots');
    }

    get pushOneTitle() {
        if (this.activeCategory === 'startup') {
            return '浙江省高校毕业生创业担保贷款';
        }
        if (this.activeCategory === 'trainee') {
            return '青年就业见习补贴申领';
        }
        if (this.activeCategory === 'grassroots') {
            return '基层就业学费补偿政策';
        }
        return '杭州市高校毕业生就业补贴';
    }

    get pushOneDesc() {
        if (this.activeCategory === 'startup') {
            return '适合有创业项目或已办理营业执照的毕业生。';
        }
        if (this.activeCategory === 'trainee') {
            return '适合离校未就业且进入备案见习基地的毕业生。';
        }
        if (this.activeCategory === 'grassroots') {
            return '适合服务基层项目、艰苦地区就业意向学生。';
        }
        return '与你的毕业届别、意向城市和就业状态匹配度高。';
    }

    get pushTwoTitle() {
        if (this.activeCategory === 'subsidy') {
            return '杭州市新引进应届大学生租房补贴';
        }
        return '求职创业补贴申请提醒';
    }

    get pushTwoDesc() {
        if (this.activeCategory === 'subsidy') {
            return '建议在签约参保后核对租房、社保和学历条件。';
        }
        return '系统将根据困难类型、毕业时间和院系审核状态提醒材料。';
    }

    get pushThreeTitle() {
        return '政策材料完整度校验';
    }

    get pushThreeDesc() {
        return '检查身份证明、毕业证明、合同、社保和申请表是否齐全。';
    }

    get noticeClass() {
        return this.notice ? 'notice notice--visible' : 'notice';
    }

    get studentName() {
        return studentProfile.displayName;
    }

    get studentAvatar() {
        return studentProfile.avatarText;
    }

    get studentMeta() {
        return `示例地区 · ${studentProfile.graduationYear} 届毕业生`;
    }

    selectSubsidy() {
        this.setCategory('subsidy', '已切换到就业补贴知识库分区。');
    }

    selectStartup() {
        this.setCategory('startup', '已切换到创业扶持知识库分区。');
    }

    selectTrainee() {
        this.setCategory('trainee', '已切换到见习项目知识库分区。');
    }

    selectGrassroots() {
        this.setCategory('grassroots', '已切换到基层就业知识库分区。');
    }

    askPromptOne() {
        this.draftQuestion = '杭州应届生能申请哪些就业补贴？';
        this.notice = '已填入示例问题，并展示带来源引用的 Mock 回答。';
    }

    askPromptTwo() {
        this.draftQuestion = '创业担保贷款需要哪些材料？';
        this.notice = '已填入创业扶持问题，右侧来源卡片展示政策依据。';
    }

    askPromptThree() {
        this.draftQuestion = '见习补贴和实习工资能同时享受吗？';
        this.notice = '已填入见习项目问题，答案会提示以地方细则为准。';
    }

    handleQuestionInput(event) {
        this.draftQuestion = event.target.value;
    }

    sendQuestion() {
        const question = this.draftQuestion.trim();
        if (!question) {
            this.notice = '请输入政策问题后再检索知识库。';
            return;
        }

        this.notice = `已模拟检索政策知识库：「${question}」，命中 3 条来源引用。`;
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

    getCategoryClass(category) {
        return this.activeCategory === category ? 'category-card category-card--active' : 'category-card';
    }

    setCategory(category, message) {
        this.activeCategory = category;
        this.notice = message;
    }

}
