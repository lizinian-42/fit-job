import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { showForm } from '@kdcloudjs/kwc-shared-utils/sendBosPlatformEvent';

export default class StudentWorkbench extends KingdeeElement {
  @track notice = '';
  @track todoResumeDone = false;
  @track todoJobDone = false;
  @track todoInterviewDone = false;

  get noticeClass() {
      return this.notice ? 'notice notice--visible' : 'notice';
  }

  get todoResumeClass() {
      return this.todoResumeDone ? 'todo-item todo-item--done' : 'todo-item';
  }

  get todoJobClass() {
      return this.todoJobDone ? 'todo-item todo-item--done' : 'todo-item';
  }

  get todoInterviewClass() {
      return this.todoInterviewDone ? 'todo-item todo-item--done' : 'todo-item';
  }

  get todoResumeMark() {
      return this.todoResumeDone ? '✓' : '';
  }

  get todoJobMark() {
      return this.todoJobDone ? '✓' : '';
  }

  get todoInterviewMark() {
      return this.todoInterviewDone ? '✓' : '';
  }

  get pendingTodoText() {
      const completed = [this.todoResumeDone, this.todoJobDone, this.todoInterviewDone].filter(Boolean).length;
      return `${3 - completed} 项待完成`;
  }

  openResumeDiagnosis() {
      if (this.isLocalPreview()) {
          this.navigateLocal('resume');
          return;
      }

      showForm(
          {
              formId: 'resumeDiagnosisPage',
              parentPageId: '',
              params: { openStyle: { showType: 10 } }
          },
          { version: 'v1', isv: '', app: 'fitjob' }
      );
  }

  refreshJobs() {
      this.showNotice('已刷新岗位推荐：新增 2 个匹配度超过 85% 的岗位。');
  }

  openJobRecommendation() {
      if (this.isLocalPreview()) {
          this.navigateLocal('jobs');
          return;
      }

      showForm(
          {
              formId: 'jobRecommendationPage',
              parentPageId: '',
              params: { openStyle: { showType: 10 } }
          },
          { version: 'v1', isv: '', app: 'fitjob' }
      );
  }

  openInterviewTraining() {
      this.showNotice('AI 面试训练入口已准备，可继续接入面试训练页面。');
  }

  openInternshipLog() {
      this.showNotice('实习日志入口已准备，可映射到苍穹标准表单。');
  }

  openPolicyQa() {
      if (this.isLocalPreview()) {
          this.navigateLocal('policy');
          return;
      }

      showForm(
          {
              formId: 'policyQaPage',
              parentPageId: '',
              params: { openStyle: { showType: 10 } }
          },
          { version: 'v1', isv: '', app: 'fitjob' }
      );
  }

  openFirstJob() {
      this.openJobRecommendation();
  }

  openSecondJob() {
      this.openJobRecommendation();
  }

  closeNotice() {
      this.notice = '';
  }

  toggleResumeTodo() {
      this.todoResumeDone = !this.todoResumeDone;
  }

  toggleJobTodo() {
      this.todoJobDone = !this.todoJobDone;
  }

  toggleInterviewTodo() {
      this.todoInterviewDone = !this.todoInterviewDone;
  }

  showNotice(message) {
      this.notice = message;
  }

  isLocalPreview() {
      return ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }

  navigateLocal(page) {
      window.dispatchEvent(new CustomEvent('fitjob:navigate', { detail: { page } }));
  }
}
