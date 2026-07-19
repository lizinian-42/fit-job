import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { dashboardSnapshot } from '../demoData.js';
import { navigateTo } from '../demoNavigation.js';

export default class EmploymentDashboard extends KingdeeElement {
    @track generatedAt = dashboardSnapshot.generatedAt;
    @track notice = '';

    get collegeName() {
        return dashboardSnapshot.collegeName;
    }

    get graduationYear() {
        return dashboardSnapshot.graduationYear;
    }

    get employmentRate() {
        return `${dashboardSnapshot.metrics[0].value}%`;
    }

    get employmentDelta() {
        return `较上月 +${dashboardSnapshot.metrics[0].delta}%`;
    }

    get internshipCount() {
        return dashboardSnapshot.metrics[1].value;
    }

    get internshipDelta() {
        return `较上月 +${dashboardSnapshot.metrics[1].delta} 人`;
    }

    get unemployedCount() {
        return dashboardSnapshot.metrics[2].value;
    }

    get unemployedDelta() {
        return `较上月 ${dashboardSnapshot.metrics[2].delta} 人`;
    }

    get riskStudentCount() {
        return dashboardSnapshot.metrics[3].value;
    }

    get riskStudentDelta() {
        return `较上月 ${dashboardSnapshot.metrics[3].delta} 人`;
    }

    get firstRiskStudent() {
        return dashboardSnapshot.riskStudents[0].displayName;
    }

    get secondRiskStudent() {
        return dashboardSnapshot.riskStudents[1].displayName;
    }

    get thirdRiskStudent() {
        return dashboardSnapshot.riskStudents[2].displayName;
    }

    get firstHighlight() {
        return dashboardSnapshot.aiHighlights[0];
    }

    get secondHighlight() {
        return dashboardSnapshot.aiHighlights[1];
    }

    get thirdHighlight() {
        return dashboardSnapshot.aiHighlights[2];
    }

    get noticeClass() {
        return this.notice ? 'notice notice--visible' : 'notice';
    }

    refreshSnapshot() {
        this.generatedAt = new Date().toLocaleString('zh-CN', {
            hour12: false,
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.notice = '已使用最新匿名 Mock 快照刷新就业指标。';
    }

    exportSummary() {
        this.notice = '已生成阶段汇报摘要：包含趋势、风险学生与 AI 质量建议。';
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
}
