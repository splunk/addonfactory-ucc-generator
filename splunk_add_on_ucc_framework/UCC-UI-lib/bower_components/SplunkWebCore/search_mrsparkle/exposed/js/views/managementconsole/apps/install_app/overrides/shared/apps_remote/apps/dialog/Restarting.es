import _ from 'underscore';
import BaseView from 'views/Base';
import Modal from 'views/shared/Modal';
import TaskModel from 'models/managementconsole/Task';

export default BaseView.extend({
    moduleId: module.id,

    initialize(...args) {
        Modal.prototype.initialize.apply(this, ...args);

        this.metadata = this.model.metadata;

        this.appId = this.options.appId;
        this.title = this.options.title;
        this.bodyHTML = this.options.bodyHTML;
    },

    startPolling(deployTaskId) {
        this.startPollingTask(deployTaskId);
        this.saveAppIdUrlParam();
    },

    startPollingTask(deployTaskId) {
        const taskModel = new TaskModel();
        taskModel.entry.set('name', deployTaskId);
        taskModel.startPolling({
            condition: function taskIsNotComplete(model) {
                const isNotComplete = model.isNotComplete() && !model.isFailed();
                if (!isNotComplete) {
                    this.onComplete();
                    this.removeAppIdUrlParam();
                }

                return isNotComplete;
            }.bind(this),
        });
    },

    onComplete() {
        // placeholder that can be overridden in subclass
    },

    saveAppIdUrlParam() {
        // metdata is the classicurl model
        this.metadata.save(_.extend(this.metadata.toJSON(), {
            appId: this.appId,
        }), {
            replaceState: true, silent: true,
        });
    },

    removeAppIdUrlParam() {
        this.model.metadata.unset('appId', { silent: true });
        this.model.metadata.save({}, { replaceState: true, silent: true });
    },

    render() {
        this.$el.html(Modal.TEMPLATE);
        this.$(Modal.BUTTON_CLOSE_SELECTOR).remove();

        this.$(Modal.HEADER_TITLE_SELECTOR).text(this.title);
        this.$(Modal.BODY_SELECTOR).append(this.bodyHTML);

        return this;
    },
});
