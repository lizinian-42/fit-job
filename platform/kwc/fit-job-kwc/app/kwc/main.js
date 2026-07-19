import '@kdcloudjs/kwc-synthetic-shadow';
import { createElement } from '@kdcloudjs/kwc';
import { setBasePath } from '@kdcloudjs/shoelace/dist/utilities/base-path.js';
import fitJobDemoHome from './fitJobDemoHome/fitJobDemoHome.js';
import studentWorkbench from './studentWorkbench/studentWorkbench.js';
import resumeDiagnosis from './resumeDiagnosis/resumeDiagnosis.js';
import jobRecommendation from './jobRecommendation/jobRecommendation.js';
import interviewTraining from './interviewTraining/interviewTraining.js';
import policyQa from './policyQa/policyQa.js';
import employmentDashboard from './employmentDashboard/employmentDashboard.js';
import { demoRoutes, getDemoRoute } from './demoData.js';

window.__FIT_JOB_STANDALONE__ = true;
const isStandalonePreview = process.env.STANDALONE_PREVIEW === 'true';
const shoelaceBasePath = isStandalonePreview
    ? new URL('./shoelace', document.baseURI).href.replace(/\/$/, '')
    : '/';
setBasePath(shoelaceBasePath);

let currentElement;

const pageConfigs = {
    home: {
        tagName: 'kwc-fit-job-demo-home',
        component: fitJobDemoHome
    },
    student: {
        tagName: 'kwc-student-workbench',
        component: studentWorkbench
    },
    resume: {
        tagName: 'kwc-resume-diagnosis',
        component: resumeDiagnosis
    },
    jobs: {
        tagName: 'kwc-job-recommendation',
        component: jobRecommendation
    },
    interview: {
        tagName: 'kwc-interview-training',
        component: interviewTraining
    },
    policy: {
        tagName: 'kwc-policy-qa',
        component: policyQa
    },
    dashboard: {
        tagName: 'kwc-employment-dashboard',
        component: employmentDashboard
    }
};

function normalizeRouteKey() {
    const hashPath = window.location.hash.replace(/^#/, '') || '';
    const legacyPage = new URLSearchParams(window.location.search).get('page');
    const route = demoRoutes.find((item) => item.path === hashPath)
        || demoRoutes.find((item) => item.key === legacyPage)
        || demoRoutes[0];

    return route.key;
}

function routeHash(routeKey) {
    return `#${getDemoRoute(routeKey).path}`;
}

function mountPage(routeKey) {
    currentElement?.remove();

    const route = getDemoRoute(routeKey);
    const pageConfig = pageConfigs[route.key] || pageConfigs.home;
    currentElement = createElement(
        pageConfig.tagName,
        { is: pageConfig.component }
    );
    document.body.appendChild(currentElement);
    document.title = `${route.label} | Fit Job`;
    window.scrollTo({ top: 0, left: 0 });
}

window.addEventListener('fitjob:navigate', (event) => {
    const nextRoute = getDemoRoute(event.detail?.page).key;
    const nextHash = routeHash(nextRoute);

    if (window.location.hash === nextHash) {
        mountPage(nextRoute);
        return;
    }

    window.location.hash = nextHash;
});

window.addEventListener('hashchange', () => {
    mountPage(normalizeRouteKey());
});

if (!window.location.hash) {
    window.history.replaceState(null, '', routeHash(normalizeRouteKey()));
}

mountPage(normalizeRouteKey());
