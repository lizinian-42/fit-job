import { KingdeeElement } from '@kdcloudjs/kwc';
import { demoRoutes, demoStory, mockDataContract, studentProfile } from '../demoData.js';
import { navigateTo } from '../demoNavigation.js';

export default class FitJobDemoHome extends KingdeeElement {
    get routeCount() {
        return demoRoutes.length;
    }

    get storyStepCount() {
        return demoStory.length;
    }

    get profileName() {
        return studentProfile.displayName;
    }

    get contractVersion() {
        return mockDataContract.contractVersion;
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
