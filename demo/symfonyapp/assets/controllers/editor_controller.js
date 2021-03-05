import { Controller } from 'stimulus';

export default class extends Controller {
    connect() {
        this.element.textContent = 'The editor will appear here in a next commit :-)';
    }
}
