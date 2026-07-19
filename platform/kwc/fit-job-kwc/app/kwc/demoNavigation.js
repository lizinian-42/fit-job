import { showForm } from '@kdcloudjs/kwc-shared-utils/sendBosPlatformEvent';
import { getDemoRoute } from './demoData.js';

export function isStandalonePreview() {
    return Boolean(window.__FIT_JOB_STANDALONE__)
        || ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

export function navigateTo(routeKey) {
    const route = getDemoRoute(routeKey);

    if (isStandalonePreview()) {
        window.dispatchEvent(new CustomEvent('fitjob:navigate', { detail: { page: route.key } }));
        return;
    }

    showForm(
        {
            formId: route.formId,
            parentPageId: '',
            params: { openStyle: { showType: 10 } }
        },
        { version: 'v1', isv: '', app: 'fitjob' }
    );
}
