import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { studentProfile } from '../demoData.js';
import { navigateTo } from '../demoNavigation.js';

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

  get studentName() {
      return studentProfile.displayName;
  }

  get studentAvatar() {
      return studentProfile.avatarText;
  }

  get studentMeta() {
      return `${studentProfile.majorName} · ${studentProfile.graduationYear} 届`;
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

  refreshJobs() {
      this.showNotice('已刷新岗位推荐：新增 2 个匹配度超过 85% 的岗位。');
  }

  openJobRecommendation() {
      navigateTo('jobs');
  }

  openInterviewTraining() {
      navigateTo('interview');
  }

  openInternshipLog() {
      this.showNotice('实习日志入口已准备，可映射到苍穹标准表单。');
  }

  openPolicyQa() {
      navigateTo('policy');
  }

  openEmploymentDashboard() {
      navigateTo('dashboard');
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
}
