import '@kdcloudjs/kwc-synthetic-shadow';
import { createElement } from '@kdcloudjs/kwc';
import { setBasePath } from '@kdcloudjs/shoelace/dist/utilities/base-path.js';
import studentWorkbench from './studentWorkbench/studentWorkbench.js';
import resumeDiagnosis from './resumeDiagnosis/resumeDiagnosis.js';
import jobRecommendation from './jobRecommendation/jobRecommendation.js';
import policyQa from './policyQa/policyQa.js';

setBasePath('/');

let currentElement;

function mountPage(page) {
    currentElement?.remove();

    const pageConfig = getPageConfig(page);
    currentElement = createElement(
        pageConfig.tagName,
        { is: pageConfig.component }
    );
    document.body.appendChild(currentElement);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getPageConfig(page) {
    const configs = {
        resume: {
            tagName: 'kwc-resume-diagnosis',
            component: resumeDiagnosis
        },
        jobs: {
            tagName: 'kwc-job-recommendation',
            component: jobRecommendation
        },
        policy: {
            tagName: 'kwc-policy-qa',
            component: policyQa
        }
    };

    return configs[page] || {
        tagName: 'kwc-student-workbench',
        component: studentWorkbench
    };
}

window.addEventListener('fitjob:navigate', (event) => {
    mountPage(event.detail?.page);
});

mountPage(new URLSearchParams(window.location.search).get('page'));
