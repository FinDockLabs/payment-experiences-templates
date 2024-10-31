import { LightningElement, api } from 'lwc';

export default class FlowProgressBar extends LightningElement {
    @api currentPage = 0;
    @api totalPages = 0;

    get activeIterator() {
        console.log(this.currentPage);
        let tempArray = [];
        for(let i = 0; i < this.currentPage; i++) {
            tempArray.push(i);
        }
        return tempArray;
    };

    get inactiveIterator() {
        console.log(this.totalPages);
        let tempArray = [];
        for(let i = this.currentPage; i < this.totalPages; i++) {
            tempArray.push(i);
        }
        return tempArray;
    }
}