import { createElement } from 'lwc';
import ExperienceProgressStages from 'c/experienceProgressStages';
import { labels } from '../experienceProgressStagesLabels';

function mount(props = {}) {
    const element = createElement('c-experience-progress-stages', { is: ExperienceProgressStages });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
}

const activeCircles = element => element.shadowRoot.querySelectorAll('.stage-progress__circle--active');
const activeConnectors = element => element.shadowRoot.querySelectorAll('.stage-progress__connector--active');
const checkmarks = element => element.shadowRoot.querySelectorAll('.stage-progress__checkmark-icon');

beforeEach(() => jest.useFakeTimers());

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('payment progress stages', () => {
    it('renders translated default labels and marks only the first stage active', () => {
        const element = mount();
        expect([...element.shadowRoot.querySelectorAll('.stage-progress__label')].map(node => node.textContent)).toEqual([
            labels.ec_stage_label_amount, labels.ec_stage_label_information, labels.ec_stage_label_payment
        ]);
        expect(activeCircles(element)).toHaveLength(1);
        expect(activeConnectors(element)).toHaveLength(0);
        expect(checkmarks(element)).toHaveLength(0);
    });

    it.each([
        [2, 2, 1, 1], [3, 3, 2, 2], ['2', 2, 1, 1],
        [2.9, 2, 1, 1], [99, 3, 2, 2], [-1, 0, 0, 0], ['invalid', 0, 0, 0]
    ])('normalizes stage %p consistently across circles, connectors and checkmarks', (stage, circles, connectors, completed) => {
        const element = mount({ currentStage: stage });
        expect(activeCircles(element)).toHaveLength(circles);
        expect(activeConnectors(element)).toHaveLength(connectors);
        expect(checkmarks(element)).toHaveLength(completed);
    });

    it('updates progress and custom labels when Flow changes its inputs', async () => {
        const element = mount({ currentStage: 1 });
        element.currentStage = 3;
        element.stage1Label = 'Choose an amount';
        element.stage2Label = 'Your details';
        element.stage3Label = 'Confirm payment';
        await Promise.resolve();
        expect(activeCircles(element)).toHaveLength(3);
        expect(checkmarks(element)).toHaveLength(2);
        expect([...element.shadowRoot.querySelectorAll('.stage-progress__label')].map(node => node.textContent)).toEqual([
            'Choose an amount', 'Your details', 'Confirm payment'
        ]);
        element.currentStage = 1;
        await Promise.resolve();
        expect(checkmarks(element)).toHaveLength(0);
        expect(activeConnectors(element)).toHaveLength(0);
    });

    it('announces the normalized stage after the screen-reader delay', async () => {
        const element = mount({ currentStage: 'invalid' });
        const liveRegion = element.shadowRoot.querySelector('[aria-live="assertive"]');
        expect(liveRegion.textContent).toBe('');
        jest.advanceTimersByTime(250);
        await Promise.resolve();
        expect(liveRegion.textContent).toBe(labels.ec_sr_progress_stage_announcement.replace('{0}', '0'));
        expect(element.shadowRoot.querySelector('[role="list"]').getAttribute('aria-hidden')).toBe('true');
    });
});
