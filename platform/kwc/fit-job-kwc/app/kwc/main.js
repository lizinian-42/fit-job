import '@kdcloudjs/kwc-synthetic-shadow';
import { createElement } from '@kdcloudjs/kwc';
import { setBasePath } from '@kdcloudjs/shoelace/dist/utilities/base-path.js';
import studentWorkbench from './studentWorkbench/studentWorkbench.js';
import resumeDiagnosis from './resumeDiagnosis/resumeDiagnosis.js';

setBasePath('/');

let currentElement;

function mountPage(page) {
    currentElement?.remove();

    const isResumePage = page === 'resume';
    currentElement = createElement(
        isResumePage ? 'kwc-resume-diagnosis' : 'kwc-student-workbench',
        { is: isResumePage ? resumeDiagnosis : studentWorkbench }
    );
    document.body.appendChild(currentElement);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('fitjob:navigate', (event) => {
    mountPage(event.detail?.page);
});

mountPage(new URLSearchParams(window.location.search).get('page'));
