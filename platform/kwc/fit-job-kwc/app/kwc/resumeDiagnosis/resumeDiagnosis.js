import { KingdeeElement, track } from '@kdcloudjs/kwc';
import { showForm } from '@kdcloudjs/kwc-shared-utils/sendBosPlatformEvent';

export default class ResumeDiagnosis extends KingdeeElement {
  @track selectedResume = '前端开发简历 V3';
  @track selectedJob = '前端开发实习生 · 云途科技';
  @track uploadedFile = '';
  @track diagnosing = false;
  @track diagnosedAt = '2026-07-18 21:42';
  @track suggestionOneStatus = 'pending';
  @track suggestionTwoStatus = 'pending';
  @track suggestionThreeStatus = 'pending';
  @track notice = '';

  get selectedResumeText() {
      return this.uploadedFile || this.selectedResume;
  }

  get diagnosisButtonText() {
      return this.diagnosing ? '正在诊断…' : '✦ 重新诊断';
  }

  get diagnosisButtonClass() {
      return this.diagnosing ? 'button-primary diagnosis-button diagnosis-button--loading' : 'button-primary diagnosis-button';
  }

  get reportClass() {
      return this.diagnosing ? 'report report--loading' : 'report';
  }

  get suggestionOneClass() {
      return this.getSuggestionClass(this.suggestionOneStatus);
  }

  get suggestionTwoClass() {
      return this.getSuggestionClass(this.suggestionTwoStatus);
  }

  get suggestionThreeClass() {
      return this.getSuggestionClass(this.suggestionThreeStatus);
  }

  get suggestionOneState() {
      return this.getSuggestionState(this.suggestionOneStatus);
  }

  get suggestionTwoState() {
      return this.getSuggestionState(this.suggestionTwoStatus);
  }

  get suggestionThreeState() {
      return this.getSuggestionState(this.suggestionThreeStatus);
  }

  get acceptedCountText() {
      const accepted = [this.suggestionOneStatus, this.suggestionTwoStatus, this.suggestionThreeStatus]
          .filter((status) => status === 'accepted').length;
      return `已接受 ${accepted} / 3`;
  }

  get draftDisabled() {
      return ![this.suggestionOneStatus, this.suggestionTwoStatus, this.suggestionThreeStatus]
          .includes('accepted');
  }

  get noticeClass() {
      return this.notice ? 'notice notice--visible' : 'notice';
  }

  handleResumeChange(event) {
      this.selectedResume = event.target.value;
      this.uploadedFile = '';
  }

  handleJobChange(event) {
      this.selectedJob = event.target.value;
  }

  handleUpload(event) {
      const file = event.target.files?.[0];
      if (file) {this.uploadedFile = file.name;}
  }

  runDiagnosis() {
      if (this.diagnosing) {
          return;
      }
      this.diagnosing = true;
      this.diagnosedAt = new Date().toLocaleString('zh-CN', {
          hour12: false,
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
      });
      this.diagnosing = false;
      this.notice = '诊断已更新：当前简历与目标岗位综合匹配度为 86 分。';
  }

  acceptSuggestionOne() {
      this.suggestionOneStatus = 'accepted';
  }

  ignoreSuggestionOne() {
      this.suggestionOneStatus = 'ignored';
  }

  acceptSuggestionTwo() {
      this.suggestionTwoStatus = 'accepted';
  }

  ignoreSuggestionTwo() {
      this.suggestionTwoStatus = 'ignored';
  }

  acceptSuggestionThree() {
      this.suggestionThreeStatus = 'accepted';
  }

  ignoreSuggestionThree() {
      this.suggestionThreeStatus = 'ignored';
  }

  generateDraft() {
      if (this.draftDisabled) {
          return;
      }
      this.notice = '已生成优化草稿 V4，原简历版本保持不变。';
  }

  closeNotice() {
      this.notice = '';
  }

  backToWorkbench() {
      if (this.isLocalPreview()) {
          window.dispatchEvent(new CustomEvent('fitjob:navigate', { detail: { page: 'student' } }));
          return;
      }

      showForm(
          {
              formId: 'studentWorkbenchPage',
              parentPageId: '',
              params: { openStyle: { showType: 10 } }
          },
          { version: 'v1', isv: '', app: 'fitjob' }
      );
  }

  getSuggestionClass(status) {
      if (status === 'accepted') {
          return 'suggestion suggestion--accepted';
      }
      if (status === 'ignored') {
          return 'suggestion suggestion--ignored';
      }
      return 'suggestion';
  }

  getSuggestionState(status) {
      if (status === 'accepted') {
          return '已接受';
      }
      if (status === 'ignored') {
          return '已忽略';
      }
      return '待处理';
  }

  isLocalPreview() {
      return ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }
}
