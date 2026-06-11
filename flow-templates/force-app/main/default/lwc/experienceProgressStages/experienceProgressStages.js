import { LightningElement, api } from 'lwc';

const MAX_STAGE = 3;

export default class ExperienceProgressStages extends LightningElement {
    @api stage1Label = 'Amount';
    @api stage2Label = 'Information';
    @api stage3Label = 'Payment';
    @api currentStage = 1;

    get normalizedCurrentStage() {
        const parsed = Number(this.currentStage);

        if (Number.isNaN(parsed)) {
            return 0;
        }

        return Math.min(Math.max(Math.trunc(parsed), 0), MAX_STAGE);
    }

    get stage1CircleClass() {
        return this.getCircleClass(1);
    }

    get stage2CircleClass() {
        return this.getCircleClass(2);
    }

    get stage3CircleClass() {
        return this.getCircleClass(3);
    }

    get stage1NumberClass() {
        return this.getNumberClass(1);
    }

    get stage2NumberClass() {
        return this.getNumberClass(2);
    }

    get stage3NumberClass() {
        return this.getNumberClass(3);
    }

    get connectorOneClass() {
        return this.getConnectorClass(2);
    }

    get connectorTwoClass() {
        return this.getConnectorClass(3);
    }

    getCircleClass(stageNumber) {
        const isActive = this.normalizedCurrentStage >= stageNumber;
        return `stage-progress__circle${isActive ? ' stage-progress__circle--active' : ''}`;
    }

    getNumberClass(stageNumber) {
        const isActive = this.normalizedCurrentStage >= stageNumber;
        return `stage-progress__number${isActive ? ' stage-progress__number--active' : ''}`;
    }

    getConnectorClass(requiredStage) {
        const isActive = this.normalizedCurrentStage >= requiredStage;
        return `stage-progress__connector${isActive ? ' stage-progress__connector--active' : ''}`;
    }
}
